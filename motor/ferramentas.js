/* Ferramentas pesadas: transcrever, baixar, silêncio, folha de contato. */
const fs = require('fs');
const path = require('path');
const U = require('./util');
const T = require('./tarefas');
const P = require('./projeto');

/* ── transcrição ─────────────────────────────────────────────────────────── */
/* O áudio passa por dynaudnorm só para o Whisper ouvir trecho baixo (ligação, fala longe
   do microfone). O vídeo nunca é tocado: isso vale só para a transcrição. */
async function transcrever(nome, id, { contexto = '', aoLog = () => {} } = {}) {
  const p = P.carregar(nome);
  const m = p.midias[id];
  if (!m) throw new Error(`mídia ${id} não existe no projeto`);
  if (!m.audio) throw new Error(`${id} (${m.nome}) não tem áudio`);
  const py = U.cfg().python;
  if (!fs.existsSync(py)) throw new Error('não achei o Python com faster-whisper em ' + py + ' (ajuste em Configurações)');
  const d = P.dir(nome);
  const wav = path.join(d, 'cache', id + '.forte.wav');
  const saida = path.join(d, 'transcricoes', id + '.json');
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  return T.rodar(`Transcrevendo ${m.nome}`, nome, async t => {
    T.progresso(t, 'preparando o áudio', 2);
    await U.rodar('ffmpeg', ['-y', '-v', 'error', '-i', m.arquivo, '-map', '0:a:0', '-af',
      'highpass=f=70,dynaudnorm=f=150:g=15:p=0.92:m=25:s=5,alimiter=limit=0.95', '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wav], { controle: t.controle });
    T.progresso(t, 'carregando o Whisper (a primeira vez demora)', 5);
    await U.rodar(py, [path.join(U.RAIZ, 'python', 'transcrever.py'), wav, saida, contexto], {
      controle: t.controle,
      aoLinha: l => {
        const mm = l.match(/^@@PROG (\d+)/);
        if (mm) return T.progresso(t, 'transcrevendo', 5 + +mm[1] * 0.95);
        T.log(t, l); aoLog(l);
      },
    });
    try { fs.unlinkSync(wav); } catch {}
    return U.ler(saida, []);
  });
}

/* frases com tempo: é assim que o Claude lê a transcrição */
function frases(palavras) {
  const out = []; let g = [];
  for (const w of palavras) {
    const u = g.at(-1);
    if (u && (/[.?!…]$/.test(u.t) || w.i - u.f > 0.6)) { out.push(g); g = []; }
    g.push(w);
  }
  if (g.length) out.push(g);
  return out.map(g => ({ i: g[0].i, f: g.at(-1).f, texto: g.map(w => w.t).join(' ') }));
}
const textoFrases = palavras => frases(palavras).map(f => `[${f.i.toFixed(2)}–${f.f.toFixed(2)}] ${f.texto}`).join('\n');

/* ── substituir mídia: compara a transcrição antiga com a do arquivo novo ──
   Alinha palavra por palavra (com tolerância a palavras novas, tiradas ou trocadas):
   - palavra igual: fica o texto ANTIGO (com as suas correções de maiúscula, pontuação…) e o tempo NOVO
   - palavra trocada: se a antiga foi corrigida à mão (editada) ou escondida, a correção vence; senão fica a nova
   - palavra nova: entra; palavra que sumiu: sai
   Devolve também quanto a fala andou no tempo (mediana do deslocamento das palavras iguais). */
const normal = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w$%]/g, '');
function alinharTranscricao(antiga, nova) {
  const A = antiga || [], B = nova || [];
  const out = [], deltas = [];
  const rel = { iguais: 0, trocadas: 0, novas: 0, removidas: 0, correcoesMantidas: 0, ocultasMantidas: 0 };
  const manual = w => w.editada || w.oculta;
  const parear = (a, b) => {   // mesma palavra, ou troca 1 por 1
    if (normal(a.t) === normal(b.t)) {
      rel.iguais++; deltas.push(b.i - a.i);
      if (a.oculta) rel.ocultasMantidas++;
      if (a.t !== b.t && a.editada) rel.correcoesMantidas++;
      out.push({ ...b, t: a.t, ...(a.editada ? { editada: true, p: 1 } : {}), ...(a.oculta ? { oculta: true } : {}) });
    } else if (manual(a)) {
      rel.trocadas++; rel.correcoesMantidas += a.editada ? 1 : 0; rel.ocultasMantidas += a.oculta ? 1 : 0;
      out.push({ ...b, t: a.t, ...(a.editada ? { editada: true, p: 1 } : {}), ...(a.oculta ? { oculta: true } : {}) });
    } else { rel.trocadas++; out.push({ ...b }); }
  };
  const JANELA = 12;
  let i = 0, j = 0;
  while (i < A.length && j < B.length) {
    if (normal(A[i].t) === normal(B[j].t)) { parear(A[i++], B[j++]); continue; }
    // procura a próxima âncora: menor salto somando os dois lados
    let melhor = null;
    for (let di = 0; di <= JANELA && i + di < A.length; di++) {
      for (let dj = 0; dj <= JANELA && j + dj < B.length; dj++) {
        if ((di || dj) && normal(A[i + di].t) === normal(B[j + dj].t) && normal(A[i + di].t)
          && (!melhor || di + dj < melhor.di + melhor.dj)) melhor = { di, dj };
      }
    }
    if (!melhor) { parear(A[i++], B[j++]); continue; }
    // trecho entre as âncoras: pareia 1 a 1 o que der, o resto é novo ou removido
    const k = Math.min(melhor.di, melhor.dj);
    for (let q = 0; q < k; q++) parear(A[i + q], B[j + q]);
    for (let q = k; q < melhor.dj; q++) { rel.novas++; out.push({ ...B[j + q] }); }
    rel.removidas += melhor.di - k;
    i += melhor.di; j += melhor.dj;
  }
  while (j < B.length) { rel.novas++; out.push({ ...B[j++] }); }
  rel.removidas += A.length - i;
  deltas.sort((a, b) => a - b);
  rel.deslocamento = deltas.length ? +deltas[Math.floor(deltas.length / 2)].toFixed(3) : 0;
  // deslocamento "confiável": a maioria das palavras andou o mesmo tanto
  const perto = deltas.filter(d => Math.abs(d - rel.deslocamento) < 0.12).length;
  rel.deslocamentoUniforme = deltas.length > 5 && perto / deltas.length > 0.7;
  rel.total = out.length;
  return { lista: out, relatorio: rel };
}

