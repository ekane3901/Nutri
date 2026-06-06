"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getMacroAnalytics } from "@/lib/store";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface DayData {
  date_key: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meals_logged: number;
}

export default function AnalyticsPage() {
  const { profile } = useApp();
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<7 | 14 | 30>(30);

  useEffect(() => {
    setLoading(true);
    getMacroAnalytics(range)
      .then(setData)
      .finally(() => setLoading(false));
  }, [range]);

  const target = profile?.dailyTarget ?? {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
  };

  const avg =
    data.length > 0
      ? {
          calories: data.reduce((s, d) => s + d.total_calories, 0) / data.length,
          protein: data.reduce((s, d) => s + d.total_protein, 0) / data.length,
          carbs: data.reduce((s, d) => s + d.total_carbs, 0) / data.length,
          fat: data.reduce((s, d) => s + d.total_fat, 0) / data.length,
        }
      : null;

  const chartData = data.map((d) => ({
    date: d.date_key.slice(5),
    Calories: d.total_calories,
    Protein: d.total_protein,
    Carbs: d.total_carbs,
    Fat: d.total_fat,
    Target: target.calories,
  }));

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="mb-2 inline-block text-sm text-[var(--accent)] hover:underline">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-white">Nutrition Analytics</h1>
            <p className="text-sm text-zinc-400">Your macro trends and goal adherence over time</p>
          </div>
          <div className="flex gap-2">
            {([7, 14, 30] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  range === r
                    ? "bg-[var(--accent)] text-black"
                    : "border border-[var(--card-border)] bg-[var(--card)] text-zinc-400 hover:text-white"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] py-20 text-center">
            <span className="mb-4 block text-5xl">📊</span>
            <p className="font-semibold text-white">No data yet</p>
            <p className="mt-2 text-sm text-zinc-400">Add recipes to your meal planner to start tracking macros.</p>
            <Link href="/planner" className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline">
              Go to Planner →
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <p className="mb-1 text-sm text-zinc-400">Days Tracked</p>
                <p className="text-5xl font-bold text-white">{data.length}</p>
                <p className="mt-2 text-xs text-zinc-500">Last {range} days</p>
              </div>
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <p className="mb-1 text-sm text-zinc-400">Avg Calories</p>
                <p className="text-5xl font-bold text-amber-400">{avg ? Math.round(avg.calories) : "—"}</p>
                <p className="mt-2 text-xs text-zinc-500">Target: {target.calories}</p>
              </div>
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <p className="mb-1 text-sm text-zinc-400">Avg Protein</p>
                <p className="text-5xl font-bold text-blue-400">{avg ? Math.round(avg.protein) : "—"}g</p>
                <p className="mt-2 text-xs text-zinc-500">Target: {target.protein}g</p>
              </div>
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <p className="mb-1 text-sm text-zinc-400">Meals Logged</p>
                <p className="text-5xl font-bold text-emerald-400">{data.reduce((s, d) => s + d.meals_logged, 0)}</p>
                <p className="mt-2 text-xs text-zinc-500">Total meals</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="mb-6 font-semibold text-white">Calorie Trend vs Target</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", color: "#fff" }} />
                  <Legend />
                  <Line type="monotone" dataKey="Calories" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Target" stroke="#6b7280" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="mb-6 font-semibold text-white">Daily Macro Breakdown</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", color: "#fff" }} />
                  <Legend />
                  <Bar dataKey="Protein" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Carbs" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Fat" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
