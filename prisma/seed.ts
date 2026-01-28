import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // ==================== MODULES & LESSONS ====================
  
  console.log('📚 Creating modules and lessons...')

  const module1 = await prisma.module.create({
    data: {
      title: 'Stock Market Basics',
      description: 'Learn the fundamentals of the stock market and how it works',
      icon: '📊',
      order: 1,
      difficulty: 'beginner',
      estimatedTime: 45,
      xpReward: 200,
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'What is the Stock Market?',
            content: `# What is the Stock Market?

The stock market is a place where people buy and sell shares of companies. When you buy a share, you own a small piece of that company!

## Key Concepts:
- **Stock**: A share of ownership in a company
- **Share Price**: The current value of one share
- **Market**: Where stocks are bought and sold

Think of it like a marketplace, but instead of buying fruits or vegetables, you're buying pieces of companies like GoTo, Grab, or Sea Limited!`,
            order: 1,
            duration: 5,
            xpReward: 50,
            type: 'text',
            isPublished: true,
          },
          {
            title: 'Why Do Companies Sell Shares?',
            content: `# Why Do Companies Sell Shares?

Companies sell shares to raise money for growth. Instead of taking a loan, they let people invest in their company.

## Benefits for Companies:
- Raise capital without debt
- Fund expansion and growth
- Increase company visibility

## Benefits for You:
- Own part of successful companies
- Earn money as company grows
- Learn about business

When GoTo went public in 2022, they raised billions to expand their services across Indonesia!`,
            order: 2,
            duration: 5,
            xpReward: 50,
            type: 'text',
            isPublished: true,
          },
          {
            title: 'Stock Exchanges in Southeast Asia',
            content: `# Stock Exchanges in Southeast Asia

Each country has its own stock exchange where companies list their shares.

## Major Exchanges:
- **IDX** (Indonesia): GoTo, BCA, Telkom
- **SGX** (Singapore): DBS, Singtel, Sea Limited
- **SET** (Thailand): CP Group, SCB, PTT
- **VNX** (Vietnam): Vingroup, Vietcombank
- **PSE** (Philippines): SM, Ayala, Jollibee
- **Bursa** (Malaysia): Maybank, Petronas

You can invest in any of these markets!`,
            order: 3,
            duration: 5,
            xpReward: 50,
            type: 'text',
            isPublished: true,
          },
        ],
      },
    },
  })

  const module2 = await prisma.module.create({
    data: {
      title: 'Understanding Stock Prices',
      description: 'Learn how stock prices work and what makes them go up or down',
      icon: '💹',
      order: 2,
      difficulty: 'beginner',
      estimatedTime: 60,
      xpReward: 250,
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'Supply and Demand',
            content: `# Supply and Demand

Stock prices move based on supply (sellers) and demand (buyers).

## Price Goes UP ⬆️
- More people want to buy
- Good company news
- Strong earnings reports

## Price Goes DOWN ⬇️
- More people want to sell
- Bad company news
- Economic concerns

Example: When Grab announced partnership with a major bank, their stock price increased by 15% in one day!`,
            order: 1,
            duration: 6,
            xpReward: 60,
            type: 'text',
            isPublished: true,
          },
          {
            title: 'Reading Stock Quotes',
            content: `# Reading Stock Quotes

Understanding how to read stock information is crucial!

## Key Information:
- **Ticker Symbol**: GOTO, GRAB, SE
- **Current Price**: What it costs now
- **Change**: How much it moved today
- **Volume**: How many shares traded
- **52-Week High/Low**: Price range this year

Example:
GOTO: Rp 150
↑ +5 (+3.45%)
Volume: 50M shares`,
            order: 2,
            duration: 6,
            xpReward: 60,
            type: 'text',
            isPublished: true,
          },
        ],
      },
    },
  })

  const module3 = await prisma.module.create({
    data: {
      title: 'Investment Strategies',
      description: 'Learn different ways to invest in the stock market',
      icon: '🎯',
      order: 3,
      difficulty: 'intermediate',
      estimatedTime: 90,
      xpReward: 300,
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'Long-term vs Short-term Investing',
            content: `# Long-term vs Short-term Investing

There are two main approaches to investing:

## Long-term (Years)
- Buy and hold for years
- Focus on company fundamentals
- Lower stress, fewer trades
- Warren Buffett's approach

## Short-term (Days/Weeks)
- Active trading
- Technical analysis
- Higher risk and reward
- Requires more time

For beginners, long-term investing is usually better!`,
            order: 1,
            duration: 8,
            xpReward: 80,
            type: 'text',
            isPublished: true,
          },
          {
            title: 'Diversification: Don\'t Put All Eggs in One Basket',
            content: `# Diversification

Diversification means spreading your investments across different stocks and sectors.

## Why Diversify?
- Reduce risk
- Balance your portfolio
- Protect against losses

## How to Diversify:
- Different industries (tech, banking, retail)
- Different countries
- Different company sizes

Example Portfolio:
- 30% Tech (Sea, GoTo)
- 30% Banking (DBS, BCA)
- 20% Retail (SM, CP)
- 20% Energy (Petronas, PTT)`,
            order: 2,
            duration: 8,
            xpReward: 80,
            type: 'text',
            isPublished: true,
          },
        ],
      },
    },
  })

  // ==================== BADGES ====================
  
  console.log('🏆 Creating badges...')

  await prisma.badge.createMany({
    data: [
      {
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '👣',
        rarity: 'common',
        criteria: JSON.stringify({ lessonsCompleted: 1 }),
      },
      {
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        rarity: 'common',
        criteria: JSON.stringify({ streak: 7 }),
      },
      {
        name: 'Month Master',
        description: 'Maintain a 30-day streak',
        icon: '🌟',
        rarity: 'rare',
        criteria: JSON.stringify({ streak: 30 }),
      },
      {
        name: 'First Trade',
        description: 'Make your first stock trade',
        icon: '📈',
        rarity: 'common',
        criteria: JSON.stringify({ tradesMade: 1 }),
      },
      {
        name: 'Portfolio Pro',
        description: 'Make 50 successful trades',
        icon: '💼',
        rarity: 'epic',
        criteria: JSON.stringify({ tradesMade: 50 }),
      },
      {
        name: 'XP Hunter',
        description: 'Earn 1,000 XP',
        icon: '⚡',
        rarity: 'common',
        criteria: JSON.stringify({ totalXP: 1000 }),
      },
      {
        name: 'XP Legend',
        description: 'Earn 10,000 XP',
        icon: '👑',
        rarity: 'legendary',
        criteria: JSON.stringify({ totalXP: 10000 }),
      },
      {
        name: 'Module Master',
        description: 'Complete all lessons in a module',
        icon: '🎓',
        rarity: 'rare',
        criteria: JSON.stringify({ moduleCompleted: 1 }),
      },
      {
        name: 'Knowledge Seeker',
        description: 'Complete 20 lessons',
        icon: '📚',
        rarity: 'rare',
        criteria: JSON.stringify({ lessonsCompleted: 20 }),
      },
      {
        name: 'Profit Maker',
        description: 'Achieve 10% portfolio return',
        icon: '💰',
        rarity: 'epic',
        criteria: JSON.stringify({ portfolioReturn: 10 }),
      },
    ],
  })

  // ==================== MISSIONS ====================
  
  console.log('🎯 Creating missions...')

  await prisma.mission.createMany({
    data: [
      {
        title: 'Complete 2 Lessons',
        description: 'Finish any 2 lessons today',
        type: 'daily',
        requirements: JSON.stringify({ lessonsCompleted: 2 }),
        xpReward: 50,
        isActive: true,
      },
      {
        title: 'Make a Trade',
        description: 'Execute 1 simulated trade',
        type: 'daily',
        requirements: JSON.stringify({ tradesMade: 1 }),
        xpReward: 30,
        isActive: true,
      },
      {
        title: 'Ask AI Coach',
        description: 'Ask your AI coach a question',
        type: 'daily',
        requirements: JSON.stringify({ aiChatsToday: 1 }),
        xpReward: 20,
        isActive: true,
      },
      {
        title: 'Weekly Challenge: Complete a Module',
        description: 'Finish all lessons in any module this week',
        type: 'weekly',
        requirements: JSON.stringify({ moduleCompleted: 1 }),
        xpReward: 200,
        isActive: true,
      },
      {
        title: 'Weekly Challenge: 5 Trades',
        description: 'Make 5 successful trades this week',
        type: 'weekly',
        requirements: JSON.stringify({ tradesMade: 5 }),
        xpReward: 150,
        isActive: true,
      },
      {
        title: 'Perfect Week',
        description: 'Complete daily missions every day for 7 days',
        type: 'achievement',
        requirements: JSON.stringify({ perfectDays: 7 }),
        xpReward: 500,
        isActive: true,
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


