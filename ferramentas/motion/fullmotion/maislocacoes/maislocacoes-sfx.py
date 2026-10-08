"""SFX da Mais Locações — tempos iguais aos de copy1..8.html (linha do tempo já cortada).
uso: python maislocacoes-sfx.py <1..8> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

SAI = lambda p: 1 - (1 - p) ** 3   # mesma curva do contador da página (cubicOut)
copia = sys.argv[1]
m = nova({'1': 28.6, '2': 20.73, '3': 20.13, '4': 30.38, '5': 23.31, '6': 21.17, '7': 17.19, '8': 20.31}[copia])

def fs_entra(t):
    m.add(t, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha'); m.add(t + 0.42, baque(0.6, 50), 0.22, nome='círculo some: grave')
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
def pinos(t0, n, passo):
    for k in range(n): m.add(t0 + k * passo, pop(900 + 60 * k, 0.18, 0.5), 0.09, nome='pino cai')
def risco(t, d=0.6):
    m.add(t, whoosh(d, 1200, 2800, pico=0.5, q=1.4), 0.1, nome='traço se desenha')
def notif(t):
    m.add(t, pop(1400, 0.18, 0.5), 0.14, nome='notificação'); m.add(t + 0.08, vidro(E6, 0.6, 0.5), 0.06, nome='notificação: brilho')
def logo(t, tsai):
    entra(m, t, 620, 0.22); sai(m, tsai)
def ins(t, tsai):
    entra(m, t, 560, 0.2); sai(m, tsai)
def cta(tc, ent):
    entra(m, ent, 560, 0.24); clique(m, tc); m.add(tc + 0.02, baque(0.5, 60), 0.12, nome='botão: grave')
    for t in (tc + 0.15, tc + 1.75): m.add(t, vidro(C7, 1.2, 0.6), 0.05, nome='brilho no botão')
def oferta(ent, tag, dez, jan, sai_):
    fs_entra(ent - 0.05); entra(m, ent, 520, 0.2); linhas(ent + 0.2, 3, 0.1)
    acende(tag, 1150); check(m, dez, E6, ganho=0.14); confete_som(m, dez + 0.07, 0.16); check(m, jan, G6, ganho=0.14)
    fs_sai(sai_)

if copia == '1':
    fs_entra(1.0); entra(m, 1.05, 520, 0.18); pinos(1.35, 6, 0.08)
    for k in range(6): m.add(2.88 + 0.22 * k, tick(1500 - 60 * k, 0.03), 0.08, nome='pino vira ?')
    problema(5.12); fs_sai(6.22)
    ins(6.32, 12.1); acende(7.08); risco(8.9, 0.5); risco(9.7, 0.5); risco(10.4, 0.6); problema(11.86)
    logo(12.3, 13.5)
    fs_entra(13.65); entra(m, 13.7, 520, 0.2); m.add(14.5, whoosh(2.2, 600, 1400, pico=0.4, q=0.9), 0.08, nome='caminhão anda')
    pinos(15.96, 6, 0.12); acende(17.54, 1200); notif(19.8); check(m, 19.9, E6, ganho=0.12)
    fs_sai(21.3)
    ins(21.4, 23.95); m.add(22.36, pop(500, 0.25, 0.6), 0.1, nome='grupo silenciado'); m.add(23.52, pop(900, 0.2, 0.5), 0.1, nome='WhatsApp')
    cta(26.3, 24.12)
elif copia == '2':
    fs_entra(0.9); entra(m, 0.95, 520, 0.18); linhas(1.15, 4, 0.08)
    for k in range(4): m.add(2.18 + 0.2 * k, pop(700 - 30 * k, 0.2, 0.6), 0.1, nome='ligar p/ confirmar')
    problema(3.48); fs_sai(4.15)
    logo(4.22, 5.15)
    fs_entra(5.3); entra(m, 5.35, 520, 0.2); m.add(5.8, whoosh(1.9, 600, 1400, pico=0.4, q=0.9), 0.08, nome='caminhão anda')
    pinos(7.0, 6, 0.12); acende(9.1, 1200); fs_sai(10.75)
    ins(10.9, 17.1); linhas(11.0, 3, 0.08)
    m.add(12.28, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.14, nome='risca planilha'); check(m, 12.94, E6, ganho=0.12)
    acende(14.72); check(m, 15.96, G6, ganho=0.12)
    m.add(17.9, pop(900, 0.2, 0.5), 0.1, nome='WhatsApp'); cta(19.1, 17.34)
elif copia == '3':
    fs_entra(1.0); entra(m, 1.05, 520, 0.18); linhas(1.25, 4, 0.08)
    for k in range(3): m.add(3.32 + 0.18 * k, pop(700 - 40 * k, 0.22, 0.6), 0.11, nome='diária sem cobrar')
    contador(m, 4.0, 0.6, SAI, 8); problema(4.0); fs_sai(4.85)
    ins(4.96, 8.6); check(m, 7.98, E6, ganho=0.12)
    oferta(8.9, 9.36, 11.88, 15.3, 16.25)
    cta(17.6, 16.38)
elif copia == '4':
    fs_entra(1.0); entra(m, 1.05, 520, 0.18); linhas(1.25, 4, 0.08)
    for k in range(2): m.add(3.5 + 0.2 * k, pop(680 - 40 * k, 0.22, 0.6), 0.11, nome='vencido')
    problema(4.5); fs_sai(5.55)
    ins(5.68, 10.35); contador(m, 6.42, 0.5, SAI, 6); m.add(9.02, pop(650, 0.25, 0.7), 0.12, nome='venceu'); problema(9.52)
    ins(10.6, 13.15); risco(10.7, 0.55); m.add(11.18, pop(650, 0.25, 0.7), 0.12, nome='avaria'); impacto(m, 11.52, A6); acende(12.26, 700)
    logo(13.34, 14.35)
    fs_entra(14.5); entra(m, 14.55, 520, 0.2); linhas(14.75, 3, 0.08)
    for k in range(3): check(m, 15.08 + 0.16 * k, G6, ganho=0.06)
    troca(16.15); linhas(16.4, 3, 0.1); acende(17.14, 700); notif(17.98)
    fs_sai(19.95)
    ins(20.06, 23.65); check(m, 20.8, E6, ganho=0.1); check(m, 21.24, G6, ganho=0.1); acende(21.8, 1200)
    cta(27.0, 23.89)
elif copia == '5':
    fs_entra(0.9); entra(m, 0.95, 520, 0.18); linhas(1.15, 3, 0.1)
    problema(2.92); contador(m, 3.0, 0.5, SAI, 6); contador(m, 3.52, 0.7, SAI, 8); fs_sai(4.65)
    logo(4.82, 5.8)
    fs_entra(5.95); entra(m, 6.0, 520, 0.2); linhas(6.2, 4, 0.1); notif(6.4); acende(8.2)
    check(m, 10.24, E6, ganho=0.12); acende(12.22, 1100); check(m, 13.74, G6, ganho=0.16); confete_som(m, 13.82, 0.16)
    fs_sai(14.4)
    ins(14.54, 18.75); check(m, 15.5, E6, ganho=0.1); check(m, 16.04, G6, ganho=0.1); acende(16.48, 1200)
    cta(20.6, 18.96)
elif copia == '6':
    fs_entra(1.0); entra(m, 1.05, 520, 0.18); linhas(1.25, 3, 0.1)
    acende(3.44, 800)
    for k in range(3): m.add(4.38 + 0.2 * k, pop(700 - 40 * k, 0.22, 0.6), 0.11, nome='parada há dias')
    problema(5.36); fs_sai(5.95)
    ins(6.18, 8.75); check(m, 8.1, E6, ganho=0.12)
    oferta(9.0, 9.3, 11.58, 14.88, 15.75)
    cta(16.95, 15.84)
elif copia == '7':
    fs_entra(0.95); entra(m, 1.0, 520, 0.18); pinos(1.2, 5, 0.08)
    for k in range(5): m.add(2.48 + 0.2 * k, tick(1500 - 60 * k, 0.03), 0.08, nome='pino vira ?')
    problema(3.62); fs_sai(4.2)
    logo(4.34, 5.1)
    fs_entra(5.25); entra(m, 5.3, 520, 0.2); linhas(5.45, 3, 0.1)
    for k, t in enumerate((5.7, 6.1, 6.68)): acende(t, 1000 + 120 * k)
    m.add(7.3, tick(2400, 0.03), 0.08, nome='próximo container'); m.add(7.6, tick(2600, 0.03), 0.08, nome='próximo container')
    check(m, 9.08, G6, ganho=0.12); fs_sai(10.3)
    ins(10.4, 14.15); check(m, 12.32, E6, ganho=0.1); check(m, 12.8, G6, ganho=0.1); acende(13.64, 1200)
    cta(15.5, 14.36)
elif copia == '8':
    fs_entra(0.8); entra(m, 0.85, 520, 0.18); pinos(1.0, 2, 0.1); risco(1.2, 1.2)
    impacto(m, 2.44, A6); m.add(2.44, whoosh(0.3, 2000, 600, pico=0.4, q=1.4), 0.12, nome='rastro rompe'); problema(2.82)
    fs_sai(3.3)
    ins(3.42, 6.75); check(m, 4.28, E6, ganho=0.12); acende(6.06, 1100)
    oferta(6.95, 7.28, 10.36, 13.64, 14.65)
    cta(16.4, 14.76)

salvar(m, sys.argv[2])
