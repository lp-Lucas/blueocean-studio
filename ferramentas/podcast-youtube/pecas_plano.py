"""Plano das peças do vídeo principal (comp1): apresentação, empresas, termos técnicos e CTA a cada ~1 min.
Gera trab/pecas.json (o que renderizar e onde entra na linha do tempo)."""
import json

c = json.load(open('composicoes/comp1.json', encoding='utf-8'))
V2 = next(f for f in c['faixas'] if f['id'] == 'V2')['itens']
FIM = max(it['inicio'] + it['saida'] - it['entrada'] for f in c['faixas'] if f['tipo'] == 'video' for it in f['itens'])
# os tempos abaixo são da linha ANTES de tirar o silêncio do começo (0,49 s em 03/10): DESLOC desconta no fim
DESLOC = 0.49
FIM = FIM + DESLOC
CTA_FINAL = 2099.45   # começo da CTA falada do Lucas ("para você dono de SaaS que chegou aqui até o final…")

pecas = []
def add(id, tipo, inicio, x, y, w, h, faixa, **params):
    pecas.append({'id': id, 'tipo': tipo, 'inicio': round(inicio, 2), 'caixa': [x, y, w, h], 'faixa': faixa, 'params': {'tipo': tipo, **params}})

# apresentação (Lucas à direita, Rony à esquerda) e empresas
add('nome-lucas', 'nome', 0.30, 480, 290, 900, 240, 'V3', nome='Lucas Junqueira', sub='CMO · Blue Ocean', lado='dir')
add('emp-burh', 'empresa', 8.40, 580, 820, 760, 210, 'V4', nome='BURH', sub='SaaS de RH · case Blue Ocean', logo='../img/burh-icone.png', dur=2.7)
# CTA grande no centro (pedido: "aqui nesse momento, deixe a cta no centro do video com QR code"), na altura do peito
# CTA do canto já no começo (pedido: no 11 s fica a CTA do canto; a grande do centro é só no final)
pecas.append({'id': 'cta-inicio', 'tipo': 'cta', 'arquivo': 'cta', 'inicio': 11.00, 'caixa': [8, 14, 480, 300], 'faixa': 'V5', 'params': {'tipo': 'cta'}})
add('nome-rony', 'nome', 23.90, 500, 300, 900, 240, 'V3', nome='Rony', sub='Head de Performance · Blue Ocean', lado='esq')
add('emp-ghost', 'empresa', 32.10, 160, 820, 760, 210, 'V4', nome='SQUAD GHOST', sub='Time de performance · Blue Ocean', logo='../img/squad-ghost.png', cobre=True, fundo='#0b1a1c')

# termos técnicos: 1ª menção (tempo na linha do comp1, ver trab/termos.py)
TERMOS = [
    (110.46, 'SaaS', 'Software as a Service: sistema usado pela internet e pago por assinatura.'),
    (257.91, 'Onboarding', 'Primeiras reuniões com o cliente para entender o negócio e montar o plano de ação.'),
    (284.81, 'Gestor de tráfego', 'Profissional que cria, acompanha e otimiza as campanhas de anúncios pagos.'),
    (304.25, 'Meta Ads', 'Plataforma de anúncios do Facebook e do Instagram.'),
    (328.33, 'Lead', 'Pessoa ou empresa interessada que deixou o contato e pode virar cliente.'),
    (376.07, 'Atribuição de conversão', 'Regra que define qual canal fica com o crédito por um lead ou por uma venda.'),
    (410.48, 'Formulário nativo', 'Formulário que abre dentro do Instagram e do Facebook, sem a pessoa sair do app.'),
    (443.00, 'Closer', 'Vendedor responsável por conduzir a negociação e fechar a venda.'),
    (838.00, 'Benchmark', 'Análise do que os concorrentes fazem para encontrar padrões que funcionam.'),
    (847.32, 'Turnover', 'Rotatividade: quantos funcionários saem e precisam ser substituídos num período.'),
    (896.73, 'ICP', 'Ideal Customer Profile: o perfil de cliente que tem mais fit com a sua solução.'),
    (991.22, 'Marketing de guerrilha', 'Ações criativas e de baixo custo que chamam atenção de um jeito inesperado.'),
    (1180.76, 'ODCR', 'Método da Blue Ocean: Oferta irresistível, Demanda qualificada, Comercial capacitado e Retenção efetiva.'),
    (1202.66, 'LTV / CAC', 'Quanto o cliente gera de receita (LTV) dividido pelo custo para conquistá-lo (CAC).'),
    (1384.54, 'Persona', 'Retrato do cliente-alvo: cargo, dores e objetivos de quem decide a compra.'),
    (1418.64, 'CPM', 'Custo por mil impressões: quanto você paga para o anúncio aparecer mil vezes.'),
    (1627.20, 'Palavra-chave negativa', 'Termo bloqueado para o anúncio não aparecer em buscas sem intenção de compra.'),
    (1662.48, 'Índice de qualidade', 'Nota do Google para a relevância do anúncio e da página: afeta o custo e a posição.'),
    (1710.77, 'Forecasting', 'Previsão de receita com base nas negociações que estão em andamento.'),
    (1751.63, 'Follow-up', 'Retomar o contato com o lead depois da primeira conversa.'),
    (1926.84, 'SLA', 'Prazo combinado entre marketing e vendas para atender cada lead.'),
    (1938.40, 'Pitch', 'A apresentação de vendas: como a solução é mostrada para o cliente.'),
    (1991.94, 'Growth marketing', 'Marketing guiado por testes e dados para crescer de forma contínua.'),
    (2025.63, 'LP e VSL', 'Landing page: página feita para converter. VSL: vídeo de vendas que leva até a oferta.'),
]
for k, (t, termo, texto) in enumerate(TERMOS, 1):
    add(f'termo-{k:02d}', 'termo', t - 0.9, 440, 770, 1040, 300, 'V4', termo=termo, texto=texto)

