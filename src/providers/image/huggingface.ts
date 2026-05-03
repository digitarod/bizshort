import crypto from "crypto";
import fs from "fs";
import path from "path";

const HF_API_URL =
  "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

// Hugging Face Inference API — 無料枠あり (HUGGINGFACE_API_KEY 必須)
export async function generateImage(prompt: string, outputDir: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error("HUGGINGFACE_API_KEY が設定されていません");

  const hash = crypto.createHash("md5").update(prompt).digest("hex").slice(0, 8);
  const filename = `hf_${hash}.jpg`;
  const outputPath = path.join(outputDir, filename);

  if (fs.existsSync(outputPath)) return `images/${filename}`;

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { width: 1024, height: 1024 },
    }),
  });

  if (!response.ok) throw new Error(`Hugging Face API error: ${response.status}`);

  const buffer = await response.arrayBuffer();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(buffer));

  return `images/${filename}`;
}
