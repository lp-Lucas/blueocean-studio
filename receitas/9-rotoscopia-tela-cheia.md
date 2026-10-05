# Rotoscopia em tela cheia (prints de celular + pessoa no canto)
> Fundo 9:16 ocupando a tela toda — sites simulados no celular, notícias com marca-texto, B-roll real — e a pessoa recortada menor, no canto de baixo, trocando de lado a cada cena. Tudo importante na área segura do Reels.
Ícone: camadas
Pedido: Faça esse vídeo com rotoscopia em tela cheia (prints de celular, pessoa no canto), seguindo a copy:

Aprovado em 02/10/2026 ("Copy 12 – tela cheia (teste)", projeto "reels com rotoscopia"), depois de várias rodadas
de ajuste com a pessoa. É a evolução da receita 8 ("Vídeo com rotoscopia"): mesmo recorte e mesma busca de material
real, mas outro layout. As duas convivem — pergunte qual estilo, se o pedido não disser.
Referência de estilo: anúncio de UGC da Turbo (Biblioteca de Anúncios da Meta, id 1658494658778459).

## O layout (tela 1080×1920)
**Área segura de anúncio Reels (Meta): 14% em cima, 35% embaixo, 6% dos lados → y 270–1248, x 65–1015.**
Fora dela o Instagram põe barra, perfil, texto do anúncio e botão; nada importante pode ficar lá.
| faixa da tela | o que fica |
|---|---|
| 290–780 px | a informação: manchete, número com marca-texto, cartão |
| ~845 px | legenda (`"pos": 44`) — no vão entre a informação e a cabeça |
| a partir de ~910 px | a pessoa: cabeça começando aí, olhos ~1210 (dentro da área segura); o corpo segue para baixo |
| 300 px | faixa de qualificação no CTA (`"y": 300`; o padrão 216 cai fora da área segura) |

**A pessoa** (poses do `compor_tela.py`, escala sobre o vídeo original 1080×1920):
- `centro` (s 0.90): gancho e case — momentos de "olha pra mim".
- `esq` / `dir` (s 0.85, rosto em x≈360 / x≈720): o resto, **alternando de lado a cada cena**, sempre do lado
  oposto ao que importa no fundo. É o "embaixo e na diagonal" da referência.
- **Troca de lado em corte seco**, no mesmo quadro em que o fundo troca. *Deslizar foi testado e reprovado*
  ("faz realmente um corte seco"). Fica `"deslize": 0` (padrão).
- A borda lateral do vídeo original cortava o ombro numa linha reta quando caía dentro da tela: o compositor faz
  ela sumir num degradê de 70 px (já automático).

## Ritmo dos fundos
Intercalar tipos, sem repetir o mesmo tipo seguido: **notícia → vídeo real → design → print de tela → vídeo
sem rotoscopia → …**
1. **Notícia** (print de celular rolando até o dado, com marca-texto amarelo no número).
2. **Site / perfil real** (print de celular): site da empresa citada, Instagram da empresa, site da Blue Ocean, GitHub
   para "código".
3. **Vídeo real** do Mixkit em tela cheia (call center, contrato, aperto de mão, gráfico), receita 8 ensina a baixar.
4. **Design 9:16** só onde agrega informação que não existe pronta: funil "do anúncio ao contrato", case com número.
   Case de cliente: **com o logo do cliente** (pegue no site dele — no WordPress costuma estar em
   `wp-content/uploads/...`; logo branco com fundo transparente é o ideal).
5. **Vídeo sem rotoscopia** (`"fundo": "original"`) — a pessoa gravada, tela cheia, como veio. É o descanso entre
   os B-rolls e o lugar de toda frase que não tem um B-roll forte.

