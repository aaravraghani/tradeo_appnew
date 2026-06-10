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

// ── SEA stocks — Finnhub uses plain symbols for US-listed, exchange prefix for others
// Finnhub format: exchange:symbol  e.g. "NYSE:SE", "IDX:GOTO"
export const SEA_STOCKS = [
  { symbol: 'SE',      finnhub: 'NYSE:SE',      name: 'Sea Limited',       country: 'SG', icon: '🌊', sector: 'Technology' },
  { symbol: 'GRAB',    finnhub: 'NASDAQ:GRAB',  name: 'Grab Holdings',     country: 'SG', icon: '🚗', sector: 'Technology' },
  { symbol: 'GOTO',    finnhub: 'IDX:GOTO',     name: 'GoTo Group',        country: 'ID', icon: '🛵', sector: 'Technology' },
  { symbol: 'TLKM',    finnhub: 'IDX:TLKM',     name: 'Telkom Indonesia',  country: 'ID', icon: '📡', sector: 'Telecom' },
  { symbol: 'BBCA',    finnhub: 'IDX:BBCA',     name: 'Bank BCA',          country: 'ID', icon: '🏦', sector: 'Banking' },
  { symbol: 'DBS',     finnhub: 'SGX:D05',      name: 'DBS Group',         country: 'SG', icon: '🏦', sector: 'Banking' },
  { symbol: 'SINGTEL', finnhub: 'SGX:Z74',      name: 'Singtel',           country: 'SG', icon: '📱', sector: 'Telecom' },
  { symbol: 'MAYBANK', finnhub: 'KLSE:MAYBANK', name: 'Maybank',           country: 'MY', icon: '🏦', sector: 'Banking' },
  { symbol: 'CPALL',   finnhub: 'SET:CPALL',    name: 'CP All (7-Eleven)', country: 'TH', icon: '🏪', sector: 'Retail' },
  { symbol: 'GRAB2',   finnhub: 'NASDAQ:GRAB',  name: 'GoTo Alt',          country: 'ID', icon: '🛵', sector: 'Technology' },
]

// Simpler list — only US-listed SEA stocks that Finnhub free tier covers well
export const SEA_STOCKS_TRADEABLE = [
  { symbol: 'SE',   finnhub: 'SE',   name: 'Sea Limited',   country: 'SG', icon: '🌊', sector: 'Technology', currency: 'USD' },
  { symbol: 'GRAB', finnhub: 'GRAB', name: 'Grab Holdings', country: 'SG', icon: '🚗', sector: 'Technology', currency: 'USD' },
  { symbol: 'BABA', finnhub: 'BABA', name: 'Alibaba Group', country: 'HK', icon: '🛒', sector: 'Technology', currency: 'USD' },
  { symbol: 'TCEHY',finnhub: 'TCEHY',name: 'Tencent',       country: 'HK', icon: '🎮', sector: 'Technology', currency: 'USD' },
  { symbol: 'GRAB', finnhub: 'GRAB', name: 'Grab Holdings', country: 'SG', icon: '🚗', sector: 'Technology', currency: 'USD' },
  { symbol: 'FRHC', finnhub: 'FRHC', name: 'Freedom Holding', country: 'KZ', icon: '📈', sector: 'Finance', currency: 'USD' },
]

// Final clean list — US-listed, Finnhub free tier compatible
export const SEA_STOCKS_FINAL = [
  { symbol: 'SE',    name: 'Sea Limited',      country: 'SG', icon: '🌊', sector: 'Technology', currency: 'USD' },
  { symbol: 'GRAB',  name: 'Grab Holdings',    country: 'SG', icon: '🚗', sector: 'Technology', currency: 'USD' },
  { symbol: 'BABA',  name: 'Alibaba',          country: 'HK', icon: '🛒', sector: 'Technology', currency: 'USD' },
  { symbol: 'JD',    name: 'JD.com',           country: 'HK', icon: '📦', sector: 'E-Commerce', currency: 'USD' },
  { symbol: 'BEKE',  name: 'KE Holdings',      country: 'HK', icon: '🏠', sector: 'Real Estate', currency: 'USD' },
  { symbol: 'IQ',    name: 'iQIYI',            country: 'HK', icon: '🎬', sector: 'Media',       currency: 'USD' },
  { symbol: 'NTES',  name: 'NetEase',          country: 'HK', icon: '🎮', sector: 'Technology',  currency: 'USD' },
  { symbol: 'TME',   name: 'Tencent Music',    country: 'HK', icon: '🎵', sector: 'Media',       currency: 'USD' },
  { symbol: 'WB',    name: 'Weibo',            country: 'HK', icon: '💬', sector: 'Social',      currency: 'USD' },
  { symbol: 'HTHT',  name: 'H World Group',    country: 'HK', icon: '🏨', sector: 'Hospitality', currency: 'USD' },
]

