
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {ChatPromptTemplate, MessagesPlaceholder,} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";


const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.3,
});


const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a friendly programming teacher.

    Teach beginners using simple English.
    Explain concepts step by step.
    Give real-life examples.
    Be patient and friendly.
    Remember the conversation context.`
  ],

  
  new MessagesPlaceholder("history"),

  
  ["human", "{input}"],
]);


const historyStore = new Map<
  string,
  InMemoryChatMessageHistory
>();


function getMessageHistory(sessionId: string) {
  if (!historyStore.has(sessionId)) {
    historyStore.set(
      sessionId,
      new InMemoryChatMessageHistory()
    );
  }

  return historyStore.get(sessionId)!;
}


const chain = prompt.pipe(model);


const chatbot = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory,
  inputMessagesKey: "input",
  historyMessagesKey: "history",
});


const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});


async function main() {
  console.log("\n🤖 Welcome to AI Study Buddy!");
  console.log("Type 'exit' to stop chatting.\n");

  const sessionId = "student-1";

  try {
    while (true) {
      const question = await rl.question("You: ");

      if (question.trim().toLowerCase() === "exit") {
        console.log("AI Study Buddy: Happy learning! Goodbye!");
        break;
      }

      if (!question.trim()) {
        continue;
      }

      const response = await chatbot.invoke(
        { input: question },
        {
          configurable: {
            sessionId,
          },
        }
      );

      console.log("\nAI Study Buddy:", response.content, "\n");
    }
  } finally {
    rl.close();
  }
}

main().catch(console.error);
