import { HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { data } from './data.js';

const createLLM = () => new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 1
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

const getSystemTemplate = () => `Responda às perguntas do usuário com base em conhecimentos de TI em geral.

<context>
{context}
</context>
`;

// Define the standard response template
const createQuestionAnsweringPrompt = () => ChatPromptTemplate.fromMessages([
  ["system", getSystemTemplate()],
  new MessagesPlaceholder("messages"),
]);

// Create document chain to respond based on previous texts ("documents") using the model 
const createDocumentChain = async (llm, prompt) => createStuffDocumentsChain({
  llm,
  prompt,
});

// Create the retrieval chain to maintain conversation history
const parseRetrieverInput = (params) => params.messages[params.messages.length - 1].content;

const createVectorStore = async () => {
  const vectorStore = await MemoryVectorStore.fromTexts(
    [data[0], data[1], data[2]],
    [{ id: 2 }, { id: 1 }, { id: 3 }],
    embeddings
  );
  return vectorStore.asRetriever();
};

const createRetrievalChain = (documentChain, retriever) => RunnablePassthrough.assign({
  context: RunnableSequence.from([parseRetrieverInput, retriever]),
}).assign({
  answer: documentChain,
});

// Main function to execute the flow
const main = async (inputMessage) => {
  const llm = createLLM();
  const questionAnsweringPrompt = createQuestionAnsweringPrompt();
  const documentChain = await createDocumentChain(llm, questionAnsweringPrompt);
  const retriever = await createVectorStore();
  const retrievalChain = createRetrievalChain(documentChain, retriever);

  // Test question
  const response = await retrievalChain.invoke({
    messages: [new HumanMessage(inputMessage)],
  });

  return response.answer;
};

export { main };