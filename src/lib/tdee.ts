import type { ActivityLevel, DietMode, Macros } from "@/types/nutrify";

const ACTIVITY_MULT: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateBMR(weightKg: number, heightCm: number, age: number, isFemale: boolean): number {
  if (isFemale) {
    return 655 + 9.6 * weightKg + 1.8 * heightCm - 4.7 * age;
  }
  return 66 + 13.7 * weightKg + 5 * heightCm - 6.8 * age;
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULT[activityLevel]);
}

export function getTargetsForGoal(tdee: number, goal: DietMode): Macros {
  const base = { calories: tdee, protein: 120, carbs: 200, fat: 65 };
  switch (goal) {
    case "cutting":
      return {
        calories: Math.round(tdee * 0.8),
        protein: 180,
        carbs: 160,
        fat: 55,
      };
    case "bulking":
      return {
        calories: Math.round(tdee * 1.1),
        protein: 180,
        carbs: 280,
        fat: 80,
      };
    case "keto":
      return {
        calories: Math.round(tdee * 0.9),
        protein: 140,
        carbs: 25,
        fat: 150,
      };
    case "vegan":
      return {
        calories: tdee,
        protein: 130,
        carbs: 220,
        fat: 60,
      };
    case "high_protein":
      return {
        calories: tdee,
        protein: 200,
        carbs: 180,
        fat: 60,
      };
    default:
      return base;
  }
}
