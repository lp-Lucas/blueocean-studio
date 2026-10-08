"""SFX da Onnira — tempos iguais aos de copy1..4.html (linha do tempo já cortada). Base: fftech-sfx.py (receita 15).
uso: python onnira-sfx.py <1|2|3|4> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

copia = sys.argv[1]
m = nova({'1': 38.32, '2': 36.48, '3': 35.26, '4': 35.24}[copia])
# a base foi recortada depois do motion (07/10): os tempos abaixo são os antigos; o WARP da página leva ao tempo novo
import json, re
_W = json.loads(re.search(r'\[.*\]', open(os.path.join(os.path.dirname(__file__), f'copy{copia}', 'warp.js'), encoding='utf8').read()).group(0))
def _novo(t):
    for (a0, b0), (a1, b1) in zip(_W, _W[1:]):
        if t <= b1: return a0 + (t - b0) * (a1 - a0) / (b1 - b0) if b1 > b0 else a0
    return t
_add = m.add
m.add = lambda t, *a, **k: _add(max(0, _novo(t)), *a, **k)

def fs_entra(t):
    m.add(t, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha'); m.add(t + 0.42, baque(0.6, 50), 0.22, nome='círculo some: grave')
def fs_sai(t):
    m.add(t, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece'); m.add(t + 0.04, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')
def linhas(t0, n, passo, f=1700):
    for k in range(n): m.add(t0 + k * passo, tick(f + 140 * k, 0.03), 0.08, nome='linha entra')
def acende(t, f=1000):
    m.add(t, pop(f, 0.2, 0.5), 0.1, nome='acende')
def troca(t):
    clique(m, t); m.add(t + 0.07, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='troca de aba')
def problema(t):
    m.add(t, pop(650, 0.25, 0.7), 0.14, nome='problema'); impacto(m, t + 0.02, A6)
def traco(t, marcos, ruim=None):
    m.add(t, whoosh(0.4, 1400, 3000, pico=0.5, q=1.4), 0.08, nome='traço')
    for k, tk in enumerate(marcos): m.add(tk, tick(1800 + 160 * k, 0.03), 0.1, nome='marco')
    if ruim: problema(ruim)
def digita(t0, d, n=9):
    teclas(m, [t0 + d * k / n for k in range(n)], ganho=0.12)
def cta(tc, ent):
    entra(m, ent, 560, 0.24); clique(m, tc); m.add(tc + 0.02, baque(0.5, 60), 0.12, nome='botão: grave')
    for t in (tc + 0.15, tc + 1.75): m.add(t, vidro(C7, 1.2, 0.6), 0.05, nome='brilho no botão')

if copia == '1':
    entra(m, 0.25, 560, 0.2); m.add(2.06, whoosh(0.5, 900, 2600, pico=0.5, q=1.2), 0.1, nome='liga'); acende(3.4); acende(4.64, 1200); sai(m, 4.9)
    fs_entra(5.15); entra(m, 5.2, 520, 0.18); linhas(5.5, 6, 0.08)
    traco(8.75, [9.22, 10.7, 11.5], ruim=16.03)
    troca(9.95); linhas(10.15, 4, 0.08); acende(11.14); troca(11.45); linhas(11.65, 3, 0.12)
    entra(m, 14.3, 600, 0.14)
    fs_sai(17.1)
    entra(m, 17.25, 620, 0.22); sai(m, 18.9); entra(m, 19.0, 560, 0.2); check(m, 19.77, E6, ganho=0.12); acende(21.39); sai(m, 23.0)
    fs_entra(23.2); entra(m, 23.25, 520, 0.2); digita(23.3, 0.6); clique(m, 23.9)
    entra(m, 24.0, 700, 0.12); entra(m, 24.57, 760, 0.12)
    for k in range(5): m.add(24.7 + k * 0.25, tick(2400 + 100 * k, 0.025), 0.05, nome='consultando')
    check(m, 26.0, G6, ganho=0.12); contador(m, 27.3, 1.0, lambda p: 1 - (1 - p) ** 3, 10); problema(28.4)
    m.add(30.99, whoosh(0.3, 1600, 600, pico=0.4, q=1.2), 0.1, nome='risca'); check(m, 32.19, E6, ganho=0.12)
    for k in range(4): acende(33.05 + k * 0.18, 1000 + 120 * k)
    fs_sai(34.95)
    cta(37.0, 35.1)
elif copia == '2':
    fs_entra(1.0); entra(m, 1.05, 520, 0.18); linhas(1.3, 3, 0.1); contador(m, 2.44, 1.0, lambda p: 1 - (1 - p) ** 3, 8); acende(4.44)
    troca(7.75); linhas(7.95, 3, 0.1); check(m, 9.65, E6, ganho=0.12)
    traco(10.6, [11.05, 11.61, 12.39], ruim=14.23); problema(14.93)
    fs_sai(15.5)
    entra(m, 15.6, 560, 0.22); acende(17.13); check(m, 18.57, E6, ganho=0.12); acende(19.79, 1200)
    m.add(22.27, whoosh(0.3, 1600, 600, pico=0.4, q=1.2), 0.1, nome='risca'); sai(m, 22.8)
    fs_entra(22.95); entra(m, 23.0, 520, 0.2); digita(23.1, 0.6); clique(m, 23.8)
    entra(m, 23.87, 700, 0.12); entra(m, 24.5, 760, 0.12)
    for k in range(4): m.add(24.7 + k * 0.25, tick(2400 + 100 * k, 0.025), 0.05, nome='consultando')
    check(m, 25.8, G6, ganho=0.12); contador(m, 26.2, 1.0, lambda p: 1 - (1 - p) ** 3, 10); acende(31.34, 1200)
    clique(m, 32.75); check(m, 32.85, G6, ganho=0.16)
    fs_sai(34.0)
    cta(35.6, 34.05)
elif copia == '3':
    entra(m, 0.2, 560, 0.2); traco(0.4, [0.45, 1.34], ruim=2.7); sai(m, 4.45)
    fs_entra(4.6); entra(m, 4.65, 520, 0.18); linhas(4.9, 4, 0.06)
    for k, t in enumerate((7.09, 7.71, 8.23, 8.89)): acende(t, 1000 + 120 * k)
    m.add(10.49, pop(500, 0.3, 0.6), 0.14, nome='encerrada')
    troca(11.25); linhas(11.45, 3, 0.1); problema(12.41); problema(14.15); problema(15.83)
    fs_sai(17.4)
    entra(m, 17.5, 620, 0.22); sai(m, 19.15)
    fs_entra(19.3); entra(m, 19.35, 520, 0.2); linhas(19.82, 4, 0.35, 1500)
    troca(23.75); linhas(23.95, 3, 0.08)
    for k in range(3): check(m, 24.14 + k * 0.22, [E6, G6, C7][k], ganho=0.1)
    troca(25.6); digita(25.95, 0.7); clique(m, 26.8); entra(m, 26.88, 700, 0.12); entra(m, 27.4, 760, 0.12)
    acende(30.76); check(m, 31.64, G6, ganho=0.12)
    fs_sai(32.75)
    cta(34.4, 32.8)
elif copia == '4':
    fs_entra(1.0); entra(m, 1.05, 520, 0.18); m.add(1.52, pop(500, 0.3, 0.6), 0.14, nome='encerrada'); linhas(1.3, 4, 0.08)
    for k in range(3): problema(3.06 + k * 0.45)
    traco(6.0, [6.45, 8.63], ruim=9.89); acende(7.79); problema(11.95)
    fs_sai(13.55)
    entra(m, 13.65, 620, 0.22); sai(m, 15.15)
    fs_entra(15.3); entra(m, 15.35, 520, 0.2); linhas(15.92, 4, 0.3, 1500)
    for k in range(4): acende(17.86 + k * 0.12, 1000 + 100 * k)
    troca(19.6); linhas(19.8, 4, 0.1); troca(22.2); linhas(22.4, 3, 0.12)
    for k in range(3): check(m, 28.22 + k * 0.12, [E6, G6, C7][k], ganho=0.08)
    check(m, 29.48, E6, ganho=0.12); clique(m, 30.5); check(m, 30.66, G6, ganho=0.16); confete_som(m, 30.7, 0.12)
    fs_sai(31.8)
    cta(33.7, 31.9)

salvar(m, sys.argv[2])
