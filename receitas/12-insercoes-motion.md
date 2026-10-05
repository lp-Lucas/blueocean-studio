# Inserções de motion sobre o vídeo (Social Media Blue)
> Motion estilo Blue Ocean por cima do vídeo da pessoa falando — cartões, bullets, números e palavras-chave entrando em momentos variados (não o vídeo todo), um trecho em tela cheia com círculo fechando / quadrado abrindo, legenda, SFX e música com a batida na virada.
Ícone: sparkles
Pedido: Faça motion estilo Blue Ocean com inserções durante este vídeo: 

Aprovado em 03/10/2026, projeto "Social Media MOTION" (comp2 "Motion – Pipeline cheio", 4 rodadas: inserções →
legenda + tirar logo + tirar silêncios → tela cheia + triagem melhorada → música). Pedido original: "motion estilo
blue ocean, mas com inserções durante o vídeo, sem ser no vídeo todo… sempre variando, sem preencher a tela toda,
bullet points com palavras importantes". Referências: os mesmos reels da receita 11 (DdpQbagx38T, DdkMpzaxBfC,
DNn4lpau2Nv, DPjtZGhiWMY, DRcbhksDgww), já baixados em `projetos/teste de fullmotion/midia/ref/`.
**Modelo pronto para copiar: `ferramentas/motion/fullmotion/insercoes-pipeline.html` + `insercoes-pipeline-sfx.py`.**

## Passo a passo
1. **Montagem limpa (receita 2).** `bo transcrever m1`, `bo texto m1`. Bruto com retake ("volta", "me perdi"): fique
   com a tomada mais fluida inteira e só troque a frase que saiu melhor em outra (aqui: gancho da 1ª tomada + 2ª tomada
   + versão final do "Concentre o time…"). Meça início/fim no volume (20 ms) — o Whisper erra bordas e às vezes
   **inventa palavra repetida** ("contabilizadas, contabilizadas"): retranscreva o trecho isolado antes de cortar.
2. **Tirar os silêncios** (pedido na 2ª rodada: "no 14,2 silêncio extenso demais"): pausas ≥ 0,28 s (abaixo de −36 dB)
   dentro dos trechos viram 0,2 s (corta de início+0,1 a fim−0,1). Pedacinho < 0,1 s que sobrar entre cortes: junte no
   corte. Guarde os cortes em `cache/motion/cortes.json` (tempos da linha antes dos cortes).
3. **Punch-ins** (zoom 1,2 / 1,18) nas viradas da fala (ex.: "Mas ainda dá tempo…", "Pipeline cheio não bate a meta").
   Montagem fica na comp1 ("Vídeo 1"); `bo exportar --comp comp1 --nome base --pasta <caminho ABSOLUTO>/cache/motion`.
4. **Página das inserções**: copie `insercoes-pipeline.html`, troque cenas e tempos. Fundo transparente; render
   **por cima do vídeo**: `node render.mjs fullmotion/X.html <saída.mp4> --sobre <base.mp4>` (o áudio da base vai junto;
   `--quadro "a,b,c"` com `--sobre` já mostra o vídeo embaixo — confira assim). ~2 min para 60 s.
   Se os silêncios forem cortados depois, **não refaça os tempos**: a lista `CORTES` no fim da página converte o tempo
   do vídeo cortado no tempo antigo (e o SFX recebe `cortes.json` como 2º argumento).
5. **SFX**: `python fullmotion/X-sfx.py <saida.wav> cortes.json` (fmsfx, −34 LUFS, um som por movimento).
6. **Composição própria** (`bo comp nova "Motion – …"`): V1 = vídeo renderizado (importado), A1 = SFX, A2 = música.
   Trocas depois: `bo substituir mN <arquivo novo>` (renderize sempre com nome novo: -v2, -v3…).
7. **Legenda**: `bo transcrever` o vídeo renderizado e `"legenda": {"ativa": true}` (padrão, receita 3) — ver regras abaixo.
8. **Música** (pedido: "a melhor parte quando tem a virada do assunto"): `bo importar <link> --audio`; ache a entrada
   da batida na energia por segundo (grave sobe de ~−40 para ~−3 dB) e o instante exato a cada 20 ms (aqui havia uma
   pausa curta da faixa e a batida em 21,68 s). `inicio = batida − tempo_da_virada` (virada = "Mas ainda dá tempo",
   19,02 s → início 2,66). `python fullmotion/mixar.py <áudio do vídeo renderizado> <música> <inicio> <dur> midia/motion
   --nome X` → usa só o `X-musica.wav` (ducking na voz, ~18 dB abaixo). Mistura final: −14 LUFS, pico −1,5 dBTP.

