# Full Motion BlueOcean
> Vídeo 100% animado a partir só do áudio da fala: cartões, ícones de app, contadores e texto palavra a palavra no estilo dos reels da Blue, com SFX em cada movimento, confete nos números, música de fundo e áudio no padrão de internet.
Ícone: sparkles
Pedido: Faça um full motion desta copy (áudio): 

Aprovado em 02/10/2026, projeto "teste de fullmotion": "Full motion – case Diego" (comp1, ajustado em 3 rodadas:
"boa!", confete, áudio) e repetido em "Full motion – Qualidade de lead" (comp2) pedindo "segue tudo que fez".
Referências de estilo (reels da Blue): DdpQbagx38T, DdkMpzaxBfC, DNn4lpau2Nv, DPjtZGhiWMY, DRcbhksDgww
(instagram.com/reel/<id>) — os trechos de motion do começo deles. Confete: o "$100.000" do reels do Drive
1b5vJzznFnfJ2mkd8bbiSilQYAsy6mTFq.

## Como é feito
Igual ao banner (receita 10): página HTML desenhada em função do tempo, renderizada quadro a quadro pelo Chrome.
Tudo em `ferramentas/motion/fullmotion/`:
- `fm.css` + `fm.js` — **a base de todo full motion**: `FM.anim` (entra com mola saindo do desfoque, sai desfocando),
  `FM.linha` (cada palavra entra NO TEMPO EM QUE É FALADA), `FM.risco`, fundo azul com varrida + arco branco,
  `FM.icone` (ícones de app), `FM.cursor`, `FM.criaConfete`, legenda pequena. A página chama `FM.iniciar({azul, voos,
  grupos, legendaOculta, estouros})` e no `quadro(t)`: `FM.antes(t)` … cenas … `FM.depois(t)`.
- **Modelo para copiar: `qualidade-lead.html`** (já usa fm.js). `diego.html` é o primeiro (tudo dentro dele, mesma linguagem).
- `grupos.py` — gera a legenda da transcrição: `python grupos.py transcricoes/mN.json --negrito "SaaS,30,..." > X-grupos.js`.
- `fmsfx.py` + `X-sfx.py` — o som (mesmos tempos do HTML). `mixar.py` — voz tratada + música com ducking.
- Render: `node render.mjs fullmotion/X.html fullmotion/X-video.mp4` (≈4,5 s de render por segundo de vídeo; em primeiro
  plano, timeout 600000). Conferir antes: `node render.mjs fullmotion/X.html fullmotion/folha.png --quadro "0.5,3,…"`.

