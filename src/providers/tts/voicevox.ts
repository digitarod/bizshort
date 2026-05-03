import fs from "fs";
import path from "path";

const VOICEVOX_URL = process.env.VOICEVOX_URL ?? "http://localhost:50021";
const SPEAKER_ID = parseInt(process.env.VOICEVOX_SPEAKER ?? "1", 10);

// VOICEVOX — 無料・ローカル実行
// 起動: docker run -p 50021:50021 voicevox/voicevox_engine
export async function generateSpeech(text: string, outputDir: string): Promise<string> {
  const filename = `voicevox_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.wav`;
  const outputPath = path.join(outputDir, filename);

  const queryRes = await fetch(
    `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${SPEAKER_ID}`,
    { method: "POST" }
  );
  if (!queryRes.ok) {
    throw new Error(
      `VOICEVOX audio_query 失敗 (${queryRes.status}): ${VOICEVOX_URL} でVOICEVOXが起動しているか確認してください`
    );
  }
  const query = await queryRes.json();

  const synthRes = await fetch(`${VOICEVOX_URL}/synthesis?speaker=${SPEAKER_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  if (!synthRes.ok) throw new Error(`VOICEVOX synthesis 失敗: ${synthRes.status}`);

  const buffer = await synthRes.arrayBuffer();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(buffer));

  return `audio/${filename}`;
}
