/* Catálogo das fontes do computador (e da pasta fontes/ do app).
   Cada arquivo vira uma entrada com as métricas que o libass usa (winAscent/winDescent),
   para o preview medir igual à exportação. Fonte variável fica de fora: o libass só
   desenha o peso padrão dela (a Outfit variável sairia Thin). */
const fs = require('fs');
const path = require('path');
const U = require('./util');

const PASTAS = [path.join(U.RAIZ, 'fontes'), 'C:\\Windows\\Fonts',
  path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'Windows', 'Fonts')];

function lerBytes(fd, pos, n) { const b = Buffer.alloc(n); fs.readSync(fd, b, 0, n, pos); return b; }

function lerFonte(arq) {
  const fd = fs.openSync(arq, 'r');
  try {
    const cab = lerBytes(fd, 0, 12);
    const tag = cab.toString('latin1', 0, 4);
    if (tag === 'ttcf' || tag === 'wOFF') return null;
    const n = cab.readUInt16BE(4);
    const dir = lerBytes(fd, 12, n * 16);
    const t = {};
    for (let i = 0; i < n; i++) t[dir.toString('latin1', i * 16, i * 16 + 4)] = { pos: dir.readUInt32BE(i * 16 + 8), tam: dir.readUInt32BE(i * 16 + 12) };
    if (t.fvar || !t.name || !t['OS/2'] || !t.head) return null;
    const head = lerBytes(fd, t.head.pos, 54);
    const os2 = lerBytes(fd, t['OS/2'].pos, Math.min(96, t['OS/2'].tam));
    const nm = lerBytes(fd, t.name.pos, Math.min(t.name.tam, 200000));
    const nomes = {};
    const cnt = nm.readUInt16BE(2), base = nm.readUInt16BE(4);
    for (let i = 0; i < cnt; i++) {
      const o = 6 + i * 12;
      const plat = nm.readUInt16BE(o), enc = nm.readUInt16BE(o + 2), lang = nm.readUInt16BE(o + 4), id = nm.readUInt16BE(o + 6), len = nm.readUInt16BE(o + 8), off = nm.readUInt16BE(o + 10);
      if (![1, 2, 4, 16, 17].includes(id)) continue;
      const raw = nm.subarray(base + off, base + off + len);
      let s = null;
      if (plat === 3 && (enc === 1 || enc === 0)) { s = ''; for (let k = 0; k + 1 < raw.length; k += 2) s += String.fromCharCode(raw.readUInt16BE(k)); if (lang !== 0x409 && nomes[id]) continue; }
      else if (plat === 1 && enc === 0 && !nomes[id]) s = raw.toString('latin1');
      if (s) nomes[id] = s;
    }
    const familia = nomes[16] || nomes[1], estilo = nomes[17] || nomes[2] || 'Regular';
    if (!familia || familia.startsWith('.')) return null;
    // grupo: a família sem o peso no nome ("Instrument Sans SemiBold" → "Instrument Sans")
    const grupo = nomes[16] || familia.replace(/\s+(Thin|Hairline|ExtraLight|Extra Light|UltraLight|Light|Regular|Book|Medium|SemiBold|Semi Bold|DemiBold|Bold|ExtraBold|Extra Bold|UltraBold|Black|Heavy)$/i, '');
    return {
      id: path.basename(arq).replace(/\.(ttf|otf)$/i, ''),
      nome: nomes[4] || `${familia} ${estilo}`, familia, estilo, grupo,
      peso: os2.readUInt16BE(4), italico: !!(os2.readUInt16BE(62) & 1),
      winA: os2.readUInt16BE(74), winD: os2.readUInt16BE(76), upem: head.readUInt16BE(18),
      arquivo: arq,
    };
  } finally { fs.closeSync(fd); }
}

let cache = null;
function listar() {
  if (cache) return cache;
  const vistos = new Map();
  for (const d of PASTAS) {
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      if (!/\.(ttf|otf)$/i.test(f)) continue;
      try {
        const e = lerFonte(path.join(d, f));
        if (e && e.winA + e.winD > 0 && !vistos.has(e.id)) vistos.set(e.id, e);
      } catch {}
    }
  }
  cache = [...vistos.values()].sort((a, b) => a.grupo.localeCompare(b.grupo) || a.italico - b.italico || a.peso - b.peso);
  return cache;
}

/* pasta temporária só com as fontes que o projeto usa (o libass acha por nome completo) */
function pastaDoProjeto(ids, destino) {
  fs.mkdirSync(destino, { recursive: true });
  for (const f of fs.readdirSync(destino)) try { fs.unlinkSync(path.join(destino, f)); } catch {}
  const cat = new Map(listar().map(e => [e.id, e]));
  for (const id of new Set(ids)) {
    const e = cat.get(id); if (!e) continue;
    fs.copyFileSync(e.arquivo, path.join(destino, path.basename(e.arquivo)));
  }
  return destino;
}

module.exports = { listar, pastaDoProjeto };
