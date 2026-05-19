# Repo Semantic Summary - kadi-tiri-game

Generated: 2026-05-19 21:48 UTC

## What This Repo Is For
Kadi Tiri is a web-based multiplayer implementation of a traditional trick-taking card game with server-owned room state, bidding, partner selection, trick play, and score settlement.

## Snapshot
- Domains: game, web app
- Tech stack: Next.js, React, TypeScript, Zustand, Bootstrap
- Pending state: documented
- Status confidence: high
- Current work guess: The current engineering focus is hardening the game into a server-authoritative multiplayer model with live sync.
- Graph stats: 351 nodes · 574 edges · 28 communities (25 shown, 3 thin omitted)

## Features
- Playable room flow with setup, bidding, sir selection, partner selection, trick play, and end-of-round scoring
- Support for 4, 6, and 8 player modes with easy and hard rule variants where applicable
- Server-owned room creation, joins, and gameplay mutations in the current Next.js implementation
- Playwright end-to-end coverage for local multiplayer prototype flows and follow-suit enforcement
- Documented rules model and changelog aligned to the current V2 rules implementation

## Pending
- Remove client full-state persistence and fallback writes
- Keep browser storage only for `playerId` and last joined `gameId`
- Remove any endpoint that accepts full `gameState` writes from the client
- Add SSE endpoint for per-game updates
- Replace 250ms polling with SSE subscription

## Read First
- `README.md`
- `PLAN.md`
- `src/types/game.ts`
- `src/utils/gameUtils.ts`

## Likely Entrypoints
- `README.md`
- `PLAN.md`
- `src/store/gameStore.ts`
- `src/utils/gameUtils.ts`

## Main Modules
- `src`
- `data`
- `node_modules`
- `screenshots`
- `store`

## Conservative Suggestions
- Finish the server-authoritative state transition work
- Replace polling with SSE-based live updates
- Prepare persistence hardening after the live-sync model is stable

## Evidence Files
- `README.md`
- `PLAN.md`
- `CHANGELOG.md`

## Graph Signals
- God nodes: GameState, dependencies, compilerOptions, useGameStore, nextUpdatedAt()
