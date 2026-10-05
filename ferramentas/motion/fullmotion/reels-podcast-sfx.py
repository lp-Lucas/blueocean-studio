"""SFX dos reels do podcast (reels-podcast.html) — mesmos tempos da página (palavras de reels-palavras.js).
uso: python reels-podcast-sfx.py <comp> <saida.wav>"""
import sys, os, json, re, unicodedata
sys.path.insert(0, os.path.dirname(__file__))
from fmsfx import *

REEL, SAIDA = sys.argv[1], sys.argv[2]
txt = open(os.path.join(os.path.dirname(__file__), 'reels-palavras.js'), encoding='utf-8').read()
D = json.loads(txt[txt.index('=') + 1:].strip().rstrip(';'))[REEL]
nrm = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
def W(p, n=1):
    k = 0
    for t, w in D['palavras']:
        if nrm(w) == nrm(p):
            k += 1
            if k == n: return t
    raise KeyError(p)
m = nova(D['dur'] + 0.8)
def gancho(ate):
    """letreiro atrás da pessoa: impacto no quadro 0, sopro quando ele sai"""
    m.add(0.0, baque(0.8, 44), 0.34, nome='letreiro: grave'); m.add(0.02, vidro(C6, 1.8, 0.8), 0.1, nome='letreiro: brilho')
    m.add(ate - 0.02, whoosh(0.45, 2600, 500, pico=0.35, q=1.0), 0.16, nome='letreiro sai')
    m.add(ate + 0.02, whoosh(0.3, 1200, 400, pico=0.6, q=1.0), 0.1, nome='zoom volta')

if REEL == 'comp6':
    entra(m, 0.0, 560, 0.18)
    for i, c in enumerate([0.5, 0.82, 1.1, 1.36, 1.6, 1.82, 2.02, 2.2]):
        clique(m, c); m.add(c + 0.04, whoosh(0.4, 900, 3200, pico=0.5, q=1.2), 0.06, nome='cédula voa')
        m.add(c + 0.3, vidro(2093 + i * 60, 0.5, 0.9), 0.045, nome='entra no Meta')
    m.add(W('lead'), baque(0.35, 70), 0.14, nome='zero treme'); m.add(2.7, pop(380, 0.35, 0.7), 0.16, nome='ROI 0%')
    troca_azul(m, 3.55); arco(m, 3.7); arco(m, 4.6); impacto(m, W('grana') - 0.05, C6)
    for i in range(14): m.add(3.95 + i * 0.1, whoosh(0.18, 1800, 4200, pico=0.3, q=1.4), 0.03, nome='cédula')
    m.add(5.55, pop(480, 0.35, 0.7), 0.18, nome='volta'); m.add(5.7, whoosh(0.5, 400, 2600, pico=0.5, q=1.0), 0.18, nome='cresce')
    m.add(W('menos') + 0.15, whoosh(0.3, 500, 2200, pico=0.7, q=1.0), 0.1, nome='punch-in')
    entra(m, W('menos') - 0.1, 640, 0.18); entra(m, W('volumetria') - 0.1, 760, 0.18); entra(m, W('desqualificada'), 520, 0.12)
    entra(m, W('whatsapp') - 0.1, 700, 0.16, pan=-0.4); entra(m, W('formulario') - 0.1, 820, 0.16, pan=0.4)
    m.add(W('tipo') - 0.12, whoosh(0.25, 3000, 900, pico=0.2, q=1.0), 0.2, nome='corte para claro')
    impacto(m, W('nenhum') - 0.05, E6); entra(m, W('lead', 3) - 0.05, 600, 0.16)

