This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## AI / Supabase integration status

The UI (login, onboarding, customers, projects, estimates, calendar, settings)
currently runs entirely on `localStorage` mock data — no live backend yet.
This session added, on top of that:

- **Supabase schema**: `supabase/migrations/0001_init.sql` defines
  `companies` / `users` / `quotes` / `quote_items` / `past_quote_imports`
  with `company_id`-scoped Row Level Security, and comments the intended
  shape of future `calendar_events` / `invoices` / `company_integrations`
  tables so they can be added without breaking this schema. Client helpers
  live in `lib/supabase/{client,server}.ts`, but nothing in the app calls
  them yet — the existing auth/data flow is untouched.
- **AI-assisted onboarding import**: `/register` now has an import step
  that uploads a past-quote Excel file to `POST /api/onboarding/parse-quotes`,
  which parses it with `xlsx` and asks Claude to extract
  `{category, name, unit, unitPrice}` patterns. If the column layout can't
  be confidently detected, the UI shows the detected headers and lets the
  user manually specify which column is which before re-running the parse
  (per spec: "ズレを検知したらユーザーに確認を求めるUI"). Accepted items are
  stored via `lib/quoteItemsStorage.ts` (localStorage today, same shape as
  the `quote_items` table).
- **AI-assisted quote drafting**: `/estimates/new` has an "AIが品目案を提案"
  button that calls `POST /api/estimates/suggest` with the project name and
  the company's accumulated `quote_items` patterns, and shows suggested line
  items with a short reason for each. Nothing is added automatically — the
  user checks which suggestions to accept, and everything remains editable
  before the quote can be saved, per the "金額に関わる生成結果は必ず人が確認
  ・編集してから確定する" requirement.

**Assumptions made without a live environment to confirm against:**
- No Supabase project or Anthropic API key was available in the dev
  environment this was built in, so none of the above was tested against a
  real backend. Both API routes fail with a clear Japanese error message
  (not a crash) when their required env var is missing.
- Auth, customers, projects, calendar, and settings were intentionally left
  on the existing mock/localStorage implementation — migrating them to
  Supabase Auth/DB is a larger, separate change not attempted here.
- Copy this repo's `.env.example` to `.env.local` and fill in
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, and `ANTHROPIC_API_KEY` to exercise the new
  routes for real; run the SQL in `supabase/migrations/0001_init.sql`
  against a Supabase project via the SQL editor or `supabase db push`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
