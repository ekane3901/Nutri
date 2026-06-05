"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";
import type { Recipe } from "@/types/nutrify";
import { useApp } from "@/context/AppContext";
import { getRecipeHistory, addRecipeHistory } from "@/lib/store";

export default function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ ingredients?: string; history?: string }>;
}) {
  const params = use(searchParams);
  const { profile, setLastRecipes } = useApp();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ingredientsParam = params.ingredients ?? "";
  const historyId = params.history ?? "";
  let ingredientList: string[] = [];
  if (ingredientsParam) {
    try {
      const decoded = decodeURIComponent(ingredientsParam);
      ingredientList = decoded.split(",").map((s) => s.trim()).filter(Boolean);
    } catch {
      ingredientList = [];
    }
  }

  useEffect(() => {
    if (historyId) {
      const list = getRecipeHistory();
      const entry = list.find((e) => e.id === historyId);
      if (entry?.recipes?.length) {
        setRecipes(entry.recipes);
        setLastRecipes(entry.recipes);
      } else {
        setError("That history entry could not be found.");
      }
      setLoading(false);
      return;
    }
    if (ingredientList.length === 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredients: ingredientList,
            goal: profile?.goal ?? "maintenance",
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Could not load recipes");
          setRecipes([]);
          return;
        }
        const list = Array.isArray(data.recipes) ? (data.recipes as Recipe[]) : [];
        setRecipes(list);
        if (list.length > 0) {
          setLastRecipes(list);
          addRecipeHistory({ ingredientsQuery: ingredientList.join(", "), recipes: list });
        }
        if (list.length === 0) {
          setError("No recipes could be generated. Try different or more ingredients.");
        }
      } catch (e) {
        if (!cancelled) {
          setError("Network or server error. If recipe generation still fails, add OPENAI_API_KEY to nutrimind/.env.local.");
          setRecipes([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ingredientsParam, historyId, profile?.goal, setLastRecipes]);

  if (ingredientList.length === 0 && !historyId) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <div className="mx-auto max-w-6xl px-8 py-10">
          <Link href="/ingredients" className="mb-6 inline-block text-[var(--accent)]">
            ← Add ingredients
          </Link>
          <p className="text-zinc-400">
            Add ingredients on the previous screen, then tap &quot;Generate AI recipes&quot;. Or open a past set from <Link href="/history" className="text-[var(--accent)] hover:underline">History</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/ingredients" className="text-[var(--accent)] hover:underline">
            ← Change ingredients
          </Link>
          <Link href="/history" className="text-sm text-zinc-500 hover:text-zinc-300">
            History
          </Link>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Suggested recipes</h1>
        <p className="mb-6 text-zinc-400">Ranked by how well they fit your goal.</p>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            <p className="mt-4 text-sm text-zinc-500">Finding recipes…</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-amber-800 bg-amber-950/30 p-4 text-amber-200">
            {error}
          </div>
        )}

        {!loading && !error && recipes.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => (
              <Link key={r.id} href={`/recipes/${r.id}`}>
                <RecipeCard recipe={r} />
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && recipes.length === 0 && (
          <p className="text-zinc-500">No recipes found. Try different ingredients.</p>
        )}
      </div>
    </div>
  );
}