export { SEA_STOCKS_FINAL as SEA_STOCKS }

const COUNTRY_FLAGS: Record<string, string> = {
  SG: '🇸🇬', ID: '🇮🇩', MY: '🇲🇾', TH: '🇹🇭', VN: '🇻🇳', PH: '🇵🇭', HK: '🇭🇰',
}
export function getFlag(country: string) {
  return COUNTRY_FLAGS[country] ?? '🌏'
}

// ── Finnhub API ───────────────────────────────────────────────────────────────

function getFinnhubKey(): string {
  const key = process.env.FINNHUB_API_KEY
  if (!key) throw new Error('FINNHUB_API_KEY env var not set')
  return key
}

// Fetch a single quote from Finnhub
async function fetchFinnhubQuote(symbol: string, apiKey: string) {
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error(`Finnhub quote error: ${res.status}`)
  return res.json()
  // Returns: { c: current, d: change, dp: changePercent, h: high, l: low, o: open, pc: prevClose, t: timestamp }
}

// Fetch company profile (name, market cap, currency)
async function fetchFinnhubProfile(symbol: string, apiKey: string) {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
      { next: { revalidate: 3600 } } // cache 1hr — rarely changes
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

  // Fetch quotes in parallel (Finnhub free: 60 req/min — 10 stocks is fine)
  const results = await Promise.allSettled(
    symbols.map(async (symbol) => {
      const meta = SEA_STOCKS_FINAL.find(s => s.symbol === symbol)
      const [quote, profile] = await Promise.all([
        fetchFinnhubQuote(symbol, apiKey),
        fetchFinnhubProfile(symbol, apiKey),
      ])

      return {
        symbol,
        shortName: profile?.name ?? meta?.name ?? symbol,
        longName: profile?.name ?? meta?.name ?? symbol,
        currency: profile?.currency ?? meta?.currency ?? 'USD',
        regularMarketPrice: quote.c ?? 0,
        regularMarketChange: quote.d ?? 0,
        regularMarketChangePercent: quote.dp ?? 0,
        regularMarketPreviousClose: quote.pc ?? 0,
        regularMarketOpen: quote.o ?? 0,
        regularMarketDayHigh: quote.h ?? 0,
        regularMarketDayLow: quote.l ?? 0,
        regularMarketVolume: 0, // not in basic quote endpoint
        marketCap: profile?.marketCapitalization
          ? profile.marketCapitalization * 1e6
          : undefined,
        fiftyTwoWeekHigh: quote.h52 ?? undefined,
        fiftyTwoWeekLow: quote.l52 ?? undefined,
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

  // Calculate from/to timestamps
  const now = Math.floor(Date.now() / 1000)
  const rangeSeconds: Record<ChartRange, number> = {
    '1d':  86400,
    '5d':  5 * 86400,
    '1mo': 30 * 86400,
    '3mo': 90 * 86400,
    '6mo': 180 * 86400,
    '1y':  365 * 86400,
  }
  const resolutionMap: Record<ChartRange, string> = {
    '1d': '5', '5d': '15', '1mo': 'D', '3mo': 'D', '6mo': 'W', '1y': 'W',
  }

  const from = now - rangeSeconds[range]
  const resolution = resolutionMap[range]

  const res = await fetch(
    `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${now}&token=${apiKey}`,
    { next: { revalidate: 120 } }
  )

  if (!res.ok) throw new Error(`Finnhub chart error: ${res.status}`)
  const data = await res.json()

  if (data.s !== 'ok' || !data.t) return []

  return data.t.map((ts: number, i: number) => ({
    timestamp: ts * 1000,
    open:   data.o?.[i] ?? 0,
    high:   data.h?.[i] ?? 0,
    low:    data.l?.[i] ?? 0,
    close:  data.c?.[i] ?? 0,
    volume: data.v?.[i] ?? 0,
  })).filter((p: ChartPoint) => p.close > 0)
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

