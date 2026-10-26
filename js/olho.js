// O olho em ASCII: abre, dilata e "engole" a tela conforme a página rola.

// =====================================================================
//  PAINEL DE CONTROLE: personalize mudando os valores abaixo.
//  Salve o arquivo e a página atualiza sozinha (com o Live Server).
// =====================================================================

const config = {
  // ----- Caracteres -----
  // Rampa de sombreamento: do mais escuro (esquerda) ao mais claro (direita).
  // Experimente: " .oO@"  ou  " ░▒▓█"  ou  " .'-:;34$#@"
  rampa: " .:-=+*#%@",
  // Caracteres das partículas que saem da pupila (sorteados entre estes)
  caracteresPsicodelicos: "-+?°",

  // ----- Tamanho -----
  tamanhoDoOlho: 0.8, // quanto da largura da tela o olho ocupa (0 a 1)

  // ----- Formato e 3D -----
  alturaDoOlho: 0.4,     // o quanto o olho abre (maior = mais redondo)
  curvatura: 0.15,       // curva da pálpebra (0 = reta, 0.3 = bem curva)
  olhoDePeixe: 0.3,      // distorção de lente (0 = nenhuma, 0.6 = bem estufado)
  espessuraBorda: 0.045, // grossura do contorno das pálpebras
  tamanhoIris: 0.36,
  pupilaMinima: 0.09,    // tamanho da pupila no começo
  pupilaMaxima: 0.24,    // tamanho da pupila dilatada
  fibrasDaIris: 28,      // quantidade de "raios" desenhados na íris

  // ----- Luz e sombra -----
  luzX: -0.5,            // de onde vem a luz: -1 = esquerda, 1 = direita
  luzY: -0.6,            // -1 = de cima, 1 = de baixo
  sombraDaPalpebra: 0.6, // sombra embaixo da pálpebra (0 = nenhuma, 1 = bem escura)
  pele: 0.2,             // sombra da pele colada nas pálpebras (0 = invisível)
  reflexo: true,         // o pontinho de luz no olho (true = liga, false = desliga)

  // ----- Psicodelia (partículas saindo da pupila, estilo Matrix) -----
  particulasPorSegundo: 150, // quantas nascem por segundo (mais = tela mais cheia)
  velocidadeMinima: 10,      // velocidade das mais lentas (em caracteres por segundo)
  velocidadeMaxima: 50,      // velocidade das mais rápidas
  aceleracao: 1.2,           // o quanto aceleram ao se afastar (0 = velocidade constante)
  rastro: 3,                 // tamanho da "cauda" de cada partícula (0 = sem cauda)
  tremor: 1.5,               // o quanto mudam de direção no caminho (0 = linha reta)
  trocaDeCaractere: 0.15,    // chance de trocar de símbolo a cada quadro (0 a 1)

  // ----- Linha do tempo da rolagem -----
  // 0 = topo do hero, 1 = fim do hero. Cada efeito acontece num trecho.
  olhoAbreAte: 0.3,
  dilatacaoComeca: 0.3,
  dilatacaoTermina: 0.55,
  psicodeliaComeca: 0.4,
  psicodeliaTermina: 0.6,
  mergulhoComeca: 0.6,   // a partir daqui, a tela "entra" na pupila
  zoomMaximo: 12,        // o quanto aproxima no fim do mergulho

  // ----- Seções surgindo (Sobre Mim, Projetos, Redes Sociais) -----
  tamanhoInicialDaSecao: 0.5, // começa com metade do tamanho e cresce até o normal
  desfoqueInicial: 8,         // começa borrada (em pixels) e fica nítida
  distanciaParaSurgir: 0.7,   // quanto da tela a seção percorre até aparecer inteira

  // ----- Glitch dos títulos (SOBRE MIM, PROJETOS...) -----
  caracteresDoGlitch: "-+?°",  // símbolos que aparecem no lugar das letras
  distanciaDoGlitch: 0.5,      // quanto da tela o título percorre até se "consertar"
  intensidadeDoGlitch: 0.15,   // chance de letras já certas piscarem (0 a 1)
  separacaoDeCores: 2,         // o quanto o vermelho e o ciano se separam (em pixels)

  // ----- Partículas subindo junto com os títulos -----
  particulasDosTitulos: 12,     // quantas nascem por segundo em cada título (0 = desliga)
  velocidadeDeSubida: 35,       // em pixels por segundo
  duracaoDasParticulas: 1.2,    // segundos até sumir
  opacidadeDasParticulas: 0.4,  // 0 = invisível, 1 = totalmente visível
};

