import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import express from "express";
import fs from "fs";
import path from "path";
import { generateImage } from "../providers/image";
import { generateSpeech } from "../providers/tts";
import type { ImageProvider, RenderRequest, TtsProvider } from "../types";

const PUBLIC_DIR = path.resolve("public");
const OUTPUT_DIR = path.resolve("output");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const AUDIO_DIR = path.join(PUBLIC_DIR, "audio");

[OUTPUT_DIR, IMAGES_DIR, AUDIO_DIR].forEach((d) => fs.mkdirSync(d, { recursive: true }));

const app = express();
app.use(express.json());

let bundleUrl: string | null = null;

async function initBundle() {
  console.log("Remotionバンドルを構築中...");
  bundleUrl = await bundle({
    entryPoint: path.resolve("src/Root.tsx"),
    webpackOverride: (config) => config,
    publicDir: PUBLIC_DIR,
  });
  console.log("バンドル完了:", bundleUrl);
}

app.post("/api/render", async (req, res) => {
  if (!bundleUrl) {
    return res.status(503).json({ error: "サーバー初期化中です。しばらくお待ちください。" });
  }

  const body = req.body as RenderRequest;
  const {
    company = "株式会社Example",
    tagline = "未来を創る技術",
    cta = "詳しくはプロフィールへ",
    imagePrompts = [],
    narrations = [],
    bgm,
    accentColor = "#0066FF",
    outputName = `video_${Date.now()}`,
    providers: providerConfig = {},
  } = body;

  const imageProvider: ImageProvider = providerConfig.image ?? "pollinations";
  const ttsProvider: TtsProvider = providerConfig.tts ?? "voicevox";

  try {
    console.log(`[${outputName}] 画像生成中 (${imageProvider}) ...`);
    const imagePaths = await Promise.all(
      imagePrompts.map((prompt) => generateImage(prompt, IMAGES_DIR, imageProvider))
    );

    console.log(`[${outputName}] 音声生成中 (${ttsProvider}) ...`);
    const audioPaths =
      narrations.length > 0
        ? await Promise.all(narrations.map((text) => generateSpeech(text, AUDIO_DIR, ttsProvider)))
        : [];

    const inputProps = { company, tagline, cta, imagePaths, audioPaths, bgmPath: bgm, accentColor };
    const outputPath = path.join(OUTPUT_DIR, `${outputName}.mp4`);

    console.log(`[${outputName}] レンダリング開始...`);
    const composition = await selectComposition({
      serveUrl: bundleUrl,
      id: "BusinessShort",
      inputProps,
    });

    await renderMedia({
      composition,
      serveUrl: bundleUrl!,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      onProgress: ({ progress }) => {
        process.stdout.write(`\r[${outputName}] 進捗: ${Math.round(progress * 100)}%`);
      },
    });

    console.log(`\n[${outputName}] 完了 → ${outputPath}`);
    res.json({ status: "success", downloadUrl: `/download/${outputName}.mp4` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: String(err) });
  }
});

app.get("/download/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(OUTPUT_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "ファイルが見つかりません" });
  }
  res.download(filePath);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", bundleReady: bundleUrl !== null });
});

async function start() {
  await initBundle();
  app.listen(3000, () => {
    console.log("\nbizshort API サーバー起動中: http://localhost:3000");
    console.log("  POST /api/render  — 動画を生成");
    console.log("  GET  /download/:filename — MP4ダウンロード");
    console.log("  GET  /health — ヘルスチェック\n");
    console.log("例:");
    console.log(`  curl -X POST http://localhost:3000/api/render \\`);
    console.log(`    -H "Content-Type: application/json" \\`);
    console.log(
      `    -d '{"company":"株式会社Example","tagline":"未来を創る技術","imagePrompts":["modern office"]}'`
    );
  });
}

start().catch((err) => {
  console.error("起動失敗:", err);
  process.exit(1);
});
