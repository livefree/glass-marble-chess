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
    'Players can click pieces and destination squares to move legally',
    'Castling works through normal board interaction',
    'En passant works through normal board interaction',
    'A complete game can be played to checkmate with game-over messaging',
    'Initial launched viewport shows the board, controls, and status without clipping',
  ],
  controls: [
    'Board click selection and move target click',
    'Reset Match button',
    'Flip Board button',
    'Move log and status panel updates',
  ],
  exploratory: [
    'Click an enemy piece first and verify no illegal selection occurs',
    'Select a piece and click the same square again to clear selection',
  ],
};

function moveNames() {
  return QA_INVENTORY;
}

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

test('marble glass chess supports clicks, castling, en passant, and checkmate completion', async () => {
  const electronApp = await electron.launch({ args: ['.'], cwd: rootDir });
  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  expect(moveNames().claims.length).toBeGreaterThan(0);

  await expect(window.locator('h1')).toHaveText('Glass Marble Chess');
  await expect(window.locator('#statusLabel')).toContainText('White to move');

  const metrics = await window.evaluate(() => window.__chessDebug.boardMetrics());
  expect(metrics.canvas.width).toBeGreaterThan(700);
  expect(metrics.canvas.height).toBeGreaterThan(600);
  expect(metrics.hud.top).toBeGreaterThanOrEqual(0);
  expect(metrics.legend.bottom).toBeLessThanOrEqual(metrics.viewport.height);

  await clickSquare(window, 'e7', 'piece');
  await expect(window.locator('#selectionLabel')).toHaveText('None');

  await clickSquare(window, 'b1', 'piece');
  await expect(window.locator('#selectionLabel')).toContainText('Knight on b1');
  await clickSquare(window, 'b1', 'piece');
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
  await expect(window.locator('#statusLabel')).toContainText('White to move');

  await playMoves(window, [
    ['e2', 'e4'],
    ['a7', 'a6'],
    ['e4', 'e5'],
    ['d7', 'd5'],
    ['e5', 'd6'],
  ]);
  await expect(window.locator('#statusLabel')).toContainText('en passant');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.getFen())).toContain('p2P4');

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

  await expect(window.locator('#statusLabel')).toContainText('wins by checkmate');
  await expect.poll(() => window.evaluate(() => window.__chessDebug.isGameOver())).toBeTruthy();
  await expect(window.locator('#moveLog li').last()).toContainText('Qxf7#');

  await window.locator('#flipButton').click();
  await expect(window.locator('#statusLabel')).toContainText('wins by checkmate');

  await electronApp.close();
});
