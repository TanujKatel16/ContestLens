import { useState } from "react";
import type { AnalysisReport } from "../types";
import TimelineChart from "./TimelineChart";

interface Props {
  contest: { title: string; titleSlug: string };
  ranking: number;
  isExpanded: boolean;
  analyzing: boolean;
  results: Record<string, AnalysisReport>;
  cacheAgeMin: number | null;
  onExpand: () => void;
  onForceRefresh: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  CLEAN:       "text-cyan-400 border-cyan-500/30 bg-cyan-400/5",
  MILD_PASTE:  "text-orange-400 border-orange-500/30 bg-orange-400/5",
  HEAVY_PASTE: "text-red-400 border-red-500/30 bg-red-400/5",
  SKIPPED:     "text-gray-600 border-gray-700/30 bg-transparent",
};

const LEFT_BAR: Record<string, string> = {
  CLEAN:       "bg-cyan-400",
  MILD_PASTE:  "bg-orange-400",
  HEAVY_PASTE: "bg-red-500",
  SKIPPED:     "bg-gray-700",
};


export default function ContestCard({
  contest, ranking,
  isExpanded, analyzing, results, cacheAgeMin,
  onExpand, onForceRefresh,
}: Props) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const pageNum  = Math.ceil(ranking / 25);
  const replayUrl = `https://leetcode.com/contest/${contest.titleSlug}/ranking/${pageNum}/?region=global_v2`;

  const allStatuses = Object.values(results).map((r) => r.status);
  const worstStatus = allStatuses.includes("HEAVY_PASTE") ? "HEAVY_PASTE"
    : allStatuses.includes("MILD_PASTE")  ? "MILD_PASTE"
    : allStatuses.includes("CLEAN")       ? "CLEAN"
    : "SKIPPED";

  const barColor = isExpanded && Object.keys(results).length > 0
    ? LEFT_BAR[worstStatus] ?? "bg-[#1a2535]"
    : "bg-[#1a2535]";

  return (
    <div className="relative overflow-hidden bg-[#0b1120] border border-[#151f30] hover:border-[#1e2d45] transition-colors duration-150">

      {/* Left status bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] transition-colors duration-300 ${barColor}`} />

      {/* Header row */}
      <div
        onClick={onExpand}
        className="cursor-pointer pl-4 pr-3 py-2.5 flex items-center justify-between hover:bg-white/[0.015] transition-colors"
      >
        <div className="flex-1 pr-2 min-w-0">
          <div className="text-[11px] font-mono text-gray-300 truncate">{contest.title}</div>
          <div className="text-[9px] font-mono text-gray-700 uppercase tracking-widest mt-0.5">Global Rank</div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Cache age badge */}
          {cacheAgeMin !== null && !analyzing && (
            <button
              onClick={(e) => { e.stopPropagation(); onForceRefresh(); }}
              title={`Cached ${cacheAgeMin}m ago — click to re-scan`}
              className="
                text-[8px] font-mono px-1.5 py-0.5
                border border-[#1e2d45] text-gray-700
                hover:border-cyan-500/30 hover:text-cyan-500/70
                transition-colors
              "
            >
              {cacheAgeMin}m ago ↺
            </button>
          )}

          {/* Rank badge */}
          <span className="text-[10px] font-mono text-cyan-500/80 bg-cyan-400/5 border border-cyan-500/20 px-2 py-0.5">
            #{ranking.toLocaleString()}
          </span>

          {/* Replay link */}
          <a
            href={replayUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Watch replay"
            className="
              h-6 w-6 flex items-center justify-center text-[10px]
              border border-[#1a2535] text-gray-600
              hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-400/5
              transition-colors font-mono
            "
          >
            ▶
          </a>
        </div>
      </div>

      {/* Expanded analysis */}
      {isExpanded && (
        <div className="border-t border-[#151f30] bg-[#080d18] pl-4 pr-3 py-3 animate-fade-in">
          {analyzing ? (
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-500/70 py-1">
              <span className="animate-spin inline-block">◌</span>
              Scanning keystroke events…
            </div>
          ) : Object.keys(results).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(results).map(([slug, report]) => (
                <QuestionResult
                  key={slug}
                  slug={slug}
                  report={report}
                  isTimelineOpen={expandedSlug === slug}
                  onToggleTimeline={() =>
                    setExpandedSlug(expandedSlug === slug ? null : slug)
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-[10px] font-mono text-gray-700 py-1 text-center">
              No submission data found
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Question result row ──────────────────────────────────────────────────────

function QuestionResult({
  slug, report, isTimelineOpen, onToggleTimeline,
}: {
  slug: string;
  report: AnalysisReport;
  isTimelineOpen: boolean;
  onToggleTimeline: () => void;
}) {
  const hasTimeline = report.timeline.length > 0 && report.durationMs > 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-gray-500 truncate" title={slug}>
          {slug}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Timeline toggle */}
          {hasTimeline && (
            <button
              onClick={onToggleTimeline}
              title="Toggle timeline"
              className={`
                text-[8px] font-mono px-1.5 py-0.5
                border transition-colors
                ${isTimelineOpen
                  ? "border-cyan-500/40 text-cyan-400 bg-cyan-400/5"
                  : "border-[#1e2d45] text-gray-700 hover:border-cyan-500/30 hover:text-cyan-600"
                }
              `}
            >
              ▸ timeline
            </button>
          )}

          <span className={`text-[9px] font-mono px-2 py-0.5 border uppercase tracking-wider ${STATUS_COLOR[report.status] ?? STATUS_COLOR["SKIPPED"]}`}>
            {report.label}
          </span>
        </div>
      </div>

      {/* Details */}
      {report.details.length > 0 && (
        <div className="ml-2 pl-2 border-l border-[#1a2535] space-y-0.5">
          {report.details.map((d, i) => (
            <div key={i} className="text-[9px] font-mono text-gray-700 leading-snug">› {d}</div>
          ))}
        </div>
      )}

      {/* Timeline */}
      {isTimelineOpen && hasTimeline && (
        <div className="mt-1 pt-2 border-t border-[#151f30]">
          <TimelineChart timeline={report.timeline} durationMs={report.durationMs} />
        </div>
      )}
    </div>
  );
}
