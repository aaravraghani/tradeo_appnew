"use client";

import { useState } from "react";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

// ─── Mock Data (replace with real API calls later) ───────────────────────────
const MOCK_OWN_PROFILE = {
  id: "me",
  firstName: "Aarav",
  lastName: "Raghani",
  username: "aarav_trades",
  email: "aarav@example.com",
  imageUrl: null as string | null,
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
    { moduleTitle: "Stock Market Basics", icon: "📊", percentComplete: 100, xpEarned: 800 },
    { moduleTitle: "Reading Charts", icon: "💹", percentComplete: 75, xpEarned: 600 },
    { moduleTitle: "Risk Management", icon: "🎯", percentComplete: 40, xpEarned: 300 },
    { moduleTitle: "Crypto Fundamentals", icon: "🪙", percentComplete: 10, xpEarned: 100 },
  ],
  badges: [
    { id: "1", name: "First Trade", icon: "📈", description: "Made your first simulated trade", earnedAt: "2024-09-05" },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FLAGS: Record<string, string> = {
  SG: "🇸🇬", MY: "🇲🇾", ID: "🇮🇩", TH: "🇹🇭", VN: "🇻🇳", PH: "🇵🇭",
};

function getLevelProgress(totalXP: number, level: number) {
  const xpPerLevel = 500;
  const xpForCurrentLevel = (level - 1) * xpPerLevel;
  const progress = ((totalXP - xpForCurrentLevel) / xpPerLevel) * 100;
  return {
    progress: Math.min(progress, 100),
    currentLevelXP: totalXP - xpForCurrentLevel,
  };
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = "lg" }: { user: typeof MOCK_OWN_PROFILE; size?: "sm" | "lg" }) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  const sizeClass = size === "lg" ? "w-20 h-20 text-2xl" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: "linear-gradient(135deg, #00C853 0%, #00A043 100%)" }}
    >
      {user.imageUrl ? (
        <img src={user.imageUrl} alt={user.firstName} className="w-full h-full rounded-full object-cover" />
      ) : (
        initials
      )}
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl">
        {/* Handle for mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-divider rounded-full" />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <h2 className="text-lg font-semibold text-text-primary">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-background-gray text-text-secondary hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 max-h-[65vh] overflow-y-auto">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar user={user} />
            <div>
              <button className="text-sm font-medium text-primary border border-primary rounded-lg px-4 py-2 hover:bg-primary/5 transition-colors">
                Change Photo
              </button>
              <p className="text-xs text-text-secondary mt-1">JPG, PNG up to 5MB</p>
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">First Name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="border border-divider rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">Last Name</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="border border-divider rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Username</label>
            <div className="flex items-center border border-divider rounded-lg overflow-hidden focus-within:border-primary transition-colors">
              <span className="px-3 py-2.5 text-sm text-text-secondary bg-background-gray border-r border-divider">@</span>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="flex-1 px-3 py-2.5 text-sm text-text-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={2}
              maxLength={120}
              className="border border-divider rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors resize-none"
            />
            <p className="text-xs text-text-secondary text-right">{form.bio.length}/120</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Country</label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="border border-divider rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors bg-white"
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

        <div className="flex gap-3 p-6 border-t border-divider">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-divider text-text-secondary text-sm font-medium hover:border-text-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg text-white text-sm font-semibold"
            style={{ backgroundColor: "#00C853" }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [viewMode, setViewMode] = useState<"own" | "other">("own");
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "progress" | "badges">("overview");

  const isOwnProfile = viewMode === "own";
  const user = isOwnProfile ? MOCK_OWN_PROFILE : MOCK_OTHER_PROFILE;
  const { progress: levelProgress, currentLevelXP } = getLevelProgress(
    user.profile.totalXP,
    user.profile.level
  );

  return (
    <div className="min-h-screen bg-background-gray pb-20">

      {/* Reuses existing DashboardHeader */}
      <DashboardHeader userName={user.firstName} />

      {/* Dev toggle — REMOVE before production */}
      <div className="flex justify-center pt-4 px-4">
        <div className="flex gap-1 bg-white border border-divider rounded-full p-1 shadow-card text-xs">
          <button
            onClick={() => setViewMode("own")}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${viewMode === "own" ? "text-white" : "text-text-secondary"}`}
            style={viewMode === "own" ? { backgroundColor: "#00C853" } : {}}
          >
            My Profile
          </button>
          <button
            onClick={() => setViewMode("other")}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${viewMode === "other" ? "text-white" : "text-text-secondary"}`}
            style={viewMode === "other" ? { backgroundColor: "#00C853" } : {}}
          >
            Other's Profile
          </button>
        </div>
      </div>

      <Container className="py-4 space-y-4">

        {/* ── Profile Header ── */}
        <Card className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar + level badge */}
            <div className="relative">
              <Avatar user={user} size="lg" />
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-white"
                style={{ backgroundColor: "#00C853" }}
              >
                {user.profile.level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-lg font-bold text-text-primary">{user.firstName} {user.lastName}</h1>
                <span>{FLAGS[user.country] ?? "🌏"}</span>
              </div>
              <p className="text-sm text-text-secondary">@{user.username}</p>
              {user.bio && <p className="text-sm text-text-primary mt-1 leading-snug">{user.bio}</p>}
              <p className="text-xs text-text-secondary mt-1">
                Joined {new Date(user.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Action */}
          <div className="mt-4">
            {isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full py-2.5 rounded-lg border-2 border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold"
                  style={{ backgroundColor: "#00C853" }}
                >
                  Follow
                </button>
                <button className="flex-1 py-2.5 rounded-lg border-2 border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors">
                  Challenge
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* ── XP Level Bar ── */}
        <Card className="p-5">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary">Level {user.profile.level}</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#E8F5E9", color: "#00C853" }}
              >
                {currentLevelXP} / 500 XP
              </span>
            </div>
            <span className="text-xs text-text-secondary">
              {500 - currentLevelXP} XP to next level
            </span>
          </div>
          <div className="h-3 bg-background-gray rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${levelProgress}%`,
                background: "linear-gradient(90deg, #00C853, #00A043)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-text-secondary">Lv. {user.profile.level}</span>
            <span className="text-xs text-text-secondary">Lv. {user.profile.level + 1}</span>
          </div>
        </Card>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white border border-divider rounded-xl p-1 shadow-card">
          {(["overview", "progress", "badges"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                activeTab === tab ? "text-white" : "text-text-secondary hover:text-text-primary"
              }`}
              style={activeTab === tab ? { backgroundColor: "#00C853", boxShadow: "0px 4px 12px rgba(0,200,83,0.3)" } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-4 animate-fade-in">
            {/* 4 stat cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🔥", label: "Current Streak", value: `${user.profile.currentStreak} days`, sub: `Best: ${user.profile.longestStreak}d`, subColor: "text-accent-orange" },
                { icon: "⚡", label: "Total XP", value: user.profile.totalXP.toLocaleString(), sub: "Points earned", subColor: "text-accent-yellow" },
                { icon: "📚", label: "Lessons Done", value: String(user.profile.totalLessonsCompleted), sub: "Completed", subColor: "text-accent-blue" },
                { icon: "📈", label: "Trades Made", value: String(user.profile.totalTradesMade), sub: "Simulated", subColor: "text-primary" },
              ].map((stat, i) => (
                <Card key={i} className="p-4">
                  <span className="text-2xl">{stat.icon}</span>
                  <p className="text-xl font-bold text-text-primary mt-1">{stat.value}</p>
                  <p className="text-xs text-text-secondary">{stat.label}</p>
                  <p className={`text-xs font-medium ${stat.subColor}`}>{stat.sub}</p>
                </Card>
              ))}
            </div>

            {/* Portfolio */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-text-primary">Virtual Portfolio</h3>
                <span className="text-xs text-text-secondary bg-background-gray border border-divider px-2 py-1 rounded-lg">Simulated</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-text-primary">
                    ${user.portfolio.virtualBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">Virtual Balance</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">+{user.portfolio.totalReturn}%</p>
                  <p className="text-xs text-text-secondary">+${user.portfolio.totalReturnAmount.toLocaleString()}</p>
                </div>
              </div>
              {/* Sparkline */}
              <div className="mt-4 h-10 flex items-end gap-0.5">
                {[40, 55, 45, 60, 58, 70, 65, 80, 75, 85, 78, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      backgroundColor: "#00C853",
                      opacity: 0.25 + (i / 12) * 0.75,
                    }}
                  />
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB: PROGRESS ── */}
        {activeTab === "progress" && (
          <div className="space-y-3 animate-fade-in">
            {user.learningProgress.map((mod, i) => (
              <Card key={i} className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: "#E8F5E9" }}
                    >
                      {mod.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{mod.moduleTitle}</p>
                      <p className="text-xs text-text-secondary">{mod.xpEarned} XP earned</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ml-2 ${
                      mod.percentComplete === 100
                        ? "bg-primary/10 text-primary"
                        : mod.percentComplete > 0
                        ? "bg-accent-blue/10 text-accent-blue"
                        : "bg-background-gray text-text-secondary"
                    }`}
                  >
                    {mod.percentComplete === 100 ? "✓ Done" : `${mod.percentComplete}%`}
                  </span>
                </div>
                <div className="h-2 bg-background-gray rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${mod.percentComplete}%`,
                      backgroundColor: mod.percentComplete === 100 ? "#00C853" : "#42A5F5",
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── TAB: BADGES ── */}
        {activeTab === "badges" && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-3 gap-3">
              {user.badges.map((badge) => (
                <Card
                  key={badge.id}
                  className="p-4 flex flex-col items-center gap-1.5 text-center group cursor-default"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{badge.icon}</span>
                  <p className="text-xs font-semibold text-text-primary leading-tight">{badge.name}</p>
                  <p className="text-[10px] text-text-secondary leading-tight hidden group-hover:block">{badge.description}</p>
                  <p className="text-[10px] text-text-secondary group-hover:hidden">
                    {new Date(badge.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </Card>
              ))}
              {/* Locked placeholders */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={`locked-${i}`}
                  className="bg-white rounded-lg shadow-card p-4 flex flex-col items-center gap-1.5 opacity-40"
                >
                  <span className="text-3xl grayscale">🔒</span>
                  <p className="text-xs text-text-secondary">Locked</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </Container>

      {/* Reuses existing BottomNav */}
      <BottomNav />

      {/* Edit Modal */}
      {showEditModal && (
        <EditProfileModal user={user} onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
}


