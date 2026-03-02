import { NextResponse } from "next/server";
import type { CoinData, ApiResponse, SimplePriceResponse } from "../../../types";
import { getColorForSymbol, formatMarketCap, fetchFromCoinGecko } from "../../utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols");

    if (!symbols) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing 'symbols' parameter",
        },
        { status: 400 }
      );
    }

    const symbolList = symbols.split(",").map((s) => s.trim().toLowerCase());

    if (symbolList.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const priceData = await fetchFromCoinGecko<SimplePriceResponse>(
      `https://api.coingecko.com/api/v3/simple/price?symbols=${symbolList.join(",")}&vs_currencies=usd&include_market_cap=true`
    );

    const formattedData: CoinData[] = Object.entries(priceData)
      .filter(([, data]) => data.usd_market_cap !== undefined)
      .map(([symbol, data]) => ({
        id: symbol,
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        value: data.usd_market_cap || 0,
        display: formatMarketCap(data.usd_market_cap || 0),
        color: getColorForSymbol(symbol),
        price: data.usd || 0,
        priceChange24h: 0,
      }));

    const apiResponse: ApiResponse = {
      success: true,
      data: formattedData,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error fetching custom coin data:", error);
    
    const apiResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch coin data",
    };

    return NextResponse.json(apiResponse, { status: 500 });
  }
}
