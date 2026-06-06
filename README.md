# Nutrify AI — Intelligent Nutrition & Meal Planning Platform

A full-stack AI-powered nutrition app that generates personalized recipes from your available ingredients, tracks macros over time, and provides data-driven insights into your eating habits.

**[Live Demo](https://nutrify-ai.vercel.app)** · **[GitHub](https://github.com/ekane3901/Nutri)**

---

## Overview

Nutrify AI solves a real problem: most people don't know what to cook with what they have, struggle to hit macro targets, and waste food. This app combines GPT-4o recipe generation with a PostgreSQL analytics layer to give users personalized, goal-aligned meal suggestions and track their nutritional patterns over time.

---

## Features

### AI & API Integration
- **GPT-4o Recipe Generation** — natural language recipe suggestions from any combination of ingredients, tailored to your diet goal (cutting, bulking, keto, vegan, high protein, maintenance)
- **Ingredient Substitution Engine** — AI-powered swap suggestions when you're missing an ingredient, with macro impact analysis
- **Fridge Photo Scan** — upload a photo of your fridge and get ingredient detection via vision API
- **Voice Input** — Web Speech API integration for hands-free ingredient entry
- **DALL-E 3 Image Generation** — generates appetizing food photography for each recipe
- **Structured AI Outputs** — all GPT-4o responses validated with Zod schemas for type safety

### Data Analytics Dashboard
- **30-day macro trend charts** — calorie, protein, carb, and fat tracking over time (Recharts)
- **Goal Adherence Score** — percentage of days within ±15% of your calorie target
- **Nutrient Gap Analysis** — identifies which macros you're consistently under or over on
- **Daily macro totals** — aggregated via a PostgreSQL view (`daily_macro_totals`)
- **7 / 14 / 30 day range selector** — adjustable analytics window

### Nutrition & Health Tracking
- **TDEE/BMR Calculator** — Mifflin-St Jeor equations with activity level multipliers
- **Goal-based macro targets** — automatically calculated targets for each diet mode
- **Daily check-in system** — mood and energy logging with AI-generated personalized insights, persisted to Supabase
- **Meal planner** — weekly calendar with breakfast/lunch/dinner slots and macro totals per day

### Full-Stack Engineering
- **PostgreSQL backend** via Supabase with relational schema (profiles, checkin_logs, recipe_logs)
- **Row Level Security** enabled on all tables
- **In-memory API cache** — SHA-256 keyed TTL cache reducing redundant OpenAI API calls
- **Grocery list manager** — smart deduplication, source recipe tracking
- **Favorites & recipe history** — persistent across sessions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| AI / APIs | OpenAI GPT-4o, DALL-E 3, Unsplash API, Web Speech API |
| Database | Supabase (PostgreSQL) |
| Validation | Zod schema validation on all API responses |
| Analytics | Recharts (LineChart, BarChart) |
| Deployment | Vercel + Supabase |

---

## Architecture
'''
src/
├── app/
│   ├── api/
│   │   ├── recipes/        # GPT-4o recipe generation with Zod validation
│   │   ├── substitute/     # Ingredient substitution engine
│   │   └── image/          # DALL-E 3 + Unsplash image pipeline
│   ├── analytics/          # Macro trends dashboard (Recharts)
│   ├── checkin/            # Daily mood/energy logging → Supabase
│   ├── dashboard/          # Home with quick actions and goal summary
│   ├── ingredients/        # Ingredient input with voice recognition
│   ├── planner/            # Weekly meal planner with macro totals
│   └── recipes/            # Recipe detail and step-by-step cook mode
├── lib/
│   ├── supabase.ts         # Typed Supabase client
│   ├── store.ts            # Data layer (Supabase + localStorage)
│   ├── schemas.ts          # Zod validation schemas
│   ├── tdee.ts             # BMR/TDEE calculations
│   └── api-cache.ts        # In-memory TTL cache
└── types/
└── nutrify.ts          # Shared TypeScript types
'''
---

## Database Schema

```sql
profiles          -- User stats, goals, and macro targets
checkin_logs      -- Daily mood/energy entries with AI insights
recipe_logs       -- Meal tracking for analytics pipeline
daily_macro_totals -- Aggregated view for analytics dashboard
```

---

## Local Setup

```bash
git clone https://github.com/ekane3901/Nutri.git
cd Nutri
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```

**Required environment variables:**
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
---

## What This Demonstrates

- **AI/API integration** — structured GPT-4o outputs, prompt engineering, response validation
- **Full-stack development** — Next.js App Router, API routes, PostgreSQL, real-time data
- **Data analytics** — time-series macro tracking, aggregation views, interactive charts
- **TypeScript** — end-to-end type safety with Zod runtime validation
- **Software engineering** — caching layer, error handling, component architecture
