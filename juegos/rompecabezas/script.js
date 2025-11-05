document.addEventListener("DOMContentLoaded", () => {
  const imageUpload = document.getElementById("imageUpload");
  const difficultySelect = document.getElementById("difficulty");
  const startGameButton = document.getElementById("startGame");
  const puzzleBoard = document.getElementById("puzzle-board");
  const referenceImage = document.getElementById("reference-image");
  const messageDisplay = document.getElementById("message");

  let currentImage = null;
  let difficulty = parseInt(difficultySelect.value); // Número de filas/columnas
  let pieces = []; // Array para almacenar las piezas del rompecabezas
  let originalOrder = []; // El orden correcto de las piezas (índices)
  let currentDragPiece = null; // Pieza que se está arrastrando
  let targetDropPiece = null; // Pieza sobre la que se suelta

  // --- Event Listeners ---
  imageUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        currentImage = e.target.result;
        referenceImage.src = currentImage;
        referenceImage.style.display = "block";
        messageDisplay.textContent =
          'Imagen cargada. Haz clic en "Iniciar Juego".';
        messageDisplay.className = "message"; // Reset class
      };
      reader.readAsDataURL(file);
    }
  });

  difficultySelect.addEventListener("change", (event) => {
    difficulty = parseInt(event.target.value);
    messageDisplay.textContent = `Dificultad ajustada a ${difficulty}x${difficulty}.`;
    messageDisplay.className = "message";
  });

  startGameButton.addEventListener("click", () => {
    if (!currentImage) {
      showMessage("Por favor, selecciona una imagen primero.", "error");
      return;
    }
    createPuzzle();
    showMessage(
      "¡Rompecabezas creado! Arrasta y suelta las piezas para resolverlo.",
      "info"
    );
  });

  // --- Funciones del Juego ---

  function showMessage(text, type = "info") {
    messageDisplay.textContent = text;
    messageDisplay.className = `message ${type}`;
  }

  function createPuzzle() {
    puzzleBoard.innerHTML = ""; // Limpiar tablero anterior
    pieces = [];
    originalOrder = [];

    const img = new Image();
    img.src = currentImage;
    img.onload = () => {
      const boardSize = puzzleBoard.clientWidth; // Obtener el tamaño actual del tablero
      const pieceWidth = boardSize / difficulty;
      const pieceHeight = boardSize / difficulty;

      // Configurar el CSS Grid para el tablero
      puzzleBoard.style.gridTemplateColumns = `repeat(${difficulty}, 1fr)`;
      puzzleBoard.style.gridTemplateRows = `repeat(${difficulty}, 1fr)`;

      for (let i = 0; i < difficulty * difficulty; i++) {
        const piece = document.createElement("div");
        piece.classList.add("puzzle-piece");
        piece.setAttribute("draggable", "true"); // Hacer las piezas arrastrables
        piece.dataset.originalIndex = i; // Guardar el índice original

        const row = Math.floor(i / difficulty);
        const col = i % difficulty;

        // Calcular la posición del fondo para cada pieza
        piece.style.backgroundImage = `url(${currentImage})`;
        piece.style.backgroundSize = `${boardSize}px ${boardSize}px`; // Asegurar que la imagen de fondo tenga el tamaño del tablero
        piece.style.backgroundPosition = `-${col * pieceWidth}px -${
          row * pieceHeight
        }px`;

        pieces.push(piece);
        originalOrder.push(i); // Guardar el orden correcto
      }

      shufflePieces(pieces); // Desordenar las piezas
      pieces.forEach((piece) => puzzleBoard.appendChild(piece)); // Añadir al tablero

      addDragAndDropListeners();
    };
  }

  function shufflePieces(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Intercambiar elementos
    }
  }

  function addDragAndDropListeners() {
    pieces.forEach((piece) => {
      piece.addEventListener("dragstart", handleDragStart);
      piece.addEventListener("dragover", handleDragOver);
      piece.addEventListener("dragleave", handleDragLeave);
      piece.addEventListener("drop", handleDrop);
      piece.addEventListener("dragend", handleDragEnd);
    });
  }

  function handleDragStart(e) {
    currentDragPiece = e.target;
    e.dataTransfer.setData("text/plain", e.target.dataset.originalIndex); // Puedes transferir cualquier dato
    e.target.classList.add("dragging");
  }

  function handleDragOver(e) {
    e.preventDefault(); // Necesario para permitir el "drop"
    targetDropPiece = e.target;
    if (
      targetDropPiece.classList.contains("puzzle-piece") &&
      targetDropPiece !== currentDragPiece
    ) {
      targetDropPiece.style.border = "2px dashed #007bff"; // Indicar dónde se soltará
    }
  }

  function handleDragLeave(e) {
    if (e.target.classList.contains("puzzle-piece")) {
      e.target.style.border = "1px solid #ccc"; // Restaurar borde
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    if (
      targetDropPiece &&
      targetDropPiece.classList.contains("puzzle-piece") &&
      targetDropPiece !== currentDragPiece
    ) {
      // Intercambiar las piezas en el DOM
      const parent = puzzleBoard;
      const temp = document.createElement("div"); // Un elemento temporal para el intercambio

      parent.insertBefore(temp, targetDropPiece); // Insertar temp antes del target
      parent.insertBefore(targetDropPiece, currentDragPiece); // Mover target a la posición de drag
      parent.insertBefore(currentDragPiece, temp); // Mover drag a la posición de target
      parent.removeChild(temp); // Eliminar el temporal

      // También necesitamos actualizar el array `pieces` para que el orden lógico coincida con el DOM
      const dragIndex = Array.from(puzzleBoard.children).indexOf(
        currentDragPiece
      );
      const dropIndex = Array.from(puzzleBoard.children).indexOf(
        targetDropPiece
      );
      [pieces[dragIndex], pieces[dropIndex]] = [
        pieces[dropIndex],
        pieces[dragIndex],
      ];

      checkWin(); // Verificar si el rompecabezas está resuelto
    }
    // Limpiar estilos después del drop (o si el drop no fue válido)
    if (targetDropPiece) {
      targetDropPiece.style.border = "1px solid #ccc";
    }
  }

  function handleDragEnd(e) {
    e.target.classList.remove("dragging");
    currentDragPiece = null;
    targetDropPiece = null;
    // Asegurarse de que todos los bordes vuelvan a la normalidad si el arrastre termina fuera de una pieza válida
    pieces.forEach((piece) => (piece.style.border = "1px solid #ccc"));
  }

  function checkWin() {
    let isSolved = true;
    const currentPuzzlePieces = Array.from(puzzleBoard.children);

    currentPuzzlePieces.forEach((piece, index) => {
      if (parseInt(piece.dataset.originalIndex) !== index) {
        isSolved = false;
        piece.classList.remove("correct");
      } else {
        piece.classList.add("correct"); // Marcar piezas correctas
      }
    });

    if (isSolved) {
      showMessage("¡Felicidades! Has completado el rompecabezas.", "success");
      // Desactivar arrastre después de ganar
      pieces.forEach((piece) => piece.setAttribute("draggable", "false"));
    } else {
      showMessage("¡Sigue intentándolo!", "info");
    }
  }

  // Inicializar con un mensaje o un puzzle predeterminado si lo deseas
  showMessage("Selecciona una imagen y una dificultad para empezar.", "info");
});
