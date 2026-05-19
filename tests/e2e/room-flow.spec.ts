import { Browser, BrowserContext, expect, Page, test } from '@playwright/test';

test.describe.configure({ timeout: 300_000 });

async function newPlayerPage(browser: Browser): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  return { context, page };
}

async function waitForRoomToAdvance(page: Page, expectedCount: number) {
  await expect
    .poll(
      async () => {
        if (await page.getByText('Bidding Round').isVisible().catch(() => false)) {
          return true;
        }

        if (await page.getByText('Game Setup Complete').isVisible().catch(() => false)) {
          return true;
        }

        return (await page.locator('[data-testid="waiting-room-player"]').count()) === expectedCount;
      },
      {
        timeout: 20_000
      }
    )
    .toBe(true);
}

async function waitForExactPlayerCount(page: Page, expectedCount: number) {
  await expect(page.locator('[data-testid="waiting-room-player"]')).toHaveCount(expectedCount, {
    timeout: 15_000
  });
}

async function waitForJoinPageToLoad(page: Page) {
  await expect
    .poll(
      async () => {
        if (await page.getByTestId('waiting-room').isVisible().catch(() => false)) {
          return true;
        }

        if (await page.getByText('Bidding Round').isVisible().catch(() => false)) {
          return true;
        }

        if (await page.getByText('Game Setup Complete').isVisible().catch(() => false)) {
          return true;
        }

        return false;
      },
      { timeout: 15_000 }
    )
    .toBe(true);
}

async function activeBidPage(pages: Page[]): Promise<Page> {
  let activeIndex = -1;

  await expect
    .poll(
      async () => {
        for (let index = 0; index < pages.length; index += 1) {
          const page = pages[index];
          await page.bringToFront();
          const hasBidControls =
            (await page.getByTestId('quick-raise-5').isVisible().catch(() => false)) ||
            (await page.getByTestId('bid-more-button').isVisible().catch(() => false));

          if (hasBidControls) {
            activeIndex = index;
            return index;
          }
        }

        return -1;
      },
      { timeout: 15_000 }
    )
    .not.toBe(-1);

  return pages[activeIndex];
}

async function activePassPage(pages: Page[]): Promise<Page> {
  let activeIndex = -1;
  await expect
    .poll(
      async () => {
        for (let index = 0; index < pages.length; index += 1) {
          const page = pages[index];
          await page.bringToFront();
          const currentUser = (await page.getByTestId('current-user-name').textContent().catch(() => null))?.trim() || '';
          const currentTurn = (await page.getByTestId('current-turn-name').textContent().catch(() => null))?.trim() || '';
          const passButton = page.getByTestId('pass-bid-button');
          const visible = await passButton.isVisible().catch(() => false);
          const label = visible ? ((await passButton.textContent().catch(() => null))?.trim() || '') : '';

          if (visible && currentUser && currentUser === currentTurn && !label.includes('Disabled')) {
            activeIndex = index;
            return index;
          }
        }

        return -1;
      },
      { timeout: 15_000 }
    )
    .not.toBe(-1);
  return pages[activeIndex];
}

async function passBidAndWait(page: Page) {
  const previousTurn = (await page.getByTestId('current-turn-name').textContent().catch(() => null))?.trim() || '';
  await page.getByTestId('pass-bid-button').click();

  await expect
    .poll(
      async () => {
        if (await page.getByText('Bidding Winner Setup').isVisible().catch(() => false)) {
          return true;
        }

        const currentTurn = (await page.getByTestId('current-turn-name').textContent().catch(() => null))?.trim() || '';
        const passButton = page.getByTestId('pass-bid-button');
        const stillOwnsTurn =
          currentTurn === previousTurn &&
          (await passButton.isVisible().catch(() => false)) &&
          (await passButton.isEnabled().catch(() => false));

        return !stillOwnsTurn;
      },
      { timeout: 15_000 }
    )
    .toBe(true);
}

