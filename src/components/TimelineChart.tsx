/**
 * TimelineChart – horizontal event timeline for a single question.
 *
 * Renders a time axis with colored markers:
 *   ■ cyan    = typing burst
 *   ■ orange  = small paste
 *   ■ red     = large paste
 *   ▲ yellow  = focus loss (tab switch)
 *   ◆ white   = submission
 */

import type { TimelineEvent } from "../types";

interface Props {
  timeline: TimelineEvent[];
  durationMs: number;
}

const DOT_STYLE: Record<TimelineEvent["type"], { color: string; label: string; shape: string }> = {
  typing:      { color: "#22d3ee", label: "Typing",      shape: "rect" },
  paste_mild:  { color: "#fb923c", label: "Small paste", shape: "rect" },
  paste_heavy: { color: "#f87171", label: "Large paste", shape: "rect" },
  focus_loss:  { color: "#facc15", label: "Tab switch",  shape: "tri"  },
  submission:  { color: "#ffffff", label: "Submission",  shape: "dia"  },
};

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m${sec.toString().padStart(2, "0")}s` : `${sec}s`;
}

export default function TimelineChart({ timeline, durationMs }: Props) {
  if (!timeline || timeline.length === 0 || durationMs === 0) return null;

  const W  = 380; // SVG width
  const H  = 48;  // SVG height
  const PL = 6;   // padding left
  const PR = 6;   // padding right
  const AY = 32;  // axis Y

  const toX = (ms: number) =>
    PL + ((ms / durationMs) * (W - PL - PR));

  // Aggregate consecutive typing events into bars
  const bars: { x: number; w: number; type: TimelineEvent["type"] }[] = [];

  for (const ev of timeline) {
    if (ev.type === "typing") {
      // Width proportional to chars (capped so they're visible but not giant)
      const charWidth = Math.min(((ev.chars ?? 0) / 20) * (W / 30), W / 8);
      bars.push({ x: toX(ev.offsetMs), w: Math.max(4, charWidth), type: "typing" });
    }
  }

  const markers = timeline.filter((e) => e.type !== "typing");

  return (
    <div className="mt-2 space-y-1">
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-1">
        {(["typing", "paste_mild", "paste_heavy", "focus_loss", "submission"] as const).map((t) => (
          <div key={t} className="flex items-center gap-1">
            <span
              className="inline-block w-2 h-2 rounded-sm"
              style={{ background: DOT_STYLE[t].color, opacity: 0.85 }}
            />
            <span className="text-[8px] font-mono text-gray-600">{DOT_STYLE[t].label}</span>
          </div>
        ))}
      </div>

      {/* SVG axis */}
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Axis line */}
        <line x1={PL} y1={AY} x2={W - PR} y2={AY} stroke="#1e2d4a" strokeWidth="1" />

        {/* Start / end time labels */}
        <text x={PL} y={H - 2} fontSize="7" fill="#374151" fontFamily="monospace">0s</text>
        <text x={W - PR} y={H - 2} fontSize="7" fill="#374151" fontFamily="monospace"
          textAnchor="end">{fmt(durationMs)}</text>

        {/* Typing bars (below axis) */}
        {bars.map((b, i) => (
          <rect
            key={`t${i}`}
            x={b.x}
            y={AY + 2}
            width={b.w}
            height={5}
            rx="1"
            fill={DOT_STYLE.typing.color}
            opacity="0.35"
          />
        ))}

        {/* Event markers (above axis) */}
        {markers.map((ev, i) => {
          const x   = toX(ev.offsetMs);
          const s   = DOT_STYLE[ev.type];
          const col = s.color;

          if (ev.type === "submission") {
            // Diamond ◆
            const cx = x; const cy = AY - 10;
            const r  = 5;
            return (
              <polygon
                key={`m${i}`}
                points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
                fill={col}
                opacity="0.9"
              >
                <title>Submission @ {fmt(ev.offsetMs)}</title>
              </polygon>
            );
          }

          if (ev.type === "focus_loss") {
            // Triangle ▲
            const cx = x; const cy = AY - 8;
            const r  = 5;
            return (
              <polygon
                key={`m${i}`}
                points={`${cx},${cy - r} ${cx + r},${cy + r} ${cx - r},${cy + r}`}
                fill={col}
                opacity="0.85"
              >
                <title>Tab switch @ {fmt(ev.offsetMs)}</title>
              </polygon>
            );
          }

          // Rect for pastes
          const h = ev.type === "paste_heavy" ? 14 : 9;
          return (
            <rect
              key={`m${i}`}
              x={x - 2}
              y={AY - h - 2}
              width={4}
              height={h}
              rx="1"
              fill={col}
              opacity="0.9"
            >
              <title>
                {s.label} · {ev.chars} chars @ {fmt(ev.offsetMs)}
              </title>
            </rect>
          );
        })}

        {/* Tick marks at 25% intervals */}
        {[0.25, 0.5, 0.75].map((frac) => {
          const x = PL + frac * (W - PL - PR);
          return (
            <g key={frac}>
              <line x1={x} y1={AY - 3} x2={x} y2={AY + 3} stroke="#1e2d4a" strokeWidth="0.5" />
              <text x={x} y={H - 2} fontSize="7" fill="#1f2d3d" fontFamily="monospace"
                textAnchor="middle">{fmt(durationMs * frac)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
