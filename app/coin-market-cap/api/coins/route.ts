import { NextResponse } from "next/server";
import type { CoinGeckoResponse, CoinData, ApiResponse } from "../../types";
import { getColorForSymbol, formatMarketCap, fetchFromCoinGecko } from "../utils";

export async function GET() {
  try {
    const coins = await fetchFromCoinGecko<CoinGeckoResponse[]>(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false",
      { next: { revalidate: 0 } }
    );

    const formattedData: CoinData[] = coins.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      value: coin.market_cap,
      display: formatMarketCap(coin.market_cap),
      color: getColorForSymbol(coin.symbol),
      price: coin.current_price,
      priceChange24h: coin.price_change_percentage_24h || 0,
    }));

    const apiResponse: ApiResponse = {
      success: true,
      data: formattedData,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error fetching coin data:", error);
    
    const apiResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch coin data",
    };

    return NextResponse.json(apiResponse, { status: 500 });
  }
}
