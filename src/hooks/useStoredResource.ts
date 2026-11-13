"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { subscribeToStorage } from "@/lib/storage";

/**
 * Loads data through an (async) service function after mount and keeps it in
 * sync with storage changes made anywhere in this tab or in other tabs.
 *
 * Nothing touches `window` during render, so server HTML and the first client
 * render always match — `ready` flips to true once real data is available.
 */
export function useStoredResource<T>(
  keys: readonly string[],
  load: () => Promise<T>,
  initial: T,
): { data: T; ready: boolean; refresh: () => Promise<void> } {
  const [state, setState] = useState<{ data: T; ready: boolean }>({
    data: initial,
    ready: false,
  });
  const loadRef = useRef(load);
  loadRef.current = load;
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    const data = await loadRef.current();
    if (mounted.current) setState({ data, ready: true });
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const unsubscribe = subscribeToStorage(keys, () => void refresh());
    return () => {
      mounted.current = false;
      unsubscribe();
    };
    // keys are static module-level arrays
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  return { ...state, refresh };
}

