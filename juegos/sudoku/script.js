document.addEventListener("DOMContentLoaded", () => {
  const sudokuGrid = document.getElementById("sudoku-grid");
  const checkButton = document.getElementById("checkButton");
  const resetButton = document.getElementById("resetButton");
  const newGameButton = document.getElementById("newGameButton");
  const gameMessage = document.getElementById("gameMessage");
  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");

  const SIZE = 9;
  const SUBGRID_SIZE = 3;

  let initialBoard = []; // Tablero con los números fijos
  let playerBoard = []; // Tablero con los números que el jugador ingresa
  let solutionBoard = []; // La solución completa del Sudoku

  let selectedCell = null; // Para resaltar la celda seleccionada

  // --- Funciones de Utilidad ---

  // Shuffle de un array (para aleatorizar la generación) - MOVIDA AQUÍ
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Rellena una subcuadrícula 3x3 con números únicos
  function fillSubgrid(board, startRow, startCol) {
    let numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]); // Ahora shuffleArray está definida
    let index = 0;
    for (let r = 0; r < SUBGRID_SIZE; r++) {
      for (let c = 0; c < SUBGRID_SIZE; c++) {
        board[startRow + r][startCol + c] = numbers[index++];
      }
    }
  }

  // Verifica si la colocación de un número es válida
  function isValidPlacement(board, num, row, col) {
    // Check row
    for (let c = 0; c < SIZE; c++) {
      if (board[row][c] === num && c !== col) {
        return false;
      }
    }

    // Check column
    for (let r = 0; r < SIZE; r++) {
      if (board[r][col] === num && r !== row) {
        return false;
      }
    }

    // Check 3x3 subgrid
    const startRow = Math.floor(row / SUBGRID_SIZE) * SUBGRID_SIZE;
    const startCol = Math.floor(col / SUBGRID_SIZE) * SUBGRID_SIZE;
    for (let r = startRow; r < startRow + SUBGRID_SIZE; r++) {
      for (let c = startCol; c < startCol + SUBGRID_SIZE; c++) {
        if (board[r][c] === num && r !== row && c !== col) {
          return false;
        }
      }
    }

    return true;
  }

  // --- Funciones para la Generación del Sudoku ---

  // Genera una cuadrícula de Sudoku válida y completa
  function generateSudoku() {
    let board = Array(SIZE)
      .fill(null)
      .map(() => Array(SIZE).fill(0)); // 0 representa celda vacía

    // Llenar la diagonal de los bloques 3x3 primero para asegurar que haya una solución base
    // Esto ayuda a que el backtracking sea más rápido y confiable
    for (let i = 0; i < SUBGRID_SIZE; i++) {
      fillSubgrid(board, i * SUBGRID_SIZE, i * SUBGRID_SIZE);
    }

    // Función de backtracking para resolver/generar Sudoku
    function solve(board) {
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (board[r][c] === 0) {
            // Encontrar la siguiente celda vacía
            const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]); // Números aleatorios para probar
            for (const num of numbers) {
              if (isValidPlacement(board, num, r, c)) {
                board[r][c] = num; // Intentar colocar el número
                if (solve(board)) {
                  // Recursivamente intentar resolver el resto
                  return true;
                }
                board[r][c] = 0; // Si no funciona, deshacer y probar con otro número (backtrack)
              }
            }
            return false; // No se pudo encontrar un número válido para esta celda
          }
        }
      }
      return true; // Si no hay celdas vacías, el tablero está resuelto
    }

    solve(board); // Llamar a la función de resolución
    return board;
  }

  // Oculta celdas para crear el rompecabezas
  function createPuzzle(fullBoard, difficulty = "medium") {
    const puzzle = JSON.parse(JSON.stringify(fullBoard)); // Copia profunda para no modificar el tablero completo
    let cellsToRemove;

    switch (difficulty) {
      case "easy":
        cellsToRemove = 40;
        break;
      case "medium":
        cellsToRemove = 50;
        break; // Un buen balance por defecto
      case "hard":
        cellsToRemove = 60;
        break;
      default:
        cellsToRemove = 50;
    }

    let removedCount = 0;
    let attempts = 0;
    const maxAttempts = SIZE * SIZE * 5; // Evitar bucles infinitos en casos extraños

    while (removedCount < cellsToRemove && attempts < maxAttempts) {
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);

      if (puzzle[r][c] !== 0) {
        // Para una versión más robusta, aquí se necesitaría una verificación de unicidad de la solución
        // Esto es complejo y a menudo implica un segundo algoritmo de backtracking.
        // Para este ejemplo básico, asumimos que al quitar una celda, la solución sigue siendo única.
        puzzle[r][c] = 0; // Quitar el número
        removedCount++;
      }
      attempts++;
    }
    return puzzle;
  }

  // --- Funciones de Interfaz y Lógica del Juego ---

  function renderSudoku(boardToRender) {
    sudokuGrid.innerHTML = ""; // Limpiar el grid existente
    boardToRender.forEach((row, rIdx) => {
      row.forEach((num, cIdx) => {
        const cell = document.createElement("div");
        cell.classList.add("sudoku-cell");
        cell.dataset.row = rIdx;
        cell.dataset.col = cIdx;

        // Añadir clases para los bordes de los bloques 3x3
        if ((cIdx + 1) % SUBGRID_SIZE === 0 && cIdx !== SIZE - 1) {
          cell.style.borderRight = "3px solid #61dafb";
        }
        if (rIdx % SUBGRID_SIZE === SUBGRID_SIZE - 1 && rIdx !== SIZE - 1) {
          cell.style.borderBottom = "3px solid #61dafb";
        }

        if (initialBoard[rIdx][cIdx] !== 0) {
          // Celdas predefinidas (no editables)
          cell.textContent = initialBoard[rIdx][cIdx];
          cell.classList.add("initial-value");
        } else {
          // Celdas editables
          const input = document.createElement("input");
          input.type = "number";
          input.min = "1";
          input.max = "9";
          input.maxLength = "1"; // Para evitar múltiples dígitos en móviles
          input.value =
            playerBoard[rIdx][cIdx] === 0 ? "" : playerBoard[rIdx][cIdx];

          input.addEventListener("input", (e) => {
            let value = e.target.value.trim();
            if (value === "") {
              playerBoard[rIdx][cIdx] = 0;
            } else {
              let parsedValue = parseInt(value, 10);
              if (parsedValue >= 1 && parsedValue <= 9) {
                playerBoard[rIdx][cIdx] = parsedValue;
                e.target.value = parsedValue; // Asegurarse de que el valor mostrado sea limpio
              } else {
                playerBoard[rIdx][cIdx] = 0;
                e.target.value = ""; // Limpiar entrada inválida
              }
            }
            updateCellHighlighting(); // Actualizar resaltado al cambiar valor
            gameMessage.textContent = ""; // Limpiar mensaje de juego al cambiar valor
          });

          // Evento para deseleccionar celda al hacer clic fuera del input
          input.addEventListener("focus", () => {
            clearSelection(); // Limpia la selección previa
            selectedCell = cell; // Establece la nueva selección
            updateCellHighlighting(); // Aplica el resaltado
          });

          input.addEventListener("blur", () => {
            // Un pequeño retraso para permitir clics en otros inputs antes de deseleccionar
            setTimeout(() => {
              if (document.activeElement !== input) {
                clearSelection();
              }
            }, 50);
          });

          cell.appendChild(input);

          // Hacer clic en la celda también enfoca el input
          cell.addEventListener("click", () => {
            if (input && document.activeElement !== input) {
              input.focus();
            }
          });
        }
        sudokuGrid.appendChild(cell);
      });
    });
    updateCellHighlighting(); // Llamar inicialmente para cualquier celda seleccionada (ej. al reiniciar)
  }

  // Resalta la fila, columna y bloque de la celda seleccionada
  function updateCellHighlighting() {
    // Limpiar resaltados anteriores
    document.querySelectorAll(".sudoku-cell").forEach((cell) => {
      cell.classList.remove(
        "selected-cell",
        "highlight-row-col-block",
        "error",
        "success"
      );
    });

    if (selectedCell) {
      const selectedRow = parseInt(selectedCell.dataset.row, 10);
      const selectedCol = parseInt(selectedCell.dataset.col, 10);

      selectedCell.classList.add("selected-cell");

      // Resaltar fila y columna
      for (let i = 0; i < SIZE; i++) {
        sudokuGrid.children[selectedRow * SIZE + i].classList.add(
          "highlight-row-col-block"
        );
        sudokuGrid.children[i * SIZE + selectedCol].classList.add(
          "highlight-row-col-block"
        );
      }

      // Resaltar bloque 3x3
      const startRow = Math.floor(selectedRow / SUBGRID_SIZE) * SUBGRID_SIZE;
      const startCol = Math.floor(selectedCol / SUBGRID_SIZE) * SUBGRID_SIZE;
      for (let r = startRow; r < startRow + SUBGRID_SIZE; r++) {
        for (let c = startCol; c < startCol + SUBGRID_SIZE; c++) {
          sudokuGrid.children[r * SIZE + c].classList.add(
            "highlight-row-col-block"
          );
        }
      }
      // Asegurarse de que la celda seleccionada sigue siendo la principal
      selectedCell.classList.add("selected-cell");
    }
  }

  function clearSelection() {
    if (selectedCell) {
      selectedCell.classList.remove("selected-cell");
      selectedCell = null;
      updateCellHighlighting(); // Quitar resaltado de fila/col/bloque
    }
  }

  // Inicia un nuevo juego
  function newGame() {
    solutionBoard = generateSudoku();
    initialBoard = createPuzzle(solutionBoard, "medium"); // Oculta números para el puzzle
    playerBoard = JSON.parse(JSON.stringify(initialBoard)); // El tablero del jugador empieza con los valores iniciales

    renderSudoku(playerBoard);
    gameMessage.textContent = ""; // Limpiar mensajes
    gameMessage.style.color = "#f8f8f2"; // Resetear color del mensaje
    clearSelection(); // Asegurarse de que no hay nada seleccionado al inicio
  }

  // Comprueba la solución del jugador
  function checkSolution() {
    let allCellsFilled = true;
    let errorsFound = false;
    let cells = sudokuGrid.children;

    // Quitar clases de error/éxito anteriores
    document.querySelectorAll(".sudoku-cell").forEach((cell) => {
      cell.classList.remove("error", "success");
    });

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cellElement = cells[r * SIZE + c];
        const playerValue = playerBoard[r][c];

        if (playerValue === 0) {
          allCellsFilled = false;
        } else if (playerValue !== solutionBoard[r][c]) {
          cellElement.classList.add("error");
          errorsFound = true;
        }
      }
    }

    if (allCellsFilled && !errorsFound) {
      gameMessage.textContent = "¡Felicidades! ¡Sudoku Resuelto correctamente!";
      gameMessage.style.color = "#2ecc71";
      // Resaltar todas las celdas como éxito si todo es correcto
      document.querySelectorAll(".sudoku-cell").forEach((cell) => {
        cell.classList.add("success");
      });
    } else if (errorsFound) {
      gameMessage.textContent =
        "¡Hay errores en tu solución! Revisa las celdas rojas.";
      gameMessage.style.color = "#e74c3c";
    } else {
      // !allCellsFilled && !errorsFound
      gameMessage.textContent = "¡Todavía faltan números por rellenar!";
      gameMessage.style.color = "#f39c12";
    }
  }

  // Reinicia el tablero del jugador a los valores iniciales
  function resetGame() {
    playerBoard = JSON.parse(JSON.stringify(initialBoard));
    renderSudoku(playerBoard);
    gameMessage.textContent = "Tablero reiniciado.";
    gameMessage.style.color = "#f8f8f2";
    clearSelection();
  }

  // --- Event Listeners ---
  startButton.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    newGame();
  });
  newGameButton.addEventListener("click", newGame);
  checkButton.addEventListener("click", checkSolution);
  resetButton.addEventListener("click", resetGame);

  // Event listener global para deseleccionar celda al hacer clic fuera del grid
  document.addEventListener("click", (e) => {
    // Si el click no fue dentro del grid y no fue en un input dentro del grid
    if (
      !sudokuGrid.contains(e.target) &&
      !e.target.closest(".sudoku-cell input")
    ) {
      clearSelection();
    }
  });

  // Inicializa la pantalla de inicio al cargar la página
  startScreen.classList.remove("hidden");
});
