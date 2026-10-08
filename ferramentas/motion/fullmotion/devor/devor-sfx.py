"""SFX da Devor — tempos iguais aos de copy1..3.html (linha do tempo já cortada).
uso: python devor-sfx.py <1..3> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

SAI = lambda p: 1 - (1 - p) ** 3   # mesma curva do contador da página (cubicOut)
copia = sys.argv[1]
m = nova({'1': 37.5, '2': 30.96, '3': 30.6}[copia])   # linha ANTIGA; o corte novo é aplicado depois (warp_sfx.py)

def fs_entra(t):
    m.add(t, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha'); m.add(t + 0.42, baque(0.6, 50), 0.22, nome='círculo some: grave')
def fs_sai(t):
    m.add(t, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece'); m.add(t + 0.04, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')
def marca_expande(t0):
    m.add(t0, pop(520, 0.3, 0.8), 0.22, nome='ícone da marca pula'); m.add(t0 + 0.04, tick(1800, 0.03), 0.1, nome='ícone: clique')
    m.add(t0 + 0.6, whoosh(0.55, 500, 2800, pico=0.6, q=0.9), 0.26, nome='fundo do ícone expande'); m.add(t0 + 1.05, baque(0.5, 55), 0.18, nome='tela cheia: grave')
def linhas(t0, n, passo, f=1700):
    for k in range(n): m.add(t0 + k * passo, tick(f + 140 * k, 0.03), 0.08, nome='linha entra')
def acende(t, f=1000):
    m.add(t, pop(f, 0.2, 0.5), 0.1, nome='acende')
def troca(t):
    clique(m, t); m.add(t + 0.07, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='troca de aba')
def problema(t):
    m.add(t, pop(650, 0.25, 0.7), 0.14, nome='problema'); impacto(m, t + 0.02, A6)
def risco(t, d=0.6):
    m.add(t, whoosh(d, 1200, 2800, pico=0.5, q=1.4), 0.1, nome='traço se desenha')
def rompe(t):
    impacto(m, t, A6); m.add(t, whoosh(0.3, 2000, 600, pico=0.4, q=1.4), 0.12, nome='linha rompe')
def notif(t):
    m.add(t, pop(1400, 0.18, 0.5), 0.14, nome='notificação'); m.add(t + 0.08, vidro(E6, 0.6, 0.5), 0.06, nome='notificação: brilho')
def logo(t, tsai):
    entra(m, t, 620, 0.22); sai(m, tsai)
def ins(t, tsai):
    entra(m, t, 560, 0.2); sai(m, tsai)
def cta(tc, ent):
    entra(m, ent, 560, 0.24); clique(m, tc); m.add(tc + 0.02, baque(0.5, 60), 0.12, nome='botão: grave')
    for t in (tc + 0.15, tc + 1.75): m.add(t, vidro(C7, 1.2, 0.6), 0.05, nome='brilho no botão')
def tecla(t0, n, d):
    for k in range(n): m.add(t0 + k * d / n, tick(2600 + 90 * (k % 3), 0.02), 0.06, nome='tecla')

def bal(t):
    m.add(t, pop(1250, 0.16, 0.5), 0.12, nome='balão chega'); m.add(t + 0.03, tick(2100, 0.02), 0.05, nome='balão: clique')

if copia == '1':
    fs_entra(0.95); entra(m, 1.0, 520, 0.18); linhas(1.15, 5, 0.1); problema(1.38)
    for t in (4.04, 4.74, 6.28): bal(t); problema(t + 0.12)
    fs_sai(7.85)
    ins(7.95, 11.6); linhas(8.05, 3, 0.1)
    for k in range(3): acende(8.86 + 0.12 * k, 1000 + 80 * k)
    problema(9.94)
    ins(11.7, 16.55); risco(13.3, 1.6); m.add(15.48, pop(650, 0.25, 0.7), 0.12, nome='objeção pulsa'); check(m, 16.2, G6, ganho=0.14)
    fs_entra(16.6); entra(m, 16.65, 520, 0.2); linhas(16.85, 4, 0.12); troca(18.5); linhas(18.75, 3, 0.12); contador(m, 18.75, 0.8, SAI, 6)
    m.add(19.56, pop(900, 0.2, 0.5), 0.1, nome='onde cedeu'); problema(20.94); acende(21.32, 900); fs_sai(21.65)
    ins(21.75, 27.25); linhas(21.85, 2, 0.12); acende(22.56, 1000); acende(23.22, 1100)
    for k, t in enumerate((24.72, 25.98, 26.58)): check(m, t, E6 if k % 2 == 0 else G6, ganho=0.09)
    ins(27.3, 31.55); linhas(27.4, 2, 0.1); contador(m, 27.84, 2.6, SAI, 10); check(m, 31.06, G6, ganho=0.12)
    ins(31.65, 34.75); linhas(31.75, 2, 0.1); problema(32.06); check(m, 33.76, G6, ganho=0.14)
    cta(35.84, 34.85)
elif copia == '2':
    fs_entra(0.95); entra(m, 1.0, 520, 0.18); linhas(1.15, 3, 0.1); risco(1.02, 1.3); contador(m, 1.02, 1.3, SAI, 6); confete_som(m, 2.3, 0.14)
    contador(m, 3.02, 0.5, SAI, 5); acende(3.02, 1100)
    for k in range(2): m.add(4.86 + 0.06 * (k * 3), tick(1900 + 200 * k, 0.03), 0.08, nome='dia acende')
    fs_sai(5.12)
    ins(5.2, 8.35); acende(6.53, 1000); clique(m, 7.43); check(m, 7.5, G6, ganho=0.12)
    ins(8.45, 14.2); linhas(8.55, 3, 0.1)
    for k, t in enumerate((9.16, 10.56, 12.94)): check(m, t, E6 if k % 2 == 0 else G6, ganho=0.09)
    fs_entra(15.6); entra(m, 15.65, 520, 0.2); linhas(15.8, 4, 0.12); acende(16.6, 1100); troca(18.55); linhas(18.8, 4, 0.12)
    contador(m, 18.8, 0.9, SAI, 6); acende(19.68, 1000); problema(19.95); fs_sai(20.55)
    ins(20.6, 23.8); linhas(20.7, 2, 0.1); m.add(20.94, whoosh(0.4, 1500, 3000, pico=0.4, q=1.4), 0.1, nome='risca'); m.add(22.38, whoosh(0.4, 1500, 3000, pico=0.4, q=1.4), 0.1, nome='risca'); problema(23.44)
    ins(23.85, 27.6); linhas(23.95, 2, 0.1); check(m, 25.3, E6, ganho=0.12); contador(m, 26.14, 0.6, SAI, 5); check(m, 26.75, G6, ganho=0.12)
    cta(28.44, 27.7)
elif copia == '3':
    fs_entra(0.95); entra(m, 1.0, 520, 0.18); linhas(1.15, 7, 0.08); contador(m, 1.34, 1.6, SAI, 8); acende(3.78, 1000); fs_sai(4.62)
    ins(5.05, 9.2); risco(7.73, 1.2)
    for k, t in enumerate((7.73, 8.05, 8.39)): m.add(t, tick(1700 + 200 * k, 0.03), 0.1, nome='marco')
    check(m, 8.93, G6, ganho=0.14)
    logo(9.3, 10.0)
    marca_expande(10.17); entra(m, 11.22, 520, 0.2); linhas(11.35, 4, 0.1)
    for k in range(2): m.add(12.63 + 0.08 * k, tick(1900 + 200 * k, 0.03), 0.09, nome='dia acende')
    acende(13.35, 1100); clique(m, 14.31); m.add(14.45, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='troca de aba')
    for k in range(4): bal(14.5 + 0.1 * k)
    check(m, 16.59, G6, ganho=0.12); troca(17.3); acende(17.87, 900); fs_sai(18.4)
    fs_entra(19.4); entra(m, 19.45, 520, 0.2); linhas(19.6, 7, 0.08); problema(22.23)
    contador(m, 23.89, 1.2, SAI, 8); confete_som(m, 23.95, 0.14)
    for t in (24.21, 25.11): m.add(t, pop(1100, 0.18, 0.5), 0.1, nome='round +1')
    fs_sai(25.3)
    ins(25.4, 27.45); linhas(25.5, 2, 0.1); problema(25.6); check(m, 26.72, G6, ganho=0.14)
    cta(28.32, 27.5)

salvar(m, sys.argv[2])
