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
import { IntroScene } from "./scenes/IntroScene";
import { OutroScene } from "./scenes/OutroScene";
import { ProductScene } from "./scenes/ProductScene";

export const businessShortSchema = z.object({
  company: z.string().default("株式会社Example"),
  tagline: z.string().default("未来を創る技術"),
  cta: z.string().default("詳しくはプロフィールへ"),
  imagePaths: z.array(z.string()).default([]),
  audioPaths: z.array(z.string()).default([]),
  bgmPath: z.string().optional(),
  accentColor: z.string().default("#0066FF"),
});

export type BusinessShortProps = z.infer<typeof businessShortSchema>;

export const INTRO_FRAMES = 90; // 3秒
export const IMAGE_FRAMES = 90; // 画像1枚あたり3秒
export const OUTRO_FRAMES = 90; // 3秒

export const businessShortCalculateMetadata: CalculateMetadataFunction<
  BusinessShortProps
> = ({ props }) => {
  const imageCount = Math.max(props.imagePaths.length, 1);
  const durationInFrames = INTRO_FRAMES + imageCount * IMAGE_FRAMES + OUTRO_FRAMES;
  return { durationInFrames, fps: 30 };
};

export const BusinessShort: React.FC<BusinessShortProps> = ({
  company,
  tagline,
  cta,
  imagePaths,
  audioPaths,
  bgmPath,
  accentColor,
}) => {
  const { durationInFrames, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const imageCount = Math.max(imagePaths.length, 1);
  const productDuration = imageCount * IMAGE_FRAMES;

  const bgmVolume = interpolate(
    frame,
    [durationInFrames - fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: "#0a0a0a" }}>
      {bgmPath ? <Audio src={staticFile(bgmPath)} volume={bgmVolume} /> : null}

      <Sequence from={0} durationInFrames={INTRO_FRAMES}>
        <IntroScene company={company} tagline={tagline} accentColor={accentColor} />
      </Sequence>

      <Sequence from={INTRO_FRAMES} durationInFrames={productDuration}>
        <ProductScene imagePaths={imagePaths} accentColor={accentColor} />
      </Sequence>

      {audioPaths.map((audioPath, i) => (
        <Sequence key={i} from={INTRO_FRAMES + i * IMAGE_FRAMES} durationInFrames={IMAGE_FRAMES}>
          <Audio src={staticFile(audioPath)} />
        </Sequence>
      ))}

      <Sequence from={INTRO_FRAMES + productDuration} durationInFrames={OUTRO_FRAMES}>
        <OutroScene company={company} cta={cta} accentColor={accentColor} />
      </Sequence>
    </AbsoluteFill>
  );
};
