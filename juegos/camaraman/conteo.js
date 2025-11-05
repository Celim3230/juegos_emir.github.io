document.addEventListener("DOMContentLoaded", function () {
  const contar = document.getElementById("img_contador");
  const numero = document.getElementById("contador_numero");
  const maximo = document.getElementById("maximo");
  const reiniciarBtn = document.getElementById("btnReiniciar");

  const imagenInicial = "Camaraman.png";
  const imagen2 = "Camaraman2.png";
  const imagenTitan = "CamaramanTitan.png";
  const imagenLego = "camaramanlego.png";
  const imagenMinecraft = "camaramanminecraft.png";

  const img_mario1 = "mario1.png";
  const img_mario2 = "mario2.png";
  const img_mario3 = "mario3.png";
  const img_mario4 = "mario4.png";
  const img_mario5 = "mario5.png";
  const img_mario6 = "mario6.png";
  const img_mario7 = "mario7.png";

  let contador = 0;
  let puntajeMaximo = localStorage.getItem("puntajeMaximo") || 0;

  numero.textContent = contador;
  if (maximo) maximo.textContent = `Puntaje máximo: ${puntajeMaximo}`;

  // Crear objeto de sonido
  const sonidoClick = new Audio("Click.mp3");

  contar.addEventListener("click", function () {
    contador++;
    numero.textContent = contador;

    // Reproducir sonido en cada click
    sonidoClick.currentTime = 0;
    sonidoClick.play();

    // Cambiar imagen si llega a 10
    if (contador === 10) {
      contar.src = imagenLego;
    }
    if (contador === 50) {
      contar.src = imagenMinecraft;
    }
    if (contador === 100) {
      contar.src = imagen2;
    }
    if (contador === 300) {
      contar.src = imagenTitan;
    }
    if (contador === 500) {
      contar.src = img_mario1;
    }
    if (contador === 800) {
      contar.src = img_mario2;
    }
    if (contador === 1000) {
      contar.src = img_mario3;
    }
    if (contador === 1010) {
      contar.src = img_mario4;
    }
    if (contador === 1100) {
      contar.src = img_mario5;
    }
    if (contador === 1200) {
      contar.src = img_mario6;
    }
    if (contador === 1500) {
      contar.src = img_mario7;
    }

    if (contador > puntajeMaximo) {
      puntajeMaximo = contador;
      if (maximo) maximo.textContent = `Puntaje máximo: ${puntajeMaximo}`;
      localStorage.setItem("puntajeMaximo", puntajeMaximo);
    }
  });

  reiniciarBtn.addEventListener("click", function () {
    contador = 0;
    puntajeMaximo = 0;
    numero.textContent = contador;
    if (maximo) maximo.textContent = `Puntaje máximo: ${puntajeMaximo}`;
    localStorage.removeItem("puntajeMaximo");

    // Restaurar imagen original
    contar.src = imagenInicial;

    // Reproducir sonido también al reiniciar
    sonidoClick.currentTime = 0;
    sonidoClick.play();
  });

  const sliderVolumen = document.getElementById("volumen");

  // Setear volumen inicial
  sonidoClick.volume = sliderVolumen.value;

  sliderVolumen.addEventListener("input", () => {
    sonidoClick.volume = sliderVolumen.value;
  });
});
