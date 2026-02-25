"use client";

import { useState, useEffect } from "react";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  imageUrl: string | null;
  country: string;
  bio: string;
  joinedAt: string;
  isOwnProfile: boolean;
  profile: {
    totalXP: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    totalLessonsCompleted: number;
    totalTradesMade: number;
  };
  portfolio: {
    virtualBalance: number;
    cashBalance: number;
    totalReturn: number;
    totalReturnAmount: number;
  } | null;
  learningProgress: {
    moduleTitle: string;
    icon: string;
    percentComplete: number;
    xpEarned: number;
  }[];
  badges: {
    id: string;
    name: string;
    icon: string;
    description: string;
    rarity: string;
    earnedAt: string;
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FLAGS: Record<string, string> = {
  SG: "🇸🇬", MY: "🇲🇾", ID: "🇮🇩", TH: "🇹🇭", VN: "🇻🇳", PH: "🇵🇭",
};

function getLevelProgress(totalXP: number, level: number) {
  const xpPerLevel = 500;
  const xpForCurrentLevel = (level - 1) * xpPerLevel;
  return {
    progress: Math.min(((totalXP - xpForCurrentLevel) / xpPerLevel) * 100, 100),
    currentLevelXP: totalXP - xpForCurrentLevel,
  };
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-background-gray rounded-lg ${className}`} />;
}

function ProfileSkeleton() {
  return (
    <Container className="py-4 space-y-4">
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <Skeleton className="mt-4 h-10 w-full" />
      </Card>
      <Card className="p-5">
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-3 w-full" />
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    </Container>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = "lg" }: { user: ProfileData; size?: "sm" | "lg" }) {
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
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
function EditProfileModal({
  user,
  onClose,
  onSave,
}: {
  user: ProfileData;
  onClose: () => void;
  onSave: (updated: Partial<ProfileData>) => void;
}) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    bio: user.bio,
    country: user.country,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      onSave(form);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl">
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

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Username</label>
            <div className="flex items-center border border-divider rounded-lg overflow-hidden focus-within:border-primary transition-colors">
              <span className="px-3 py-2.5 text-sm text-text-secondary bg-background-gray border-r border-divider">@</span>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                className="flex-1 px-3 py-2.5 text-sm text-text-primary focus:outline-none"
                placeholder="only letters, numbers, _"
              />
            </div>
          </div>

          {/* Bio */}
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

          {/* Country */}
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

          {error && (
            <p className="text-sm text-accent-red bg-accent-red/10 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-divider">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-divider text-text-secondary text-sm font-medium hover:border-text-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-colors"
            style={{ backgroundColor: "#00C853" }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "progress" | "badges">("overview");

  // Fetch own profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) throw new Error("Failed to load profile");
        const data: ProfileData = await res.json();
        setProfile(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Optimistically update profile after edit save
  const handleProfileSave = (updates: Partial<ProfileData>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updates });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-gray pb-20">
        <DashboardHeader userName="" />
        <ProfileSkeleton />
        <BottomNav />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background-gray pb-20 flex flex-col">
        <DashboardHeader userName="" />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-3">
            <p className="text-4xl">😕</p>
            <p className="text-text-primary font-semibold">Couldn't load profile</p>
            <p className="text-sm text-text-secondary">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold"
              style={{ backgroundColor: "#00C853" }}
            >
              Try Again
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const { progress: levelProgress, currentLevelXP } = getLevelProgress(
    profile.profile.totalXP,
    profile.profile.level
  );

  return (
    <div className="min-h-screen bg-background-gray pb-20">
      <DashboardHeader userName={profile.firstName} />

      <Container className="py-4 space-y-4">

        {/* ── Profile Header ── */}
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar user={profile} size="lg" />
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-white"
                style={{ backgroundColor: "#00C853" }}
              >
                {profile.profile.level}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-lg font-bold text-text-primary">
                  {profile.firstName} {profile.lastName}
                </h1>
                <span>{FLAGS[profile.country] ?? "🌏"}</span>
              </div>
              <p className="text-sm text-text-secondary">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm text-text-primary mt-1 leading-snug">{profile.bio}</p>
              )}
              <p className="text-xs text-text-secondary mt-1">
                Joined {new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="mt-4">
            {profile.isOwnProfile ? (
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
              <span className="font-bold text-text-primary">Level {profile.profile.level}</span>
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
            <span className="text-xs text-text-secondary">Lv. {profile.profile.level}</span>
            <span className="text-xs text-text-secondary">Lv. {profile.profile.level + 1}</span>
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
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🔥", label: "Current Streak", value: `${profile.profile.currentStreak} days`, sub: `Best: ${profile.profile.longestStreak}d`, subColor: "text-accent-orange" },
                { icon: "⚡", label: "Total XP", value: profile.profile.totalXP.toLocaleString(), sub: "Points earned", subColor: "text-accent-yellow" },
                { icon: "📚", label: "Lessons Done", value: String(profile.profile.totalLessonsCompleted), sub: "Completed", subColor: "text-accent-blue" },
                { icon: "📈", label: "Trades Made", value: String(profile.profile.totalTradesMade), sub: "Simulated", subColor: "text-primary" },
              ].map((stat, i) => (
                <Card key={i} className="p-4">
                  <span className="text-2xl">{stat.icon}</span>
                  <p className="text-xl font-bold text-text-primary mt-1">{stat.value}</p>
                  <p className="text-xs text-text-secondary">{stat.label}</p>
                  <p className={`text-xs font-medium ${stat.subColor}`}>{stat.sub}</p>
                </Card>
              ))}
            </div>

            {/* Portfolio — only shown for own profile */}
            {profile.portfolio ? (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text-primary">Virtual Portfolio</h3>
                  <span className="text-xs text-text-secondary bg-background-gray border border-divider px-2 py-1 rounded-lg">
                    Simulated
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-text-primary">
                      ${profile.portfolio.virtualBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">Virtual Balance</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${profile.portfolio.totalReturn >= 0 ? "text-primary" : "text-accent-red"}`}>
                      {profile.portfolio.totalReturn >= 0 ? "+" : ""}{profile.portfolio.totalReturn.toFixed(1)}%
                    </p>
                    <p className="text-xs text-text-secondary">
                      {profile.portfolio.totalReturnAmount >= 0 ? "+" : ""}
                      ${Math.abs(profile.portfolio.totalReturnAmount).toLocaleString()}
                    </p>
                  </div>
                </div>
                {/* Sparkline — visual placeholder until real chart data is added */}
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
            ) : (
              <Card className="p-5 text-center">
                <p className="text-2xl mb-2">🔒</p>
                <p className="text-sm text-text-secondary">Portfolio is private</p>
              </Card>
            )}
          </div>
        )}

        {/* ── TAB: PROGRESS ── */}
        {activeTab === "progress" && (
          <div className="space-y-3 animate-fade-in">
            {profile.learningProgress.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-3xl mb-3">📚</p>
                <p className="font-semibold text-text-primary">No modules started yet</p>
                <p className="text-sm text-text-secondary mt-1">Head to Learn to get started!</p>
              </Card>
            ) : (
              profile.learningProgress.map((mod, i) => (
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
              ))
            )}
          </div>
        )}

        {/* ── TAB: BADGES ── */}
        {activeTab === "badges" && (
          <div className="animate-fade-in">
            {profile.badges.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-3xl mb-3">🏅</p>
                <p className="font-semibold text-text-primary">No badges yet</p>
                <p className="text-sm text-text-secondary mt-1">Complete lessons and trades to earn badges!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {profile.badges.map((badge) => (
                  <Card
                    key={badge.id}
                    className="p-4 flex flex-col items-center gap-1.5 text-center group cursor-default"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                      {badge.icon}
                    </span>
                    <p className="text-xs font-semibold text-text-primary leading-tight">{badge.name}</p>
                    <p className="text-[10px] text-text-secondary leading-tight hidden group-hover:block">
                      {badge.description}
                    </p>
                    <p className="text-[10px] text-text-secondary group-hover:hidden">
                      {new Date(badge.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </Card>
                ))}
                {/* Locked placeholders — always show a few to motivate */}
                {[...Array(Math.max(0, 9 - profile.badges.length > 3 ? 3 : 9 - profile.badges.length))].map((_, i) => (
                  <div
                    key={`locked-${i}`}
                    className="bg-white rounded-lg shadow-card p-4 flex flex-col items-center gap-1.5 opacity-40"
                  >
                    <span className="text-3xl grayscale">🔒</span>
                    <p className="text-xs text-text-secondary">Locked</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </Container>

      <BottomNav />

      {showEditModal && profile.isOwnProfile && (
        <EditProfileModal
          user={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
}


