"""SFX da NimoChat — tempos iguais aos de copy1..3.html (linha do tempo já cortada).
uso: python nimochat-sfx.py <1..3> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

SAI = lambda p: 1 - (1 - p) ** 3   # mesma curva do contador da página (cubicOut)
copia = sys.argv[1]
m = nova({'1': 38.21, '2': 31.83, '3': 44.45}[copia])

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
    marca_expande(0.45); entra(m, 1.5, 520, 0.18); linhas(1.7, 4, 0.08)
    for k in range(2): m.add(2.43 + 0.2 * k, pop(700 - 40 * k, 0.22, 0.6), 0.11, nome='sem resposta')
    contador(m, 2.43, 1.4, SAI, 7); problema(3.37); problema(3.57); fs_sai(4.55)
    ins(4.66, 8.95); risco(5.6, 0.7); risco(5.9, 0.7); m.add(6.64, pop(900, 0.25, 0.6), 0.14, nome='WhatsApp'); rompe(8.22); problema(8.46)
    ins(9.15, 13.3); acende(9.28); problema(10.0); problema(11.38); problema(12.52)
    logo(13.44, 14.5)
    fs_entra(14.6); entra(m, 14.65, 520, 0.2); linhas(15.02, 4, 0.3)
    for k in range(4): acende(16.3 + 0.2 * k, 1000 + 80 * k)
    for k in range(4): check(m, 18.1 + 0.36 * k, E6 if k % 2 == 0 else G6, ganho=0.08)
    clique(m, 21.72); notif(22.08); fs_sai(23.45)
    ins(23.64, 26.72); check(m, 24.64, E6, ganho=0.12); contador(m, 26.02, 0.5, SAI, 5); check(m, 26.4, G6, ganho=0.12)
    fs_entra(26.8); entra(m, 26.85, 520, 0.2); linhas(27.3, 5, 0.08); contador(m, 27.28, 0.9, SAI, 9); confete_som(m, 28.3, 0.16)
    problema(29.64); check(m, 31.48, G6, ganho=0.12); fs_sai(32.75)
    cta(34.02, 32.92)
elif copia == '2':
    marca_expande(0.35); entra(m, 1.4, 520, 0.18); linhas(1.6, 4, 0.08)
    for k in range(2): m.add(2.0 + 0.25 * k, pop(700 - 40 * k, 0.22, 0.6), 0.11, nome='sem retorno')
    contador(m, 2.0, 1.0, SAI, 7); m.add(4.55, whoosh(0.5, 2200, 700, pico=0.4, q=1.2), 0.14, nome='bagunça'); problema(6.01); problema(6.65); fs_sai(7.05)
    ins(7.13, 11.95); risco(7.4, 1.1); acende(8.59, 900); risco(9.15, 1.0); rompe(10.55); problema(11.45)
    logo(12.19, 13.3)
    fs_entra(13.45); entra(m, 13.5, 520, 0.2); linhas(13.75, 4, 0.1)
    clique(m, 14.7); m.add(14.75, whoosh(0.75, 800, 1800, pico=0.5, q=1.0), 0.12, nome='arrasta card'); m.add(15.5, pop(800, 0.2, 0.5), 0.12, nome='card solta')
    for k in range(3): acende(15.3 + 0.2 * k, 1100 + 80 * k)
    for k in range(4): m.add(16.81 + 0.12 * k, tick(1900 + 100 * k, 0.03), 0.09, nome='responsável')
    for k in range(4): check(m, 18.27 + 0.12 * k, E6 if k % 2 == 0 else G6, ganho=0.07)
    confete_som(m, 18.35, 0.14); fs_sai(19.25)
    ins(19.41, 26.8); linhas(19.51, 3, 0.1); contador(m, 21.21, 0.6, SAI, 6); check(m, 21.8, E6, ganho=0.12); check(m, 23.17, G6, ganho=0.12); acende(25.69, 1200)
    cta(28.42, 27.0)
elif copia == '3':
    fs_entra(1.45); entra(m, 1.5, 520, 0.18); linhas(1.7, 6, 0.08)
    for k in range(3): check(m, 3.74 + 0.25 * k, E6 if k % 2 == 0 else G6, ganho=0.07)
    contador(m, 3.74, 0.9, SAI, 7); confete_som(m, 3.8, 0.14); acende(5.84, 1200); fs_sai(6.95)
    logo(7.12, 7.95)
    ins(8.05, 13.4); linhas(8.15, 3, 0.1); acende(10.1, 1100)
    for k in range(3): check(m, 11.28 + 0.4 * k, E6 if k % 2 == 0 else G6, ganho=0.08)
    ins(13.5, 17.8); linhas(13.6, 2, 0.1); acende(14.76); check(m, 16.58, E6, ganho=0.12); check(m, 17.38, G6, ganho=0.12)
    fs_entra(20.1); entra(m, 20.15, 520, 0.2); linhas(20.35, 5, 0.08); problema(21.6); clique(m, 24.0); problema(24.48); fs_sai(25.25)
    ins(25.35, 29.1); risco(25.45, 0.75); rompe(26.2); risco(27.82, 0.8); problema(27.82)
    ins(29.3, 30.8); m.add(29.48, pop(900, 0.25, 0.6), 0.14, nome='WhatsApp'); m.add(30.18, pop(1000, 0.25, 0.6), 0.14, nome='Instagram')
    marca_expande(30.86); entra(m, 31.91, 520, 0.2); linhas(32.1, 4, 0.08)
    for k in range(4): check(m, 33.4 + 0.25 * k, E6 if k % 2 == 0 else G6, ganho=0.07)
    acende(34.44, 1100); acende(36.32, 1200)
    for k in range(4): m.add(37.46 + 0.18 * k, pop(900 + 80 * k, 0.18, 0.5), 0.09, nome='canal')
    tecla(38.6, 6, 0.6); acende(39.25, 1300); fs_sai(39.95)
    cta(41.08, 40.06)

salvar(m, sys.argv[2])
