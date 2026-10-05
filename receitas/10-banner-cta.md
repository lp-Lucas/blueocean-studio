# Banner de CTA animado (linha Blue)
> Cartão final 9:16 com motion estilo Apple na linha de design dos carrosséis Blue Ocean: logo primeiro, título em Tusker, resultados em caixas, botão "Saiba mais" — com SFX em cada movimento.
Ícone: sparkles
Pedido: Faça um banner de CTA animado com esta copy: [copy]

Aprovado em 02/10/2026 ("agora sim, perfeito"), projeto "tentativa de motion", composições "CTA – Escale seu SaaS
(linha Blue)" e "CTA – Programa MVP (linha Blue)". Usado no fim dos vídeos da simulação de Meet (Copy 3 e 4).
Referência de partida: o cartão final do anúncio da Turbo (Biblioteca de Anúncios, id 1658494658778459).

## Como é feito
O motor de texto do editor não faz esse motion: o banner é uma página HTML renderizada quadro a quadro pelo Chrome
e vira um .mp4, que entra no projeto como mídia. Tudo em `ferramentas/motion/`:
- `banners/cta-escale-blue.html`, `banners/cta-mvp-blue.html` — **os dois aprovados; copie um deles como modelo.**
- `linha-blue.css` (cores, fontes, caixas, botão), `linha-blue.js` (cabeçalho, blocos, botão), `motion.js`
  (fundo, texto palavra a palavra, contador, easings).
- `render.mjs` — `node render.mjs banners/X.html saida.mp4` (10 s ≈ 70 s de render). Conferir antes:
  `node render.mjs banners/X.html folha.png --quadro "0.5,2,4,9"` (folha com vários instantes).
- `sfx.py` + `banners/X-sfx.py` — o som, sintetizado no tempo exato de cada animação (sem banco de sons).
- `logo_site.mjs <url> <png>` — tira o logo do cabeçalho do site do cliente em alta resolução.

## O visual (linha dos carrosséis Blue)
- **Fundo:** degradê marinho `#040E46 → #030733 → #02011D → #05114F` com brilhos azuis que respiram devagar
  (`Motion.fundoMarinho`). *Os fios pontilhados da arte de post foram testados e trocados por este.*
- **Cabeçalho aparece primeiro:** "BLUE OCEAN" (img/LOGO-BLUE.svg) à esquerda, fio correndo, símbolo à direita.
- **Título:** Tusker Grotesk 4500 Medium, caixa-alta, palavra em destaque `#00FFD4`. Entrelinha 1,06; com acento
  embaixo/em cima entre linhas (LANÇAR / PRECISÁ) use **1,17** — senão o Ç encosta na linha de baixo.
  A fonte está em `ferramentas/motion/fontes/` (original em `Downloads\Tusker.Grotesk`).
- **Texto:** Outfit 400 com destaques em 700.
- **Resultados em caixas** (como as listas dos carrosséis): caixa do logo do cliente + caixa do resultado, fundo
  `#040A3E→#0A1A78`, borda `#1E3DD8`, raio 16. Número final em verde com contador.
- **Selo e botão:** caixa azul `#003BFF→#2F5CFF`. Botão "→ SAIBA MAIS" em Tusker, brilho passando a cada 1,6 s,
  setas para baixo apontando o botão do anúncio.
- **Cliente citado = logo dele junto** (logo do site oficial, em branco; Envio Ecom usa a versão oficial para
  fundo escuro, com o foguete colorido).
- **Tudo numa tela só:** nada sai para outra coisa entrar; vai se montando e fica.
- **Espaço:** distribuir na tela inteira (cabeçalho ~230 px até as setas ~1600 px), com respiro entre os blocos.
  Só as laterais seguem a área segura (x 65–1015). *Apertar tudo em y 270–1248 foi reprovado.*

## Animação (a "Apple")
Palavra a palavra: sobe 0,32–0,5 em, sai do desfoque (14–18 px), aparece; cascata de 0,04–0,08 s, easing expo-out.
Blocos e caixas igual, em cascata de ~0,2 s. Botão com mola. Ordem: cabeçalho → título → texto → logos → caixas
(contadores) → botão. 10 s no total, os últimos ~4 s parados com o brilho no botão.

## SFX (aprovados)
Cama ambiente bem baixa · **tecla de teclado Apple em cada palavra que sobe** (`digitar()`; no texto de apoio mais
baixa e rápida) · sopro por linha · vidro nas palavras em verde e em cada logo · deslize + pop grave nas caixas ·
tique por número no contador · acorde de sucesso no check · botão = ar + pop + grave + vidro · blips nas setas ·
brilho discreto no reflexo do botão · cabeçalho = nome surge, fio corre, símbolo dá pop. Master −18,5 LUFS
(abaixo da voz), reverb só nos médios/agudos. Junte com
`ffmpeg -i video.mp4 -i sfx.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest saida.mp4`.

## Passo a passo
1. Copie `cta-escale-blue.html` (com resultados) ou `cta-mvp-blue.html` (com o desenho do caminho) e troque a copy.
   Logos de cliente: `logo_site.mjs` e limpe o fundo (alfa < 24 → 0, recorte no conteúdo).
2. Folha de quadros + quadro final; confira laterais, acentos entre linhas e se tudo cabe.
3. Ajuste os tempos do roteiro de som (`X-sfx.py`) para bater com os `t0` do HTML; gere o wav.
4. Renderize, junte o som, `bo importar` e ponha numa composição própria. Versão nova do mesmo banner: `bo substituir`.
5. No vídeo final: o banner entra logo depois da última palavra da fala, numa faixa de vídeo por cima (V6 "Banner
   final"); dois banners seguidos = um depois do outro na mesma faixa, em corte seco.

## Versões anteriores (guardadas, não aprovadas como padrão)
Composições 1–2 (Apple azul, SF Pro, cenas que trocam) e 3–4 (arte de post com fios pontilhados, Bebas no lugar
da Tusker) do projeto "tentativa de motion".
