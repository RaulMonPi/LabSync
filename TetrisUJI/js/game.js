// --- Config ---
const BLOCKSIZE = 28;               // px
const NUMBLOCKS_X = 10;             // classic width
const NUMBLOCKS_Y = 20;             // classic height
const MOVEMENT_LAG = 85;            // ms (soft key repeat)
const INITIAL_FALL_DELAY = 600;     // ms
const PREVIEW_PANEL_BLOCKS = 6;     // panel width in block units
const PREVIEW_BLOCKSIZE = 18;       // px


// 7 tetrominoes, rotation around a center cell
const BLOCKS_PER_TETROMINO = 4;
const N_BLOCK_TYPES = 7;
//const WALL_KICK_OFFSETS = [[-1,0],[1,0],[-2,0],[2,0]];

const TETROMINO_OFFSETS = {
  0 : [[0,-1],[0,0],[0,1],[1,1]],     // L
  1 : [[0,-1],[0,0],[0,1],[-1,1]],    // J
  2 : [[-1,0],[0,0],[1,0],[2,0]],     // I
  3 : [[-1,-1],[0,-1],[0,0],[-1,0]],  // O
  4 : [[-1,0],[0,0],[0,-1],[1,-1]],   // S
  5 : [[-1,0],[0,0],[1,0],[0,1]],     // T
  6 : [[-1,-1],[0,-1],[0,0],[1,0]]    // Z
};

// Color de las piezas: blanco
const PIECE_COLOR = 0xFFFFFF;

// Scene grid values
const EMPTY = 0;
const FALLING = 1;
const OCCUPIED = 2;

function createBlockGraphic(color, size) {
  let g = game.add.graphics(0,0);
  g.beginFill(color, 1);
  let m = 1;
  g.drawRect(m, m, size - 2*m, size - 2*m);
  g.endFill();
  return g;
}

class Tetris {
  constructor() {
    this.scene = [];
    this.sceneBlocks = [];
  }

  // Inicializa la matriz lógica del tablero y la matriz de referencias a bloques ya fijados.
  initGrid() {
    for (let x = 0; x < NUMBLOCKS_X; x++) {
      let col = [];
      let colBlocks = [];
      for (let y = 0; y < NUMBLOCKS_Y; y++) {
        col.push(EMPTY);
        colBlocks.push(null);
      }
      this.scene.push(col);
      this.sceneBlocks.push(colBlocks);
    }
  }

  // Comprueba si una celda está dentro del tablero y no está ocupada por bloques ya fijados.
  validateCoordinates(x, y) {
    if (x < 0 || x >= NUMBLOCKS_X) return false;
    if (y < 0 || y >= NUMBLOCKS_Y) return false;
    if (this.scene[x][y] === OCCUPIED) return false;
    return true;
  }
};

class Tetromino {
  constructor(shape, color, tetris) {
    this.shape = shape;
    this.color = color;
    this.tetris = tetris;
    this.center = [0, 0];
    this.blocks = [];
    this.cells = [];
    // The positions of each block of a tetromino with respect to its center (cell coords)
    this.offsets = TETROMINO_OFFSETS;
  }

  // Dibuja el bloque mediante Graphics de Phaser (sin sprites), con un pequeño margen
  // respecto a la rejilla.
  renderBlock() {
    return createBlockGraphic(this.color, BLOCKSIZE);
  }

  create(c_x, c_y) {
    this.center = [c_x, c_y];

    let conflict = false;
    for (let i = 0; i < BLOCKS_PER_TETROMINO; i++) {
      let x = c_x + this.offsets[this.shape][i][0];
      let y = c_y + this.offsets[this.shape][i][1];

      let b = this.renderBlock();
      b.x = x * BLOCKSIZE;
      b.y = y * BLOCKSIZE;

      this.blocks.push(b);
      this.cells.push([x,y]);
  
      if (!this.tetris.validateCoordinates(x,y)) {
        conflict = true;
      } else {
        this.tetris.scene[x][y] = FALLING;
      }
    }
    return conflict;
  }

  // Verifica si la pieza puede moverse/rotar sin salirse del tablero ni chocar con bloques ocupados.
  canMove(coordFn, dir) {
    if (gameOverState) return false;
    for(let i = 0; i < this.cells.length; i++) {
      let nc = coordFn(i, dir);
      if (!this.tetris.validateCoordinates(nc[0], nc[1])) return false;
    }
    return true;
  }

