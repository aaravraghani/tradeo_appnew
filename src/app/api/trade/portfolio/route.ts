// src/app/api/trade/portfolio/route.ts
// GET /api/trade/portfolio — user's portfolio with live prices

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchQuotes } from '@/lib/stock-api'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        portfolio: {
          select: {
            id: true,
            cashBalance: true,
            totalValue: true,
            totalPnL: true,
            totalPnLPercent: true,
            holdings: {
              select: {
                id: true,
                symbol: true,
                companyName: true,
                quantity: true,
                averagePrice: true,
                currentPrice: true,
                totalValue: true,
                pnl: true,
                pnlPercent: true,
              },
            },
          },
        },
      },
    })

    if (!user?.portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })

    const portfolio = user.portfolio

    // Refresh live prices for holdings
    if (portfolio.holdings.length > 0) {
      const symbols = portfolio.holdings.map(h => h.symbol)
      try {
        const quotes = await fetchQuotes(symbols)
        const priceMap = new Map(quotes.map(q => [q.symbol, q.regularMarketPrice]))

        // Update holdings with live prices
        let totalHoldingsValue = 0
        const updatedHoldings = await Promise.all(
          portfolio.holdings.map(async h => {
            const livePrice = priceMap.get(h.symbol) ?? h.currentPrice
            const totalValue = livePrice * h.quantity
            const pnl = totalValue - h.averagePrice * h.quantity
            const pnlPercent = h.averagePrice > 0
              ? ((livePrice - h.averagePrice) / h.averagePrice) * 100
              : 0

            totalHoldingsValue += totalValue

            // Update in DB
            await prisma.holding.update({
              where: { id: h.id },
              data: { currentPrice: livePrice, totalValue, pnl, pnlPercent },
            })

            return { ...h, currentPrice: livePrice, totalValue, pnl, pnlPercent }
          })
        )

        // Update portfolio totals
        const newTotalValue = portfolio.cashBalance + totalHoldingsValue
        const initialValue = 100000
        const totalPnL = newTotalValue - initialValue
        const totalPnLPercent = ((newTotalValue - initialValue) / initialValue) * 100

        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { totalValue: newTotalValue, totalPnL, totalPnLPercent },
        })

        return NextResponse.json({
          cashBalance: portfolio.cashBalance,
          totalValue: newTotalValue,
          totalPnL,
          totalPnLPercent,
          holdings: updatedHoldings,
        })
      } catch {
        // Return stale data if live prices fail
      }
    }

    return NextResponse.json({
      cashBalance: portfolio.cashBalance,
      totalValue: portfolio.totalValue,
      totalPnL: portfolio.totalPnL,
      totalPnLPercent: portfolio.totalPnLPercent,
      holdings: portfolio.holdings,
    })
  } catch (error) {
    console.error('GET /api/trade/portfolio error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
