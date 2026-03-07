import './styles.css';
import { Chess } from 'chess.js';
import * as THREE from 'three';

const PIECE_LABELS = {
  wp: 'White Pawn', wn: 'White Knight', wb: 'White Bishop', wr: 'White Rook', wq: 'White Queen', wk: 'White King',
  bp: 'Black Pawn', bn: 'Black Knight', bb: 'Black Bishop', br: 'Black Rook', bq: 'Black Queen', bk: 'Black King',
};
const PROMOTION_LABELS = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' };

const PIECE_VALUES = { p: 1, n: 3, b: 3.25, r: 5, q: 9, k: 99 };
const DIFFICULTY_SETTINGS = {
  easy: { depth: 1, thinkMs: 320, randomness: 18, endgameBonus: 0 },
  medium: { depth: 2, thinkMs: 420, randomness: 8, endgameBonus: 1 },
  hard: { depth: 3, thinkMs: 560, randomness: 0, endgameBonus: 2 },
};
const OPENING_BOOK = {
  'e4': ['e5', 'c5', 'e6', 'c6'],
  'd4': ['Nf6', 'd5', 'e6'],
  'c4': ['e5', 'c5', 'Nf6'],
  'Nf3': ['Nf6', 'd5'],
  'e4 e5': ['Nf3', 'Nc3', 'Bc4'],
  'e4 e5 Nf3': ['Nc6', 'Nf6'],
  'e4 e5 Nf3 Nc6': ['Bc4', 'Bb5', 'd4'],
  'e4 e5 Nf3 Nc6 Bc4': ['Bc5', 'Nf6'],
  'e4 e5 Nf3 Nc6 Bc4 Bc5': ['c3', 'Nc3'],
  'e4 e5 Nf3 Nc6 Bb5': ['a6', 'Nf6'],
  'e4 e5 Nf3 Nc6 Bb5 a6': ['Ba4', 'Bxc6'],
  'e4 c5': ['Nf3', 'Nc3'],
  'e4 c5 Nf3': ['d6', 'Nc6', 'e6'],
  'e4 c5 Nf3 d6': ['d4', 'Bb5+'],
  'e4 c5 Nf3 d6 d4': ['cxd4'],
  'e4 e6': ['d4', 'Nf3'],
  'e4 e6 d4': ['d5'],
  'e4 c6': ['d4', 'Nc3'],
  'e4 c6 d4': ['d5'],
  'd4 Nf6': ['c4', 'Nf3'],
  'd4 Nf6 c4': ['e6', 'g6', 'd6'],
  'd4 Nf6 c4 e6': ['Nc3', 'Nf3'],
  'd4 d5': ['c4', 'Nf3'],
  'd4 d5 c4': ['e6', 'c6'],
  'd4 Nf6 Nf3': ['d5', 'g6'],
  'c4 e5': ['Nc3', 'g3'],
};
const OPENING_NAMES = {
  'e4': 'King Pawn Game',
  'd4': 'Queen Pawn Game',
  'c4': 'English Opening',
  'Nf3': 'Réti Opening',
  'e4 e5': 'Open Game',
  'e4 c5': 'Sicilian Defense',
  'e4 e6': 'French Defense',
  'e4 c6': 'Caro-Kann Defense',
  'd4 Nf6': 'Indian Defense',
  'd4 d5': 'Closed Game',
  'e4 e5 Nf3 Nc6': 'King Knight Opening',
  'e4 e5 Nf3 Nc6 Bc4 Bc5': 'Italian Game',
  'e4 e5 Nf3 Nc6 Bb5 a6': 'Ruy Lopez',
  'e4 c5 Nf3 d6': 'Sicilian Defense: Najdorf Structure',
  'e4 e6 d4 d5': 'French Defense',
  'e4 c6 d4 d5': 'Caro-Kann Defense',
  'd4 Nf6 c4 e6': 'Queen\'s Indian Setup',
  'd4 d5 c4 e6': 'Queen\'s Gambit Declined',
  'd4 Nf6 c4 g6': 'King\'s Indian Defense',
  'c4 e5': 'Reverse Sicilian',
};
const PIECE_SQUARE_TABLES = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 18, 28, 28, 18, 10, 10],
    [6, 6, 12, 24, 24, 12, 6, 6],
    [0, 0, 0, 22, 22, 0, 0, 0],
    [4, -2, -8, 6, 6, -8, -2, 4],
    [4, 8, 8, -20, -20, 8, 8, 4],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-40, -22, -14, -14, -14, -14, -22, -40],
    [-24, -6, 0, 4, 4, 0, -6, -24],
    [-14, 6, 14, 18, 18, 14, 6, -14],
    [-10, 12, 20, 24, 24, 20, 12, -10],
    [-10, 6, 18, 22, 22, 18, 6, -10],
    [-14, 8, 12, 14, 14, 12, 8, -14],
    [-24, -4, 2, 8, 8, 2, -4, -24],
    [-40, -22, -14, -14, -14, -14, -22, -40],
  ],
  b: [
    [-16, -8, -8, -8, -8, -8, -8, -16],
    [-8, 4, 0, 4, 4, 0, 4, -8],
    [-8, 8, 10, 12, 12, 10, 8, -8],
    [-8, 0, 12, 14, 14, 12, 0, -8],
    [-8, 6, 10, 14, 14, 10, 6, -8],
    [-8, 8, 8, 10, 10, 8, 8, -8],
    [-8, 6, 2, 2, 2, 2, 6, -8],
    [-16, -8, -8, -8, -8, -8, -8, -16],
  ],
  r: [
    [0, 0, 4, 8, 8, 4, 0, 0],
    [-4, 0, 0, 0, 0, 0, 0, -4],
    [-4, 0, 0, 0, 0, 0, 0, -4],
    [-4, 0, 0, 0, 0, 0, 0, -4],
    [-4, 0, 0, 0, 0, 0, 0, -4],
    [-4, 0, 0, 0, 0, 0, 0, -4],
    [8, 12, 12, 12, 12, 12, 12, 8],
    [0, 0, 4, 8, 8, 4, 0, 0],
  ],
  q: [
    [-12, -8, -8, -4, -4, -8, -8, -12],
    [-8, 0, 0, 0, 0, 0, 0, -8],
    [-8, 0, 6, 6, 6, 6, 0, -8],
    [-4, 0, 6, 8, 8, 6, 0, -4],
    [0, 0, 6, 8, 8, 6, 0, -4],
    [-8, 6, 6, 6, 6, 6, 0, -8],
    [-8, 0, 6, 0, 0, 0, 0, -8],
    [-12, -8, -8, -4, -4, -8, -8, -12],
  ],
  k: [
    [-30, -38, -38, -44, -44, -38, -38, -30],
    [-30, -38, -38, -44, -44, -38, -38, -30],
    [-30, -38, -38, -44, -44, -38, -38, -30],
    [-30, -38, -38, -44, -44, -38, -38, -30],
    [-18, -28, -28, -34, -34, -28, -28, -18],
    [-8, -18, -18, -22, -22, -18, -18, -8],
    [18, 18, 0, -8, -8, 0, 18, 18],
    [24, 32, 12, 0, 0, 12, 32, 24],
  ],
};
const TIME_CONTROLS = {
  untimed: { label: 'Untimed', ms: null },
  blitz1: { label: '1 min', ms: 60_000 },
  rapid5: { label: '5 min', ms: 300_000 },
  rapid10: { label: '10 min', ms: 600_000 },
};
const SETTINGS_STORAGE_KEY = 'glass-marble-chess.settings';
const SAVE_STORAGE_KEY = 'glass-marble-chess.save-slots';
const SAVE_SLOT_COUNT = 3;
const THEMES = {
  'glass-marble': {
    label: 'Glass Marble',
    boardLight: 0xecf6ff,
    boardDark: 0x1f2d44,
    detailLight: 0x86bbd9,
    detailDark: 0x648fb4,
    lightSurface: 'marble',
    darkSurface: 'marble',
    lightMaterial: { roughness: 0.12, metalness: 0.02, clearcoat: 1, clearcoatRoughness: 0.08 },
    darkMaterial: { roughness: 0.38, metalness: 0.1, clearcoat: 0.7, clearcoatRoughness: 0.22 },
    fog: 0x0b1018,
    envStops: ['#f8fbff', '#87c9ff', '#112742', '#06080d'],
    accent: '#84e6ff',
    accentWarm: '#ffd7a0',
    boardBase: 0x231610,
    glow: 0x4ba7ff,
    pieces: {
      w: { kind: 'glass', color: 0xd9f4ff, detail: 0xb1ecff, emissive: 0x7fd6ff, emissiveIntensity: 0.18 },
      b: { kind: 'glass', color: 0x0d1a28, detail: 0x274866, emissive: 0x20476e, emissiveIntensity: 0.1 },
    },
    keyLight: 0xffffff,
    rimLight: 0x7ec7ff,
    warmLight: 0xffcf8b,
  },
  'obsidian-gold': {
    label: 'Obsidian Gold',
    boardLight: 0xefe0bc,
    boardDark: 0x18151a,
    detailLight: 0xc4a261,
    detailDark: 0x645248,
    lightSurface: 'brushed-metal',
    darkSurface: 'stone',
    lightMaterial: { roughness: 0.24, metalness: 0.92, clearcoat: 0.68, clearcoatRoughness: 0.12 },
    darkMaterial: { roughness: 0.42, metalness: 0.08, clearcoat: 0.82, clearcoatRoughness: 0.18 },
    fog: 0x100d0f,
    envStops: ['#fff0d9', '#d8a44d', '#261d24', '#080608'],
    accent: '#f0cf84',
    accentWarm: '#ffe9c4',
    boardBase: 0x130f12,
    glow: 0xb98529,
    pieces: {
      w: { kind: 'metal', color: 0xe7bf72, detail: 0xffe6b7, emissive: 0xa77725, emissiveIntensity: 0.06 },
      b: { kind: 'stone', color: 0x131114, detail: 0x43343c, emissive: 0x38252c, emissiveIntensity: 0.03 },
    },
    keyLight: 0xfff3df,
    rimLight: 0xffd27e,
    warmLight: 0xffb55b,
  },
  'jade-brass': {
    label: 'Jade Brass',
    boardLight: 0xdff6ee,
    boardDark: 0x153431,
    detailLight: 0x7dc4a9,
    detailDark: 0x96753b,
    lightSurface: 'stone',
    darkSurface: 'brushed-metal',
    lightMaterial: { roughness: 0.28, metalness: 0.06, clearcoat: 0.72, clearcoatRoughness: 0.14 },
    darkMaterial: { roughness: 0.26, metalness: 0.88, clearcoat: 0.55, clearcoatRoughness: 0.15 },
    fog: 0x091513,
    envStops: ['#effff7', '#6dd4b1', '#153f38', '#040908'],
    accent: '#86f0c8',
    accentWarm: '#d9ba71',
    boardBase: 0x1a1610,
    glow: 0x49b995,
    pieces: {
      w: { kind: 'jade', color: 0xbcecdf, detail: 0x5aa98a, emissive: 0x58c89b, emissiveIntensity: 0.08 },
      b: { kind: 'metal', color: 0xb88a44, detail: 0xf4d7a1, emissive: 0x7f5b1f, emissiveIntensity: 0.04 },
    },
    keyLight: 0xf8fff9,
    rimLight: 0x88f0d0,
    warmLight: 0xd7a95d,
  },
  'rosewood-ivory': {
    label: 'Rosewood Ivory',
    boardLight: 0xf7ede2,
    boardDark: 0x4b1f2a,
    detailLight: 0xd9b5a2,
    detailDark: 0xb46472,
    lightSurface: 'ivory',
    darkSurface: 'wood',
    lightMaterial: { roughness: 0.24, metalness: 0.02, clearcoat: 0.5, clearcoatRoughness: 0.18 },
    darkMaterial: { roughness: 0.58, metalness: 0.02, clearcoat: 0.36, clearcoatRoughness: 0.24 },
    fog: 0x170b10,
    envStops: ['#fff5ef', '#efb0a7', '#512330', '#090507'],
    accent: '#ffb6b0',
    accentWarm: '#ffe0b8',
    boardBase: 0x2f181d,
    glow: 0xe17f92,
    pieces: {
      w: { kind: 'ivory', color: 0xf7efe4, detail: 0xd7bf9d, emissive: 0xcfa880, emissiveIntensity: 0.02 },
      b: { kind: 'wood', color: 0x5a2c32, detail: 0x8e575d, emissive: 0x4c2029, emissiveIntensity: 0.02 },
    },
    keyLight: 0xfff4ee,
    rimLight: 0xffb5bf,
    warmLight: 0xffd49f,
  },
};
const BOT_COLOR = 'b';

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="shell">
    <div class="hud">
      <div class="hud-header">
        <div class="hud-brand">
          <p class="eyebrow">Electron 3D Chess</p>
          <h1>Glass Marble Chess</h1>
        </div>
        <button type="button" class="menu-toggle" id="menuButton">Game Menu</button>
      </div>

      <section class="turn-hero" id="turnHero" data-turn="w">
        <div class="turn-pill-row">
          <span class="turn-pill active" id="whiteTurnPill">White</span>
          <span class="turn-pill" id="blackTurnPill">Black</span>
        </div>
        <strong id="turnHeadline">White to move</strong>
        <p id="turnPrompt">White controls the first move.</p>
        <div class="hero-clocks">
          <div class="hero-clock">
            <span class="label">White Clock</span>
            <strong id="whiteClockLabel">05:00</strong>
          </div>
          <div class="hero-clock">
            <span class="label">Black Clock</span>
            <strong id="blackClockLabel">05:00</strong>
          </div>
        </div>
      </section>

      <div class="controls">
        <button id="undoButton">Undo</button>
        <button id="redoButton">Redo</button>
        <button id="resetButton">Reset Match</button>
        <button id="flipButton">Flip Board</button>
      </div>

      <div class="status-panel">
        <div>
          <span class="label">Turn</span>
          <strong id="turnLabel">White</strong>
        </div>
        <div>
          <span class="label">Status</span>
          <strong id="statusLabel">White to move</strong>
        </div>
        <div>
          <span class="label">Selection</span>
          <strong id="selectionLabel">None</strong>
        </div>
        <div>
          <span class="label">Opening</span>
          <strong id="openingLabel">Unclassified</strong>
        </div>
      </div>

      <div class="move-panels">
        <section>
          <div class="section-head">
            <div>
              <span class="label">Analysis</span>
              <h2>Move Log</h2>
            </div>
            <button type="button" class="inline-menu-button" id="reviewMenuButton">Review</button>
          </div>
          <p id="analysisLabel">Review tools unlock once the game has moves.</p>
          <ol id="moveLog"></ol>
        </section>
        <section>
          <h2>Captured</h2>
          <div id="capturedWhite" class="captured-row"></div>
          <div id="capturedBlack" class="captured-row"></div>
        </section>
      </div>

      <aside class="settings-drawer" id="settingsDrawer" hidden>
        <div class="settings-head">
          <div>
            <span class="label">Menu</span>
            <strong>Game Setup & Tools</strong>
          </div>
          <button type="button" class="menu-close" id="closeMenuButton">Close</button>
        </div>

        <div class="menu-tabs" id="menuTabs">
          <button type="button" class="menu-tab active" data-menu-tab="setup">Setup</button>
          <button type="button" class="menu-tab" data-menu-tab="review">Review</button>
          <button type="button" class="menu-tab" data-menu-tab="library">Library</button>
        </div>

        <section class="play-config" data-settings-panel="setup">
          <div>
            <span class="label">Mode</span>
            <div class="segmented" id="modeControls">
              <button type="button" class="segment active" data-mode="pvp">PvP</button>
              <button type="button" class="segment" data-mode="pve">PvE</button>
            </div>
          </div>
          <div>
            <span class="label">Difficulty</span>
            <div class="segmented" id="difficultyControls">
              <button type="button" class="segment active" data-difficulty="easy">Easy</button>
              <button type="button" class="segment" data-difficulty="medium">Medium</button>
              <button type="button" class="segment" data-difficulty="hard">Hard</button>
            </div>
          </div>
          <div>
            <span class="label">Theme</span>
            <div class="segmented" id="themeControls">
              <button type="button" class="segment active" data-theme="glass-marble">Glass Marble</button>
              <button type="button" class="segment" data-theme="obsidian-gold">Obsidian Gold</button>
              <button type="button" class="segment" data-theme="jade-brass">Jade Brass</button>
              <button type="button" class="segment" data-theme="rosewood-ivory">Rosewood Ivory</button>
            </div>
          </div>
          <div>
            <span class="label">Time</span>
            <div class="segmented" id="timeControls">
              <button type="button" class="segment active" data-time="rapid5">5 min</button>
              <button type="button" class="segment" data-time="blitz1">1 min</button>
              <button type="button" class="segment" data-time="rapid10">10 min</button>
              <button type="button" class="segment" data-time="untimed">Untimed</button>
            </div>
          </div>
          <div>
            <span class="label">Audio</span>
            <div class="utility-row">
              <button id="soundToggleButton">Sound On</button>
            </div>
          </div>
        </section>

        <section class="analysis-panel" data-settings-panel="review" hidden>
          <div>
            <span class="label">Review</span>
            <strong id="reviewLabel">Move navigation</strong>
            <p>Use this strip to step through a finished or imported game.</p>
          </div>
          <div class="review-controls">
            <button type="button" id="reviewStartButton">|&lt;</button>
            <button type="button" id="reviewPrevButton">&lt;</button>
            <button type="button" id="reviewExitButton">Live</button>
            <button type="button" id="reviewNextButton">&gt;</button>
            <button type="button" id="reviewEndButton">&gt;|</button>
          </div>
        </section>

        <section class="save-panel" data-settings-panel="library" hidden>
          <div>
            <span class="label">Saves & PGN</span>
            <strong id="persistenceLabel">Export, import, or store a match in a local slot.</strong>
          </div>
          <div class="pgn-actions">
            <button type="button" class="utility-button" id="exportPgnButton">Export PGN</button>
            <button type="button" class="utility-button" id="importPgnButton">Import PGN</button>
            <button type="button" class="utility-button" id="savePgnFileButton">Save .pgn</button>
            <button type="button" class="utility-button" id="openPgnFileButton">Open .pgn</button>
          </div>
          <div class="save-slots" id="saveSlots">
            ${Array.from({ length: SAVE_SLOT_COUNT }, (_, index) => `
              <article class="save-slot" data-slot="${index}">
                <div>
                  <span class="label">Slot ${index + 1}</span>
                  <strong class="save-slot-title">Empty</strong>
                  <p class="save-slot-detail">No saved game.</p>
                </div>
                <div class="slot-actions">
                  <button type="button" class="slot-button" data-save-slot="${index}">Save</button>
                  <button type="button" class="slot-button" data-load-slot="${index}">Load</button>
                </div>
              </article>
            `).join('')}
          </div>
          <textarea id="pgnTextarea" spellcheck="false" placeholder="PGN appears here for export, or paste PGN to import."></textarea>
          <div class="comment-panel">
            <div>
              <span class="label">Move Note</span>
              <strong id="commentLabel">Move notes attach to a played position.</strong>
            </div>
            <textarea id="commentTextarea" spellcheck="false" placeholder="Add a note for the current live position or reviewed move."></textarea>
            <div class="pgn-actions">
              <button type="button" class="utility-button" id="saveCommentButton">Save Note</button>
              <button type="button" class="utility-button" id="clearCommentButton">Clear Note</button>
            </div>
          </div>
        </section>
      </aside>
    </div>

    <div class="board-wrap">
      <div class="board-topbar">
        <div class="topbar-chip">
          <span class="label">Mode</span>
          <strong id="boardModeLabel">PvP</strong>
        </div>
        <div class="topbar-chip">
          <span class="label">Opening</span>
          <strong id="boardOpeningLabel">Unclassified</strong>
        </div>
        <div class="topbar-chip topbar-status">
          <span class="label">Status</span>
          <strong id="boardStatusLabel">White to move</strong>
        </div>
      </div>
      <div class="board-stage" id="boardStage">
        <canvas id="scene"></canvas>
        <div class="board-side-indicator board-side-top" id="topSideIndicator">
          <span class="label">Far Side</span>
          <strong id="topSideLabel">Black · Upper Side</strong>
        </div>
        <div class="board-side-indicator board-side-bottom" id="bottomSideIndicator">
          <span class="label">Near Side</span>
          <strong id="bottomSideLabel">White · Lower Side</strong>
        </div>
        <div class="promotion-overlay" id="promotionOverlay" hidden>
          <div class="promotion-card">
            <p class="overlay-eyebrow">Promotion</p>
            <h2 id="promotionHeadline">Choose a piece</h2>
            <div class="promotion-grid">
              <button class="promotion-option" data-promotion="q">Queen</button>
              <button class="promotion-option" data-promotion="r">Rook</button>
              <button class="promotion-option" data-promotion="b">Bishop</button>
              <button class="promotion-option" data-promotion="n">Knight</button>
            </div>
            <button id="promotionCancelButton">Cancel</button>
          </div>
        </div>
        <div class="game-overlay" id="gameOverlay" hidden>
          <div class="overlay-card">
            <p class="overlay-eyebrow">Game Over</p>
            <h2 id="overlayHeadline">White wins</h2>
            <p id="overlayDetail">Checkmate ends the game.</p>
            <div class="overlay-meta" id="overlayMeta"></div>
            <button id="overlayReviewButton">Review Game</button>
            <button id="overlayResetButton">Play Again</button>
          </div>
        </div>
      </div>
      <div class="legend">
        <article class="legend-card">
          <span class="label">Action</span>
          <strong id="instructionLabel">Click one of your pieces, then a glowing destination square.</strong>
        </article>
        <article class="legend-card">
          <span class="label">Pointer</span>
          <strong id="hoverSquareLabel">Pointer: off board</strong>
        </article>
        <article class="legend-card">
          <span class="label">Context</span>
          <strong id="hintLabel">Special moves supported: castling, en passant, promotion to queen.</strong>
        </article>
      </div>
    </div>
  </div>
