# kadi-tiri-game Known Pitfalls

- client full-state persistence is intentionally being removed; any code path that reintroduces it undermines server authority
- polling can create stale or wasteful synchronization under heavier multiplayer churn
- browser storage should remain limited to player identity and last-joined game references
- Realtime sync work is mid-transition; avoid touching multiplayer state paths without validating authority assumptions.
