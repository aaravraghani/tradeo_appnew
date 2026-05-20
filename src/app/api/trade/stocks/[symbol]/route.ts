// src/app/api/trade/stocks/[symbol]/route.ts

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
      fetchChart(symbol, range).catch(() => []),
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


