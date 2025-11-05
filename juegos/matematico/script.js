document.addEventListener("DOMContentLoaded", () => {
  const questionElem = document.getElementById("question");
  const answerInput = document.getElementById("answerInput");
  const checkButton = document.getElementById("checkButton");
  const feedbackElem = document.getElementById("feedback");
  const scoreElem = document.getElementById("score");
  const startButton = document.getElementById("startButton");
  const nextQuestionButton = document.getElementById("nextQuestionButton");
  const resetGameButton = document.getElementById("resetGameButton");

  let currentAnswer = 0;
  let score = 0;
  let gameActive = false; // Estado del juego: si está en curso

  // --- Funciones del Juego ---

  // Genera una nueva pregunta de matemáticas
  function generateQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 1; // Números entre 1 y 10
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ["+", "-", "x"]; // Operadores posibles
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let questionText = "";
    let result = 0;

    switch (operator) {
      case "+":
        questionText = `${num1} + ${num2} = ?`;
        result = num1 + num2;
        break;
      case "-":
        // Asegurarse de que el resultado de la resta no sea negativo
        if (num1 < num2) {
          questionText = `${num2} - ${num1} = ?`;
          result = num2 - num1;
        } else {
          questionText = `${num1} - ${num2} = ?`;
          result = num1 - num2;
        }
        break;
      case "x":
        questionText = `${num1} x ${num2} = ?`;
        result = num1 * num2;
        break;
    }

    questionElem.textContent = questionText;
    currentAnswer = result;
    answerInput.value = ""; // Limpiar el input
    feedbackElem.classList.add("hidden"); // Ocultar feedback anterior
    answerInput.focus(); // Poner el foco en el input para que el usuario pueda escribir
  }

  // Inicia o reinicia el juego
  function startGame() {
    score = 0;
    scoreElem.textContent = score;
    gameActive = true;

    // Habilitar/Deshabilitar botones y campos
    answerInput.disabled = false;
    checkButton.disabled = false;
    startButton.classList.add("hidden"); // Ocultar botón de inicio
    nextQuestionButton.classList.add("hidden"); // Ocultar "Siguiente Pregunta" al inicio
    resetGameButton.classList.remove("hidden"); // Mostrar botón de reinicio

    generateQuestion(); // Generar la primera pregunta
  }

  // Verifica la respuesta del usuario
  function checkAnswer() {
    if (!gameActive) return; // No hacer nada si el juego no está activo

    const userAnswer = parseInt(answerInput.value); // Convertir la respuesta a número

    // Validar si el usuario ingresó un número
    if (isNaN(userAnswer)) {
      feedbackElem.textContent = "¡Por favor, ingresa un número!";
      feedbackElem.className = "feedback incorrect"; // Usar clase incorrecta temporalmente para el estilo
      feedbackElem.classList.remove("hidden");
      return;
    }

    feedbackElem.classList.remove("hidden"); // Mostrar el área de feedback

    if (userAnswer === currentAnswer) {
      feedbackElem.textContent = "¡Correcto! 🎉";
      feedbackElem.className = "feedback correct"; // Aplicar clase de estilo para correcto
      score++;
      scoreElem.textContent = score;
    } else {
      feedbackElem.textContent = `Incorrecto. La respuesta era ${currentAnswer}. 😞`;
      feedbackElem.className = "feedback incorrect"; // Aplicar clase de estilo para incorrecto
      // Opcional: reducir puntuación por error
      // score = Math.max(0, score - 1);
      // scoreElem.textContent = score;
    }

    // Deshabilitar input y botón de verificar hasta la próxima pregunta
    answerInput.disabled = true;
    checkButton.disabled = true;
    nextQuestionButton.classList.remove("hidden"); // Mostrar botón de siguiente pregunta
  }

  // Pasa a la siguiente pregunta
  function goToNextQuestion() {
    if (!gameActive) return;
    answerInput.disabled = false;
    checkButton.disabled = false;
    nextQuestionButton.classList.add("hidden"); // Ocultar botón de siguiente pregunta
    generateQuestion();
  }

  // Reinicia el juego por completo desde cualquier momento
  function resetGame() {
    gameActive = false;
    score = 0;
    scoreElem.textContent = score;
    questionElem.textContent = "Haz clic en 'Iniciar Juego' para comenzar.";
    answerInput.value = "";
    answerInput.disabled = true;
    checkButton.disabled = true;
    feedbackElem.classList.add("hidden");

    startButton.classList.remove("hidden"); // Mostrar botón de inicio
    nextQuestionButton.classList.add("hidden");
    resetGameButton.classList.add("hidden"); // Ocultar el botón de reiniciar si ya lo estabas usando
  }

  // --- Event Listeners ---
  startButton.addEventListener("click", startGame);
  checkButton.addEventListener("click", checkAnswer);
  nextQuestionButton.addEventListener("click", goToNextQuestion);
  resetGameButton.addEventListener("click", resetGame);

  // Permitir presionar Enter para verificar la respuesta
  answerInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !answerInput.disabled) {
      checkAnswer();
    }
  });

  // Estado inicial de los botones al cargar la página
  answerInput.disabled = true;
  checkButton.disabled = true;
  nextQuestionButton.classList.add("hidden");
  resetGameButton.classList.add("hidden");
  startButton.classList.remove("hidden"); // Asegurarse de que el botón de inicio esté visible
});
