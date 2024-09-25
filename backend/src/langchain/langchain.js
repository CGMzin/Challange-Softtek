import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { data } from "./data.js";
import { getMessagesById, getAllMessages } from "../db/db.js";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";

const createLLM = () =>
    new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 1,
    });

const llmTitulos = () =>
    new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0.1,
    });

// Create the embedding model
const embeddings = new OpenAIEmbeddings();

// Create the standard response template
// const getSystemTemplate = () => `Responda às perguntas do usuário com base no contexto abaixo.
// Se o contexto não contiver informações relevantes para a pergunta, não invente nada e apenas diga "Eu não sei":

// <context>
// {context}
// </context>
// `;

const getSystemTemplate = () => `Com base nos dados fornecidos, analise a pergunta do usuário,
defina uma possível solução e na resposta, forneça a porcentagem de confiança da solução com base nos chamados 
anteriores, exemplo:
"Solução: Atualização do cliente VPN e configuração do perfil. 

 Essa solução foi eficaz em 80% dos chamados anteriores."

A porcentagem deve ser calculada com base nos chamados contidos na base de dados, e não devem ser respondidas perguntas
que não possuem solução definida ou que não tem relação à suporte técnico.

Caso sejam feitar perguntas sem conexão com suporte técnico, responda que é uma inteligencia artificial criada para ajudar
em problemas de suporte técnico.

<context>
{context}
</context>
`;

const templateTitulo = () => `com base nos dados fornecidos, gere um título de no máximo 8 palavras resumindo o problema,
não escreva ":" ou "Descrição" ou "Conclusão" ou "título" no título, apenas o título em si.

<context>
{context}
</context>
`;

// Define the standard response template
const createQuestionAnsweringPrompt = () => ChatPromptTemplate.fromMessages([["system", getSystemTemplate()], new MessagesPlaceholder("messages")]);

const promptDeTitulos = () => ChatPromptTemplate.fromMessages([["system", templateTitulo()], new MessagesPlaceholder("messages")]);

// Create document chain to respond based on previous texts ("documents") using the model
const createDocumentChain = async (llm, prompt) =>
    createStuffDocumentsChain({
        llm,
        prompt,
    });

// Create the retrieval chain to maintain conversation history
const parseRetrieverInput = (params) => params.messages[params.messages.length - 1].content;

const createVectorStore = async () => {
    const texts = data.map((item) => "Titulo:" + item.titulo + " Descrição:" + item.descricao + " Conclusão:" + item.conclusao);
    const metadata = data.map((item) => ({ id: item.id }));
    const vectorStore = await MemoryVectorStore.fromTexts(texts, metadata, embeddings);
    return vectorStore.asRetriever();
};

const createRetrievalChain = (documentChain, retriever) =>
    RunnablePassthrough.assign({
        context: RunnableSequence.from([parseRetrieverInput, retriever]),
    }).assign({
        answer: documentChain,
    });

// Main function to execute the flow
const main = async (inputMessage, sessionId) => {
    const llm = createLLM();
    const questionAnsweringPrompt = createQuestionAnsweringPrompt();
    const documentChain = await createDocumentChain(llm, questionAnsweringPrompt);
    const retriever = await createVectorStore();
    const retrievalChain = createRetrievalChain(documentChain, retriever);

    const historico = new ChatMessageHistory();
    for (const message of await getMessagesById(sessionId)) {
        if (message.senderType === "user") {
            historico.addMessage(new HumanMessage(message.content));
        } else {
            historico.addMessage(new AIMessage(message.content));
        }
    }

    historico.addMessage(new HumanMessage(inputMessage));

    const response = await retrievalChain.invoke({
        messages: await historico.getMessages(),
    });
    return response.answer;
};

const geraHistorico = async () => {
    const llm = llmTitulos();
    const questionAnsweringPrompt = promptDeTitulos();
    const documentChain = await createDocumentChain(llm, questionAnsweringPrompt);
    const retriever = await createVectorStore();
    const retrievalChain = createRetrievalChain(documentChain, retriever);

    const messages = await getAllMessages();

    let sessions = {};
    for (const message of messages) {
        if (sessions[message.sessionId] === undefined) {
            sessions[message.sessionId] = [];
        }
        sessions[message.sessionId].push(message);
    }

    var titulos = {};
    for (const key in sessions) {
        const historico = new ChatMessageHistory();
        for (const message of sessions[key]) {
            if (message.senderType === "user") {
                historico.addMessage(new HumanMessage(message.content));
            } else {
                historico.addMessage(new AIMessage(message.content));
            }
        }
        historico.addMessage(new HumanMessage("Qual seria o título dessa conversa?"));
        const response = await retrievalChain.invoke({
            messages: await historico.getMessages(),
        });
        titulos[key] = response.answer;
    }

    return titulos;
};

export { main, geraHistorico };
