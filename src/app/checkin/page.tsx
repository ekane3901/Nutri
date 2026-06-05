"use client";

import { useState } from "react";
import Link from "next/link";

const MOODS = [
  { value: "great", label: "Great", emoji: "😁" },
  { value: "good", label: "Good", emoji: "😊" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "low", label: "Low", emoji: "😔" },
  { value: "stressed", label: "Stressed", emoji: "😥" },
];

const ENERGY = [
  { value: "high", label: "High", color: "text-green-400" },
  { value: "medium", label: "Medium", color: "text-[var(--accent)]" },
  { value: "low", label: "Low", color: "text-red-400" },
];

const INSIGHTS: Record<string, string> = {
  "great-high": "You're on fire! Great day to crush your nutrition goals.",
  "great-medium": "Feeling good! Keep that momentum going.",
  "great-low": "You're in a positive headspace. Rest if you need it.",
  "good-high": "Solid energy and mood. Perfect for meal prep or trying a new recipe.",
  "good-medium": "You're feeling good! Your positive energy will help you stay on track today.",
  "good-low": "Good mindset. Listen to your body and fuel accordingly.",
  "okay-high": "Energy is there—use it for one small win today.",
  "okay-medium": "Steady as she goes. One healthy choice at a time.",
  "okay-low": "It's okay to take it easy. Focus on simple, nourishing meals.",
  "low-high": "Mood might be low but you've got energy. A good walk or meal can help.",
  "low-medium": "Be gentle with yourself. Easy meals and rest are okay.",
  "low-low": "Take care of yourself today. Simple foods and rest.",
  "stressed-high": "Channel that energy into one thing you can control—like a healthy meal.",
  "stressed-medium": "Stress is real. A balanced meal can help stabilize mood and energy.",
  "stressed-low": "Prioritize rest and simple nutrition. You've got this.",
};

function getInsight(mood: string, energy: string): string {
  return INSIGHTS[`${mood}-${energy}`] ?? "Track how you feel to get personalized insights.";
}

export default function CheckinPage() {
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [completed, setCompleted] = useState(false);

  const insight = mood && energy ? getInsight(mood, energy) : "Select your mood and energy to see your personal insight.";

  function handleComplete() {
    setCompleted(true);
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-white">
          <span>←</span> Back
        </Link>
        <h1 className="mb-1 text-2xl font-bold text-white">Daily Check-In</h1>
        <p className="mb-8 text-zinc-400">How are you feeling today?</p>

        {/* Mood */}
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
          How&apos;s your mood?
        </h2>
        <div className="mb-8 flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                mood === m.value
                  ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                  : "border-[var(--card-border)] bg-[var(--card)] text-white hover:border-zinc-500"
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        {/* Energy */}
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
          Energy level?
        </h2>
        <div className="mb-8 flex flex-wrap gap-2">
          {ENERGY.map((e) => (
            <button
              key={e.value}
              type="button"
              onClick={() => setEnergy(e.value)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                energy === e.value
                  ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                  : "border-[var(--card-border)] bg-[var(--card)] text-white hover:border-zinc-500"
              }`}
            >
              <span className={energy === e.value ? e.color : ""}>⚡</span> {e.label}
            </button>
          ))}
        </div>

        {/* Optional note */}
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
          Anything on your mind? (optional)
        </h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Share what's on your mind today..."
          rows={3}
          className="mb-8 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-white placeholder-zinc-500 focus:border-[var(--accent)] focus:outline-none"
        />

        {/* Personal Insight */}
        <div className="mb-8 rounded-2xl border border-[var(--card-border)] bg-purple-950/30 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl text-white">♡</span>
            <div>
              <h3 className="font-semibold text-white">Your Personal Insight</h3>
              <p className="mt-1 text-sm text-zinc-300">{insight}</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleComplete}
          className="w-full rounded-xl bg-[var(--accent)] py-3 font-semibold text-black"
        >
          {completed ? "Check-in saved" : "Complete Check-In"}
        </button>
      </div>
    </div>
  );
}
