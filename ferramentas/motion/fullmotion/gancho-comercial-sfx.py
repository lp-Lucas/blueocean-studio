"""SFX do gancho do BlueCast Comercial (16:9) — tempos iguais aos do gancho-comercial.html.
uso: python gancho-comercial-sfx.py <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from fmsfx import *

m = nova(26.2)
# 1 · SDR > CEO
entra(m, 0.0, 560, 0.2, pan=-0.3)
m.add(0.62, whoosh(0.3, 600, 2600, pico=0.6, q=1.0), 0.12, nome='> entra')
impacto(m, 0.9, E6)
entra(m, 1.42, 700, 0.2, pan=0.3)
m.add(1.24, whoosh(0.3, 500, 2200, pico=0.7, q=1.0), 0.12, nome='punch-in')
# 2 · 400 mil
m.add(1.95, whoosh(0.25, 3000, 900, pico=0.2, q=1.0), 0.12, nome='corte')
entra(m, 2.0, 520, 0.22)
contador(m, 2.72, 1.2, quintInOut, 30)
confete_som(m, 3.95); check(m, 3.98, E6)
sai(m, 5.85)
# 3 · 5 min → segundos (azul)
troca_azul(m, 6.13)
arco(m, 6.25); arco(m, 7.3); arco(m, 8.2)
teclas(m, [6.3, 6.42, 6.54, 6.66, 6.78])
impacto(m, 7.4, C6)
for k in range(5): m.add(7.5 + k * 0.16, tick(2600, 0.03), 0.05, nome='relógio')
m.add(8.3, zip_linha(0.4, 600, 1300), 0.1, nome='risco 5 min')
impacto(m, 8.62, A6)
# 4 · volta + 3x
m.add(9.07, pop(480, 0.35, 0.7), 0.2, nome='vídeo volta: pop')
m.add(9.25, whoosh(0.5, 400, 2600, pico=0.5, q=1.0), 0.2, nome='vídeo volta: cresce')
entra(m, 9.75, 640, 0.2)
m.add(11.3, pop(700, 0.3, 0.6), 0.16, nome='2x'); m.add(11.66, pop(900, 0.3, 0.6), 0.18, nome='3x')
confete_som(m, 11.75); check(m, 11.78, G6)
sai(m, 12.0)
# 5 · propostas → tela clara
entra(m, 14.15, 600, 0.16, pan=-0.5); entra(m, 14.6, 680, 0.16, pan=0.5)
m.add(15.39, whoosh(0.25, 3000, 900, pico=0.2, q=1.0), 0.2, nome='corte para claro')
entra(m, 15.43, 560, 0.18, pan=-0.4)
teclas(m, [15.47, 15.75, 16.15, 16.27, 16.35], 0.12)
impacto(m, 17.02, C6); m.add(17.05, baque(0.45, 55), 0.16, nome='zero: grave')
# 6 · OTE
m.add(17.8, whoosh(0.3, 900, 3000, pico=0.3, q=1.0), 0.16, nome='volta ao vídeo')
m.add(18.95, whoosh(0.3, 500, 2200, pico=0.7, q=1.0), 0.12, nome='punch-in')
impacto(m, 18.9, E6)
m.add(19.25, zip_linha(0.4, 600, 1300), 0.11, nome='risco OTE')
teclas(m, [19.55, 19.65, 19.8, 19.95], 0.1)
# 7 · agressivo
m.add(20.36, whoosh(0.25, 3000, 900, pico=0.2, q=1.0), 0.12, nome='corte')
teclas(m, [21.1, 21.42, 21.5, 22.06, 22.18])
m.add(22.74, whoosh(0.3, 500, 2200, pico=0.7, q=1.0), 0.12, nome='punch-in')
# 8 · 95 %
teclas(m, [22.99, 23.05, 23.35, 23.51])
troca_azul(m, 23.42)
contador(m, 23.55, 0.6, quintOut, 19)
impacto(m, 23.6, C7)
confete_som(m, 24.2); check(m, 24.2, E6)
teclas(m, [24.13, 24.25, 24.59, 24.69])
arco(m, 23.55); arco(m, 24.6); arco(m, 25.2)
salvar(m, sys.argv[1])
