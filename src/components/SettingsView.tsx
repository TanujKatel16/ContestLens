import { useSettings } from "../hooks/useSettings";
import { cacheClear } from "../lib/cache";
import { useState } from "react";

export default function SettingsView() {
  const [settings, updateSettings] = useSettings();
  const [cleared, setCleared] = useState(false);

  const handleClear = () => {
    cacheClear();
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

      <Card title="Analysis Thresholds">
        <ThresholdRow
          label="Mild Paste" description="Min chars to flag as borderline"
          value={settings.mildPasteThreshold} min={20} max={settings.heavyPasteThreshold - 1}
          onChange={v => updateSettings({ ...settings, mildPasteThreshold: v })}
        />
        <Divider />
        <ThresholdRow
          label="Heavy Paste" description="Min chars to flag as suspicious"
          value={settings.heavyPasteThreshold} min={settings.mildPasteThreshold + 1} max={2000}
          onChange={v => updateSettings({ ...settings, heavyPasteThreshold: v })}
        />
        <Divider />
        <ThresholdRow
          label="Focus Loss" description="Tab switches before flagging"
          value={settings.focusLossThreshold} min={1} max={50}
          onChange={v => updateSettings({ ...settings, focusLossThreshold: v })}
        />
      </Card>

      <Card title="Cache">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#d1d5db", marginBottom: "2px" }}>Clear Cached Results</div>
            <div style={{ fontSize: "10px", color: "#4b5563" }}>Results cached for 30 minutes</div>
          </div>
          <button
            onClick={handleClear}
            style={{
              fontSize: "11px", padding: "4px 10px", borderRadius: "6px",
              border: `1px solid ${cleared ? "#22c55e44" : "#3a3a3a"}`,
              background: cleared ? "rgba(34,197,94,0.08)" : "#2a2a2a",
              color: cleared ? "#22c55e" : "#9ca3af",
              cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
            }}
          >
            {cleared ? "✓ Cleared" : "Clear"}
          </button>
        </div>
      </Card>

      <Card title="About">
        {[
          ["Version", "1.0.0"],
          ["Mode", "Userscript"],
          ["Storage", "localStorage"],
        ].map(([k, v], i, arr) => (
          <div key={k}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#6b7280" }}>{k}</span>
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>{v}</span>
            </div>
            {i < arr.length - 1 && <Divider />}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── Threshold row ────────────────────────────────────────────────────────────

function ThresholdRow({ label, description, value, min, max, onChange }: {
  label: string; description: string;
  value: number; min: number; max: number;
  onChange: (v: number) => void;
}) {
  const [raw, setRaw] = useState(String(value));

  // Sync if parent value changes externally
  if (String(value) !== raw && document.activeElement?.tagName !== "INPUT") {
    setRaw(String(value));
  }

  const commit = () => {
    const n = parseInt(raw, 10);
    if (isNaN(n)) { setRaw(String(value)); return; }
    const clamped = Math.min(max, Math.max(min, n));
    setRaw(String(clamped));
    onChange(clamped);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "12px", color: "#d1d5db" }}>{label}</div>
        <div style={{ fontSize: "10px", color: "#4b5563", marginTop: "2px" }}>{description}</div>
      </div>
      <input
        type="number"
        value={raw}
        min={min}
        max={max}
        onChange={e => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={e => e.key === "Enter" && commit()}
        style={{
          width: "56px", textAlign: "right", fontSize: "12px",
          color: "#e5e7eb", background: "#1a1a1a",
          border: "1px solid #3a3a3a", borderRadius: "6px",
          padding: "4px 8px", outline: "none",
          flexShrink: 0,
          // Remove spinner arrows
          MozAppearance: "textfield" as React.CSSProperties["MozAppearance"],
        }}
      />
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #2a2a2a", background: "#222" }}>
      <div style={{ padding: "8px 12px", borderBottom: "1px solid #2a2a2a", background: "#1f1f1f" }}>
        <span style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "#2a2a2a", margin: "0 -12px" }} />;
}
