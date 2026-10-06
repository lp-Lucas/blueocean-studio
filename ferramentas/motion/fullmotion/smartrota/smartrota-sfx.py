"""SFX da SmartRota — tempos iguais aos de copy1.html / copy2.html (linha do tempo já cortada).
uso: python smartrota-sfx.py <1|2> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

copia = sys.argv[1]
m = nova({'1': 27.24, '2': 28.48}[copia])

def papel(t, dur=0.6, ganho=0.22, pan=(0, 0)):
    m.add(max(0, t), whoosh(dur, 500, 2400, pico=0.45, q=0.7, pan=pan), ganho, nome='papel desliza')
    for k in range(10):
        m.add(t + 0.05 + k * dur / 12, tick(r.uniform(2500, 5200), 0.012, pan=r.uniform(-0.3, 0.3)), ganho * 0.12, nome='papel: atrito')
def marca(t, dur, ganho=0.14):
    m.add(t, whoosh(dur, 2200, 3400, pico=0.5, q=2.2), ganho, nome='marca-texto')
def caneta(t, dur, ganho=0.12, n=None):
    n = n or int(dur / 0.045)
    for k in range(n):
        m.add(t + k * dur / n + r.uniform(-0.01, 0.01), tick(r.uniform(1800, 4200), 0.02, pan=r.uniform(-0.2, 0.2)), ganho * r.uniform(0.4, 1), nome='caneta')
def postit(t):
    m.add(t, pop(240, 0.25, 0.9), 0.24, nome='post-it bate'); m.add(t + 0.02, baque(0.25, 90), 0.12, nome='post-it: grave')
def fs_entra(t):
    m.add(t, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha'); m.add(t + 0.42, baque(0.6, 50), 0.22, nome='círculo some: grave')
def marca_expande(t0):
    m.add(t0, pop(520, 0.3, 0.8), 0.22, nome='ícone da marca pula'); m.add(t0 + 0.04, tick(1800, 0.03), 0.1, nome='ícone: clique')
    m.add(t0 + 0.6, whoosh(0.55, 500, 2800, pico=0.6, q=0.9), 0.26, nome='fundo do ícone expande'); m.add(t0 + 1.05, baque(0.5, 55), 0.18, nome='tela cheia: grave')
def fs_sai(t):
    m.add(t, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece'); m.add(t + 0.04, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')

if copia == '1':
    # gancho: lista sem ordem → mapa → primeira parada ???
    fs_entra(0.85); entra(m, 0.9, 520, 0.18)
    for k in range(8): m.add(1.05 + k * 0.1, tick(1700 + 110 * k, 0.03), 0.07, nome='endereço entra')
    for k in range(8): m.add(3.1 + k * 0.06, tick(r.uniform(2600, 3400), 0.02), 0.05, nome='ordem vira ?')
    m.add(5.0, pop(900, 0.2, 0.5), 0.1, nome='18 entregas acende')
    m.add(7.44, tick(2000, 0.03), 0.08, nome='linha 1'); m.add(8.16, tick(2200, 0.03), 0.08, nome='linha 2')
    clique(m, 9.0); m.add(9.05, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='troca de aba')
    for k in range(18): m.add(9.1 + k * 0.03, pop(r.uniform(900, 1500), 0.12, 0.4), 0.035, nome='pino')
    m.add(9.45, whoosh(0.75, 1500, 3200, pico=0.4, q=1.6), 0.08, nome='rabisco')
    m.add(10.0, pop(700, 0.25, 0.7), 0.14, nome='primeira parada ???'); impacto(m, 10.55, A6)
    fs_sai(10.85)
    # inserção: paradas na SmartRota → sequência
    entra(m, 11.02, 560, 0.2)
    for k in range(3): m.add(11.8 + k * 0.12, tick(1800 + 160 * k, 0.03), 0.08, nome='parada acende')
    m.add(12.6, pop(1000, 0.2, 0.5), 0.1, nome='logo')
    m.add(14.36, whoosh(0.6, 700, 2200, pico=0.5, q=1.0), 0.13, nome='paradas reordenam')
    for k in range(3): m.add(14.99 + k * 0.12, pop(900 + 120 * k, 0.15, 0.4), 0.08, nome='número')
    check(m, 15.34, E6, ganho=0.12); sai(m, 16.04)
    # plataforma: agora · falta · entregue · rota organizada
    fs_entra(16.39); entra(m, 16.44, 520, 0.2)
    m.add(16.64, whoosh(0.9, 1500, 3200, pico=0.4, q=1.6), 0.07, nome='rota desenha')
    m.add(17.49, pop(1000, 0.2, 0.5), 0.12, nome='agora')
    m.add(18.54, tick(1800, 0.03), 0.09, nome='faltam acende')
    clique(m, 20.94); check(m, 20.99, G6, ganho=0.15); confete_som(m, 21.04, 0.16)
    m.add(21.64, whoosh(0.85, 1500, 3200, pico=0.4, q=1.6), 0.08, nome='rota redesenha')
    for k in range(8): m.add(21.69 + k * 0.1, pop(800 + 70 * k, 0.12, 0.4), 0.05, nome='parada em ordem')
    fs_sai(23.29)
    # CTA
    entra(m, 23.44, 560, 0.24); m.add(25.59, pop(1000, 0.2, 0.5), 0.08, nome='logo')
    clique(m, 25.89); m.add(25.91, baque(0.5, 60), 0.12, nome='botão: grave')
    m.add(26.04, vidro(C7, 1.0, 0.6), 0.05, nome='brilho no botão')
elif copia == '2':
    # gancho: 60 entregas → mapa espalhado → tempo perdido → qual primeiro/depois → falta ???
    fs_entra(0.4); entra(m, 0.45, 520, 0.18)
    contador(m, 0.56, 0.95, cubicInOut, 10, ganho=0.045)
    for k in range(8): m.add(0.6 + k * 0.1, tick(1700 + 110 * k, 0.03), 0.06, nome='endereço entra')
    clique(m, 2.55); m.add(2.6, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='troca de aba')
    for k in range(0, 60, 2): m.add(2.65 + k * 0.011, pop(r.uniform(900, 1700), 0.1, 0.4), 0.03, nome='ponto no mapa')
    m.add(5.5, pop(900, 0.2, 0.5), 0.1, nome='60 entregas acende')
    m.add(6.35, pop(700, 0.25, 0.7), 0.13, nome='tempo fica vermelho'); contador(m, 6.45, 0.9, quintOut, 9, ganho=0.04)
    m.add(7.25, whoosh(0.9, 1500, 3200, pico=0.4, q=1.6), 0.08, nome='rabisco')
    m.add(9.7, pop(800, 0.22, 0.6), 0.12, nome='1º?'); m.add(10.78, pop(950, 0.22, 0.6), 0.12, nome='2º?')
    m.add(11.55, pop(700, 0.25, 0.7), 0.13, nome='falta ???'); impacto(m, 12.0, A6)
    fs_sai(12.45)
    # inserções
    entra(m, 12.6, 620, 0.22); sai(m, 13.45)
    entra(m, 13.6, 560, 0.2)
    m.add(13.85, whoosh(1.5, 1200, 2600, pico=0.6, q=1.4), 0.05, nome='importando')
    check(m, 15.45, E6, ganho=0.12)
    m.add(16.25, whoosh(1.3, 1200, 2600, pico=0.6, q=1.4), 0.05, nome='otimizando')
    check(m, 17.57, G6, ganho=0.13); sai(m, 17.95)
    # plataforma
    fs_entra(18.15); entra(m, 18.2, 520, 0.2)
    m.add(18.6, whoosh(2.0, 600, 1200, pico=0.5, q=0.8), 0.04, nome='entregador anda')
    m.add(19.95, tick(1800, 0.03), 0.09, nome='faltam acende')
    clique(m, 20.7); check(m, 20.75, G6, ganho=0.15); confete_som(m, 20.8, 0.16)
    m.add(21.38, pop(1100, 0.2, 0.5), 0.08, nome='entregue')
    m.add(22.95, whoosh(1.05, 1500, 3200, pico=0.4, q=1.6), 0.08, nome='rota do começo ao fim')
    m.add(22.98, tick(2000, 0.03), 0.08, nome='início'); m.add(23.8, tick(2300, 0.03), 0.08, nome='término')
    for k in range(9): m.add(23.0 + k * 0.1, pop(800 + 70 * k, 0.12, 0.4), 0.05, nome='parada em ordem')
    fs_sai(24.55)
    # CTA
    entra(m, 24.65, 560, 0.24); m.add(26.75, pop(1000, 0.2, 0.5), 0.08, nome='logo')
    clique(m, 27.2); m.add(27.22, baque(0.5, 60), 0.12, nome='botão: grave')
    m.add(27.35, vidro(C7, 0.9, 0.6), 0.05, nome='brilho no botão')

salvar(m, sys.argv[2])
