// Passo 1: desenhar um círculo em ASCII
// Rode no terminal com: node estudos/circulo.js

const largura = 40; // quantas colunas (caracteres por linha)
const altura = 20;  // quantas linhas
const raio = 0.9;   // tamanho do círculo (1 = encosta nas bordas)

let desenho = "";

// Percorre a grade: para cada linha...
for (let linha = 0; linha < altura; linha++) {
  // ...passa por cada coluna
  for (let coluna = 0; coluna < largura; coluna++) {
    // Converte a posição na grade para coordenadas de -1 a 1
    // (0 é o centro, -1 é a borda esquerda/de cima, 1 é a direita/de baixo)
    const x = (coluna / (largura - 1)) * 2 - 1;
    const y = (linha / (altura - 1)) * 2 - 1;

    // Distância deste ponto até o centro (teorema de Pitágoras)
    const distancia = Math.sqrt(x * x + y * y);

    // Dentro do círculo? Desenha "#". Fora? Espaço.
    if (distancia < raio) {
      desenho += ".";
    } else {
      desenho += " ";
    }
  }
  desenho += "\n"; // terminou a linha: pula para a próxima
}

console.log(desenho);
