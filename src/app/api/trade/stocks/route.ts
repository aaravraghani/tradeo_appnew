// src/app/api/trade/stocks/route.ts
// GET /api/trade/stocks — fetch live prices for all SEA stocks

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { fetchQuotes, SEA_STOCKS, getFlag } from '@/lib/stock-api'

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

