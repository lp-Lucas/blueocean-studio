"""SFX do full motion "reveal do Claude" — tempos iguais aos do objeto T do claude.html.
uso: python claude-sfx.py <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

m = nova(26.2)
m.add(0.0, whoosh(1.2, 300, 1400, pico=0.6, q=1.0), 0.1, nome='abertura: câmera empurra')

# 1 · pedido + leitura
digitar(m, 0.05, 23, (1.10 - 0.05) / 23, ganho=0.14, semente=1)
m.add(0.82, whoosh(0.3, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 1.35)
m.add(1.37, baque(0.4, 60), 0.12, nome='envio: grave')
m.add(1.46, whoosh(0.22, 900, 5200, pico=0.55, q=1.1), 0.2, nome='corte: conversa')
m.add(1.62, ar(1.7, 2200), 0.05, nome='faísca girando')
contador(m, 1.62, 1.7, lambda p: p, 24, ganho=0.035, f0=2000, f1=3600)
check(m, 3.37, E6, ganho=0.12)

# 2 · resposta + painel + linha 214
teclas(m, [3.42, 3.6, 3.78], 0.1)
m.add(3.62, whoosh(0.5, 2600, 700, pico=0.5, q=1.0, pan=(0.6, 0.0)), 0.16, nome='painel entra')
m.add(4.25, zip_linha(0.7, 500, 1700), 0.07, nome='rolagem até a 214')
m.add(4.99, pop(700, 0.3, 0.5), 0.16, nome='linha 214 acende')
m.add(5.0, whoosh(0.35, 1200, 3800, pico=0.4, q=1.4), 0.1, nome='marca-texto')
m.add(5.18, tick(3000, 0.03), 0.14, nome='contorno no 9.3')
entra(m, 5.42, 620, 0.2)
for i, tc in enumerate([6.35, 6.95, 7.51]):
    m.add(tc - 0.03, baque(0.25, 90), 0.1, nome='carimbo')
    m.add(tc - 0.02, pop(500 + 90 * i, 0.22, 0.6), 0.12, nome='carimbo: pop')
m.add(7.95, whoosh(0.6, 2200, 600, pico=0.5, q=1.0), 0.14, nome='câmera abre')

# 3 · rascunho colado → e-mail reescrito → copiar
m.add(8.45, whoosh(0.4, 2400, 600, pico=0.5, q=1.0), 0.12, nome='câmera desce até a caixa')
m.add(8.7, tecla(0.4), 0.16, nome='Ctrl+V')
entra(m, 8.72, 560, 0.18)
digitar(m, 8.95, 17, (9.75 - 8.95) / 17, ganho=0.14, semente=3)
m.add(9.42, whoosh(0.3, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 9.93)
m.add(9.95, baque(0.4, 60), 0.12, nome='envio: grave')
m.add(10.04, whoosh(0.22, 900, 5200, pico=0.55, q=1.1), 0.2, nome='corte: e-mail')
m.add(10.35, ar(3.0, 2600), 0.04, nome='escrevendo')
for i in range(14):
    m.add(10.4 + i * 0.21, tick(1800 + 60 * (i % 5), 0.015, pan=0.2), 0.035, nome='tique de escrita')
m.add(13.45, whoosh(0.6, 2200, 600, pico=0.45, q=1.0), 0.12, nome='câmera abre')
m.add(14.0, whoosh(0.35, 800, 2600, pico=0.4, q=1.0), 0.08, nome='câmera no copiar')
clique(m, 14.45)
check(m, 14.5, G6, ganho=0.14)

# 4 · madrugada
m.add(14.85, whoosh(0.5, 2400, 300, pico=0.5, q=1.0), 0.16, nome='escurece')
m.add(15.15, baque(0.9, 42), 0.2, nome='noite: grave')
contador(m, 16.5, 0.75, quintInOut, 9, ganho=0.05, f0=1500, f1=2600)
m.add(17.2, whoosh(0.45, 2400, 700, pico=0.45, q=1.0), 0.12, nome='câmera desce até a caixa')
digitar(m, 17.55, 44, (19.35 - 17.55) / 44, ganho=0.13, semente=4)
m.add(18.95, whoosh(0.3, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 19.48)
m.add(19.5, baque(0.4, 60), 0.12, nome='envio: grave')
m.add(19.58, whoosh(0.22, 900, 5200, pico=0.55, q=1.1), 0.2, nome='corte: resposta')
m.add(19.66, ar(0.5, 2000), 0.05, nome='pensando')
m.add(20.15, pop(380, 0.35, 0.9), 0.2, nome='"Ainda não."')
m.add(20.17, baque(0.35, 70), 0.1, nome='"Ainda não.": grave')
for t in (21.2, 21.6, 22.0):
    m.add(t, pop(640, 0.22, 0.4), 0.09, nome='tópico')

# 5 · logo
m.add(22.58, whoosh(0.4, 500, 5000, pico=0.9, q=1.0), 0.26, nome='mergulho na faísca')
m.add(22.88, baque(0.9, 44), 0.28, nome='logo: grave')
m.add(22.95, vidro(C7, 2.0, 1.0), 0.12, nome='faísca: brilho')
m.add(23.33, pop(620, 0.35, 0.8), 0.16, nome='faísca: mola')
m.add(23.95, whoosh(0.7, 900, 2800, pico=0.4, q=1.0), 0.12, nome='nome sai de trás')
check(m, 24.02, E6, ganho=0.1)
entra(m, 24.45, 700, 0.16)

salvar(m, sys.argv[1])
