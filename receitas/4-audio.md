# Arrumar áudio
> Nivela o volume para rede social, limpa ruído, realça a voz e tira silêncio.
Ícone: onda
Pedido: Arrume o áudio desse vídeo: nivele, limpe o ruído e tire os silêncios.

## Acabamento (arquivo da composição → "audio")
| opção | o que faz |
|---|---|
| `normalizar: true, lufs: -14` | loudnorm em −14 LUFS, pico −1,5 dB (padrão de Reels/TikTok) |
| `limpar: true` | passa-alta 80 Hz + redução de ruído (afftdn) — ar-condicionado, chiado |
| `voz: true` | compressor leve + presença em 3 kHz — voz mais "na cara" |

Volume de cada item: `volume` (0 muda; 1 normal; até 2 reforça). Reação/B-roll sem som: `volume: 0`.

## Tirar silêncio (igual ao Remove Silence do DaVinci)
1. `bo silencio m1 --limiar -30 --minimo 0.35` lista os trechos mudos.
2. Divida o item nos trechos com fala e emende sem buraco no V1 (cada item começa onde o anterior acaba).
   Deixe 0,08 s de respiro antes e depois da fala para não comer sílaba.
3. A legenda acompanha sozinha (ela é reencaixada pelos trechos).
4. Confira com `bo legenda` que nenhuma frase ficou cortada.
