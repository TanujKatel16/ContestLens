import { useState } from "react";
import type { ContestHistoryItem, AnalysisReport } from "../types";
import TimelineChart from "./TimelineChart";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeRiskScore(results: Record<string, AnalysisReport>): number {
  const reports = Object.values(results);
  if (!reports.length) return 0;
  let score = 0;
  for (const r of reports) {
    if (r.status === "HEAVY_PASTE") score += 40;
    else if (r.status === "MILD_PASTE") score += 15;
    if (r.focusLossCount > 10) score += 10;
  }
  return Math.min(100, Math.round(score));
}

function riskMeta(score: number) {
  if (score >= 70) return { label: "High Risk",  color: "#f87171" };
  if (score >= 35) return { label: "Moderate",   color: "#fb923c" };
  if (score >= 10) return { label: "Low Risk",   color: "#facc15" };
  return               { label: "Clean",         color: "#4ade80" };
}

// ─── Gauge ────────────────────────────────────────────────────────────────────

function RiskGauge({ score }: { score: number }) {
  const { label, color } = riskMeta(score);
  const R = 52; const CX = 74; const CY = 70;
  const startAngle = -210 * (Math.PI / 180);
  const sweepAngle =  240 * (Math.PI / 180);
  const endAngle   = startAngle + (score / 100) * sweepAngle;

  const arcPath = (a1: number, a2: number, r: number) => {
    const x1 = CX + r * Math.cos(a1); const y1 = CY + r * Math.sin(a1);
    const x2 = CX + r * Math.cos(a2); const y2 = CY + r * Math.sin(a2);
    return `M ${x1} ${y1} A ${r} ${r} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${x2} ${y2}`;
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
      <svg width="148" height="92" viewBox="0 0 148 92">
        <path d={arcPath(startAngle, startAngle + sweepAngle, R)}
          fill="none" stroke="#2a2a2a" strokeWidth="8" strokeLinecap="round" />
        {score > 0 && (
          <path d={arcPath(startAngle, endAngle, R)}
            fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 3px ${color}66)` }} />
        )}
        <text x={CX} y={CY - 5} textAnchor="middle" fontSize="19" fontWeight="600"
          fill={color} fontFamily="Inter, system-ui, sans-serif">{score}%</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="8.5" fill={color}
          fontFamily="Inter, system-ui, sans-serif">{label}</text>
        <text x={CX} y={CY + 24} textAnchor="middle" fontSize="7" fill="#4b5563"
          fontFamily="Inter, system-ui, sans-serif">Detection Score</text>
      </svg>
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({ icon, label, value, sub }: {
  icon: string; label: string; value: string; sub?: string;
}) {
  return (
    <div style={{
      flex: 1, minWidth: 0, borderRadius: "8px", padding: "8px 10px",
      background: "#252525", border: "1px solid #2a2a2a",
    }}>
      <div style={{ fontSize: "9px", color: "#6b7280", marginBottom: "3px" }}>{icon} {label}</div>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#e5e7eb" }}>{value}</div>
      {sub && <div style={{ fontSize: "9px", color: "#4b5563", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

// ─── Flagged row ──────────────────────────────────────────────────────────────

function FlaggedRow({ icon, color, title, slug, report }: {
  icon: string; color: string; title: string; slug: string; report: AnalysisReport;
}) {
  const [open, setOpen] = useState(false);
  const hasTimeline = report.timeline.length > 0 && report.durationMs > 0;

  return (
    <div style={{ borderBottom: "1px solid #2a2a2a" }} className="last-child-no-border">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
          background: `${color}18`, border: `1px solid ${color}33`,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: 500, color: "#d1d5db" }}>{title}</div>
          <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{slug}</div>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            flexShrink: 0, fontSize: "10px", padding: "4px 10px", borderRadius: "6px",
            border: "1px solid #3a3a3a", cursor: "pointer", transition: "all 0.12s",
            background: open ? "#333" : "#252525",
            color: open ? "#e5e7eb" : "#9ca3af",
          }}
        >{open ? "Close" : "Details"}</button>
      </div>

      {open && (
        <div style={{ paddingBottom: "12px", paddingLeft: "38px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {report.details.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
              <span style={{ color, fontSize: "10px", marginTop: "1px", flexShrink: 0 }}>›</span>
              <span style={{ fontSize: "10px", color: "#9ca3af", lineHeight: 1.4 }}>{d}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: "12px" }}>
            {report.pasteCount > 0 && (
              <span style={{ fontSize: "10px", color: "#6b7280" }}>
                Pastes: <span style={{ color }}>{report.pasteCount}</span>
              </span>
            )}
            {report.focusLossCount > 0 && (
              <span style={{ fontSize: "10px", color: "#6b7280" }}>
                Tab switches: <span style={{ color: "#facc15" }}>{report.focusLossCount}</span>
              </span>
            )}
          </div>
          {hasTimeline && (
            <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: "8px" }}>
              <div style={{ fontSize: "9px", color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Timeline
              </div>
              <TimelineChart timeline={report.timeline} durationMs={report.durationMs} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Question row ─────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { color: string }> = {
  CLEAN:       { color: "#4ade80" },
  MILD_PASTE:  { color: "#fb923c" },
  HEAVY_PASTE: { color: "#f87171" },
  SKIPPED:     { color: "#4b5563" },
};

function QuestionRow({ slug, report, showTimeline, onToggle }: {
  slug: string; report: AnalysisReport; showTimeline: boolean; onToggle: () => void;
}) {
  const { color } = STATUS_META[report.status] ?? STATUS_META["SKIPPED"]!;
  const hasTimeline = report.timeline.length > 0 && report.durationMs > 0;

  return (
    <div style={{ borderRadius: "8px", overflow: "hidden", background: "#252525", border: "1px solid #2a2a2a" }}>
      <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: 500, color: "#d1d5db", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            title={slug}>{slug}</div>
          {report.details.length > 0 && (
            <div style={{ fontSize: "9px", color: "#4b5563", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {report.details[0]}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          {hasTimeline && (
            <button onClick={onToggle} style={{
              fontSize: "9px", padding: "3px 8px", borderRadius: "5px",
              border: "1px solid #3a3a3a", cursor: "pointer",
              background: showTimeline ? "#333" : "transparent",
              color: showTimeline ? "#e5e7eb" : "#6b7280",
            }}>
              {showTimeline ? "▴" : "▾"} timeline
            </button>
          )}
          <span style={{
            fontSize: "10px", padding: "3px 8px", borderRadius: "5px", fontWeight: 500,
            color, background: `${color}18`, border: `1px solid ${color}33`,
          }}>{report.label}</span>
        </div>
      </div>
      {showTimeline && hasTimeline && (
        <div style={{ padding: "8px 10px 10px", borderTop: "1px solid #2a2a2a" }}>
          <TimelineChart timeline={report.timeline} durationMs={report.durationMs} />
        </div>
      )}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: "10px", overflow: "hidden", background: "#1f1f1f", border: "1px solid #2a2a2a" }}>
      <div style={{ padding: "7px 12px", borderBottom: "1px solid #2a2a2a" }}>
        <span style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280" }}>{label}</span>
      </div>
      <div style={{ padding: "10px 12px" }}>{children}</div>
    </div>
  );
}

// ─── Error box ────────────────────────────────────────────────────────────────

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{
      borderRadius: "8px", padding: "10px 12px",
      background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
      display: "flex", flexDirection: "column", gap: "8px",
    }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        <span style={{ color: "#f87171", fontSize: "11px", flexShrink: 0, marginTop: "1px" }}>✕</span>
        <p style={{ fontSize: "11px", color: "#fca5a5", lineHeight: 1.4, margin: 0 }}>{message}</p>
      </div>
      <button onClick={onRetry} style={{
        fontSize: "10px", padding: "4px 10px", borderRadius: "6px", width: "fit-content",
        border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", background: "transparent", cursor: "pointer",
      }}>↺ Retry</button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  history: ContestHistoryItem[];
  scanning: boolean;
  scanError: string | null;
  expandedContest: string | null;
  analyzing: boolean;
  analysisError: string | null;
  allResults: Record<string, Record<string, AnalysisReport>>;
  cacheAgeMap: Record<string, number | null>;
  onScan: () => void;
  onExpand: (slug: string) => void;
  onForceRefresh: (slug: string) => void;
}

export default function ContestDashboard({
  history, scanning, scanError,
  expandedContest, analyzing, analysisError,
  allResults, cacheAgeMap,
  onScan, onExpand, onForceRefresh,
}: Props) {
  const [timelineSlug, setTimelineSlug] = useState<string | null>(null);

  const activeResults  = expandedContest ? (allResults[expandedContest] ?? {}) : {};
  const riskScore      = computeRiskScore(activeResults);
  const flagged        = Object.entries(activeResults).filter(([, r]) => r.status === "HEAVY_PASTE" || r.status === "MILD_PASTE");
  const totalPastes    = Object.values(activeResults).reduce((s, r) => s + r.pasteCount, 0);
  const totalFocusLoss = Object.values(activeResults).reduce((s, r) => s + r.focusLossCount, 0);
  const cleanCount     = Object.values(activeResults).filter(r => r.status === "CLEAN").length;
  const totalQ         = Object.values(activeResults).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

      {/* Contest list */}
      <Card label="Contest History">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={onScan} disabled={scanning}
            style={{
              width: "100%", padding: "8px", borderRadius: "8px", fontSize: "12px",
              fontWeight: 500, border: "none", cursor: scanning ? "not-allowed" : "pointer",
              background: scanning ? "#252525" : "#2563eb",
              color: scanning ? "#4b5563" : "#fff",
              opacity: scanning ? 0.7 : 1, transition: "opacity 0.15s",
            }}
          >{scanning ? "Scanning…" : "Scan Last 5 Contests"}</button>

          {scanError && <ErrorBox message={scanError} onRetry={onScan} />}

          {history.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {history.map(item => {
                const isActive   = expandedContest === item.contest.titleSlug;
                const ageMin     = cacheAgeMap[item.contest.titleSlug] ?? null;
                const res        = allResults[item.contest.titleSlug] ?? {};
                const hasResults = Object.keys(res).length > 0;
                const rs         = hasResults ? computeRiskScore(res) : null;
                const { color }  = rs !== null ? riskMeta(rs) : { color: "#4b5563" };
                const pageNum    = Math.ceil(item.ranking / 25);
                const replayUrl  = `https://leetcode.com/contest/${item.contest.titleSlug}/ranking/${pageNum}/?region=global_v2`;

                return (
                  <div key={item.contest.titleSlug}
                    onClick={() => onExpand(item.contest.titleSlug)}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "8px 10px", borderRadius: "8px", cursor: "pointer",
                      background: isActive ? "#252525" : "transparent",
                      border: `1px solid ${isActive ? "#3a3a3a" : "#262626"}`,
                      transition: "background 0.12s, border-color 0.12s",
                    }}
                  >
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                      background: color,
                      boxShadow: hasResults ? `0 0 5px ${color}88` : "none",
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "11px", fontWeight: 500, color: "#d1d5db", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.contest.title}
                      </div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "2px", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", color: "#6b7280" }}>Rank #{item.ranking.toLocaleString()}</span>
                        {ageMin !== null && <span style={{ fontSize: "10px", color: "#374151" }}>· {ageMin}m ago</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}>
                      {rs !== null && (
                        <span style={{
                          fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: 500,
                          color, background: `${color}18`, border: `1px solid ${color}33`,
                        }}>{rs}%</span>
                      )}
                      <a href={replayUrl} target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          width: "22px", height: "22px", display: "flex", alignItems: "center",
                          justifyContent: "center", borderRadius: "5px", fontSize: "9px",
                          background: "#252525", border: "1px solid #3a3a3a", color: "#6b7280",
                          textDecoration: "none",
                        }}>▶</a>
                      {ageMin !== null && (
                        <button onClick={e => { e.stopPropagation(); onForceRefresh(item.contest.titleSlug); }}
                          style={{
                            width: "22px", height: "22px", display: "flex", alignItems: "center",
                            justifyContent: "center", borderRadius: "5px", fontSize: "9px",
                            background: "#252525", border: "1px solid #3a3a3a", color: "#6b7280",
                            cursor: "pointer",
                          }}>↺</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {history.length === 0 && !scanning && !scanError && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: "12px", color: "#4b5563", margin: 0 }}>No contests loaded</p>
              <p style={{ fontSize: "10px", color: "#374151", margin: "4px 0 0" }}>Click scan to begin</p>
            </div>
          )}
        </div>
      </Card>

      {/* Analysis */}
      {expandedContest && (
        analyzing ? (
          <Card label="Analyzing…">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", padding: "16px 0", fontSize: "11px", color: "#6b7280" }}>
              <span className="animate-spin" style={{ display: "inline-block" }}>◌</span>
              Scanning keystroke events…
            </div>
          </Card>
        ) : Object.keys(activeResults).length > 0 ? (
          <>
            {/* Gauge */}
            <Card label="Detection Score">
              <RiskGauge score={riskScore} />
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <StatChip icon="⌨" label="Pastes" value={String(totalPastes)} sub={totalPastes === 0 ? "none detected" : "external"} />
                <StatChip icon="⇆" label="Tab switches" value={String(totalFocusLoss)} sub={totalFocusLoss > 10 ? "suspicious" : "normal"} />
                <StatChip icon="✓" label="Clean" value={`${cleanCount}/${totalQ}`} sub="questions" />
              </div>
            </Card>

            {/* Flagged */}
            {flagged.length > 0 && (
              <Card label={`Flagged Issues · ${flagged.length}`}>
                <div>
                  {flagged.map(([slug, report]) => (
                    <FlaggedRow key={slug}
                      icon={report.status === "HEAVY_PASTE" ? "⚠" : "⧉"}
                      color={report.status === "HEAVY_PASTE" ? "#f87171" : "#fb923c"}
                      title={report.status === "HEAVY_PASTE" ? "Large paste detected" : "External paste"}
                      slug={slug} report={report}
                    />
                  ))}
                </div>
              </Card>
            )}

            {/* Breakdown */}
            <Card label="Question Breakdown">
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {Object.entries(activeResults).map(([slug, report]) => (
                  <QuestionRow key={slug} slug={slug} report={report}
                    showTimeline={timelineSlug === slug}
                    onToggle={() => setTimelineSlug(timelineSlug === slug ? null : slug)}
                  />
                ))}
              </div>
            </Card>
          </>
        ) : analysisError ? (
          <ErrorBox message={analysisError} onRetry={() => onForceRefresh(expandedContest)} />
        ) : null
      )}
    </div>
  );
}
