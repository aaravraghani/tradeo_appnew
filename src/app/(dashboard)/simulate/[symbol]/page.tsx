'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { Container } from '@/components/ui/Container'
import {
  ChevronLeft, TrendingUp, TrendingDown, Minus,
  Plus, AlertCircle, CheckCircle, Loader2, Info
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChartPoint { timestamp: number; close: number; open: number; high: number; low: number }

interface StockDetail {
  symbol: string
  name: string
  country: string
  flag: string
  icon: string
  sector: string
  price: number
  change: number
  changePercent: number
  previousClose: number
  open: number
  dayHigh: number
  dayLow: number
  volume: number
  marketCap?: number
  currency: string
  pe?: number
  week52High?: number
  week52Low?: number
  chart: ChartPoint[]
}

interface UserHolding {
  quantity: number
  averagePrice: number
  pnl: number
  pnlPercent: number
}

type ChartRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y'
type OrderType = 'buy' | 'sell'

// ─── Mini SVG Chart ───────────────────────────────────────────────────────────

function PriceChart({ data, isUp }: { data: ChartPoint[]; isUp: boolean }) {
  if (!data || data.length < 2) {
    return (
      <div className="h-44 flex items-center justify-center bg-background-gray rounded-xl">
        <p className="text-xs text-text-secondary">Chart data unavailable</p>
      </div>
    )
  }

  const prices = data.map(d => d.close).filter(Boolean)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const W = 400
  const H = 160
  const pad = { top: 10, bottom: 10, left: 4, right: 4 }

  const points = prices.map((p, i) => {
    const x = pad.left + (i / (prices.length - 1)) * (W - pad.left - pad.right)
    const y = pad.top + ((max - p) / range) * (H - pad.top - pad.bottom)
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`
  const fillD = `${pathD} L ${W - pad.right},${H} L ${pad.left},${H} Z`
  const color = isUp ? '#00C853' : '#EF5350'
  const fillColor = isUp ? 'rgba(0,200,83,0.12)' : 'rgba(239,83,80,0.10)'

  return (
    <div className="h-44 mx-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#chartFill)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Current price dot */}
        {prices.length > 0 && (() => {
          const last = prices[prices.length - 1]
          const x = W - pad.right
          const y = pad.top + ((max - last) / range) * (H - pad.top - pad.bottom)
          return <circle cx={x} cy={y} r="4" fill={color} />
        })()}
      </svg>
    </div>
  )
}

// ─── Order Sheet ──────────────────────────────────────────────────────────────

function OrderSheet({
  stock,
  holding,
  cashBalance,
  onClose,
  onSuccess,
}: {
  stock: StockDetail
  holding: UserHolding | null
  cashBalance: number
  onClose: () => void
  onSuccess: () => void
}) {
  const [orderType, setOrderType] = useState<OrderType>('buy')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const cost = stock.price * quantity
  const maxBuy = Math.floor(cashBalance / stock.price)
  const maxSell = holding?.quantity ?? 0
  const canBuy = quantity >= 1 && cost <= cashBalance
  const canSell = quantity >= 1 && quantity <= maxSell

  const submit = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/trade/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: stock.symbol, type: orderType, quantity }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true, message: data.message })
        setTimeout(() => { onSuccess(); onClose() }, 1800)
      } else {
        setResult({ ok: false, message: data.error ?? 'Order failed' })
      }
    } catch {
      setResult({ ok: false, message: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-2xl p-5 max-w-lg mx-auto" style={{ maxWidth: '480px', margin: '0 auto' }}>
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

        {/* Stock info */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center text-xl"
               style={{ backgroundColor: 'rgba(0,200,83,0.06)' }}>
            {stock.icon}
          </div>
          <div>
            <p className="font-bold text-text-primary">{stock.name}</p>
            <p className="text-sm text-text-secondary">{stock.symbol} · ${stock.price.toFixed(2)}</p>
          </div>
        </div>

        {/* Buy / Sell toggle */}
        <div className="flex bg-background-gray rounded-xl p-1 mb-5">
          <button
            onClick={() => { setOrderType('buy'); setQuantity(1); setResult(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${orderType === 'buy' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary'}`}
          >
            Buy
          </button>
          <button
            onClick={() => { setOrderType('sell'); setQuantity(1); setResult(null) }}
            disabled={maxSell === 0}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-40 ${orderType === 'sell' ? 'bg-red-500 text-white shadow-sm' : 'text-text-secondary'}`}
          >
            Sell {maxSell > 0 && `(${maxSell})`}
          </button>
        </div>

        {/* Quantity picker */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-text-primary">Shares</p>
            <p className="text-xs text-text-secondary">
              {orderType === 'buy' ? `Max: ${maxBuy}` : `Max: ${maxSell}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-xl bg-background-gray flex items-center justify-center hover:bg-divider transition-colors"
            >
              <Minus size={16} className="text-text-primary" />
            </button>
            <input
              type="number"
              value={quantity}
              min={1}
              max={orderType === 'buy' ? maxBuy : maxSell}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 text-center text-xl font-bold text-text-primary bg-background-gray rounded-xl py-2.5 border border-divider focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => setQuantity(q => q + 1)}
              disabled={orderType === 'buy' ? quantity >= maxBuy : quantity >= maxSell}
              className="w-10 h-10 rounded-xl bg-background-gray flex items-center justify-center hover:bg-divider transition-colors disabled:opacity-30"
            >
              <Plus size={16} className="text-text-primary" />
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-background-gray rounded-xl p-4 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Price per share</span>
            <span className="font-semibold text-text-primary">${stock.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Shares</span>
            <span className="font-semibold text-text-primary">× {quantity}</span>
          </div>
          <div className="border-t border-divider pt-2 flex justify-between">
            <span className="text-sm font-bold text-text-primary">Total</span>
            <span className={`text-base font-bold ${orderType === 'buy' ? 'text-primary' : 'text-red-500'}`}>
              {orderType === 'buy' ? '-' : '+'}${cost.toFixed(2)}
            </span>
          </div>
          {orderType === 'buy' && (
            <p className="text-xs text-text-secondary">
              Cash after: ${(cashBalance - cost).toFixed(2)}
            </p>
          )}
          {orderType === 'sell' && holding && (
            <p className={`text-xs font-semibold ${cost - holding.averagePrice * quantity >= 0 ? 'text-primary' : 'text-red-500'}`}>
              P&L on sale: {cost - holding.averagePrice * quantity >= 0 ? '+' : ''}${(cost - holding.averagePrice * quantity).toFixed(2)}
            </p>
          )}
        </div>

        {/* Result feedback */}
        {result && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium ${result.ok ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-600'}`}>
            {result.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {result.message}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={submit}
          disabled={loading || (orderType === 'buy' ? !canBuy : !canSell)}
          className={`w-full py-3.5 rounded-xl text-white font-bold text-base transition-all disabled:opacity-40 ${orderType === 'buy' ? 'bg-primary hover:bg-primary-dark' : 'bg-red-500 hover:bg-red-600'}`}
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin mx-auto" />
          ) : (
            `${orderType === 'buy' ? 'Buy' : 'Sell'} ${quantity} Share${quantity > 1 ? 's' : ''}`
          )}
        </button>

        <p className="text-xs text-text-secondary text-center mt-3">
          Virtual trading only — no real money involved
        </p>
      </div>
    </div>
  )
}

// ─── Main Stock Detail Page ───────────────────────────────────────────────────

export default function StockDetailPage() {
  const router = useRouter()
  const params = useParams()
  const symbol = decodeURIComponent(params?.symbol as string)

  const [stock, setStock] = useState<StockDetail | null>(null)
  const [holding, setHolding] = useState<UserHolding | null>(null)
  const [cashBalance, setCashBalance] = useState(100000)
  const [range, setRange] = useState<ChartRange>('1mo')
  const [loading, setLoading] = useState(true)
  const [showOrder, setShowOrder] = useState(false)

  const RANGES: ChartRange[] = ['1d', '5d', '1mo', '3mo', '6mo', '1y']

  const fetchData = useCallback(async (r: ChartRange = range) => {
    setLoading(true)
    const [stockRes, portfolioRes] = await Promise.all([
      fetch(`/api/trade/stocks/${encodeURIComponent(symbol)}?range=${r}`).then(r => r.json()).catch(() => null),
      fetch('/api/trade/portfolio').then(r => r.json()).catch(() => null),
    ])
    if (stockRes && !stockRes.error) setStock(stockRes)
    if (portfolioRes) {
      setCashBalance(portfolioRes.cashBalance ?? 100000)
      const h = portfolioRes.holdings?.find((h: any) => h.symbol === symbol)
      setHolding(h ? { quantity: h.quantity, averagePrice: h.averagePrice, pnl: h.pnl, pnlPercent: h.pnlPercent } : null)
    }
    setLoading(false)
  }, [symbol, range])

  useEffect(() => { fetchData() }, [])

  const changeRange = (r: ChartRange) => {
    setRange(r)
    fetchData(r)
  }

  if (loading || !stock) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    )
  }

  const isUp = stock.changePercent >= 0

  return (
    <div className="min-h-screen bg-background-gray pb-32">
      <DashboardHeader userName="" />

      {/* Back + name */}
      <div className="bg-white border-b border-divider px-4 py-4">
        <button
          onClick={() => router.push('/simulate')}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-3"
        >
          <ChevronLeft size={16} />
          Back to Markets
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'rgba(0,200,83,0.06)' }}>
              {stock.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-text-primary">{stock.name}</h1>
                <span className="text-base">{stock.flag}</span>
              </div>
              <p className="text-xs text-text-secondary">{stock.symbol} · {stock.sector}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-text-primary">
              {stock.currency === 'IDR'
                ? `Rp ${Math.round(stock.price).toLocaleString('id-ID')}`
                : `$${stock.price.toFixed(2)}`}
            </p>
            <div className={`flex items-center justify-end gap-1 text-sm font-semibold ${isUp ? 'text-primary' : 'text-red-500'}`}>
              {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {isUp ? '+' : ''}{stock.change.toFixed(2)} ({isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Your position (if holding) */}
      {holding && (
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-card p-4">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Your Position</p>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-text-secondary">Shares owned</p>
              <p className="text-lg font-bold text-text-primary">{holding.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Avg. buy price</p>
              <p className="text-lg font-bold text-text-primary">${holding.averagePrice.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Total P&L</p>
              <p className={`text-lg font-bold ${holding.pnl >= 0 ? 'text-primary' : 'text-red-500'}`}>
                {holding.pnl >= 0 ? '+' : ''}${holding.pnl.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="mt-4 bg-white mx-4 rounded-2xl shadow-card pt-4 pb-3">
        {/* Range picker */}
        <div className="flex gap-1 px-4 mb-3">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => changeRange(r)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === r
                  ? isUp ? 'bg-primary text-white' : 'bg-red-500 text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
        <PriceChart data={stock.chart} isUp={isUp} />
      </div>

      {/* Stats grid */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-card p-4">
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Key Stats</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Open', value: `$${stock.open.toFixed(2)}` },
            { label: 'Prev. Close', value: `$${stock.previousClose.toFixed(2)}` },
            { label: 'Day High', value: `$${stock.dayHigh.toFixed(2)}` },
            { label: 'Day Low', value: `$${stock.dayLow.toFixed(2)}` },
            { label: '52W High', value: stock.week52High ? `$${stock.week52High.toFixed(2)}` : '—' },
            { label: '52W Low', value: stock.week52Low ? `$${stock.week52Low.toFixed(2)}` : '—' },
            { label: 'Volume', value: stock.volume >= 1e6 ? `${(stock.volume / 1e6).toFixed(1)}M` : stock.volume.toLocaleString() },
            { label: 'P/E Ratio', value: stock.pe ? stock.pe.toFixed(1) : '—' },
            { label: 'Market Cap', value: stock.marketCap ? (stock.marketCap >= 1e12 ? `$${(stock.marketCap / 1e12).toFixed(1)}T` : `$${(stock.marketCap / 1e9).toFixed(1)}B`) : '—' },
            { label: 'Currency', value: stock.currency },
          ].map(stat => (
            <div key={stat.label} className="bg-background-gray rounded-lg px-3 py-2.5">
              <p className="text-xs text-text-secondary mb-0.5">{stat.label}</p>
              <p className="text-sm font-bold text-text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Learning link */}
      <div className="mx-4 mt-4 bg-primary/5 rounded-2xl p-4 flex items-start gap-3">
        <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-primary leading-relaxed">
          <span className="font-semibold">This is paper trading.</span> You're practicing with $100,000 virtual money. No real money is at risk. Use this to learn before investing for real.
        </p>
      </div>

      {/* Fixed bottom Buy/Sell buttons */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-white border-t border-divider z-30"
           style={{ maxWidth: '480px', margin: '0 auto', left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
        <div className="flex gap-3 pt-3">
          <button
            onClick={() => setShowOrder(true)}
            className="flex-1 py-3.5 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-colors"
          >
            Buy
          </button>
          {holding && (
            <button
              onClick={() => setShowOrder(true)}
              className="flex-1 py-3.5 rounded-xl bg-red-500 text-white font-bold text-base hover:bg-red-600 transition-colors"
            >
              Sell
            </button>
          )}
        </div>
        <p className="text-xs text-text-secondary text-center mt-1.5">
          Cash available: ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Order sheet */}
      {showOrder && (
        <OrderSheet
          stock={stock}
          holding={holding}
          cashBalance={cashBalance}
          onClose={() => setShowOrder(false)}
          onSuccess={() => fetchData()}
        />
      )}

      <BottomNav />
    </div>
  )
}


