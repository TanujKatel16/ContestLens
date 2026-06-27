/**
 * ContestLens – Keystroke Analysis Engine
 *
 * Event type reference:
 *   3  → focus change (tab switch / focus loss)
 *   5  → submission result
 *   7  → editor change (internal)
 *   10 → paste event (external)
 *
 * Submission status codes:
 *   10 → Accepted   11 → Wrong Answer
 *   14 → TLE        15 → Runtime Error   20 → Compile Error
 */

import type { AnalysisReport, AnalysisStatus, ReplayEvent, TimelineEvent } from "../types";
import { DEFAULT_SETTINGS } from "./settings";
import type { AppSettings } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAcceptedStatus(events: ReplayEvent[]): { accepted: boolean; lastStatus: number | null } {
  let lastStatus: number | null = null;
  for (const ev of events) {
    if (parseInt(ev.eventType, 10) !== 5) continue;
    try {
      const d = JSON.parse(ev.eventData) as { result?: { status?: number } };
      if (d.result?.status === 10) return { accepted: true, lastStatus: 10 };
      if (d.result?.status != null) lastStatus = d.result.status;
    } catch { /* malformed */ }
  }
  return { accepted: false, lastStatus };
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function analyzeEvents(
  events: ReplayEvent[],
  settings: AppSettings = DEFAULT_SETTINGS
): AnalysisReport {
  const MILD  = settings.mildPasteThreshold;
  const HEAVY = settings.heavyPasteThreshold;
  const FOCUS = settings.focusLossThreshold;

  // ── No data ────────────────────────────────────────────────────────────────
  if (!events || events.length === 0) {
    return {
      status: "SKIPPED", label: "No Data", colorClass: "text-gray-500",
      details: ["No replay data available"],
      pasteCount: 0, focusLossCount: 0, timeline: [], durationMs: 0,
    };
  }

  // ── Must be accepted ───────────────────────────────────────────────────────
  const { accepted, lastStatus } = getAcceptedStatus(events);
  if (!accepted) {
    return {
      status: "SKIPPED", label: "Skipped", colorClass: "text-gray-500",
      details: [lastStatus ? `Not Accepted (status ${lastStatus})` : "No accepted submission found"],
      pasteCount: 0, focusLossCount: 0, timeline: [], durationMs: 0,
    };
  }

  // ── Build timeline + counts ────────────────────────────────────────────────
  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  const t0      = sorted[0]!.timestamp;
  const tLast   = sorted[sorted.length - 1]!.timestamp;
  const durationMs = tLast - t0;

  const timeline: TimelineEvent[] = [];
  let pasteCount    = 0;
  let focusLossCount = 0;
  const detectedPastes: string[] = [];

  // Track typing bursts: accumulate chars between non-typing events
  let typingBurst = 0;
  let burstStart  = t0;

  const flushTyping = (untilTs: number) => {
    if (typingBurst > 0) {
      timeline.push({ type: "typing", offsetMs: burstStart - t0, chars: typingBurst });
      typingBurst = 0;
    }
    burstStart = untilTs;
  };

  for (const ev of sorted) {
    const type      = parseInt(ev.eventType, 10);
    const offsetMs  = ev.timestamp - t0;

    // Focus loss
    if (type === 3) {
      if (ev.eventData.includes('"val": false') || ev.eventData.includes('"val":false')) {
        flushTyping(ev.timestamp);
        focusLossCount++;
        timeline.push({ type: "focus_loss", offsetMs });
      }
      continue;
    }

    // Submission
    if (type === 5) {
      flushTyping(ev.timestamp);
      timeline.push({ type: "submission", offsetMs });
      continue;
    }

    // Editor changes
    if (type === 7 || type === 10) {
      try {
        const d = JSON.parse(ev.eventData) as {
          isFromInside?: boolean;
          change?: { changes?: Array<{ insert?: string }> };
        };

        if (d.isFromInside === true) {
          // Internal — counts as typing
          for (const ch of d.change?.changes ?? []) {
            typingBurst += (ch.insert ?? "").length;
          }
          continue;
        }

        for (const ch of d.change?.changes ?? []) {
          const len = (ch.insert ?? "").length;
          if (len === 0) continue;

          if (type === 10 && len > MILD) {
            flushTyping(ev.timestamp);
            pasteCount++;
            const isHeavy = len > HEAVY;
            if (isHeavy) {
              detectedPastes.push(`Large external paste: ${len} chars`);
              timeline.push({ type: "paste_heavy", offsetMs, chars: len });
            } else {
              detectedPastes.push(`Small external paste: ${len} chars`);
              timeline.push({ type: "paste_mild", offsetMs, chars: len });
            }
          } else {
            typingBurst += len;
          }
        }
      } catch { /* malformed */ }
    }
  }

  flushTyping(tLast);

  // ── Verdict ────────────────────────────────────────────────────────────────
  const hasHeavy        = detectedPastes.some((d) => d.startsWith("Large"));
  const excessiveFocus  = focusLossCount > FOCUS;

  let status: AnalysisStatus;
  let label: string;
  let colorClass: string;

  if (hasHeavy || excessiveFocus) {
    // Both large paste AND excessive tab-switching are hard cheating signals
    status = "HEAVY_PASTE"; label = "Suspicious"; colorClass = "text-red-400";
  } else if (pasteCount > 0) {
    status = "MILD_PASTE";  label = "Borderline";  colorClass = "text-orange-400";
  } else {
    status = "CLEAN";       label = "Clean";        colorClass = "text-cyan-400";
  }

  const details: string[] = [...detectedPastes];

  if (excessiveFocus) {
    details.push(
      `Excessive tab switching: ${focusLossCount}× (threshold: ${FOCUS}) — likely reading from external source`
    );
  }

  if (status === "CLEAN") details.push("Natural typing pattern detected");

  return { status, label, colorClass, details, pasteCount, focusLossCount, timeline, durationMs };
}
