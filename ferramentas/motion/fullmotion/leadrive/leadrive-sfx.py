"""SFX da Leadrive — tempos iguais aos de copy1..5.html (linha do tempo já cortada).
uso: python leadrive-sfx.py <1..5> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

SAI = lambda p: 1 - (1 - p) ** 3   # mesma curva do contador da página (cubicOut)
copia = sys.argv[1]
m = nova({'1': 30.0, '2': 34.15, '3': 31.6, '4': 51.35, '5': 44.7, 'cr1': 35.15, 'cr2': 36.9, 'cr3': 33.3, 'cr4': 38.45, 'cr5': 50.35}[copia])

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
    fs_entra(0.9); entra(m, 0.95, 520, 0.18); linhas(0.98, 7, 0.05); contador(m, 2.21, 1.0, SAI, 6)
    for k in range(4): m.add(2.21 + 0.14 * k, pop(650 if k != 2 else 1000, 0.2, 0.5), 0.1, nome='status vira')
    problema(2.21); tecla(5.63, 8, 0.7); contador(m, 5.63, 1.0, SAI, 6); check(m, 6.6, G6, ganho=0.12); fs_sai(7.55)
    ins(7.65, 10.5); linhas(7.75, 2, 0.1); acende(9.52, 1100); problema(10.06)
    ins(10.6, 19.6); etapas([12.02, 12.5, 13.02, 14.46, 17.44]); check(m, 18.98, G6, ganho=0.14)
    fs_entra(19.85); entra(m, 19.9, 520, 0.2)
    for k in range(3): bal(20.05 + 0.12 * k)
    acende(20.13, 900); linhas(20.6, 4, 0.1); acende(21.55, 1100); clique(m, 23.15); check(m, 23.17, G6, ganho=0.14); confete_som(m, 23.2, 0.14); fs_sai(24.65)
    cta(27.85, 24.75)
elif copia == '2':
    marca_expande(1.3); entra(m, 2.35, 520, 0.2); bal(2.45); bal(2.53); risco(2.92, 0.5); rompe(4.04); problema(4.62); problema(7.9); fs_sai(8.85)
    ins(9.6, 16.95); etapas([9.72, 10.42, 11.36, 12.1]); problema(13.58); problema(16.12)
    fs_entra(17.75); entra(m, 17.8, 520, 0.2); linhas(17.85, 7, 0.05); acende(19.44, 1100); clique(m, 21.82); check(m, 21.84, G6, ganho=0.14)
    acende(23.16, 1000); troca(25.1); linhas(25.3, 3, 0.1)
    for k in range(3): acende(26.52 + 0.12 * k, 1000 + 80 * k)
    contador(m, 27.82, 0.9, SAI, 6); confete_som(m, 27.9, 0.14); fs_sai(28.75)
    cta(32.43, 28.85)
elif copia == '3':
    fs_entra(0.85); entra(m, 0.9, 520, 0.18); linhas(0.98, 5, 0.05); problema(1.36); contador(m, 1.36, 1.3, SAI, 6)
    for k in range(5): check(m, 4.29 + 0.13 * k, E6 if k % 2 == 0 else G6, ganho=0.08)
    contador(m, 4.29, 1.2, SAI, 6); fs_sai(6.0)
    ins(6.2, 13.85)
    for k, t in enumerate((6.31, 8.12, 9.48, 10.5, 11.6, 12.86)): m.add(t, pop(700 + 40 * k, 0.2, 0.5), 0.1, nome='tarefa manual')
    ins(13.95, 19.8); linhas(14.05, 3, 0.1); problema(15.56); risco(17.6, 0.4); risco(17.85, 0.4); problema(17.6); problema(18.9)
    fs_entra(19.85); entra(m, 19.9, 520, 0.2); linhas(20.0, 6, 0.06)
    for k in range(4): acende(21.71 + 0.1 * k, 1000 + 60 * k)
    for k in range(4): m.add(22.71 + 0.14 * k, tick(1900 + 120 * k, 0.03), 0.09, nome='vendedor atribuído')
    for t in (24.27, 24.45, 25.47, 26.1): m.add(t, whoosh(0.5, 800, 2400, pico=0.5, q=1.2), 0.12, nome='cartão muda de etapa'); m.add(t + 0.5, tick(1500, 0.03), 0.08, nome='cartão encaixa')
    check(m, 24.27, G6, ganho=0.12); check(m, 25.5, E6, ganho=0.12); fs_sai(27.2)
    cta(30.06, 27.3)
elif copia == '4':
    fs_entra(0.9); entra(m, 0.95, 520, 0.18); linhas(1.0, 4, 0.06); acende(1.56, 1200); contador(m, 2.54, 0.6, SAI, 5); problema(2.54); check(m, 2.78, G6, ganho=0.12); problema(7.25); fs_sai(7.95)
    ins(8.0, 14.6); etapas([8.91, 9.95, 11.25, 12.45]); problema(13.55); problema(14.47)
    marca_expande(14.6); entra(m, 15.65, 520, 0.2); linhas(15.7, 6, 0.05); contador(m, 15.75, 1.0, SAI, 7); contador(m, 16.75, 1.0, SAI, 7)
    for k in range(3): m.add(19.83 + 0.12 * k, pop(650, 0.2, 0.5), 0.1, nome='receita ?')
    problema(21.39); fs_sai(22.1)
    ins(22.2, 27.8)
    for t in (23.11, 24.04, 25.14, 27.1): m.add(t, pop(680, 0.2, 0.5), 0.11, nome='dúvida')
    fs_entra(27.9); entra(m, 27.95, 520, 0.2); linhas(28.0, 6, 0.05); notif(29.32); tecla(29.78, 10, 1.0); check(m, 30.8, G6, ganho=0.14)
    acende(32.86, 1100); acende(33.98, 1000); troca(35.71); etapas([36.0, 36.33, 36.95]); linhas(37.41, 2, 0.15)
    troca(38.15); acende(38.89, 1100); contador(m, 39.31, 0.9, SAI, 6); confete_som(m, 40.25, 0.14); fs_sai(40.65)
    ins(40.75, 48.85); linhas(40.85, 2, 0.1); contador(m, 42.31, 1.0, SAI, 6); problema(42.63); contador(m, 44.29, 1.0, SAI, 6); check(m, 44.4, G6, ganho=0.12); check(m, 47.71, E6, ganho=0.14)
    cta(49.47, 48.9)
elif copia == '5':
    marca_expande(0.3); entra(m, 1.35, 520, 0.2); bal(1.4); bal(1.46); acende(1.52, 1000); acende(2.04, 1100); problema(4.81); problema(5.58); fs_sai(7.3)
    ins(7.4, 13.55); etapas([7.76, 9.7, 11.04]); problema(12.7)
    ins(13.65, 23.0); linhas(13.75, 3, 0.1); acende(17.0, 900); acende(19.74, 1000); acende(20.62, 1100); problema(22.16)
    fs_entra(23.1); entra(m, 23.15, 520, 0.2); linhas(23.2, 7, 0.05)
    for k in range(4): acende(24.79 + 0.12 * k, 1000 + 60 * k)
    m.add(27.31, pop(1000, 0.2, 0.5), 0.1, nome='oportunidade'); m.add(27.5, pop(1100, 0.2, 0.5), 0.1, nome='oportunidade'); check(m, 28.17, G6, ganho=0.14); confete_som(m, 28.53, 0.14)
    troca(30.2); linhas(30.3, 4, 0.08)
    for t in (31.21, 32.03, 32.51): check(m, t, E6, ganho=0.1); m.add(t + 0.02, whoosh(0.35, 1200, 3000, pico=0.4, q=1.3), 0.08, nome='evento enviado')
    risco(34.87, 0.4); check(m, 35.31, G6, ganho=0.14); fs_sai(38.5)
    cta(42.9, 38.6)

elif copia == 'cr1':
    fs_entra(0.55); entra(m, 0.6, 520, 0.18); bal(0.65); bal(0.71); linhas(0.77, 3, 0.06); problema(3.1)
    for k in range(3): acende(6.36 + 0.14 * k, 1000 + 60 * k)
    problema(8.14); problema(9.16); passa_som(9.5); linhas(9.55, 5, 0.04)
    for k in range(4): m.add(11.1 + 0.08 * k, tick(1900 + 120 * k, 0.03), 0.08, nome='investido acende')
    contador(m, 12.78, 0.8, SAI, 6); confete_som(m, 13.26, 0.14); troca(14.6); linhas(14.7, 3, 0.08); check(m, 15.12, G6, ganho=0.12); problema(16.48)
    troca(17.3); linhas(17.4, 3, 0.08); check(m, 18.5, E6, ganho=0.1); check(m, 19.02, E6, ganho=0.1); check(m, 20.06, G6, ganho=0.14); fs_sai(21.15)
    ins(21.25, 25.0); linhas(21.35, 2, 0.1); acende(23.12, 1000); acende(23.4, 1100); check(m, 24.52, G6, ganho=0.12)
    ins(25.1, 30.35); linhas(25.2, 2, 0.1); acende(26.64, 1000); acende(28.3, 1100); check(m, 29.6, G6, ganho=0.12)
    cta(33.6, 30.45)
elif copia == 'cr2':
    fs_entra(0.5); entra(m, 0.55, 520, 0.18); linhas(0.6, 2, 0.08); tecla(1.1, 22, 2.2); problema(4.0); check(m, 6.82, G6, ganho=0.1); passa_som(7.6); linhas(7.65, 4, 0.04); check(m, 9.7, G6, ganho=0.12); tecla(11.52, 12, 1.2)
    for k, t in enumerate((13.66, 14.2, 14.78, 15.46)): acende(t, 1000 + 70 * k)
    check(m, 17.46, G6, ganho=0.14); fs_sai(18.65)
    ins(18.75, 24.5); linhas(18.85, 2, 0.1); check(m, 20.86, E6, ganho=0.1); check(m, 21.28, E6, ganho=0.1); check(m, 23.0, G6, ganho=0.14)
    fs_entra(24.6); entra(m, 24.65, 520, 0.2); linhas(24.7, 6, 0.04); risco(26.5, 1.4); contador(m, 28.34, 1.0, SAI, 6); confete_som(m, 29.68, 0.14)
    check(m, 30.7, E6, ganho=0.12); check(m, 31.34, G6, ganho=0.12); fs_sai(33.5)
    cta(35.96, 33.55)
elif copia == 'cr3':
    fs_entra(0.5); entra(m, 0.55, 520, 0.18); linhas(0.6, 5, 0.06)
    for k in range(3): m.add(1.78 + 0.12 * k, pop(650, 0.2, 0.5), 0.1, nome='vendas ?')
    problema(3.24); acende(5.44, 1000); problema(6.18); passa_som(6.85); linhas(6.9, 4, 0.04); etapas([7.86, 8.62, 9.02, 9.7]); confete_som(m, 9.94, 0.12)
    acende(11.14, 1000); check(m, 14.42, G6, ganho=0.12); problema(15.76); fs_sai(16.3)
    ins(16.4, 22.45); linhas(16.5, 2, 0.1); check(m, 18.8, E6, ganho=0.1); check(m, 19.22, E6, ganho=0.1); check(m, 20.66, G6, ganho=0.14)
    ins(22.5, 27.8); etapas([22.96, 24.5, 25.8]); check(m, 27.5, G6, ganho=0.14)
    cta(31.1, 27.85)
elif copia == 'cr4':
    marca_expande(0.1); entra(m, 1.15, 520, 0.2); linhas(1.2, 4, 0.06); problema(2.9); problema(3.92); problema(4.9); m.add(5.66, whoosh(0.5, 2200, 500, pico=0.4, q=1.2), 0.1, nome='escurece'); fs_sai(6.05)
    ins(6.15, 15.4); linhas(6.25, 3, 0.1); contador(m, 6.66, 0.8, SAI, 6); contador(m, 7.66, 0.8, SAI, 6); problema(9.56); check(m, 13.18, G6, ganho=0.1); problema(15.02)
    marca_expande(15.4); entra(m, 16.45, 520, 0.2); linhas(16.5, 4, 0.06); problema(18.2); acende(20.0, 900)
    for t in (21.08, 21.64, 22.56): m.add(t, pop(650, 0.2, 0.5), 0.11, nome='lead ruim')
    passa_som(22.95); linhas(23.0, 4, 0.04)
    for k, t in enumerate((24.32, 25.06, 25.66)): acende(t, 1000 + 70 * k)
    contador(m, 26.54, 0.8, SAI, 6); confete_som(m, 26.82, 0.14); troca(28.0); linhas(28.1, 3, 0.08); check(m, 29.38, G6, ganho=0.12)
    check(m, 30.66, E6, ganho=0.1); check(m, 31.68, E6, ganho=0.1); fs_sai(32.4)
    ins(32.5, 36.95); linhas(32.6, 3, 0.1)
    for k, t in enumerate((32.9, 33.86, 35.88)): check(m, t, E6 if k % 2 == 0 else G6, ganho=0.1)
    cta(37.6, 37.0)
elif copia == 'cr5':
    marca_expande(0.55); entra(m, 1.6, 520, 0.2); linhas(1.65, 3, 0.06); problema(3.26); problema(4.46); contador(m, 5.6, 1.3, SAI, 8); problema(6.44); fs_sai(7.15)
    ins(7.25, 12.35); linhas(7.35, 2, 0.1); acende(9.02, 1000); problema(11.34)
    ins(12.45, 20.05); linhas(12.55, 2, 0.1); problema(14.54); contador(m, 16.06, 2.6, SAI, 10); problema(17.62); problema(19.32)
    fs_entra(20.1); entra(m, 20.15, 520, 0.2); linhas(20.2, 4, 0.06); acende(20.64, 900); etapas([22.28, 22.98, 23.6, 24.4, 25.46, 26.46]); risco(28.1, 1.5); check(m, 29.5, G6, ganho=0.14)
    for t in (31.42, 32.12, 33.14): check(m, t, E6, ganho=0.1); m.add(t + 0.02, whoosh(0.35, 1200, 3000, pico=0.4, q=1.3), 0.08, nome='evento enviado')
    confete_som(m, 33.14, 0.14); fs_sai(33.5)
    ins(33.6, 39.2); linhas(33.7, 2, 0.1); check(m, 35.18, G6, ganho=0.12); check(m, 36.32, E6, ganho=0.1); contador(m, 37.22, 1.4, SAI, 8)
    fs_entra(39.3); entra(m, 39.35, 520, 0.2); linhas(39.4, 6, 0.04); contador(m, 41.48, 1.0, SAI, 6); confete_som(m, 41.9, 0.14); contador(m, 42.7, 1.2, SAI, 6); check(m, 44.12, G6, ganho=0.12); fs_sai(44.4)
    cta(47.94, 44.5)

salvar(m, sys.argv[2])
