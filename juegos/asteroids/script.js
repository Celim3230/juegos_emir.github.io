document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("asteroidsCanvas");
  const ctx = canvas.getContext("2d");
  const scoreDisplay = document.getElementById("score");
  const livesDisplay = document.getElementById("lives");
  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const gameOverTitle = document.getElementById("gameOverTitle");
  const gameOverMessage = document.getElementById("gameOverMessage");
  const restartButton = document.getElementById("restartButton");

  // --- Constantes del Juego ---
  const SHIP_SIZE = 20; // Tamaño de la nave (para triángulo equilátero)
  const SHIP_ROTATION_SPEED = 0.08; // Velocidad de giro en radianes
  const SHIP_THRUST = 0.05; // Fuerza de impulso
  const SHIP_FRICTION = 0.99; // Fricción para detener la nave lentamente
  const BULLET_SPEED = 7;
  const BULLET_LIFESPAN = 60; // Cuadros que la bala permanece visible
  const ASTEROID_SPEED = 1; // Velocidad base de los asteroides
  const ASTEROID_MAX_SIZE = 60;
  const ASTEROID_MIN_SIZE = 20;
  const ASTEROID_VERTICES = 10; // Número de puntos para un asteroide "redondeado"
  const INITIAL_ASTEROIDS = 4; // Número de asteroides al inicio del nivel
  const TOTAL_LEVELS = 10; // Ahora con 10 niveles

  // --- Variables de Estado del Juego ---
  let gameRunning = false;
  let score = 0;
  let lives = 3;
  let level = 0; // Nivel actual
  let animationFrameId;

  let ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: SHIP_SIZE / 2, // Radio para colisiones
    angle: Math.PI / 2, // Ángulo inicial (apuntando hacia arriba)
    rotation: 0, // 0 = no gira, -1 = izquierda, 1 = derecha
    thrusting: false, // true = impulsando, false = no impulsando
    vx: 0, // Velocidad en X
    vy: 0, // Velocidad en Y
    hitCooldown: 0, // Contador para invulnerabilidad tras ser golpeado
    blinkOn: false, // Para el parpadeo de invulnerabilidad
    blinkTimer: 0, // Para controlar el parpadeo
  };

  let asteroids = []; // Array para almacenar los asteroides
  let bullets = []; // Array para almacenar los disparos

  // --- Controles de Teclado ---
  let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    Space: false,
  };

  document.addEventListener("keydown", (e) => {
    if (keys[e.code] !== undefined) {
      keys[e.code] = true;
      e.preventDefault(); // Evitar el desplazamiento de la página
    }
  });

  document.addEventListener("keyup", (e) => {
    if (keys[e.code] !== undefined) {
      keys[e.code] = false;
    }
    if (e.code === "Space" && gameRunning && !ship.thrusting) {
      fireBullet();
    }
  });

  // --- Funciones de Dibujo ---
  function drawShip() {
    if (ship.hitCooldown > 0 && ship.blinkOn) {
      return;
    }

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.moveTo(
      ship.x + ship.radius * Math.cos(ship.angle),
      ship.y - ship.radius * Math.sin(ship.angle)
    );
    ctx.lineTo(
      ship.x - ship.radius * (Math.cos(ship.angle) + Math.sin(ship.angle)),
      ship.y + ship.radius * (Math.sin(ship.angle) - Math.cos(ship.angle))
    );
    ctx.lineTo(
      ship.x - ship.radius * (Math.cos(ship.angle) - Math.sin(ship.angle)),
      ship.y + ship.radius * (Math.sin(ship.angle) + Math.cos(ship.angle))
    );
    ctx.closePath();
    ctx.stroke();

    if (ship.thrusting && ship.hitCooldown === 0) {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.moveTo(
        ship.x -
          ship.radius * (Math.cos(ship.angle) - 0.6 * Math.sin(ship.angle)),
        ship.y +
          ship.radius * (Math.sin(ship.angle) + 0.6 * Math.cos(ship.angle))
      );
      ctx.lineTo(
        ship.x - ship.radius * 1.5 * Math.cos(ship.angle),
        ship.y + ship.radius * 1.5 * Math.sin(ship.angle)
      );
      ctx.lineTo(
        ship.x -
          ship.radius * (Math.cos(ship.angle) + 0.6 * Math.sin(ship.angle)),
        ship.y +
          ship.radius * (Math.sin(ship.angle) - 0.6 * Math.cos(ship.angle))
      );
      ctx.fill();
    }
  }

  function drawAsteroids() {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    asteroids.forEach((ast) => {
      ctx.beginPath();
      for (let i = 0; i < ast.vertices; i++) {
        const angle = (i / ast.vertices) * Math.PI * 2;
        const x =
          ast.x + ast.radius * ast.offset[i] * Math.cos(angle + ast.angle);
        const y =
          ast.y + ast.radius * ast.offset[i] * Math.sin(angle + ast.angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    });
  }

  function drawBullets() {
    ctx.fillStyle = "lime";
    bullets.forEach((bullet) => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    });
  }

  // --- Lógica de Elementos del Juego ---
  function createAsteroids(num, x, y, size) {
    for (let i = 0; i < num; i++) {
      let astX, astY;
      if (x && y) {
        astX = x;
        astY = y;
      } else {
        do {
          astX = Math.random() * canvas.width;
          astY = Math.random() * canvas.height;
        } while (
          getDistance(ship.x, ship.y, astX, astY) <
          100 + SHIP_SIZE + ASTEROID_MAX_SIZE / 2
        );
      }

      const astSize = size || ASTEROID_MAX_SIZE;
      const astRadius = astSize / 2;
      const astSpeed = ASTEROID_SPEED + (level - 1) * 0.3; // Aumenta la velocidad del asteroide con el nivel

      let vx, vy;
      do {
        vx = Math.random() * astSpeed * 2 - astSpeed;
        vy = Math.random() * astSpeed * 2 - astSpeed;
      } while (vx === 0 && vy === 0);

      let offset = [];
      for (let j = 0; j < ASTEROID_VERTICES; j++) {
        offset.push(1 + Math.random() * 0.4 - 0.2);
      }

      asteroids.push({
        x: astX,
        y: astY,
        vx: vx,
        vy: vy,
        radius: astRadius,
        vertices: ASTEROID_VERTICES,
        offset: offset,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }
  }

  function fireBullet() {
    if (!ballLaunched) return;

    bullets.push({
      x: ship.x + ship.radius * Math.cos(ship.angle),
      y: ship.y - ship.radius * Math.sin(ship.angle),
      vx: BULLET_SPEED * Math.cos(ship.angle) + ship.vx,
      vy: -BULLET_SPEED * Math.sin(ship.angle) + ship.vy,
      radius: 2,
      lifespan: BULLET_LIFESPAN,
    });
  }

  // --- Lógica de Colisiones ---
  function checkCollision(obj1, obj2) {
    const dist = getDistance(obj1.x, obj1.y, obj2.x, obj2.y);
    return dist < obj1.radius + obj2.radius;
  }

  function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  // --- Lógica del Juego Principal (Update) ---
  function update() {
    if (!gameRunning) return;

    // --- Actualizar Nave ---
    if (keys.ArrowLeft) ship.rotation = SHIP_ROTATION_SPEED;
    else if (keys.ArrowRight) ship.rotation = -SHIP_ROTATION_SPEED;
    else ship.rotation = 0;
    ship.angle += ship.rotation;

    ship.thrusting = keys.ArrowUp;
    if (ship.thrusting) {
      ship.vx += SHIP_THRUST * Math.cos(ship.angle);
      ship.vy -= SHIP_THRUST * Math.sin(ship.angle);
    }

    ship.vx *= SHIP_FRICTION;
    ship.vy *= SHIP_FRICTION;

    ship.x += ship.vx;
    ship.y += ship.vy;

    if (ship.x < 0 - ship.radius) ship.x = canvas.width + ship.radius;
    else if (ship.x > canvas.width + ship.radius) ship.x = 0 - ship.radius;
    if (ship.y < 0 - ship.radius) ship.y = canvas.height + ship.radius;
    else if (ship.y > canvas.height + ship.radius) ship.y = 0 - ship.radius;

    if (ship.hitCooldown > 0) {
      ship.hitCooldown--;
      ship.blinkTimer--;
      if (ship.blinkTimer <= 0) {
        ship.blinkOn = !ship.blinkOn;
        ship.blinkTimer = 10;
      }
    }

    // --- Actualizar Balas ---
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      bullet.lifespan--;

      if (bullet.x < 0) bullet.x = canvas.width;
      else if (bullet.x > canvas.width) bullet.x = 0;
      if (bullet.y < 0) bullet.y = canvas.height;
      else if (bullet.y > canvas.height) bullet.y = 0;

      if (bullet.lifespan <= 0) {
        bullets.splice(i, 1);
      }
    }

    // --- Actualizar Asteroides y Detección de Colisiones ---
    let allAsteroidsDestroyed = true;
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const ast = asteroids[i];
      ast.x += ast.vx;
      ast.y += ast.vy;
      ast.angle += ast.rotationSpeed;

      if (ast.x < 0 - ast.radius) ast.x = canvas.width + ast.radius;
      else if (ast.x > canvas.width + ast.radius) ast.x = 0 - ast.radius;
      if (ast.y < 0 - ast.radius) ast.y = canvas.height + ast.radius;
      else if (ast.y > canvas.height + ast.radius) ast.y = 0 - ast.radius;

      if (ship.hitCooldown === 0 && checkCollision(ship, ast)) {
        lives--;
        livesDisplay.textContent = lives;
        if (lives === 0) {
          endGame(false);
          return;
        } else {
          resetShip();
        }
      }

      for (let j = bullets.length - 1; j >= 0; j--) {
        const bullet = bullets[j];
        if (checkCollision(bullet, ast)) {
          bullets.splice(j, 1);
          score += 10;
          scoreDisplay.textContent = score;

          if (ast.radius > ASTEROID_MIN_SIZE / 2 + 5) {
            const newSize = ast.radius / 2;
            createAsteroids(2, ast.x, ast.y, newSize * 2);
          }
          asteroids.splice(i, 1);
          allAsteroidsDestroyed = false; // No todas las balas pueden haber sido destruidas, ¡importante!
          break;
        }
      }
    }

    allAsteroidsDestroyed = asteroids.length === 0; // Re-verifica si no quedan asteroides después de las colisiones

    // --- Lógica de Nivel Completado ---
    if (allAsteroidsDestroyed && gameRunning) {
      level++; // Incrementa el nivel actual

      if (level <= TOTAL_LEVELS) {
        // Si aún hay niveles por jugar...
        setTimeout(() => {
          // Pequeño retraso antes de iniciar el siguiente nivel
          resetShip(); // Reinicia la nave para el nuevo nivel
          // Genera asteroides para el nuevo nivel.
          // La cantidad aumenta con el nivel.
          createAsteroids(
            INITIAL_ASTEROIDS + level * 3 + Math.floor(level / 3)
          );
        }, 1000); // 1 segundo de pausa
      } else {
        // Si ya se completaron todos los niveles...
        endGame(true); // ¡El jugador ha ganado el juego!
      }
    }
  }

  function resetShip() {
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
    ship.vx = 0;
    ship.vy = 0;
    ship.angle = Math.PI / 2;
    ship.rotation = 0;
    ship.thrusting = false;
    ship.hitCooldown = 120;
    ship.blinkOn = true;
    ship.blinkTimer = 0;
    bullets = [];
  }

  // --- Bucle Principal del Juego ---
  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawShip();
    drawAsteroids();
    drawBullets();

    update();

    if (gameRunning) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  // --- Control de Flujo del Juego ---
  function initGame() {
    score = 0;
    lives = 3;
    level = 1; // Comenzar en el nivel 1
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;

    asteroids = [];
    createAsteroids(INITIAL_ASTEROIDS); // Generar los asteroides iniciales del nivel 1
    resetShip();

    gameRunning = true;
    ballLaunched = true;

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function endGame(win) {
    gameRunning = false;
    ballLaunched = false;
    cancelAnimationFrame(animationFrameId);

    gameOverScreen.classList.remove("hidden");
    if (win) {
      gameOverTitle.textContent = "¡VICTORIA CÓSMICA!";
      gameOverTitle.style.color = "#2ecc71";
      gameOverMessage.textContent = `¡Felicidades, Comandante! Sobreviviste a todos los ${TOTAL_LEVELS} niveles. Tu puntuación final: ${score}`;
    } else {
      gameOverTitle.textContent = "¡Juego Terminado!";
      gameOverTitle.style.color = "#e74c3c";
      gameOverMessage.textContent = `Tu nave fue destruida. Tu puntuación final: ${score}`;
    }
  }

  // --- Event Listeners para los botones de la UI ---
  startButton.addEventListener("click", initGame);
  restartButton.addEventListener("click", initGame);

  // Dibuja la nave y algunos asteroides de muestra para la pantalla de inicio
  drawShip();
  createAsteroids(INITIAL_ASTEROIDS);
  drawAsteroids();
});
