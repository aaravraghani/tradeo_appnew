"use client";

import { useState } from "react";

// ─── Mock Data (replace with real API calls later) ───────────────────────────
const MOCK_OWN_PROFILE = {
  id: "me",
  firstName: "Aarav",
  lastName: "Raghani",
  username: "aarav_trades",
  email: "aarav@example.com",
  imageUrl: null,
  country: "SG",
  joinedAt: "2024-09-01",
  bio: "Learning to invest one lesson at a time 📈",
  profile: {
    totalXP: 4850,
    level: 12,
    currentStreak: 7,
    longestStreak: 21,
    totalLessonsCompleted: 34,
    totalTradesMade: 18,
  },
  portfolio: {
    virtualBalance: 12430.5,
    totalReturn: 24.3,
    totalReturnAmount: 2430.5,
  },
  learningProgress: [
    { moduleTitle: "Stock Market Basics", percentComplete: 100, xpEarned: 800 },
    { moduleTitle: "Reading Charts", percentComplete: 75, xpEarned: 600 },
    { moduleTitle: "Risk Management", percentComplete: 40, xpEarned: 300 },
    { moduleTitle: "Crypto Fundamentals", percentComplete: 10, xpEarned: 100 },
  ],
  badges: [
    { id: "1", name: "First Trade", icon: "🎯", description: "Made your first simulated trade", earnedAt: "2024-09-05" },
    { id: "2", name: "7-Day Streak", icon: "🔥", description: "Learned 7 days in a row", earnedAt: "2024-09-12" },
    { id: "3", name: "Chart Reader", icon: "📊", description: "Completed the charting module", earnedAt: "2024-09-20" },
    { id: "4", name: "Risk Taker", icon: "⚡", description: "High volatility trade attempt", earnedAt: "2024-10-01" },
    { id: "5", name: "Scholar", icon: "📚", description: "Completed 30 lessons", earnedAt: "2024-10-15" },
    { id: "6", name: "Profit Pro", icon: "💰", description: "Achieved 20%+ virtual return", earnedAt: "2024-11-01" },
  ],
};

const MOCK_OTHER_PROFILE = {
  ...MOCK_OWN_PROFILE,
  id: "other",
  firstName: "Mei",
  lastName: "Tan",
  username: "mei_invests",
  email: "mei@example.com",
  bio: "Stocks, charts, and bubble tea. 🧋",
  country: "MY",
};

// ─── Country Flag helper ──────────────────────────────────────────────────────
const FLAGS: Record<string, string> = {
  SG: "🇸🇬", MY: "🇲🇾", ID: "🇮🇩", TH: "🇹🇭", VN: "🇻🇳", PH: "🇵🇭",
};

// ─── Level XP thresholds ──────────────────────────────────────────────────────
function getLevelProgress(totalXP: number, level: number) {
  const xpPerLevel = 500;
  const xpForCurrentLevel = (level - 1) * xpPerLevel;
  const xpForNextLevel = level * xpPerLevel;
  const progress = ((totalXP - xpForCurrentLevel) / xpPerLevel) * 100;
  return { progress: Math.min(progress, 100), xpForNextLevel, currentLevelXP: totalXP - xpForCurrentLevel };
}

