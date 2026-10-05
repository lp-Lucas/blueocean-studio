# Rotoscopia: a pessoa recortada (máscara do matte.py) por cima de imagens/vídeos, no tempo do arquivo original.
# Sai um vídeo do mesmo tamanho/duração do original, que entra no lugar dele com `bo substituir`.
#
# uso: python compor.py "<pasta do projeto>"      (lê <projeto>/roto.json)
# roto.json:
#   {"original": "midia/video.mp4",              vídeo gravado (com áudio)
#    "mascara":  "cache/roto/mascara.mp4",       saída do matte.py
#    "saida":    "midia/video-rotoscopia.mp4",
#    "desce": 120,                               quanto a pessoa desce na tela (px) para a imagem aparecer em cima
#    "fundos": [[9.04, "p-noticia"], [14.80, "mk-15716"], ...]}   (até quando, no tempo do ORIGINAL, e o fundo)
# Fundo = imagem midia/broll/<nome>.png (qualquer tamanho; vira 1080x960 em cima) ou vídeo midia/broll/videos/<nome>.mp4.
# O último fundo vai até o fim do vídeo, seja qual for o "até" dele.
# Fundo "original" = sem recorte: o vídeo gravado em tela cheia, como veio (ex.: no CTA final).
import os, sys, json, subprocess
from PIL import Image, ImageFilter, ImageEnhance

PROJ = os.path.abspath(sys.argv[1])
CFG = json.load(open(os.path.join(PROJ, 'roto.json'), encoding='utf-8'))
abs_ = lambda p: p if os.path.isabs(p) else os.path.join(PROJ, p)
BROLL = os.path.join(PROJ, 'midia', 'broll')
ORIG, MASC, SAIDA = abs_(CFG['original']), abs_(CFG['mascara']), abs_(CFG['saida'])
TMP = os.path.join(PROJ, 'cache', 'roto', 'fundos'); os.makedirs(TMP, exist_ok=True)
DESCE = CFG.get('desce', 120)
FPS = 30
info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries',
                                  'stream=nb_read_frames', '-of', 'json', ORIG], capture_output=True, text=True).stdout)
QUADROS = int(info['streams'][0]['nb_read_frames'])

X264 = ['-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-bf', '0', '-g', '15', '-pix_fmt', 'yuv420p', '-r', str(FPS),
        '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709']
# todos os pedaços com a mesma cor: se um vier sem etiqueta, a emenda reinicia o filtro e perde quadros
PADRAO = 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setsar=1'

# a imagem de cima some suave na parte de baixo
MASC_TOPO = os.path.join(TMP, '_degrade.png')
m = Image.new('L', (1080, 960), 255)
for y in range(860, 960): m.paste(int(255 * (960 - y) / 100), (0, y, 1080, y + 1))
m.save(MASC_TOPO)

def cobrir(im, w, h):
    """redimensiona cobrindo w x h e corta o centro"""
    k = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

def quadro(nome):
    """imagem nítida em cima (1080x960) e a mesma desfocada e escura preenchendo a tela"""
    im = Image.open(os.path.join(BROLL, nome + '.png')).convert('RGB')
    topo = cobrir(im, 1080, 960)
    fundo = cobrir(topo, 1080, 1920).filter(ImageFilter.GaussianBlur(45))
    fundo = ImageEnhance.Brightness(fundo).enhance(0.45)
    fundo.paste(topo, (0, 0), Image.open(MASC_TOPO))
    arq = os.path.join(TMP, nome + '.png'); fundo.save(arq); return arq

def trecho(k, nome, n):
    """um pedaço do fundo com n quadros"""
    arq = os.path.join(TMP, f'{k:02d}.mp4')
    video = os.path.join(BROLL, 'videos', nome + '.mp4')
    if nome == 'original':     # o vídeo cru entra por cima na junção final; aqui só preenche
        g = f'[0:v]{PADRAO}'
        ent = ['-f', 'lavfi', '-i', f'color=c=black:s=1080x1920:r={FPS}']
    elif os.path.exists(video):
        g = (f"[0:v]fps={FPS},split[a][b];"
             f"[a]scale=-2:960,crop=1080:960,format=rgba[s];[1:v]format=gray[m];[s][m]alphamerge[sm];"
             f"[b]scale=-2:1920,crop=1080:1920,gblur=sigma=45,colorchannelmixer=rr=.45:gg=.45:bb=.45[bl];"
             f"[bl][sm]overlay=0:0,{PADRAO}")
        ent = ['-ss', '1', '-stream_loop', '-1', '-i', video, '-loop', '1', '-i', MASC_TOPO]
    elif os.path.exists(os.path.join(BROLL, nome + '.png')):
        g = f'[0:v]{PADRAO}'
        ent = ['-loop', '1', '-framerate', str(FPS), '-i', quadro(nome)]
    else:
        sys.exit(f'ERRO: fundo "{nome}" não existe (nem midia/broll/{nome}.png nem midia/broll/videos/{nome}.mp4)')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', g, '-frames:v', str(n), '-an', *X264, arq], check=True)
    return arq

partes, ant, crus = [], 0, []
fundos = CFG['fundos']
for k, (ate, nome) in enumerate(fundos):
    q = QUADROS if k == len(fundos) - 1 else min(QUADROS, round(ate * FPS))
    if q <= ant: continue
    if nome == 'original': crus.append((ant, q))
    partes.append(trecho(k, nome, q - ant)); ant = q
    print(f'fundo {nome} até {q / FPS:.2f}s', flush=True)
lista = os.path.join(TMP, 'lista.txt')
open(lista, 'w', encoding='utf-8').write('\n'.join(f"file '{p}'" for p in partes).replace('\\', '/'))
fundo = os.path.join(TMP, 'fundo.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', fundo], check=True)

grafo = (f"[0:v]setpts=N/{FPS}/TB[bg];"   # tempo pelo número do quadro (a emenda dos pedaços bagunça o pts)
         f"[1:v]split[o][cru];[2:v]format=gray[a];[o][a]alphamerge[p];"
         f"[bg][p]overlay=0:{DESCE}:shortest=1[r]")
if crus:   # trechos "original": o vídeo gravado por cima de tudo, em tela cheia
    janela = '+'.join(f"between(n,{a},{b - 1})" for a, b in crus)
    grafo += f";[r][cru]overlay=0:0:enable='{janela}',format=yuv420p[v]"
else:
    grafo += ";[cru]nullsink;[r]format=yuv420p[v]"
# sem quadro B e GOP curto: o editor pula de um corte para o outro sem piscar preto
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', fundo, '-i', ORIG, '-i', MASC,
                '-filter_complex', grafo, '-map', '[v]', '-map', '1:a?', *X264,
                '-c:a', 'copy', '-movflags', '+faststart', SAIDA], check=True)
n = subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries', 'stream=nb_read_frames',
                    '-of', 'csv=p=0', SAIDA], capture_output=True, text=True).stdout.strip()
print(f'pronto: {SAIDA} ({n} de {QUADROS} quadros)')
if str(QUADROS) != n: sys.exit('ERRO: o vídeo saiu com quadros a menos que o original')
