"""Texturas da vinheta "Destrinchando Cases" (quadro de investigação): parede, papel, kraft e fita rasgados.
uso: python texturas.py   → gera os png em vinhetas/destrinchando/"""
import os
import numpy as np
from PIL import Image, ImageFilter

import sys
AZUL = '--blue' in sys.argv   # versão com as cores da Blue Ocean (navy, azul, verde-água)
OUT = os.path.join(os.path.dirname(__file__), 'destrinchando-blue' if AZUL else 'destrinchando')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(14)

def ruido(h, w, escala, semente):
    """value noise suave (escala em px)"""
    r = np.random.default_rng(semente)
    gh, gw = max(2, int(h / escala) + 2), max(2, int(w / escala) + 2)
    g = Image.fromarray((r.random((gh, gw)) * 255).astype(np.uint8))
    return np.asarray(g.resize((w, h), Image.BICUBIC), np.float32) / 255

def fbm(h, w, base, oit, semente):
    x = np.zeros((h, w), np.float32); amp, tot = 1.0, 0.0
    for o in range(oit):
        x += ruido(h, w, base / 2 ** o, semente + o) * amp; tot += amp; amp *= 0.55
    return x / tot

def salvar(arr, nome):
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(os.path.join(OUT, nome))

def borda_rasgada(h, w, semente, dente=10, fibra=True):
    """alfa com borda rasgada irregular"""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.minimum.reduce([xx, w - 1 - xx, yy, h - 1 - yy])
    n = fbm(h, w, 40, 4, semente) * dente * 1.6 + ruido(h, w, 3, semente + 9) * dente * 0.5
    a = np.clip((d - n) * 1.5, 0, 1)
    return a

# parede de concreto escuro
H, W = 2200, 3400
c = fbm(H, W, 600, 7, 1)
manchas = fbm(H, W, 900, 3, 7)
poros = (ruido(H, W, 2.2, 3) > 0.93) * 0.25
v = 0.55 + (c - 0.5) * 0.9 - poros - (manchas - 0.5) * 0.35
base = np.array([34, 44, 92] if AZUL else [84, 78, 72], np.float32)
salvar(np.dstack([v * base[0], v * base[1], v * base[2]]) * 1.0, 'parede.png')

# papel do quadro (branco sujo, fibras, amassado leve, borda irregular)
def papel(h, w, cor, semente, dente=8, amassado=0.10, sujeira=0.08):
    f = fbm(h, w, 220, 6, semente)
    fib = ruido(h, w, 1.4, semente + 4)
    am = fbm(h, w, 160, 3, semente + 11)
    gy, gx = np.gradient(am)
    luz = 1 + (gx - gy) * 90 * amassado
    v = (1 - sujeira * (f - 0.3)) * luz * (0.97 + fib * 0.05)
    rgb = np.dstack([v * cor[0], v * cor[1], v * cor[2]])
    a = borda_rasgada(h, w, semente + 20, dente) * 255
    return np.dstack([rgb, a])

salvar(papel(1050, 1700, (226, 231, 242) if AZUL else (232, 228, 218), 21, dente=6, amassado=0.045), 'quadro.png')

# kraft rasgado em vários tamanhos
for nome, (h, w, s) in {'kraft1': (170, 420, 31), 'kraft2': (250, 360, 32), 'kraft3': (150, 300, 33), 'branco1': (160, 380, 34)}.items():
    cor = ((236, 240, 248) if AZUL else (233, 229, 216)) if nome.startswith('branco') else ((160, 186, 238) if AZUL else (176, 140, 98))
    salvar(papel(h, w, cor, s, dente=14, amassado=0.08, sujeira=0.16), f'{nome}.png')

# fita crepe amarela (translúcida, pontas serrilhadas)
def fita(h, w, semente):
    f = fbm(h, w, 60, 4, semente)
    v = 0.92 + (f - 0.5) * 0.18
    rgb = np.dstack([v * 70, v * 246, v * 214]) if AZUL else np.dstack([v * 236, v * 216, v * 128])
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    serra = (np.abs(((yy / 7) % 2) - 1) * 9 + ruido(h, w, 4, semente) * 6)
    a = np.clip(np.minimum(xx - serra, (w - 1 - xx) - serra) * 0.8, 0, 1)
    a *= np.clip(np.minimum(yy, h - 1 - yy) / 2, 0, 1) * (0.86 + f * 0.1)
    return np.dstack([rgb, a * 255])
salvar(fita(190, 1040, 41), 'fita-titulo.png')
salvar(fita(46, 150, 42), 'fita-curta.png')

# post-it amarelo
salvar(papel(270, 270, (150, 245, 228) if AZUL else (240, 222, 120), 51, dente=2, amassado=0.12, sujeira=0.1), 'postit.png')

# corda (textura trançada para o primeiro plano)
h, w = 64, 1024
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
tranca = (np.sin((xx * 0.09 + yy * 0.16)) * 0.5 + 0.5) ** 1.5
fio = ruido(h, w, 2, 61)
perfil = np.clip(np.sin(np.pi * yy / (h - 1)), 0, 1) ** 0.6
v = (0.35 + tranca * 0.45 + fio * 0.15) * perfil
salvar(np.dstack([v * 168, v * 128, v * 86, np.clip(perfil * 1.6, 0, 1) * 255]), 'corda.png')
print('texturas em', OUT)