  // Calcula la nueva coordenada de un bloque de la pieza al moverla en una dirección.
  slide(block, dir) {
    return [this.cells[block][0] + move_offsets[dir][0],
            this.cells[block][1] + move_offsets[dir][1]];
  }

  // Calcula la nueva coordenada de un bloque tras rotar alrededor del centro (rotación clásica).
  rotate(block, dir) {
    // classic rotation around center
    let c_x = this.center[0];
    let c_y = this.center[1];

    let ox = this.cells[block][0] - c_x;
    let oy = this.cells[block][1] - c_y;

    // adjust for screen coords
    oy = -oy;

    let nx = (dir === 'clockwise') ? oy : -oy;
    let ny = (dir === 'clockwise') ? -ox : ox;

    ny = -ny;

    return [c_x + nx, c_y + ny];
  }

  // Aplica el movimiento/rotación: actualiza celdas, posiciones gráficas y el estado del tablero.
  move(coordFn, centerFn, dir) {
    for (let i = 0; i < this.cells.length; i++) {
      let ox = this.cells[i][0];
      let oy = this.cells[i][1];
      let nc = coordFn(i, dir);
      let nx = nc[0];
      let ny = nc[1];

      this.cells[i][0] = nx;
      this.cells[i][1] = ny;
      this.blocks[i].x = nx * BLOCKSIZE;
      this.blocks[i].y = ny * BLOCKSIZE;

      this.tetris.scene[ox][oy] = EMPTY;
      this.tetris.scene[nx][ny] = FALLING;
    }
    if (centerFn) {
      let nc = centerFn(dir);
      this.center = [nc[0], nc[1]];
    }
  }

  // Calcula la nueva coordenada del centro de rotación al mover la pieza en una dirección.
  slideCenter(dir) {
    return [this.center[0] + move_offsets[dir][0],
            this.center[1] + move_offsets[dir][1]];
  }
};


var gameState = {
  preload: function () {
    // Aquí se cargarían assets si los hubiera
  },
  create: resetGame,
  update: updateGame
};

let bg;

let boardWidth = NUMBLOCKS_X * BLOCKSIZE;
let gameWidth  = boardWidth + (PREVIEW_PANEL_BLOCKS * BLOCKSIZE);
let gameHeight = NUMBLOCKS_Y * BLOCKSIZE;

let y_start = { 0:1, 1:1, 2:0, 3:1, 4:1, 5:0, 6:1 };

let move_offsets = {
  left:  [-1,0],
  down:  [0,1],
  right: [1,0]
};

// Elements for the game
let tetromino, theTetris;
let cursors, keyRotate, keyRestart, keyPause;
let gameOverState = false;
let pausedState = false;
let pauseWasDown = false;
let nextShape = null;
let previewBlocks = [];
let pauseLabel = null;

let timer, loop;
let currentMovementTimer = 0;

let playerNameText = null;
let editNameButton = null;
let editNamePanel = null;
let editNameLabel = null;
let editNameHint = null;
let editingName = false;
let htmlNameInput = null;

function getPlayerName() {
  return localStorage.getItem('playerName') || window.playerName || 'Jugador';
}

function openNameEditor() {
  if (!pausedState || gameOverState || editingName || !playerNameText) return;

  editingName = true;
  playerNameText.visible = false;

  htmlNameInput = document.createElement('input');
  htmlNameInput.type = 'text';
  htmlNameInput.maxLength = 16;
  htmlNameInput.value = getPlayerName();
  htmlNameInput.placeholder = 'Jugador';
  htmlNameInput.autocomplete = 'off';
  htmlNameInput.className = 'game-name-input';

  document.body.appendChild(htmlNameInput);
  refreshNameInputPosition();

  htmlNameInput.focus();
  htmlNameInput.select();

  htmlNameInput.addEventListener('keydown', function (e) {
    e.stopPropagation();

    if (e.key === 'Enter') {
      saveNameEditor();
    } else if (e.key === 'Escape') {
      closeNameEditor(false);
    }
  });
}

