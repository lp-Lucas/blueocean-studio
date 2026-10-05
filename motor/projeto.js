/* Projetos: cada um é uma pasta em projetos/<nome> com
     projeto.json        as mídias do projeto (compartilhadas) e a lista de composições
     composicoes/<id>.json   cada composição é um vídeo: formato, faixas, legenda e áudio
                         (é isto que o preview desenha e a exportação renderiza)
     chat.json           a conversa com o Claude (e a sessão para continuar de onde parou)
     transcricoes/       palavras com tempo de cada mídia
     cache/              proxies do preview, formas de onda, arquivos temporários
     midia/              vídeos baixados da internet
     saidas/             vídeos exportados
     quadros/            quadros que o Claude renderiza para conferir o resultado
   Para o resto do programa, "o projeto" é a VISTA de uma composição: os campos dela + as mídias. */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const U = require('./util');
const T = require('./tarefas');

const PASTA = path.join(U.DADOS, 'projetos');
fs.mkdirSync(PASTA, { recursive: true });

const FORMATOS = { '9:16': [1080, 1920], '4:5': [1080, 1350], '1:1': [1080, 1080], '16:9': [1920, 1080] };
const CAMPOS_COMP = ['formato', 'faixas', 'legenda', 'audio'];

const dir = nome => {
  const n = U.limparNome(nome);
  if (!n) throw new Error('nome de projeto inválido');
  return path.join(PASTA, n);
};
const arqProjeto = nome => path.join(dir(nome), 'projeto.json');
const arqComp = (nome, id) => path.join(dir(nome), 'composicoes', String(id).replace(/[^\w-]/g, '') + '.json');

function compVazia(id, nomeComp, formato = '9:16') {
  const [w, h] = Array.isArray(formato) ? formato : (FORMATOS[formato] || FORMATOS['9:16']);
  return {
    id, nome: nomeComp,
    formato: { w, h, fps: 30 },
    faixas: [
      { id: 'V1', tipo: 'video', nome: 'Vídeo 1', itens: [] },
      { id: 'V2', tipo: 'video', nome: 'Vídeo 2', itens: [] },
      { id: 'T1', tipo: 'texto', nome: 'Textos', itens: [] },
      { id: 'FX', tipo: 'efeito', nome: 'Efeitos', itens: [] },
    ],
    legenda: { ativa: false, tam: 72, pos: 72, palavras: 3, maiusculas: false },
    audio: { normalizar: true, lufs: -14, limpar: false, voz: false },
  };
}
function novo(nome) {
  return { versao: 2, nome, criado: new Date().toISOString(), midias: {}, composicoes: [{ id: 'comp1', nome: 'Vídeo 1' }], ativa: 'comp1', seqComp: 1 };
}

/* o app grava; o observador de arquivo ignora a própria gravação comparando o texto */
const ultimoGravado = new Map();
function gravarJson(f, v) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const txt = JSON.stringify(v, null, 1);
  ultimoGravado.set(f, txt);
  const tmp = f + '.tmp';
  fs.writeFileSync(tmp, txt);
  fs.renameSync(tmp, f);
}
const foiEuQueGravei = (f, txt) => ultimoGravado.get(f) === txt;

