"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/analytics", label: "Analytics" },
  { href: "/ingredients", label: "What to cook" },
  { href: "/history", label: "History" },
  { href: "/groceries", label: "Groceries" },
  { href: "/planner", label: "Planner" },
  { href: "/favorites", label: "Favorites" },
  { href: "/checkin", label: "Check-In" },
  { href: "/dashboard", label: "Profile" },
];

export default function Nav() {
  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding";
  const isRecipeStep = pathname?.includes("/cook");

  if (isOnboarding) return null;

  const isActive = (href: string, label: string) => {
    if (label === "Home" || label === "Profile") return pathname === "/dashboard";
    if (label === "What to cook") return pathname === "/ingredients" || pathname?.startsWith("/recipes");
    if (label === "History") return pathname === "/history";
    if (label === "Groceries") return pathname === "/groceries";
    if (label === "Planner") return pathname === "/planner";
    if (label === "Favorites") return pathname === "/favorites";
    if (label === "Check-In") return pathname === "/checkin";
    return pathname === href;
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--card-border)] bg-[var(--background)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-black text-xl">
            ✨
          </span>
          Nutrify
        </Link>
        {!isRecipeStep && (
          <div className="flex items-center gap-8">
            {navItems.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  isActive(href, label)
                    ? "text-[var(--accent)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
