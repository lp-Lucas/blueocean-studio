"""SFX do full motion "reveal do Blue Ocean Studio" — tempos iguais aos do studio.html.
uso: python studio-sfx.py <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

m = nova(35.0)

# 1 ─ você digita no input; cortes de câmera; clica; a mensagem sobe, vira luz e sai o criativo
m.add(0.0, whoosh(0.9, 300, 1600, pico=0.6, q=1.0), 0.12, nome='input: câmera desliza')
digitar(m, 0.05, 32, 1.5 / 32, ganho=0.16)
m.add(0.56, whoosh(0.22, 900, 5200, pico=0.55, q=1.1), 0.22, nome='corte de câmera')
m.add(0.62, tick(5200, 0.012), 0.08, nome='corte: estalo')
m.add(1.52, whoosh(0.22, 900, 5200, pico=0.55, q=1.1), 0.22, nome='corte de câmera')
m.add(1.58, tick(5200, 0.012), 0.08, nome='corte: estalo')
m.add(1.62, whoosh(0.3, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 1.92)
m.add(1.94, baque(0.35, 70), 0.14, nome='clique: empurra')
m.add(1.98, whoosh(0.5, 700, 4600, pico=0.45, q=1.1), 0.28, nome='mensagem sobe')
m.add(2.34, vidro(E6, 1.0, 1.0), 0.13, nome='vira luz')
m.add(2.46, whoosh(0.35, 1200, 6000, pico=0.1, q=0.8), 0.2, nome='luz estoura')
m.add(2.48, baque(0.9, 46), 0.34, nome='criativo: grave')
m.add(2.52, pop(660, 0.4, 0.8), 0.2, nome='criativo: pop')
check(m, 2.98, G6, ganho=0.16)
m.add(3.26, whoosh(0.3, 600, 5000, pico=0.8, q=1.0), 0.26, nome='mergulho no criativo')

# 2 ─ a marca; depois o editor se monta peça por peça e o pedido é enviado no chat
m.add(3.42, whoosh(0.5, 600, 3600, pico=0.8, q=1.0), 0.24, nome='logo: ar')
m.add(3.52, baque(0.9, 44), 0.36, nome='logo: grave')
m.add(3.56, vidro(C7, 2.2, 1.0), 0.16, nome='logo: brilho')
teclas(m, [4.12, 4.34, 4.66], 0.12)
m.add(5.0, whoosh(0.6, 1800, 600, pico=0.5, q=1.0), 0.16, nome='logo sobe')
m.add(5.15, whoosh(1.0, 300, 2600, pico=0.4, q=0.9), 0.24, nome='editor chega')
for i, (t, p) in enumerate([(5.2, 0), (5.3, -0.7), (5.4, 0), (5.55, 0), (5.62, 0.7)]):
    m.add(t + 0.05, pop(480 + 70 * i, 0.3, 0.6, pan=p), 0.13, nome='painel encaixa')
for i in range(6):
    m.add(5.5 + i * 0.06, tick(2000 + 120 * i, 0.025, pan=-0.6), 0.05, nome='mídia')
m.add(5.48, whoosh(0.5, 2600, 600, pico=0.5, q=1.0), 0.2, nome='zoom no chat')
digitar(m, 5.7, 22, 0.66 / 22, ganho=0.15)
m.add(6.0, whoosh(0.3, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 6.45)
m.add(6.5, whoosh(0.4, 900, 3800, pico=0.3, q=1.2), 0.14, nome='mensagem enviada')

# 3 ─ câmera no preview: gancho, legenda, light leak; depois os cortes na linha do tempo
m.add(6.55, whoosh(0.6, 2400, 500, pico=0.5, q=1.0), 0.2, nome='mergulho no preview')
m.add(7.06, whoosh(0.4, 800, 3000, pico=0.5, q=1.4), 0.2, nome='tela divide')
m.add(7.1, pop(560, 0.3, 0.7), 0.16, nome='gancho')
for i in range(8):
    m.add(7.74 + i * 0.28, tick(2200 + 80 * (i % 3), 0.02), 0.07, nome='palavra da legenda')
m.add(8.5, whoosh(0.7, 400, 5000, pico=0.45, q=0.8), 0.22, nome='light leak')
m.add(8.55, vidro(C7, 1.2, 1.0), 0.1, nome='light leak: brilho')
m.add(8.9, whoosh(0.5, 2200, 600, pico=0.5, q=1.0), 0.18, nome='câmera desce')
m.add(9.15, zip_linha(0.9, 500, 1600), 0.1, nome='agulha corre')
for t in (9.42, 9.6, 9.8, 9.97):
    m.add(t, tick(3800, 0.02), 0.2, nome='corte')
    m.add(t + 0.01, pop(1200, 0.15, 0.2), 0.08, nome='corte: estalo')
sai(m, 10.0)
m.add(10.12, zip_linha(0.35, 1400, 700), 0.08, nome='vão fecha')
check(m, 10.4, A6, ganho=0.12)

# 4 ─ o agente executa (um passo por vez) e o preview ao vivo do lado
m.add(10.5, whoosh(0.6, 2600, 700, pico=0.5, q=1.0), 0.18, nome='câmera no chat')
for i, t in enumerate([10.94, 11.24, 11.58, 12.0, 12.4]):
    m.add(t, pop(700 + 60 * i, 0.25, 0.4), 0.12, nome=f'passo {i + 1}')
    m.add(t + 0.28, tick(2400 + 200 * i, 0.03), 0.1, nome='check do passo')
digitar(m, 12.78, 14, 0.75 / 14, ganho=0.06)
check(m, 12.85, E6, ganho=0.14)
m.add(12.95, whoosh(0.8, 2600, 400, pico=0.4, q=1.0), 0.22, nome='afasta: preview e chat')
m.add(13.6, pop(880, 0.3, 0.5), 0.16, nome='ao vivo')
m.add(14.15, vidro(G6, 1.2, 0.8, pan=0.5), 0.1, nome='do seu lado')

# 5 ─ aba Processos: o processo novo é salvo; depois um vídeo por aba
m.add(14.8, whoosh(0.7, 2200, 500, pico=0.5, q=1.0), 0.18, nome='câmera na esquerda')
clique(m, 15.12)
m.add(15.15, whoosh(0.3, 1200, 2600, pico=0.4, q=1.5), 0.1, nome='aba desliza')
for i, t in enumerate([15.32, 15.5, 15.68, 15.9]):
    entra(m, t, 520 + 70 * i, 0.13, pan=-0.3)
m.add(16.3, vidro(E6, 1.4, 1.0), 0.14, nome='processo novo: brilho')
check(m, 16.45, E6, ganho=0.16)
m.add(16.85, whoosh(0.6, 500, 2600, pico=0.5, q=1.0), 0.18, nome='câmera nas abas')
for i in range(4):
    t = 17.15 + i * 0.22
    clique(m, t)
    m.add(t + 0.03, pop(620 + 70 * i, 0.25, 0.5, pan=-0.3 + 0.2 * i), 0.12, nome='aba nova')
check(m, 18.0, G6, ganho=0.12)
sai(m, 18.45)

# 6 ─ o pedido no chat (full motion de 2 min), envia, o agente trabalha, a tarefa conclui em 10 min; close na frase
m.add(18.41, whoosh(0.22, 900, 5200, pico=0.55, q=1.1), 0.22, nome='corte de câmera')
m.add(18.47, tick(5200, 0.012), 0.08, nome='corte: estalo')
m.add(18.5, whoosh(0.6, 400, 1800, pico=0.5, q=1.0), 0.12, nome='câmera desce até o input')
digitar(m, 19.05, 26, 1.25 / 26, ganho=0.16)
m.add(18.6, whoosh(0.7, 1800, 500, pico=0.5, q=1.0), 0.14, nome='câmera chega no input')
m.add(20.2, whoosh(0.55, 900, 2600, pico=0.5, q=1.0), 0.1, nome='câmera corre até o botão')
m.add(20.5, whoosh(0.3, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 20.95)
m.add(20.97, baque(0.35, 70), 0.14, nome='clique: empurra')
m.add(21.0, whoosh(0.5, 2400, 600, pico=0.4, q=1.0), 0.22, nome='abre: chat trabalhando')
entra(m, 21.1, 700, 0.16)
contador(m, 21.2, 0.82, cubicInOut, 20, ganho=0.07)
for i, t in enumerate([21.3, 21.58, 21.84]):
    m.add(t, pop(700 + 60 * i, 0.25, 0.4), 0.11, nome='passo')
impacto(m, 22.02, C7)
check(m, 22.05, E6, ganho=0.16)
confete_som(m, 22.03)
m.add(22.45, whoosh(0.6, 2400, 600, pico=0.4, q=1.0), 0.16, nome='fecha na frase')
m.add(22.75, vidro(E6, 1.4, 0.9), 0.1, nome='uma frase: brilho')
m.add(24.04, whoosh(0.3, 600, 5000, pico=0.8, q=1.0), 0.24, nome='mergulho')

# 7 ─ menos horas, menos custo; mais criativos, todos no padrão
entra(m, 24.44, 560, 0.2, pan=-0.3)
for i in range(5):
    m.add(24.85 + i * 0.12, tick(1800 + 140 * i, 0.03), 0.08, nome='barra')
m.add(25.3, zip_linha(0.5, 1400, 500), 0.08, nome='barras descem')
check(m, 25.4, E6, ganho=0.12)
entra(m, 26.02, 620, 0.2, pan=0.3)
m.add(26.3, zip_linha(0.8, 1300, 450), 0.08, nome='curva desce')
check(m, 26.9, G6, ganho=0.12)
sai(m, 27.1)
m.add(27.2, whoosh(1.0, 300, 2600, pico=0.5, q=0.9), 0.26, nome='parede de criativos')
for i in range(12):
    m.add(27.25 + i * 0.05, tick(1500 + 90 * i, 0.03, pan=-0.6 + 0.1 * i), 0.06, nome='criativo')
teclas(m, [27.50, 27.88, 28.40, 28.58, 29.06, 29.34, 29.52])
for i in range(12):
    m.add(29.34 + i * 0.045, tick(2800 + 120 * i, 0.025, pan=-0.6 + 0.1 * i), 0.07, nome='check')
confete_som(m, 29.4, 0.18)
sai(m, 29.95)

# 8–9 ─ logo final e frase da marca
m.add(29.95, whoosh(1.0, 250, 3000, pico=0.7, q=0.9), 0.26, nome='horizonte sobe')
m.add(30.02, baque(1.2, 42), 0.4, nome='logo final: grave')
m.add(30.1, vidro(C7, 3.0, 1.0), 0.18, nome='logo final: brilho')
m.add(30.12, vidro(G6, 2.6, 0.8, pan=-0.3), 0.1, nome='logo final: brilho 2')
teclas(m, [30.12, 30.48, 30.86], 0.12)
teclas(m, [31.54, 32.10, 32.26, 32.76, 33.12], 0.1)
impacto(m, 33.44, E6)
entra(m, 33.9, 640, 0.16)

salvar(m, sys.argv[1])
