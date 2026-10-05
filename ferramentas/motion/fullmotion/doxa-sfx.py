"""SFX do full motion Doxa — mesmos marcadores do doxa.html (lidos de doxa-<take>.json).
uso: python doxa-sfx.py <v1|v2> <saida.wav>"""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from fmsfx import *

take, saida = sys.argv[1], sys.argv[2]
K = json.load(open(os.path.join(os.path.dirname(__file__), f'doxa-{take}.json'), encoding='utf-8'))
T, TT, F = K['T'], K['TT'], K['FIM']
m = nova(K['DUR'])

# 1: abertura — logo Blue Ocean grande, marketing e vendas, o SaaS novo
m.add(0.0, baque(0.6, 50), 0.24, nome='abertura: grave')
m.add(0.0, vidro(G6, 1.6, 1.0), 0.1, nome='logo: brilho')
m.add(0.15, whoosh(1.3, 2400, 500, pico=0.4, q=1.1), 0.18, nome='câmera recua')
entra(m, TT['gente'][3], 620, 0.2, pan=-0.5)
entra(m, TT['gente'][5], 720, 0.2, pan=0.5)
m.add(T['abrir'], whoosh(0.9, 2000, 600, pico=0.5, q=1.1), 0.16, nome='câmera desce')
m.add(T['abrir'] + 0.25, zip_linha(0.6, 500, 1200), 0.1, nome='contorno do ícone novo')
m.add(TT['abrir'][4], pop(380, 0.45, 1.0), 0.26, nome='SaaS novo: pop')
confete_som(m, TT['abrir'][4], 0.16)
entra(m, TT['abrir'][4] + 0.15, 760, 0.16)

# 2: Sabe qual o motivo?
troca_azul(m, T['motivo'] - 0.15); arco(m, T['motivo'] - 0.1, 1.4)
teclas(m, TT['motivo'][:2])
impacto(m, TT['motivo'][2], E6)

# 3: dono de SaaS travado
troca_azul(m, T['cansou'] - 0.12, ida=False)
m.add(T['cansou'] - 0.3, whoosh(0.6, 500, 3000, pico=0.6, q=1.0), 0.2, nome='trono entra')
for i in range(12):
    m.add(T['dono'] + i * 0.03, tick(2600 + 90 * i, 0.025, pan=-0.5 + i * 0.09), 0.05, nome='letra')
m.add(T['dono'] - 0.1, whoosh(0.8, 300, 1800, pico=0.6, q=1.2), 0.18, nome='zoom no rosto')
m.add(T['produto'] - 0.05, whoosh(0.7, 2200, 500, pico=0.35, q=1.1, pan=(0.3, -0.6)), 0.18, nome='vai para a esquerda')
entra(m, T['produto'], 600, 0.2, pan=0.5)
for i in range(5):
    m.add(TT['produto'][2] + i * 0.05, vidro([C6, D6, E6, G6, A6][i], 0.5, 0.6, pan=0.4), 0.05, nome='estrela')
entra(m, T['travado'], 480, 0.22, pan=0.5)
m.add(TT['travado'][3], pop(300, 0.4, 1.0, pan=0.5), 0.22, nome='cadeado')
m.add(TT['travado'][3] + 0.02, tick(1400, 0.04), 0.14, nome='cadeado: clique')
entra(m, T['achando'], 820, 0.18, pan=-0.2)
m.add(TT['naoera'][1], zip_linha(0.4, 900, 1700), 0.12, nome='risco no software')

