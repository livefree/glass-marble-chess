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
  easy: { depth: 1, thinkMs: 320, randomness: 18 },
  medium: { depth: 2, thinkMs: 420, randomness: 8 },
  hard: { depth: 3, thinkMs: 560, randomness: 0 },
};
const SETTINGS_STORAGE_KEY = 'glass-marble-chess.settings';
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
      <div>
        <p class="eyebrow">Electron 3D Chess</p>
        <h1>Glass Marble Chess</h1>
        <p class="lede">Responsive marble board, luminous glass pieces, and a playable desktop chess table with human and engine modes.</p>
      </div>

      <section class="turn-hero" id="turnHero" data-turn="w">
        <div class="turn-pill-row">
          <span class="turn-pill active" id="whiteTurnPill">White</span>
          <span class="turn-pill" id="blackTurnPill">Black</span>
        </div>
        <strong id="turnHeadline">White to move</strong>
        <p id="turnPrompt">White controls the first move.</p>
      </section>

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
      </div>

      <section class="play-config">
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
      </section>

      <div class="controls">
        <button id="undoButton">Undo</button>
        <button id="redoButton">Redo</button>
        <button id="resetButton">Reset Match</button>
        <button id="flipButton">Flip Board</button>
      </div>

      <div class="move-panels">
        <section>
          <h2>Move Log</h2>
          <ol id="moveLog"></ol>
        </section>
        <section>
          <h2>Captured</h2>
          <div id="capturedWhite" class="captured-row"></div>
          <div id="capturedBlack" class="captured-row"></div>
        </section>
      </div>
    </div>

    <div class="board-wrap">
      <div class="board-stage" id="boardStage">
        <canvas id="scene"></canvas>
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
            <button id="overlayResetButton">Play Again</button>
          </div>
        </div>
      </div>
      <div class="legend">
        <span id="instructionLabel">Click one of your pieces, then a glowing destination square.</span>
        <span id="hintLabel">Special moves supported: castling, en passant, promotion to queen.</span>
      </div>
    </div>
  </div>