/* projeto antigo (linha do tempo dentro do projeto.json) vira a composição "Vídeo 1" */
function migrar(nome, base) {
  if (Array.isArray(base.composicoes) && base.composicoes.length) return base;
  // guarda o arquivo antigo antes de converter
  try { fs.copyFileSync(arqProjeto(nome), path.join(dir(nome), 'projeto.antes-das-composicoes.json')); } catch {}
  const c = { id: 'comp1', nome: 'Vídeo 1' };
  for (const k of CAMPOS_COMP) if (base[k] !== undefined) c[k] = base[k];
  gravarJson(arqComp(nome, 'comp1'), { ...compVazia('comp1', 'Vídeo 1'), ...c });
  for (const k of CAMPOS_COMP) delete base[k];
  Object.assign(base, { versao: 2, composicoes: [{ id: 'comp1', nome: 'Vídeo 1' }], ativa: 'comp1', seqComp: 1 });
  gravarJson(arqProjeto(nome), base);
  return base;
}
function carregarBase(nome) {
  const base = JSON.parse(fs.readFileSync(arqProjeto(nome), 'utf8'));
  base.midias = base.midias || {};
  return migrar(nome, base);
}
const salvarBase = (nome, base) => gravarJson(arqProjeto(nome), base);
function idComp(base, comp) {
  const lista = base.composicoes;
  if (comp) {
    const k = String(comp).toLowerCase();
    const achou = lista.find(c => c.id.toLowerCase() === k) || lista.find(c => c.nome.toLowerCase() === k);
    if (!achou) throw new Error(`composição não encontrada: ${comp} (existem: ${lista.map(c => `${c.id} "${c.nome}"`).join(', ')})`);
    return achou.id;
  }
  return (lista.find(c => c.id === base.ativa) || lista[0]).id;
}
function carregarComp(nome, id) {
  const f = arqComp(nome, id);
  const c = U.ler(f, null);
  if (!c) { const v = compVazia(id, id); gravarJson(f, v); return v; }
  return c;
}
/* a vista que o resto do programa usa: composição + mídias do projeto */
function carregar(nome, comp) {
  const base = carregarBase(nome);
  const id = idComp(base, comp);
  const c = carregarComp(nome, id);
  const v = { ...c, nome: base.nome || path.basename(dir(nome)), comp: id, compNome: base.composicoes.find(x => x.id === id).nome, midias: base.midias };
  delete v.id;
  return v;
}
/* grava a vista: os campos da composição no arquivo dela, as mídias no projeto.json */
function salvar(nome, vista, comp) {
  const base = carregarBase(nome);
  const id = idComp(base, comp || vista.comp);
  const atual = carregarComp(nome, id);
  const c = { id, nome: atual.nome };
  for (const k of CAMPOS_COMP) c[k] = vista[k] !== undefined ? vista[k] : atual[k];
  gravarJson(arqComp(nome, id), c);
  if (vista.midias && JSON.stringify(vista.midias) !== JSON.stringify(base.midias)) { base.midias = vista.midias; salvarBase(nome, base); }
}

/* ── composições ── */
function duracaoComp(d) {
  let dur = 0, itens = 0;
  for (const f of d.faixas || []) for (const it of f.itens || []) {
    itens++;
    const fim = f.tipo === 'texto' ? +it.fim || 0 : f.tipo === 'efeito' ? (+it.inicio || 0) + (+it.dur || 0.6) : (+it.inicio || 0) + ((+it.saida || 0) - (+it.entrada || 0));
    dur = Math.max(dur, fim);
  }
  return { dur, itens };
}
function composicoes(nome) {
  const base = carregarBase(nome);
  return {
    ativa: base.ativa,
    lista: base.composicoes.map(c => {
      const d = U.ler(arqComp(nome, c.id), {});
      let alterado = 0; try { alterado = fs.statSync(arqComp(nome, c.id)).mtimeMs; } catch {}
      return { id: c.id, nome: c.nome, ...duracaoComp(d), formato: d.formato, alterado };
    }),
  };
}
function criarComp(nome, { nome: nomeComp, copiarDe = null } = {}) {
  const base = carregarBase(nome);
  let n = +base.seqComp || base.composicoes.length;
  let id;
  do { id = 'comp' + (++n); } while (base.composicoes.some(c => c.id === id) || fs.existsSync(arqComp(nome, id)));
  base.seqComp = n;
  const titulo = String(nomeComp || '').trim() || `Vídeo ${base.composicoes.length + 1}`;
  const atual = carregarComp(nome, idComp(base));
  const modelo = copiarDe ? carregarComp(nome, idComp(base, copiarDe)) : null;
  const c = modelo ? { ...JSON.parse(JSON.stringify(modelo)), id, nome: titulo }
    : compVazia(id, titulo, [atual.formato?.w || 1080, atual.formato?.h || 1920]);
  gravarJson(arqComp(nome, id), c);
  base.composicoes.push({ id, nome: titulo });
  salvarBase(nome, base);
  return id;
}
function renomearComp(nome, comp, novoNome) {
  const base = carregarBase(nome);
  const id = idComp(base, comp);
  const t = String(novoNome || '').trim();
  if (!t) throw new Error('nome vazio');
  base.composicoes.find(c => c.id === id).nome = t;
  salvarBase(nome, base);
  const c = carregarComp(nome, id); c.nome = t; gravarJson(arqComp(nome, id), c);
}
function apagarComp(nome, comp) {
  const base = carregarBase(nome);
  const id = idComp(base, comp);
  if (base.composicoes.length <= 1) throw new Error('o projeto precisa de pelo menos uma composição');
  base.composicoes = base.composicoes.filter(c => c.id !== id);
  if (base.ativa === id) base.ativa = base.composicoes[0].id;
  salvarBase(nome, base);
  // não some de vez: vai para composicoes/_apagadas
  const lixo = path.join(dir(nome), 'composicoes', '_apagadas');
  fs.mkdirSync(lixo, { recursive: true });
  try { fs.renameSync(arqComp(nome, id), path.join(lixo, `${id} ${Date.now()}.json`)); } catch {}
}
function ordenarComps(nome, ids) {
  const base = carregarBase(nome);
  base.composicoes.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  salvarBase(nome, base);
}
function ativarComp(nome, comp) {
  const base = carregarBase(nome);
  base.ativa = idComp(base, comp);
  salvarBase(nome, base);
  return base.ativa;
}