`;

const canvas = document.querySelector('#scene');
const boardWrap = document.querySelector('.board-wrap');
const boardStage = document.querySelector('#boardStage');
const menuButton = document.querySelector('#menuButton');
const closeMenuButton = document.querySelector('#closeMenuButton');
const reviewMenuButton = document.querySelector('#reviewMenuButton');
const settingsDrawer = document.querySelector('#settingsDrawer');
const menuTabs = document.querySelector('#menuTabs');
const turnLabel = document.querySelector('#turnLabel');
const turnHeadline = document.querySelector('#turnHeadline');
const turnPrompt = document.querySelector('#turnPrompt');
const statusLabel = document.querySelector('#statusLabel');
const selectionLabel = document.querySelector('#selectionLabel');
const whiteClockLabel = document.querySelector('#whiteClockLabel');
const blackClockLabel = document.querySelector('#blackClockLabel');
const openingLabel = document.querySelector('#openingLabel');
const analysisLabel = document.querySelector('#analysisLabel');
const persistenceLabel = document.querySelector('#persistenceLabel');
const boardModeLabel = document.querySelector('#boardModeLabel');
const boardOpeningLabel = document.querySelector('#boardOpeningLabel');
const boardStatusLabel = document.querySelector('#boardStatusLabel');
const topSideLabel = document.querySelector('#topSideLabel');
const bottomSideLabel = document.querySelector('#bottomSideLabel');
const moveLog = document.querySelector('#moveLog');
const capturedWhite = document.querySelector('#capturedWhite');
const capturedBlack = document.querySelector('#capturedBlack');
const hintLabel = document.querySelector('#hintLabel');
const instructionLabel = document.querySelector('#instructionLabel');
const hoverSquareLabel = document.querySelector('#hoverSquareLabel');
const legend = document.querySelector('.legend');
const turnHero = document.querySelector('#turnHero');
const whiteTurnPill = document.querySelector('#whiteTurnPill');
const blackTurnPill = document.querySelector('#blackTurnPill');
const modeControls = document.querySelector('#modeControls');
const difficultyControls = document.querySelector('#difficultyControls');
const themeControls = document.querySelector('#themeControls');
const timeControls = document.querySelector('#timeControls');
const reviewStartButton = document.querySelector('#reviewStartButton');
const reviewPrevButton = document.querySelector('#reviewPrevButton');
const reviewExitButton = document.querySelector('#reviewExitButton');
const reviewNextButton = document.querySelector('#reviewNextButton');
const reviewEndButton = document.querySelector('#reviewEndButton');
const saveSlotsElement = document.querySelector('#saveSlots');
const pgnTextarea = document.querySelector('#pgnTextarea');
const exportPgnButton = document.querySelector('#exportPgnButton');
const importPgnButton = document.querySelector('#importPgnButton');
const savePgnFileButton = document.querySelector('#savePgnFileButton');
const openPgnFileButton = document.querySelector('#openPgnFileButton');
const commentLabel = document.querySelector('#commentLabel');
const commentTextarea = document.querySelector('#commentTextarea');
const saveCommentButton = document.querySelector('#saveCommentButton');
const clearCommentButton = document.querySelector('#clearCommentButton');
const undoButton = document.querySelector('#undoButton');
const redoButton = document.querySelector('#redoButton');
const soundToggleButton = document.querySelector('#soundToggleButton');
const promotionOverlay = document.querySelector('#promotionOverlay');
const promotionHeadline = document.querySelector('#promotionHeadline');
const promotionCancelButton = document.querySelector('#promotionCancelButton');
const gameOverlay = document.querySelector('#gameOverlay');
const overlayHeadline = document.querySelector('#overlayHeadline');
const overlayDetail = document.querySelector('#overlayDetail');
const overlayMeta = document.querySelector('#overlayMeta');
const overlayReviewButton = document.querySelector('#overlayReviewButton');

let playerMode = 'pvp';
let botDifficulty = 'easy';
let activeThemeKey = 'glass-marble';
let timeControlKey = 'rapid5';
let soundEnabled = true;
let boardFlipped = false;
let settingsOpen = false;
let activeMenuTab = 'setup';
let selectedSquare = null;
let lastMoveSquares = [];
let hoverSquare = null;
let botThinking = false;
let botTimer = null;
let forcedConclusion = null;
let pendingPromotion = null;
let dragState = null;
let reviewMode = false;
let reviewIndex = 0;
let gameStartFen = 'start';
let recordedHistorySan = [];
let recordedHistoryVerbose = [];
let importedHeaders = {};
let saveSlots = Array.from({ length: SAVE_SLOT_COUNT }, () => null);
let audioContext = null;
let lastSoundCue = null;
let lastEngineStats = { transpositionEntries: 0, depth: 0, endgame: false, nodeCount: 0, usedBook: false };
const redoStack = [];
const captureState = { w: [], b: [] };
const positionComments = new Map();
const transpositionTable = new Map();
const clockState = {
  w: TIME_CONTROLS.rapid5.ms,
  b: TIME_CONTROLS.rapid5.ms,
  started: false,
  lastTickAt: null,
};
const desktopBridge = window.chessDesktop ?? null;

function updateSettingsMenu() {
  settingsDrawer.hidden = !settingsOpen;
  menuButton.setAttribute('aria-expanded', String(settingsOpen));
  menuButton.classList.toggle('menu-open', settingsOpen);
  menuTabs.querySelectorAll('[data-menu-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.menuTab === activeMenuTab);
  });
  settingsDrawer.querySelectorAll('[data-settings-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.settingsPanel !== activeMenuTab;
  });
}

function openSettingsMenu(tab = activeMenuTab) {
  activeMenuTab = tab;
  settingsOpen = true;
  updateSettingsMenu();
}

function closeSettingsMenu() {
  settingsOpen = false;
  updateSettingsMenu();
}

function toggleSettingsMenu() {
  settingsOpen = !settingsOpen;
  updateSettingsMenu();
}

function setMenuTab(tab) {
  activeMenuTab = tab;
  updateSettingsMenu();
}

const chess = new Chess();
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b1018, 0.035);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
const root = new THREE.Group();
const boardGroup = new THREE.Group();
const piecesGroup = new THREE.Group();
root.add(boardGroup);
root.add(piecesGroup);
scene.add(root);

const ambient = new THREE.AmbientLight(0xd7ecff, 0.5);
const hemi = new THREE.HemisphereLight(0x9ec5ff, 0x15110c, 1.1);
const keyLight = new THREE.SpotLight(0xffffff, 250, 0, Math.PI / 5, 0.45, 1.4);
keyLight.position.set(8, 18, 6);
keyLight.target.position.set(0, 0, 0);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.bias = -0.00003;
const rimLight = new THREE.PointLight(0x7ec7ff, 70, 25, 2);
const warmLight = new THREE.PointLight(0xffcf8b, 40, 18, 2);
rimLight.position.set(-8, 7, -8);
warmLight.position.set(6, 5, 8);
scene.add(ambient, hemi, keyLight, keyLight.target, rimLight, warmLight);

const envCanvas = document.createElement('canvas');
envCanvas.width = 512;
envCanvas.height = 512;
const envCtx = envCanvas.getContext('2d');
const gradient = envCtx.createRadialGradient(256, 180, 10, 256, 256, 280);
gradient.addColorStop(0, '#f8fbff');
gradient.addColorStop(0.28, '#87c9ff');
gradient.addColorStop(0.7, '#112742');
gradient.addColorStop(1, '#06080d');
envCtx.fillStyle = gradient;
envCtx.fillRect(0, 0, 512, 512);
const envTexture = new THREE.CanvasTexture(envCanvas);
envTexture.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = envTexture;
scene.background = envTexture;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.95);
const boardSize = 8;
const squareSize = 1;
const half = boardSize / 2;
const squareMeshes = new Map();
const pieceMeshes = new Map();
const legalTargets = new Set();
const legalMovesByTarget = new Map();

const squareGeometry = new THREE.BoxGeometry(squareSize, 0.22, squareSize);
const boardBase = new THREE.Mesh(
  new THREE.BoxGeometry(9.8, 0.8, 9.8),
  new THREE.MeshPhysicalMaterial({ color: 0x231610, roughness: 0.5, metalness: 0.15, clearcoat: 0.45 })
);
boardBase.position.y = -0.52;
boardBase.receiveShadow = true;
boardBase.castShadow = true;
boardGroup.add(boardBase);

const underGlow = new THREE.Mesh(
  new THREE.CircleGeometry(6.8, 64),
  new THREE.MeshBasicMaterial({ color: 0x4ba7ff, transparent: true, opacity: 0.12 })
);
underGlow.rotation.x = -Math.PI / 2;
underGlow.position.y = -0.65;
boardGroup.add(underGlow);

const squareLightMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xe8f3ff,
  roughness: 0.12,
  metalness: 0.02,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
});
const squareDarkMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x1e2d43,
  roughness: 0.38,
  metalness: 0.1,
  clearcoat: 0.7,
  clearcoatRoughness: 0.22,
});
const legalMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x64e9ff,
  emissive: 0x1aa3b2,
  emissiveIntensity: 0.95,
  roughness: 0.08,
  clearcoat: 1,
  transparent: true,
  opacity: 0.94,
});
const selectedMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffe1a8,
  emissive: 0xb78a33,
  emissiveIntensity: 0.8,
  roughness: 0.12,
  clearcoat: 1,
});
const lastMoveMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xb59dff,
  emissive: 0x4638a9,
  emissiveIntensity: 0.7,
  roughness: 0.12,
  clearcoat: 1,
});
const hoverMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xa7ecff,
  emissive: 0x2e8ead,
  emissiveIntensity: 0.55,
  roughness: 0.08,
  clearcoat: 1,
  transparent: true,
  opacity: 0.92,
});
const checkMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xff8d8d,
  emissive: 0xaa2222,
  emissiveIntensity: 0.86,
  roughness: 0.1,
  clearcoat: 1,
});
const sideMarkerMaterials = {
  w: new THREE.MeshStandardMaterial({ color: 0xe8f0ff, metalness: 0.55, roughness: 0.24 }),
  b: new THREE.MeshStandardMaterial({ color: 0xc7a35a, metalness: 0.72, roughness: 0.2 }),
};

function makeMarbleMap(lightHex, darkHex) {
  const size = 256;
  const localCanvas = document.createElement('canvas');
  localCanvas.width = size;
  localCanvas.height = size;
  const ctx = localCanvas.getContext('2d');
  ctx.fillStyle = `#${lightHex.toString(16).padStart(6, '0')}`;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 24; i += 1) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${(darkHex >> 16) & 255}, ${(darkHex >> 8) & 255}, ${darkHex & 255}, ${0.05 + (i % 4) * 0.05})`;
    ctx.lineWidth = 2 + (i % 5);
    ctx.moveTo(Math.random() * size, Math.random() * size);
    for (let step = 0; step < 5; step += 1) {
      ctx.bezierCurveTo(Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size);
    }
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(localCanvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.4, 1.4);
  return texture;
}

