/* Preparar: confere e instala o que o programa precisa para funcionar num computador novo.
   Tudo vai para %LOCALAPPDATA%\BlueOceanStudio\ferramentas (sem pedir administrador):
     bin\        ffmpeg, ffprobe, yt-dlp, deno (o yt-dlp usa o deno para abrir o YouTube), uv
     python\     o Python que o uv baixa
     whisper\    o ambiente da transcrição (faster-whisper, e as bibliotecas da CUDA se houver placa NVIDIA)
   O Claude Code vai pelo instalador oficial (%USERPROFILE%\.local\bin) e o Git, para usuário (%LOCALAPPDATA%\Programs\Git).
   Cada passo avisa o andamento por aoEvento({ id, estado, pct, msg }). */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execFile } = require('child_process');
const execAsync = (exe, args, opt = {}) => new Promise(ok => execFile(exe, args, { windowsHide: true, timeout: 30000, ...opt }, (e, out) => ok({ falhou: !!e, out: String(out || '') })));
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const U = require('./util');
const C = require('./claude');

const BIN = path.join(U.FERRAMENTAS, 'bin');
const HOME = os.homedir();
const LAPP = process.env.LOCALAPPDATA || path.join(HOME, 'AppData', 'Local');
const GIT_PASTAS = [path.join(LAPP, 'Programs', 'Git'), 'C:\\Program Files\\Git'];
const HF = path.join(process.env.HF_HOME || path.join(HOME, '.cache', 'huggingface'), 'hub');

/* pastas que entram no PATH do programa (e de tudo que ele abre: Claude, bo, ffmpeg) */
function caminhos() {
  const l = [BIN, path.join(HOME, '.local', 'bin')];
  for (const g of GIT_PASTAS) if (fs.existsSync(path.join(g, 'cmd', 'git.exe'))) l.push(path.join(g, 'cmd'));
  return l;
}
function ajustarAmbiente() {
  const atual = (process.env.PATH || '').split(path.delimiter);
  process.env.PATH = [...caminhos().filter(c => !atual.includes(c)), ...atual].join(path.delimiter);
  // o Claude Code no Windows usa o bash do Git; instalado agora, ainda não está no PATH do sistema
  if (!process.env.CLAUDE_CODE_GIT_BASH_PATH) {
    const b = GIT_PASTAS.map(g => path.join(g, 'bin', 'bash.exe')).find(f => fs.existsSync(f));
    if (b) process.env.CLAUDE_CODE_GIT_BASH_PATH = b;
  }
}

const onde = exe => {
  const r = spawnSync('where', [exe], { encoding: 'utf8', windowsHide: true });
  return r.status === 0 ? r.stdout.trim().split(/\r?\n/)[0] : null;
};
const temNvidia = () => spawnSync('nvidia-smi', ['-L'], { windowsHide: true }).status === 0;
const tamanhoPasta = p => {
  let t = 0;
  try { for (const e of fs.readdirSync(p, { withFileTypes: true })) { const q = path.join(p, e.name); t += e.isDirectory() ? tamanhoPasta(q) : fs.statSync(q).size; } } catch {}
  return t;
};
const MB = b => `${Math.round(b / 1048576)} MB`;
const modeloWhisper = () => temNvidia()
  ? { nome: 'large-v3-turbo', pasta: 'models--mobiuslabsgmbh--faster-whisper-large-v3-turbo', tam: '1,6 GB' }
  : { nome: 'small', pasta: 'models--Systran--faster-whisper-small', tam: '480 MB' };
const modeloBaixado = m => { try { return fs.readdirSync(path.join(HF, m.pasta, 'snapshots')).some(s => fs.existsSync(path.join(HF, m.pasta, 'snapshots', s, 'model.bin'))); } catch { return false; } };

/* ── o que conferir ── */
const ITENS = [
  { id: 'ffmpeg', nome: 'FFmpeg', desc: 'corta, junta, legenda e exporta os vídeos', tam: '~100 MB' },
  { id: 'ytdlp', nome: 'yt-dlp + Deno', desc: 'baixa vídeos do YouTube, Instagram, TikTok e Drive', tam: '~70 MB' },
  { id: 'git', nome: 'Git', desc: 'terminal que o Claude Code usa no Windows', tam: '~70 MB' },
  { id: 'claude', nome: 'Claude Code', desc: 'o agente editor do chat', tam: '~100 MB' },
  { id: 'whisper', nome: 'Transcrição (Whisper)', desc: 'legendas com tempo por palavra', tam: '' },
  { id: 'login', nome: 'Conta do Claude', desc: 'entrar uma vez com a sua conta', tam: '' },
];

