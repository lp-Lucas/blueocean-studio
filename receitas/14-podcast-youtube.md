# Episódio de podcast para o YouTube (Destrinchando Cases)
> Do bruto de 1 h ao vídeo final: decupagem, outro ângulo sincronizado, zoom suave, nome/empresa/termos técnicos, CTA com QR, gancho em motion Blue e vinheta.
Ícone: camadas
Pedido: Decupe e sincronize esse episódio para o YouTube:

Aprovado em 03–04/10/2026, projeto "podcastronyYTB" (episódio Bull/BURH RH, Lucas Junqueira × Rony). Composição final:
comp5 "Vídeo final – YouTube" = gancho (comp4) + vinheta (comp3) + episódio (comp1). Referência de estilo das peças:
o vídeo da Financerize (youtube.com/watch?v=IRQbm0XVce0). Scripts-modelo em `ferramentas/podcast-youtube/`
(foram escritos para este projeto: troque tempos e nomes).

**Regras de trabalho deste tipo de projeto**
- **Nunca deixe um comando ir para segundo plano** (o processo morre). Render/rotoscopia longos: um item por comando, < 10 min.
- Antes de remontar uma faixa por script, compare com a linha do tempo: o que a pessoa apagou ou mudou de lugar à mão fica
  assim (aqui ela apagou 5 definições e desceu os nomes). Para trocar uma peça só, troque a mídia daquele item.
- Script de base/plano nunca grava por cima da composição final (grave a base em `trab/`).

## 1. O bruto
- Um arquivo só: episódio → CTA do final (várias tomadas) → tomadas da CTA do meio → no fim, filmagens de **outro ângulo**
  (câmera na mão, closes) repetindo trechos da conversa. `bo importar`, `bo transcrever m1`, ler a transcrição inteira.
- **CTA do meio: descarta.** CTA do final: fica só a melhor tomada (a mais completa e fluida).

## 2. Decupagem (comp1, 16:9) — `montar.py`
- Episódio da 1ª palavra (−0,06 s; tire o silêncio do começo) até o fim da conversa, sem "corta aí".
- Silêncios ≥ 0,6 s (−30 dB) viram 0,3 s; corte sempre no ponto mais baixo do áudio perto da borda (envelope de 20 ms).
- Tire os erros de fala ("não sei se é assim que se fala…", "algumas… perdão", "uuu").
- Emenda episódio → CTA final: **corte seco** (o fade para preto foi reprovado).

## 3. Outro ângulo sincronizado (V2)
- Áudio a 8 kHz → correlação cruzada de cada clipe do fim contra o episódio (`sync.py`, `mapa_b.py` mapeia tudo em
  janelas de 3 s). O atraso é constante dentro de cada clipe; confira início e fim de cada trecho (`verifica.py`, < 6 ms).
- Chicote de câmera: meça o movimento por quadro (scene score, `escolhe_b.py`) e só use trechos parados.
- Trechos de **4–7 s**, começando e terminando em frase, a cada ≥ 40 s, longe de emendas e zooms. Close de quem está
  falando. Sem som (volume 0). Aqui: 20 trechos, ~100 s no episódio de 35 min.
- **Quem fala** (o áudio é mono): olhe os dois rostos ampliados em tiras de 2–3 s (crop de cada rosto lado a lado).
  A medida automática de movimento de boca não é confiável (quem gesticula engana).

## 4. Zoom suave
- Campo `zooms` do item (motor do editor, `[{t, z}]` com curva suave): 9 destaques, aproxima até **1,08×** em 0,8 s,
  segura, volta. `foco.x` um pouco para quem fala. "Não dê muito zoom, apenas um pouco."
- Para o zoom e as peças com transparência saírem na exportação, **reinicie o app** depois de mexer no motor.

## 5. Peças por cima (estilo Financerize, Blue) — `fullmotion/pecas-youtube.html`
Cada peça é um WebM VP9 com transparência (`node render.mjs … --alfa --w W --h H --params '{…}'`), importada e posta em
faixas próprias: V3 Apresentação, V4 Cartões e termos, V5 CTA, V6 Logo. `pecas_plano.py` gera a lista, `render_pecas.sh`
renderiza o que falta (nome de arquivo novo a cada versão: `-v2`, `-v3`), `pecas_montar.py` põe na linha do tempo.
- **Nome** (`tipo: nome`): nome em branco + função embaixo, palavra a palavra saindo do desfoque, ao lado da pessoa.
  Entra quando a própria pessoa começa a falar. Posição aprovada: **na parte de baixo da tela** (a pessoa desceu à mão).
