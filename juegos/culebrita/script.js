document.addEventListener("DOMContentLoaded", () => {
  // Obtener el canvas y su contexto de dibujo
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // Obtener elementos del DOM para interactuar
  const scoreDisplay = document.getElementById("score");
  const startButton = document.getElementById("startButton");
  const gameOverMessage = document.getElementById("gameOverMessage");
  const finalScoreDisplay = document.getElementById("finalScore");
  const restartButton = document.getElementById("restartButton");

  // --- Constantes del Juego ---
  const GRID_SIZE = 20; // Tamaño de cada "cuadrado" en el tablero
  const TILE_COUNT = canvas.width / GRID_SIZE; // Número de cuadrados en cada dimensión del canvas

  let snake = []; // Array que representa el cuerpo de la serpiente (coordenadas x, y)
  let food = {}; // Objeto que representa la posición de la comida
  let score = 0;
  let dx = 0; // Dirección X (horizontal)
  let dy = 0; // Dirección Y (vertical)
  let changingDirection = false; // Bandera para evitar giros dobles rápidos
  let gameInterval; // Variable para almacenar el ID del intervalo de juego
  let gameSpeed = 150; // Velocidad del juego en milisegundos (menor = más rápido)

  // --- Funciones de Inicialización y Estado del Juego ---

  // Función para iniciar o reiniciar el juego
  function initGame() {
    snake = [
      { x: 10 * GRID_SIZE, y: 10 * GRID_SIZE }, // Cabeza de la serpiente
      { x: 9 * GRID_SIZE, y: 10 * GRID_SIZE }, // Primer segmento del cuerpo
      { x: 8 * GRID_SIZE, y: 10 * GRID_SIZE }, // Segundo segmento del cuerpo
    ];
    food = {}; // Reiniciar la comida
    score = 0;
    dx = GRID_SIZE; // Iniciar moviéndose a la derecha
    dy = 0;
    changingDirection = false;

    scoreDisplay.textContent = score; // Actualizar puntuación en el display
    gameOverMessage.classList.add("hidden"); // Ocultar mensaje de Game Over
    startButton.classList.add("hidden"); // Ocultar botón de inicio (si está visible)

    generateFood(); // Generar la primera comida
    if (gameInterval) clearInterval(gameInterval); // Limpiar cualquier intervalo anterior
    gameInterval = setInterval(gameLoop, gameSpeed); // Iniciar el bucle del juego
  }

  // --- Bucle Principal del Juego ---

  // El corazón del juego, se ejecuta repetidamente
  function gameLoop() {
    if (checkCollision()) {
      endGame(); // Si hay colisión, terminar el juego
      return;
    }

    changingDirection = false; // Permitir el cambio de dirección para el próximo tick

    clearCanvas(); // Limpiar el canvas
    drawFood(); // Dibujar la comida
    moveSnake(); // Mover la serpiente
    drawSnake(); // Dibujar la serpiente
  }

  // --- Funciones de Dibujo ---

  // Limpia todo el canvas
  function clearCanvas() {
    ctx.fillStyle = "#1a1e24"; // Color de fondo del canvas
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Dibuja la serpiente
  function drawSnake() {
    snake.forEach(drawSnakePart); // Dibujar cada segmento de la serpiente
  }

  // Dibuja una parte individual de la serpiente
  function drawSnakePart(part) {
    ctx.fillStyle = "#4CAF50"; // Color del cuerpo de la serpiente (verde)
    ctx.strokeStyle = "#388E3C"; // Color del borde de la serpiente
    ctx.fillRect(part.x, part.y, GRID_SIZE, GRID_SIZE); // Dibujar el cuadrado
    ctx.strokeRect(part.x, part.y, GRID_SIZE, GRID_SIZE); // Dibujar el borde
  }

  // Dibuja la comida
  function drawFood() {
    ctx.fillStyle = "#FF5733"; // Color de la comida (naranja rojizo)
    ctx.strokeStyle = "#C70039"; // Borde de la comida
    ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
    ctx.strokeRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
  }

  // --- Lógica del Juego ---

  // Mueve la serpiente un paso
  function moveSnake() {
    // Crear la nueva cabeza de la serpiente
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Añadir la nueva cabeza al principio del array
    snake.unshift(head);

    // Comprobar si la serpiente ha comido la comida
    if (head.x === food.x && head.y === food.y) {
      score++; // Incrementar la puntuación
      scoreDisplay.textContent = score; // Actualizar el display
      generateFood(); // Generar nueva comida
    } else {
      // Si no ha comido, remover la cola (la serpiente se mueve)
      snake.pop();
    }
  }

  // Genera una nueva posición aleatoria para la comida
  function generateFood() {
    let newFoodX, newFoodY;
    let foodOnSnake = true;

    // Asegurarse de que la comida no aparezca encima de la serpiente
    while (foodOnSnake) {
      newFoodX = Math.floor(Math.random() * TILE_COUNT) * GRID_SIZE;
      newFoodY = Math.floor(Math.random() * TILE_COUNT) * GRID_SIZE;
      foodOnSnake = snake.some(
        (part) => part.x === newFoodX && part.y === newFoodY
      );
    }

    food = { x: newFoodX, y: newFoodY };
  }

  // Comprueba si hay colisión con las paredes o con el propio cuerpo de la serpiente
  function checkCollision() {
    const head = snake[0];

    // Colisión con el propio cuerpo (empezar desde el 4to segmento para evitar colisiones instantáneas al girar)
    for (let i = 4; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }

    // Colisión con las paredes
    const hitLeftWall = head.x < 0;
    const hitRightWall = head.x >= canvas.width;
    const hitTopWall = head.y < 0;
    const hitBottomWall = head.y >= canvas.height;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
  }

  // Termina el juego
  function endGame() {
    clearInterval(gameInterval); // Detener el bucle del juego
    gameOverMessage.classList.remove("hidden"); // Mostrar mensaje de Game Over
    finalScoreDisplay.textContent = score; // Mostrar puntuación final
  }

  // --- Manejo de la Entrada del Teclado ---

  // Cambia la dirección de la serpiente según la tecla presionada
  function changeDirection(event) {
    if (changingDirection) return; // Evitar cambios de dirección dobles
    changingDirection = true;

    const keyPressed = event.keyCode;
    const LEFT_KEY = 37;
    const UP_KEY = 38;
    const RIGHT_KEY = 39;
    const DOWN_KEY = 40;

    const goingUp = dy === -GRID_SIZE;
    const goingDown = dy === GRID_SIZE;
    const goingRight = dx === GRID_SIZE;
    const goingLeft = dx === -GRID_SIZE;

    if (keyPressed === LEFT_KEY && !goingRight) {
      dx = -GRID_SIZE;
      dy = 0;
    } else if (keyPressed === UP_KEY && !goingDown) {
      dx = 0;
      dy = -GRID_SIZE;
    } else if (keyPressed === RIGHT_KEY && !goingLeft) {
      dx = GRID_SIZE;
      dy = 0;
    } else if (keyPressed === DOWN_KEY && !goingUp) {
      dx = 0;
      dy = GRID_SIZE;
    }
  }

  // --- Event Listeners ---

  // Listener para los botones de iniciar/reiniciar
  startButton.addEventListener("click", initGame);
  restartButton.addEventListener("click", initGame);

  // Listener para las teclas del teclado
  document.addEventListener("keydown", changeDirection);

  // Inicializar el display de puntuación y el estado del botón de inicio al cargar
  scoreDisplay.textContent = 0;
  startButton.classList.remove("hidden"); // Asegurarse de que el botón de inicio sea visible al principio
});
