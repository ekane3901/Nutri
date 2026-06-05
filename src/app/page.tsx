"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function Home() {
  const router = useRouter();
  const { profile, ready } = useApp();

  useEffect(() => {
    if (!ready) return;
    if (profile?.completedOnboarding) {
      router.replace("/dashboard");
    } else {
      router.replace("/onboarding");
    }
  }, [ready, profile, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-zinc-500">Taking you to Nutrify…</p>
      </div>
    </div>
  );
}
