// Botão de tema: alterna entre o escuro (padrão) e o Solarized Light.
// O tema fica no atributo data-tema do <html>: o src/input.css troca todas as
// cores do site a partir dele. A escolha fica salva no navegador (localStorage),
// e o <script> no <head> de cada página a aplica antes de a página aparecer.

const botaoTema = document.getElementById("botao-tema");

function temaAtual() {
  return document.documentElement.dataset.tema === "claro" ? "claro" : "escuro";
}

// O leitor de tela anuncia o que o botão FAZ (mudar para o outro tema)
function atualizarRotulo() {
  botaoTema.setAttribute(
    "aria-label",
    temaAtual() === "claro" ? "Mudar para o tema escuro" : "Mudar para o tema claro"
  );
}

function aplicarTema(tema) {
  if (tema === "claro") {
    document.documentElement.dataset.tema = "claro";
  } else {
    delete document.documentElement.dataset.tema;
  }
  atualizarRotulo();

  // Guarda a escolha (em janela anônima ou com bloqueio pode falhar; tudo bem)
  try {
    localStorage.setItem("tema", tema);
  } catch (erro) {}

  // Avisa quem precisa redesenhar com as cores novas (o olho em ASCII)
  window.dispatchEvent(new Event("tema"));
}

botaoTema.addEventListener("click", () => {
  aplicarTema(temaAtual() === "claro" ? "escuro" : "claro");
});

// Ao clicar num link para outra página do site (ex.: o currículo), o tema vai junto
// no endereço (?tema=claro). Assim a página nova abre no tema certo mesmo quando o
// navegador não compartilha o que foi salvo (arquivo aberto direto, outra origem...).
document.addEventListener("click", (evento) => {
  const link = evento.target.closest("a[href]");
  if (!link) return;
  const destino = new URL(link.href, location.href);
  const outraPaginaDoSite =
    destino.origin === location.origin &&
    destino.pathname.endsWith(".html") &&
    destino.pathname !== location.pathname;
  if (!outraPaginaDoSite) return;

  // Vai sempre, inclusive "escuro": senão um "claro" antigo salvo poderia valer
  destino.searchParams.set("tema", temaAtual());
  link.href = destino.href;
});

// O tema mudou em OUTRA aba do site (ex.: portfólio e currículo abertos juntos)?
// O navegador avisa com o evento "storage", e esta aba acompanha.
window.addEventListener("storage", (evento) => {
  if (evento.key === "tema") aplicarTema(evento.newValue === "claro" ? "claro" : "escuro");
});

atualizarRotulo();
