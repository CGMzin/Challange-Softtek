import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { data } from "../db/data.js";
import { getMessagesById, getAllMessages, getAllConversas } from "../db/db.js";
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

    const llmDados = () =>
        new ChatOpenAI({
            model: "gpt-4o-mini",
            temperature: 0.7,
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

const getSystemTemplate = () => `Com base nos dados fornecidos, analise a pergunta do usuário, e decida:

Se a pergunta for sobre um problema técnico:
    Se o problema tiver solução (definida na base de dados):
        Se o usuário quer uma resposta detalhada:
            Responda com a solução detalhada.
        Se não:
            Responda com a solução resumida.
    Se não:
        Se o usuário quer que você pesquise mais informações:
            Pesquise mais informações e forneça uma solução.
        Se não souber se o usuário quer mais informações:
            Pergunte se ele quer que você pesquise mais informações.
        Se não:
            Responda que não há solução definida.
Se não:
    Responda que é uma inteligência artificial criada para ajudar em problemas de suporte técnico.

Todas as respostas devem ser no formato html, para serem inseridas em uma tag <p></p>.

Se a resposta for uma solução baseada nos dados fornecidos, calcule a taxa de acertividade da solução com base nos dados e forneça ao fim
da resposta, exemplo : "Essa solução foi eficaz em 80% dos casos".

<context>
{context}
</context>
`;

const templateTitulo = () => `Com base nos dados fornecidos, gere um título de no máximo 8 palavras resumindo o problema,
não escreva ":" ou "Descrição" ou "Conclusão" ou "título" no título, apenas o título em si.

<context>
{context}
</context>
`;

const templateDescricao = () => `Com base na conversa, gere uma descrição de 1000 caracteres descrevendo o problema,
não escreva ":" ou "Descrição" ou "Conclusão" ou "título" na descrição, apenas a descrição em si.

<context>
{context}
</context>
`;

const templateSolucao = () => `Com base na conversa, gere um texto de 500 caracteres descrevendo a solução do problema,
não escreva ":" ou "Descrição" ou "Conclusão" ou "título" no texto, apenas o texto em si.

<context>
{context}
</context>
`;

// Define the standard response template
const createQuestionAnsweringPrompt = () => ChatPromptTemplate.fromMessages([["system", getSystemTemplate()], new MessagesPlaceholder("messages")]);

const promptDeTitulos = () => ChatPromptTemplate.fromMessages([["system", templateTitulo()], new MessagesPlaceholder("messages")]);
const promptDeDescricao = () => ChatPromptTemplate.fromMessages([["system", templateDescricao()], new MessagesPlaceholder("messages")]);
const promptDeSolucao = () => ChatPromptTemplate.fromMessages([["system", templateSolucao()], new MessagesPlaceholder("messages")]);

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
    const conversas = await getAllConversas();
    const historico = {};
    conversas.forEach(conversa => {
        historico[conversa.sessionId] = conversa.titulo;
    });
    return historico;
};

const geraTituloConversa = async (sessionId) => {
    const llm = llmTitulos();
    const questionAnsweringPrompt = promptDeTitulos();
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

    historico.addMessage(new HumanMessage("Qual seria o título dessa conversa?"));
    const response = await retrievalChain.invoke({
        messages: await historico.getMessages(),
    });

    return response.answer;
};

const geraDecricaoConversa = async (sessionId) => {
    const llm = llmDados();
    const questionAnsweringPrompt = promptDeDescricao();
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

    historico.addMessage(new HumanMessage("Se eu criasse um chamado a partir dessa conversa, qual seria a descrição do problema? Quero a descrição sem caracteres especiais, letras maiusculas ou coisas do tipo, apenas o texto da descrição com no máximo 1000 caracteres."));
    const response = await retrievalChain.invoke({
        messages: await historico.getMessages(),
    });

    return response.answer;
};

const geraSolucaoConversa = async (sessionId) => {
    const llm = llmDados();
    const questionAnsweringPrompt = promptDeSolucao();
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

    historico.addMessage(new HumanMessage("Se eu criasse um chamado a partir dessa conversa, qual seria a solução do problema? Quero a solução sem caracteres especiais, letras maiusculas ou coisas do tipo, apenas o texto da solução com no máximo 500 caracteres."));

    const response = await retrievalChain.invoke({
        messages: await historico.getMessages(),
    });

    return response.answer;
};

export { main, geraHistorico, geraTituloConversa, geraDecricaoConversa, geraSolucaoConversa };
