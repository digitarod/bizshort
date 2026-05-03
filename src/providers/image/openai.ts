import crypto from "crypto";
import fs from "fs";
import path from "path";

// OpenAI DALL-E 3 — 有料 (OPENAI_API_KEY 必須)
export async function generateImage(prompt: string, outputDir: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY が設定されていません");

  const hash = crypto.createHash("md5").update(prompt).digest("hex").slice(0, 8);
  const filename = `dalle_${hash}.png`;
  const outputPath = path.join(outputDir, filename);

  if (fs.existsSync(outputPath)) return `images/${filename}`;

  const genRes = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1792",
      response_format: "url",
    }),
  });

  if (!genRes.ok) throw new Error(`OpenAI DALL-E error: ${genRes.status}`);

  const data = (await genRes.json()) as { data: [{ url: string }] };
  const imgRes = await fetch(data.data[0].url);
  const buffer = await imgRes.arrayBuffer();

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(buffer));

  return `images/${filename}`;
}
