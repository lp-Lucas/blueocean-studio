"""Põe as peças do trab/pecas.json no comp1 (faixas V3 Apresentação, V4 Cartões e termos, V5 CTA, V6 Logo)."""
import json
proj = json.load(open('projeto.json', encoding='utf-8'))
porNome = {m['nome']: (k, m) for k, m in proj['midias'].items()}
c = json.load(open('composicoes/comp1.json', encoding='utf-8'))
pecas = json.load(open('trab/pecas.json', encoding='utf-8'))
NOMES = {'V3': 'Apresentação', 'V4': 'Cartões e termos', 'V5': 'CTA', 'V6': 'Logo'}
base = [f for f in c['faixas'] if f['id'] not in NOMES]
FIM = max(it['inicio'] + it['saida'] - it['entrada'] for f in base if f['tipo'] == 'video' for it in f['itens'])
novas = {k: {'id': k, 'tipo': 'video', 'nome': v, 'itens': []} for k, v in NOMES.items()}
for p in pecas:
    mid, m = porNome[p.get('arquivo', p['id']) + '.webm']
    x, y, w, h = p['caixa']
    novas[p['faixa']]['itens'].append({'id': 'pc-' + p['id'], 'midia': mid, 'inicio': p['inicio'], 'entrada': 0,
        'saida': round(min(m['dur'], FIM - p['inicio']), 3), 'volume': 0, 'caixa': {'x': x, 'y': y, 'w': w, 'h': h}})
lid, _ = porNome['simbolo-blueocean-branco.png']
novas['V6']['itens'].append({'id': 'pc-logo', 'midia': lid, 'inicio': 0, 'entrada': 0, 'saida': round(FIM, 3), 'volume': 0,
    'caixa': {'x': 1762, 'y': 34, 'w': 116, 'h': 62}})
for f in novas.values():   # uma camada por faixa: nada pode se sobrepor
    its = sorted(f['itens'], key=lambda i: i['inicio'])
    for a, b in zip(its, its[1:]):
        assert a['inicio'] + a['saida'] - a['entrada'] <= b['inicio'] + 1e-3, (f['id'], a['id'], b['id'])
i = max(k for k, f in enumerate(base) if f['tipo'] == 'video') + 1
c['faixas'] = base[:i] + list(novas.values()) + base[i:]
json.dump(c, open('composicoes/comp1.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print({k: len(v['itens']) for k, v in novas.items()})
