/**
 * ContestLens – LeetCode GraphQL API
 *
 * Uses the exact same query shapes as the original working implementation.
 * LeetCode's public GraphQL endpoint needs only Content-Type — no auth headers,
 * no credentials, no CSRF token for public contest data.
 *
 * The 400 error was caused by requesting fields that don't exist in LC's schema:
 *   ✗ score, finishTimeInSeconds  (not on userContestRankingHistory)
 *
 * Replay events DO need credentials since they're per-user private data.
 */

import type { ContestHistoryItem, ContestQuestion, ReplayEvent } from "../types";
import { enqueue } from "./queue";

const GRAPHQL_URL = "https://leetcode.com/graphql";

function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? (match[1] ?? "") : "";
}

// ── Public query (no auth needed) ─────────────────────────────────────────────
async function publicQuery<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  return enqueue(async () => {
    let response: Response;
    try {
      response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });
    } catch {
      throw new Error("Could not reach LeetCode. Check your internet connection.");
    }

    if (!response.ok) {
      throw new Error(`LeetCode returned HTTP ${response.status}. Try again in a moment.`);
    }

    let json: Record<string, unknown>;
    try { json = await response.json(); }
    catch { throw new Error("LeetCode returned an unreadable response."); }

    if (Array.isArray(json.errors) && json.errors.length > 0) {
      const msg = (json.errors[0] as { message?: string }).message ?? "Unknown GraphQL error";
      throw new Error(`LeetCode API error: ${msg}`);
    }
    if (!json.data) throw new Error("LeetCode returned an empty response. Try again later.");

    return json.data as T;
  });
}

// ── Authenticated query (session cookie, for replay events) ───────────────────
async function authQuery<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  return enqueue(async () => {
    let response: Response;
    try {
      response = await fetch(GRAPHQL_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": getCsrfToken(),
          "Referer": "https://leetcode.com/",
        },
        body: JSON.stringify({ query, variables }),
      });
    } catch {
      throw new Error("Could not reach LeetCode. Check your internet connection.");
    }

    if (response.status === 403) {
      throw new Error("Session expired — refresh the LeetCode page and try again.");
    }
    if (!response.ok) {
      throw new Error(`LeetCode returned HTTP ${response.status}. Try again.`);
    }

    let json: Record<string, unknown>;
    try { json = await response.json(); }
    catch { throw new Error("LeetCode returned an unreadable response."); }

    if (Array.isArray(json.errors) && json.errors.length > 0) {
      const msg = (json.errors[0] as { message?: string }).message ?? "Unknown GraphQL error";
      throw new Error(`LeetCode API error: ${msg}`);
    }
    if (!json.data) throw new Error("LeetCode returned an empty response.");

    return json.data as T;
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch the last 5 attended contests.
 * Only fields confirmed to exist in LC schema: attended, ranking, contest{title,titleSlug}
 */
export async function getUserContestHistory(
  username: string
): Promise<ContestHistoryItem[]> {
  const query = `
    query userContestRankingInfo($username: String!) {
      userContestRankingHistory(username: $username) {
        attended
        ranking
        contest {
          title
          titleSlug
        }
      }
    }
  `;

  const data = await publicQuery<{
    userContestRankingHistory: ContestHistoryItem[] | null;
  }>(query, { username });

  if (!data.userContestRankingHistory) {
    throw new Error(
      `No contest data found for "${username}". The profile may be private or the username doesn't exist.`
    );
  }

  return data.userContestRankingHistory
    .filter((c) => c.attended)
    .reverse()
    .slice(0, 5);
}

/** Fetch all questions in a contest. */
export async function getContestQuestions(
  contestSlug: string
): Promise<ContestQuestion[]> {
  const query = `
    query contestQuestionList($contestSlug: String!) {
      contestQuestionList(contestSlug: $contestSlug) {
        title
        titleSlug
        questionId
      }
    }
  `;

  const data = await publicQuery<{
    contestQuestionList: ContestQuestion[] | null;
  }>(query, { contestSlug });

  if (!data.contestQuestionList?.length) {
    throw new Error(`No questions found for contest "${contestSlug}". It may not be accessible yet.`);
  }

  return data.contestQuestionList;
}

/** Fetch keystroke replay events — requires session cookie. */
export async function getReplayEvents(
  username: string,
  contestSlug: string,
  questionSlug: string
): Promise<ReplayEvent[]> {
  const query = `
    query UserContestReplayEvents(
      $contestSlug: String!
      $questionSlug: String!
      $username: String
    ) {
      userContestReplayEvents(
        contestSlug: $contestSlug
        questionSlug: $questionSlug
        username: $username
      ) {
        eventType
        eventData
        timestamp
      }
    }
  `;

  const data = await authQuery<{
    userContestReplayEvents: ReplayEvent[] | null;
  }>(query, { contestSlug, questionSlug, username });

  return data.userContestReplayEvents ?? [];
}
