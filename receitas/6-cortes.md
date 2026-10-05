# Cortes de entrevista e podcast
> Acha os melhores momentos de um vídeo longo e monta cortes verticais com legenda.
Ícone: tesoura
Pedido: Faça 5 cortes de até 1 minuto com os momentos mais fortes deste vídeo.

## Passo a passo
1. `bo importar` o vídeo longo e `bo transcrever`.
2. Leia a transcrição inteira (`bo texto m1`) e escolha os trechos.
3. Monte **cada corte numa composição própria** (`bo comp nova "01 – título curto"`), e exporte todas no fim com `bo exportar --todas`.
   Assim a pessoa revisa e ajusta cada corte separado.
   Antes de exportar em série, mostre o primeiro para a pessoa aprovar.

## Regras de corte (as mesmas do Cortador)
1. O corte termina quando o raciocínio termina, não quando a pessoa respira. Se faltar algo, estenda.
2. Comece na primeira palavra da ideia. Havendo pergunta de entrevistador, prefira começar nela.
3. Tomada repetida (a pessoa erra e regrava): use só a última versão completa.
4. Nunca inclua bastidor: "grava agora", "espera aí", orientação de produção.
5. Sem pedido de duração: de 30 a 90 segundos por corte.
6. Se o material não sustenta o pedido, diga isso e entregue menos cortes em vez de inventar.

## Enquadramento
Vídeo deitado (16:9) em tela vertical: item com `zoom` 1 cobre a tela; ajuste `foco.x` para o rosto de quem fala
(confira com `bo quadro`). Duas pessoas: divida o item na troca de quem fala e mude o `foco.x` em cada parte.
Legenda padrão Blue Ocean ligada.
