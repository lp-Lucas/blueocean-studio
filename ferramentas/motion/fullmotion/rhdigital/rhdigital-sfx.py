"""SFX da RH Digital — tempos iguais aos de copy1..4.html (linha do tempo já cortada).
uso: python rhdigital-sfx.py <1|2|3|4> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

copia = sys.argv[1]
m = nova({'1': 29.28, '2': 30.06, '3': 29.08, '4': 26.64}[copia])

def fs_entra(t):
    m.add(t, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha'); m.add(t + 0.42, baque(0.6, 50), 0.22, nome='círculo some: grave')
def marca_expande(t0):
    m.add(t0, pop(520, 0.3, 0.8), 0.22, nome='ícone da marca pula'); m.add(t0 + 0.04, tick(1800, 0.03), 0.1, nome='ícone: clique')
    m.add(t0 + 0.6, whoosh(0.55, 500, 2800, pico=0.6, q=0.9), 0.26, nome='fundo do ícone expande'); m.add(t0 + 1.05, baque(0.5, 55), 0.18, nome='tela cheia: grave')
def fs_sai(t):
    m.add(t, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece'); m.add(t + 0.04, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')
def linhas(t0, n, dt=0.06, f=1700, g=0.06):
    for k in range(n): m.add(t0 + k * dt, tick(f + 110 * k, 0.03), g, nome='linha entra')
def acende(ts, f=900, g=0.1, nome='acende'):
    for k, t in enumerate(ts): m.add(t, pop(f + 80 * k, 0.18, 0.5), g, nome=nome)
def aba(t):
    clique(m, t); m.add(t + 0.05, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='troca de aba')
def coluna(t): m.add(t, whoosh(0.3, 900, 2600, pico=0.5, q=1.2), 0.09, nome='coluna acende')
def plataforma(TI, auto, assina, dt, status=None):
    linhas(TI + 0.4, 6, 0.07)
    if status: coluna(status)
    clique(m, auto); m.add(auto + 0.05, tick(2400, 0.04), 0.1, nome='chave liga')
    for k in range(4): m.add(auto + 0.3 + k * 0.12, whoosh(0.22, 1800, 3600, pico=0.3, q=1.4), 0.07, nome='lembrete enviado')
    for k in range(4): check(m, assina + k * dt, [C6, E6, G6, C7][k], ganho=0.1)
    contador(m, assina, 3 * dt + 0.2, cubicInOut, 8, ganho=0.04)
    confete_som(m, assina + 3 * dt + 0.2)
def cta(a, tc):
    entra(m, a, 560, 0.24); clique(m, tc); m.add(tc + 0.02, baque(0.5, 60), 0.12, nome='botão: grave')
    m.add(tc + 0.15, vidro(C7, 0.9, 0.6), 0.05, nome='brilho no botão')

if copia == '1':
    entra(m, 0.35, 560, 0.2); acende((1.66, 1.86), 1000, 0.08); m.add(3.76, pop(700, 0.25, 0.7), 0.13, nome='cobrar assinaturas'); impacto(m, 3.8, A6); sai(m, 4.6)
    fs_entra(4.85); linhas(5.1, 8); acende([5.6 + k * 0.07 for k in (1, 2, 4, 6)], 700, 0.07, 'pendente'); coluna(7.04); impacto(m, 7.75, A6)
    aba(8.42); acende([8.8 + k * 0.18 for k in range(4)], 1300, 0.08, 'mensagem enviada'); fs_sai(9.6)
    entra(m, 9.75, 560, 0.2); acende((10.76, 10.96, 11.16), 800, 0.09, 'documento'); contador(m, 11.82, 1.6, cubicInOut, 10, ganho=0.04); impacto(m, 14.0, A6); sai(m, 14.8)
    fs_entra(15.15); clique(m, 16.27); m.add(16.4, whoosh(0.3, 1800, 3600, pico=0.3, q=1.4), 0.12, nome='documentos enviados'); check(m, 16.4, E6)
    clique(m, 17.25); m.add(17.3, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='abre status')
    plataforma(17.25, 19.09, 20.55, 0.16, status=17.6); fs_sai(21.7)
    entra(m, 21.85, 560, 0.2); m.add(22.2, whoosh(0.9, 2600, 900, pico=0.4, q=1.0), 0.1, nome='barra encolhe'); m.add(23.14, whoosh(0.9, 900, 2600, pico=0.4, q=1.0), 0.1, nome='barra cresce')
    check(m, 23.3, G6, ganho=0.12); sai(m, 24.85)
    cta(25.0, 27.15)

elif copia == '2':
    marca_expande(1.35); linhas(2.6, 6); teclas(m, [2.5 + k * 0.1 for k in range(7)], ganho=0.12)
    aba(3.55); acende([4.13 + k * 0.07 for k in (1, 2, 4, 6)], 700, 0.07, 'pendente'); m.add(5.48, pop(700, 0.25, 0.7), 0.13, nome='9 pendentes'); impacto(m, 5.55, A6)
    aba(7.54); aba(9.08)
    for k in range(8): check(m, 9.45 + k * 0.16, [C6, D6, E6, G6, A6, C7, C7, C7][k], ganho=0.06)
    fs_sai(10.7)
    entra(m, 10.85, 560, 0.2); acende((12.31, 12.71, 13.11), 1200, 0.08, 'cobrado à mão'); m.add(14.49, pop(700, 0.25, 0.7), 0.13, nome='recomeça'); impacto(m, 14.55, A6); sai(m, 15.9)
    fs_entra(16.42); acende([17.24 + k * 0.12 for k in range(6)], 900, 0.05, 'documento'); m.add(18.54, pop(1000, 0.2, 0.5), 0.1, nome='tempo real')
    clique(m, 19.0); m.add(19.05, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='abre status')
    plataforma(19.0, 19.95, 21.28, 0.15); fs_sai(22.35)
    entra(m, 22.49, 560, 0.2)
    for t0 in (22.85, 23.65): m.add(t0, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.13, nome='risca')
    check(m, 25.03, G6, ganho=0.12); sai(m, 25.8)
    cta(25.94, 27.85)

elif copia == '3':
    entra(m, 0.5, 560, 0.2); m.add(1.58, pop(700, 0.25, 0.7), 0.12, nome='12 cobranças'); impacto(m, 1.62, A6); acende((1.94, 2.12, 2.3), 800, 0.07); acende((3.72, 3.82, 3.92), 1100, 0.07, 'documento'); sai(m, 4.3)
    fs_entra(5.46); linhas(5.7, 8); acende([6.16 + k * 0.07 for k in (1, 2, 4, 6)], 700, 0.07, 'pendente'); coluna(7.44); impacto(m, 8.25, A6)
    aba(9.0); acende([9.9 + k * 0.18 for k in range(3)], 1300, 0.08, 'mensagem enviada'); fs_sai(10.55)
    entra(m, 10.66, 560, 0.2)
    for a in (12.1, 13.86, 14.8): contador(m, a, 0.7, cubicInOut, 7, ganho=0.04)
    impacto(m, 15.45, A6); sai(m, 15.7)
    fs_entra(16.12); plataforma(16.12, 18.66, 20.0, 0.16, status=17.04); fs_sai(21.2)
    entra(m, 21.32, 560, 0.2); m.add(21.74, whoosh(0.9, 2600, 900, pico=0.4, q=1.0), 0.1, nome='barra encolhe'); m.add(23.83, whoosh(0.8, 900, 2600, pico=0.4, q=1.0), 0.1, nome='barra cresce')
    check(m, 24.0, G6, ganho=0.12); sai(m, 24.75)
    cta(24.9, 27.05)

elif copia == '4':
    entra(m, 0.3, 560, 0.2); check(m, 2.78, E6, ganho=0.12); m.add(4.56, pop(700, 0.25, 0.7), 0.13, nome='precisam ser cobrados'); impacto(m, 4.6, A6); sai(m, 4.9)
    fs_entra(5.18); linhas(5.45, 8); acende([5.63 + k * 0.07 for k in (1, 2, 4, 6)], 700, 0.07, 'pendente'); m.add(6.13, pop(700, 0.25, 0.7), 0.12, nome='9 pendentes')
    aba(7.05); impacto(m, 7.1, A6); aba(8.1); impacto(m, 8.15, A6); fs_sai(9.35)
    entra(m, 9.5, 560, 0.2)
    for a in (10.01, 11.23, 12.53): contador(m, a, 0.7, cubicInOut, 7, ganho=0.04)
    impacto(m, 13.2, A6); sai(m, 13.65)
    fs_entra(14.0); plataforma(14.0, 16.64, 18.1, 0.15, status=15.34); fs_sai(19.15)
    entra(m, 19.28, 560, 0.2); m.add(19.64, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.13, nome='risca'); check(m, 20.9, G6, ganho=0.12); sai(m, 22.15)
    cta(22.28, 24.4)

salvar(m, sys.argv[2])
