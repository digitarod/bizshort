import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../../components/AnimatedText";
import { StaggerText } from "../../components/StaggerText";

interface ExplainSceneProps {
  keyword: string;
  points: string[];
  accentColor: string;
  bgColor: string;
  imagePaths?: string[];
}

const FRAMES_PER_IMAGE = 90;
const FADE_FRAMES = 12;

export const ExplainScene: React.FC<ExplainSceneProps> = ({
  keyword,
  points,
  accentColor,
  bgColor,
  imagePaths = [],
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: bgColor,
        flexDirection: "column",
        padding: "100px 60px 80px",
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* 背景画像スライドショー */}
      {imagePaths.map((src, i) => {
        const start = i * FRAMES_PER_IMAGE;
        const end = start + FRAMES_PER_IMAGE;
        if (frame < start || frame >= end) return null;
        const localFrame = frame - start;
        const opacity = interpolate(
          localFrame,
          [0, FADE_FRAMES, FRAMES_PER_IMAGE - FADE_FRAMES, FRAMES_PER_IMAGE],
          [0, 0.18, 0.18, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <Img
            key={i}
            src={staticFile(src)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity,
            }}
          />
        );
      })}

      {/* キーワードバッジ */}
      <AnimatedText
        text={keyword}
        delay={5}
        style={{
          fontSize: 36,
          fontWeight: "800",
          color: accentColor,
          background: `${accentColor}22`,
          border: `2px solid ${accentColor}`,
          borderRadius: 8,
          padding: "10px 24px",
          alignSelf: "flex-start",
          marginBottom: 56,
          fontFamily: "Arial, sans-serif",
          letterSpacing: "1px",
        }}
      />

      {/* ポイント一覧（スタッガーアニメ） */}
      <StaggerText
        lines={points}
        startDelay={15}
        staggerFrames={14}
        bulletColor={accentColor}
        lineStyle={{
          fontSize: 40,
          fontWeight: "600",
        }}
      />
    </AbsoluteFill>
  );
};
