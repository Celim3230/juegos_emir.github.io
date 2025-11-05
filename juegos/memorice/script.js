///////////////  USAR IMÁGENES ///////////////

// Imagenes de frutas
/* let img1 = [(innerHTML = `<div><img src="img/frutas/img1.png" width='150'></div>`)]; */
/* let img2 = [(innerHTML = `<div><img src="img/frutas/img2.png" width='150'></div>`)]; */
/* let img3 = [(innerHTML = `<div><img src="img/frutas/img3.png" width='150'></div>`)]; */
/* let img4 = [(innerHTML = `<div><img src="img/frutas/img4.png" width='150'></div>`)]; */
/* let img5 = [(innerHTML = `<div><img src="img/frutas/img5.png" width='150'></div>`)]; */
/* let img6 = [(innerHTML = `<div><img src="img/frutas/img6.png" width='150'></div>`)]; */
/* let img7 = [(innerHTML = `<div><img src="img/frutas/img7.png" width='150'></div>`)]; */

// Imagenes de historias biblicas
/* let img1 = [
  (innerHTML = `<div><img src="img/historiasbiblicas/h1.png" width='150'></div>`),
];
let img2 = [
  (innerHTML = `<div><img src="img/historiasbiblicas/h2.png" width='150'></div>`),
];
let img3 = [
  (innerHTML = `<div><img src="img/historiasbiblicas/h3.png" width='150'></div>`),
];
let img4 = [
  (innerHTML = `<div><img src="img/historiasbiblicas/h4.png" width='150'></div>`),
];
let img5 = [
  (innerHTML = `<div><img src="img/historiasbiblicas/h5.png" width='150'></div>`),
];
let img6 = [
  (innerHTML = `<div><img src="img/historiasbiblicas/h6.png" width='150'></div>`),
];
let img7 = [
  (innerHTML = `<div><img src="img/historiasbiblicas/h7.png" width='150'></div>`),
]; */

// Imagenes de animales
let img1 = [
  (innerHTML = `<div><img src="img/animales/a1.png" width='150'></div>`),
];
let img2 = [
  (innerHTML = `<div><img src="img/animales/a2.png" width='150'></div>`),
];
let img3 = [
  (innerHTML = `<div><img src="img/animales/a3.png" width='150'></div>`),
];
let img4 = [
  (innerHTML = `<div><img src="img/animales/a4.png" width='150'></div>`),
];
let img5 = [
  (innerHTML = `<div><img src="img/animales/a5.png" width='150'></div>`),
];
let img6 = [
  (innerHTML = `<div><img src="img/animales/a6.png" width='150'></div>`),
];
let img7 = [
  (innerHTML = `<div><img src="img/animales/a7.png" width='150'></div>`),
];

/////////////////////////////////////////////
const totalCards = 14;

// Imágenes
const availableCards = [img1, img2, img3, img4, img5, img6, img7];

// Letras
//const availableCards = ["A", "B", "H", "I", "R", "W", "Z"];

// Numeros
//const availableCards = ["1", "2", "3", "4", "5", "6", "7"];

// Libros de la bíblia
/* const availableCards = [
  "Hechos",
  "Daniel",
  "Job",
  "Mateo",
  "Salmos",
  "Génesis",
  "Éxodo",
]; */

// Nombres de la bíblia
/* const availableCards = [
  "Jesús",
  "Rut",
  "María",
  "Pedro",
  "Moisés",
  "Daniel",
  "David",
]; */

let cards = [];
let selectedCards = [];
let valuesUsed = [];
let currentMove = 0;
let currentAttempts = 0;

let cardTemplate =
  '<div class="card"><div class="back"></div><div class="face"></div></div>';

function activate(e) {
  if (currentMove < 2) {
    if (
      (!selectedCards[0] || selectedCards[0] !== e.target) &&
      !e.target.classList.contains("active")
    ) {
      e.target.classList.add("active");
      selectedCards.push(e.target);

      if (++currentMove == 2) {
        currentAttempts++;
        document.querySelector("#stats").innerHTML =
          currentAttempts + " intentos";

        if (
          selectedCards[0].querySelectorAll(".face")[0].innerHTML ==
          selectedCards[1].querySelectorAll(".face")[0].innerHTML
        ) {
          selectedCards = [];
          currentMove = 0;
        } else {
          setTimeout(() => {
            selectedCards[0].classList.remove("active");
            selectedCards[1].classList.remove("active");
            selectedCards = [];
            currentMove = 0;
          }, 600);
        }
      }
    }
  }
}

function randomValue() {
  let rnd = Math.floor(Math.random() * totalCards * 0.5);
  let values = valuesUsed.filter((value) => value === rnd);
  if (values.length < 2) {
    valuesUsed.push(rnd);
  } else {
    randomValue();
  }
}

function getFaceValue(value) {
  let rtn = value;
  if (value < availableCards.length) {
    rtn = availableCards[value];
  }
  return rtn;
}

for (let i = 0; i < totalCards; i++) {
  let div = document.createElement("div");
  div.innerHTML = cardTemplate;
  cards.push(div);
  document.querySelector("#game").append(cards[i]);
  randomValue();
  cards[i].querySelectorAll(".face")[0].innerHTML = getFaceValue(valuesUsed[i]);
  cards[i].querySelectorAll(".card")[0].addEventListener("click", activate);
}
