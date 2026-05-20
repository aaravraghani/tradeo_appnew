// src/app/api/trade/stocks/route.ts
// GET /api/trade/stocks — fetch live prices for all SEA stocks

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { fetchQuotes, SEA_STOCKS, getFlag } from '@/lib/yahoo-finance'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const symbols = SEA_STOCKS.map(s => s.symbol)

    let quotes
    try {
      quotes = await fetchQuotes(symbols)
    } catch (e) {
      console.warn('Yahoo Finance fetch failed, using mock data:', e)
      // Fallback mock prices if Yahoo is down
      quotes = SEA_STOCKS.map(s => ({
        symbol: s.symbol,
        shortName: s.name,
        longName: s.name,
        currency: 'USD',
        regularMarketPrice: Math.random() * 100 + 10,
        regularMarketChange: (Math.random() - 0.5) * 5,
        regularMarketChangePercent: (Math.random() - 0.5) * 5,
        regularMarketPreviousClose: 50,
        regularMarketOpen: 50,
        regularMarketDayHigh: 55,
        regularMarketDayLow: 45,
        regularMarketVolume: Math.floor(Math.random() * 10000000),
        marketCap: undefined as number | undefined,
        fiftyTwoWeekHigh: undefined as number | undefined,
        fiftyTwoWeekLow: undefined as number | undefined,
        trailingPE: undefined as number | undefined,
      }))
    }

    // Merge static metadata with live prices
    const stocks = SEA_STOCKS.map(meta => {
      const q = quotes.find(q => q.symbol === meta.symbol)
      return {
        symbol: meta.symbol,
        name: meta.name,
        country: meta.country,
        flag: getFlag(meta.country),
        icon: meta.icon,
        sector: meta.sector,
        price: q?.regularMarketPrice ?? 0,
        change: q?.regularMarketChange ?? 0,
        changePercent: q?.regularMarketChangePercent ?? 0,
        previousClose: q?.regularMarketPreviousClose ?? 0,
        dayHigh: q?.regularMarketDayHigh ?? 0,
        dayLow: q?.regularMarketDayLow ?? 0,
        volume: q?.regularMarketVolume ?? 0,
        marketCap: q?.marketCap,
        currency: q?.currency ?? 'USD',
        pe: q?.trailingPE,
        week52High: q?.fiftyTwoWeekHigh,
        week52Low: q?.fiftyTwoWeekLow,
      }
    })

    return NextResponse.json({ stocks })
  } catch (error) {
    console.error('GET /api/trade/stocks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


// ============================================================
// src/app/api/trade/stocks/[symbol]/route.ts
// GET /api/trade/stocks/:symbol — single stock + chart data
// ============================================================
// Create as a SEPARATE FILE. Content:

/*
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { fetchQuotes, fetchChart, SEA_STOCKS, getFlag } from '@/lib/yahoo-finance'
import type { ChartRange } from '@/lib/yahoo-finance'

export async function GET(
  req: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const range = (searchParams.get('range') ?? '1mo') as ChartRange

    const symbol = decodeURIComponent(params.symbol)
    const meta = SEA_STOCKS.find(s => s.symbol === symbol)

    const [quotes, chartData] = await Promise.all([
      fetchQuotes([symbol]),
      fetchChart(symbol, range),
    ])

    const q = quotes[0]
    if (!q) return NextResponse.json({ error: 'Stock not found' }, { status: 404 })

    return NextResponse.json({
      symbol: q.symbol,
      name: meta?.name ?? q.shortName,
      country: meta?.country ?? 'SG',
      flag: getFlag(meta?.country ?? 'SG'),
      icon: meta?.icon ?? '📈',
      sector: meta?.sector ?? 'Unknown',
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      previousClose: q.regularMarketPreviousClose,
      open: q.regularMarketOpen,
      dayHigh: q.regularMarketDayHigh,
      dayLow: q.regularMarketDayLow,
      volume: q.regularMarketVolume,
      marketCap: q.marketCap,
      currency: q.currency,
      pe: q.trailingPE,
      week52High: q.fiftyTwoWeekHigh,
      week52Low: q.fiftyTwoWeekLow,
      chart: chartData,
    })
  } catch (error) {
    console.error('GET /api/trade/stocks/[symbol] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
*/


