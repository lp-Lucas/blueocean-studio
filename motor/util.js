/* Utilidades do motor: rodar processos, ler vídeo com ffprobe, configuração. */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const ARQ_CFG = path.join(RAIZ, 'config.json');
const PADRAO_CFG = {
  python: 'C:\\Users\\lpess\\OneDrive\\Documentos\\Projetos\\KIKO CAPUTO\\editor\\.venv\\Scripts\\python.exe',
  claude: '',          // vazio = acha sozinho (PATH ou extensão do VS Code)
  modelo: '',          // vazio = padrão do Claude Code; "sonnet", "opus"...
  encoder: 'h264_nvenc',
  acervo: 'C:\\Users\\lpess\\OneDrive\\Documentos\\blueocean\\acervo neri',
};
function cfg() {
  let c = {};
  try { c = JSON.parse(fs.readFileSync(ARQ_CFG, 'utf8')); } catch {}
  return { ...PADRAO_CFG, ...c };
}
function gravarCfg(novo) {
  const c = { ...cfg(), ...novo };
  fs.writeFileSync(ARQ_CFG, JSON.stringify(c, null, 2));
  return c;
}

const ler = (f, padrao) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return padrao; } };
const gravar = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(v, null, 1)); };

/* Roda um programa. aoLinha recebe cada linha de stdout (e de stderr, se aoErro não for dado).
   Guarda o pedaço de linha incompleto: um evento JSON cortado ao meio não pode se perder. */
function rodar(cmd, args, { stdin, aoLinha, aoErro, cwd, env, controle } = {}) {
  return new Promise((ok, falha) => {
    const p = spawn(cmd, args, {
      cwd, windowsHide: true,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1', ...(env || {}) },
    });
    if (controle) controle.processo = p;
    let out = '', err = '', r1 = '', r2 = '';
    const quebra = (resto, s, cb) => { const ls = (resto + s).split(/\r?\n|\r/); const novo = ls.pop(); ls.filter(Boolean).forEach(cb); return novo; };
    p.stdout.on('data', d => { const s = d.toString(); out += s; if (out.length > 4e6) out = out.slice(-2e6); if (aoLinha) r1 = quebra(r1, s, aoLinha); });
    p.stderr.on('data', d => { const s = d.toString(); err += s; if (err.length > 4e6) err = err.slice(-2e6); const cb = aoErro || null; if (cb) r2 = quebra(r2, s, cb); });
    p.on('error', falha);
    p.on('close', c => {
      if (aoLinha && r1) aoLinha(r1);
      if (aoErro && r2) aoErro(r2);
      if (controle?.cancelado) return falha(new Error('cancelado'));
      c === 0 ? ok({ out, err }) : falha(new Error((err || out).trim().slice(-900) || `saiu com código ${c}`));
    });
    if (stdin != null) { p.stdin.write(stdin); p.stdin.end(); }
  });
}

/* ffprobe: dimensões já giradas (celular grava deitado e marca "gire 90°"), fps, duração, áudio, HDR */
const IMAGEM = /\.(png|jpe?g|webp|bmp)$/i;
const VIDEO = /\.(mp4|mov|m4v|mkv|webm|avi|mts|mxf)$/i;
const AUDIO = /\.(wav|mp3|m4a|aac|flac|ogg)$/i;
async function info(arq) {
  const { out } = await rodar('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', arq]);
  const o = JSON.parse(out);
  const v = o.streams.find(s => s.codec_type === 'video' && s.disposition?.attached_pic !== 1);
  const a = o.streams.find(s => s.codec_type === 'audio');
  const [n, d] = String(v?.avg_frame_rate && v.avg_frame_rate !== '0/0' ? v.avg_frame_rate : v?.r_frame_rate || '30/1').split('/').map(Number);
  const rot = Math.abs(Math.round(Number(v?.side_data_list?.find(s => s.rotation != null)?.rotation || v?.tags?.rotate || 0))) % 180 === 90;
  const trc = String(v?.color_transfer || ''), prim = String(v?.color_primaries || '');
  const imagem = IMAGEM.test(arq);
  return {
    tipo: imagem ? 'imagem' : v ? 'video' : 'audio',
    w: v ? (rot ? v.height : v.width) : 0, h: v ? (rot ? v.width : v.height) : 0,
    fps: d ? Math.round(n / d * 1000) / 1000 : 30,
    dur: imagem ? 5 : +(o.format.duration || 0),
    audio: !!a, codec: v?.codec_name || '', pix: v?.pix_fmt || '',
    pq: trc === 'smpte2084', hdr: /arib-std-b67|smpte2084/.test(trc) || /bt2020/.test(prim),
  };
}

/* Vídeo HDR de iPhone gravado como vídeo comum sai com as cores estouradas.
   HLG: basta trocar a paleta bt2020 → bt709. PQ (HDR10) precisa de tone mapping. */
const corNormal = i => !i.hdr ? ''
  : i.pq ? 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv'
  : 'zscale=tin=bt709:t=bt709:pin=2020:p=709:min=2020_ncl:m=709:rin=tv:r=tv';

/* caminho dentro de um filtro do ffmpeg: barras normais e ":" escapado */
const paraFiltro = p => p.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
const limparNome = s => String(s || '').normalize('NFC').replace(/[\\/:*?"<>|'`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
const tempo = s => { s = Math.max(0, +s || 0); return `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, '0')}`; };

/* ffmpeg com a placa de vídeo; se a NVENC não der, cai para o processador e lembra disso.
   args(enc) devolve a lista de argumentos para o encoder dado. */
let ENCODER = null;
const vcodec = (enc, qualidade = 'alta') => enc === 'h264_nvenc'
  ? ['-c:v', 'h264_nvenc', '-preset', qualidade === 'proxy' ? 'p3' : 'p5', '-cq', qualidade === 'proxy' ? '27' : '19', '-rc', 'vbr']
  : ['-c:v', 'libx264', '-preset', qualidade === 'proxy' ? 'ultrafast' : 'medium', '-crf', qualidade === 'proxy' ? '26' : '18'];
async function codificar(args, dur, aoPct, controle, cwd) {
  if (!ENCODER) ENCODER = cfg().encoder || 'h264_nvenc';
  const prog = l => { const m = l.match(/^out_time_(?:us|ms)=(\d+)/); if (m && dur > 0 && aoPct) aoPct(Math.min(1, +m[1] / 1e6 / dur)); };
  const vai = enc => rodar('ffmpeg', ['-y', '-v', 'error', '-progress', 'pipe:1', '-nostats', ...args(enc)], { aoLinha: prog, controle, cwd });
  try { return await vai(ENCODER); }
  catch (e) {
    if (ENCODER === 'libx264' || controle?.cancelado || !/nvenc|encoder|device|driver|cuda|Cannot load|No capable/i.test(e.message)) throw e;
    ENCODER = 'libx264';
    return vai(ENCODER);
  }
}

module.exports = { RAIZ, cfg, gravarCfg, ler, gravar, rodar, info, corNormal, paraFiltro, limparNome, tempo, IMAGEM, VIDEO, AUDIO, vcodec, codificar };
