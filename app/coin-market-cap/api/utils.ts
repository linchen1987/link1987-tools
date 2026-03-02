export function getColorForSymbol(symbol: string): string {
  const normalized = symbol.toLowerCase();
  
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

export function formatMarketCap(value: number): string {
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

export function getCoinGeckoHeaders(): Record<string, string> {
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers: Record<string, string> = {};
  
  if (apiKey && apiKey !== "your_api_key_here") {
    headers["x-cg-demo-api-key"] = apiKey;
  }
  
  return headers;
}

export async function fetchFromCoinGecko<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = getCoinGeckoHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  return response.json();
}
