# Legenda padrão Blue Ocean
> Montserrat Bold branco, palavra a palavra, com a caixa azul #0137FF atrás da palavra falada.
Ícone: legenda
Pedido: Coloque a legenda padrão Blue Ocean nesse vídeo.

Aprovado em 30/09/2026 (igualado proporção por proporção a uma referência). É o padrão para todo vídeo da Blue Ocean.

## Como aplicar no editor
1. `bo transcrever` as mídias com fala (a transcrição já reforça o áudio com dynaudnorm só para o Whisper ouvir
   trecho baixo; o vídeo sai com o áudio original).
2. Revise o texto com `bo legenda` e corrija erros do Whisper direto em `transcricoes/<id>.json` (campo `t`).
   Erros típicos: "R$ 400,00" quando ele fala "400 mil reais"; nome de marca ("Blue Ocean", "SaaS", "ODCR").
3. Ligue: `"legenda": {"ativa": true}` no arquivo da composição (composicoes/<id>.json). As medidas abaixo já são o padrão do editor.
4. Confira com `bo quadro` em 2 ou 3 momentos: a caixa tem que ficar justa na palavra falada.

## As medidas (numa tela de 1080 de largura; escala sozinha)
| item | valor |
|---|---|
| fonte | Montserrat Bold, branco |
| corpo (`tam`) | 72 |
| posição (`pos`) | 72% da altura |
| palavras por bloco (`palavras`) | 3 (quebra também em fim de frase e em pausa > 0,55 s) |
| caixa | #0137FF, altura 74 px, folga lateral 10 px, raio 15 px, centro 7 px abaixo do texto |

A caixa é medida na **tinta da palavra**, não na altura da fonte — é isso que deixa a caixa justa.

## Vídeo que já tem legenda
Se a pessoa mandar um vídeo que já vem legendado, **não legende de novo**: confira um quadro antes.