- **Empresa** (`tipo: empresa`): cartão preto que abre de uma linha, círculo com o logo (ícone do site oficial via
  `logo_site.mjs`, ou a foto/emblema que a pessoa mandar — Squad Ghost), selo azul com a onda da Blue (**a onda nunca
  gira**, só a estrela do selo).
- **Termo técnico** (`tipo: termo`), na 1ª vez que o termo é falado, ~1 s antes: **o pop azul da Blue pinga no meio, desliza
  para a esquerda e abre a etiqueta preta com o termo + caixa azul com o que é**; na saída recolhe para o pop. Textos curtos,
  de leigo. Confira a grafia com a pessoa (o método é **ODCR**: Oferta irresistível, Demanda qualificada, Comercial
  capacitado, Retenção efetiva). Ela apagou os termos óbvios (SaaS, Gestor de tráfego, Meta Ads, Lead, Closer).
- **CTA no canto superior esquerdo** (`tipo: cta`): pílula "Dê o próximo passo no seu SaaS" + caixa com QR
  (**ytb.blueoceansem.com.br**, o link do QR da referência) e "Para quem já tem cliente pagando e quer mais!". **12 s a cada
  ~1 min**, desviando dos closes; a primeira logo no início (~11 s).
- **CTA final** (`tipo: ctacentro`): cartão azul grande com QR, logo, "Dê o próximo passo no seu SaaS" e "Aponte a câmera do
  celular" — **só na CTA falada do final**, no centro, a 70% do tamanho, na altura do peito (as pessoas aparecem inteiras),
  conteúdo menor com margem igual nas bordas.
- **Logo da onda** em branco fixa no canto superior direito.

## 6. Gancho (comp4, ~31 s) — `fullmotion/gancho-destrinchando.html` (receita 12 adaptada para 16:9)
- Coletânea de 5–6 falas mais polêmicas/de resultado (comp2), com close do outro ângulo em parte delas.
- A página desenha o próprio vídeo (quadros da base) + inserções: telas azuis com arco, vídeo voltando num quadro
  arredondado, corte seco para tela clara, palavra gigante, cartões e contadores com confete, punch-ins nas viradas.
  Cenas aprovadas: investimento no Meta com retorno 0 (cursor clicando "Investir", cédulas entrando no Meta, "ROI 0%"),
  celular do LinkedIn só com posts de RH/desempregado e busca "empresário" → 0 resultados, tag "Blue Ocean | +6 anos".
- **Nada na frente do rosto**: cartões em cima ou embaixo conforme o enquadramento.
- **Nunca deixe um take aparecer menos de ~1 s** (esconda a emenda na varrida/tela cheia ou estique o close).
- Termina com a fala inteira + ~1 s de tela de motion. Música "Flashing Lights" com a batida na 1ª tela azul,
  SFX −34 LUFS, voz −16, mistura −14.

## 7. Vinheta (comp3, 7 s) — `vinhetas/destrinchando-blue.html`
Quadro de investigação (lâmpada acendendo, fotos de SaaS, fios, câmera 3D suave) **nas cores da Blue** (navy, azul
#0137FF nos fios/anotações, fita e post-it verde-água). Título "DESTRINCHANDO CASES" escrito à mão no fim.

## 8. Montagem final (comp5)
`bo comp nova "Vídeo final – YouTube" --copiar comp1`, empurra tudo do episódio para depois do gancho + vinheta, gancho no
V1 com voz/SFX/música em faixas próprias. **Transição gancho → vinheta suave**: a tela azul do gancho aproxima (1→1,1×) nos
últimos 0,8 s e a vinheta entra por cima dissolvendo (`entra: 0.8`) vindo de 1,12× para 1×; o episódio anda 0,8 s para trás.
Vinheta → episódio: corte seco (a vinheta termina no título).

## Conferir
- `bo quadro` em cada emenda, cada peça (entrada/meio/saída) e na transição; legenda/peças nunca no rosto.
- Exporte só depois de reiniciar o app (zoom animado e WebM com alfa).