async function activeTurnPage(pages: Page[]): Promise<Page> {
  let activeIndex = -1;

  await expect
    .poll(
      async () => {
        const snapshots = await Promise.all(
          pages.map(async page => {
            await page.bringToFront();
            return {
              page,
              currentUser: (await page.getByTestId('current-user-name').textContent().catch(() => null))?.trim() || null,
              currentTurn: (await page.getByTestId('current-turn-name').textContent().catch(() => null))?.trim() || null
            };
          })
        );

        const distinctTurnNames = Array.from(
          new Set(snapshots.map(snapshot => snapshot.currentTurn).filter(Boolean))
        );
        if (distinctTurnNames.length !== 1) {
          return -1;
        }

        const sharedTurnName = distinctTurnNames[0];

        for (let index = 0; index < pages.length; index += 1) {
          const snapshot = snapshots[index];
          const playableCards = await localHandPanel(pages[index])
            .locator('[data-testid="playing-card"][data-playable="true"]')
            .count()
            .catch(() => 0);

          if (snapshot.currentUser && snapshot.currentUser === sharedTurnName && playableCards > 0) {
            activeIndex = index;
            return index;
          }
        }

        return -1;
      },
      { timeout: 15_000 }
    )
    .not.toBe(-1);

  return pages[activeIndex];
}

async function createFourPlayerFlow(browser: Browser) {
  const players: Array<{ context: BrowserContext; page: Page }> = [];

  const host = await newPlayerPage(browser);
  players.push(host);

  await host.page.goto('/game');
  await host.page.getByTestId('create-room-button').click();
  await expect(host.page.getByTestId('waiting-room')).toBeVisible();

  const gameId = await host.page.getByTestId('waiting-room').getAttribute('data-game-id');
  expect(gameId).toBeTruthy();

  for (let i = 0; i < 3; i += 1) {
    const player = await newPlayerPage(browser);
    players.push(player);
    await player.page.goto(`/game?join=${gameId}`);
    await waitForJoinPageToLoad(player.page);

    if (i < 2) {
      await waitForExactPlayerCount(host.page, i + 2);
    }
  }

  await Promise.all(players.map(({ page }) => waitForRoomToAdvance(page, 4)));

  for (const { page } of players) {
    await expect(page.getByText('Bidding Round')).toBeVisible({ timeout: 20_000 });
  }

  const pages = players.map(player => player.page);
  const openingPage = await activeBidPage(pages);
  await openingPage.getByTestId('quick-raise-5').click();

  for (let i = 0; i < 3; i += 1) {
    const page = await activePassPage(pages);
    await passBidAndWait(page);
  }

  await expect(openingPage.getByText('Bidding Winner Setup')).toBeVisible({ timeout: 15_000 });
  await openingPage.getByTestId('powerhouse-♠').click();
  await openingPage.getByTestId('partner-card-option').first().click();
  await openingPage.getByTestId('start-game-button').click();

  for (const page of pages) {
    await expect(page.getByTestId('current-trick')).toBeVisible({ timeout: 15_000 });
  }

  return { host, players, pages, openingPage };
}

function localHandPanel(page: Page) {
  return page.locator('[data-is-local-player="true"]').first();
}

async function playFirstPlayableCard(page: Page) {
  const firstPlayable = localHandPanel(page).locator('[data-testid="playing-card"][data-playable="true"]').first();
  await expect(firstPlayable).toBeVisible();
  const rank = await firstPlayable.getAttribute('data-card-rank');
  const suit = await firstPlayable.getAttribute('data-card-suit');
  const previousTurn = await page.getByTestId('current-turn-name').textContent();
  const previousTrickCount = await page.getByTestId('completed-tricks-count').textContent().catch(() => '0');
  const previousPlayedCards = await page.locator('[data-testid="played-card"]').count();
  const previousHandCards = await localHandPanel(page).locator('[data-testid="playing-card"]').count();
  await firstPlayable.click({ force: true });

  const immediateTurnError = await page.getByTestId('game-error').textContent().catch(() => null);
  expect(immediateTurnError?.includes('Not your turn to play')).not.toBe(true);

  await expect
    .poll(
      async () => {
        const finished = await page.getByTestId('game-finished-modal').isVisible().catch(() => false);
        if (finished) {
          return true;
        }

        const currentTurn = await page.getByTestId('current-turn-name').textContent().catch(() => null);
        const currentTrickCount = await page.getByTestId('completed-tricks-count').textContent().catch(() => previousTrickCount);
        const currentPlayedCards = await page.locator('[data-testid="played-card"]').count().catch(() => previousPlayedCards);
        const currentHandCards = await localHandPanel(page).locator('[data-testid="playing-card"]').count().catch(() => previousHandCards);

        return (
          currentTurn !== previousTurn ||
          currentTrickCount !== previousTrickCount ||
          currentPlayedCards !== previousPlayedCards ||
          currentHandCards !== previousHandCards
        );
      },
      { timeout: 15_000 }
    )
    .toBe(true);

  return { rank, suit };
}

