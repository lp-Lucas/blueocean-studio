"""SFX da IMME — tempos iguais aos de copy1..3.html (linha do tempo já cortada).
uso: python imme-sfx.py <1..3> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

SAI = lambda p: 1 - (1 - p) ** 3   # mesma curva do contador da página (cubicOut)
copia = sys.argv[1]
m = nova({'1': 37.48, '2': 33.90, '3': 36.72}[copia])

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

if copia == '1':
    fs_entra(1.0); entra(m, 1.05, 520, 0.18); linhas(1.3, 4, 0.08); contador(m, 2.13, 1.0, SAI, 8)
    for k, t in enumerate([4.27, 4.45, 4.85, 5.03]): problema(t)
    fs_sai(5.65)
    ins(5.86, 11.95)
    for t in (6.3, 7.0, 7.52, 7.96): m.add(t, pop(900, 0.22, 0.6), 0.12, nome='marco')
    risco(7.0, 0.35); risco(7.52, 0.35); risco(7.96, 0.35); rompe(8.9)
    for t in (9.56, 10.02, 10.54, 11.3): problema(t)
    fs_entra(12.0); entra(m, 12.05, 520, 0.2); linhas(12.25, 5, 0.08)
    for t in (12.54, 13.56, 14.76, 16.08, 17.5): problema(t)
    problema(19.14); fs_sai(20.3)
    logo(20.45, 21.3)
    fs_entra(21.4); entra(m, 21.45, 520, 0.2); linhas(21.65, 5, 0.08)
    for k, t in enumerate([22.0, 22.88, 23.4, 24.02, 24.42]): check(m, t, E6 if k % 2 == 0 else G6, ganho=0.08)
    acende(25.3, 1200); troca(26.45); linhas(26.45, 4, 0.06)
    for t in (28.22, 28.42): acende(t, 1100)
    for t in (29.94, 30.14): problema(t)
    troca(30.55); contador(m, 30.8, 1.0, SAI, 8); confete_som(m, 32.25, 0.16); fs_sai(32.75)
    cta(33.62, 32.85)
elif copia == '2':
    fs_entra(0.9); entra(m, 0.95, 520, 0.18); linhas(1.2, 3, 0.08); risco(1.2, 3.2); contador(m, 3.7, 0.9, SAI, 7)
    for t in (6.08, 6.24, 6.4): problema(t)
    fs_sai(6.95)
    ins(7.04, 13.05)
    for t in (7.56, 8.62, 10.1, 11.66): problema(t)
    ins(13.22, 17.85); m.add(14.46, whoosh(0.4, 1500, 3000, pico=0.5, q=1.4), 0.1, nome='risca'); check(m, 15.34, E6, ganho=0.1); problema(16.58)
    logo(17.95, 18.65)
    fs_entra(18.75); entra(m, 18.8, 520, 0.2); linhas(18.95, 4, 0.08)
    for k, t in enumerate([18.96, 19.6, 20.1, 20.6]): check(m, t, E6 if k % 2 == 0 else G6, ganho=0.08)
    acende(22.12, 1200); troca(23.3); linhas(23.25, 5, 0.06)
    contador(m, 24.36, 0.8, SAI, 6); contador(m, 25.12, 0.9, SAI, 6)
    check(m, 26.02, E6, ganho=0.08); check(m, 26.2, G6, ganho=0.08); check(m, 27.38, C7, ganho=0.12); acende(28.44, 1300)
    confete_som(m, 28.95, 0.16); fs_sai(29.25)
    cta(30.15, 29.4)
elif copia == '3':
    fs_entra(0.95); entra(m, 1.0, 520, 0.18); linhas(1.25, 3, 0.08)
    for k in range(4): m.add(1.5 + 0.1 * k, pop(900 + 60 * k, 0.18, 0.5), 0.08, nome='marco')
    risco(3.92, 1.6)
    for t in (3.92, 4.45, 4.98, 5.52): m.add(t, tick(1900, 0.03), 0.08, nome='marco alcançado')
    acende(4.7, 1000); clique(m, 5.82); check(m, 5.86, E6, ganho=0.12)
    for t in (6.0, 6.1, 6.2, 6.3): problema(t)
    fs_sai(6.85)
    logo(7.0, 9.6)
    fs_entra(9.75); entra(m, 9.8, 520, 0.2); linhas(10.0, 4, 0.08); contador(m, 11.32, 0.9, SAI, 7); acende(11.92, 1200)
    troca(12.8); linhas(12.8, 4, 0.06)
    for t in (13.88, 14.08, 14.28): acende(t, 1100)
    acende(15.66, 1300)
    troca(16.2); linhas(16.2, 4, 0.05); troca(17.28); linhas(17.28, 6, 0.06); check(m, 18.45, C7, ganho=0.12); confete_som(m, 18.45, 0.16)
    fs_sai(19.0)
    ins(19.15, 25.0)
    for k, t in enumerate([21.76, 22.6, 23.54]): check(m, t, [E6, G6, C7][k], ganho=0.12)
    fs_entra(25.15); entra(m, 25.2, 520, 0.2); linhas(25.35, 6, 0.08); contador(m, 25.4, 1.3, SAI, 8)
    clique(m, 28.82); check(m, 28.86, E6, ganho=0.12); acende(30.54, 1300); confete_som(m, 30.54, 0.16); fs_sai(31.0)
    cta(35.92, 31.15)

salvar(m, sys.argv[2])
