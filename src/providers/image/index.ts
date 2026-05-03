import type { ImageProvider } from "../../types";
import { generateImage as pollinationsGen } from "./pollinations";
import { generateImage as huggingfaceGen } from "./huggingface";
import { generateImage as openaiGen } from "./openai";

export async function generateImage(
  prompt: string,
  outputDir: string,
  provider: ImageProvider = "pollinations"
): Promise<string> {
  switch (provider) {
    case "pollinations":
      return pollinationsGen(prompt, outputDir);
    case "huggingface":
      return huggingfaceGen(prompt, outputDir);
    case "openai":
      return openaiGen(prompt, outputDir);
    default:
      throw new Error(`未対応の画像プロバイダー: ${provider}`);
  }
}
