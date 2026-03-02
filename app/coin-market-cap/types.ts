export interface CoinGeckoResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  last_updated: string;
}

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  value: number;
  display: string;
  color: string;
  price: number;
  priceChange24h: number;
}

export interface ApiResponse {
  success: boolean;
  data?: CoinData[];
  error?: string;
  lastUpdated?: string;
}

export interface CoinListResponse {
  id: string;
  symbol: string;
  name: string;
}

export interface SimplePriceResponse {
  [key: string]: {
    usd?: number;
    usd_market_cap?: number;
  };
}

