// src/lib/yahoo-finance.ts
// Fetches real-time stock data via Yahoo Finance v8 API (no key required)

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

// ── SEA stocks we support ────────────────────────────────────────────────────
export const SEA_STOCKS = [
  { symbol: 'SE',       name: 'Sea Limited',       country: 'SG', icon: '🌊', sector: 'Technology' },
  { symbol: 'GRAB',     name: 'Grab Holdings',     country: 'SG', icon: '🚗', sector: 'Technology' },
  { symbol: 'GOTO.JK',  name: 'GoTo Group',        country: 'ID', icon: '🛵', sector: 'Technology' },
  { symbol: 'TLKM.JK',  name: 'Telkom Indonesia',  country: 'ID', icon: '📡', sector: 'Telecom' },
  { symbol: 'BBCA.JK',  name: 'Bank BCA',          country: 'ID', icon: '🏦', sector: 'Banking' },
  { symbol: 'D05.SI',   name: 'DBS Group',         country: 'SG', icon: '🏦', sector: 'Banking' },
  { symbol: 'Z74.SI',   name: 'Singtel',           country: 'SG', icon: '📱', sector: 'Telecom' },
  { symbol: 'MBBM.KL',  name: 'Maybank',           country: 'MY', icon: '🏦', sector: 'Banking' },
  { symbol: 'CPALL.BK', name: 'CP All (7-Eleven)', country: 'TH', icon: '🏪', sector: 'Retail' },
  { symbol: 'VCB.HN',   name: 'Vietcombank',       country: 'VN', icon: '🏦', sector: 'Banking' },
]

const COUNTRY_FLAGS: Record<string, string> = {
  SG: '🇸🇬', ID: '🇮🇩', MY: '🇲🇾', TH: '🇹🇭', VN: '🇻🇳', PH: '🇵🇭',
}

export function getFlag(country: string) {
  return COUNTRY_FLAGS[country] ?? '🌏'
}

// ── Fetch quote(s) ────────────────────────────────────────────────────────────
// ── Get a cookie + crumb from Yahoo (required since 2024) ───────────────────
async function getYahooCrumb(): Promise<{ cookie: string; crumb: string } | null> {
  try {
    // Step 1: hit the consent page to get a cookie
    const cookieRes = await fetch('https://fc.yahoo.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'manual',
    })
    const rawCookie = cookieRes.headers.get('set-cookie') ?? ''
    const cookie = rawCookie.split(';')[0]

    // Step 2: use cookie to get a crumb
    const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Cookie': cookie,
      },
    })
    const crumb = await crumbRes.text()
    if (!crumb || crumb.includes('<')) return null
    return { cookie, crumb }
  } catch {
    return null
  }
}

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://finance.yahoo.com',
  'Referer': 'https://finance.yahoo.com/',
}

export async function fetchQuotes(symbols: string[]): Promise<StockQuote[]> {
  const joined = symbols.join(',')

  // Try v8 endpoint first (more reliable, no crumb needed on some regions)
  const v8Url = `https://query2.finance.yahoo.com/v8/finance/spark?symbols=${encodeURIComponent(joined)}&range=1d&interval=1d`

  // Primary: v7 with crumb
  const auth = await getYahooCrumb()
  const fields = 'shortName,longName,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,regularMarketVolume,marketCap,fiftyTwoWeekHigh,fiftyTwoWeekLow,trailingPE,currency'

  const url = auth
    ? `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(joined)}&fields=${fields}&crumb=${encodeURIComponent(auth.crumb)}`
    : `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(joined)}&fields=${fields}`

  const headers: Record<string, string> = { ...YAHOO_HEADERS }
  if (auth?.cookie) headers['Cookie'] = auth.cookie

  const res = await fetch(url, {
    headers,
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error(`Yahoo Finance API error: ${res.status}`)

  const data = await res.json()
  const results = data?.quoteResponse?.result ?? []

  return results.map((q: any) => ({
    symbol: q.symbol,
    shortName: q.shortName ?? q.symbol,
    longName: q.longName ?? q.shortName ?? q.symbol,
    currency: q.currency ?? 'USD',
    regularMarketPrice: q.regularMarketPrice ?? 0,
    regularMarketChange: q.regularMarketChange ?? 0,
    regularMarketChangePercent: q.regularMarketChangePercent ?? 0,
    regularMarketPreviousClose: q.regularMarketPreviousClose ?? 0,
    regularMarketOpen: q.regularMarketOpen ?? 0,
    regularMarketDayHigh: q.regularMarketDayHigh ?? 0,
    regularMarketDayLow: q.regularMarketDayLow ?? 0,
    regularMarketVolume: q.regularMarketVolume ?? 0,
    marketCap: q.marketCap,
    fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: q.fiftyTwoWeekLow,
    trailingPE: q.trailingPE,
  }))
}

// ── Fetch chart data ──────────────────────────────────────────────────────────
export type ChartRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y'

export async function fetchChart(symbol: string, range: ChartRange = '1mo'): Promise<ChartPoint[]> {
  const intervalMap: Record<ChartRange, string> = {
    '1d': '5m', '5d': '15m', '1mo': '1d',
    '3mo': '1d', '6mo': '1wk', '1y': '1wk',
  }
  const interval = intervalMap[range]

  const auth = await getYahooCrumb()
  const base = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`
  const url = auth ? `${base}&crumb=${encodeURIComponent(auth.crumb)}` : base

  const headers: Record<string, string> = { ...YAHOO_HEADERS }
  if (auth?.cookie) headers['Cookie'] = auth.cookie

  const res = await fetch(url, {
    headers,
    next: { revalidate: 120 },
  })

  if (!res.ok) throw new Error(`Chart API error: ${res.status}`)

  const data = await res.json()
  const result = data?.chart?.result?.[0]
  if (!result) return []

  const timestamps: number[] = result.timestamp ?? []
  const quotes = result.indicators?.quote?.[0] ?? {}

  return timestamps.map((ts, i) => ({
    timestamp: ts * 1000,
    open: quotes.open?.[i] ?? 0,
    high: quotes.high?.[i] ?? 0,
    low: quotes.low?.[i] ?? 0,
    close: quotes.close?.[i] ?? 0,
    volume: quotes.volume?.[i] ?? 0,
  })).filter(p => p.close > 0)
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function formatPrice(price: number, currency: string = 'USD'): string {
  if (currency === 'IDR') return `Rp ${(price).toLocaleString('id-ID')}`
  if (currency === 'SGD') return `S$${price.toFixed(2)}`
  if (currency === 'MYR') return `RM ${price.toFixed(2)}`
  if (currency === 'THB') return `฿${price.toFixed(2)}`
  if (currency === 'VND') return `₫${price.toLocaleString('vi-VN')}`
  return `$${price.toFixed(2)}`
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`
  return `$${cap.toLocaleString()}`
}


