"""SFX da Anonify — tempos iguais aos de copy1/copy2.html (linha do tempo já cortada).
uso: python anonify-sfx.py <1|2> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

SAI = lambda p: 1 - (1 - p) ** 3   # mesma curva do contador da página (cubicOut)
copia = sys.argv[1]
m = nova({'1': 41.75, '2': 46.06}[copia])

def fs_entra(t):
    m.add(t, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha'); m.add(t + 0.42, baque(0.6, 50), 0.22, nome='círculo some: grave')
def fs_sai(t):
    m.add(t, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece'); m.add(t + 0.04, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')
def linhas(t0, n, passo, f=1700):
    for k in range(n): m.add(t0 + k * passo, tick(f + 140 * k, 0.03), 0.08, nome='linha entra')
def acende(t, f=1000):
    m.add(t, pop(f, 0.2, 0.5), 0.1, nome='acende')
def alerta(t):
    m.add(t, pop(620, 0.22, 0.6), 0.11, nome='fica vermelho')
def problema(t):
    m.add(t, pop(650, 0.25, 0.7), 0.14, nome='problema'); impacto(m, t + 0.02, A6)
def troca(t):
    clique(m, t); m.add(t + 0.07, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='troca de tela')
def risco(t, d=0.6):
    m.add(t, whoosh(d, 1200, 2800, pico=0.5, q=1.4), 0.1, nome='traço se desenha')
def digita(t0, n, cps):
    teclas(m, [t0 + k / cps for k in range(0, n, 2)], ganho=0.12)
def ins(t, tsai):
    entra(m, t, 560, 0.2); sai(m, tsai)
def cta(tc, ent):
    entra(m, ent, 560, 0.24); clique(m, tc); m.add(tc + 0.02, baque(0.5, 60), 0.12, nome='botão: grave')
    for t in (tc + 0.15, tc + 1.75): m.add(t, vidro(C7, 1.2, 0.6), 0.05, nome='brilho no botão')

if copia == '1':
    fs_entra(1.0); entra(m, 1.05, 520, 0.18); linhas(1.25, 3, 0.1)
    alerta(3.3); alerta(4.32); problema(4.96)
    fs_sai(5.55)
    ins(5.7, 16.95); acende(8.42, 1150); acende(11.0); m.add(13.74, tick(1900, 0.03), 0.08, nome='marco')
    risco(14.46, 1.1); problema(15.58); risco(15.62, 0.7); problema(16.36)
    ins(17.2, 26.35); linhas(17.3, 2, 0.08); acende(18.29); acende(20.11, 1150)
    contador(m, 23.83, 0.9, SAI, 10); impacto(m, 24.21, A6); alerta(25.49)
    ins(26.4, 32.85); acende(29.69); risco(29.85, 0.85); problema(30.71); risco(31.53, 0.8); check(m, 31.53, E6, ganho=0.12); check(m, 32.42, G6, ganho=0.14)
    fs_entra(33.0); entra(m, 33.05, 520, 0.2); digita(33.3, 10, 18)
    clique(m, 34.09); check(m, 34.2, E6, ganho=0.14); acende(34.31, 1250); acende(34.97, 1350)
    troca(35.75); entra(m, 36.95, 900, 0.12); acende(37.51, 1150)
    fs_sai(38.85)
    cta(40.3, 38.97)
elif copia == '2':
    fs_entra(0.9); entra(m, 0.95, 520, 0.18); linhas(1.15, 3, 0.1)
    alerta(1.64); alerta(2.2); problema(4.7)
    fs_sai(5.45)
    ins(5.65, 17.0); acende(7.17, 1150); acende(9.85); m.add(12.26, tick(1900, 0.03), 0.08, nome='marco')
    risco(15.1, 0.9); problema(16.0); risco(16.05, 0.65); problema(16.74)
    ins(17.4, 23.7); linhas(17.5, 2, 0.08); acende(18.88, 1150); problema(20.46)
    contador(m, 21.4, 0.9, SAI, 10); alerta(22.76)
    ins(23.75, 31.8); alerta(25.04); check(m, 27.64, E6, ganho=0.12)
    acende(29.1); risco(29.25, 0.5); acende(29.8, 1100); risco(29.95, 0.8); check(m, 30.8, E6, ganho=0.12); check(m, 31.06, G6, ganho=0.14)
    entra(m, 32.55, 620, 0.22); sai(m, 33.7)
    fs_entra(33.85); entra(m, 33.9, 520, 0.2); digita(34.93, 10, 18)
    clique(m, 35.99); acende(36.05, 1200); clique(m, 37.35); check(m, 37.45, E6, ganho=0.14); acende(37.83, 1350)
    troca(38.4); digita(39.3, 21, 30); check(m, 40.23, G6, ganho=0.12)
    fs_sai(40.75)
    cta(42.3, 40.91)

salvar(m, sys.argv[2])
