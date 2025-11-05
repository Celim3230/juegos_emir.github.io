const palabras = [
  "dios amor es",
  "sacrificio",
  "perdonados",
  "santuario",
  "sabado santo",
  "jonas",
  "abraham",
  "jesus",
  "juan el bautista",
  "jerusalen",
  "hebreos",
  "apostol santiago",
  "arbol de la vida",
  "israel",
  "romanos",
  "felipe",
  "ana",
  "apocalipsis",
  "salmos",
  "amor eterno",
  "temed a dios",
  "guardar sus mandamientos",
  "buenos mayordomos",
  "proclamad su venida",
  "cristo vive",
  "fe y esperanza",
  "el señor es mi pastor",
  "dios es amor",
  "gloria a dios",
  "camina en luz",
  "adora al señor",
  "jesus es el camino",
  "salvacion eterna",
  "perdon y gracia",
  "el espiritu santo",
  "confia en el señor",
  "mi roca eterna",
  "gracia infinita",
  "el reino de dios",
];

let palabra = "";
let errores = 0;
const maxErrores = 4;
let letrasAdivinadas = [];
let letrasUsadas = [];

function elegirPalabra() {
  palabra = palabras[Math.floor(Math.random() * palabras.length)];
}

function mostrarPalabra() {
  const palabrasHTML = palabra.split(" ").map((pal) => {
    const letrasHTML = pal
      .split("")
      .map((letra) => {
        return letrasAdivinadas.includes(letra)
          ? `<span class="letra">${letra}</span>`
          : `<span class="letra"></span>`;
      })
      .join("");

    return `<span class="palabra">${letrasHTML}</span>`;
  });

  document.getElementById("wordDisplay").innerHTML = palabrasHTML.join(
    "<span class='espacio'>&nbsp;</span>"
  );
}

function actualizarTeclado() {
  const teclado = document.getElementById("keyboard");
  teclado.innerHTML = "";
  for (let i = 65; i <= 90; i++) {
    const letra = String.fromCharCode(i).toLowerCase();
    const boton = document.createElement("button");
    boton.textContent = letra;
    boton.disabled = letrasUsadas.includes(letra);
    boton.onclick = () => manejarIntento(letra);
    teclado.appendChild(boton);
  }
}

function manejarIntento(letra) {
  if (letrasUsadas.includes(letra)) return;

  letrasUsadas.push(letra);
  document.getElementById("usedLetters").textContent = letrasUsadas.join(", ");

  if (palabra.includes(letra)) {
    letrasAdivinadas.push(letra);
    mostrarPalabra();
    revisarVictoria();
  } else {
    errores++;
    document.getElementById("mistakes").textContent = errores;
    revisarDerrota();
  }

  actualizarTeclado();
}

function revisarVictoria() {
  const letrasUnicas = new Set(palabra.replace(/ /g, ""));
  const todasAdivinadas = [...letrasUnicas].every((letra) =>
    letrasAdivinadas.includes(letra)
  );

  if (todasAdivinadas) {
    document.getElementById("message").textContent = "¡Ganaste! 🎉";
    desactivarTeclado();
  }
}

function revisarDerrota() {
  if (errores >= maxErrores) {
    document.getElementById(
      "message"
    ).textContent = `¡Perdiste! 😢 La frase era: "${palabra}"`;
    mostrarPalabra();
    desactivarTeclado();
  }
}

function desactivarTeclado() {
  document
    .querySelectorAll("#keyboard button")
    .forEach((btn) => (btn.disabled = true));
}

function reiniciarJuego() {
  errores = 0;
  letrasAdivinadas = [];
  letrasUsadas = [];
  document.getElementById("mistakes").textContent = errores;
  document.getElementById("usedLetters").textContent = "";
  document.getElementById("message").textContent = "";
  elegirPalabra();
  mostrarPalabra();
  actualizarTeclado();
}

window.onload = reiniciarJuego;