/* Leva partes de uma composição para outras. As mídias de cada vídeo continuam as dele:
     legenda        o estilo da legenda (não as palavras)     audio    o acabamento de som
     formato        tamanho e fps                             efeitos  a faixa de efeitos inteira
     textos         as faixas de texto inteiras (headlines e faixas de qualificação, com o texto)
     estilo-textos  só a aparência dos textos (fonte, tamanho, cor, posição, estilo, entrada),
                    casando item por item na ordem e mantendo o texto de cada vídeo */
const PARTES = ['legenda', 'audio', 'formato', 'textos', 'estilo-textos', 'efeitos'];
const CAMPOS_ESTILO = ['estilo', 'fonte', 'tam', 'cor', 'fundo', 'papel', 'contorno', 'largura', 'entrelinha', 'alinhamento', 'maiusculas', 'animacao', 'x', 'y', 'altura', 'logo', 'entrada', 'durEntrada'];
function aplicarEm(nome, { de, em = 'todas', partes = [] }) {
  const base = carregarBase(nome);
  const origemId = idComp(base, de);
  const origem = carregarComp(nome, origemId);
  const alvos = em === 'todas' ? base.composicoes.map(c => c.id).filter(id => id !== origemId)
    : String(em).split(',').map(x => idComp(base, x.trim())).filter(id => id !== origemId);
  const ps = (Array.isArray(partes) ? partes : String(partes).split(',')).map(x => x.trim()).filter(Boolean);
  if (!ps.length) throw new Error(`diga o que aplicar: ${PARTES.join(', ')}`);
  for (const p of ps) if (!PARTES.includes(p)) throw new Error(`parte desconhecida: ${p} (use: ${PARTES.join(', ')})`);
  const copia = v => JSON.parse(JSON.stringify(v));
  const textosDe = c => (c.faixas || []).filter(f => f.tipo === 'texto').flatMap(f => f.itens);
  const tipoTxt = it => it.tipo || 'texto';
  for (const id of alvos) {
    const c = carregarComp(nome, id);
    if (ps.includes('legenda')) c.legenda = copia(origem.legenda);
    if (ps.includes('audio')) c.audio = copia(origem.audio);
    if (ps.includes('formato')) c.formato = copia(origem.formato);
    for (const [parte, tipo] of [['textos', 'texto'], ['efeitos', 'efeito']]) {
      if (!ps.includes(parte)) continue;
      c.faixas = (c.faixas || []).filter(f => f.tipo !== tipo);
      const novas = copia((origem.faixas || []).filter(f => f.tipo === tipo));
      for (const f of novas) for (const it of f.itens) it.id = it.id + '_' + id;
      c.faixas.push(...novas);
    }
    if (ps.includes('estilo-textos') && !ps.includes('textos')) {
      const fonte = textosDe(origem), destino = textosDe(c);
      for (const it of destino) {
        const mesmos = destino.filter(o => tipoTxt(o) === tipoTxt(it));
        const modelo = fonte.filter(o => tipoTxt(o) === tipoTxt(it))[mesmos.indexOf(it)];
        if (modelo) for (const k of CAMPOS_ESTILO) if (modelo[k] !== undefined) it[k] = copia(modelo[k]);
      }
    }
    gravarJson(arqComp(nome, id), c);
  }
  return alvos;
}

