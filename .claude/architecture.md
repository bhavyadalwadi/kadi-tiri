# kadi-tiri-game Architecture

## End-to-End Request Flows
- Browser UI -> Zustand store in `src/store/gameStore.ts` -> `/api/game/*` endpoints -> authoritative game state -> client polling/session restore

## Frontend / Backend Interaction
- API boundaries are repo-local; inspect the listed entrypoints before changing wire contracts

## Service Boundaries
- Next.js multiplayer game client
- server-authoritative game state API

## Sync vs Async Flows
- browser-driven end-to-end checks
- client polling for game state
- planned SSE replacement for lower-latency sync

## Event-Driven Architecture
- No dedicated event bus, broker, or queue consumer layer is visible in the inspected files.

## Caching Layers
- Next.js build/runtime caching may affect server/client rendering behavior
- `no-store` game state fetches to avoid stale multiplayer state
- browser session/local storage only for player session helpers

## Auth Flow
No account auth; player identity is tracked through generated player ids stored in session/local storage.

## Deployment Topology
Standard Next.js deployment with Jest and Playwright coverage; currently optimized for local browser-based multiplayer.

## Scaling Behavior
- Active repo; scaling pressure will first appear in the data/API boundary rather than in broad service fan-out
- No autoscaling or multi-region story is visible unless infra files explicitly add one

## Resilience Mechanisms
- Focused local tests or e2e coverage
- typed validation and repo-local guardrails where implemented
- manual fallbacks remain part of the operating model for many repos in this workspace

## Failover Behavior
- No formal failover topology is documented; failure handling is mostly local retries, manual restart, or degraded fallback.

## Observability Architecture
- console logs and local UI feedback are the default observability path

## Retry / Idempotency Patterns
- protect state-changing endpoints from duplicate actions where the repo explicitly calls this out
