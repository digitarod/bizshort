import crypto from "crypto";
import fs from "fs";
import path from "path";

// Pollinations.ai video (実験的)
export async function generateVideo(prompt: string, outputDir: string): Promise<string> {
  const hash = crypto.createHash("md5").update(prompt).digest("hex").slice(0, 8);
  const filename = `pollinations_video_${hash}.mp4`;
  const outputPath = path.join(outputDir, filename);

  if (fs.existsSync(outputPath)) return `video/${filename}`;

  const url = `https://video.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Pollinations video error: ${response.status}`);

  const buffer = await response.arrayBuffer();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(buffer));

  return `video/${filename}`;
}