// =====================================================================
//  Daqui para baixo é a lógica. Não precisa mexer para personalizar.
// =====================================================================

const tela = document.getElementById("olho");    // o <pre> onde a cena aparece
const secao = document.getElementById("inicio"); // a seção alta do hero
const secoesQueSurgem = document.querySelectorAll("[data-surgir]");
const titulosComGlitch = document.querySelectorAll("[data-glitch]");

// Guarda o texto original de cada título (o glitch troca as letras temporariamente).
// O aria-label garante que leitores de tela sempre leiam o texto certo.
for (const titulo of titulosComGlitch) {
  titulo.dataset.texto = titulo.textContent;
  titulo.setAttribute("aria-label", titulo.textContent);
}

// Quantos caracteres cabem na tela, e o quanto cada um é mais alto que largo
let colunas = 0;
let linhas = 0;
let proporcao = 2;

// Mantém um número entre 0 e 1
function limitar(valor) {
  return Math.min(1, Math.max(0, valor));
}

// Vai de 0 a 1 de forma suave enquanto "valor" anda de "inicio" até "fim"
function suave(inicio, fim, valor) {
  const t = limitar((valor - inicio) / (fim - inicio));
  return t * t * (3 - 2 * t);
}

// Um número aleatório entre "minimo" e "maximo"
function sortear(minimo, maximo) {
  return minimo + Math.random() * (maximo - minimo);
}

// Um dos caracteres psicodélicos, escolhido ao acaso
function caractereAleatorio() {
  const opcoes = config.caracteresPsicodelicos;
  return opcoes[Math.floor(Math.random() * opcoes.length)];
}

// Mede o tamanho de um caractere para saber quantos cabem na tela
function medirTela() {
  const amostra = Array(10).fill("M".repeat(100)).join("\n");
  tela.innerHTML = "<span>" + amostra + "</span>";
  const caixa = tela.firstChild.getBoundingClientRect();
  const larguraCaractere = caixa.width / 100;
  const alturaCaractere = caixa.height / 10;

  proporcao = alturaCaractere / larguraCaractere;
  colunas = Math.floor(tela.clientWidth / larguraCaractere);
  linhas = Math.floor(tela.clientHeight / alturaCaractere);
}

// Quantos caracteres valem "1" na régua do olho (cabe na largura e na altura)
function calcularEscala() {
  return Math.min((colunas * config.tamanhoDoOlho) / 2, (linhas * proporcao) / 1.1);
}

function calcularRaioPupila(dilatacao) {
  return config.pupilaMinima + dilatacao * (config.pupilaMaxima - config.pupilaMinima);
}

// Converte um raio da régua do olho para caracteres na tela,
// desfazendo a lente (olho de peixe) e o zoom do mergulho
function raioNaTela(raio, zoom) {
  const alvo = raio * zoom;
  let r = alvo;
  if (alvo < 1) {
    // Dentro da lente: procura por tentativas o raio da tela que,
    // depois da distorção, vira o "alvo" (cada tentativa corta o intervalo pela metade)
    let menor = 0;
    let maior = 1;
    for (let i = 0; i < 20; i++) {
      r = (menor + maior) / 2;
      if (r * (1 - config.olhoDePeixe * (1 - r * r)) < alvo) {
        menor = r;
      } else {
        maior = r;
      }
    }
  }
  return r * calcularEscala();
}

