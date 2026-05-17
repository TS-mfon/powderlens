# PowderLens

PowderLens is a Mantle-native capital rotation radar focused on yield-asset migration, incentive-sensitive LP behavior, and protocol flow intelligence.

## Apps

- `apps/api`: VPS-hosted API
- `apps/worker`: VPS-hosted background processor
- `apps/web`: Vercel-hosted frontend

## Core workflow

1. Ingest Mantle flow data
2. Score unusual rotations across yield assets and liquidity venues
3. Generate structured AI signal cards
4. Persist signal metadata on-chain
5. Deliver alerts and operator review surfaces

## Local development

1. Run the shared infrastructure in `../shared-infra`
2. Create a PostgreSQL database named `powderlens`
3. Apply `apps/api/db/schema.sql`
4. Apply `apps/api/db/seed.sql`
5. Install dependencies with `npm install`
6. Start each app:
   - `npm run dev:api`
   - `npm run dev:worker`
   - `npm run dev:web`

## Production notes

- API and worker are VPS-ready through Docker
- frontend remains Vercel-oriented
- PostgreSQL is the source of truth for signals, alert rules, theses, and admin audit logs
- smart contract registry skeletons live in `contracts/`
