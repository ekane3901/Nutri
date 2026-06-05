"use client";

import type { DietMode } from "@/types/nutrify";

const MODES: { value: DietMode; label: string; short: string }[] = [
  { value: "cutting", label: "Cutting", short: "Cut" },
  { value: "bulking", label: "Bulking", short: "Bulk" },
  { value: "maintenance", label: "Maintenance", short: "Maintain" },
  { value: "keto", label: "Keto", short: "Keto" },
  { value: "vegan", label: "Vegan", short: "Vegan" },
  { value: "high_protein", label: "High Protein", short: "High P" },
];

export default function DietModeSelector({
  value,
  onChange,
}: {
  value: DietMode;
  onChange: (mode: DietMode) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {MODES.map((m) => (
        <button
          key={m.value}
          type="button"
          onClick={() => onChange(m.value)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            value === m.value
              ? "bg-emerald-600 text-white dark:bg-emerald-500"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
