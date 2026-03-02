# Coin Market Cap Tool

A cryptocurrency market cap visualization tool with support for custom coins.

## Features

- **Top 10 Cryptocurrencies**: Automatically fetches and displays the top 10 coins by market cap
- **Custom Coins**: Add your own coins beyond the top 10
- **Multiple Views**: Bar chart, Pie chart, and Table views
- **Interactive Toggle**: Show/hide individual coins
- **Persistent Storage**: 
  - Custom coins saved in localStorage
  - Visible/hidden state remembered across sessions
- **Smart Caching**: All data cached for 1 day in the browser
- **Manual Refresh**: Force refresh to get latest data (bypasses cache)

## Directory Structure

```
app/coin-market-cap/
├── api/
│   ├── coins/
│   │   ├── route.ts           # Top 10 coins API
│   │   ├── list/
│   │   │   └── route.ts       # All coins list (for search)
│   │   └── custom/
│   │       └── route.ts       # Custom coins API
├── components/
│   └── AddCoinDialog.tsx      # Add coin dialog
├── hooks/
│   ├── useCustomCoins.ts      # Custom coins localStorage management
│   └── useVisibleTokens.ts    # Visible tokens state management
├── client.tsx                 # Main client component
├── page.tsx                   # Page entry
└── types.ts                   # TypeScript types

Shared Components:
└── app/components/ui/
    └── dialog.tsx             # Shared dialog component

Shared Utilities:
├── lib/storage.ts             # Shared localStorage utilities
└── lib/cache.ts               # Shared cache utilities
```

## Usage

### Adding Custom Coins

1. Click the **+** button next to the refresh button
2. Type a coin symbol or name (e.g., "FLR" or "Flare")
3. Select the coin from the search results
4. Click **Add Coin**

The coin will be:
- Added to your visualization
- Saved in localStorage (persists across sessions)
- Included in all chart views

### Hiding/Showing Coins

1. Click on any coin badge in the toggle area to hide/show it
2. Use "All" button to show all coins
3. Use "None" button to hide all coins
4. Your visibility preferences are **automatically saved** and restored on next visit

### Refreshing Data

**Automatic Caching**:
- All API data is cached in localStorage for **1 day**
- Subsequent page loads use cached data (instant loading)
- No API calls until cache expires

**Manual Refresh**:
- Click the **Refresh** button (↻) to force fetch latest data
- This bypasses the cache and fetches fresh data from CoinGecko
- Use this when you want the most up-to-date market data

### Removing Coins

Currently, custom coins can only be removed by clearing localStorage:
- Open browser DevTools → Application → Local Storage
- Delete the key `@link1987tools/coin-market-cap-custom-coins`

Future updates may add a remove button directly in the UI.

## localStorage Keys

### Custom Coins
- **Key**: `@link1987tools/coin-market-cap-custom-coins`
- **Format**: `["FLR", "FIL", "ABT"]`
- **Purpose**: Stores user-added custom coin symbols

### Visible Tokens
- **Key**: `@link1987tools/coin-market-cap-visible-tokens`
- **Format**: `["BTC", "ETH", "FLR"]`
- **Purpose**: Remembers which coins are visible/hidden

### Cached Data
All cached data uses the prefix `@link1987tools/cache/`:

1. **Top 10 Coins**
   - **Key**: `@link1987tools/cache/coin-market-cap-top10`
   - **Expires**: 1 day
   - **Purpose**: Cached top 10 market data

2. **Custom Coins**
   - **Key**: `@link1987tools/cache/coin-market-cap-custom-{symbols}`
   - **Example**: `coin-market-cap-custom-FLR,FIL,ABT`
   - **Expires**: 1 day
   - **Purpose**: Cached custom coins data

3. **Coin List**
   - **Key**: `@link1987tools/cache/coin-market-cap-coin-list`
   - **Expires**: 1 day
   - **Purpose**: All supported coins (for search autocomplete)

## Caching Strategy

### Frontend Caching (Browser)
- **Duration**: 1 day (24 hours)
- **Storage**: localStorage
- **Benefits**:
  - Instant page loads on repeat visits
  - Reduced API calls to CoinGecko
  - Works offline (if cache is valid)

### Backend Caching (Server)
- **Coin List API**: 24-hour in-memory cache
- **Other APIs**: No server-side caching

### Cache Busting
- **Manual Refresh**: Click refresh button to bypass cache
- **Cache Expiry**: Automatically invalidates after 1 day
- **Custom Coins**: Cache key includes symbol list (updates when coins change)

## API Configuration

### Environment Variables

Create a `.env.local` file with your CoinGecko API key:

```env
COINGECKO_API_KEY=your_api_key_here
```

### API Endpoints

#### GET `/coin-market-cap/api/coins`
Fetches top 10 coins by market cap.

#### GET `/coin-market-cap/api/coins/list`
Fetches all supported coins (server-side cached for 24 hours).

#### GET `/coin-market-cap/api/coins/custom?symbols=SYMBOL1,SYMBOL2`
Fetches custom coins by symbols.

## Technical Details

### Shared Utilities

#### localStorage (lib/storage.ts)
All localStorage operations use the shared utility with `@link1987tools/` prefix:

```typescript
import { getFromStorage, setToStorage } from "@/lib/storage";

// Automatically adds @link1987tools/ prefix
getFromStorage("coin-market-cap-custom-coins", []);
setToStorage("coin-market-cap-custom-coins", ["FLR", "FIL"]);
```

#### Cache (lib/cache.ts)
Smart caching with automatic expiry:

```typescript
import { getCachedData, setCachedData } from "@/lib/cache";

// Automatically expires after 1 day
const data = getCachedData<CoinData[]>("coin-market-cap-top10");
setCachedData("coin-market-cap-top10", data);
```

### Shared Components

The dialog component is shared across all tools:

```typescript
import { Dialog, DialogContent, ... } from "@/components/ui/dialog";
```

### CoinGecko API Usage

- **Top 10**: `/coins/markets` endpoint
- **Custom Coins**: `/simple/price` with `include_market_cap=true`
- **Coin List**: `/coins/list` (server-side cached for 24 hours)

### Rate Limits

- **Free tier**: 50 calls/minute
- **With API Key**: Higher limits depending on plan
- **Our optimization**: Frontend cache reduces API calls significantly

## Limitations

1. Custom coins don't show price change percentage (CoinGecko `/simple/price` limitation)
2. Coin list is cached for 24 hours (both server and client side)
3. Maximum 50 symbols per request for `/simple/price` endpoint
4. Cache is stored in localStorage (clearing browser data removes cache)

## Future Enhancements

- [ ] Remove coin button in UI
- [ ] Bulk add coins
- [ ] Export/import custom coin lists
- [ ] Show price change for custom coins
- [ ] Auto-refresh interval option
- [ ] Show cache status/age in UI
