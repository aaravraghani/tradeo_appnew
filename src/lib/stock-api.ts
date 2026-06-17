// src/lib/stock-api.ts
// Quotes  → Finnhub free tier (60 req/min, works from Vercel)
// Charts  → Yahoo Finance v8 chart endpoint (no auth needed, just chart data)
// Get Finnhub key at: https://finnhub.io/register

export interface StockQuote {
  symbol: string
  shortName: string
  longName: string
  currency: string
  regularMarketPrice: number
  regularMarketChange: number
  regularMarketChangePercent: number
  regularMarketPreviousClose: number
  regularMarketOpen: number
  regularMarketDayHigh: number
  regularMarketDayLow: number
  regularMarketVolume: number
  marketCap?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  trailingPE?: number
}

export interface ChartPoint {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// ── Stock list — US-listed Asian stocks, Finnhub free tier compatible ─────────
export const SEA_STOCKS = [
  { symbol: 'SE',   name: 'Sea Limited',   country: 'SG', icon: '🌊', sector: 'Technology', currency: 'USD' },
  { symbol: 'GRAB', name: 'Grab Holdings', country: 'SG', icon: '🚗', sector: 'Technology', currency: 'USD' },
  { symbol: 'BABA', name: 'Alibaba',       country: 'HK', icon: '🛒', sector: 'Technology', currency: 'USD' },
  { symbol: 'JD',   name: 'JD.com',        country: 'HK', icon: '📦', sector: 'E-Commerce', currency: 'USD' },
  { symbol: 'BEKE', name: 'KE Holdings',   country: 'HK', icon: '🏠', sector: 'Real Estate', currency: 'USD' },
  { symbol: 'IQ',   name: 'iQIYI',         country: 'HK', icon: '🎬', sector: 'Media',       currency: 'USD' },
  { symbol: 'NTES', name: 'NetEase',        country: 'HK', icon: '🎮', sector: 'Technology',  currency: 'USD' },
  { symbol: 'TME',  name: 'Tencent Music', country: 'HK', icon: '🎵', sector: 'Media',       currency: 'USD' },
  { symbol: 'WB',   name: 'Weibo',         country: 'HK', icon: '💬', sector: 'Social',      currency: 'USD' },
  { symbol: 'HTHT', name: 'H World Group', country: 'HK', icon: '🏨', sector: 'Hospitality', currency: 'USD' },
]

// ── Country flags ─────────────────────────────────────────────────────────────
const COUNTRY_FLAGS: Record<string, string> = {
  SG: '🇸🇬', ID: '🇮🇩', MY: '🇲🇾', TH: '🇹🇭', VN: '🇻🇳', PH: '🇵🇭', HK: '🇭🇰',
}
export function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? '🌏'
}

// ── Finnhub — quotes only ─────────────────────────────────────────────────────

function getFinnhubKey(): string {
  const key = process.env.FINNHUB_API_KEY
  if (!key) throw new Error('FINNHUB_API_KEY env var not set')
  return key
}

async function fetchFinnhubQuote(symbol: string, apiKey: string) {
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error(`Finnhub quote error: ${res.status} for ${symbol}`)
  return res.json()
}

