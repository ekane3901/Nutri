"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { RecipeHistoryEntry } from "@/types/nutrify";
import { getRecipeHistory } from "@/lib/store";

export default function HistoryPage() {
  const [entries, setEntries] = useState<RecipeHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getRecipeHistory());
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <Link href="/dashboard" className="mb-6 inline-block text-sm text-[var(--accent)] hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-white">Recipe history</h1>
        <p className="mb-8 text-zinc-400">
          Past recipe sets you generated. Click one to view and open recipes again.
        </p>

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
            <p className="text-zinc-500">No history yet.</p>
            <p className="mt-2 text-sm text-zinc-500">Generate recipes from What to cook and they’ll appear here.</p>
            <Link href="/ingredients" className="mt-4 inline-block text-[var(--accent)] hover:underline">
              What to cook →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/recipes?history=${encodeURIComponent(entry.id)}`}
                  className="block rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-opacity hover:opacity-95"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-white">
                      {entry.recipes.length} recipe{entry.recipes.length !== 1 ? "s" : ""}: {entry.recipes.map((r) => r.title).join(", ")}
                    </p>
                    <span className="text-xs text-zinc-500">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-zinc-500">Ingredients: {entry.ingredientsQuery}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
