import React from "react";
import { Img, interpolate, useCurrentFrame } from "remotion";

interface ImageSlideProps {
  src: string;
  duration: number;
  fadeDuration?: number;
}

export const ImageSlide: React.FC<ImageSlideProps> = ({ src, duration, fadeDuration = 15 }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, fadeDuration, duration - fadeDuration, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <Img
      src={src}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity,
      }}
    />
  );
};
