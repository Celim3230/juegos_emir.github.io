document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("tetrisCanvas");
  const ctx = canvas.getContext("2d");
  const nextPieceCanvas = document.getElementById("nextPieceCanvas");
  const nextCtx = nextPieceCanvas.getContext("2d");

  const scoreDisplay = document.getElementById("score");
  const linesDisplay = document.getElementById("lines");
  const levelDisplay = document.getElementById("level");

  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");
  const pauseScreen = document.getElementById("pauseScreen");
  const resumeButton = document.getElementById("resumeButton");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const gameOverTitle = document.getElementById("gameOverTitle");
  const gameOverMessage = document.getElementById("gameOverMessage");
  const restartButton = document.getElementById("restartButton");

  // --- Constantes del Juego ---
  const COLS = 10; // Columnas del tablero
  const ROWS = 20; // Filas del tablero
  const BLOCK_SIZE = canvas.width / COLS; // Tamaño de cada bloque en píxeles

  const EMPTY_COLOR = "#000000"; // Color de celda vacía
  const GHOST_COLOR_ALPHA = "rgba(255, 255, 255, 0.2)"; // Color de la pieza fantasma

  // Definición de las piezas de Tetris y sus colores
  // Las formas son matrices 4x4 (la pieza 'O' es 2x2, pero se dibuja en un espacio de 4x4)
  const TETROMINOES = {
    I: {
      shape: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      color: "cyan",
    },
    J: {
      shape: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      color: "blue",
    },
    L: {
      shape: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      color: "orange",
    },
    O: {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: "yellow",
    },
    S: {
      shape: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      color: "lime",
    },
    T: {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      color: "purple",
    },
    Z: {
      shape: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      color: "red",
    },
  };
  const PIECE_NAMES = ["I", "J", "L", "O", "S", "T", "Z"];

  // --- Variables de Estado del Juego ---
  let board = []; // Matriz del tablero de juego
  let currentPiece; // Pieza activa actualmente
  let nextPiece; // Siguiente pieza
  let score = 0;
  let lines = 0;
  let level = 1;
  let dropInterval; // Intervalo de caída automática (ms)
  let gameLoopId; // ID del setInterval para el bucle de caída
  let gameRunning = false;
  let paused = false;

  // --- Funciones de Utilidad ---

  // Inicializa el tablero con celdas vacías
  function createBoard() {
    board = Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(EMPTY_COLOR));
  }

  // Elige una pieza aleatoria
  function getRandomPiece() {
    const name = PIECE_NAMES[Math.floor(Math.random() * PIECE_NAMES.length)];
    return {
      name: name,
      shape: TETROMINOES[name].shape,
      color: TETROMINOES[name].color,
      x:
        Math.floor(COLS / 2) -
        Math.floor(TETROMINOES[name].shape[0].length / 2),
      y: 0, // Inicia en la parte superior
      rotation: 0, // Rotación actual (0-3)
    };
  }

  // Dibuja un solo bloque
  function drawBlock(x, y, color, context = ctx) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }

  // Dibuja el tablero
  function drawBoard() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        drawBlock(c, r, board[r][c]);
      }
    }
  }

  // Dibuja la pieza actual
  function drawPiece(
    piece,
    context = ctx,
    offsetX = 0,
    offsetY = 0,
    color = piece.color
  ) {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          // Si hay un bloque en esta parte de la forma
          drawBlock(
            piece.x + c + offsetX,
            piece.y + r + offsetY,
            color,
            context
          );
        }
      }
    }
  }

  // Dibuja la pieza fantasma (donde caerá la pieza actual)
  function drawGhostPiece() {
    let ghostY = currentPiece.y;
    while (!checkCollision(currentPiece.x, ghostY + 1, currentPiece.shape)) {
      ghostY++;
    }
    // Crear una pieza fantasma temporal para dibujarla
    const ghostPiece = {
      x: currentPiece.x,
      y: ghostY,
      shape: currentPiece.shape,
      color: GHOST_COLOR_ALPHA, // Color semi-transparente
    };
    drawPiece(ghostPiece);
  }

  // Dibuja la siguiente pieza en su propio canvas
  function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    // Ajustar posición para centrar la pieza en el canvas pequeño
    const shapeWidth = nextPiece.shape[0].length;
    const shapeHeight = nextPiece.shape.length;
    const startX = Math.floor(
      (nextPieceCanvas.width / BLOCK_SIZE - shapeWidth) / 2
    );
    const startY = Math.floor(
      (nextPieceCanvas.height / BLOCK_SIZE - shapeHeight) / 2
    );

    for (let r = 0; r < shapeHeight; r++) {
      for (let c = 0; c < shapeWidth; c++) {
        if (nextPiece.shape[r][c]) {
          drawBlock(startX + c, startY + r, nextPiece.color, nextCtx);
        }
      }
    }
  }

  // Comprueba si una pieza en una posición y forma dadas colisionaría
  function checkCollision(x, y, shape) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          // Si es un bloque de la pieza
          const boardX = x + c;
          const boardY = y + r;

          // Colisión con los límites del tablero o con bloques existentes
          if (
            boardX < 0 ||
            boardX >= COLS ||
            boardY >= ROWS ||
            (boardY >= 0 && board[boardY][boardX] !== EMPTY_COLOR)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Rota la forma de la pieza (90 grados en sentido horario)
  function rotateMatrix(matrix) {
    const N = matrix.length;
    const rotated = Array(N)
      .fill(null)
      .map(() => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        rotated[j][N - 1 - i] = matrix[i][j];
      }
    }
    return rotated;
  }

  // Mueve la pieza actual si no hay colisión
  function movePiece(dx, dy) {
    if (
      !checkCollision(
        currentPiece.x + dx,
        currentPiece.y + dy,
        currentPiece.shape
      )
    ) {
      currentPiece.x += dx;
      currentPiece.y += dy;
      return true;
    }
    return false;
  }

  // Rota la pieza actual con verificación de colisión (simple wall kick)
  function rotatePiece() {
    const originalShape = currentPiece.shape;
    const rotatedShape = rotateMatrix(originalShape);

    // Intentar rotar en la posición actual
    if (!checkCollision(currentPiece.x, currentPiece.y, rotatedShape)) {
      currentPiece.shape = rotatedShape;
      return;
    }

    // Intentar con "wall kicks" básicos
    const kicks = [
      [0, 0], // Sin kick
      [-1, 0], // Mover izquierda
      [1, 0], // Mover derecha
      [0, -1], // Mover abajo (raro pero posible en SRS para I)
      [-2, 0], // Mover doble izquierda (para I)
      [2, 0], // Mover doble derecha (para I)
    ];

    for (const [ox, oy] of kicks) {
      if (
        !checkCollision(currentPiece.x + ox, currentPiece.y + oy, rotatedShape)
      ) {
        currentPiece.x += ox;
        currentPiece.y += oy;
        currentPiece.shape = rotatedShape;
        return;
      }
    }
  }

  // Bloquea la pieza en el tablero
  function lockPiece() {
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c]) {
          if (currentPiece.y + r < 0) {
            // Pieza bloqueada por encima del tablero (Game Over)
            endGame();
            return;
          }
          board[currentPiece.y + r][currentPiece.x + c] = currentPiece.color;
        }
      }
    }
    clearLines(); // Intentar limpiar líneas después de bloquear
    spawnNewPiece(); // Generar la siguiente pieza
  }

  // Limpia líneas completas
  function clearLines() {
    let linesClearedThisTurn = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every((cell) => cell !== EMPTY_COLOR)) {
        // Si la fila está llena
        board.splice(r, 1); // Eliminar la fila
        board.unshift(Array(COLS).fill(EMPTY_COLOR)); // Añadir una nueva fila vacía en la parte superior
        linesClearedThisTurn++;
        r++; // Re-verificar la misma fila (ahora con los bloques de arriba)
      }
    }
    if (linesClearedThisTurn > 0) {
      updateScore(linesClearedThisTurn);
    }
  }

  // Actualiza la puntuación y el nivel
  function updateScore(numLinesCleared) {
    const scores = [0, 100, 300, 500, 800]; // Puntuación para 0, 1, 2, 3, 4 líneas
    score += scores[numLinesCleared] * level;
    lines += numLinesCleared;

    if (lines >= level * 10) {
      // Aumentar nivel cada 10 líneas (ajustable)
      level++;
      updateDropSpeed();
    }

    scoreDisplay.textContent = score;
    linesDisplay.textContent = lines;
    levelDisplay.textContent = level;
  }

  // Ajusta la velocidad de caída según el nivel
  function updateDropSpeed() {
    clearInterval(gameLoopId);
    // Velocidad de caída más rápida a medida que sube el nivel (en ms)
    dropInterval = Math.max(50, 1000 - (level - 1) * 70);
    gameLoopId = setInterval(dropPiece, dropInterval);
  }

  // La pieza cae un bloque automáticamente
  function dropPiece() {
    if (!movePiece(0, 1)) {
      // Si no puede moverse hacia abajo
      lockPiece(); // Bloquear la pieza
    }
  }

  // Genera una nueva pieza
  function spawnNewPiece() {
    currentPiece = nextPiece;
    nextPiece = getRandomPiece();
    drawNextPiece(); // Actualiza la visualización de la siguiente pieza

    // Comprobar Game Over al aparecer la nueva pieza
    if (checkCollision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
      endGame();
    }
  }

  // --- Bucle Principal de Renderizado ---
  function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    if (gameRunning && !paused) {
      drawGhostPiece(); // Dibuja la pieza fantasma solo si el juego está activo y no pausado
      drawPiece(currentPiece);
    }
    requestAnimationFrame(renderGame); // Sigue renderizando
  }

  // --- Control de Flujo del Juego ---
  function initGame() {
    gameRunning = true;
    paused = false;
    score = 0;
    lines = 0;
    level = 1;
    scoreDisplay.textContent = score;
    linesDisplay.textContent = lines;
    levelDisplay.textContent = level;

    createBoard();
    currentPiece = getRandomPiece();
    nextPiece = getRandomPiece();
    drawNextPiece();

    startScreen.classList.add("hidden");
    pauseScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    updateDropSpeed(); // Inicia el bucle de caída
    renderGame(); // Inicia el bucle de renderizado
  }

  function endGame() {
    gameRunning = false;
    clearInterval(gameLoopId);
    gameOverScreen.classList.remove("hidden");
    gameOverMessage.textContent = `¡Tu puntuación final: ${score} en Nivel ${level}!`;
  }

  function togglePause() {
    if (!gameRunning) return;

    paused = !paused;
    if (paused) {
      clearInterval(gameLoopId);
      pauseScreen.classList.remove("hidden");
    } else {
      updateDropSpeed(); // Reanuda el intervalo de caída
      pauseScreen.classList.add("hidden");
    }
  }

  // --- Manejo de Teclado ---
  document.addEventListener("keydown", (e) => {
    if (!gameRunning && e.code !== "Space" && e.code !== "Enter") return; // Solo permitir iniciar/reiniciar si no está corriendo

    if (paused && e.code !== "Escape") return; // Solo permitir Escape para despausar

    switch (e.code) {
      case "ArrowLeft":
        if (gameRunning && !paused) movePiece(-1, 0);
        break;
      case "ArrowRight":
        if (gameRunning && !paused) movePiece(1, 0);
        break;
      case "ArrowDown":
        if (gameRunning && !paused) {
          if (movePiece(0, 1)) {
            score += 1; // Puntos por caída suave
            scoreDisplay.textContent = score;
          }
        }
        break;
      case "ArrowUp":
        if (gameRunning && !paused) rotatePiece();
        break;
      case "Space": // Hard drop
        if (gameRunning && !paused) {
          let landed = false;
          while (movePiece(0, 1)) {
            score += 2; // Más puntos por hard drop
            landed = true;
          }
          if (landed) {
            // Solo si se movió al menos una vez
            scoreDisplay.textContent = score;
            lockPiece();
          }
        } else if (!gameRunning && e.target === startButton) {
          // Si el juego no está corriendo y la tecla es espacio, y el foco está en el botón de inicio
          startButton.click();
        }
        break;
      case "Escape": // Pausar/despausar
        togglePause();
        break;
    }
    e.preventDefault(); // Prevenir el desplazamiento de la página
  });

  // --- Event Listeners para los botones de la UI ---
  startButton.addEventListener("click", initGame);
  resumeButton.addEventListener("click", togglePause);
  restartButton.addEventListener("click", initGame);

  // Dibuja el tablero vacío al cargar la página
  createBoard();
  drawBoard();
});
