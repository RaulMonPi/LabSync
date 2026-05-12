// --- Config ---
const BLOCKSIZE = 28;               // px
const NUMBLOCKS_X = 10;             // classic width
const NUMBLOCKS_Y = 20;             // classic height
const MOVEMENT_LAG = 85;            // ms (soft key repeat)
const INITIAL_FALL_DELAY = 600;     // ms
const PREVIEW_PANEL_BLOCKS = 6;     // panel width in block units
const PREVIEW_BLOCKSIZE = 18;       // px


// Pieces (tetrominoes + extras), rotated around a central cell
const BLOCKS_PER_TETROMINO = 4;
let N_BLOCK_TYPES = 9;
const WALL_KICK_OFFSETS = [[-1,0],[1,0],[-2,0],[2,0]];

// Color de las piezas: blanco (heredado)
let PIECE_COLOR = 0xFFFFFF;

// Colors for each piece shape (standard Tetris palette)
const TETROMINO_COLORS = {
  0: 0xFF8C00,  // L - Naranja
  1: 0x0066FF,  // J - Azul Oscuro
  2: 0x00FFFF,  // I - Cian
  3: 0xFFFF00,  // O - Amarillo
  4: 0x00CC00,  // S - Verde
  5: 0xCC00FF,  // T - Purple
  6: 0xFF0000,  // Z - Rojo
  7: 0x19C37D,  // Rectangulo 3x2 (6) - Verde agua
  8: 0xFF5E5B   // Serpiente larga (6) - Coral
};

function getTetrominoColor(shape) {
  return TETROMINO_COLORS[shape] || PIECE_COLOR;
}

// Scene grid values
const EMPTY = 0;
const FALLING = 1;
const OCCUPIED = 2;

function createBlockGraphic(color, size) {
  let g = game.add.graphics(0, 0);
  g.beginFill(color, 1);
  let m = 1;
  g.drawRect(m, m, size - 2 * m, size - 2 * m);
  g.endFill();
  return g;
}

const AUDIO_KEYS = {
  button1: 'Button1',
  button2: 'Button2',
  eating: 'Eating',
  splashMusic: 'Fondo1',
  gameMusicCrowd: 'Fondo2_Gente',
  gameMusicTrack: 'Fondo2_Musica',
  gameMusicLevel2: 'Fondo_Nivel2',
  gameMusicLevel3: 'Fondo_Nivel3',
  lose: 'Lose',
  pop: 'Pop',
  ticktock: 'Ticktock',
  noRotation: 'NoRotation'
};

const AUDIO_VOLUMES = {
  button1: 0.7,
  button2: 0.65,
  eating: 1,
  splashMusic: 0.2,
  gameMusicCrowd: 0.1,
  gameMusicTrack: 0.2,
  gameMusicLevel2: 2.2,
  gameMusicLevel3: 0.2,
  lose: 0.7,
  pop: 0.5,
  ticktock: 0.6,
  noRotation: 0.5
};

let audioBank = null;
let activeMusicKeys = [];

function ensureAudioBank() {
  if (audioBank || !game || !game.add) return audioBank;

  audioBank = {
    button1: game.add.audio(AUDIO_KEYS.button1, AUDIO_VOLUMES.button1),
    button2: game.add.audio(AUDIO_KEYS.button2, AUDIO_VOLUMES.button2),
    eating: game.add.audio(AUDIO_KEYS.eating, AUDIO_VOLUMES.eating),
    splashMusic: game.add.audio(AUDIO_KEYS.splashMusic, AUDIO_VOLUMES.splashMusic),
    gameMusicCrowd: game.add.audio(AUDIO_KEYS.gameMusicCrowd, AUDIO_VOLUMES.gameMusicCrowd),
    gameMusicTrack: game.add.audio(AUDIO_KEYS.gameMusicTrack, AUDIO_VOLUMES.gameMusicTrack),
    gameMusicLevel2: game.add.audio(AUDIO_KEYS.gameMusicLevel2, AUDIO_VOLUMES.gameMusicLevel2),
    gameMusicLevel3: game.add.audio(AUDIO_KEYS.gameMusicLevel3, AUDIO_VOLUMES.gameMusicLevel3),
    lose: game.add.audio(AUDIO_KEYS.lose, AUDIO_VOLUMES.lose),
    pop: game.add.audio(AUDIO_KEYS.pop, AUDIO_VOLUMES.pop),
    ticktock: game.add.audio(AUDIO_KEYS.ticktock, AUDIO_VOLUMES.ticktock),
    noRotation: game.add.audio(AUDIO_KEYS.noRotation, AUDIO_VOLUMES.noRotation)
  };

  return audioBank;
}