## O visual (tirado dos reels de referência)
- **Fundo cinza claro** (radial #FAFAFB → #E6E6E9) na maior parte. **Azul chapado #0037FF com arco branco correndo**
  nas frases de impacto (texto gigante sozinho na tela: "VIVO.", "é FILTRO.", "Sete? Nove?"). Troca cinza↔azul por
  varrida lateral de 0,5 s. Nunca dois azuis seguidos sem cinza no meio.
- Fonte **Instrument Sans**. Headline em cima (~y 400–470), palavra-chave em negrito azul (#0037FF) no cinza e verde
  #00FFD4 no azul. Palavra gigante: 190–300 px, Bold, letter-spacing −0,05 em.
- Peças: cartão branco arredondado (raio 42, sombra azulada), **cartão azul de número** (estilo "Conta" dos reels)
  com contador e curva, **ícones de app** (quadrado arredondado azul / navy / verde / branco com glifo), **notificação
  "Pagamento recebido!"** empilhando, **selos/pílulas** (branco ou azul, com check verde), balão "Uau! 🏆",
  **cursor de seta clicando**, foto em cartão que vira avatar redondo.
- **Tudo ilustra a frase falada naquele instante** (CRM quando fala CRM, agenda quando fala agenda, funil quando fala
  filtro, anel de % no número do case). Nada de enfeite.
- **Marca citada = logo dela grande** (Tripmee: cartão branco com o logo + selo "Parceiro Blue Ocean").
  Logos em `ferramentas/motion/img/`. Blue Ocean = ícone de app navy com a onda verde (`.logoTile`).
- **Foto de pessoa** (cliente, case): cartão com a foto inteira → zoom/morph até o rosto dela → vira avatar redondo
  que acompanha a cena seguinte. Selo com o nome ("Diego · dono de SaaS").
- **Legenda pequena** embaixo (y 1390, 46 px, Medium, palavra a palavra, negrito nas palavras-chave), preta no cinza
  e branca no azul. **Some** quando o texto da tela já é a fala (cenas azuis de palavra gigante e o CTA final).
- **ATUALIZADO (02/10/2026, Doxa vídeo 2): legenda FIXA embaixo (1390) o vídeo todo, sem pular e sem sumir**
  (`legendaFixa: true` no `FM.iniciar`, com halo branco no fundo claro). A legenda "inteligente" abaixo (muda de lugar
  e some quando não há espaço ou repete a tela) foi reprovada: "ficou bem bugado". Use a fixa como padrão.
  **REGRA FINAL (02/10/2026): só tem legenda quando NÃO há texto da copy escrito na tela.** `legendaSoSemTexto: true`
  + `FM.medirLegenda(dur)` no `window.pronto`: antes do render o vídeo todo é varrido (0,1 s); onde algum texto da tela
  repete a fala (título, selo, nome de ícone, contador) a legenda some o trecho inteiro, some/volta só no começo de
  uma frase, e só volta se puder ficar 3 s+ (nada de "legenda solta"/stuttering). Num full motion cheio de texto
  (Doxa v2) isso dá **vídeo sem legenda** — está certo.
  **Nas telas azuis a legenda some** (o texto grande já é a fala; principalmente no CTA final) — automático no `fm.js` com `legendaFixa`.
  **Legenda por cima de superfície escura (terno, sapato): as letras ficam BRANCAS no contorno exato** — uma cópia
  branca da legenda recortada pela máscara das áreas escuras do personagem (`img/dono-escuro.png`, embutida em
  `img/dono-escuro.js` porque o Chrome bloqueia máscara de arquivo local; `FM.mascaraEscura` na página). O enquadramento
  do personagem NÃO muda por causa da legenda. *Reprovados: afastar/diminuir o trono para fugir da legenda ("deixar tudo
  pequeno"), halo branco, pílula branca, legenda preta por cima do terno ("inaceitável").*
- *(Versão reprovada, guardada no `fm.js` sem `legendaFixa`)* A legenda NUNCA fica por cima de imagem, cartão, ícone ou texto (regra da pessoa, 02/10/2026: "não faz isso
  nunca mais"). *Halo branco por cima do terno: reprovado.* Automático no `fm.js`: a cada grupo ela procura o primeiro
  lugar livre (1390 → 1250 → 1540 → 330 → 240 → 1660); se não houver, a legenda daquele trecho não aparece. Imagem
  recortada (personagem) precisa de `data-caixa="x0,y0,x1,y1"` com a área real dele no png (o trono: `40,110,915,1600`).
- **Legenda repetida sai** comparando com QUALQUER texto da tela (título, selo, cartão), não só os títulos.
- **Nunca duas legendas iguais** (regra da pessoa, 02/10/2026): quando o texto grande da tela repete a fala, a
  legenda de baixo sai. É automático no `fm.js` (legenda com metade ou mais das palavras no texto da tela, ou o
  texto da tela inteiro dentro da legenda) — todo texto grande precisa ter a classe `linha` para entrar na conta.

## Os 3 primeiros segundos (regra da pessoa, 02/10/2026)
**O vídeo começa na primeira palavra** (meça no áudio — o Whisper erra o início: aqui marcou 0,34 s e a voz
entrava em 0,68): corte com `entrada` = início da fala − 0,06 s em TODOS os itens (vídeo, voz, SFX, música), sem
silêncio no começo. **O quadro 0 já tem imagem forte na tela** — nada de começar com fundo vazio e uma palavra ("os 3 primeiros
segundos são o mais importante do vídeo"). Comece o primeiro elemento em t negativo (ex.: entrada de −0,3 s) para
ele já estar entrando no quadro 0, com movimento de câmera (zoom) até ~1,5 s e a primeira troca antes de 1,5 s.
**Dono de SaaS = o personagem da Blue:** homem de terno no trono de veludo azul, rosto coberto pelo avatar
verde-água. Imagem: `img/dono-saas.png` (971×1620, em alta, recortado com **GrabCut** — fundo e sombra do chão fora,
1 px de borda comido e cor da borda "desmisturada" do branco; **sem sombra no chão** (a elipse desenhada foi tirada: "não precisa dela").
*Recorte por "branco → transparente" deixou rebarba branca e o chão cinza aparecendo no azul: reprovado ("horrível").*
Confira sempre o recorte sobre o AZUL #0037FF em tamanho real. Original
"Executivo Anônimo em Trono Azul Luxuoso.png" que a pessoa mandou). *Quadro tirado de vídeo foi reprovado: "muito
ruim, desfocada".* Avatar (503, 310) raio ~122; mão no queixo (548, 458).
Como animar (aprovado na 2ª rodada):
- **Cena "3D":** personagem, nome e ícones vivem no MESMO mundo (coordenadas da imagem) e uma câmera só
  (`camera(t)` → foco fx,fy na tela sx,sy com escala s) move tudo junto. Ícones e frases ao lado ficam **um pouco à
  frente** (profundidade d 1,15) → parallax quando a câmera anda. *Ícones fixos na tela "do lado" foram reprovados
  ("tem que ser tipo uma cena 3D, se deu zoom, os botões acompanham como se fizesse parte do cenário").*
- Câmera: inteiro → aproxima do rosto (junto com a 1ª palavra) → abre com ele à esquerda e os ícones à direita →
  deriva lenta. **O ícone clicado se transforma na próxima tela** (o quadrado azul cresce até virar a janela do CRM e
  o azul se desfaz revelando o conteúdo). *Mergulho da câmera no ícone: reprovado — "igual estava na versão anterior".*
- **"Dono de SaaS" reto** sobre a cabeça (Bold 56, #1F45C8, letra a letra), preso ao mundo. *Em arco: reprovado.*
- **Mão no queixo mexendo** devagar (sobe/desce ~11 px, **ciclo de 3 s**; 1,5 s ficou rápido): `feDisplacementMap` com mapa gaussiano só na
  região da mão (protege o avatar).
Exemplo pronto: `cenaAbertura` / `noMundo` em `qualidade-lead.html`.
- Final azul: logo Blue Ocean + CTA (botão branco "Saiba mais" ou formulário se preenchendo) com clique do cursor.

## Design das peças (reprovado → aprovado, 02/10/2026 — "siga o design proposto durante o vídeo sempre")
- **Nada perto da borda:** ícones e nomes inteiros dentro de x 65–1015 (área segura), mesmo com a câmera em movimento.
- **Ícone de app com nome: o nome vai EMBAIXO do quadrado** (classe `.app`, como no celular, nome 38 px). *Texto
  espremido dentro do quadrado ("Marketing" sem espaçamento): reprovado.*
- **Cartão de número = sempre o cartão azul do vídeo** (degradê #1446FF→#0630C4, raio 40, número branco grande,
  gráfico/linha branca, meses embaixo, selo branco "🔒 Travado"). *Cartão branco com bola azul solta: reprovado.*
- **Nada de elemento "vazio"** (bola, anel sozinho): todo ícone tem significado visível. *Anel "98 dias" sozinho:
  reprovado* → cartão branco "Do zero · 98 dias" com a grade de 98 quadradinhos se preenchendo em azul.
- **Marca citada usa o logo oficial**: Doxa = `img/doxa-branco.png` (branco) em placa navy #0B0D1E (cartão grande,
  ícone de app e mini-selo dentro do cartão de faturamento).

## Animação
**Ritmo de câmera (regra, 04/10/2026):** câmera lenta — chega antes da ação, fica parada enquanto ela acontece, anda em
0,5–1 s; tudo que aparece na tela tem que estar no quadro. Se a fala não dá tempo, separa o áudio com respiros entre as
frases — **só no ponto final, nunca dentro da mesma frase** (nem na vírgula). Detalhes e modelo: receita 13, seção "Ritmo: câmera LENTA".
Tudo entra com mola + desfoque (expo-out, 0,75 s) e sai desfocando em 0,4 s. Palavras em cascata no tempo da fala.
Contadores com quintOut / cubicInOut. Troca de cena: o que sai começa a sair ~0,1 s antes de o próximo entrar.
**Confete (aprovado):** quando um contador bate o número final (R$ 200.000, 70%), o elemento dá um **tranco**
(gira −5° e cresce 4%, amortecendo) e estoura retângulos **de uma cor só** (azul; **branco quando o fundo é azul**)
que giram, "piscam" ao virar e caem em < 1,3 s (`FM.criaConfete`, ~70–95 peças). Também no fim de uma subida (topo
da escada) e no "Enviado" do formulário.

## Áudio (números aprovados — "tem números certos de dB pra ficar agradável")
| camada | nível | como |
|---|---|---|
| voz | **−16 LUFS**, pico −2 dBFS | `mixar.py`: passa-alta 80 Hz, redução leve de ruído, −2 dB em 250 Hz, +2 dB em 3,5 kHz, ar em 10 kHz, de-esser, compressor 3:1 |
| SFX | **−34 LUFS** (≈18 dB abaixo da voz; o momento mais alto ~15 dB abaixo da fala) | `fmsfx.salvar()`; **sem cama ambiente** |
| música | **−26,5 LUFS antes do ducking → ~−33 enquanto ele fala** (≈18 dB abaixo) | `mixar.py`: sidechain na voz (2,5:1), fade in 0,4 s e out 1,8 s |
| mistura | **−14 LUFS, pico −1,5 dBTP** | editor: `audio.normalizar −14`, **`voz` e `limpar` desligados** |
**Voz abafada (pedido 04/10/2026, case Diego):** analise o espectro só nos trechos de fala (quadros acima do
percentil 40 de volume, relativo à banda 1–2 kHz) e compare com uma voz clara:
alvo ≈ 80 Hz +6 · 200 +6 · 500 +4 · 1k 0 · 2k −4 · 4k −9 · 6k −11 · 8k −16 · 12k −24 dB.
A do Diego (celular) estava 200–500 Hz +16 e 4–8 kHz −26 a −37 → muito abafada. Cadeia que chegou no alvo
(compressor ANTES da EQ, senão os graves voltam; redutor de pausas no fim porque o brilho sobe o chiado):
`highpass=f=100:p=2,afftdn=nr=6:nf=-50,acompressor=threshold=-24dB:ratio=3:attack=5:release=100:makeup=3,lowshelf=f=170:g=-10,equalizer=f=280:t=q:w=1.0:g=-8,equalizer=f=520:t=q:w=1.2:g=-7,equalizer=f=4800:t=q:w=1.0:g=4,highshelf=f=6500:g=7,aexciter=amount=1.2:drive=6:freq=3500:blend=0,deesser=i=0.3:f=0.5,agate=threshold=0.025:ratio=3:range=0.25:attack=6:release=200:knee=2.5:detection=rms` + loudnorm −16 (2 passos). Ajuste os ganhos medindo de novo até bater o alvo (±3 dB) e confira o
ruído nas pausas (fala − pausas ≥ 20 dB).
**Voz com eco de sala (04/10/2026, case Diego: "deixa ela firme"; 1ª versão reprovada: "ficou meio bugado"):**
`dereverb.py` SUAVE — `--alvo 0.15 --forca 1.5 --piso -18 --suave 0.8 --larg 11` e 2ª passada nos graves
`--rt60 0.65 --n 4096 --ate 600 --alvo 0.18` (mesmos força/piso/suave/larg). *Força 2 / piso −30 / suave 0.4 deixou
"borbulhado" (oscilação dos agudos 4,8 → 5,4 dB).* Depois só EQ + de-esser + ganho linear + `alimiter` CALMO
(`attack=5:release=80`). *Reprovados (bugam): limitador rápido (1 ms/15 ms → distorção), redutor de pausas (agate,
abre/fecha no meio das palavras), compressor e afftdn (levantam a cauda de volta), aexciter + ganho alto (clipping).*
Confira sempre: amostras clipadas = 0, oscilação dos agudos ≈ a do original, saltos de nível ≤ os do original.
Voz em ~−17 LUFS (o limitador calmo come ~1 dB; aceitável).
**Brilho: compare com a voz APROVADA, não só com um alvo teórico** (04/10/2026: "os agudos estão muito altos"). A
referência boa é `midia/qualidade-voz.wav`: 80 +15 · 200 +15 · 500 +9 · 1k 0 · 2k −6 · 4k −15 · 6k −14 · 8k −15 dB.
A versão reprovada tinha 2–4 kHz +4–5 dB acima e grave −8 dB (fina + estridente). Cortar grave demais deixa o agudo
"na cara" mesmo sem realce. EQ final do Diego (sobre a voz sem eco): `highpass 80, lowshelf 200 +4, 280 −1, 520 −2,
2400 +2, 4800 +3, highshelf 6500 +8, highshelf 9000 +5, deesser 0.4`.
**Checagem final de áudio (04/10/2026, "veja se tem algo estourando"):** simule a exportação igual ao editor (cada
faixa → amix normalize=0 → `loudnorm=I=<alvo>:TP=-1.5:LRA=11` de UMA passada → AAC 192k) e meça: I, LRA, true peak
(dBTP, não só pico de amostra), clip, momentâneo/curto máx, crista, DC. Achados no Diego: (1) limitador sem
superamostragem deixa pico ENTRE amostras (−1,5 dBFS na amostra = −0,1 dBTP real) → limite a voz com
`aresample=192000,alimiter=...,aresample=48000`; (2) a passada única do editor entrega ~1 LU abaixo do alvo em vídeo
curto → na composição use `"lufs": -13` para sair em −14,0 (pico −1,5 dBTP). Voz ~16 dB acima da música e ~18 acima dos SFX.
*−22 LUFS nos SFX foi reprovado ("ainda está alto"); −26 também.* O compressor "voz" do editor pega a mistura toda e
sobe SFX e música — por isso o tratamento vai nos arquivos.
**Música:** "Flashing Lights (Instrumental)" (`Downloads\Kanye West - Flashing Lights (Instrumental) - yeezus0exc (youtube).mp3`).
A batida entra em 21,5 s da faixa: escolha o início para ela cair numa virada da copy
(`inicio = 21,5 − tempo_da_virada`; Diego: 16,3 → batida no "Em menos de seis meses"; Qualidade: 7,26 → no "Pois é").

## Um áudio com várias leituras (vários vídeos)
Quando o áudio traz a mesma copy gravada mais de uma vez ("esse áudio tem DOIS vídeos"): ache as pausas longas
(`bo silencio mN --limiar -40 --minimo 0.6`), meça início/fim de cada leitura no volume (20 ms) e corte cada uma num
arquivo próprio (`ffmpeg -ss <início−0,06> -to <fim+0,3>`), já começando na primeira palavra. Transcreva cada uma.
**Uma página só para todas as leituras:** `doxa-roteiro.json` lista as frases-âncora; `ancoras.py` acha cada frase em
cada transcrição e gera `X-v1.js`/`.json` (tempos de cada palavra + legenda). A página escolhe a leitura por
`--params '{"take":"v1"}'` e todas as cenas usam `T.chave` / `TT.chave[i]` (nada de tempo fixo). O som (`X-sfx.py v1`)
lê o mesmo .json. Uma composição por leitura. Exemplo: `doxa.html` (Criativo 1, comp3 e comp4). **Se as leituras forem a mesma copy, a pessoa escolhe UMA e só ela é ajustada dali em diante** (Doxa: só o vídeo 2, comp4).
A música: batida em 21,5 s da faixa cai na virada escolhida em cada leitura (`inicio = 21,5 − T.virada`).

## Passo a passo
1. `bo importar <link> --audio`, `bo transcrever mN`, `bo texto mN`. Corrija na transcrição o que o Whisper errou
   (nomes de cliente, "agenda"…, `"editada": true`) e junte "13 %" → "13%" (o pedaço solto vira `"oculta": true`).
2. Roteiro de cenas pelos tempos das palavras (uma ideia visual por frase; azul só nas frases de impacto).
3. `grupos.py` → `X-grupos.js`. Copie `qualidade-lead.html` → `X.html`, troque cenas, tempos, `azul`, `voos`,
   `legendaOculta`, `estouros`. Folhas de quadros de TODAS as cenas e corrija (texto que não sai, sobreposição,
   palavra quebrando linha, confete sumindo no fundo).
4. `X-sfx.py` com `fmsfx` nos mesmos tempos (tecla por palavra, entra/sai, varrida, impacto, contador, confete, check).
5. Render + `python mixar.py <voz> <musica> <inicio> <dur> midia --nome X`.
6. Composição própria (`bo comp nova "Full motion – …"`): V1 = vídeo do motion (sem áudio, `volume 0`), A1 Voz
   (`bo substituir mN <X-voz.wav>` mantém a transcrição), A2 SFX, A3 Música. Legenda do editor desligada.
7. Conferir: `bo quadro` nas cenas-chave e a mistura simulada (amix + loudnorm −14) dando ~−14 LUFS / pico −1,5.