if REEL == 'comp7':
    gancho(W('vou') - 0.3)
    entra(m, W('vou') - 0.15, 760, 0.16, pan=0.3); entra(m, W('atrai') - 0.1, 560, 0.16)
    a = W('porque', 2) - 0.1; troca_azul(m, a); m.add(a + 0.25, whoosh(0.5, 2600, 700, pico=0.4, q=1.0), 0.16, nome='LinkedIn sobe')
    li = a + 0.3
    m.add(li - 0.3, whoosh(0.7, 300, 1500, pico=0.5, q=0.9, corpo=0.4), 0.18, nome='celular entra')
    for t in [li + 0.1, W('gestor') - 0.25, W('desempregado') - 0.3, W('desempregado') + 0.45]:   # flicks do feed
        m.add(t, whoosh(0.5, 1700, 500, pico=0.18, q=1.1), 0.12, nome='flick')
        for k in range(5): m.add(t + 0.04 + k * 0.06 * (1 + k * 0.4), tick(3200 - k * 250, 0.018), 0.035, nome='tique roda')
    m.add(W('tu') - 0.8, whoosh(0.6, 500, 1800, pico=0.6, q=1.0), 0.12, nome='câmera aproxima')
    tb = W('tu') - 0.25; clique(m, tb - 0.12); teclas(m, [tb + i * 0.055 for i in range(10)], 0.14)
    z = W('empresario', 2); m.add(z - 0.25, whoosh(0.3, 2400, 900, pico=0.3, q=1.0), 0.12, nome='resultado'); m.add(z - 0.05, pop(360, 0.35, 0.8), 0.2, nome='0 resultados'); m.add(z, baque(0.4, 60), 0.12, nome='grave')
    v = W('agora') - 0.35; m.add(v, pop(480, 0.35, 0.7), 0.18, nome='volta'); m.add(v + 0.15, whoosh(0.5, 400, 2600, pico=0.5, q=1.0), 0.18, nome='cresce')
    check(m, W('gestor', 2) - 0.1, E6, -0.3); check(m, W('desempregado', 2) - 0.1, G6, 0.3); entra(m, W('vai') - 0.1, 640, 0.2)

if REEL == 'comp8':
    gancho(W('onde') - 0.05)
    m.add(W('40') + 0.15, whoosh(0.3, 500, 2200, pico=0.7, q=1.0), 0.1, nome='punch-in')
    entra(m, W('40') - 0.4, 560, 0.2); contador(m, W('40') - 0.25, 0.9, quintOut, 14)
    entra(m, W('chegaram') - 0.3, 600, 0.18); contador(m, W('60') - 0.2, 0.7, quintOut, 10); contador(m, W('100') - 0.3, 0.8, quintInOut, 14)
    confete_som(m, W('100') + 0.5); check(m, W('100') + 0.55, G6)
    m.add(W('mas') - 0.07, whoosh(0.25, 3000, 900, pico=0.2, q=1.0), 0.2, nome='corte para claro')
    m.add(W('parece') + 0.2, zip_linha(0.4, 600, 1300), 0.08, nome='risco'); impacto(m, W('todo') - 0.05, E6)

if REEL == 'comp9':
    gancho(W('300') - 0.45); entra(m, W('300') - 0.4, 560, 0.2); contador(m, W('300') - 0.15, 0.5, quintOut, 12); contador(m, W('500') - 0.1, 0.45, quintOut, 8)
    m.add(W('300') + 0.15, whoosh(0.3, 500, 2200, pico=0.7, q=1.0), 0.1, nome='punch-in')
    entra(m, 10.95, 520, 0.22)
    for p in ['segunda', 'quarta', 'sexta']: m.add(W(p) - 0.05, pop(300, 0.3, 0.8), 0.16, nome='x ' + p)
    check(m, W('terca') - 0.05, E6, -0.2); check(m, W('quinta') - 0.05, G6, 0.2)
    m.add(W('melhor') - 0.1, whoosh(0.45, 900, 3000, pico=0.4, q=1.0), 0.14, nome='título troca'); confete_som(m, W('quinta') + 0.2)
    m.add(W('terca') + 0.15, whoosh(0.3, 500, 2200, pico=0.7, q=1.0), 0.1, nome='punch-in')