async function verificar() {
  ajustarAmbiente();
  const r = {};
  r.ffmpeg = onde('ffmpeg') && onde('ffprobe') ? { ok: true, det: onde('ffmpeg') } : { ok: false };
  r.ytdlp = onde('yt-dlp') && onde('deno') ? { ok: true, det: onde('yt-dlp') } : { ok: false };
  r.git = onde('git') || process.env.CLAUDE_CODE_GIT_BASH_PATH ? { ok: true } : { ok: false };
  let claude = null; try { claude = C.acharClaude(); } catch {}
  r.claude = claude ? { ok: true, det: claude } : { ok: false };
  const py = U.cfg().python, m = modeloWhisper();
  const pyOk = fs.existsSync(py) && !(await execAsync(py, ['-c', 'import faster_whisper'])).falhou;
  r.whisper = pyOk && modeloBaixado(m) ? { ok: true, det: `modelo ${m.nome}` } : { ok: false, det: temNvidia() ? `com placa NVIDIA · ~3 GB` : `sem placa NVIDIA, modelo menor · ~700 MB` };
  r.login = { ok: false };
  if (claude) {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const s = await execAsync(claude, ['auth', 'status'], { env });
    try { const j = JSON.parse(s.out); r.login = j.loggedIn ? { ok: true, det: j.email || '' } : { ok: false }; }
    catch { r.login = { ok: true, det: '' }; }   // versão sem "auth status": não dá para conferir, segue
  }
  return ITENS.map(i => ({ ...i, ...r[i.id] }));
}

/* ── download com andamento ── */
async function baixar(url, destino, aviso) {
  const res = await fetch(url, { headers: { 'User-Agent': 'BlueOceanStudio' } });
  if (!res.ok) throw new Error(`download falhou (${res.status}): ${url}`);
  const total = +res.headers.get('content-length') || 0;
  let feito = 0, ultimo = 0;
  const corpo = Readable.fromWeb(res.body);
  corpo.on('data', d => {
    feito += d.length;
    if (Date.now() - ultimo > 250) { ultimo = Date.now(); aviso(total ? feito / total : null, `baixando ${MB(feito)}${total ? ' de ' + MB(total) : ''}`); }
  });
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  await pipeline(corpo, fs.createWriteStream(destino));
  return destino;
}
const tmp = nome => path.join(U.FERRAMENTAS, 'baixando', nome);
async function extrair(zip, pasta) {
  fs.rmSync(pasta, { recursive: true, force: true }); fs.mkdirSync(pasta, { recursive: true });
  // o tar do Windows (System32) abre .zip; o do Git, se vier antes no PATH, não entende "C:"
  await U.rodar(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe'), ['-xf', zip, '-C', pasta]);
}
const acharArquivo = (pasta, nome) => {
  for (const e of fs.readdirSync(pasta, { withFileTypes: true })) {
    const q = path.join(pasta, e.name);
    if (e.isDirectory()) { const a = acharArquivo(q, nome); if (a) return a; }
    else if (e.name.toLowerCase() === nome) return q;
  }
  return null;
};
async function ultimaVersaoGithub(repo, padrao) {
  const r = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: { 'User-Agent': 'BlueOceanStudio' } });
  if (!r.ok) throw new Error('não consegui consultar o GitHub (' + r.status + ')');
  const a = (await r.json()).assets.find(x => padrao.test(x.name));
  if (!a) throw new Error('arquivo de instalação não encontrado em ' + repo);
  return a.browser_download_url;
}

