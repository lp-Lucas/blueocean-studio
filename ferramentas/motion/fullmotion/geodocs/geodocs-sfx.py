"""SFX da Geodocs — tempos iguais aos de copy1.html / copy2.html / copy3.html (linha do tempo já cortada).
uso: python geodocs-sfx.py <1|2|3> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

copia = sys.argv[1]
m = nova({'1': 28.14, '2': 27.60, '3': 26.20}[copia])

def fs_entra(t):
    m.add(t, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha'); m.add(t + 0.42, baque(0.6, 50), 0.22, nome='círculo some: grave')
def marca_expande(t0):
    m.add(t0, pop(520, 0.3, 0.8), 0.22, nome='ícone da marca pula'); m.add(t0 + 0.04, tick(1800, 0.03), 0.1, nome='ícone: clique')
    m.add(t0 + 0.6, whoosh(0.55, 500, 2800, pico=0.6, q=0.9), 0.26, nome='fundo do ícone expande'); m.add(t0 + 1.05, baque(0.5, 55), 0.18, nome='tela cheia: grave')
def fs_sai(t):
    m.add(t, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece'); m.add(t + 0.04, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')
def aba(t):
    clique(m, t); m.add(t + 0.05, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='troca de aba')
def acende(t, f=1000):
    m.add(t, pop(f, 0.2, 0.5), 0.1, nome='acende')
def cascata(t0, n, passo, f0=1700, df=110, ganho=0.06, nome='linha entra'):
    for k in range(n): m.add(t0 + k * passo, tick(f0 + df * k, 0.03), ganho, nome=nome)
def problema(t_pop, t_imp):
    m.add(t_pop, pop(700, 0.25, 0.7), 0.14, nome='problema aparece'); impacto(m, t_imp, A6)
def digitar(t0, dur, n):
    teclas(m, [t0 + k * dur / n for k in range(n)], ganho=0.1)
def cta(t_in, t_clique):
    entra(m, t_in, 560, 0.24); clique(m, t_clique); m.add(t_clique + 0.02, baque(0.5, 60), 0.12, nome='botão: grave')
    m.add(t_clique + 0.15, vidro(C7, 0.9, 0.6), 0.05, nome='brilho no botão')

if copia == '1':
    entra(m, 0.85, 560, 0.2)
    for t0 in (0.92, 2.27, 3.39): acende(t0 + 0.02, 900)
    sai(m, 4.45)
    fs_entra(4.75); entra(m, 4.8, 520, 0.18); cascata(5.0, 5, 0.08)
    acende(5.85, 1100); cascata(7.04, 5, 0.07, f0=2400, df=60, ganho=0.05, nome='pendente acende')
    problema(7.5, 7.96)
    aba(9.45)
    for t0 in (9.6, 10.35, 11.15, 12.2): m.add(t0, pop(1300, 0.18, 0.5), 0.11, nome='mensagem chega')
    acende(9.9, 1200); acende(11.34, 1100)
    aba(12.85); cascata(13.0, 5, 0.08)
    for k in range(5): m.add(13.3 + k * 0.12, pop(700 + 40 * k, 0.15, 0.5), 0.07, nome='??? aparece')
    problema(14.05, 14.2)
    fs_sai(14.6)
    entra(m, 14.8, 560, 0.2); problema(15.67, 15.7); sai(m, 16.5)
    entra(m, 16.8, 620, 0.22); m.add(17.31, pop(1000, 0.2, 0.5), 0.08, nome='logo'); sai(m, 17.6)
    fs_entra(17.75); entra(m, 17.8, 520, 0.2)
    digitar(18.9, 1.1, 14); digitar(20.0, 0.4, 5)
    acende(20.67, 1000)
    clique(m, 21.0); check(m, 21.05, G6, ganho=0.15); confete_som(m, 21.05, 0.15)
    acende(21.39, 1200)
    for k, t0 in enumerate((22.91, 23.43, 23.85, 24.11)): m.add(t0, pop(900 + 120 * k, 0.15, 0.45), 0.09, nome='metadado acende')
    m.add(22.91, pop(1400, 0.15, 0.4), 0.06, nome='pino da foto')
    fs_sai(24.55)
    cta(24.7, 27.35)

elif copia == '2':
    entra(m, 0.05, 560, 0.2)
    for t0 in (0.0, 1.16, 2.6): acende(t0 + 0.04, 900)
    sai(m, 3.15)
    fs_entra(3.3); entra(m, 3.35, 520, 0.18)
    m.add(3.5, pop(1300, 0.18, 0.5), 0.1, nome='e-mail chega')
    acende(4.24, 900); acende(4.96, 1000); acende(6.4, 1100)
    digitar(7.1, 0.75, 10)
    aba(8.05); acende(8.5, 1200)
    aba(9.55); cascata(9.65, 7, 0.07); acende(10.46, 1000)
    aba(10.95)
    for t0 in (11.25, 11.85, 12.3): m.add(t0, pop(1300, 0.18, 0.5), 0.11, nome='mensagem')
    problema(12.55, 12.94)
    fs_sai(13.3)
    entra(m, 13.45, 560, 0.2)
    for k, t0 in enumerate((14.44, 14.6, 14.76)): m.add(t0, pop(700 + 40 * k, 0.18, 0.6), 0.09, nome='sem prova')
    problema(16.42, 16.45); sai(m, 16.75)
    entra(m, 16.95, 620, 0.22); m.add(17.18, pop(1000, 0.2, 0.5), 0.08, nome='logo'); sai(m, 17.6)
    fs_entra(17.8); entra(m, 17.85, 520, 0.2)
    clique(m, 18.45); m.add(18.5, pop(1100, 0.2, 0.5), 0.1, nome='pino selecionado')
    for k, t0 in enumerate((19.68, 20.34, 21.18, 21.72, 21.94)): m.add(t0, pop(900 + 100 * k, 0.15, 0.45), 0.09, nome='metadado acende')
    acende(22.92, 900); check(m, 23.4, G6, ganho=0.15)
    fs_sai(23.95)
    cta(24.05, 27.0)

elif copia == '3':
    entra(m, 0.2, 560, 0.2)
    for t0 in (0.18, 1.66, 2.98): acende(t0 + 0.04, 900)
    sai(m, 3.65)
    entra(m, 3.95, 560, 0.2); acende(5.06, 1100); sai(m, 5.55)
    marca_expande(5.9); entra(m, 6.95, 520, 0.18)
    cascata(7.05, 6, 0.07)
    for k in range(4): m.add(8.38 + k * 0.08, pop(1200 + 60 * k, 0.12, 0.4), 0.06, nome='foto acende')
    aba(9.5); problema(9.96, 10.0)
    aba(10.5)
    for k in range(7): m.add(11.0 + k * 0.17, pop(900 + 70 * k, 0.15, 0.45), 0.07, nome='formato diferente')
    aba(12.75); digitar(13.35, 0.95, 14)
    m.add(14.45, whoosh(0.25, 1800, 3600, pico=0.3, q=1.4), 0.11, nome='mensagem enviada')
    problema(15.1, 15.51)
    fs_sai(16.05)
    entra(m, 16.2, 620, 0.22); m.add(16.39, pop(1000, 0.2, 0.5), 0.08, nome='logo'); sai(m, 16.9)
    fs_entra(17.05); entra(m, 17.1, 520, 0.2)
    for k, t0 in enumerate((17.15, 17.81, 18.39)):
        m.add(t0, pop(900 + 150 * k, 0.18, 0.5), 0.1, nome='camada liga')
        for j in range(0, 10, 2): m.add(t0 + j * 0.03, pop(r.uniform(1100, 1700), 0.1, 0.4), 0.03, nome='pino')
    clique(m, 20.35); m.add(20.42, pop(1000, 0.2, 0.5), 0.1, nome='resumo da obra'); check(m, 20.5, E6, ganho=0.1)
    acende(21.27, 1100)
    fs_sai(21.45)
    cta(21.6, 25.5)

salvar(m, sys.argv[2])