// Desenha o olho e devolve uma grade: uma lista de linhas, cada linha uma lista de caracteres
// abertura, dilatacao: de 0 a 1 | zoom: 1 = normal
function desenharOlho(abertura, dilatacao, zoom) {
  const rampa = config.rampa;
  const escala = calcularEscala();
  const centroColuna = (colunas - 1) / 2;
  const centroLinha = (linhas - 1) / 2;

  const raioPupila = calcularRaioPupila(dilatacao);
  const raioIris = config.tamanhoIris;

  // Direção da luz, com comprimento 1 (para a conta de luz funcionar)
  const comprimento = Math.hypot(config.luzX, config.luzY, 0.7);
  const luzX = config.luzX / comprimento;
  const luzY = config.luzY / comprimento;
  const luzZ = 0.7 / comprimento;

  const grade = [];

  for (let linha = 0; linha < linhas; linha++) {
    const fileira = [];

    for (let coluna = 0; coluna < colunas; coluna++) {
      // Posição em relação ao centro do olho (na régua do olho)
      let x = (coluna - centroColuna) / escala;
      let y = ((linha - centroLinha) * proporcao) / escala;

      // Efeito 1: olho de peixe. Pontos perto do centro são "esticados",
      // como numa lente, e o desenho parece estufado.
      const raioAoQuadrado = x * x + y * y;
      if (raioAoQuadrado < 1) {
        const fator = 1 - config.olhoDePeixe * (1 - raioAoQuadrado);
        x *= fator;
        y *= fator;
      }

      // Mergulho: dividir pelo zoom aproxima tudo do centro
      x /= zoom;
      y /= zoom;

      const distancia = Math.sqrt(x * x + y * y);

      // Efeito 2: volume. Tratamos o olho como uma bola: "z" é o quanto
      // o ponto está virado para a frente. "luz" diz quanto de luz ele recebe.
      const z = Math.sqrt(Math.max(0, 1 - x * x - y * y));
      const luz = Math.max(0, x * luzX + y * luzY + z * luzZ);

      // Efeito 3: pálpebras curvas. Fechadas, elas formam um arco (‿)
      const formato = 1 - x * x; // 1 no meio, 0 nas pontas
      const linhaDoMeio = -config.curvatura * x * x;
      const palpebraDeCima = linhaDoMeio - abertura * config.alturaDoOlho * formato;
      const palpebraDeBaixo = linhaDoMeio + abertura * config.alturaDoOlho * 0.75 * formato;
      const abaixoDaDeCima = y - palpebraDeCima;    // positivo = dentro do olho
      const acimaDaDeBaixo = palpebraDeBaixo - y;   // positivo = dentro do olho

      const entreAsPontas = Math.abs(x) <= 1;
      const naBorda =
        entreAsPontas &&
        (Math.abs(abaixoDaDeCima) < config.espessuraBorda ||
          Math.abs(acimaDaDeBaixo) < config.espessuraBorda);
      const dentroDoOlho = entreAsPontas && abaixoDaDeCima > 0 && acimaDaDeBaixo > 0;

      // Efeito 4: luz e sombra. Calculamos o "brilho" (0 a 1) de cada célula
      let brilho;

      if (naBorda) {
        brilho = 0.55 + 0.4 * luz;
      } else if (!dentroDoOlho) {
        // Pele: uma sombra suave colada nas pálpebras, que some ao se afastar
        const distanciaDaPalpebra = Math.min(Math.abs(abaixoDaDeCima), Math.abs(acimaDaDeBaixo));
        brilho = entreAsPontas ? config.pele * (1 - suave(0, 0.12, distanciaDaPalpebra)) : 0;
      } else if (distancia < raioPupila) {
        brilho = 0; // pupila: escuro total
      } else if (distancia < raioIris) {
        // Íris: 0 perto da pupila, 1 na borda da íris
        const t = (distancia - raioPupila) / (raioIris - raioPupila);
        // Fibras: uma onda que dá voltas em torno do centro
        const angulo = Math.atan2(y, x);
        const fibra =
          0.5 + 0.5 * Math.sin(angulo * config.fibrasDaIris + Math.sin(angulo * 5) * 2 + t * 4);
        brilho = (0.35 + 0.55 * fibra) * (0.6 + 0.4 * luz);
        brilho += 0.25 * (1 - suave(0, 0.25, t)); // anel claro em volta da pupila
        brilho *= 1 - 0.85 * suave(0.75, 1, t);    // contorno escuro da íris
      } else {
        brilho = 0.1 + 0.4 * luz; // parte branca do olho
      }

      // Sombra que a pálpebra de cima faz no olho
      if (dentroDoOlho) {
        brilho *= 1 - config.sombraDaPalpebra * (1 - suave(0, 0.2, abaixoDaDeCima));
      }

      // Reflexo: um pontinho bem claro do lado de onde vem a luz
      if (config.reflexo && dentroDoOlho && zoom < 1.5) {
        const rx = x - config.luzX * 0.18;
        const ry = y - config.luzY * 0.18;
        if (rx * rx + ry * ry < 0.0025) {
          brilho = 1;
        }
      }

      // Transforma o brilho num caractere da rampa
      fileira.push(rampa[Math.round(limitar(brilho) * (rampa.length - 1))]);
    }

    grade.push(fileira);
  }

  return grade;
}

