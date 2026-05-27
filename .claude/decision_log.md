# kadi-tiri-game Decision Log

## Graphify-first repo discovery
- Decision: Graphify-first repo discovery
- Why: Many repos already keep `graphify-out/` committed, which is a deliberate low-token navigation layer.
- Tradeoffs: Fast onboarding and lower context cost
- Operational implications: Semantic packs can become stale if not refreshed.

## Preserve repo separation
- Decision: Preserve repo separation
- Why: The workspace favors many focused repos instead of one monorepo.
- Tradeoffs: Lower blast radius and clearer product boundaries
- Operational implications: Cross-repo reuse stays lightweight and mostly conceptual.

## Server-authoritative multiplayer direction
- Decision: Server-authoritative multiplayer direction
- Why: Graphify summary and store code show a move away from client full-state writes.
- Tradeoffs: More reliable multiplayer invariants
- Operational implications: Requires stronger sync and endpoint validation.
