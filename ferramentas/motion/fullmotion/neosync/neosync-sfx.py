"""SFX da Neosync — tempos iguais aos de copy1.html / copy2.html (linha do tempo já cortada).
uso: python neosync-sfx.py <1|2> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

copia = sys.argv[1]
m = nova({'1': 35.5, '2': 46.36, '3': 54.18}[copia])

def papel(t, dur=0.6, ganho=0.22, pan=(0, 0)):
    m.add(max(0, t), whoosh(dur, 500, 2400, pico=0.45, q=0.7, pan=pan), ganho, nome='papel desliza')
    for k in range(10):
        m.add(t + 0.05 + k * dur / 12, tick(r.uniform(2500, 5200), 0.012, pan=r.uniform(-0.3, 0.3)), ganho * 0.12, nome='papel: atrito')
def marca(t, dur, ganho=0.14):
    m.add(t, whoosh(dur, 2200, 3400, pico=0.5, q=2.2), ganho, nome='marca-texto')
def caneta(t, dur, ganho=0.12, n=None):
    n = n or int(dur / 0.045)
    for k in range(n):
        m.add(t + k * dur / n + r.uniform(-0.01, 0.01), tick(r.uniform(1800, 4200), 0.02, pan=r.uniform(-0.2, 0.2)), ganho * r.uniform(0.4, 1), nome='caneta')
def postit(t):
    m.add(t, pop(240, 0.25, 0.9), 0.24, nome='post-it bate'); m.add(t + 0.02, baque(0.25, 90), 0.12, nome='post-it: grave')
def fs_entra(t):
    m.add(t, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha'); m.add(t + 0.42, baque(0.6, 50), 0.22, nome='círculo some: grave')
def marca_expande(t0):
    m.add(t0, pop(520, 0.3, 0.8), 0.22, nome='ícone da marca pula'); m.add(t0 + 0.04, tick(1800, 0.03), 0.1, nome='ícone: clique')
    m.add(t0 + 0.6, whoosh(0.55, 500, 2800, pico=0.6, q=0.9), 0.26, nome='fundo do ícone expande'); m.add(t0 + 1.05, baque(0.5, 55), 0.18, nome='tela cheia: grave')
def fs_sai(t):
    m.add(t, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece'); m.add(t + 0.04, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')

if copia == '1':
    # relatório impresso
    # layout das campanhas
    marca_expande(0.86); entra(m, 1.9, 520, 0.18)
    for k in range(6): m.add(1.5 + k * 0.1, tick(1700 + 140 * k, 0.03), 0.08, nome='linha da campanha')
    m.add(2.9, pop(700, 0.25, 0.7), 0.14, nome='total gasto')
    m.add(4.95, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='linha acende'); m.add(5.85, pop(650, 0.25, 0.7), 0.14, nome='lance errado')
    m.add(6.55, pop(650, 0.25, 0.7), 0.13, nome='orçamento 300'); m.add(7.25, pop(1100, 0.25, 0.6), 0.12, nome='orçamento 20')
    m.add(8.6, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='coluna ACoS acende')
    contador(m, 8.7, 0.9, cubicInOut, 9, ganho=0.045, f0=2600, f1=3800)
    m.add(10.2, whoosh(0.45, 2400, 700, pico=0.4, q=1.1), 0.14, nome='notificação sobe'); m.add(10.3, pop(880, 0.25, 0.7), 0.16, nome='notificação')
    impacto(m, 11.62, A6)
    fs_sai(12.55)
    # inserções
    entra(m, 12.72, 620, 0.22); sai(m, 13.9)
    entra(m, 13.95, 560, 0.2)
    for k in range(3): m.add(14.2 + k * 0.12, tick(1700 + 140 * k, 0.03), 0.08, nome='linha entra')
    sai(m, 16.4)
    entra(m, 16.48, 600, 0.2)
    m.add(17.4, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.12, nome='risca lance'); m.add(17.65, pop(1000, 0.2, 0.5), 0.1, nome='lance novo')
    m.add(17.85, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.12, nome='risca orçamento'); m.add(18.1, pop(1150, 0.2, 0.5), 0.1, nome='orçamento novo')
    check(m, 18.5, E6, ganho=0.12)
    sai(m, 19.35)
    entra(m, 19.4, 520, 0.2)
    for k in range(7): m.add(19.6 + k * 0.17, pop(800 + 90 * k, 0.15, 0.4), 0.07, nome='peça da regra')
    # plataforma
    fs_entra(21.62); entra(m, 21.9, 520, 0.2)
    for k in range(3): m.add(22.05 + k * 0.15, tick(2000 + 200 * k, 0.03), 0.09, nome='campo preenche')
    m.add(22.45, tick(1200, 0.04), 0.12, nome='chave liga')
    clique(m, 22.66); check(m, 22.72, G6, ganho=0.16); confete_som(m, 22.8, 0.16)
    m.add(23.55, whoosh(0.45, 900, 2600, pico=0.5, q=1.2), 0.12, nome='troca para o log')
    for k in range(6): m.add(24.1 + k * 0.32, pop(900 + 80 * k, 0.15, 0.4), 0.07, nome='ajuste do dia')
    m.add(27.6, pop(1250, 0.25, 0.6), 0.12, nome='zero acessos')
    fs_sai(28.6)
    # para quem é + CTA
    entra(m, 28.78, 560, 0.18); check(m, 28.9, E6, ganho=0.1)
    entra(m, 30.6, 620, 0.18); impacto(m, 31.8, A6)
    sai(m, 32.1)
    entra(m, 32.25, 560, 0.24); clique(m, 33.0); m.add(33.02, baque(0.5, 60), 0.12, nome='botão: grave')
    for t in (33.3, 34.9): m.add(t, vidro(C7, 1.2, 0.6), 0.05, nome='brilho no botão')
elif copia == '3':
    # layout: vendas sem lucro → a conta
    marca_expande(2.1); entra(m, 3.15, 520, 0.18)
    contador(m, 3.1, 1.6, cubicInOut, 12, ganho=0.04)
    for k in range(6): m.add(3.25 + k * 0.2, pop(900 + 70 * k, 0.15, 0.4), 0.06, nome='pedido entra')
    m.add(4.5, pop(650, 0.25, 0.7), 0.14, nome='lucro ???')
    m.add(5.6, tick(2200, 0.03), 0.08, nome='vendas acendem')
    clique(m, 7.5); m.add(7.55, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='troca de aba')
    for k, t in enumerate((8.12, 9.3, 10.42, 10.98)): m.add(t, tick(1700 + 160 * k, 0.03), 0.09, nome='custo')
    m.add(12.7, pop(700, 0.25, 0.7), 0.14, nome='sobra ???'); impacto(m, 14.0, A6)
    fs_sai(15.15)
    # inserções
    entra(m, 15.3, 620, 0.22); check(m, 16.8, E6, ganho=0.1); sai(m, 17.8)
    entra(m, 19.98, 560, 0.2); check(m, 20.65, G6, ganho=0.1)
    for k, t in enumerate((23.68, 24.58, 25.48)): m.add(t, tick(1700 + 160 * k, 0.03), 0.09, nome='custo Amazon')
    m.add(28.2, pop(700, 0.25, 0.7), 0.13, nome='sai do bolso'); sai(m, 29.35)
    # plataforma
    fs_entra(29.45); entra(m, 29.75, 520, 0.2)
    for t0, n in ((32.25, 8), (33.3, 8), (33.85, 7), (34.6, 2)):
        for k in range(n): m.add(t0 + k * 0.35 / n, tick(r.uniform(2600, 3600), 0.02), 0.06, nome='digita')
    clique(m, 37.35); check(m, 37.4, G6, ganho=0.15); m.add(38.0, pop(1150, 0.2, 0.5), 0.08, nome='aplicado')
    m.add(39.9, whoosh(0.45, 900, 2600, pico=0.5, q=1.2), 0.12, nome='troca de tela')
    m.add(41.7, pop(880, 0.25, 0.7), 0.16, nome='venda nova')
    m.add(44.76, pop(1000, 0.2, 0.5), 0.1, nome='lado Amazon'); m.add(45.79, pop(1150, 0.2, 0.5), 0.1, nome='lado operação')
    contador(m, 47.55, 0.9, quintOut, 10, ganho=0.045); check(m, 47.6, E6, ganho=0.15); confete_som(m, 47.75, 0.16)
    m.add(49.4, pop(700, 0.2, 0.5), 0.1, nome='planilha'); m.add(49.75, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.14, nome='risca planilha')
    fs_sai(50.55)
    entra(m, 50.7, 560, 0.24); clique(m, 52.9); m.add(52.92, baque(0.5, 60), 0.12, nome='botão: grave')
    m.add(53.1, vidro(C7, 1.0, 0.6), 0.05, nome='brilho no botão')
elif copia == '2':
    # layout: campanhas no escuro, troca de abas, a conta do lucro
    marca_expande(1.42); entra(m, 2.45, 520, 0.18)
    for k in range(5): m.add(2.9 + k * 0.12, tick(1700 + 140 * k, 0.03), 0.08, nome='linha da campanha')
    m.add(4.3, whoosh(0.9, 1800, 300, pico=0.4, q=0.8), 0.16, nome='tela apaga')
    m.add(4.35, tick(900, 0.05), 0.14, nome='interruptor')
    m.add(5.85, tick(1100, 0.05), 0.12, nome='tela volta')
    for t in (6.2, 7.5, 8.8, 9.5): clique(m, t)
    m.add(7.8, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='coluna ACoS acende')
    for k in range(5): m.add(7.92 + k * 0.08, pop(900 + 90 * k, 0.15, 0.4), 0.06, nome='ACoS colore')
    for k, t in enumerate((9.95, 10.45, 11.0, 11.6)): m.add(t, tick(1700 + 160 * k, 0.03), 0.09, nome='linha da conta')
    m.add(12.25, pop(700, 0.25, 0.7), 0.14, nome='lucro ???'); impacto(m, 13.05, A6)
    fs_sai(13.95)
    # inserções
    entra(m, 14.15, 480, 0.18); m.add(16.6, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.15, nome='risca nacional'); sai(m, 17.3)
    entra(m, 17.45, 560, 0.2); contador(m, 18.8, 0.7, quintOut, 8, ganho=0.05); impacto(m, 18.95, A6); sai(m, 20.2)
    entra(m, 20.3, 620, 0.22); sai(m, 22.55)
    entra(m, 22.6, 560, 0.2); contador(m, 23.4, 1.6, cubicInOut, 14, ganho=0.045, f0=3800, f1=2600)
    check(m, 23.85, E6, ganho=0.12); m.add(24.3, pop(1000, 0.2, 0.5), 0.08, nome='lance'); m.add(25.3, pop(1150, 0.2, 0.5), 0.08, nome='meta')
    # plataforma: ROI real
    fs_entra(25.98); entra(m, 26.25, 520, 0.2)
    clique(m, 26.95); m.add(27.15, pop(900, 0.2, 0.5), 0.1, nome='vendas')
    m.add(28.4, tick(1500, 0.03), 0.08, nome='seção')
    for k in range(3): m.add(28.6 + k * 0.18, tick(1700 + 140 * k, 0.03), 0.09, nome='custo Amazon')
    m.add(29.6, tick(1500, 0.03), 0.08, nome='seção')
    for k in range(3): m.add(29.8 + k * 0.18, tick(1900 + 140 * k, 0.03), 0.09, nome='custo operação')
    contador(m, 30.45, 0.9, quintOut, 10, ganho=0.045); check(m, 30.5, G6, ganho=0.14)
    fs_sai(31.05)
    # feedback, pronto, escuro
    entra(m, 31.25, 560, 0.2); m.add(31.9, pop(1200, 0.25, 0.6), 0.12, nome='mensagem 1'); m.add(33.6, pop(1350, 0.25, 0.6), 0.12, nome='mensagem 2'); sai(m, 34.95)
    entra(m, 35.1, 600, 0.18); check(m, 35.2, E6, ganho=0.1)
    entra(m, 37.35, 480, 0.18); m.add(38.0, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.15, nome='risca escuro')
    sai(m, 38.75)
    entra(m, 38.85, 560, 0.24); clique(m, 42.9); m.add(42.92, baque(0.5, 60), 0.12, nome='botão: grave')
    for t in (43.2, 44.8): m.add(t, vidro(C7, 1.2, 0.6), 0.05, nome='brilho no botão')

salvar(m, sys.argv[2])
