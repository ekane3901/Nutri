"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import SearchImage from "@/components/SearchImage";
import { addToGroceries } from "@/lib/store";
import type { Recipe, Substitution } from "@/types/nutrify";

function ingredientImageQuery(ingredient: string): string {
  const part = ingredient.split(",")[0]?.trim() ?? ingredient;
  const words = part.replace(/^[\d½¼¾\/\.\s]+/, "").trim().split(/\s+/);
  return words.slice(0, 2).join(" ").toLowerCase() || "food";
}

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { profile, lastRecipes } = useApp();
  const [substituteFor, setSubstituteFor] = useState<string | null>(null);
  const [substitutions, setSubstitutions] = useState<Substitution[] | null>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [addedToGrocery, setAddedToGrocery] = useState(false);

  const recipe = lastRecipes.find((r) => r.id === id);

  async function handleSubstitute(ingredient: string) {
    setSubstituteFor(ingredient);
    setSubstitutions(null);
    setSubLoading(true);
    try {
      const res = await fetch("/api/substitute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredient,
          recipeContext: recipe?.title,
          goal: profile?.goal ?? "maintenance",
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.substitutions)) {
        setSubstitutions(data.substitutions);
      }
    } catch {
      setSubstitutions([]);
    } finally {
      setSubLoading(false);
    }
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-8 py-10">
        <p className="text-zinc-500">Recipe not found.</p>
        <Link href="/ingredients" className="mt-4 inline-block text-[var(--accent)]">
          Start over
        </Link>
      </div>
    );
  }

  const ingredientsToShow = showAllIngredients ? recipe.ingredients : recipe.ingredients.slice(0, 5);
  const hasMoreIngredients = recipe.ingredients.length > 5;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero with recipe photo */}
      <div className="relative h-64 w-full overflow-hidden bg-zinc-800 md:h-80">
        <div className="absolute inset-0">
          <SearchImage
            query={recipe.title}
            alt={recipe.title}
            size="large"
            generate
            className="!h-full !w-full"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <Link
          href="/recipes"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur"
        >
          ←
        </Link>
        <button
          type="button"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur"
          aria-label="Save recipe"
        >
          ♡
        </button>
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">{recipe.title}</h1>
          <p className="mt-1 flex items-center justify-center gap-2 text-sm text-zinc-200 drop-shadow">
            <span className="text-[var(--accent)]">★</span> {(recipe.goalAlignmentScore / 20 + 3.5).toFixed(1)} · {recipe.cuisine ?? "Main dishes"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-8 py-10">
        {/* Goal Alignment Score */}
        <div className="mb-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent)]">🎯</span>
              <div>
                <p className="font-semibold text-white">Goal Alignment Score</p>
                <p className="text-xs text-zinc-400">{recipe.goalLabel}</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{recipe.goalAlignmentScore}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${recipe.goalAlignmentScore}%` }}
            />
          </div>
        </div>

        {/* Key metrics: Time, Servings, Calories, Level */}
        <div className="mb-6 grid grid-cols-4 gap-2">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 text-center">
            <p className="text-xs text-zinc-400">Time</p>
            <p className="font-semibold text-white">{recipe.prepMinutes ?? 25} min</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 text-center">
            <p className="text-xs text-zinc-400">Servings</p>
            <p className="font-semibold text-white">4</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 text-center">
            <p className="text-xs text-zinc-400">Calories</p>
            <p className="font-semibold text-white">{recipe.macros.calories}</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 text-center">
            <p className="text-xs text-zinc-400">Level</p>
            <p className="font-semibold text-white">{recipe.difficulty ?? "Easy"}</p>
          </div>
        </div>

        {/* Macronutrients */}
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
          Macronutrients
        </h2>
        <div className="mb-6 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 text-center">
            <p className="text-xs text-zinc-400">Protein</p>
            <p className="font-bold text-[var(--protein)]">{recipe.macros.protein}g</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 text-center">
            <p className="text-xs text-zinc-400">Carbs</p>
            <p className="font-bold text-[var(--carbs)]">{recipe.macros.carbs}g</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 text-center">
            <p className="text-xs text-zinc-400">Fat</p>
            <p className="font-bold text-[var(--fat)]">{recipe.macros.fat}g</p>
          </div>
        </div>

        {/* About */}
        <h2 className="mb-2 text-lg font-semibold text-white">About</h2>
        <p className="mb-3 text-sm text-zinc-400">{recipe.description}</p>
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1 text-xs text-zinc-300">
            Protein-rich
          </span>
          <span className="rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1 text-xs text-zinc-300">
            Quick
          </span>
        </div>

        {/* Ingredients */}
        <h2 className="mb-3 text-lg font-semibold text-white">Ingredients</h2>
        <div className="mb-4 flex flex-wrap gap-3">
          {recipe.ingredients.slice(0, 8).map((ing, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <SearchImage
                query={ingredientImageQuery(ing)}
                alt={ing}
                size="small"
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl"
              />
              <span className="max-w-[4rem] truncate text-center text-xs text-zinc-500" title={ing}>
                {ingredientImageQuery(ing)}
              </span>
            </div>
          ))}
        </div>
        <ul className="mb-4 space-y-2">
          {ingredientsToShow.map((ing, i) => (
            <li key={i} className="flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              <span className="flex-1 text-sm text-white">{ing}</span>
              <button
                type="button"
                onClick={() => handleSubstitute(ing)}
                className="text-xs text-[var(--accent)] hover:underline"
              >
                Swap
              </button>
            </li>
          ))}
        </ul>
        {hasMoreIngredients && !showAllIngredients && (
          <button
            type="button"
            onClick={() => setShowAllIngredients(true)}
            className="text-sm text-[var(--accent)]"
          >
            View all {recipe.ingredients.length} ingredients
          </button>
        )}

        {substituteFor && (
          <div className="mb-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <h3 className="mb-2 font-semibold text-white">Smart swaps for &quot;{substituteFor}&quot;</h3>
            {subLoading && <p className="text-sm text-zinc-400">Loading…</p>}
            {!subLoading && substitutions && substitutions.length > 0 && (
              <ul className="space-y-2 text-sm text-zinc-300">
                {substitutions.map((s, i) => (
                  <li key={i}>
                    <strong className="text-white">{s.swap}</strong> — {s.note}
                  </li>
                ))}
              </ul>
            )}
            <button type="button" onClick={() => { setSubstituteFor(null); setSubstitutions(null); }} className="mt-2 text-xs text-[var(--accent)]">
              Dismiss
            </button>
          </div>
        )}

        {/* Instructions */}
        <h2 className="mb-3 text-lg font-semibold text-white">Instructions</h2>
        <ol className="mb-6 space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-black">
                {i + 1}
              </span>
              <span className="text-sm text-zinc-300">{step}</span>
            </li>
          ))}
        </ol>

        {/* Quick Actions */}
        <h2 className="mb-3 text-lg font-semibold text-white">Quick Actions</h2>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!recipe.ingredients?.length}
            onClick={() => {
              const added = addToGroceries(recipe.ingredients ?? [], recipe.title);
              setAddedToGrocery(added.length > 0);
            }}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-4 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--card)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--card-border)] disabled:hover:bg-[var(--card)]"
          >
            <span className="text-2xl" aria-hidden>🛒</span>
            <span className="font-medium text-white">Add to groceries</span>
            <span className="text-xs text-zinc-500">
              {addedToGrocery ? "Added to list" : recipe.ingredients?.length ? `${recipe.ingredients.length} items` : "No ingredients"}
            </span>
          </button>
          <Link
            href={`/recipes/${id}/cook`}
            className="flex flex-col items-center gap-1 rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-4 transition-opacity hover:opacity-90"
          >
            <span className="text-2xl text-[var(--accent)]">👨‍🍳</span>
            <span className="font-medium text-white">Start Cooking</span>
            <span className="text-xs text-zinc-500">Step-by-step</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
