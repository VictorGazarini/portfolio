// Sessão de terminal na primeira tela: os comandos são digitados letra por letra,
// as respostas aparecem de uma vez, e no fim o cursor fica piscando até a pessoa
// rolar a página. Mostra quem você é (nome e cargo) logo de cara.

// =====================================================================
//  PAINEL DE CONTROLE da sessão de terminal
// =====================================================================

const configDica = {
  prompt: "> ", // aparece de uma vez antes de cada comando, como num terminal
  // A sessão, em ordem:
  //   comando = digitado letra por letra, depois do prompt
  //   saida   = a resposta do comando: surge embaralhada e vai se decodificando
  sessao: [
    { tipo: "comando", texto: "whoami" },
    { tipo: "saida", texto: "/victor gazarini" },
    { tipo: "comando", texto: "saiba mais ↓" },
  ],
  esperaAntesDeDigitar: 800, // milissegundos até começar a digitar
  esperaEntreLinhas: 450,    // pausa entre uma linha e a próxima
  // Tempo entre uma letra e outra (em milissegundos). Cada letra sorteia um
  // valor entre os dois: a variação deixa parecido com uma pessoa digitando.
  intervaloMinimo: 60,
  intervaloMaximo: 180,
  chanceDePausa: 0.12,       // chance de uma "hesitação" depois de uma letra (0 a 1)
  duracaoDaPausa: 350,       // quanto dura essa hesitação

  // A resposta (saida) aparece "decodificando": começa embaralhada com estes
  // símbolos e as letras vão se acertando da esquerda para a direita
  caracteresDaDecodificacao: "-+?°",
  duracaoDaDecodificacao: 900, // milissegundos até a resposta ficar inteira
};

// =====================================================================

const terminal = document.getElementById("terminal");

// O cursor é um só: ele "anda" para o fim da linha que está sendo escrita
const cursor = document.createElement("span");
cursor.textContent = "█";

// Quem pediu ao sistema menos animação vê tudo pronto e o cursor parado
const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Espera "ms" milissegundos (usado com await para pausar entre as letras)
function esperar(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

// Cria uma linha nova no terminal e devolve o lugar onde o texto vai entrar
function novaLinha(tipo) {
  const linha = document.createElement("div");
  linha.className = "whitespace-pre-wrap";
  const texto = document.createElement("span");
  // A resposta fica um pouco mais clara que os comandos
  if (tipo === "saida") texto.className = "text-gray-100";
  linha.append(texto, cursor); // o cursor vai junto para a linha nova
  terminal.append(linha);
  return texto;
}

// A resposta surge embaralhada e vai se "consertando" da esquerda para a direita
async function decodificar(alvo, texto) {
  const simbolos = configDica.caracteresDaDecodificacao;
  const inicio = performance.now();
  let progresso = 0;

  while (progresso < 1) {
    progresso = Math.min(1, (performance.now() - inicio) / configDica.duracaoDaDecodificacao);
    // Quantas letras, a partir da esquerda, já estão certas
    const letrasCertas = Math.floor(texto.length * progresso);

    let embaralhado = "";
    for (let i = 0; i < texto.length; i++) {
      if (i < letrasCertas || texto[i] === " ") {
        embaralhado += texto[i];
      } else {
        embaralhado += simbolos[Math.floor(Math.random() * simbolos.length)];
      }
    }
    alvo.textContent = embaralhado;
    await esperar(40); // troca os símbolos umas 25 vezes por segundo
  }
}

async function digitarSessao() {
  if (semMovimento) {
    for (const { tipo, texto } of configDica.sessao) {
      novaLinha(tipo).textContent = (tipo === "comando" ? configDica.prompt : "") + texto;
    }
    return;
  }

  await esperar(configDica.esperaAntesDeDigitar);

  // Enquanto digita, o cursor fica aceso (como num terminal de verdade)
  for (const { tipo, texto } of configDica.sessao) {
    const alvo = novaLinha(tipo);

    if (tipo === "saida") {
      await decodificar(alvo, texto); // resposta: surge decodificando
    } else {
      alvo.textContent = configDica.prompt;
      for (const letra of texto) {
        alvo.textContent += letra;

        const intervalo =
          configDica.intervaloMinimo +
          Math.random() * (configDica.intervaloMaximo - configDica.intervaloMinimo);
        await esperar(intervalo);

        if (Math.random() < configDica.chanceDePausa) {
          await esperar(configDica.duracaoDaPausa);
        }
      }
    }

    await esperar(configDica.esperaEntreLinhas);
  }

  // Terminou: o cursor começa a piscar, sem parar
  cursor.classList.add("animate-piscar");
}

// Rolou a página? O terminal some. Voltou ao topo? Ele aparece de novo.
function atualizarVisibilidade() {
  terminal.toggleAttribute("data-oculto", window.scrollY > 10);
}

window.addEventListener("scroll", atualizarVisibilidade, { passive: true });
atualizarVisibilidade();
digitarSessao();
