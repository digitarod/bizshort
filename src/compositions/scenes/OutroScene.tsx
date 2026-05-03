import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../../components/AnimatedText";

interface OutroSceneProps {
  outro: string;
  handle?: string;
  accentColor: string;
  bgColor: string;
}

export const OutroScene: React.FC<OutroSceneProps> = ({
  outro,
  handle,
  accentColor,
  bgColor,
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

  const outroLines = outro.split("\n").filter(Boolean);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${bgColor} 0%, ${accentColor}22 100%)`,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 0,
        padding: "0 60px",
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* アクセントライン */}
      <div
        style={{
          width: 60,
          height: 4,
          background: accentColor,
          borderRadius: 2,
          marginBottom: 48,
        }}
      />

      {/* まとめテキスト */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 48 }}>
        {outroLines.map((line, i) => (
          <AnimatedText
            key={i}
            text={line}
            delay={8 + i * 10}
            style={{
              fontSize: 52,
              fontWeight: "800",
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.3,
              fontFamily: "Arial, sans-serif",
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
          />
        ))}
      </div>

      {/* フォロー促進 */}
      <AnimatedText
        text="フォローで毎日学べる"
        delay={28}
        style={{
          fontSize: 34,
          fontWeight: "600",
          color: accentColor,
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          marginBottom: 24,
        }}
      />

      {/* ハンドル */}
      {handle && (
        <AnimatedText
          text={handle}
          delay={38}
          style={{
            fontSize: 30,
            fontWeight: "400",
            color: "#ffffff88",
            textAlign: "center",
            fontFamily: "Arial, sans-serif",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