function saveNameEditor() {
  if (!htmlNameInput) return;

  let nombre = htmlNameInput.value.trim();
  if (nombre === '') nombre = 'Jugador';

  localStorage.setItem('playerName', nombre);
  window.playerName = nombre;

  if (playerNameText) {
    playerNameText.text = 'PLAYER: ' + nombre;
  }

  closeNameEditor();
}

function closeNameEditor() {
  if (htmlNameInput && htmlNameInput.parentNode) {
    htmlNameInput.parentNode.removeChild(htmlNameInput);
  }

  htmlNameInput = null;
  editingName = false;

  if (playerNameText) {
    playerNameText.visible = true;
    playerNameText.fill = '#ffffff';
  }
}

function refreshNameInputPosition() {
  if (!htmlNameInput || !playerNameText) return;

  let rect = game.canvas.getBoundingClientRect();

  htmlNameInput.style.left = (rect.left + playerNameText.x - 2) + 'px';
  htmlNameInput.style.top = (rect.top + playerNameText.y - 2) + 'px';
  htmlNameInput.style.width = (playerNameText.width + 12) + 'px';
  htmlNameInput.style.height = '28px';
}

function destroyNameEditor() {
  if (htmlNameInput && htmlNameInput.parentNode) {
    htmlNameInput.parentNode.removeChild(htmlNameInput);
  }

  htmlNameInput = null;
  editingName = false;

  if (playerNameText) {
    playerNameText.visible = true;
    playerNameText.fill = '#ffffff';
  }
}

// Reinicia estado, tablero, HUD, input y temporizador para empezar una partida limpia.
function resetGame() {
    destroyNameEditor(); //para evitar duplicados

  // clear all blocks
  game.world.removeAll();

  // initialisation
  gameOverState = false;
  currentMovementTimer = 0;

  // Create Trellis and initialisation of its grid
  theTetris = new Tetris();
  theTetris.initGrid();

  bg = game.add.graphics(0,0);
  bg.beginFill(0x111111, 1);
  bg.drawRect(0,0,boardWidth,gameHeight);
  bg.endFill();
  bg.beginFill(0x1A1A1A, 1);
  bg.drawRect(boardWidth,0,gameWidth - boardWidth,gameHeight);
  bg.endFill();
  bg.lineStyle(1, 0x1B1B1B, 1);
  for (let x = 0; x < NUMBLOCKS_X; x++) {
    bg.moveTo(x*BLOCKSIZE, 0);
    bg.lineTo(x*BLOCKSIZE, gameHeight);
  };
  for (let y = 0; y < NUMBLOCKS_Y; y++) {
    bg.moveTo(0, y*BLOCKSIZE);
    bg.lineTo(gameWidth, y*BLOCKSIZE);
  };

  game.add.text(
    boardWidth + 16,
    20,
    'NEXT',
    { font: '22px MangaStyle', fill: '#ffdd00' }
  );

  game.add.text(
    boardWidth + 16,
    gameHeight - 28,
    'P: Pause',
    { font: '16px MangaStyle', fill: '#cccccc' }
  );

  nextShape = randomShape();
  updateNextPreview(nextShape);

  // input
  cursors = game.input.keyboard.createCursorKeys();
  keyRotate = game.input.keyboard.addKey(Phaser.Keyboard.UP);
  keyRestart = game.input.keyboard.addKey(Phaser.Keyboard.R);
  keyPause = game.input.keyboard.addKey(Phaser.Keyboard.P);

  pauseLabel = game.add.text(
    boardWidth / 2,
    gameHeight / 2,
    'PAUSED',
    { font: '48px KyotoTitle', fill: '#ffdd00', align: 'center' }
  );
  pauseLabel.anchor.set(0.5);
  pauseLabel.visible = false;
  pausedState = false;
  pauseWasDown = false;

  let currentPlayerName = getPlayerName();

  playerNameText = game.add.text(
    boardWidth + 16,
    200,
    'PLAYER: ' + currentPlayerName,
    { font: '18px MangaStyle', fill: '#ffffff' }
  );

  playerNameText.inputEnabled = true;
  playerNameText.useHandCursor = true;

  playerNameText.events.onInputOver.add(function () {
    if (pausedState && !editingName) {
      playerNameText.fill = '#f3d9b1';
    }
  });

  playerNameText.events.onInputOut.add(function () {
    if (!editingName) {
      playerNameText.fill = '#ffffff';
    }
  });

  playerNameText.events.onInputDown.add(function () {
    if (!pausedState) return;
    openNameEditor();
  });

  // timer
  // IMPORTANTE: si venimos de un game over, el Timer andará pausado.
  // Hay que reanudarlo explícitamente, o la caída se queda a 0 (no cae nunca).
  timer = game.time.events;
  timer.removeAll();
  timer.resume();
  loop = timer.loop(INITIAL_FALL_DELAY, fall, this);

  spawn();
};