function makeWoodMap(baseHex, grainHex) {
  const size = 256;
  const localCanvas = document.createElement('canvas');
  localCanvas.width = size;
  localCanvas.height = size;
  const ctx = localCanvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, `#${baseHex.toString(16).padStart(6, '0')}`);
  gradient.addColorStop(1, `#${Math.max(baseHex - 0x141414, 0).toString(16).padStart(6, '0')}`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const grain = `rgba(${(grainHex >> 16) & 255}, ${(grainHex >> 8) & 255}, ${grainHex & 255}, 0.18)`;
  for (let i = 0; i < 34; i += 1) {
    ctx.beginPath();
    ctx.strokeStyle = grain;
    ctx.lineWidth = 1 + (i % 3);
    const offset = (i / 34) * size;
    ctx.moveTo(0, offset + Math.sin(i) * 6);
    for (let x = 0; x <= size; x += 24) {
      ctx.lineTo(x, offset + Math.sin((x / size) * Math.PI * 4 + i) * 8);
    }
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(localCanvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1.5);
  return texture;
}

function makeBrushedMetalMap(baseHex, detailHex) {
  const size = 256;
  const localCanvas = document.createElement('canvas');
  localCanvas.width = size;
  localCanvas.height = size;
  const ctx = localCanvas.getContext('2d');
  ctx.fillStyle = `#${baseHex.toString(16).padStart(6, '0')}`;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 180; i += 1) {
    const alpha = 0.03 + (i % 6) * 0.01;
    ctx.fillStyle = `rgba(${(detailHex >> 16) & 255}, ${(detailHex >> 8) & 255}, ${detailHex & 255}, ${alpha})`;
    ctx.fillRect(0, Math.random() * size, size, 1 + Math.random() * 2);
  }
  const texture = new THREE.CanvasTexture(localCanvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.2, 1.2);
  return texture;
}

function makeStoneMap(baseHex, detailHex) {
  const size = 256;
  const localCanvas = document.createElement('canvas');
  localCanvas.width = size;
  localCanvas.height = size;
  const ctx = localCanvas.getContext('2d');
  ctx.fillStyle = `#${baseHex.toString(16).padStart(6, '0')}`;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 140; i += 1) {
    const radius = 3 + Math.random() * 16;
    ctx.fillStyle = `rgba(${(detailHex >> 16) & 255}, ${(detailHex >> 8) & 255}, ${detailHex & 255}, ${0.025 + Math.random() * 0.05})`;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(localCanvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.3, 1.3);
  return texture;
}

function makeSurfaceMap(kind, baseHex, detailHex) {
  if (kind === 'wood') return makeWoodMap(baseHex, detailHex);
  if (kind === 'brushed-metal') return makeBrushedMetalMap(baseHex, detailHex);
  if (kind === 'stone' || kind === 'jade' || kind === 'ivory') return makeStoneMap(baseHex, detailHex);
  return makeMarbleMap(baseHex, detailHex);
}

function applyPhysicalMaterial(material, props) {
  Object.entries(props).forEach(([key, value]) => {
    material[key] = value;
  });
}

function configurePieceMaterial(material, pieceTheme) {
  material.color.setHex(pieceTheme.color);
  material.emissive.setHex(pieceTheme.emissive);
  material.emissiveIntensity = pieceTheme.emissiveIntensity;
  material.map = makeSurfaceMap(pieceTheme.kind, pieceTheme.color, pieceTheme.detail);
  material.transparent = false;
  material.opacity = 1;
  material.metalness = 0.05;
  material.roughness = 0.3;
  material.clearcoat = 0.45;
  material.clearcoatRoughness = 0.14;
  material.transmission = 0;
  material.thickness = 0;
  material.ior = 1.2;

  if (pieceTheme.kind === 'glass') {
    material.transparent = true;
    material.opacity = 0.92;
    material.metalness = 0;
    material.roughness = 0.04;
    material.clearcoat = 1;
    material.clearcoatRoughness = 0.03;
    material.transmission = 0.76;
    material.thickness = 1.3;
    material.ior = 1.26;
  } else if (pieceTheme.kind === 'metal') {
    material.metalness = 0.94;
    material.roughness = 0.2;
    material.clearcoat = 0.7;
    material.clearcoatRoughness = 0.1;
  } else if (pieceTheme.kind === 'stone' || pieceTheme.kind === 'jade') {
    material.metalness = 0.08;
    material.roughness = pieceTheme.kind === 'jade' ? 0.22 : 0.42;
    material.clearcoat = pieceTheme.kind === 'jade' ? 0.6 : 0.3;
    material.clearcoatRoughness = 0.12;
    if (pieceTheme.kind === 'jade') {
      material.transmission = 0.16;
      material.thickness = 0.5;
      material.ior = 1.18;
      material.transparent = true;
      material.opacity = 0.98;
    }
  } else if (pieceTheme.kind === 'wood') {
    material.roughness = 0.56;
    material.clearcoat = 0.22;
    material.clearcoatRoughness = 0.18;
  } else if (pieceTheme.kind === 'ivory') {
    material.roughness = 0.24;
    material.clearcoat = 0.52;
    material.clearcoatRoughness = 0.16;
  }

  material.needsUpdate = true;
}

function getActiveTheme() {
  return THEMES[activeThemeKey];
}

function renderEnvironment(theme) {
  const gradient = envCtx.createRadialGradient(256, 180, 10, 256, 256, 280);
  gradient.addColorStop(0, theme.envStops[0]);
  gradient.addColorStop(0.28, theme.envStops[1]);
  gradient.addColorStop(0.7, theme.envStops[2]);
  gradient.addColorStop(1, theme.envStops[3]);
  envCtx.fillStyle = gradient;
  envCtx.fillRect(0, 0, 512, 512);
  envTexture.needsUpdate = true;
  scene.fog.color.setHex(theme.fog);
}

squareLightMaterial.map = makeMarbleMap(0xecf6ff, 0x86bbd9);
squareDarkMaterial.map = makeMarbleMap(0x1f2d44, 0x648fb4);

for (let rank = 0; rank < 8; rank += 1) {
  for (let file = 0; file < 8; file += 1) {
    const square = `${'abcdefgh'[file]}${rank + 1}`;
    const isLight = (rank + file) % 2 === 1;
    const mesh = new THREE.Mesh(squareGeometry, isLight ? squareLightMaterial : squareDarkMaterial);
    mesh.position.set(file - half + 0.5, 0, rank - half + 0.5);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    mesh.userData.square = square;
    mesh.userData.baseMaterial = mesh.material;
    boardGroup.add(mesh);
    squareMeshes.set(square, mesh);
  }
}

const floor = new THREE.Mesh(new THREE.CircleGeometry(12, 72), new THREE.ShadowMaterial({ opacity: 0.32 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.68;
floor.receiveShadow = true;
scene.add(floor);

function createPieceMesh(pieceCode) {
  const theme = getActiveTheme();
  const pieceTheme = theme.pieces[pieceCode[0]];
  const glassMaterial = new THREE.MeshPhysicalMaterial({});
  configurePieceMaterial(glassMaterial, pieceTheme);

  const group = new THREE.Group();
  const type = pieceCode[1];
  const lowerRadius = type === 'p' ? 0.22 : type === 'n' ? 0.28 : type === 'r' ? 0.34 : 0.31;
  const bodyHeight = type === 'p' ? 0.66 : type === 'q' ? 1.36 : type === 'k' ? 1.48 : type === 'n' ? 0.9 : 1.06;
  const topRadius = type === 'p' ? 0.14 : type === 'r' ? 0.28 : type === 'b' ? 0.17 : type === 'n' ? 0.16 : 0.2;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.2, 36), glassMaterial);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(topRadius, lowerRadius, bodyHeight, 42), glassMaterial);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 14, 40), glassMaterial);
  const cap = new THREE.Mesh(type === 'p' ? new THREE.SphereGeometry(0.16, 28, 28) : new THREE.SphereGeometry(0.22, 28, 28), glassMaterial);

  base.position.y = 0.11;
  body.position.y = 0.22 + bodyHeight / 2;
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.28 + bodyHeight * (type === 'p' ? 0.58 : 0.76);
  cap.position.y = 0.28 + bodyHeight + (type === 'p' ? 0.13 : 0.18);
  group.add(base, body, collar, cap);

  if (type === 'p') {
    const waist = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 14, 30), glassMaterial);
    waist.rotation.x = Math.PI / 2;
    waist.position.y = 0.62;
    group.add(waist);
  }

  if (type === 'r') {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.34, 34), glassMaterial);
    tower.position.y = cap.position.y;
    group.add(tower);
    for (let i = 0; i < 4; i += 1) {
      const crenel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.2), glassMaterial);
      const angle = (Math.PI / 2) * i;
      crenel.position.set(Math.cos(angle) * 0.22, cap.position.y + 0.15, Math.sin(angle) * 0.22);
      group.add(crenel);
    }
  }

  if (type === 'b') {
    const miter = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), glassMaterial);
    const cut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.16), glassMaterial);
    miter.position.y = cap.position.y + 0.1;
    cut.position.y = cap.position.y + 0.1;
    cut.rotation.z = Math.PI / 6;
    group.add(miter, cut);
  }

  if (type === 'q') {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, 0.24, 20), glassMaterial);
    crown.position.y = cap.position.y + 0.02;
    group.add(crown);
    for (let i = 0; i < 5; i += 1) {
      const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 18), glassMaterial);
      const angle = (Math.PI * 2 * i) / 5;
      jewel.position.set(Math.cos(angle) * 0.24, cap.position.y + 0.27, Math.sin(angle) * 0.24);
      group.add(jewel);
    }
  }

  if (type === 'k') {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.24, 0.3, 20), glassMaterial);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.08), glassMaterial);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.08), glassMaterial);
    crown.position.y = cap.position.y + 0.08;
    crossV.position.y = cap.position.y + 0.42;
    crossH.position.y = cap.position.y + 0.42;
    group.add(crown, crossV, crossH);
  }

  if (type === 'n') {
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.34, 0.22), glassMaterial);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.56, 0.16), glassMaterial);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.64, 4), glassMaterial);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 4), glassMaterial);
    chest.position.set(0, 0.58, 0.04);
    neck.position.set(0.02, 0.84, 0.05);
    neck.rotation.z = -Math.PI / 9;
    head.position.set(0.14, 1.18, 0.08);
    head.rotation.z = Math.PI / 2.3;
    head.rotation.y = Math.PI / 4;
    ear.position.set(0.2, 1.4, 0.05);
    ear.rotation.z = -Math.PI / 8;
    group.add(chest, neck, head, ear);
  }

  const markerMaterial = sideMarkerMaterials[pieceCode[0]];
  const baseMarker = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 12, 36), markerMaterial);
  baseMarker.rotation.x = Math.PI / 2;
  baseMarker.position.y = 0.19;
  group.add(baseMarker);
  if (pieceCode[0] === 'b') {
    const innerMarker = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 12, 36), markerMaterial);
    innerMarker.rotation.x = Math.PI / 2;
    innerMarker.position.y = 0.24;
    group.add(innerMarker);
  }

  group.userData.floatOffset = Math.random() * Math.PI * 2;
  group.userData.idleHeight = 0.02 + PIECE_VALUES[type] * 0.002;
  group.userData.animation = null;
  group.userData.landing = null;
  group.userData.dragging = false;
  group.userData.side = pieceCode[0];

  group.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  return group;
}

