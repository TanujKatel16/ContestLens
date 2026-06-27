import { useEffect, useState } from "react";

/**
 * Returns the LeetCode username when on /u/<username>, null everywhere else.
 *
 * LeetCode is a React SPA — navigations fire pushState/replaceState, not
 * full page loads. We patch both AND listen to popstate so the hook reacts
 * to every route change instantly.
 *
 * Returns an object so callers can also detect *when* the route changed
 * (even if the new route is also a profile page) to reset their own state.
 */
export function useUsername(): { username: string | null; routeKey: string } {
  const [state, setState] = useState(() => ({
    username: getUsername(),
    routeKey: window.location.pathname,
  }));

  useEffect(() => {
    const sync = () => {
      setState({
        username: getUsername(),
        routeKey: window.location.pathname,
      });
    };

    window.addEventListener("popstate", sync);

    const origPush    = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);

    history.pushState = (...args) => { origPush(...args);    sync(); };
    history.replaceState = (...args) => { origReplace(...args); sync(); };

    return () => {
      window.removeEventListener("popstate", sync);
      history.pushState    = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  return state;
}

function getUsername(): string | null {
  const parts = window.location.pathname.split("/");
  if (parts[1] === "u" && parts[2]?.length > 0) return parts[2];
  return null;
}
