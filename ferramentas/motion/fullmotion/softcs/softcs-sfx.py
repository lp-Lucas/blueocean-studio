"""SFX da Soft CS — tempos iguais aos de copy1..6.html (linha do tempo da voz montada pelo montar_voz.py).
uso: python softcs-sfx.py <1..6> <saida.wav>"""
import sys, os, json
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, '..'))
from fmsfx import *

SAI = lambda p: 1 - (1 - p) ** 3   # cubicOut (contadores da página)
n = sys.argv[1]
DUR = {'1': 17.25, '2': 13.18, '3': 18.91, '4': 12.22, '5': 12.0, '6': 14.75}[n]
PAL = json.loads(open(os.path.join(AQUI, f'c{n}', 'palavras.js'), encoding='utf8').read().split('=', 1)[1].rstrip(';\n '))
T0 = lambda i: PAL[i][0]
m = nova(DUR)

def titulo(i0, i1, tsai):
    teclas(m, [T0(i) - 0.04 for i in range(i0, i1)], ganho=0.12)
    if tsai < DUR: sai(m, tsai, 0.12)
def janela(t):
    entra(m, max(0.0, t), 560, 0.2)
def passa_som(t):
    m.add(t, whoosh(0.7, 600, 3200, pico=0.5, q=0.9, pan=(0.6, -0.6)), 0.26, nome='troca de tela (empurra)'); m.add(t + 0.55, baque(0.4, 70), 0.1, nome='tela encaixa')
def linhas(t0, k, passo, f=1700):
    for j in range(k): m.add(t0 + j * passo, tick(f + 140 * j, 0.03), 0.08, nome='linha entra')
def acende(t, f=1000):
    m.add(t, pop(f, 0.2, 0.5), 0.1, nome='acende')
def problema(t):
    m.add(t, pop(650, 0.25, 0.7), 0.14, nome='problema'); impacto(m, t + 0.02, A6)
def notif(t):
    m.add(t, pop(1400, 0.18, 0.5), 0.14, nome='notificação'); m.add(t + 0.08, vidro(E6, 0.6, 0.5), 0.06, nome='notificação: brilho')
def bal(t):
    m.add(t, pop(1250, 0.16, 0.5), 0.12, nome='balão chega'); m.add(t + 0.03, tick(2100, 0.02), 0.05, nome='balão: clique')
def tecla(t0, k, d):
    for j in range(k): m.add(t0 + j * d / k, tick(2600 + 90 * (j % 3), 0.02), 0.06, nome='tecla')
def cta(ent, tc, confete=False):
    entra(m, ent, 560, 0.24); clique(m, tc); m.add(tc + 0.02, baque(0.5, 60), 0.12, nome='botão: grave')
    for t in (tc + 0.2, tc + 1.8): m.add(t, vidro(C7, 1.2, 0.6), 0.05, nome='brilho no botão')
    if confete: check(m, tc + 0.05, G6, ganho=0.14); confete_som(m, tc + 0.05, 0.14)

if n == '1':
    janela(0); titulo(0, 8, 4.35)
    m.add(4.75, whoosh(1.75, 900, 2400, pico=0.45, q=1.1), 0.12, nome='planilha rolando'); contador(m, 4.75, 1.75, SAI, 14, ganho=0.04)
    problema(6.95); passa_som(8.2); linhas(8.3, 8, 0.06)
    acende(T0(15), 1100); contador(m, T0(20), 0.6, SAI, 6); problema(T0(21)); notif(T0(21) + 0.25); check(m, 11.75, G6, ganho=0.12)
    sai(m, 12.4, 0.12); titulo(22, 28, 99); cta(12.55, T0(28) + 0.05)
elif n == '2':
    janela(0); titulo(0, 7, 2.85)
    for t in [0.4, 0.9, 1.4, 1.9, 2.4]: notif(t)
    passa_som(3.95); acende(T0(7), 1100)
    for t in [T0(9), T0(10) + 0.05, T0(11) + 0.15]: check(m, t, E6, ganho=0.12)
    contador(m, 6.0, 0.5, SAI, 8); check(m, 6.25, G6, ganho=0.14); confete_som(m, 6.25, 0.14)
    passa_som(7.0); m.add(7.45, pop(880, 0.3, 0.6), 0.1, nome='ligação conecta'); acende(T0(18), 1200)
    for t in [8.35, 9.4]: check(m, t, E6, ganho=0.1)
    sai(m, 10.4, 0.12); titulo(21, 24, 99); cta(10.55, 12.15)
elif n == '3':
    janela(0); titulo(0, 9, 3.2)
    for i in [9, 11, 14, 17]: check(m, T0(i), E6, ganho=0.14); acende(T0(i) + 0.15, 1300)
    m.add(T0(26), whoosh(0.6, 800, 2600, pico=0.5, q=1.2), 0.1, nome='barra de fit'); acende(T0(26) + 0.3, 1100)
    check(m, T0(30), G6, ganho=0.16); confete_som(m, T0(30), 0.16)
    passa_som(14.05); linhas(14.1, 7, 0.06)
    for t in [14.85, 15.2, 15.55]: m.add(t, pop(1200, 0.18, 0.5), 0.1, nome='playbook ✓')
    sai(m, 16.35, 0.12); titulo(37, 43, 99); cta(16.45, 18.2)
elif n == '4':
    janela(0); titulo(0, 8, 2.6)
    for t in [2.75, 3.2, 3.65]: m.add(t, tick(1900, 0.03), 0.1, nome='linha soma'); contador(m, t, 0.4, SAI, 4)
    clique(m, 4.55); m.add(4.57, pop(620, 0.25, 0.7), 0.16, nome='status vira Cancelado'); m.add(4.6, baque(0.4, 60), 0.12, nome='status: grave')
    m.add(T0(13) - 0.1, whoosh(0.45, 700, 2200, pico=0.5, q=1.2), 0.12, nome='linha nova'); contador(m, T0(13) + 0.1, 0.9, SAI, 8)
    problema(T0(16)); sai(m, 8.75, 0.12); titulo(17, 24, 99); cta(8.85, 11.45)
elif n == '5':
    janela(0); titulo(0, 8, 2.5)
    tecla(2.7, 42, 2.0); clique(m, 4.85); m.add(4.88, whoosh(0.35, 900, 2600, pico=0.4, q=1.2), 0.1, nome='envia'); bal(4.95)
    m.add(T0(8), pop(900, 0.2, 0.5), 0.08, nome='lendo'); check(m, T0(11) + 0.3, E6, ganho=0.1)
    bal(T0(13) - 0.05); linhas(T0(13) + 0.2, 4, 0.25); acende(T0(15), 1000)
    clique(m, 8.25); check(m, 8.35, G6, ganho=0.14); confete_som(m, 8.4, 0.14)
    sai(m, 9.15, 0.12); titulo(17, 24, 99); cta(9.25, 11.2)
elif n == '6':
    janela(0); titulo(0, 9, 3.5)
    for i in [9, 12, 15]: acende(T0(i), 1000 + 80 * i); contador(m, T0(i), 0.7, SAI, 6)
    passa_som(7.6)
    for j in range(3): m.add(7.9 + 0.12 * j, pop(1200 + 120 * j, 0.16, 0.5), 0.08, nome='pílula')
    clique(m, 9.55); clique(m, 10.75); m.add(10.77, pop(1300, 0.18, 0.5), 0.08, nome='horário escolhido')
    sai(m, 12.35, 0.12); titulo(29, 32, 99); cta(12.45, 13.8, confete=True)
salvar(m, sys.argv[2])
