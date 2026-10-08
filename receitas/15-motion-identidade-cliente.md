# Vídeo de modelo com motion na identidade do cliente (layout + inserções + CTA)
> Recebe o(s) vídeo(s) bruto(s) da modelo e o LINK DO SITE do cliente — e faz TUDO no padrão fixo: identidade visual (fundo, cores, fontes, logo e componentes) tirada do site; decupagem assertiva feita e VERIFICADA por mim (uma tomada inteira por frase, cortes só entre frases, cada emenda conferida, sem comer começo nem fim de palavra); câmera 3D linear e suave nas telas cheias, sem zoom que corte informação; cor fixa (mais contraste, saturação e sombras); voz tratada (clara e forte, sem eco nem ruído); uma das 3 músicas fixas por vídeo; motion de INTERFACE com ilustrações do que a pessoa diz na 1ª parte e só layout na 2ª (com prints do cliente: telas recriadas e animadas mostrando as funcionalidades, como no SaaS reveal), marcas famosas citadas na fala; regras de design e alinhamento em TODAS as telas; nunca tela vazia; nada na frente do rosto. Uma composição por copy. Teto: US$ 4–5 por vídeo.
Ícone: sparkles
Pedido: Edite este vídeo com motion na identidade do cliente. Vídeo: [link] · Site do cliente: [link]

Atualizada em 06/10/2026 no projeto "clientesblue2" (Neosync, ferramenta de Amazon Ads: 3 copies). Rodadas: papel → "quero tudo
layout" → estoque vazio → legenda saindo da tela → tela branca/mouse fora do clique → "tudo torto, pouca margem" → tirar tag.
**Modelo pronto para copiar (tudo layout): `ferramentas/motion/fullmotion/neosync/`** — `base.css` (identidade + componentes),
`base.js` (transições, cursor, riscos, confete, legenda), `copy1.html`, `copy2.html`, `copy3.html` (o mais completo) e
`neosync-sfx.py` (SFX das 3 copies). A versão em papel (`forma/forma.html`, `neosync/copy*-papel.html`) foi SUBSTITUÍDA: não usar.

Atualizada de novo em 06/10/2026 no projeto "FF TECH 06.10" (FF Tech Consulting, cibersegurança/cloud: 4 copies MOFU/BOFU,
site ESCURO). Rodadas: final colado na fala → câmera do Reveal de SaaS → "mais suave e mais zoom" → "dá umas travadas, quero
linear e suave, está perdendo informação com os zooms" (aprovado assim) → **"a decupagem está muito ruim"** (regras novas no
passo 4). **Modelo pronto com CÂMERA e tema escuro: `fullmotion/fftech/`** — `base.css` (tokens do site em `:root`),
`base.js` (tudo da Neosync + `camera()`, `acende()`, `cascata()`, `abasDe()`, `centro()`, `pulsa()`), `copy1..4.html`,
`fftech-sfx.py`. Para site escuro + câmera, copie `fftech/`; para site claro, `neosync/` + a `camera()` do `fftech/base.js`.

## ✅ PADRÃO FIXO (aprovado 06/10/2026 — não perguntar, já aplicar)
| item | como | passo |
|---|---|---|
| identidade visual | SEMPRE do site do cliente: FUNDO (claro ou escuro, igual ao site), cores, fontes baixadas do próprio site, logo, raios, botões e o vocabulário de componentes dele | 5 |
| decupagem | uma tomada inteira por frase, cortes só entre frases, `cortes.py --fino`, conferência de CADA emenda + `verificar_decupagem.py` até sair limpa | 4 |
| começo e fim | vídeo começa quando a fala começa e termina 0,3–0,6 s depois que ela termina — `inicio_fim.py` = `ok` em toda copy, sempre | 4 |
| câmera | câmera 3D nas telas cheias, LINEAR e contínua (nunca parada > 1 s), zoom só até a linha inteira caber | Câmera |
| cor | sempre a mesma correção (sem LUT/referência) | 3 |
| voz | `voz_clara.py` sempre | 10 |
| música | as 3 fixas de `fullmotion/musicas/` (copy 1 → música 1, copy 2 → 2, copy 3 → 3, copy 4 → 1…) | 10 |
| motion | 1ª parte: layout + ilustrações do que a pessoa diz · 2ª parte: SEMPRE layout (produto em uso; com imagens do cliente = telas recriadas e animadas como no SaaS reveal) · marcas famosas citadas (regra 9) | 2, 6 |
| design | grade, margens, cores e tipografia abaixo em TODAS as telas (inserções, telas cheias, CTA) | — |
| telas | nunca vazias por mais de ~1 s (regra 3) | — |
| rosto | nada na frente do rosto/corpo (regra 10) | — |

## ⛔ Regras da pessoa (valem mais que tudo)
1. **NUNCA com cara de IA.** Nada de: fundo com grade de pontinhos/brilho difuso/blob; texto branco gigante com sombra/glow;
   número gigante sozinho + rótulo em caixa-alta espaçada; ícone em círculo/quadrado com degradê; cronômetro/anel/medidor;
   cards de vitrine vazios; listas de chips genéricos; documento de barrinhas cinza; carimbo.
