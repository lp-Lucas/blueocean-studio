"""Montagem SEM RESPIRO (pedido Leadrive 07/10: "tire momentos de respiro, analise a média de dB da voz e tire tudo que
esteja MUITO abaixo disso, identifique respiros e barulhos e tire"). Aceita trechos de brutos diferentes no mesmo vídeo.
uso: python cortes_respiro.py <projeto> <compX> m7:3.2-15.9 m8:6.7-34.3 … [--abaixo 13] [--pausa 0.16] [--resto 0.10]
  - nível da voz = mediana da energia (20 ms) nos blocos com fala (> −40 dB) de cada bruto (≈ −25 dB nos brutos Leadrive)
  - silêncio = abaixo de (mediana − --abaixo dB); toda pausa ≥ --pausa s vira --resto s (metade de cada lado)
  - respiro/barulho = ilha de som < 0,45 s, separada por silêncio dos dois lados, cujo pico fica > 6 dB abaixo da
    mediana → sai inteira (vira silêncio e é cortada junto com a pausa)
  - bordas: entra 0,08 s antes da 1ª voz (limiar mediana − 22 dB, pega começo suave); o último trecho tem 0,5 s de cauda
  - zoom 1,12 alternado só nos pulos grandes (troca de tomada ou pausa cortada ≥ 0,5 s) — pausa curta cortada não pisca zoom
Grava o V1 da composição e imprime os trechos. A legenda sai depois da transcrição da base cortada."""
import sys, json, wave, subprocess, os
import numpy as np
args = sys.argv[1:]
def opt(n, d):
    if n in args: i = args.index(n); v = args[i + 1]; del args[i:i + 2]; return float(v)
    return d
ABAIXO, PAUSA, RESTO = opt('--abaixo', 13), opt('--pausa', 0.16), opt('--resto', 0.10)
proj, comp = args[:2]
P = json.load(open(os.path.join(proj, 'projeto.json'), encoding='utf8'))
FPS = 50
def energia(mid):
    wav = os.path.join(proj, 'cache', f'{mid}-16k.wav')
    if not os.path.exists(wav):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', P['midias'][mid]['arquivo'], '-ac', '1', '-ar', '16000', wav], check=True)
    w = wave.open(wav); x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
    n = 320; fr = len(x) // n
    db = lambda y: 20 * np.log10(np.sqrt((y[:fr * n].reshape(fr, n) ** 2).mean(1)) + 1e-9)
    hf = np.diff(np.diff(x, prepend=0), prepend=0)          # agudos (s, f, x): têm pouca energia total mas muita aqui
    return db(x), db(hf)
E = {}
pecas = []   # (mid, a, b, pulo_grande_antes)
trechos = [(r.split(':')[0], *map(float, r.split(':')[1].split('-'))) for r in args[2:]]
for ti, (mid, a, b) in enumerate(trechos):
    if mid not in E: E[mid] = energia(mid)
    e, eh = E[mid]; med = np.median(e[e > -40]); medh = np.median(eh[e > -40]); TH = med - ABAIXO; TB = med - 22
    i0, i1 = round(a * FPS), min(round(b * FPS), len(e))
    voz = (e[i0:i1] > TH) | ((eh[i0:i1] > medh - 8) & (e[i0:i1] > TH - 10))   # fala ou sibilante (s, ss, f) colada nela
    T = [w for w in json.load(open(os.path.join(proj, 'transcricoes', f'{mid}.json'), encoding='utf8')) if not w.get('oculta')]
    dentro = lambda s0, s1: s1 - s0 < 0.35 and any(w['i'] + 0.03 < s0 and w['f'] - 0.03 > s1 for w in T)   # pausa dentro de palavra
    # respiros/barulhos: ilhas curtas e fracas
    k, n = 0, len(voz)
    while k < n:
        if voz[k]:
            j = k
            while j < n and voz[j]: j += 1
            isol = (k == 0 or not voz[k - 1]) and (j == n or not voz[j])
            if isol and (j - k) / FPS < 0.45 and e[i0 + k:i0 + j].max() < med - 6: voz[k:j] = False
            k = j
        else: k += 1
    idx = np.nonzero(voz)[0]
    if not len(idx): continue
    # bordas pelo limiar baixo (começo suave / cauda)
    s = idx[0]
    while s > 0 and e[i0 + s - 1] > TB and idx[0] - s < 15: s -= 1
    f = idx[-1] + 1
    while f < n and e[i0 + f] > TB and f - idx[-1] < 15: f += 1
    ini = max(a, (i0 + s) / FPS - 0.08)
    ult = ti == len(trechos) - 1
    fim = min((i0 + f) / FPS + (0.5 if ult else 0.08), P['midias'][mid]['dur'] - 0.02)
    # pausas internas
    cur, j, grande = ini, idx[0], True
    while j < idx[-1]:
        if not voz[j]:
            k = j
            while k < n and not voz[k]: k += 1
            s0, s1 = (i0 + j) / FPS, (i0 + k) / FPS
            if s1 - s0 >= PAUSA and not dentro(s0, s1):
                pecas.append((mid, cur, s0 + RESTO / 2, grande)); cur = s1 - RESTO / 2; grande = (s1 - s0) >= 0.5
            j = k
        else: j += 1
    pecas.append((mid, cur, fim, grande))
# pedaço muito curto junta com o anterior (mesmo bruto)
out = []
for p in pecas:
    if out and p[2] - p[1] < 0.12 and out[-1][0] == p[0]: out[-1] = (p[0], out[-1][1], p[2], out[-1][3])
    else: out.append(p)
C = json.load(open(os.path.join(proj, 'composicoes', f'{comp}.json'), encoding='utf8'))
itens, lin, z = [], 0.0, 1
for k, (mid, a, b, g) in enumerate(out):
    if k and g: z = 1.12 if z == 1 else 1
    it = {"id": f"c{k + 1}", "midia": mid, "inicio": round(lin, 2), "entrada": round(a, 2), "saida": round(b, 2),
          "caixa": {"x": 0, "y": 0, "w": 1080, "h": 1920}, "zoom": z, "volume": 1}
    if z != 1: it["foco"] = {"x": 0.5, "y": 0.35}
    itens.append(it); lin += round(b, 2) - round(a, 2)
C['faixas'][0]['itens'] = itens
C['legenda']['ativa'] = False
json.dump(C, open(os.path.join(proj, 'composicoes', f'{comp}.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
tirado = sum(b - a for _, a, b in trechos) - lin
print(f'{comp}: {len(out)} pedaços, {lin:.2f} s (saíram {tirado:.1f} s de pausa/respiro)')
