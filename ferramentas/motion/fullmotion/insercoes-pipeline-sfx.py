"""SFX das inserções "Pipeline cheio" — tempos iguais aos do insercoes-pipeline.html.
uso: python insercoes-pipeline-sfx.py <saida.wav> [cortes.json]
(cortes.json = silêncios cortados [[a, b], ...] nos tempos antigos; cada som vai para o tempo novo)"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from fmsfx import *

import json
CORTES = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else []
def novo(t):   # tempo antigo → tempo depois de tirar os silêncios (som dentro de um corte vai para o ponto do corte)
    d = 0
    for a, b in CORTES:
        if t >= b: d += b - a
        elif t > a: d += t - a
    return t - d
m = nova(63.28 - sum(b - a for a, b in CORTES))
_add = m.add
m.add = lambda t, *a, **k: _add(max(0, novo(t)), *a, **k)

# 1 · gancho: meta do mês enchendo e travando, pipeline cheio
entra(m, 0.0, 620, 0.2)
contador(m, 0.15, 1.5, quintOut, 10, ganho=0.05)
m.add(1.12, tick(900, 0.05), 0.14, nome='não vai bater: trava')
entra(m, 2.3, 760, 0.18, pan=0.2)
contador(m, 2.4, 0.9, quintOut, 8, ganho=0.045, f0=2600, f1=3800)
sai(m, 3.4)

# 2 · tela cheia: círculo fecha → pipeline cheio → só 2 com chance real → volta no quadrado
m.add(5.66, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha')
m.add(6.1, baque(0.6, 50), 0.22, nome='círculo some: grave')
entra(m, 6.2, 520, 0.2)
for k in range(9):
    m.add(6.4 + k * 0.08, tick(1700 + 110 * k, 0.03, pan=-0.5 + (k // 3) * 0.5), 0.08, nome='negociação entra')
contador(m, 6.35, 1.4, quintOut, 14, ganho=0.05)
for k, d in enumerate([0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48]):
    m.add(9.0 + d, tick(1200 - 60 * k, 0.04), 0.09, nome='sem chance real')
m.add(9.4, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.16, nome='risco no total')
check(m, 9.65, E6, ganho=0.12)
entra(m, 9.55, 760, 0.18)
impacto(m, 9.95, A6)
m.add(10.86, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece')
m.add(10.9, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')

# 3 · proposta enviada há semanas
m.add(11.25, whoosh(0.5, 2400, 700, pico=0.4, q=1.1), 0.18, nome='notificação desce')
m.add(11.35, pop(880, 0.25, 0.7), 0.2, nome='notificação: pop')
contador(m, 11.85, 0.55, cubicInOut, 2, ganho=0.06)
m.add(12.5, tick(2200, 0.03), 0.1, nome='visualizada')
sai(m, 13.75)

# 4 · perdidas, mas contabilizadas como receita provável
entra(m, 15.15, 480, 0.16, pan=-0.4)
entra(m, 16.4, 520, 0.16, pan=0.4)
m.add(17.72, whoosh(0.45, 900, 2600, pico=0.6, q=1.2), 0.16, nome='perdidas entram no cartão')
entra(m, 17.85, 420, 0.22)
contador(m, 18.1, 2.0, cubicInOut, 16, ganho=0.05)
impacto(m, 20.1, A6)
m.add(19.6, pop(1200, 0.2, 0.5), 0.1, nome='alerta')
sai(m, 20.5)

# 5 · ainda dá tempo de salvar o mês (punch-in)
m.add(20.96, baque(0.5, 55), 0.16, nome='punch-in')
teclas(m, [21.0, 21.56, 21.8, 21.96, 22.28, 22.4, 22.66, 22.8], 0.12)
sai(m, 23.2)

# 6 · três perguntas
entra(m, 27.95, 700, 0.2)
impacto(m, 28.32, C7)
sai(m, 29.25)

# 7 · as três perguntas
for t, f in [(29.4, 620), (33.38, 700), (37.15, 780)]:
    m.add(t - 0.05, whoosh(0.45, 500, 2200, pico=0.5, q=1.0), 0.16, nome='pergunta sobe')
    entra(m, t, f, 0.2)
sai(m, 41.15)

# 8 · priorizar × só inflando a previsão
entra(m, 43.9, 560, 0.2)
for i in range(4):
    m.add(44.45 + i * 0.12, tick(1900 + 150 * i, 0.03), 0.08, nome='negociação')
for i in range(4):
    m.add(44.95 + i * 0.24, tick(2600 + 120 * i, 0.03), 0.07, nome='revisando')
m.add(45.8, whoosh(0.45, 700, 2400, pico=0.5, q=1.1, pan=(0.3, -0.5)), 0.16, nome='organiza')
check(m, 46.1, E6, pan=-0.4, ganho=0.12)
check(m, 46.22, G6, pan=-0.4, ganho=0.1)
m.add(48.05, whoosh(0.45, 2000, 600, pico=0.4, q=1.0, pan=(-0.2, 0.5)), 0.12, nome='inflando: apaga')
sai(m, 50.7)

# 9 · não tente movimentar todo o pipeline
teclas(m, [51.66, 51.76, 51.9, 52.0, 52.42, 52.7, 53.0, 53.66, 54.16, 54.28], 0.11)
m.add(54.3, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.16, nome='risco')
sai(m, 54.7)

# 10 · foco: maior chance de fechamento
m.add(55.0, baque(0.5, 52), 0.16, nome='funil: grave')
entra(m, 55.05, 520, 0.2)
entra(m, 56.75, 760, 0.18)
check(m, 57.7, E6, ganho=0.12)
sai(m, 58.5)

# 11 · pipeline cheio não bate a meta (punch-in)
m.add(59.06, baque(0.5, 55), 0.16, nome='punch-in')
teclas(m, [59.12, 59.68], 0.12)
m.add(60.15, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.16, nome='risco')
teclas(m, [60.14, 60.32, 60.6, 60.76], 0.12)
sai(m, 61.25)

# 12 · prioridade comercial, sim
entra(m, 61.45, 640, 0.2)
check(m, 62.2, G6, ganho=0.14)
confete_som(m, 62.25, 0.2)

salvar(m, sys.argv[1] if len(sys.argv) > 1 else 'insercoes-pipeline-sfx.wav')
