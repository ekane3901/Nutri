import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createHash } from "crypto";
import { getSubstituteCached, setSubstituteCached } from "@/lib/api-cache";

function substituteCacheKey(ingredient: string, recipeContext: string, goal: string): string {
  const raw = `${ingredient}|${recipeContext ?? ""}|${goal}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not set" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { ingredient, recipeContext, goal = "maintenance" } = body;
    if (!ingredient || typeof ingredient !== "string") {
      return NextResponse.json(
        { error: "ingredient is required" },
        { status: 400 }
      );
    }

    const key = substituteCacheKey(ingredient, String(recipeContext ?? ""), goal);
    const cached = getSubstituteCached(key);
    if (cached) return NextResponse.json(cached);

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You respond only with valid JSON. No markdown. Return a JSON object with key 'substitutions': an array of 2-3 substitution objects. Each has: swap (string), note (string), macroShift (object with optional protein, carbs, fat as numbers, delta in grams).",
        },
        {
          role: "user",
          content: `The user is making a recipe${recipeContext ? `: ${recipeContext}` : ""}. They don't have "${ingredient}". Diet goal: ${goal}. Suggest 2-3 ingredient swaps that preserve similar macros where possible. Return JSON: { "substitutions": [ { "swap": "...", "note": "...", "macroShift": { "protein": 0, "carbs": 0, "fat": 0 } }, ... ] }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "No response" },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(raw) as { substitutions?: unknown[] };
    const list = Array.isArray(parsed.substitutions) ? parsed.substitutions : [];
    const substitutions = list.slice(0, 3).map((s) => {
      const row = s as Record<string, unknown>;
      return {
        original: ingredient,
        swap: String(row.swap ?? ""),
        note: String(row.note ?? ""),
        macroShift: (row.macroShift as Partial<{ protein: number; carbs: number; fat: number }>) ?? {},
      };
    });

    const result = { substitutions };
    setSubstituteCached(key, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Substitute API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
