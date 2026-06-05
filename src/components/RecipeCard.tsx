"use client";

import type { Recipe } from "@/types/nutrify";
import SearchImage from "@/components/SearchImage";
import { addToGroceries } from "@/lib/store";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const pct = recipe.goalAlignmentScore;
  const color =
    pct >= 80 ? "text-[var(--remaining)]" : pct >= 60 ? "text-[var(--accent)]" : "text-zinc-500";
  const hasIngredients = recipe.ingredients?.length > 0;

  return (
    <article className="block rounded-2xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden transition-opacity hover:opacity-95">
      <div className="flex gap-4 p-4 sm:p-5">
        <SearchImage
          query={recipe.title}
          alt={recipe.title}
          size="small"
          rounded="full"
          generate
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white truncate">{recipe.title}</h3>
            <span className={`shrink-0 text-sm font-bold ${color}`}>
              {pct}%
            </span>
          </div>
          {recipe.cuisine && (
            <p className="mb-0.5 text-xs uppercase tracking-wide text-zinc-500">{recipe.cuisine}</p>
          )}
          <p className="mb-2 line-clamp-2 text-sm text-zinc-400">{recipe.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            {recipe.prepMinutes != null && <span>🕐 {recipe.prepMinutes} min</span>}
            <span className="text-[var(--accent)]">★ {Math.min(5, (pct / 20) + 4).toFixed(1)}</span>
            <span>{recipe.macros.calories} cal</span>
            <span>P:{recipe.macros.protein} C:{recipe.macros.carbs} F:{recipe.macros.fat}</span>
          </div>
        </div>
      </div>
      {hasIngredients && (
        <div className="border-t border-[var(--card-border)] px-4 py-2 sm:px-5">
          <p className="text-xs text-zinc-500">
            <span className="font-medium">Ingredients: </span>
            {recipe.ingredients!.slice(0, 4).join(", ")}
            {recipe.ingredients!.length > 4 && "…"}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToGroceries(recipe.ingredients ?? [], recipe.title);
            }}
            className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-zinc-800/50 py-2 text-xs font-medium text-[var(--accent)] transition-colors hover:border-[var(--accent)]/50 hover:bg-zinc-800"
          >
            🛒 Add to groceries
          </button>
        </div>
      )}
    </article>
  );
}
