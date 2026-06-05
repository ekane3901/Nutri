"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function CookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { lastRecipes } = useApp();
  const [stepIndex, setStepIndex] = useState(0);

  const recipe = lastRecipes.find((r) => r.id === id);
  const steps = recipe?.steps ?? [];
  const totalSteps = steps.length;
  const currentStep = stepIndex + 1;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  function handleNext() {
    if (isLast) {
      router.push("/dashboard");
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  if (!recipe || totalSteps === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
        <p className="text-zinc-500">Recipe or steps not found.</p>
        <Link href={`/recipes/${id}`} className="mt-4 text-[var(--accent)]">
          Back to recipe
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <header className="border-b border-[var(--card-border)] px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/recipes/${id}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card)] text-white"
          >
            ←
          </Link>
          <h1 className="font-bold text-white">{recipe.title}</h1>
        </div>
        <div className="mt-3 flex items-center gap-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i < currentStep ? "bg-[var(--accent)]" : i === stepIndex ? "bg-[var(--accent)] opacity-60" : "bg-zinc-600"
              }`}
            />
          ))}
        </div>
        <p className="mt-1 text-sm text-zinc-400">Step {currentStep} of {totalSteps}</p>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-[var(--accent)]/20 text-4xl font-bold text-[var(--accent)]">
          {currentStep}
        </div>
        <p className="mb-6 max-w-sm text-center text-xl font-medium text-white">
          {steps[stepIndex]}
        </p>
        {isLast && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-[var(--remaining)]/20 px-4 py-2 text-[var(--remaining)]">
            <span>✓</span>
            <span className="font-medium">Final step - you&apos;re almost done!</span>
          </div>
        )}
      </div>

      <footer className="border-t border-[var(--card-border)] px-4 py-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={isFirst}
            className="flex-1 rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-3 font-medium text-white disabled:opacity-50"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 rounded-xl bg-[var(--accent)] py-3 font-semibold text-black"
          >
            {isLast ? "Finish Cooking" : "Next Step →"}
          </button>
        </div>
        <div className="mt-3 flex justify-center gap-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i <= stepIndex ? "bg-[var(--accent)]" : "bg-zinc-600"
              }`}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}
