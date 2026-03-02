"use client";

import { Eye, EyeOff, ExternalLink, BarChart3, PieChart, Table, RefreshCw, AlertCircle, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { CoinData, ApiResponse } from "./types";
import { useCustomCoins } from "./hooks/useCustomCoins";
import { useVisibleTokens } from "./hooks/useVisibleTokens";
import { AddCoinDialog } from "./components/AddCoinDialog";
import { getCachedData, setCachedData } from "../../lib/cache";

const CACHE_KEY_TOP10 = "coin-market-cap-top10";
const CACHE_KEY_CUSTOM = "coin-market-cap-custom";

export default function CoinMarketCapClient() {
  const [data, setData] = useState<CoinData[]>([]);
  const [view, setView] = useState<"bar" | "pie" | "table">("bar");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ symbol: string; isOpen: boolean }>({
    symbol: "",
    isOpen: false,
  });
  
  const { customCoins, addCoin, removeCoin } = useCustomCoins();
  
  const allSymbols = useMemo(() => data.map((d) => d.symbol), [data]);
  const { visibleTokens, showNewSymbols, toggleToken, showAll, hideAll } = useVisibleTokens(allSymbols);

  const fetchData = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      let top10Data: CoinData[] | null = null;
      let customData: CoinData[] | null = null;
      let lastUpdateTime: string | null = null;

      if (!forceRefresh) {
        top10Data = getCachedData<CoinData[]>(CACHE_KEY_TOP10);
        if (customCoins.length > 0) {
          const customCacheKey = `${CACHE_KEY_CUSTOM}-${customCoins.join(",")}`;
          customData = getCachedData<CoinData[]>(customCacheKey);
        }
      }

      if (!top10Data) {
        const top10Response = await fetch("/coin-market-cap/api/coins");
        const top10Result: ApiResponse = await top10Response.json();

        if (!top10Response.ok || !top10Result.success) {
          throw new Error(top10Result.error || "Failed to fetch data");
        }

        top10Data = top10Result.data || [];
        lastUpdateTime = top10Result.lastUpdated || null;
        setCachedData(CACHE_KEY_TOP10, top10Data);
      }

      if (customCoins.length > 0 && !customData) {
        const customResponse = await fetch(
          `/coin-market-cap/api/coins/custom?symbols=${customCoins.join(",")}`
        );
        const customResult: ApiResponse = await customResponse.json();

        if (customResult.success && customResult.data) {
          customData = customResult.data;
          const customCacheKey = `${CACHE_KEY_CUSTOM}-${customCoins.join(",")}`;
          setCachedData(customCacheKey, customData);
        }
      }

      const allData = [...top10Data];
      if (customData) {
        allData.push(...customData);
      }

      const symbolMap = new Map<string, CoinData>();
      allData.forEach((coin: CoinData) => {
        symbolMap.set(coin.symbol, coin);
      });

      const uniqueData = Array.from(symbolMap.values()).sort((a, b) => b.value - a.value);

      setData(uniqueData);
      if (lastUpdateTime) {
        setLastUpdated(lastUpdateTime);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData(true);
  };

  useEffect(() => {
    if (customCoins !== undefined) {
      fetchData();
    }
  }, [customCoins]);

  const handleAddCoin = (symbol: string): boolean => {
    const success = addCoin(symbol);
    if (success) {
      const upperSymbol = symbol.toUpperCase();
      showNewSymbols([upperSymbol]);
      toast.success(`Added ${upperSymbol} to your list`);
    } else {
      toast.error(`${symbol.toUpperCase()} is already in your list`);
    }
    return success;
  };

  const filteredData = data.filter((d) => visibleTokens.has(d.symbol));
  const total = filteredData.reduce((sum, item) => sum + item.value, 0);

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Coin Market Cap</h1>
          <p className="text-[var(--muted-foreground)]">
            Visualize cryptocurrency market cap data with interactive charts.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-card p-16 shadow-sm">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Coin Market Cap</h1>
        <p className="text-[var(--muted-foreground)]">
          Visualize cryptocurrency market cap data with interactive charts.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-500 mb-1">Failed to load data</p>
              <p className="text-sm text-red-500/80">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-3 border-red-500/30 text-red-500 hover:bg-red-500/10 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {!error && data.length > 0 && (
        <>
          <div className="rounded-xl border border-[var(--border)] bg-card p-6 shadow-sm hover:border-[var(--primary)]/50 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground mr-1">Toggle:</span>
                {data.map((item) => {
                  const isCustom = customCoins.includes(item.symbol);
                  return (
                    <button
                      key={item.symbol}
                      onClick={() => toggleToken(item.symbol)}
                      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                        visibleTokens.has(item.symbol)
                          ? "bg-primary/10 text-primary border border-[var(--primary)]/20"
                          : "bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted/60 hover:border-[var(--border)]/40"
                      }`}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.symbol}
                      {visibleTokens.has(item.symbol) ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                      {isCustom && (
                        <X
                          className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({ symbol: item.symbol, isOpen: true });
                          }}
                        />
                      )}
                    </button>
                  );
                })}
                <div className="flex gap-1 ml-2">
                  <Button variant="ghost" size="sm" onClick={showAll} className="cursor-pointer">
                    All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={hideAll} className="cursor-pointer">
                    None
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Last updated: {formatLastUpdated(lastUpdated)}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {filteredData.map((item) => (
                <div
                  key={item.symbol}
                  className="flex flex-col p-3.5 rounded-lg bg-muted/30 border border-[var(--border)]/20 hover:border-[var(--border)]/40 hover:bg-muted/40 transition-all"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-sm">{item.symbol}</span>
                  </div>
                  <span className="text-sm text-muted-foreground mb-0.5">${item.display}</span>
                  <span className="text-xs font-medium text-muted-foreground/80">
                    {total > 0 ? ((item.value / total) * 100).toFixed(2) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={view === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("bar")}
                className="gap-2 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                Bar
              </Button>
              <Button
                variant={view === "pie" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("pie")}
                className="gap-2 cursor-pointer"
              >
                <PieChart className="w-4 h-4" />
                Pie
              </Button>
              <Button
                variant={view === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("table")}
                className="gap-2 cursor-pointer"
              >
                <Table className="w-4 h-4" />
                Table
              </Button>
            </div>

            {view === "bar" && (
              <div className="rounded-xl border border-[var(--border)] bg-card p-6 shadow-sm hover:border-[var(--primary)]/50 transition-colors">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">All</span>
                      <span className="text-muted-foreground">100%</span>
                    </div>
                    <div className="h-8 bg-muted/30 rounded-lg overflow-hidden flex">
                      {filteredData.map((item) => (
                        <div
                          key={item.symbol}
                          className="h-full transition-all duration-500 flex items-center justify-center"
                          style={{
                            width: total > 0 ? `${(item.value / total) * 100}%` : 0,
                            backgroundColor: item.color,
                          }}
                        >
                          {total > 0 && (item.value / total) * 100 > 8 && (
                            <span className="text-xs font-semibold text-white drop-shadow-md">
                              {((item.value / total) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {filteredData.map((item) => (
                    <div key={item.symbol} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.symbol}</span>
                        <span className="text-muted-foreground">
                          ${item.display} · {total > 0 ? ((item.value / total) * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                      <div className="h-7 bg-muted/30 rounded-lg overflow-hidden">
                        <div
                          className="h-full rounded-lg transition-all duration-500"
                          style={{
                            width: total > 0 ? `${(item.value / total) * 100}%` : 0,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === "pie" && (
              <div className="rounded-xl border border-[var(--border)] bg-card p-6 shadow-sm hover:border-[var(--primary)]/50 transition-colors">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                  <svg viewBox="0 0 100 100" className="w-72 h-72">
                    {(() => {
                      let cumulativePercent = 0;
                      return filteredData.map((item) => {
                        const percent = total > 0 ? item.value / total : 0;
                        const startX =
                          Math.cos(2 * Math.PI * cumulativePercent - Math.PI / 2) * 35 + 50;
                        const startY =
                          Math.sin(2 * Math.PI * cumulativePercent - Math.PI / 2) * 35 + 50;
                        cumulativePercent += percent;
                        const endX =
                          Math.cos(2 * Math.PI * cumulativePercent - Math.PI / 2) * 35 + 50;
                        const endY =
                          Math.sin(2 * Math.PI * cumulativePercent - Math.PI / 2) * 35 + 50;
                        const largeArcFlag = percent > 0.5 ? 1 : 0;

                        return (
                          <path
                            key={item.symbol}
                            d={`M 50 50 L ${startX} ${startY} A 35 35 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                            fill={item.color}
                            stroke="hsl(var(--background))"
                            strokeWidth="0.8"
                            className="hover:opacity-90 transition-all duration-200 cursor-pointer hover:scale-105"
                            style={{ transformOrigin: "center" }}
                          />
                        );
                      });
                    })()}
                  </svg>

                  <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center">
                    {filteredData.map((item) => (
                      <div key={item.symbol} className="flex items-center gap-2.5">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm flex items-baseline gap-2">
                          <span className="font-medium">{item.symbol}</span>
                          <span className="text-muted-foreground font-normal">
                            {total > 0 ? ((item.value / total) * 100).toFixed(2) : 0}%
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {view === "table" && (
              <div className="rounded-xl border border-[var(--border)] bg-card p-6 shadow-sm hover:border-[var(--primary)]/50 transition-colors">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]/20">
                        <th className="text-left py-3 px-4 font-medium text-sm">Asset</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">Market Cap</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item) => (
                        <tr key={item.symbol} className="border-b border-[var(--border)]/20 last:border-0">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-medium">{item.symbol}</span>
                            </div>
                          </td>
                          <td className="text-right py-3.5 px-4 text-muted-foreground">
                            ${item.display}
                          </td>
                          <td className="text-right py-3.5 px-4 font-medium">
                            {total > 0 ? ((item.value / total) * 100).toFixed(2) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <a
        href="https://www.coingecko.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-primary transition-colors cursor-pointer"
      >
        Data from CoinGecko
        <ExternalLink className="w-3.5 h-3.5" />
      </a>

      <AddCoinDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleAddCoin}
        existingSymbols={data.map((d) => d.symbol)}
      />

      <Dialog
        open={deleteConfirm.isOpen}
        onOpenChange={(isOpen) => setDeleteConfirm({ ...deleteConfirm, isOpen })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove {deleteConfirm.symbol}</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {deleteConfirm.symbol} from your list? You can add it again later if needed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ symbol: "", isOpen: false })}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                removeCoin(deleteConfirm.symbol);
                toast.success(`Removed ${deleteConfirm.symbol} from your list`);
                setDeleteConfirm({ symbol: "", isOpen: false });
              }}
              className="cursor-pointer text-red-500 border-red-500/30 hover:bg-red-500/10"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
