import type { AppSettings } from "../types";

const STORAGE_KEY = "contestlens_settings";
export const SETTINGS_CHANGE_EVENT = "contestlens:settings-change";

export const DEFAULT_SETTINGS: AppSettings = {
  mildPasteThreshold: 100,
  heavyPasteThreshold: 500,
  focusLossThreshold: 10,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AppSettings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(
    new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: settings })
  );
}
