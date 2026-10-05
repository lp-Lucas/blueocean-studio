"""SFX da vinheta das aulas — tempos iguais aos do aulas.html.
uso: python aulas-sfx.py <saida.wav> [n_palavras_do_titulo] [fim]   (fim = vinheta de fim de módulo)"""
import sys, os
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from sfx import *
from sfx import _t, _st, _passa_banda, _passa_baixa

DUR = 6.0
CRISTA, MARCA, SOBE, MODULO, AULA, SAI = 0.75, 1.45, 2.55, 2.85, 3.15, 5.55
N = int(sys.argv[2]) if len(sys.argv) > 2 else 3
FIM = len(sys.argv) > 3 and sys.argv[3] == 'fim'
CHECK = 3.2
r = np.random.default_rng(11)


m = Mixagem(DUR)
# revelação do símbolo: puxada que sobe + impacto
m.add(0, whoosh(CRISTA, 220, 2600, pico=0.85, q=0.9, corpo=0.5), 0.20, nome='crista: subida')
m.add(CRISTA, baque(1.0, 46), 0.42, nome='revela: grave')
m.add(CRISTA, vidro(880, 2.0, 1.0), 0.10, nome='revela: brilho')
m.add(CRISTA + 0.02, vidro(1318.5, 1.8, 0.9, pan=0.3), 0.07, nome='revela: brilho 2')
m.add(CRISTA + 0.05, brilho(1.2), 0.10, nome='revela: cintilar')
# BLUE OCEAN letra a letra
m.add(MARCA, whoosh(0.6, 400, 1600, pico=0.6, q=1.1, pan=(-0.3, 0.3)), 0.12, nome='símbolo vai para a esquerda')
for i in range(9):
    m.add(MARCA + 0.25 + i * 0.055, tick(2000 + 90 * i, 0.03, pan=-0.2 + i * 0.05), 0.07, nome='letra')
m.add(MARCA + 0.9, acorde_sucesso(660), 0.06, nome='logo completo')
# logo sobe
m.add(SOBE - 0.2, whoosh(0.8, 1600, 500, pico=0.5, q=1.0), 0.12, nome='logo sobe')
if FIM:
    # check: anel se desenha, risco do check, onda de luz + acorde de conquista
    m.add(CHECK, zip_linha(0.5, 500, 1300), 0.07, nome='anel do check')
    m.add(CHECK + 0.68, pop(880, 0.3, 0.4), 0.16, nome='check')
    m.add(CHECK + 0.7, acorde_sucesso(784), 0.11, nome='conquista')
    m.add(CHECK + 0.7, vidro(1568, 1.4, 0.8), 0.05, nome='onda de luz')
    for i in range(N):
        m.add(CHECK + 0.45 + i * 0.12, pop(520 + 60 * i, 0.3, 0.6), 0.12, nome=f'palavra {i + 1}')
    m.add(CHECK + 0.85, baque(0.8, 55), 0.16, nome='título: grave')
    m.add(CHECK + 1.0, pop(620, 0.25, 0.2), 0.07, nome='linha de baixo')
else:
    # módulo e aula
    m.add(MODULO, pop(700, 0.3, 0.3), 0.14, nome='módulo')
    for i in range(N):
        m.add(AULA + i * 0.12, pop(520 + 60 * i, 0.3, 0.6), 0.12, nome=f'palavra {i + 1}')
    m.add(AULA + 0.4, baque(0.8, 55), 0.18, nome='título: grave')
# saída
m.add(SAI - 0.1, whoosh(0.8, 1800, 300, pico=0.4, q=0.9), 0.12, nome='saída')

for t, n in sorted(m.salvar(sys.argv[1], lufs=-18)):
    if n != 'letra': print(f'{t:6.2f}  {n}')
