import crypto from "crypto";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import type { OpenAIImageModel } from "../../types";

const DEFAULT_MODEL: OpenAIImageModel = "dall-e-3";

export async function generateImage(
  prompt: string,
  outputDir: string,
  model: OpenAIImageModel = DEFAULT_MODEL
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY が設定されていません");

  const client = new OpenAI({ apiKey });

  const hash = crypto.createHash("md5").update(`${model}:${prompt}`).digest("hex").slice(0, 8);
  const filename = `openai_${hash}.png`;
  const outputPath = path.join(outputDir, filename);

  if (fs.existsSync(outputPath)) return `images/${filename}`;

  // dall-e-3 は縦型サイズ 1024x1792 が最も縦長
  const size = model === "dall-e-3" ? "1024x1792" : "1024x1024";

  const response = await client.images.generate({
    model,
    prompt,
    n: 1,
    size: size as "1024x1792" | "1024x1024",
    response_format: "b64_json",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI から画像データが返されませんでした");

  const buffer = Buffer.from(b64, "base64");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, buffer);

  return `images/${filename}`;
}
