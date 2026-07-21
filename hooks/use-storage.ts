import { useCallback, useSyncExternalStore } from "react";

type StorageType = "local" | "session";

const listeners = new Map<string, Set<() => void>>();

function getStore(type: StorageType) {
  return type === "local" ? localStorage : sessionStorage;
}

function notify(key: string) {
  listeners.get(key)?.forEach((callback) => callback());
}

// Reads from localStorage/sessionStorage via useSyncExternalStore so the
// server snapshot (always defaultValue) and the client snapshot never
// disagree during hydration — reading storage inside a useState initializer
// or a useEffect either mismatches the SSR-rendered markup or requires an
// extra post-mount render to correct it.
export function useStorage<T>(
  key: string,
  defaultValue: T,
  type: StorageType = "session"
): [T, (value: T) => void] {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      const keyListeners = listeners.get(key)!;
      keyListeners.add(callback);
      return () => keyListeners.delete(callback);
    },
    [key]
  );

  const getSnapshot = useCallback((): T => {
    try {
      const raw = getStore(type).getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, [key, type, defaultValue]);

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const set = useCallback(
    (value: T) => {
      try {
        getStore(type).setItem(key, JSON.stringify(value));
      } catch {}
      notify(key);
    },
    [key, type]
  );

  return [state, set];
}
