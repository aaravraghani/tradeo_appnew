// src/app/api/trade/order/route.ts
// POST /api/trade/order — execute a buy or sell order

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchQuotes, SEA_STOCKS } from '@/lib/stock-api'
import { z } from 'zod'

const orderSchema = z.object({
  symbol: z.string().min(1),
  type: z.enum(['buy', 'sell']),
  quantity: z.number().int().positive(),
})

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const result = orderSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid order', details: result.error.flatten() }, { status: 400 })
    }

    const { symbol, type, quantity } = result.data

    // Validate symbol is in our supported list
    const stockMeta = SEA_STOCKS.find(s => s.symbol === symbol)
    if (!stockMeta) return NextResponse.json({ error: 'Stock not supported' }, { status: 400 })

    // Get live price
    const quotes = await fetchQuotes([symbol])
    const quote = quotes[0]
    if (!quote || quote.regularMarketPrice <= 0) {
      return NextResponse.json({ error: 'Could not fetch current price' }, { status: 503 })
    }

    const price = quote.regularMarketPrice
    const totalCost = price * quantity

    // Get user + portfolio
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        portfolio: {
          select: {
            id: true,
            cashBalance: true,
            holdings: {
              where: { symbol },
              select: { id: true, quantity: true, averagePrice: true },
            },
          },
        },
        profile: { select: { id: true, totalTradesMade: true } },
      },
    })

    if (!user?.portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })

    const portfolio = user.portfolio
    const existingHolding = portfolio.holdings[0]

    if (type === 'buy') {
      // Check sufficient cash
      if (portfolio.cashBalance < totalCost) {
        return NextResponse.json({
          error: `Insufficient balance. You need $${totalCost.toFixed(2)} but have $${portfolio.cashBalance.toFixed(2)}.`
        }, { status: 400 })
      }

      const newCash = portfolio.cashBalance - totalCost

      if (existingHolding) {
        // Average down/up existing position
        const newQuantity = existingHolding.quantity + quantity
        const newAvgPrice = (existingHolding.averagePrice * existingHolding.quantity + price * quantity) / newQuantity
        const newTotalValue = price * newQuantity
        const newPnl = newTotalValue - newAvgPrice * newQuantity
        const newPnlPercent = ((price - newAvgPrice) / newAvgPrice) * 100

        await prisma.$transaction([
          prisma.holding.update({
            where: { id: existingHolding.id },
            data: {
              quantity: newQuantity,
              averagePrice: newAvgPrice,
              currentPrice: price,
              totalValue: newTotalValue,
              pnl: newPnl,
              pnlPercent: newPnlPercent,
            },
          }),
          prisma.portfolio.update({
            where: { id: portfolio.id },
            data: { cashBalance: newCash },
          }),
          prisma.transaction.create({
            data: {
              userId: user.id,
              type: 'buy',
              symbol,
              companyName: stockMeta.name,
              quantity,
              price,
              totalAmount: totalCost,
              status: 'completed',
            },
          }),
        ])
      } else {
        // New position
        const pnl = 0
        const pnlPercent = 0

        await prisma.$transaction([
          prisma.holding.create({
            data: {
              portfolioId: portfolio.id,
              symbol,
              companyName: stockMeta.name,
              quantity,
              averagePrice: price,
              currentPrice: price,
              totalValue: totalCost,
              pnl,
              pnlPercent,
            },
          }),
          prisma.portfolio.update({
            where: { id: portfolio.id },
            data: { cashBalance: newCash },
          }),
          prisma.transaction.create({
            data: {
              userId: user.id,
              type: 'buy',
              symbol,
              companyName: stockMeta.name,
              quantity,
              price,
              totalAmount: totalCost,
              status: 'completed',
            },
          }),
        ])
      }

      // Award XP for first trade
      if (user.profile) {
        await prisma.userProfile.update({
          where: { id: user.profile.id },
          data: { totalTradesMade: { increment: 1 } },
        })
      }

      return NextResponse.json({
        success: true,
        message: `Bought ${quantity} share${quantity > 1 ? 's' : ''} of ${stockMeta.name} at $${price.toFixed(2)}`,
        price,
        totalCost,
        newCashBalance: newCash,
      })

    } else {
      // SELL
      if (!existingHolding) {
        return NextResponse.json({ error: `You don't own any ${symbol} shares.` }, { status: 400 })
      }
      if (existingHolding.quantity < quantity) {
        return NextResponse.json({
          error: `You only have ${existingHolding.quantity} shares. Cannot sell ${quantity}.`
        }, { status: 400 })
      }

      const proceeds = price * quantity
      const newCash = portfolio.cashBalance + proceeds
      const newQuantity = existingHolding.quantity - quantity

      await prisma.$transaction([
        // Remove or reduce holding
        newQuantity === 0
          ? prisma.holding.delete({ where: { id: existingHolding.id } })
          : prisma.holding.update({
              where: { id: existingHolding.id },
              data: {
                quantity: newQuantity,
                currentPrice: price,
                totalValue: price * newQuantity,
                pnl: (price - existingHolding.averagePrice) * newQuantity,
                pnlPercent: ((price - existingHolding.averagePrice) / existingHolding.averagePrice) * 100,
              },
            }),
        prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { cashBalance: newCash },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'sell',
            symbol,
            companyName: stockMeta.name,
            quantity,
            price,
            totalAmount: proceeds,
            status: 'completed',
          },
        }),
      ])

      if (user.profile) {
        await prisma.userProfile.update({
          where: { id: user.profile.id },
          data: { totalTradesMade: { increment: 1 } },
        })
      }

      const pnlOnSale = (price - existingHolding.averagePrice) * quantity

      return NextResponse.json({
        success: true,
        message: `Sold ${quantity} share${quantity > 1 ? 's' : ''} of ${stockMeta.name} at $${price.toFixed(2)}`,
        price,
        proceeds,
        pnlOnSale,
        newCashBalance: newCash,
      })
    }
  } catch (error) {
    console.error('POST /api/trade/order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
