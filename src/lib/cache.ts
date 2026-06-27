/**
 * ContestLens – localStorage Cache
 *
 * Stores analysis results keyed by "username:contestSlug".
 * Entries expire after TTL_MS (30 minutes by default).
 */

import type { CacheEntry } from "../types";

const TTL_MS = 30 * 60 * 1000; // 30 minutes
const KEY_PREFIX = "contestlens:cache:";

function storageKey(username: string, contestSlug: string): string {
  return `${KEY_PREFIX}${username}:${contestSlug}`;
}

export function cacheGet<T>(
  username: string,
  contestSlug: string
): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(storageKey(username, contestSlug));
    if (!raw) return null;

    const entry = JSON.parse(raw) as CacheEntry<T>;

    if (Date.now() - entry.cachedAt > TTL_MS) {
      localStorage.removeItem(storageKey(username, contestSlug));
      return null;
    }

    return entry;
  } catch {
    return null;
  }
}

export function cacheSet<T>(
  username: string,
  contestSlug: string,
  data: T
): void {
  try {
    const entry: CacheEntry<T> = { data, cachedAt: Date.now() };
    localStorage.setItem(
      storageKey(username, contestSlug),
      JSON.stringify(entry)
    );
  } catch {
    // localStorage full or unavailable — silently skip
  }
}

/** Returns how many minutes ago the entry was cached, or null if not cached. */
export function cacheAge(
  username: string,
  contestSlug: string
): number | null {
  try {
    const raw = localStorage.getItem(storageKey(username, contestSlug));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<unknown>;
    return Math.floor((Date.now() - entry.cachedAt) / 60_000);
  } catch {
    return null;
  }
}

/** Wipe all ContestLens cache entries. */
export function cacheClear(): void {
  try {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(KEY_PREFIX)
    );
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