function applyThemeToPieces() {
  const theme = getActiveTheme();
  for (const mesh of pieceMeshes.values()) {
    const side = mesh.userData.side;
    const pieceTheme = theme.pieces[side];
    mesh.traverse((node) => {
      if (!node.isMesh) return;
      configurePieceMaterial(node.material, pieceTheme);
    });
  }
}

function applyTheme() {
  const theme = getActiveTheme();
  document.documentElement.dataset.theme = activeThemeKey;
  document.documentElement.style.setProperty('--accent', theme.accent);
  document.documentElement.style.setProperty('--accent-warm', theme.accentWarm);

  renderEnvironment(theme);
  squareLightMaterial.color.setHex(theme.boardLight);
  squareDarkMaterial.color.setHex(theme.boardDark);
  squareLightMaterial.map = makeSurfaceMap(theme.lightSurface, theme.boardLight, theme.detailLight);
  squareDarkMaterial.map = makeSurfaceMap(theme.darkSurface, theme.boardDark, theme.detailDark);
  applyPhysicalMaterial(squareLightMaterial, theme.lightMaterial);
  applyPhysicalMaterial(squareDarkMaterial, theme.darkMaterial);
  squareLightMaterial.needsUpdate = true;
  squareDarkMaterial.needsUpdate = true;

  boardBase.material.color.setHex(theme.boardBase);
  underGlow.material.color.setHex(theme.glow);
  keyLight.color.setHex(theme.keyLight);
  rimLight.color.setHex(theme.rimLight);
  warmLight.color.setHex(theme.warmLight);
  applyThemeToPieces();
  updateThemeControls();
}

function squareToCoords(square) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  return { x: file - half + 0.5, z: rank - half + 0.5 };
}

function squareCenterWorld(square) {
  const coords = squareToCoords(square);
  return new THREE.Vector3(coords.x, 0.42, coords.z);
}

function updatePointerFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
}

function getHitSquare(ignoredObject = null) {
  const targets = [...pieceMeshes.values(), ...squareMeshes.values()];
  const hits = raycaster.intersectObjects(targets, true).filter((hit) => {
    if (!ignoredObject) return true;
    return hit.object !== ignoredObject && hit.object.parent !== ignoredObject;
  });
  if (!hits.length) return null;
  const hit = hits[0].object;
  let square = hit.userData.square;
  if (!square && hit.parent) square = hit.parent.userData.square;
  return square ?? null;
}

function getDragPoint(event) {
  updatePointerFromEvent(event);
  const worldPoint = new THREE.Vector3();
  const hit = raycaster.ray.intersectPlane(dragPlane, worldPoint);
  if (!hit) return null;
  const localPoint = root.worldToLocal(worldPoint.clone());
  localPoint.x = THREE.MathUtils.clamp(localPoint.x, -3.9, 3.9);
  localPoint.z = THREE.MathUtils.clamp(localPoint.z, -3.9, 3.9);
  return localPoint;
}

function findKingSquare(color) {
  const board = chess.board();
  for (let rankIndex = 0; rankIndex < board.length; rankIndex += 1) {
    const rank = board[rankIndex];
    for (let fileIndex = 0; fileIndex < rank.length; fileIndex += 1) {
      const piece = rank[fileIndex];
      if (!piece || piece.color !== color || piece.type !== 'k') continue;
      return `${'abcdefgh'[fileIndex]}${8 - rankIndex}`;
    }
  }
  return null;
}

function setHoverSquare(square) {
  hoverSquare = square;
  hoverSquareLabel.textContent = square ? `Pointer: ${square}` : 'Pointer: off board';
  updateHighlights();
}

function clearHighlights() {
  for (const mesh of squareMeshes.values()) {
    mesh.material = mesh.userData.baseMaterial;
    mesh.position.y = 0;
  }
}

function updateHighlights() {
  clearHighlights();
  for (const square of lastMoveSquares) {
    const mesh = squareMeshes.get(square);
    if (mesh) {
      mesh.material = lastMoveMaterial;
      mesh.position.y = 0.03;
    }
  }
  if (selectedSquare) {
    const mesh = squareMeshes.get(selectedSquare);
    if (mesh) {
      mesh.material = selectedMaterial;
      mesh.position.y = 0.04;
    }
  }
  for (const square of legalTargets) {
    const mesh = squareMeshes.get(square);
    if (mesh) {
      mesh.material = legalMaterial;
      mesh.position.y = 0.06;
    }
  }
  if (hoverSquare) {
    const mesh = squareMeshes.get(hoverSquare);
    if (mesh && hoverSquare !== selectedSquare) {
      mesh.material = hoverMaterial;
      mesh.position.y = Math.max(mesh.position.y, 0.05);
    }
  }
  if (chess.inCheck() && !getGameConclusion()) {
    const kingSquare = findKingSquare(chess.turn());
    const mesh = kingSquare ? squareMeshes.get(kingSquare) : null;
    if (mesh) {
      mesh.material = checkMaterial;
      mesh.position.y = 0.08;
    }
  }
}

function syncCaptured() {
  capturedWhite.innerHTML = captureState.w.map((piece) => `<span>${getPieceDisplayName(piece)}</span>`).join('');
  capturedBlack.innerHTML = captureState.b.map((piece) => `<span>${getPieceDisplayName(piece)}</span>`).join('');
}

function layoutPieceMesh(mesh, pieceCode, square, immediate = false) {
  const { x, z } = squareToCoords(square);
  mesh.userData.square = square;
  mesh.userData.pieceCode = pieceCode;
  const yBase = 0.13 + PIECE_VALUES[pieceCode[1]] * 0.003;
  if (immediate) {
    mesh.position.set(x, yBase, z);
    mesh.userData.animation = null;
    mesh.userData.landing = null;
  } else {
    const from = mesh.position.clone();
    const to = new THREE.Vector3(x, yBase, z);
    const distance = from.distanceTo(to);
    mesh.userData.animation = {
      from,
      to,
      start: performance.now(),
      duration: 240 + distance * 115,
      arcHeight: 0.16 + distance * 0.08,
    };
    mesh.userData.landing = null;
  }
  mesh.userData.dragging = false;
  mesh.userData.target = { x, y: yBase, z };
}

function removePieceAtSquare(square) {
  const mesh = pieceMeshes.get(square);
  if (!mesh) return;
  piecesGroup.remove(mesh);
  pieceMeshes.delete(square);
}

function relayoutPieces(immediate = false) {
  for (const [square, mesh] of pieceMeshes.entries()) {
    layoutPieceMesh(mesh, mesh.userData.pieceCode, square, immediate);
  }
}

function rebuildPiecesFromBoard(immediate = true) {
  for (const mesh of pieceMeshes.values()) {
    piecesGroup.remove(mesh);
  }
  pieceMeshes.clear();

  const board = chess.board();
  board.forEach((rank, rankIndex) => {
    rank.forEach((piece, fileIndex) => {
      if (!piece) return;
      const square = `${'abcdefgh'[fileIndex]}${8 - rankIndex}`;
      const pieceCode = `${piece.color}${piece.type}`;
      const mesh = createPieceMesh(pieceCode);
      pieceMeshes.set(square, mesh);
      piecesGroup.add(mesh);
      layoutPieceMesh(mesh, pieceCode, square, immediate);
    });
  });
}

function updateMoveLog() {
  moveLog.innerHTML = '';
  const history = recordedHistorySan;
  for (let i = 0; i < history.length; i += 2) {
    const item = document.createElement('li');
    item.textContent = `${history[i] ?? ''} ${history[i + 1] ?? ''}`.trim();
    const rowPly = i + (history[i + 1] ? 2 : 1);
    if (reviewMode && rowPly >= reviewIndex && reviewIndex > i) {
      item.classList.add('active-row');
    }
    moveLog.appendChild(item);
  }
}

function clearBotTimer() {
  if (botTimer) {
    clearTimeout(botTimer);
    botTimer = null;
  }
}

function loadSettings() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return;
    const settings = JSON.parse(raw);
    if (settings.playerMode === 'pvp' || settings.playerMode === 'pve') playerMode = settings.playerMode;
    if (DIFFICULTY_SETTINGS[settings.botDifficulty]) botDifficulty = settings.botDifficulty;
    if (THEMES[settings.activeThemeKey]) activeThemeKey = settings.activeThemeKey;
    if (TIME_CONTROLS[settings.timeControlKey]) timeControlKey = settings.timeControlKey;
    if (typeof settings.soundEnabled === 'boolean') soundEnabled = settings.soundEnabled;
  } catch {
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
  }
}

function saveSettings() {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
      playerMode,
      botDifficulty,
      activeThemeKey,
      timeControlKey,
      soundEnabled,
    }));
  } catch {
    // Ignore storage failures in restrictive renderer contexts.
  }
}

function normalizeSaveEntry(entry) {
  if (!entry || typeof entry !== 'object' || typeof entry.pgn !== 'string' || !entry.pgn.trim()) return null;
  const settings = entry.settings ?? {};
  const clock = entry.clockState ?? {};
  return {
    pgn: entry.pgn.trim(),
    savedAt: Number.isFinite(Date.parse(entry.savedAt)) ? new Date(entry.savedAt).toISOString() : new Date().toISOString(),
    opening: typeof entry.opening === 'string' && entry.opening ? entry.opening : 'Unclassified',
    moveCount: Number.isFinite(entry.moveCount) ? entry.moveCount : 0,
    result: typeof entry.result === 'string' ? entry.result : '*',
    settings: {
      playerMode: settings.playerMode === 'pve' ? 'pve' : 'pvp',
      botDifficulty: DIFFICULTY_SETTINGS[settings.botDifficulty] ? settings.botDifficulty : 'easy',
      activeThemeKey: THEMES[settings.activeThemeKey] ? settings.activeThemeKey : 'glass-marble',
      timeControlKey: TIME_CONTROLS[settings.timeControlKey] ? settings.timeControlKey : 'rapid5',
    },
    clockState: {
      w: Number.isFinite(clock.w) ? clock.w : null,
      b: Number.isFinite(clock.b) ? clock.b : null,
      started: Boolean(clock.started),
    },
  };
}

function loadSaveSlots() {
  try {
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    saveSlots = Array.from({ length: SAVE_SLOT_COUNT }, (_, index) => normalizeSaveEntry(parsed[index]));
  } catch {
    window.localStorage.removeItem(SAVE_STORAGE_KEY);
    saveSlots = Array.from({ length: SAVE_SLOT_COUNT }, () => null);
  }
}

function saveSaveSlots() {
  try {
    window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveSlots));
  } catch {
    // Ignore storage failures in restrictive renderer contexts.
  }
}

function formatSavedAt(savedAt) {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString();
}

function setPersistenceStatus(message) {
  persistenceLabel.textContent = message;
}

function updateSaveSlotsDisplay() {
  saveSlotsElement.querySelectorAll('.save-slot').forEach((element) => {
    const index = Number(element.dataset.slot);
    const entry = saveSlots[index];
    const title = element.querySelector('.save-slot-title');
    const detail = element.querySelector('.save-slot-detail');
    const loadButton = element.querySelector('[data-load-slot]');
    if (!entry) {
      title.textContent = 'Empty';
      detail.textContent = 'No saved game.';
      loadButton.disabled = true;
      return;
    }
    title.textContent = `${entry.opening} · ${entry.moveCount} plies`;
    detail.textContent = `${formatSavedAt(entry.savedAt)} · ${entry.settings.playerMode === 'pve' ? `PvE ${entry.settings.botDifficulty}` : 'PvP'} · ${TIME_CONTROLS[entry.settings.timeControlKey].label}`;
    loadButton.disabled = false;
  });
}

function syncCommentsFromGame(game = chess) {
  positionComments.clear();
  (game.getComments?.() ?? []).forEach(({ fen, comment }) => {
    if (fen && comment) positionComments.set(fen, comment);
  });
}

function getCommentTargetFen() {
  if (reviewMode) return reviewIndex > 0 ? chess.fen() : null;
  return recordedHistoryVerbose.length > 0 ? chess.fen() : null;
}

function updateCommentEditor() {
  const targetFen = getCommentTargetFen();
  const note = targetFen ? (positionComments.get(targetFen) ?? '') : '';
  commentLabel.textContent = targetFen
    ? (reviewMode ? `Note for reviewed move ${reviewIndex}` : `Note for live move ${recordedHistoryVerbose.length}`)
    : 'Move notes attach to a played position.';
  commentTextarea.value = note;
  commentTextarea.disabled = !targetFen;
  saveCommentButton.disabled = !targetFen;
  clearCommentButton.disabled = !targetFen || !note;
}

function formatPgnDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function getPgnResult() {
  if (forcedConclusion?.expiredColor === 'w') return '0-1';
  if (forcedConclusion?.expiredColor === 'b') return '1-0';
  if (chess.isCheckmate()) return chess.turn() === 'w' ? '0-1' : '1-0';
  if (chess.isDraw()) return '1/2-1/2';
  return '*';
}

function getExportHeaders() {
  const baseHeaders = {
    Event: 'Glass Marble Chess',
    Site: 'Electron Desktop',
    Date: formatPgnDate(),
    Round: '-',
    White: 'White',
    Black: playerMode === 'pve' ? `Bot (${botDifficulty})` : 'Black',
    Result: getPgnResult(),
    ...importedHeaders,
  };
  baseHeaders.Date = formatPgnDate();
  baseHeaders.Result = getPgnResult();
  if (gameStartFen !== 'start') {
    baseHeaders.SetUp = '1';
    baseHeaders.FEN = gameStartFen;
  } else {
    delete baseHeaders.SetUp;
    delete baseHeaders.FEN;
  }
  return baseHeaders;
}

