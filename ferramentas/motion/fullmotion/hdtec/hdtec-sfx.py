"""SFX da HD Tecnologia (Lírio ERP) — tempos iguais aos de copy1..3.html (linha do tempo já cortada).
uso: python nimochat-sfx.py <1..3> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

SAI = lambda p: 1 - (1 - p) ** 3   # mesma curva do contador da página (cubicOut)
copia = sys.argv[1]
m = nova({'1': 39.47, '2': 29.83, '3': 37.89}[copia])
if copia == '3':   # corte refeito ("sistema" inteiro): depois de 11,42 s tudo anda +0,32 s
    _add = m.add
    m.add = lambda t, *x, **k: _add(t + 0.32 if t >= 11.42 else t, *x, **k)

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
    fs_entra(0.85); entra(m, 0.9, 520, 0.18); linhas(1.1, 6, 0.1); contador(m, 1.36, 1.0, SAI, 8); acende(1.66, 1100)
    contador(m, 2.74, 0.9, SAI, 6); acende(3.54, 900); acende(5.14, 800); problema(6.16); fs_sai(6.95)
    ins(7.05, 13.85); risco(7.95, 1.1); risco(9.3, 1.3); problema(13.43)
    ins(13.9, 18.65)
    for t in (15.87, 16.67, 17.31): m.add(t, pop(900, 0.22, 0.6), 0.12, nome='caixa entra')
    risco(16.7, 0.4); risco(17.35, 0.4); rompe(18.11)
    fs_entra(18.75); entra(m, 18.8, 520, 0.2); linhas(19.95, 3, 0.12); linhas(20.4, 4, 0.14)
    for k in range(4): check(m, 20.79 + 0.12 * k, E6 if k % 2 == 0 else G6, ganho=0.07)
    check(m, 22.03, G6, ganho=0.12)
    for t in (24.23, 24.81, 25.39, 26.4): troca(t)
    linhas(26.55, 4, 0.1); contador(m, 27.11, 0.8, SAI, 6); check(m, 27.47, G6, ganho=0.12); confete_som(m, 27.5, 0.16); fs_sai(28.6)
    ins(28.7, 34.45); linhas(28.85, 3, 0.1); acende(30.69, 1000); check(m, 33.45, E6, ganho=0.12); problema(33.81)
    cta(37.63, 34.5)
elif copia == '2':
    fs_entra(0.75); entra(m, 0.8, 520, 0.18); linhas(0.95, 6, 0.08); contador(m, 0.96, 0.9, SAI, 7)
    for k in range(5): m.add(2.16 + 0.08 * k, pop(700 - 30 * k, 0.2, 0.55), 0.1, nome='lucro ???')
    fs_sai(3.4)
    ins(3.5, 7.15); m.add(4.85, whoosh(0.7, 900, 2600, pico=0.6, q=1.0), 0.14, nome='barra cresce'); acende(5.17, 1100); problema(6.69)
    ins(7.2, 11.5); linhas(7.3, 3, 0.1); m.add(8.39, whoosh(0.4, 2400, 900, pico=0.4, q=1.2), 0.1, nome='borra'); acende(9.89, 900); problema(10.97)
    fs_entra(11.55); entra(m, 11.6, 520, 0.2); linhas(12.2, 3, 0.12); contador(m, 12.19, 1.0, SAI, 8); linhas(12.7, 3, 0.14); check(m, 13.43, G6, ganho=0.12)
    for t in (16.53, 17.13, 17.57): troca(t)
    linhas(17.75, 4, 0.1); acende(19.83, 1000)
    for k in range(2): check(m, 21.61 + 0.15 * k, E6 if k == 0 else G6, ganho=0.1)
    confete_som(m, 21.7, 0.14); problema(23.07); fs_sai(24.0)
    cta(28.03, 24.05)
elif copia == '3':
    fs_entra(0.55); entra(m, 0.6, 520, 0.18); tecla(0.72, 10, 0.8); linhas(1.55, 3, 0.1); check(m, 1.62, E6, ganho=0.1)
    acende(3.1, 900); problema(4.1); fs_sai(4.7)
    ins(4.75, 8.8); linhas(4.85, 3, 0.1)
    for k in range(3): problema(6.07 + 0.2 * k) if k == 0 else m.add(6.07 + 0.2 * k, pop(650, 0.22, 0.6), 0.12, nome='divergência')
    problema(7.79)
    ins(8.85, 14.95); m.add(9.39, pop(900, 0.22, 0.6), 0.12, nome='marco'); risco(9.79, 1.2); m.add(11.09, pop(1000, 0.22, 0.6), 0.12, nome='marco')
    check(m, 11.96, E6, ganho=0.1); risco(12.14, 0.9); m.add(13.37, pop(1100, 0.22, 0.6), 0.12, nome='marco'); rompe(14.07); problema(14.35)
    ins(15.0, 19.95); linhas(15.1, 3, 0.1); problema(15.81); problema(16.63); problema(19.39)
    fs_entra(20.05); entra(m, 20.1, 520, 0.2); linhas(20.4, 4, 0.1); check(m, 21.01, E6, ganho=0.1); acende(21.65, 900)
    for k in range(2): m.add(22.37 + 0.12 * k, tick(1900 + 100 * k, 0.03), 0.09, nome='integra')
    troca(23.43); linhas(23.6, 4, 0.1); troca(25.39); acende(25.83, 1000); acende(26.03, 1080); notif(26.29)
    troca(28.9); linhas(29.05, 4, 0.1); check(m, 29.71, G6, ganho=0.12); confete_som(m, 30.77, 0.16); fs_sai(32.0)
    cta(35.77, 32.05)

salvar(m, sys.argv[2])
