# Baixar vídeo
> Baixa de YouTube, Shorts, Instagram, TikTok e Google Drive e já coloca no projeto.
Ícone: baixar
Pedido: Baixe este vídeo e coloque no projeto: 

## Como
`bo importar "<link>"` — baixa com o yt-dlp para `midia/` do projeto e já importa.
Só o áudio (música, trilha, fala para usar em cima de outro vídeo): `bo importar "<link>" --audio` — vira .m4a e entra na faixa de áudio.
Funciona com link do Google Drive (`drive.google.com/file/d/...`), YouTube/Shorts, Instagram (reel/post) e TikTok.

## Quando falha
- YouTube "429 / confirme que não é um robô": o `bo importar` já tenta sozinho outros clientes do YouTube
  (celular e player embutido). Se ainda assim falhar, a conexão está bloqueada por um tempo: espere uns minutos
  ou peça o arquivo. Não fique repetindo o download — cada tentativa piora o bloqueio.
- Vídeo vem em até 1080p (4K não ajuda no Reels e pesa 4×).
- Instagram às vezes pede login: avise a pessoa e peça para ela baixar pelo snapinsta e arrastar o arquivo para o chat.
- Drive privado: peça para liberar "qualquer pessoa com o link".

## Referência de outro criador
Se o vídeo baixado for referência (efeito, estilo, copy), diga isso e lembre que uso em anúncio
precisa de autorização do criador.
