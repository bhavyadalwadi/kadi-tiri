# kadi-tiri-game Workflows

## Local Development
- `npm install`
- `npm run dev`

## Testing
- `npm run test`
- `npm run lint`
- `npm run test:e2e`
- `npm run test:coverage`

## Deployment
- Standard Next.js deployment with Jest and Playwright coverage; currently optimized for local browser-based multiplayer.

## Migrations
- Not present.

## Feature Rollout
- Keep rollout incremental and local-first
- For smaller repos, treat release as manual verification plus commit hygiene

## Incident Response
- start from the documented entrypoints and current runtime env
- verify recent schema/config drift before assuming logic bugs
- for infrastructure repos, validate container/network state before editing config

## Debugging
- read Graphify summary first when available
- reproduce from the smallest affected entrypoint
- check env variables, schema state, and local generated artifacts before deeper rewrites

## Rollback
- prefer reverting the smallest safe change
- restore previous schema or env assumptions if a stateful flow regressed
- no automated rollback system is visible unless the runtime platform provides one

## Observability Investigation
- use local logs, UI symptoms, and test output as the primary signal path
