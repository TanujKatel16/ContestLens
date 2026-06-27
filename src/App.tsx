import { useState, useEffect } from "react";
import { getUserContestHistory, getContestQuestions, getReplayEvents } from "./lib/api";
import { analyzeEvents } from "./lib/analysis";
import { cacheGet, cacheSet, cacheAge } from "./lib/cache";
import { useUsername } from "./hooks/useUsername";
import { useSettings } from "./hooks/useSettings";
import FloatingButton from "./components/FloatingButton";
import SettingsView from "./components/SettingsView";
import ContestDashboard from "./components/ContestDashboard";
import type { ContestHistoryItem, AnalysisReport } from "./types";
import lensLogo from "../assets/logo.png";

export type TabId = "scan" | "settings";

export interface CachedAnalysis {
  results: Record<string, AnalysisReport>;
}

export default function App() {
  const { username, routeKey } = useUsername();
  const [settings] = useSettings();

  const [isOpen,    setIsOpen]    = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("scan");

  const [history,   setHistory]   = useState<ContestHistoryItem[]>([]);
  const [scanning,  setScanning]  = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const [expandedContest, setExpandedContest] = useState<string | null>(null);
  const [allResults,      setAllResults]      = useState<Record<string, Record<string, AnalysisReport>>>({});
  const [analyzing,       setAnalyzing]       = useState(false);
  const [analysisError,   setAnalysisError]   = useState<string | null>(null);
  const [cacheAgeMap,     setCacheAgeMap]      = useState<Record<string, number | null>>({});

  // ── Close panel & reset on every route change ────────────────────────────
  // This is the fix for the logo persisting when navigating away from /u/ pages.
  // routeKey changes on every pushState/replaceState/popstate, so this effect
  // fires whenever LeetCode's SPA navigates anywhere.
  useEffect(() => {
    setIsOpen(false);
    setActiveTab("scan");
    setHistory([]);
    setScanError(null);
    setExpandedContest(null);
    setAllResults({});
    setAnalysisError(null);
    setCacheAgeMap({});
    setScanning(false);
    setAnalyzing(false);
  }, [routeKey]);

  // Not on a profile page — render nothing at all
  if (!username) return null;

  // Panel closed — show floating button only
  if (!isOpen) return <FloatingButton onClick={() => setIsOpen(true)} />;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleScan = async () => {
    setScanning(true);
    setScanError(null);
    setExpandedContest(null);
    setAllResults({});
    setAnalysisError(null);
    try {
      const contests = await getUserContestHistory(username);
      setHistory(contests);
      const ages: Record<string, number | null> = {};
      for (const c of contests) ages[c.contest.titleSlug] = cacheAge(username, c.contest.titleSlug);
      setCacheAgeMap(ages);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Failed to fetch contest history.");
    }
    setScanning(false);
  };

  const runAnalysis = async (contestSlug: string, force = false) => {
    setExpandedContest(contestSlug);
    setAnalysisError(null);
    if (!force) {
      const cached = cacheGet<CachedAnalysis>(username, contestSlug);
      if (cached) {
        setAllResults(prev => ({ ...prev, [contestSlug]: cached.data.results }));
        return;
      }
    }
    setAnalyzing(true);
    try {
      const questions = await getContestQuestions(contestSlug);
      const results: Record<string, AnalysisReport> = {};
      await Promise.all(
        questions.map(async (q) => {
          const events = await getReplayEvents(username, contestSlug, q.titleSlug);
          results[q.titleSlug] = analyzeEvents(events, settings);
        })
      );
      setAllResults(prev => ({ ...prev, [contestSlug]: results }));
      cacheSet<CachedAnalysis>(username, contestSlug, { results });
      setCacheAgeMap(prev => ({ ...prev, [contestSlug]: 0 }));
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    }
    setAnalyzing(false);
  };

  const handleExpand = async (slug: string) => {
    if (expandedContest === slug) { setExpandedContest(null); return; }
    await runAnalysis(slug);
  };

  const handleForceRefresh = async (slug: string) => runAnalysis(slug, true);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="animate-fade-in-up"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 50,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "25rem",
          maxHeight: "86vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          overflow: "hidden",
          background: "#1a1a1a",
          border: "1px solid #333",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", borderBottom: "1px solid #2a2a2a", background: "#222",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "8px", overflow: "hidden",
              border: "1px solid #3a3a3a", flexShrink: 0,
            }}>
              <img src={lensLogo} alt="ContestLens"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#e5e7eb", lineHeight: 1.2 }}>
                ContestLens
              </div>
              <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "1px" }}>@{username}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <HeaderBtn
              active={activeTab === "settings"}
              onClick={() => setActiveTab(activeTab === "settings" ? "scan" : "settings")}
              title="Settings"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </HeaderBtn>
            <HeaderBtn onClick={() => setIsOpen(false)} title="Close" close>✕</HeaderBtn>
          </div>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "12px",
          scrollbarWidth: "thin", scrollbarColor: "#333 transparent",
        }}>
          {activeTab === "settings" ? (
            <SettingsView />
          ) : (
            <ContestDashboard
              history={history}
              scanning={scanning}
              scanError={scanError}
              expandedContest={expandedContest}
              analyzing={analyzing}
              analysisError={analysisError}
              allResults={allResults}
              cacheAgeMap={cacheAgeMap}
              onScan={handleScan}
              onExpand={handleExpand}
              onForceRefresh={handleForceRefresh}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 14px", borderTop: "1px solid #2a2a2a", background: "#222",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "#22c55e", boxShadow: "0 0 4px #22c55e88",
            }} />
            <span style={{ fontSize: "10px", color: "#4b5563" }}>Active</span>
          </div>
          <span style={{ fontSize: "10px", color: "#374151" }}>ContestLens · Beta</span>
        </div>
      </div>
    </div>
  );
}

// ─── Header button ────────────────────────────────────────────────────────────

function HeaderBtn({ active, close, onClick, title, children }: {
  active?: boolean;
  close?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  const bg = active
    ? "#333"
    : hovered
    ? (close ? "rgba(239,68,68,0.12)" : "#2a2a2a")
    : "transparent";

  const color = active
    ? "#e5e7eb"
    : hovered
    ? (close ? "#f87171" : "#d1d5db")
    : "#6b7280";

  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "28px", height: "28px",
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: "6px", border: "none", cursor: "pointer",
        background: bg, color,
        fontSize: "12px",
        transition: "background 0.12s, color 0.12s",
      }}
    >
      {children}
    </button>
  );
}
