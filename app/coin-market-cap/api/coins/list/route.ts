import { NextResponse } from "next/server";
import type { CoinListResponse } from "../../../types";
import { fetchFromCoinGecko } from "../../utils";

let cachedCoins: CoinListResponse[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export async function GET() {
  const now = Date.now();
  
  if (cachedCoins && now - cacheTime < CACHE_DURATION) {
    return NextResponse.json({
      success: true,
      data: cachedCoins,
    });
  }

  try {
    const coins = await fetchFromCoinGecko<CoinListResponse[]>(
      "https://api.coingecko.com/api/v3/coins/list"
    );
    
    cachedCoins = coins;
    cacheTime = now;

    return NextResponse.json({
      success: true,
      data: coins,
    });
  } catch (error) {
    console.error("Error fetching coin list:", error);
    
    if (cachedCoins) {
      return NextResponse.json({
        success: true,
        data: cachedCoins,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch coin list",
      },
      { status: 500 }
    );
  }
}
