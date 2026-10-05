"""SFX das inserções "Não contrate uma agência de marketing" — tempos iguais aos do insercoes-agencia.html (base já cortada).
uso: python insercoes-agencia-sfx.py <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from fmsfx import *

m = nova(63.92)

# 1 · gancho: chave desliga, ✕
entra(m, 0.0, 620, 0.2)
m.add(1.38, tick(1500, 0.04), 0.16, nome='chave desliga')
m.add(1.46, tick(1100, 0.04), 0.1, nome='chave: trava')
impacto(m, 2.38, A6)
sai(m, 3.85)

# 2 · estratégia comprovada → "supostamente"
entra(m, 6.05, 640, 0.2)
check(m, 6.3, E6, ganho=0.1)
m.add(7.9, pop(420, 0.25, 0.7), 0.18, nome='vira ?')
entra(m, 7.92, 760, 0.16, pan=0.4)
for k, a in enumerate([9.5, 9.6, 9.7]):
    m.add(a, tick(1900 + 200 * k, 0.03, pan=-0.4 + 0.4 * k), 0.1, nome='mini ícone')
sai(m, 10.25)

# 3 · tela cheia: círculo fecha → mesmo funil/anúncios/promessas → nome trocando → quadrado abre
m.add(10.41, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha')
m.add(10.85, baque(0.6, 50), 0.22, nome='círculo some: grave')
for a, f in [(11.0, 560), (12.14, 640), (13.5, 720)]:
    entra(m, a, f, 0.18)
    m.add(a + 0.35, tick(2400, 0.03), 0.09, nome='igual')
entra(m, 14.3, 480, 0.22)
for a in [14.62, 14.9, 15.18]:
    m.add(a, tick(2900, 0.03), 0.12, nome='nome troca')
m.add(15.6, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece')
m.add(15.64, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')

# 4 · varejo × software
entra(m, 18.85, 520, 0.18, pan=-0.4)
m.add(20.02, pop(900, 0.25, 0.6), 0.16, nome='= ?')
entra(m, 21.25, 600, 0.18, pan=0.4)
m.add(22.5, tick(2200, 0.03), 0.08, nome='subtítulo')
impacto(m, 24.98, C7)
sai(m, 25.25)

# 5 · produtos / públicos / motivos diferentes
entra(m, 25.62, 560, 0.18, pan=-0.4)
entra(m, 25.82, 640, 0.18, pan=0.4)
m.add(27.05, pop(1000, 0.22, 0.5, pan=-0.4), 0.13, nome='público')
m.add(27.25, pop(1150, 0.22, 0.5, pan=0.4), 0.13, nome='público')
m.add(28.15, tick(2300, 0.03, pan=-0.4), 0.12, nome='como decide')
m.add(28.4, tick(2600, 0.03, pan=0.4), 0.12, nome='como decide')
m.add(30.26, whoosh(0.4, 700, 2600, pico=0.5, q=1.1, pan=(-0.5, 0.5)), 0.14, nome='se afastam')
check(m, 30.32, E6, ganho=0.1)
sai(m, 30.7)

# 6 · o que a agência precisa entender → ✕ em tudo
entra(m, 31.55, 520, 0.2)
for a in [33.5, 34.88, 38.0, 40.4]:
    m.add(a, pop(1100, 0.2, 0.5), 0.12, nome='item')
for k in range(4):
    m.add(43.3 + k * 0.08, tick(900 - 60 * k, 0.05), 0.14, nome='✕')
m.add(43.45, baque(0.5, 52), 0.18, nome='treme: grave')
sai(m, 43.85)

# 7 · estratégia riscada → replicando uma fórmula
troca_azul(m, 43.55)
entra(m, 44.55, 600, 0.16)
for k, a in enumerate([43.92, 44.3, 44.72]):
    m.add(a + 0.12, baque(0.35, 70 + 12 * k), 0.16, nome='bloco encaixa')
    m.add(a + 0.3, tick(2200 + 250 * k, 0.03), 0.1, nome='check do bloco')
impacto(m, 45.62, A6)
m.add(45.7, whoosh(0.8, 1800, 300, pico=0.4, q=1.0), 0.2, nome='blocos desabam')
m.add(46.05, baque(0.6, 45), 0.2, nome='desabou: grave')
entra(m, 45.96, 700, 0.18)
for k, d in enumerate([0, 0.1, 0.2, 0.3, 0.4]):
    m.add(46.4 + d, pop(800 + 90 * k, 0.22, 0.5, pan=-0.5 + 0.25 * k), 0.14, nome='cópia')
entra(m, 47.0, 760, 0.16)
troca_azul(m, 47.72, ida=False)

# 8 · fórmula pronta não garante resultado (espera a onda azul sair)
entra(m, 48.3, 440, 0.22)
m.add(48.5, whoosh(1.2, 800, 2600, pico=0.4, q=1.4), 0.08, nome='gráfico sobe')
m.add(49.1, whoosh(0.6, 2600, 500, pico=0.5, q=1.2), 0.12, nome='gráfico cai')
impacto(m, 49.38, A6)
sai(m, 50.4)

# 9 · conclusão
entra(m, 50.55, 700, 0.2)
impacto(m, 50.8, C7)
sai(m, 51.35)

# 10 · método adaptado ao seu produto / público / momento
teclas(m, [53.18, 53.9, 54.48], 0.12)
for t, f in [(54.78, 620), (55.78, 700), (56.74, 780)]:
    m.add(t - 0.05, whoosh(0.45, 500, 2200, pico=0.5, q=1.0), 0.14, nome='pílula sobe')
    entra(m, t, f, 0.18)
sai(m, 57.9)

# 11 · CTA
entra(m, 59.62, 640, 0.2)
check(m, 60.72, E6, ganho=0.12)
entra(m, 61.05, 760, 0.2)
clique(m, 61.78)
check(m, 61.86, G6, ganho=0.14)
confete_som(m, 61.86, 0.2)

salvar(m, sys.argv[1] if len(sys.argv) > 1 else 'insercoes-agencia-sfx.wav')
