"""Marcadores de tempo de um full motion (receita 11): acha cada frase do roteiro na transcrição e exporta os tempos
de cada palavra. Serve para a MESMA página renderizar várias leituras da mesma copy (cada uma no seu ritmo).
uso: python ancoras.py <roteiro.json> <transcricoes/mN.json> <nome_take> <saida.js> [--negrito "a,b"]
roteiro.json: [["chave", "frase como é falada"], ...] em ordem.
saída: TAKES[nome] = {T: {chave: início}, TT: {chave: [tempo de cada palavra]}, FIM: {chave: fim}, DUR, GRUPOS}
(e um .json igual ao lado, para o roteiro de som)."""
import json, sys, re, unicodedata, subprocess, os

rot_arq, trans_arq, nome, saida = sys.argv[1:5]
neg = sys.argv[sys.argv.index('--negrito') + 1] if '--negrito' in sys.argv else ''
norm = lambda s: re.sub(r'[^a-z0-9$]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
igual = lambda a, b: a == b or (len(a) >= 5 and len(b) >= 5 and a[:5] == b[:5])   # preenche ≈ preencha

ws = [w for w in json.load(open(trans_arq, encoding='utf-8')) if not w.get('oculta')]
nw = [norm(w['t']) for w in ws]
T, TT, FIM, pos = {}, {}, {}, 0
for chave, frase in json.load(open(rot_arq, encoding='utf-8')):
    alvo = [norm(p) for p in frase.split() if norm(p)]
    achou = None
    for i in range(pos, len(ws)):
        j, k, ts = i, 0, []
        while k < len(alvo) and j < len(ws):
            if not nw[j]: j += 1; continue
            if igual(nw[j], alvo[k]): ts.append(round(ws[j]['i'], 2)); k += 1; j += 1
            else: break
        if k == len(alvo): achou = (i, j, ts); break
    if not achou: sys.exit(f'não achei "{frase}" ({chave}) depois da palavra {pos}')
    i, j, ts = achou
    T[chave], TT[chave], FIM[chave] = ts[0], ts, round(ws[j - 1]['f'], 2)
    pos = j
dur = round(ws[-1]['f'] + 0.35, 2)
g = subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), 'grupos.py'), trans_arq, '--negrito', neg],
                   capture_output=True, text=True, encoding='utf-8').stdout
g = g.replace('const GRUPOS = ', f'TAKES.{nome}.GRUPOS = ')
dados = {'T': T, 'TT': TT, 'FIM': FIM, 'DUR': dur}
open(saida, 'w', encoding='utf-8').write(f'window.TAKES = window.TAKES || {{}};\nTAKES.{nome} = {json.dumps(dados, ensure_ascii=False)};\n{g}')
json.dump(dados, open(saida.replace('.js', '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(nome, 'ok ·', len(T), 'marcadores · dur', dur)
