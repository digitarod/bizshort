import type { TtsProvider } from "../../types";
import { generateSpeech as voicevoxGen } from "./voicevox";
import { generateSpeech as googleGen } from "./google";
import { generateSpeech as elevenlabsGen } from "./elevenlabs";

export async function generateSpeech(
  text: string,
  outputDir: string,
  provider: TtsProvider = "voicevox"
): Promise<string> {
  switch (provider) {
    case "voicevox":
      return voicevoxGen(text, outputDir);
    case "google":
      return googleGen(text, outputDir);
    case "elevenlabs":
      return elevenlabsGen(text, outputDir);
    default:
      throw new Error(`未対応のTTSプロバイダー: ${provider}`);
  }
}
