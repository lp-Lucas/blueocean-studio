"""Acha a 1ª menção de cada termo técnico na linha do tempo do comp1 (tempo no arquivo → tempo na linha)."""
import json, re, unicodedata
ws = json.load(open('transcricoes/m1.json', encoding='utf-8'))
c = json.load(open('composicoes/comp1.json', encoding='utf-8'))
V1 = sorted(next(f for f in c['faixas'] if f['id'] == 'V1')['itens'], key=lambda i: i['inicio'])
V1 = [i for i in V1 if i['midia'] == 'm1']
def linha(src):
    for it in V1:
        if it['entrada'] <= src <= it['saida']: return it['inicio'] + src - it['entrada']
norm = lambda s: unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode()
toks = [norm(re.sub(r'[^\w\-]', '', w['t'])) for w in ws]
BUSCA = {   # termo: sequência de palavras (normalizadas) que marca a menção
  'SaaS': ['saas'], 'Squad': ['squad'], 'Onboarding': ['on', '-board'], 'Gestor de tráfego': ['gestor', 'de', 'trafego'],
  'Meta Ads': ['meta'], 'Lead': ['leads'], 'Atribuição de conversão': ['atribuicao'], 'Formulário nativo': ['formulario', 'nativo'],
  'Closer': ['closer'], 'Benchmark': ['benchmark'], 'Turnover': ['turnover'], 'ICP': ['icp'], 'Marketing de guerrilha': ['guerrilha'],
  'ODSR': ['odsr'], 'LTV/CAC': ['ltv'], 'Persona': ['persona'], 'CPM': ['cpm'], 'Termos de pesquisa': ['negativou'],
  'Índice de qualidade': ['indice', 'de', 'qualidade'], 'Forecasting': ['forecasting'], 'Follow-up': ['follow'], 'SLA': ['sla'],
  'Pitch': ['pitch'], 'Multicanal': ['multicanal'], 'Growth marketing': ['growth'], 'VSL': ['vsl'], 'Landing page': ['lp'],
}
for termo, seq in BUSCA.items():
    for i in range(len(toks) - len(seq) + 1):
        if toks[i:i + len(seq)] == seq:
            t = linha(ws[i]['i'])
            if t is None: continue
            ctx = ' '.join(w['t'] for w in ws[max(0, i - 4):i + 8])
            print(f'{termo:24s} arquivo {ws[i]["i"]:8.2f}  linha {t:8.2f}  | {ctx}')
            break
    else: print(f'{termo:24s} -- não achei')
