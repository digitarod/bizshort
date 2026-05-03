import React from "react";
import { Audio, staticFile } from "remotion";

interface NarrationSceneProps {
  audioPath: string;
  volume?: number;
}

export const NarrationScene: React.FC<NarrationSceneProps> = ({ audioPath, volume = 1 }) => {
  return <Audio src={staticFile(audioPath)} volume={volume} />;
};
