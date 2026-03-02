"use client";

import { useState, useEffect } from "react";
import { getFromStorage, setToStorage } from "../../../lib/storage";

const STORAGE_KEY = "coin-market-cap-custom-coins";

export function useCustomCoins() {
  const [customCoins, setCustomCoins] = useState<string[]>([]);

  useEffect(() => {
    const stored = getFromStorage<string[]>(STORAGE_KEY, []);
    setCustomCoins(stored);
  }, []);

  const addCoin = (symbol: string) => {
    const normalizedSymbol = symbol.toUpperCase();
    if (customCoins.includes(normalizedSymbol)) {
      return false;
    }

    const newCoins = [...customCoins, normalizedSymbol];
    setCustomCoins(newCoins);
    setToStorage(STORAGE_KEY, newCoins);
    return true;
  };

  const removeCoin = (symbol: string) => {
    const normalizedSymbol = symbol.toUpperCase();
    const newCoins = customCoins.filter((s) => s !== normalizedSymbol);
    setCustomCoins(newCoins);
    setToStorage(STORAGE_KEY, newCoins);
  };

  const clearCoins = () => {
    setCustomCoins([]);
    setToStorage(STORAGE_KEY, []);
  };

  return {
    customCoins,
    addCoin,
    removeCoin,
    clearCoins,
  };
}
