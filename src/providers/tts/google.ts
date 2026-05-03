import fs from "fs";
import path from "path";

// Google Cloud Text-to-Speech — 無料枠あり (GOOGLE_TTS_API_KEY 必須)
export async function generateSpeech(text: string, outputDir: string): Promise<string> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_TTS_API_KEY が設定されていません");

  const filename = `google_tts_${Date.now()}.mp3`;
  const outputPath = path.join(outputDir, filename);

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "ja-JP", ssmlGender: "FEMALE" },
        audioConfig: { audioEncoding: "MP3" },
      }),
    }
  );

  if (!response.ok) throw new Error(`Google TTS error: ${response.status}`);

  const data = (await response.json()) as { audioContent: string };
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(data.audioContent, "base64"));

  return `audio/${filename}`;
}
