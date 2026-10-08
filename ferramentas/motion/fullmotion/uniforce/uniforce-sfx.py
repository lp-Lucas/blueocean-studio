"""SFX da Uniforce — tempos iguais aos de copy1..3.html (linha do tempo já cortada).
uso: python uniforce-sfx.py <1..3> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

SAI = lambda p: 1 - (1 - p) ** 3   # mesma curva do contador da página (cubicOut)
copia = sys.argv[1]
m = nova({'1': 32.23, '2': 32.66, '3': 33.37}[copia])

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

def passa_som(t):
    m.add(t, whoosh(0.7, 600, 3200, pico=0.5, q=0.9, pan=(0.6, -0.6)), 0.26, nome='troca de tela (empurra)'); m.add(t + 0.55, baque(0.4, 70), 0.1, nome='tela encaixa')
def bal(t):
    m.add(t, pop(1250, 0.16, 0.5), 0.12, nome='balão chega'); m.add(t + 0.03, tick(2100, 0.02), 0.05, nome='balão: clique')
def bal(t):
    m.add(t, pop(1250, 0.16, 0.5), 0.12, nome='balão chega'); m.add(t + 0.03, tick(2100, 0.02), 0.05, nome='balão: clique')
def etapas(ts):
    for k, t in enumerate(ts): m.add(t, tick(1700 + 180 * k, 0.03), 0.1, nome='etapa acende')

if copia == '1':
    fs_entra(1.05); entra(m, 1.1, 520, 0.18); linhas(1.15, 6, 0.07); problema(3.66)
    for t in (5.24, 5.96, 6.82, 7.9): acende(t, 1000)
    m.add(10.7, whoosh(0.5, 1800, 700, pico=0.5, q=1.2), 0.12, nome='sinais se espalham'); problema(10.98); fs_sai(11.45)
    ins(11.6, 14.7); linhas(11.7, 2, 0.12); problema(12.74); problema(13.9)
    ins(14.9, 18.4); linhas(15.0, 2, 0.12); problema(17.58); acende(17.78, 700)
    fs_entra(18.55); entra(m, 18.6, 520, 0.2); linhas(18.7, 4, 0.06)
    for t in (19.46, 19.98, 20.5, 20.8): check(m, t, G6, ganho=0.1)
    troca(21.85); linhas(22.05, 3, 0.08); contador(m, 23.24, 0.9, SAI, 6); problema(24.32)
    clique(m, 25.85); check(m, 25.98, G6, ganho=0.14); confete_som(m, 26.0, 0.12); troca(26.2); check(m, 26.62, E6, ganho=0.12); fs_sai(27.2)
    cta(29.56, 27.35)
if copia == '2':
    fs_entra(1.69); entra(m, 1.69, 520, 0.18); linhas(1.69, 3, 0.08); risco(1.69, 2.2)
    for t in (1.95, 2.25, 2.55): m.add(t, tick(1900, 0.03), 0.09, nome='marco')
    problema(3.19); acende(3.63, 1100); problema(4.15); acende(7.13, 800); problema(9.93); fs_sai(10.29)
    ins(10.69, 17.14); linhas(10.79, 3, 0.1)
    for t in (11.69, 12.99, 14.37): acende(t, 1100)
    problema(16.15)
    ins(17.4, 21.3); risco(17.4, 1.3); rompe(19.46); problema(20.8)
    fs_entra(21.47); entra(m, 21.47, 520, 0.2); linhas(21.47, 5, 0.08); contador(m, 22.99, 0.9, SAI, 6); problema(23.99); acende(24.47, 1200)
    clique(m, 26.83); check(m, 26.88, G6, ganho=0.14); confete_som(m, 26.93, 0.12); troca(27.13); acende(27.75, 1100); check(m, 28.25, E6, ganho=0.12); fs_sai(28.93)
    cta(30.39, 29.08)
if copia == '3':
    fs_entra(1.0); entra(m, 1.05, 520, 0.18); linhas(1.15, 4, 0.08); problema(2.18)
    for k in range(4): m.add(3.92 + 0.08 * k, tick(1800 + 120 * k, 0.03), 0.08, nome='alerta')
    problema(4.84); passa_som(5.2); linhas(5.25, 5, 0.04)
    for t in (5.96, 7.8, 8.34, 9.44, 10.7): acende(t, 1000)
    fs_sai(11.35)
    ins(11.5, 20.3); linhas(11.6, 5, 0.1); risco(15.6, 1.3); acende(17.92, 900); problema(19.4)
    fs_entra(20.45); entra(m, 20.5, 520, 0.2); linhas(20.6, 4, 0.06)
    for k in range(5): check(m, 21.13 + 0.1 * k, G6, ganho=0.08)
    contador(m, 22.91, 1.2, SAI, 7); problema(25.65); clique(m, 26.41); check(m, 26.45, G6, ganho=0.14); confete_som(m, 26.6, 0.12)
    acende(26.79, 1100); check(m, 27.79, E6, ganho=0.12); fs_sai(28.4)
    cta(31.18, 28.55)

salvar(m, sys.argv[2])
