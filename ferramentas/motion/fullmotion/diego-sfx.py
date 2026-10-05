"""SFX do full motion do case Diego — tempos iguais aos do diego.html (segundos do áudio da fala).
uso: python diego-sfx.py <saida.wav>"""
import sys, os, math
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from sfx import *

DUR = 36.2
m = Mixagem(DUR)
r = np.random.default_rng(11)
cubicInOut = lambda p: 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2
quintOut = lambda p: 1 - (1 - p) ** 5
quintInOut = lambda p: 16 * p ** 5 if p < 0.5 else 1 - (-2 * p + 2) ** 5 / 2
C6, D6, E6, G6, A6, C7 = 1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0


def teclas(ts, ganho=0.16):
    """uma tecla por palavra que sobe (cada palavra entra no tempo em que é falada)"""
    for t in ts:
        m.add(t - 0.02 + r.uniform(-0.004, 0.004), tecla(r.uniform(-1, 1), pan=r.uniform(-0.25, 0.25)),
              ganho * 10 ** (r.uniform(-1.5, 1.0) / 20), reverb=False, nome='tecla')


def contador(t0, dur, a, b, ease, passos, ganho=0.06, f0=2200, f1=3400):
    """um tique a cada 'passo' do número (acompanha a curva do contador)"""
    ps = np.linspace(0, 1, 3000)
    vs = np.array([ease(p) for p in ps])
    for k in range(1, passos + 1):
        alvo = k / passos
        tt = t0 + dur * ps[np.argmax(vs >= alvo)]
        m.add(tt, tick(f0 + (f1 - f0) * alvo, 0.03, pan=r.uniform(-0.3, 0.3)), ganho, nome='tique contador')


def troca_azul(t, ida=True):
    m.add(t - 0.05, whoosh(0.7, 300, 3200, pico=0.55, q=1.0, pan=(-0.8, 0.8) if ida else (0.8, -0.8)), 0.32, nome='varrida de fundo')
    m.add(t + 0.25, baque(0.5, 55), 0.18, nome='varrida: grave')


def entra(t, f=600, ganho=0.22, ar_=True, pan=0.0):
    if ar_: m.add(t - 0.06, ar(0.5, 2600), ganho * 0.7, nome='entra: ar')
    m.add(t + 0.04, pop(f, 0.32, 0.6, pan=pan), ganho, nome='entra: pop')


def sai(t, ganho=0.16):
    m.add(t - 0.02, whoosh(0.45, 2600, 500, pico=0.35, q=1.0), ganho, nome='sai: sopro')


def confete_som(t, ganho=0.22):
    """estouro de confete: estalo de ar + chuvinha de papel (tiques curtos espalhados que vão rareando)"""
    m.add(t - 0.01, whoosh(0.35, 1200, 6000, pico=0.08, q=0.8), ganho, nome='confete: estouro')
    m.add(t, pop(260, 0.3, 1.0), ganho * 0.8, nome='confete: pop grave')
    for i in range(26):
        tt = t + 0.03 + (r.uniform(0, 1) ** 1.8) * 0.8
        m.add(tt, tick(r.uniform(3500, 7000), 0.012, pan=r.uniform(-0.8, 0.8)), ganho * 0.18 * r.uniform(0.4, 1), nome='confete: papel')


# (sem cama: a música de fundo faz esse papel)
# m.add(0, base_ambiente(DUR, entra=1.0, sai=1.2), 0.05, cama=True, nome='cama ambiente')

# cena 1 — foto, anel no Diego, zoom, selos
entra(0.07, 420, 0.26)
m.add(0.82, pop(900, 0.25, 0.2), 0.16, nome='anel: pop')
m.add(0.86, vidro(E6, 1.2, 0.8), 0.10, nome='anel: brilho')
m.add(1.25, whoosh(1.0, 350, 2400, pico=0.6, q=1.2), 0.26, nome='zoom no Diego')
entra(2.32, 760, 0.2, pan=0.4)
entra(4.1, 640, 0.2, pan=-0.4)
m.add(4.3, acorde_sucesso(C6, pan=-0.3), 0.14, nome='parceiro certo: check')
m.add(4.98, whoosh(0.7, 2600, 400, pico=0.4, q=1.1), 0.22, nome='foto vira avatar')

