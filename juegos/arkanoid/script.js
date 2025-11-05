document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("arkanoidCanvas");
  const ctx = canvas.getContext("2d");
  const scoreDisplay = document.getElementById("score");
  const livesDisplay = document.getElementById("lives");
  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const gameOverTitle = document.getElementById("gameOverTitle");
  const gameOverMessage = document.getElementById("gameOverMessage");
  const restartButton = document.getElementById("restartButton");
  // const slowSpeedButton = document.getElementById('slowSpeedButton'); // Eliminado: el botón de velocidad lenta

  // --- Constantes del Juego ---
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 15;
  const PADDLE_SPEED = 7;

  const BALL_RADIUS = 7;
  const INITIAL_BALL_SPEED = 3; // Velocidad de la bola ahora es fija

  const BRICK_WIDTH = 65;
  const BRICK_HEIGHT = 20;
  const BRICK_PADDING = 5;
  const BRICK_OFFSET_TOP = 30;
  const BRICK_OFFSET_LEFT = 20;

  const TOTAL_STAGES = 20; // Número total de etapas

  // --- Variables de Estado del Juego ---
  let gameRunning = false;
  let score = 0;
  let lives = 3;
  let currentStage = 0;
  let ballLaunched = false;
  let animationFrameId;

  let paddle = {
    x: (canvas.width - PADDLE_WIDTH) / 2,
    y: canvas.height - PADDLE_HEIGHT - 10,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 0,
  };

  let ball = {
    x: canvas.width / 2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    dx: 0,
    dy: 0,
    speed: INITIAL_BALL_SPEED, // La velocidad de la bola es solo la inicial
  };

  let bricks = [];

  // --- Definición de Etapas (Ladrillos) ---
  const stageLayouts = [
    // Etapa 1: Pared completa
    [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    // Etapa 2: Marco
    [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    // Etapa 3: Cruz
    [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
    // Etapa 4: Damero (ajedrez)
    [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
    ],
    // Etapa 5: Pirámide
    [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    // Etapa 6: Círculo (aproximado)
    [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
    // Etapa 7: Dos columnas centrales
    [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
    // Etapa 8: Vacío central
    [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    // Etapa 9: Escalera derecha
    [
      [1, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 0, 0, 0],
    ],
    // Etapa 10: Escalera izquierda
    [
      [0, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 0, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 1, 1],
    ],
    // Etapa 11: Dos marcos anidados
    [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    // Etapa 12: Corazón (aproximado)
    [
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
    // Etapa 13: Barras verticales
    [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
    ],
    // Etapa 14: Barras horizontales
    [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    // Etapa 15: Diamante
    [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
    // Etapa 16: Diagonales opuestas
    [
      [1, 0, 0, 0, 0, 0, 0, 1],
      [0, 1, 0, 0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0], // Última fila vacía o con solo un par de ladrillos
    ],
    // Etapa 17: Muro central
    [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    // Etapa 18: Ladrillos dispersos
    [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
    ],
    // Etapa 19: Cuadrados
    [
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
    ],
    // Etapa 20: El "20"
    [
      [1, 1, 1, 1, 0, 1, 1, 1],
      [0, 0, 0, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 1, 0, 0],
      [1, 1, 1, 1, 0, 1, 1, 1],
    ],
  ];

  // --- Funciones de Dibujo ---
  function drawPaddle() {
    ctx.fillStyle = "#61dafb";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#f8f8f2";
    ctx.fill();
    ctx.closePath();
  }

  function drawBricks() {
    bricks.forEach((column) => {
      column.forEach((brick) => {
        if (brick.status === 1) {
          ctx.fillStyle = brick.color;
          ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
          ctx.strokeStyle = "#1a1e24";
          ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        }
      });
    });
  }

  // --- Lógica del Juego ---
  function createBricksForStage(stageNum) {
    bricks = [];
    const layout = stageLayouts[stageNum - 1];
    if (!layout) {
      console.error("Layout de etapa no encontrado:", stageNum);
      return;
    }

    const BRICK_ROW_COUNT = layout.length;
    const BRICK_COLUMN_COUNT = layout[0].length;

    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      bricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
        const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;

        bricks[c][r] = {
          x: brickX,
          y: brickY,
          status: layout[r][c],
          color: ["#e74c3c", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6"][r % 5], // Colores por fila
        };
      }
    }
  }

  function update() {
    if (!gameRunning) return;

    paddle.x += paddle.dx;
    if (paddle.x < 0) {
      paddle.x = 0;
    } else if (paddle.x + paddle.width > canvas.width) {
      paddle.x = canvas.width - paddle.width;
    }

    if (ballLaunched) {
      ball.x += ball.dx;
      ball.y += ball.dy;
    } else {
      ball.x = paddle.x + paddle.width / 2;
      ball.y = paddle.y - ball.radius;
    }

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
      ball.dx *= -1;
    }
    if (ball.y - ball.radius < 0) {
      ball.dy *= -1;
    }

    if (ball.y + ball.radius > canvas.height) {
      lives--;
      livesDisplay.textContent = lives;
      if (lives === 0) {
        endGame(false);
      } else {
        resetBallAndPaddle();
      }
    }

    if (
      ball.y + ball.radius > paddle.y &&
      ball.x - ball.radius < paddle.x + paddle.width &&
      ball.x + ball.radius > paddle.x &&
      ball.y < paddle.y + paddle.height
    ) {
      const hitPoint =
        (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      const bounceAngle = hitPoint * (Math.PI / 3);

      ball.dx = ball.speed * Math.sin(bounceAngle);
      ball.dy = -ball.speed * Math.cos(bounceAngle);

      ball.y = paddle.y - ball.radius;
    }

    let bricksRemaining = 0;
    bricks.forEach((column) => {
      column.forEach((brick) => {
        if (brick.status === 1) {
          bricksRemaining++;
          if (
            ball.x + ball.radius > brick.x &&
            ball.x - ball.radius < brick.x + BRICK_WIDTH &&
            ball.y + ball.radius > brick.y &&
            ball.y - ball.radius < brick.y + BRICK_HEIGHT
          ) {
            ball.dy *= -1;
            brick.status = 0;
            score += 10;
            scoreDisplay.textContent = score;
          }
        }
      });
    });

    if (bricksRemaining === 0) {
      currentStage++;
      if (currentStage <= TOTAL_STAGES) {
        resetBallAndPaddle();
        createBricksForStage(currentStage);
      } else {
        endGame(true);
      }
    }
  }

  function resetBallAndPaddle() {
    ball.x = canvas.width / 2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 0;
    ball.dy = 0;
    ballLaunched = false;
    paddle.x = (canvas.width - PADDLE_WIDTH) / 2;
    paddle.dx = 0;

    ball.speed = INITIAL_BALL_SPEED;
  }

  // --- Bucle Principal del Juego ---
  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPaddle();
    drawBall();
    drawBricks();

    update();

    if (gameRunning) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  // --- Control de Flujo del Juego ---
  function initGame() {
    score = 0;
    lives = 3;
    currentStage = 1;
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;

    createBricksForStage(currentStage);
    resetBallAndPaddle();

    gameRunning = true;
    ballLaunched = false;

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    // slowSpeedButton.classList.remove('hidden'); // Eliminado: el botón de velocidad lenta

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function endGame(win) {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);

    gameOverScreen.classList.remove("hidden");
    // slowSpeedButton.classList.add('hidden'); // Eliminado: el botón de velocidad lenta
    if (win) {
      gameOverTitle.textContent = "¡GANASTE EL JUEGO!";
      gameOverTitle.style.color = "#2ecc71";
      gameOverMessage.textContent = `¡Felicidades! Completaste todas las ${TOTAL_STAGES} etapas. Tu puntuación final: ${score}`;
    } else {
      gameOverTitle.textContent = "¡Juego Terminado!";
      gameOverTitle.style.color = "#e74c3c";
      gameOverMessage.textContent = `Te quedaste sin vidas. Tu puntuación final: ${score}`;
    }
  }

  // --- Manejo de la Entrada del Teclado ---
  document.addEventListener("keydown", (e) => {
    if (!gameRunning) {
      if (
        e.code === "Space" &&
        !ballLaunched &&
        startScreen.classList.contains("hidden")
      ) {
        launchBall();
      }
      return;
    }

    if (e.key === "ArrowLeft") {
      paddle.dx = -PADDLE_SPEED;
    } else if (e.key === "ArrowRight") {
      paddle.dx = PADDLE_SPEED;
    } else if (e.code === "Space" && !ballLaunched) {
      launchBall();
    }
  });

  document.addEventListener("keyup", (e) => {
    if (!gameRunning) return;

    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      paddle.dx = 0;
    }
  });

  function launchBall() {
    if (!ballLaunched) {
      ballLaunched = true;
      ball.dx =
        (Math.random() > 0.5 ? 1 : -1) * ball.speed * Math.sin(Math.PI / 4);
      ball.dy = -ball.speed * Math.cos(Math.PI / 4);
    }
  }

  // --- ELIMINADA: Función para Reducir la Velocidad de la Bola ---
  // function slowDownBall() { ... }

  // --- Event Listeners para los botones de la UI ---
  startButton.addEventListener("click", initGame);
  restartButton.addEventListener("click", initGame);
  // slowSpeedButton.addEventListener('click', slowDownBall); // Eliminado: el botón de velocidad lenta

  // Inicializa el estado visual del juego al cargar la página
  drawPaddle();
  drawBall();
  // slowSpeedButton.classList.add('hidden'); // Eliminado: el botón de velocidad lenta
});
