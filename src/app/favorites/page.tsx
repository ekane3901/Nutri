"use client";

import Link from "next/link";

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <h1 className="mb-1 text-2xl font-bold text-white">Favorite Recipes</h1>
        <p className="mb-8 text-zinc-400">0 recipes saved</p>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--card-border)] bg-[var(--card)] py-16">
          <span className="mb-4 text-5xl text-[var(--accent)]">❤️</span>
          <p className="font-medium text-white">No favorites yet</p>
          <p className="mt-1 text-sm text-zinc-400">Save recipes from the recipe detail screen.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ingredients"
              className="rounded-xl bg-[var(--accent)] px-6 py-2 font-semibold text-black"
            >
              Find recipes
            </Link>
            <Link
              href="/groceries"
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-6 py-2 font-semibold text-white hover:border-[var(--accent)]/50"
            >
              🛒 Groceries
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
