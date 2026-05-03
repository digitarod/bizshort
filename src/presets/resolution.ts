export const RESOLUTION_PRESETS = {
  shorts:    { width: 1080, height: 1920, fps: 30, label: "YouTube Shorts" },
  reels:     { width: 1080, height: 1920, fps: 30, label: "Instagram Reels" },
  tiktok:    { width: 1080, height: 1920, fps: 30, label: "TikTok" },
  landscape: { width: 1920, height: 1080, fps: 30, label: "YouTube" },
  square:    { width: 1080, height: 1080, fps: 30, label: "Instagram Feed" },
} as const;

export type ResolutionPreset = keyof typeof RESOLUTION_PRESETS;

export function getPreset(preset: ResolutionPreset) {
  return RESOLUTION_PRESETS[preset];
}
