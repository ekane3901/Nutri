"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  getStoredMealPlan,
  setStoredMealPlan,
  addToGroceries,
} from "@/lib/store";
import type {
  Recipe,
  MealPlan,
  DayPlan,
  PlanSlot,
  MealSlotType,
  Macros,
} from "@/types/nutrify";

function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function formatDateKey(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function formatDayLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const SLOTS: { key: MealSlotType; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
];

function recipeToSlot(r: Recipe): PlanSlot {
  return {
    recipeId: r.id,
    title: r.title,
    macros: r.macros,
  };
}

function sumMacros(slots: (PlanSlot | null | undefined)[]): Macros {
  return slots.reduce(
    (acc, s) => {
      if (!s?.macros) return acc;
      return {
        calories: acc.calories + (s.macros.calories ?? 0),
        protein: acc.protein + (s.macros.protein ?? 0),
        carbs: acc.carbs + (s.macros.carbs ?? 0),
        fat: acc.fat + (s.macros.fat ?? 0),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export default function PlannerPage() {
  const router = useRouter();
  const { profile, ready, lastRecipes } = useApp();
  const [plan, setPlan] = useState<MealPlan>({});
  const [picker, setPicker] = useState<{
    dateKey: string;
    slot: MealSlotType;
  } | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!profile?.completedOnboarding) {
      router.replace("/onboarding");
      return;
    }
    setPlan(getStoredMealPlan());
  }, [ready, profile, router]);

  const persistPlan = useCallback((next: MealPlan) => {
    setPlan(next);
    setStoredMealPlan(next);
  }, []);

  const weekStart = getWeekStart(new Date());
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const target = profile?.dailyTarget ?? { calories: 2000, protein: 150, carbs: 200, fat: 65 };

  const setSlot = useCallback(
    (dateKey: string, slot: MealSlotType, recipe: Recipe | null) => {
      const day: DayPlan = { ...plan[dateKey] };
      if (recipe) {
        day[slot] = recipeToSlot(recipe);
      } else {
        day[slot] = null;
      }
      const next: MealPlan = { ...plan, [dateKey]: day };
      persistPlan(next);
      setPicker(null);
    },
    [plan, persistPlan]
  );

  if (!ready || !profile?.completedOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Meal Planner</h1>
            <p className="text-sm text-zinc-400">
              Plan your week. Add recipes from your recent suggestions.
            </p>
          </div>
          <Link
            href="/ingredients"
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black"
          >
            Find recipes
          </Link>
        </div>

        <div className="space-y-6">
          {weekDates.map((date) => {
            const dateKey = formatDateKey(date);
            const dayPlan = plan[dateKey] ?? {};
            const slots = SLOTS.map((s) => dayPlan[s.key] ?? null);
            const total = sumMacros(slots);
            const isToday = dateKey === formatDateKey(new Date());

            return (
              <div
                key={dateKey}
                className={`rounded-2xl border bg-[var(--card)] p-4 ${
                  isToday ? "border-[var(--accent)]/50 ring-1 ring-[var(--accent)]/20" : "border-[var(--card-border)]"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-semibold text-white">
                    {formatDayLabel(date)}
                    {isToday && (
                      <span className="ml-2 text-xs text-[var(--accent)]">Today</span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {total.calories} cal
                    {total.calories > 0 && (
                      <span
                        className={
                          total.calories <= target.calories * 1.1
                            ? " text-[var(--remaining)]"
                            : " text-amber-400"
                        }
                      >
                        {" "}
                        / {target.calories} target
                      </span>
                    )}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {SLOTS.map(({ key, label }) => {
                    const slotRecipe = dayPlan[key];
                    return (
                      <div
                        key={key}
                        className="rounded-xl border border-[var(--card-border)] bg-zinc-900/50 p-3"
                      >
                        <p className="mb-2 text-xs font-medium text-zinc-500">
                          {label}
                        </p>
                        {slotRecipe ? (
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-white">
                                {slotRecipe.title}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {slotRecipe.macros.calories} cal · P{slotRecipe.macros.protein}
                                C{slotRecipe.macros.carbs} F{slotRecipe.macros.fat}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => addToGroceries([`Ingredients for: ${slotRecipe.title}`], slotRecipe.title)}
                                className="text-xs text-[var(--accent)] hover:underline"
                              >
                                Add to grocery
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setPicker({ dateKey, slot: key })
                                }
                                className="text-xs text-[var(--accent)] hover:underline"
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                onClick={() => setSlot(dateKey, key, null)}
                                className="text-xs text-zinc-500 hover:text-red-400"
                                aria-label="Remove"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPicker({ dateKey, slot: key })}
                            className="w-full rounded-lg border border-dashed border-[var(--card-border)] py-2 text-sm text-zinc-500 transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                          >
                            + Add recipe
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {lastRecipes.length === 0 && (
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
            <p className="text-zinc-400">
              Generate recipes from ingredients to add them here.
            </p>
            <Link
              href="/ingredients"
              className="mt-3 inline-block text-sm font-medium text-[var(--accent)]"
            >
              Go to ingredient scanner →
            </Link>
          </div>
        )}
      </div>

      {/* Recipe picker modal */}
      {picker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => setPicker(null)}
        >
          <div
            className="max-h-[70vh] w-full max-w-md rounded-t-2xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">Choose a recipe</h3>
              <button
                type="button"
                onClick={() => setPicker(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {lastRecipes.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-400">
                No recent recipes. Generate some from the ingredient scanner first.
              </p>
            ) : (
              <ul className="space-y-2 overflow-y-auto">
                {lastRecipes.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setSlot(picker.dateKey, picker.slot, r)
                      }
                      className="w-full rounded-xl border border-[var(--card-border)] bg-zinc-800/50 p-3 text-left transition-colors hover:border-[var(--accent)]/50"
                    >
                      <p className="font-medium text-white">{r.title}</p>
                      <p className="text-xs text-zinc-400">
                        {r.macros.calories} cal · P{r.macros.protein} C{r.macros.carbs}{" "}
                        F{r.macros.fat}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
