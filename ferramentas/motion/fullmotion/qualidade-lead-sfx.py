"""SFX do full motion "qualidade de lead" — tempos iguais aos do qualidade-lead.html.
uso: python qualidade-lead-sfx.py <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from fmsfx import *

m = nova(49.1)

# abertura: dono de SaaS no trono (já na tela no quadro 0), zoom no rosto, "Dono de SaaS" letra a letra
m.add(0.6, baque(0.6, 50), 0.24, nome='abertura: grave')
for i in range(12):
    m.add(0.67 + i * 0.03, tick(2600 + 90 * i, 0.025, pan=-0.5 + i * 0.09), 0.05, nome='letra')
m.add(0.68, vidro(E6, 1.4, 0.8), 0.09, nome='Dono de SaaS: brilho')
m.add(0.62, whoosh(0.85, 300, 1800, pico=0.6, q=1.2), 0.2, nome='zoom no rosto')
m.add(1.4, whoosh(0.7, 2200, 500, pico=0.35, q=1.1, pan=(0.3, -0.6)), 0.2, nome='vai para a esquerda')
entra(m, 1.42, 700, 0.2, pan=0.5)
teclas(m, [1.42, 1.54, 1.66, 1.86, 2.04], 0.12)
sai(m, 2.5)
entra(m, 2.64, 520, 0.22, pan=0.5)
teclas(m, [2.64, 2.82, 2.94, 3.0], 0.12)
m.add(3.05, whoosh(0.3, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 3.62)
m.add(3.72, whoosh(0.6, 500, 2800, pico=0.4, q=1.0), 0.22, nome='CRM abre')
m.add(3.8, pop(400, 0.4, 0.9), 0.22, nome='CRM: pop')
for i in range(8):
    m.add(4.2 + i * 0.09, tick(1900 + 120 * i, 0.03, pan=0.4), 0.08, nome=f'lead {i + 1}')
contador(m, 4.1, 1.0, quintOut, 12, ganho=0.05)
teclas(m, [3.96, 4.08, 4.28, 4.7, 4.94, 5.1])
teclas(m, [5.9, 6.34])
entra(m, 7.76, 700, 0.2, pan=-0.4)
entra(m, 8.6, 760, 0.2, pan=0.4)
QUAL = [2, 6]
for i in range(8):
    t = 9.2 + i * 0.17
    if i in QUAL: m.add(t, vidro(G6, 0.9, 0.8), 0.12, nome='lead qualificado')
    else: m.add(t, tick(1500, 0.03), 0.09, nome='lead descartado')
impacto(m, 10.92, A6)

# 3: Sete? Nove?
sai(m, 11.82)
troca_azul(m, 11.95); arco(m, 12.0); arco(m, 12.9, 1.4)
impacto(m, 12.2, C6)
impacto(m, 13.18, E6)

# 4: curiosos, agenda
troca_azul(m, 13.95, ida=False)
teclas(m, [14.24, 14.68])
for i in range(30):
    m.add(14.32 + (i % 6) * 0.05 + (i // 6) * 0.04, pop(700 + 30 * (i % 7), 0.16, 0.1, pan=((i % 6) - 2.5) * 0.25), 0.05, nome='pessoa')
teclas(m, [15.14, 15.3, 15.5, 15.62])
m.add(15.62, whoosh(0.5, 2200, 700, pico=0.3, q=1.0), 0.1, nome='curiosos apagam')
sai(m, 16.2)
entra(m, 16.32, 460, 0.24)
teclas(m, [16.32, 16.96, 17.16, 17.44, 17.56, 17.7], 0.12)
for k in range(28):
    m.add(16.78 + k * 0.05, pop(520 + 40 * (k % 6), 0.14, 0.2, pan=r.uniform(-0.5, 0.5)), 0.06, nome='bloco na agenda')
m.add(18.24, baque(0.5, 70), 0.16, nome='agenda treme')
entra(m, 18.4, 820, 0.2, pan=0.5)

# 5: não é volume, é FILTRO
sai(m, 19.1)
troca_azul(m, 19.28); arco(m, 19.35, 1.7); arco(m, 21.0, 1.5)
teclas(m, [19.48, 19.62, 19.78, 20.26, 20.76, 20.94])
m.add(21.45, whoosh(0.6, 2000, 600, pico=0.3, q=1.0), 0.14, nome='linha sobe')
m.add(21.5, zip_linha(0.45, 900, 1800), 0.12, nome='risco no volume')
impacto(m, 21.7)

# 6: Blue Ocean entra, funil
sai(m, 22.3)
troca_azul(m, 22.45, ida=False)
teclas(m, [22.54, 22.78, 22.92, 23.2, 23.36, 23.52, 23.7, 24.14])
m.add(23.5, whoosh(0.5, 400, 3000, pico=0.6, q=1.0), 0.22, nome='logo: ar')
m.add(23.56, pop(330, 0.5, 1.0), 0.28, nome='logo: pop')
m.add(23.6, vidro(G6, 1.6, 1.0), 0.12, nome='logo: brilho')
m.add(24.86, whoosh(0.7, 2400, 600, pico=0.4, q=1.0), 0.14, nome='logo sobe')
teclas(m, [24.86, 25.02, 25.22, 25.8, 25.92, 26.02, 26.34], 0.12)
for t, f in [(26.74, 420), (27.62, 520), (28.58, 640)]:
    entra(m, t, f, 0.22)
for i in range(12):
    m.add(28.75 + i * 0.2 + 1.5, vidro([E6, G6, A6][i % 3], 0.5, 0.6, pan=0.1), 0.05, nome='qualificado chega')
entra(m, 30.42, 560, 0.2)
entra(m, 31.44, 760, 0.18, pan=0.5)
check(m, 31.5, D6, pan=0.4, ganho=0.14)

# 7: Tripmee 13% → 70%
sai(m, 32.6)
teclas(m, [32.84, 33.22, 33.74])
sai(m, 34.2)
entra(m, 34.36, 480, 0.26)
m.add(34.42, vidro(G6, 1.4, 0.9), 0.1, nome='tripmee: brilho')
entra(m, 34.86, 700, 0.18, pan=0.3)
entra(m, 36.2, 380, 0.24)
contador(m, 36.52, 0.5, quintOut, 6, ganho=0.06)
contador(m, 37.68, 0.9, cubicInOut, 18, ganho=0.06, f0=2400, f1=4200)
confete_som(m, 38.58)
check(m, 38.62, C6)
teclas(m, [39.22, 39.52, 39.7], 0.12)

# 8: checklist
sai(m, 40.35)
entra(m, 40.55, 600, 0.18)
entra(m, 41.06, 480, 0.2, pan=-0.3)
check(m, 41.9, D6, pan=-0.3, ganho=0.16)
entra(m, 42.78, 520, 0.2, pan=0.3)
check(m, 43.86, E6, pan=0.3, ganho=0.16)

# 9: formulário
sai(m, 44.8)
troca_azul(m, 44.88); arco(m, 44.95); arco(m, 46.6, 1.5)
m.add(45.0, pop(330, 0.5, 1.0), 0.24, nome='logo: pop')
entra(m, 45.1, 420, 0.24)
for i, c in enumerate('R$ 20 mil+'):
    if c != ' ': m.add(45.4 + i * 0.05, tecla(r.uniform(-1, 1)), 0.09, reverb=False, nome='digita')
for i, c in enumerate('Qualidade de lead'):
    if c != ' ': m.add(45.85 + i * 0.03, tecla(r.uniform(-1, 1)), 0.07, reverb=False, nome='digita')
m.add(46.0, whoosh(0.3, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 46.45)
confete_som(m, 46.55, 0.2)
check(m, 46.6, G6)
teclas(m, [46.5, 46.74, 46.9, 47.12, 47.66, 47.78, 47.9])
m.add(47.15, vidro(C7, 1.2, 0.9), 0.1, nome='filtrar: brilho')

salvar(m, sys.argv[1])
