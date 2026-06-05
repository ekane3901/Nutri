"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { GOAL_LABELS } from "@/types/nutrify";

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (e: { results: Iterable<{ [i: number]: { transcript: string } }> }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Win = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance };
    const SpeechRecognitionAPI = Win.SpeechRecognition || Win.webkitSpeechRecognition;
    setSupported(!!SpeechRecognitionAPI);
    if (!SpeechRecognitionAPI) return;
    const rec = new SpeechRecognitionAPI();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e: { results: Iterable<{ [i: number]: { transcript: string } }> }) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      if (transcript.trim()) {
        const event = new CustomEvent("nutrify-voice-result", { detail: transcript });
        window.dispatchEvent(event);
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {}
    };
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) return;
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      setListening(false);
    }
  }, [listening]);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    setListening(false);
  }, []);

  return { listening, start, stop, supported };
}

export default function IngredientsPage() {
  const router = useRouter();
  const { profile } = useApp();
  const [inputValue, setInputValue] = useState("");
  const [list, setList] = useState<string[]>([]);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const { listening, start, stop, supported } = useSpeechRecognition();

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<string>;
      const text = ev.detail?.trim();
      if (text) {
        setInputValue((prev) => (prev ? `${prev}, ${text}` : text));
        setVoiceError(null);
      }
    };
    window.addEventListener("nutrify-voice-result", handler);
    return () => window.removeEventListener("nutrify-voice-result", handler);
  }, []);

  const addFromInput = useCallback(() => {
    const parts = inputValue
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) {
      setList((prev) => [...new Set([...prev, ...parts])]);
      setInputValue("");
    }
  }, [inputValue]);

  const remove = useCallback((index: number) => {
    setList((prev) => prev.filter((_, i) => i !== index));
  }, []);

  function handleFindRecipes() {
    const fromInput = inputValue
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const all = fromInput.length ? [...new Set([...list, ...fromInput])] : list;
    if (all.length === 0) return;
    if (fromInput.length) {
      setList((prev) => [...new Set([...prev, ...fromInput])]);
      setInputValue("");
    }
    const q = encodeURIComponent(all.join(","));
    router.push(`/recipes?ingredients=${q}`);
  }

  const hasIngredients =
    list.length > 0 ||
    inputValue
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean).length > 0;

  const goalLabel = profile ? GOAL_LABELS[profile.goal]?.label ?? profile.goal : "Maintenance";

  function handleVoiceClick() {
    if (!supported) {
      setVoiceError("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    setVoiceError(null);
    if (listening) stop();
    else start();
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center">
      <div className="w-full max-w-2xl px-6 py-10 flex flex-col items-center">
        <Link href="/dashboard" className="mb-6 self-start text-sm text-[var(--accent)] hover:underline">
          ← Dashboard
        </Link>

        <div className="mb-8 w-full text-center">
          <h1 className="mb-1 text-2xl font-bold text-white">What to cook</h1>
          <p className="mb-4 text-zinc-400">Current goal: {goalLabel}</p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-zinc-500">
            <span className="rounded-full bg-[var(--card)] px-3 py-1">1. Add ingredients</span>
            <span className="text-zinc-600">→</span>
            <span className="rounded-full bg-[var(--card)] px-3 py-1">2. Generate recipes</span>
            <span className="text-zinc-600">→</span>
            <span className="rounded-full bg-[var(--card)] px-3 py-1">3. Pick one & cook</span>
          </div>
        </div>

        <div className="mb-8 w-full max-w-xl mx-auto rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="mb-1 font-semibold text-white">What’s in your fridge?</h2>
          <p className="mb-4 text-xs text-zinc-500">Type ingredients separated by commas, or use voice.</p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. chicken, broccoli, rice, olive oil..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFromInput()}
              className="flex-1 rounded-xl border border-[var(--card-border)] bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-[var(--accent)] focus:outline-none"
            />
            <button
              type="button"
              onClick={addFromInput}
              className="rounded-xl border border-[var(--card-border)] bg-zinc-800/50 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Add
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleVoiceClick}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                listening
                  ? "border-red-500/50 bg-red-500/20 text-red-400"
                  : "border-[var(--card-border)] bg-[var(--card)] text-white hover:bg-zinc-700"
              }`}
            >
              <span className="text-lg">{listening ? "⏹" : "🎤"}</span>
              {listening ? "Listening… (click to stop)" : "Voice input"}
            </button>
            {voiceError && <p className="text-xs text-amber-400">{voiceError}</p>}
          </div>

          {list.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium text-zinc-500">Your list ({list.length})</p>
              <ul className="flex flex-wrap gap-2">
                {list.map((item, i) => (
                  <li
                    key={`${item}-${i}`}
                    className="flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-zinc-800/50 px-3 py-1.5 text-sm text-white"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-zinc-400 hover:text-white"
                      aria-label={`Remove ${item}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={handleFindRecipes}
            disabled={!hasIngredients}
            className="mt-6 w-full rounded-xl bg-[var(--accent)] py-3 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Generate AI recipes
          </button>
        </div>

        <div className="w-full max-w-xl mx-auto rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/50 p-5 text-center">
          <p className="text-sm text-zinc-400">
            Recipes are tailored to your <strong className="text-zinc-300">{goalLabel}</strong> goal with calories and macros. Click a recipe to see steps and start cooking.
          </p>
        </div>
      </div>
    </div>
  );
}