function buildPgnExport() {
  const exportGame = gameStartFen === 'start' ? new Chess() : new Chess(gameStartFen);
  Object.entries(getExportHeaders()).forEach(([key, value]) => {
    if (value != null && value !== '') exportGame.setHeader(key, value);
  });
  recordedHistoryVerbose.forEach((move) => {
    exportGame.move({ from: move.from, to: move.to, promotion: move.promotion });
    const comment = positionComments.get(exportGame.fen());
    if (comment) exportGame.setComment(comment);
  });
  return exportGame.pgn({ maxWidth: 88 });
}

async function exportPgnToFile(filePath = null) {
  if (!desktopBridge?.exportPgn) {
    setPersistenceStatus('File export is only available in the desktop app.');
    return false;
  }
  const pgn = buildPgnExport();
  pgnTextarea.value = pgn;
  try {
    const result = await desktopBridge.exportPgn({
      pgn,
      filePath,
      defaultPath: 'glass-marble-chess.pgn',
    });
    if (result?.canceled) {
      setPersistenceStatus('PGN file export canceled.');
      return false;
    }
    setPersistenceStatus(`PGN saved to ${result.filePath}.`);
    return true;
  } catch (error) {
    setPersistenceStatus(`PGN save failed: ${error.message}`);
    return false;
  }
}

function importPgnText(rawPgn, options = {}) {
  const { restoreState = null, statusMessage = 'PGN imported.' } = options;
  const pgn = rawPgn.trim();
  if (!pgn) {
    setPersistenceStatus('Paste PGN before importing.');
    return false;
  }

  const parsedGame = new Chess();
  try {
    parsedGame.loadPgn(pgn);
  } catch (error) {
    setPersistenceStatus(`Import failed: ${error.message}`);
    return false;
  }

  clearBotTimer();
  botThinking = false;
  forcedConclusion = null;
  reviewMode = false;
  reviewIndex = 0;
  boardFlipped = false;
  updateBoardOrientation();
  resetRedoStack();
  transpositionTable.clear();
  importedHeaders = parsedGame.getHeaders?.() ?? {};
  syncCommentsFromGame(parsedGame);
  gameStartFen = importedHeaders.FEN ?? 'start';

  if (restoreState?.settings) {
    playerMode = restoreState.settings.playerMode === 'pve' ? 'pve' : 'pvp';
    botDifficulty = DIFFICULTY_SETTINGS[restoreState.settings.botDifficulty] ? restoreState.settings.botDifficulty : botDifficulty;
    activeThemeKey = THEMES[restoreState.settings.activeThemeKey] ? restoreState.settings.activeThemeKey : activeThemeKey;
    timeControlKey = TIME_CONTROLS[restoreState.settings.timeControlKey] ? restoreState.settings.timeControlKey : timeControlKey;
    applyTheme();
    saveSettings();
  }

  if (gameStartFen === 'start') chess.reset();
  else chess.load(gameStartFen);
  parsedGame.history({ verbose: true }).forEach((move) => {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion });
  });

  if (restoreState?.clockState && getTimeControl().ms != null) {
    clockState.w = restoreState.clockState.w;
    clockState.b = restoreState.clockState.b;
    clockState.started = restoreState.clockState.started && chess.history().length > 0 && !chess.isGameOver();
    clockState.lastTickAt = performance.now();
  } else {
    resetClocks();
    clockState.started = false;
  }

  syncBoardState(true, statusMessage);
  pgnTextarea.value = buildPgnExport();
  relayoutPieces(true);
  resize();
  scheduleBotTurn();
  setPersistenceStatus(statusMessage);
  return true;
}

async function importPgnFromFile(filePath = null) {
  if (!desktopBridge?.importPgn) {
    setPersistenceStatus('File import is only available in the desktop app.');
    return false;
  }
  try {
    const result = await desktopBridge.importPgn({ filePath });
    if (result?.canceled) {
      setPersistenceStatus('PGN file import canceled.');
      return false;
    }
    pgnTextarea.value = result.pgn;
    return importPgnText(result.pgn, { statusMessage: `Imported ${result.filePath}.` });
  } catch (error) {
    setPersistenceStatus(`PGN open failed: ${error.message}`);
    return false;
  }
}

function saveCurrentGameToSlot(slotIndex) {
  const pgn = buildPgnExport();
  pgnTextarea.value = pgn;
  saveSlots[slotIndex] = {
    pgn,
    savedAt: new Date().toISOString(),
    opening: getOpeningName(),
    moveCount: recordedHistoryVerbose.length,
    result: getPgnResult(),
    settings: {
      playerMode,
      botDifficulty,
      activeThemeKey,
      timeControlKey,
    },
    clockState: {
      w: clockState.w,
      b: clockState.b,
      started: clockState.started,
    },
  };
  saveSaveSlots();
  updateSaveSlotsDisplay();
  setPersistenceStatus(`Saved current match to slot ${slotIndex + 1}.`);
}

function loadGameFromSlot(slotIndex) {
  const entry = saveSlots[slotIndex];
  if (!entry) {
    setPersistenceStatus(`Slot ${slotIndex + 1} is empty.`);
    return false;
  }
  return importPgnText(entry.pgn, {
    restoreState: entry,
    statusMessage: `Loaded slot ${slotIndex + 1}.`,
  });
}

function saveComment() {
  const targetFen = getCommentTargetFen();
  if (!targetFen) {
    setPersistenceStatus('Play or review a move before saving a note.');
    return false;
  }
  const note = commentTextarea.value.trim();
  if (!note) {
    positionComments.delete(targetFen);
    updateCommentEditor();
    setPersistenceStatus('Move note cleared.');
    return true;
  }
  positionComments.set(targetFen, note);
  updateCommentEditor();
  setPersistenceStatus('Move note saved.');
  return true;
}

function resetRedoStack() {
  redoStack.length = 0;
}

function syncRecordedHistoryFromGame() {
  recordedHistoryVerbose = chess.history({ verbose: true });
  recordedHistorySan = chess.history();
}

function getOpeningName(history = recordedHistorySan) {
  let best = 'Unclassified';
  Object.entries(OPENING_NAMES).forEach(([sequence, label]) => {
    const openingMoves = sequence.split(' ');
    if (openingMoves.length > history.length) return;
    const matches = openingMoves.every((move, index) => history[index] === move);
    if (matches) best = label;
  });
  return best;
}

function getMaterialDeltaFromBoard(board) {
  let white = 0;
  let black = 0;
  board.forEach((rank) => {
    rank.forEach((piece) => {
      if (!piece || piece.type === 'k') return;
      if (piece.color === 'w') white += PIECE_VALUES[piece.type];
      else black += PIECE_VALUES[piece.type];
    });
  });
  return white - black;
}

function updateAnalysisPanel() {
  const opening = getOpeningName();
  const reviewSuffix = reviewMode ? ` · Reviewing ${reviewIndex}/${recordedHistoryVerbose.length}` : '';
  const materialDelta = getMaterialDeltaFromBoard(chess.board());
  const materialText = materialDelta === 0
    ? 'Material even'
    : materialDelta > 0
      ? `White +${materialDelta.toFixed(2).replace(/\.00$/, '')}`
      : `Black +${Math.abs(materialDelta).toFixed(2).replace(/\.00$/, '')}`;
  openingLabel.textContent = opening;
  if (!recordedHistoryVerbose.length) {
    analysisLabel.textContent = 'Review tools unlock once the game has moves.';
  } else {
    analysisLabel.textContent = `${materialText} · ${recordedHistoryVerbose.length} plies${reviewSuffix}`;
  }
  boardOpeningLabel.textContent = opening;
}

function updateSoundToggle() {
  soundToggleButton.textContent = soundEnabled ? 'Sound On' : 'Sound Off';
  soundToggleButton.classList.toggle('active-sound', soundEnabled);
}

function ensureAudioContext() {
  if (!soundEnabled) return null;
  if (!audioContext) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    audioContext = new AudioCtor();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

function playSoundCue(type) {
  lastSoundCue = type;
  if (!soundEnabled) return;
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const patterns = {
    move: [{ freq: 440, dur: 0.05, gain: 0.028 }, { freq: 554, dur: 0.04, gain: 0.018, offset: 0.05 }],
    capture: [{ freq: 320, dur: 0.05, gain: 0.035 }, { freq: 220, dur: 0.08, gain: 0.024, offset: 0.05 }],
    castle: [{ freq: 392, dur: 0.05, gain: 0.024 }, { freq: 523, dur: 0.06, gain: 0.024, offset: 0.06 }],
    check: [{ freq: 660, dur: 0.06, gain: 0.03 }, { freq: 740, dur: 0.05, gain: 0.022, offset: 0.06 }],
    gameover: [{ freq: 392, dur: 0.08, gain: 0.032 }, { freq: 330, dur: 0.1, gain: 0.03, offset: 0.09 }, { freq: 262, dur: 0.16, gain: 0.034, offset: 0.2 }],
    timeout: [{ freq: 220, dur: 0.1, gain: 0.03 }, { freq: 196, dur: 0.14, gain: 0.03, offset: 0.12 }],
  };
  const notes = patterns[type] ?? patterns.move;
  const now = ctx.currentTime;
  notes.forEach(({ freq, dur, gain, offset = 0 }) => {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type === 'capture' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now + offset);
    amp.gain.setValueAtTime(0.0001, now + offset);
    amp.gain.exponentialRampToValueAtTime(gain, now + offset + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + offset + dur);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + dur + 0.02);
  });
}

function updateOverlayMeta(conclusion) {
  if (!conclusion || reviewMode) {
    overlayMeta.innerHTML = '';
    return;
  }
  overlayMeta.innerHTML = [
    `<span>${getModeLabel()}</span>`,
    `<span>${getTimeControl().label}</span>`,
    `<span>${getOpeningName()}</span>`,
    `<span>${recordedHistoryVerbose.length} plies</span>`,
  ].join('');
}

function applyCapturedStateFromHistory(history) {
  captureState.w = [];
  captureState.b = [];
  history.forEach((move) => {
    if (!move.captured) return;
    const capturedCode = `${move.color === 'w' ? 'b' : 'w'}${move.captured}`;
    captureState[move.color].push(capturedCode);
  });
}

function hidePromotionOverlay() {
  pendingPromotion = null;
  promotionOverlay.hidden = true;
}

function showPromotionOverlay(from, to, color) {
  pendingPromotion = { from, to, color };
  promotionHeadline.textContent = `${color === 'w' ? 'White' : 'Black'} pawn on ${to} promotes to:`;
  promotionOverlay.hidden = false;
}

function syncBoardState(immediate = true, extraMessage = '') {
  const verboseHistory = chess.history({ verbose: true });
  lastMoveSquares = verboseHistory.length ? [verboseHistory.at(-1).from, verboseHistory.at(-1).to] : [];
  if (!reviewMode) syncRecordedHistoryFromGame();
  applyCapturedStateFromHistory(verboseHistory);
  selectedSquare = null;
  hoverSquare = null;
  selectionLabel.textContent = 'None';
  hoverSquareLabel.textContent = 'Pointer: off board';
  legalTargets.clear();
  legalMovesByTarget.clear();
  hidePromotionOverlay();
  rebuildPiecesFromBoard(immediate);
  updateMoveLog();
  syncCaptured();
  updateHighlights();
  updateAnalysisPanel();
  updateCommentEditor();
  updateStatus(extraMessage);
}

function buildReplayGame(plyIndex) {
  const replay = gameStartFen === 'start' ? new Chess() : new Chess(gameStartFen);
  recordedHistoryVerbose.slice(0, plyIndex).forEach((move) => {
    replay.move({ from: move.from, to: move.to, promotion: move.promotion });
  });
  return replay;
}

function syncReviewPosition(extraMessage = '') {
  const replay = buildReplayGame(reviewIndex);
  chess.load(replay.fen());
  lastMoveSquares = reviewIndex > 0
    ? [recordedHistoryVerbose[reviewIndex - 1].from, recordedHistoryVerbose[reviewIndex - 1].to]
    : [];
  applyCapturedStateFromHistory(recordedHistoryVerbose.slice(0, reviewIndex));
  selectedSquare = null;
  hoverSquare = null;
  selectionLabel.textContent = 'None';
  hoverSquareLabel.textContent = 'Pointer: off board';
  legalTargets.clear();
  legalMovesByTarget.clear();
  hidePromotionOverlay();
  rebuildPiecesFromBoard(true);
  updateMoveLog();
  syncCaptured();
  updateHighlights();
  updateAnalysisPanel();
  updateCommentEditor();
  updateStatus(extraMessage);
}

function enterReviewMode(targetIndex = recordedHistoryVerbose.length) {
  if (!recordedHistoryVerbose.length) return;
  reviewMode = true;
  reviewIndex = THREE.MathUtils.clamp(targetIndex, 0, recordedHistoryVerbose.length);
  syncReviewPosition(`Reviewing move ${reviewIndex}/${recordedHistoryVerbose.length}`);
}

function exitReviewMode() {
  if (!reviewMode) return;
  reviewMode = false;
  reviewIndex = recordedHistoryVerbose.length;
  const liveGame = buildReplayGame(recordedHistoryVerbose.length);
  chess.load(liveGame.fen());
  syncBoardState(true);
}

function getModeLabel() {
  return playerMode === 'pve' ? `PvE · ${botDifficulty}` : 'PvP';
}

function getSideRoleName(color) {
  if (playerMode !== 'pve') return color === 'w' ? 'White' : 'Black';
  return color === 'w' ? 'You' : 'Engine';
}

function getPieceDisplayName(pieceCode) {
  const sideName = getSideRoleName(pieceCode[0]);
  const pieceName = PIECE_LABELS[pieceCode].split(' ').slice(1).join(' ');
  return `${sideName} ${pieceName}`;
}

function getBoardSideSummary(color, positionLabel) {
  if (playerMode === 'pve') {
    return `${getSideRoleName(color)} · ${positionLabel}`;
  }
  return `${color === 'w' ? 'White' : 'Black'} · ${positionLabel}`;
}

function getPreferredBoardFlip() {
  if (playerMode === 'pve') return false;
  return boardFlipped;
}

