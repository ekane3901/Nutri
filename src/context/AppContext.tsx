"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Recipe, UserProfile } from "@/types/nutrify";
import { getStoredProfile, setStoredProfile } from "@/lib/store";

interface AppState {
  profile: UserProfile | null;
  ready: boolean;
  lastRecipes: Recipe[];
  setProfile: (p: UserProfile) => void;
  setLastRecipes: (r: Recipe[]) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [lastRecipes, setLastRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    setProfileState(getStoredProfile());
    setReady(true);
  }, []);

  const setProfile = useCallback((p: UserProfile) => {
    setStoredProfile(p);
    setProfileState(p);
  }, []);

  const setLastRecipesStable = useCallback((r: Recipe[]) => {
    setLastRecipes(r);
  }, []);

  return (
    <AppContext.Provider
      value={{
        profile,
        ready,
        lastRecipes,
        setProfile,
        setLastRecipes: setLastRecipesStable,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
