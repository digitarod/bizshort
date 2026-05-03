import { fal } from "@fal-ai/client";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { FalImageModel } from "../../types";

const DEFAULT_MODEL: FalImageModel = "fal-ai/flux/schnell";

export async function generateImage(
  prompt: string,
  outputDir: string,
  model: FalImageModel = DEFAULT_MODEL
): Promise<string> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY が設定されていません");

  fal.config({ credentials: apiKey });

  const hash = crypto.createHash("md5").update(`${model}:${prompt}`).digest("hex").slice(0, 8);
  const filename = `fal_${hash}.jpg`;
  const outputPath = path.join(outputDir, filename);

  if (fs.existsSync(outputPath)) return `images/${filename}`;

  const result = (await fal.subscribe(model, {
    input: {
      prompt,
      image_size: "portrait_9_16",
      num_images: 1,
    },
  }) as unknown) as { images: Array<{ url: string }> };

  const imgRes = await fetch(result.images[0].url);
  if (!imgRes.ok) throw new Error(`Fal.ai 画像ダウンロード失敗: ${imgRes.status}`);

  const buffer = await imgRes.arrayBuffer();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(buffer));

  return `images/${filename}`;
}
