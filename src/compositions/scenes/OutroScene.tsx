import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AnimatedText } from "../../components/AnimatedText";

interface OutroSceneProps {
  company: string;
  cta: string;
  accentColor: string;
}

export const OutroScene: React.FC<OutroSceneProps> = ({ company, cta, accentColor }) => {
  const frame = useCurrentFrame();

  const bgOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #0a0a0a 0%, ${accentColor}15 100%)`,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 32,
        opacity: bgOpacity,
      }}
    >
      <AnimatedText
        text={cta}
        delay={5}
        style={{
          fontSize: 52,
          fontWeight: "700",
          color: "#ffffff",
          textAlign: "center",
          padding: "0 50px",
          lineHeight: 1.3,
          fontFamily: "Arial, sans-serif",
        }}
      />
      <div style={{ width: 60, height: 3, background: accentColor, borderRadius: 2 }} />
      <AnimatedText
        text={company}
        delay={20}
        style={{
          fontSize: 32,
          fontWeight: "400",
          color: accentColor,
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
        }}
      />
    </AbsoluteFill>
  );
};