`;

const canvas = document.querySelector('#scene');
const boardWrap = document.querySelector('.board-wrap');
const boardStage = document.querySelector('#boardStage');
const turnLabel = document.querySelector('#turnLabel');
const turnHeadline = document.querySelector('#turnHeadline');
const turnPrompt = document.querySelector('#turnPrompt');
const statusLabel = document.querySelector('#statusLabel');
const selectionLabel = document.querySelector('#selectionLabel');
const moveLog = document.querySelector('#moveLog');
const capturedWhite = document.querySelector('#capturedWhite');
const capturedBlack = document.querySelector('#capturedBlack');
const hintLabel = document.querySelector('#hintLabel');
const instructionLabel = document.querySelector('#instructionLabel');
const legend = document.querySelector('.legend');
const turnHero = document.querySelector('#turnHero');
const whiteTurnPill = document.querySelector('#whiteTurnPill');
const blackTurnPill = document.querySelector('#blackTurnPill');
const modeControls = document.querySelector('#modeControls');
const difficultyControls = document.querySelector('#difficultyControls');
const themeControls = document.querySelector('#themeControls');
const undoButton = document.querySelector('#undoButton');
const redoButton = document.querySelector('#redoButton');
const promotionOverlay = document.querySelector('#promotionOverlay');
const promotionHeadline = document.querySelector('#promotionHeadline');
const promotionCancelButton = document.querySelector('#promotionCancelButton');
const gameOverlay = document.querySelector('#gameOverlay');
const overlayHeadline = document.querySelector('#overlayHeadline');
const overlayDetail = document.querySelector('#overlayDetail');

let playerMode = 'pvp';
let botDifficulty = 'easy';
let activeThemeKey = 'glass-marble';
let boardFlipped = false;
let selectedSquare = null;
let lastMoveSquares = [];
let botThinking = false;
let botTimer = null;
let pendingPromotion = null;
const redoStack = [];
const captureState = { w: [], b: [] };

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

  group.userData.floatOffset = Math.random() * Math.PI * 2;
  group.userData.idleHeight = 0.02 + PIECE_VALUES[type] * 0.002;
  group.userData.animation = null;
  group.userData.landing = null;
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
}

function syncCaptured() {
  capturedWhite.innerHTML = captureState.w.map((piece) => `<span>${PIECE_LABELS[piece]}</span>`).join('');
  capturedBlack.innerHTML = captureState.b.map((piece) => `<span>${PIECE_LABELS[piece]}</span>`).join('');
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
  const history = chess.history();
  for (let i = 0; i < history.length; i += 2) {
    const item = document.createElement('li');
    item.textContent = `${history[i] ?? ''} ${history[i + 1] ?? ''}`.trim();
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
    if (typeof settings.boardFlipped === 'boolean') boardFlipped = settings.boardFlipped;
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
      boardFlipped,
    }));
  } catch {
    // Ignore storage failures in restrictive renderer contexts.
  }
}

function resetRedoStack() {
  redoStack.length = 0;
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
  applyCapturedStateFromHistory(verboseHistory);
  selectedSquare = null;
  selectionLabel.textContent = 'None';
  legalTargets.clear();
  legalMovesByTarget.clear();
  hidePromotionOverlay();
  rebuildPiecesFromBoard(immediate);
  updateMoveLog();
  syncCaptured();
  updateHighlights();
  updateStatus(extraMessage);
}

function getModeLabel() {
  return playerMode === 'pve' ? `PvE · ${botDifficulty}` : 'PvP';
}

function getGameConclusion() {
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
  if (!conclusion) {
    gameOverlay.hidden = true;
    return;
  }
  overlayHeadline.textContent = conclusion.headline;
  overlayDetail.textContent = conclusion.detail;
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

function getUndoBatchSize() {
  const historyLength = chess.history().length;
  if (!historyLength) return 0;
  if (playerMode !== 'pve') return 1;
  return chess.turn() === 'w' ? Math.min(2, historyLength) : 1;
}

function updateActionButtons() {
  undoButton.disabled = getUndoBatchSize() === 0 || !promotionOverlay.hidden;
  redoButton.disabled = redoStack.length === 0 || botThinking || !promotionOverlay.hidden;
}

function updateTurnVisuals(turn) {
  turnHero.dataset.turn = turn;
  whiteTurnPill.classList.toggle('active', turn === 'w');
  blackTurnPill.classList.toggle('active', turn === 'b');
}

function getMoveText(move) {
  if (move.flags.includes('k')) return `${move.color === 'w' ? 'White' : 'Black'} castled kingside`;
  if (move.flags.includes('q')) return `${move.color === 'w' ? 'White' : 'Black'} castled queenside`;
  if (move.flags.includes('e')) return `${move.color === 'w' ? 'White' : 'Black'} en passant on ${move.to}`;
  if (move.flags.includes('p')) return `${move.color === 'w' ? 'White' : 'Black'} promoted to ${PROMOTION_LABELS[move.promotion]} on ${move.to}`;
  return `${move.color === 'w' ? 'White' : 'Black'} played ${move.san}`;
}

function updateStatus(extraMessage = '') {
  const turn = chess.turn();
  const turnName = turn === 'w' ? 'White' : 'Black';
  turnLabel.textContent = turnName;
  updateTurnVisuals(turn);
  updateModeControls();
  updateActionButtons();

  let statusMessage = `${turnName} to move`;
  let promptMessage = `${turnName} controls the next move.`;
  const conclusion = getGameConclusion();

  if (conclusion) {
    statusMessage = conclusion.detail;
    promptMessage = conclusion.headline;
  } else if (pendingPromotion) {
    statusMessage = `${turnName} choose a promotion piece`;
    promptMessage = `${turnName} must finish the pawn promotion.`;
  } else if (botThinking) {
    statusMessage = `${turnName} engine thinking`;
    promptMessage = `${turnName} engine is searching ${botDifficulty} lines.`;
  } else if (playerMode === 'pve' && turn === BOT_COLOR) {
    statusMessage = 'Black engine to move';
    promptMessage = `PvE · ${botDifficulty} engine on move.`;
  } else if (chess.inCheck()) {
    statusMessage = `${turnName} king in check`;
    promptMessage = `${turnName} must answer the check.`;
  } else if (playerMode === 'pve') {
    promptMessage = `Human vs engine · ${getModeLabel()}`;
  }

  if (extraMessage) {
    statusMessage = `${statusMessage} · ${extraMessage}`;
  }

  statusLabel.textContent = statusMessage;
  turnHeadline.textContent = conclusion ? conclusion.headline : `${turnName} to move`;
  turnPrompt.textContent = promptMessage;
  instructionLabel.textContent = botThinking
    ? 'Hold the board. The engine is finishing its move.'
    : pendingPromotion
      ? 'Choose the promotion piece to complete the move.'
    : playerMode === 'pve'
      ? 'You control White. Click your piece, then a glowing destination square.'
      : 'Click one of your pieces, then a glowing destination square.';
  hintLabel.textContent = conclusion
    ? conclusion.detail
    : playerMode === 'pve'
      ? `Mode: ${getModeLabel()} · Special moves: castling, en passant, promotion choice.`
      : 'Special moves supported: castling, en passant, promotion choice.';

  setOverlay(conclusion);
}

function selectSquare(square) {
  const piece = chess.get(square);
  if (!piece || piece.color !== chess.turn()) return;
  if (playerMode === 'pve' && chess.turn() === BOT_COLOR) return;
  hidePromotionOverlay();
  selectedSquare = square;
  selectionLabel.textContent = `${PIECE_LABELS[`${piece.color}${piece.type}`]} on ${square}`;
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
  syncBoardState(true, 'Move undone');
  return true;
}

function redoMoveBatch() {
  const batch = redoStack.pop();
  if (!batch?.length) return false;
  clearBotTimer();
  botThinking = false;
  hidePromotionOverlay();
  batch.forEach((move) => {
    applyMove(move.from, move.to, move.promotion ?? 'q', { clearRedo: false, scheduleBot: false });
  });
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

function evaluateBoard(game, perspective) {
  if (game.isCheckmate()) return game.turn() === perspective ? -100000 : 100000;
  if (game.isDraw()) return 0;

  let score = 0;
  const board = game.board();
  board.forEach((rank, rankIndex) => {
    rank.forEach((piece, fileIndex) => {
      if (!piece) return;
      const sign = piece.color === perspective ? 1 : -1;
      const center = 3.5 - (Math.abs(fileIndex - 3.5) + Math.abs(rankIndex - 3.5)) / 2;
      const advancement = piece.type === 'p'
        ? (piece.color === 'w' ? 7 - rankIndex : rankIndex) * 0.08
        : 0;
      score += sign * (PIECE_VALUES[piece.type] * 100 + center * 6 + advancement * 10);
    });
  });

  const mobility = game.moves().length;
  score += (game.turn() === perspective ? 1 : -1) * mobility * 0.8;
  return score;
}

function searchBestScore(game, depth, alpha, beta, perspective) {
  if (depth === 0 || game.isGameOver()) return evaluateBoard(game, perspective);

  const moves = game.moves({ verbose: true }).sort((a, b) => scoreMoveHeuristic(b) - scoreMoveHeuristic(a));
  const maximizing = game.turn() === perspective;

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      game.move(move);
      best = Math.max(best, searchBestScore(game, depth - 1, alpha, beta, perspective));
      game.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const move of moves) {
    game.move(move);
    best = Math.min(best, searchBestScore(game, depth - 1, alpha, beta, perspective));
    game.undo();
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function chooseBotMove() {
  const settings = DIFFICULTY_SETTINGS[botDifficulty];
  const sandbox = new Chess(chess.fen());
  const moves = sandbox.moves({ verbose: true }).sort((a, b) => scoreMoveHeuristic(b) - scoreMoveHeuristic(a));
  if (!moves.length) return null;

  const scoredMoves = moves.map((move) => {
    sandbox.move(move);
    const score = searchBestScore(sandbox, settings.depth - 1, -Infinity, Infinity, BOT_COLOR);
    sandbox.undo();
    const noise = settings.randomness ? Math.random() * settings.randomness : 0;
    return { move, score: score + noise };
  }).sort((a, b) => b.score - a.score);

  if (settings.randomness > 0) {
    const pool = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
    return pool[Math.floor(Math.random() * pool.length)].move;
  }

  return scoredMoves[0].move;
}

function scheduleBotTurn() {
  clearBotTimer();
  if (playerMode !== 'pve' || chess.isGameOver() || chess.turn() !== BOT_COLOR || pendingPromotion) return;
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
  const move = chess.move({ from, to, promotion });
  if (!move) return false;
  if (clearRedo) resetRedoStack();

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
  clearSelection();
  updateMoveLog();
  syncCaptured();
  updateStatus(getMoveText(move));
  if (scheduleBot) scheduleBotTurn();
  return true;
}

function isHumanTurn() {
  return !(playerMode === 'pve' && chess.turn() === BOT_COLOR);
}

function trySquareClick(square) {
  if (chess.isGameOver() || botThinking || !isHumanTurn() || pendingPromotion) return;
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

function onPointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const targets = [...pieceMeshes.values(), ...squareMeshes.values()];
  const hits = raycaster.intersectObjects(targets, true);
  if (!hits.length) return;
  const hit = hits[0].object;
  let square = hit.userData.square;
  if (!square && hit.parent) square = hit.parent.userData.square;
  if (square) trySquareClick(square);
}

canvas.addEventListener('pointerdown', onPointer);

document.querySelector('#resetButton').addEventListener('click', () => resetGame());
document.querySelector('#overlayResetButton').addEventListener('click', () => resetGame());
undoButton.addEventListener('click', () => {
  undoMoveBatch();
});
redoButton.addEventListener('click', () => {
  redoMoveBatch();
});
document.querySelector('#flipButton').addEventListener('click', () => {
  boardFlipped = !boardFlipped;
  saveSettings();
  updateBoardOrientation();
  relayoutPieces(true);
  resize();
});
promotionOverlay.addEventListener('click', (event) => {
  const option = event.target.closest('[data-promotion]');
  if (!option || !pendingPromotion) return;
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
  playerMode = button.dataset.mode;
  saveSettings();
  resetGame();
});

difficultyControls.addEventListener('click', (event) => {
  const button = event.target.closest('[data-difficulty]');
  if (!button || button.dataset.difficulty === botDifficulty) return;
  botDifficulty = button.dataset.difficulty;
  saveSettings();
  if (playerMode === 'pve') {
    resetGame();
  } else {
    updateModeControls();
    updateStatus();
  }
});

themeControls.addEventListener('click', (event) => {
  const button = event.target.closest('[data-theme]');
  if (!button || button.dataset.theme === activeThemeKey) return;
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
  boardBase.rotation.y = Math.sin(time * 0.2) * 0.01;
  underGlow.material.opacity = 0.08 + (Math.sin(time * 2.2) + 1) * 0.025;

  for (const mesh of pieceMeshes.values()) {
    const animation = mesh.userData.animation;
    const landing = mesh.userData.landing;
    const target = mesh.userData.target;
    if (!target) continue;

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
  chess.reset();
  resetRedoStack();
  syncBoardState(true);
  scheduleBotTurn();
}

function loadFenForDebug(fen) {
  clearBotTimer();
  botThinking = false;
  chess.load(fen);
  resetRedoStack();
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
  getPieceAt: (square) => {
    const piece = chess.get(square);
    return piece ? `${piece.color}${piece.type}` : null;
  },
  isGameOver: () => chess.isGameOver(),
  getUiState: () => ({
    playerMode,
    botDifficulty,
    activeThemeKey,
    boardFlipped,
    botThinking,
    overlayVisible: !gameOverlay.hidden,
    promotionVisible: !promotionOverlay.hidden,
    selection: selectionLabel.textContent,
    canUndo: !undoButton.disabled,
    canRedo: !redoButton.disabled,
  }),
  setFen: (fen) => loadFenForDebug(fen),
  resetSettings: () => {
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
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
updateBoardOrientation();
applyTheme();
resize();
resetGame();
animate();
