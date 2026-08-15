# UNDERSOLE

An editorial web zine about India's sneaker and streetwear scene, with Issue 01 stories and a real newsletter signup.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/undersole/src/pages/Home.tsx` — Issue 01 landing page
- `artifacts/undersole/src/pages/IssuePage.tsx` — long-form reader and interactive editorial components
- `artifacts/undersole/src/components/editorial.tsx` — shared navigation, newsletter, lightbox, quote, audio, and story-card UI
- `artifacts/undersole/src/index.css` — UNDERSOLE visual language and responsive layout
- `lib/api-spec/openapi.yaml` — source of truth for subscriber API contracts
- `artifacts/api-server/src/routes/subscriptions.ts` — subscriber count, signup, and protected email test routes
- `lib/db/src/schema/subscribers.ts` — persistent subscriber schema

## Architecture decisions

- The frontend is a React + Vite artifact while the shared Express API owns subscriptions and email delivery.
- Subscriber emails are normalized and persisted in PostgreSQL with a unique constraint before welcome-email delivery is attempted.
- Resend failures are logged but do not invalidate a successful subscription.
- The public UI uses generated API hooks from the OpenAPI contract.

## Product

- Read the full Issue 01 editorial with a fixed progress indicator and table of contents.
- Browse five story previews, open the cover in a lightbox, filter the customizer ranking, copy pull quotes, and toggle the interview audio shell.
- Subscribe inline from the homepage or reader page and receive a Resend welcome email when configured.

## User preferences

- Keep the visual language dark, editorial, sharp-edged, and rooted in Indian sneaker culture.

## Gotchas

- `RESEND_API_KEY` is required for welcome-email delivery; subscription persistence still succeeds if Resend is unavailable.
- The protected `/api/subscribe/test` route also requires `ADMIN_PASS` to be configured.
- Run API codegen after changing `lib/api-spec/openapi.yaml`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
