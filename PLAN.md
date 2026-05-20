# Kadi Tiri Plan

## Goal

Move the game to a server-authoritative multiplayer model, then add outbound webhooks.

## Phase 1: Server authority

- [x] Create/join/action APIs exist
- [x] Server persists game state
- [x] Remove client full-state persistence and fallback writes
- [x] Keep browser storage only for `playerId` and last joined `gameId`
- [x] Remove any endpoint that accepts full `gameState` writes from the client

## Phase 2: Live sync

- [x] Add server event objects for state transitions
- [x] Add SSE endpoint for per-game updates
- [x] Replace 250ms polling with SSE subscription

## Phase 3: Webhooks

- [x] Add webhook config and shared-secret signing
- [x] Emit webhook deliveries from server-side events only
- [x] Add retry/logging for failed deliveries

## Phase 4: Persistence hardening

- [x] Move from `data/games.json` to a real database
- [x] Persist event log separately from current state
- [x] Prepare webhook delivery state for retries/idempotency

## In progress now

- Evaluate whether the current local SQLite database should stay local-first or move to a hosted multi-instance database later.
