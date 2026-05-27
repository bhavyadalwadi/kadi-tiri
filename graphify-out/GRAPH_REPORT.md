# Graph Report - kadi-tiri-game  (2026-05-26)

## Corpus Check
- 80 files · ~272,843 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 553 nodes · 835 edges · 54 communities (42 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `574bd29f`
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
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]

## God Nodes (most connected - your core abstractions)
1. `GameState` - 18 edges
2. `dependencies` - 16 edges
3. `kadi-tiri-game Project Context` - 16 edges
4. `compilerOptions` - 15 edges
5. `useGameStore` - 15 edges
6. `Game Api` - 15 edges
7. `Game Client Store` - 15 edges
8. `kadi-tiri-game Architecture` - 14 edges
9. `nextUpdatedAt()` - 13 edges
10. `scripts` - 12 edges

## Surprising Connections (you probably didn't know these)
- `GamePlayArea()` --calls--> `useGameStore`  [EXTRACTED]
  src/components/game/GamePlayArea.tsx → src/store/gameStore.ts
- `createInitialGameState()` --calls--> `createDeck()`  [EXTRACTED]
  src/lib/server/gameFactory.ts → src/utils/gameUtils.ts
- `createInitialGameState()` --calls--> `removeCardsFromDeck()`  [EXTRACTED]
  src/lib/server/gameFactory.ts → src/utils/gameUtils.ts
- `PlayingCard()` --calls--> `useSoundEffects()`  [EXTRACTED]
  src/components/ui/PlayingCard.tsx → src/hooks/useSoundEffects.ts
- `GameSetup()` --calls--> `useGameStore`  [EXTRACTED]
  src/components/game/GameSetup.tsx → src/store/gameStore.ts

## Communities (54 total, 12 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (24): GameSetup(), buildPlayers(), createInitialGameState(), CreateRoomOptions, BiddingConfig, CreateGameRequest, Difficulty, DIFFICULTY_CONFIGS (+16 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (46): author, dependencies, bootstrap, class-variance-authority, clsx, framer-motion, lucide-react, next (+38 more)

