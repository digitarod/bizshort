import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AnimatedText } from "../../components/AnimatedText";

interface IntroSceneProps {
  company: string;
  tagline: string;
  accentColor: string;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ company, tagline, accentColor }) => {
  const frame = useCurrentFrame();

  const bgOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #0a0a0a 0%, ${accentColor}22 100%)`,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 24,
        opacity: bgOpacity,
      }}
    >
      <div
        style={{
          width: 80,
          height: 4,
          background: accentColor,
          borderRadius: 2,
          marginBottom: 8,
        }}
      />
      <AnimatedText
        text={company}
        delay={10}
        style={{
          fontSize: 68,
          fontWeight: "800",
          color: "#ffffff",
          textAlign: "center",
          padding: "0 40px",
          lineHeight: 1.2,
          fontFamily: "Arial, sans-serif",
        }}
      />
      <AnimatedText
        text={tagline}
        delay={20}
        style={{
          fontSize: 34,
          fontWeight: "400",
          color: accentColor,
          textAlign: "center",
          padding: "0 60px",
          lineHeight: 1.4,
          fontFamily: "Arial, sans-serif",
        }}
      />
    </AbsoluteFill>
  );
};
