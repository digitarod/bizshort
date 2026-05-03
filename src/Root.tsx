import React from "react";
import { Composition, registerRoot } from "remotion";
import {
  BusinessShort,
  businessShortCalculateMetadata,
  businessShortSchema,
} from "./compositions/BusinessShort";

const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BusinessShort"
      component={BusinessShort}
      calculateMetadata={businessShortCalculateMetadata}
      fps={30}
      width={1080}
      height={1920}
      schema={businessShortSchema}
      defaultProps={{
        company: "株式会社Example",
        tagline: "未来を創る技術",
        cta: "詳しくはプロフィールへ",
        imagePaths: [],
        audioPaths: [],
        accentColor: "#0066FF",
      }}
    />
  );
};

registerRoot(RemotionRoot);
