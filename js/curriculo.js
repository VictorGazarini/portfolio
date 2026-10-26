// Botão "baixar PDF": abre a janela de impressão do navegador.
// Lá, em "Destino", escolha "Salvar como PDF". Os estilos print: do HTML
// deixam a versão impressa com fundo branco, texto preto e sem a barra do topo.

document.getElementById("baixar-pdf").addEventListener("click", () => {
  window.print();
});
