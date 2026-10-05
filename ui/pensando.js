/* Grade de bolinhas que ondula como tecido: cada bolinha é deslocada por ondas que andam no tempo,
   e o tom dela vai do escuro (no vale) ao claro (na crista).
   Usada em dois lugares:
     - chat enquanto o Claude trabalha: painel azul, bolinhas brancas e azul-marinho
     - página inicial: só as bolinhas, em cinza, por cima do fundo de sempre */
function criarBolinhas(pai, { fundo = null, claro = [255, 255, 255], escuro = [3, 14, 72], alfaClaro = [0.14, 0.92], alfaEscuro = [0.18, 0.78], passo = 17, classe = '' } = {}) {
  const cv = document.createElement('canvas');
  cv.className = classe;
  pai.prepend(cv);
  const g = cv.getContext('2d');
  const NIVEIS = 24;   // tons pré-calculados (não cria string de cor a cada bolinha)
  const tons = (rgb, [a0, a1]) => Array.from({ length: NIVEIS }, (_, i) => `rgba(${rgb.join(',')},${(a0 + (a1 - a0) * i / (NIVEIS - 1)).toFixed(3)})`);
  const claros = tons(claro, alfaClaro), escuros = tons(escuro, alfaEscuro);
  let ativo = false, saindo = false, raf = 0, t0 = performance.now(), gradiente = null, tamGrad = '';

  function quadro(agora) {
    const dpr = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) { if (ativo || saindo) raf = requestAnimationFrame(quadro); return; }
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (fundo) {
      if (!gradiente || tamGrad !== w + 'x' + h) { gradiente = fundo(g, w, h); tamGrad = w + 'x' + h; }
      g.fillStyle = gradiente; g.fillRect(0, 0, w, h);
    } else g.clearRect(0, 0, w, h);
    const t = (agora - t0) / 1000;
    for (let y = -passo; y < h + passo; y += passo) {
      for (let x = -passo; x < w + passo; x += passo) {
        // campo de ondas: três senoides em direções diferentes, andando em velocidades diferentes
        const a = Math.sin(x * 0.011 + t * 0.7) + Math.sin(y * 0.0085 - t * 0.5) + Math.sin((x - y) * 0.0065 + t * 0.32);
        const v = a / 3;                                         // -1 … 1
        // o tecido: a grade escorrega junto com a onda
        const dx = 5.5 * Math.sin(y * 0.021 + t * 1.05 + a * 0.7);
        const dy = 5.5 * Math.cos(x * 0.019 - t * 0.85 + a * 0.7);
        const k = Math.min(NIVEIS - 1, Math.floor(Math.abs(v) * NIVEIS));
        g.fillStyle = v > 0 ? claros[k] : escuros[k];
        g.beginPath(); g.arc(x + dx, y + dy, 1.15 + Math.abs(v) * 0.75, 0, 6.2832); g.fill();
      }
    }
    if (ativo || saindo) raf = requestAnimationFrame(quadro);
  }
  function ligar(on, { fade = 700 } = {}) {
    if (on === ativo) return;
    ativo = on;
    if (on) { saindo = false; cancelAnimationFrame(raf); raf = requestAnimationFrame(quadro); }
    else {
      // continua animando durante o fade de saída, depois para de gastar processamento
      saindo = true;
      setTimeout(() => { saindo = false; if (!ativo) cancelAnimationFrame(raf); }, fade);
    }
  }
  return { ligar, canvas: cv };
}

/* chat enquanto o Claude trabalha: painel azul */
const PENSA = (() => {
  const painel = $('#direita');
  const b = criarBolinhas(painel, {
    classe: 'fundo-pensando',
    fundo: (g, w, h) => { const gr = g.createLinearGradient(0, 0, w * 0.4, h); gr.addColorStop(0, '#1B4FF0'); gr.addColorStop(0.55, '#0F3AD6'); gr.addColorStop(1, '#0A2AA8'); return gr; },
  });
  return {
    ligar(on) {
      painel.classList.toggle('saindo-pensando', !on);
      b.ligar(on);
      if (!on) setTimeout(() => painel.classList.remove('saindo-pensando'), 700);
    },
  };
})();

/* página inicial: só as bolinhas, em azul, sem mudar o fundo */
const BOLINHAS_INICIO = (() => {
  const tela = $('#boasVindas');
  const b = criarBolinhas(tela, {
    classe: 'fundo-bolinhas', passo: 20,
    claro: [82, 135, 255], alfaClaro: [0.06, 0.6],     // azul nas cristas
    escuro: [30, 60, 160], alfaEscuro: [0.03, 0.18],  // azul-escuro nos vales
  });
  // anima só enquanto a página inicial está na tela
  new MutationObserver(() => b.ligar(!tela.classList.contains('oculto'), { fade: 0 })).observe(tela, { attributes: true, attributeFilter: ['class'] });
  b.ligar(!tela.classList.contains('oculto'), { fade: 0 });
  return b;
})();
