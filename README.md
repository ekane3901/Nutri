# Nutrify

You tell Nutrify what's in your fridge and what your goal is — it tells you exactly what to cook, how much to eat, and why it fits your plan.

## Getting Started

### 1. Environment (GPT)

Copy the example env and add your OpenAI API key (used for recipe generation, vision scan, and substitutions):

```bash
cp .env.example .env
```

Edit `.env` and set:

```
OPENAI_API_KEY=sk-your-actual-key
```

Get a key at [OpenAI API keys](https://platform.openai.com/api-keys).

### 2. Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech

- **Frontend:** Next.js
- **AI:** GPT-4o (recipe generation, fridge photo scan, substitutions)
- **Data:** USDA FoodData Central, Supabase (auth, profiles)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Deploy on Vercel](https://nextjs.org/docs/app/building-your-application/deploying)
