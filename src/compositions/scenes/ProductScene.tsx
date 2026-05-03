import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

interface ProductSceneProps {
  imagePaths: string[];
  accentColor: string;
}

const IMAGE_FRAMES = 90;
const FADE_FRAMES = 15;

export const ProductScene: React.FC<ProductSceneProps> = ({ imagePaths, accentColor }) => {
  const frame = useCurrentFrame();

  if (imagePaths.length === 0) {
    return (
      <AbsoluteFill
        style={{ background: "#111", justifyContent: "center", alignItems: "center" }}
      >
        <div style={{ color: accentColor, fontSize: 48, fontFamily: "Arial" }}>
          画像を生成中...
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {imagePaths.map((src, i) => {
        const start = i * IMAGE_FRAMES;
        const end = start + IMAGE_FRAMES;
        const localFrame = frame - start;

        if (frame < start || frame >= end) return null;

        const opacity = interpolate(
          localFrame,
          [0, FADE_FRAMES, IMAGE_FRAMES - FADE_FRAMES, IMAGE_FRAMES],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <Img
            key={i}
            src={staticFile(src)}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
