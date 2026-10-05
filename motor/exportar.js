/* Exportação: linha do tempo → grafo do ffmpeg.
   Camadas, de baixo para cima: fundo preto → faixas de vídeo (na ordem) → textos e legenda (libass)
   → efeitos (light leak em modo Tela). O áudio de cada item entra no tempo dele e passa pelo acabamento.
   Uma "janela" [ini, fim] permite exportar um trecho ou tirar um quadro só (o Claude usa para conferir). */
const fs = require('fs');
const path = require('path');
const U = require('./util');
const M = require('./modelo');

const par = v => Math.max(2, Math.round(v / 2) * 2);
const f3 = v => (+v).toFixed(3);

function montar(p, { ini = 0, fim = null, ass = {}, imagens = [], fontesDir = null, quadro = false } = {}) {
  M.normalizar(p);
  const { w: W, h: H, fps } = p.formato;
  const total = M.duracao(p);
  if (fim == null) fim = total;
  const dur = Math.max(1 / fps, fim - ini);
  const entradas = [], g = [], audios = [];
  let base = 'b0', nb = 0;
  g.push(`color=c=black:s=${W}x${H}:r=${fps}:d=${f3(dur + 0.05)},format=yuv420p[b0]`);

  const addEntrada = args => { entradas.push(...args); return entradas.filter(a => a === '-i').length - 1; };

  /* ── vídeo e imagem ── */
  const faixasV = p.faixas.filter(f => f.tipo === 'video' || f.tipo === 'audio');
  // recorte/escala de um item dentro da caixa dele (null se não sobra nada visível)
  const geo = (it, m) => {
    const G = M.geometria(it, m);
    const SW = par(G.sw), SH = par(G.sh);
    const x0 = Math.max(0, -G.ox), y0 = Math.max(0, -G.oy);
    const x1 = Math.min(SW, G.c.w - G.ox), y1 = Math.min(SH, G.c.h - G.oy);
    const cw = Math.floor((x1 - x0) / 2) * 2, ch = Math.floor((y1 - y0) / 2) * 2;
    if (cw < 2 || ch < 2) return null;
    return { SW, SH, cw, ch, x0: Math.round(x0), y0: Math.round(y0), px: Math.round(G.c.x + G.ox + x0), py: Math.round(G.c.y + G.oy + y0) };
  };
  for (const f of faixasV) {
    /* A mesma imagem várias vezes na faixa (ex.: quadros de uma animação alternando): vira UMA entrada,
       que aparece em todos os intervalos dela. Com centenas de itens, uma entrada por item estourava
       o limite de linha de comando do Windows (spawn ENAMETOOLONG) e abria centenas de arquivos. */
    const grupos = new Map();
    for (const it of f.itens) {
      const m = p.midias[it.midia];
      if (f.tipo !== 'video' || !m || m.tipo !== 'imagem' || it.entra > 0 || it.sai > 0) continue;
      const chave = it.midia + '|' + JSON.stringify([it.caixa, it.zoom, it.foco]);
      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave).push(it);
    }
    const agrupado = new Map();
    for (const lista of grupos.values()) if (lista.length > 1) for (const it of lista) agrupado.set(it.id, lista);
    const feitos = new Set();
    for (const it of f.itens) {
      const m = p.midias[it.midia];
      if (!m || !fs.existsSync(m.arquivo)) continue;
      const grupo = agrupado.get(it.id);
      if (grupo) {
        if (feitos.has(grupo)) continue;
        feitos.add(grupo);
        const janelas = grupo.map(x => [Math.max(x.inicio, ini), Math.min(M.fimItem(f, x), fim)]).filter(([a, b]) => b - a >= 1 / fps / 2);
        const q = geo(it, m);
        if (!janelas.length || !q) continue;
        const k = addEntrada(['-loop', '1', '-framerate', String(fps), '-t', f3(dur + 0.1), '-i', m.arquivo]);
        g.push(`[${k}:v]setsar=1,scale=${q.SW}:${q.SH}:flags=bicubic,crop=${q.cw}:${q.ch}:${q.x0}:${q.y0},format=yuva420p,trim=0:${f3(dur)},setpts=PTS-STARTPTS[v${k}]`);
        const nova = 'b' + (++nb);
        g.push(`[${base}][v${k}]overlay=x=${q.px}:y=${q.py}:eof_action=pass:enable='${janelas.map(([a, b]) => `between(t,${f3(a - ini)},${f3(b - ini)})`).join('+')}'[${nova}]`);
        base = nova;
        continue;
      }
      const fimIt = M.fimItem(f, it);
      const a = Math.max(it.inicio, ini), b = Math.min(fimIt, fim);
      if (b - a < 1 / fps / 2) continue;
      const len = b - a, src = it.entrada + (a - it.inicio), off = a - ini;
      const temVideo = f.tipo === 'video' && m.tipo !== 'audio';
      const temAudio = !quadro && m.audio && it.volume > 0 && m.tipo !== 'imagem';
      if (!temVideo && !temAudio) continue;
      const k = m.tipo === 'imagem'
        ? addEntrada(['-loop', '1', '-framerate', String(fps), '-t', f3(len + 0.1), '-i', m.arquivo])
        // WebM VP9 com transparência (peças de motion): o decodificador nativo ignora o canal alfa, o libvpx lê
        : addEntrada([...(m.codec === 'vp9' ? ['-c:v', 'libvpx-vp9'] : []), '-ss', f3(src), '-t', f3(len + 0.1), '-i', m.arquivo]);

      if (temVideo) {
        const G = M.geometria(it, m);
        const SW = par(G.sw), SH = par(G.sh);
        const x0 = Math.max(0, -G.ox), y0 = Math.max(0, -G.oy);
        const x1 = Math.min(SW, G.c.w - G.ox), y1 = Math.min(SH, G.c.h - G.oy);
        const cw = Math.floor((x1 - x0) / 2) * 2, ch = Math.floor((y1 - y0) / 2) * 2;
        // zoom animado (zooms com z >= 1: o vídeo sempre cobre a caixa): escala por quadro e recorte no foco
        const animado = it.zooms && it.zooms.every(k => k.z >= 1);
        if (animado || (cw >= 2 && ch >= 2)) {
          let px = Math.round(G.c.x + G.ox + x0), py = Math.round(G.c.y + G.oy + y0);
          let escala = [`scale=${SW}:${SH}:flags=bicubic`, `crop=${cw}:${ch}:${Math.round(x0)}:${Math.round(y0)}`];
          if (animado) {
            const T = `(t+${f3(a - it.inicio)})`, ks = it.zooms;
            let z = f3(ks.at(-1).z);
            for (let i = ks.length - 1; i >= 1; i--) {
              const k0 = ks[i - 1], k1 = ks[i], u = `((${T}-${f3(k0.t)})/${f3(Math.max(1e-3, k1.t - k0.t))})`;
              z = `if(lt(${T},${f3(k1.t)}),${f3(k0.z)}+${f3(k1.z - k0.z)}*${u}*${u}*(3-2*${u}),${z})`;
            }
            z = `if(lt(${T},${f3(ks[0].t)}),${f3(ks[0].z)},${z})`;
            const mw = m.w || 1080, mh = m.h || 1920, b = Math.max(G.c.w / mw, G.c.h / mh);
            const CW = par(G.c.w), CH = par(G.c.h);
            escala = [`scale=w='ceil(${mw}*${b.toFixed(6)}*${z}/2)*2':h='ceil(${mh}*${b.toFixed(6)}*${z}/2)*2':eval=frame:flags=bicubic`,
              `crop=${CW}:${CH}:x='(iw-${CW})*${it.foco.x}':y='(ih-${CH})*${it.foco.y}'`];
            px = Math.round(G.c.x); py = Math.round(G.c.y);
          }
          const fades = [];
          const d0 = a - it.inicio, restante = fimIt - a;
          // trecho que começa no meio de um fade (quadro avulso, exportação de trecho): o fade continua de onde estava
          // (o "fade" do ffmpeg sempre recomeçaria do zero) — alfa calculado pelo tempo do item
          const meioEntra = it.entra > 0 && d0 > 0 && d0 < it.entra, meioSai = it.sai > 0 && restante < it.sai;
          if (meioEntra || meioSai) {
            const fe = it.entra > 0 ? `clip((T+${f3(d0)})/${f3(it.entra)},0,1)` : '1';
            const fs = it.sai > 0 ? `clip((${f3(fimIt - it.inicio)}-(T+${f3(d0)}))/${f3(it.sai)},0,1)` : '1';
            fades.push(`geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='alpha(X,Y)*${fe}*${fs}'`);
          } else {
            if (it.entra > 0 && d0 < it.entra) fades.push(`fade=t=in:st=0:d=${f3(it.entra - d0)}:alpha=1`);
            if (it.sai > 0) { const st = Math.max(0, restante - it.sai); if (st < len) fades.push(`fade=t=out:st=${f3(st)}:d=${f3(Math.min(it.sai, restante))}:alpha=1`); }
          }
          // o primeiro quadro depois do -ss pode chegar com pts > 0 (seek fora da grade de quadros); zerar antes
          // do fps/trim garante o trecho inteiro — sem isso faltavam 1–2 quadros no fim de cada corte (piscava preto)
          const cadeia = [U.corNormal(m), 'setsar=1', 'setpts=PTS-STARTPTS', `fps=${fps}`, ...escala, 'format=yuva420p', ...fades,
            `trim=0:${f3(len)}`, `setpts=PTS-STARTPTS+${f3(off)}/TB`].filter(Boolean).join(',');
          g.push(`[${k}:v]${cadeia}[v${k}]`);
          const nova = 'b' + (++nb);
          // repeat: segura o último quadro até o fim da janela do item (o corte raramente cai na grade de quadros;
          // com "pass" sobrava 1 quadro preto entre um corte e o seguinte)
          g.push(`[${base}][v${k}]overlay=x=${px}:y=${py}:eof_action=repeat:enable='between(t,${f3(off)},${f3(off + len)})'[${nova}]`);
          base = nova;
        }
      }
      if (temAudio) {
        const fa = [];
        const d0 = a - it.inicio, restante = fimIt - a;
        const fin = Math.max(0.012, it.entra > 0 && d0 < it.entra ? it.entra - d0 : 0.012);
        fa.push(`afade=t=in:d=${f3(fin)}`);
        const fout = Math.max(0.012, it.sai > 0 ? Math.min(it.sai, restante) : 0.012);
        fa.push(`afade=t=out:st=${f3(Math.max(0, len - fout))}:d=${f3(fout)}`);
        g.push(`[${k}:a]aresample=48000,aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${f3(len)},asetpts=PTS-STARTPTS,volume=${f3(it.volume)},${fa.join(',')},adelay=${Math.round(off * 1000)}:all=1[a${k}]`);
        audios.push(`[a${k}]`);
      }
    }
  }

  /* ── textos, faixas e legenda: fundo das faixas → imagens (papel, logo) → textos ── */
  const dirFontes = U.paraFiltro(fontesDir || path.join(U.RAIZ, 'fontes'));
  const passarAss = arq => { const nova = 'b' + (++nb); g.push(`[${base}]ass=filename='${U.paraFiltro(arq)}':fontsdir='${dirFontes}'[${nova}]`); base = nova; };
  if (ass.fundo) passarAss(ass.fundo);
  for (const im of imagens) {
    const a = Math.max(0, im.ini), b = Math.min(dur, im.fim);
    if (b - a < 1 / fps / 2) continue;
    const arq = path.isAbsolute(im.arquivo) ? im.arquivo : path.join(U.RAIZ, im.arquivo);
    const k = addEntrada(['-loop', '1', '-framerate', String(fps), '-t', f3(b - a + 0.1), '-i', arq]);
    const w = par(im.w), h = par(im.h);
    g.push(`[${k}:v]scale=${w}:${h}:flags=lanczos,format=yuva420p,trim=0:${f3(b - a)},setpts=PTS-STARTPTS+${f3(a)}/TB[i${k}]`);
    // deslize linear da esquerda (mesma conta do preview)
    const d = im.desliza;
    const x = d ? `'${Math.round(im.x)}+if(lt(t,${f3(d.t0)}),${d.dx},if(lt(t,${f3(d.t0 + d.dur)}),${d.dx}*(1-(t-${f3(d.t0)})/${f3(d.dur)}),0))'` : Math.round(im.x);
    const nova = 'b' + (++nb);
    g.push(`[${base}][i${k}]overlay=x=${x}:y=${Math.round(im.y)}:eof_action=pass:enable='between(t,${f3(a)},${f3(b)})'[${nova}]`);
    base = nova;
  }
  if (ass.frente) passarAss(ass.frente);

  /* ── efeitos (Tela: clareia, nunca escurece) ── */
  for (const f of p.faixas.filter(f => f.tipo === 'efeito')) {
    for (const it of f.itens) {
      const e = M.EFEITOS[it.efeito];
      const arq = path.join(U.RAIZ, e.arquivo);
      const a = Math.max(it.inicio, ini), b = Math.min(it.inicio + it.dur, fim);
      if (b - a < 1 / fps / 2) continue;
      // o arquivo tem a duração dele; dur diferente acelera ou desacelera
      const vel = e.dur / it.dur;
      const k = addEntrada(['-i', arq]);
      const I = Math.max(0, it.intensidade);
      g.push(`[${k}:v]setpts=(PTS-STARTPTS)/${f3(vel)},fps=${fps},trim=start=${f3(a - it.inicio)},setpts=PTS-STARTPTS,scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,format=gbrp,colorchannelmixer=rr=${f3(I)}:gg=${f3(I)}:bb=${f3(I)},tpad=start_duration=${f3(a - ini)}:stop_mode=add:stop_duration=${f3(dur + 1)}:color=black[fx${k}]`);
      const nova = 'b' + (++nb);
      g.push(`[${base}]format=gbrp[g${k}];[g${k}][fx${k}]blend=all_mode=screen:shortest=1,format=yuv420p[${nova}]`);
      base = nova;
    }
  }
  g.push(`[${base}]trim=0:${f3(dur)},setpts=PTS-STARTPTS,format=yuv420p[vout]`);

  /* ── áudio: mixagem e acabamento ── */
  if (!quadro) {
    const A = p.audio, pos = [];
    if (A.limpar) pos.push('highpass=f=80', 'afftdn=nr=12:nf=-40');
    if (A.voz) pos.push('acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=2', 'equalizer=f=3000:t=q:w=1:g=2');
    if (A.normalizar) pos.push(`loudnorm=I=${A.lufs}:TP=-1.5:LRA=11`);
    pos.push('aresample=48000', `apad`, `atrim=0:${f3(dur)}`);
    if (audios.length) g.push(`${audios.join('')}amix=inputs=${audios.length}:normalize=0:dropout_transition=0,${pos.join(',')}[aout]`);
    else g.push(`anullsrc=r=48000:cl=stereo,atrim=0:${f3(dur)}[aout]`);
  }
  return { entradas, grafo: g.join(';\n'), dur, W, H, fps };
}

