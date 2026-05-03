export type ImageProvider = "pollinations" | "huggingface" | "openai";
export type TtsProvider = "voicevox" | "google" | "elevenlabs";
export type VideoProvider = "pollinations" | "replicate";

export interface RenderRequest {
  company?: string;
  tagline?: string;
  cta?: string;
  imagePrompts?: string[];
  narrations?: string[];
  bgm?: string;
  accentColor?: string;
  outputName?: string;
  providers?: {
    image?: ImageProvider;
    tts?: TtsProvider;
    video?: VideoProvider;
  };
}
