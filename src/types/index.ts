// ─── Analysis ────────────────────────────────────────────────────────────────

export type AnalysisStatus = "CLEAN" | "MILD_PASTE" | "HEAVY_PASTE" | "SKIPPED";

export interface TimelineEvent {
  type: "paste_heavy" | "paste_mild" | "focus_loss" | "typing" | "submission";
  offsetMs: number;   // ms from first event
  chars?: number;     // for paste events
}

export interface AnalysisReport {
  status: AnalysisStatus;
  label: string;
  colorClass: string;
  details: string[];
  pasteCount: number;
  focusLossCount: number;
  timeline: TimelineEvent[];
  durationMs: number;
}

// ─── API / LeetCode ──────────────────────────────────────────────────────────

export interface Contest {
  title: string;
  titleSlug: string;
}

export interface ContestHistoryItem {
  attended: boolean;
  contest: Contest;
  ranking: number;




}

export interface ContestQuestion {
  title: string;
  titleSlug: string;
  questionId: string;
}

export interface ReplayEvent {
  eventType: string;
  eventData: string;
  timestamp: number;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  mildPasteThreshold: number;
  heavyPasteThreshold: number;
  focusLossThreshold: number;
}

// ─── Cache ───────────────────────────────────────────────────────────────────

export interface CacheEntry<T> {
  data: T;
  cachedAt: number; // unix ms
}
