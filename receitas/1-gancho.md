# Gancho com reação e light leak
> Tela dividida no começo (vídeo em cima, reação do Matheus embaixo) e flash de luz azul na volta para a tela cheia.
Ícone: raio
Pedido: Faça o gancho com a reação do Matheus [decepcionado/surpreso/feliz] nesse vídeo, com o light leak azul na transição.

Aprovado em 30/09/2026 (6 copies de anúncio). É o gancho padrão dos criativos da Blue Ocean.

## Como fica na linha do tempo
- **V1**: o vídeo da copy inteiro, em tela cheia, com o áudio (é o único áudio do vídeo).
- **V2**, de 0 até o fim da reação (normalmente 6 s; o `feliz.mov` tem 4,2 s):
  o mesmo vídeo da copy, `volume: 0`, na caixa de cima.
- **V3** (crie a faixa `{"id":"V3","tipo":"video","nome":"Reação"}` logo depois da V2), mesmo tempo:
  a reação do acervo (`decepcionado.mov`, `surpreso.mov`, `feliz.mov`), `volume: 0`, na caixa de baixo.
  Quando V2 e V3 acabam, o V1 aparece sozinho em tela cheia — essa é a troca.
- **FX**: `{"efeito": "lightleak", "inicio": <corte − 0.2>}`. O pico do flash cai 0,2 s depois do início,
  bem na troca, e esconde o corte seco. Não use fade na troca (`entra`/`sai` 0): foi pedido "rápido, tipo um pisco".

## Caixas (tela 1080×1920)
| caso | caixa de cima | caixa de baixo |
|---|---|---|
| vídeo normal (uma pessoa) | `{x:0,y:0,w:1080,h:960}` | `{x:0,y:960,w:1080,h:960}` |
| vídeo que **já vem com duas telas** no original | `{x:0,y:0,w:1080,h:1180}` (≈60%) | `{x:0,y:1180,w:1080,h:740}` |

No vídeo que já vem dividido, a parte de cima maior foi pedida para mostrar melhor a pessoa que fala.

## Enquadramento
- Em cima: ajuste `foco.y` para aparecer o texto do gancho (a headline queimada no vídeo) **e** o rosto de quem fala.
  Se não couber os dois, priorize rosto + legenda. Confira com `bo quadro 1` e `bo quadro 3`.
- Embaixo: o Matheus do rosto ao peito, com a mão levantada visível (`foco.y` ≈ 0.5 nas reações do acervo).

## Conferir
`bo quadro` em 1 s (tela dividida), no corte −0.05 (flash no pico) e no corte +0.5 (tela cheia).

## Vários copies
Uma composição por copy (`bo comp nova "Copy 2 – surpreso" --copiar comp1` aproveita a montagem do primeiro;
depois troque a mídia, a reação e os tempos no arquivo da nova). Monte e aprove o primeiro antes de replicar.

## Entrega
Nome: `copyN_gancho_<reacao>.mp4`. Mesma duração do original, áudio original. Vários: `bo exportar --todas`.