### O que foi tirado e por quê (não repita)
- **Cartões de design "de enfeite"** ("+90% da receita", "Compra · Investe · Avalia", "Receita previsível não nasce
  do produto", "Novos leads este mês") → viraram vídeo sem rotoscopia. *Motivo: "sem muita importância"* — design que
  só repete o que a pessoa está falando não ajuda; melhor ver a pessoa.
- **B-roll genérico sem informação** (programador digitando, reunião) → trocado por notícia real ou por vídeo
  sem rotoscopia. B-roll de vídeo só quando ilustra uma ação concreta da frase (assinar contrato, time de vendas).
- **Barra de status do iPhone** (9:41, sinal, bateria) nos prints → tirada. *"Só simular os sites no mobile já está
  bom."* (fica como opção `"barra_status": true`, desligada).
- **Corte curtinho no meio de uma troca de cena** (0,44 s de "só que…") → removido da linha do tempo: com a pessoa
  trocando de lado, ele aparecia como um tranco. Corte de menos de ~0,6 s caindo numa troca de fundo: tire.
- **Deslize da pessoa entre as poses** → corte seco (acima).

## Marcas citadas: o logo em evidência (regra da pessoa, 02/10/2026)
**Toda vez que a fala cita uma marca (cliente, case, empresa de exemplo), o logo dela tem que aparecer grande na tela
naquele momento.** O jeito aprovado é o **perfil do Instagram oficial** (a foto de perfil é o logo) — ache o @ certo
pela busca (ex.: GreatPages é @use.great, não @greatpages) —, ou o logo oficial no cartão do case.
- Print do perfil: `print_celular.mjs <url> <png> --instagram --espera 9000`. O `--instagram` tira a barra
  "Instagram · Entrar · Abrir aplicativo" e o rodapé "Cadastre-se": **com eles o anúncio fica com cara de low ticket.**
- Largura padrão (390 pt). Mais estreito quebra a linha de seguidores do Instagram (testado 300 e 345).
- Na cena: `"zoom": 1.0, "rolagem": [[0, 0]]` — perfil **parado**: cabeçalho (logo, nome, seguidores, bio) fica em
  ~300–810 px, dentro da área segura. Não role (o logo sai por cima).
- Várias marcas seguidas na fala ("A Devzapp, Greatpages e Time is Money"): uma cena por marca, colada no nome.

## Simulação de celular (prints)
Ferramenta: `node "<ferramentas>/print_celular.mjs" <url> midia/broll/celular/<nome>.png --alto 3000 --espera 8000`
— emulação real de iPhone (390 pt × 2,77 = 1080 px de largura) pelo DevTools do Chrome, e **fecha aviso de
login (Instagram), cookie e banner fixo** antes do print. Abra o png com Read para achar as posições.
- **Rolagem** (`"rolagem": [[segundos, y], …]`, suave): comece com a manchete parada em ~300 px na tela e role até o
  parágrafo do número chegar em ~320 px quando a pessoa fala o número. Conta: `y_tela = (y_print − rolagem) × zoom + 120`,
  então `rolagem = y_print − (y_tela − 120) / zoom`.
- **Zoom** padrão 1,12 (aumenta o texto e corta só a margem de 6%). **Site com margem lateral pequena (Baguete) ou
  perfil de Instagram: `"zoom": 1.0`** — senão corta a primeira letra da manchete.
- **Marca-texto:** `"marca": [[x0,y0,x1,y1], …]` em pixels do png, uma caixa por linha do trecho.
- Pop-up de cookie que sobrar fica no fim da página (fora da área usada). Anúncio no meio da matéria (InfoMoney)
  aparece — é o site real; evite parar a rolagem com o anúncio na área de cima.
- Dois veículos diferentes para a mesma notícia no começo (NeoFeed, depois Baguete) dão peso ao gancho.

## Passo a passo
1. **Material, cortes e recorte:** igual à receita 8 (passos 1, 2 e 4): importar, transcrever, conferir a copy,
   cortar silêncio e retomada, e gerar a máscara com `matte.py` (em primeiro plano, ~7 min por 77 s de vídeo).
   Se já existir a máscara de uma versão anterior do mesmo vídeo, reaproveite.
2. **Material real:** notícias e sites com `print_celular.mjs`; vídeos do Mixkit em `midia/broll/videos/`; logos em
   `midia/broll/logos/`.
3. **Cartões 9:16:** `python "<ferramentas>/cartoes.py" midia/broll/tela cartoes-tela.json --tela`
   (conteúdo cai sozinho em 290–780 px; mantenha cada cartão baixo — funil com 4 degraus e no máximo 3 leads cabem).
4. **Roteiro** `roto-tela.json` na pasta do projeto (modelo completo no topo do `compor_tela.py`):
   `{"original", "mascara", "saida", "cenas": [{"ate", "fundo", "pose", "rolagem", "zoom", "marca"}]}`.
   `ate` no tempo do ORIGINAL; troque de cena nas pausas da fala; último = `{"fundo": "original", "desce": 280}`
   (CTA sem recorte, descido para a legenda não cair no rosto, topo preenchido pelo próprio vídeo desfocado).
5. **Compor:** `python "<ferramentas>/compor_tela.py" .` (~3 min; confere a contagem de quadros).
6. **Composição:** numa composição própria (`bo comp nova "… – tela cheia" --copiar compX`), importe a saída
   (`bo importar`), copie a transcrição corrigida para o id novo (`transcricoes/mN.json`, mesmo áudio) e troque
   a mídia dos itens do V1. Depois de cada `compor_tela.py`: `bo substituir mN "<saída>"`.
   Legenda `"pos": 44` (e `"palavras": 2` ficou melhor neste layout); faixa de qualificação `"y": 300`; sem zoom no V1.
7. **Conferir:** `bo quadro` em todas as cenas com o retângulo da área segura desenhado por cima
   (`ImageDraw.rectangle((65,270,1015,1248))`): informação dentro, legenda sem tampar nada, olhos dentro.
   Confira também a troca de cena quadro a quadro (corte seco) e a procura de quadro preto (receita 8).

## Aprendido no 2º vídeo (Devzapp/Greatpages, 02/10/2026)
- **Criação de anúncios = tela do Meta Ads.** Quando a fala cita "anúncios", "campanha", "tráfego": gravação de tela
  real do Gerenciador de Anúncios. Fonte oficial: os vídeos da página https://www.facebook.com/business/tools/ads-manager
  (pegue as URLs .mp4 do HTML; o `meta-2.mp4` 720×900 é o passo a passo "Create ad → objective → budget → audience").
  Na cena: `"inicio": 2.6, "recorte": [0, 106, 720, 700], "topo": 270` — **o recorte tira os títulos "01 Create ad /
  02 Set objective"** (pedido: "deixa só o vídeo mesmo"). O fundo desfocado sai do mesmo pedaço recortado.
- **Gravação de tela / vídeo vertical em B-roll:** `"recorte": [x,y,w,h]` + `"topo"` encaixa pela largura sem cortar
  as laterais; `"inicio"` escolhe o trecho com ação (cursor clicando). Vídeo deitado comum: `"foco"` 0–1 (pessoa do
  B-roll à direita → 0.75).
- **Gaguejada:** se a pessoa apontar uma palavra repetida/engasgada, ache no volume do áudio (pedaço curto + pausa
  antes da palavra inteira), corte só o pedaço e a pausa, e mova o início da palavra na transcrição para dentro do corte.
- **Pasta do Drive:** o `bo importar` não aceita link de pasta. Baixe o HTML da pasta, ache os ids de arquivo
  (`"1…"` de 33 caracteres) e importe `https://drive.google.com/file/d/<id>/view`.
- **Copy com dois CTAs** ("vou só regravar o CTA"): use a regravação, corte a primeira e o bastidor.
- **Vários vídeos no mesmo projeto:** um roteiro por vídeo (`roto-copy2.json`) e
  `python compor_tela.py . roto-copy2.json`; máscara `cache/roto/mNN-mascara.mp4` por vídeo.
- **Recorte e composição SEMPRE em primeiro plano** (`timeout: 600000`). Em segundo plano a tarefa morre com a sessão
  e deixa arquivo quebrado. Antes de reaproveitar uma máscara, confira o número de quadros com o do original.

## Aprendido no 3º vídeo (SaaSpocalipse, 02/10/2026)
- **Legenda nunca na frente do rosto** (olhos → boca). Testa ou queixo pode. A legenda tem altura por trecho:
  `"legenda": {"pos": 44, "trechos": [{"de": s, "ate": s, "pos": %}]}` (tempos da linha do tempo; o primeiro trecho
  que bate vale). Para achar onde mudar, detecte o rosto (OpenCV 4: `haarcascade_frontalface_default`, a cada 0,2 s
  no vídeo composto) e marque como proibida a faixa sobrancelha (y + 0,25 h) → boca (y + 0,88 h). Por cena: se os
  845 px batem, desça para baixo da boca (até 1215 px) ou suba para a testa/acima da cabeça (≥ 320 px).
  Pessoa gravada perto da câmera (cenas sem rotoscopia): legenda na testa, `pos` ~35. Confira desenhando a caixa da
  legenda por cima dos quadros. (A estimativa pela máscara erra em rosto grande — use o detector de rosto.)
- **Imagem pronta da pessoa (arte 9:16) no gancho**: vai em `midia/broll/tela/<nome>.png` e entra como fundo de tela
  cheia; a pessoa menor e mais baixa para não tampar a arte (`"pose": {"s": 0.70, "x": 162, "y": 773}`) e a legenda
  num vão livre da arte (aqui `pos` 57).
- **Gaguejada sem dizer onde**: o Whisper esconde a repetição dentro de uma palavra só. Procure no áudio palavras com
  uma pausa ≥ 120 ms DENTRO delas (energia em 20 ms) e olhe o desenho do volume: pedacinho curto + pausa + a palavra
  inteira = gaguejada ("L… Lead"); pausa entre duas palavras normais não é. Confira também as emendas de cortes
  antigos (sobrou um "de" solto em "replica de… de um dia"). Depois de cortar, ajuste início/fim das palavras na
  transcrição para o meio delas ficar dentro do trecho usado (senão a palavra some da legenda).
- **Repetição que o Whisper esconde** ("Então se… se o teu SaaS" virou um "se" só, longo): a prova é exportar o
  trecho da composição (`bo exportar --de --ate`), importar e transcrever o áudio FINAL. Palavra isolada antes de uma
  pausa grande + a mesma palavra depois = repetição. Corte da pausa até antes da palavra seguinte e ajuste os tempos.
- **Vídeo longo (> ~100 s) ou com várias tomadas**: separe a tomada boa num arquivo (`ffmpeg -ss -to … -bf 0 -g 15`),
  importe, copie a transcrição deslocando os tempos, e recorte em duas partes (`matte.py --de/--ate`) emendando as
  máscaras — cada comando fica abaixo de 10 min, em primeiro plano.

## Para mudar uma cena depois
Edite a cena em `roto-tela.json` (fundo, pose, rolagem), rode `compor_tela.py` e `bo substituir`. Não precisa
recortar de novo. Trocar uma cena por "sem rotoscopia": `{"ate": …, "fundo": "original"}`.

## Ferramentas (em `C:\Users\lpess\OneDrive\Documentos\Projetos\BLUEOCEAN STUDIO\ferramentas\rotoscopia\`)
`matte.py` (recorte) · `compor_tela.py` (este layout) · `print_celular.mjs` (print de celular limpo) ·
`cartoes.py --tela` (design 9:16) · `prints.py` (recortes e matéria 1080×960 da receita 8).
