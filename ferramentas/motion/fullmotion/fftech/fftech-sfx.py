"""SFX da FF Tech — tempos iguais aos de copy1..4.html (linha do tempo já cortada).
uso: python fftech-sfx.py <1|2|3|4> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

copia = sys.argv[1]
m = nova({'1': 30.21, '2': 29.96, '3': 25.92, '4': 26.22}[copia])

def fs_entra(t):
    m.add(t, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha'); m.add(t + 0.42, baque(0.6, 50), 0.22, nome='círculo some: grave')
def marca_expande(t0):
    m.add(t0, pop(520, 0.3, 0.8), 0.22, nome='ícone da marca pula'); m.add(t0 + 0.04, tick(1800, 0.03), 0.1, nome='ícone: clique')
    m.add(t0 + 0.6, whoosh(0.55, 500, 2800, pico=0.6, q=0.9), 0.26, nome='fundo do ícone expande'); m.add(t0 + 1.05, baque(0.5, 55), 0.18, nome='tela cheia: grave')
def fs_sai(t):
    m.add(t, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece'); m.add(t + 0.04, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')
def linhas(t0, n, passo, f=1700):
    for k in range(n): m.add(t0 + k * passo, tick(f + 140 * k, 0.03), 0.08, nome='linha entra')
def acende(t, f=1000):
    m.add(t, pop(f, 0.2, 0.5), 0.1, nome='acende')
def troca(t):
    clique(m, t); m.add(t + 0.07, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='troca de aba')
def problema(t):
    m.add(t, pop(650, 0.25, 0.7), 0.14, nome='problema'); impacto(m, t + 0.02, A6)
def cta(tc, ent):
    entra(m, ent, 560, 0.24); clique(m, tc); m.add(tc + 0.02, baque(0.5, 60), 0.12, nome='botão: grave')
    for t in (tc + 0.15, tc + 1.75): m.add(t, vidro(C7, 1.2, 0.6), 0.05, nome='brilho no botão')

if copia == '1':
    fs_entra(1.2); entra(m, 1.25, 520, 0.18); linhas(1.45, 7, 0.08)
    for k in range(3): acende(2.75 + k * 0.25, 900 + 120 * k)
    for k in range(3): m.add(4.34 + k * 0.28, tick(1900 + 160 * k, 0.03), 0.09, nome='fornecedor acende')
    for t in (6.34, 7.94, 8.58): m.add(t, whoosh(0.3, 1200, 2800, pico=0.5, q=1.4), 0.09, nome='repassa')
    problema(10.36)
    fs_sai(11.12)
    entra(m, 11.2, 620, 0.22); sai(m, 11.95); entra(m, 12.0, 560, 0.2)
    for k, t in enumerate((12.06, 12.82, 13.28)): acende(t, 1000 + 120 * k)
    check(m, 14.38, E6, ganho=0.1); sai(m, 15.2)
    fs_entra(15.35); entra(m, 15.4, 520, 0.2); linhas(15.6, 3, 0.08)
    for k in range(3): check(m, 15.95 + 0.3 * k, G6, ganho=0.06)
    troca(16.55); linhas(16.7, 4, 0.08); troca(17.95); linhas(18.1, 3, 0.12)
    acende(20.12); check(m, 22.08, E6, ganho=0.12); check(m, 22.8, G6, ganho=0.12); acende(23.74, 1200)
    fs_sai(25.05)
    cta(27.4, 25.15)
elif copia == '2':
    fs_entra(0.9); entra(m, 0.95, 520, 0.18); linhas(1.15, 5, 0.08)
    for k in range(3): m.add(1.82 + k * 0.2, tick(1500 + 120 * k, 0.03), 0.09, nome='controle pedido')
    troca(3.35); linhas(3.45, 4, 0.08); acende(4.19); m.add(4.69, pop(600, 0.25, 0.6), 0.1, nome='sumiu')
    troca(5.15); check(m, 5.63, E6, ganho=0.12)
    m.add(7.65, pop(650, 0.25, 0.7), 0.14, nome='???'); impacto(m, 8.57, A6)
    fs_sai(9.12)
    entra(m, 9.2, 620, 0.22); sai(m, 10.05); entra(m, 10.1, 560, 0.2)
    for k, t in enumerate((10.3, 11.66, 12.9)): acende(t, 1000 + 120 * k)
    check(m, 13.12, G6, ganho=0.1); sai(m, 14.25)
    fs_entra(14.35); entra(m, 14.4, 520, 0.2); linhas(14.6, 4, 0.08)
    for k in range(4): m.add(15.12 + k * 0.12, tick(2200 + 150 * k, 0.03), 0.08, nome='rodando')
    for k in range(4): m.add(16.18 + k * 0.1, tick(2600 + 120 * k, 0.025), 0.06, nome='evidência')
    acende(17.68); troca(18.9); linhas(19.0, 4, 0.1); acende(20.25); acende(21.63, 1150); check(m, 22.35, E6, ganho=0.12)
    troca(22.9); linhas(23.0, 4, 0.1)
    clique(m, 24.3); check(m, 24.35, G6, ganho=0.16); confete_som(m, 24.45, 0.16)
    fs_sai(25.4)
    cta(27.7, 25.5)
elif copia == '3':
    fs_entra(0.6); entra(m, 0.65, 520, 0.18); linhas(0.85, 4, 0.08)
    acende(2.6); m.add(3.02, pop(600, 0.25, 0.6), 0.12, nome='zero executadas')
    troca(3.9); linhas(4.0, 4, 0.08)
    for k, t in enumerate((5.52, 7.8, 10.06)): m.add(t, pop(700 - 40 * k, 0.22, 0.6), 0.11, nome='crítico')
    m.add(10.72, pop(650, 0.25, 0.7), 0.14, nome='???'); impacto(m, 11.22, A6)
    fs_sai(11.6)
    entra(m, 11.7, 620, 0.22); sai(m, 12.55); entra(m, 12.6, 560, 0.2)
    acende(13.52); check(m, 14.64, E6, ganho=0.12); m.add(15.98, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.14, nome='risca vendedor')
    sai(m, 16.4)
    fs_entra(16.55); entra(m, 16.6, 520, 0.2); linhas(16.75, 3, 0.08)
    m.add(17.34, pop(900, 0.2, 0.5), 0.1, nome='compartilha'); linhas(17.4, 4, 0.1)
    for k in range(2): check(m, 19.18 + k * 0.15, G6, ganho=0.1)
    for k in range(2): m.add(20.9 + k * 0.15, pop(620, 0.2, 0.6), 0.11, nome='refazer')
    fs_sai(21.25)
    cta(24.3, 21.3)
elif copia == '4':
    marca_expande(1.6); entra(m, 2.65, 520, 0.18); linhas(2.8, 6, 0.07)
    acende(4.5); acende(4.7); m.add(4.9, pop(600, 0.22, 0.6), 0.11, nome='zero mudanças')
    m.add(6.24, pop(620, 0.22, 0.6), 0.11, nome='sem dono')
    contador(m, 7.68, 0.8, cubicInOut, 9, ganho=0.05, f0=2200, f1=3600)
    impacto(m, 9.1, A6)
    fs_sai(9.5)
    entra(m, 9.6, 620, 0.22); sai(m, 10.4); entra(m, 10.45, 560, 0.2); acende(11.26)
    for k in range(3): m.add(12.72 + k * 0.27, tick(1700 + 160 * k, 0.03), 0.09, nome='prioridade')
    sai(m, 13.9)
    fs_entra(14.05); entra(m, 14.1, 520, 0.2); linhas(14.3, 7, 0.07)
    contador(m, 15.08, 0.6, quintOut, 8, ganho=0.045); check(m, 15.1, G6, ganho=0.14); confete_som(m, 15.25, 0.16)
    clique(m, 16.5); check(m, 16.55, E6, ganho=0.12)
    clique(m, 18.7); m.add(18.74, tick(1200, 0.04), 0.12, nome='chave liga')
    m.add(20.41, whoosh(1.9, 700, 1800, pico=0.4, q=1.0), 0.07, nome='revisão carrega'); acende(21.93)
    fs_sai(22.5)
    cta(24.8, 22.55)

salvar(m, sys.argv[2])
