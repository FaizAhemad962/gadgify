import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "gadgify_recently_viewed";
const MAX_ITEMS = 10;

// Shared listeners for cross-component sync
let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) || "[]";
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export const useRecentlyViewed = () => {
  const storeValue = useSyncExternalStore(subscribe, getSnapshot);
  const recentIds: string[] = JSON.parse(storeValue);

  const addProduct = useCallback((productId: string) => {
    const current: string[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]",
    );
    const filtered = current.filter((id) => id !== productId);
    const updated = [productId, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    emitChange();
  }, []);

  return { recentIds, addProduct };
};
