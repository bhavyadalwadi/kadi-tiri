# kadi-tiri-game Project Context

Generated: 2026-05-27 01:50 UTC

## Business Purpose
Kadi Tiri is a web-based multiplayer implementation of a traditional trick-taking card game with server-owned room state, bidding, partner selection, trick play, and score settlement.

## System Overview
This repo centers on Next.js multiplayer game client, server-authoritative game state API.

## Major Applications
- Next.js multiplayer game client
- server-authoritative game state API

## Environments
- local development
- production-like deployment only when explicitly documented in README/infra files

## Tech Stack
- Next.js
- React
- TypeScript
- Zustand
- Bootstrap

## Critical Dependencies
- `@playwright/test`
- `@testing-library/jest-dom`
- `@testing-library/react`
- `@types/node`
- `@types/react`
- `@types/react-dom`
- `bootstrap`
- `class-variance-authority`
- `clsx`
- `eslint`
- `eslint-config-next`
- `framer-motion`

## Major Workflows
- Playable room flow with setup, bidding, sir selection, partner selection, trick play, and end-of-round scoring
- Support for 4, 6, and 8 player modes with easy and hard rule variants where applicable
- Server-owned room creation, joins, and gameplay mutations in the current Next.js implementation
- Playwright end-to-end coverage for local multiplayer prototype flows and follow-suit enforcement
- Documented rules model and changelog aligned to the current V2 rules implementation

## Operational Constraints
- client full-state persistence is intentionally being removed; any code path that reintroduces it undermines server authority
- polling can create stale or wasteful synchronization under heavier multiplayer churn
- browser storage should remain limited to player identity and last-joined game references

## Scaling Constraints
- This repo has active product or operational intent; changes should assume future iteration rather than a one-off snapshot.

## Deployment Model
Standard Next.js deployment with Jest and Playwright coverage; currently optimized for local browser-based multiplayer.

## Important APIs
- `POST /api/game/create`
- `POST /api/game/join`
- `GET /api/game/state`
- `POST /api/game/action`

## Important Databases
- SQLite or file-backed local data store
- `sql.js` browser/local database path

## Important Queues / Events
- browser-driven end-to-end checks
- client polling for game state
- planned SSE replacement for lower-latency sync

## Known Technical Debt
- Remove client full-state persistence and fallback writes
- Keep browser storage only for `playerId` and last joined `gameId`
- Remove any endpoint that accepts full `gameState` writes from the client
- Add SSE endpoint for per-game updates
- Replace 250ms polling with SSE subscription

## Current Architecture Themes
- Tier A repo under the `_personal` workspace
- Graphify-first repository discovery
- preserve current architecture instead of speculative rewrites
