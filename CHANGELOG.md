# Changelog

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
