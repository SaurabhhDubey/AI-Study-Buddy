
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {ChatPromptTemplate, MessagesPlaceholder,} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

// 1. Connect to Gemini
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.3,
});

// 2. Create the system prompt
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

  // Space for previous conversation
  new MessagesPlaceholder("history"),

  // Current user question
  ["human", "{input}"],
]);

// 3. Create a place to store chat histories
const historyStore = new Map<
  string,
  InMemoryChatMessageHistory
>();

// 4. Get or create conversation history
function getMessageHistory(sessionId: string) {
  if (!historyStore.has(sessionId)) {
    historyStore.set(
      sessionId,
      new InMemoryChatMessageHistory()
    );
  }

  return historyStore.get(sessionId)!;
}

// 5. Connect prompt and Gemini
const chain = prompt.pipe(model);

// 6. Add memory to our chain
const chatbot = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory,
  inputMessagesKey: "input",
  historyMessagesKey: "history",
});

// 7. Create terminal input
const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

// 8. Start chatbot
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
