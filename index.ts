import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.3,
});
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a friendly programming teacher.

    Your job is to teach programming to beginners.

    Follow these rules:
    1. Use very simple English.
    2. Explain concepts step by step.
    3. Give real-life examples.
    4. Avoid complicated technical words.
    5. Make learning fun.
    6. Give a short summary at the end.`
  ],
  [
    "human",
    "Explain this topic: {topic}"
  ]
]);

const chain = prompt.pipe(model);

async function main() {
  const response = await chain.invoke(
    {topic:"what is API"}
  );

  console.log("\nAI STUDY BUDDY:\n");
  console.log(response.content);
}

main().catch(console.error);    