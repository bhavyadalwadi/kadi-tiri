# Game Client Store

## Responsibility
Coordinate UI state, player session persistence, and server calls from the Zustand store.

## Dependencies
- Next.js
- React
- TypeScript
- Zustand
- Bootstrap

## Inbound APIs
- `POST /api/game/create`
- `POST /api/game/join`
- `GET /api/game/state`
- `POST /api/game/action`

## Outbound APIs
- `POST /api/game/create`
- `POST /api/game/join`
- `GET /api/game/state`
- `POST /api/game/action`

## Databases Used
- SQLite or file-backed local data store
- `sql.js` browser/local database path

## Queues / Topics
- browser-driven end-to-end checks
- client polling for game state
- planned SSE replacement for lower-latency sync

## Critical Workflows
- create/join game flows
- action dispatch to `/api/game/action`
- session restore and resync

## Failure Modes
- client full-state persistence is intentionally being removed; any code path that reintroduces it undermines server authority
- polling can create stale or wasteful synchronization under heavier multiplayer churn
- browser storage should remain limited to player identity and last-joined game references

## Scaling Concerns
- scale pressure will show up first in the stateful/data boundary
- no heavyweight horizontal scaling layer is visible from the repo docs

## Operational Concerns
- validate environment and schema prerequisites before changing behavior
- use the repo-local docs in `.claude/` plus Graphify entrypoints before editing

## Important Source Files
- `README.md`
- `PLAN.md`
- `src/store/gameStore.ts`
- `src/utils/gameUtils.ts`
- `README.MD`
- `Plan.md`

## Dangerous Code Paths
- client full-state persistence is intentionally being removed; any code path that reintroduces it undermines server authority
- polling can create stale or wasteful synchronization under heavier multiplayer churn
- browser storage should remain limited to player identity and last-joined game references

## Testing Strategy
- `npm run test`
- `npm run lint`
- `npm run test:e2e`
- `npm run test:coverage`

## Known Technical Debt
- Remove client full-state persistence and fallback writes
- Keep browser storage only for `playerId` and last joined `gameId`
- Remove any endpoint that accepts full `gameState` writes from the client
- Add SSE endpoint for per-game updates
- Replace 250ms polling with SSE subscription
