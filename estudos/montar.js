for (let linha = 0; linha < 5; linha++) {
  let texto = "";

  for (let coluna = 0; coluna < 20; coluna++) {
    if (linha == 0 || linha == 4 || coluna == 0 || coluna == 19) {
      texto = texto + "#";
    } else {
      texto = texto + " ";
    }
  }
  console.log(texto);
}