2. **Layout é o principal, mas nem tudo é layout (regra da pessoa, FF Tech 06/10/2026).**
   - **1ª parte do vídeo (gancho/problema):** layout + **ilustrações do que a pessoa está dizendo** — se ela fala de
     caminho, um caminho se completando; de "um aponta pro outro", uma seta indo e voltando; de "tudo num time só", linhas
     convergindo. Ver **ILUSTRAÇÕES DA FALA** abaixo.
   - **2ª parte do vídeo (solução/produto) = SEMPRE layout:** a plataforma/serviço do cliente em uso.
     **Se houver imagens/prints do cliente** (site, painel, app, prints que a pessoa mandou): faça igual ao **Reveal de
     SaaS (receita 13)** — a tela é **RECRIADA do zero em HTML** a partir do print (print só como referência de layout,
     medidas e textos; print recortado/animado foi reprovado) e **animada mostrando as funcionalidades** que a fala cita:
     cursor clicando, campo sendo digitado, aba trocando, resultado aparecendo, com a câmera da seção Câmera.
     Sem imagens do cliente: layout no estilo do site (como sempre).
   - Continua proibido em qualquer parte: papel, mesa, post-it, caneta; "relatórios" = telas de sistema, não folhas.
3. **Nenhuma tela vazia.** Todo cartão/janela entra JÁ com conteúdo; o que a fala cita *acende* (fundo/contorno/cor) no
   momento da palavra — não "aparece" só nela. Toda aba clicada mostra conteúdo próprio (nunca só esmaecer a anterior).
   Se uma área fica em branco por mais de ~1 s, reduza a janela ou adiante o conteúdo.
4. **Nada torto:** tudo centralizado no próprio cartão, margens iguais dos dois lados. Balão sem ícone = padding simétrico
   e texto centralizado. Não reserve espaço para um elemento que só entra depois (o cartão fica descentralizado).
5. **Sem tags de pergunta/enfeite** ("Na prática?", "Automático" soltos). Só entra na tela o que mostra algo do produto/dado.
6. **Legenda: no máximo 2 palavras por vez** (3 saía da tela).
7. **Cursor sempre em cima do alvo no clique.** Cada cena com cursor usa um elemento próprio (`cur1`, `cur2`, `cur3`…) — a
   mesma `cursor()` em duas cenas esconde a outra. Se mudar a altura de uma janela, recalcule as coordenadas do clique.
