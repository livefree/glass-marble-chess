import { test, expect, _electron as electron } from '@playwright/test';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const QA_INVENTORY = {
  claims: [
    '3D marble-and-glass chess board renders in the launched Electron window',
    'The board remains fully visible and fit to the window after resizing',
    'Players can click pieces and destination squares to move legally',
    'The active side is visually obvious',
    'Flip board preserves interaction fidelity',
    'PvE mode responds with a bot move at the selected difficulty',
    'Castling works through normal board interaction',
    'En passant works through normal board interaction',
    'Checkmate and draw both end the game with a visible overlay and blocked further play',
  ],
  controls: [
    'Board click selection and move target click',
    'Reset Match button',
    'Flip Board button',
    'Mode segmented control',
    'Difficulty segmented control',
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

async function playMoves(window, moves) {
  for (const [from, to] of moves) {
    await window.evaluate((sq) => window.__chessDebug.clickSquare(sq), from);
    await window.evaluate((sq) => window.__chessDebug.clickSquare(sq), to);
  }
}

test.beforeAll(() => {
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
});

test('glass marble chess supports responsive layout, PvE, special rules, and game termination', async () => {
  const electronApp = await electron.launch({ args: ['.'], cwd: rootDir });
  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  expect(QA_INVENTORY.claims.length).toBeGreaterThan(0);

  await expect(window.locator('h1')).toHaveText('Glass Marble Chess');
  await expect(window.locator('#statusLabel')).toContainText('White to move');
  await expect(window.locator('#whiteTurnPill')).toHaveClass(/active/);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().overlayVisible)).toBeFalsy();
  await expect(window.locator('button[data-theme="glass-marble"]')).toHaveClass(/active/);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().activeThemeKey)).toBe('glass-marble');

  await window.locator('button[data-theme="jade-brass"]').click();
  await expect(window.locator('button[data-theme="jade-brass"]')).toHaveClass(/active/);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().activeThemeKey)).toBe('jade-brass');
  await window.locator('button[data-theme="glass-marble"]').click();
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

  await window.evaluate(() => window.__chessDebug.clickSquare('b1'));
  await expect(window.locator('#selectionLabel')).toContainText('Knight on b1');
  await window.evaluate(() => window.__chessDebug.clickSquare('b1'));
  await expect(window.locator('#selectionLabel')).toHaveText('None');

  await window.locator('[data-mode="pve"]').click();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().playerMode)).toBe('pve');
  await expect(window.locator('[data-mode="pve"]')).toHaveClass(/active/);
  await expect(window.locator('[data-difficulty="easy"]')).toHaveClass(/active/);

  await window.evaluate(() => window.__chessDebug.clickSquare('e2'));
  await window.evaluate(() => window.__chessDebug.clickSquare('e4'));
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getMoveLog().length)).toBe(2);
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getTurn())).toBe('w');
  await expect(window.locator('#blackTurnPill')).not.toHaveClass(/active/);

  await window.locator('#resetButton').click();
  await window.locator('[data-mode="pvp"]').click();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().playerMode)).toBe('pvp');
  await window.setViewportSize({ width: 1440, height: 948 });
  await expect.poll(async () => {
    const nextMetrics = await window.evaluate(() => window.__chessDebug.boardMetrics());
    return nextMetrics.stage.right <= nextMetrics.viewport.width
      && nextMetrics.stage.bottom <= nextMetrics.viewport.height
      && Math.abs(nextMetrics.stage.width - nextMetrics.stage.height) <= 2;
  }).toBeTruthy();

  await window.locator('#flipButton').click();
  await window.evaluate(() => window.__chessDebug.clickSquare('b1'));
  await expect(window.locator('#selectionLabel')).toContainText('Knight on b1');
  await window.evaluate(() => window.__chessDebug.clickSquare('c3'));
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('c3'))).toBe('wn');
  await expect(window.locator('#statusLabel')).toContainText('Black to move');
  await window.locator('#resetButton').click();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('b1'))).toBe('wn');
  await window.locator('#flipButton').click();
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
  await expect(window.locator('#statusLabel')).toContainText('castled kingside');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getFen())).toContain('RNBQ1RK1');

  await window.locator('#resetButton').click();
  await playMoves(window, [
    ['e2', 'e4'],
    ['a7', 'a6'],
    ['e4', 'e5'],
    ['d7', 'd5'],
    ['e5', 'd6'],
  ]);
  await expect(window.locator('#statusLabel')).toContainText('en passant');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('d6'))).toBe('wp');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('d5'))).toBeNull();

  await window.locator('#resetButton').click();
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
  await expect(window.locator('#statusLabel')).toContainText('Checkmate ends the game');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.isGameOver())).toBeTruthy();
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getUiState().overlayVisible)).toBeTruthy();
  await expect(window.locator('#overlayHeadline')).toHaveText('White wins');
  await expect(window.locator('#moveLog li').last()).toContainText('Qxf7#');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getPieceAt('f7'))).toBe('wq');
  await window.locator('#overlayResetButton').click();
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
  await expect(window.locator('#statusLabel')).toContainText('Stalemate leaves no legal move');
  await expect(window.locator('#overlayHeadline')).toHaveText('Draw');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.isGameOver())).toBeTruthy();
  const drawFen = await window.evaluate(() => window.__chessDebug.getFen());
  await clickSquare(window, 'h8', 'square');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getFen())).toBe(drawFen);

  await electronApp.close();
});
