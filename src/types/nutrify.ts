export type DietMode =
  | "cutting"
  | "bulking"
  | "maintenance"
  | "keto"
  | "vegan"
  | "high_protein";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface UserProfile {
  name: string;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: DietMode;
  dailyTarget: Macros;
  tdee: number;
  completedOnboarding: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  macros: Macros;
  goalAlignmentScore: number;
  goalLabel: string;
  ingredients: string[];
  steps: string[];
  prepMinutes?: number;
}

export interface Substitution {
  original: string;
  swap: string;
  macroShift: Partial<Macros>;
  note: string;
}

/** One saved "session" of generated recipes */
export interface RecipeHistoryEntry {
  id: string;
  ingredientsQuery: string;
  recipes: Recipe[];
  createdAt: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  checked: boolean;
  addedAt: string;
  /** Recipe title(s) this item is for (when added from recipe(s)) */
  sourceRecipes?: string[];
}

export type MealSlotType = "breakfast" | "lunch" | "dinner";

/** Stored slot: enough to display and sum macros without full recipe */
export interface PlanSlot {
  recipeId: string;
  title: string;
  macros: Macros;
}

/** One day: breakfast, lunch, dinner (each optional) */
export type DayPlan = Partial<Record<MealSlotType, PlanSlot | null>>;

/** Key = YYYY-MM-DD */
export type MealPlan = Record<string, DayPlan>;

export const GOAL_LABELS: Record<DietMode, { label: string; icon: string }> = {
  cutting: { label: "Cutting", icon: "🔥" },
  bulking: { label: "Bulking", icon: "💪" },
  maintenance: { label: "Maintenance", icon: "⚖️" },
  keto: { label: "Keto", icon: "🥑" },
  vegan: { label: "Vegan / Plant-based", icon: "🌱" },
  high_protein: { label: "High Protein", icon: "⚡" },
};

/** One daily check-in log entry */
export interface CheckinLog {
  id: string;
  dateKey: string; // YYYY-MM-DD
  mood: string;
  energy: string;
  note?: string;
  aiResponse?: string;
  createdAt: string;
}