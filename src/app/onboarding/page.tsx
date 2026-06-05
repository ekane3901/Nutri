"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ActivityLevel, DietMode } from "@/types/nutrify";
import { GOAL_LABELS } from "@/types/nutrify";
import { calculateBMR, calculateTDEE, getTargetsForGoal } from "@/lib/tdee";
import { useApp } from "@/context/AppContext";

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "light", label: "Light (1–3 days/week)" },
  { value: "moderate", label: "Moderate (3–5 days/week)" },
  { value: "active", label: "Active (6–7 days/week)" },
  { value: "very_active", label: "Very active (intense daily)" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile } = useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<DietMode>("maintenance");

  const canNext =
    name.trim() &&
    age.trim() &&
    weight.trim() &&
    height.trim() &&
    Number(age) >= 10 &&
    Number(weight) > 0 &&
    Number(height) > 0;

  function handleFinish() {
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);
    const bmr = calculateBMR(w, h, a, false);
    const tdee = calculateTDEE(bmr, activity);
    const dailyTarget = getTargetsForGoal(tdee, goal);
    setProfile({
      name: name.trim(),
      age: a,
      weightKg: w,
      heightCm: h,
      activityLevel: activity,
      goal,
      dailyTarget,
      tdee,
      completedOnboarding: true,
    });
    router.push("/dashboard");
  }

  const tdeePreview =
    step === 2 && name && weight && height && age
      ? calculateTDEE(
          calculateBMR(Number(weight), Number(height), Number(age), false),
          activity
        )
      : 0;
  const targetPreview = step === 2 ? getTargetsForGoal(tdeePreview, goal) : null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <Link href="/" className="mb-8 inline-block text-[var(--accent)]">
          ← Nutrify
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-white">Set up your plan</h1>
        <p className="mb-8 text-zinc-400">
          We&apos;ll calculate your daily targets from your stats and goal.
        </p>

        {step === 1 && (
          <>
            <label className="mb-2 block text-sm font-medium text-zinc-400">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mb-6 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-white placeholder-zinc-500 focus:border-[var(--accent)] focus:outline-none"
            />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Age</label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-white focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Weight (kg)</label>
                <input
                  type="number"
                  min={30}
                  max={300}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-white focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Height (cm)</label>
                <input
                  type="number"
                  min={100}
                  max={250}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-white focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>
            <label className="mb-2 mt-6 block text-sm text-zinc-400">Activity level</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
              className="mb-8 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-white focus:border-[var(--accent)] focus:outline-none"
            >
              {ACTIVITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canNext}
              className="w-full rounded-xl bg-[var(--accent)] py-3 font-semibold text-black disabled:opacity-50"
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="mb-4 text-sm text-zinc-400">Choose your goal</p>
            <div className="mb-8 grid grid-cols-2 gap-3">
              {(Object.keys(GOAL_LABELS) as DietMode[]).map((g) => {
                const { label, icon } = GOAL_LABELS[g];
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className={`flex flex-col items-center rounded-xl border-2 p-4 text-center transition-colors ${
                      goal === g
                        ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                        : "border-[var(--card-border)] bg-[var(--card)] text-white"
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="mt-1 text-sm font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
            {targetPreview && (
              <div className="mb-8 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                <p className="mb-2 text-sm font-semibold text-white">Your daily target</p>
                <p className="text-lg font-bold text-[var(--accent)]">{targetPreview.calories} kcal</p>
                <p className="text-sm text-zinc-400">
                  {targetPreview.protein}g protein · {targetPreview.carbs}g carbs · {targetPreview.fat}g fat
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-[var(--card-border)] py-3 font-medium text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 rounded-xl bg-[var(--accent)] py-3 font-semibold text-black"
              >
                Get started
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