/* ── silêncio ────────────────────────────────────────────────────────────── */
async function silencios(arquivo, limiar = -30, minimo = 0.35) {
  const { err } = await U.rodar('ffmpeg', ['-hide_banner', '-nostats', '-i', arquivo, '-vn', '-af',
    `silencedetect=noise=${limiar}dB:d=${minimo}`, '-f', 'null', '-']);
  const r = []; let s = null;
  for (const l of err.split(/\r?\n/)) {
    let m = l.match(/silence_start: (-?[\d.]+)/); if (m) s = Math.max(0, +m[1]);
    m = l.match(/silence_end: ([\d.]+)/); if (m && s != null) { r.push([+s.toFixed(3), +(+m[1]).toFixed(3)]); s = null; }
  }
  if (s != null) r.push([+s.toFixed(3), null]);
  return r;
}

/* ── download (YouTube, Instagram, TikTok, Google Drive… tudo que o yt-dlp abre) ── */
async function baixar(url, pasta, nomeProjeto, { soAudio = false } = {}) {
  fs.mkdirSync(pasta, { recursive: true });
  return T.rodar(`Baixando ${soAudio ? 'o áudio de ' : ''}` + url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40), nomeProjeto, async t => {
    let final = null;
    // só áudio: melhor faixa de áudio convertida para .m4a (toca no preview e entra na faixa de áudio)
    // vídeo: até 1080 no lado menor (Reels não ganha nada com 4K e o arquivo fica 4× maior)
    const formato = soAudio ? ['-f', 'ba/b', '-x', '--audio-format', 'm4a'] : ['-f', 'bv*+ba/b', '-S', 'res:1080', '--merge-output-format', 'mp4'];
    const cookies = U.cfg().cookies;
    const base = ['--newline', '--no-playlist', '--encoding', 'utf-8', ...formato,
      ...(cookies && fs.existsSync(cookies) ? ['--cookies', cookies] : []),
      '-o', path.join(pasta, '%(title).70B [%(id)s]' + (soAudio ? ' (audio)' : '') + '.%(ext)s'), '--print', 'after_move:filepath'];
    /* O YouTube às vezes marca a conexão ("muitas requisições", "confirme que não é um robô").
       Outros clientes do YouTube (celular, player embutido) costumam passar: tenta um depois do outro. */
    const youtube = /youtu\.?be/i.test(url);
    const tentativas = youtube ? [[], ['--extractor-args', 'youtube:player_client=mweb,web_embedded'], ['--extractor-args', 'youtube:player_client=tv_simply,web_safari']] : [[]];
    let ultimoErro = null;
    for (const [n, extra] of tentativas.entries()) {
      if (n) { T.progresso(t, `o YouTube bloqueou; tentando outro caminho (${n + 1} de ${tentativas.length})`, null); T.log(t, '— nova tentativa: ' + extra.join(' ')); }
      try {
        await U.rodar('yt-dlp', [...base, ...extra, url], {
          controle: t.controle,
          aoLinha: l => {
            const m = l.match(/\[download\]\s+([\d.]+)%/);
            if (m) return T.progresso(t, 'baixando', +m[1]);
            if (/^[A-Z]:\\/i.test(l.trim()) && fs.existsSync(l.trim())) final = l.trim();
            T.log(t, l);
          },
          aoErro: l => T.log(t, l),
        });
        if (final) return final;
        ultimoErro = new Error('o download terminou mas não achei o arquivo');
      } catch (e) {
        if (t.controle.cancelado) throw e;
        ultimoErro = e;
        if (!/429|not a bot|Sign in|PO Token|reloaded|403|Forbidden|Requested format/i.test(e.message)) break;   // erro que outro cliente não resolve
      }
    }
    throw new Error(explicarErro(ultimoErro?.message || '', url));
  });
}
/* troca a parede de avisos do yt-dlp por uma frase que diz o que fazer */
function explicarErro(msg, url) {
  if (/429|not a bot|Sign in to confirm|PO Token/i.test(msg))
    return 'O YouTube bloqueou downloads desta conexão por um tempo (excesso de tentativas). Espere uns minutos e tente de novo — ou baixe pelo navegador e arraste o arquivo para o programa.';
  if (/instagram/i.test(url) && /login|rate|private|empty media/i.test(msg))
    return 'O Instagram pediu login para este vídeo. Baixe pelo snapinsta e arraste o arquivo para o programa.';
  if (/Private video|private/i.test(msg)) return 'O vídeo é privado: não dá para baixar sem acesso.';
  if (/Unsupported URL/i.test(msg)) return 'Esse link não é de um vídeo que o programa saiba baixar.';
  if (/drive\.google/i.test(url)) return 'O Google Drive não liberou o arquivo. Deixe o compartilhamento como "qualquer pessoa com o link".';
  const linha = msg.split(/\r?\n/).reverse().find(l => /ERROR/.test(l)) || msg.split(/\r?\n/).pop();
  return 'Não consegui baixar: ' + linha.replace(/^.*ERROR:\s*(\[\w+\]\s*\S+:\s*)?/, '').slice(0, 220);
}

/* ── folha de contato: n quadros com o tempo escrito, para o Claude enxergar um vídeo ── */
async function folha(arquivo, destino, { n = 12, ini = 0, fim = null } = {}) {
  const i = await U.info(arquivo);
  const f = fim == null ? i.dur : Math.min(fim, i.dur);
  const passo = Math.max(0.04, (f - ini) / n);
  const fonte = U.paraFiltro(path.join(U.RAIZ, 'fontes', 'Montserrat-Bold.ttf'));
  const col = Math.min(n, 6), lin = Math.ceil(n / col);
  const larg = i.w >= i.h ? 320 : 200;
  await U.rodar('ffmpeg', ['-y', '-v', 'error', '-ss', String(ini), '-t', String(f - ini), '-i', arquivo, '-vf',
    `fps=1/${passo.toFixed(4)},scale=${larg}:-2,drawtext=fontfile='${fonte}':text='%{pts\\:hms\\:${(+ini).toFixed(3)}}':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=4,tile=${col}x${lin}:padding=4:color=0x08090D`,
    '-frames:v', '1', destino]);
  return { destino, passo };
}

module.exports = { transcrever, frases, textoFrases, silencios, baixar, folha, alinharTranscricao };
