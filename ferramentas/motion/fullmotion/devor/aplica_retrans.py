"""Troca a transcrição do editor pela do retrans.py (large-v3, 2 janelas sobrepostas) + correções de nome. Receita 15.
uso: python aplica_retrans.py <proj> <m> <rt.txt> <ini_fala>"""
import sys, json, re, os
proj, m, rt, ini = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
jan = []
for ln in open(rt, encoding='utf8'):
    if ln.startswith('=='): a, b = map(float, ln[3:].split('-')); jan.append([a, b, []]); continue
    for t, i, f in re.findall(r'(\S+?)\[([\d.]+)-([\d.]+)\]', ln): jan[-1][2].append([t, float(i), float(f)])
ws = [w for w in jan[0][2] if w[2] <= jan[1][0] + 1e-6]
for w in jan[1][2]:
    if w[1] <= ws[-1][1] + 1e-6: continue                      # repetição de segmento
    if abs(w[1] - jan[1][0]) < 0.01:                              # palavra cortada no começo da janela
        if w[0].lower().strip('.,') == ws[-1][0].lower().strip('.,'): continue
        w[1] = ws[-1][2]
    ws.append(w)
FIX = {r'^(Devo|Devil|Devol|Devon|Devolvop)([.,?!]*)$': r'Devor\2', r'^Coetor$': 'Corretor', r'^duolingo$': 'Duolingo'}
out = []
for t, i, f in ws:
    for a, b in FIX.items(): t = re.sub(a, b, t)
    d = {'t': t, 'i': round(i, 2), 'f': round(f, 2), 'p': 0.95, 'editada': True}
    if i < ini: d['oculta'] = True
    out.append(d)
json.dump(out, open(os.path.join(proj, 'transcricoes', m + '.json'), 'w', encoding='utf8'), ensure_ascii=False)
print(m, len(out), ' '.join(w['t'] for w in out if not w.get('oculta')))
