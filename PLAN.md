# Kadi Tiri Plan

## Goal

Move the game to a server-authoritative multiplayer model, then add outbound webhooks.

## Phase 1: Server authority

- [x] Create/join/action APIs exist
- [x] Server persists game state
- [ ] Remove client full-state persistence and fallback writes
- [ ] Keep browser storage only for `playerId` and last joined `gameId`
- [ ] Remove any endpoint that accepts full `gameState` writes from the client

## Phase 2: Live sync

- [ ] Add server event objects for state transitions
- [ ] Add SSE endpoint for per-game updates
- [ ] Replace 250ms polling with SSE subscription

## Phase 3: Webhooks

- [ ] Add webhook config and shared-secret signing
- [ ] Emit webhook deliveries from server-side events only
- [ ] Add retry/logging for failed deliveries

## Phase 4: Persistence hardening

- [ ] Move from `data/games.json` to a real database
- [ ] Persist event log separately from current state
- [ ] Prepare webhook delivery state for retries/idempotency

## In progress now

- Remove remaining client-side game-state persistence so server reads are the source of truth.