# CTA no canto superior esquerdo: 12 s a cada ~60 s, sem cair em cima de um close do outro ângulo (cobriria rosto)
closes = sorted((it['inicio'] + DESLOC - 1.0, it['inicio'] + DESLOC + it['saida'] - it['entrada'] + 1.0) for it in V2)
t, n = 40.0, 0
while t + 12 < CTA_FINAL - 15:
    for a, b in closes:
        if t < b and t + 12 > a: t = b   # empurra para depois do close
    if t + 12 >= CTA_FINAL - 15: break
    n += 1
    pecas.append({'id': f'cta-{n:02d}', 'tipo': 'cta', 'arquivo': 'cta', 'inicio': round(t, 2), 'caixa': [8, 14, 480, 300], 'faixa': 'V5', 'params': {'tipo': 'cta'}})
    t += 60.0
# CTA final: fica até o fim do vídeo
# CTA final: o cartão grande com QR no centro, menor (70%) e na altura do peito para as pessoas continuarem aparecendo
pecas.append({'id': 'cta-final', 'tipo': 'ctacentro', 'arquivo': 'cta-centro-final', 'inicio': CTA_FINAL, 'caixa': [610, 560, 700, 308], 'faixa': 'V5',
              'params': {'tipo': 'ctacentro', 'dur': round(FIM - CTA_FINAL, 2)}, 'tela': [1000, 440]})
for p in pecas: p['inicio'] = round(max(0.0, p['inicio'] - DESLOC), 2)
# ajustes feitos à mão na linha do tempo (03/10) — manter, não voltar ao padrão:
APAGADOS = {'termo-01', 'termo-03', 'termo-04', 'termo-05', 'termo-08'}   # SaaS, Gestor de tráfego, Meta Ads, Lead, Closer
CAIXA = {'nome-lucas': [921, 580, 900, 240], 'nome-rony': [60, 599, 900, 240]}   # nomes descidos para baixo
pecas = [p for p in pecas if p['id'] not in APAGADOS]
for p in pecas:
    if p['id'] in CAIXA: p['caixa'] = CAIXA[p['id']]
VERSAO = {'emp-burh': 'v2', 'emp-ghost': 'v2', 'cta-centro-final': 'v2', **{f'termo-{k:02d}': 'v2' for k in range(1, 25)}, 'termo-13': 'v3'}
for p in pecas:
    base = p.get('arquivo', p['id'])
    if base in VERSAO: p['arquivo'] = f'{base}-{VERSAO[base]}'
json.dump(pecas, open('trab/pecas.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(pecas), 'peças;', n, 'aparições do CTA:', ' '.join(f"{p['inicio']:.0f}" for p in pecas if p['tipo'] == 'cta'))