// ===== Efeito 5: partículas (psicodelia estilo Matrix) =====
// Cada partícula é um caractere com direção, velocidade e símbolo sorteados.
// Ela nasce na borda da pupila e voa para fora até sair da tela.

let particulas = [];

// dt = quanto tempo passou desde o último quadro (em segundos)
function atualizarParticulas(psicodelia, raioDaPupilaNaTela, dt) {
  // Nascimento: quanto maior a psicodelia, mais partículas por segundo.
  // O ritmo varia a cada quadro, então elas saem em rajadas irregulares.
  const quantasNascem = config.particulasPorSegundo * psicodelia * dt * sortear(0, 2);
  const inteiras = Math.floor(quantasNascem);
  // A parte "quebrada" (ex.: 2.4 → 0.4) vira uma chance de nascer mais uma
  const total = inteiras + (Math.random() < quantasNascem - inteiras ? 1 : 0);

  for (let i = 0; i < total; i++) {
    particulas.push({
      angulo: sortear(0, Math.PI * 2),                     // direção, em qualquer sentido
      distancia: raioDaPupilaNaTela + sortear(-1, 1),      // nasce na borda da pupila
      velocidade: sortear(config.velocidadeMinima, config.velocidadeMaxima),
      caractere: caractereAleatorio(),
    });
  }

  // Movimento: cada partícula anda para fora, acelera e treme um pouco
  for (const particula of particulas) {
    particula.angulo += sortear(-1, 1) * config.tremor * dt;
    particula.velocidade *= 1 + config.aceleracao * dt;
    particula.distancia += particula.velocidade * dt;
    if (Math.random() < config.trocaDeCaractere) {
      particula.caractere = caractereAleatorio();
    }
  }

  // Remove as que já saíram da tela
  const limite = Math.hypot(colunas / 2, (linhas * proporcao) / 2) + config.rastro * 2;
  particulas = particulas.filter((particula) => particula.distancia < limite);
}

// Desenha as partículas (e suas caudas) por cima da grade do olho
function desenharParticulas(grade) {
  const centroColuna = (colunas - 1) / 2;
  const centroLinha = (linhas - 1) / 2;

  for (const particula of particulas) {
    for (let passo = 0; passo <= config.rastro; passo++) {
      // passo 0 = a "cabeça"; os outros ficam para trás, formando a cauda
      const distancia = particula.distancia - passo * 1.5;
      if (distancia < 0) break;

      const coluna = Math.round(centroColuna + Math.cos(particula.angulo) * distancia);
      const linha = Math.round(centroLinha + (Math.sin(particula.angulo) * distancia) / proporcao);

      if (linha >= 0 && linha < linhas && coluna >= 0 && coluna < colunas) {
        grade[linha][coluna] = passo === 0 ? particula.caractere : caractereAleatorio();
      }
    }
  }
}

