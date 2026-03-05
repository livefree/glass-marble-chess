import './styles.css';
import { Chess } from 'chess.js';
import * as THREE from 'three';

const PIECE_LABELS = {
  wp: 'White Pawn', wn: 'White Knight', wb: 'White Bishop', wr: 'White Rook', wq: 'White Queen', wk: 'White King',
  bp: 'Black Pawn', bn: 'Black Knight', bb: 'Black Bishop', br: 'Black Rook', bq: 'Black Queen', bk: 'Black King',
};

const PIECE_VALUES = { p: 1, n: 3, b: 3.25, r: 5, q: 9, k: 99 };

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="shell">
    <div class="hud">
      <div>
        <p class="eyebrow">Electron 3D Chess</p>
        <h1>Glass Marble Chess</h1>
        <p class="lede">Move the pieces directly on the board. Marble squares, glass pieces, soft fog, caustic-style reflections, and full chess rules.</p>
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
      </div>
      <div class="controls">
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
      <canvas id="scene"></canvas>
      <div class="legend">
        <span>Click one of your pieces, then a glowing destination square.</span>
        <span id="hintLabel">Special moves supported: castling, en passant, promotion to queen.</span>
      </div>
    </div>
  </div>
`;

const canvas = document.querySelector('#scene');
const turnLabel = document.querySelector('#turnLabel');
const statusLabel = document.querySelector('#statusLabel');
const selectionLabel = document.querySelector('#selectionLabel');
const moveLog = document.querySelector('#moveLog');
const capturedWhite = document.querySelector('#capturedWhite');
const capturedBlack = document.querySelector('#capturedBlack');
const hintLabel = document.querySelector('#hintLabel');

document.querySelector('#resetButton').addEventListener('click', () => resetGame());
document.querySelector('#flipButton').addEventListener('click', () => {
  boardFlipped = !boardFlipped;
  updateBoardOrientation();
  syncPieces(true);
});

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
rimLight.position.set(-8, 7, -8);
const warmLight = new THREE.PointLight(0xffcf8b, 40, 18, 2);
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
const livePieceEntries = [];
const legalTargets = new Set();
const captureState = { w: [], b: [] };
let boardFlipped = false;
let selectedSquare = null;
let highlightedMesh = null;
let lastMoveSquares = [];

const squareGeometry = new THREE.BoxGeometry(squareSize, 0.22, squareSize);
const boardBase = new THREE.Mesh(
  new THREE.BoxGeometry(9.8, 0.8, 9.8),
  new THREE.MeshPhysicalMaterial({
    color: 0x231610,
    roughness: 0.5,
    metalness: 0.15,
    clearcoat: 0.45,
  })
);
boardBase.position.y = -0.52;
boardBase.receiveShadow = true;
boardBase.castShadow = true;
boardGroup.add(boardBase);

const rim = new THREE.Mesh(
  new THREE.TorusGeometry(5.2, 0.12, 12, 90),
  new THREE.MeshPhysicalMaterial({ color: 0x8fd6ff, roughness: 0.2, transmission: 0.2, thickness: 0.6 })
);
rim.rotation.x = Math.PI / 2;
rim.position.y = -0.02;
boardGroup.add(rim);

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

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(12, 72),
  new THREE.ShadowMaterial({ opacity: 0.32 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.68;
floor.receiveShadow = true;
scene.add(floor);

camera.position.set(0, 13.6, 6.8);
camera.lookAt(0, 0, 0);

function createPieceMesh(pieceCode) {
  const color = pieceCode[0] === 'w' ? 0xd9f4ff : 0x0d1a28;
  const emissive = pieceCode[0] === 'w' ? 0x7fd6ff : 0x20476e;
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color,
    emissive,
    emissiveIntensity: pieceCode[0] === 'w' ? 0.18 : 0.1,
    roughness: 0.04,
    metalness: 0,
    transmission: 0.76,
    thickness: 1.3,
    ior: 1.26,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    transparent: true,
    opacity: pieceCode[0] === 'w' ? 0.9 : 0.95,
  });

  const group = new THREE.Group();
  const lowerRadius = pieceCode[1] === 'p' ? 0.27 : 0.33;
  const bodyHeight = pieceCode[1] === 'p' ? 0.72 : pieceCode[1] === 'q' ? 1.22 : pieceCode[1] === 'k' ? 1.3 : 1.04;
  const topRadius = pieceCode[1] === 'n' ? 0.2 : 0.25;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.22, 36), glassMaterial);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(topRadius, lowerRadius, bodyHeight, 42), glassMaterial);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 14, 40), glassMaterial);
  const cap = new THREE.Mesh(
    pieceCode[1] === 'p' ? new THREE.SphereGeometry(0.18, 28, 28) : new THREE.SphereGeometry(0.24, 28, 28),
    glassMaterial
  );

  base.position.y = 0.11;
  body.position.y = 0.22 + bodyHeight / 2;
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.28 + bodyHeight * 0.76;
  cap.position.y = 0.28 + bodyHeight + (pieceCode[1] === 'p' ? 0.16 : 0.22);

  group.add(base, body, collar, cap);

  if (pieceCode[1] === 'r') {
    for (let i = 0; i < 4; i += 1) {
      const crenel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.18), glassMaterial);
      const angle = (Math.PI / 2) * i;
      crenel.position.set(Math.cos(angle) * 0.2, cap.position.y + 0.05, Math.sin(angle) * 0.2);
      group.add(crenel);
    }
  }

  if (pieceCode[1] === 'b') {
    const cut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.18), glassMaterial);
    cut.position.y = cap.position.y + 0.02;
    cut.rotation.z = Math.PI / 6;
    group.add(cut);
  }

  if (pieceCode[1] === 'q') {
    for (let i = 0; i < 5; i += 1) {
      const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 18), glassMaterial);
      const angle = (Math.PI * 2 * i) / 5;
      jewel.position.set(Math.cos(angle) * 0.22, cap.position.y + 0.18, Math.sin(angle) * 0.22);
      group.add(jewel);
    }
  }

  if (pieceCode[1] === 'k') {
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.08), glassMaterial);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.08), glassMaterial);
    crossV.position.y = cap.position.y + 0.32;
    crossH.position.y = cap.position.y + 0.32;
    group.add(crossV, crossH);
  }

  if (pieceCode[1] === 'n') {
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.48, 0.18), glassMaterial);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.58, 4), glassMaterial);
    neck.position.set(0, 0.72, 0.04);
    head.position.set(0.05, 1.08, 0.06);
    head.rotation.z = Math.PI / 2.7;
    head.rotation.y = Math.PI / 4;
    group.add(neck, head);
  }

  group.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  return group;
}

function squareToCoords(square) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  const displayFile = boardFlipped ? 7 - file : file;
  const displayRank = boardFlipped ? 7 - rank : rank;
  return {
    x: displayFile - half + 0.5,
    z: displayRank - half + 0.5,
  };
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

function capturePiece(square, color) {
  const mesh = pieceMeshes.get(square);
  if (mesh) {
    piecesGroup.remove(mesh);
    pieceMeshes.delete(square);
    livePieceEntries.splice(livePieceEntries.findIndex((entry) => entry.square === square), 1);
  }
  const piece = color === 'w' ? 'bp' : 'wp';
  return piece;
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
  }
  mesh.userData.target = { x, y: yBase, z };
}

function syncPieces(immediate = false) {
  const board = chess.board();
  const expectedSquares = new Set();

  board.forEach((rank, rankIndex) => {
    rank.forEach((piece, fileIndex) => {
      if (!piece) {
        return;
      }
      const square = `${'abcdefgh'[fileIndex]}${8 - rankIndex}`;
      expectedSquares.add(square);
      const pieceCode = `${piece.color}${piece.type}`;
      let mesh = pieceMeshes.get(square);
      if (!mesh) {
        mesh = createPieceMesh(pieceCode);
        pieceMeshes.set(square, mesh);
        livePieceEntries.push({ square, mesh });
        piecesGroup.add(mesh);
      }
      layoutPieceMesh(mesh, pieceCode, square, immediate);
    });
  });

  for (const [square, mesh] of [...pieceMeshes.entries()]) {
    if (!expectedSquares.has(square)) {
      piecesGroup.remove(mesh);
      pieceMeshes.delete(square);
    }
  }
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

function getMoveText(move) {
  if (move.flags.includes('k')) return `${move.color === 'w' ? 'White' : 'Black'} castled kingside`;
  if (move.flags.includes('q')) return `${move.color === 'w' ? 'White' : 'Black'} castled queenside`;
  if (move.flags.includes('e')) return `${move.color === 'w' ? 'White' : 'Black'} en passant on ${move.to}`;
  if (move.flags.includes('p')) return `${move.color === 'w' ? 'White' : 'Black'} promoted on ${move.to}`;
  return `${move.color === 'w' ? 'White' : 'Black'} played ${move.san}`;
}

function updateStatus(extraMessage = '') {
  const turn = chess.turn() === 'w' ? 'White' : 'Black';
  turnLabel.textContent = turn;
  let message = `${turn} to move`;
  if (chess.isCheckmate()) {
    message = `${turn === 'White' ? 'Black' : 'White'} wins by checkmate`;
  } else if (chess.isStalemate()) {
    message = 'Draw by stalemate';
  } else if (chess.isThreefoldRepetition()) {
    message = 'Draw by repetition';
  } else if (chess.isInsufficientMaterial()) {
    message = 'Draw by insufficient material';
  } else if (chess.isDraw()) {
    message = 'Draw';
  } else if (chess.inCheck()) {
    message = `${turn} king in check`;
  }
  if (extraMessage) {
    message = `${message} · ${extraMessage}`;
  }
  statusLabel.textContent = message;
  hintLabel.textContent = chess.isGameOver()
    ? 'Game complete. Reset to play again.'
    : 'Special moves supported: castling, en passant, promotion to queen.';
}

function selectSquare(square) {
  const piece = chess.get(square);
  if (!piece || piece.color !== chess.turn()) {
    return;
  }
  selectedSquare = square;
  selectionLabel.textContent = `${PIECE_LABELS[`${piece.color}${piece.type}`]} on ${square}`;
  legalTargets.clear();
  chess.moves({ square, verbose: true }).forEach((move) => legalTargets.add(move.to));
  updateHighlights();
}

function clearSelection() {
  selectedSquare = null;
  selectionLabel.textContent = 'None';
  legalTargets.clear();
  updateHighlights();
}

function applyMove(from, to) {
  const move = chess.move({ from, to, promotion: 'q' });
  if (!move) {
    return false;
  }

  if (move.captured) {
    const capturedCode = `${move.color === 'w' ? 'b' : 'w'}${move.captured}`;
    captureState[move.color].push(capturedCode);
  }

  lastMoveSquares = [move.from, move.to];
  clearSelection();
  syncPieces(false);
  updateMoveLog();
  syncCaptured();
  updateStatus(getMoveText(move));
  return true;
}

function trySquareClick(square) {
  if (chess.isGameOver()) {
    return;
  }
  if (!selectedSquare) {
    selectSquare(square);
    return;
  }
  if (square === selectedSquare) {
    clearSelection();
    return;
  }
  if (legalTargets.has(square) && applyMove(selectedSquare, square)) {
    return;
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
  if (square) {
    trySquareClick(square);
  }
}

canvas.addEventListener('pointerdown', onPointer);

function updateBoardOrientation() {
  root.rotation.y = boardFlipped ? Math.PI : 0;
}

function resize() {
  const wrap = canvas.parentElement;
  const width = wrap.clientWidth;
  const height = wrap.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now() * 0.001;
  boardBase.rotation.y = Math.sin(time * 0.2) * 0.01;
  rim.material.emissiveIntensity = 0.15 + Math.sin(time * 2.5) * 0.04;

  for (const mesh of pieceMeshes.values()) {
    const target = mesh.userData.target;
    if (!target) continue;
    mesh.position.x += (target.x - mesh.position.x) * 0.16;
    mesh.position.y += (target.y - mesh.position.y) * 0.14;
    mesh.position.z += (target.z - mesh.position.z) * 0.16;
    mesh.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}

function resetGame() {
  chess.reset();
  selectedSquare = null;
  lastMoveSquares = [];
  legalTargets.clear();
  captureState.w = [];
  captureState.b = [];
  syncPieces(true);
  updateMoveLog();
  syncCaptured();
  updateHighlights();
  updateStatus();
  selectionLabel.textContent = 'None';
}

function projectWorldPoint(point3d) {
  const point = point3d.clone().project(camera);
  const rect = canvas.getBoundingClientRect();
  return {
    x: rect.left + ((point.x + 1) / 2) * rect.width,
    y: rect.top + ((-point.y + 1) / 2) * rect.height,
  };
}

function projectSquare(square, mode = 'auto') {
  const pieceMesh = pieceMeshes.get(square);
  const usePiecePoint = mode === 'piece' || (mode === 'auto' && pieceMesh);
  if (usePiecePoint && pieceMesh) {
    return projectWorldPoint(new THREE.Vector3(pieceMesh.position.x, pieceMesh.position.y + 0.9, pieceMesh.position.z));
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
  isGameOver: () => chess.isGameOver(),
  boardMetrics: () => ({
    viewport: { width: window.innerWidth, height: window.innerHeight },
    canvas: canvas.getBoundingClientRect(),
    hud: document.querySelector('.hud').getBoundingClientRect(),
    legend: document.querySelector('.legend').getBoundingClientRect(),
  }),
};

resize();
updateBoardOrientation();
resetGame();
animate();