// ─── Avatar Component ─────────────────────────────────────────────────────────
function Avatar({ user, size = "lg" }: { user: typeof MOCK_OWN_PROFILE; size?: "sm" | "lg" }) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  const sizeClass = size === "lg" ? "w-24 h-24 text-3xl" : "w-10 h-10 text-sm";
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-900/30 ring-2 ring-emerald-500/30`}>
      {user.imageUrl ? (
        <img src={user.imageUrl} alt={user.firstName} className="w-full h-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, sub }: { label: string; value: string | number; icon: string; sub?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-1 hover:border-emerald-800 transition-colors">
      <span className="text-2xl">{icon}</span>
      <span className="text-2xl font-bold text-white font-mono tracking-tight">{value}</span>
      <span className="text-xs text-zinc-500 uppercase tracking-widest">{label}</span>
      {sub && <span className="text-xs text-emerald-400">{sub}</span>}
    </div>
  );
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({ user, onClose }: { user: typeof MOCK_OWN_PROFILE; onClose: () => void }) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    bio: user.bio,
    country: user.country,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-xl">✕</button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar user={user} />
            <button className="text-sm text-emerald-400 hover:text-emerald-300 border border-emerald-800 rounded-xl px-4 py-2 transition-colors">
              Change Photo
            </button>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">First Name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-600 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Last Name</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-600 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={2}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-600 transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Country</label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-600 transition-colors"
            >
              <option value="SG">🇸🇬 Singapore</option>
              <option value="MY">🇲🇾 Malaysia</option>
              <option value="ID">🇮🇩 Indonesia</option>
              <option value="TH">🇹🇭 Thailand</option>
              <option value="VN">🇻🇳 Vietnam</option>
              <option value="PH">🇵🇭 Philippines</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-zinc-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-500 transition-colors">
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [viewMode, setViewMode] = useState<"own" | "other">("own");
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "progress" | "badges">("overview");

  const isOwnProfile = viewMode === "own";
  const user = isOwnProfile ? MOCK_OWN_PROFILE : MOCK_OTHER_PROFILE;
  const { progress: levelProgress, xpForNextLevel, currentLevelXP } = getLevelProgress(
    user.profile.totalXP,
    user.profile.level
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Dev toggle — remove in production */}
      <div className="fixed top-4 right-4 z-40 flex gap-2 bg-zinc-900 border border-zinc-800 rounded-full p-1">
        <button
          onClick={() => setViewMode("own")}
          className={`text-xs px-3 py-1.5 rounded-full transition-colors ${viewMode === "own" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"}`}
        >
          My Profile
        </button>
        <button
          onClick={() => setViewMode("other")}
          className={`text-xs px-3 py-1.5 rounded-full transition-colors ${viewMode === "other" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"}`}
        >
          Other's Profile
        </button>
      </div>

      {/* Hero Banner */}
      <div className="relative h-40 bg-gradient-to-br from-emerald-950 via-teal-950 to-zinc-950 overflow-hidden">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/4 w-64 h-32 bg-emerald-600/20 rounded-full blur-3xl" />
      </div>

      {/* Profile Header */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="relative -mt-12 flex items-end justify-between mb-4">
          {/* Avatar with level badge */}
          <div className="relative">
            <div className="ring-4 ring-zinc-950 rounded-full">
              <Avatar user={user} size="lg" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center ring-2 ring-zinc-950">
              {user.profile.level}
            </div>
          </div>

          {/* Action buttons */}
          {isOwnProfile ? (
            <button
              onClick={() => setShowEditModal(true)}
              className="mb-1 px-4 py-2 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:border-emerald-700 hover:text-white transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <div className="mb-1 flex gap-2">
              <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold transition-colors">
                Follow
              </button>
              <button className="px-4 py-2 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 transition-colors">
                Challenge
              </button>
            </div>
          )}
        </div>

        {/* Name & Bio */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold">{user.firstName} {user.lastName}</h1>
            <span className="text-lg">{FLAGS[user.country] ?? "🌏"}</span>
          </div>
          <p className="text-sm text-zinc-500">@{user.username}</p>
          {user.bio && <p className="mt-2 text-sm text-zinc-300">{user.bio}</p>}
          <p className="mt-1 text-xs text-zinc-600">
            Joined {new Date(user.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* XP Level Bar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-emerald-400">Level {user.profile.level}</span>
            <span className="text-xs text-zinc-500 font-mono">{currentLevelXP} / 500 XP</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600 mt-1.5">{500 - currentLevelXP} XP to Level {user.profile.level + 1}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-1 mb-5">
          {(["overview", "progress", "badges"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-4 pb-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon="🔥" label="Current Streak" value={`${user.profile.currentStreak}d`} sub={`Best: ${user.profile.longestStreak} days`} />
              <StatCard icon="⚡" label="Total XP" value={user.profile.totalXP.toLocaleString()} sub={`Top ${Math.floor(Math.random() * 15) + 5}%`} />
              <StatCard icon="📚" label="Lessons Done" value={user.profile.totalLessonsCompleted} />
              <StatCard icon="📈" label="Trades Made" value={user.profile.totalTradesMade} />
            </div>

            {/* Portfolio Summary */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Virtual Portfolio</h3>
                <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-1 rounded-lg">Simulated</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold font-mono text-white">
                    ${user.portfolio.virtualBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Virtual Balance</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">
                    +{user.portfolio.totalReturn}%
                  </p>
                  <p className="text-xs text-zinc-500">
                    +${user.portfolio.totalReturnAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              {/* Mini sparkline placeholder */}
              <div className="mt-4 h-10 flex items-end gap-0.5 opacity-60">
                {[40, 55, 45, 60, 58, 70, 65, 80, 75, 85, 78, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-sm"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: PROGRESS ── */}
        {activeTab === "progress" && (
          <div className="flex flex-col gap-3 pb-12">
            {user.learningProgress.map((mod, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-white text-sm">{mod.moduleTitle}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{mod.xpEarned} XP earned</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      mod.percentComplete === 100
                        ? "bg-emerald-900/60 text-emerald-400"
                        : mod.percentComplete > 0
                        ? "bg-teal-900/40 text-teal-400"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {mod.percentComplete === 100 ? "✓ Done" : `${mod.percentComplete}%`}
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      mod.percentComplete === 100
                        ? "bg-emerald-500"
                        : "bg-gradient-to-r from-teal-600 to-emerald-500"
                    }`}
                    style={{ width: `${mod.percentComplete}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: BADGES ── */}
        {activeTab === "badges" && (
          <div className="pb-12">
            <div className="grid grid-cols-3 gap-3">
              {user.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-emerald-800 transition-colors group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{badge.icon}</span>
                  <p className="text-xs font-semibold text-center text-white leading-tight">{badge.name}</p>
                  <p className="text-[10px] text-zinc-600 text-center leading-tight hidden group-hover:block">{badge.description}</p>
                  <p className="text-[10px] text-zinc-700 group-hover:hidden">
                    {new Date(badge.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}

              {/* Locked badges placeholder */}
              {[...Array(3)].map((_, i) => (
                <div key={`locked-${i}`} className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 flex flex-col items-center gap-2 opacity-40">
                  <span className="text-3xl grayscale">🔒</span>
                  <p className="text-xs text-zinc-600 text-center">Locked</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditProfileModal user={user} onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
}


