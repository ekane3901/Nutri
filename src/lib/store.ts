import { supabase } from "./supabase";
import type {
  UserProfile,
  MealPlan,
  RecipeHistoryEntry,
  GroceryItem,
  CheckinLog,
  Recipe,
} from "@/types/nutrify";

// ─── Local storage keys (kept for non-critical data) ───────────────────────
const MEAL_PLAN_KEY = "nutrify_meal_plan";
const RECIPE_HISTORY_KEY = "nutrify_recipe_history";
const GROCERY_KEY = "nutrify_groceries";
const FAVORITES_KEY = "nutrify_favorites";
const PROFILE_KEY = "nutrify_profile";
const USER_ID_KEY = "nutrify_user_id";
const MAX_HISTORY = 50;
const MAX_FAVORITES = 100;

// ─── User ID helpers ────────────────────────────────────────────────────────
export function getLocalUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function setLocalUserId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_ID_KEY, id);
}

// ─── Profile ────────────────────────────────────────────────────────────────
export function getStoredProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function setStoredProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

/** Save profile to Supabase and return the row id */
export async function saveProfileToSupabase(
  profile: UserProfile
): Promise<string | null> {
  try {
    const existingId = getLocalUserId();
    const row = {
      name: profile.name,
      age: profile.age,
      weight_kg: profile.weightKg,
      height_cm: profile.heightCm,
      activity_level: profile.activityLevel,
      goal: profile.goal,
      daily_target_calories: profile.dailyTarget.calories,
      daily_target_protein: profile.dailyTarget.protein,
      daily_target_carbs: profile.dailyTarget.carbs,
      daily_target_fat: profile.dailyTarget.fat,
      tdee: profile.tdee,
    };

    if (existingId) {
      const { error } = await supabase
        .from("profiles")
        .update({ ...row, updated_at: new Date().toISOString() })
        .eq("id", existingId);
      if (error) throw error;
      return existingId;
    } else {
      const { data, error } = await supabase
        .from("profiles")
        .insert(row)
        .select("id")
        .single();
      if (error) throw error;
      if (data?.id) setLocalUserId(data.id);
      return data?.id ?? null;
    }
  } catch (err) {
    console.error("saveProfileToSupabase error:", err);
    return null;
  }
}

// ─── Check-in logs ──────────────────────────────────────────────────────────
export async function saveCheckinToSupabase(
  entry: Omit<CheckinLog, "id" | "createdAt">
): Promise<CheckinLog | null> {
  try {
    const userId = getLocalUserId();
    if (!userId) throw new Error("No user id");
    const { data, error } = await supabase
      .from("checkin_logs")
      .insert({
        id: `checkin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        user_id: userId,
        date_key: entry.dateKey,
        mood: entry.mood,
        energy: entry.energy,
        note: entry.note ?? null,
        ai_response: entry.aiResponse ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      dateKey: data.date_key,
      mood: data.mood,
      energy: data.energy,
      note: data.note ?? undefined,
      aiResponse: data.ai_response ?? undefined,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error("saveCheckinToSupabase error:", err);
    return null;
  }
}

export async function getCheckinsFromSupabase(): Promise<CheckinLog[]> {
  try {
    const userId = getLocalUserId();
    if (!userId) return [];
    const { data, error } = await supabase
      .from("checkin_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(365);
    if (error) throw error;
    return (data ?? []).map((d) => ({
      id: d.id,
      dateKey: d.date_key,
      mood: d.mood,
      energy: d.energy,
      note: d.note ?? undefined,
      aiResponse: d.ai_response ?? undefined,
      createdAt: d.created_at,
    }));
  } catch (err) {
    console.error("getCheckinsFromSupabase error:", err);
    return [];
  }
}

// ─── Recipe logs (meal tracking → analytics) ────────────────────────────────
export async function logRecipeToSupabase(
  recipe: Recipe,
  dateKey: string,
  mealSlot: string
): Promise<void> {
  try {
    const userId = getLocalUserId();
    if (!userId) return;
    await supabase.from("recipe_logs").insert({
      id: `rlog-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      user_id: userId,
      date_key: dateKey,
      meal_slot: mealSlot,
      recipe_id: recipe.id,
      recipe_title: recipe.title,
      calories: recipe.macros.calories,
      protein: recipe.macros.protein,
      carbs: recipe.macros.carbs,
      fat: recipe.macros.fat,
    });
  } catch (err) {
    console.error("logRecipeToSupabase error:", err);
  }
}

