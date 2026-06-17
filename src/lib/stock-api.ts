// src/lib/stock-api.ts
// Stock price data via Finnhub (free tier, 60 req/min, works from Vercel)
// Get a free API key at: https://finnhub.io/register

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

// ── Finnhub API ───────────────────────────────────────────────────────────────

function getFinnhubKey(): string {
  const key = process.env.FINNHUB_API_KEY
  if (!key) throw new Error('FINNHUB_API_KEY env var not set — add it in Vercel → Settings → Environment Variables')
  return key
}

async function fetchFinnhubQuote(symbol: string, apiKey: string) {
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error(`Finnhub quote error: ${res.status} for ${symbol}`)
  return res.json()
  // Returns: { c: current, d: change, dp: changePercent, h: high, l: low, o: open, pc: prevClose }
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

// ── Public API ────────────────────────────────────────────────────────────────

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

export type ChartRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y'

export async function fetchChart(symbol: string, range: ChartRange = '1mo'): Promise<ChartPoint[]> {
  const apiKey = getFinnhubKey()

  const now = Math.floor(Date.now() / 1000)

  // ── FIX: Finnhub free tier only supports daily (D) and weekly (W) candles
  // for most symbols. Intraday (5, 15, 60) requires premium. Map all ranges
  // to daily or weekly resolution to avoid empty responses.
  const rangeSeconds: Record<ChartRange, number> = {
    '1d':  7 * 86400,    // show 7 days of daily candles for "1d" view
    '5d':  14 * 86400,   // show 2 weeks of daily candles for "5d" view
    '1mo': 30 * 86400,
    '3mo': 90 * 86400,
    '6mo': 180 * 86400,
    '1y':  365 * 86400,
  }

  const resolutionMap: Record<ChartRange, string> = {
    '1d':  'D',   // daily (free tier)
    '5d':  'D',   // daily (free tier)
    '1mo': 'D',   // daily
    '3mo': 'D',   // daily
    '6mo': 'W',   // weekly
    '1y':  'W',   // weekly
  }

  const from = now - rangeSeconds[range]
  const resolution = resolutionMap[range]

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${now}&token=${apiKey}`,
      { next: { revalidate: 120 } }
    )

    if (!res.ok) throw new Error(`Finnhub chart error: ${res.status}`)

    const data = await res.json()

    // data.s === 'no_data' means market closed or symbol not found on free tier
    if (data.s !== 'ok' || !data.t || data.t.length === 0) {
      console.warn(`Finnhub chart: no data for ${symbol} range=${range} status=${data.s}`)
      return []
    }

    return (data.t as number[])
      .map((ts, i) => ({
        timestamp: ts * 1000,
        open:   data.o?.[i] ?? 0,
        high:   data.h?.[i] ?? 0,
        low:    data.l?.[i] ?? 0,
        close:  data.c?.[i] ?? 0,
        volume: data.v?.[i] ?? 0,
      }))
      .filter(p => p.close > 0)

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


