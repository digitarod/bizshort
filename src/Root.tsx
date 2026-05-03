import React from "react";
import { Composition, registerRoot } from "remotion";
import {
  BusinessShort,
  businessShortCalculateMetadata,
  businessShortSchema,
} from "./compositions/BusinessShort";
import { RESOLUTION_PRESETS } from "./presets/resolution";

const { width, height, fps } = RESOLUTION_PRESETS.shorts;

const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BusinessShort"
      component={BusinessShort}
      calculateMetadata={businessShortCalculateMetadata}
      fps={fps}
      width={width}
      height={height}
      schema={businessShortSchema}
      defaultProps={{
        hook: "なぜ上司に指示されると\nやる気が消えるのか？",
        keyword: "心理的リアクタンス",
        points: [
          "自由を制限されると反発する心理",
          "指示より提案が効果的な理由",
          "部下のやる気を引き出す言い方",
        ],
        outro: "指示ではなく\n選択肢を与えよう",
        handle: "@bizpsych_jp",
        imagePaths: [],
        bgmPath: undefined,
        accentColor: "#FF6B35",
        bgColor: "#0d0d0d",
      }}
    />
  );
};

registerRoot(RemotionRoot);
