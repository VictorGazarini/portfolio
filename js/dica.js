// Dica "saiba mais" no estilo terminal: o texto é digitado letra por letra
// e depois o cursor fica piscando até a pessoa rolar a página.

// =====================================================================
//  PAINEL DE CONTROLE da dica
// =====================================================================

const configDica = {
  prompt: "> ",               // aparece de uma vez, como o prompt de um terminal
  texto: "saiba mais ↓",     // é "digitado" letra por letra
  esperaAntesDeDigitar: 1200, // milissegundos até começar a digitar
  // Tempo entre uma letra e outra (em milissegundos). Cada letra sorteia um
  // valor entre os dois: a variação deixa parecido com uma pessoa digitando.
  intervaloMinimo: 60,
  intervaloMaximo: 180,
  chanceDePausa: 0.12,        // chance de uma "hesitação" depois de uma letra (0 a 1)
  duracaoDaPausa: 350,        // quanto dura essa hesitação
};

// =====================================================================

const dica = document.getElementById("dica-rolagem");
const textoDaDica = document.getElementById("dica-texto");
const cursor = document.getElementById("dica-cursor");

// Quem pediu ao sistema menos animação vê o texto pronto e o cursor parado
const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Espera "ms" milissegundos (usado com await para pausar entre as letras)
function esperar(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

async function digitar() {
  textoDaDica.textContent = configDica.prompt;

  if (semMovimento) {
    textoDaDica.textContent += configDica.texto;
    return;
  }

  await esperar(configDica.esperaAntesDeDigitar);

  // Enquanto digita, o cursor fica aceso (como num terminal de verdade)
  for (const letra of configDica.texto) {
    textoDaDica.textContent += letra;

    const intervalo =
      configDica.intervaloMinimo +
      Math.random() * (configDica.intervaloMaximo - configDica.intervaloMinimo);
    await esperar(intervalo);

    if (Math.random() < configDica.chanceDePausa) {
      await esperar(configDica.duracaoDaPausa);
    }
  }

  // Terminou de digitar: o cursor começa a piscar, sem parar
  cursor.classList.add("animate-piscar");
}

// Rolou a página? A dica some. Voltou ao topo? Ela aparece de novo.
function atualizarVisibilidade() {
  dica.toggleAttribute("data-oculto", window.scrollY > 10);
}

window.addEventListener("scroll", atualizarVisibilidade, { passive: true });
atualizarVisibilidade();
digitar();
