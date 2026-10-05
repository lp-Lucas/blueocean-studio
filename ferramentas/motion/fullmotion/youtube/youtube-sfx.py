"""SFX do full motion "reveal do YouTube" — tempos iguais aos do youtube.html.
uso: python youtube-sfx.py <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

m = nova(20.6)
# [foco no campo, início/fim da digitação, nº de letras, envio, corte p/ resultados, clique no 1º, vira player]
BUSCAS = [(None, 0.10, 0.98, 24, 1.14, 1.28, 2.06, 2.14),
          (2.88, 3.02, 3.80, 26, 3.92, 4.00, 4.58, 4.66),
          (7.60, 7.74, 8.58, 28, 8.70, 8.78, 9.08, 9.16),
          (11.96, 12.08, 12.64, 20, 12.74, 12.82, 13.08, 13.16)]

m.add(0.0, whoosh(1.0, 300, 1500, pico=0.6, q=1.0), 0.12, nome='abertura: câmera empurra')
for k, (foco, a, b, n, env, res, clk, mm) in enumerate(BUSCAS):
    if foco is not None:
        m.add(foco - 0.24, whoosh(0.4, 2400, 600, pico=0.5, q=1.0), 0.18, nome='câmera sobe até a busca')
        clique(m, foco)
    digitar(m, a, n, (b - a) / n, ganho=0.16, semente=k)
    m.add(a + 0.14, pop(900, 0.2, 0.3), 0.07, nome='sugestões abrem')
    if k == 0:
        m.add(0.84, whoosh(0.3, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
        m.add(0.98, whoosh(0.3, 900, 3000, pico=0.5, q=1.2), 0.12, nome='câmera até a lupa')
        clique(m, env)
    else:
        m.add(env, tecla(0.8), 0.24, nome='Enter')
    m.add(res - 0.06, whoosh(0.22, 900, 5200, pico=0.55, q=1.1), 0.2, nome='corte: resultados')
    m.add(res, tick(5200, 0.012), 0.08, nome='corte: estalo')
    for i in range(3):
        m.add(res + 0.06 + i * 0.07, pop(560 + 80 * i, 0.25, 0.5, pan=-0.2 + 0.2 * i), 0.1, nome='resultado sobe')
    m.add(clk - 0.5, whoosh(0.3, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
    m.add(clk - 0.4, tick(2600, 0.02), 0.05, nome='prévia começa')
    clique(m, clk)
    m.add(mm, whoosh(0.45, 600, 3800, pico=0.5, q=1.0), 0.2, nome='thumb vira player')
    m.add(mm + 0.08, baque(0.5, 58), 0.2, nome='player: grave')
    m.add(mm + 0.38, pop(700, 0.3, 0.5), 0.14, nome='play')

# 2 · barra de progresso andando; troca de capítulo
m.add(5.45, whoosh(0.6, 2200, 700, pico=0.5, q=1.0), 0.14, nome='câmera desce até a barra')
m.add(6.0, zip_linha(1.6, 600, 1100), 0.05, nome='barra andando')
m.add(6.88, pop(980, 0.22, 0.3), 0.1, nome='capítulo novo')
m.add(6.80, whoosh(0.6, 700, 2200, pico=0.4, q=1.0), 0.12, nome='câmera abre')

# 3 · comentários rolando
m.add(9.66, whoosh(0.7, 2400, 600, pico=0.5, q=1.0), 0.16, nome='página desce')
for i in range(12):
    m.add(10.3 + i * 0.11, tick(1700 + 60 * (i % 3), 0.02, pan=-0.2), 0.05, nome='rolagem')
m.add(11.52, whoosh(0.45, 700, 2600, pico=0.5, q=1.0), 0.14, nome='página volta ao topo')

# 4 · Inscrever-se → Inscrito
m.add(13.68, whoosh(0.5, 2200, 700, pico=0.5, q=1.0), 0.14, nome='câmera no canal')
m.add(13.8, whoosh(0.3, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 14.36)
check(m, 14.40, E6, ganho=0.17)
m.add(14.42, vidro(G6, 1.3, 1.0), 0.1, nome='inscrito: brilho')
m.add(14.45, tick(4200, 0.02), 0.06, nome='sininho')

# 5 · parede de vídeos → tela limpa → logo; o play aperta no "play"
m.add(15.0, whoosh(0.9, 2600, 350, pico=0.6, q=0.9), 0.24, nome='afasta: parede')
for i in range(14):
    m.add(15.17 + i * 0.04, tick(1500 + 110 * i, 0.025, pan=-0.7 + 0.1 * i), 0.05, nome='vídeo entra')
m.add(15.3, ar(1.8, 1600), 0.05, nome='parede deriva')
m.add(17.12, whoosh(0.4, 600, 3600, pico=0.8, q=1.0), 0.22, nome='vídeos se recolhem')
m.add(17.34, whoosh(0.5, 3000, 900, pico=0.4, q=0.9), 0.14, nome='tela limpa abre')
m.add(17.44, baque(0.9, 44), 0.34, nome='logo: grave')
m.add(17.46, pop(620, 0.35, 0.8), 0.18, nome='logo: pop')
m.add(17.5, vidro(C7, 2.0, 1.0), 0.13, nome='logo: brilho')
teclas(m, [17.8 + i * 0.05 for i in range(7)], 0.08)
clique(m, 18.88)
impacto(m, 18.9, E6)

salvar(m, sys.argv[1])
