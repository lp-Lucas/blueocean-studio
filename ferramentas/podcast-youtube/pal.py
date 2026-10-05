import json, sys
ws = json.load(open('transcricoes/m1.json', encoding='utf-8'))
for r in sys.argv[1:]:
    a, b = map(float, r.split('-'))
    print(f'--- {a}-{b}')
    print(' '.join(f"{w['t']}[{w['i']:.2f}-{w['f']:.2f}]" for w in ws if w['i'] >= a and w['i'] < b))
