# Headline e faixa de qualificação
> Headline no papel rasgado azul no começo, e a faixa com o público (logo Blue Ocean + texto) entrando da esquerda.
Ícone: type
Pedido: Coloque a headline "[texto]" no papel rasgado no começo e a faixa de qualificação para [público] entrando depois.

Medido na Timeline 1.3 (ads 24/09/2026), o padrão atual dos anúncios.

## Headline (item de texto na faixa T1)
```json
{"estilo": "papel", "texto": "Nosso SaaS bateu\n400k em 98 dias", "inicio": 0, "fim": 4.6,
 "x": 540, "y": 395, "tam": 82, "fonte": "InstrumentSans-SemiBold", "cor": "#FFFFFF",
 "contorno": 2, "papel": true, "entrelinha": 0.85, "largura": 900}
```
- Duas linhas curtas, quebradas à mão com `\n`. Centro do papel a 395 px de 1920 (logo acima do rosto).
- Fica os primeiros ~4,6 s, até a faixa entrar.
- Outros estilos: `faixa` (caixa azul por linha), `caixa` (branca), `contorno`, `limpo`.
  O jeito seguro de trocar é aplicar o estilo pelo painel — ou copiar os campos acima mudando `estilo`.

## Faixa de qualificação (item na faixa T1)
```json
{"tipo": "qualificacao", "texto": "Para **SAAS B2B** que já faturam acima de **R$30mil** de MRR",
 "inicio": 4.67, "fim": <fim do vídeo>, "y": 216, "altura": 171, "entrada": "esquerda", "durEntrada": 1.33,
 "fonte": "InstrumentSans-Regular", "tam": 56, "cor": "#003AFE", "logo": true}
```
- O público vai em **negrito** (`**...**`); o resto regular. Cabe em 2 linhas.
- `entrada: "esquerda"` desliza de fora da tela até encaixar em 1,33 s, linear (igual à referência).
  `"parada"` = já aparece encaixada. Para ficar o vídeo todo: `inicio: 0`, `fim` = duração, `entrada: "parada"`.
- Posição: `y` é o topo da barra. Topo = 216, meio = (1920 − 171)/2, base = 1920 − 171 − 216.
  Não deixe em cima da legenda (72% da altura) nem do rosto.

## Conferir
`bo quadro 2` (headline), `bo quadro 5.2` (faixa entrando), `bo quadro 10` (faixa parada).
