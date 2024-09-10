import { LlamaCppEmbeddings } from "@langchain/community/embeddings/llama_cpp";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

// Definir onde está o Llama
const getLlamaPath = () => "./src/langchain/llama/consolidated.00.pth";

// Criar o model embedding
const createEmbeddings = (modelPath) => new LlamaCppEmbeddings({ modelPath });

// Criando template padrão para resposta
const getSystemTemplate = () => `Responda às perguntas do usuário com base no contexto abaixo. 
Se o contexto não contiver informações relevantes para a pergunta, não invente nada e apenas diga "Eu não sei":

<context>
{context}
</context>
`;

// Definindo template padrão para resposta
const createQuestionAnsweringPrompt = () => ChatPromptTemplate.fromMessages([
  ["system", getSystemTemplate()],
  new MessagesPlaceholder("messages"),
]);

// Criando documentChain para responder com base em textos("documentos") anteriores utilizando o model 
const createDocumentChain = async (embeddings, prompt) => await createStuffDocumentsChain({
  embeddings,
  prompt,
});

// Criando o retrievalChain para que ele crie o histórico de conversas conforme for usando
const parseRetrieverInput = (params) => params.messages[params.messages.length - 1].content;

const createRetrievalChain = (documentChain) => RunnablePassthrough.assign({
  context: RunnableSequence.from([parseRetrieverInput, retriever]),
}).assign({
  answer: documentChain,
});

// Função principal para executar o fluxo
const main = async () => {
  const llamaPath = getLlamaPath();
  const embeddings = createEmbeddings(llamaPath);
  const questionAnsweringPrompt = createQuestionAnsweringPrompt();
  const documentChain = await createDocumentChain(embeddings, questionAnsweringPrompt);
  const retrievalChain = createRetrievalChain(documentChain);

  // Pergunta teste
  await retrievalChain.invoke({
    messages: [new HumanMessage("Can LangSmith help test my LLM applications?")],
  });
  const res = embeddings.embedQuery("Hello Llama!");

  console.log(res);
};


export { main };

// const documents = ["Hello World!", "Bye Bye!"];


// const res2 = await embeddings.embedDocuments(documents);

// console.log(res2) 