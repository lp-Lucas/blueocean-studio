"""Áudio do Full Motion BlueOcean (receita 11): trata a voz e prepara a música de fundo com ducking.
uso: python mixar.py <voz> <musica> <inicio_musica_s> <duracao_s> <pasta_saida> [--nome X]
saídas: <pasta>/<X>-voz.wav (−16 LUFS) e <pasta>/<X>-musica.wav (~18 dB abaixo da voz enquanto ele fala).
Os SFX saem do roteiro de som em −34 LUFS (fmsfx.salvar). No editor: normalizar −14 LUFS, "voz" e "limpar" desligados
(o tratamento já está nos arquivos; o compressor do editor pegaria a mistura toda e subiria música e SFX)."""
import sys, os, json, subprocess, tempfile

a = sys.argv[1:]
voz, mus, ini, dur, pasta = a[0], a[1], float(a[2]), float(a[3]), a[4]
nome = a[a.index('--nome') + 1] if '--nome' in a else 'fm'
VOZ_OUT, MUS_OUT = os.path.join(pasta, f'{nome}-voz.wav'), os.path.join(pasta, f'{nome}-musica.wav')

# voz: tira o grave embolado e um pouco de ruído, presença em 3,5 kHz, ar, de-esser, compressão leve; −16 LUFS, pico −2
CADEIA = ('highpass=f=80,afftdn=nr=8:nf=-45,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3500:t=q:w=1:g=2,'
          'highshelf=f=10000:g=1.5,deesser=i=0.4,acompressor=threshold=-22dB:ratio=3:attack=6:release=120:makeup=2')


def medir(arq, filtro, alvo):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', arq, '-af', f'{filtro}{"," if filtro else ""}{alvo}:print_format=json',
                        '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
    return json.loads(r[r.rindex('{'): r.rindex('}') + 1])


def norm(alvo, j):
    return (f'{alvo}:measured_I={j["input_i"]}:measured_TP={j["input_tp"]}:measured_LRA={j["input_lra"]}'
            f':measured_thresh={j["input_thresh"]}:offset={j["target_offset"]}:linear=true')


ALVO_VOZ = 'loudnorm=I=-16:TP=-2:LRA=7'
j = medir(voz, CADEIA, ALVO_VOZ)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', voz, '-af', f'{CADEIA},{norm(ALVO_VOZ, j)},aresample=48000', '-ar', '48000', VOZ_OUT], check=True)

# música: trecho, nível −26,5 LUFS antes do ducking; abaixa sozinha quando ele fala (sidechain na voz); fades
tmp = tempfile.mktemp(suffix='.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(ini), '-t', str(dur), '-i', mus, '-ar', '48000', '-ac', '2', tmp], check=True)
ALVO_MUS = 'loudnorm=I=-26.5:TP=-4:LRA=20'
j = medir(tmp, '', ALVO_MUS)
# apad: o sidechain dura o vídeo todo (sem ele a música acaba junto com a voz e o fade-out some)
fc = (f'[0]{norm(ALVO_MUS, j)},aresample=48000[m];[1]aformat=channel_layouts=stereo,apad=whole_dur={dur}[k];'
      f'[m][k]sidechaincompress=threshold=0.05:ratio=2.5:attack=40:release=500:knee=4[d];'
      f'[d]afade=t=in:d=0.4,afade=t=out:st={dur - 1.8:.2f}:d=1.8')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-i', VOZ_OUT, '-filter_complex', fc, '-t', str(dur), '-ar', '48000', MUS_OUT], check=True)
os.remove(tmp)


def lufs(arq):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', arq, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8', errors='ignore').stderr
    s = r[r.rindex('Summary'):]
    return [l.split(':')[1].strip() for l in s.splitlines() if l.strip().startswith(('I:', 'Peak:'))]


for arq in (VOZ_OUT, MUS_OUT):
    print(os.path.basename(arq), ' · '.join(lufs(arq)))
