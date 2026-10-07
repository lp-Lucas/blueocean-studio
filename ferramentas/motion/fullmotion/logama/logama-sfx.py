"""SFX da LOGAMA — tempos iguais aos de copy1.html / copy2.html / copy3.html (linha do tempo já cortada).
uso: python logama-sfx.py <1|2|3> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

copia = sys.argv[1]
m = nova({'1': 44.96, '2': 39.10, '3': 33.38}[copia])

def fs_entra(t):
    m.add(t, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha'); m.add(t + 0.42, baque(0.6, 50), 0.22, nome='círculo some: grave')
def fs_sai(t):
    m.add(t, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece'); m.add(t + 0.04, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')
def linhas(t0, n, passo, f=1700):
    for k in range(n): m.add(t0 + k * passo, tick(f + 140 * k, 0.03), 0.08, nome='linha entra')
def acende(t, ganho=0.1):
    m.add(t, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), ganho, nome='linha acende')
def alerta(t):
    m.add(t, pop(650, 0.25, 0.7), 0.15, nome='???'); impacto(m, t + 0.02, A6)
def digita(t, n):
    teclas(m, [t + k * 0.35 / max(1, n // 2) for k in range(max(1, n // 2))])
def aba(t):
    clique(m, t); m.add(t + 0.05, whoosh(0.3, 1200, 2600, pico=0.4, q=1.2), 0.08, nome='aba carrega')
def cta(t_in, t_cl):
    entra(m, t_in, 560, 0.24); clique(m, t_cl); m.add(t_cl + 0.02, baque(0.5, 60), 0.12, nome='botão: grave')
    m.add(t_cl + 0.15, vidro(C7, 1.2, 0.6), 0.05, nome='brilho no botão')

if copia == '1':
    fs_entra(1.6); entra(m, 1.65, 520, 0.18); linhas(1.85, 5, 0.16)
    m.add(3.4, pop(900, 0.2, 0.5), 0.1, nome='MG · 5 fretes'); alerta(5.4)
    aba(9.15)
    for t in (10.95, 12.5, 14.05): acende(t); m.add(t + 0.25, pop(800, 0.2, 0.5), 0.08, nome='sem base local')
    alerta(16.3); fs_sai(16.95)
    entra(m, 17.1, 560, 0.2)
    for t in (18.35, 19.33, 20.7): acende(t, 0.09)
    sai(m, 21.6)
    entra(m, 21.85, 620, 0.22); sai(m, 23.85)
    entra(m, 24.0, 560, 0.2)
    for t in (26.6, 27.68, 29.72): check(m, t, E6, ganho=0.12)
    sai(m, 31.35)
    fs_entra(31.55); entra(m, 31.6, 520, 0.2)
    digita(32.6, 18); digita(33.3, 12); digita(34.6, 14); digita(35.2, 13)
    clique(m, 36.2); check(m, 36.25, G6, ganho=0.14)
    for t in (37.75, 38.6, 39.3, 39.6): check(m, t, E6, ganho=0.1)
    contador(m, 39.75, 0.9, quintOut, 10, ganho=0.045); confete_som(m, 39.8)
    fs_sai(40.6)
    cta(40.8, 43.55)
elif copia == '2':
    fs_entra(1.6); entra(m, 1.65, 520, 0.18); linhas(1.85, 4, 0.16)
    alerta(2.99); m.add(4.95, pop(900, 0.2, 0.5), 0.1, nome='mensal')
    for k in range(3): acende(5.0 + k * 0.2, 0.07)
    aba(7.45)
    for t in (8.1, 9.0, 9.84, 10.38): m.add(t, pop(1100 + 80 * (t > 9), 0.2, 0.5), 0.1, nome='mensagem acende')
    aba(11.85); alerta(13.9)
    for k in range(3): acende(15.1 + k * 0.18, 0.07)
    m.add(16.5, pop(650, 0.2, 0.6), 0.1, nome='??? de novo'); fs_sai(17.55)
    entra(m, 17.75, 620, 0.22); sai(m, 19.25)
    entra(m, 19.35, 560, 0.2); acende(19.52); acende(20.48); check(m, 22.05, G6, ganho=0.14); sai(m, 24.1)
    fs_entra(24.25); entra(m, 24.3, 520, 0.2)
    digita(25.15, 12); digita(25.85, 14); digita(26.45, 17); digita(26.95, 14)
    clique(m, 27.55); contador(m, 28.1, 1.0, quintOut, 10, ganho=0.05); confete_som(m, 29.15)
    linhas(28.7, 4, 0.14, 1900); m.add(30.0, pop(1000, 0.2, 0.5), 0.1, nome='antes de contratar')
    check(m, 33.9, G6, ganho=0.14)
    fs_sai(34.95)
    cta(35.15, 38.0)
else:
    fs_entra(1.6); entra(m, 1.65, 520, 0.18); linhas(1.85, 6, 0.12)
    alerta(2.75)
    for t in (4.8, 6.45, 7.72, 9.27, 11.12): m.add(t, pop(900, 0.2, 0.5), 0.1, nome='passo acende')
    check(m, 13.1, E6, ganho=0.12); impacto(m, 13.12, A6)
    fs_sai(13.5)
    entra(m, 13.7, 620, 0.22); sai(m, 15.0)
    entra(m, 15.05, 560, 0.2); acende(15.18); acende(16.04); check(m, 16.6, G6, ganho=0.14); sai(m, 18.05)
    fs_entra(18.15); entra(m, 18.2, 520, 0.2)
    m.add(18.8, whoosh(0.7, 600, 1800, pico=0.6, q=1.0), 0.1, nome='barra antiga'); m.add(19.3, whoosh(0.5, 900, 2600, pico=0.6, q=1.0), 0.1, nome='barra Logama')
    m.add(19.74, pop(1000, 0.25, 0.6), 0.14, nome='3× mais rápido'); confete_som(m, 19.8)
    for k in range(5): m.add(22.05 + k * 0.2, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.1, nome='risca contato')
    aba(25.0)
    for t in (25.45, 25.9, 27.36, 29.66): check(m, t, E6, ganho=0.11)
    m.add(29.66, pop(1100, 0.2, 0.5), 0.1, nome='em rota')
    fs_sai(29.95)
    cta(30.3, 32.15)

salvar(m, sys.argv[2])
