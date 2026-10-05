"""SFX do full motion "Agente de Copy no Blue OS" (v3, respiros só entre frases inteiras) — tempos iguais aos do blueos.html (objeto T).
uso: python blueos-sfx.py <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

m = nova(29.6)


def passo(t, i=0):
    """troca de etapa: a nova desliza, o passo concluído fica verde-água"""
    m.add(t - 0.04, whoosh(0.4, 900, 3200, pico=0.45, q=1.3), 0.13, nome='etapa desliza')
    m.add(t + 0.02, pop(640 + 60 * i, 0.25, 0.4), 0.11, nome='passo concluído')


def camera(t, d=0.8, sobe=True):
    """movimento de câmera (suave)"""
    m.add(t, whoosh(d, 500 if sobe else 2200, 2200 if sobe else 600, pico=0.5, q=1.0), 0.1, nome='câmera')


# 1 ─ "Boa noite, dono de agência" → trilho → Especialistas → Copy
m.add(0.0, whoosh(1.2, 300, 1500, pico=0.6, q=1.0), 0.12, nome='abertura: câmera empurra')
m.add(0.02, vidro(E6, 1.4, 0.9), 0.1, nome='onda: brilho')
camera(2.3, 1.0, False)
m.add(2.95, whoosh(0.4, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 3.55)
m.add(3.6, whoosh(0.35, 1200, 2600, pico=0.4, q=1.5), 0.1, nome='lateral troca')
for i in range(11):
    m.add(3.65 + i * 0.04, tick(1900 + 90 * i, 0.022, pan=-0.5), 0.045, nome='item')
clique(m, 4.25)
camera(4.35, 1.0)
for i, t in enumerate([4.35, 4.45, 4.55, 4.65]):
    m.add(t + 0.04, pop(500 + 70 * i, 0.3, 0.6, pan=0.2), 0.12, nome='peça encaixa')

# 2 ─ "Você escolhe o cliente, sobe aquele anúncio que já vendeu bem e aperta Gerar." (frase inteira)
m.add(5.4, whoosh(0.4, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 5.95)
m.add(6.0, pop(820, 0.2, 0.3), 0.1, nome='lista abre')
for i in range(6):
    m.add(6.02 + i * 0.04, tick(2300 + 100 * i, 0.02), 0.04, nome='opção')
for t in (6.35, 6.55):
    m.add(t, tick(3000, 0.015), 0.05, nome='passa pela opção')
clique(m, 6.75)
check(m, 6.8, E6, ganho=0.12)
camera(6.8, 0.6)
entra(m, 6.95, 760, 0.14, pan=0.4)
passo(6.95, 0)
for i, t in enumerate([7.1, 7.25, 7.4]):
    m.add(t - 0.04, tick(2600 + 150 * i, 0.03), 0.1, nome='+ contador')
    m.add(t, pop(900 + 120 * i, 0.2, 0.3), 0.09, nome='número sobe')
passo(7.6, 1)
m.add(7.65, whoosh(0.3, 2400, 700, pico=0.7, q=1.1), 0.18, nome='arquivo cai')
m.add(7.95, baque(0.35, 70), 0.14, nome='arquivo: pousa')
m.add(7.96, pop(560, 0.3, 0.7), 0.14, nome='arquivo: entra')
m.add(7.97, zip_linha(0.52, 600, 1700), 0.07, nome='upload')
check(m, 8.55, G6, ganho=0.14)
digitar(m, 8.6, 20, 0.45 / 20, ganho=0.05)
passo(9.1, 2)
camera(8.95, 0.65)
m.add(9.1, whoosh(0.4, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 9.95)
m.add(9.97, baque(0.4, 64), 0.16, nome='Gerar: empurra')
m.add(10.02, vidro(C7, 1.2, 0.8), 0.08, nome='gerando: brilho')
camera(10.05, 0.65, False)
for i, t in enumerate([10.1, 10.75, 11.4]):
    m.add(t, tick(2400 + 200 * i, 0.03), 0.08, nome='status do agente')

# 3 ─ "O lote chega inteiro, escrito com o contexto real de quem você atende."
passo(12.4, 4)
m.add(12.3, whoosh(0.8, 300, 2400, pico=0.5, q=0.9), 0.18, nome='o lote chega')
for i in range(3):
    t = 12.6 + i * 0.45
    entra(m, t, 560 + 80 * i, 0.16, pan=-0.2 + 0.2 * i)
    for j in range(3):
        m.add(t + 0.15 + j * 0.12, tick(2600 + 160 * j, 0.018), 0.05, nome='linha da peça')
check(m, 13.9, E6, ganho=0.16)
m.add(13.93, vidro(G6, 1.2, 0.8, pan=-0.3), 0.08, nome='salvo no histórico: brilho')
camera(14.1, 0.55)
for i, t in enumerate([14.75, 15.25, 15.95, 16.45]):
    m.add(t, zip_linha(0.5, 900 + 80 * i, 1900 + 80 * i), 0.06, nome='marca-texto')
camera(15.4, 0.5, False)
camera(17.3, 0.9)

# 4 ─ "Se uma peça não convenceu, ajusta só ela." (frase inteira, câmera parada num quadro só)
m.add(18.45, whoosh(0.6, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 19.5)
m.add(19.52, pop(340, 0.25, 0.8), 0.12, nome='não curti')
clique(m, 19.8)
digitar(m, 19.85, 18, 0.6 / 18, ganho=0.15)
clique(m, 20.5)
m.add(20.52, baque(0.35, 70), 0.13, nome='ajuste: empurra')
m.add(20.55, whoosh(0.25, 3000, 1200, pico=0.4, q=1.2), 0.1, nome='headline velha sai')
digitar(m, 20.6, 28, 0.7 / 28, ganho=0.07, semente=3)
contador(m, 20.6, 0.7, cubicInOut, 10, ganho=0.05)
check(m, 21.4, E6, ganho=0.16)
camera(21.6, 0.6, False)

# 5 ─ "O resto já foi para o designer e para o editor."
passo(22.6, 5)
check(m, 22.75, G6, ganho=0.16)
m.add(22.78, vidro(E6, 1.2, 0.8), 0.08, nome='lote salvo: brilho')
camera(23.1, 0.7, False)
for t0 in (23.6, 24.38):
    for k in range(3):
        m.add(t0 + k * 0.07, whoosh(0.45, 1400 + 200 * k, 3400, pico=0.5, q=1.4, pan=(0.4, -0.5)), 0.07, nome='peça voa')
m.add(24.13, pop(980, 0.25, 0.4, pan=-0.4), 0.15, nome='designer recebe')
check(m, 24.16, E6, pan=-0.4, ganho=0.12)
m.add(24.94, pop(1100, 0.25, 0.4, pan=-0.4), 0.15, nome='editor recebe')
check(m, 24.97, G6, pan=-0.4, ganho=0.12)
m.add(25.4, whoosh(0.32, 600, 5000, pico=0.8, q=1.0), 0.24, nome='mergulho')

# 6 ─ "Agente de copy no Blue OS!"
m.add(25.61, baque(1.1, 44), 0.36, nome='logo: grave')
m.add(25.65, vidro(C7, 2.4, 1.0), 0.16, nome='logo: brilho')
m.add(25.67, vidro(G6, 2.0, 0.8, pan=-0.3), 0.08, nome='logo: brilho 2')
teclas(m, [25.99, 26.69, 26.9], 0.12)
teclas(m, [27.4, 27.82, 28.08], 0.1)
impacto(m, 27.9, E6)

salvar(m, sys.argv[1])