function getAudio(soundKey) {
  let bank = ensureAudioBank();
  return bank ? bank[soundKey] : null;
}

function playUiSound(soundKey) {
  let sound = getAudio(soundKey);

  if (sound) {
    sound.volume = AUDIO_VOLUMES[soundKey] || 1;
    sound.play();
  }
}

function stopMusic() {
  if (!activeMusicKeys.length) return;

  for (let i = 0; i < activeMusicKeys.length; i++) {
    let sound = getAudio(activeMusicKeys[i]);
    if (sound && sound.isPlaying) {
      sound.stop();
    }
  }

  activeMusicKeys = [];
}

function pauseMusic() {
  if (!activeMusicKeys.length) return;

  for (let i = 0; i < activeMusicKeys.length; i++) {
    let sound = getAudio(activeMusicKeys[i]);
    if (sound && sound.isPlaying) {
      sound.pause();
    }
  }
}

function resumeMusic() {
  if (!activeMusicKeys.length) return;

  for (let i = 0; i < activeMusicKeys.length; i++) {
    let sound = getAudio(activeMusicKeys[i]);
    if (sound && sound.paused) {
      sound.resume();
    }
  }
}

function playLoopingMusic(soundKeys) {
  ensureAudioBank();
  if (!audioBank) return;

  stopMusic();

  for (let i = 0; i < soundKeys.length; i++) {
    let sound = getAudio(soundKeys[i]);
    if (sound) {
      let volume = AUDIO_VOLUMES[soundKeys[i]] || 1;
      sound.volume = volume;
      sound.loopFull(volume);
    }
  }

  activeMusicKeys = soundKeys.slice(0);
}

function startSplashMusic() {
  playLoopingMusic(['splashMusic']);
}

function startGameMusic(levelConfig) {
  if (levelConfig && levelConfig.music) {
    playLoopingMusic(levelConfig.music);
  } else {
    playLoopingMusic(['gameMusicCrowd', 'gameMusicTrack']);
  }
}

function playLoseSound() {
  stopMusic();
  playUiSound('lose');
}

function playPopSound() {
  playUiSound('pop');
}

function playEatingSound() {
  playUiSound('eating');
}

class Tetris {
  constructor() {
    this.scene = [];
    this.sceneBlocks = [];
  }

  // Initialize the logical board grid and the reference grid for locked blocks.
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

  // Check whether a cell is inside the board and not occupied by locked blocks.
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

  // Draw the block using Phaser Graphics (no sprites), with a small margin
  // from the grid.
  renderBlock() {
    return createBlockGraphic(this.color, BLOCKSIZE);
  }

  create(c_x, c_y) {
    this.center = [c_x, c_y];

    let conflict = false;
    for (let i = 0; i < this.offsets[this.shape].length; i++) {
      let x = c_x + this.offsets[this.shape][i][0];
      let y = c_y + this.offsets[this.shape][i][1];

      let b = this.renderBlock();
      b.x = x * BLOCKSIZE;
      b.y = y * BLOCKSIZE;

      this.blocks.push(b);
      this.cells.push([x, y]);

      if (!this.tetris.validateCoordinates(x, y)) {
        conflict = true;
      } else {
        this.tetris.scene[x][y] = FALLING;
      }
    }
    return conflict;
  }