## As inserções (o que foi aprovado)
- **Variar sempre**: cada inserção num lugar e formato diferente — topo (y 300–650, acima da cabeça), altura do peito
  (y 1200–1500, como as pílulas dos reels), lateral; e respiros só com a pessoa entre elas. Nunca por cima do rosto.
- Peças: cartão branco "Meta do mês" com barra travando (gancho, já entrando no quadro 0); pílula "Pipeline cheio · 47";
  notificação "Proposta enviada · há 3 semanas · ✓✓ visualizada"; chips "Negociação perdida" que entram no **cartão azul
  de número** (contador + linha + selo, tranco no fim); **pílulas azuis de pergunta empilhando** (ícone verde-água, "PERGUNTA
  1/2/3", a anterior sobe e apaga — estilo DNn4); rótulo azul "3 perguntas"; ícone de funil + rótulo "Maior chance de
  fechamento"; frase solta branca com palavra-chave verde-água #00FFD4 e **risco branco na expressão inteira**
  ("todo o pipeline"), com **véu escuro suave atrás** (as luminárias do fundo tiravam contraste); selo final com check +
  confete branco.
- **Triagem (aprovada na 3ª rodada)**: cartão "Pipeline do mês" + "Revisando 1/4", moldura azul passando por cada
  negociação deixando um "?"; depois tudo vai para duas colunas "Priorizar" (check verde) × "Só inflando a previsão"
  (cinza). A 2ª parte (colunas) foi elogiada: "mantenha dessa forma, ficou bom".
- **Sem logo no final** (pedido: "tire a logo do final").
- Nomes/valores dos cartões são ilustrativos — avise a pessoa e troque por reais se ela mandar.

## Tela cheia (pedido: "motion que preenche a tela toda no 5,7 e termina depois de 10,4")
Como os reels de referência entram e saem do motion em tela cheia:
- **Entrada — círculo fechando** (DdpQ): fundo claro (#FAFAFB→#E6E6E9) com furo redondo no rosto (SVG evenodd), raio
  1250 → 300 (expoOut 0,42 s), segura, fecha (0,3 s); borda branca 14 px com sombra. Som: sopro descendo + grave.
- **Conteúdo** ilustra a frase: total do pipeline contando (R$ 412.000), quadro com 3 colunas × 3 negociações; no
  "parecem oportunidades" as etiquetas pulsam; no "não tem chance real" 7 apagam ("Sem chance real"), 2 ganham contorno
  verde-água "Chance real", o total é riscado e entra "Só R$ 96.000 com chance real".
- **Saída — a pessoa volta num quadrado arredondado** que aparece no meio (mola) e cresce até passar da tela
  (1320×2400, senão sobra borda branca), com **arco verde-água** passando em volta (DdpQ). A inserção seguinte espera
  a volta terminar.
- Outras entradas vistas nas referências (para variar em outro vídeo): onda da Blue varrendo (DNn4/DRcb), corte seco
  para branco com o elemento entrando desfocado (DPjt/DRcb).

## Legenda (padrão Blue, com estas regras)
- Fica em 72%; **sobe para 24% (`legenda.trechos`) só nos trechos com cartão na altura do peito**, trocando sempre na
  virada de um bloco (`bo legenda` mostra os blocos).
- **Some onde a tela já escreve a própria fala** (frases soltas, pílulas de pergunta, selo final): `"oculta": true` nas
  palavras da transcrição do vídeo renderizado.
- **Na tela cheia clara a legenda do editor (branca) some no fundo**: ela é desenhada dentro da página (SVG,
  Montserrat Bold 46,1 px = tam 72, y 1536, caixa #0137FF 74 px raio 15, 7 px abaixo), **escura no claro e ficando
  branca quando a pessoa volta**; essas palavras saem da legenda do editor (oculta).

## Conferir
- Folha `--quadro` com `--sobre` em cada inserção, nas emendas e em cada etapa das transições (entrada, meio, saída).
- `bo quadro` na composição com a legenda ligada: nada por cima de nada.
- Mistura: amix(vídeo, SFX, música) + loudnorm → ~−14 LUFS / −1,5 dBTP.