// ===== Animação =====

// O quanto um elemento já entrou na tela: 0 = ainda embaixo, 1 = já subiu "distancia" da tela.
// No fim da página tudo conta como 1; senão a última seção nunca terminaria de entrar,
// porque a rolagem acaba antes de ela subir o suficiente.
function progressoDeEntrada(elemento, distancia) {
  const noFimDaPagina =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (noFimDaPagina) return 1;

  const topo = elemento.getBoundingClientRect().top;
  return limitar((window.innerHeight - topo) / (window.innerHeight * distancia));
}

// As seções (Sobre Mim etc.) crescem do centro e ficam nítidas ao entrar na tela
function atualizarSecoes() {
  for (const elemento of secoesQueSurgem) {
    const entrada = suave(0, 1, progressoDeEntrada(elemento, config.distanciaParaSurgir));
    const tamanho = config.tamanhoInicialDaSecao + (1 - config.tamanhoInicialDaSecao) * entrada;

    elemento.style.opacity = entrada;
    elemento.style.transform = "scale(" + tamanho + ")";
    elemento.style.filter = "blur(" + (1 - entrada) * config.desfoqueInicial + "px)";
  }
}

// Os títulos entram embaralhados e vão se "consertando" da esquerda para a direita
function atualizarGlitch() {
  const simbolos = config.caracteresDoGlitch;

  for (const titulo of titulosComGlitch) {
    const original = titulo.dataset.texto;
    // 0 = acabou de aparecer embaixo da tela, 1 = já subiu o suficiente
    const entrada = progressoDeEntrada(titulo, config.distanciaDoGlitch);

    // Já consertado: volta ao texto original (só uma vez, sem refazer a cada quadro)
    if (entrada >= 1) {
      if (titulo.textContent !== original) {
        titulo.textContent = original;
        titulo.style.textShadow = "";
        titulo.style.transform = "";
      }
      continue;
    }

    // Quantas letras, a partir da esquerda, já estão no lugar
    const letrasCertas = Math.floor(original.length * entrada);
    let texto = "";

    for (let i = 0; i < original.length; i++) {
      const letraCerta = i < letrasCertas && Math.random() > config.intensidadeDoGlitch * (1 - entrada);
      if (original[i] === " " || letraCerta) {
        texto += original[i];
      } else {
        texto += simbolos[Math.floor(Math.random() * simbolos.length)];
      }
    }
    titulo.textContent = texto;

    // Separação de cores (vermelho e ciano) e um tremor, que diminuem até sumir
    const desvio = (1 - entrada) * config.separacaoDeCores;
    titulo.style.textShadow =
      sortear(-desvio, desvio) + "px 0 rgba(255, 0, 80, 0.5), " +
      sortear(-desvio, desvio) + "px 0 rgba(0, 255, 255, 0.5)";
    titulo.style.transform = "translateX(" + sortear(-desvio, desvio) + "px)";
  }
}

// ===== Partículas subindo junto com os títulos =====
// Enquanto um título está entrando na tela, nascem caracteres em volta dele
// que sobem devagar e somem. Cada um é um <span> posicionado na seção.

let particulasDosTitulos = [];