// Tick de caída automática: intenta bajar la pieza, o la fija si ya no puede.
function fall() {
  if (gameOverState) return;
  if (tetromino.canMove(tetromino.slide.bind(tetromino),'down')) {
    tetromino.move(tetromino.slide.bind(tetromino), tetromino.slideCenter.bind(tetromino), 'down');
  }
  else lockTetromino();
};

// Crea una nueva pieza en la parte superior; si colisiona al aparecer, termina la partida.
function spawn() {
  let shape = nextShape;
  let color = PIECE_COLOR;

  tetromino = new Tetromino(shape, color, theTetris);

  nextShape = randomShape();
  updateNextPreview(nextShape);

  let start_x = Math.floor(NUMBLOCKS_X/2);
  let start_y = y_start[tetromino.shape];
  let conflict = tetromino.create(start_x, start_y);
  if (conflict) setGameOver(true);
};

function randomShape() {
  return Math.floor(Math.random() * N_BLOCK_TYPES);
};

// Redibuja el panel de preview con la forma del siguiente tetromino.
// Primero elimina la miniatura anterior y luego centra la nueva pieza en el panel lateral.
function updateNextPreview(shape) {
  for (let i = 0; i < previewBlocks.length; i++) {
    previewBlocks[i].destroy();
  }
  previewBlocks = [];

  let offsets = TETROMINO_OFFSETS[shape];
  let panelX = boardWidth;
  let panelWidth = gameWidth - boardWidth;
  let centerX = panelX + Math.floor(panelWidth / 2);
  let centerY = 70 + (2 * PREVIEW_BLOCKSIZE);

  for (let k = 0; k < offsets.length; k++) {
    let px = centerX + offsets[k][0] * PREVIEW_BLOCKSIZE;
    let py = centerY + offsets[k][1] * PREVIEW_BLOCKSIZE;

    let g = createBlockGraphic(PIECE_COLOR, PREVIEW_BLOCKSIZE);
    g.x = px;
    g.y = py;

    previewBlocks.push(g);
  }
};

// Activa el estado de fin de partida y cambia al state HallFame.
function setGameOver(on){
  gameOverState = on;
  if (gameOverState) {
    pausedState = false;
    timer.removeAll();
    destroyNameEditor();
    game.state.start('HallFame');
  }
};

function togglePause() {
  if (gameOverState) return;

  pausedState = !pausedState;
  pauseLabel.visible = pausedState;
  game.world.bringToTop(pauseLabel);

  if (pausedState) {
    timer.pause();
  } else {
    closeNameEditor(false);
    timer.resume();
    currentMovementTimer = 0;
  }
};

// Intenta rotar la pieza; si choca con una pared, prueba pequeños desplazamientos laterales
// para "empujarla" hasta una posición válida antes de cancelar la rotación.
function rotateWithWallKick(dir) {
  if (tetromino.canMove(tetromino.rotate.bind(tetromino), dir)) {
    tetromino.move(tetromino.rotate.bind(tetromino), null, dir);
    return true;
  }

  /*for (let i = 0; i < WALL_KICK_OFFSETS.length; i++) {
    let kick = WALL_KICK_OFFSETS[i];
    let kickX = kick[0];
    let kickY = kick[1];

    let kickedRotate = function (block, d) {
      let rotated = tetromino.rotate(block, d);
      return [rotated[0] + kickX, rotated[1] + kickY];
    };

    let kickedCenter = function () {
      return [tetromino.center[0] + kickX, tetromino.center[1] + kickY];
    };

    if (tetromino.canMove(kickedRotate, dir)) {
      tetromino.move(kickedRotate, kickedCenter, dir);
      return true;
    }
  }*/

  return false;
};


