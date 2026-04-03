"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const FAVORITES_KEY = "pookiecrafts-favorites";

function readHandlesFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((h): h is string => typeof h === "string" && h.trim().length > 0);
  } catch {
    return [];
  }
}

function writeHandlesToStorage(handles: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(handles));
  } catch {
    // quota / private mode
  }
}

interface FavoritesContextValue {
  /** After first client read of localStorage (avoids wishlist flash before hydration). */
  isHydrated: boolean;
  handles: string[];
  count: number;
  isFavorite: (handle: string) => boolean;
  toggle: (handle: string) => void;
  removeHandles: (handles: string[]) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [handles, setHandles] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHandles(readHandlesFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) {
        setHandles(readHandlesFromStorage());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hydrated]);

  const isFavorite = useCallback(
    (handle: string) => handles.includes(handle),
    [handles]
  );

  const toggle = useCallback(
    (handle: string) => {
      const h = handle.trim();
      if (!h) return;
      setHandles((prev) => {
        const idx = prev.indexOf(h);
        let next: string[];
        if (idx >= 0) {
          next = prev.filter((x) => x !== h);
        } else {
          next = [...prev, h];
        }
        writeHandlesToStorage(next);
        return next;
      });
    },
    []
  );

  const removeHandles = useCallback((toRemove: string[]) => {
    if (toRemove.length === 0) return;
    const removeSet = new Set(toRemove.map((x) => x.trim()).filter(Boolean));
    setHandles((prev) => {
      const next = prev.filter((h) => !removeSet.has(h));
      writeHandlesToStorage(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isHydrated: hydrated,
      handles,
      count: handles.length,
      isFavorite,
      toggle,
      removeHandles,
    }),
    [hydrated, handles, isFavorite, toggle, removeHandles]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}
