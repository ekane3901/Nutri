"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  getGroceries,
  toggleGroceryChecked,
  removeGrocery,
  clearCheckedGroceries,
} from "@/lib/store";
import type { GroceryItem } from "@/types/nutrify";

export default function GroceriesPage() {
  const router = useRouter();
  const { profile, ready } = useApp();
  const [items, setItems] = useState<GroceryItem[]>([]);

  useEffect(() => {
    if (!ready) return;
    if (!profile?.completedOnboarding) {
      router.replace("/onboarding");
      return;
    }
    setItems(getGroceries());
  }, [ready, profile, router]);

  const refresh = () => setItems(getGroceries());

  const handleToggle = (id: string) => {
    toggleGroceryChecked(id);
    refresh();
  };

  const handleRemove = (id: string) => {
    removeGrocery(id);
    refresh();
  };

  const handleClearChecked = () => {
    clearCheckedGroceries();
    refresh();
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  if (!ready || !profile?.completedOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Groceries</h1>
            <p className="text-sm text-zinc-400">
              {items.length} items · Add from recipe pages
            </p>
          </div>
          {checkedCount > 0 && (
            <button
              type="button"
              onClick={handleClearChecked}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Clear checked ({checkedCount})
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
            <span className="mb-4 block text-5xl">🛒</span>
            <p className="font-medium text-white">Your list is empty</p>
            <p className="mt-1 text-sm text-zinc-400">
              Open a recipe and tap &quot;Add to grocery&quot; to add ingredients here.
            </p>
            <Link
              href="/ingredients"
              className="mt-6 inline-block rounded-xl bg-[var(--accent)] px-6 py-2 font-semibold text-black"
            >
              Find recipes
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {unchecked.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  To buy
                </h2>
                <ul className="space-y-2">
                  {unchecked.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggle(item.id)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-transparent"
                        aria-label="Mark bought"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block text-white">{item.name}</span>
                        {item.sourceRecipes && item.sourceRecipes.length > 0 && (
                          <p className="mt-0.5 text-xs text-zinc-500">
                            For: {item.sourceRecipes.join(", ")}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="shrink-0 text-zinc-500 hover:text-red-400"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {checked.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Bought
                </h2>
                <ul className="space-y-2">
                  {checked.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)]/60 px-4 py-3"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggle(item.id)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[var(--remaining)] bg-[var(--remaining)]"
                        aria-label="Mark not bought"
                      >
                        <span className="text-xs text-black">✓</span>
                      </button>
                      <div className="min-w-0 flex-1">
                        <span className="block text-zinc-500 line-through">{item.name}</span>
                        {item.sourceRecipes && item.sourceRecipes.length > 0 && (
                          <p className="mt-0.5 text-xs text-zinc-600">
                            For: {item.sourceRecipes.join(", ")}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="shrink-0 text-zinc-500 hover:text-red-400"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
