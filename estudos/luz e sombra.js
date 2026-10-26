const rampa = " .:-=+*;#%@";
const largura = 120;

let texto = "";

for (let coluna = 0; coluna < largura; coluna++) {
  // brilho vai de 0 (esquerda) até 1 (direita)
  const brilho = coluna / (largura - 1);

  // transforma o brilho em uma posição da rampa
  const posicao = Math.round(brilho * (rampa.length - 1));

  texto = texto + rampa[posicao];
}

console.log(texto);
