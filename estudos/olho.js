// O olho em ASCII
// Rode no terminal com: node estudos/olho.js

// ===== Escolhas (mexa à vontade) =====
const largura = 61; // quantos caracteres por linha
const altura = 19;  // quantas linhas

// Uma "receita" que desenha o olho.
// abertura:  0 = fechado, 1 = aberto
// dilatacao: 0 = pupila pequena, 1 = pupila grande
function desenharOlho(abertura, dilatacao) {
  const centroX = (largura - 1) / 2;
  const centroY = (altura - 1) / 2;

  const raioIris = 0.38;
  const raioPupila = 0.1 + dilatacao * 0.2;
  const espessuraBorda = 0.05;

  let desenho = "";

  for (let linha = 0; linha < altura; linha++) {
    for (let coluna = 0; coluna < largura; coluna++) {
      // Posição da célula em relação ao centro (centro = 0, bordas = -1 e 1).
      // O y vale dobrado porque cada caractere é duas vezes mais alto que largo.
      const x = (coluna - centroX) / centroX;
      const y = ((linha - centroY) / centroX) * 2;

      // Distância até o centro (a mesma ideia do círculo)
      const distancia = Math.sqrt(x * x + y * y);

      // Altura da pálpebra nesta coluna: maior no meio, zero nas pontas
      const alturaPalpebra = abertura * 0.42 * (1 - x * x);

      // Quanto esta célula está acima (+) ou abaixo (-) da linha da pálpebra
      const foraDaPalpebra = Math.abs(y) - alturaPalpebra;

      if (Math.abs(x) > 1) {
        desenho += " "; // além das pontas do olho
      } else if (Math.abs(foraDaPalpebra) < espessuraBorda) {
        desenho += "#"; // em cima da linha da pálpebra
      } else if (foraDaPalpebra > 0) {
        desenho += " "; // fora do olho
      } else if (distancia < raioPupila) {
        desenho += "4"; // pupila
      } else if (distancia < raioIris) {
        desenho += "$"; // íris
      } else {
        desenho += " "; // parte branca do olho
      }
    }
    desenho += "\n";
  }

  return desenho;
}

// ===== Testes: o olho em vários estados =====
console.log("Fechado:");
console.log(desenharOlho(0, 0));

console.log("Meio aberto:");
console.log(desenharOlho(0.5, 0));

console.log("Aberto:");
console.log(desenharOlho(1, 0));

console.log("Aberto e dilatado:");
console.log(desenharOlho(1, 1));
