# Changelog

## V2 E2E Gameplay Coverage

- Added Playwright-based end-to-end coverage for the 4-player prototype flow.
- Added stable test hooks to room, bidding, card, and trick UI so browser automation can target the real gameplay path reliably.
- Added regression coverage for:
  - room create and 4-player join flow
  - bidding and bid-winner setup
  - first played card visibility across all joined players
  - one completed trick and next-turn progression
  - shared turn-consensus handling before each automated move
  - follow-suit enforcement
  - off-turn play rejection
  - full-hand scoring settlement
- Added `test:e2e` and `test:e2e:headed` scripts to the repo.
- Documented the E2E workflow in the README.

## V2 Cross-Browser Prototype

- Added lightweight shared room APIs:
  - `POST /api/game/create`
  - `POST /api/game/join`
  - `GET /api/game/state`
  - `POST /api/game/state`
- Added file-backed server storage under `data/games.json` so multiple browsers can read and update the same room state during local development.
- Refactored the game store so room create, join, save, restore, and sync use the API layer instead of only browser-local storage.
- Kept local/session storage as a browser cache for quick seat restore in the active browser.
- Updated the main game pages to:
  - restore a joined room from the shared server state
  - poll for room updates every `250ms`
  - keep cross-browser waiting room and in-game state in sync during local testing
- Re-enabled stricter turn handling while preserving local seat handoff for single-browser testing.
- Verified the prototype with:
  - `tsc --noEmit`
  - `next build`

Known limitation:

- This is still a polling-based prototype, not real server-authoritative multiplayer. It is suitable for local/manual testing across browsers, but not for production or public play.

## V2 Repo Hygiene

- Removed empty placeholder test/manual files from the repo root.
- Removed duplicate empty `store/` and `styles/` scaffold files that were not used by the app.
- Removed the stale `GamePlayArea.tsx.backup` file from source control.
- Simplified TypeScript path config to use the real `src` tree only.
- Pointed `_app.tsx` at the real stylesheet under `src/styles/globals.css`.
- Verified the project with:
  - `tsc --noEmit`
  - `next build`

## V2 Rules and Flow Update

This update aligns the project with the clarified Kadi Tiri rules used in the current product direction.

### Rules

- Added a difficulty-based rules model:
  - `4 players`: Easy only, `2 vs 2`
  - `6 players`: Easy `3 vs 3`, Hard `2 vs 4`
  - `8 players`: Easy `4 vs 4`, Hard `3 vs 5`
- Kept point values as:
  - `3♠ = 30`
  - `A/K/Q/J/10 = 10`
  - `5 = 5`
  - all others `0`
- Clarified trick rules:
  - players must follow suit if possible
  - players may only use `sir` when void in the led suit
  - highest `sir` wins if any `sir` is played
  - otherwise highest card of the led suit wins
- Clarified `3♠` behavior:
  - not a universal trump
  - only behaves like a strong spade when spades is `sir`

### Bidding

- Added room difficulty support to drive opening bid and team structure.
- Added support for `+5` and `+10` raise options.
- Updated opening bids to use the V2 ranges:
  - Easy favors higher opening pressure
  - Hard allows lower opening pressure for riskier play
- Removed the old assumption that bidding is fixed to one increment size.

### Teams and Partners

- Partner count is now driven by mode and difficulty, not just player count.
- Bid winner still chooses `sir` and the partner card(s).
- Bid winner now leads the first trick after setup.

### Scoring

- Settlement now follows the V2 bid-based scoring model:
  - if bidding team wins, bidder gets `2x` bid
  - winning partners get `1x` bid
  - if bidding team loses, opposition players get the full bid amount
- End-of-round UI now distinguishes:
  - collected trick points
  - recorded score awards

### Product and UX

- Game setup now shows derived room rules:
  - team split
  - partner count
  - opening bid
  - raise options
  - removed cards
- Bidding UI now exposes fast `+5` and `+10` actions.
- Removed misleading testing-first bidding and partner-selection behavior from the main production flow.
- Replaced the old "Dealer" label in the UI with "Opening Bidder" / "Opener" to match the current rules interpretation.

### Technical

- Reworked the mode/config layer so rules can be derived from room settings instead of scattered constants.
- Fixed the fake `joinGame` behavior so joining a room uses stored room state instead of always creating a local 4-player test game.
- Preserved the current storage-backed prototype approach, but the code now better reflects the intended multiplayer rules.
