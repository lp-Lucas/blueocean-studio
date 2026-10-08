/* Base Leadrive (copiada da Devor, receita 15; site ESCURO: tela cheia navy #0A0B2E com a grade de 72 px do site, borda #4848F0 e arco #6F6FFF): transições das telas cheias, cursor, riscos, caneta, marca-texto, confete e legenda —
   copiados do forma.html aprovado. A página define FS, ROSTO, ESTOUROS (cores) e OCULTA antes de chamar NB.iniciar(). */
const { M, E, C, L, $, pr } = FM, A = FM.anim;
const S = (g, cor, w = 2.6) => FM.svg(g, cor, w);
Object.assign(FM.GLIFO, { chev: 'M9 6 L15 12 L9 18', sobe: 'M12 19 V5 M6 11 L12 5 L18 11', desce: 'M12 5 V19 M6 13 L12 19 L18 13',
  relogio: 'M12 3 a9 9 0 1 0 0.01 0 Z M12 7 V12 L15.5 14' });
for (const c of document.querySelectorAll('.cursor')) c.innerHTML = FM.CURSOR;
FM.iniciar({});

const circulo = (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
const retang = (cx, cy, w, h, rr) => { const x = cx - w / 2, y = cy - h / 2; rr = Math.min(rr, w / 2, h / 2);
  return `M${x + rr} ${y} H${x + w - rr} A${rr} ${rr} 0 0 1 ${x + w} ${y + rr} V${y + h - rr} A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h} H${x + rr} A${rr} ${rr} 0 0 1 ${x} ${y + h - rr} V${y + rr} A${rr} ${rr} 0 0 1 ${x + rr} ${y} Z`; };
const tranco = (t, t0) => { if (t < t0) return ''; const s = t - t0, k = Math.exp(-6 * s) * Math.sin(s * 18); return ` rotate(${-5 * k}deg) scale(${1 + 0.04 * k})`; };
function tela(t) {
  let furo = '', borda = '', vis = false, arcoT = null;
  for (let i = 0; i < FS.length; i++) {
    const [TI, TO, circ] = FS[i], ant = FS[i - 1], prox = FS[i + 1];
    // telas cheias coladas (< 0,6 s): o fundo fica fechado entre elas — sem quadrado abrindo nem círculo fechando de novo
    // (a modelo não aparece por um instante); a troca de janela é feita pela passa() da página
    const ligaA = ant && TI - ant[1] < 0.6, ligaD = prox && prox[0] - TO < 0.6;
    if (ligaD && t >= TO && t <= prox[0] + 0.05) { vis = true; continue; }
    if (t < TI || t > TO + 0.6) continue;
    if (ligaD && t >= TO) continue;
    vis = true;
    if (t < TO) {
      if (circ && !ligaA) { const r = L(1250, 300, pr(t, TI, 0.42, E.expoOut)) * (1 - pr(t, TI + 0.36, 0.3, E.cubicIn));
        if (r > 1) { furo = circulo(ROSTO[0], ROSTO[1], r); if (r < 1100) borda = furo; } }
    } else {
      const p1 = M.prog(t, TO, 0.32, E.spring), p2 = pr(t, TO + 0.2, 0.36, E.cubicInOut);
      const w = L(L(0, 430, p1), 1320, p2), h = L(L(0, 560, p1), 2400, p2);
      furo = retang(ROSTO[0], ROSTO[1], Math.max(1, w), Math.max(1, h), L(70, 0, p2)); if (p2 < 0.97) borda = furo;
      if (t >= TO + 0.02 && t < TO + 0.55) arcoT = (t - TO - 0.02) / 0.5;
      if (t >= TO + 0.56) vis = false;
    }
  }
  $('#tela').style.opacity = vis ? 1 : 0;
  $('#furoP').setAttribute('d', furo); $('#telaBorda').setAttribute('d', borda);
  const ar = $('#telaArco');
  if (arcoT != null) {
    ar.setAttribute('d', 'M 180 1250 C 360 1470, 820 1410, 930 950 C 990 710, 900 510, 760 420');
    const L0 = ar.getTotalLength(), q = E.cubicInOut(C(arcoT)), seg = L0 * 0.45;
    ar.setAttribute('stroke-dasharray', `${seg} ${L0 * 2}`); ar.setAttribute('stroke-dashoffset', L(seg, -L0, q)); ar.style.opacity = 1;
  } else ar.style.opacity = 0;
}
function cursor(el, t, t0, de, para, tc, tsai) {
  if (t < t0 || t > tsai + 0.5) { el.style.opacity = 0; return 0; }
  return FM.cursor(el, t, t0, de, para, tc, tsai);
}
const riscar = (id, cor) => { const r = document.createElement('div'); r.className = 'risca'; if (cor) r.style.background = cor; $('#' + id).appendChild(r);
  return (t, t0) => { r.style.transform = `scaleX(${pr(t, t0, 0.4, E.cubicInOut)})`; }; };
// caneta (traço SVG desenhando), marca-texto (cresce da esquerda), letra à mão (revela da esquerda)
const tinta = (t, id, t0, d) => { const p = $('#' + id), Lp = p._L || (p._L = p.getTotalLength()); p.style.strokeDasharray = Lp; p.style.strokeDashoffset = Lp * (1 - pr(t, t0, d, E.cubicInOut)); };
const marca = (t, id, t0, d) => { $('#' + id).style.backgroundSize = `${pr(t, t0, d, E.cubicInOut) * 100}% 78%`; };
const escreve = (t, id, t0, d) => { $('#' + id).style.clipPath = `inset(-30px calc(${(1 - pr(t, t0, d, E.linear)) * 100}% - 40px) -30px -20px)`; };
const pop = (el, t, t0) => { el.style.opacity = pr(t, t0, 0.25, E.cubicOut); el.style.transform = `scale(${L(0.6, 1, M.prog(t, t0, 0.6, E.spring))})`; };
const brl = v => 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const cv = $('#confT').getContext('2d');
function confete(t) {
  cv.clearRect(0, 0, 1080, 1920);
  for (const { t0, ps, rgb } of ESTOUROS) for (const q of ps) {
    const s = t - t0 - q.atraso; if (s < 0 || s > q.vida) continue;
    const k = 3.4, e = (1 - Math.exp(-k * s)) / k, x = q.x0 + q.vx * e, y = q.y0 + q.vy * e + (1500 / k) * (s - e);
    const vira = Math.cos(q.flip + q.vf * s), luz = Math.abs(vira);
    cv.save(); cv.translate(x, y); cv.rotate(q.rot + q.vr * s); cv.scale(1, Math.max(0.12, luz) * Math.sign(vira || 1));
    cv.globalAlpha = Math.min(1, s / 0.04) * (1 - C((s / q.vida - 0.65) / 0.35));
    cv.fillStyle = `rgb(${rgb.map(c => Math.round(L(c * 0.7, Math.min(255, c * 1.5 + 30), luz))).join(',')})`;
    cv.fillRect(-q.w / 2, -q.h / 2, q.w, q.h); cv.restore();
  }
}

/* legenda branca sem fundo: blocos de até 2 palavras, quebrando na pontuação e nas pausas; escura sobre o papel */
const GR = [];
{ let g = [];
  PAL.forEach((w, i) => { g.push(w); const prox = PAL[i + 1];
    if (g.length >= 2 || /[.,?!…]$/.test(w[2]) || !prox || prox[0] - w[1] > 0.35) { GR.push(g); g = []; } }); }
const legEl = $('#legenda');
GR.forEach(g => { const d = document.createElement('div'); d.style.position = 'absolute'; d.style.left = '0'; d.style.right = '0';
  d.innerHTML = g.map(w => `<span>${w[2].replace(/\.\.\.$|…$/, '')}</span>`).join(''); legEl.appendChild(d); g.el = d; g.ws = [...d.children]; });
function legenda(t) {
  const oc = OCULTA.some(([a, b]) => t >= a && t < b);
  const papel = (window.PAPEL_TOPO ?? 9999) < 1460;
  legEl.style.color = '#fff';   // site escuro: legenda sempre branca
  GR.forEach((g, k) => { const ini = g[0][0] - 0.05, fim = Math.min(GR[k + 1] ? GR[k + 1][0][0] - 0.05 : 99, g[g.length - 1][1] + 0.6);
    if (oc || t < ini || t >= fim) { g.el.style.opacity = 0; return; }
    g.el.style.opacity = 1;
    g.ws.forEach((s, i) => { const t0 = g[i][0] - 0.04, p = M.prog(t, t0, 0.35, E.spring), pa = pr(t, t0, 0.12, E.cubicOut);
      s.style.opacity = pa; s.style.transform = `scale(${L(0.82, 1, p)}) translateY(${(1 - pr(t, t0, 0.3)) * 12}px)`; }); });
}
const TELA_SVG = `<defs><filter id="borda" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".3"/></filter>
  <mask id="furoM"><rect x="-60" y="-60" width="1200" height="2040" fill="#fff"/><path id="furoP" fill="#000" d=""/></mask>
  <pattern id="grade" x="0" y="0" width="72" height="72" patternUnits="userSpaceOnUse"><path d="M72 0 V72 M0 72 H72" stroke="rgba(255,255,255,.05)" stroke-width="1.5" fill="none"/></pattern></defs>
  <g mask="url(#furoM)"><rect x="-60" y="-60" width="1200" height="2040" fill="#0A0B2E"/><rect x="-60" y="-60" width="1200" height="2040" fill="url(#grade)"/></g>
  <path id="telaBorda" fill="none" stroke="#4848F0" stroke-width="14" filter="url(#borda)" d=""/>
  <path id="telaArco" fill="none" stroke="#6F6FFF" stroke-width="26" stroke-linecap="round" d=""/>`;
$('#tela').innerHTML = TELA_SVG;

/* marca famosa citada na fala (ex.: Amazon): o ícone pula sobre a modelo, o fundo dele se expande e vira a tela cheia */
const MARCAS = { meta: { cor: "#0081FB", svg: `<svg viewBox="0 0 24 24"><path fill="#fff" d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/></svg>` }, google: { cor: "#FFFFFF", svg: `<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>` }, duolingo: { cor: '#58CC02', svg: `<svg viewBox="0 0 24 24"><path fill="#fff" d="M14.484 18.213c1.142 1.033 2.657 1.662 4.316 1.662l.294-.001c1.985-.038 3.749-.976 4.905-2.422v1.98c0 2.522-2.043 4.568-4.567 4.568H4.569C2.045 23.998.002 21.954.002 19.43v-1.92c1.181 1.443 2.976 2.365 4.985 2.365l.35-.001c1.61-.027 3.076-.646 4.191-1.648.555.764 1.456 1.26 2.473 1.26 1.023 0 1.928-.502 2.483-1.273zm-5.349-.996c-.989 1.022-2.375 1.658-3.909 1.658h-.239c-2.229 0-4.146-1.343-4.987-3.262v-7.16c.281-.64.68-1.216 1.169-1.699-.035-.731.132-1.469.511-2.128.256-.44.867-.504 1.21-.124l.766.851c.007-.003.014-.003.021-.005-.098-.78.037-1.587.419-2.308.24-.45.757-.53 1.114-.164 0 0 3.939 3.979 4.035 4.084 1.542 1.348 4.066 1.287 5.686-.18.002-.003.007-.005.009-.007.042-.042 3.855-3.9 3.855-3.9.3361-.3451.8619-.3101 1.113.164.385.724.518 1.535.417 2.32.002.001.003.001.004.002l.007.002c.001 0 .002 0 .003.001l.776-.86c.342-.38.954-.316 1.207.124.387.673.553 1.427.509 2.173.496.501.897 1.099 1.169 1.762v6.941c-.816 1.978-2.761 3.373-5.032 3.373H18.8c-1.547 0-2.945-.648-3.936-1.686a.8386.8386 0 0 0-.009-.067c.313-.017.528-.162.688-.33.152-.16.299-.397.299-.776 0 0-.022-.312-.024-.324.693.767 1.696 1.249 2.811 1.249 2.092 0 3.787-1.696 3.787-3.787v-2.243c0-2.092-1.697-3.787-3.787-3.787-2.093 0-3.787 1.695-3.787 3.787v2.243c0 .266.027.526.079.776-.712-.784-1.744-1.278-2.842-1.278-1.239 0-2.339.523-3.064 1.355.063-.274.097-.56.097-.853v-2.243c0-2.092-1.697-3.787-3.788-3.787-2.09 0-3.787 1.695-3.787 3.787v2.243c0 2.093 1.697 3.787 3.787 3.787 1.151 0 2.182-.513 2.876-1.322-.008.035-.039.395-.039.395 0 .378.147.616.298.775.16.168.374.312.688.331a.7783.7783 0 0 0-.012.097zm.997.073c.729.131 1.733.305 1.792.305h.157c.059 0 1.789-.303 1.789-.303-.327.705-1.041 1.194-1.869 1.194-.829 0-1.543-.49-1.869-1.196zm-.971-1.379c.246-1.313 1.462-2.259 2.918-2.259 1.324 0 2.521.97 2.763 2.259v.105c0 .082-.029.115-.103.106l-2.658.473h-.157l-2.66-.476c-.075.01-.103-.023-.103-.105Zm8.023-6.392c.255-.14.549-.22.861-.22.992 0 1.798.804 1.798 1.798v1.919c0 .991-.804 1.797-1.798 1.797-.991 0-1.797-.803-1.797-1.797v-1.542c.034.003.068.005.103.005.64 0 1.16-.518 1.16-1.156 0-.312-.125-.596-.327-.804zM5.162 9.461c.227-.104.48-.162.746-.162.991 0 1.798.804 1.798 1.798v1.919c0 .991-.804 1.797-1.798 1.797-.991 0-1.797-.803-1.797-1.797v-1.571c.089.022.182.034.278.034.641 0 1.16-.518 1.16-1.156 0-.342-.149-.65-.387-.862ZM.002 6.554V4.568C.002 2.044 2.045 0 4.569 0h14.865c2.522 0 4.565 2.044 4.565 4.568v2.041a5.1847 5.1847 0 0 0-.164-.197 4.8592 4.8592 0 0 0-.646-2.284c-.433-.754-1.315-1.037-2.07-.786a4.785 4.785 0 0 0-.327-.774h-.001c-.287-.54-.758-.835-1.248-.908-.493-.073-1.033.072-1.464.515l-3.82 3.864c-1.226 1.11-3.127 1.199-4.313.205-.103-.109-4.025-4.071-4.025-4.071-.427-.438-.966-.584-1.46-.51-.489.073-.961.367-1.248.907v.002c-.133.25-.241.508-.327.771-.753-.252-1.635.029-2.071.782 0 0-.001.001-.001.002-.4.694-.613 1.459-.645 2.23-.057.065-.113.13-.167.197z"/></svg>` }, whatsapp: { cor: '#25D366', svg: `<svg viewBox="0 0 24 24"><path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>` }, instagram: { cor: '#E4405F', svg: `<svg viewBox="0 0 24 24"><path fill="#fff" d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg>` }, facebook: { cor: '#0866FF', svg: `<svg viewBox="0 0 24 24"><path fill="#fff" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>` } };
function marcaExpande(t, nome, t0, cx = 540, cy = 330) {
  let el = document.getElementById('marcaX');
  if (!el) { el = document.createElement('div'); el.id = 'marcaX'; el.innerHTML = `<div class="bg"></div><div class="gl">${MARCAS[nome].svg}</div>`;
    el.querySelector('.bg').style.background = MARCAS[nome].cor; $('#tela').after(el); }
  if (t < t0 || t > t0 + 1.45) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  const ps = M.prog(t, t0, 0.55, E.spring), pe = pr(t, t0 + 0.6, 0.5, E.cubicInOut), sai = pr(t, t0 + 1.08, 0.32, E.cubicOut);
  const w = L(260, 1500, pe), h = L(260, 2400, pe), x = L(cx, 540, pe), y = L(cy, 960, pe);
  const bg = el.querySelector('.bg'), gl = el.querySelector('.gl');
  Object.assign(bg.style, { left: (x - w / 2) + 'px', top: (y - h / 2) + 'px', width: w + 'px', height: h + 'px', borderRadius: L(56, 0, pe) + 'px',
    transform: `scale(${L(0.3, 1, ps)})`, opacity: C(pr(t, t0, 0.12, E.linear)) * (1 - sai) });
  Object.assign(gl.style, { left: (x - 80) + 'px', top: (y - 80) + 'px', transform: `scale(${L(0.3, 1, ps) * (1 + pe * 0.8)})`, opacity: C(pr(t, t0, 0.12, E.linear)) * (1 - C(pe * 2)) });
}
const fim = () => { if (!window.RENDER) { const t0 = performance.now(); const loop = () => { window.quadro(((performance.now() - t0) / 1000) % window.DURACAO); requestAnimationFrame(loop); }; loop(); } };

/* ajudantes FF Tech */
// centro do alvo na tela (o cursor clica exatamente nele, regra 7); com a janela parada o rect já é o final
const centro = el => { const r = (typeof el === 'string' ? $(el) : el).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
// o que a fala cita acende e fica aceso (fundo + contorno na cor da função)
const acende = (el, t, t0, rgb = '11,58,158', a = 0.08) => { const p = t0 == null ? 0 : pr(t, t0, 0.3, E.cubicOut);
  el.style.background = p > 0.01 ? `rgba(${rgb},${a * p})` : ''; el.style.boxShadow = p > 0.01 ? `inset 0 0 0 1.5px rgba(${rgb},${0.55 * p})` : ''; return p; };
const cascata = (els, t, t0, passo = 0.1, dy = 18) => els.forEach((e, k) => { const a = t0 + k * passo;
  e.style.opacity = pr(t, a, 0.25, E.cubicOut); e.style.transform = `translateY(${(1 - pr(t, a, 0.5)) * dy}px)`; });
// troca de aba: [[t, índice]…]; a vista nova entra subindo, a barra de carregamento corre sob as abas
function abasDe(t, abas, vistas, trocas, carrega) {
  let at = 0, ult = -9; for (const [tt, a] of trocas) if (t >= tt) { at = a; ult = tt; }
  abas.forEach((e, k) => e.classList.toggle('on', k === at));
  vistas.forEach((v, k) => { const p = k === at ? pr(t, ult, 0.3, E.cubicOut) : 0; v.style.opacity = k === at ? (ult < 0 ? 1 : p) : 0;
    v.style.transform = `translateY(${k === at && ult >= 0 ? (1 - p) * 24 : 0}px)`; });
  if (carrega) carrega.style.width = (t - ult < 0.5 ? pr(t, ult, 0.35, E.cubicOut) * 100 : 0) + '%';
  return at;
}
const pulsa = (el, t, t0, k = 0.12) => { if (t >= t0) el.style.transform = `scale(${1 + k * Math.sin(C((t - t0) / 0.4) * Math.PI)})` + tranco(t, t0); };

/* câmera 3D das telas cheias (receita 13, versão "linear e suave" — FF Tech 06/10/2026): pontos [t, alvo, S, rx, ry, ox, oy]
   ligados em linha reta (velocidade constante) + média móvel de 0,8 s nas viradas (sem tranco). Os pontos são todos
   diferentes = a câmera nunca para. Zoom só até onde a linha inteira cabe (rótulo + pílula): nada de close que corta
   informação. Presa às bordas da janela; deriva lenta de 2–3 px; sem borrão. alvo = seletor/elemento, lista ou [x, y]. */
const FOCO = [540, 810];   // centro das janelas das telas cheias
function camera(t, wrap, kf) {
  const w = typeof wrap === 'string' ? $(wrap) : wrap;
  if (!w._K) {   // mede os alvos com tudo no lugar final (sem câmera e sem as animações de entrada)
    const salvo = [w, ...w.querySelectorAll('*')].filter(e => e.style.transform).map(e => [e, e.style.transform]);
    salvo.forEach(([e]) => e.style.transform = '');
    const jr = w.firstElementChild.getBoundingClientRect(); w._jan = [jr.left, jr.right, jr.left + jr.width / 2];
    const caixa = a => { const es = (Array.isArray(a) ? a : [a]).map(e => typeof e === 'string' ? $(e) : e).map(e => e.getBoundingClientRect());
      const l = Math.min(...es.map(r => r.left)), r = Math.max(...es.map(r => r.right)), tp = Math.min(...es.map(r => r.top)), b = Math.max(...es.map(r => r.bottom));
      return [(l + r) / 2, (tp + b) / 2]; };
    w._K = kf.map(([tt, alvo, S = 1, rx = 0, ry = 0, ox = 0, oy = 0]) => {
      const [x, y] = Array.isArray(alvo) && typeof alvo[0] === 'number' ? alvo : caixa(alvo);
      return [tt, x + ox, y + oy, S, rx, ry]; });
    salvo.forEach(([e, tr]) => e.style.transform = tr);
  }
  const K = w._K, lin = x => { if (x <= K[0][0]) return K[0].slice(1); if (x >= K[K.length - 1][0]) return K[K.length - 1].slice(1);
    let i = 0; while (x > K[i + 1][0]) i++; const u = (x - K[i][0]) / (K[i + 1][0] - K[i][0]); return K[i].slice(1).map((a, c) => L(a, K[i + 1][c + 1], u)); };
  const N = 8, v = [0, 0, 0, 0, 0];   // média móvel: arredonda só as viradas, o resto é linear
  for (let k = -N; k <= N; k++) lin(t + k * 0.05).forEach((a, c) => v[c] += a / (2 * N + 1));
  let [fx, fy, S, rx, ry] = v;
  const [jl, jr, jcx] = w._jan, meia = 540 / S + 14 / S;            // presa às bordas: com zoom a janela cobre a largura toda
  fx = jr - jl > 2 * meia ? Math.min(Math.max(fx, jl + meia), jr - meia) : jcx;
  fx += 2.5 * Math.sin(t * 0.9); fy += 2 * Math.cos(t * 0.7);
  w.style.transform = `translate(${FOCO[0]}px, ${FOCO[1]}px) perspective(1700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${S}) translate(${-fx}px, ${-fy}px)`;
}
// segura no alvo de a até b empurrando de leve (+3 %): a câmera nunca congela
const fica = (a, b, alvo, S, rx = 0, ry = 0, ox = 0, oy = 0) => [[a, alvo, S, rx, ry, ox, oy], [b, alvo, S * 1.03, rx * 0.6, ry * 0.6, ox, oy]];

/* troca entre duas telas cheias coladas: a janela antiga sai empurrada pra esquerda e a nova entra pela direita
   (sem flash/faixa de luz: reprovado 07/10, "tire esse flash/blur e deixe esse movimento") (pedido Leadrive 07/10: "motion de transição entre as telas, sem mostrar a modelo").
   Chamar DEPOIS do A() das duas janelas. A janela A deve terminar (b do A()) em t0; a B começar (a do A()) em t0. */
function passa(t, elA, elB, t0, d = 0.6) {
  const A_ = typeof elA === 'string' ? $(elA) : elA, B_ = typeof elB === 'string' ? $(elB) : elB;
  if (t < t0 || t > t0 + 0.8) return;
  const p = E.cubicInOut(C((t - t0) / d));
  if (t <= t0 + d) { A_.style.opacity = 1; A_.style.filter = 'none'; A_.style.transform = `translate(-50%,-50%) translateX(${-1150 * p}px) scale(${1 - 0.06 * p})`; }
  else A_.style.opacity = 0;
  B_.style.opacity = 1; B_.style.filter = 'none';
  B_.style.transform = `translate(-50%,-50%) translateX(${1150 * (1 - p)}px) scale(${0.94 + 0.06 * p})`;
}
