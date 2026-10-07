"""Montagem limpa (receita 15): trechos bons → apara bordas no volume, pausas longas encurtadas,
zoom 1,12 alternado nos pulos, grava a composição e as palavras remapeadas (palavras.js para a legenda do render).
uso: python cortes.py <pasta do projeto> <midia> <compX> <saida palavras.js> a-b [a-b ...] [opções]
opções (padrão = comportamento antigo; a receita 15 manda usar --fino):
  --fino            = --borda -46 --pausa 0.45 --respiro 0.14 --fim 0.25 --cauda 0.55 (zoom alternado em todo corte:
                      no --fino só sobra corte em pausa longa = entre frases, e o zoom esconde o pulo)
  --borda DB        limiar das bordas de cada trecho (-36): mais baixo = não come começo suave nem cauda da palavra
  --pausa S         só encurta pausa >= S (0.28); respiro natural dentro da frase fica inteiro
  --respiro S       quanto sobra de cada lado da pausa encurtada (0.1 → pausa vira 0,2 s)
  --fim S           folga depois da última voz de cada trecho (0.1)
  --cauda S         folga depois da última palavra do VÍDEO (= --fim): o vídeo não acaba colado na fala
  --zoom pausas|tomadas   zoom 1,12 alternado em todo pedaço (pausas, padrão) ou só quando muda de trecho/tomada
"""
import sys, json, wave, subprocess, os
import numpy as np
args = sys.argv[1:]
def opt(n, d):
    if n in args: i = args.index(n); v = args[i + 1]; del args[i:i + 2]; return v
    return d
fino = '--fino' in args
if fino: args.remove('--fino')
BORDA = float(opt('--borda', -46 if fino else -36)); MIN = float(opt('--pausa', 0.45 if fino else 0.28))
RESP = float(opt('--respiro', 0.14 if fino else 0.1)); FIM = float(opt('--fim', 0.25 if fino else 0.1))
CAUDA = float(opt('--cauda', 0.55 if fino else FIM)); ZOOM = opt('--zoom', 'pausas')
proj, mid, comp, saida = args[:4]
keep = [tuple(map(float, r.split('-'))) for r in args[4:]]
P = json.load(open(os.path.join(proj, 'projeto.json'), encoding='utf8'))
arq = P['midias'][mid]['arquivo']
wav = os.path.join(proj, 'cache', f'{mid}-16k.wav')
if not os.path.exists(wav):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', arq, '-ac', '1', '-ar', '16000', wav], check=True)
w = wave.open(wav); x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
n = 320; fr = len(x) // n
e = 20 * np.log10(np.sqrt((x[:fr * n].reshape(fr, n) ** 2).mean(1)) + 1e-9)
TH = -36
voz = e > TH                 # pausas (dentro do trecho)
vozb = e > BORDA             # bordas: limiar mais baixo pega começo suave e a cauda da última palavra
pecas = []
for r, (a, b) in enumerate(keep):
    i0, i1 = round(a * 50), round(b * 50)
    while i0 < i1 and not vozb[i0]: i0 += 1         # apara silêncio da borda
    while i1 > i0 and not vozb[i1 - 1]: i1 -= 1
    ult = r == len(keep) - 1
    a, b = max(0, i0 / 50 - 0.08), i1 / 50 + (CAUDA if ult else FIM)
    cur, j = a, i0
    while j < i1:
        if not voz[j]:
            k = j
            while k < i1 and not voz[k]: k += 1
            s0, s1 = j / 50, k / 50
            if s1 - s0 >= MIN: pecas.append((cur, s0 + RESP, r)); cur = s1 - RESP
            j = k
        else: j += 1
    pecas.append((cur, b, r))
out = []
for p in pecas:
    if out and p[1] - p[0] < 0.1: out[-1] = (out[-1][0], p[1], out[-1][2])
    else: out.append(p)
T = json.load(open(os.path.join(proj, 'transcricoes', f'{mid}.json'), encoding='utf8'))
C = json.load(open(os.path.join(proj, 'composicoes', f'{comp}.json'), encoding='utf8'))
itens, pal, lin = [], [], 0.0
for k, (a, b, r) in enumerate(out):
    it = {"id": f"c{k + 1}", "midia": mid, "inicio": round(lin, 2), "entrada": round(a, 2), "saida": round(b, 2),
          "caixa": {"x": 0, "y": 0, "w": 1080, "h": 1920}, "zoom": 1, "volume": 1}
    if (r if ZOOM == 'tomadas' else k) % 2: it["zoom"] = 1.12; it["foco"] = {"x": 0.5, "y": 0.35}
    itens.append(it)
    for wd in T:
        if wd.get('oculta'): continue
        if wd['f'] > a + 0.05 and wd['i'] < b - 0.02:
            q = [round(lin + max(wd['i'], a) - a, 2), round(lin + min(wd['f'], b) - a, 2), wd['t']]
            if pal and pal[-1][2] == q[2] and abs(pal[-1][1] - q[0]) < 0.03: pal[-1][1] = q[1]
            else: pal.append(q)
    lin += round(b, 2) - round(a, 2)
C['faixas'][0]['itens'] = itens
C['legenda']['ativa'] = False
json.dump(C, open(os.path.join(proj, 'composicoes', f'{comp}.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
open(saida, 'w', encoding='utf8').write('window.PAL = ' + json.dumps(pal, ensure_ascii=False) + ';')
print(f'{len(out)} trechos, {lin:.2f} s')
# frases com o tempo na linha cortada (para o roteiro)
fr, ini = [], None
for q in pal:
    if ini is None: ini = q[0]
    fr.append(q[2])
    if q[2][-1:] in '.?!':
        print(f'[{ini:6.2f}] ' + ' '.join(f'{p[2]}' for p in pal if ini <= p[0] <= q[0])); ini = None; fr = []
if ini is not None: print(f'[{ini:6.2f}] ...')
