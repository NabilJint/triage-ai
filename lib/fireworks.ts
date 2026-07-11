import { ChatFireworks } from "@langchain/community/chat_models/fireworks";

export const fireworks = new ChatFireworks({
  model: process.env.FIREWORKS_MODEL ?? "accounts/fireworks/models/llama-v3p3-70b-instruct",
  temperature: 0.3,
  apiKey: process.env.FIREWORKS_API_KEY,
});
