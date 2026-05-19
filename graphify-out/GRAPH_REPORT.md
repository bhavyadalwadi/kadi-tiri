# Graph Report - kadi-tiri-game  (2026-05-19)

## Corpus Check
- 57 files · ~151,225 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 351 nodes · 574 edges · 28 communities (25 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `GameState` - 17 edges
2. `dependencies` - 15 edges
3. `compilerOptions` - 15 edges
4. `useGameStore` - 15 edges
5. `nextUpdatedAt()` - 13 edges
6. `scripts` - 12 edges
7. `Card` - 11 edges
8. `useSoundEffects()` - 9 edges
9. `devDependencies` - 8 edges
10. `Player` - 8 edges

## Surprising Connections (you probably didn't know these)
- `createInitialGameState()` --calls--> `createDeck()`  [EXTRACTED]
  src/lib/server/gameFactory.ts → src/utils/gameUtils.ts
- `createInitialGameState()` --calls--> `removeCardsFromDeck()`  [EXTRACTED]
  src/lib/server/gameFactory.ts → src/utils/gameUtils.ts
- `PlayingCard()` --calls--> `useSoundEffects()`  [EXTRACTED]
  src/components/ui/PlayingCard.tsx → src/hooks/useSoundEffects.ts
- `GameSetup()` --calls--> `useGameStore`  [EXTRACTED]
  src/components/game/GameSetup.tsx → src/store/gameStore.ts
- `GamePlayArea()` --calls--> `useGameStore`  [EXTRACTED]
  src/components/game/GamePlayArea.tsx → src/store/gameStore.ts

## Communities (28 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (28): BiddingPanel(), BiddingPanelProps, DealingAnimation(), DealingAnimationProps, GameBoard(), GameFinishedModalProps, GamePlayArea(), GamePlayAreaProps (+20 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (45): author, dependencies, bootstrap, class-variance-authority, clsx, framer-motion, lucide-react, next (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (32): GameActionType, ActionResult, applyPassBid(), applyPlaceBid(), applyPlayCard(), applySelectPartners(), applySelectPowerhouse(), applyStartBidding() (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (25): handler(), GameSetup(), buildPlayers(), createInitialGameState(), CreateRoomOptions, saveGame(), BiddingConfig, CreateGameRequest (+17 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (20): handler(), handler(), handler(), config, handler(), StreamingResponse, handler(), sleep() (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (20): activeBidPage(), activePassPage(), bidWinnerTeamScore, createFourPlayerFlow(), currentTurnName, gameError, handPanel, inactiveCard (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (19): Bid, BiddingPanelProps, BreakpointProps, CardAnimation, CardProps, ChatMessage, ChatProps, GameControlsProps (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (19): ApiResponse, AudioManager, ConfigManager, DeepPartial, ErrorHandler, EventEmitter, GameError, GameEvents (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (10): GameActionRequest, broadcastGameUpdate(), executeAction(), GameStore, getGameUpdatesChannel(), getPlayerSessionKey(), loadPlayerSession(), savePlayerSession() (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (12): Bidding, Changelog, Product and UX, Rules, Scoring, Teams and Partners, Technical, V2 Backend-Driven Room Flow (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (7): Goal, In progress now, Kadi Tiri Plan, Phase 1: Server authority, Phase 2: Live sync, Phase 3: Webhooks, Phase 4: Persistence hardening

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): code:block1 (Test timeout of 300000ms exceeded.), code:yaml (- generic [active] [ref=e1]:), Error details, Instructions, Page snapshot, Test info

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (3): createJestConfig, customJestConfig, nextJest

## Knowledge Gaps
- **165 isolated node(s):** `nextJest`, `createJestConfig`, `customJestConfig`, `name`, `version` (+160 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameState` connect `Community 0` to `Community 2`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 9`, `Community 13`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `Card` connect `Community 0` to `Community 2`, `Community 3`, `Community 6`, `Community 7`, `Community 9`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `Player` connect `Community 4` to `Community 0`, `Community 2`, `Community 3`, `Community 6`, `Community 7`, `Community 9`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `nextJest`, `createJestConfig`, `customJestConfig` to the rest of the system?**
  _165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._