function syncPreferredBoardOrientation() {
  boardFlipped = getPreferredBoardFlip();
  updateBoardOrientation();
}

function getTimeControl() {
  return TIME_CONTROLS[timeControlKey];
}

function formatClock(ms) {
  if (ms == null) return '--:--';
  const clamped = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function resetClocks() {
  const initial = getTimeControl().ms;
  clockState.w = initial;
  clockState.b = initial;
  clockState.started = false;
  clockState.lastTickAt = performance.now();
}

function updateClockLabels() {
  whiteClockLabel.textContent = formatClock(clockState.w);
  blackClockLabel.textContent = formatClock(clockState.b);
  whiteClockLabel.classList.toggle('clock-active', clockState.started && !forcedConclusion && !chess.isGameOver() && chess.turn() === 'w' && getTimeControl().ms != null);
  blackClockLabel.classList.toggle('clock-active', clockState.started && !forcedConclusion && !chess.isGameOver() && chess.turn() === 'b' && getTimeControl().ms != null);
  whiteClockLabel.classList.toggle('clock-expired', forcedConclusion?.expiredColor === 'w');
  blackClockLabel.classList.toggle('clock-expired', forcedConclusion?.expiredColor === 'b');
}

function isMatchOver() {
  return chess.isGameOver() || Boolean(forcedConclusion);
}

function expireOnTime(color) {
  if (forcedConclusion) return;
  clearBotTimer();
  botThinking = false;
  const winner = color === 'w' ? 'Black' : 'White';
  forcedConclusion = {
    headline: `${winner} wins`,
    detail: `${color === 'w' ? 'White' : 'Black'} flags on time.`,
    expiredColor: color,
  };
  clearSelection();
  playSoundCue('timeout');
  updateClockLabels();
  updateStatus();
}

function tickClocks(now = performance.now()) {
  const activeTime = getTimeControl().ms;
  if (activeTime == null) {
    clockState.lastTickAt = now;
    updateClockLabels();
    return;
  }
  if (!clockState.started) {
    clockState.lastTickAt = now;
    updateClockLabels();
    return;
  }
  const lastTickAt = clockState.lastTickAt ?? now;
  clockState.lastTickAt = now;
  if (isMatchOver()) {
    updateClockLabels();
    return;
  }
  const elapsed = now - lastTickAt;
  const color = chess.turn();
  clockState[color] = Math.max(0, clockState[color] - elapsed);
  if (clockState[color] === 0) {
    expireOnTime(color);
    return;
  }
  updateClockLabels();
}

function getGameConclusion() {
  if (forcedConclusion) return forcedConclusion;
  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'Black' : 'White';
    return { headline: `${winner} wins`, detail: 'Checkmate ends the game.' };
  }
  if (chess.isStalemate()) {
    return { headline: 'Draw', detail: 'Stalemate leaves no legal move.' };
  }
  if (chess.isThreefoldRepetition()) {
    return { headline: 'Draw', detail: 'Threefold repetition ends the game.' };
  }
  if (chess.isInsufficientMaterial()) {
    return { headline: 'Draw', detail: 'Insufficient material ends the game.' };
  }
  if (chess.isDraw()) {
    return { headline: 'Draw', detail: 'The game is drawn.' };
  }
  return null;
}

function setOverlay(conclusion) {
  if (!conclusion || reviewMode) {
    gameOverlay.hidden = true;
    updateOverlayMeta(null);
    return;
  }
  overlayHeadline.textContent = conclusion.headline;
  overlayDetail.textContent = conclusion.detail;
  updateOverlayMeta(conclusion);
  gameOverlay.hidden = false;
}

function updateModeControls() {
  modeControls.querySelectorAll('[data-mode]').forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === playerMode);
  });
  difficultyControls.classList.toggle('disabled', playerMode !== 'pve');
  difficultyControls.querySelectorAll('[data-difficulty]').forEach((button) => {
    button.classList.toggle('active', button.dataset.difficulty === botDifficulty);
    button.disabled = playerMode !== 'pve';
  });
}

function updateThemeControls() {
  themeControls.querySelectorAll('[data-theme]').forEach((button) => {
    button.classList.toggle('active', button.dataset.theme === activeThemeKey);
  });
}

function updateTimeControls() {
  timeControls.querySelectorAll('[data-time]').forEach((button) => {
    button.classList.toggle('active', button.dataset.time === timeControlKey);
  });
}

function updateReviewControls() {
  const hasMoves = recordedHistoryVerbose.length > 0;
  reviewStartButton.disabled = !hasMoves || reviewIndex <= 0;
  reviewPrevButton.disabled = !hasMoves || reviewIndex <= 0;
  reviewNextButton.disabled = !hasMoves || !reviewMode || reviewIndex >= recordedHistoryVerbose.length;
  reviewEndButton.disabled = !hasMoves || !reviewMode || reviewIndex >= recordedHistoryVerbose.length;
  reviewExitButton.disabled = !reviewMode;
}

function emitMoveSound(move) {
  if (move.san.includes('#')) {
    playSoundCue('gameover');
    return;
  }
  if (move.san.includes('+')) {
    playSoundCue('check');
    return;
  }
  if (move.flags.includes('k') || move.flags.includes('q')) {
    playSoundCue('castle');
    return;
  }
  if (move.captured || move.flags.includes('e')) {
    playSoundCue('capture');
    return;
  }
  playSoundCue('move');
}

function getUndoBatchSize() {
  const historyLength = chess.history().length;
  if (!historyLength) return 0;
  if (playerMode !== 'pve') return 1;
  return chess.turn() === 'w' ? Math.min(2, historyLength) : 1;
}

function updateActionButtons() {
  undoButton.disabled = reviewMode || getUndoBatchSize() === 0 || !promotionOverlay.hidden;
  redoButton.disabled = reviewMode || redoStack.length === 0 || botThinking || !promotionOverlay.hidden;
  document.querySelector('#flipButton').disabled = playerMode === 'pve';
  updateReviewControls();
}

function updateTurnVisuals(turn) {
  turnHero.dataset.turn = turn;
  whiteTurnPill.textContent = getSideRoleName('w');
  blackTurnPill.textContent = getSideRoleName('b');
  whiteTurnPill.classList.toggle('active', turn === 'w');
  blackTurnPill.classList.toggle('active', turn === 'b');
  bottomSideLabel.textContent = getBoardSideSummary(boardFlipped ? 'b' : 'w', 'Near Side');
  topSideLabel.textContent = getBoardSideSummary(boardFlipped ? 'w' : 'b', 'Far Side');
}

function getMoveText(move) {
  const actor = getSideRoleName(move.color);
  if (move.flags.includes('k')) return `${actor} castled kingside`;
  if (move.flags.includes('q')) return `${actor} castled queenside`;
  if (move.flags.includes('e')) return `${actor} en passant on ${move.to}`;
  if (move.flags.includes('p')) return `${actor} promoted to ${PROMOTION_LABELS[move.promotion]} on ${move.to}`;
  return `${actor} played ${move.san}`;
}

function updateStatus(extraMessage = '') {
  const turn = chess.turn();
  const turnName = getSideRoleName(turn);
  turnLabel.textContent = turnName;
  updateTurnVisuals(turn);
  updateModeControls();
  updateTimeControls();
  updateActionButtons();
  updateClockLabels();

  let statusMessage = `${turnName} to move`;
  let promptMessage = `${turnName} controls the next move.`;
  const conclusion = getGameConclusion();

  if (reviewMode) {
    statusMessage = `Review ${reviewIndex}/${recordedHistoryVerbose.length}`;
    promptMessage = 'Replay controls scrub through the finished game.';
  } else if (conclusion) {
    statusMessage = conclusion.headline;
    promptMessage = conclusion.headline;
  } else if (pendingPromotion) {
    statusMessage = 'Choose promotion';
    promptMessage = `${turnName} must finish the pawn promotion.`;
  } else if (botThinking) {
    statusMessage = 'Engine thinking';
    promptMessage = `${turnName} engine is searching ${botDifficulty} lines.`;
  } else if (playerMode === 'pve' && turn === BOT_COLOR) {
    statusMessage = 'Engine to move';
    promptMessage = `PvE · ${botDifficulty} engine on move.`;
  } else if (chess.inCheck()) {
    statusMessage = `${turnName} in check`;
    promptMessage = `${turnName} must answer the check.`;
  } else if (playerMode === 'pve') {
    promptMessage = `You play from the near side.`;
  }
  if (!conclusion && getTimeControl().ms != null && !clockState.started) {
    promptMessage = 'Clock starts on the first move.';
  }

  if (extraMessage) {
    if (extraMessage.includes('Checkmate')) statusMessage = 'Checkmate';
    else if (extraMessage.includes('castled')) statusMessage = 'Castled';
    else if (extraMessage.includes('en passant')) statusMessage = 'En passant';
    else if (extraMessage.includes('promoted')) statusMessage = 'Promotion';
    else if (extraMessage.includes('undone')) statusMessage = 'Move undone';
    else if (extraMessage.includes('restored')) statusMessage = 'Move restored';
  }

  statusLabel.textContent = statusMessage;
  boardModeLabel.textContent = getModeLabel();
  boardStatusLabel.textContent = statusMessage;
  turnHeadline.textContent = conclusion ? conclusion.headline : `${turnName} to move`;
  turnPrompt.textContent = promptMessage;
  instructionLabel.textContent = botThinking
    ? 'Engine is resolving the move.'
    : reviewMode
      ? 'Open Game Menu to scrub through the replay.'
    : pendingPromotion
      ? 'Choose the promotion piece to finish the move.'
    : playerMode === 'pve'
      ? 'You are the near-side army. Click or drag to a glowing square.'
      : 'Click or drag a piece to a glowing square.';
  hintLabel.textContent = conclusion
    ? conclusion.detail
    : playerMode === 'pve'
      ? `${getModeLabel()} · ${getTimeControl().label} · Menu holds themes, saves, PGN, and notes.`
      : `${getTimeControl().label} · Menu holds setup, review, saves, PGN, and notes.`;

  setOverlay(conclusion);
}

function selectSquare(square) {
  const piece = chess.get(square);
  if (!piece || piece.color !== chess.turn()) return;
  if (playerMode === 'pve' && chess.turn() === BOT_COLOR) return;
  if (isMatchOver() || reviewMode) return;
  hidePromotionOverlay();
  selectedSquare = square;
  selectionLabel.textContent = `${getPieceDisplayName(`${piece.color}${piece.type}`)} on ${square}`;
  legalTargets.clear();
  legalMovesByTarget.clear();
  chess.moves({ square, verbose: true }).forEach((move) => {
    legalTargets.add(move.to);
    const moves = legalMovesByTarget.get(move.to) ?? [];
    moves.push(move);
    legalMovesByTarget.set(move.to, moves);
  });
  updateHighlights();
  updateActionButtons();
}

function clearSelection() {
  selectedSquare = null;
  selectionLabel.textContent = 'None';
  legalTargets.clear();
  legalMovesByTarget.clear();
  hidePromotionOverlay();
  updateHighlights();
  updateActionButtons();
}

function undoMoveBatch() {
  const batchSize = getUndoBatchSize();
  if (!batchSize) return false;
  clearBotTimer();
  botThinking = false;
  forcedConclusion = null;
  hidePromotionOverlay();
  const batch = [];
  for (let i = 0; i < batchSize; i += 1) {
    const move = chess.undo();
    if (!move) break;
    batch.unshift(move);
  }
  if (!batch.length) {
    updateStatus();
    return false;
  }
  redoStack.push(batch);
  clockState.started = chess.history().length > 0;
  clockState.lastTickAt = performance.now();
  syncBoardState(true, 'Move undone');
  return true;
}

function redoMoveBatch() {
  const batch = redoStack.pop();
  if (!batch?.length) return false;
  clearBotTimer();
  botThinking = false;
  forcedConclusion = null;
  hidePromotionOverlay();
  batch.forEach((move) => {
    applyMove(move.from, move.to, move.promotion ?? 'q', { clearRedo: false, scheduleBot: false });
  });
  clockState.started = chess.history().length > 0;
  clockState.lastTickAt = performance.now();
  updateStatus('Move restored');
  scheduleBotTurn();
  return true;
}

function scoreMoveHeuristic(move) {
  let score = 0;
  if (move.captured) score += 12 * PIECE_VALUES[move.captured] - PIECE_VALUES[move.piece];
  if (move.promotion) score += 14;
  if (move.flags.includes('k') || move.flags.includes('q')) score += 4;
  if (move.san.includes('+')) score += 3;
  if (move.san.includes('#')) score += 200;
  return score;
}

function getPieceSquareBonus(piece, rankIndex, fileIndex) {
  const table = PIECE_SQUARE_TABLES[piece.type];
  if (!table) return 0;
  const lookupRank = piece.color === 'w' ? rankIndex : 7 - rankIndex;
  return table[lookupRank][fileIndex];
}

function isPassedPawn(board, rankIndex, fileIndex, color) {
  const direction = color === 'w' ? -1 : 1;
  for (let nextRank = rankIndex + direction; nextRank >= 0 && nextRank < 8; nextRank += direction) {
    for (let nextFile = Math.max(0, fileIndex - 1); nextFile <= Math.min(7, fileIndex + 1); nextFile += 1) {
      const piece = board[nextRank][nextFile];
      if (piece && piece.type === 'p' && piece.color !== color) return false;
    }
  }
  return true;
}

function getOpeningBookMove() {
  const history = chess.history();
  const key = history.join(' ');
  const options = OPENING_BOOK[key];
  if (!options?.length || chess.turn() !== BOT_COLOR) return null;

  const legalMoves = chess.moves({ verbose: true });
  const candidates = options
    .map((san) => legalMoves.find((move) => move.san === san))
    .filter(Boolean);
  if (!candidates.length) return null;

  if (botDifficulty === 'hard') return candidates[0];
  const pool = botDifficulty === 'medium' ? candidates.slice(0, Math.min(2, candidates.length)) : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}