  // Check whether the piece can move or rotate without leaving the board or hitting occupied cells.
  canMove(coordFn, dir) {
    if (gameOverState) return false;
    for (let i = 0; i < this.cells.length; i++) {
      let nc = coordFn(i, dir);
      if (!this.tetris.validateCoordinates(nc[0], nc[1])) {
        return false;
      }
    }
    return true;
  }

  // Detect collision with left/right walls for a proposed movement.
  hitsSideWall(coordFn, dir) {
    for (let i = 0; i < this.cells.length; i++) {
      let nc = coordFn(i, dir);
      if (nc[0] < 0 || nc[0] >= NUMBLOCKS_X) {
        return true;
      }
    }
    return false;
  }

  // Compute a block's new coordinate when moving the piece in a direction.
  slide(block, dir) {
    return [this.cells[block][0] + move_offsets[dir][0],
    this.cells[block][1] + move_offsets[dir][1]];
  }

  // Compute a block's new coordinate after rotating around the center (classic rotation).
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

  // Apply the movement/rotation: update cells, graphics positions, and board state.
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

  // Compute the new rotation center position when moving the piece in a direction.
  slideCenter(dir) {
    return [this.center[0] + move_offsets[dir][0],
    this.center[1] + move_offsets[dir][1]];
  }
};


var gameState = {
  preload: function () {
    var levelKey = window.selectedLevelKey || 'level1';
    this.load.text(levelKey, 'assets/levels/' + levelKey + '.json');
  },
  create: resetGame,
  update: updateGame
};

let bg;

let boardWidth = NUMBLOCKS_X * BLOCKSIZE;
let gameWidth = boardWidth + (PREVIEW_PANEL_BLOCKS * BLOCKSIZE);
let gameHeight = NUMBLOCKS_Y * BLOCKSIZE;

let y_start = { 0: 1, 1: 1, 2: 0, 3: 1, 4: 1, 5: 0, 6: 1, 7: 1, 8: 1 };

