import React from "react";
import {
  AbsoluteFill,
  Audio,
  type CalculateMetadataFunction,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { ExplainScene } from "./scenes/ExplainScene";
import { HookScene } from "./scenes/HookScene";
import { OutroScene } from "./scenes/OutroScene";

export const businessShortSchema = z.object({
  hook: z.string().default("なぜ上司に指示されると\nやる気が消えるのか？"),
  keyword: z.string().default("心理的リアクタンス"),
  points: z.array(z.string()).default([
    "自由を制限されると反発する心理",
    "指示より提案が効果的な理由",
    "部下のやる気を引き出す言い方",
  ]),
  outro: z.string().default("指示ではなく\n選択肢を与えよう"),
  handle: z.string().default("@bizpsych_jp"),
  imagePaths: z.array(z.string()).default([]),
  bgmPath: z.string().optional(),
  accentColor: z.string().default("#FF6B35"),
  bgColor: z.string().default("#0d0d0d"),
});

export type BusinessShortProps = z.infer<typeof businessShortSchema>;

// フレーム定数
export const HOOK_FRAMES = 90;      // 3秒
const FRAMES_PER_POINT = 50;       // 1ポイントあたり
export const OUTRO_FRAMES = 90;    // 3秒

function explainFrames(points: string[]): number {
  return Math.max(points.length * FRAMES_PER_POINT, 120);
}

export const businessShortCalculateMetadata: CalculateMetadataFunction<
  BusinessShortProps
> = ({ props }) => {
  const durationInFrames =
    HOOK_FRAMES + explainFrames(props.points) + OUTRO_FRAMES;
  return { durationInFrames, fps: 30 };
};

export const BusinessShort: React.FC<BusinessShortProps> = ({
  hook,
  keyword,
  points,
  outro,
  handle,
  imagePaths,
  bgmPath,
  accentColor,
  bgColor,
}) => {
  const { durationInFrames, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const explainDuration = explainFrames(points);

  const bgmVolume = interpolate(
    frame,
    [durationInFrames - fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: bgColor }}>
      {bgmPath ? (
        <Audio src={staticFile(bgmPath)} volume={bgmVolume} />
      ) : null}

      {/* Hook シーン: フック質問 */}
      <Sequence from={0} durationInFrames={HOOK_FRAMES}>
        <HookScene
          hook={hook}
          accentColor={accentColor}
          bgColor={bgColor}
          imagePath={imagePaths[0]}
        />
      </Sequence>

      {/* Explain シーン: キーワード + ポイント */}
      <Sequence from={HOOK_FRAMES} durationInFrames={explainDuration}>
        <ExplainScene
          keyword={keyword}
          points={points}
          accentColor={accentColor}
          bgColor={bgColor}
          imagePaths={imagePaths}
        />
      </Sequence>

      {/* Outro シーン: まとめ + フォロー促進 */}
      <Sequence
        from={HOOK_FRAMES + explainDuration}
        durationInFrames={OUTRO_FRAMES}
      >
        <OutroScene
          outro={outro}
          handle={handle}
          accentColor={accentColor}
          bgColor={bgColor}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
