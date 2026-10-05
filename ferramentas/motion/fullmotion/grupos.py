"""Monta os grupos da legenda do full motion a partir da transcrição do projeto (receita 11).
uso: python grupos.py <transcricoes/mN.json> [--negrito "SaaS,CRM,30,..."] [--max 4] > grupos.js
Quebra em pontuação, a cada --max palavras ou em pausa > 0,35 s. Palavras "oculta" ficam fora.
Palavras do --negrito (sem pontuação, sem diferenciar maiúsculas) saem em negrito (*palavra*)."""
import json, sys, re

args = sys.argv[1:]
arq = args[0]
opt = lambda n, d: args[args.index(n) + 1] if n in args else d
neg = {w.strip().lower() for w in opt('--negrito', '').split(',') if w.strip()}
mx = int(opt('--max', 4))

ws = [w for w in json.load(open(arq, encoding='utf-8')) if not w.get('oculta')]
grupos, g = [], []
for i, w in enumerate(ws):
    fecha = re.search(r'[.,?!:;]$', w['t'].strip())   # a última palavra da frase pode passar do máximo
    if g and ((len(g) >= mx and not (fecha and len(g) < mx + 1)) or w['i'] - ws[i - 1]['f'] > 0.35):
        grupos.append(g); g = []
    txt = w['t'].strip()
    base = re.sub(r'[^\wÀ-ÿ%$]', '', txt).lower()
    g.append([round(w['i'], 2), f'*{txt}*' if base in neg else txt])
    if re.search(r'[.,?!:;]$', txt):
        grupos.append(g); g = []
if g: grupos.append(g)
print('const GRUPOS = [')
for g in grupos:
    print('  [' + ', '.join(f'[{t}, {json.dumps(s, ensure_ascii=False)}]' for t, s in g) + '],')
print('];')