let move_offsets = {
  left: [-1, 0],
  down: [0, 1],
  right: [1, 0]
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
let hudTime = null;
let FALL_DELAY = INITIAL_FALL_DELAY;
let MATCH_DURATION_MS = 100000;
let matchTimeLeftMs = MATCH_DURATION_MS;
let currentLevelConfig = null;
let SPEED_INITIAL_MS = INITIAL_FALL_DELAY;
let SPEED_MID_MS = Math.round(INITIAL_FALL_DELAY / 2);
let SPEED_MAX_MS = Math.round(INITIAL_FALL_DELAY / 4);

let timer, loop;
let currentMovementTimer = 0;
const WALL_SHAKE_COOLDOWN_MS = 120;
let lastWallShakeAt = 0;
const ROTATE_COOLDOWN_MS = 100;
let lastRotateAt = 0;

let hudPlayer = null;
let hudObjective = null;
let hudLines = null;
let hudScore = null;

let linesCompleted = 0;
let score = 0;

let comboCount = 0;
let comboExpiresAt = 0;
let comboLabel = null;
let comboTween = null;
let floatingBonusFlip = false;

const SCORE_BY_LINES = {
  1: 10,
  2: 20,
  3: 30,
  4: 40
};

const BONUS_MULTI_LINE = {
  2: 150,
  3: 300,
  4: 500
};

const COMBO_WINDOW_MS = 10000;
const COMBO_SHRINK_MS = 14000;
const COMBO_SCORE_STEP = 50;

function getPlayerName() {
  return localStorage.getItem('playerName') || window.playerName || 'Player';
}

function setupHUD() {
  hudPlayer = document.getElementById('hud-player');
  hudObjective = document.getElementById('hud-objective');
  hudLines = document.getElementById('hud-lines');
  hudScore = document.getElementById('hud-score');
  hudTime = document.getElementById('hud-time');

  if (!hudPlayer || !hudObjective || !hudLines || !hudScore || !hudTime) return;

  hudPlayer.onclick = function () {
    let proposedName = window.prompt('Introduce tu nombre', getPlayerName());
    if (proposedName === null) return;

    proposedName = proposedName.trim();
    if (proposedName === '') proposedName = 'Player';

    localStorage.setItem('playerName', proposedName);
    window.playerName = proposedName;
    updateHUD();
  };

  updateHUD();
}

function SetHudVisible(visible) {
  let hudOverlay = document.getElementById('hud-overlay');
  if (hudOverlay) {
    if (visible) {
      hudOverlay.style.display = 'flex';
    } else {
      hudOverlay.style.display = 'none';
    }
  }
}

function updateHUD() {
  if (hudPlayer) hudPlayer.textContent = 'PLAYER: ' + getPlayerName();
  if (hudObjective) hudObjective.textContent = 'OBJETIVO: ' + getCurrentObjective();
  if (hudLines) hudLines.textContent = 'LINES: ' + linesCompleted;
  if (hudScore) hudScore.textContent = 'SCORE: ' + score;
}

function getCurrentObjective() {
  if (currentLevelConfig && currentLevelConfig.objetivo) {
    return currentLevelConfig.objetivo;
  }

  return '-';
}

function addScoreForClearedLines(nLines) {
  if (nLines <= 0) return;
  let gained = SCORE_BY_LINES[nLines] || (800 + (nLines - 4) * 400);
  linesCompleted += nLines;
  score += gained;
  return gained;
}

function showFloatingBonusText(text, color) {
  floatingBonusFlip = !floatingBonusFlip;
  let yOffset = floatingBonusFlip ? -0.06 : 0.06;
  let baseY = gameHeight * (0.35 + yOffset);

  let t = game.add.text(
    boardWidth / 2,
    baseY,
    text,
    { font: '24px KyotoTitle', fill: color, align: 'center' }
  );
  t.anchor.set(0.5);
  t.alpha = 0.95;
  game.world.bringToTop(t);

  let tween = game.add.tween(t)
    .to({ y: t.y - 48, alpha: 0 }, 2600, Phaser.Easing.Linear.None);

  tween.onComplete.add(function () {
    t.destroy();
  });

  tween.start();
}

function showComboIndicator(multiplierText) {
  if (!comboLabel) {
    comboLabel = game.add.text(
      boardWidth / 2,
      gameHeight * 0.18,
      multiplierText,
      { font: '36px KyotoTitle', fill: '#ffffff', align: 'center' }
    );
    comboLabel.anchor.set(0.5);
  }

  comboLabel.text = multiplierText;
  comboLabel.alpha = 1;
  comboLabel.scale.set(1.5);
  game.world.bringToTop(comboLabel);

  if (comboTween) game.tweens.remove(comboTween);
  game.tweens.removeFrom(comboLabel.scale);
  comboTween = game.add.tween(comboLabel)
    .to({ alpha: 0, x: comboLabel.x, y: comboLabel.y, }, COMBO_WINDOW_MS, Phaser.Easing.Linear.None);

  let scaleTween = game.add.tween(comboLabel.scale)
    .to({ x: 0.6, y: 0.6 }, COMBO_SHRINK_MS, Phaser.Easing.Linear.None);

  comboTween.onComplete.add(function () {
    if (comboLabel) comboLabel.alpha = 0;
  });

  comboTween.start();
  scaleTween.start();
}

function handleComboBonus(nLines) {
  if (nLines <= 0) return 0;

  let now = game.time.now;
  if (now <= comboExpiresAt) {
    comboCount += nLines;
  } else {
    comboCount = nLines;
  }

  comboExpiresAt = now + COMBO_WINDOW_MS;

  let multiplierValue = comboCount * 10;
  showComboIndicator('x' + multiplierValue);
  return multiplierValue;
}

function handleMultiLineBonus(nLines) {
  let bonus = BONUS_MULTI_LINE[nLines] || 0;
  if (bonus > 0) {
    score += bonus;
  }
  return bonus;
}

function addTimeForClearedLines(nLines) {
  if (nLines <= 0) return 0;

  let bonusMs = nLines * 5000;
  matchTimeLeftMs += bonusMs;
  updateMatchTimerText();
  return bonusMs;
}

let bajado1 = false;
let bajado2 = false;
function updateMatchTimerText() {
  if (!hudTime) return;

  let secondsLeft = Math.max(0, Math.ceil(matchTimeLeftMs / 1000));
  if (secondsLeft <= (MATCH_DURATION_MS / 1000) / 2 && !bajado1) {
    FALL_DELAY = SPEED_MID_MS;
    timer.remove(loop);
    loop = timer.loop(FALL_DELAY, fall, this);
    bajado1 = true;
  } else if (secondsLeft <= (MATCH_DURATION_MS / 1000) / 4 && !bajado2) {
    FALL_DELAY = SPEED_MAX_MS;
    timer.remove(loop);
    loop = timer.loop(FALL_DELAY, fall, this);
    bajado2 = true;
  }
  if (secondsLeft <= 10 && secondsLeft > 0 && !ticktockPlaying) {
    let tt = getAudio('ticktock');
    if (tt) {
      tt.volume = AUDIO_VOLUMES.ticktock;
      tt.loopFull(AUDIO_VOLUMES.ticktock);
    }
    ticktockPlaying = true;
  }
  if (secondsLeft === 0 && ticktockPlaying) {
    let tt = getAudio('ticktock');
    if (tt && tt.isPlaying) tt.stop();
    ticktockPlaying = false;
  }
  hudTime.textContent = 'TIME: ' + secondsLeft;
}

function resetGame() {
  game.world.removeAll();

  var levelKey = window.selectedLevelKey;
  currentLevelConfig = JSON.parse(game.cache.getText(levelKey));

  startGameMusic(currentLevelConfig);
  document.body.style.background = "url('" + currentLevelConfig.backgroundImage + "') no-repeat center center / cover fixed";
  MATCH_DURATION_MS = currentLevelConfig.time * 1000;

  SPEED_INITIAL_MS = Number(currentLevelConfig.speedInitial);
  SPEED_MAX_MS = Number(currentLevelConfig.speedMax);
  SPEED_MID_MS = Math.round((SPEED_INITIAL_MS + SPEED_MAX_MS) / 2);

  console.log('Velocidad inicial: ' + SPEED_INITIAL_MS + 'ms');
  console.log('Velocidad media: ' + SPEED_MID_MS + 'ms');
  console.log('Velocidad máxima: ' + SPEED_MAX_MS + 'ms');

  if (currentLevelConfig.tetrominoOffsets) {
    TETROMINO_OFFSETS = currentLevelConfig.tetrominoOffsets;
    N_BLOCK_TYPES = Object.keys(TETROMINO_OFFSETS).length;
    console.log("length: " + N_BLOCK_TYPES);
  }

  if (hudObjective) {
    hudObjective.textContent = 'OBJETIVO: ' + getCurrentObjective();
  }

  // initialisation
  gameOverState = false;
  currentMovementTimer = 0;
  matchTimeLeftMs = MATCH_DURATION_MS;
  linesCompleted = 0;
  score = 0;
  comboCount = 0;
  comboExpiresAt = 0;
  if (comboLabel) {
    comboLabel.destroy();
    comboLabel = null;
  }
  comboTween = null;
  bajado1 = false;
  bajado2 = false;
  ticktockPlaying = false;
  let ttReset = getAudio('ticktock');
  if (ttReset && ttReset.isPlaying) ttReset.stop();
  window.scoreSaved = false;

  // Create Trellis and initialisation of its grid
  theTetris = new Tetris();
  theTetris.initGrid();

  bg = game.add.graphics(0, 0);
  bg.beginFill(0x111111, 1);
  bg.drawRect(0, 0, boardWidth, gameHeight);
  bg.endFill();
  bg.beginFill(0x1A1A1A, 1);
  bg.drawRect(boardWidth, 0, gameWidth - boardWidth, gameHeight);
  bg.endFill();
  bg.lineStyle(1, 0x1B1B1B, 1);
  for (let x = 0; x < NUMBLOCKS_X; x++) {
    bg.moveTo(x * BLOCKSIZE, 0);
    bg.lineTo(x * BLOCKSIZE, gameHeight);
  };
  for (let y = 0; y < NUMBLOCKS_Y; y++) {
    bg.moveTo(0, y * BLOCKSIZE);
    bg.lineTo(gameWidth, y * BLOCKSIZE);
  };

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
  setupHUD();
  SetHudVisible(true);
  updateHUD();

  updateMatchTimerText();

  // timer
  // IMPORTANTE: si venimos de un game over, el Timer andará pausado.
  // Hay que reanudarlo explícitamente, o la caída se queda a 0 (no cae nunca).
  timer = game.time.events;
  timer.removeAll();
  timer.resume();
  FALL_DELAY = SPEED_INITIAL_MS;
  loop = timer.loop(FALL_DELAY, fall, this);

  spawn();
};

// Tick de caída automática: intenta bajar la pieza, o la fija si ya no puede.
function fall() {
  if (gameOverState) return;
  if (tetromino.canMove(tetromino.slide.bind(tetromino), 'down')) {
    tetromino.move(tetromino.slide.bind(tetromino), tetromino.slideCenter.bind(tetromino), 'down');
  }
  else {
    // Tween de encaje justo al tocar fondo
    for (let i = 0; i < tetromino.blocks.length; i++) {
      game.add.tween(tetromino.blocks[i].scale)
        .to({ x: 1, y: 1 }, 20, Phaser.Easing.Linear.None)
        .to({ x: 1.05, y: 1.05 }, 20, Phaser.Easing.Linear.None)
        .start();
    }

    playPopSound();

    lockTetromino();
  }
};

// Crea una nueva pieza en la parte superior; si colisiona al aparecer, termina la partida.
function spawn() {
  let shape = nextShape;
  let color = getTetrominoColor(shape);

  tetromino = new Tetromino(shape, color, theTetris);

  nextShape = randomShape();
  updateNextPreview(nextShape);

  let start_x = Math.floor(NUMBLOCKS_X / 2);
  let start_y = y_start[tetromino.shape];
  let conflict = tetromino.create(start_x, start_y);
  fadeInTetromino();
  if (conflict) setGameOver(true);
};

//twen cuando aparece 
function fadeInTetromino() {
  for (let i = 0; i < tetromino.blocks.length; i++) {
    let bloque = tetromino.blocks[i];

    bloque.alpha = 0; // empieza invisible

    game.add.tween(bloque)
      .to({ alpha: 1 }, 200, Phaser.Easing.Linear.None)
      .start();
  }
}

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

    let g = createBlockGraphic(getTetrominoColor(shape), PREVIEW_BLOCKSIZE);
    g.x = px;
    g.y = py;

    previewBlocks.push(g);
  }
};