/* ── instaladores ── */
const INSTALAR = {
  async ffmpeg(av) {
    const z = await baixar('https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip', tmp('ffmpeg.zip'), av);
    av(null, 'extraindo');
    const p = tmp('ffmpeg'); await extrair(z, p);
    fs.mkdirSync(BIN, { recursive: true });
    for (const n of ['ffmpeg.exe', 'ffprobe.exe']) fs.copyFileSync(acharArquivo(p, n), path.join(BIN, n));
  },
  async ytdlp(av) {
    await baixar('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe', path.join(BIN, 'yt-dlp.exe'), (f, m) => av(f == null ? null : f * 0.3, 'yt-dlp: ' + m));
    const z = await baixar('https://github.com/denoland/deno/releases/latest/download/deno-x86_64-pc-windows-msvc.zip', tmp('deno.zip'), (f, m) => av(f == null ? null : 0.3 + f * 0.7, 'deno: ' + m));
    const p = tmp('deno'); await extrair(z, p);
    fs.copyFileSync(acharArquivo(p, 'deno.exe'), path.join(BIN, 'deno.exe'));
  },
  async git(av) {
    const url = await ultimaVersaoGithub('git-for-windows/git', /^Git-[\d.]+-64-bit\.exe$/);
    const exe = await baixar(url, tmp('git-instalar.exe'), av);
    av(null, 'instalando (leva 1 ou 2 minutos)');
    await U.rodar(exe, ['/VERYSILENT', '/NORESTART', '/NOCANCEL', '/SP-', '/SUPPRESSMSGBOXES', '/CURRENTUSER']);
  },
  async claude(av) {
    av(null, 'baixando e instalando pelo instalador oficial');
    await U.rodar('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', 'irm https://claude.ai/install.ps1 | iex']);
  },
  async whisper(av) {
    const nv = temNvidia(), m = modeloWhisper();
    const env = { UV_PYTHON_INSTALL_DIR: path.join(U.FERRAMENTAS, 'python'), UV_CACHE_DIR: tmp('uv-cache'), UV_LINK_MODE: 'copy' };
    const uv = path.join(BIN, 'uv.exe');
    if (!fs.existsSync(uv)) {
      const z = await baixar('https://github.com/astral-sh/uv/releases/latest/download/uv-x86_64-pc-windows-msvc.zip', tmp('uv.zip'), (f, t) => av(f == null ? null : f * 0.05, 'uv: ' + t));
      const p = tmp('uv'); await extrair(z, p);
      fs.mkdirSync(BIN, { recursive: true });
      fs.copyFileSync(acharArquivo(p, 'uv.exe'), uv);
    }
    const venv = path.join(U.FERRAMENTAS, 'whisper');
    if (!fs.existsSync(U.PY_FERRAMENTAS)) {
      av(0.06, 'criando o Python da transcrição');
      await U.rodar(uv, ['venv', '--python', '3.12', venv], { env });
    }
    // as versões ficam presas às que funcionam juntas (python/whisper-versoes.txt): o av 19 quebrou o faster-whisper 1.2.1
    const pacotes = ['faster-whisper', 'onnxruntime', ...(nv ? ['nvidia-cublas-cu12', 'nvidia-cudnn-cu12'] : [])];
    const vigia = setInterval(() => av(0.1, `instalando ${nv ? 'faster-whisper e a CUDA' : 'faster-whisper'} · ${MB(tamanhoPasta(venv) + tamanhoPasta(tmp('uv-cache')))}`), 1000);
    // -c relativo, rodando dentro de python/: o uv corta no espaço um caminho absoluto como "BLUEOCEAN STUDIO"
    try { await U.rodar(uv, ['pip', 'install', '--python', U.PY_FERRAMENTAS, '-c', 'whisper-versoes.txt', ...pacotes], { env, cwd: path.join(U.RAIZ, 'python') }); }
    finally { clearInterval(vigia); }
    U.gravarCfg({ python: U.PY_FERRAMENTAS });
    if (!modeloBaixado(m)) {
      const vigiaM = setInterval(() => av(0.5, `baixando o modelo ${m.nome} (${m.tam}) · ${MB(tamanhoPasta(path.join(HF, m.pasta)))}`), 1000);
      try { await U.rodar(U.PY_FERRAMENTAS, ['-c', `from faster_whisper import download_model; download_model(${JSON.stringify(m.nome)})`]); }
      finally { clearInterval(vigiaM); }
    }
    fs.rmSync(tmp('uv-cache'), { recursive: true, force: true });
  },
};

/* instala os itens pedidos, um por vez; um erro não impede os outros */
async function instalar(ids, aoEvento) {
  const erros = [];
  for (const id of ids) {
    if (!INSTALAR[id]) continue;
    const av = (pct, msg) => aoEvento({ id, estado: 'instalando', pct, msg });
    av(0, 'começando');
    try {
      await INSTALAR[id](av);
      ajustarAmbiente();
      aoEvento({ id, estado: 'ok', msg: 'instalado' });
    } catch (e) {
      erros.push(id);
      aoEvento({ id, estado: 'erro', msg: String(e.message || e).split('\n').filter(Boolean).slice(-2).join(' ').slice(0, 220) });
    }
  }
  fs.rmSync(path.join(U.FERRAMENTAS, 'baixando'), { recursive: true, force: true });
  return { erros };
}

/* abre o login do Claude numa janela de terminal (a pessoa confirma no navegador) */
function entrar() {
  const exe = C.acharClaude();
  require('child_process').spawn('cmd.exe', ['/c', 'start', 'Entrar no Claude', 'cmd', '/k', exe, 'auth', 'login'], { detached: true, stdio: 'ignore' }).unref();
}

module.exports = { ITENS, verificar, instalar, entrar, ajustarAmbiente };
