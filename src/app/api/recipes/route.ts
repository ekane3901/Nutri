import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createHash } from "crypto";
import { getRecipeCached, setRecipeCached } from "@/lib/api-cache";

const RECIPE_JSON_SCHEMA = `Return a JSON object with a single key "recipes" that is an array of exactly 3 recipe objects. Each recipe must have:
- title: string
- description: string (one short sentence)
- cuisine: string (e.g. Mediterranean, Asian, American)
- difficulty: "Easy" or "Medium" or "Hard"
- calories: number
- protein: number (grams)
- carbs: number (grams)
- fat: number (grams)
- goalAlignmentScore: number (0-100, how well it fits the user's goal)
- goalLabel: string (e.g. "optimal for your cut")
- ingredients: string[] (exact list with quantities where helpful)
- steps: string[] (numbered steps as separate strings)
- prepMinutes: number`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not found in environment variables" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { ingredients, goal = "maintenance" } = body;

    if (!ingredients || (typeof ingredients !== "string" && !Array.isArray(ingredients))) {
      return NextResponse.json(
        { error: "Ingredients are required (string or array)" },
        { status: 400 }
      );
    }

    const ingredientList =
      typeof ingredients === "string"
        ? ingredients
            .split(/[,;]/)
            .map((s: string) => s.trim())
            .filter(Boolean)
        : ingredients;

    if (ingredientList.length === 0) {
      return NextResponse.json(
        { error: "Provide at least one ingredient" },
        { status: 400 }
      );
    }

    const sorted = [...ingredientList].sort();
    const recipeCacheKey = createHash("sha256").update(`${sorted.join(",")}|${goal}`).digest("hex").slice(0, 24);
    const cached = getRecipeCached(recipeCacheKey);
    if (cached) return NextResponse.json(cached);

    const openai = new OpenAI({ apiKey });

    const prompt = `You are a nutrition and recipe assistant. The user has these ingredients: ${ingredientList.join(", ")}. Their diet goal is: ${goal}.

${RECIPE_JSON_SCHEMA}

Use only (or mostly) the ingredients listed. Be realistic with macros. Output valid JSON only, no markdown or extra text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You respond only with valid JSON. No markdown code blocks, no explanation.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "No response from model" },
        { status: 502 }
      );
    }

    // Strip markdown code blocks if present (e.g. ```json ... ```)
    let jsonStr = raw.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```\w*\n?/, "").replace(/\n?```$/, "").trim();
    }

    let parsed: { recipes?: unknown[] };
    try {
      parsed = JSON.parse(jsonStr) as { recipes?: unknown[] };
    } catch (parseErr) {
      console.error("Recipes API: JSON parse failed", parseErr);
      return NextResponse.json(
        { error: "Recipe response was invalid. Please try again." },
        { status: 502 }
      );
    }
    const recipes: unknown[] = Array.isArray(parsed.recipes) ? parsed.recipes : [];

    const normalized = recipes.slice(0, 3).map((r, i) => {
      const row = r as Record<string, unknown>;
      return {
      id: `gpt-${i}-${Date.now()}`,
      title: String(row.title ?? "Untitled"),
      description: String(row.description ?? ""),
      cuisine: row.cuisine ? String(row.cuisine) : undefined,
      difficulty: ["Easy", "Medium", "Hard"].includes(String(row.difficulty ?? ""))
        ? (row.difficulty as "Easy" | "Medium" | "Hard")
        : undefined,
      macros: {
        calories: Number(row.calories) || 0,
        protein: Number(row.protein) || 0,
        carbs: Number(row.carbs) || 0,
        fat: Number(row.fat) || 0,
      },
      goalAlignmentScore: Number(row.goalAlignmentScore) || 70,
      goalLabel: String(row.goalLabel ?? "fits your goal"),
      ingredients: Array.isArray(row.ingredients)
        ? row.ingredients.map(String)
        : [],
      steps: Array.isArray(row.steps) ? row.steps.map(String) : [],
      prepMinutes: Number(row.prepMinutes) || 20,
    };
    });

    const result = { recipes: normalized };
    setRecipeCached(recipeCacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in recipes API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
