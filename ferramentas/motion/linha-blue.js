/* Peças animadas da linha Blue (cabeçalho, blocos, botão) — mesma linguagem Apple do motion.js */
(function () {
  const M = Motion, E = M.ease, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const B = {};
  // bloco entra subindo, saindo do desfoque (filtro extra opcional, ex.: logo branco)
  B.bloco = function (el, t, t0, { sobe = 40, desf = 18, dur = 1.1, esc = 0.96, filtro = '' } = {}) {
    const p = M.prog(t, t0, dur), pa = M.prog(t, t0, dur * 0.6, E.cubicOut);
    el.style.opacity = pa;
    el.style.filter = ((p > 0.999 ? '' : `blur(${(1 - p) * desf}px) `) + filtro) || 'none';
    el.style.transform = `translateY(${(1 - p) * sobe}px) scale(${M.lerp(esc, 1, p)})`;
  };
  // cabeçalho: nome BLUE OCEAN, o fio correndo até o símbolo, o símbolo
  B.cabecalho = function (t, t0) {
    B.bloco($('#cab .nome'), t, t0, { sobe: 20, desf: 14, esc: 0.92, filtro: 'invert(1)' });
    $('#cab .fio').style.transform = `scaleX(${M.prog(t, t0 + 0.3, 1.0, E.quintInOut)})`;
    B.bloco($('#cab .simb'), t, t0 + 0.75, { sobe: 20, desf: 14, esc: 0.8, filtro: 'brightness(0) invert(1)' });
  };
  // botão com mola, brilho passando, seta chamando, setas para baixo
  B.cta = function (t, t0) {
    const cta = $('#cta'), brilho = $('#cta .brilho'), seta = $('#cta .seta');
    const pc = M.prog(t, t0, 1.1, E.spring), pca = M.prog(t, t0, 0.5, E.cubicOut);
    cta.style.opacity = pca;
    cta.style.transform = `translateY(${(1 - Math.min(pc, 1)) * 60}px) scale(${M.lerp(0.85, 1, pc)})`;
    cta.style.filter = pca > 0.999 ? 'none' : `blur(${(1 - pca) * 12}px)`;
    const T0 = t0 + 0.9, ciclo = ((t - T0) % 1.6 + 1.6) % 1.6;
    brilho.style.transform = `translateX(${t < T0 ? -220 : M.lerp(-220, 620, E.cubicInOut(M.clamp(ciclo / 0.9)))}px) skewX(-20deg)`;
    seta.style.transform = `translateX(${t < T0 ? 0 : Math.sin(M.clamp(ciclo / 0.6) * Math.PI) * 10}px)`;
    $$('#chev svg').forEach((s, i) => {
      const pe = M.prog(t, t0 + 0.6 + i * 0.12, 0.6, E.cubicOut);
      const onda = t < T0 ? 1 : 0.35 + 0.65 * Math.max(0, Math.sin(((t - T0) * 2.4 - i * 0.35) * Math.PI));
      s.style.opacity = pe * onda;
      s.style.transform = `translateY(${(1 - pe) * -14 + (t < T0 ? 0 : Math.sin((t - T0) * 2.4 * Math.PI - i * 0.6) * 4)}px)`;
    });
  };
  window.Blue = B;
})();
