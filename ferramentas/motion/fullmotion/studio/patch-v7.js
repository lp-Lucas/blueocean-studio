// ajuste v7: cena do pedido no chat (18,5–24,3 s) — botão de enviar no canto certo e câmera contínua em 3D (sem cortes picotados)
const fs = require('fs'); let s = fs.readFileSync('studio.html', 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('não achei: ' + String(a).slice(0, 90)); s = s.replace(a, b); };
const corta = (ini, fim, novo) => { const a = s.indexOf(ini), b = s.indexOf(fim, a); if (a < 0 || b < 0) throw new Error('trecho: ' + ini.slice(0, 50)); s = s.slice(0, a) + novo + s.slice(b); };

// o campo de texto ocupa a caixa toda: o botão de enviar fica na ponta direita, como no app
rep('  #frMsgU { position: relative; }', '  #frMsgU { position: relative; }\n  #frPainel #fraseTxt { flex: 1 1 auto; width: auto !important; min-width: 0; }');

// câmera com inclinação 3D (rx/ry) e borrão de movimento ajustável (vb)
rep('  cam.style.transform = `translate(540px, ${c.sy ?? 960}px) scale(${c.S}) translate(${-c.fx}px, ${-c.fy}px)`;',
    '  cam.style.transform = `translate(540px, ${c.sy ?? 960}px) perspective(1700px) rotateX(${c.rx || 0}deg) rotateY(${c.ry || 0}deg) scale(${c.S}) translate(${-c.fx}px, ${-c.fy}px)`;');
rep('const bx = Math.min(30, Math.min(7, Math.abs(dx) * 0.06 + dz * 0.08) + (c.bx || 0)), by = Math.min(30, Math.min(7, Math.abs(dy) * 0.06 + dz * 0.08) + (c.by || 0));',
    'const vb = c.vb ?? 1, bx = Math.min(30, Math.min(7, Math.abs(dx) * 0.06 + dz * 0.08) * vb + (c.bx || 0)), by = Math.min(30, Math.min(7, Math.abs(dy) * 0.06 + dz * 0.08) * vb + (c.by || 0));');

// câmera nova: um movimento só, com os alvos trocando suavemente
corta('/* câmera da cena da frase:', '\n}\n', `/* câmera da cena do pedido: um movimento contínuo (sem cortes) — entra inclinada no chat, desliza até o input,
   segue o cursor do texto, corre até o botão, empurra no clique, abre girando no contador e no chat trabalhando, fecha na frase */
const liso = (t, a, b) => E.cubicInOut(C((t - a) / (b - a)));
const mix = (p, q, k) => [L(p[0], q[0], k), L(p[1], q[1], k)];
function fraseCam(t) {
  const set = $('#frCam'), cx = $('#frCaixa'), [ix, iy] = noSet(cx, set), W = cx.offsetWidth, H = cx.offsetHeight;
  const car = ix + caretEm(LARG2, FRASE, t, 19.05, 20.3), bot = ix + W - 22, yc = iy + H / 2;
  const mu = $('#frMsgU'), [mx, my] = noSet(mu, set), mc = [mx + mu.offsetWidth / 2, my + mu.offsetHeight / 2 + 30];
  const S = kf(t, [[18.45, 1.65], [19.2, 3.6], [20.3, 3.9], [20.75, 4.05], [20.93, 4.05], [21.03, 4.5], [21.8, 2.4], [22.02, 2.5], [22.12, 2.62], [22.45, 2.55], [23.1, 3.15], [24.08, 3.35]]);
  let f = [195, 360];                                                           // o chat inteiro
  f = mix(f, [Math.max(ix + 100, car - 70 / S), yc], liso(t, 18.6, 19.2));      // até o input, seguindo o cursor do texto
  f = mix(f, [bot - 30, yc], liso(t, 20.2, 20.75));                             // corre até o botão
  f = mix(f, [195, 175], liso(t, 21.05, 21.8));                                 // abre: contador da tarefa + chat trabalhando
  f = mix(f, mc, liso(t, 22.45, 23.1));                                         // fecha na frase enviada
  const c = { fx: f[0] + Math.sin(t * 1.7) * 2, fy: f[1] + Math.cos(t * 1.3) * 2, S, vb: 0.35,
    rx: kf(t, [[18.45, 24], [19.2, 7], [20.3, 4], [20.95, 2], [21.8, 11], [22.45, 7], [23.1, 3], [24.08, 2]]),
    ry: kf(t, [[18.45, -20], [19.2, -8], [20.3, 7], [20.95, 4], [21.8, -11], [22.45, -6], [23.1, 5], [24.08, 8]]),
    bx: pulso(t, 18.47, 22) };
  if (t > 24.08) { const w = E.cubicIn(C((t - 24.08) / 0.22)); c.S *= L(1, 4, w); c.vb = 1; }
  return c;
}`);
fs.writeFileSync('studio.html', s); console.log('ok');
