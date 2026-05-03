import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { GeminiImageModel } from "../../types";

const DEFAULT_MODEL: GeminiImageModel = "imagen-3.0-generate-002";

export async function generateImage(
  prompt: string,
  outputDir: string,
  model: GeminiImageModel = DEFAULT_MODEL
): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY が設定されていません");

  const hash = crypto.createHash("md5").update(`${model}:${prompt}`).digest("hex").slice(0, 8);
  const filename = `gemini_${hash}.png`;
  const outputPath = path.join(outputDir, filename);

  if (fs.existsSync(outputPath)) return `images/${filename}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateImages?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: { text: prompt },
      number_of_images: 1,
      aspect_ratio: "9:16",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Gemini 画像生成エラー: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    generatedImages: Array<{ image: { imageBytes: string } }>;
  };

  const imageBytes = data.generatedImages[0].image.imageBytes;
  const buffer = Buffer.from(imageBytes, "base64");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, buffer);

  return `images/${filename}`;
}
