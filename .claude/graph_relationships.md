# kadi-tiri-game Graph Relationships

       ## Service Dependency Graph
       kadi-tiri-game
-> Next.js multiplayer game client
-> server-authoritative game state API
-> Database: SQLite or file-backed local data store
-> Database: `sql.js` browser/local database path
-> API: `POST /api/game/create`
-> API: `POST /api/game/join`
-> API: `GET /api/game/state`
-> API: `POST /api/game/action`
-> Async: browser-driven end-to-end checks
-> Async: client polling for game state
-> Async: planned SSE replacement for lower-latency sync
-> Deployment: Standard Next.js deployment with Jest and Playwright coverage; currently optimized for local browser-based multiplayer.

       ## Runtime Dependency Graph
       kadi-tiri-game
-> Runtime: Next.js
-> Runtime: React
-> Runtime: TypeScript
-> Runtime: Zustand
-> Runtime: Bootstrap

       ## Database Relationship Graph
       kadi-tiri-game
-> SQLite or file-backed local data store
-> `sql.js` browser/local database path

       ## API Consumer / Provider Graph
       kadi-tiri-game
-> `POST /api/game/create`
-> `POST /api/game/join`
-> `GET /api/game/state`
-> `POST /api/game/action`

       ## Queue Publisher / Consumer Graph
       kadi-tiri-game
-> browser-driven end-to-end checks
-> client polling for game state
-> planned SSE replacement for lower-latency sync

       ## Shared Package Dependency Graph
       kadi-tiri-game
-> no notable shared package layer beyond app-local dependencies

       ## Deployment Relationship Graph
       kadi-tiri-game
       - Standard Next.js deployment with Jest and Playwright coverage; currently optimized for local browser-based multiplayer.

       ## Cross-Repo Relationship Graph
       kadi-tiri-game
-> no runtime dependency on sibling repos by default