async function waitForPagesToSync(pages: Page[]) {
  await expect
    .poll(
      async () => {
        const snapshots = await Promise.all(
          pages.map(async page => ({
            status: (await page.getByText(/Status:/).textContent().catch(() => null))?.trim() || null,
            turn: (await page.getByTestId('current-turn-name').textContent().catch(() => null))?.trim() || null,
            tricks: (await page.getByTestId('completed-tricks-count').textContent().catch(() => null))?.trim() || null,
            playedCards: await page.locator('[data-testid="played-card"]').count().catch(() => -1),
            finished: await page.getByTestId('game-finished-modal').isVisible().catch(() => false)
          }))
        );

        if (snapshots.some(snapshot => snapshot.finished)) {
          return snapshots.every(snapshot => snapshot.finished);
        }

        return (
          new Set(snapshots.map(snapshot => snapshot.turn)).size === 1 &&
          new Set(snapshots.map(snapshot => snapshot.tricks)).size === 1 &&
          new Set(snapshots.map(snapshot => snapshot.playedCards)).size === 1
        );
      },
      { timeout: 15_000 }
    )
    .toBe(true);
}

test('four players can create a room, join, bid, choose setup, and see the first played card', async ({ browser }) => {
  let players: Array<{ context: BrowserContext; page: Page }> = [];

  try {
    const flow = await createFourPlayerFlow(browser);
    players = flow.players;
    const { pages } = flow;

    await waitForPagesToSync(pages);
    const leadPage = await activeTurnPage(pages);
    await playFirstPlayableCard(leadPage);
    await expect(leadPage.locator('[data-testid="played-card"]')).toHaveCount(1, { timeout: 15_000 });
  } finally {
    await Promise.all(players.map(({ context }) => context.close()));
  }
});

test('four players can complete one full trick and advance the winner to the next turn', async ({ browser }) => {
  let players: Array<{ context: BrowserContext; page: Page }> = [];

  try {
    const flow = await createFourPlayerFlow(browser);
    players = flow.players;
    const { pages } = flow;
    await waitForPagesToSync(pages);

    for (let i = 0; i < 4; i += 1) {
      const actingPage = await activeTurnPage(pages);
      const currentTurnName = (await actingPage.getByTestId('current-turn-name').textContent())?.trim();
      await playFirstPlayableCard(actingPage);
      await waitForPagesToSync(pages);

      if (i < 3) {
        await Promise.all(
          pages.map(page =>
            expect(page.getByTestId('current-turn-name')).not.toHaveText(currentTurnName || '', { timeout: 15_000 })
          )
        );
      }
    }

    await Promise.all(
      pages.map(async page => {
        await expect(page.getByTestId('completed-tricks-count')).toHaveText('1', { timeout: 15_000 });
        await expect(page.locator('[data-testid="played-card"]')).toHaveCount(0, { timeout: 15_000 });
      })
    );

    const nextTurnNames = await Promise.all(
      pages.map(page => page.getByTestId('current-turn-name').textContent())
    );
    const normalizedTurnNames = nextTurnNames.map(name => name?.trim());
    expect(new Set(normalizedTurnNames).size).toBe(1);
  } finally {
    await Promise.all(players.map(({ context }) => context.close()));
  }
});

