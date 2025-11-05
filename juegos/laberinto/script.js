document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("mazeCanvas");
  const ctx = canvas.getContext("2d");
  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const gameOverTitle = document.getElementById("gameOverTitle");
  const gameOverMessage = document.getElementById("gameOverMessage");
  const restartButton = document.getElementById("restartButton");

  // --- Constantes del Laberinto ---
  const CELL_SIZE = 40; // Tamaño de cada celda del laberinto en píxeles
  const MAZE_COLS = Math.floor(canvas.width / CELL_SIZE); // Número de columnas
  const MAZE_ROWS = Math.floor(canvas.height / CELL_SIZE); // Número de filas
  const WALL_WIDTH = 2; // Ancho de los muros del laberinto

  // --- Variables de Estado del Juego ---
  let gameRunning = false;
  let maze = []; // Matriz que representará el laberinto
  let player = {
    x: 0, // Posición de la celda del jugador (columna)
    y: 0, // Posición de la celda del jugador (fila)
    size: CELL_SIZE * 0.6, // Tamaño del jugador dentro de la celda
  };
  let goal = {
    x: MAZE_COLS - 1, // Posición de la celda de la meta (última columna)
    y: MAZE_ROWS - 1, // Posición de la celda de la meta (última fila)
    size: CELL_SIZE * 0.8, // Tamaño del objetivo
  };

  // --- Estructura de la celda del laberinto ---
  // Cada celda sabrá si sus muros (top, right, bottom, left) existen
  // y si ha sido visitada durante la generación.
  class Cell {
    constructor(col, row) {
      this.col = col;
      this.row = row;
      this.walls = {
        top: true,
        right: true,
        bottom: true,
        left: true,
      };
      this.visited = false;
    }

    // Dibuja la celda y sus muros
    draw() {
      const x = this.col * CELL_SIZE;
      const y = this.row * CELL_SIZE;

      ctx.strokeStyle = "#ADD8E6"; // Color de los muros (azul claro)
      ctx.lineWidth = WALL_WIDTH;

      if (this.walls.top) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + CELL_SIZE, y);
        ctx.stroke();
      }
      if (this.walls.right) {
        ctx.beginPath();
        ctx.moveTo(x + CELL_SIZE, y);
        ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
        ctx.stroke();
      }
      if (this.walls.bottom) {
        ctx.beginPath();
        ctx.moveTo(x + CELL_SIZE, y + CELL_SIZE);
        ctx.lineTo(x, y + CELL_SIZE);
        ctx.stroke();
      }
      if (this.walls.left) {
        ctx.beginPath();
        ctx.moveTo(x, y + CELL_SIZE);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  }

  // --- Generación del Laberinto (Algoritmo de Backtracking Recursivo) ---
  function generateMaze() {
    maze = [];
    // Inicializar la cuadrícula con todas las paredes
    for (let r = 0; r < MAZE_ROWS; r++) {
      maze[r] = [];
      for (let c = 0; c < MAZE_COLS; c++) {
        maze[r][c] = new Cell(c, r);
      }
    }

    let stack = [];
    let currentCell = maze[0][0]; // Comenzar en la esquina superior izquierda
    currentCell.visited = true;
    stack.push(currentCell);

    while (stack.length > 0) {
      let unvisitedNeighbors = [];
      let neighbors = [
        { dr: -1, dc: 0, wall: "top", opposite: "bottom" }, // Arriba
        { dr: 0, dc: 1, wall: "right", opposite: "left" }, // Derecha
        { dr: 1, dc: 0, wall: "bottom", opposite: "top" }, // Abajo
        { dr: 0, dc: -1, wall: "left", opposite: "right" }, // Izquierda
      ];

      for (let neighborInfo of neighbors) {
        const nextRow = currentCell.row + neighborInfo.dr;
        const nextCol = currentCell.col + neighborInfo.dc;

        if (
          nextRow >= 0 &&
          nextRow < MAZE_ROWS &&
          nextCol >= 0 &&
          nextCol < MAZE_COLS
        ) {
          const neighborCell = maze[nextRow][nextCol];
          if (!neighborCell.visited) {
            unvisitedNeighbors.push({
              cell: neighborCell,
              wallInfo: neighborInfo,
            });
          }
        }
      }

      if (unvisitedNeighbors.length > 0) {
        let randomNeighbor =
          unvisitedNeighbors[
            Math.floor(Math.random() * unvisitedNeighbors.length)
          ];
        let nextCell = randomNeighbor.cell;
        let wallToRemove = randomNeighbor.wallInfo.wall;
        let oppositeWall = randomNeighbor.wallInfo.opposite;

        // Romper la pared entre las celdas
        currentCell.walls[wallToRemove] = false;
        nextCell.walls[oppositeWall] = false;

        nextCell.visited = true;
        stack.push(currentCell);
        currentCell = nextCell;
      } else {
        currentCell = stack.pop(); // Backtrack
      }
    }
  }

  // --- Funciones de Dibujo ---
  function drawMaze() {
    for (let r = 0; r < MAZE_ROWS; r++) {
      for (let c = 0; c < MAZE_COLS; c++) {
        maze[r][c].draw();
      }
    }
  }

  function drawPlayer() {
    const playerX = player.x * CELL_SIZE + (CELL_SIZE - player.size) / 2;
    const playerY = player.y * CELL_SIZE + (CELL_SIZE - player.size) / 2;
    ctx.fillStyle = "blue";
    ctx.fillRect(playerX, playerY, player.size, player.size);
  }

  function drawGoal() {
    const goalX = goal.x * CELL_SIZE + (CELL_SIZE - goal.size) / 2;
    const goalY = goal.y * CELL_SIZE + (CELL_SIZE - goal.size) / 2;
    ctx.fillStyle = "green";
    ctx.fillRect(goalX, goalY, goal.size, goal.size);
  }

  // --- Controles de Teclado ---
  document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;

    const currentRow = player.y;
    const currentCol = player.x;
    const currentCell = maze[currentRow][currentCol];

    let moved = false;
    switch (e.key) {
      case "ArrowUp":
        if (!currentCell.walls.top && currentRow > 0) {
          player.y--;
          moved = true;
        }
        break;
      case "ArrowDown":
        if (!currentCell.walls.bottom && currentRow < MAZE_ROWS - 1) {
          player.y++;
          moved = true;
        }
        break;
      case "ArrowLeft":
        if (!currentCell.walls.left && currentCol > 0) {
          player.x--;
          moved = true;
        }
        break;
      case "ArrowRight":
        if (!currentCell.walls.right && currentCol < MAZE_COLS - 1) {
          player.x++;
          moved = true;
        }
        break;
    }

    if (moved) {
      // Comprobar si el jugador ha llegado a la meta
      if (player.x === goal.x && player.y === goal.y) {
        endGame(true);
      }
    }
  });

  // --- Bucle Principal del Juego (Loop de renderizado, no de lógica compleja por movimiento por teclado) ---
  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas

    drawMaze();
    drawGoal();
    drawPlayer();

    if (gameRunning) {
      requestAnimationFrame(gameLoop);
    }
  }

  // --- Control de Flujo del Juego ---
  function initGame() {
    gameRunning = true;

    generateMaze(); // Generar un nuevo laberinto
    player.x = 0; // Reiniciar jugador al inicio
    player.y = 0;

    startScreen.classList.add("hidden"); // Ocultar pantalla de inicio
    gameOverScreen.classList.add("hidden"); // Ocultar pantalla de Game Over

    gameLoop(); // Iniciar el bucle de renderizado
  }

  function endGame(win) {
    gameRunning = false;

    gameOverScreen.classList.remove("hidden"); // Mostrar pantalla de Game Over
    if (win) {
      gameOverTitle.textContent = "¡Has Ganado!";
      gameOverTitle.style.color = "#2ecc71";
      gameOverMessage.textContent = "¡Felicidades, encontraste la salida!";
    } else {
      // En un laberinto básico, solo ganas. Podrías añadir un temporizador y perder por tiempo.
      gameOverTitle.textContent = "¡Tiempo Agotado!"; // Ejemplo si añades un temporizador
      gameOverTitle.style.color = "#e74c3c";
      gameOverMessage.textContent = "Se acabó el tiempo. Inténtalo de nuevo.";
    }
  }

  // --- Event Listeners para los botones de la UI ---
  startButton.addEventListener("click", initGame);
  restartButton.addEventListener("click", initGame);

  // Dibuja un laberinto inicial estático en la pantalla de inicio
  generateMaze();
  drawMaze();
  drawPlayer();
  drawGoal();
});
