import type { Macros } from "@/types/nutrify";

function Ring({
  value,
  max,
  color,
  label,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
}) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  const r = 36;
  const c = 2 * Math.PI * r;
  const stroke = (pct / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-zinc-200 dark:text-zinc-700"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={c - stroke}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <span className="mt-1 text-xs font-medium text-zinc-500">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

export default function MacroRing({
  current,
  target,
}: {
  current: Macros;
  target: Macros;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-8 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <Ring
        value={current.calories}
        max={target.calories}
        color="text-amber-500"
        label="Cal"
      />
      <Ring
        value={current.protein}
        max={target.protein}
        color="text-blue-500"
        label="P"
      />
      <Ring
        value={current.carbs}
        max={target.carbs}
        color="text-emerald-500"
        label="C"
      />
      <Ring
        value={current.fat}
        max={target.fat}
        color="text-violet-500"
        label="F"
      />
    </div>
  );
}
