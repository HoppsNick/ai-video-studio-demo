import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type ProductIntroProps = {
  brand: string;
  headline: string;
  subhead: string;
  cta: string;
  proof: string[];
  accent: string;
  accentWarm: string;
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const enter = (frame: number, fps: number, delay: number, duration: number) =>
  interpolate(frame, [delay * fps, (delay + duration) * fps], [0, 1], {
    ...clamp,
    easing: ease,
  });

const Background = ({accent, accentWarm}: Pick<ProductIntroProps, "accent" | "accentWarm">) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sweep = interpolate(frame, [0, 15 * fps], [-8, 12], clamp);
  const pulse = interpolate(frame, [0, 7 * fps, 15 * fps], [0.86, 1, 0.9], clamp);

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, #08111c 0%, #0d2530 45%, #161318 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -180,
          background: `radial-gradient(circle at 18% 22%, ${accent}44, transparent 28%), radial-gradient(circle at 82% 20%, ${accentWarm}35, transparent 24%), radial-gradient(circle at 50% 90%, #2b7fff33, transparent 30%)`,
          transform: `scale(${pulse}) rotate(${sweep}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          maskImage: "linear-gradient(to bottom, black, transparent 82%)",
          opacity: 0.32,
          transform: `translateY(${sweep * 2}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const MetricPanel = ({accent}: Pick<ProductIntroProps, "accent">) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const chart = enter(frame, fps, 0.45, 1.25);
  const risk = enter(frame, fps, 1.05, 0.8);
  const focus = enter(frame, fps, 1.45, 0.8);
  const lines = [0.24, 0.42, 0.58, 0.78, 0.64, 0.88];

  return (
    <div
      style={{
        width: 760,
        height: 620,
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 28,
        background: "rgba(6, 17, 25, 0.82)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.46)",
        display: "grid",
        gridTemplateRows: "84px 1fr 146px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 36px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{display: "flex", gap: 14}}>
          {["#ff7d6b", "#ffd166", accent].map((color) => (
            <span
              key={color}
              style={{
                width: 15,
                height: 15,
                borderRadius: 999,
                background: color,
              }}
            />
          ))}
        </div>
        <div
          style={{
            color: "rgba(236,247,255,0.62)",
            font: "600 22px Arial, sans-serif",
          }}
        >
          Revenue cockpit
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.45fr 0.9fr",
          gap: 28,
          padding: "34px 36px",
        }}
      >
        <div
          style={{
            borderRadius: 22,
            background: "rgba(255,255,255,0.06)",
            padding: 28,
            display: "grid",
            gridTemplateRows: "auto 1fr",
          }}
        >
          <div style={{color: "#ecf7ff", font: "700 58px Arial, sans-serif"}}>
            $4.2M
          </div>
          <div style={{display: "flex", alignItems: "end", gap: 14}}>
            {lines.map((height, index) => (
              <div
                key={height}
                style={{
                  flex: 1,
                  height: `${height * 100 * chart}%`,
                  borderRadius: 18,
                  background:
                    index === lines.length - 1
                      ? `linear-gradient(180deg, ${accent}, #1c7aff)`
                      : "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.08))",
                }}
              />
            ))}
          </div>
        </div>
        <div style={{display: "grid", gap: 18}}>
          {[
            {label: "Risk alerts", value: "03", progress: risk},
            {label: "Focus score", value: "92", progress: focus},
          ].map((item) => (
            <div
              key={item.label}
              style={{
                borderRadius: 22,
                background: "rgba(255,255,255,0.06)",
                padding: 24,
                opacity: item.progress,
                transform: `translateY(${(1 - item.progress) * 30}px)`,
              }}
            >
              <div
                style={{
                  color: "rgba(236,247,255,0.58)",
                  font: "600 20px Arial, sans-serif",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  color: "#ecf7ff",
                  font: "700 62px Arial, sans-serif",
                  marginTop: 8,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
          padding: "0 36px 30px",
        }}
      >
        {["Pipeline", "Renewals", "Expansion"].map((label, index) => {
          const row = enter(frame, fps, 1.8 + index * 0.18, 0.7);

          return (
            <div
              key={label}
              style={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                padding: 22,
                opacity: row,
                transform: `translateX(${(1 - row) * 24}px)`,
              }}
            >
              <div
                style={{
                  color: "rgba(236,247,255,0.58)",
                  font: "600 18px Arial, sans-serif",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  height: 10,
                  marginTop: 18,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.09)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(54 + index * 16) * row}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: index === 1 ? "#ffb64d" : accent,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SceneText = ({
  kicker,
  title,
  copy,
  align = "left",
}: {
  kicker: string;
  title: string;
  copy: string;
  align?: "left" | "center";
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = enter(frame, fps, 0.1, 0.9);

  return (
    <div
      style={{
        width: align === "center" ? 1220 : 720,
        textAlign: align,
        opacity: rise,
        transform: `translateY(${(1 - rise) * 56}px)`,
      }}
    >
      <div
        style={{
          color: "#9fe8db",
          font: "700 28px Arial, sans-serif",
          letterSpacing: 0,
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          color: "#f5fbff",
          font: "700 94px/1.02 Arial, sans-serif",
          letterSpacing: 0,
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: "rgba(235,247,255,0.72)",
          font: "400 34px/1.35 Arial, sans-serif",
          letterSpacing: 0,
          marginTop: 28,
        }}
      >
        {copy}
      </div>
    </div>
  );
};

const ProofStrip = ({proof, accent}: Pick<ProductIntroProps, "proof" | "accent">) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <div style={{display: "flex", gap: 22}}>
      {proof.map((item, index) => {
        const reveal = enter(frame, fps, 0.2 + index * 0.18, 0.65);

        return (
          <div
            key={item}
            style={{
              minWidth: 220,
              height: 82,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.08)",
              color: "#eefaff",
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "0 24px",
              font: "600 24px Arial, sans-serif",
              opacity: reveal,
              transform: `translateY(${(1 - reveal) * 28}px)`,
            }}
          >
            <span
              style={{
                width: 15,
                height: 15,
                borderRadius: 999,
                background: accent,
                boxShadow: `0 0 20px ${accent}`,
              }}
            />
            {item}
          </div>
        );
      })}
    </div>
  );
};

const BrandMark = ({brand, accent}: Pick<ProductIntroProps, "brand" | "accent">) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const intro = enter(frame, fps, 0, 0.7);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        opacity: intro,
        transform: `translateY(${(1 - intro) * 36}px)`,
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 24,
          background: `linear-gradient(135deg, ${accent}, #2b7fff)`,
          boxShadow: `0 24px 60px ${accent}55`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            border: "8px solid rgba(4,18,28,0.82)",
          }}
        />
      </div>
      <div
        style={{
          color: "#f5fbff",
          font: "700 54px Arial, sans-serif",
          letterSpacing: 0,
        }}
      >
        {brand}
      </div>
    </div>
  );
};

export const ProductIntro = (props: ProductIntroProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const panelIn = enter(frame, fps, 0.3, 1.2);
  const tilt = interpolate(frame, [0, 15 * fps], [-6, 4], clamp);
  const cta = enter(frame, fps, 0.35, 0.8);

  return (
    <AbsoluteFill style={{fontFamily: "Arial, sans-serif"}}>
      <Background accent={props.accent} accentWarm={props.accentWarm} />
      <Sequence from={0} durationInFrames={5 * fps} premountFor={fps}>
        <AbsoluteFill
          style={{
            padding: "112px 128px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{display: "grid", gap: 52}}>
            <BrandMark brand={props.brand} accent={props.accent} />
            <SceneText
              kicker="Product intro"
              title={props.headline}
              copy={props.subhead}
            />
          </div>
          <div
            style={{
              opacity: panelIn,
              transform: `translateX(${(1 - panelIn) * 120}px) rotate(${tilt}deg) scale(${0.92 + panelIn * 0.08})`,
            }}
          >
            <MetricPanel accent={props.accent} />
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={5 * fps} durationInFrames={5 * fps} premountFor={fps}>
        <AbsoluteFill
          style={{
            padding: "112px 128px",
            display: "grid",
            gridTemplateColumns: "720px 1fr",
            alignItems: "center",
            gap: 74,
          }}
        >
          <div style={{display: "grid", gap: 54}}>
            <SceneText
              kicker="Clarity"
              title="From scattered updates to one live signal."
              copy="Bring the numbers, decisions, and next steps into the same frame."
            />
            <ProofStrip proof={props.proof} accent={props.accent} />
          </div>
          <div
            style={{
              justifySelf: "end",
              transform: "scale(0.98)",
              transformOrigin: "right center",
            }}
          >
            <MetricPanel accent={props.accent} />
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={10 * fps} durationInFrames={5 * fps} premountFor={fps}>
        <AbsoluteFill
          style={{
            padding: "112px 128px",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div style={{display: "grid", justifyItems: "center", gap: 48}}>
            <BrandMark brand={props.brand} accent={props.accent} />
            <SceneText
              kicker="Move now"
              title="Make every team update feel actionable."
              copy="A product intro template ready for your real brand, screenshots, and offer."
              align="center"
            />
            <div
              style={{
                height: 104,
                borderRadius: 24,
                background: `linear-gradient(135deg, ${props.accent}, #2b7fff)`,
                color: "#06121c",
                display: "flex",
                alignItems: "center",
                padding: "0 42px",
                font: "700 34px Arial, sans-serif",
                boxShadow: `0 28px 80px ${props.accent}44`,
                opacity: cta,
                transform: `translateY(${(1 - cta) * 30}px) scale(${0.94 + cta * 0.06})`,
              }}
            >
              {props.cta}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
