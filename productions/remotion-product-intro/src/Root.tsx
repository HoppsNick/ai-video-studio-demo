import {Composition} from "remotion";
import {ProductIntro, type ProductIntroProps} from "./ProductIntro";

export const RemotionRoot = () => {
  return (
    <Composition
      id="ProductIntro"
      component={ProductIntro}
      durationInFrames={15 * 30}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={
        {
          brand: "PulseBoard",
          headline: "See the work that moves revenue.",
          subhead:
            "One calm command center for pipeline, priorities, and customer momentum.",
          cta: "Turn signal into action",
          proof: ["Live pipeline", "Risk alerts", "Team focus"],
          accent: "#31d4b5",
          accentWarm: "#ffb64d",
        } satisfies ProductIntroProps
      }
    />
  );
};