export async function getMacroAnalytics(days = 30): Promise<
  {
    date_key: string;
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    meals_logged: number;
  }[]
> {
  try {
    const userId = getLocalUserId();
    if (!userId) return [];
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceKey = since.toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("daily_macro_totals")
      .select("*")
      .eq("user_id", userId)
      .gte("date_key", sinceKey)
      .order("date_key", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((d) => ({
      date_key: d.date_key,
      total_calories: Number(d.total_calories),
      total_protein: Number(d.total_protein),
      total_carbs: Number(d.total_carbs),
      total_fat: Number(d.total_fat),
      meals_logged: Number(d.meals_logged),
    }));
  } catch (err) {
    console.error("getMacroAnalytics error:", err);
    return [];
  }
}

// ─── Meal plan (localStorage — fast, week-scoped) ───────────────────────────
export function getStoredMealPlan(): MealPlan {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MEAL_PLAN_KEY);
    return raw ? (JSON.parse(raw) as MealPlan) : {};
  } catch {
    return {};
  }
}

export function setStoredMealPlan(plan: MealPlan): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));
}

// ─── Recipe history (localStorage) ──────────────────────────────────────────
export function getRecipeHistory(): RecipeHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECIPE_HISTORY_KEY);
    const list = raw ? (JSON.parse(raw) as RecipeHistoryEntry[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addRecipeHistory(
  entry: Omit<RecipeHistoryEntry, "id" | "createdAt">
): RecipeHistoryEntry {
  const list = getRecipeHistory();
  const newEntry: RecipeHistoryEntry = {
    ...entry,
    id: `hist-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newEntry);
  const trimmed = list.slice(0, MAX_HISTORY);
  if (typeof window !== "undefined")
    localStorage.setItem(RECIPE_HISTORY_KEY, JSON.stringify(trimmed));
  return newEntry;
}

// ─── Groceries (localStorage) ────────────────────────────────────────────────
export function getGroceries(): GroceryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GROCERY_KEY);
    const list = raw ? (JSON.parse(raw) as GroceryItem[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function setGroceries(items: GroceryItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GROCERY_KEY, JSON.stringify(items));
}

export function addToGroceries(
  names: string[],
  recipeTitle?: string
): GroceryItem[] {
  const list = getGroceries();
  const added: GroceryItem[] = [];
  const now = new Date().toISOString();
  const sources = recipeTitle ? [recipeTitle] : [];
  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    const existing = list.find((i) => i.name.toLowerCase() === key);
    if (existing) {
      if (recipeTitle && !existing.sourceRecipes?.includes(recipeTitle)) {
        const updated = {
          ...existing,
          sourceRecipes: [...(existing.sourceRecipes ?? []), recipeTitle],
        };
        list[list.indexOf(existing)] = updated;
      }
      continue;
    }
    const item: GroceryItem = {
      id: `groc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: trimmed,
      checked: false,
      addedAt: now,
      sourceRecipes: sources.length > 0 ? sources : undefined,
    };
    list.push(item);
    added.push(item);
  }
  setGroceries(list);
  return added;
}

export function toggleGroceryChecked(id: string): void {
  setGroceries(
    getGroceries().map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
  );
}

export function removeGrocery(id: string): void {
  setGroceries(getGroceries().filter((i) => i.id !== id));
}

export function clearCheckedGroceries(): void {
  setGroceries(getGroceries().filter((i) => !i.checked));
}

// ─── Favorites (localStorage) ────────────────────────────────────────────────
export function getFavorites(): Recipe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const list = raw ? (JSON.parse(raw) as Recipe[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addFavorite(recipe: Recipe): void {
  const list = getFavorites();
  if (list.some((r) => r.id === recipe.id)) return;
  list.unshift(recipe);
  if (typeof window !== "undefined")
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list.slice(0, MAX_FAVORITES)));
}

export function removeFavorite(recipeId: string): void {
  if (typeof window !== "undefined")
    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(getFavorites().filter((r) => r.id !== recipeId))
    );
}

export function isFavorite(recipeId: string): boolean {
  return getFavorites().some((r) => r.id === recipeId);
}

export function getRecipeById(id: string): Recipe | null {
  const fav = getFavorites().find((r) => r.id === id);
  if (fav) return fav;
  for (const entry of getRecipeHistory()) {
    const r = entry.recipes?.find((rec) => rec.id === id);
    if (r) return r;
  }
  return null;
}