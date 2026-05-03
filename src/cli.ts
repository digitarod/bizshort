import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { generateImage } from "./providers/image";
import { getPreset, RESOLUTION_PRESETS } from "./presets/resolution";
import type {
  FalImageModel,
  GeminiImageModel,
  ImageProvider,
  OpenAIImageModel,
  ResolutionPreset,
} from "./types";

const PUBLIC_DIR = path.resolve("public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const AUDIO_DIR = path.join(PUBLIC_DIR, "audio");

const program = new Command();

program
  .name("bizshort")
  .description("Remotion ビジネスショート動画生成 CLI")
  .option(
    "--preset <preset>",
    `解像度プリセット: ${Object.keys(RESOLUTION_PRESETS).join("|")}`,
    "shorts"
  )
  .option("--hook <text>", "フック質問 (改行は \\n で指定)", "なぜ上司に指示されると\\nやる気が消えるのか？")
  .option("--keyword <text>", "キーワード", "心理的リアクタンス")
  .option("--points <texts>", "ポイント（カンマ区切り）", "自由を制限されると反発する心理,指示より提案が効果的")
  .option("--outro <text>", "まとめテキスト (改行は \\n で指定)", "指示ではなく\\n選択肢を与えよう")
  .option("--handle <text>", "@ハンドル名", "")
  .option("--prompts <prompts>", "画像生成プロンプト（カンマ区切り）")
  .option("--bgm <file>", "BGM ファイルパス（public/audio/ 以下）")
  .option("--accent <color>", "アクセントカラー", "#FF6B35")
  .option("--bg <color>", "背景カラー", "#0d0d0d")
  .option(
    "--image-provider <provider>",
    "画像プロバイダー: fal|gemini|openai",
    "fal"
  )
  .option("--image-model <model>", "画像モデル (省略時はプロバイダーのデフォルト)")
  .option("--output <file>", "出力ファイルパス", "output/video.mp4");

program.parse(process.argv);
const opts = program.opts();

async function main() {
  [path.resolve("output"), IMAGES_DIR, AUDIO_DIR].forEach((d) =>
    fs.mkdirSync(d, { recursive: true })
  );

  const preset = getPreset(opts.preset as ResolutionPreset);
  console.log(`プリセット: ${preset.label} (${preset.width}×${preset.height})`);

  // 画像生成
  const imagePrompts: string[] = opts.prompts
    ? opts.prompts.split(",").map((s: string) => s.trim())
    : [];

  let imagePaths: string[] = [];
  if (imagePrompts.length > 0) {
    const provider = opts.imageProvider as ImageProvider;
    const model = opts.imageModel as FalImageModel | GeminiImageModel | OpenAIImageModel | undefined;
    console.log(`画像を生成中 (${provider} / ${model ?? "default"}) ...`);
    imagePaths = await Promise.all(
      imagePrompts.map((p) => generateImage(p, IMAGES_DIR, provider, model))
    );
  }

  console.log("Remotion バンドルを構築中...");
  const bundleUrl = await bundle({
    entryPoint: path.resolve("src/Root.tsx"),
    webpackOverride: (config) => config,
    publicDir: PUBLIC_DIR,
  });

  const hook = (opts.hook as string).replace(/\\n/g, "\n");
  const outro = (opts.outro as string).replace(/\\n/g, "\n");
  const points = (opts.points as string).split(",").map((s: string) => s.trim());

  const inputProps = {
    hook,
    keyword: opts.keyword as string,
    points,
    outro,
    handle: opts.handle as string,
    imagePaths,
    bgmPath: opts.bgm as string | undefined,
    accentColor: opts.accent as string,
    bgColor: opts.bg as string,
  };

  const composition = await selectComposition({
    serveUrl: bundleUrl,
    id: "BusinessShort",
    inputProps,
  });

  const outputPath = path.resolve(opts.output as string);
  console.log("動画をレンダリング中...");

  await renderMedia({
    composition,
    serveUrl: bundleUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      process.stdout.write(`\r進捗: ${Math.round(progress * 100)}%`);
    },
  });

  console.log(`\n完了! → ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
