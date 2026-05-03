import fs from "fs";
import path from "path";

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

// ElevenLabs — 高品質音声・有料 (ELEVENLABS_API_KEY 必須)
export async function generateSpeech(text: string, outputDir: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY が設定されていません");

  const filename = `elevenlabs_${Date.now()}.mp3`;
  const outputPath = path.join(outputDir, filename);

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);

  const buffer = await response.arrayBuffer();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(buffer));

  return `audio/${filename}`;
}