//tween gameover
function clearBoardTween() {
  // Bloques ya fijados en el tablero
  for (let x = 0; x < theTetris.sceneBlocks.length; x++) {
    for (let y = 0; y < theTetris.sceneBlocks[x].length; y++) {
      let bloque = theTetris.sceneBlocks[x][y];

      if (bloque) {
        game.add.tween(bloque)
          .to({ alpha: 0 }, 200, Phaser.Easing.Linear.None)
          .delay(x * 60)
          .start();
      }
    }
  }

  // Tetrominó actual que acaba de aparecer
  if (tetromino && tetromino.blocks) {
    for (let i = 0; i < tetromino.blocks.length; i++) {
      let bloque = tetromino.blocks[i];

      game.add.tween(bloque)
        .to({ alpha: 0 }, 200, Phaser.Easing.Linear.None)
        .delay(0)
        .start();
    }
  }
}

// Activa el estado de fin de partida y cambia al state HallFame.
function setGameOver(on) {
  gameOverState = on;
  if (gameOverState) {
    pausedState = false;
    timer.removeAll();
    SetHudVisible(false);

    playLoseSound();

    clearBoardTween();

    //para esperar a que termine
    game.time.events.add(800, function () {
      // Restaurar fondo estándar al salir
      document.body.style.background = "url('../assets/BG/fondoEstandar.png') no-repeat center center / cover fixed";
      game.state.start('HallFame');
    }, this);


  }
};

