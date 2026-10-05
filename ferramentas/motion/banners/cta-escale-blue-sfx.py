"""SFX do banner "Escale seu SaaS" (linha Blue) — tempos iguais aos do cta-escale-blue.html.
uso: python cta-escale-blue-sfx.py <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from sfx import *

D5, D6, E6, Fs6, A6, D7 = 587.33, 1174.66, 1318.51, 1479.98, 1760.0, 2349.32
m = Mixagem(10.0)
m.add(0, base_ambiente(10.0), 0.06, cama=True, nome='cama ambiente (fundo)')


def cabecalho(m, t0):
    """BLUE OCEAN surge → fio corre até o símbolo → símbolo aparece"""
    m.add(t0 - 0.05, ar(0.7, 2400), 0.22, nome='cabeçalho: nome surge')
    m.add(t0 + 0.12, vidro(D5 * 2, 1.4, 0.6, pan=-0.5), 0.16)
    m.add(t0 + 0.3, whoosh(1.0, 900, 6000, pico=0.55, q=2.2, pan=(-0.6, 0.6)), 0.14, nome='cabeçalho: fio corre')
    m.add(t0 + 0.8, pop(640, 0.3, 0.3, pan=0.6), 0.18, nome='cabeçalho: símbolo')
    m.add(t0 + 0.84, vidro(A6, 1.5, 0.7, pan=0.6), 0.16)


def tiques(m, t0, dur, a, b, freq0, freq1, pan, ganho, rotulo):
    def q(p): return 16 * p ** 5 if p < 0.5 else 1 - (-2 * p + 2) ** 5 / 2
    ult, ultT, n = round(a), -1, 0
    for k in range(int(dur * 30) + 1):
        t = t0 + k / 30
        v = round(a + (b - a) * q(k / (dur * 30)))
        if v != ult and t - ultT >= 0.045:
            m.add(t, tick(freq0 + (freq1 - freq0) * (v - a) / (b - a), 0.03, pan), ganho)
            ult, ultT, n = v, t, n + 1
    m.lista.append((round(t0, 2), f'{rotulo}: {n} tiques'))


def botao(m, t0):
    m.add(t0 - 0.25, whoosh(0.35, 800, 5000, pico=0.85, q=1.0), 0.30, nome='CTA: ar')
    m.add(t0, pop(480, 0.45, 1.0), 0.40, nome='CTA: pop')
    m.add(t0, baque(0.7, 58), 0.40)
    m.add(t0 + 0.06, vidro(D7, 2.2, 0.8), 0.18)
    m.add(t0 + 0.65, tick(1600, 0.05), 0.16, nome='seta 1')
    m.add(t0 + 0.77, tick(1250, 0.05), 0.16, nome='seta 2')
    T0 = t0 + 0.9
    while T0 < m.dur - 0.3:
        m.add(T0 + 0.1, brilho(0.9), 0.13, nome='brilho no botão'); T0 += 1.6


if __name__ == '__main__':
    cabecalho(m, 0.1)
    digitar(m, 0.75, 7, 0.08, ganho=0.24, semente=21)
    m.add(0.69, ar(0.9, 2200), 0.30, nome='título linha 1: sopro')
    m.add(0.95, ar(0.9, 2800), 0.28, nome='título linha 2: sopro')
    m.add(1.25, vidro(A6, 1.8, 1.0), 0.16, nome='Blue Ocean (verde): brilho')
    m.add(1.6, ar(1.1, 3400, pico=0.4), 0.18, nome='texto de apoio')
    digitar(m, 1.65, 11, 0.04, ganho=0.15, adianta=0.05, semente=22)
    for i, f in enumerate([D6, Fs6, A6]):
        m.add(2.35 + i * 0.14 + 0.1, vidro(f, 1.3, 0.6, pan=(-0.3 + 0.3 * i)), 0.24, nome=f'logo {i + 1}')
        m.add(2.35 + i * 0.14 + 0.08, pop(380 + 60 * i, 0.25, 0.4), 0.14)
    for i in range(3):
        t0 = 3.0 + i * 0.22
        m.add(t0 - 0.05, whoosh(0.55, 700, 2600, pico=0.4, q=1.1, pan=(0.3, -0.1)), 0.24, nome=f'caixa de resultado {i + 1}')
        m.add(t0 + 0.12, pop(260 + 40 * i, 0.3, 0.9), 0.15)
    m.add(3.05, baque(0.6, 55), 0.22)
    tiques(m, 3.45, 1.5, 40, 200, 1500, 3000, -0.3, 0.10, 'contador R$')
    tiques(m, 3.67, 1.5, 13, 70, 1700, 3300, 0.3, 0.09, 'contador %')
    m.add(4.95, tick(3600, 0.05, -0.3), 0.16, nome='contador R$ para')
    m.add(5.17, tick(3900, 0.05, 0.3), 0.16, nome='contador % para')
    botao(m, 4.95)
    for t, n in sorted(m.salvar(sys.argv[1])):
        if n and not n.startswith('tecla'): print(f'{t:6.2f}  {n}')
