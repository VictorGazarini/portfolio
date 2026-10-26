// Menu do hambúrguer: abre e fecha o painel com os links.

const botaoMenu = document.getElementById("botao-menu");
const menu = document.getElementById("menu");

// aberto: true abre, false fecha
function definirMenu(aberto) {
  menu.hidden = !aberto;
  // data-aberto faz as três linhas do botão virarem um X (classes group-data-aberto:)
  botaoMenu.toggleAttribute("data-aberto", aberto);
  // Para leitores de tela: avisa se o menu está aberto e o que o botão faz agora
  botaoMenu.setAttribute("aria-expanded", aberto);
  botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  // Com o menu aberto, a página de trás não rola
  document.body.classList.toggle("overflow-hidden", aberto);
}

// Clique no hambúrguer: se está fechado, abre; se está aberto, fecha
botaoMenu.addEventListener("click", () => definirMenu(menu.hidden));

// Clicou num link do menu: fecha (a página já vai rolar até a seção)
for (const link of menu.querySelectorAll("a")) {
  link.addEventListener("click", () => definirMenu(false));
}

// Tecla Esc fecha o menu
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && !menu.hidden) {
    definirMenu(false);
    botaoMenu.focus();
  }
});