// Verifica si estamos en nivel 1 y hemos alcanzado 5000 puntos o más
function checkLevelObjective() {
  // Obtener el nivel actual
  let levelKey = window.selectedLevelKey;
  
  // Verificar si estamos en nivel 1
  if (levelKey == 'level1' && linesCompleted >= 2) {
    setGameOver(true);
  } else if( levelKey == 'level2' && score >= 1000 ) {
    setGameOver(true);
  } else return;
}

function togglePause() {
  if (gameOverState) return;

  pausedState = !pausedState;
  pauseLabel.visible = pausedState;
  game.world.bringToTop(pauseLabel);

  if (pausedState) {
    timer.pause();
    pauseMusic();
  } else {
    timer.resume();
    resumeMusic();
    currentMovementTimer = 0;
  }
};

// Intenta rotar la pieza; si choca con una pared, prueba pequeños desplazamientos laterales
// para "empujarla" hasta una posición válida antes de cancelar la rotación.

//tween colision
// Efecto shake cuando colisiona con la pared !!!ARREGLARLO PARA LLAMAR A LA FUNCIÓN correctamente con el wallkick)
function shakeBlocks() {
  if (game.time.now - lastWallShakeAt < WALL_SHAKE_COOLDOWN_MS) return;
  lastWallShakeAt = game.time.now;

  playUiSound('noRotation');

  for (let i = 0; i < tetromino.blocks.length; i++) {
    let bloque = tetromino.blocks[i];
    let originalX = tetromino.cells[i][0] * BLOCKSIZE;

    // Avoid stacking tweens and re-anchor to logical position to prevent visual drift.
    game.tweens.removeFrom(bloque);
    bloque.x = originalX;

    game.add.tween(bloque)
      .to({ x: originalX + 5 }, 50, Phaser.Easing.Linear.None)
      .to({ x: originalX - 5 }, 50, Phaser.Easing.Linear.None)
      .to({ x: originalX }, 50, Phaser.Easing.Linear.None)
      .start();
  }
}