8. **Nunca rodar comando em segundo plano** (render, exportar, transcrever): tudo em primeiro plano, até 10 min por chamada.
9. **Marcas famosas citadas na fala viram motion** (Amazon, Mercado Livre, Shopee, Instagram, WhatsApp, Google, iFood…):
   na palavra, o **ícone oficial da marca** pula na faixa de cima (acima da cabeça) e o **fundo do ícone se expande até
   cobrir a tela** e vira a tela cheia (`marcaExpande(t, 'amazon', t0)` no `base.js`; tela cheia com `circ=false` começando
   em t0 + 1,0 e a janela entrando em t0 + 1,05; SFX `marca_expande(t0)`). Vale para a entrada de qualquer tela cheia
   quando a frase cita uma marca. Logo: `simple-icons` (cdn.jsdelivr.net/npm/simple-icons@11/icons/<marca>.svg), nas
   cores oficiais (Amazon: fundo #232F3E, "a" branco, sorriso #FF9900); acrescente a marca em `MARCAS` no `base.js`.
   Dentro das telas também: abas/ícones de sistemas famosos com a cor deles (Amazon Ads, Seller Central).
10. **Nada na frente da modelo:** inserções na faixa acima da cabeça; confete não cai no rosto.

## ILUSTRAÇÕES DA FALA (só na 1ª parte do vídeo — regra 2)
Quando a frase desenha uma imagem na cabeça de quem ouve, o vídeo desenha a mesma imagem, no traço e nas cores do site,
animando no tempo das palavras. **Ilustra, não decora:** só entra se dá para apontar a frase que ela ilustra. Frase
abstrata ("mais eficiência") não ganha ilustração → acenda um dado no layout. Misture com o layout (não precisa ser só ilustração).
| a fala diz | ilustração |
|---|---|
| caminho, jornada, "do X ao Y", ponta a ponta | **caminho se completando**: linha se desenhando entre 3–4 marcos com rótulo curto, ponto andando na frente; marco alcançado acende; o último vira ✓ |
| um time só, tudo no mesmo lugar, centraliza | **linhas convergindo**: 3 traços saindo de rótulos e se encontrando num nó com o logo do cliente |
| um aponta pro outro, repassa, handoff | **seta indo e voltando** entre 2–3 caixas e se embolando (no "sem handoff" vira uma linha reta única) |
| quebrou, caiu, fora do ar, incidente | **linha que se rompe** (o traço parte ao meio, a ponta fica no vermelho do site) |
| conecta, encaixa, completa | **peças encaixando** (2–3 formas em contorno deslizando e fechando) |
| sobe, cresce, a fatura sobe | **linha de gráfico subindo** com o valor contando na ponta |
| proteger, blindar | **contorno fechando em volta** de um elemento (escudo/cadeado em TRAÇO, sem preenchimento) |
| filtrar, priorizar | **funil em traço**, itens passando e 1–2 saindo acesos |
- **Estilo:** traço de 6–10 px com ponta redonda na cor de destaque do site; marcos = círculos de 18–28 px em contorno;
  rótulos na fonte do site; fundo = fundo das telas do site. Verde = chegou/resolvido, vermelho = rompeu/problema.
- **Proibido (regra 1 continua valendo):** clipart, emoji, ícone 3D, bonequinho, degradê, glow, partículas, rede de
  pontinhos, mapa-múndi com linhas, cadeado/escudo preenchido brilhando.
- **Anima na fala:** o traço se desenha enquanto ela fala a frase (`tinta(t, id, t0, dur)` do `base.js` = `stroke-dashoffset`
  num `<path>`; `pop()` nos marcos); cada marco acende na palavra dele.
- **Onde:** num cartão na faixa de inserções (y 120–470, regra 10) ou como conteúdo da tela cheia do gancho (pode dividir a
  tela cheia com a janela de layout, ou uma aba "Jornada" mostrar o caminho). SFX: whoosh curto no traço, tick por marco,
  check no último.

## REGRAS DE DESIGN (seguir em TODAS as telas: inserções, telas cheias, janelas, CTA, ícones de marca)
### Grade e posições (tela 1080 × 1920)
| área | onde | regra |
|---|---|---|
| margem lateral | 60 px de cada lado | cartões de 960 px de largura, centro x = 540 |
| inserções (sobre a modelo) | faixa y 120–470, centro y ≈ 300 | altura ≤ 350; cabeça começa em y ≈ 480 — confira no quadro |
| balões/chips | centro y 250 e 362 (dois empilhados) | altura 86–96 px |
| janela de tela cheia | centro x 540, centro y 790–820 | altura 790–1000 (só o que o conteúdo pede); topo ≥ 300 |
| legenda | y 1500, centro | 2 palavras; Montserrat Bold 60 |
| zona segura Reels | nada importante acima de y 120 nem abaixo de y 1650 | |
| rosto (furo das transições) | medir no quadro (Neosync: 590, 800) | |

### Margens internas e espaçamento
- Cartão: padding 26–34 px (vertical) × 32–36 px (horizontal); raio e sombra COPIADOS do site (Neosync: cartão 12 px, botão 6 px, contorno 1 px suave).
- Entre título do cartão e primeira linha: 12–24 px. Linhas de lista/tabela: 64–96 px de altura, divisória 1,5 px.
- Pílulas: altura 44 px, padding 0 16 px. Botões: altura 74–92 px, cor e raio do botão principal do site (Neosync: verde #157F58, 6 px), texto + chevron; clicado = tom mais escuro + ✓.
- Números alinhados à direita, `font-variant-numeric: tabular-nums`. Valores destacados como pílula com margem própria.
- Destaque de linha/célula: fundo da cor de alerta a 6–10 % + texto na cor cheia; coluna em destaque: contorno 3 px
  na cor de destaque, sem cobrir a coluna vizinha (meça a largura).

### Cores
- Paleta SÓ do site do cliente (print/og:image): fundo, tinta (quase preto), cinza de texto secundário, cor de destaque.
- Função fixa: vermelho = problema/custo (#C9372A, fundo #FCEBE9); verde = resolvido/positivo (#15803D, fundo #E7F5EC);
  azul/destaque do site = seleção/foco (contorno de coluna, barra de carregamento). Nada mais de cores.
- Fundo das telas cheias: a cor de fundo do site, chapada (Neosync: #F9FAFB) — sem degradê, sem textura. Cartões brancos.
  **Exceção — site ESCURO (Newmo, 06/10/2026: "o site tem PRETO predominante, o verde e o branco em alguns pontos"):** se o fundo
  do site é preto/escuro, TODAS as telas seguem o site: fundo das telas cheias #000, cartões/janelas grafite (cor dos cards do site)
  com borda fina, títulos na cor clara de título do site, texto branco, a cor da marca só em destaques/botões, WhatsApp no modo
  escuro, logo na versão clara, legenda sempre branca. Olhe a cor do `body`/fundo do site antes de escolher o tema
  (modelo: `fullmotion/newmo/base.css` + `tema_escuro.py`).
- **Fundo e layouts SEMPRE na base do site (regra da pessoa, FF Tech 06/10/2026: "fundo e layouts com cores na base do site
  do cliente").** Não é só a cor de destaque: o FUNDO das telas cheias é o fundo do site (chapado), os cartões/janelas têm a
  cor e a borda dos cards do site, o botão é o botão do site (forma, cor, cor do texto), os status/pílulas usam o vermelho e o
  verde que o próprio site usa. Exemplo FF Tech (site navy): fundo #07091A, cartões #0E1226 com borda ciano a 22 %
  (`rgba(21,172,241,.22)`), botão = pílula ciano #15ACF1 com texto escuro ("Falar com um especialista", igual ao site),
  vermelho #FF3B3B, verde #4ADE80, borda/arco das transições na cor de destaque do site.
- **Como tirar as cores e fontes do site (5 min, sem print):** `curl -A "Mozilla/5.0" <site> -o site.html` → contar as cores
  (`grep -oiE '#[0-9a-f]{6}|rgba?\([0-9, .]+\)' | sort | uniq -c | sort -rn`) e baixar o CSS (`/_next/static/…css`): nele
  estão os tokens (`.bg-ff-blue{…rgb(21 172 241)}` = a cor do botão), os `@font-face` com o arquivo de cada fonte
  (baixe para `fullmotion/<c>/fonts/` e use em `@font-face` no `base.css`) e os raios (`border-radius` mais comuns).
  Logo: `<img src=…logo…>` do HTML (recorte a área útil com PIL `getbbox()`); `icon.png`/`apple-icon` = símbolo.
  Confira com o `og:image` (Read) se o clima bate. Fonte que só existe no Google Fonts: `fonts.googleapis.com/css2?family=…`
  com User-Agent de Chrome → pegue o `.woff2` do bloco `U+0000-00FF`.
- **Copie o vocabulário de componentes do site**, não invente: se o site mostra painéis de operação com rótulo mono
  ("// SEC · PENTEST"), status "ATIVO/LIVE", linhas de log (hora · origem · evento · pílula CRIT/ok), é ISSO que vira as
  janelas do vídeo. Os textos das telas usam os termos do site (serviços, produtos, CTA).
- Texto sem sombra. Sombra só nos cartões (curta e suave). Legenda: branca sobre vídeo, tinta escura sobre tela clara
  (`window.PAPEL_TOPO = 0` durante telas cheias) e branca quando a tela escurece.

### Tipografia
- Fonte do site em tudo (Neosync: Plus Jakarta Sans; rótulos pequenos em JetBrains Mono, como no site); títulos 32–40 px peso 650–700; corpo 25–30 px; rótulos 20–22 px caixa-alta
  com espaçamento .08em em cinza. No máximo 3 tamanhos por tela.

### Movimento
- Entradas: `FM.anim` (de 0.82–0.88, dy −50/−60 nas inserções, +120 nas janelas). Linhas em cascata a cada 0,08–0,35 s.
- Telas cheias: entram com **círculo fechando no rosto** e saem com **quadrado abrindo + arco na cor da tinta**.
- **Duas telas cheias coladas (< 0,6 s entre elas) = transição tela a tela, a modelo NÃO aparece no meio** (regra da pessoa,
  Leadrive 07/10/2026: "tem uma transição e logo depois volta pra outro motion, meio que bugando… preciso de um motion de
  transição entre as telas, sem mostrar a modelo por pouco tempo"). Faça a 2ª começar onde a 1ª termina (`FS` com o mesmo
  tempo): a `tela()` do `leadrive/base.js` mantém o fundo fechado; a `passa(t, '#wA', '#wB', t0)` empurra a janela antiga
  pra esquerda e traz a nova da direita — **só o empurrão, sem flash/faixa de luz** (aprovado assim: "tire esse flash/blur e deixe
  esse movimento, gostei") (A() da 2ª com `de: 1, dy: 0`;
  SFX `passa_som(t0)` no lugar de `fs_sai`/`fs_entra`).
- Ações de gente: cursor clicando aba/botão, campos sendo digitados, botão virando "salvo ✓" verde, valores contando.

### Câmera (telas cheias) — aprovada 06/10/2026, FF Tech: "linear e suave", sem perder informação
Pedido: "movimentos de câmera igual à receita de SaaS reveal" (receita 13). Três rodadas até acertar — siga a ÚLTIMA:
- *Reprovado 1 — "chega → fica → anda" com paradas:* "dá umas travadas". *Reprovado 2 — closes de 1,9–2,2× e mergulho
  de 2,5–3× na saída:* "está perdendo informação com alguns zooms, algumas partes não dá pra entender e fica confuso".
- **Aprovado:** a câmera anda em **linha reta, velocidade constante**, de ponto em ponto; uma média móvel de 0,8 s só
  arredonda as viradas (sem tranco). **Nunca parada por mais de 1 s** (regra da pessoa): pontos a ≤ 2,5 s um do outro e
  sempre diferentes — onde nada muda de alvo, ela continua aproximando devagar (+0,04–0,08 de zoom) ou deslizando.
- **Zoom só até onde a LINHA INTEIRA cabe** (rótulo da esquerda + pílula/valor da direita): ≈ 1,04–1,2 nas linhas de uma
  janela de 960 px; até ≈ 1,35–1,4 só quando o alvo é um bloco estreito com contexto (2 KPIs lado a lado). Abertura 0,92.
  Nada de close que corte o nome do que está acontecendo; nada de mergulho forte no fim (saída: +0,04–0,1 de zoom).
- O movimento vem de: deslizar de um bloco para o outro no tempo da fala (fornecedores → histórico; controles →
  vulnerabilidades → acessos), aproximação lenta, inclinação 3D de 1–4° que troca de lado entre os pontos, deriva de 2–3 px.
- **Presa às bordas:** com zoom, a janela sempre cobre a largura da tela (nunca aparece fundo vazio do lado).
- Só nas telas cheias. **Inserções sobre a modelo ficam paradas** (regra 10: nada mexendo perto do rosto).
- Como fazer (`fftech/base.js`): cada janela de tela cheia fica dentro de `<div class="cam" id="camN">` (mundo do tamanho
  da tela, `transform-origin: 0 0`); no `quadro`, logo depois de `tela(t)`:
  `camera(t, '#cam1', [[t, alvo, S, rx, ry, ox, oy], …])` — `alvo` = seletor, elemento, LISTA deles (enquadra o conjunto,
  ex.: `[linhas[0], linhas[3]]`) ou `[x, y]`. Os alvos são medidos uma vez com tudo no lugar final. O cursor continua fora
  da câmera e mira com `centro(el)` (rect real, já com a câmera) → fica no alvo mesmo com a câmera andando.
- Pontos de câmera = o roteiro da fala: cada ponto ~0,3–0,6 s antes da palavra que acende/clica o que ele enquadra.
- Confira com uma folha só de quadros nas ações (todos legíveis? nenhum nome cortado? nada vazio do lado?).

## Custo: teto de US$ 4–5 por vídeo
- **Copie a pasta `neosync/`** (troque `img/logo.png`, `:root` do `base.css`, textos e tempos); não reescreva do zero e não
  leia `fm.js`/`motion.js` inteiros. Estrutura, legenda, transições e confete continuam iguais.
- No máximo 2 folhas de conferência por copy (`--quadro` com ~12 instantes) e 1 render; correção depois que a pessoa ver.

## Passo a passo
1. **Baixar tudo da pasta — e editar TODOS os vídeos dela** (regra da pessoa, 06/10/2026: "sempre puxe todos os vídeos
   do drive"). Versões da mesma copy ("COPY 2" e "COPY 2 - V2") são vídeos diferentes: cada uma vira a sua composição,
   mesmo que o roteiro falado não esteja no documento da copy (aí a copy é a própria fala). Liste a pasta com `curl https://drive.google.com/embeddedfolderview?id=<ID>` e baixe cada
   `file/d/<id>` com `bo importar`. Item sem extensão ("NEOSYNC - COPY 2") pode ser ARQUIVO, não subpasta — confira se
   aparece como `file/d`. Arquivos com a mesma duração: compare (`psnr` > 45 dB = mesmo vídeo) e avise.
   Se o `bo importar` de pasta falhar ("não liberou"), baixe arquivo por arquivo.
   **Confira a resolução:** o `bo importar` de link do Drive pode trazer só a PRÉVIA (360×640). Se vier assim, baixe o
   original com `curl -L "https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t"` e troque com
   `bo substituir mN <arquivo>` (SmartRota, 06/10/2026: vinha 4K girado −90°, o editor já trata).
   Brutos 4K de 0,5–1,3 GB: o Drive às vezes trava a conexão no meio. Baixe para `midia/brutos/` com retomada e
   reconexão, em blocos de < 10 min (regra 8): `curl -sL -C - --speed-limit 30000 --speed-time 20 "<url>" -o arq.mp4`
   num laço até o tamanho bater com o `Content-Length` (`curl -sIL`). Depois `bo importar "<caminho ABSOLUTO>"`.
2. **Transcrever** (`bo transcrever todas`). Trechos estranhos (palavra esticada por segundos, fala sem transcrição no
   `bo silencio`) → retranscreva o trecho isolado (faster-whisper large-v3 na CPU, `compute_type=int8`; script em
   `neosync/retrans.py <wav 16k> a-b …`). Ache claquete ("copy pro fulano", "copy 3") e tomadas repetidas ("fulfillment" ×3).
   Corrija nomes (Whisper: "Nelsink/Aquos/ACUS" → "Neosync/ACoS") com `"editada": true`; ponha pontuação que faltar.
3. **Cor (fixa, sempre igual — aprovada 06/10/2026 "mais contraste, saturação e sombras"; não usar LUT/referência):**
   `eq=contrast=1.12:saturation=1.28:gamma=0.97,curves=all='0/0 0.12/0.07 0.3/0.24 0.55/0.54 0.8/0.84 1/1'`
   Aplique na **base cortada** (o motion vai por cima e o layout não muda de cor): renomeie `baseN.mp4` → `baseN-orig.mp4`
   e gere `baseN.mp4` com esse filtro (`-c:v libx264 -crf 14 -pix_fmt yuv420p -c:a copy`). A voz sai da `-orig`.
   Confira um quadro antes | depois lado a lado.
4. **Decupagem (eu mesmo faço e verifico) — regra da pessoa, FF Tech 06/10/2026: "a decupagem está muito ruim, preciso de
   mais assertividade".** O que deu errado lá e virou regra:
   *cortes em toda pausa de 0,28 s com zoom pulando no meio da frase · cauda da última palavra comida ("ponta", "embaixo")
   e o vídeo acabando colado na fala · começo suave cortado ("Na FF Tech" virou "FF Tech") · frase montada com pedaços de
   duas tomadas · tempos tirados da transcrição do editor, que estavam errados nos trechos com palavra esticada.*
   - **Mapa das tomadas antes de cortar:** para cada frase da copy, liste TODAS as tentativas dela no bruto (início–fim) e
     **retranscreva cada candidata** com `retrans.py` (large-v3 na CPU, tempo por palavra). Use os tempos do `retrans.py`,
     não os do `bo texto`, sempre que o trecho tiver palavra > 1 s, claquete por perto ou buraco sem transcrição.
   - **Escolha uma tomada INTEIRA por frase:** a que fala a frase completa, sem tropeço, no ritmo e na entonação certos
     (a última tentativa costuma ser a boa). **Nunca monte uma frase com pedaços de duas tomadas** (entonação e posição
     mudam). Só quando NENHUMA tomada tem a frase inteira: emende na pausa natural, com zoom alternado, e avise a pessoa.
   - **Corte só entre frases** (no ponto final ou na pausa da vírgula longa), nunca no meio de uma ideia.
   - **Bordas pela energia, não pela transcrição:** meça a energia a cada 50 ms em volta do início e do fim
     (`20·log10(rms)`). O corte de entrada fica ~0,1 s antes de a voz subir de −45 dB (pega "Na", "E", "O" ditos baixinho).
     O de saída fica depois de a cauda cair abaixo de −50 dB, nunca em cima dela. Barulho logo depois (respiração, "é…")
     → pare antes dele.
     **Cuidado com a consoante oclusiva (HD Tecnologia, 07/10/2026: "aqui corta a palavra sistema"):** o "t/p/k/d" no
     meio da palavra dá uma queda de energia de 50–80 ms ("sis·[−45 dB]·te·ma") que parece fim de palavra — cortei ali e
     comi o "ma". O fim da palavra é onde a energia cai e NÃO volta em < 0,1 s; meça em blocos de 20 ms e confira com o
     `retrans.py` terminando o trecho DEPOIS da sílaba (a transcrição também erra o fim: dizia 36,40, o "ma" ia até 36,66).
   - **COMEÇAR QUANDO A FALA COMEÇA E TERMINAR DEPOIS QUE A FALA TERMINA — SEMPRE VERIFICAR (regra da pessoa, FF Tech
     06/10/2026).** Começo: a 1ª palavra entra em até ~0,1–0,25 s do primeiro quadro (nada de silêncio, olhar parado ou
     respiração antes), sem cortar a 1ª sílaba. Fim: a última palavra termina inteira e o vídeo segue **0,3–0,6 s** com
     ela parada (o CTA respira), nunca acabando colado na fala nem com mais de ~1 s de sobra.
     Verificação obrigatória em TODA copy, na voz tratada (não no vídeo mixado — música e SFX enganam a medida):
     `python -I -X utf8 fullmotion/inicio_fim.py midia/<c>-cN-voz.wav …` → tem que sair `ok` em todas.
     Rode de novo depois de QUALQUER mudança de corte e antes de exportar. *Na FF Tech, as 4 copies saíram com a voz
     colada no fim (0,02–0,04 s) e duas foram entregues assim antes de alguém perceber.*
   - Corte: `python forma/cortes.py <proj> <m> <comp> <saida palavras.js> a-b … --fino`
     (`--fino` = bordas em −46 dB, só encurta pausa ≥ 0,45 s para 0,28 s, respiração natural dentro da frase fica inteira,
     0,55 s de cauda no último trecho, zoom 1,12 alternado em cada corte para esconder o pulo). Uma composição por copy.
     Exporte a base: `bo exportar --comp <comp> --nome baseN --pasta <ABS>/cache/motion`.
     *Tomada boa colada na próxima tentativa* (IMME, 07/10/2026: "DRE" refeito e a frase seguinte começando 0,05 s
     depois): escreva o trecho como `a-b!` — fim travado em b, sem a folga `--fim` que comeria a 1ª palavra seguinte.
     *Bruto que acaba colado na fala* (sem 0,3 s depois da última palavra): estenda a base com o último quadro parado
     (`tpad=stop_mode=clone:stop_duration=0.45` + `apad=pad_dur=0.45`); fica embaixo do CTA.
   - **Confira CADA emenda** (não só a base inteira): para cada ponto de corte da base, retranscreva ±1,5 s em volta
     (`retrans.py` na base exportada) e responda: a palavra antes termina inteira? a de depois começa inteira? sobrou
     sílaba, respiração cortada no meio, "é…", clique de boca? o tom bate? Se não, mexa nos tempos daquele trecho.
   - **Compare palavra por palavra com a copy** (não "frase por frase"): liste o que falta, o que sobra e o que mudou.
     Diferença de fala que não é erro (ela disse "O responsável" no lugar de "Um responsável") fica e vai para o resumo
     final; palavra que sumiu no corte ("Na") é erro → refaça.
   - **Verificação obrigatória:** `python fullmotion/verificar_decupagem.py cache/motion/baseN.mp4` — retranscreve a base
     cortada e aponta repetição, gaguejo/fragmento ("ai, af… a ferramenta"), muleta/claquete ("ai", "né", "copy",
     "corta", "de novo"), palavra esticada, buraco no meio da frase e voz sem texto. Para cada aviso: ouça/retranscreva
     o pedaço (`neosync/retrans.py`) e, se for erro, ajuste os trechos do `cortes.py`, reexporte e rode de novo, até sair
     limpa (palavra longa como "automaticamente" e respiração de 0,3–0,4 s não são erro). Confira também se o texto
     transcrito bate com a copy, frase por frase.
5. **Identidade visual — SEMPRE do site do cliente** (confirme que o link é o site OFICIAL da empresa da copy — na Neosync o 1º link era de outra empresa; o certo era neosync.com.br). Capture com `neosync/ref/captura.mjs` (troque a URL): cores, fontes, botões e logo (`/logos/…`, og:image). Logo = símbolo + nome (`img/logo.png` + `img/wordmark.png`, recolorido para fundo claro) (cores, fonte, logo, raio dos cantos, botões, componentes; nada da
   Blue Ocean). Se o site estiver fora do ar, pegue o `og:image` de diretórios (ex.: moge.ai) e o logo no
   GitHub/redes da empresa. Confirme que é a MESMA empresa da copy (a Neosync do link era outra; a pessoa mandou seguir
   a paleta do print). Logo pequeno: recorte o símbolo e amplie com desfoque + limiar → `img/logo.png`.
   **Site sem arquivo de logo** (IMME, 07/10/2026: o logo só aparece em fotos do site): redesenhe em SVG a partir da foto
   (`fullmotion/imme/logo.html`) e gere o PNG transparente com `fullmotion/imme/fazer_logo.sh` (render em fundo branco e
   preto → alfa). Avise a pessoa que o logo é recriado e peça o arquivo oficial.
   Método de extração (cores, tokens do CSS, `@font-face`, logo, componentes) e regra do fundo: seção **Cores** acima.
   Escreva tudo no `:root` do `base.css` (`--fundo --card --tinta --cinza --linha --destaque --verm --verde`) e use só
   essas variáveis nas páginas — trocar de cliente = trocar o `:root`, as fontes e o logo.
6. **Roteiro** (tempos da linha cortada):
   | trecho | o quê |
   |---|---|
   | gancho (≈ 0–15 s) | **tela cheia em layout** seguindo a copy: entra no 1º termo forte (≈ 1 s) — se for uma marca famosa, com o ícone dela expandindo (regra 9); senão, com círculo fechando; janela com abas do sistema que a pessoa usa (ex.: Amazon Ads / Seller Central / cálculo); cada frase acende um dado; troca de aba = cursor clicando; termina com o problema em vermelho ("???") |
   | (1ª parte: gancho + problema) | layout **+ ilustrações da fala** onde a frase tiver imagem concreta (seção ILUSTRAÇÕES DA FALA) |
   | meio | **inserções no topo**, uma por frase: logo do cliente, cartões com dados do produto (linhas já preenchidas, acendendo na fala) |
   | 2ª tela cheia (2ª parte: solução) | **SEMPRE layout — a plataforma do cliente em uso**: campos digitados, botão clicado, resultado contando (+ confete nos números). **Com prints/imagens do cliente:** telas recriadas do zero em HTML a partir dos prints e animadas mostrando cada funcionalidade que a fala cita, como no Reveal de SaaS (receita 13: recriar, não recortar o print; câmera acompanhando a ação). Nada de ilustração aqui. |
   | fim | **só o CTA**: logo + frase + botão do site com clique |
7. **Página:** copie `fftech/copy1.html` (com câmera; site escuro) ou `neosync/copy3.html` (site claro) e ponha a câmera
   (seção Câmera). Rode as 2 folhas `--quadro … --sobre baseN.mp4` e confira com o checklist.
   *Armadilhas:* nunca use a classe `p` num elemento comum (no `fm.css` `.p` é o posicionado no centro → as linhas se
   empilham); Python com `-I` ignora `PYTHONIOENCODING` → use `python -I -X utf8` nos scripts que imprimem "−"/acentos.
8. **Render (primeiro plano):** `node render.mjs fullmotion/<c>/copyN.html <ABS>/midia/<c>-cN-motion-v1.mp4 --sobre baseN.mp4`
   (~100 s para 50 s de vídeo). Versões novas: `-v2`, `-v3`… e `bo substituir`.
9. **SFX:** acrescente um bloco em `neosync-sfx.py` com os mesmos tempos (cliques, ticks de linha, pops, contador,
   `fs_entra`/`fs_sai` nas telas cheias) → `midia/<c>-cN-sfx.wav`.
10. **Áudio — SEMPRE aplicado, sem perguntar: voz tratada + música fixa (aprovado 06/10/2026: "voz clara e forte, sem eco e ruído da sala"; detalhes na
    receita 16):**
    - **Voz** (uma por copy, da base cortada SEM a cor — tem o áudio original):
      `python fullmotion/voz_clara.py cache/motion/baseN-orig.mp4 midia/<c>-cN-voz.wav`
      Cadeia: `highpass 70 + afftdn nr=10` (ruído LEVE) → `dereverb.py` suave 2 passadas (`--alvo 0.15 --forca 1.5
      --piso -18 --suave 0.8 --larg 11`; depois `--rt60 0.65 --n 4096 --ate 600 --alvo 0.18`) → EQ (`lowshelf 220 +5`,
      `500 −2`, `1k −1`, `3,5k −1`, `highshelf 5500 +9`, `7500 +4`, `highshelf 11k −3`) → `deesser i=0.15` (LEVE) →
      ganho até −16 LUFS + `alimiter` calmo superamostrado (pico −2 dBFS). **Sem compressor.**
      *Reprovado: de-esser forte (i 0,45) → abafada; compressor/`mixar.py` na voz → eco e chiado de volta.*
    - **Conferir a voz:** `python fullmotion/espectro_voz.py <original.wav> <voz.wav>` → 6 kHz entre −13 e −17 dB,
      8 kHz entre −16 e −23 dB (rel. 1–2 kHz) e "fala − pausas" ≥ 25 dB. Faltou brilho: +2 dB nos shelves de
      5500/7500; voz fina: +2 dB no `lowshelf 220`.
    - **Música (fixa, não perguntar):** as 3 de `ferramentas/motion/fullmotion/musicas/` (início do som em
      `musicas.tsv`: 1-technology-science 0,74 s · 2-hi-tech-corporation 1,17 s · 3-reel-timelapse 0,00 s).
      Copy 1 → música 1, copy 2 → 2, copy 3 → 3, copy 4 → 1… (uma diferente em cada vídeo do mesmo cliente).
      `python fullmotion/mixar.py midia/<c>-cN-voz.wav fullmotion/musicas/<n>-….m4a <início> <dur da base> cache/audio
      --nome mxN` e use SÓ o `mxN-musica.wav` → `midia/<c>-cN-musica.wav` (≈ −33 LUFS enquanto ela fala, ~17 dB abaixo
      da voz; fade in 0,4 s / out 1,8 s).
11. **Composição final:** `bo comp nova "<Cliente> – Copy N (final)"`:
    - V1 = render do motion com **`volume: 0`** (o som vem das faixas tratadas);
    - A1 = voz tratada · A2 = SFX · A3 = música (todas com início 0; `saida` ≤ duração de cada arquivo);
    - legenda do editor desligada; `audio: {normalizar: true, lufs: -13.4, limpar: false, voz: false}`
      ("limpar"/"voz" do editor pegam a mistura toda e desfazem o tratamento).
    - Simule a exportação: `amix` das 3 faixas → exportação real ≈ −14 LUFS, pico −1,3 (o editor entrega ~0,6 LU abaixo do alvo: −13,4 → −14,0; medido 06/10/2026).
    - Se a base mudar depois (corte novo), refaça a voz e a música dessa copy (`voz_clara.py` + `mixar.py`) e troque
      com `bo substituir`.
    - Confira com `bo quadro … --comp`, abra com `bo comp abrir` e peça para a pessoa ouvir um trecho de cada.

## Checklist antes de mostrar (olhe a folha e responda para cada quadro)
- `verificar_decupagem.py` saiu limpo nas bases? Texto bate com a copy PALAVRA POR PALAVRA (nada sumiu no corte)?
- Cada emenda conferida (±1,5 s retranscrito)? Alguma frase montada com duas tomadas? Algum corte no meio de uma ideia?
- **`inicio_fim.py` deu `ok` na voz de TODAS as copies?** (começa na fala, 1ª sílaba inteira, termina 0,3–0,6 s depois
  da última palavra). Sem isso, não exporta.
- Fundo das telas cheias = fundo do site? Cartões, botão e pílulas nas cores do site (nada de cinza claro em site escuro)?
- Câmera: em algum momento parada > 1 s? Algum zoom cortando nome/valor do que está acontecendo? Aparece fundo vazio do lado?
- Algum trecho da base SEM nenhuma palavra da transcrição? É barulho que o `cortes.py` achou que era voz (pigarro,
  tosse, respiração forte, mexer no cabelo antes de falar) → tire (RH Digital, 06/10/2026: pigarro entre duas frases
  e 0,5 s de arrumar o cabelo no começo passaram pela verificação). O vídeo começa no quadro em que ela já está pronta.
- Tropeço/gaguejo no fim ou começo de um trecho ("ai, af… a ferramenta")? Palavra com duração anormal na transcrição
  (> 1 s) = retranscreva o pedaço e corte. Se cortar depois do motion pronto: refaça `cortes.py`, reexporte a base,
  ponha `WARP` no `quadro` (animação no tempo antigo, `legenda(T)` no novo) e corte o mesmo pedaço do SFX (`atrim`).
- Legenda escura sobre o vídeo? `window.PAPEL_TOPO = 9999` no começo de cada `quadro`; só as telas cheias põem 0.
- Alguma tela/cartão/aba vazia ou com área em branco grande? → preencher/encolher.
- Algo torto, fora do centro, encostado na borda ou com margem desigual? → alinhar pela grade acima.
- Legenda com mais de 2 palavras ou saindo da tela? Legenda branca sobre fundo claro?
- Cursor exatamente sobre o botão/aba no clique?
- Alguma inserção sobre o rosto/corpo? Confete caindo no rosto?
- Parece template de IA (lista do topo)? → refazer.
- Ilustrações só na 1ª parte, cada uma apontando para uma frase, no traço/cores do site? A 2ª parte é 100% layout?
  Com prints do cliente: as telas foram RECRIADAS (não print recortado) e mostram as funcionalidades citadas?
- Áudio: voz sem eco/chiado e não abafada (`espectro_voz.py` dentro das faixas acima)? Música diferente em cada copy,
  baixando quando ela fala? Exportado ≈ −14 LUFS (meça o mp4 com ebur128)? V1 com volume 0 (sem voz dobrada)?
- Conteúdo ilustrativo (números, pedidos, nomes, depoimentos): avise a pessoa que é exemplo.
