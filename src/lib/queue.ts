/**
 * ContestLens – Request Queue
 *
 * A simple FIFO async queue that enforces a minimum delay between
 * consecutive network requests so we don't hammer the LeetCode GraphQL API.
 */

const DELAY_MS = 300;

let lastCallAt = 0;

/**
 * Wraps an async task and ensures at least DELAY_MS has passed since the
 * previous task finished before this one starts.
 */
export async function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const wait = Math.max(0, lastCallAt + DELAY_MS - now);

  if (wait > 0) {
    await new Promise((res) => setTimeout(res, wait));
  }

  lastCallAt = Date.now();
  return task();
}
