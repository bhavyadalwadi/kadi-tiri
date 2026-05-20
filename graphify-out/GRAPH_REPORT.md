# Graph Report - kadi-tiri-game  (2026-05-20)

## Corpus Check
- 59 files · ~140,112 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 407 nodes · 710 edges · 30 communities (26 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `035b3417`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]

## God Nodes (most connected - your core abstractions)
1. `GameState` - 18 edges
2. `dependencies` - 16 edges
3. `compilerOptions` - 15 edges
4. `useGameStore` - 15 edges
5. `nextUpdatedAt()` - 13 edges
6. `scripts` - 12 edges
7. `Card` - 11 edges
8. `createGameEvent()` - 10 edges
9. `useSoundEffects()` - 9 edges
10. `publishGameEvent()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `createInitialGameState()` --calls--> `getDifficultyConfig()`  [EXTRACTED]
  src/lib/server/gameFactory.ts → src/types/game.ts
- `PlayingCard()` --calls--> `useSoundEffects()`  [EXTRACTED]
  src/components/ui/PlayingCard.tsx → src/hooks/useSoundEffects.ts
- `GamePlayArea()` --calls--> `useGameStore`  [EXTRACTED]
  src/components/game/GamePlayArea.tsx → src/store/gameStore.ts
- `GameBoard()` --calls--> `useGameStore`  [EXTRACTED]
  src/components/game/GameBoard.tsx → src/store/gameStore.ts
- `DealingAnimation()` --calls--> `useSoundEffects()`  [EXTRACTED]
  src/components/game/DealingAnimation.tsx → src/hooks/useSoundEffects.ts

## Communities (30 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (51): GameActionRequest, BiddingPanel(), BiddingPanelProps, DealingAnimation(), DealingAnimationProps, GameBoard(), GameFinishedModalProps, GamePlayArea() (+43 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (30): author, description, devDependencies, eslint, eslint-config-next, jest, jest-environment-jsdom, @playwright/test (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.19
Nodes (19): databaseFile, dataDir, dbQueue, ensureDataDir(), fileExists(), getCount(), getDatabase(), initSqlJs (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (42): actionEventTypes, GameActionType, ActionResult, applyPassBid(), applyPlaceBid(), applyPlayCard(), applySelectPartners(), applySelectPowerhouse() (+34 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (23): GameEvent, appendGameEvent(), dataDir, ensureEventLogFile(), ensureFile(), ensureWebhookDeliveryFile(), eventLogFile, getWebhookDelivery() (+15 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (20): activeBidPage(), activePassPage(), bidWinnerTeamScore, createFourPlayerFlow(), currentTurnName, gameError, handPanel, inactiveCard (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (19): BiddingPanelProps, BreakpointProps, CardAnimation, CardProps, ChatMessage, ChatProps, GameControlsProps, GameCreationSettings (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (20): Bid, ApiResponse, AudioManager, ConfigManager, DeepPartial, ErrorHandler, EventEmitter, GameError (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (16): dependencies, bootstrap, class-variance-authority, clsx, framer-motion, lucide-react, next, react (+8 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (12): Bidding, Changelog, Product and UX, Rules, Scoring, Teams and Partners, Technical, V2 Backend-Driven Room Flow (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (7): Goal, In progress now, Kadi Tiri Plan, Phase 1: Server authority, Phase 2: Live sync, Phase 3: Webhooks, Phase 4: Persistence hardening

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): code:block1 (Test timeout of 300000ms exceeded.), code:yaml (- generic [active] [ref=e1]:), Error details, Instructions, Page snapshot, Test info

### Community 13 - "Community 13"
Cohesion: 0.1
Nodes (31): handler(), handler(), handler(), handler(), config, handler(), StreamingResponse, handler() (+23 more)

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (3): createJestConfig, customJestConfig, nextJest

## Knowledge Gaps
- **183 isolated node(s):** `nextJest`, `createJestConfig`, `customJestConfig`, `name`, `version` (+178 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameState` connect `Community 0` to `Community 3`, `Community 13`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `Card` connect `Community 0` to `Community 3`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Player` connect `Community 3` to `Community 0`, `Community 13`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `nextJest`, `createJestConfig`, `customJestConfig` to the rest of the system?**
  _183 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._