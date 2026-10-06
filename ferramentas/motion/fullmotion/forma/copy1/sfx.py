"""SFX da Copy 1 — mesmos tempos do copy1.html."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from fmsfx import *
m = nova(41.0)
caneta = lambda t, d, g=0.1: [m.add(t + k * d / max(1, int(d / 0.045)), tick(r.uniform(1800, 4200), 0.02), g, nome='caneta') for k in range(max(1, int(d / 0.045)))]
# abertura: mesa de papel (edital, post-it, planner)
def papel(t, dur=0.6, ganho=0.24, pan=(0, 0)):
    m.add(max(0, t), whoosh(dur, 500, 2400, pico=0.45, q=0.7, pan=pan), ganho, nome='papel desliza')
    for k in range(10): m.add(t + 0.05 + k * dur / 12, tick(r.uniform(2500, 5200), 0.012, pan=r.uniform(-0.3, 0.3)), ganho * 0.12, nome='papel: atrito')
marca = lambda t, d: m.add(t, whoosh(d, 2200, 3400, pico=0.5, q=2.2), 0.14, nome='marca-texto')
papel(0.96, 0.62, 0.26); m.add(1.58, baque(0.35, 70), 0.12, nome='folha assenta')
marca(1.72, 0.55); marca(2.3, 0.35)
m.add(3.72, pop(240, 0.25, 0.9), 0.24, nome='post-it bate'); m.add(3.74, baque(0.25, 90), 0.12, nome='post-it: grave')
caneta(3.8, 0.4, 0.14); caneta(4.6, 0.55, 0.12)
m.add(5.95, whoosh(0.4, 2600, 900, pico=0.4, q=1.0), 0.14, nome='post-it descola')
marca(7.2, 0.6); marca(8.62, 0.4)
papel(9.28, 0.6, 0.24, pan=(0.8, -0.1)); m.add(9.9, baque(0.3, 80), 0.1, nome='planner assenta')
caneta(11.6, 0.5, 0.14); caneta(12.05, 0.22, 0.12)
papel(12.38, 0.55, 0.26)
# inserções
entra(m, 13.3, 500, 0.16); m.add(13.75, whoosh(0.35, 1800, 4200, pico=0.3, q=1.6), 0.13, nome='risco'); sai(m, 14.45)
entra(m, 14.5, 560, 0.18)
for k in range(18): m.add(14.75 + k * 0.08, pop(700 + 25 * k, 0.1, 0.4), 0.05, nome='matéria')
sai(m, 16.75)
entra(m, 17.75, 520, 0.18); m.add(18.9, whoosh(1.4, 2600, 500, pico=0.5, q=1.2), 0.1, nome='confiança caindo'); sai(m, 20.65)
entra(m, 20.75, 560, 0.18); contador(m, 22.43, 1.0, quintOut, 8, ganho=0.04); contador(m, 23.53, 1.0, quintOut, 4, ganho=0.04, f0=2600, f1=3600); sai(m, 25.15)
entra(m, 25.22, 480, 0.16); m.add(26.07, whoosh(0.35, 1800, 4200, pico=0.3, q=1.6), 0.13, nome='risco esforço'); sai(m, 26.6)
entra(m, 26.68, 700, 0.18); impacto(m, 27.19, A6)
# plataforma
m.add(27.66, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha'); m.add(28.1, baque(0.6, 50), 0.22, nome='círculo some: grave')
entra(m, 28.0, 520, 0.2)
for k in range(7): m.add(29.3 + k * 0.1, tick(1700 + 110 * k, 0.03), 0.08, nome='linha entra')
contador(m, 31.0, 0.9, quintOut, 8, ganho=0.04)
for k in range(5): m.add(32.0 + k * 0.08, pop(1000 + 100 * k, 0.15, 0.4), 0.07, nome='no plano')
clique(m, 32.8); check(m, 32.86, E6, ganho=0.14)
m.add(33.0, whoosh(0.5, 900, 2600, pico=0.5, q=1.2), 0.12, nome='troca para a linha')
m.add(35.0, whoosh(1.4, 600, 2400, pico=0.6, q=1.0), 0.1, nome='semanas enchendo')
impacto(m, 36.29, E6)
m.add(37.25, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece'); m.add(37.29, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')
# CTA
entra(m, 37.3, 560, 0.24); clique(m, 37.8); m.add(37.82, baque(0.5, 60), 0.12, nome='botão: grave')
for t in (38.4, 40.0): m.add(t, vidro(C7, 1.2, 0.6), 0.05, nome='brilho no botão')
salvar(m, sys.argv[1])
