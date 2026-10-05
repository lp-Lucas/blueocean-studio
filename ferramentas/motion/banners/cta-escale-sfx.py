"""SFX do banner "Escale seu SaaS" — tempos iguais aos do cta-escale.html.
uso: python cta-escale-sfx.py <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from sfx import *

# notas (Ré maior, a mesma tonalidade da cama)
D6, E6, Fs6, A6, D7 = 1174.66, 1318.51, 1479.98, 1760.0, 2349.32
m = Mixagem(13.5)

# fundo de seda se mexendo → cama ambiente o vídeo todo
m.add(0, base_ambiente(13.5), 0.06, cama=True, nome='cama ambiente (fundo animado)')

# símbolo aparece do desfoque → ar subindo + toque de vidro quando assenta
m.add(0.05, whoosh(1.0, 500, 4200, pico=0.65, q=1.0), 0.30, nome='símbolo: ar subindo')
m.add(0.55, vidro(E6, 1.6, 0.7), 0.20, nome='símbolo: vidro')

# título palavra a palavra → sopro por linha + tique tátil por palavra (subindo de tom)
digitar(m, 0.45, 7, 0.085, ganho=0.24, semente=1)          # "Escale seu SaaS com a Blue Ocean"
m.add(0.38, ar(0.9, 2200), 0.30, nome='linha 1: sopro')
m.add(0.64, ar(0.9, 2800), 0.28, nome='linha 2: sopro')
# "Blue Ocean" em degradê → brilho
m.add(0.98, vidro(A6, 1.8, 1.0), 0.16, nome='Blue Ocean: brilho')

# frase de apoio entra e sai
m.add(1.5, ar(1.1, 3400, pico=0.4), 0.18, nome='frase de apoio entra')
digitar(m, 1.55, 11, 0.035, ganho=0.15, adianta=0.05, semente=2)   # frase de apoio: digitação rápida e mais baixa
m.add(3.65, whoosh(0.6, 3500, 900, pico=0.25, q=1.0), 0.16, nome='frase de apoio sai')

# título sobe e encolhe para o topo → whoosh subindo
m.add(3.95, whoosh(1.2, 300, 3200, pico=0.5, q=1.2, pan=(0, 0), corpo=0.25), 0.42, nome='título encaixa no topo')

# logos dos clientes, um a um → três toques de vidro subindo + pop leve
for i, f in enumerate([D6, Fs6, A6]):
    m.add(4.75 + i * 0.16 + 0.1, vidro(f, 1.3, 0.6, pan=(-0.2 + 0.2 * i)), 0.24, nome=f'logo {i + 1}')
    m.add(4.75 + i * 0.16 + 0.08, pop(380 + 60 * i, 0.25, 0.4), 0.14)
m.add(7.3, whoosh(0.6, 3800, 700, pico=0.3, q=1.0), 0.22, nome='logos saem')

# cartões de vidro sobem → deslize + corpo grave
for i in range(3):
    t0 = 7.8 + i * 0.2
    m.add(t0 - 0.05, whoosh(0.55, 700, 2600, pico=0.4, q=1.1, pan=(0.3, -0.1)), 0.26, nome=f'cartão {i + 1}')
    m.add(t0 + 0.12, pop(260 + 40 * i, 0.3, 0.9), 0.16)
m.add(7.85, baque(0.6, 55), 0.25, nome='cartões: grave')

# contadores (40 → 200 e 13 → 70) → tique a cada número que muda, acelerando e freando com o número
def tiques(t0, dur, a, b, freq0, freq1, pan, ganho, rotulo):
    def q(p): return 16 * p ** 5 if p < 0.5 else 1 - (-2 * p + 2) ** 5 / 2   # quintInOut, igual ao HTML
    ult, ultT, n = round(a), -1, 0
    fps = 30
    for k in range(int(dur * fps) + 1):
        t = t0 + k / fps
        v = round(a + (b - a) * q(k / (dur * fps)))
        if v != ult and t - ultT >= 0.045:
            p = (v - a) / (b - a)
            m.add(t, tick(freq0 + (freq1 - freq0) * p, 0.03, pan), ganho)
            ult, ultT, n = v, t, n + 1
    m.lista.append((round(t0, 2), f'{rotulo}: {n} tiques'))
tiques(8.5, 1.5, 40, 200, 1500, 3000, -0.3, 0.10, 'contador R$')
tiques(8.7, 1.5, 13, 70, 1700, 3300, 0.3, 0.09, 'contador %')
m.add(10.0, tick(3600, 0.05, -0.3), 0.18, nome='contador R$ para')
m.add(10.2, tick(3900, 0.05, 0.3), 0.18, nome='contador % para')

# setas dos cases se desenham / check da Acrux fecha → acorde de sucesso
m.add(9.62, acorde_sucesso(D6, pan=0.4), 0.22, nome='check Acrux: sucesso')

# botão "Saiba mais" entra com mola → o golpe principal: ar curto + pop + grave + vidro
m.add(10.05, whoosh(0.35, 800, 5000, pico=0.85, q=1.0), 0.30, nome='CTA: ar')
m.add(10.3, pop(480, 0.45, 1.0), 0.40, nome='CTA: pop')
m.add(10.3, baque(0.7, 58), 0.40)
m.add(10.36, vidro(D7, 2.2, 0.8), 0.18)

# setas para baixo acendendo → dois blips descendo
m.add(10.95, tick(1600, 0.05), 0.16, nome='seta 1')
m.add(11.07, tick(1250, 0.05), 0.16, nome='seta 2')

# reflexo passando no botão (a cada 1,6 s)
for k, t0 in enumerate([11.2, 12.8]):
    m.add(t0 + 0.1, brilho(0.9), 0.13, nome=f'brilho no botão {k + 1}')

for t, n in sorted(m.salvar(sys.argv[1])):
    if n: print(f'{t:6.2f}  {n}')