function evaluateBoard(game, perspective) {
  if (game.isCheckmate()) return game.turn() === perspective ? -100000 : 100000;
  if (game.isDraw()) return 0;

  let score = 0;
  const board = game.board();
  const bishopCount = { w: 0, b: 0 };
  const pawnFiles = { w: Array(8).fill(0), b: Array(8).fill(0) };
  const kingSquares = { w: null, b: null };
  let queenCount = 0;
  let nonPawnMaterial = 0;
  board.forEach((rank, rankIndex) => {
    rank.forEach((piece, fileIndex) => {
      if (!piece) return;
      const sign = piece.color === perspective ? 1 : -1;
      const center = 3.5 - (Math.abs(fileIndex - 3.5) + Math.abs(rankIndex - 3.5)) / 2;
      const advancement = piece.type === 'p'
        ? (piece.color === 'w' ? 7 - rankIndex : rankIndex) * 0.08
        : 0;
      const pieceSquare = getPieceSquareBonus(piece, rankIndex, fileIndex);
      score += sign * (PIECE_VALUES[piece.type] * 100 + center * 6 + advancement * 10 + pieceSquare);
      if (piece.type === 'b') bishopCount[piece.color] += 1;
      if (piece.type === 'k') kingSquares[piece.color] = { rankIndex, fileIndex };
      if (piece.type === 'q') queenCount += 1;
      if (piece.type !== 'p' && piece.type !== 'k') nonPawnMaterial += PIECE_VALUES[piece.type];
      if (piece.type === 'p') {
        pawnFiles[piece.color][fileIndex] += 1;
        if (isPassedPawn(board, rankIndex, fileIndex, piece.color)) {
          const passedBonus = piece.color === 'w' ? (7 - rankIndex) * 10 : rankIndex * 10;
          score += sign * (14 + passedBonus);
        }
      }
    });
  });

  if (bishopCount.w >= 2) score += perspective === 'w' ? 36 : -36;
  if (bishopCount.b >= 2) score += perspective === 'b' ? 36 : -36;

  for (let fileIndex = 0; fileIndex < 8; fileIndex += 1) {
    if (pawnFiles.w[fileIndex] > 1) score += perspective === 'w' ? -14 * (pawnFiles.w[fileIndex] - 1) : 14 * (pawnFiles.w[fileIndex] - 1);
    if (pawnFiles.b[fileIndex] > 1) score += perspective === 'b' ? -14 * (pawnFiles.b[fileIndex] - 1) : 14 * (pawnFiles.b[fileIndex] - 1);
  }

  if (queenCount === 0 || nonPawnMaterial <= 12) {
    const whiteKing = kingSquares.w;
    const blackKing = kingSquares.b;
    if (whiteKing && blackKing) {
      const kingDistance = Math.abs(whiteKing.fileIndex - blackKing.fileIndex) + Math.abs(whiteKing.rankIndex - blackKing.rankIndex);
      const whiteKingCenter = 3.5 - (Math.abs(whiteKing.fileIndex - 3.5) + Math.abs(whiteKing.rankIndex - 3.5)) / 2;
      const blackKingCenter = 3.5 - (Math.abs(blackKing.fileIndex - 3.5) + Math.abs(blackKing.rankIndex - 3.5)) / 2;
      score += perspective === 'w'
        ? whiteKingCenter * 18 - blackKingCenter * 18 - kingDistance * 4
        : blackKingCenter * 18 - whiteKingCenter * 18 - kingDistance * 4;
    }
  }

  const mobility = game.moves().length;
  score += (game.turn() === perspective ? 1 : -1) * mobility * 0.8;
  if (game.inCheck()) score += game.turn() === perspective ? -26 : 26;
  return score;
}

function isEndgamePosition(game) {
  const board = game.board();
  let queens = 0;
  let nonPawnMaterial = 0;
  board.forEach((rank) => {
    rank.forEach((piece) => {
      if (!piece || piece.type === 'k') return;
      if (piece.type === 'q') queens += 1;
      if (piece.type !== 'p') nonPawnMaterial += PIECE_VALUES[piece.type];
    });
  });
  return queens === 0 || nonPawnMaterial <= 12;
}

function getMoveCacheKey(move) {
  return `${move.from}${move.to}${move.promotion ?? ''}`;
}

function searchBestScore(game, depth, alpha, beta, perspective, stats) {
  if (depth === 0 || game.isGameOver()) return evaluateBoard(game, perspective);
  stats.nodeCount += 1;

  const alphaOrig = alpha;
  const betaOrig = beta;
  const tableKey = `${game.fen()}|${depth}|${perspective}`;
  const cached = transpositionTable.get(tableKey);
  if (cached) {
    if (cached.bound === 'exact') return cached.score;
    if (cached.bound === 'lower') alpha = Math.max(alpha, cached.score);
    if (cached.bound === 'upper') beta = Math.min(beta, cached.score);
    if (alpha >= beta) return cached.score;
  }

  const moves = game.moves({ verbose: true }).sort((a, b) => scoreMoveHeuristic(b) - scoreMoveHeuristic(a));
  if (cached?.bestMove) {
    moves.sort((a, b) => Number(getMoveCacheKey(b) === cached.bestMove) - Number(getMoveCacheKey(a) === cached.bestMove));
  }
  const maximizing = game.turn() === perspective;
  let bestMoveKey = moves[0] ? getMoveCacheKey(moves[0]) : null;

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      game.move(move);
      const candidate = searchBestScore(game, depth - 1, alpha, beta, perspective, stats);
      game.undo();
      if (candidate > best) {
        best = candidate;
        bestMoveKey = getMoveCacheKey(move);
      }
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    const bound = best <= alphaOrig ? 'upper' : best >= betaOrig ? 'lower' : 'exact';
    transpositionTable.set(tableKey, { score: best, bound, bestMove: bestMoveKey });
    return best;
  }

  let best = Infinity;
  for (const move of moves) {
    game.move(move);
    const candidate = searchBestScore(game, depth - 1, alpha, beta, perspective, stats);
    game.undo();
    if (candidate < best) {
      best = candidate;
      bestMoveKey = getMoveCacheKey(move);
    }
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  const bound = best <= alphaOrig ? 'upper' : best >= betaOrig ? 'lower' : 'exact';
  transpositionTable.set(tableKey, { score: best, bound, bestMove: bestMoveKey });
  return best;
}

function chooseBotMove() {
  const bookMove = getOpeningBookMove();
  if (bookMove) {
    lastEngineStats = { transpositionEntries: 0, depth: 0, endgame: false, nodeCount: 0, usedBook: true };
    return bookMove;
  }

  const settings = DIFFICULTY_SETTINGS[botDifficulty];
  const sandbox = new Chess(chess.fen());
  const endgame = isEndgamePosition(sandbox);
  const depth = settings.depth + (endgame ? settings.endgameBonus : 0);
  const stats = { nodeCount: 0 };
  transpositionTable.clear();
  const moves = sandbox.moves({ verbose: true }).sort((a, b) => scoreMoveHeuristic(b) - scoreMoveHeuristic(a));
  if (!moves.length) return null;

  const scoredMoves = moves.map((move) => {
    sandbox.move(move);
    const score = searchBestScore(sandbox, depth - 1, -Infinity, Infinity, BOT_COLOR, stats);
    sandbox.undo();
    const noise = settings.randomness ? Math.random() * settings.randomness : 0;
    return { move, score: score + noise };
  }).sort((a, b) => b.score - a.score);

  lastEngineStats = {
    transpositionEntries: transpositionTable.size,
    depth,
    endgame,
    nodeCount: stats.nodeCount,
    usedBook: false,
  };

  if (settings.randomness > 0) {
    const pool = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
    return pool[Math.floor(Math.random() * pool.length)].move;
  }

  return scoredMoves[0].move;
}

function scheduleBotTurn() {
  clearBotTimer();
  if (playerMode !== 'pve' || isMatchOver() || chess.turn() !== BOT_COLOR || pendingPromotion) return;
  botThinking = true;
  updateStatus();
  botTimer = setTimeout(() => {
    botTimer = null;
    const move = chooseBotMove();
    botThinking = false;
    if (!move) {
      updateStatus();
      return;
    }
    applyMove(move.from, move.to, move.promotion ?? 'q');
  }, DIFFICULTY_SETTINGS[botDifficulty].thinkMs);
}

function applyMove(from, to, promotion = 'q', options = {}) {
  const { clearRedo = true, scheduleBot = true } = options;
  forcedConclusion = null;
  const move = chess.move({ from, to, promotion });
  if (!move) return false;
  if (clearRedo) resetRedoStack();
  clockState.started = true;

  const movingPieceCode = `${move.color}${move.piece}`;
  let movingMesh = pieceMeshes.get(from);
  if (!movingMesh) {
    rebuildPiecesFromBoard(true);
    movingMesh = pieceMeshes.get(from);
  }

  if (move.captured) {
    const capturedCode = `${move.color === 'w' ? 'b' : 'w'}${move.captured}`;
    captureState[move.color].push(capturedCode);
    const captureSquare = move.flags.includes('e') ? `${move.to[0]}${move.from[1]}` : move.to;
    removePieceAtSquare(captureSquare);
  }

  if (movingMesh) {
    pieceMeshes.delete(from);
    pieceMeshes.set(to, movingMesh);
    layoutPieceMesh(movingMesh, movingPieceCode, to, false);
  }

  if (move.flags.includes('k') || move.flags.includes('q')) {
    const rookFrom = move.flags.includes('k') ? (move.color === 'w' ? 'h1' : 'h8') : (move.color === 'w' ? 'a1' : 'a8');
    const rookTo = move.flags.includes('k') ? (move.color === 'w' ? 'f1' : 'f8') : (move.color === 'w' ? 'd1' : 'd8');
    const rookMesh = pieceMeshes.get(rookFrom);
    if (rookMesh) {
      pieceMeshes.delete(rookFrom);
      pieceMeshes.set(rookTo, rookMesh);
      layoutPieceMesh(rookMesh, `${move.color}r`, rookTo, false);
    }
  }

  if (move.flags.includes('p')) {
    removePieceAtSquare(to);
    const promotedMesh = createPieceMesh(`${move.color}${move.promotion}`);
    pieceMeshes.set(to, promotedMesh);
    piecesGroup.add(promotedMesh);
    layoutPieceMesh(promotedMesh, `${move.color}${move.promotion}`, to, true);
  }

  lastMoveSquares = [move.from, move.to];
  clockState.lastTickAt = performance.now();
  clearSelection();
  syncRecordedHistoryFromGame();
  updateMoveLog();
  syncCaptured();
  updateAnalysisPanel();
  updateCommentEditor();
  emitMoveSound(move);
  updateStatus(getMoveText(move));
  if (scheduleBot) scheduleBotTurn();
  return true;
}

function isHumanTurn() {
  return !(playerMode === 'pve' && chess.turn() === BOT_COLOR);
}

function trySquareClick(square) {
  if (isMatchOver() || reviewMode || botThinking || !isHumanTurn() || pendingPromotion) return;
  if (!selectedSquare) {
    selectSquare(square);
    return;
  }
  if (square === selectedSquare) {
    clearSelection();
    return;
  }
  if (legalTargets.has(square)) {
    const moves = legalMovesByTarget.get(square) ?? [];
    if (moves.some((move) => move.promotion)) {
      showPromotionOverlay(selectedSquare, square, chess.turn());
      updateStatus();
      updateHighlights();
      return;
    }
    if (applyMove(selectedSquare, square)) return;
  }
  selectSquare(square);
}

function onPointerDown(event) {
  if (isMatchOver() || reviewMode || botThinking || !isHumanTurn() || pendingPromotion) return;
  ensureAudioContext();
  updatePointerFromEvent(event);
  const square = getHitSquare();
  if (!square) return;
  const piece = chess.get(square);
  const ownTurnPiece = piece && piece.color === chess.turn();
  setHoverSquare(square);
  dragState = {
    pointerId: event.pointerId,
    square,
    ownTurnPiece,
    mesh: ownTurnPiece ? pieceMeshes.get(square) : null,
    startX: event.clientX,
    startY: event.clientY,
    dragged: false,
  };
  canvas.style.cursor = ownTurnPiece ? 'grab' : '';
  canvas.setPointerCapture?.(event.pointerId);
}

function onPointerMove(event) {
  updatePointerFromEvent(event);
  const hovered = getHitSquare(dragState?.dragged ? dragState.mesh : null);
  setHoverSquare(hovered);
  if (!dragState || dragState.pointerId !== event.pointerId || !dragState.mesh) return;
  const movement = Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY);
  if (!dragState.dragged && movement < 8) return;
  if (!dragState.dragged) {
    selectSquare(dragState.square);
    dragState.dragged = true;
    canvas.style.cursor = 'grabbing';
  }
  const dragPoint = getDragPoint(event);
  if (!dragPoint) return;
  dragState.mesh.userData.dragging = true;
  dragState.mesh.userData.animation = null;
  dragState.mesh.userData.landing = null;
  dragState.mesh.position.set(dragPoint.x, 0.9, dragPoint.z);
}

function onPointerUp(event) {
  const activeDrag = dragState;
  dragState = null;
  canvas.style.cursor = '';
  if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
  updatePointerFromEvent(event);
  const square = getHitSquare(activeDrag.mesh);
  setHoverSquare(square);
  canvas.releasePointerCapture?.(event.pointerId);
  if (activeDrag.dragged) {
    const targetSquare = square ?? activeDrag.square;
    if (targetSquare && selectedSquare === activeDrag.square && legalTargets.has(targetSquare)) {
      const moves = legalMovesByTarget.get(targetSquare) ?? [];
      if (moves.some((move) => move.promotion)) {
        activeDrag.mesh.userData.dragging = false;
        layoutPieceMesh(activeDrag.mesh, activeDrag.mesh.userData.pieceCode, activeDrag.square, false);
        showPromotionOverlay(activeDrag.square, targetSquare, chess.turn());
        updateStatus();
        updateHighlights();
        return;
      }
      if (applyMove(activeDrag.square, targetSquare)) return;
    }
    activeDrag.mesh.userData.dragging = false;
    layoutPieceMesh(activeDrag.mesh, activeDrag.mesh.userData.pieceCode, activeDrag.square, false);
    updateHighlights();
    return;
  }
  if (square ?? activeDrag.square) trySquareClick(square ?? activeDrag.square);
}

function onPointerCancel(event) {
  if (!dragState || dragState.pointerId !== event.pointerId) return;
  const { mesh, square } = dragState;
  dragState = null;
  canvas.style.cursor = '';
  canvas.releasePointerCapture?.(event.pointerId);
  if (!mesh) return;
  mesh.userData.dragging = false;
  layoutPieceMesh(mesh, mesh.userData.pieceCode, square, false);
  updateHighlights();
}

