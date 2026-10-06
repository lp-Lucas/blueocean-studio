"""SFX do Forma de Estudos (Copy 3) — tempos iguais aos do forma.html (linha do tempo já cortada).
uso: python forma-sfx.py <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

m = nova(47.4)

# ── tela cheia 1: mesa de estudo (papel, marca-texto, caneta, post-it)
def papel(t, dur=0.6, ganho=0.22, pan=(0, 0)):
    m.add(max(0, t), whoosh(dur, 500, 2400, pico=0.45, q=0.7, pan=pan), ganho, nome='papel desliza')
    for k in range(10):   # fricção da folha
        m.add(t + 0.05 + k * dur / 12, tick(r.uniform(2500, 5200), 0.012, pan=r.uniform(-0.3, 0.3)), ganho * 0.12, nome='papel: atrito')
def marca(t, dur, ganho=0.14):
    m.add(t, whoosh(dur, 2200, 3400, pico=0.5, q=2.2), ganho, nome='marca-texto')
def caneta(t, dur, ganho=0.12, n=None):
    n = n or int(dur / 0.045)
    for k in range(n):
        m.add(t + k * dur / n + r.uniform(-0.01, 0.01), tick(r.uniform(1800, 4200), 0.02, pan=r.uniform(-0.2, 0.2)), ganho * r.uniform(0.4, 1), nome='caneta')
papel(0.76, 0.6, 0.26, pan=(0, 0)); m.add(1.36, baque(0.35, 70), 0.12, nome='folha assenta')
marca(0.98, 0.5); marca(1.46, 0.32); marca(2.08, 0.6)
papel(2.64, 0.55, 0.24, pan=(0.8, -0.1)); m.add(3.2, baque(0.3, 80), 0.1, nome='planner assenta')
caneta(4.86, 0.5, 0.14); caneta(5.3, 0.22, 0.12)
m.add(5.98, pop(240, 0.25, 0.9), 0.24, nome='post-it bate'); m.add(6.0, baque(0.25, 90), 0.12, nome='post-it: grave')
caneta(6.04, 0.42); caneta(6.5, 0.2, 0.16); caneta(6.62, 0.3); caneta(6.95, 0.16, 0.16); caneta(7.0, 0.3)
papel(7.32, 0.55, 0.26, pan=(0, 0))

# ── inserções
entra(m, 9.72, 620, 0.2); entra(m, 10.0, 820, 0.14, pan=0.2); sai(m, 11.0)
entra(m, 12.6, 480, 0.16)
m.add(12.98, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.14, nome='risco improviso')
sai(m, 13.45)
entra(m, 13.5, 600, 0.18)
for k in range(6): m.add(13.72 + k * 0.08, tick(1500 - 60 * k, 0.03), 0.1, nome='dia riscado')
m.add(14.2, pop(900, 0.25, 0.6), 0.12, nome='PROVA pulsa')
sai(m, 14.6)
entra(m, 14.8, 520, 0.22)
for k in range(5): m.add(15.15 + k * 0.12, tick(1600 + 150 * k, 0.03), 0.08, nome='linha do cronograma')
check(m, 15.83, E6, ganho=0.14)
for k in range(5): m.add(16.6 + k * 0.14, pop(900 + 120 * k, 0.15, 0.4), 0.06, nome='matéria')
for k in range(5): m.add(17.77 + k * 0.1, tick(2400 + 120 * k, 0.025), 0.07, nome='dia a dia')
sai(m, 18.42)
entra(m, 18.5, 640, 0.2)
clique(m, 20.62); check(m, 20.7, G6, ganho=0.12)
sai(m, 21.1)
m.add(21.8, whoosh(0.5, 2400, 700, pico=0.4, q=1.1), 0.16, nome='notificação desce')
m.add(21.9, pop(880, 0.25, 0.7), 0.2, nome='mentoria: pop')
m.add(23.34, pop(1250, 0.2, 0.5), 0.1, nome='especialista')
sai(m, 24.25)
entra(m, 24.3, 500, 0.2)
for k in range(7): m.add(24.6 + k * 0.1, pop(500 + 70 * k, 0.15, 0.4), 0.06, nome='barra sobe')
m.add(26.5, whoosh(0.45, 900, 2600, pico=0.5, q=1.2), 0.12, nome='troca para progresso')
contador(m, 26.9, 1.4, quintOut, 12, ganho=0.045)
m.add(27.88, pop(1100, 0.2, 0.5), 0.08, nome='falta 1'); m.add(28.12, pop(1250, 0.2, 0.5), 0.08, nome='falta 2')
contador(m, 29.0, 0.6, cubicInOut, 5, ganho=0.045, f0=3000, f1=3800)
check(m, 29.56, E6); confete_som(m, 29.62, 0.18)

# ── tela cheia 2: plataforma em uso
m.add(30.18, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha')
m.add(30.6, baque(0.6, 50), 0.22, nome='círculo some: grave')
entra(m, 30.5, 520, 0.22)
for k in range(4): m.add(30.9 + k * 0.1, tick(1700 + 140 * k, 0.03), 0.08, nome='alternativa entra')
m.add(32.84, pop(1000, 0.25, 0.6), 0.12, nome='padrão FGV')
clique(m, 33.28); check(m, 33.35, E6, ganho=0.16)
m.add(33.7, whoosh(0.8, 700, 2200, pico=0.5, q=1.0), 0.12, nome='explicação abre / rola')
for k, d in enumerate([0, 0.12, 0.24]): m.add(34.82 + d, tick(1300 - 80 * k, 0.04), 0.1, nome='alternativa explicada')
entra(m, 35.5, 480, 0.18)
m.add(36.0, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.15, nome='risco decoreba')
sai(m, 36.6)
entra(m, 36.72, 700, 0.2); impacto(m, 37.34, A6)
m.add(38.6, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece')
m.add(38.64, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')

# ── CTA
entra(m, 43.3, 560, 0.24)
clique(m, 43.98)
m.add(44.0, baque(0.5, 60), 0.12, nome='botão: grave')
for k in range(3): m.add(44.55 + k * 0.08, tick(2200 + 300 * k, 0.025), 0.08, nome='setas')
for t in (44.4, 46.0): m.add(t, vidro(C7, 1.2, 0.6), 0.05, nome='brilho no botão')

salvar(m, sys.argv[1])
