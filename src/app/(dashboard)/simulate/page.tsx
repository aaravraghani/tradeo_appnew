'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { Container } from '@/components/ui/Container'
import {
  TrendingUp, TrendingDown, RefreshCw, ChevronRight,
  DollarSign, BarChart2, Wallet, Search
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stock {
  symbol: string
  name: string
  country: string
  flag: string
  icon: string
  sector: string
  price: number
  change: number
  changePercent: number
  currency: string
  volume: number
  marketCap?: number
}

interface Holding {
  id: string
  symbol: string
  companyName: string
  quantity: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  pnl: number
  pnlPercent: number
}

interface Portfolio {
  cashBalance: number
  totalValue: number
  totalPnL: number
  totalPnLPercent: number
  holdings: Holding[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, currency = 'USD') {
  if (currency === 'IDR') return `Rp ${Math.round(n).toLocaleString('id-ID')}`
  return `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function pctColor(n: number) {
  return n >= 0 ? 'text-primary' : 'text-red-500'
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-gray-200 rounded w-1/3" />
        <div className="h-2.5 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="text-right space-y-1.5">
        <div className="h-3.5 bg-gray-200 rounded w-16" />
        <div className="h-2.5 bg-gray-100 rounded w-12 ml-auto" />
      </div>
    </div>
  )
}

// ─── Portfolio Header Card ────────────────────────────────────────────────────

function PortfolioCard({ portfolio, loading }: { portfolio: Portfolio | null; loading: boolean }) {
  if (loading || !portfolio) {
    return (
      <div className="rounded-2xl p-5 animate-pulse mx-4 mt-4"
           style={{ background: 'linear-gradient(135deg, #1A1A2E, #0A3D2B)' }}>
        <div className="h-3 bg-white/20 rounded w-1/4 mb-3" />
        <div className="h-8 bg-white/20 rounded w-1/2 mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-white/10 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const isUp = portfolio.totalPnL >= 0

  return (
    <div
      className="rounded-2xl p-5 mx-4 mt-4"
      style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #0A3D2B 100%)' }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
        Virtual Portfolio · Paper Trading
      </p>
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-3xl font-bold text-white">
            ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className={`flex items-center gap-1 mt-1 text-sm font-semibold ${isUp ? 'text-primary' : 'text-red-400'}`}>
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isUp ? '+' : '-'}${Math.abs(portfolio.totalPnL).toFixed(2)} ({isUp ? '+' : ''}{portfolio.totalPnLPercent.toFixed(2)}%)
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>vs $100,000 start</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Cash', value: `$${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: <Wallet size={14} /> },
          { label: 'Invested', value: `$${(portfolio.totalValue - portfolio.cashBalance).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: <BarChart2 size={14} /> },
          { label: 'Positions', value: portfolio.holdings.length.toString(), icon: <DollarSign size={14} /> },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-1 mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {stat.icon}
              <p className="text-xs">{stat.label}</p>
            </div>
            <p className="text-sm font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Holdings Section ─────────────────────────────────────────────────────────

function HoldingsSection({ holdings, onPress }: { holdings: Holding[]; onPress: (symbol: string) => void }) {
  if (holdings.length === 0) return null

  return (
    <div className="mt-5">
      <p className="text-xs font-bold text-text-secondary uppercase tracking-wider px-4 mb-2">
        Your Positions
      </p>
      <div className="bg-white rounded-2xl shadow-card mx-4 divide-y divide-divider overflow-hidden">
        {holdings.map(h => {
          const isUp = h.pnl >= 0
          return (
            <button
              key={h.id}
              onClick={() => onPress(h.symbol)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-background-gray transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                📈
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">{h.companyName}</p>
                <p className="text-xs text-text-secondary">{h.quantity} shares · avg ${h.averagePrice.toFixed(2)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-text-primary">${h.totalValue.toFixed(2)}</p>
                <p className={`text-xs font-semibold ${isUp ? 'text-primary' : 'text-red-500'}`}>
                  {isUp ? '+' : ''}{h.pnl.toFixed(2)} ({isUp ? '+' : ''}{h.pnlPercent.toFixed(2)}%)
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Stock Row ────────────────────────────────────────────────────────────────

function StockRow({ stock, onPress }: { stock: Stock; onPress: () => void }) {
  const isUp = stock.changePercent >= 0
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-background-gray transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center text-xl flex-shrink-0"
           style={{ backgroundColor: 'rgba(0,200,83,0.06)' }}>
        {stock.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-bold text-text-primary truncate">{stock.name}</p>
          <span className="text-xs">{stock.flag}</span>
        </div>
        <p className="text-xs text-text-secondary">{stock.symbol} · {stock.sector}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-text-primary">
          {stock.currency === 'IDR'
            ? `Rp ${Math.round(stock.price).toLocaleString('id-ID')}`
            : `$${stock.price.toFixed(2)}`}
        </p>
        <div className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${isUp ? 'text-primary' : 'text-red-500'}`}>
          {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </div>
      </div>
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SimulatePage() {
  const router = useRouter()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loadingStocks, setLoadingStocks] = useState(true)
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all')

  const fetchAll = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    const [stocksRes, portfolioRes] = await Promise.all([
      fetch('/api/trade/stocks').then(r => r.json()).catch(() => ({ stocks: [] })),
      fetch('/api/trade/portfolio').then(r => r.json()).catch(() => null),
    ])
    setStocks(stocksRes.stocks ?? [])
    setPortfolio(portfolioRes)
    setLoadingStocks(false)
    setLoadingPortfolio(false)
    if (showRefresh) setRefreshing(false)
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = stocks
    .filter(s => {
      if (search) return s.name.toLowerCase().includes(search.toLowerCase()) || s.symbol.toLowerCase().includes(search.toLowerCase())
      if (filter === 'gainers') return s.changePercent >= 0
      if (filter === 'losers') return s.changePercent < 0
      return true
    })
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))

  return (
    <div className="min-h-screen bg-background-gray pb-24">
      <DashboardHeader userName="" />

      {/* Page header */}
      <div className="bg-white border-b border-divider px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Paper Trading</h1>
            <p className="text-xs text-text-secondary">Practice with $100,000 virtual money</p>
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-background-gray transition-colors text-text-secondary"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin text-primary' : ''} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search stocks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-background-gray rounded-xl border border-divider focus:outline-none focus:border-primary"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {(['all', 'gainers', 'losers'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f
                  ? f === 'losers' ? 'bg-red-500 text-white' : 'bg-primary text-white'
                  : 'bg-background-gray text-text-secondary hover:text-text-primary'
              }`}
            >
              {f === 'all' ? 'All' : f === 'gainers' ? '📈 Gainers' : '📉 Losers'}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio card */}
      <PortfolioCard portfolio={portfolio} loading={loadingPortfolio} />

      {/* Holdings */}
      {!loadingPortfolio && portfolio && (
        <HoldingsSection
          holdings={portfolio.holdings}
          onPress={symbol => router.push(`/simulate/${encodeURIComponent(symbol)}`)}
        />
      )}

      {/* Stocks list */}
      <div className="mt-5 mx-4">
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
          SEA Markets
        </p>
        <div className="bg-white rounded-2xl shadow-card overflow-hidden divide-y divide-divider">
          {loadingStocks
            ? [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
            : filtered.length === 0
            ? (
              <div className="text-center py-10 text-text-secondary text-sm">
                No stocks found for "{search}"
              </div>
            )
            : filtered.map(stock => (
              <StockRow
                key={stock.symbol}
                stock={stock}
                onPress={() => router.push(`/simulate/${encodeURIComponent(stock.symbol)}`)}
              />
            ))
          }
        </div>
      </div>

      <BottomNav />
    </div>
  )
}