// Bucle de actualización para leer input y mover la pieza
function updateGame() {
  refreshNameInputPosition();

  let pauseIsDown = keyPause.isDown;
  if (pauseIsDown && !pauseWasDown) {
    pauseWasDown = true;
    togglePause();
    return;
  }
  if (!pauseIsDown) pauseWasDown = false;

  if (editingName) return;
  if (pausedState || gameOverState) return;

  currentMovementTimer += this.time.elapsed;
  if (currentMovementTimer <= MOVEMENT_LAG) return;


  if (cursors.left.isDown && tetromino.canMove(tetromino.slide.bind(tetromino), 'left')) {
    tetromino.move(tetromino.slide.bind(tetromino), tetromino.slideCenter.bind(tetromino), 'left');
  } else if (cursors.right.isDown && tetromino.canMove(tetromino.slide.bind(tetromino), 'right')) {
    tetromino.move(tetromino.slide.bind(tetromino), tetromino.slideCenter.bind(tetromino), 'right');
  } else if (cursors.down.isDown && tetromino.canMove(tetromino.slide.bind(tetromino), 'down')) {
    tetromino.move(tetromino.slide.bind(tetromino), tetromino.slideCenter.bind(tetromino), 'down');
  } else if (keyRotate.isDown) {
    rotateWithWallKick('clockwise');
  };

  currentMovementTimer = 0;
};

// Fija la pieza actual en el tablero, comprueba líneas completas y genera la siguiente.
function lockTetromino() {
  let touchedLines = [];
  for (let i = 0; i < tetromino.cells.length; i++) {
    let x = tetromino.cells[i][0];
    let y = tetromino.cells[i][1];

    theTetris.scene[x][y] = OCCUPIED;
    theTetris.sceneBlocks[x][y] = tetromino.blocks[i];

    if (touchedLines.indexOf(y) == -1)
      touchedLines.push(y);
  }
  checkLines(touchedLines);
  spawn();
};

// Revisa las filas tocadas por la pieza recién fijada y aplica limpieza/colapso/puntuación.
function checkLines(candidateLines) {
  let collapsed = [];
  for (let i = 0; i < candidateLines.length; i++) {
    let y = candidateLines[i];
    if (lineSum(y) == (NUMBLOCKS_X * OCCUPIED)) {
      collapsed.push(y);
      cleanLine(y);
    }
  }
  if (collapsed.length)
    collapse(collapsed);
};

// Suma el estado de una fila para detectar si está completamente ocupada.
function lineSum(y) {
  let s = 0;
  for (let x = 0; x < NUMBLOCKS_X; x++)
    s += theTetris.scene[x][y];
  return s;
};

// Borra una fila: destruye los Graphics de esa fila y marca las celdas como vacías.
function cleanLine(y) {
  for (let x = 0; x < NUMBLOCKS_X; x++) {
    if (theTetris.sceneBlocks[x][y]) {
      theTetris.sceneBlocks[x][y].destroy();
      theTetris.sceneBlocks[x][y] = null;
    }
    theTetris.scene[x][y] = EMPTY;
  }
};

// Colapsa filas: baja todo lo que queda por encima de las líneas eliminadas.
function collapse(linesToCollapse) {
  // sort ascending so we collapse from bottom up
  linesToCollapse.sort(function (a, b) {
    return a - b;
  });
  for (let idx = 0; idx < linesToCollapse.length; idx++) {
    let y = linesToCollapse[idx];
    for (let yy = y; yy > 0; yy--) {
      for (let x = 0; x < NUMBLOCKS_X; x++) {
        // shift occupancy
        theTetris.scene[x][yy] = theTetris.scene[x][yy-1];
        theTetris.sceneBlocks[x][yy] = theTetris.sceneBlocks[x][yy-1];
        if (theTetris.sceneBlocks[x][yy])
          theTetris.sceneBlocks[x][yy].y = yy * BLOCKSIZE;
      }
    }
    // clear top line
    for (let x2 = 0; x2 < NUMBLOCKS_X; x2++) {
      theTetris.scene[x2][0] = EMPTY;
      theTetris.sceneBlocks[x2][0] = null;
    }
  }
};
