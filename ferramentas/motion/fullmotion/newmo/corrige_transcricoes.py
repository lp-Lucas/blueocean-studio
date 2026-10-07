"""Newmo: correções das transcrições (nome da marca, tomadas refeitas com tempo novo, pontuação)."""
import json, sys, os
proj = sys.argv[1]
def abre(m): return json.load(open(os.path.join(proj, 'transcricoes', m + '.json'), encoding='utf8'))
def salva(m, T): json.dump(T, open(os.path.join(proj, 'transcricoes', m + '.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
def ed(w, t=None, i=None, f=None):
    if t is not None: w['t'] = t
    if i is not None: w['i'] = i
    if f is not None: w['f'] = f
    w['editada'] = True
for m in ('m1', 'm2', 'm3'):
    T = abre(m)
    for w in T:
        if 'Nilmo' in w['t'] or 'Nilma' in w['t']: ed(w, w['t'].replace('Nilmo', 'Newmo').replace('Nilma', 'Newmo'))
        if w['t'] == 'Follow': ed(w, 'Follow-up,')
        if w['t'] == '-up,': w['oculta'] = True; w['editada'] = True
    if m == 'm1':
        # retomada "Entende o interesse do contato, coleta" em 18,9 s (a 1ª tentativa "atende…" fica fora do corte)
        nov = [('entende', 18.93, 19.34), ('o', 19.34, 19.44), ('interesse', 19.44, 20.00), ('do', 20.00, 20.10), ('contato,', 20.10, 20.64), ('coleta', 20.66, 21.14)]
        for k, (t, i, f) in zip(range(29, 35), nov): ed(T[k], t, i, f)
        ed(T[37], 'necessárias'); ed(T[38])
    if m == 'm2':
        ed(T[6], '24')
        # "SDR" saiu duas vezes (10,4 e 11,0 s): fica o segundo
        ed(T[1], i=10.06, f=10.34); ed(T[2], i=11.04, f=11.50); ed(T[3], i=11.52)
    if m == 'm3':
        nov = [('Com', 36.36, 36.46), ('a', 36.46, 36.56), ('Newmo', 36.56, 36.98), ('você', 36.98, 37.20), ('automatiza', 37.20, 38.04), ('essas', 38.04, 38.20), ('comunicações,', 38.20, 39.04)]
        for k, (t, i, f) in zip((52, 53, 54, 55, 56, 57, 58), nov): ed(T[k], t, i, f)
        nov = [('cria', 46.05, 46.44), ('réguas', 46.44, 46.88), ('de', 46.88, 46.96), ('mensagens', 46.96, 47.52), ('e', 47.52, 47.68), ('mantém', 47.68, 48.08), ('sua', 48.08, 48.22),
               ('operação', 48.22, 48.70), ('funcionando', 48.70, 49.32), ('mesmo', 49.32, 49.58), ('quando', 49.58, 49.88)]
        for k, (t, i, f) in zip(range(59, 70), nov): ed(T[k], t, i, f)
        # frase refeita em 21,05 s ("ela está gastando tempo pra…" tropeçou em 19 s)
        nov = [('ela', 21.08, 21.21), ('está', 21.21, 21.35), ('gastando', 21.35, 21.75), ('o', 21.75, 21.75), ('tempo', 21.75, 21.99), ('que', 21.99, 22.19), ('poderia', 22.19, 22.47),
               ('estar', 22.47, 22.79), ('usando', 22.79, 23.03), ('para', 23.03, 23.29), ('vender', 23.29, 23.63), ('e', 23.63, 24.05), ('atender', 24.05, 24.45), ('melhor.', 24.45, 24.81)]
        for k, (t, i, f) in zip(range(38, 52), nov): ed(T[k], t, i, f)
        T[41]['oculta'] = True; ed(T[84], 'Meta.')
    salva(m, T)
print('ok')