# cena 2 — faturamento
teclas([5.2, 5.58, 5.9, 6.04, 6.26])
for i in range(6):
    m.add(5.95 + 0.85 * i / 5, tick(1800 + 160 * i, 0.03, pan=-0.5 + 0.2 * i), 0.07, nome='mês')
m.add(6.78, whoosh(0.6, 400, 3000, pico=0.5, q=1.1), 0.26, nome='cartão: sopro')
m.add(6.9, pop(380, 0.4, 1.0), 0.26, nome='cartão: pop')
m.add(6.95, baque(0.5, 58), 0.16, nome='cartão: grave')
contador(7.66, 0.9, 0, 1, quintOut, 10)
contador(10.08, 1.3, 0, 1, cubicInOut, 18, f0=2400, f1=4200)
confete_som(11.38)
m.add(11.0, pop(820, 0.3, 0.3, pan=0.4), 0.2, nome='bolha Uau')
m.add(11.05, vidro(G6, 1.3, 1.0, pan=0.4), 0.12, nome='bolha: brilho')
m.add(11.22, pop(700, 0.3, 0.3, pan=0.3), 0.16, nome='+400%')
m.add(11.25, acorde_sucesso(D6, pan=0.3), 0.12, nome='+400%: sucesso')

# cena 3 — azul, metodologia
sai(11.6)
troca_azul(11.7)
m.add(11.8, ar(1.6, 1800), 0.10, nome='arco')
teclas([12.5, 12.62, 12.68, 12.84, 13.04, 13.34])
m.add(13.52, whoosh(0.5, 500, 2800, pico=0.7, q=1.0), 0.22, nome='metodologia: ar')
m.add(13.6, baque(0.6, 50), 0.26, nome='metodologia: grave')
m.add(13.62, vidro(A6, 1.6, 1.0), 0.10, nome='metodologia: brilho')
m.add(13.25, ar(1.8, 1600), 0.08, nome='arco')
teclas([14.12, 14.26, 14.52])
m.add(14.55, acorde_sucesso(E6), 0.18, nome='funciona: check')

