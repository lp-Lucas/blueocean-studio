/* Biblioteca de motion "Apple" da Blue Ocean — usada pelas páginas em ferramentas/motion/banners/.
   Tudo é função do tempo t (segundos): a página define window.quadro(t) e o render.mjs tira um quadro por vez.
   Abrindo a página direto no Chrome ela toca sozinha (para ver ao vivo). */
(function () {
  const M = {};
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  M.clamp = clamp;
  M.lerp = (a, b, p) => a + (b - a) * p;
  // curvas de easing (as da Apple: saída exponencial longa e suave)
  M.ease = {
    linear: p => p,
    expoOut: p => p >= 1 ? 1 : 1 - Math.pow(2, -10 * p),
    quintOut: p => 1 - Math.pow(1 - p, 5),
    cubicOut: p => 1 - Math.pow(1 - p, 3),
    cubicInOut: p => p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
    quintInOut: p => p < 0.5 ? 16 * p ** 5 : 1 - Math.pow(-2 * p + 2, 5) / 2,
    cubicIn: p => p * p * p,
    // mola leve (sobe um pouco além e assenta)
    spring: p => p >= 1 ? 1 : 1 - Math.exp(-7 * p) * Math.cos(9 * p) * (1 - p * 0.15),
  };
  /* progresso de 0 a 1 de uma animação que começa em t0 e dura d */
  M.prog = (t, t0, d, ease = M.ease.expoOut) => ease(clamp((t - t0) / d));

  /* ── texto: quebra em palavras (cada uma num span) mantendo <em>/<b>/classes ── */
  M.palavras = function (el) {
    const out = [];
    // o degradê (.grad) vai para cada palavra: com transform/filter por palavra o recorte do pai não funciona
    for (const g of el.querySelectorAll('.grad')) { g.classList.remove('grad'); g.dataset.grad = '1'; }
    const anda = (no, pai) => {
      for (const n of [...no.childNodes]) {
        if (n.nodeType === 3) {
          const partes = n.nodeValue.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          for (const pt of partes) {
            if (!pt) continue;
            if (/^\s+$/.test(pt)) { frag.appendChild(document.createTextNode(' ')); continue; }
            const s = document.createElement('span'); s.className = pai.closest?.('[data-grad]') ? 'w grad' : 'w'; s.textContent = pt;
            frag.appendChild(s); out.push(s);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          if (n.classList.contains('inteiro')) { n.classList.add('w'); out.push(n); continue; }
          anda(n, n);
        }
      }
    };
    anda(el, el);
    return out;
  };

  /* entrada "Apple": cada palavra sobe um pouco, sai do desfoque e aparece, em cascata */
  M.entrar = function (els, t, t0, o = {}) {
    const { atraso = 0.07, dur = 1.1, sobe = 0.42, desfoque = 18, escala = 0.96, ease = M.ease.expoOut } = o;
    els.forEach((el, i) => {
      const p = M.prog(t, t0 + i * atraso, dur, ease);
      const pa = M.prog(t, t0 + i * atraso, dur * 0.6, M.ease.cubicOut);
      el.style.opacity = pa;
      el.style.filter = p >= 0.999 ? 'none' : `blur(${(1 - p) * desfoque}px)`;
      el.style.transform = `translateY(${(1 - p) * sobe}em) scale(${M.lerp(escala, 1, p)})`;
    });
  };
  /* saída: some subindo e desfocando (mais rápida que a entrada) */
  M.sair = function (els, t, t0, o = {}) {
    const { atraso = 0.03, dur = 0.55, sobe = -0.25, desfoque = 16 } = o;
    els.forEach((el, i) => {
      const p = M.prog(t, t0 + i * atraso, dur, M.ease.cubicIn);
      if (p <= 0) return;
      el.style.opacity = (parseFloat(el.style.opacity || 1)) * (1 - p);
      el.style.filter = `blur(${p * desfoque}px)`;
      el.style.transform = `translateY(${p * sobe}em) scale(${1 - p * 0.03})`;
    });
  };
  /* contador: anima o número de a até b dentro do elemento (formato livre) */
  M.contar = function (el, t, t0, dur, a, b, fmt = v => Math.round(v)) {
    const p = M.prog(t, t0, dur, M.ease.quintInOut);
    el.textContent = fmt(M.lerp(a, b, p));
  };

  /* ── fundo de seda azul (WebGL), no clima da vinheta das aulas ── */
  M.fundo = function (canvas, cfg = {}) {
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
    if (!gl) { canvas.style.background = 'linear-gradient(160deg,#0137FF,#000A3A)'; return () => {}; }
    const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const fs = `precision highp float;
      uniform float t; uniform vec2 res; uniform float energia;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/res;              // 0..1, y para cima
        vec2 p=vec2(uv.x*res.x/res.y,uv.y);       // proporção real
        float T=t*energia;
        // deformação lenta do pano
        vec2 w=vec2(fbm(p*1.6+vec2(0.,T*.06)),fbm(p*1.6+vec2(5.2,-T*.05)));
        vec2 q=p+(w-.5)*.35;
        vec3 navy=vec3(.008,.035,.24), azul=vec3(.0,.17,.97), claro=vec3(.22,.55,1.);
        // base: azul forte embaixo à esquerda, marinho no canto de cima à direita
        float g=clamp(1.15-(uv.y*.85+uv.x*.45)+.10*sin(T*.25),0.,1.);
        vec3 col=mix(navy,azul,smoothstep(.0,.95,g));
        // faixas de luz (seda) atravessando na diagonal
        for(int i=0;i<4;i++){
          float fi=float(i);
          float y=q.y-(.18+.24*fi)+.42*(q.x-.28)
                 -.07*sin(q.x*5.+T*.42+fi*1.9)-.035*sin(q.x*11.-T*.55+fi*3.1);
          float lw=.045+.02*fi;
          float b=exp(-y*y/(lw*lw));
          float brilho=(.30-.055*fi)*(.75+.25*sin(T*.5+fi*2.3));
          col+=claro*b*brilho;
          col+=vec3(.6,.8,1.)*exp(-y*y/(lw*lw*.08))*brilho*.18; // fio de luz no meio da faixa
        }
        // brilho grande e lento no centro (dá vida sem roubar a cena)
        float c=exp(-dot(uv-vec2(.35+.1*sin(T*.2),.32),uv-vec2(.35+.1*sin(T*.2),.32))*5.);
        col+=azul*c*.25;
        // vinheta
        col*=1.-.45*pow(length((uv-vec2(.5,.5))*vec2(1.,.9)),2.2);
        col=max(col,0.);
        col+=(h(gl_FragCoord.xy+fract(t*7.)*100.)-.5)*.022;   // grão (evita faixas no degradê)
        gl_FragColor=vec4(col,1.);
      }`;
    const sh = (tp, src) => { const s = gl.createShader(tp); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const ut = gl.getUniformLocation(pr, 't'), ur = gl.getUniformLocation(pr, 'res'), ue = gl.getUniformLocation(pr, 'energia');
    return t => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(ut, t + (cfg.inicio || 0)); gl.uniform2f(ur, canvas.width, canvas.height); gl.uniform1f(ue, cfg.energia || 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  };

  /* ── fundo "linhas de pontos" (identidade dos posts Blue Ocean): quase preto, brilho azul no canto de cima
     e um feixe de fios pontilhados saindo da esquerda em leque; os fios ondulam devagar e a luz corre por eles ── */
  M.fundoLinhas = function (canvas, cfg = {}) {
    const g = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const N = cfg.fios || 34, Y0 = cfg.y0 || 0.16, Y1 = cfg.y1 || 0.44;
    const fios = Array.from({ length: N }, (_, i) => {
      const k = i / (N - 1);
      return { k, y: H * (Y0 + (Y1 - Y0) * k), incl: 0.06 + 0.30 * k * k, fase: i * 1.37, forca: 0.5 + 0.5 * Math.pow(k, 1.2) };
    });
    // um fio isolado e fraco no canto de cima à direita, como na arte
    const solto = { y: H * 0.02, incl: 0.32, fase: 9, forca: 0.25, k: 0.5, x0: W * 0.55 };
    return t => {
      g.fillStyle = '#08090E'; g.fillRect(0, 0, W, H);
      let rg = g.createRadialGradient(-W * 0.05, -H * 0.02, 0, -W * 0.05, -H * 0.02, H * 0.62);
      rg.addColorStop(0, 'rgba(10,32,140,0.95)'); rg.addColorStop(0.45, 'rgba(8,21,73,0.55)'); rg.addColorStop(1, 'rgba(8,9,14,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
      const PASSO = 7;
      const desenha = (f, x0 = 0) => {
        for (let x = x0; x < W; x += PASSO) {
          const u = x / W;
          const y = f.y + x * f.incl + Math.sin(u * 3.2 + t * 0.35 + f.fase) * 10 * (0.4 + u)
            + Math.sin(t * 0.22 + f.k * 4) * 14 * u;
          const some = Math.pow(Math.max(0, 1 - u / 1.25), 1.3);                 // apaga para a direita
          const corre = 0.55 + 0.45 * Math.pow(0.5 + 0.5 * Math.sin(u * 9 - t * 1.6 + f.fase * 2.1), 3);  // luz correndo
          const a = f.forca * some * corre;
          if (a < 0.02) continue;
          g.fillStyle = `rgba(${Math.round(40 + 40 * a)},${Math.round(90 + 60 * a)},255,${Math.min(1, a)})`;
          g.fillRect(x, y, 4.6, 3.4);
        }
      };
      for (const f of fios) desenha(f);
      desenha(solto, solto.x0);
      // escurece embaixo e à direita para o texto respirar
      const lg = g.createLinearGradient(0, H * 0.35, 0, H);
      lg.addColorStop(0, 'rgba(8,9,14,0)'); lg.addColorStop(1, 'rgba(8,9,14,0.6)');
      g.fillStyle = lg; g.fillRect(0, 0, W, H);
    };
  };

  /* ── fundo marinho dos carrosséis Blue Ocean: degradê #02011D → #05114F com brilhos azuis que respiram devagar ── */
  M.fundoMarinho = function (canvas) {
    const g = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    const brilho = (x, y, r, cor, a) => {
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, cor.replace('A', a)); rg.addColorStop(1, cor.replace('A', 0));
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    };
    return t => {
      const lg = g.createLinearGradient(0, 0, 0, H);
      lg.addColorStop(0, '#040E46'); lg.addColorStop(0.3, '#030733'); lg.addColorStop(0.62, '#02011D'); lg.addColorStop(1, '#05114F');
      g.fillStyle = lg; g.fillRect(0, 0, W, H);
      brilho(W * (0.15 + 0.06 * Math.sin(t * 0.25)), H * 0.02, H * 0.42, 'rgba(10,40,170,A)', 0.55 + 0.1 * Math.sin(t * 0.4));
      brilho(W * (0.05 + 0.05 * Math.sin(t * 0.2 + 2)), H * 0.98, H * 0.45, 'rgba(8,36,160,A)', 0.6 + 0.1 * Math.sin(t * 0.33 + 1));
      brilho(W * (0.9 + 0.05 * Math.sin(t * 0.3 + 4)), H * 0.55, H * 0.3, 'rgba(8,30,130,A)', 0.25);
    };
  };

  /* toca a página ao vivo quando aberta fora do render */
  M.tocar = function () {
    if (window.RENDER) return;
    const ini = performance.now();
    const loop = () => { const t = ((performance.now() - ini) / 1000) % (window.DURACAO || 10); window.quadro(t); requestAnimationFrame(loop); };
    (window.pronto || Promise.resolve()).then(() => document.fonts.ready).then(loop);
  };
  window.Motion = M;
})();