async function fetchFinnhubProfile(symbol: string, apiKey: string) {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function fetchQuotes(symbols: string[]): Promise<StockQuote[]> {
  const apiKey = getFinnhubKey()

  const results = await Promise.allSettled(
    symbols.map(async (symbol) => {
      const meta = SEA_STOCKS.find(s => s.symbol === symbol)
      const [quote, profile] = await Promise.all([
        fetchFinnhubQuote(symbol, apiKey),
        fetchFinnhubProfile(symbol, apiKey),
      ])

      // Use previousClose as fallback when market is closed (c returns 0)
      const price = quote.c > 0 ? quote.c : (quote.pc ?? 0)

      return {
        symbol,
        shortName: profile?.name ?? meta?.name ?? symbol,
        longName:  profile?.name ?? meta?.name ?? symbol,
        currency:  profile?.currency ?? meta?.currency ?? 'USD',
        regularMarketPrice:         price,
        regularMarketChange:        quote.d  ?? 0,
        regularMarketChangePercent: quote.dp ?? 0,
        regularMarketPreviousClose: quote.pc ?? 0,
        regularMarketOpen:          quote.o  ?? 0,
        regularMarketDayHigh:       quote.h  ?? 0,
        regularMarketDayLow:        quote.l  ?? 0,
        regularMarketVolume:        0,
        marketCap: profile?.marketCapitalization
          ? profile.marketCapitalization * 1e6
          : undefined,
        fiftyTwoWeekHigh: undefined,
        fiftyTwoWeekLow:  undefined,
        trailingPE: profile?.peNormalizedAnnual ?? undefined,
      } as StockQuote
    })
  )

  return results
    .filter((r): r is PromiseFulfilledResult<StockQuote> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(q => q.regularMarketPrice > 0)
}

// ── Yahoo Finance v8 — chart data only ───────────────────────────────────────
// This endpoint is public (no API key), returns OHLCV candles.
// Works from Vercel as long as we use a browser-like User-Agent.

export type ChartRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y'

const YF_RANGE_MAP: Record<ChartRange, { range: string; interval: string }> = {
  '1d':  { range: '5d',  interval: '1d'  }, // show 5 days of daily bars
  '5d':  { range: '1mo', interval: '1d'  }, // show 1 month of daily bars
  '1mo': { range: '3mo', interval: '1d'  }, // show 3 months of daily bars
  '3mo': { range: '6mo', interval: '1wk' },
  '6mo': { range: '1y',  interval: '1wk' },
  '1y':  { range: '2y',  interval: '1wk' },
}

export async function fetchChart(symbol: string, range: ChartRange = '1mo'): Promise<ChartPoint[]> {
  const { range: yfRange, interval } = YF_RANGE_MAP[range]

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${yfRange}&interval=${interval}&includePrePost=false`

  try {
    const res = await fetch(url, {
      headers: {
        // Must send a browser-like User-Agent — Yahoo blocks bare fetch()
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Origin': 'https://finance.yahoo.com',
        'Referer': 'https://finance.yahoo.com/',
      },
      next: { revalidate: 300 }, // cache 5 min
    })

    if (!res.ok) {
      console.warn(`Yahoo chart ${res.status} for ${symbol} — returning empty`)
      return []
    }

    const data = await res.json()
    const result = data?.chart?.result?.[0]
    if (!result) return []

    const timestamps: number[] = result.timestamp ?? []
    const ohlcv = result.indicators?.quote?.[0]

    if (!timestamps.length || !ohlcv) return []

    return timestamps
      .map((ts, i) => ({
        timestamp: ts * 1000,
        open:   ohlcv.open?.[i]   ?? 0,
        high:   ohlcv.high?.[i]   ?? 0,
        low:    ohlcv.low?.[i]    ?? 0,
        close:  ohlcv.close?.[i]  ?? 0,
        volume: ohlcv.volume?.[i] ?? 0,
      }))
      .filter(p => p.close != null && p.close > 0)

  } catch (err) {
    console.error(`fetchChart error for ${symbol}:`, err)
    return []
  }
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatPrice(price: number, currency = 'USD'): string {
  if (currency === 'IDR') return `Rp ${Math.round(price).toLocaleString('id-ID')}`
  if (currency === 'SGD') return `S$${price.toFixed(2)}`
  if (currency === 'MYR') return `RM ${price.toFixed(2)}`
  if (currency === 'THB') return `฿${price.toFixed(2)}`
  if (currency === 'VND') return `₫${price.toLocaleString('vi-VN')}`
  if (currency === 'HKD') return `HK$${price.toFixed(2)}`
  return `$${price.toFixed(2)}`
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`
  if (cap >= 1e9)  return `$${(cap / 1e9).toFixed(1)}B`
  if (cap >= 1e6)  return `$${(cap / 1e6).toFixed(1)}M`
  return `$${cap.toLocaleString()}`
}


