# Blue Ocean Studio

Editor de vídeo da Blue Ocean com o Claude. Preview ao vivo à esquerda, conversa à direita.
O Claude roda pelo seu Claude Code local (sem API) e cada passo dele aparece no chat.

## Abrir
Atalho **Blue Ocean Studio** na Área de Trabalho ou no Menu Iniciar (ou `ABRIR.bat` nesta pasta).
Numa máquina nova: rode `INSTALAR.bat` uma vez.

## A tela
- **Mídia**: arraste vídeos/pastas, ou cole um link (YouTube, Instagram, Drive) para baixar.
  Duplo clique põe na linha do tempo; arrastar solta onde quiser.
- **Receitas**: os processos aprovados (gancho, montagem, legenda, áudio, baixar, cortes).
  **Usar** manda o pedido para o chat. O Claude lê a receita e segue.
- **Ajustes**: muda conforme o que está selecionado (vídeo, texto, efeito, legenda ou o projeto).
- **Preview**: arraste para mover, alças para redimensionar, **Alt + arrastar** para enquadrar,
  roda do mouse para zoom. A legenda se arrasta para cima/baixo.
- **Linha do tempo**: arraste itens, apare pelas bordas, clique no vazio para mover a agulha.
  Botão direito num item abre mais opções.

## Vários vídeos: composições
- Cada aba em cima do preview é uma **composição**: um vídeo com a própria linha do tempo. As mídias são as mesmas para todas.
- **+** cria uma vazia ou duplica a atual. Duplo clique renomeia; arraste para reordenar.
- Botão direito numa aba: **Aplicar desta nas outras** (estilo da legenda, aparência dos textos, textos, efeitos, áudio,
  formato), exportar, apagar. Ponto azul na aba = o Claude mexeu nela.
- Exportar → **Todas** sai um arquivo por composição. No chat: “faça um vídeo para cada copy”, “aplica isso em todas”.

## Vários clientes: edição em lotes
Botão de camadas no topo (ou **Edição em lotes** na página inicial). Uma aba por cliente:
1. **Material**: nome do cliente, o bruto (link da pasta do Drive / vídeos, ou solte os arquivos) e o site do cliente.
2. **Receita**: já vem a de motion na identidade do cliente; dá para trocar e deixar observações. **Gerar**.
- Cada lote vira um projeto com o nome do cliente; o Claude faz tudo sozinho, sem parar para perguntar, e no fim lista
  as decisões que tomou. **Gerar todos** manda todas as abas prontas para a fila; "Ao mesmo tempo" diz quantas rodam juntas
  (cada uma usa a placa de vídeo — 2 é o recomendado).
- A aba mostra o passo atual, o tempo e o custo. Pronto: **Abrir no editor** e ajuste pelo chat como qualquer projeto.
- Se o programa fechar no meio, o lote fica "Parado": **Continuar de onde parou**.

## Versão nova do vídeo (motion refeito no After): Substituir
Botão direito na mídia (ou no clipe) → **Substituir…** → escolha o arquivo novo. Tudo que usa a mídia continua no lugar.
- **Só substituir o vídeo**: quando só o visual mudou.
- **Verificar a transcrição**: retranscreve, compara palavra por palavra, mantém suas correções e palavras escondidas,
  e avisa se a fala andou no tempo — com o botão para mover os cortes junto.

## Corrigir a legenda à mão: Transcrição
Botão **Transcrição** na linha do tempo (ou Ctrl+T). Clique numa palavra vai até ela; duplo clique ou Enter corrige;
Tab passa para a próxima; Delete tira a palavra da legenda; sublinhado laranja = o Whisper ficou em dúvida.
Procurar e trocar corrige um erro em tudo (ex.: “blu ocean” → “Blue Ocean”). Salva sozinho.

## Headline e faixa de qualificação
- **Headline** (tecla T): já nasce no papel rasgado azul, em Instrument Sans. Em Ajustes escolha outro estilo
  (Faixa azul, Caixa branca, Contorno, Limpo) e qualquer fonte do computador. `**assim**` deixa uma parte em negrito.
- **Qualificação** (tecla Q): a faixa azul com o logo e o público. Escolha Topo/Meio/Base ou arraste no preview;
  “Já na tela” ou “Desliza da esquerda” (1,33 s, linear, como na Timeline 1.3); “Vídeo todo” estica do início ao fim.

## Atalhos
| tecla | faz |
|---|---|
| Espaço | toca / pausa |
| S | divide na agulha |
| Delete | apaga (Shift+Delete fecha o buraco) |
| T | texto na agulha |
| L | light leak azul na agulha |
| Q | faixa de qualificação na agulha |
| ← → | quadro a quadro (Shift: 1 s) |
| Ctrl+Z / Ctrl+Shift+Z | desfazer / refazer (vale também para o que o Claude fez) |
| Ctrl+D | duplicar |
| Ctrl+roda na linha do tempo | zoom |

## Onde fica cada coisa
Instalado pelo .exe, os dados ficam em `Documentos\Blue Ocean Studio`; rodando do código-fonte, na pasta do programa.
- `projetos/<nome>/` — mídias (`projeto.json`), um arquivo por vídeo em `composicoes/`, conversa, transcrições, `saidas/`.
- `receitas/` — os processos salvos. Peça "salve isso como receita" e o Claude escreve uma nova.
- `config.json` — modelo do Claude, Python da transcrição, placa de vídeo (também em Configurações ⚙).
- Os vídeos originais nunca são copiados nem alterados: o projeto só aponta para eles.

## Instalar num computador novo
1. Rode **Instalar Blue Ocean Studio.exe**. O Windows pode avisar "O Windows protegeu o computador":
   clique em **Mais informações → Executar assim mesmo** (o instalador não é assinado digitalmente).
2. Na primeira abertura aparece **Preparar**: clique em **Instalar o que falta**. Ele baixa FFmpeg, yt-dlp + Deno,
   Git, Claude Code e a transcrição (Whisper; com placa NVIDIA são ~3 GB). Tudo na conta do usuário, sem administrador,
   em `%LOCALAPPDATA%\BlueOceanStudio\ferramentas`.
3. Clique em **Entrar** e confirme a conta do Claude no navegador (precisa de plano Pro, Max ou Team).

Para conferir depois: Configurações ⚙ → **Verificar instalação**.

## Gerar o instalador
`npm install` e depois `npm run instalador` — sai em `dist\Instalar Blue Ocean Studio <versão>.exe`.