test('follow-suit is enforced when a player has the led suit in hand', async ({ browser }) => {
  let players: Array<{ context: BrowserContext; page: Page }> = [];

  try {
    const flow = await createFourPlayerFlow(browser);
    players = flow.players;
    const { pages } = flow;

    const openingPlayPage = await activeTurnPage(pages);
    await playFirstPlayableCard(openingPlayPage);
    await waitForPagesToSync(pages);

    let enforced = false;

    for (let turn = 0; turn < 6; turn += 1) {
      const actingPage = await activeTurnPage(pages);
      const handPanel = localHandPanel(actingPage);
      const offSuitCard = handPanel.locator('[data-testid="playing-card"][data-playable="false"]').first();
      const validCard = handPanel.locator('[data-testid="playing-card"][data-playable="true"]').first();

      if (await offSuitCard.count()) {
        const currentTurnName = await actingPage.getByTestId('current-turn-name').textContent();
        const existingPlayedCards = await actingPage.locator('[data-testid="played-card"]').count();

        await offSuitCard.click({ force: true });
        await expect(actingPage.getByTestId('game-error')).toContainText('must play', { timeout: 15_000 });
        await expect(actingPage.getByTestId('current-turn-name')).toHaveText(currentTurnName || '', { timeout: 15_000 });
        await expect(actingPage.locator('[data-testid="played-card"]')).toHaveCount(existingPlayedCards);

        await validCard.click();
        await waitForPagesToSync(pages);
        enforced = true;
        break;
      }

      await validCard.click();
      await waitForPagesToSync(pages);
    }

    expect(enforced).toBe(true);
  } finally {
    await Promise.all(players.map(({ context }) => context.close()));
  }
});

test('off-turn card play is rejected and does not change the trick', async ({ browser }) => {
  let players: Array<{ context: BrowserContext; page: Page }> = [];

  try {
    const flow = await createFourPlayerFlow(browser);
    players = flow.players;
    const { pages } = flow;

    const activePage = await activeTurnPage(pages);
    const inactivePage = pages.find(page => page !== activePage);
    expect(inactivePage).toBeTruthy();

    const currentTurnName = await inactivePage!.getByTestId('current-turn-name').textContent();
    const previousHandCards = await localHandPanel(inactivePage!).locator('[data-testid="playing-card"]').count();
    const inactiveCard = localHandPanel(inactivePage!).locator('[data-testid="playing-card"]').first();

    await inactiveCard.click({ force: true });

    await expect(inactivePage!.getByTestId('current-turn-name')).toHaveText(currentTurnName || '', { timeout: 15_000 });
    await expect(inactivePage!.locator('[data-testid="played-card"]')).toHaveCount(0);
    await expect(localHandPanel(inactivePage!).locator('[data-testid="playing-card"]')).toHaveCount(previousHandCards);

    const gameError = inactivePage!.getByTestId('game-error');
    if (await gameError.count()) {
      await expect(gameError).toContainText('Not your turn to play');
    }
  } finally {
    await Promise.all(players.map(({ context }) => context.close()));
  }
});

test('four players can complete a full hand and reach scoring settlement', async ({ browser }) => {
  test.setTimeout(180_000);
  let players: Array<{ context: BrowserContext; page: Page }> = [];

  try {
    const flow = await createFourPlayerFlow(browser);
    players = flow.players;
    const { pages } = flow;

    for (let play = 0; play < 52; play += 1) {
      await waitForPagesToSync(pages);
      const finished = await pages[0].getByTestId('game-finished-modal').isVisible().catch(() => false);
      if (finished) {
        break;
      }

      const actingPage = await activeTurnPage(pages);
      await playFirstPlayableCard(actingPage);
      await waitForPagesToSync(pages);
    }

    await Promise.all(
      pages.map(async page => {
        await expect(page.getByTestId('game-finished-modal')).toBeVisible({ timeout: 20_000 });
        await expect(page.getByTestId('finished-tricks-count')).toHaveText('13');
        await expect(page.getByTestId('winning-team-name')).toBeVisible();
        await expect(page.locator('[data-testid="player-round-award"]')).toHaveCount(4);
      })
    );

    const bidWinnerTeamScore = parseInt((await pages[0].getByTestId('bid-winner-team-score').textContent()) || '0', 10);
    const opposingTeamScore = parseInt((await pages[0].getByTestId('opposing-team-score').textContent()) || '0', 10);

    expect(bidWinnerTeamScore + opposingTeamScore).toBe(250);
  } finally {
    await Promise.all(players.map(({ context }) => context.close()));
  }
});
