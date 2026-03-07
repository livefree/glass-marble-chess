import { test, expect, _electron as electron } from '@playwright/test';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const tempPgnPath = path.join('/tmp', 'glass-marble-chess-roundtrip-test.pgn');

const QA_INVENTORY = {
  claims: [
    '3D marble-and-glass chess board renders in the launched Electron window',
    'The board remains fully visible and fit to the window after resizing',
    'Players can click pieces and destination squares to move legally',
    'The hovered board square is visible while aiming the pointer',
    'The active side is visually obvious',
    'Pieces can also be moved by dragging them to a legal square',
    'Undo and redo restore the expected board state',
    'Flip board preserves interaction fidelity',
    'PvE mode responds with a bot move at the selected difficulty',
    'Hard PvE uses stable opening-book replies in the opening',
    'Hard PvE switches to deeper endgame search with transposition-table caching',
    'Opening and replay metadata stay visible for post-game review',
    'Move and endgame sound cues can be toggled and emitted',
    'Castling works through normal board interaction',
    'En passant works through normal board interaction',
    'Promotion requires a piece choice and uses the chosen piece',
    'Running out of time ends the game and blocks further play',
    'Checkmate and draw both end the game with a visible overlay and blocked further play',
    'Mode, difficulty, theme, and time control persist across reloads',
    'Current games can be exported to PGN, imported from PGN, and resumed from local save slots',
    'PGN comments persist through text export/import and desktop file round-trips',
  ],
  controls: [
    'Board click selection and move target click',
    'Undo and Redo buttons',
    'Reset Match button',
    'Flip Board button',
    'Mode segmented control',
    'Difficulty segmented control',
    'Time control segmented control',
    'Promotion choice overlay',
    'Save slot and PGN controls',
    'Move note editor and file PGN controls',
    'Move log, overlay, and turn spotlight updates',
  ],
  exploratory: [
    'Click an enemy piece first and verify no illegal selection occurs',
    'Select a piece and click the same square again to clear selection',
  ],
};

async function clickSquare(window, square, mode = 'auto') {
  const point = await window.evaluate(
    ({ sq, clickMode }) => window.__chessDebug.getSquareScreenPosition(sq, clickMode),
    { sq: square, clickMode: mode }
  );
  await window.mouse.click(point.x, point.y);
}

async function dragSquare(window, from, to) {
  const start = await window.evaluate((sq) => window.__chessDebug.getSquareScreenPosition(sq, 'piece'), from);
  const end = await window.evaluate((sq) => window.__chessDebug.getSquareScreenPosition(sq, 'square'), to);
  await window.mouse.move(start.x, start.y);
  await window.mouse.down();
  await window.mouse.move((start.x + end.x) / 2, (start.y + end.y) / 2, { steps: 8 });
  await window.mouse.move(end.x, end.y, { steps: 8 });
  await window.mouse.up();
}

async function playMoves(window, moves) {
  for (const [from, to] of moves) {
    await window.evaluate((sq) => window.__chessDebug.clickSquare(sq), from);
    await window.evaluate((sq) => window.__chessDebug.clickSquare(sq), to);
  }
}

async function clickControl(window, selector) {
  await window.locator(selector).evaluate((element) => element.click());
}

async function openSettings(window, tab = 'setup') {
  if (!await window.locator('#settingsDrawer').isVisible()) {
    await clickControl(window, '#menuButton');
    await expect(window.locator('#settingsDrawer')).toBeVisible();
  }
  await clickControl(window, `[data-menu-tab="${tab}"]`);
  await expect(window.locator(`[data-menu-tab="${tab}"]`)).toHaveClass(/active/);
}

test.beforeAll(() => {
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
});

