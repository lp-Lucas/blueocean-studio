# Vídeo com rotoscopia (pessoa recortada sobre notícias e B-roll)
> A pessoa recortada do fundo o vídeo todo, na frente de prints de notícia, sites e B-rolls reais que acompanham a fala.
Ícone: estrela
Pedido: Faça esse vídeo com rotoscopia, igual à referência, seguindo a copy:

Aprovado em 01/10/2026 ("Copy 12 – Totvs/Linx", projeto "reels com rotoscopia"). Estilo dos anúncios de UGC
gravados em tela verde, mas funciona com vídeo gravado em qualquer lugar (o recorte é por IA).
Outro estilo aprovado, com fundo em tela cheia e a pessoa no canto: receita 9 ("Rotoscopia em tela cheia").

## Como fica a tela (1080×1920)
- **Em cima (0–960 px):** o fundo do momento — print de notícia, site, vídeo de B-roll ou cartão. Some num degradê
  nos últimos 100 px.
- **Atrás de tudo:** o mesmo fundo desfocado e escurecido (45%) preenchendo a tela.
- **Na frente:** a pessoa recortada, na escala original, descida 120 px (`desce`). A cabeça entra um pouco na
  imagem de cima — é esse o efeito.
- **Legenda:** padrão Blue Ocean, mas em **`pos: 47`** (logo acima da cabeça). A 72% ela cai no rosto, porque
  em selfie o rosto é grande.
- **Faixa de qualificação** no trecho do CTA (receita 7), entrando da esquerda. **Light leak** em 2 ou 3 trocas
  importantes (gancho → primeira virada, entrada da Blue Ocean, CTA).
- Sem zoom nos cortes do V1 (`zoom: 1`): o zoom ampliaria a imagem de cima junto.

## Ferramentas (em `C:\Users\lpess\OneDrive\Documentos\Projetos\BLUEOCEAN STUDIO\ferramentas\rotoscopia\`)
| arquivo | o que faz |
|---|---|
| `matte.py` | recorte por IA (Robust Video Matting, `rvm.onnx`, CPU) + limpeza → vídeo da máscara |
| `compor.py` | junta fundos + pessoa recortada → vídeo novo do mesmo tamanho do original (lê `roto.json` do projeto) |
| `prints.py` | print de página (Chrome), recorte 1080×960 e montagem de matéria com marca-texto |
| `cartoes.py` | cartões de design no visual Blue Ocean (só quando não houver nada real) |
Precisa de Python com `onnxruntime`, `numpy`, `pillow` e `opencv-python-headless` (já instalados).

## Passo a passo
1. **Material.** `bo importar` o vídeo e a referência (link da Biblioteca de Anúncios funciona). `bo transcrever todas`.
   Compare a fala com a copy: se o vídeo falar outra coisa, **pare e pergunte** (já aconteceu de mandarem a copy
   errada). Corrija nomes na transcrição (marcas, "Totvs", "Linx", "R$19 mil" no lugar de "R $19 .000") com `editada: true`.
2. **Cortes no V1.** Tire silêncios (`bo silencio`) e retomadas ("a tua receita é previsível, a receita é previsível…":
   fique com a versão completa), sem zoom. Guarde os trechos (entrada/saída no arquivo) — os fundos são marcados
   **no tempo do arquivo original**, então os cortes podem mudar depois sem refazer nada.
