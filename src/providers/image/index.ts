import type {
  FalImageModel,
  GeminiImageModel,
  ImageProvider,
  OpenAIImageModel,
} from "../../types";
import { generateImage as falGen } from "./fal";
import { generateImage as geminiGen } from "./gemini";
import { generateImage as openaiGen } from "./openai";

export async function generateImage(
  prompt: string,
  outputDir: string,
  provider: ImageProvider = "fal",
  model?: FalImageModel | GeminiImageModel | OpenAIImageModel
): Promise<string> {
  switch (provider) {
    case "fal":
      return falGen(prompt, outputDir, model as FalImageModel | undefined);
    case "gemini":
      return geminiGen(prompt, outputDir, model as GeminiImageModel | undefined);
    case "openai":
      return openaiGen(prompt, outputDir, model as OpenAIImageModel | undefined);
    default:
      throw new Error(`未対応の画像プロバイダー: ${provider}`);
  }
}
