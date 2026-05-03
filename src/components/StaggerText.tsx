import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface StaggerTextProps {
  lines: string[];
  startDelay?: number;
  staggerFrames?: number;
  style?: React.CSSProperties;
  lineStyle?: React.CSSProperties;
  bulletColor?: string;
}

export const StaggerText: React.FC<StaggerTextProps> = ({
  lines,
  startDelay = 0,
  staggerFrames = 12,
  style,
  lineStyle,
  bulletColor = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, ...style }}>
      {lines.map((line, i) => {
        const delay = startDelay + i * staggerFrames;
        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 20, stiffness: 130, mass: 0.7 },
        });

        const translateX = interpolate(progress, [0, 1], [40, 0]);

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              opacity: progress,
              transform: `translateX(${translateX}px)`,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: bulletColor,
                marginTop: 12,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                fontSize: 38,
                fontWeight: "600",
                color: "#ffffff",
                lineHeight: 1.5,
                fontFamily: "Arial, sans-serif",
                ...lineStyle,
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};