function rotateWithWallKick(dir) {
  if (game.time.now - lastRotateAt < ROTATE_COOLDOWN_MS) return false;
  lastRotateAt = game.time.now;

  if (tetromino.canMove(tetromino.rotate.bind(tetromino), dir)) {
    tetromino.move(tetromino.rotate.bind(tetromino), null, dir);
    return true;
  }

  for (let i = 0; i < WALL_KICK_OFFSETS.length; i++) {
    let kick = WALL_KICK_OFFSETS[i];
    let kickX = kick[0];
    let kickY = kick[1];

    let kickedRotate = (block, d) => {
      let rotated = tetromino.rotate(block, d);
      return [rotated[0] + kickX, rotated[1] + kickY];
    };

    let kickedCenter = () => {
      return [tetromino.center[0] + kickX, tetromino.center[1] + kickY];
    };

    if (tetromino.canMove(kickedRotate, dir)) {
      tetromino.move(kickedRotate, kickedCenter, dir);
      return true;
    }
  }

  shakeBlocks();
  return false;
};


// Bucle de actualización para leer input y mover la pieza
function updateGame() {
  let pauseIsDown = keyPause.isDown;
  if (pauseIsDown && !pauseWasDown) {
    pauseWasDown = true;
    togglePause();
    return;
  }
  if (!pauseIsDown) pauseWasDown = false;

  if (pausedState || gameOverState) return;

  matchTimeLeftMs -= this.time.elapsed;
  if (matchTimeLeftMs <= 0) {
    matchTimeLeftMs = 0;
    updateMatchTimerText();
    setGameOver(true);
    return;
  }
  updateMatchTimerText();

  // Verificar si hemos alcanzado el objetivo del nivel
  checkLevelObjective();

  currentMovementTimer += this.time.elapsed;
  if (currentMovementTimer <= MOVEMENT_LAG) return;


  if (cursors.left.isDown) {
    if (tetromino.canMove(tetromino.slide.bind(tetromino), 'left')) {
      tetromino.move(tetromino.slide.bind(tetromino), tetromino.slideCenter.bind(tetromino), 'left');
    } else if (tetromino.hitsSideWall(tetromino.slide.bind(tetromino), 'left')) {
      shakeBlocks();
    }
  } else if (cursors.right.isDown) {
    if (tetromino.canMove(tetromino.slide.bind(tetromino), 'right')) {
      tetromino.move(tetromino.slide.bind(tetromino), tetromino.slideCenter.bind(tetromino), 'right');
    } else if (tetromino.hitsSideWall(tetromino.slide.bind(tetromino), 'right')) {
      shakeBlocks();
    }
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

//funcion brillo de lineas completas
function blinkLine(lineY, times) {
  for (let x = 0; x < NUMBLOCKS_X; x++) {
    let bloque = theTetris.sceneBlocks[x][lineY];

    if (bloque) {
      game.add.tween(bloque)
        .to({ alpha: 0.2 }, 80, Phaser.Easing.Linear.None)
        .to({ alpha: 0.6 }, 80, Phaser.Easing.Linear.None)
        .start();
    }
  }
}

// Revisa las filas tocadas por la pieza recién fijada y aplica limpieza/colapso/puntuación.
function checkLines(candidateLines) {
  let collapsed = [];

  for (let i = 0; i < candidateLines.length; i++) {
    let y = candidateLines[i];

    if (lineSum(y) == (NUMBLOCKS_X * OCCUPIED)) {
      collapsed.push(y);

      blinkLine(y);
    }
  }

  if (collapsed.length) {

    game.time.events.add(300, function () {
      for (let i = 0; i < collapsed.length; i++) {
        cleanLine(collapsed[i]);
      }

      collapse(collapsed);
      let basePoints = addScoreForClearedLines(collapsed.length) || 0;
      let bonusPoints = handleMultiLineBonus(collapsed.length) || 0;
      let totalPoints = basePoints + bonusPoints;
      let comboMultiplier = handleComboBonus(collapsed.length) || 0;
      if (comboMultiplier > 0) {
        let multiplierValue = comboMultiplier;
        let multipliedTotal = Math.floor(totalPoints * multiplierValue);
        let comboExtra = multipliedTotal - totalPoints;
        if (comboExtra > 0) score += comboExtra;
        totalPoints = multipliedTotal;
      }
      if (window.selectedLevelKey == 'level3') {
        addTimeForClearedLines(collapsed.length);
      }
      showFloatingBonusText('+' + totalPoints, '#ffdd00');
      updateHUD();
      playEatingSound();

    }, this);
  }
}

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
        theTetris.scene[x][yy] = theTetris.scene[x][yy - 1];
        theTetris.sceneBlocks[x][yy] = theTetris.sceneBlocks[x][yy - 1];
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
