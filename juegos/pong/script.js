document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("pongCanvas");
  const ctx = canvas.getContext("2d");
  const player1ScoreElem = document.getElementById("player1Score");
  const player2ScoreElem = document.getElementById("player2Score");
  const speedInput = document.getElementById("speedInput");
  const startButton = document.getElementById("startButton");
  const resetGameButton = document.getElementById("resetGameButton"); // Botón de reiniciar durante el juego
  const gameOverMessage = document.getElementById("gameOverMessage");
  const winnerMessage = document.getElementById("winnerMessage");
  const finalRestartButton = document.getElementById("finalRestartButton"); // Botón de reiniciar desde Game Over

  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 80;
  const BALL_SIZE = 10;
  const WINNING_SCORE = 5;

  let gameSpeed = 5; // Velocidad inicial de la bola, se actualizará desde el input
  let gameRunning = false; // Estado del juego (true: jugando, false: pausado/terminado)
  let animationFrameId; // Para almacenar el ID del requestAnimationFrame

  let player1 = {
    x: 0,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0, // Velocidad de movimiento de la paleta
    score: 0,
  };

  let player2 = {
    x: canvas.width - PADDLE_WIDTH,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0, // Velocidad de movimiento de la paleta
    score: 0,
  };

  let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: gameSpeed, // Velocidad inicial en X, se actualizará
    dy: gameSpeed, // Velocidad inicial en Y, se actualizará
  };

  // --- Funciones de Dibujo ---
  function draw() {
    // Fondo del canvas
    ctx.fillStyle = "#1a1e24";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Paletas
    ctx.fillStyle = "#61dafb"; // Color de las paletas
    ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
    ctx.fillRect(player2.x, player2.y, player2.width, player2.height);

    // Bola
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fillStyle = "#f8f8f2"; // Color de la bola
    ctx.fill();
    ctx.closePath();
  }

  // --- Lógica del Juego (Actualización de estados) ---
  function update() {
    if (!gameRunning) return;

    player1.y += player1.dy;
    player2.y += player2.dy;

    player1.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, player1.y));
    player2.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, player2.y));

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
      ball.dy *= -1;
    }

    if (
      ball.dx < 0 &&
      ball.x - ball.size < player1.x + player1.width &&
      ball.y > player1.y &&
      ball.y < player1.y + player1.height
    ) {
      ball.dx *= -1;
      ball.x = player1.x + player1.width + ball.size;
    }

    if (
      ball.dx > 0 &&
      ball.x + ball.size > player2.x &&
      ball.y > player2.y &&
      ball.y < player2.y + player2.height
    ) {
      ball.dx *= -1;
      ball.x = player2.x - ball.size;
    }

    if (ball.x - ball.size < 0) {
      player2.score++;
      player2ScoreElem.textContent = player2.score;
      if (player2.score >= WINNING_SCORE) {
        endGame("¡Jugador 2 gana!");
      } else {
        resetBall();
      }
    } else if (ball.x + ball.size > canvas.width) {
      player1.score++;
      player1ScoreElem.textContent = player1.score;
      if (player1.score >= WINNING_SCORE) {
        endGame("¡Jugador 1 gana!");
      } else {
        resetBall();
      }
    }
  }

  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = gameSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = gameSpeed * (Math.random() > 0.5 ? 1 : -1);
  }

  // --- Bucle principal del juego ---
  function gameLoop() {
    update();
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // --- Funciones de control de la UI y el estado del juego ---

  // Función para llevar la UI al estado inicial de configuración
  function resetToSetupScreen() {
    gameRunning = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId); // Detener cualquier bucle de juego activo

    // Resetear puntuaciones en la UI
    player1.score = 0;
    player2.score = 0;
    player1ScoreElem.textContent = player1.score;
    player2ScoreElem.textContent = player2.score;

    // Resetear posiciones de las paletas
    player1.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    player2.y = canvas.height / 2 - PADDLE_HEIGHT / 2;

    // Resetear la bola a su posición central sin movimiento
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 0; // Detener movimiento
    ball.dy = 0; // Detener movimiento

    draw(); // Dibujar el canvas en su estado inicial (vacío, con paletas y bola en el centro)

    // Mostrar/ocultar elementos de la UI
    startButton.classList.remove("hidden"); // Mostrar botón de inicio
    speedInput.disabled = false; // Habilitar input de velocidad
    resetGameButton.classList.add("hidden"); // Ocultar botón de reiniciar durante el juego
    gameOverMessage.classList.add("hidden"); // Ocultar mensaje de Game Over
    finalRestartButton.classList.add("hidden"); // Ocultar el botón "Volver al Inicio" del Game Over
  }

  // Función para iniciar una nueva partida desde la pantalla de configuración
  function startGame() {
    let newSpeed = parseInt(speedInput.value);
    if (isNaN(newSpeed) || newSpeed < 1 || newSpeed > 15) {
      alert(
        "Por favor, introduce una velocidad válida para la bola (entre 1 y 15)."
      );
      speedInput.value = gameSpeed;
      return;
    }
    gameSpeed = newSpeed; // Actualizar la velocidad del juego

    // Esencialmente, re-inicializa el juego con la configuración actual
    // Llama a resetToSetupScreen para asegurar un estado limpio y luego empieza el juego
    resetToSetupScreen(); // Limpia y prepara la UI

    // Configura el estado para empezar a jugar
    gameRunning = true;
    resetBall(); // Posiciona la bola y le da una dirección inicial con la nueva velocidad

    startButton.classList.add("hidden"); // Ocultar botón de inicio
    speedInput.disabled = true; // Deshabilitar input de velocidad
    resetGameButton.classList.remove("hidden"); // Mostrar botón de reiniciar durante el juego

    gameLoop(); // Iniciar el bucle de juego
  }

  // Función para manejar el final de la partida
  function endGame(message) {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId); // Detener el bucle de animación
    winnerMessage.textContent = message;
    gameOverMessage.classList.remove("hidden"); // Mostrar el contenedor de Game Over

    // Al final del juego, ocultamos el botón de reiniciar durante el juego
    resetGameButton.classList.add("hidden");
    // Y mostramos solo el botón para volver a la pantalla de configuración
    finalRestartButton.classList.remove("hidden");
  }

  // --- Manejo de la Entrada del Teclado ---
  document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;

    if (e.key === "w" || e.key === "W") {
      player1.dy = -gameSpeed;
    } else if (e.key === "s" || e.key === "S") {
      player1.dy = gameSpeed;
    }

    if (e.key === "ArrowUp") {
      player2.dy = -gameSpeed;
    } else if (e.key === "ArrowDown") {
      player2.dy = gameSpeed;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (!gameRunning) return;

    if (e.key === "w" || e.key === "W" || e.key === "s" || e.key === "S") {
      player1.dy = 0;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      player2.dy = 0;
    }
  });

  // --- Event Listeners para los botones de la UI ---
  startButton.addEventListener("click", startGame); // El botón de inicio llama a startGame
  resetGameButton.addEventListener("click", resetToSetupScreen); // El botón de reiniciar llama a resetToSetupScreen
  finalRestartButton.addEventListener("click", resetToSetupScreen); // El botón de game over también llama a resetToSetupScreen

  // Inicializar la UI al cargar la página
  resetToSetupScreen();
});
