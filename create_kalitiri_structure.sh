#!/bin/bash

# Create folder structure
mkdir -p src/components/ui
mkdir -p src/components/game
mkdir -p src/components/layout
mkdir -p src/pages/api/game
mkdir -p store
mkdir -p data
mkdir -p styles

# Create UI component files
touch src/components/ui/Button.tsx
touch src/components/ui/Card.tsx
touch src/components/ui/Modal.tsx
touch src/components/ui/LoadingSpinner.tsx

# Create Game component files
touch src/components/game/GameSetup.tsx
touch src/components/game/GameBoard.tsx
touch src/components/game/PlayerHand.tsx
touch src/components/game/BiddingPanel.tsx
touch src/components/game/Scoreboard.tsx
touch src/components/game/GameTable.tsx

# Create Layout component files
touch src/components/layout/Header.tsx
touch src/components/layout/Layout.tsx

# Create page files
touch src/pages/_app.tsx
touch src/pages/_document.tsx
touch src/pages/index.tsx

# Create API route files
touch src/pages/api/game/create.ts
touch src/pages/api/game/join.ts
touch src/pages/api/game/state.ts

# Create store files
touch store/gameStore.ts
touch store/uiStore.ts
touch store/index.ts

# Create data files
touch data/games.json
touch data/gameHistory.json

# Create styles file
touch styles/globals.css

echo "Folder structure created successfully."