# 4: 1.100 SaaS → quem crescia → 3 pilares
sai(m, T['mil'] - 0.15)
for i in range(20):
    m.add(T['mil'] + 0.08 + (abs(i % 5 - 2) + abs(i // 5 - 1.5)) * 0.06, pop(700 + 30 * (i % 7), 0.16, 0.1, pan=((i % 5) - 2) * 0.25), 0.05, nome='ícone')
contador(m, TT['mil'][3], max(0.5, F['mil'] - TT['mil'][3] + 0.2), quintOut, 14, ganho=0.05)
m.add(T['crescia'], whoosh(0.5, 2200, 700, pico=0.3, q=1.0), 0.1, nome='os outros apagam')
for i in range(5):
    m.add(T['crescia'] + 0.15 + i * 0.08, vidro([E6, G6, A6, C7, A6][i], 0.6, 0.6, pan=-0.5 + i * 0.25), 0.07, nome='seta sobe')
teclas(m, TT['crescia'], 0.12)
sai(m, T['oferta'] - 0.1)
for k, f in [('oferta', 480), ('demanda', 540), ('comercial', 620)]:
    entra(m, T[k], f, 0.22)

# 5: na própria pele
troca_azul(m, T['provou'] - 0.15); arco(m, T['provou'] - 0.1, 1.7)
teclas(m, TT['provou'])
teclas(m, TT['pele'][:2], 0.12)
impacto(m, TT['pele'][2], C7)

# 6: 98 dias → Doxa → R$ 400 mil
troca_azul(m, T['zero'] - 0.12, ida=False)
entra(m, T['zero'], 420, 0.22)
contador(m, TT['zero'][1], max(0.6, TT['zero'][3] - TT['zero'][1] + 0.3), cubicInOut, 16, ganho=0.05)
m.add(T['doxa'], whoosh(0.5, 400, 3000, pico=0.6, q=1.0), 0.22, nome='doxa: ar')
m.add(T['doxa'] + 0.05, pop(330, 0.5, 1.0), 0.28, nome='doxa: pop')
m.add(T['doxa'] + 0.08, vidro(G6, 1.4, 0.9), 0.1, nome='doxa: brilho')
entra(m, T['nosso'], 700, 0.16, pan=0.3)
m.add(T['faturou'] - 0.05, whoosh(0.7, 2400, 600, pico=0.4, q=1.0), 0.14, nome='doxa sobe')
entra(m, T['faturou'], 380, 0.24)
contador(m, T['faturou'] + 0.2, max(0.6, F['v400'] - T['faturou'] - 0.2), cubicInOut, 20, ganho=0.06, f0=2400, f1=4200)
confete_som(m, F['v400'])
check(m, F['v400'] + 0.04, C6)
entra(m, F['v400'] + 0.1, 760, 0.16, pan=0.4)

# 7: hoje a Blue Ocean também é dono de SaaS → leva para o teu
sai(m, T['hoje'] - 0.15)
m.add(T['hoje'] - 0.35, whoosh(0.6, 500, 3000, pico=0.6, q=1.0), 0.2, nome='trono entra')
m.add(T['hoje'] + 0.3, whoosh(1.1, 2200, 500, pico=0.4, q=1.1), 0.16, nome='câmera recua')
m.add(TT['hoje'][2], pop(330, 0.5, 1.0), 0.26, nome='rosto vira Blue Ocean')
m.add(TT['hoje'][2] + 0.05, vidro(A6, 1.6, 1.0), 0.12, nome='rosto: brilho')
for i in range(12):
    m.add(TT['hoje'][4] + i * 0.03, tick(2600 + 90 * i, 0.025, pan=-0.5 + i * 0.09), 0.05, nome='letra')
m.add(T['funciona'] - 0.1, whoosh(0.7, 2200, 500, pico=0.35, q=1.1, pan=(0.3, -0.6)), 0.18, nome='vai para a esquerda')
entra(m, T['funciona'] + 0.3, 420, 0.22, pan=0.5)
tteu = TT['leva'][-1]
m.add(T['leva'], zip_linha(max(0.5, tteu - T['leva']), 500, 1300), 0.12, nome='leva para o teu')
entra(m, tteu - 0.1, 600, 0.22, pan=0.5)
check(m, tteu + 0.1, E6, pan=0.4, ganho=0.12)

# 8: checklist
sai(m, T['se'] - 0.15)
entra(m, T['se'], 600, 0.18)
for a, tc, nota in [(T['se'] + 0.1, TT['se'][5], C6), (T['fatura'], TT['v20'][1], D6), (T['mas'], TT['mas'][2], E6)]:
    entra(m, a, 500, 0.2)
    check(m, tc, nota, ganho=0.15)

# 9: formulário + destravar
troca_azul(m, T['preenche'] - 0.15); arco(m, T['preenche'] - 0.1, 1.6); arco(m, T['vem'], 1.5)
m.add(T['preenche'], pop(330, 0.5, 1.0), 0.24, nome='logo: pop')
entra(m, T['preenche'] + 0.1, 420, 0.24)
t1 = T['preenche'] + 0.4
for i, c in enumerate('R$ 20 mil+'):
    if c != ' ': m.add(t1 + i * 0.04, tecla(r.uniform(-1, 1)), 0.08, reverb=False, nome='digita')
t2 = t1 + 10 * 0.04 + 0.1
for i, c in enumerate('Crescimento travado'):
    if c != ' ': m.add(t2 + i * 0.025, tecla(r.uniform(-1, 1)), 0.06, reverb=False, nome='digita')
tc = TT['vem'][1] - 0.1
m.add(tc - 0.45, whoosh(0.3, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, tc)
confete_som(m, tc + 0.1, 0.2)
check(m, tc + 0.12, G6)
teclas(m, TT['vem'][1:])
td = TT['vem'][-1]
m.add(td + 0.05, tick(1200, 0.05), 0.2, nome='cadeado abre: clique')
m.add(td + 0.1, vidro(C7, 1.4, 1.0), 0.13, nome='cadeado abre: brilho')

salvar(m, saida)
