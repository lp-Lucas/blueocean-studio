"""SFX do full motion "reveal do Spotify" (9:16, sem locução) — tempos iguais aos do spotify.html.
Sem voz: os SFX ficam ~8 dB abaixo da música (música −16 LUFS, SFX −24).
uso: python spotify-sfx.py <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

m = nova(28.2)
# 1 · Tudo começa com um [play]
teclas(m, [-0.0 + i * 0.12 for i in range(5)] + [0.62], 0.12)
entra(m, 1.14, 700, 0.2)                                   # pílula abre
m.add(1.45, whoosh(0.4, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 2.2)
m.add(2.34, whoosh(0.7, 500, 2600, pico=0.5, q=1.0), 0.2, nome='bolinha vira anel')
m.add(2.4, vidro(E6, 1.4, 1.0), 0.12, nome='anel: brilho')
m.add(3.3, whoosh(0.45, 600, 4200, pico=0.85, q=1.0), 0.26, nome='mergulho no anel')
impacto(m, 3.68, G6)

# 2 · Batida / Podcast / Playlist
for t, f in [(3.74, 520), (4.58, 620), (5.44, 740)]:
    entra(m, t, f, 0.18)
    sai(m, t + 0.76, 0.1)
m.add(3.7, ar(2.4, 1800), 0.06, nome='anéis desenhando')
for i in range(3):
    m.add(5.5 + i * 0.07, pop(800 + 120 * i, 0.22, 0.4, pan=-0.3 + 0.3 * i), 0.1, nome='capa abre')
m.add(6.04, whoosh(0.4, 700, 4000, pico=0.8, q=1.0), 0.22, nome='vem para a câmera')

# 3 · busca → categorias
entra(m, 6.36, 600, 0.2)
digitar(m, 6.82, 16, (7.66 - 6.82) / 16, ganho=0.14, semente=3)
m.add(7.72, tecla(0.8), 0.22, nome='Enter')
m.add(7.8, whoosh(0.5, 2400, 700, pico=0.5, q=1.0), 0.14, nome='busca sobe')
for i in range(6):
    m.add(7.94 + i * 0.07, pop(560 + 70 * i, 0.25, 0.5, pan=-0.3 if i % 2 == 0 else 0.3), 0.1, nome='categoria entra')
m.add(8.2, whoosh(0.4, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
m.add(8.3, tick(2600, 0.02), 0.06, nome='hover')
clique(m, 8.6)
m.add(8.64, whoosh(0.36, 400, 5000, pico=0.9, q=1.0), 0.28, nome='mergulho no cartão')

# 4 · virada: painéis em 3D
impacto(m, 9.0, C7)
for i in range(6):
    m.add(9.0 + i * 0.3315, whoosh(0.35, 3000, 900, pico=0.3, q=1.0, pan=(-0.4 + 0.16 * i, -0.4 + 0.16 * i)), 0.08, nome='painel chega')
    m.add(9.06 + i * 0.3315, pop(420 + 60 * i, 0.3, 0.6), 0.09, nome='painel: pop')
m.add(11.62, whoosh(0.6, 2200, 600, pico=0.5, q=1.0), 0.12, nome='mundo desfoca')
teclas(m, [11.66, 11.9, 12.05], 0.12)
teclas(m, [12.3, 12.45, 12.6], 0.12)
m.add(12.62, whoosh(0.3, 1200, 3800, pico=0.4, q=1.4), 0.12, nome='destaque verde')
sai(m, 13.95, 0.14)

# 5 · claro: playlists
troca_azul(m, 14.06)
m.add(14.42, zip_linha(0.5, 500, 1300), 0.06, nome='PLAYLISTS')
m.add(15.55, whoosh(0.5, 2600, 600, pico=0.5, q=1.0), 0.12, nome='palavras saem')
entra(m, 15.62, 520, 0.2)
for i in range(6):
    m.add(15.95 + i * 0.07, tick(1700 + 90 * i, 0.02), 0.06, nome='faixa entra')
m.add(16.3, whoosh(0.4, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 16.94)
m.add(16.97, baque(0.5, 58), 0.2, nome='play: grave')
check(m, 16.99, E6, ganho=0.12)
m.add(17.45, whoosh(0.5, 2200, 800, pico=0.4, q=1.0), 0.08, nome='câmera desce')
teclas(m, [18.3, 18.5, 18.66, 18.8], 0.12)
m.add(18.95, whoosh(0.3, 1200, 3800, pico=0.4, q=1.4), 0.12, nome='destaque verde')
m.add(19.3, whoosh(0.5, 600, 3000, pico=0.5, q=1.0), 0.16, nome='claro fecha')

# 6 · celular
m.add(19.62, whoosh(0.8, 300, 2200, pico=0.5, q=1.0), 0.2, nome='celular gira')
m.add(19.95, baque(0.5, 55), 0.14, nome='celular: grave')
teclas(m, [20.2, 20.5, 20.75], 0.12)
m.add(20.9, whoosh(0.4, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 21.58)
check(m, 21.62, G6, ganho=0.16)
m.add(21.75, whoosh(0.35, 800, 2600, pico=0.4, q=1.0), 0.1, nome='aviso sobe')
m.add(22.2, whoosh(0.3, 2600, 800, pico=0.3, q=1.0), 0.08, nome='frase troca')
teclas(m, [22.34, 22.5], 0.12)
clique(m, 22.9)
m.add(22.95, zip_linha(0.6, 700, 1600), 0.06, nome='baixando')
check(m, 23.56, C7, ganho=0.16)
entra(m, 23.6, 900, 0.14)
m.add(24.3, whoosh(0.6, 2400, 500, pico=0.6, q=1.0), 0.18, nome='celular afasta')

# 7 · logo
m.add(24.92, baque(0.9, 44), 0.3, nome='logo: grave')
m.add(24.94, pop(620, 0.35, 0.8), 0.18, nome='logo: pop')
m.add(24.98, vidro(C7, 2.0, 1.0), 0.12, nome='logo: brilho')
m.add(25.5, whoosh(0.7, 900, 2800, pico=0.4, q=1.0), 0.12, nome='nome sai de trás')
teclas(m, [26.1, 26.3, 26.45, 26.6, 26.72], 0.11)
entra(m, 26.6, 700, 0.16)
m.add(26.8, whoosh(0.4, 1500, 3500, pico=0.4, q=1.6), 0.06, nome='cursor')
clique(m, 27.55)
check(m, 27.6, E6, ganho=0.14)

salvar(m, sys.argv[1], lufs=-24)
