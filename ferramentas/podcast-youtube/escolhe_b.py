"""Escolhe novos trechos do outro ângulo para o comp1 (sem mexer no que já está lá)."""
import json, re, sys
import numpy as np

LIM = float(sys.argv[1]) if len(sys.argv) > 1 else 0.05   # movimento máximo aceito (scene score)
ESPACO = 40.0                                             # distância mínima entre trechos (s na linha do tempo)

mov_t, mov_s = [], []
pts = None
for l in open('trab/movimento.txt', encoding='utf-8'):
    m = re.search(r'pts_time:([\d.]+)', l)
    if m: pts = float(m[1]) + 2400; continue
    m = re.search(r'scene_score=([\d.]+)', l)
    if m and pts is not None: mov_t.append(pts); mov_s.append(float(m[1]))
mov_t, mov_s = np.array(mov_t), np.array(mov_s)
print('movimento p50/p90/p99:', np.percentile(mov_s, [50, 90, 99]).round(3))
def movimento(b0, b1):
    k = (mov_t >= b0 - 0.1) & (mov_t <= b1 + 0.1)
    return float(mov_s[k].max()) if k.any() else 1

B = json.load(open('trab/mapa_b.json'))
ws = json.load(open('transcricoes/m1.json', encoding='utf-8'))
c = json.load(open('composicoes/comp1.json', encoding='utf-8'))
V1 = next(f for f in c['faixas'] if f['id'] == 'V1')['itens']
V2 = next(f for f in c['faixas'] if f['id'] == 'V2')['itens']

# trechos contínuos do arquivo na linha do tempo (sem corte no meio) e áreas de zoom
runs = []
for it in sorted(V1, key=lambda i: i['inicio']):
    if runs and abs(runs[-1]['s1'] - it['entrada']) < 1e-3: runs[-1]['s1'] = it['saida']
    else: runs.append({'s0': it['entrada'], 's1': it['saida'], 't0': it['inicio']})
proibido = [(it['entrada'] - 0.5, it['saida'] + 0.5) for it in V1 if it.get('zooms')]
def linha(src):
    for r in runs:
        if r['s0'] <= src <= r['s1']: return r['t0'] + src - r['s0']
usados = [it['inicio'] for it in V2]

cands = []
for i, w in enumerate(ws):
    if i == 0: continue
    prev = ws[i - 1]
    # começa numa palavra que abre frase ou depois de respiro
    if not (re.search(r'[.?!,]$', prev['t']) or w['i'] - prev['f'] > 0.15): continue
    s0 = w['i'] - 0.05
    for j in range(i + 3, min(i + 40, len(ws))):
        e = ws[j]; L = e['f'] + 0.05 - s0
        if L < 3.8: continue
        if L > 7.0: break
        nxt = ws[j + 1] if j + 1 < len(ws) else None
        if not (re.search(r'[.?!,]$', e['t']) or (nxt and nxt['i'] - e['f'] > 0.15)): continue
        s1 = e['f'] + 0.05
        b = next((b for b in B if b['m0'] + 0.3 <= s0 and s1 <= b['m1'] - 0.3), None)
        if not b: continue
        r = next((r for r in runs if r['s0'] + 0.1 <= s0 and s1 <= r['s1'] - 0.1), None)
        if not r: continue
        if any(not (s1 < p0 or s0 > p1) for p0, p1 in proibido): continue
        mv = movimento(s0 + b['off'], s1 + b['off'])
        if mv > LIM: continue
        cands.append({'s0': round(s0, 2), 's1': round(s1, 2), 'off': b['off'], 't': linha(s0), 'mv': mv, 'L': L,
                      'txt': ' '.join(x['t'] for x in ws[i:j + 1])})
        break

# escolhe espalhado: o de menos movimento em cada janela, respeitando o espaçamento
cands.sort(key=lambda c: (round(c['mv'], 2), -c['L']))
escolha = []
for cd in cands:
    if all(abs(cd['t'] - u) >= ESPACO for u in usados + [e['t'] for e in escolha]): escolha.append(cd)
escolha.sort(key=lambda c: c['t'])
for e in escolha:
    print(f"linha {e['t']:7.2f}  arquivo {e['s0']:.2f}-{e['s1']:.2f}  ({e['L']:.1f}s, mov {e['mv']:.3f})  {e['txt'][:90]}")
print(len(escolha), 'trechos novos')
json.dump(escolha, open('trab/escolha_b.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
