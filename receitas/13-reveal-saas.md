# Reveal de SaaS com a interface recriada (anúncio do produto)
> Anúncio full motion de um software: a interface do produto é RECRIADA do zero em HTML (não print) e animada com câmera 3D contínua, cortes invisíveis, digitação seguida pela câmera, cliques do mouse e telas que batem com cada frase da copy.
Ícone: sparkle
Pedido: Faz um anúncio reveal do nosso SaaS (full motion) com a interface do produto, nesse estilo:

Aprovado em 04/10/2026, projeto "teste de facilidade": "Full motion – Reveal Blue Ocean Studio" (comp1) — o próprio
editor. "Resultado final ficou ótimo!". Referência de estilo: pin do Pinterest 10203536652573575 ("SaaS Explainer
Motion Video": fundo escuro, UI flutuando em 3D, barra "Ask AI" pulsando, chat aparecendo, logo no fim).
Tudo em `ferramentas/motion/fullmotion/studio/` (`studio.html` = modelo pronto para copiar; `studio-sfx.py` = som).
Base de render, legenda e áudio = receita 11 (Full Motion BlueOcean).

## 0. O estilo visual vem SEMPRE do site ou dos prints que a pessoa mandou (regra, 04/10/2026)
Aprovado em 04/10/2026, projeto "testefullmotion youtube": "Full motion – Reveal YouTube" (comp1, 16:9) — "ficou muito bom".
Pedido: "puxe o estilo do site do youtube, puxe referenciais visuais de animação e de layout por lá mesmo e copie".
Tudo em `ferramentas/motion/fullmotion/youtube/` (`youtube.html` = modelo pronto 16:9; `youtube-sfx.py`; `ref/captura.mjs`).
- **Mandou link do site → abra o site de verdade antes de desenhar qualquer peça.** `ref/captura.mjs` (Chrome headless
  pelo `chrome.mjs`, 1920×1080, pt-BR) tira print das telas que a copy usa (home, busca, página interna, rolagem) e
  extrai do DOM: **logo em SVG** (o oficial, não redesenhado), fonte (`getComputedStyle`), tamanhos, cores, raios, alturas,
  posições (`getBoundingClientRect`) de cada componente. Mandou prints → as medidas/cores saem dos prints.
- **Copie o que o site entrega**, inclusive o tema (o YouTube abriu escuro → vídeo todo no tema escuro). Fonte do site
  baixada se não estiver no PC (Roboto: `github.com/google/fonts` → `fontes/`). A identidade Blue Ocean (fundo de
  bolinhas, azul #2D6BFF) só entra quando o produto é o nosso; em produto de outra marca, brilho de fundo na cor da marca dela.
- **Conteúdo vivo real, da mesma fonte:** o que aparece dentro da UI vem do próprio site (YouTube: `yt-dlp "ytsearchN:<busca da copy>"`
  → thumbs `i.ytimg.com/vi/<id>/maxresdefault.jpg` e 6 s do vídeo principal com
  `--extractor-args "youtube:player_client=web_embedded,tv,android_vr" --download-sections "*a-b"` → quadros 960×540).
  Avisar a pessoa que esse conteúdo é de terceiros (autorização para veicular).
- **Detalhes de comportamento do site também são o estilo** (o que fez ficar "muito bom"): sugestões abrindo enquanto digita
  (parte digitada normal, resto em negrito), foco azul no campo, texto antigo selecionado antes da busca nova, prévia
  tocando no hover da thumb, a thumb clicada crescendo até virar o player, ícone de play central (bezel) crescendo e
  sumindo, barra de progresso com capítulos e nome do capítulo trocando, comentários rolando, "Inscrever-se" →
  "Inscrito" com sininho e anel colorido, barrinha vermelha de "assistido" nas thumbs. Legenda no estilo do próprio
  produto (YouTube: CC branco em caixa preta 75%, palavra a palavra).
- Final da marca dela: tela limpa abrindo do centro, ícone com mola, nome saindo de trás, ação final no tempo da fala
  (o play "aperta" no "play").
- Estrutura em 16:9: mundo 1920×1080 = a página do site em tamanho real, câmera `translate(960px,540px) …`; páginas
  (home/resultados/vídeo) trocam dentro do mesmo mundo, câmera contínua com alvos misturados (`PLANOS` [início, fim, alvo(t)]),
  corte invisível só na troca para resultados. Borrão de movimento máx. 2,5 px (0,6 px na abertura com texto digitado) —
  4–7 px deixou o texto ilegível. Render ≈ 6 s por segundo de vídeo; `--w 1920 --h 1080`.
- Áudio: receita 11 (`mixar.py` agora estende a música até o fim do vídeo com o fade-out).

## 1. Prints são só referência — a tela é recriada
- *Prints recortados e animados foram reprovados* ("quero que crie baseado na print, do zero... refazer o layout
  dentro do motion e anima tudo"). Print serve só para copiar layout, medidas e textos.
- **Quando o produto é o próprio editor:** a página carrega `../../../../ui/estilo.css` e `ui/icones.js` e monta a
  interface com AS MESMAS classes do app (`#topo`, `.painel`, `.abas`, `.card-midia`, `.aba-comp`, `.item`, `.passo`,
  `.msg-u`, `.caixa-entrada`, `.chip`, `.tarefa-topo`…). Sai idêntico ao app, em vetor, e cada peça anima.
  Sobrescrever: `@font-face 'UI'` apontando para `ferramentas/motion/fontes/InstrumentSans-*.ttf`, e
  `#mundo *, .ui * { animation: none !important; transition: none !important; }` (animação CSS em tempo real quebra o render quadro a quadro).
- **Outro SaaS:** mesma ideia — recriar os painéis em HTML/CSS no estilo do produto (cores, raio, fonte, ícones) a partir dos prints.
- Prints de referência do editor em 2x: `studio-prints/captura-main.js` (abre o editor fora da tela, 1720×1000 em 2x,
  roda um roteiro JSON e mede onde fica cada painel). `BO_ISOLADO=1 BO_PRINTS=roteiro.json electron captura-main.js`.
- Conteúdo "vivo" dentro da UI (preview, cartões, miniaturas) = **vídeos reais exportados** de outros projetos,
  extraídos em quadros (`ffmpeg -ss X -t 3 -vf fps=30,scale=360:640 clips/a/%03d.jpg`) e tocados em loop.
  Reação do gancho: `acervo neri/surpreso.mov`.

## 2. Uma tela para cada frase da copy (o que funcionou)
| copy | tela |
|---|---|
| "E se uma linha de código editasse qualquer vídeo?" | o input do chat em tela cheia; digita o pedido; mouse clica em enviar; a mensagem sobe, vira luz e nasce o vídeo pronto (cartão 9:16 tocando + selo "Pronto em 2 min") |
| nome do produto | logo + nome com brilho; depois a interface inteira se monta peça por peça (topo, mídia, preview, linha do tempo, chat) |
| "você escreve o que quer" | zoom no chat: o pedido digitado, clique em enviar |
| ações (gancho, legenda, cortes) | câmera dentro do preview (tela dividida + reação, legenda com caixa azul, light leak) e na linha do tempo (agulha corta, pedaço fraco sai, vão fecha) |
| "o agente executa / preview ao vivo do seu lado" | chat do agente: Pensando… → passos girando e virando check → resposta; depois abre no preview "AO VIVO" + chat do lado |
| "aprende o seu jeito / repete em cada vídeo" | aba Processos: cartão novo "Salvo agora"; abas de composição sendo criadas, preview trocando de vídeo |
| "tarde inteira → minutos, com uma frase" | tela do sistema, não texto solto: pedido no chat ("Faz um full motion de 2 minutos" + anexo), envia, chat azul trabalhando, contador da tarefa no topo corre e bate "Concluído em 10 min" no "minutos", fecha na frase enviada. *Texto grande + cronômetro solto: reprovado ("muito ruim").* |
| números (menos horas, menos custo) | cartões no estilo dos painéis do app: barras Antes/Agora e gráfico de linha com área e ponto |
| "mais criativos, todos no padrão" | parede 3D de vídeos com checks |
| assinatura | logo + frase da marca + o input vazio pulsando |
- **Chat trabalhando = igual ao app:** painel azul (#1B4FF0→#0A2AA8) com bolinhas brancas/azul-marinho ondulando
  (fórmula de `ui/pensando.js`, desenhada por quadro num canvas), bolha do usuário branca, passos em vidro escuro,
  status "trabalhando". Liga no envio, desliga quando conclui.
- **Nada de nome de modelo de IA na tela** (tirar a etiqueta "opus-5-5" do chat).
- Números inventados só se forem coerentes entre si (4 h → 3 min; 2:00 de vídeo em 10 min) — confirmar com a pessoa.

## 3. Câmera
### Ritmo: câmera LENTA, chega antes e fica parada na ação (regra, 04/10/2026 — vale para todo motion de interface)
Projeto "testefull motion blueos", "Full motion – Agente de Copy (Blue OS)" (comp1). A 1ª versão (câmera contínua sem parar,
23,8 s) foi reprovada: *"o jogo de câmera tá muito rápido, não dá pra entender nada e às vezes não acompanha algo que está
acontecendo, como o digitar de textos ou coisas novas na tela"*. A versão aprovada ("salva essa alteração da câmera mais lenta"):
- **Chega → fica → anda.** A câmera chega no elemento ~0,3 s ANTES da ação, fica parada (só deriva leve: sen/cos de 2–3 px,
  ciclo lento) enquanto a ação acontece, e só depois vai para a próxima. Nos quadros-chave isso é um **par de pontos quase
  iguais** (chegada e saída) com tangente monotônica (Fritsch–Carlson) — sem passar do alvo.
- **Cada movimento 0,5–1 s**, um alvo por vez. Nada de atravessar a tela inteira em menos de 0,5 s com zoom grande.
- **Toda coisa nova na tela tem que estar no quadro quando aparece** (digitação, contador, selo, status, peça chegando).
  Digitação: a câmera acompanha o cursor do texto; o texto digitado mais devagar (~20 letras/s).
- **Ação com começo e fim no mesmo quadro**: pedido digitado + botão + resultado (ex.: campo "Ajustar com IA" + "Novo
  ajuste" + a headline sendo reescrita) num enquadramento só, mais aberto (S ≈ 1,4), em vez de pular de um para o outro.
- **Planos abertos com folga:** o card não pode encher a tela (844 px × 1,28 = 1080 → a inclinação 3D corta as bordas);
  card inteiro em S ≈ 1,12–1,3, closes de texto em S ≈ 1,8–2,2. Inclinação 0–4° nos planos com botão na borda.
- **Borrão de movimento máx. 1 px** (no mundo 3D o filtro sai bem mais forte que o valor; 2,5 px já apagava o texto no zoom-out).
- **Se a fala não dá tempo, separa o áudio (respiros) — SÓ ENTRE FRASES INTEIRAS.** O corte é só no **ponto final**
  (`.`, `!`, `?`) da copy. **NUNCA corte dentro da mesma frase** — nem na vírgula, nem numa pausa de respiração no meio
  (regra da pessoa, 04/10/2026: *"a fala sobe .......... aquele anúncio, essas duas falas não deveriam ser separadas, é a
  mesma frase. Nunca corte a mesma fala"* — a v2 cortou "Você escolhe o cliente, sobe | aquele anúncio…" e também em
  "inteiro, | escrito", "convenceu, | ajusta": reprovado). Ache o fim de cada frase pela transcrição + silencedetect
  (−42 dB / 0,06 s) e corte no meio da pausa depois do ponto final; abra 0,5–2 s de silêncio ali.
  **A animação se ajusta à frase, não o contrário:** o que precisa acontecer DENTRO de uma frase (escolher cliente →
  contadores → upload → Gerar numa frase só) fica mais enxuto, com etapas avançando sozinhas e menos movimentos de câmera
  (um plano aberto do card cobrindo várias etapas); a ação que precisava de pausa no meio da frase vai para o respiro
  ANTES dela (a câmera já chega enquadrando tudo) ou é feita durante a frase num quadro só ("Se uma peça não convenceu,
  ajusta só ela": 👎 + digitação + botão + headline reescrita com a câmera parada num enquadramento S ≈ 1,4).
  Os respiros servem para: navegação/cliques no começo, status de "gerando" depois do clique, ler o resultado.
  `respiros.json` = `[início, fim no áudio original, onde entra no vídeo]` **uma entrada por frase inteira**; o corte sai
  do **áudio original** (fade 15 ms nas pontas, `adelay`) e depois passa pelo `mixar.py` (não tratar a voz duas vezes).
  Blue OS: 6 frases, 23,8 s → 29,6 s. Conferir no fim: `silencedetect -42dB d=0.4` na voz nova só pode achar silêncio
  depois de ponto final. Depois: `bo substituir` da voz, transcrição e `X-grupos.js` remapeados (a palavra pertence à
  frase em que começa), música com a batida na virada nos tempos novos, SFX refeito.
- Na página, todos os tempos das ações num objeto `T` (`T.gerar`, `T.dig`, `T.nova`…) — o SFX usa os mesmos números.
  Modelo pronto: `ferramentas/motion/fullmotion/blueos/blueos.html` (+ `bloco-v2.js`, `blueos-sfx.py`, `respiros.json`).

- **Um "mundo" e uma câmera:** a interface inteira é um bloco (1720×1000 px do app) e a câmera é
  `translate(540px, sy) perspective(1700px) rotateX(rx) rotateY(ry) scale(S) translate(-fx, -fy)` com
  `transform-origin: 0 0`. Quadros-chave `[t, fx, fy, S, sy, rx, ry]` interpolados com quintInOut/cubicInOut.
  Texto continua nítido em zoom 2–5× (é vetor; não usar `will-change` no mundo).
- **Câmera suave:** *(atualizado 04/10/2026: "sem parar" ficou rápido demais — siga o ritmo "chega → fica → anda" acima;
  o que continua valendo daqui é a mistura suave entre alvos)* alvos trocando por mistura suave
  (`f = mix(f, alvo, liso(t, a, b))` encadeado), leve inclinação 3D que muda de lado entre os planos, deriva lenta (sen/cos de 2 px).
  *Três cortes seguidos com borrão forte: reprovado ("ficou ruim", "travando").*
- **Câmera seguindo o texto:** medir a largura do texto letra a letra (span inline dentro do campo — NÃO o próprio
  campo flex) e manter o cursor do texto parado na tela (`fx = cursor − 70/S`) enquanto a frase corre. Texto do input
  **numa linha só** (`white-space: pre`), nunca quebra. Depois desliza até o botão de enviar; empurra (zoom +0,5) no clique.
- **Cortes invisíveis / dinâmicos:** plano aberto (barra inteira, zoom leve indo para o lado) → corte → close. No corte:
  pulso de borrão de movimento curto (`34·e^(−((t−tc)/0,045)²)`, ±2 quadros) + deslocamento no MESMO sentido antes e
  depois do corte. Borrão por velocidade fraco (máx. 7 px, fator 0,06): forte deixa o texto ilegível.
  Borrão é `feGaussianBlur stdDeviation="x y"` num SVG, aplicado num wrapper SEM transform (senão o texto rasteriza borrado).
- Saída de cena: mergulho (S ×4 em 0,2 s com cubicIn) no elemento-chave → próxima cena entra.
- Caixa de input recriada: o campo de texto ocupa a caixa toda (`flex: 1`) — botão de enviar na ponta direita.

## 4. Visual (identidade do editor)
- Fundo da página inicial do app: preto #050608 + grade de bolinhas azuis ondulando como tecido (mesma fórmula do
  `criarBolinhas`, passo 26, raio ×1,5, azul #5287FF nas cristas, máscara radial). *Horizonte brilhante: reprovado ("feio").*
- **Brilhos em UMA cor só (azul #2D6BFF) e bem dissipados:** degradê radial com 6–7 paradas caindo até 0
  (quase gaussiano), sem borda. *Brilho verde + azul misturado e borda dura: reprovado.* Verde-água só em selo de
  check e palavra de destaque.
- Fonte Instrument Sans; cartões no estilo dos painéis do app (#16171C, borda 8% branca, raio 40, ícone em quadrado azul 16%).
- Confete azul (cor padrão do `FM.criaConfete`), não branco.

## 5. Legenda, som, entrega
- Legenda da receita 11 (`legendaSoSemTexto`), branca com pílula escura (`#leg > div`) para ler por cima da UI.
  **Texto de cartão precisa de espaço entre os blocos no HTML** (`</div> <div>`), senão o `textContent` gruda as
  palavras ("editandopor") e a regra não reconhece que a legenda repete a tela.
- Elementos com texto dentro do mundo NÃO são `.p` → não contam para esconder a legenda (bom: a UI não é a fala).
- SFX (`studio-sfx.py`, fmsfx): tecla por letra digitada, swish curto em cada corte, clique + grave no envio, pop por
  passo/painel, contador com tique, impacto + confete na conclusão, mergulho no fim de cada cena. Música e níveis = receita 11.
- `window.pronto` espera `document.fonts.ready` antes de medir texto/legenda.
- Composição: V1 vídeo (volume 0), A1 voz tratada, A2 SFX, A3 música; legenda do editor desligada; normalizar −14.
  Ao re-renderizar no mesmo arquivo: `bo substituir mN <arquivo>` para o editor recarregar.
- Render ≈ 11–13 s por segundo de vídeo (UI pesada) → 35 s ≈ 7 min; conferir antes com `--quadro "t1,t2,…"` (folha).
