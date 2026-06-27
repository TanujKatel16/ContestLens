import lensLogo from "../../assets/logo.png";

interface Props {
  onClick: () => void;
}

export default function FloatingButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      title="Open ContestLens"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 50,
        width: "52px",
        height: "52px",
        borderRadius: "50%",
        padding: 0,
        overflow: "hidden",
        cursor: "pointer",
        border: "2px solid #3c3c3c",
        background: "#1f1f1f",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "scale(1.08)";
        el.style.boxShadow = "0 6px 24px rgba(0,0,0,0.5)";
        el.style.borderColor = "#5c5c5c";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "scale(1)";
        el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.4)";
        el.style.borderColor = "#3c3c3c";
      }}
    >
      <img
        src={lensLogo}
        alt="ContestLens"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </button>
  );
}
