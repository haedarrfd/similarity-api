// @ts-ignore
import Configuration, { OpenAIApi } from "openai";

const apiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const openai = new OpenAIApi(apiConfig);