/* exporta vídeo (ou um quadro .png) — pacote: {fundo, frente, imagens, fontes} montado pelo preview */
async function exportar(p, destino, { ini = 0, fim = null, pacote = {}, quadro = false, aoPct, controle, tmpDir }) {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const marca = `${process.pid}-${Date.now()}`;
  const ass = {}, temporarios = [];
  for (const k of ['fundo', 'frente']) {
    if (pacote[k] && pacote[k].includes('Dialogue:')) { ass[k] = path.join(tmpDir, `${k}-${marca}.ass`); fs.writeFileSync(ass[k], pacote[k]); temporarios.push(ass[k]); }
  }
  // só as fontes que o projeto usa, numa pasta própria (o libass acha pelo nome completo)
  const fontesDir = require('./fontes').pastaDoProjeto([...(pacote.fontes || []), 'Montserrat-Bold'], path.join(tmpDir, `fontes-${marca}`));
  const g = montar(JSON.parse(JSON.stringify(p)), { ini, fim, ass, imagens: pacote.imagens || [], fontesDir, quadro });
  /* Caminho curto para cada arquivo de entrada (link físico numa pasta temporária, ffmpeg roda dentro dela):
     projeto com centenas de cortes não passa do limite de ~32 mil caracteres da linha de comando do Windows.
     Se o link não der (outro disco, arquivo só na nuvem), usa o caminho original. */
  const pastaLinks = path.join(tmpDir, `entradas-${marca}`);
  fs.mkdirSync(pastaLinks, { recursive: true });
  const apelidos = new Map();
  for (let i = 0; i < g.entradas.length; i++) {
    if (g.entradas[i - 1] !== '-i') continue;
    const orig = g.entradas[i];
    if (!apelidos.has(orig)) {
      const curto = `i${apelidos.size}${path.extname(orig).toLowerCase()}`;
      try { fs.linkSync(orig, path.join(pastaLinks, curto)); apelidos.set(orig, curto); }
      catch { apelidos.set(orig, orig); }
    }
    g.entradas[i] = apelidos.get(orig);
  }
  const script = path.join(tmpDir, `grafo-${Date.now()}.txt`);
  fs.writeFileSync(script, g.grafo);
  try {
    if (quadro) {
      await U.rodar('ffmpeg', ['-y', '-v', 'error', ...g.entradas, '-/filter_complex', script, '-map', '[vout]', '-frames:v', '1', '-update', '1', destino], { controle, cwd: pastaLinks });
    } else {
      const tmp = destino.replace(/(\.\w+)$/, '.parcial$1');
      await U.codificar(enc => [...g.entradas, '-/filter_complex', script, '-map', '[vout]', '-map', '[aout]',
        ...U.vcodec(enc), '-pix_fmt', 'yuv420p', '-r', String(g.fps),
        '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
        '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', f3(g.dur), '-movflags', '+faststart', tmp], g.dur, aoPct, controle, pastaLinks);
      if (fs.existsSync(destino)) fs.unlinkSync(destino);
      fs.renameSync(tmp, destino);
    }
  } finally {
    try { fs.unlinkSync(script); } catch {}
    for (const f of temporarios) try { fs.unlinkSync(f); } catch {}
    try { fs.rmSync(fontesDir, { recursive: true, force: true }); } catch {}
    try { fs.rmSync(pastaLinks, { recursive: true, force: true }); } catch {}   // apaga só os links, nunca os arquivos
  }
  return { destino, dur: g.dur };
}

module.exports = { montar, exportar };
