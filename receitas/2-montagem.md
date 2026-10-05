# Montagem por tomadas (UGC / anúncio)
> Recebe as tomadas soltas e a copy; escolhe o melhor trecho de cada parte, emenda e nivela o áudio.
Ícone: camadas
Pedido: Veja o que está bom nessas tomadas e monte o vídeo com esta copy: 

Aprovado em 30/09/2026 (UGC do SaaS da Blue Ocean, 4 tomadas → 21 s).

## Passo a passo
1. `bo importar` a pasta das tomadas e `bo transcrever todas`.
2. Leia a transcrição de cada tomada (`bo texto`) e compare com a copy, frase por frase:
   - fique com a tomada **mais fluida e completa** como base;
   - troque só a frase que ficou melhor em outra tomada (ex.: a prova social "já escalou mais de mil SaaS");
   - descarte tomada com tropeço ("aplicar esse método do método"), erro de fala ou áudio cortado.
3. Monte no V1 em sequência, sem buracos: cada item começa onde o anterior termina.
   Corte na primeira palavra da frase e no fim da última palavra (use `bo texto m1 --palavras` para o tempo exato).
4. Emenda de tomadas diferentes: dê um zoom leve (`zoom: 1.1`) na tomada inserida para a troca não parecer pulo.
5. Áudio: `"audio": {"normalizar": true, "lufs": -14}` (padrão).
6. Confira com `bo folha linha --n 12` e `bo quadro` em cada emenda.
7. Responda com o que está bom e ruim em cada tomada e a montagem final (tempo → tomada → trecho).

## Entrega combinada
- A pessoa costuma pedir **primeiro sem legenda** (para fazer a cor fora) e depois legendar a versão colorida.
  Deixe a transcrição salva para isso.
- Se ela mandar a versão colorida (com cortes dela), **transcreva de novo**: os tempos antigos não servem mais.
