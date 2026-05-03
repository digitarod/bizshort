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

interface HookSceneProps {
  hook: string;
  accentColor: string;
  bgColor: string;
  imagePath?: string;
}

export const HookScene: React.FC<HookSceneProps> = ({
  hook,
  accentColor,
  bgColor,
  imagePath,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const bgOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // フック質問を改行で分割
  const lines = hook.split("\n").filter(Boolean);

  return (
    <AbsoluteFill
      style={{
        background: bgColor,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "0 60px",
        opacity: bgOpacity * fadeOut,
      }}
    >
      {/* 背景画像（ある場合は半透明オーバーレイ付き） */}
      {imagePath && (
        <>
          <Img
            src={staticFile(imagePath)}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.25,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, ${bgColor}cc 0%, ${bgColor}ee 100%)`,
            }}
          />
        </>
      )}

      {/* 上部アクセントライン */}
      <div
        style={{
          width: 80,
          height: 5,
          background: accentColor,
          borderRadius: 3,
          marginBottom: 48,
        }}
      />

      {/* フック質問テキスト */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          width: "100%",
        }}
      >
        {lines.map((line, i) => (
          <AnimatedText
            key={i}
            text={line}
            delay={8 + i * 10}
            style={{
              fontSize: lines.length > 2 ? 58 : 68,
              fontWeight: "900",
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.25,
              fontFamily: "Arial, sans-serif",
              letterSpacing: "-0.5px",
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          />
        ))}
      </div>

      {/* ハテナマーク装飾 */}
      <AnimatedText
        text="?"
        delay={30}
        style={{
          fontSize: 120,
          fontWeight: "900",
          color: accentColor,
          marginTop: 32,
          opacity: 0.9,
          fontFamily: "Arial, sans-serif",
          lineHeight: 1,
        }}
      />
    </AbsoluteFill>
  );
};