function atualizarParticulasDosTitulos(dt) {
  // Nascimento: só enquanto o título está "entrando" (nem fora, nem já parado)
  for (const titulo of titulosComGlitch) {
    const entrada = progressoDeEntrada(titulo, config.distanciaDoGlitch);
    if (entrada <= 0 || entrada >= 1) continue;

    const quantasNascem = config.particulasDosTitulos * dt;
    if (Math.random() > quantasNascem) continue;

    const simbolo = document.createElement("span");
    simbolo.setAttribute("aria-hidden", "true");
    simbolo.className = "absolute left-0 top-0 text-xs text-gray-400 pointer-events-none select-none";
    simbolo.textContent = caractereAleatorio();
    // Fica dentro da seção do título (que tem "relative", então serve de referência de posição)
    titulo.closest("[data-surgir]").appendChild(simbolo);

    particulasDosTitulos.push({
      elemento: simbolo,
      // Nasce em algum ponto ao longo do título, um pouco abaixo dele
      x: titulo.offsetLeft + sortear(-20, titulo.offsetWidth + 20),
      y: titulo.offsetTop + titulo.offsetHeight + sortear(-5, 15),
      velocidade: config.velocidadeDeSubida * sortear(0.5, 1.5),
      idade: 0,
    });
  }

  // Movimento: sobe, troca de símbolo de vez em quando e vai sumindo
  for (const particula of particulasDosTitulos) {
    particula.idade += dt;
    particula.y -= particula.velocidade * dt;
    if (Math.random() < config.trocaDeCaractere) {
      particula.elemento.textContent = caractereAleatorio();
    }
    const vidaRestante = 1 - particula.idade / config.duracaoDasParticulas;
    particula.elemento.style.opacity = Math.max(0, vidaRestante) * config.opacidadeDasParticulas;
    particula.elemento.style.transform = "translate(" + particula.x + "px, " + particula.y + "px)";
  }

  // Remove da página as que já sumiram
  particulasDosTitulos = particulasDosTitulos.filter((particula) => {
    const acabou = particula.idade >= config.duracaoDasParticulas;
    if (acabou) particula.elemento.remove();
    return !acabou;
  });
}

let tempoAnterior = 0;

// Roda a cada quadro da tela (cerca de 60 vezes por segundo)
function quadro(agora) {
  // Tempo desde o último quadro (no máximo 0,05 s, para não "pular" se a aba ficou parada)
  const dt = Math.min(0.05, (agora - tempoAnterior) / 1000);
  tempoAnterior = agora;

  // Quanto já rolei dentro do hero, de 0 (topo) a 1 (fim)
  const rolado = window.scrollY - secao.offsetTop;
  const progresso = limitar(rolado / (secao.offsetHeight - window.innerHeight));

  // Só desenha enquanto o hero está visível (economiza processamento)
  if (rolado < secao.offsetHeight) {
    const abertura = suave(0, config.olhoAbreAte, progresso);
    const dilatacao = suave(config.dilatacaoComeca, config.dilatacaoTermina, progresso);
    const psicodelia = suave(config.psicodeliaComeca, config.psicodeliaTermina, progresso);
    const mergulho = suave(config.mergulhoComeca, 1, progresso);
    const zoom = Math.pow(config.zoomMaximo, mergulho); // 1 no começo, zoomMaximo no fim

    // Tamanho da pupila na tela, em caracteres (a lente e o zoom aumentam ela)
    const raioDaPupilaNaTela = raioNaTela(calcularRaioPupila(dilatacao), zoom);

    atualizarParticulas(psicodelia, raioDaPupilaNaTela, dt);

    const grade = desenharOlho(abertura, dilatacao, zoom);
    desenharParticulas(grade);
    tela.textContent = grade.map((fileira) => fileira.join("")).join("\n");
  }

  atualizarSecoes();
  atualizarGlitch();
  atualizarParticulasDosTitulos(dt);
  requestAnimationFrame(quadro);
}

// Quem pediu ao sistema menos animação vê o olho aberto e parado
const semAnimacao = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function iniciar() {
  medirTela();
  particulas = [];
  if (semAnimacao) {
    tela.textContent = desenharOlho(1, 0, 1).map((fileira) => fileira.join("")).join("\n");
  }
}

iniciar();
window.addEventListener("resize", iniciar);
// Mede de novo quando a fonte (Fira Code) terminar de carregar
document.fonts.ready.then(iniciar);

if (!semAnimacao) {
  requestAnimationFrame(quadro);
}