if REEL == 'comp10':
    hk = W('organize') - 0.1; gancho(hk)
    entra(m, hk + 0.02, 600, 0.2)
    for w in ['organize', 'otimize']: teclas(m, [W(w) - 0.1 + i * 0.05 for i in range(6)], 0.12)
    m.add(W('generico') - 0.1, zip_linha(0.4, 600, 1300), 0.09, nome='risco'); m.add(W('generico') + 0.12, zip_linha(0.4, 500, 1200), 0.08, nome='risco 2')
    m.add(W('generico') + 0.2, baque(0.4, 70), 0.2, nome='carimbo'); m.add(W('generico') + 0.2, pop(300, 0.3, 0.9), 0.16, nome='carimbo: pop')
    entra(m, W('vender') - 0.1, 420, 0.18)
    entra(m, W('comunicacao') - 0.2, 560, 0.2)
    contador(m, W('pouco') - 0.6, 0.8, quintOut, 16, f0=3400, f1=1800)
    m.add(W('pouco') + 0.2, pop(260, 0.35, 1.0), 0.16, nome='preço caiu'); entra(m, W('organizar') - 0.1, 500, 0.12)
    entra(m, W('custo') - 0.1, 600, 0.16, pan=-0.2); entra(m, W('pouco', 2) - 0.05, 520, 0.16, pan=0.2)
    m.add(W('pagando') - 0.1, pop(300, 0.35, 0.9), 0.2, nome='pagando pra trabalhar'); m.add(W('pagando'), baque(0.4, 60), 0.14, nome='grave')
    impacto(m, W('quatro') - 0.1, C6)
    for i, w in enumerate([('ganhar', 1), ('custar', 1), ('encantar', 1), ('encantar', 2)]):
        entra(m, W(*w) - 0.1, 640 + i * 70, 0.16, pan=-0.3 if i % 2 == 0 else 0.3)
        m.add(W(*w), vidro(1320 + i * 160, 0.8, 0.7), 0.05, nome='objetivo')
    for i, w in enumerate([('ganhar', 2), ('custar', 2), ('cliente', 2), ('colaborador', 2)]):
        m.add(W(*w), tick(2400 + i * 200, 0.04), 0.1, nome='pulso')
    entra(m, W('resultado') - 0.15, 560, 0.22); check(m, W('real') + 0.1, E6)
    entra(m, W('atrativa') - 0.15, 700, 0.2); confete_som(m, W('agressiva') + 0.15)

if REEL == 'comp11':
    hk = 2.38; gancho(hk)
    entra(m, hk + 0.02, 600, 0.2)
    contador(m, W('atacando') - 0.1, W('saturar') - W('atacando') + 0.2, quintOut, 14)
    m.add(W('saturar'), pop(300, 0.35, 0.9), 0.2, nome='saturado'); m.add(W('saturar'), baque(0.4, 60), 0.14, nome='grave')
    for i in range(3): entra(m, W('avenidas') - 0.35 + (i + 1) * 0.15, 620 + i * 90, 0.15, pan=-0.3 + i * 0.3)
    entra(m, W('saindo') - 0.1, 480, 0.16); entra(m, W('insatisfeito') - 0.1, 440, 0.16)
    impacto(m, W('sera') - 0.1, C6)
    for i, w in enumerate([('gestor', 2), ('ceo', 1), ('gerente', 1)]): entra(m, W(*w) - 0.05, 640 + i * 80, 0.17, pan=-0.3 + i * 0.3)
    entra(m, W('dentro', 2) - 0.1, 560, 0.18); check(m, W('ceo', 2) - 0.05, G6)
    m.add(W('ceo', 2), whoosh(0.5, 700, 2600, pico=0.5, q=1.0), 0.14, nome='CEO sobe')
    entra(m, W('empresa', 3) - 0.2, 560, 0.2)
    for w in ['50', '60', '40']: m.add(W(w) - 0.05, tick(2600, 0.04), 0.14, nome='número')
    entra(m, W('crescer', 2) - 0.1, 500, 0.12)
    for i, w in enumerate(['mercado', 'demanda', 'vende']): entra(m, W(w) - 0.1, 700 + i * 90, 0.18)
    confete_som(m, W('vende') + 0.15)

salvar(m, SAIDA)
