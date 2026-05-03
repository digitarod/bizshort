import type { VideoProvider } from "../../types";
import { generateVideo as pollinationsGen } from "./pollinations";

export async function generateVideo(
  prompt: string,
  outputDir: string,
  provider: VideoProvider = "pollinations"
): Promise<string> {
  switch (provider) {
    case "pollinations":
      return pollinationsGen(prompt, outputDir);
    default:
      throw new Error(`未対応の動画プロバイダー: ${provider}`);
  }
}
