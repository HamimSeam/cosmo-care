import GlassPanel from "../components/GlassPanel";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #06060e 0%, #04091a 100%)",
      }}
    >
      <GlassPanel style={{ padding: "40px 48px", textAlign: "center", maxWidth: 400 }}>
        <div
          className="font-mono"
          style={{ fontSize: 7, letterSpacing: "0.22em", color: "rgba(100,160,200,0.4)", marginBottom: 12 }}
        >
          COSMOCARE · {title.toUpperCase()}
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#c4daf0", marginBottom: 8 }}>{title}</div>
        <p style={{ fontSize: 9, color: "rgba(100,160,200,0.45)", lineHeight: 1.6, margin: 0 }}>{description}</p>
        <div
          style={{
            marginTop: 20,
            width: 40,
            height: 1,
            background: "rgba(34,211,238,0.3)",
            margin: "20px auto 0",
          }}
        />
        <div
          className="font-mono"
          style={{ fontSize: 7, color: "rgba(34,211,238,0.3)", letterSpacing: "0.2em", marginTop: 8 }}
        >
          MODULE LOADING
        </div>
      </GlassPanel>
    </div>
  );
}