# cena 4 — mil SaaS
sai(15.0)
troca_azul(15.16, ida=False)
for i in range(20):
    ordem = math.hypot(i % 5 - 2, i // 5 - 1.5)
    m.add(15.3 + ordem * 0.09 + 0.03, pop(700 + 40 * (i % 7), 0.18, 0.15, pan=((i % 5) - 2) * 0.3), 0.07, nome='ícone')
contador(15.5, 0.95, 0, 1, quintOut, 14, ganho=0.05)
m.add(16.85, whoosh(0.8, 600, 2400, pico=0.5, q=1.0), 0.22, nome='ícones se arrumam')

# cena 5 — 5 SaaS próprios, 1 milhão por mês
teclas([16.95, 17.18, 17.44, 17.7])
for i, f in enumerate([C6, D6, E6, G6, A6]):
    m.add(18.42 + i * 0.1, pop(f * 0.5, 0.25, 0.25, pan=-0.6 + 0.3 * i), 0.15, nome=f'SaaS {i + 1}')
teclas([18.42, 18.74, 19.06], 0.12)
m.add(19.46, whoosh(0.5, 2400, 400, pico=0.3, q=1.0), 0.18, nome='4 ícones saem')
m.add(19.55, pop(330, 0.45, 1.0), 0.26, nome='o do meio cresce')
m.add(19.6, vidro(C7, 1.4, 0.9), 0.10, nome='cresce: brilho')
teclas([19.52, 19.84, 20.12, 20.56])
for k, tt in enumerate([20.62, 20.98, 21.28, 21.56, 21.84, 22.08]):
    m.add(tt, vidro([E6, G6, E6, A6, G6, C7][k], 0.7, 0.7, pan=0.2), 0.11, nome='notificação')
    m.add(tt + 0.02, pop(900, 0.18, 0.1), 0.08, nome='notificação: pop')
contador(20.76, 0.95, 0, 1, quintInOut, 16, ganho=0.05, f0=2600, f1=4400)
m.add(21.72, acorde_sucesso(G6 / 2), 0.14, nome='1 milhão: sucesso')
teclas([21.94, 22.1], 0.12)

# cena 6 — vejo → VIVO
sai(22.3)
troca_azul(22.42)
m.add(22.5, ar(1.7, 1700), 0.09, nome='arco')
teclas([22.82, 23.18, 23.42, 24.02, 24.44, 24.54, 24.66])
m.add(24.2, ar(1.6, 1500), 0.08, nome='arco')
m.add(25.1, whoosh(0.6, 2000, 600, pico=0.3, q=1.0), 0.14, nome='linha sobe')
m.add(25.2, zip_linha(0.45, 900, 1800), 0.12, nome='risco no vejo')
teclas([25.22, 25.28, 25.5, 25.6, 25.66], 0.13)
m.add(25.74, whoosh(0.4, 600, 3500, pico=0.8, q=1.0), 0.24, nome='VIVO: ar')
m.add(25.8, baque(0.7, 46), 0.34, nome='VIVO: grave')
m.add(25.82, vidro(C7, 1.8, 1.0), 0.13, nome='VIVO: brilho')

# cena 7 — softwares + parceiros → seu SaaS → outro patamar
sai(25.96)
troca_azul(26.02, ida=False)
teclas([26.44, 26.52, 26.62, 26.74])
entra(27.54, 560, 0.2, pan=-0.5)
entra(28.64, 620, 0.2, pan=0.5)
curva = np.array([cubicInOut(p) for p in np.linspace(0, 1, 300)])
m.add(29.4, zip_linha(0.6, 500, 1100, curva), 0.12, nome='conectores')
m.add(29.42, pop(360, 0.45, 1.0), 0.26, nome='seu SaaS: pop')
m.add(29.5, vidro(D6, 1.2, 0.8), 0.10, nome='seu SaaS: brilho')
sai(30.48)
for i in range(4):
    m.add(30.64 + i * 0.1, pop(300 + 90 * i, 0.3, 0.6, pan=-0.6 + 0.4 * i), 0.14, nome=f'degrau {i + 1}')
for i, tt in enumerate([30.92, 31.16, 31.40, 31.64]):
    m.add(tt, whoosh(0.22, 800 + 300 * i, 2600 + 500 * i, pico=0.5, q=1.4), 0.10, nome='pulo')
    m.add(tt + 0.26, pop(560 + 120 * i, 0.22, 0.4, pan=-0.6 + 0.4 * i), 0.18, nome=f'pousa {i + 1}')
teclas([31.34, 31.52], 0.14)
confete_som(31.92, 0.2)
m.add(31.92, acorde_sucesso(C6), 0.16, nome='patamar: sucesso')

# cena 8 — meta batida todo mês
sai(32.0)
teclas([32.1, 32.4, 32.72, 32.86])
entra(32.12, 520, 0.2)
m.add(32.45, zip_linha(0.85, 350, 1500, curva), 0.16, nome='barra enche')
m.add(33.3, acorde_sucesso(E6, pan=0.4), 0.2, nome='meta batida: check')
for i in range(6):
    m.add(33.18 + i * 0.07, tick(2600 + 150 * i, 0.03, pan=-0.6 + 0.24 * i), 0.09, nome=f'mês {i + 1}')

# cena 9 — CTA
troca_azul(33.9)
m.add(33.95, ar(1.6, 1700), 0.08, nome='arco')
m.add(34.0, whoosh(0.5, 400, 3000, pico=0.6, q=1.0), 0.22, nome='logo: ar')
m.add(34.08, pop(330, 0.5, 1.0), 0.28, nome='logo: pop')
m.add(34.12, vidro(G6, 1.6, 1.0), 0.12, nome='logo: brilho')
m.add(34.2, ar(0.6, 3000), 0.12, nome='marca')
entra(34.22, 600, 0.2)
m.add(34.3, whoosh(0.3, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
m.add(34.64, tick(3200, 0.03), 0.22, nome='clique')
m.add(34.72, tick(2600, 0.03), 0.14, nome='clique (solta)')
teclas([34.96, 35.08, 35.18, 35.32])
m.add(35.34, vidro(C7, 1.2, 0.9), 0.11, nome='sabe: brilho')
m.add(35.0, brilho(0.9), 0.05, nome='brilho no botão')

for t, n in sorted(m.salvar(sys.argv[1], lufs=-34)):
    if n and n not in ('tecla', 'tique contador', 'ícone'): print(f'{t:6.2f}  {n}')
