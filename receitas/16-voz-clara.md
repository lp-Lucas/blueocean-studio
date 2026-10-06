# Voz clara e forte, sem eco nem ruído de sala (+ música com ducking)
> Trata a fala gravada em sala (modelo/apresentador): tira chiado e eco, devolve o brilho que deixa a voz "abafada", dá corpo e nivela para rede social sem compressor; opcional: uma música de fundo por vídeo, baixando sozinha quando a pessoa fala.
Ícone: onda
Pedido: Trata o áudio desse vídeo: voz clara e forte, sem eco e ruído da sala (e coloca música de fundo: [links]).

Aprovado em 06/10/2026, projeto "clientesblue2" (Neosync, 3 vídeos de modelo em sala com parede de tijolo): "boa!".
1ª versão reprovada: "a voz ficou meio abafada… quero clara e forte, mas sem o eco e ruído da sala".

## Ferramentas (em `ferramentas/motion/fullmotion/`)
- `voz_clara.py <entrada vídeo|áudio> <saida.wav> [--eq "<cadeia ffmpeg>"]` — o tratamento inteiro.
- `espectro_voz.py <a.wav> [<b.wav> …]` — espectro só nos trechos de fala (relativo a 1–2 kHz) + "fala − pausas".
- `mixar.py <voz tratada> <musica> <início_s> <dur_s> <pasta> --nome X` — música com ducking (use só o `X-musica.wav`).

## Cadeia aprovada (`voz_clara.py`)
1. `highpass=f=70,afftdn=nr=10:nf=-50` — ruído LEVE (antes do dereverb).
2. `dereverb.py` suave, 2 passadas: `--alvo 0.15 --forca 1.5 --piso -18 --suave 0.8 --larg 11` e depois
   `--rt60 0.65 --n 4096 --ate 600 --alvo 0.18` (mesmos força/piso/suave/larg).
3. EQ: `lowshelf=f=220:g=5` (corpo/força) · `equalizer=f=500:w=1:g=-2` · `equalizer=f=1000:w=1.2:g=-1` ·
   `equalizer=f=3500:w=1:g=-1` · `highshelf=f=5500:g=9` · `equalizer=f=7500:w=1:g=4` (clareza) ·
   `highshelf=f=11000:g=-3` (sem chiado) · `deesser=i=0.15:m=0.4:f=0.6` (LEVE).
4. Ganho linear até −16 LUFS + `aresample=192000,alimiter=limit=0.79:attack=5:release=80,aresample=48000`
   (pico −2 dBFS; superamostrado para não passar entre amostras).

**O que deixou abafado / bugou (não use):**
- de-esser forte (`i=0.45`): comeu 6–8 kHz (−27 dB contra −20 sem ele) → voz abafada;
- compressor e `afftdn` forte DEPOIS do dereverb (o `mixar.py` faz isso na voz): levantam a cauda do eco e o chiado —
  "fala − pausas" caiu de 24,6 para 18,5 dB;
- realce em 3–4 kHz: deixa estridente (o brilho vem de 5,5–7,5 kHz);
- limitador rápido, agate (abre e fecha no meio das palavras), aexciter com ganho alto.

## Conferir (com `espectro_voz.py`, sempre antes × depois)
| medida | original (Neosync) | aprovado |
|---|---|---|
| 6 kHz / 8 kHz (rel. 1–2 kHz) | −23 / −35 dB | −13 a −17 / −16 a −23 dB |
| 500 Hz – 1 kHz | +7 / +4 (embolado) | +4 a +5 / +3 |
| fala − pausas (ruído + eco) | 24,6 dB | **≥ 25 dB** (saiu 26–31) |
| nível da voz | — | −16 LUFS, pico −2 dBFS |
Se os agudos ficarem abaixo, suba `highshelf 5500` / `7500` em passos de 2 dB e meça de novo; se a voz soar fina,
suba o `lowshelf 220`. Não passe de ±3 dB da referência em 4 kHz (estridente).

## Passo a passo
1. **Voz na linha do tempo cortada:** exporte a composição só com a fala (`bo exportar --comp <comp> --nome base
   --pasta <ABS>/cache/audio`) — assim os cortes já estão aplicados. Em vídeo de motion, use a base cortada
   (`cache/motion/baseN-orig.mp4`).
2. `python fullmotion/voz_clara.py <base.mp4> midia/<x>-voz.wav` (uma por vídeo).
3. **Música (se pedida), uma diferente por vídeo:** `bo importar <link> --audio`; copie para um nome simples
   (títulos do YouTube têm caracteres que quebram o ffmpeg); ache onde o som começa (`silencedetect=n=-35dB`) e rode
   `mixar.py midia/<x>-voz.wav <musica> <início> <dur> cache/audio --nome x` → copie só `x-musica.wav` para `midia/`
   (≈ −33 LUFS enquanto ela fala, ~17 dB abaixo da voz; fade in 0,4 s / out 1,8 s).
4. **Composição:** vídeo com `volume: 0`; A1 = voz tratada (início 0); A2 = SFX (se houver); A3 = música.
   `audio: {normalizar: true, lufs: -13.4, limpar: false, voz: false}` (o "voz"/"limpar" do editor pegam a mistura
   toda e desfazem o tratamento).
5. **Simule a exportação** (amix das faixas → `loudnorm=I=-12.2:TP=-1.5:LRA=11`): meça o mp4 exportado (ebur128): ≈ −14 LUFS, pico −1,3 (lufs −13,4 → −14,0; −12,2 saiu −12,8).
6. Peça para a pessoa ouvir um trecho de cada no preview.
