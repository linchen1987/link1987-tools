"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import type { CoinListResponse } from "../types";
import { getCachedData, setCachedData } from "../../../lib/cache";

const CACHE_KEY_COIN_LIST = "coin-market-cap-coin-list";

interface AddCoinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbol: string) => boolean;
  existingSymbols: string[];
}

export function AddCoinDialog({
  isOpen,
  onClose,
  onAdd,
  existingSymbols,
}: AddCoinDialogProps) {
  const [query, setQuery] = useState("");
  const [allCoins, setAllCoins] = useState<CoinListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && allCoins.length === 0) {
      fetchCoinList();
    }
  }, [isOpen]);

  const fetchCoinList = async () => {
    const cached = getCachedData<CoinListResponse[]>(CACHE_KEY_COIN_LIST);
    
    if (cached) {
      setAllCoins(cached);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/coin-market-cap/api/coins/list");
      const result = await response.json();
      
      if (result.success) {
        setAllCoins(result.data);
        setCachedData(CACHE_KEY_COIN_LIST, result.data);
      } else {
        setError("Failed to load coin list");
      }
    } catch (err) {
      setError("Failed to load coin list");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCoins = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const q = query.toLowerCase().trim();
    return allCoins
      .filter(
        (coin) =>
          (coin.symbol.toLowerCase().includes(q) ||
            coin.name.toLowerCase().includes(q)) &&
          !existingSymbols.includes(coin.symbol.toUpperCase())
      )
      .slice(0, 10);
  }, [query, allCoins, existingSymbols]);

  const handleAdd = () => {
    if (!selectedCoin) {
      return;
    }

    const success = onAdd(selectedCoin.symbol);
    if (success) {
      setQuery("");
      setSelectedCoin(null);
      onClose();
    } else {
      setError("This coin is already added");
    }
  };

  const handleClose = () => {
    setQuery("");
    setSelectedCoin(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Coin</DialogTitle>
          <DialogDescription>
            Search and add a cryptocurrency to your market cap visualization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Type symbol or name (e.g., BTC, Bitcoin)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedCoin(null);
                setError(null);
              }}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}

          {isLoading && (
            <div className="text-sm text-muted-foreground text-center py-4">
              Loading coin list...
            </div>
          )}

          {!isLoading && query && filteredCoins.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">
              No coins found
            </div>
          )}

          {!isLoading && filteredCoins.length > 0 && (
            <div className="space-y-1">
              {filteredCoins.map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => {
                    setSelectedCoin(coin);
                    setQuery(`${coin.symbol.toUpperCase()} - ${coin.name}`);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedCoin?.id === coin.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="font-medium text-sm">{coin.symbol.toUpperCase()}</div>
                  <div className="text-xs text-muted-foreground">{coin.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedCoin || isLoading}
            className="cursor-pointer"
          >
            Add Coin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
