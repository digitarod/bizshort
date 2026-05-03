import type { ResolutionPreset } from "./presets/resolution";

export type { ResolutionPreset };

// --- 画像生成プロバイダー ---
export type ImageProvider = "fal" | "gemini" | "openai";

// Fal.ai モデル
export type FalImageModel =
  | "fal-ai/flux/dev"
  | "fal-ai/flux/schnell"
  | "fal-ai/flux-pro"
  | "fal-ai/nano-banana-pro";

// Google Gemini モデル
export type GeminiImageModel =
  | "imagen-3.0-generate-002"
  | "imagen-3.0-fast-generate-001";

// OpenAI モデル
export type OpenAIImageModel = "dall-e-3" | "gpt-image-1";

export interface ImageProviderConfig {
  provider: ImageProvider;
  model?: FalImageModel | GeminiImageModel | OpenAIImageModel;
}

// --- 動画レンダリングリクエスト ---
export interface RenderRequest {
  // 解像度プリセット
  preset?: ResolutionPreset;

  // コンテンツ (心理学ショート系スタイル)
  hook?: string;           // フック質問テキスト (HookScene)
  keyword?: string;        // キーワード強調テキスト (ExplainScene)
  points?: string[];       // 説明ポイント一覧 (ExplainScene)
  outro?: string;          // まとめテキスト (OutroScene)
  handle?: string;         // @ハンドル名 (OutroScene)

  // 画像・音声
  imagePrompts?: string[];
  bgm?: string;            // public/audio/ 以下の相対パス

  // スタイル
  accentColor?: string;
  bgColor?: string;

  // プロバイダー設定
  imageProvider?: ImageProvider;
  imageModel?: FalImageModel | GeminiImageModel | OpenAIImageModel;

  // 出力
  outputName?: string;
}
