document.addEventListener("DOMContentLoaded", () => {
  const wordSearchGrid = document.getElementById("word-search-grid");
  const wordListElement = document.getElementById("word-list");
  const newGameButton = document.getElementById("newGameButton");
  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");
  const winScreen = document.getElementById("winScreen");
  const playAgainButton = document.getElementById("playAgainButton");

  // --- Configuración del Juego ---
  const MARIO_CHARACTERS = [
    "MARIO",
    "LUIGI",
    "PEACH",
    "YOSHI",
    "BOWSER",
    "TOAD",
    "KOOPA",
    "GOOMBA",
    "DAISY",
    "WARIO",
    "WALUIGI",
    "DONKEY",
    "DIDDY",
    "KIRBY",
    "ZELDA",
  ];

  const GRID_SIZE = 15;
  const MAX_PLACEMENT_ATTEMPTS = 100; // Más intentos para cada palabra
  const MAX_WORD_PLACEMENT_ITERATIONS = 500; // Intentos para colocar *todas* las palabras

  let grid = [];
  let placedWordPositions = new Map(); // Para almacenar las posiciones de las palabras colocadas
  let foundWords = new Set();
  let selectedCells = [];
  let isSelecting = false;

  // --- Funciones de Utilidad ---

  function getRandomLetter() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // --- Generación del Tablero ---

  function initializeGrid() {
    grid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(""));
    placedWordPositions.clear(); // Limpiar posiciones al iniciar un nuevo juego
  }

  // Intenta colocar una palabra en la cuadrícula
  function placeWord(word) {
    const directions = [
      { dr: 0, dc: 1 }, // Horizontal (derecha)
      { dr: 0, dc: -1 }, // Horizontal (izquierda)
      { dr: 1, dc: 0 }, // Vertical (abajo)
      { dr: -1, dc: 0 }, // Vertical (arriba)
      { dr: 1, dc: 1 }, // Diagonal (abajo-derecha)
      { dr: 1, dc: -1 }, // Diagonal (abajo-izquierda)
      { dr: -1, dc: 1 }, // Diagonal (arriba-derecha)
      { dr: -1, dc: -1 }, // Diagonal (arriba-izquierda)
    ];
    shuffleArray(directions);

    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
      const startRow = Math.floor(Math.random() * GRID_SIZE);
      const startCol = Math.floor(Math.random() * GRID_SIZE);
      const { dr, dc } =
        directions[Math.floor(Math.random() * directions.length)];

      let canPlace = true;
      let cellsToFill = [];

      for (let i = 0; i < word.length; i++) {
        const r = startRow + i * dr;
        const c = startCol + i * dc;

        // 1. Fuera de límites
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
          canPlace = false;
          break;
        }

        // 2. Colisión con una letra diferente
        if (grid[r][c] !== "" && grid[r][c] !== word[i]) {
          canPlace = false;
          break;
        }

        // 3. NO COLISIONAR CON UNA PALABRA YA COLOCADA EN UNA POSICIÓN QUE NO ES LA MISMA LETRA
        // Esta es la mejora clave para diagonales y superposiciones.
        // Verifica si la celda ya es parte de OTRA palabra Y la letra es diferente
        const existingWordForCell = placedWordPositions.get(`${r},${c}`);
        if (
          existingWordForCell &&
          existingWordForCell !== word &&
          grid[r][c] !== word[i]
        ) {
          canPlace = false;
          break;
        }

        cellsToFill.push({ r, c });
      }

      if (canPlace) {
        // Si se puede colocar, colocar la palabra y registrar sus posiciones
        for (let i = 0; i < word.length; i++) {
          const r = startRow + i * dr;
          const c = startCol + i * dc;
          grid[r][c] = word[i];
          placedWordPositions.set(`${r},${c}`, word); // Asocia la celda a la palabra
        }
        return true; // Palabra colocada con éxito
      }
    }
    return false; // No se pudo colocar la palabra
  }

  // Rellena los espacios vacíos con letras aleatorias
  function fillEmptyCells() {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === "") {
          grid[r][c] = getRandomLetter();
        }
      }
    }
  }

  // --- Renderizado del Tablero ---

  function renderGrid() {
    wordSearchGrid.innerHTML = "";
    wordSearchGrid.style.setProperty("--grid-cols", GRID_SIZE);
    wordSearchGrid.style.setProperty("--grid-rows", GRID_SIZE);

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell");
        cell.textContent = grid[r][c];
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener("mousedown", handleCellMouseDown);
        cell.addEventListener("mouseenter", handleCellMouseEnter);
        wordSearchGrid.appendChild(cell);
      }
    }
    document.addEventListener("mouseup", handleCellMouseUp);
  }

  function renderWordList() {
    wordListElement.innerHTML = "";
    MARIO_CHARACTERS.forEach((word) => {
      const listItem = document.createElement("li");
      listItem.textContent = word;
      if (foundWords.has(word)) {
        listItem.classList.add("found-word");
      }
      wordListElement.appendChild(listItem);
    });
  }

  // --- Lógica de Selección y Verificación ---

  function handleCellMouseDown(event) {
    if (event.button !== 0) return;
    isSelecting = true;
    clearSelection();
    const cell = event.target;
    cell.classList.add("selected");
    selectedCells.push(cell);
  }

  function handleCellMouseEnter(event) {
    if (!isSelecting) return;
    const cell = event.target;

    if (selectedCells.includes(cell)) {
      const lastCell = selectedCells[selectedCells.length - 1];
      if (
        selectedCells.length > 1 &&
        cell === selectedCells[selectedCells.length - 2]
      ) {
        lastCell.classList.remove("selected");
        selectedCells.pop();
      }
      return;
    }

    if (selectedCells.length > 0) {
      const lastCell = selectedCells[selectedCells.length - 1];
      const prevRow = parseInt(lastCell.dataset.row);
      const prevCol = parseInt(lastCell.dataset.col);
      const currentRow = parseInt(cell.dataset.row);
      const currentCol = parseInt(cell.dataset.col);

      const dr = currentRow - prevRow;
      const dc = currentCol - prevCol;

      // Asegurarse de que el movimiento sea a una celda adyacente en línea recta (H, V, D)
      // Y que el movimiento se mantenga consistente con la dirección inicial si ya se seleccionaron varias celdas
      if (selectedCells.length > 1) {
        const firstCell = selectedCells[0];
        const firstRow = parseInt(firstCell.dataset.row);
        const firstCol = parseInt(firstCell.dataset.col);

        const initialDr = Math.sign(selectedCells[1].dataset.row - firstRow);
        const initialDc = Math.sign(selectedCells[1].dataset.col - firstCol);

        if (
          Math.sign(dr) !== initialDr ||
          Math.sign(dc) !== initialDc ||
          Math.abs(dr) > 1 ||
          Math.abs(dc) > 1
        ) {
          return; // No sigue la dirección original o salta celdas
        }
      } else {
        // Primera extensión de la selección
        if (
          !(
            Math.abs(dr) <= 1 &&
            Math.abs(dc) <= 1 &&
            Math.abs(dr) + Math.abs(dc) > 0
          )
        ) {
          return; // No es un movimiento adyacente válido
        }
      }
    }

    cell.classList.add("selected");
    selectedCells.push(cell);
  }

  function handleCellMouseUp() {
    if (!isSelecting) return;
    isSelecting = false;

    if (selectedCells.length > 0) {
      checkSelectedWord();
    }
    clearSelection();
  }

  function clearSelection() {
    selectedCells.forEach((cell) => cell.classList.remove("selected"));
    selectedCells = [];
  }

  function checkSelectedWord() {
    if (selectedCells.length === 0) return;

    let selectedWord = "";
    const selectedCoords = []; // Guardar coordenadas para aplicar la clase 'found'
    for (const cell of selectedCells) {
      selectedWord += cell.textContent;
      selectedCoords.push(`${cell.dataset.row},${cell.dataset.col}`);
    }

    const normalizedSelectedWord = selectedWord.toUpperCase();

    let foundOriginalWord = null;
    for (const originalWord of MARIO_CHARACTERS) {
      if (
        normalizedSelectedWord === originalWord ||
        normalizedSelectedWord === originalWord.split("").reverse().join("")
      ) {
        if (!foundWords.has(originalWord)) {
          foundOriginalWord = originalWord;
          break;
        }
      }
    }

    if (foundOriginalWord) {
      foundWords.add(foundOriginalWord);
      selectedCells.forEach((cell) => {
        cell.classList.remove("selected");
        cell.classList.add("found");
      });
      renderWordList();
      checkWinCondition();
    } else {
      // Si la palabra no es correcta o ya fue encontrada, resalta brevemente y luego quita la selección
      selectedCells.forEach((cell) => {
        cell.classList.add("incorrect"); // Puedes añadir un estilo para 'incorrect' en CSS
      });
      setTimeout(() => {
        selectedCells.forEach((cell) => {
          cell.classList.remove("incorrect");
        });
        clearSelection();
      }, 500); // Quita el resaltado de error después de 0.5 segundos
    }
  }

  function checkWinCondition() {
    if (foundWords.size === MARIO_CHARACTERS.length) {
      winScreen.classList.remove("hidden");
    }
  }

  // --- Flujo del Juego ---

  function startGame() {
    startScreen.classList.add("hidden");
    newGame();
  }

  function newGame() {
    foundWords.clear();
    clearSelection();
    winScreen.classList.add("hidden");

    initializeGrid();

    const wordsToPlace = shuffleArray([...MARIO_CHARACTERS]);
    let placedSuccessfully = [];

    // Intentar colocar cada palabra un número limitado de veces
    for (let i = 0; i < wordsToPlace.length; i++) {
      const word = wordsToPlace[i];
      if (placeWord(word)) {
        placedSuccessfully.push(word);
      }
    }

    // Si no todas las palabras se pudieron colocar, se generará una sopa de letras con menos palabras
    // O podrías relanzar newGame() hasta que todas se coloquen, pero eso podría tardar mucho.
    // Para este ejemplo, simplemente rellenamos con las que sí se pudieron.
    fillEmptyCells();
    renderGrid();
    renderWordList(); // Renderiza la lista completa, las que no se pudieron colocar quedarán sin tachar.
  }

  // --- Event Listeners ---
  startButton.addEventListener("click", startGame);
  newGameButton.addEventListener("click", newGame);
  playAgainButton.addEventListener("click", newGame);

  startScreen.classList.remove("hidden");
});
