document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreDisplay = document.getElementById("score");
  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const finalScoreDisplay = document.getElementById("finalScore");
  const restartButton = document.getElementById("restartButton");

  // --- Constantes del Juego ---
  const GROUND_Y = canvas.height - 20; // Posición Y del suelo
  const DINO_WIDTH = 40;
  const DINO_HEIGHT = 60;
  const DINO_X = 50; // Posición X del dinosaurio (fija)
  const JUMP_STRENGTH = -10; // Fuerza del salto (negativo para ir hacia arriba)
  const GRAVITY = 0.4; // Gravedad que tira al dino hacia abajo
  const OBSTACLE_WIDTH = 20;
  const OBSTACLE_MIN_HEIGHT = 30;
  const OBSTACLE_MAX_HEIGHT = 60;

  const INITIAL_GAME_SPEED = 5; // Velocidad inicial del juego
  const MAX_GAME_SPEED = 15; // Velocidad máxima del juego
  const SPEED_INCREMENT_INTERVAL = 100; // Cada cuántos puntos aumenta la velocidad
  const SPEED_INCREMENT_AMOUNT = 0.5; // Cuánto aumenta la velocidad cada vez

  // Rango de distancia horizontal (en píxeles) entre obstáculos
  const OBSTACLE_MIN_GAP = 250;
  const OBSTACLE_MAX_GAP = 550;

  const SCORE_MULTIPLIER = 0.1; // Para que la puntuación no suba demasiado rápido

  // --- Variables de Estado del Juego ---
  let gameRunning = false;
  let score = 0;
  let GAME_SPEED = INITIAL_GAME_SPEED; // Velocidad actual del juego
  let lastScoreSpeedIncrease = 0; // Para controlar cuándo aumentar la velocidad
  let nextObstacleGap = 0; // Distancia para el próximo obstáculo

  let dino = {
    x: DINO_X,
    y: GROUND_Y - DINO_HEIGHT,
    width: DINO_WIDTH,
    height: DINO_HEIGHT,
    dy: 0, // Velocidad vertical del dino (para saltar)
    isJumping: false,
  };
  let obstacles = []; // Array para almacenar los obstáculos
  let animationFrameId; // ID del frame de animación para poder cancelarlo

  // --- Funciones de Dibujo ---

  // Dibuja el fondo y el suelo
  function drawBackground() {
    ctx.fillStyle = "#f7f7f7"; // Color de fondo del cielo
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar el suelo
    ctx.fillStyle = "#666666"; // Color del suelo
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
  }

  // Dibuja el dinosaurio
  function drawDino() {
    ctx.fillStyle = "#555555"; // Color del dinosaurio
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
  }

  // Dibuja un obstáculo
  function drawObstacle(obstacle) {
    ctx.fillStyle = "#4CAF50"; // Color de los obstáculos (verde cactus)
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }

  // --- Lógica del Juego ---

  // Actualiza el estado del juego (movimiento, colisiones, puntuación)
  function update() {
    if (!gameRunning) return;

    // --- Movimiento del Dinosaurio ---
    dino.dy += GRAVITY; // Aplicar gravedad
    dino.y += dino.dy;

    // Asegurarse de que el dino no caiga por debajo del suelo
    if (dino.y + dino.height > GROUND_Y) {
      dino.y = GROUND_Y - dino.height;
      dino.dy = 0;
      dino.isJumping = false; // El dino ha aterrizado
    }

    // --- Aumentar Velocidad del Juego ---
    if (
      Math.floor(score) - lastScoreSpeedIncrease >=
      SPEED_INCREMENT_INTERVAL
    ) {
      if (GAME_SPEED < MAX_GAME_SPEED) {
        GAME_SPEED += SPEED_INCREMENT_AMOUNT;
        lastScoreSpeedIncrease = Math.floor(score); // Actualizar el punto de referencia
      }
    }

    // --- Generación de Obstáculos ---
    // Si no hay obstáculos o el último obstáculo ha avanzado lo suficiente
    if (
      obstacles.length === 0 ||
      canvas.width - obstacles[obstacles.length - 1].x >= nextObstacleGap
    ) {
      spawnObstacle();
      // Calcular una nueva distancia aleatoria para el próximo obstáculo
      nextObstacleGap =
        Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP) +
        OBSTACLE_MIN_GAP;
    }

    // --- Movimiento y Dibujo de Obstáculos ---
    // Usamos un bucle for tradicional porque modificamos el array (splice)
    for (let i = 0; i < obstacles.length; i++) {
      let obstacle = obstacles[i];
      obstacle.x -= GAME_SPEED; // Mover el obstáculo hacia la izquierda
      drawObstacle(obstacle); // Dibujar el obstáculo

      // --- Detección de Colisiones ---
      if (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
      ) {
        gameOver(); // Colisión detectada, terminar juego
        return; // Salir de la función update para evitar más lógica
      }

      // --- Eliminar obstáculos fuera de pantalla ---
      if (obstacle.x + obstacle.width < 0) {
        obstacles.splice(i, 1); // Eliminar el obstáculo del array
        i--; // Ajustar el índice para no saltarse el siguiente elemento
      }
    }

    // --- Actualizar Puntuación ---
    score += SCORE_MULTIPLIER;
    scoreDisplay.textContent = Math.floor(score); // Mostrar puntuación entera
  }

  // Genera un nuevo obstáculo en la posición de inicio
  function spawnObstacle() {
    const obstacleHeight =
      Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT) +
      OBSTACLE_MIN_HEIGHT;
    obstacles.push({
      x: canvas.width, // Empezar fuera de la pantalla a la derecha
      y: GROUND_Y - obstacleHeight,
      width: OBSTACLE_WIDTH,
      height: obstacleHeight,
    });
  }

  // Realiza el salto del dinosaurio
  function jump() {
    if (!dino.isJumping) {
      dino.dy = JUMP_STRENGTH; // Aplicar fuerza de salto
      dino.isJumping = true;
    }
  }

  // --- Bucle Principal del Juego ---
  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
    drawBackground(); // Dibujar fondo y suelo
    drawDino(); // Dibujar dinosaurio
    update(); // Actualizar lógica del juego

    if (gameRunning) {
      animationFrameId = requestAnimationFrame(gameLoop); // Continuar el bucle
    }
  }

  // --- Control de Flujo del Juego ---

  // Inicializa todos los valores para empezar un juego nuevo
  function initGame() {
    gameRunning = true;
    score = 0;
    scoreDisplay.textContent = 0;
    GAME_SPEED = INITIAL_GAME_SPEED; // Reiniciar velocidad
    lastScoreSpeedIncrease = 0; // Reiniciar contador de velocidad

    dino.y = GROUND_Y - DINO_HEIGHT; // Posición inicial del dino
    dino.dy = 0;
    dino.isJumping = false;
    obstacles = []; // Limpiar obstáculos
    nextObstacleGap =
      Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP) + OBSTACLE_MIN_GAP; // Generar primer gap

    startScreen.classList.add("hidden"); // Ocultar pantalla de inicio
    gameOverScreen.classList.add("hidden"); // Ocultar pantalla de Game Over

    animationFrameId = requestAnimationFrame(gameLoop); // Iniciar el bucle de juego
  }

  // Termina el juego
  function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId); // Detener el bucle de animación
    finalScoreDisplay.textContent = Math.floor(score); // Mostrar puntuación final
    gameOverScreen.classList.remove("hidden"); // Mostrar pantalla de Game Over
  }

  // --- Event Listeners ---

  // Saltar con la barra espaciadora o flecha arriba
  document.addEventListener("keydown", (e) => {
    if (gameRunning && (e.code === "Space" || e.code === "ArrowUp")) {
      e.preventDefault(); // Prevenir el desplazamiento de la página con la barra espaciadora
      jump();
    }
  });

  startButton.addEventListener("click", initGame);
  restartButton.addEventListener("click", initGame);

  // Dibuja el estado inicial (pantalla de inicio)
  drawBackground();
  drawDino(); // Dibuja el dino en la pantalla de inicio
});
