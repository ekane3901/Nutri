"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { GOAL_LABELS } from "@/types/nutrify";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, ready } = useApp();

  useEffect(() => {
    if (!ready) return;
    if (!profile || !profile.completedOnboarding) {
      router.replace("/onboarding");
    }
  }, [ready, profile, router]);

  if (!ready || !profile || !profile.completedOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  const target = profile.dailyTarget;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Animated food hero */}
      <div className="relative h-56 w-full overflow-hidden md:h-72">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/80 via-orange-900/50 to-emerald-950/60 animate-gradient-shift" />
        <div className="absolute inset-0 flex items-center justify-center gap-4 text-5xl md:gap-8 md:text-7xl opacity-90">
          <span className="animate-float" style={{ animationDelay: "0s" }}>🥗</span>
          <span className="animate-float" style={{ animationDelay: "0.5s" }}>🍳</span>
          <span className="animate-float" style={{ animationDelay: "1s" }}>🥑</span>
          <span className="animate-float" style={{ animationDelay: "1.5s" }}>🍲</span>
          <span className="animate-float" style={{ animationDelay: "2s" }}>🥕</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/70 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 px-6 text-center">
          <h1 className="text-2xl font-bold text-white drop-shadow-md md:text-3xl">
            What will you cook today?
          </h1>
          <p className="mt-1 text-sm text-zinc-200 drop-shadow">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-8 py-10">
        <div className="space-y-8">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">Quick actions</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/ingredients"
                className="btn-quick btn-quick-subtle animate-action-in flex flex-col rounded-2xl p-5 text-[var(--accent)]"
                style={{ animationDelay: "0.05s" }}
              >
                <span className="btn-quick-accent mb-2 block text-2xl">🍳</span>
                <p className="font-semibold text-white">What to cook</p>
                <p className="text-sm text-zinc-400">Get recipes from ingredients.</p>
              </Link>
              <Link
                href="/history"
                className="btn-quick btn-quick-subtle animate-action-in flex flex-col rounded-2xl p-5 text-[var(--protein)]"
                style={{ animationDelay: "0.1s" }}
              >
                <span className="btn-quick-accent mb-2 block text-2xl">📋</span>
                <p className="font-semibold text-white">History</p>
                <p className="text-sm text-zinc-400">Past recipe sets.</p>
              </Link>
              <Link
                href="/groceries"
                className="btn-quick btn-quick-subtle animate-action-in flex flex-col rounded-2xl p-5 text-[var(--remaining)]"
                style={{ animationDelay: "0.15s" }}
              >
                <span className="btn-quick-accent mb-2 block text-2xl">🛒</span>
                <p className="font-semibold text-white">Groceries</p>
                <p className="text-sm text-zinc-400">Shopping list.</p>
              </Link>
              <Link
                href="/checkin"
                className="btn-quick btn-quick-subtle animate-action-in flex flex-col rounded-2xl p-5 text-rose-400"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="btn-quick-accent mb-2 block text-2xl">❤️</span>
                <p className="font-semibold text-white">Check-In</p>
                <p className="text-sm text-zinc-400">Mood & energy.</p>
              </Link>
              <Link
                href="/planner"
                className="btn-quick btn-quick-subtle animate-action-in flex flex-col rounded-2xl p-5 text-[var(--fat)]"
                style={{ animationDelay: "0.25s" }}
              >
                <span className="btn-quick-accent mb-2 block text-2xl">📅</span>
                <p className="font-semibold text-white">Planner</p>
                <p className="text-sm text-zinc-400">Plan your week.</p>
              </Link>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">Your diet mode</h2>
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚖️</span>
                  <div>
                    <p className="font-semibold text-white">{GOAL_LABELS[profile.goal]?.label ?? profile.goal}</p>
                    <p className="text-sm text-zinc-400">Target: {target.calories} cal</p>
                  </div>
                </div>
                <Link href="/onboarding" className="text-sm font-medium text-[var(--accent)] hover:underline">
                  Change
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-zinc-400">TDEE</p><p className="font-semibold text-white">{profile.tdee} cal</p></div>
                <div><p className="text-zinc-400">Protein</p><p className="font-semibold text-white">{target.protein}g</p></div>
                <div><p className="text-zinc-400">Carbs</p><p className="font-semibold text-white">{target.carbs}g</p></div>
                <div><p className="text-zinc-400">Fat</p><p className="font-semibold text-white">{target.fat}g</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
