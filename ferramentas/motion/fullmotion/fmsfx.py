"""SFX comuns do Full Motion BlueOcean (receita 11). Uso num roteiro de som:
    from fmsfx import *
    m = nova(49.1)
    teclas(m, [0.34, 0.9]); entra(m, 2.64); troca_azul(m, 11.95) ...
    salvar(m, 'saida.wav')          # -34 LUFS: o nível aprovado (≈18 dB abaixo da voz)
Sem cama ambiente: a música de fundo faz esse papel."""
import sys, os, math
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from sfx import *

C6, D6, E6, G6, A6, C7 = 1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0
cubicInOut = lambda p: 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2
quintOut = lambda p: 1 - (1 - p) ** 5
quintInOut = lambda p: 16 * p ** 5 if p < 0.5 else 1 - (-2 * p + 2) ** 5 / 2
r = np.random.default_rng(11)


def nova(dur):
    return Mixagem(dur)


def teclas(m, ts, ganho=0.16):
    """uma tecla de teclado Apple por palavra que sobe"""
    for t in ts:
        m.add(max(0, t - 0.02 + r.uniform(-0.004, 0.004)), tecla(r.uniform(-1, 1), pan=r.uniform(-0.25, 0.25)),
              ganho * 10 ** (r.uniform(-1.5, 1.0) / 20), reverb=False, nome='tecla')


def contador(m, t0, dur, ease, passos, ganho=0.06, f0=2200, f1=3400):
    """um tique a cada passo do número (segue a curva do contador)"""
    ps = np.linspace(0, 1, 3000)
    vs = np.array([ease(p) for p in ps])
    for k in range(1, passos + 1):
        tt = t0 + dur * ps[np.argmax(vs >= k / passos)]
        m.add(tt, tick(f0 + (f1 - f0) * k / passos, 0.03, pan=r.uniform(-0.3, 0.3)), ganho, nome='tique contador')


def troca_azul(m, t, ida=True):
    """varrida do fundo azul entrando (ida) ou saindo"""
    m.add(max(0, t - 0.05), whoosh(0.7, 300, 3200, pico=0.55, q=1.0, pan=(-0.8, 0.8) if ida else (0.8, -0.8)), 0.32, nome='varrida de fundo')
    m.add(t + 0.25, baque(0.5, 55), 0.18, nome='varrida: grave')


def arco(m, t, dur=1.6):
    m.add(t, ar(dur, 1700), 0.08, nome='arco')


def entra(m, t, f=600, ganho=0.22, pan=0.0):
    """cartão/selo entrando com mola"""
    m.add(max(0, t - 0.06), ar(0.5, 2600), ganho * 0.7, nome='entra: ar')
    m.add(t + 0.04, pop(f, 0.32, 0.6, pan=pan), ganho, nome='entra: pop')


def sai(m, t, ganho=0.16):
    m.add(max(0, t - 0.02), whoosh(0.45, 2600, 500, pico=0.35, q=1.0), ganho, nome='sai: sopro')


def impacto(m, t, nota=C7):
    """palavra gigante (VIVO, FILTRO, Sete?): ar + grave + vidro"""
    m.add(max(0, t - 0.04), whoosh(0.4, 600, 3500, pico=0.8, q=1.0), 0.24, nome='impacto: ar')
    m.add(t + 0.02, baque(0.7, 46), 0.34, nome='impacto: grave')
    m.add(t + 0.04, vidro(nota, 1.8, 1.0), 0.13, nome='impacto: brilho')


def check(m, t, nota=E6, pan=0.0, ganho=0.18):
    m.add(t, acorde_sucesso(nota, pan=pan), ganho, nome='check')


def clique(m, t):
    m.add(t, tick(3200, 0.03), 0.22, nome='clique')
    m.add(t + 0.08, tick(2600, 0.03), 0.14, nome='clique (solta)')


def confete_som(m, t, ganho=0.22):
    """estouro de confete: estalo de ar + chuvinha de papel"""
    m.add(max(0, t - 0.01), whoosh(0.35, 1200, 6000, pico=0.08, q=0.8), ganho, nome='confete: estouro')
    m.add(t, pop(260, 0.3, 1.0), ganho * 0.8, nome='confete: pop grave')
    for i in range(26):
        m.add(t + 0.03 + (r.uniform(0, 1) ** 1.8) * 0.8, tick(r.uniform(3500, 7000), 0.012, pan=r.uniform(-0.8, 0.8)),
              ganho * 0.18 * r.uniform(0.4, 1), nome='confete: papel')


def salvar(m, caminho, lufs=-34):
    """−34 LUFS é o nível aprovado dos SFX (voz tratada em −16, música ~−33 enquanto ele fala)"""
    for t, n in sorted(m.salvar(caminho, lufs=lufs)):
        if n and not n.startswith(('tecla', 'tique', 'confete: papel')): print(f'{t:6.2f}  {n}')