3. **Roteiro de fundos.** Frase por frase da fala, escolha o fundo nesta ordem de preferência:
   1. **Notícia real** do que ele cita (WebSearch). Print com `prints.py foto <url> <png>` (1080×3000) e monte com
      `prints.py materia`: barra do site + manchete + o parágrafo do dado ampliado com **marca-texto amarelo** no número.
   2. **Site / produto real** (empresa citada, a própria Blue Ocean — home, "quem somos"; notícias sobre a Blue Ocean,
      ex.: Business Week). Recorte com `prints.py recorte`, fugindo de pop-up de cookie e anúncio.
   3. **B-roll em vídeo do Mixkit** (licença livre para uso comercial, sem marca d'água): ache o id na página da
      categoria (`https://mixkit.co/free-stock-video/<tema>/`, WebFetch pedindo "id: título") e baixe
      `curl -sf -o midia/broll/videos/mk-<id>.mp4 https://assets.mixkit.co/videos/<id>/<id>-720.mp4`.
      Temas que funcionaram: meeting, code, stock-market, call-center, smartphone, handshake/contrato.
   4. **Cartão de design** (`cartoes.py`) só para ideia abstrata ("não nasce do produto") e número de case sem fonte
      pública.
   Cubra o vídeo inteiro, sem buraco. Troque de fundo nas pausas, a cada 2–5 s. Mostre a pessoa o que é real e o
   que é design, e dê a fonte de cada notícia.
   Imagens vão em `midia/broll/<nome>.png`; vídeos em `midia/broll/videos/<nome>.mp4`.
4. **Recorte (rotoscopia).**
   `python "<ferramentas>/matte.py" "<vídeo original>" cache/roto/mascara.mp4` — ~5,6 quadros/s (77 s de vídeo ≈ 7 min).
   **Rode em primeiro plano** (Bash com `timeout: 600000`): em segundo plano a tarefa morre se a sessão fechar.
   Vídeo com mais de ~100 s: rode em partes com `--de`/`--ate` e emende as máscaras.
   Confira uma folha da máscara (`ffmpeg -i mascara.mp4 -vf "fps=1/3,scale=180:320,tile=12x2" -frames:v 1 folha.png`):
   só a pessoa branca, nada do fundo.
5. **Compor.** Escreva `roto.json` na pasta do projeto:
   ```json
   {"original": "midia/<vídeo>.mp4", "mascara": "cache/roto/mascara.mp4", "saida": "midia/<vídeo>-rotoscopia.mp4",
    "desce": 120, "fundos": [[9.04, "p-noticia"], [14.80, "mk-15716"], [76.88, "saiba-mais"]]}
   ```
   (cada par = até quando, no tempo do original, e o nome do fundo). Fundo **`"original"`** = sem recorte, o vídeo
   gravado em tela cheia — **no CTA final use `"original"`** (aprovado: do "Então se o teu SaaS…" até o fim, sem tela
   verde, só com a faixa de qualificação; o light leak do CTA marca a troca).
   Rode `python "<ferramentas>/compor.py" .`
   — ele confere que saiu com o mesmo número de quadros do original. Depois `bo substituir m1 "<saída>"`:
   os cortes, a legenda e a transcrição continuam valendo.
6. **Montagem final.** Legenda ligada em `pos: 47`, faixa de qualificação no CTA, light leaks, V2/V3 vazias.

## Conferir
- `bo quadro` em cada fundo (uma folha juntando 12 quadros): legenda legível, fundo certo na frase certa, recorte limpo.
- Pisca preto: exporte e procure quadro escuro —
  `ffmpeg -i video.mp4 -vf "signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -f null - | grep YAVG`
  (YAVG abaixo de 30 = preto). Tem que dar zero.

## Para trocar um fundo depois
Edite o nome/tempo em `roto.json`, rode `compor.py` de novo (~1–2 min, não precisa recortar de novo) e
`bo substituir m1` com o mesmo arquivo.

## O que já deu errado (e já está resolvido nas ferramentas)
- **Coisas do fundo no recorte** (gente passando atrás, móvel colado no ombro): o `matte.py` limpa — corta
  semitransparente fraco, tira pontas finas e só aceita o que desce da cabeça. Se ainda sobrar algo, mostre o quadro.
- **Piscar preto nos cortes:** o vídeo recortado sai sem quadro B e com GOP 15, e o motor do editor segura o último
  quadro de cada corte (corrigido em 01/10/2026 em `motor/exportar.js` e `ui/preview.js`).
- **Vídeo saindo mais curto:** pedaços de imagem e de vídeo com etiqueta de cor diferente reiniciavam o filtro; o
  `compor.py` padroniza tudo em bt709 e confere a contagem de quadros.

## Direitos
Notícia: use print com a fonte visível. Vídeo de referência de outro criador (Biblioteca de Anúncios) é só referência
de estilo. Mixkit: livre para anúncio.