function onPointerLeave() {
  if (dragState?.dragged) return;
  setHoverSquare(null);
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
canvas.addEventListener('pointerup', onPointerUp);
canvas.addEventListener('pointercancel', onPointerCancel);
canvas.addEventListener('pointerleave', onPointerLeave);

menuButton.addEventListener('click', () => toggleSettingsMenu());
closeMenuButton.addEventListener('click', () => closeSettingsMenu());
menuTabs.addEventListener('click', (event) => {
  const button = event.target.closest('[data-menu-tab]');
  if (!button) return;
  setMenuTab(button.dataset.menuTab);
});
reviewMenuButton.addEventListener('click', () => openSettingsMenu('review'));
document.querySelector('#resetButton').addEventListener('click', () => resetGame());
document.querySelector('#overlayResetButton').addEventListener('click', () => resetGame());
overlayReviewButton.addEventListener('click', () => {
  openSettingsMenu('review');
  enterReviewMode(recordedHistoryVerbose.length);
});
reviewStartButton.addEventListener('click', () => enterReviewMode(0));
reviewPrevButton.addEventListener('click', () => enterReviewMode(Math.max(0, reviewIndex - 1)));
reviewNextButton.addEventListener('click', () => enterReviewMode(Math.min(recordedHistoryVerbose.length, reviewIndex + 1)));
reviewEndButton.addEventListener('click', () => enterReviewMode(recordedHistoryVerbose.length));
reviewExitButton.addEventListener('click', () => exitReviewMode());
saveSlotsElement.addEventListener('click', (event) => {
  const saveButton = event.target.closest('[data-save-slot]');
  if (saveButton) {
    ensureAudioContext();
    saveCurrentGameToSlot(Number(saveButton.dataset.saveSlot));
    return;
  }
  const loadButton = event.target.closest('[data-load-slot]');
  if (loadButton) {
    ensureAudioContext();
    loadGameFromSlot(Number(loadButton.dataset.loadSlot));
  }
});
exportPgnButton.addEventListener('click', () => {
  pgnTextarea.value = buildPgnExport();
  setPersistenceStatus('PGN exported to the text box.');
});
importPgnButton.addEventListener('click', () => {
  ensureAudioContext();
  importPgnText(pgnTextarea.value);
});
savePgnFileButton.addEventListener('click', async () => {
  ensureAudioContext();
  await exportPgnToFile();
});
openPgnFileButton.addEventListener('click', async () => {
  ensureAudioContext();
  await importPgnFromFile();
});
saveCommentButton.addEventListener('click', () => {
  saveComment();
});
clearCommentButton.addEventListener('click', () => {
  commentTextarea.value = '';
  saveComment();
});
undoButton.addEventListener('click', () => {
  ensureAudioContext();
  undoMoveBatch();
});
redoButton.addEventListener('click', () => {
  ensureAudioContext();
  redoMoveBatch();
});
soundToggleButton.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  saveSettings();
  updateSoundToggle();
  if (soundEnabled) ensureAudioContext();
});
document.querySelector('#flipButton').addEventListener('click', () => {
  if (playerMode === 'pve') return;
  ensureAudioContext();
  boardFlipped = !boardFlipped;
  saveSettings();
  syncPreferredBoardOrientation();
  relayoutPieces(true);
  resize();
});
promotionOverlay.addEventListener('click', (event) => {
  const option = event.target.closest('[data-promotion]');
  if (!option || !pendingPromotion) return;
  ensureAudioContext();
  const { from, to } = pendingPromotion;
  applyMove(from, to, option.dataset.promotion);
});
promotionCancelButton.addEventListener('click', () => {
  if (!pendingPromotion) return;
  const resumeSquare = pendingPromotion.from;
  hidePromotionOverlay();
  if (resumeSquare) {
    selectSquare(resumeSquare);
    updateStatus();
  }
});

modeControls.addEventListener('click', (event) => {
  const button = event.target.closest('[data-mode]');
  if (!button || button.dataset.mode === playerMode) return;
  ensureAudioContext();
  playerMode = button.dataset.mode;
  saveSettings();
  syncPreferredBoardOrientation();
  resetGame();
});

difficultyControls.addEventListener('click', (event) => {
  const button = event.target.closest('[data-difficulty]');
  if (!button || button.dataset.difficulty === botDifficulty) return;
  ensureAudioContext();
  botDifficulty = button.dataset.difficulty;
  saveSettings();
  if (playerMode === 'pve') {
    resetGame();
  } else {
    updateModeControls();
    updateStatus();
  }
});

timeControls.addEventListener('click', (event) => {
  const button = event.target.closest('[data-time]');
  if (!button || button.dataset.time === timeControlKey) return;
  ensureAudioContext();
  timeControlKey = button.dataset.time;
  saveSettings();
  resetGame();
});

themeControls.addEventListener('click', (event) => {
  const button = event.target.closest('[data-theme]');
  if (!button || button.dataset.theme === activeThemeKey) return;
  ensureAudioContext();
  activeThemeKey = button.dataset.theme;
  saveSettings();
  applyTheme();
});

function updateBoardOrientation() {
  root.rotation.y = boardFlipped ? Math.PI : 0;
}

function updateCameraFit(width, height) {
  const size = Math.max(1, Math.min(width, height));
  const scale = THREE.MathUtils.clamp(900 / size, 0.74, 1.28);
  camera.fov = THREE.MathUtils.clamp(38 + (scale - 1) * 14, 34, 52);
  camera.position.set(0, 13.4 * scale, 6.8 * scale);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

function resize() {
  const wrapStyle = window.getComputedStyle(boardWrap);
  const rowGap = Number.parseFloat(wrapStyle.rowGap || wrapStyle.gap || '0') || 0;
  const verticalPadding = (Number.parseFloat(wrapStyle.paddingTop || '0') || 0) + (Number.parseFloat(wrapStyle.paddingBottom || '0') || 0);
  const availableWidth = boardWrap.clientWidth;
  const availableHeight = boardWrap.clientHeight - verticalPadding - legend.getBoundingClientRect().height - rowGap;
  const size = Math.max(280, Math.floor(Math.min(availableWidth, availableHeight)));
  boardStage.style.width = `${size}px`;
  boardStage.style.height = `${size}px`;
  const width = boardStage.clientWidth;
  const height = boardStage.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  updateCameraFit(width, height);
}

window.addEventListener('resize', resize);
const resizeObserver = new ResizeObserver(() => resize());
resizeObserver.observe(boardWrap);

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now() * 0.001;
  const now = performance.now();
  tickClocks(now);
  boardBase.rotation.y = Math.sin(time * 0.2) * 0.01;
  underGlow.material.opacity = 0.08 + (Math.sin(time * 2.2) + 1) * 0.025;

  for (const mesh of pieceMeshes.values()) {
    const animation = mesh.userData.animation;
    const landing = mesh.userData.landing;
    const target = mesh.userData.target;
    if (!target) continue;
    if (mesh.userData.dragging) {
      mesh.rotation.y += (Math.sin(time * 0.8 + mesh.userData.floatOffset) * 0.08 - mesh.rotation.y) * 0.08;
      continue;
    }

    if (animation) {
      const elapsed = now - animation.start;
      const t = Math.min(elapsed / animation.duration, 1);
      const eased = 1 - ((1 - t) ** 4);
      const overshoot = eased + 0.06 * Math.sin(Math.PI * eased) * (1 - eased);
      mesh.position.lerpVectors(animation.from, animation.to, overshoot);
      mesh.position.y += Math.sin(Math.PI * eased) * animation.arcHeight;
      if (t >= 1) {
        mesh.userData.animation = null;
        mesh.userData.landing = { start: now, duration: 180 };
        mesh.position.set(target.x, target.y, target.z);
      }
    } else {
      const drift = Math.sin(time * 1.8 + mesh.userData.floatOffset) * mesh.userData.idleHeight;
      mesh.position.x += (target.x - mesh.position.x) * 0.14;
      mesh.position.y += ((target.y + drift) - mesh.position.y) * 0.12;
      mesh.position.z += (target.z - mesh.position.z) * 0.14;
    }

    mesh.rotation.y += (Math.sin(time * 0.8 + mesh.userData.floatOffset) * 0.08 - mesh.rotation.y) * 0.08;
    if (landing) {
      const t = Math.min((now - landing.start) / landing.duration, 1);
      const snap = Math.sin(t * Math.PI);
      mesh.scale.set(1 + snap * 0.09, 1 - snap * 0.16, 1 + snap * 0.09);
      mesh.position.y -= snap * 0.035;
      if (t >= 1) {
        mesh.userData.landing = null;
        mesh.scale.set(1, 1, 1);
      }
    } else {
      mesh.scale.x += (1 - mesh.scale.x) * 0.18;
      mesh.scale.y += (1 - mesh.scale.y) * 0.18;
      mesh.scale.z += (1 - mesh.scale.z) * 0.18;
    }
  }

  renderer.render(scene, camera);
}

function resetGame() {
  clearBotTimer();
  botThinking = false;
  forcedConclusion = null;
  reviewMode = false;
  reviewIndex = 0;
  boardFlipped = false;
  settingsOpen = false;
  activeMenuTab = 'setup';
  importedHeaders = {};
  positionComments.clear();
  syncPreferredBoardOrientation();
  updateSettingsMenu();
  saveSettings();
  chess.reset();
  gameStartFen = 'start';
  resetRedoStack();
  resetClocks();
  transpositionTable.clear();
  pgnTextarea.value = '';
  syncBoardState(true);
  relayoutPieces(true);
  resize();
  scheduleBotTurn();
  setPersistenceStatus('Export, import, or store a match in a local slot.');
}

function loadFenForDebug(fen) {
  clearBotTimer();
  botThinking = false;
  forcedConclusion = null;
  reviewMode = false;
  settingsOpen = false;
  activeMenuTab = 'setup';
  chess.load(fen);
  gameStartFen = fen;
  importedHeaders = { SetUp: '1', FEN: fen };
  positionComments.clear();
  syncPreferredBoardOrientation();
  reviewIndex = 0;
  resetRedoStack();
  resetClocks();
  clockState.started = false;
  transpositionTable.clear();
  pgnTextarea.value = '';
  updateSettingsMenu();
  syncBoardState(true);
}

function projectWorldPoint(point3d) {
  scene.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);
  const point = point3d.clone().project(camera);
  const rect = canvas.getBoundingClientRect();
  return {
    x: rect.left + ((point.x + 1) / 2) * rect.width,
    y: rect.top + ((-point.y + 1) / 2) * rect.height,
  };
}

function projectSquare(square, mode = 'auto') {
  scene.updateMatrixWorld(true);
  const pieceMesh = pieceMeshes.get(square);
  const usePiecePoint = mode === 'piece' || (mode === 'auto' && pieceMesh);
  if (usePiecePoint && pieceMesh) {
    return projectWorldPoint(pieceMesh.localToWorld(new THREE.Vector3(0, 0.9, 0)));
  }
  const squareMesh = squareMeshes.get(square);
  if (squareMesh) {
    return projectWorldPoint(squareMesh.getWorldPosition(new THREE.Vector3()));
  }
  return projectWorldPoint(squareCenterWorld(square));
}

window.__chessDebug = {
  clickSquare: (square) => trySquareClick(square),
  getSquareScreenPosition: (square, mode) => projectSquare(square, mode),
  getFen: () => chess.fen(),
  getTurn: () => chess.turn(),
  getStatus: () => statusLabel.textContent,
  getMoveLog: () => chess.history(),
  getPgn: () => buildPgnExport(),
  getCommentValue: () => commentTextarea.value,
  getClockState: () => ({ w: clockState.w, b: clockState.b, timeControlKey, started: clockState.started }),
  getPieceAt: (square) => {
    const piece = chess.get(square);
    return piece ? `${piece.color}${piece.type}` : null;
  },
  isGameOver: () => isMatchOver(),
  getUiState: () => ({
    playerMode,
    botDifficulty,
    activeThemeKey,
    timeControlKey,
    soundEnabled,
    boardFlipped,
    settingsOpen,
    hoverSquare,
    clockStarted: clockState.started,
    openingName: getOpeningName(),
    reviewMode,
    reviewIndex,
    lastSoundCue,
    botThinking,
    overlayVisible: !gameOverlay.hidden,
    promotionVisible: !promotionOverlay.hidden,
    selection: selectionLabel.textContent,
    canUndo: !undoButton.disabled,
    canRedo: !redoButton.disabled,
    persistenceMessage: persistenceLabel.textContent,
  }),
  setFen: (fen) => loadFenForDebug(fen),
  importPgn: (pgn) => importPgnText(pgn),
  importPgnFromFile: (filePath) => importPgnFromFile(filePath),
  exportPgnToFile: (filePath) => exportPgnToFile(filePath),
  saveComment: (comment) => {
    commentTextarea.value = comment;
    return saveComment();
  },
  saveSlot: (index) => saveCurrentGameToSlot(index),
  loadSlot: (index) => loadGameFromSlot(index),
  getSaveSlots: () => saveSlots,
  previewBotMove: () => {
    const move = chooseBotMove();
    if (!move) return null;
    return { from: move.from, to: move.to, san: move.san };
  },
  getEngineStats: () => lastEngineStats,
  setClocks: ({ w, b, timeKey = timeControlKey, started = false }) => {
    if (TIME_CONTROLS[timeKey]) timeControlKey = timeKey;
    clockState.w = w;
    clockState.b = b;
    clockState.started = started;
    clockState.lastTickAt = performance.now();
    forcedConclusion = null;
    updateStatus();
  },
  resetSettings: () => {
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    window.localStorage.removeItem(SAVE_STORAGE_KEY);
  },
  getSavedSettings: () => {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  boardMetrics: () => ({
    viewport: { width: window.innerWidth, height: window.innerHeight },
    shell: document.querySelector('.shell').getBoundingClientRect(),
    canvas: canvas.getBoundingClientRect(),
    stage: boardStage.getBoundingClientRect(),
    hud: document.querySelector('.hud').getBoundingClientRect(),
    legend: document.querySelector('.legend').getBoundingClientRect(),
    overlay: gameOverlay.getBoundingClientRect(),
    canScrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    canScrollY: document.documentElement.scrollHeight > document.documentElement.clientHeight,
  }),
};

loadSettings();
loadSaveSlots();
savePgnFileButton.disabled = !desktopBridge?.exportPgn;
openPgnFileButton.disabled = !desktopBridge?.importPgn;
updateSettingsMenu();
syncPreferredBoardOrientation();
applyTheme();
updateSoundToggle();
updateSaveSlotsDisplay();
resize();
resetGame();
animate();