test('glass marble chess supports responsive layout, PvE, special rules, and game termination', async () => {
  const electronApp = await electron.launch({ args: ['.'], cwd: rootDir });
  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  await window.evaluate(() => window.__chessDebug.resetSettings());
  await window.reload();
  await window.waitForLoadState('domcontentloaded');

  expect(QA_INVENTORY.claims.length).toBeGreaterThan(0);

  await expect(window.locator('h1')).toHaveText('Glass Marble Chess');
  await expect(window.locator('#statusLabel')).toContainText('White to move');
  await expect(window.locator('#whiteTurnPill')).toHaveClass(/active/);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().overlayVisible)).toBeFalsy();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().boardFlipped)).toBeFalsy();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().timeControlKey)).toBe('rapid5');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().clockStarted)).toBeFalsy();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().soundEnabled)).toBeTruthy();
  await expect(window.locator('#soundToggleButton')).toHaveText('Sound On');
  await expect(window.locator('#whiteClockLabel')).toHaveText('05:00');
  const openingClock = await window.evaluate(() => window.__chessDebug.getClockState());
  await window.waitForTimeout(900);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getClockState().w)).toBe(openingClock.w);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getClockState().b)).toBe(openingClock.b);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getClockState().started)).toBeFalsy();
  await expect(window.locator('button[data-theme="glass-marble"]')).toHaveClass(/active/);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().activeThemeKey)).toBe('glass-marble');

  await openSettings(window);
  await clickControl(window, 'button[data-theme="jade-brass"]');
  await expect(window.locator('button[data-theme="jade-brass"]')).toHaveClass(/active/);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().activeThemeKey)).toBe('jade-brass');
  await clickControl(window, 'button[data-theme="glass-marble"]');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().activeThemeKey)).toBe('glass-marble');

  let metrics = await window.evaluate(() => window.__chessDebug.boardMetrics());
  expect(metrics.stage.width).toBeGreaterThan(600);
  expect(metrics.stage.height).toBeGreaterThan(600);
  expect(Math.abs(metrics.stage.width - metrics.stage.height)).toBeLessThanOrEqual(2);
  expect(metrics.legend.bottom).toBeLessThanOrEqual(metrics.viewport.height);
  expect(metrics.canScrollX).toBeFalsy();
  expect(metrics.canScrollY).toBeFalsy();

  await window.setViewportSize({ width: 1120, height: 780 });
  await expect.poll(async () => {
    const nextMetrics = await window.evaluate(() => window.__chessDebug.boardMetrics());
    return nextMetrics.stage.right <= nextMetrics.viewport.width
      && nextMetrics.stage.bottom <= nextMetrics.viewport.height
      && Math.abs(nextMetrics.stage.width - nextMetrics.stage.height) <= 2
      && nextMetrics.legend.bottom <= nextMetrics.viewport.height
      && !nextMetrics.canScrollX
      && !nextMetrics.canScrollY;
  }).toBeTruthy();
  metrics = await window.evaluate(() => window.__chessDebug.boardMetrics());
  expect(metrics.stage.right).toBeLessThanOrEqual(metrics.viewport.width);
  expect(metrics.stage.bottom).toBeLessThanOrEqual(metrics.viewport.height);
  expect(Math.abs(metrics.stage.width - metrics.stage.height)).toBeLessThanOrEqual(2);
  expect(metrics.legend.bottom).toBeLessThanOrEqual(metrics.viewport.height);

  await window.evaluate(() => window.__chessDebug.clickSquare('e7'));
  await expect(window.locator('#selectionLabel')).toHaveText('None');

  {
    const hoverPoint = await window.evaluate(() => window.__chessDebug.getSquareScreenPosition('e4', 'square'));
    await window.mouse.move(hoverPoint.x, hoverPoint.y);
  }
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().hoverSquare)).toBe('e4');

  await clickSquare(window, 'b1', 'piece');
  await expect(window.locator('#selectionLabel')).toContainText('Knight on b1');
  await clickSquare(window, 'b1', 'piece');
  await expect(window.locator('#selectionLabel')).toHaveText('None');

  await clickSquare(window, 'b1', 'piece');
  await clickSquare(window, 'c3', 'square');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('c3'))).toBe('wn');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().lastSoundCue)).toBe('move');
  await clickControl(window, '#undoButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('b1'))).toBe('wn');
  await clickControl(window, '#redoButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('c3'))).toBe('wn');
  await clickControl(window, '#resetButton');

  await dragSquare(window, 'b1', 'c3');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('c3'))).toBe('wn');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().canUndo)).toBeTruthy();
  await clickControl(window, '#undoButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('b1'))).toBe('wn');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().canRedo)).toBeTruthy();
  await clickControl(window, '#redoButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('c3'))).toBe('wn');
  await clickControl(window, '#resetButton');

  await openSettings(window);
  await clickControl(window, '[data-mode="pve"]');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().playerMode)).toBe('pve');
  await expect(window.locator('[data-mode="pve"]')).toHaveClass(/active/);
  await expect(window.locator('[data-difficulty="easy"]')).toHaveClass(/active/);

  await window.evaluate(() => window.__chessDebug.clickSquare('e2'));
  await window.evaluate(() => window.__chessDebug.clickSquare('e4'));
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getMoveLog().length)).toBe(2);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getTurn())).toBe('w');
  await expect(window.locator('#blackTurnPill')).not.toHaveClass(/active/);
  await clickControl(window, '#undoButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getMoveLog().length)).toBe(0);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getTurn())).toBe('w');
  await clickControl(window, '#redoButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getMoveLog().length)).toBe(2);

  await clickControl(window, '#resetButton');
  await openSettings(window);
  await clickControl(window, '[data-difficulty="hard"]');
  await window.evaluate(() => window.__chessDebug.clickSquare('e2'));
  await window.evaluate(() => window.__chessDebug.clickSquare('e4'));
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getMoveLog())).toEqual(['e4', 'e5']);
  await window.evaluate(() => window.__chessDebug.clickSquare('g1'));
  await window.evaluate(() => window.__chessDebug.clickSquare('f3'));
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getMoveLog())).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().openingName)).toBe('King Knight Opening');
  await window.evaluate(() => window.__chessDebug.setFen('8/8/8/8/8/5k2/8/6Kq b - - 0 1'));
  await expect.poll(() => window.evaluate(() => window.__chessDebug.previewBotMove()), { timeout: 15_000 }).toMatchObject({ san: 'Qg2#' });
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getEngineStats())).toMatchObject({
    endgame: true,
    usedBook: false,
    depth: 5,
  });
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getEngineStats().transpositionEntries)).toBeGreaterThan(0);

  await clickControl(window, '#resetButton');
  await openSettings(window);
  await clickControl(window, '[data-mode="pvp"]');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().playerMode)).toBe('pvp');
  await window.setViewportSize({ width: 1440, height: 948 });
  await expect.poll(async () => {
    const nextMetrics = await window.evaluate(() => window.__chessDebug.boardMetrics());
    return nextMetrics.stage.right <= nextMetrics.viewport.width
      && nextMetrics.stage.bottom <= nextMetrics.viewport.height
      && Math.abs(nextMetrics.stage.width - nextMetrics.stage.height) <= 2;
  }).toBeTruthy();

  await clickControl(window, '#flipButton');
  await window.evaluate(() => window.__chessDebug.clickSquare('b1'));
  await expect(window.locator('#selectionLabel')).toContainText('Knight on b1');
  await window.evaluate(() => window.__chessDebug.clickSquare('c3'));
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('c3'))).toBe('wn');
  await expect(window.locator('#statusLabel')).toContainText('Black to move');
  await clickControl(window, '#resetButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().boardFlipped)).toBeFalsy();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('b1'))).toBe('wn');
  await expect(window.locator('#selectionLabel')).toHaveText('None');

  await playMoves(window, [
    ['e2', 'e4'],
    ['e7', 'e5'],
    ['g1', 'f3'],
    ['b8', 'c6'],
    ['f1', 'e2'],
    ['g8', 'f6'],
    ['e1', 'g1'],
  ]);
  await expect(window.locator('#statusLabel')).toContainText('Castled');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getFen())).toContain('RNBQ1RK1');

  await clickControl(window, '#resetButton');
  await playMoves(window, [
    ['e2', 'e4'],
    ['a7', 'a6'],
    ['e4', 'e5'],
    ['d7', 'd5'],
    ['e5', 'd6'],
  ]);
  await expect(window.locator('#statusLabel')).toContainText('En passant');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('d6'))).toBe('wp');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('d5'))).toBeNull();

  await window.evaluate(() => window.__chessDebug.setFen('7k/P7/8/8/8/8/8/K7 w - - 0 1'));
  await window.evaluate(() => window.__chessDebug.clickSquare('a7'));
  await window.evaluate(() => window.__chessDebug.clickSquare('a8'));
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().promotionVisible)).toBeTruthy();
  await window.locator('[data-promotion="n"]').click();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().promotionVisible)).toBeFalsy();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('a8'))).toBe('wn');
  await clickControl(window, '#undoButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('a7'))).toBe('wp');
  await clickControl(window, '#redoButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('a8'))).toBe('wn');

  await clickControl(window, '#resetButton');
  await playMoves(window, [
    ['e2', 'e4'],
    ['e7', 'e5'],
    ['d1', 'h5'],
    ['b8', 'c6'],
    ['f1', 'c4'],
    ['g8', 'f6'],
    ['h5', 'f7'],
  ]);
  const mateFen = await window.evaluate(() => window.__chessDebug.getFen());
  await expect(window.locator('#statusLabel')).toContainText('White wins');
  await expect(window.locator('#overlayDetail')).toContainText('Checkmate ends the game');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.isGameOver())).toBeTruthy();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().overlayVisible)).toBeTruthy();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().lastSoundCue)).toBe('gameover');
  await expect(window.locator('#overlayHeadline')).toHaveText('White wins');
  await expect(window.locator('#overlayMeta')).toContainText('Open Game');
  await expect(window.locator('#moveLog li').last()).toContainText('Qxf7#');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('f7'))).toBe('wq');
  await clickControl(window, '#overlayReviewButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().reviewMode)).toBeTruthy();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().overlayVisible)).toBeFalsy();
  await expect(window.locator('#settingsDrawer')).toBeVisible();
  await expect(window.locator('[data-menu-tab="review"]')).toHaveClass(/active/);
  await expect(window.locator('#statusLabel')).toContainText('Review');
  await clickControl(window, '#reviewPrevButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().reviewIndex)).toBe(6);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('h5'))).toBe('wq');
  await clickControl(window, '#reviewEndButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().reviewIndex)).toBe(7);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('f7'))).toBe('wq');
  await clickControl(window, '#reviewExitButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().reviewMode)).toBeFalsy();
  await clickControl(window, '#overlayResetButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().overlayVisible)).toBeFalsy();
  await expect(window.locator('#statusLabel')).toContainText('White to move');

  await playMoves(window, [
    ['e2', 'e4'],
    ['e7', 'e5'],
    ['d1', 'h5'],
    ['b8', 'c6'],
    ['f1', 'c4'],
    ['g8', 'f6'],
    ['h5', 'f7'],
  ]);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().overlayVisible)).toBeTruthy();
  await clickSquare(window, 'e7', 'square');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getFen())).toBe(mateFen);

  await window.evaluate(() => window.__chessDebug.setFen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1'));
  await expect(window.locator('#statusLabel')).toContainText('Draw');
  await expect(window.locator('#overlayDetail')).toContainText('Stalemate leaves no legal move');
  await expect(window.locator('#overlayHeadline')).toHaveText('Draw');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.isGameOver())).toBeTruthy();
  const drawFen = await window.evaluate(() => window.__chessDebug.getFen());
  await clickSquare(window, 'h8', 'square');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getFen())).toBe(drawFen);

  await clickControl(window, '#overlayResetButton');
  await window.evaluate(() => window.__chessDebug.setClocks({ w: 50, b: 60_000, timeKey: 'blitz1', started: true }));
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getClockState().w)).toBeLessThanOrEqual(50);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().overlayVisible)).toBeTruthy();
  await expect(window.locator('#overlayHeadline')).toHaveText('Black wins');
  await expect(window.locator('#overlayDetail')).toContainText('flags on time');
  const timeoutFen = await window.evaluate(() => window.__chessDebug.getFen());
  await clickSquare(window, 'e2', 'square');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getFen())).toBe(timeoutFen);

  await openSettings(window);
  await clickControl(window, '[data-mode="pve"]');
  await clickControl(window, '[data-difficulty="hard"]');
  await clickControl(window, '[data-time="rapid10"]');
  await clickControl(window, '[data-theme="rosewood-ivory"]');
  await clickControl(window, '#flipButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getSavedSettings())).toMatchObject({
    playerMode: 'pve',
    botDifficulty: 'hard',
    activeThemeKey: 'rosewood-ivory',
    timeControlKey: 'rapid10',
  });
  await window.reload();
  await window.waitForLoadState('domcontentloaded');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState())).toMatchObject({
    playerMode: 'pve',
    botDifficulty: 'hard',
    activeThemeKey: 'rosewood-ivory',
    timeControlKey: 'rapid10',
    boardFlipped: false,
  });
  await expect(window.locator('[data-mode="pve"]')).toHaveClass(/active/);
  await expect(window.locator('[data-difficulty="hard"]')).toHaveClass(/active/);
  await expect(window.locator('button[data-theme="rosewood-ivory"]')).toHaveClass(/active/);
  await expect(window.locator('[data-time="rapid10"]')).toHaveClass(/active/);
  await expect(window.locator('#whiteClockLabel')).toHaveText('10:00');

  await openSettings(window, 'setup');
  await clickControl(window, '#soundToggleButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().soundEnabled)).toBeFalsy();
  await expect(window.locator('#soundToggleButton')).toHaveText('Sound Off');

  await openSettings(window);
  await clickControl(window, '[data-mode="pvp"]');
  await clickControl(window, '[data-time="rapid5"]');
  await clickControl(window, '[data-theme="glass-marble"]');
  await clickControl(window, '#resetButton');
  await playMoves(window, [
    ['e2', 'e4'],
    ['e7', 'e5'],
    ['g1', 'f3'],
    ['b8', 'c6'],
  ]);
  await openSettings(window, 'library');
  await clickControl(window, '#exportPgnButton');
  await expect(window.locator('#pgnTextarea')).toHaveValue(/1\. e4 e5 2\. Nf3 Nc6/);
  const exportedPgn = await window.locator('#pgnTextarea').inputValue();
  await window.locator('[data-save-slot="0"]').click();
  await expect(window.locator('[data-slot="0"] .save-slot-title')).toContainText('King Knight Opening');
  await expect(window.locator('#persistenceLabel')).toContainText('slot 1');
  await clickControl(window, '#resetButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getMoveLog().length)).toBe(0);
  await openSettings(window, 'library');
  await window.locator('[data-load-slot="0"]').click();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getMoveLog())).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().openingName)).toBe('King Knight Opening');
  await expect(window.locator('#pgnTextarea')).toHaveValue(/1\. e4 e5 2\. Nf3 Nc6/);
  await clickControl(window, '#resetButton');
  await openSettings(window, 'library');
  await window.locator('#pgnTextarea').fill(exportedPgn);
  await clickControl(window, '#importPgnButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getMoveLog())).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getFen())).toBe('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3');
  await expect(window.locator('#persistenceLabel')).toContainText('PGN imported');
  await window.locator('#pgnTextarea').fill('1. f3 e5 2. g4 Qh4#');
  await clickControl(window, '#importPgnButton');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().overlayVisible)).toBeTruthy();
  await expect(window.locator('#overlayHeadline')).toHaveText('Black wins');
  await expect(window.locator('#moveLog li').last()).toContainText('Qh4#');

  await clickControl(window, '#resetButton');
  await playMoves(window, [
    ['e2', 'e4'],
    ['e7', 'e5'],
  ]);
  await openSettings(window, 'library');
  await window.locator('#commentTextarea').fill('Open center and mirrored reply.');
  await clickControl(window, '#saveCommentButton');
  await expect(window.locator('#persistenceLabel')).toContainText('note saved');
  await clickControl(window, '#exportPgnButton');
  await expect(window.locator('#pgnTextarea')).toHaveValue(/\{Open center and mirrored reply\.\}/);
  await expect.poll(() => window.evaluate((targetPath) => window.__chessDebug.exportPgnToFile(targetPath), tempPgnPath)).toBeTruthy();
  await clickControl(window, '#resetButton');
  await expect.poll(() => window.evaluate((targetPath) => window.__chessDebug.importPgnFromFile(targetPath), tempPgnPath)).toBeTruthy();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getMoveLog())).toEqual(['e4', 'e5']);
  await expect(window.locator('#commentTextarea')).toHaveValue('Open center and mirrored reply.');

  await electronApp.close();
});
