"""SFX da vinheta "Destrinchando Cases" — tempos iguais aos do destrinchando.html.
uso: python destrinchando-sfx.py <saida.wav>"""
import sys, os
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from sfx import *
from sfx import _t, _st, _passa_banda, _passa_baixa, _env

DUR = 7.0
r = np.random.default_rng(5)
cubicInOut = lambda p: 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2

def estalo_eletrico(forte=1.0):
    """relé/filamento: estalo seco + zumbido curtinho"""
    t = _t(0.08)
    y = _passa_banda(r.standard_normal(len(t)), 2200, 1.0) * np.exp(-t * 160)
    y += 0.5 * np.sign(np.sin(2 * np.pi * 120 * t)) * np.exp(-t * 60) * 0.3
    return _st(y / np.max(np.abs(y)) * forte, 0.55)

def hum(dur):
    """hum elétrico da lâmpada (bem baixo)"""
    t = _t(dur)
    y = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(120, 1), (240, .45), (360, .2), (600, .08)])
    y *= (1 + 0.15 * np.sin(2 * np.pi * 0.7 * t)) * np.clip(t / 0.05, 0, 1) * np.clip((dur - t) / 0.6, 0, 1)
    return _st(y / np.max(np.abs(y)), 0.5)

def marcador(dur, n, semente):
    """marcador riscando papel: n traços de ruído agudo com chiado"""
    rr = np.random.default_rng(semente)
    out = np.zeros(int(dur * SR))
    for i in range(n):
        a = int((i / n + rr.uniform(0, 0.3 / n)) * len(out)); L = int(rr.uniform(0.05, 0.11) * SR)
        if a + L > len(out): L = len(out) - a
        if L <= 0: continue
        x = _passa_banda(rr.standard_normal(L), rr.uniform(2600, 4200), 2.2)
        x += 0.25 * np.sin(2 * np.pi * rr.uniform(900, 1400) * np.arange(L) / SR)
        out[a:a + L] += x * np.sin(np.pi * np.linspace(0, 1, L)) ** 0.7 * rr.uniform(0.6, 1)
    return _st(out / (np.max(np.abs(out)) + 1e-9), 0.0)

def fita_batendo():
    """fita crepe batendo no quadro: tapa de papel + grave"""
    t = _t(0.35)
    tapa = _passa_banda(r.standard_normal(len(t)), 1400, 0.8) * np.exp(-t * 45)
    corpo = np.sin(2 * np.pi * np.cumsum(110 * (1 + np.exp(-t * 40))) / SR) * np.exp(-t * 18)
    y = tapa / np.max(np.abs(tapa)) + 0.7 * corpo
    return _st(y / np.max(np.abs(y)))

m = Mixagem(DUR)
m.add(0, base_ambiente(DUR, notas=(73.42, 110.0, 146.83, 174.61), entra=0.4, sai=1.2), 0.30, cama=True, nome='cama de suspense')
# lâmpada piscando e acendendo
for t, f in [(0.10, 1), (0.16, .6), (0.22, 1), (0.27, .5), (0.34, .9), (0.40, .5), (0.46, .8)]:
    m.add(t, estalo_eletrico(f), 0.16, nome='lâmpada: estalo')
m.add(0.10, hum(DUR - 0.1), 0.035, cama=True, nome='lâmpada: hum')
# câmera
m.add(0.0, whoosh(1.5, 260, 900, pico=0.5, q=0.8), 0.10, nome='câmera: deriva')
m.add(1.25, whoosh(1.4, 700, 300, pico=0.45, q=0.9, pan=(0.3, -0.4)), 0.13, nome='câmera: segue o fio')
m.add(2.55, whoosh(1.8, 1500, 220, pico=0.35, q=0.8, corpo=0.4), 0.20, nome='câmera: abre o quadro')
# painel de MRR: contador e pílula
for i in range(9):
    p = i / 8
    ps = np.linspace(0, 1, 400); tt = 0.25 + 1.2 * ps[np.argmax([cubicInOut(x) >= p for x in ps])]
    m.add(tt, tick(2300 + 60 * i, 0.03, pan=0.1), 0.05, nome='contador')
m.add(1.36, pop(640, 0.3, 0.3), 0.12, nome='+66%: pop')
m.add(1.42, vidro(1760, 1.2, 0.8), 0.07, nome='ponto do gráfico')
# fios (mesmos tempos do html)
FIOS = [(0.45, 1.35), (1.3, 2.15), (2.0, 2.55), (2.3, 2.9), (2.7, 3.3), (2.9, 3.7), (3.35, 3.85), (3.1, 3.9), (3.6, 4.25), (3.8, 4.3)]
for i, (a, b) in enumerate(FIOS):
    curva = np.array([cubicInOut(p) for p in np.linspace(0, 1, 300)])
    m.add(a, zip_linha(b - a, 220, 620, curva), 0.07, nome=f'fio {i + 1}')
    m.add(b - 0.02, tick(1500 + 90 * i, 0.04, pan=r.uniform(-0.5, 0.5)), 0.10, nome=f'alfinete {i + 1}')
# título
m.add(4.30, whoosh(0.35, 500, 2400, pico=0.8, q=1.0), 0.14, nome='fita: ar')
m.add(4.56, fita_batendo(), 0.38, nome='fita bate')
m.add(4.56, baque(0.7, 48), 0.30, nome='fita: grave')
m.add(4.75, marcador(0.8, 13, 1), 0.10, nome='marcador: DESTRINCHANDO')
m.add(5.60, marcador(0.4, 5, 2), 0.12, nome='marcador: CASES')
m.add(6.0, baque(1.0, 41), 0.26, nome='impacto final')
m.add(6.0, vidro(587.33, 2.2, 0.5), 0.05, nome='brilho final')

for t, n in sorted(m.salvar(sys.argv[1], lufs=-16)):
    if n and not n.startswith(('contador', 'lâmpada: estalo')): print(f'{t:6.2f}  {n}')
