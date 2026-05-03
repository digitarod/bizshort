import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { generateImage } from "./providers/image";
import { generateSpeech } from "./providers/tts";
import type { ImageProvider, TtsProvider } from "./types";

const PUBLIC_DIR = path.resolve("public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const AUDIO_DIR = path.join(PUBLIC_DIR, "audio");

const program = new Command();

program
  .name("bizshort")
  .description("Remotion ビジネスショート動画生成 CLI")
  .option("--company <name>", "会社名", "株式会社Example")
  .option("--tagline <text>", "タグライン", "未来を創る技術")
  .option("--cta <text>", "CTAテキスト", "詳しくはプロフィールへ")
  .option("--prompts <prompts>", "画像生成プロンプト（カンマ区切り）")
  .option("--narrations <texts>", "ナレーションテキスト（カンマ区切り）")
  .option("--bgm <file>", "BGMファイルパス（public/以下の相対パス）")
  .option("--accent <color>", "アクセントカラー（16進数）", "#0066FF")
  .option("--output <file>", "出力ファイルパス", "output/video.mp4")
  .option("--image-provider <provider>", "画像生成API: pollinations|huggingface|openai", "pollinations")
  .option("--tts-provider <provider>", "TTS API: voicevox|google|elevenlabs", "voicevox");

program.parse(process.argv);
const opts = program.opts();

async function main() {
  [path.resolve("output"), IMAGES_DIR, AUDIO_DIR].forEach((d) =>
    fs.mkdirSync(d, { recursive: true })
  );

  const imagePrompts: string[] = opts.prompts
    ? opts.prompts.split(",").map((s: string) => s.trim())
    : [];
  const narrationTexts: string[] = opts.narrations
    ? opts.narrations.split(",").map((s: string) => s.trim())
    : [];

  if (imagePrompts.length > 0) {
    console.log(`画像を生成中 (${opts.imageProvider}) ...`);
  }
  const imagePaths = await Promise.all(
    imagePrompts.map((p) => generateImage(p, IMAGES_DIR, opts.imageProvider as ImageProvider))
  );

  if (narrationTexts.length > 0) {
    console.log(`音声を生成中 (${opts.ttsProvider}) ...`);
  }
  const audioPaths =
    narrationTexts.length > 0
      ? await Promise.all(
          narrationTexts.map((t) =>
            generateSpeech(t, AUDIO_DIR, opts.ttsProvider as TtsProvider)
          )
        )
      : [];

  console.log("Remotionバンドルを構築中...");
  const bundleUrl = await bundle({
    entryPoint: path.resolve("src/Root.tsx"),
    webpackOverride: (config) => config,
    publicDir: PUBLIC_DIR,
  });

  const inputProps = {
    company: opts.company as string,
    tagline: opts.tagline as string,
    cta: opts.cta as string,
    imagePaths,
    audioPaths,
    bgmPath: opts.bgm as string | undefined,
    accentColor: opts.accent as string,
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