### Community 2 - "Community 2"
Cohesion: 0.19
Nodes (19): databaseFile, dataDir, dbQueue, ensureDataDir(), fileExists(), getCount(), getDatabase(), initSqlJs (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (33): actionEventTypes, GameActionType, ActionResult, applyPassBid(), applyPlaceBid(), applyPlayCard(), applySelectPartners(), applySelectPowerhouse() (+25 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (24): GameEvent, appendGameEvent(), dataDir, ensureEventLogFile(), ensureFile(), ensureWebhookDeliveryFile(), eventLogFile, getWebhookDelivery() (+16 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (20): activeBidPage(), activePassPage(), bidWinnerTeamScore, createFourPlayerFlow(), currentTurnName, gameError, handPanel, inactiveCard (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (18): BiddingPanelProps, BreakpointProps, CardAnimation, CardProps, ChatMessage, ChatProps, GameControlsProps, GameCreationSettings (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (20): Bid, ApiResponse, AudioManager, ConfigManager, DeepPartial, ErrorHandler, EventEmitter, GameError (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (11): BiddingPanel(), BiddingPanelProps, DealingAnimation(), DealingAnimationProps, PlayerHandProps, SoundEffects, useSoundEffects(), Card (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (12): Bidding, Changelog, Product and UX, Rules, Scoring, Teams and Partners, Technical, V2 Backend-Driven Room Flow (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (7): Goal, In progress now, Kadi Tiri Plan, Phase 1: Server authority, Phase 2: Live sync, Phase 3: Webhooks, Phase 4: Persistence hardening

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (8): code:block1 (Error: expect(locator).toHaveCount(expected) failed), code:yaml (- generic [active] [ref=e1]:), code:ts (1   | import { Browser, BrowserContext, expect, Page, test }), Error details, Instructions, Page snapshot, Test info, Test source

### Community 13 - "Community 13"
Cohesion: 0.1
Nodes (30): handler(), handler(), handler(), handler(), config, handler(), StreamingResponse, handler() (+22 more)

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (3): createJestConfig, customJestConfig, nextJest

### Community 29 - "Community 29"
Cohesion: 0.22
Nodes (4): GameFinishedModalProps, TopGameControlsProps, GameState, ModalProps

### Community 30 - "Community 30"
Cohesion: 0.12
Nodes (16): Business Purpose, Critical Dependencies, Current Architecture Themes, Deployment Model, Environments, Important APIs, Important Databases, Important Queues / Events (+8 more)

### Community 31 - "Community 31"
Cohesion: 0.12
Nodes (15): Critical Workflows, Dangerous Code Paths, Databases Used, Dependencies, Failure Modes, Game Api, Important Source Files, Inbound APIs (+7 more)

### Community 32 - "Community 32"
Cohesion: 0.12
Nodes (15): Critical Workflows, Dangerous Code Paths, Databases Used, Dependencies, Failure Modes, Game Client Store, Important Source Files, Inbound APIs (+7 more)

### Community 33 - "Community 33"
Cohesion: 0.13
Nodes (14): Auth Flow, Caching Layers, Deployment Topology, End-to-End Request Flows, Event-Driven Architecture, Failover Behavior, Frontend / Backend Interaction, kadi-tiri-game Architecture (+6 more)

### Community 34 - "Community 34"
Cohesion: 0.17
Nodes (10): GameActionRequest, broadcastGameUpdate(), executeAction(), GameStore, getGameUpdatesChannel(), getPlayerSessionKey(), loadPlayerSession(), savePlayerSession() (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.18
Nodes (10): Debugging, Deployment, Feature Rollout, Incident Response, kadi-tiri-game Workflows, Local Development, Migrations, Observability Investigation (+2 more)

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (8): GameBoard(), PartnerSelectionPanel(), PartnerSelectionPanelProps, GamePage(), GamePage(), useGameStore, POWERHOUSE_SUITS, Suit

### Community 37 - "Community 37"
Cohesion: 0.2
Nodes (9): API Conventions, Architecture Patterns, Database / Migration Patterns, Error Handling / Logging, kadi-tiri-game Coding Rules, Naming / Structure, State Management, Testing Conventions (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.22
Nodes (8): code:block1 (Error: Timeout 15000ms exceeded while waiting on the predica), code:yaml (- generic [active] [ref=e1]:), code:ts (21  |         }), Error details, Instructions, Page snapshot, Test info, Test source

### Community 39 - "Community 39"
Cohesion: 0.22
Nodes (8): code:block1 (Error: expect(received).not.toBe(expected) // Object.is equa), code:yaml (- generic [active] [ref=e1]:), code:ts (1   | import { Browser, BrowserContext, expect, Page, test }), Error details, Instructions, Page snapshot, Test info, Test source

### Community 40 - "Community 40"
Cohesion: 0.25
Nodes (5): GamePlayArea(), GamePlayAreaProps, GameUIContainersProps, Player, canPlayCard()

### Community 41 - "Community 41"
Cohesion: 0.29
Nodes (6): Critical Entrypoints, First Read, How To Start Reasoning, kadi-tiri-game Onboarding, Local Run Baseline, Module Map

### Community 42 - "Community 42"
Cohesion: 0.29
Nodes (6): code:block1 (Test timeout of 180000ms exceeded.), code:yaml (- generic [active] [ref=e1]:), Error details, Instructions, Page snapshot, Test info

### Community 43 - "Community 43"
Cohesion: 0.4
Nodes (4): Graphify-first repo discovery, kadi-tiri-game Decision Log, Preserve repo separation, Server-authoritative multiplayer direction

### Community 44 - "Community 44"
Cohesion: 0.5
Nodes (3): Critical Entrypoints, Read First, Top-Level Modules

## Knowledge Gaps
- **291 isolated node(s):** `nextJest`, `createJestConfig`, `customJestConfig`, `name`, `version` (+286 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameState` connect `Community 29` to `Community 0`, `Community 34`, `Community 3`, `Community 36`, `Community 6`, `Community 7`, `Community 40`, `Community 9`, `Community 13`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `Card` connect `Community 9` to `Community 0`, `Community 34`, `Community 3`, `Community 36`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `Player` connect `Community 40` to `Community 0`, `Community 34`, `Community 3`, `Community 6`, `Community 7`, `Community 13`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `nextJest`, `createJestConfig`, `customJestConfig` to the rest of the system?**
  _291 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._