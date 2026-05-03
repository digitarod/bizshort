import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import express from "express";
import fs from "fs";
import path from "path";
import { generateImage } from "../providers/image";
import { getPreset, RESOLUTION_PRESETS } from "../presets/resolution";
import type {
  FalImageModel,
  GeminiImageModel,
  ImageProvider,
  OpenAIImageModel,
  RenderRequest,
  ResolutionPreset,
} from "../types";

const PUBLIC_DIR = path.resolve("public");
const OUTPUT_DIR = path.resolve("output");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const AUDIO_DIR = path.join(PUBLIC_DIR, "audio");

[OUTPUT_DIR, IMAGES_DIR, AUDIO_DIR].forEach((d) => fs.mkdirSync(d, { recursive: true }));

const app = express();
app.use(express.json());

let bundleUrl: string | null = null;

async function initBundle() {
  console.log("Remotion バンドルを構築中...");
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
    preset = "shorts" as ResolutionPreset,
    hook = "なぜ上司に指示されると\nやる気が消えるのか？",
    keyword = "心理的リアクタンス",
    points = ["自由を制限されると反発する心理"],
    outro = "フォローで毎日学べる",
    handle,
    imagePrompts = [],
    bgm,
    accentColor = "#FF6B35",
    bgColor = "#0d0d0d",
    imageProvider = "fal" as ImageProvider,
    imageModel,
    outputName = `video_${Date.now()}`,
  } = body;

  const resolution = getPreset(preset);

  try {
    // 画像生成
    let imagePaths: string[] = [];
    if (imagePrompts.length > 0) {
      console.log(`[${outputName}] 画像生成中 (${imageProvider} / ${imageModel ?? "default"}) ...`);
      imagePaths = await Promise.all(
        imagePrompts.map((prompt) =>
          generateImage(
            prompt,
            IMAGES_DIR,
            imageProvider,
            imageModel as FalImageModel | GeminiImageModel | OpenAIImageModel | undefined
          )
        )
      );
    }

    const inputProps = {
      hook,
      keyword,
      points,
      outro,
      handle: handle ?? "",
      imagePaths,
      bgmPath: bgm,
      accentColor,
      bgColor,
    };

    const outputPath = path.join(OUTPUT_DIR, `${outputName}.mp4`);

    console.log(`[${outputName}] レンダリング開始 (${resolution.label} ${resolution.width}×${resolution.height})...`);
    const composition = await selectComposition({
      serveUrl: bundleUrl,
      id: "BusinessShort",
      inputProps,
    });

    // プリセットに合わせて解像度を上書き
    (composition as typeof composition & { width: number; height: number; fps: number }).width = resolution.width;
    (composition as typeof composition & { width: number; height: number; fps: number }).height = resolution.height;

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

// 利用可能なプリセット一覧を返す
app.get("/api/presets", (_req, res) => {
  res.json({ presets: RESOLUTION_PRESETS });
});

async function start() {
  await initBundle();
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`\nbizshort API サーバー起動中: http://localhost:${port}`);
    console.log("  POST /api/render       — 動画を生成");
    console.log("  GET  /download/:file   — MP4 ダウンロード");
    console.log("  GET  /health           — ヘルスチェック");
    console.log("  GET  /api/presets      — 解像度プリセット一覧\n");
    console.log("例 (Fal.ai デフォルト):");
    console.log(`  curl -X POST http://localhost:${port}/api/render \\`);
    console.log(`    -H "Content-Type: application/json" \\`);
    console.log(`    -d '{"preset":"shorts","hook":"なぜ○○は○○なのか？","keyword":"キーワード","points":["ポイント1","ポイント2"],"imagePrompts":["abstract dark background"]}'`);
  });
}

start().catch((err) => {
  console.error("起動失敗:", err);
  process.exit(1);
});
