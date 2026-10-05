"""Monta composicoes/comp1.json: decupagem do episódio + CTA final, zooms suaves e inserts do outro ângulo."""
import json, re
import numpy as np

SR = 8000
a = np.fromfile('trab/a8k.raw', dtype=np.int16).astype(np.float32)
env = np.sqrt(np.convolve(a * a, np.ones(160) / 160, mode='same'))  # janela de 20 ms

def vale(t, raio=0.1):
    """ponto de menor energia perto de t (corte sem comer sílaba)"""
    i0, i1 = int((t - raio) * SR), int((t + raio) * SR)
    return round((i0 + int(np.argmin(env[i0:i1]))) / SR, 2)

# trechos mantidos (tempo no arquivo)
EPISODIO = (1.55, 2131.95)
CTA = (2194.85, vale(2229.55, 0.06))   # tomada boa da CTA final ("para você dono de SaaS que chegou aqui até o final...")
ERROS = [(679.80, 685.15),   # "Em Hongon, ó, não sei se é assim que se fala..."
         (1718.38, 1723.08)] # "E o ponto importante de se falar é que algumas... Perdão."
sil = []
for l in open('trab/silencio30.txt', encoding='utf-8'):
    m = re.match(r'([\d.]+) → ([\d.]+)', l)
    if not m: continue
    s0, s1 = float(m[1]), float(m[2])
    if s0 > EPISODIO[0] + 0.5 and s1 < EPISODIO[1] and s1 - s0 >= 0.6:
        sil.append((s0 + 0.15, s1 - 0.15))   # silêncio longo vira 0,3 s
cortes = sorted(ERROS + sil)
fund = []
for c in cortes:
    if fund and c[0] <= fund[-1][1]: fund[-1] = (fund[-1][0], max(fund[-1][1], c[1]))
    else: fund.append(c)
fund = [(vale(x0, 0.08), vale(x1, 0.08)) for x0, x1 in fund]
trechos, ini = [], EPISODIO[0]
for x0, x1 in fund:
    trechos.append((ini, x0)); ini = x1
trechos.append((ini, EPISODIO[1]))
trechos.append(CTA)

# zooms leves (tempo no arquivo) — fx: lado de quem fala
Z, D = 1.08, 0.8
ZOOMS = [(55.30, 63.95, 0.7), (573.10, 581.95, 0.7), (782.05, 787.10, 0.7), (847.50, 852.50, 0.3), (1221.40, 1227.05, 0.7),
         (1571.00, 1580.85, 0.7), (1729.30, 1741.20, 0.3), (1855.45, 1866.40, 0.3), (2009.30, 2014.95, 0.7)]
# outro ângulo (tempo no episódio, atraso do clipe no arquivo)
INSERTS = [(546.70, 551.95, 2010.212), (909.50, 915.12, 1816.657), (1385.80, 1391.10, 1642.687),
           (1531.75, 1537.05, 1642.690), (1825.90, 1829.90, 1584.460), (2097.30, 2103.35, 1363.465)]

def dentro(x0, x1):
    return any(t0 <= x0 and x1 <= t1 for t0, t1 in trechos)
for z in ZOOMS: assert dentro(z[0], z[1]), z
for b in INSERTS: assert dentro(b[0], b[1]), b

# V1: trechos em sequência, partidos onde começa/termina um zoom
v1, t, n = [], 0.0, 0
mapa = []   # (src0, src1, inicio na linha)
for s0, s1 in trechos:
    pontos = sorted({s0, s1, *[p for z in ZOOMS for p in z[:2] if s0 < p < s1]})
    mapa.append((s0, s1, t))
    for p0, p1 in zip(pontos, pontos[1:]):
        n += 1
        it = {'id': f'c{n}', 'midia': 'm1', 'inicio': round(t, 3), 'entrada': p0, 'saida': p1, 'volume': 1}
        z = next((z for z in ZOOMS if abs(z[0] - p0) < 1e-6), None)
        if z:
            L = round(p1 - p0, 3)
            it['foco'] = {'x': z[2], 'y': 0.4}
            it['zooms'] = [{'t': 0, 'z': 1}, {'t': D, 'z': Z}, {'t': round(L - D, 3), 'z': Z}, {'t': L, 'z': 1}]
        v1.append(it); t += p1 - p0

def linha(src):
    for s0, s1, t0 in mapa:
        if s0 <= src <= s1: return t0 + src - s0

v2 = []
for k, (m0, m1, off) in enumerate(INSERTS, 1):
    v2.append({'id': f'b{k}', 'midia': 'm1', 'inicio': round(linha(m0), 3), 'entrada': round(m0 + off, 3),
               'saida': round(m1 + off, 3), 'volume': 0})

comp = json.load(open('composicoes/comp1.json', encoding='utf-8'))
for f in comp['faixas']:
    if f['id'] == 'V1': f['itens'] = v1
    if f['id'] == 'V2': f['itens'] = v2
comp['audio'] = {'normalizar': True, 'lufs': -14, 'limpar': False, 'voz': False}
json.dump(comp, open('composicoes/comp1.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

print(f'{len(trechos)} trechos, {len(v1)} itens no V1, duração {t:.2f}s ({t/60:.1f} min)')
print('cortes:', ' '.join(f'{x0:.2f}-{x1:.2f}' for x0, x1 in fund))
print('CTA:', CTA, 'na linha em', round(mapa[-1][2], 2))
for z in ZOOMS: print(f'zoom {z[0]:.2f} -> linha {linha(z[0]):.2f}')
for b in v2: print(f"insert {b['id']} linha {b['inicio']:.2f} ({b['saida']-b['entrada']:.2f}s)")
