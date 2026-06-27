import { useEffect, useState } from "react";
import {
  loadSettings,
  saveSettings,
  SETTINGS_CHANGE_EVENT,
} from "../lib/settings";
import type { AppSettings } from "../types";

export function useSettings(): [AppSettings, (next: AppSettings) => void] {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    const handler = (e: Event) => {
      setSettings((e as CustomEvent<AppSettings>).detail);
    };
    window.addEventListener(SETTINGS_CHANGE_EVENT, handler);
    return () => window.removeEventListener(SETTINGS_CHANGE_EVENT, handler);
  }, []);

  const update = (next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  return [settings, update];
}
