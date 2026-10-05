"""SFX das inserções "SaaS crescendo sem ficar saudável" (Mateus) — tempos iguais aos do insercoes-mateus.html (base já cortada).
uso: python insercoes-mateus-sfx.py <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from fmsfx import *

m = nova(55.74)

# 1 · gancho: crescimento sobe, CAC dispara, tranco no "caro"
entra(m, 0.0, 620, 0.2)
contador(m, 0.15, 1.1, quintOut, 8, ganho=0.045)
entra(m, 2.3, 520, 0.16)
contador(m, 3.3, 1.3, cubicInOut, 10, ganho=0.05, f0=1800, f1=3000)
impacto(m, 4.64, A6)
sai(m, 4.9)

# 2 · tela cheia clara: círculo fecha → MRR sobe → contratos → "parece" evoluindo → quadrado abre
m.add(4.96, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha')
m.add(5.4, baque(0.6, 50), 0.22, nome='círculo some: grave')
entra(m, 5.25, 560, 0.2)
contador(m, 5.4, 1.2, quintOut, 12, ganho=0.05)
for k in range(6):
    m.add(5.5 + k * 0.08, tick(1600 + 150 * k, 0.03), 0.07, nome='barra')
for k, a in enumerate([6.36, 6.68, 7.24]):
    m.add(a, pop(900 + 120 * k, 0.22, 0.5, pan=(-0.4, 0.4, 0)[k]), 0.15, nome='novo contrato')
    check(m, a + 0.05, (E6, G6, A6)[k], ganho=0.07)
entra(m, 7.9, 800, 0.14)
entra(m, 9.5, 640, 0.2)
m.add(9.84, pop(420, 0.25, 0.7, pan=0.4), 0.16, nome='"parece"')
m.add(11.05, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece')
m.add(11.09, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')

# 3 · custo para sustentar o crescimento
entra(m, 12.3, 480, 0.22)
for a in [15.22, 16.02, 17.2]:
    m.add(a, pop(1000, 0.22, 0.5), 0.13, nome='custo entra')
    contador(m, a + 0.1, 0.6, cubicInOut, 4, ganho=0.04, f0=2000, f1=2600)
impacto(m, 17.45, C7)
sai(m, 17.9)

# 4 · olhando apenas para a receita: o resto desfoca
entra(m, 18.1, 620, 0.2)
m.add(20.4, whoosh(0.6, 2400, 600, pico=0.4, q=1.0), 0.12, nome='painel desfoca')
check(m, 21.3, E6, ganho=0.09)
sai(m, 21.9)

# 5 · CAC sobe, margem cai, payback alonga
entra(m, 22.05, 520, 0.18, pan=-0.4)
contador(m, 22.35, 0.9, cubicInOut, 8, ganho=0.045, f0=1800, f1=3000)
entra(m, 23.1, 600, 0.18, pan=0.4)
contador(m, 23.3, 0.8, cubicInOut, 6, ganho=0.045, f0=3000, f1=1800)
entra(m, 24.3, 440, 0.2)
contador(m, 25.0, 2.2, cubicInOut, 8, ganho=0.045, f0=2200, f1=1500)
sai(m, 27.9)

# 6 · crescendo ✓ × saudável ✕
entra(m, 28.1, 640, 0.2)
check(m, 29.3, E6, ganho=0.12)
m.add(30.9, tick(900, 0.05), 0.16, nome='✕ saudável')
m.add(30.95, baque(0.5, 52), 0.18, nome='✕: grave')
sai(m, 31.3)

# 7 · tela cheia clean: gráfico retenção × CAC → gerenciador de anúncios → cliente cancela antes de se pagar
troca_azul(m, 31.5)
entra(m, 31.75, 560, 0.2)
m.add(32.1, whoosh(1.4, 900, 2600, pico=0.5, q=1.3), 0.08, nome='linhas se desenham')
m.add(33.1, pop(900, 0.22, 0.5, pan=0.4), 0.14, nome='retenção 71%')
m.add(33.6, tick(2400, 0.03), 0.12, nome='cruzam')
m.add(33.7, pop(1200, 0.22, 0.5, pan=0.4), 0.14, nome='CAC R$ 1.250')
sai(m, 34.4)
entra(m, 34.6, 480, 0.22)
for k in range(3):
    m.add(34.85 + k * 0.1, tick(1900 + 200 * k, 0.03), 0.08, nome='linha da tabela')
contador(m, 35.76, 0.7, quintOut, 10, ganho=0.05)
impacto(m, 36.08, A6)
entra(m, 36.9, 560, 0.2)
contador(m, 37.25, 0.5, cubicInOut, 3, ganho=0.04, f0=2000, f1=2400)
m.add(37.76, tick(800, 0.05), 0.16, nome='cancelou')
m.add(37.8, baque(0.5, 50), 0.18, nome='cancelou: grave')
contador(m, 38.3, 0.5, quintOut, 4, ganho=0.04, f0=1800, f1=2200)
entra(m, 38.62, 640, 0.2)
m.add(38.74, baque(0.6, 46), 0.2, nome='não se pagou: grave')
troca_azul(m, 39.4, ida=False)

# 8/9 · crescimento sustentável = 4 pontos → lucro
entra(m, 39.8, 600, 0.2)
impacto(m, 42.2, C7)
for k, a in enumerate([43.04, 44.2, 45.36, 46.34]):
    entra(m, a, 560 + 60 * k, 0.16, pan=(-0.4, 0.4, -0.4, 0.4)[k])
    check(m, a + 0.35, (E6, G6, A6, C7)[k], pan=(-0.4, 0.4, -0.4, 0.4)[k], ganho=0.08)
entra(m, 47.8, 760, 0.2)
check(m, 47.95, G6, ganho=0.14)
confete_som(m, 47.9, 0.2)
sai(m, 48.55)

# 10 · MRR cresceu × ficou no caixa
entra(m, 49.0, 620, 0.2)
contador(m, 50.9, 1.0, cubicInOut, 10, ganho=0.05)
contador(m, 54.4, 0.8, cubicInOut, 4, ganho=0.05, f0=1600, f1=2000)
impacto(m, 55.26, A6)

salvar(m, sys.argv[1] if len(sys.argv) > 1 else 'insercoes-mateus-sfx.wav')
