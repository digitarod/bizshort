import crypto from "crypto";
import fs from "fs";
import path from "path";

// Pollinations.ai — 無料・APIキー不要
export async function generateImage(prompt: string, outputDir: string): Promise<string> {
  const hash = crypto.createHash("md5").update(prompt).digest("hex").slice(0, 8);
  const filename = `pollinations_${hash}.jpg`;
  const outputPath = path.join(outputDir, filename);

  if (fs.existsSync(outputPath)) {
    return `images/${filename}`;
  }

  const enriched = `${prompt}, professional business photo, high quality, sharp focus`;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enriched)}?width=1080&height=1920&model=flux&nologo=true`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Pollinations.ai error: ${response.status}`);

  const buffer = await response.arrayBuffer();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(buffer));

  return `images/${filename}`;
}