function listar() {
  return fs.readdirSync(PASTA, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(PASTA, e.name, 'projeto.json')))
    .map(e => {
      const d = path.join(PASTA, e.name);
      let base = {};
      try { base = carregarBase(e.name); } catch {}
      // "alterado" = o arquivo mais recente entre o projeto e as composições
      let alterado = fs.statSync(path.join(d, 'projeto.json')).mtimeMs;
      const pc = path.join(d, 'composicoes');
      if (fs.existsSync(pc)) for (const f of fs.readdirSync(pc)) if (f.endsWith('.json')) alterado = Math.max(alterado, fs.statSync(path.join(pc, f)).mtimeMs);
      const primeira = base.composicoes?.[0] ? U.ler(arqComp(e.name, base.composicoes[0].id), {}) : {};
      return { nome: e.name, alterado, formato: primeira.formato, midias: Object.keys(base.midias || {}).length, composicoes: base.composicoes?.length || 1 };
    })
    .sort((a, b) => b.alterado - a.alterado);
}

function criar(nome, formato) {
  const d = dir(nome);
  if (fs.existsSync(path.join(d, 'projeto.json'))) throw new Error('já existe um projeto com esse nome');
  for (const s of ['transcricoes', 'cache', 'midia', 'saidas', 'quadros', 'composicoes']) fs.mkdirSync(path.join(d, s), { recursive: true });
  const nomeP = path.basename(d);
  gravarJson(arqComp(nomeP, 'comp1'), compVazia('comp1', 'Vídeo 1', formato));
  const base = novo(nomeP);
  gravarJson(path.join(d, 'projeto.json'), base);
  U.gravar(path.join(d, 'chat.json'), { sessao: null, mensagens: [] });
  return base;
}

