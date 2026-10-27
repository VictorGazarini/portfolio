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
// Aceita só endereços http/https (o campo "About" do repositório é texto livre)
function linkSeguro(endereco) {
  try {
    const url = new URL(endereco);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch (erro) {
    return null; // vazio ou inválido
  }
}

function criarCard(repo) {
  const item = document.createElement("li");
  item.className = "snap-start shrink-0 w-64 md:w-72 lg:w-80";

  // Para onde o card leva: o site do projeto (o link do "About" do repositório)
  // ou, se ele não tiver site, o próprio repositório
  const site = linkSeguro(repo.homepage);
  const nomeDoProjeto = repo.name.replace(/[-_]/g, " "); // "meu-projeto" vira "meu projeto"

  // relative: serve de referência para a "camada" do link (abaixo) cobrir o card todo
  const card = document.createElement("div");
  card.className =
    "relative h-full min-h-56 md:min-h-64 rounded-xl bg-cartao text-cartao-texto p-6 flex flex-col transition duration-300 hover:bg-cartao-hover hover:scale-[1.04]";

  // O link principal fica no título. after:absolute after:inset-0 cria uma camada
  // invisível que cobre o card inteiro: clicar em qualquer lugar do card abre o link
  const nome = document.createElement("h3");
  nome.className = "text-cartao-titulo text-base md:text-lg font-semibold break-words";
  const link = document.createElement("a");
  link.href = site || repo.html_url;
  link.target = "_blank";
  link.rel = "noopener";
  link.className = "after:absolute after:inset-0 after:content-['']";
  link.textContent = nomeDoProjeto;
  link.setAttribute("aria-label", nomeDoProjeto + (site ? ": abrir o site do projeto" : ": abrir o repositório"));
  nome.append(link);

  const descricao = document.createElement("p");
  descricao.className = "text-sm mt-3 flex-1";
  descricao.textContent = repo.description || "Sem descrição ainda.";

  // Etiquetas: todas as linguagens do repositório, da mais usada para a menos usada.
  // Se a lista não carregou, fica só a linguagem principal.
  const etiquetas = repo.linguagens && repo.linguagens.length ? repo.linguagens : [repo.language].filter(Boolean);
  // Rodapé: ícone do GitHub no canto inferior esquerdo + etiquetas ao lado
  const rodape = document.createElement("div");
  rodape.className = "flex items-start gap-2 mt-4";

  // O ícone do GitHub tem o próprio link (sempre para o código).
  // relative z-10: fica por cima da camada do card, então clicar nele abre o repositório
  const icone = document.createElement("a");
  icone.href = repo.html_url;
  icone.target = "_blank";
  icone.rel = "noopener";
  icone.className = "relative z-10 shrink-0 text-detalhe hover:scale-125 transition-transform";
  icone.setAttribute("aria-label", "Ver o código de " + nomeDoProjeto + " no GitHub");
  icone.title = "Ver o código no GitHub";
  // O SVG é um texto fixo escrito aqui (não vem da API), então pode usar innerHTML
  icone.innerHTML = ICONE_GITHUB;

  const textoEtiquetas = document.createElement("p");
  textoEtiquetas.className = "text-xs text-detalhe opacity-70";
  textoEtiquetas.textContent = etiquetas.join(" · ");

  rodape.append(icone, textoEtiquetas);

  card.append(nome, descricao, rodape);
  item.append(card);
  return item;
}

// Linguagens do repositório, da mais usada para a menos usada.
// A API devolve { "JavaScript": 14690, "HTML": 10771, ... } (quantidade de código de cada uma).
// Se falhar, repo.linguagens fica vazio e o card mostra só a linguagem principal.
async function buscarLinguagens(repo) {
  try {
    const resposta = await fetch(repo.languages_url);
    if (!resposta.ok) return;
    const quantidades = await resposta.json();
    repo.linguagens = Object.keys(quantidades).sort((a, b) => quantidades[b] - quantidades[a]);
  } catch (erro) {
    // sem internet ou limite da API: segue sem a lista
  }
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

    // Busca as linguagens de todos os repositórios ao mesmo tempo (Promise.all)
    await Promise.all(repositorios.map(buscarLinguagens));

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

// O carrossel está no primeiro card? (aí não há o que voltar)
function noComeco() {
  return trilho.scrollLeft <= 5;
}

botaoAnterior.addEventListener("click", () => {
  trilho.scrollBy({ left: -tamanhoDoPasso() });
});

// ===== Setas aparecem do lado do mouse e somem sozinhas =====

// A <div> do carrossel: o lado do mouse é calculado em relação a ela
const areaDoCarrossel = trilho.parentElement;
// A seção inteira: as setas ficam fora do carrossel, então o mouse precisa
// poder sair dele e chegar até a seta sem ela sumir no caminho
const secaoDosProjetos = trilho.closest("section");
let temporizador;

// lado: "esquerda", "direita" ou null (nenhuma).
// A da esquerda nunca aparece no primeiro card.
function mostrarSeta(lado) {
  botaoAnterior.toggleAttribute("data-visivel", lado === "esquerda" && !noComeco());
  botaoProximo.toggleAttribute("data-visivel", lado === "direita");
}

secaoDosProjetos.addEventListener("mousemove", (evento) => {
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

// Voltou para o primeiro card (clicando ou arrastando)? Esconde a seta da esquerda
trilho.addEventListener("scroll", () => {
  if (noComeco()) botaoAnterior.removeAttribute("data-visivel");
});

// Mouse saiu da seção: esconde as duas
secaoDosProjetos.addEventListener("mouseleave", () => {
  clearTimeout(temporizador);
  mostrarSeta(null);
});

