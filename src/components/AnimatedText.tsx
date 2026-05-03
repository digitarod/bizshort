import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface AnimatedTextProps {
  text: string;
  delay?: number;
  style?: React.CSSProperties;
  direction?: "up" | "down" | "left";
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  delay = 0,
  style,
  direction = "up",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const translateY =
    direction === "up"
      ? interpolate(progress, [0, 1], [50, 0])
      : direction === "down"
      ? interpolate(progress, [0, 1], [-50, 0])
      : 0;

  const translateX =
    direction === "left" ? interpolate(progress, [0, 1], [60, 0]) : 0;

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${translateY}px) translateX(${translateX}px)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