function apagar(nome) {
  const d = dir(nome);
  const lixo = path.join(PASTA, '_apagados');
  fs.mkdirSync(lixo, { recursive: true });
  fs.renameSync(d, path.join(lixo, path.basename(d) + ' ' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')));
}

/* ── mídias ─────────────────────────────────────────────────────────────── */
/* número de mídia nunca é reaproveitado: um "m1" novo herdaria o proxy, a miniatura e a
   transcrição do "m1" que foi tirado do projeto (era o bug do link que puxava o primeiro vídeo) */
function proximoId(p, d) {
  let n = +p.seqMidia || 0;
  const conta = s => { const m = String(s).match(/^m(\d+)\b/); if (m) n = Math.max(n, +m[1]); };
  Object.keys(p.midias).forEach(conta);
  for (const sub of ['cache', 'transcricoes']) { const pasta = path.join(d, sub); if (fs.existsSync(pasta)) fs.readdirSync(pasta).forEach(conta); }
  p.seqMidia = n + 1;
  return 'm' + (n + 1);
}

function expandir(caminhos) {
  const saida = [];
  for (const c of caminhos) {
    if (/^https?:\/\//i.test(c)) { saida.push(c); continue; }
    if (!fs.existsSync(c)) throw new Error('não achei: ' + c);
    if (fs.statSync(c).isDirectory()) {
      for (const f of fs.readdirSync(c).sort()) {
        const p = path.join(c, f);
        if (fs.statSync(p).isFile() && (U.VIDEO.test(f) || U.IMAGEM.test(f) || U.AUDIO.test(f))) saida.push(p);
      }
    } else saida.push(path.resolve(c));
  }
  return saida;
}

/* Importa referências (não copia o arquivo). Link é baixado para midia/ (soAudio: só o áudio). */
/* Substituir: o arquivo novo assume o lugar da mídia, com o MESMO número (m3 continua m3).
   Cortes, textos e composições que usam essa mídia continuam apontando para ela.
   "versao" muda a cada troca: o preview recarrega mesmo quando o arquivo novo tem o mesmo caminho. */
async function substituirMidia(nome, id, arquivo) {
  if (!fs.existsSync(arquivo)) throw new Error('não achei o arquivo: ' + arquivo);
  const base = carregarBase(nome);
  const antes = base.midias[id];
  if (!antes) throw new Error('mídia não encontrada: ' + id);
  const i = await U.info(arquivo);
  if (antes.tipo !== i.tipo && !(antes.tipo === 'video' && i.tipo === 'imagem') && !(antes.tipo === 'imagem' && i.tipo === 'video'))
    throw new Error(`a mídia ${id} é ${antes.tipo} e o arquivo novo é ${i.tipo}`);
  const depois = { ...antes, ...i, nome: path.basename(arquivo), arquivo: path.resolve(arquivo), versao: Date.now(), substituida: new Date().toISOString() };
  base.midias[id] = depois;
  salvarBase(nome, base);
  prepararPreview(nome, id).catch(() => {});
  return { antes, depois };
}
/* depois de trocar um vídeo cuja fala andou no tempo: move a entrada/saída de todos os cortes dessa mídia */
function moverCortes(nome, id, delta) {
  const base = carregarBase(nome);
  const dur = base.midias[id]?.dur || 1e9;
  let n = 0;
  for (const c of base.composicoes) {
    const comp = carregarComp(nome, c.id);
    let mudou = false;
    for (const f of comp.faixas || []) for (const it of f.itens || []) {
      if (it.midia !== id) continue;
      const len = (+it.saida || 0) - (+it.entrada || 0);
      let entrada = Math.max(0, (+it.entrada || 0) + delta);
      entrada = Math.min(entrada, Math.max(0, dur - 0.1));
      it.entrada = +entrada.toFixed(3);
      it.saida = +Math.min(dur, entrada + len).toFixed(3);
      mudou = true; n++;
    }
    if (mudou) gravarJson(arqComp(nome, c.id), comp);
  }
  return n;
}

async function importar(nome, caminhos, { baixar, aoLog = () => {}, soAudio = false } = {}) {
  const d = dir(nome);
  const novos = [];
  for (const c of expandir(caminhos)) {
    let arq = c;
    if (/^https?:\/\//i.test(c)) { arq = await baixar(c, path.join(d, 'midia'), { soAudio }); aoLog('baixado: ' + path.basename(arq)); }
    const p = carregarBase(nome);   // relê: o Claude pode ter mexido no meio
    const ja = Object.entries(p.midias).find(([, m]) => path.resolve(m.arquivo) === path.resolve(arq));
    if (ja) { aoLog(`${path.basename(arq)} já está no projeto como ${ja[0]}`); novos.push(ja[0]); continue; }
    const i = await U.info(arq);
    const id = proximoId(p, d);
    p.midias[id] = { nome: path.basename(arq), arquivo: arq, ...i };
    salvarBase(nome, p);
    aoLog(`${id}: ${path.basename(arq)} — ${i.tipo}, ${i.w}x${i.h}, ${i.dur.toFixed(1)}s${i.audio ? '' : ', sem áudio'}`);
    novos.push(id);
    if (i.tipo !== 'imagem') prepararPreview(nome, id).catch(() => {});
  }
  return novos;
}

/* O preview toca direto do arquivo quando o Chromium aguenta (H.264 até 1080p).
   4K, HEVC 10 bits, HDR e ProRes ganham um proxy leve com GOP curto (arrastar a agulha fica fluido).
   A exportação sempre usa o original. */
const alfaWebm = m => m.codec === 'vp9' && /\.webm$/i.test(m.arquivo);   // peça de motion com transparência: o proxy H.264 perderia o alfa
const precisaProxy = m => m.tipo === 'video' && !alfaWebm(m) && (
  m.codec !== 'h264' || Math.max(m.w, m.h) > 1920 || /10|12/.test(m.pix) || m.hdr || !/\.(mp4|mov|m4v|webm)$/i.test(m.arquivo));

/* a mesma mídia pode ser pedida duas vezes (importação e abertura do projeto): uma só execução */
const preparando = new Map();
function prepararPreview(nome, id) {
  const k = nome + '|' + id;
  if (!preparando.has(k)) preparando.set(k, prepararPreview1(nome, id).finally(() => preparando.delete(k)));
  return preparando.get(k);
}
async function prepararPreview1(nome, id) {
  const d = dir(nome);
  const m = carregarBase(nome).midias[id];
  if (!m) return;
  const cache = path.join(d, 'cache');
  fs.mkdirSync(cache, { recursive: true });
  // o cache guarda de qual arquivo veio; se a mídia com esse número mudou, joga fora e refaz
  const origem = path.join(cache, id + '.origem.txt');
  let mtime = 0; try { mtime = Math.round(fs.statSync(m.arquivo).mtimeMs); } catch {}
  const assinatura = `${path.resolve(m.arquivo)}|${m.dur}|${mtime}`;
  if (!fs.existsSync(origem) || fs.readFileSync(origem, 'utf8') !== assinatura) {
    for (const f of fs.readdirSync(cache)) if (f.startsWith(id + '.')) try { fs.unlinkSync(path.join(cache, f)); } catch {}
    fs.writeFileSync(origem, assinatura);
  }
  const thumb = path.join(cache, id + '.thumb.jpg');
  if (!fs.existsSync(thumb) && m.tipo !== 'audio')
    await U.rodar('ffmpeg', ['-y', '-v', 'error', ...(m.tipo === 'video' ? ['-ss', String(Math.min(1, m.dur / 3))] : []), '-i', m.arquivo,
      '-frames:v', '1', '-vf', [U.corNormal(m), 'scale=320:320:force_original_aspect_ratio=decrease'].filter(Boolean).join(','), '-q:v', '4', thumb]).catch(() => {});
  const onda = path.join(cache, id + '.onda.json');
  if (m.audio && !fs.existsSync(onda)) await gerarOnda(m.arquivo, onda).catch(() => {});
  const proxy = path.join(cache, id + '.proxy.mp4');
  if (precisaProxy(m) && !fs.existsSync(proxy)) {
    await T.rodar(`Proxy de ${m.nome}`, nome, async t => {
      const vf = [U.corNormal(m), m.w >= m.h ? 'scale=-2:720' : 'scale=720:-2', 'format=yuv420p'].filter(Boolean).join(',');
      const tmp = proxy + '.tmp.mp4';
      await U.codificar(enc => ['-i', m.arquivo, '-map', '0:v:0', '-map', '0:a:0?', '-vf', vf,
        ...U.vcodec(enc, 'proxy'), '-g', '15', '-bf', '0', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', tmp],
        m.dur, f => T.progresso(t, 'gerando versão leve para o preview', f * 100), t.controle);
      fs.renameSync(tmp, proxy);
    });
  }
}

/* forma de onda: pico a cada 20 ms, de 0 a 100 */
function gerarOnda(arquivo, destino) {
  return new Promise((ok, falha) => {
    const p = spawn('ffmpeg', ['-v', 'error', '-i', arquivo, '-vn', '-ac', '1', '-ar', '1000', '-f', 's16le', '-'], { windowsHide: true });
    const partes = [];
    p.stdout.on('data', d => partes.push(d));
    p.on('error', falha);
    p.on('close', c => {
      if (c) return falha(new Error('onda falhou'));
      const b = Buffer.concat(partes); const n = Math.floor(b.length / 2);
      const picos = [];
      for (let i = 0; i < n; i += 20) {
        let m = 0;
        for (let k = i; k < Math.min(n, i + 20); k++) { const v = Math.abs(b.readInt16LE(k * 2)); if (v > m) m = v; }
        picos.push(Math.round(Math.min(1, m / 32768 * 1.4) * 100));
      }
      fs.writeFileSync(destino, JSON.stringify(picos));
      ok();
    });
  });
}

function transcricoes(nome) {
  const d = path.join(dir(nome), 'transcricoes');
  const r = {};
  if (!fs.existsSync(d)) return r;
  for (const f of fs.readdirSync(d)) if (f.endsWith('.json')) r[f.replace(/\.json$/, '')] = U.ler(path.join(d, f), []);
  return r;
}

module.exports = { PASTA, FORMATOS, PARTES, dir, arqProjeto, arqComp, listar, criar, carregar, salvar, carregarBase, salvarBase, foiEuQueGravei, apagar, importar, prepararPreview, transcricoes,
  composicoes, criarComp, renomearComp, apagarComp, ordenarComps, ativarComp, aplicarEm, substituirMidia, moverCortes };
