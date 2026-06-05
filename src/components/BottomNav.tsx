"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/ingredients", label: "Search", icon: "🔍" },
  { href: "/planner", label: "Planner", icon: "📅" },
  { href: "/favorites", label: "Favorites", icon: "❤️" },
  { href: "/dashboard", label: "Profile", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/onboarding") return null;
  const isActive = (href: string, label: string) => {
    if (label === "Home") return pathname === "/dashboard";
    if (label === "Search" || label === "Recipes") return pathname === "/ingredients" || pathname?.startsWith("/recipes");
    if (label === "Planner") return pathname === "/planner";
    if (label === "Favorites") return pathname === "/favorites";
    if (label === "Profile") return pathname === "/dashboard";
    return pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--card-border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon }) => (
          <Link
            key={href + label}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
              isActive(href, label)
                ? "text-[var(--accent)]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
            {isActive(href, label) && (
              <span className="h-0.5 w-4 rounded-full bg-[var(--accent)]" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
