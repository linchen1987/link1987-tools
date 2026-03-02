"use client";

import { useState, useEffect, useCallback } from "react";
import { getFromStorage, setToStorage } from "../../../lib/storage";

const STORAGE_KEY = "coin-market-cap-visible-tokens";

export function useVisibleTokens(allSymbols: string[] = []) {
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (allSymbols.length === 0) return;

    const stored = getFromStorage<string[] | null>(STORAGE_KEY, null);
    
    if (stored !== null) {
      const storedSet = new Set(stored);
      const validTokens = allSymbols.filter(s => storedSet.has(s));
      setVisibleTokens(new Set(validTokens));
    } else {
      setVisibleTokens(new Set(allSymbols));
    }
  }, [allSymbols]);

  const showNewSymbols = useCallback((newSymbols: string[]) => {
    if (newSymbols.length === 0) return;
    
    setVisibleTokens((prev) => {
      const next = new Set(prev);
      newSymbols.forEach(symbol => next.add(symbol));
      setToStorage(STORAGE_KEY, Array.from(next));
      return next;
    });
  }, []);

  const toggleToken = useCallback((symbol: string) => {
    setVisibleTokens((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      setToStorage(STORAGE_KEY, Array.from(next));
      return next;
    });
  }, []);

  const showAll = useCallback(() => {
    if (allSymbols.length > 0) {
      const newSet = new Set<string>(allSymbols);
      setVisibleTokens(newSet);
      setToStorage(STORAGE_KEY, Array.from(newSet));
    }
  }, [allSymbols]);

  const hideAll = useCallback(() => {
    const newSet = new Set<string>();
    setVisibleTokens(newSet);
    setToStorage(STORAGE_KEY, Array.from(newSet));
  }, []);

  return {
    visibleTokens,
    showNewSymbols,
    toggleToken,
    showAll,
    hideAll,
  };
}
