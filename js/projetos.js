// Carrossel de projetos.
// 1. Busca os repositórios do GitHub e monta um card para cada um.
// 2. O botão com seta avança um card; no fim, volta ao começo.

// =====================================================================
//  PAINEL DE CONTROLE dos projetos
// =====================================================================

const configProjetos = {
  usuario: "VictorGazarini", // seu usuário do GitHub
  // Só aparecem os repositórios marcados com este tópico no GitHub.
  // Deixe "" (vazio) para mostrar todos.
  topico: "portfolio",
  // Repositórios que nunca aparecem, mesmo marcados
  ignorar: ["VictorGazarini", "portfolio"],
  limite: 10, // quantos cards no máximo
  // true = os cards do GitHub entram ANTES dos cards escritos no HTML (os dois aparecem).
  // false = os cards do GitHub SUBSTITUEM os do HTML.
  manterCardsDoHtml: true,
  // Quanto tempo (em milissegundos) a seta fica visível depois que o mouse para
  tempoParaSumirASeta: 1500,
};

// =====================================================================

const trilho = document.getElementById("trilho-projetos");
const botaoProximo = document.getElementById("proximo-projeto");

// Ícone do GitHub (Simple Icons), do mesmo tamanho do texto das etiquetas
const ICONE_GITHUB =
  '<svg viewBox="0 0 24 24" class="size-5" fill="currentColor" aria-hidden="true">' +
  '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>' +
  "</svg>";

// Filtra e ordena a lista que veio do GitHub
function escolherRepositorios(repositorios) {
  return repositorios
    .filter((repo) => !repo.fork && !repo.archived)
    .filter((repo) => !configProjetos.ignorar.includes(repo.name))
    .filter((repo) => configProjetos.topico === "" || (repo.topics || []).includes(configProjetos.topico))
    .slice(0, configProjetos.limite);
}

// Cria o card de um repositório, no mesmo visual dos cards do HTML.
// Os textos entram com textContent (e não innerHTML): assim, nada que venha
// da API é interpretado como código na página.
function criarCard(repo) {
  const item = document.createElement("li");
  item.className = "snap-start shrink-0 w-64 md:w-72 lg:w-80";

  const link = document.createElement("a");
  link.href = repo.html_url;
  link.target = "_blank";
  link.rel = "noopener";
  link.className =
    "h-full min-h-56 md:min-h-64 rounded-xl bg-[#c9d0d9] text-black p-6 flex flex-col hover:bg-white transition-colors";

  const nome = document.createElement("h3");
  nome.className = "text-base md:text-lg font-semibold break-words";
  nome.textContent = repo.name.replace(/[-_]/g, " "); // "meu-projeto" vira "meu projeto"

  const descricao = document.createElement("p");
  descricao.className = "text-sm mt-3 flex-1";
  descricao.textContent = repo.description || "Sem descrição ainda.";

  // Etiquetas: a linguagem principal + os tópicos (menos o tópico do filtro)
  const etiquetas = [repo.language, ...(repo.topics || [])]
    .filter((etiqueta) => etiqueta && etiqueta !== configProjetos.topico)
    .slice(0, 4);
  // Rodapé: ícone do GitHub no canto inferior esquerdo + etiquetas ao lado
  const rodape = document.createElement("div");
  rodape.className = "flex items-center gap-2 mt-4";

  const icone = document.createElement("span");
  icone.className = "shrink-0";
  icone.setAttribute("aria-label", "Repositório no GitHub");
  // O SVG é um texto fixo escrito aqui (não vem da API), então pode usar innerHTML
  icone.innerHTML = ICONE_GITHUB;

  const textoEtiquetas = document.createElement("p");
  textoEtiquetas.className = "text-xs opacity-70";
  textoEtiquetas.textContent = etiquetas.join(" · ");

  rodape.append(icone, textoEtiquetas);
  link.append(nome, descricao, rodape);
  item.append(link);
  return item;
}

// "async" permite usar "await": esperar a resposta da internet sem travar a página
async function carregarRepositorios() {
  try {
    const endereco =
      "https://api.github.com/users/" + configProjetos.usuario + "/repos?per_page=100&sort=pushed";
    const resposta = await fetch(endereco);
    if (!resposta.ok) return; // API fora do ar ou limite atingido: ficam os cards do HTML

    const repositorios = escolherRepositorios(await resposta.json());
    if (repositorios.length === 0) return; // nenhum marcado: ficam os cards do HTML

    const cardsDoGithub = repositorios.map(criarCard);

    if (configProjetos.manterCardsDoHtml) {
      // Tira do HTML os cards que já vieram do GitHub (data-repo = nome do repositório),
      // para o mesmo projeto não aparecer duas vezes
      const nomes = repositorios.map((repo) => repo.name);
      for (const card of trilho.querySelectorAll("[data-repo]")) {
        if (nomes.includes(card.dataset.repo)) card.remove();
      }
      // Coloca os do GitHub no começo do carrossel
      trilho.prepend(...cardsDoGithub);
    } else {
      // Troca os cards escritos à mão pelos do GitHub
      trilho.replaceChildren(...cardsDoGithub);
    }
  } catch (erro) {
    // Sem internet: ficam os cards do HTML
  }
}

carregarRepositorios();

// ===== Setas: avançar e voltar =====

const botaoAnterior = document.getElementById("projeto-anterior");

// Um "passo" = largura de um card + o espaço entre os cards (gap)
function tamanhoDoPasso() {
  const primeiroCard = trilho.querySelector("li");
  return primeiroCard.offsetWidth + parseFloat(getComputedStyle(trilho).columnGap);
}

botaoProximo.addEventListener("click", () => {
  // Chegou ao fim? Volta para o primeiro card. Senão, avança um.
  const noFim = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 5;
  if (noFim) {
    trilho.scrollTo({ left: 0 });
  } else {
    trilho.scrollBy({ left: tamanhoDoPasso() });
  }
});

botaoAnterior.addEventListener("click", () => {
  // Está no começo? Vai para o último card. Senão, volta um.
  const noComeco = trilho.scrollLeft <= 5;
  if (noComeco) {
    trilho.scrollTo({ left: trilho.scrollWidth });
  } else {
    trilho.scrollBy({ left: -tamanhoDoPasso() });
  }
});

// ===== Setas aparecem do lado do mouse e somem sozinhas =====

const areaDoCarrossel = trilho.parentElement;
let temporizador;

// lado: "esquerda", "direita" ou null (nenhuma)
function mostrarSeta(lado) {
  botaoAnterior.toggleAttribute("data-visivel", lado === "esquerda");
  botaoProximo.toggleAttribute("data-visivel", lado === "direita");
}

areaDoCarrossel.addEventListener("mousemove", (evento) => {
  // Mouse na metade esquerda do carrossel? Seta da esquerda. Senão, da direita.
  const caixa = areaDoCarrossel.getBoundingClientRect();
  const metade = caixa.left + caixa.width / 2;
  mostrarSeta(evento.clientX < metade ? "esquerda" : "direita");

  // Recomeça a contagem para sumir; se o mouse estiver em cima de uma seta, ela fica
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    if (!areaDoCarrossel.querySelector("button:hover")) mostrarSeta(null);
  }, configProjetos.tempoParaSumirASeta);
});

// Mouse saiu do carrossel: esconde as duas
areaDoCarrossel.addEventListener("mouseleave", () => {
  clearTimeout(temporizador);
  mostrarSeta(null);
});
