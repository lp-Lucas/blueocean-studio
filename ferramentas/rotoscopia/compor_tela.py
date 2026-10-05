# Rotoscopia "tela cheia" (aprovado em 02/10/2026 — receita 9-rotoscopia-tela-cheia): fundo 9:16 ocupando a tela toda (print de celular rolando, cartão 9:16,
# vídeo) e a pessoa recortada MENOR, num canto de baixo, trocando de lado a cada cena (corte seco).
# Área segura do Reels (y 270–1248): informação em 290–780, legenda pos 44 (~845), cabeça a partir de ~910.
#
# uso: python compor_tela.py "<pasta do projeto>" [roteiro.json]     (padrão: <projeto>/roto-tela.json)
# roto-tela.json:
#  {"original": "...mp4", "mascara": "cache/roto/mascara.mp4", "saida": "midia/x-tela.mp4",
#   "cenas": [
#     {"ate": 9.04, "fundo": "celular/neofeed", "pose": "centro", "rolagem": [[0, 230], [4.5, 230], [6.0, 700]]},
#     {"ate": 24.2, "fundo": "celular/infomoney", "pose": "esq", "rolagem": [[0,0],[1.2,0],[2.4,2290]],
#      "marca": [[660, 2618, 948, 2662]]},
#     {"ate": 14.8, "fundo": "videos/mk-41642", "pose": "dir"},
#     {"ate": 17.95, "fundo": "tela/linx-90", "pose": "esq"},
#     {"ate": 76.88, "fundo": "original"}]}
#  "ate" = até quando, no tempo do ORIGINAL. fundo = caminho em midia/broll sem extensão (.png ou .mp4), ou "original"
#  (vídeo gravado sem recorte; "desce": px para baixo, com o topo preenchido pelo próprio vídeo desfocado —
#  assim a legenda em pos 44 não cai no rosto; receita 9). celular/* = print de celular 1080 de largura (sem barra de status, a não ser com
#  "barra_status": true) e rola conforme "rolagem" ([segundos desde o início da cena, y do topo da tela no print], suave).
#  vídeo: "inicio" (s no arquivo, padrão 1); "recorte": [x,y,w,h] + "topo": px = encaixa o pedaço pela largura
#  (gravação de tela: Meta Ads); "foco" 0–1 escolhe a parte do vídeo deitado que aparece (pessoa do B-roll à direita → 0.75).
#  "marca" = marca-texto amarelo [x0,y0,x1,y1] em pixels do print. "zoom" (padrão 1.12) amplia o print (corta as laterais,
#  que são a margem de 6%): na tela, y_tela = (y_print - rolagem) * zoom + 120. pose: centro | esq | dir  (ou {"s":..,"x":..,"y":..}).
import os, sys, json, subprocess, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageChops

PROJ = os.path.abspath(sys.argv[1])
ROTEIRO = sys.argv[2] if len(sys.argv) > 2 else 'roto-tela.json'   # vários vídeos no projeto: um roteiro para cada
CFG = json.load(open(os.path.join(PROJ, ROTEIRO), encoding='utf-8'))
abs_ = lambda p: p if os.path.isabs(p) else os.path.join(PROJ, p)
BROLL = os.path.join(PROJ, 'midia', 'broll')
ORIG, MASC, SAIDA = abs_(CFG['original']), abs_(CFG['mascara']), abs_(CFG['saida'])
TMP = os.path.join(PROJ, 'cache', 'roto', 'tela-' + os.path.splitext(ROTEIRO)[0]); os.makedirs(TMP, exist_ok=True)
W, H, FPS = 1080, 1920, 30
BARRA = CFG.get('barra_status', False)   # barra de hora/sinal/bateria do iPhone nos prints (desligada: aprovado sem)
TRANS = CFG.get('deslize', 0)   # 0 = corte seco: a pessoa troca de lado junto com o fundo (aprovado); >0 = segundos deslizando
POSES = {            # escala e canto de cima-esquerda do quadro da pessoa (1080x1920 do original)
    # área segura de anúncio Reels (Meta): 14% em cima, 35% embaixo, 6% dos lados → y 270–1248, x 65–1015.
    # conteúdo 290–800, legenda ~845 (pos 44), cabeça a partir de ~910 e olhos ~1210 (dentro da área segura)
    'centro': {'s': 0.90, 'x': 54, 'y': 368},
    'esq':    {'s': 0.85, 'x': -99, 'y': 402},
    'dir':    {'s': 0.85, 'x': 261, 'y': 402},
}
X264 = ['-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-bf', '0', '-g', '15', '-pix_fmt', 'yuv420p', '-r', str(FPS),
        '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709']
PADRAO = 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setsar=1'
QUADROS = int(json.loads(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries',
              'stream=nb_read_frames', '-of', 'json', ORIG], capture_output=True, text=True).stdout)['streams'][0]['nb_read_frames'])

def fonte(tam):
    for f in ('C:/Windows/Fonts/seguisb.ttf', 'C:/Windows/Fonts/segoeuib.ttf', 'C:/Windows/Fonts/arialbd.ttf'):
        if os.path.exists(f): return ImageFont.truetype(f, tam)
    return ImageFont.load_default()

def barra_status(cor):
    """barra de status do iPhone (hora, sinal, wi-fi, bateria) na cor do topo da página"""
    b = Image.new('RGB', (W, 120), cor); d = ImageDraw.Draw(b)
    tinta = (0, 0, 0) if sum(cor) / 3 > 140 else (255, 255, 255)
    d.text((110, 62), '9:41', font=fonte(46), fill=tinta, anchor='mm')
    x = 820
    for i, h in enumerate((12, 18, 24, 30)): d.rounded_rectangle((x + i * 14, 76 - h, x + i * 14 + 9, 76), 2, fill=tinta)
    for r in (30, 20, 10):   # wi-fi
        d.arc((900 - r, 70 - r, 900 + r, 70 + r), 225, 315, fill=tinta, width=6)
    d.rounded_rectangle((940, 48, 1000, 76), 8, outline=tinta, width=3)
    d.rounded_rectangle((945, 53, 985, 71), 4, fill=tinta); d.rectangle((1002, 57, 1006, 67), fill=tinta)
    return b

def suave(u): return u * u * (3 - 2 * u)

def expr_rolagem(kf):
    """expressão do ffmpeg para o y da rolagem (keyframes [t, y], interpolação suave)"""
    kf = sorted(kf)
    e = str(kf[-1][1])
    for (t0, y0), (t1, y1) in reversed(list(zip(kf, kf[1:]))):
        u = f"((t-{t0})/{max(t1 - t0, 0.01)})"
        e = f"if(lt(t,{t1}),{y0}+({y1}-{y0})*{u}*{u}*(3-2*{u}),{e})"
    return f"if(lt(t,{kf[0][0]}),{kf[0][1]},{e})"

def trecho(k, c, n):
    arq = os.path.join(TMP, f'{k:02d}.mp4')
    f = c['fundo']; dur = n / FPS
    if f == 'original':
        ent, g = ['-f', 'lavfi', '-i', f'color=c=black:s={W}x{H}:r={FPS}'], f'[0:v]{PADRAO}'
    elif os.path.exists(os.path.join(BROLL, f + '.mp4')):
        ent = ['-ss', str(c.get('inicio', 1)), '-stream_loop', '-1', '-i', os.path.join(BROLL, f + '.mp4')]
        if c.get('recorte'):
            # gravação de tela (ex.: Meta Ads): o pedaço [x,y,w,h] inteiro, na largura da tela, a partir de y "topo";
            # atrás, o próprio vídeo desfocado e escuro preenchendo
            x, y, w, h = c['recorte']
            # o fundo desfocado sai do MESMO pedaço (senão o que foi cortado, ex. título, aparece borrado atrás)
            g = (f"[0:v]fps={FPS},crop={w}:{h}:{x}:{y},split[a][b];[a]scale={W}:-2:flags=lanczos[fg];"
                 f"[b]scale=-2:{H},crop={W}:{H},gblur=sigma=40,colorchannelmixer=rr=.4:gg=.4:bb=.4[bg];"
                 f"[bg][fg]overlay=0:{c.get('topo', 250)},{PADRAO}")
        else:
            # vídeo deitado vira 9:16 pelo recorte: "foco" (0 = esquerda, 0.5 = meio, 1 = direita) escolhe o pedaço
            g = f"[0:v]fps={FPS},scale=-2:{H}:flags=lanczos,crop={W}:{H}:'(iw-{W})*{c.get('foco', 0.5)}':0,{PADRAO}"
    else:
        im = Image.open(os.path.join(BROLL, f + '.png')).convert('RGB')
        if f.startswith('celular/'):
            if c.get('marca'):
                mk = Image.new('RGB', im.size, 'white'); d = ImageDraw.Draw(mk)
                for r in c['marca']: d.rectangle(r, fill=(255, 226, 64))
                im = ImageChops.multiply(im, mk)
            kf = c.get('rolagem', [[0, 0]])
            z = c.get('zoom', 1.12)
            if not BARRA:
                # sem barra de status: o print ocupa a tela toda, e a página fica na MESMA altura de antes
                # (y_tela = (y_print - rolagem) * zoom + 120) — os 120 px de cima mostram o que vem antes na página
                P = round(120 / z)
                topo = Image.new('RGB', (W, im.height + P), im.getpixel((W // 2, 2))); topo.paste(im, (0, P)); im = topo
            ymax = max(y for _, y in kf)
            if im.height < ymax + H:
                pad = Image.new('RGB', (W, ymax + H), im.getpixel((5, im.height - 5))); pad.paste(im, (0, 0)); im = pad
            p = os.path.join(TMP, f'{k:02d}-pagina.png'); im.save(p)
            if BARRA:
                cor = im.getpixel((W // 2, kf[0][1] + 3))
                sb = os.path.join(TMP, f'{k:02d}-barra.png'); barra_status(cor).save(sb)
                ent = ['-loop', '1', '-framerate', str(FPS), '-i', p, '-loop', '1', '-framerate', str(FPS), '-i', sb]
                # a página começa abaixo da barra de status, como num print de verdade
                cw, ch = round(W / z / 2) * 2, round((H - 120) / z / 2) * 2
                g = (f"[0:v]crop={cw}:{ch}:{(W - cw) // 2}:'{expr_rolagem(kf)}',scale={W}:{H - 120}:flags=lanczos,"
                     f"pad={W}:{H}:0:120[pg];[pg][1:v]overlay=0:0,{PADRAO}")
            else:
                ent = ['-loop', '1', '-framerate', str(FPS), '-i', p]
                cw, ch = round(W / z / 2) * 2, round(H / z / 2) * 2
                g = f"[0:v]crop={cw}:{ch}:{(W - cw) // 2}:'{expr_rolagem(kf)}',scale={W}:{H}:flags=lanczos,{PADRAO}"
        else:
            k_ = max(W / im.width, H / im.height)
            im = im.resize((round(im.width * k_), round(im.height * k_)), Image.LANCZOS)
            im = im.crop(((im.width - W) // 2, 0, (im.width - W) // 2 + W, H))
            p = os.path.join(TMP, f'{k:02d}-tela.png'); im.save(p)
            ent, g = ['-loop', '1', '-framerate', str(FPS), '-i', p], f'[0:v]{PADRAO}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', g, '-frames:v', str(n), '-an', *X264, arq], check=True)
    return arq

# 1) fundo inteiro, cena a cena
cenas, partes, ant = CFG['cenas'], [], 0
for k, c in enumerate(cenas):
    q = QUADROS if k == len(cenas) - 1 else min(QUADROS, round(c['ate'] * FPS))
    c['q0'], c['q1'] = ant, q
    if q > ant: partes.append(trecho(k, c, q - ant)); print(f"cena {k}: {c['fundo']} até {q / FPS:.2f}s", flush=True)
    ant = q
lista = os.path.join(TMP, 'lista.txt')
open(lista, 'w', encoding='utf-8').write('\n'.join(f"file '{p}'" for p in partes).replace('\\', '/'))
FUNDO = os.path.join(TMP, 'fundo.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', FUNDO], check=True)

# 2) a pessoa por cima, quadro a quadro (pose desliza suave na troca de cena)
pose = lambda c: POSES[c['pose']] if isinstance(c.get('pose'), str) else c.get('pose', POSES['centro'])
def pose_em(i):
    for k, c in enumerate(cenas):
        if c['q0'] <= i < c['q1']:
            if c['fundo'] == 'original': return {'cru': c.get('desce', 0)}
            p1 = pose(c)
            ant_ = next((cenas[j] for j in range(k - 1, -1, -1) if cenas[j]['fundo'] != 'original'), None)
            u = (i - c['q0']) / (TRANS * FPS) if TRANS > 0 else 1
            if ant_ is None or u >= 1: return p1
            p0, u = pose(ant_), suave(u)
            return {kk: p0[kk] + (p1[kk] - p0[kk]) * u for kk in ('s', 'x', 'y')}
    return None

ler = lambda args, tam: subprocess.Popen(['ffmpeg', '-v', 'error', *args, '-f', 'rawvideo', '-pix_fmt', 'rgb24' if tam == 3 else 'gray', '-'],
                                         stdout=subprocess.PIPE)
fb = ler(['-i', FUNDO, '-vf', f'scale={W}:{H}'], 3)
fo = ler(['-i', ORIG, '-vf', f'scale={W}:{H}'], 3)
fm = ler(['-i', MASC, '-vf', f'scale={W}:{H}'], 1)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-i', ORIG, '-map', '0:v', '-map', '1:a?', *X264, '-c:a', 'copy', '-movflags', '+faststart', SAIDA],
                       stdin=subprocess.PIPE)
BORDAS = {}
n = 0
while True:
    b = fb.stdout.read(W * H * 3); o = fo.stdout.read(W * H * 3); m = fm.stdout.read(W * H)
    if len(b) < W * H * 3 or len(o) < W * H * 3 or len(m) < W * H: break
    bg = np.frombuffer(b, np.uint8).reshape(H, W, 3).copy()
    og = np.frombuffer(o, np.uint8).reshape(H, W, 3)
    p = pose_em(n)
    if p is None: out = og
    elif 'cru' in p:    # vídeo original sem recorte, descido, com o topo desfocado
        d = p['cru']
        if not d: out = og
        else:
            pq = cv2.resize(og, (W // 8, H // 8), interpolation=cv2.INTER_AREA)
            out = (cv2.resize(cv2.GaussianBlur(pq, (0, 0), 6), (W, H)) * 0.55).astype(np.uint8)
            src = og[:H - d]
            a = np.ones((H - d, 1, 1), np.float32); f = min(120, d); a[:f, 0, 0] = np.linspace(0, 1, f)
            out[d:] = (src * a + out[d:] * (1 - a)).astype(np.uint8)
    else:
        s = p['s']; pw, ph = round(W * s), round(H * s)
        pr = cv2.resize(og, (pw, ph), interpolation=cv2.INTER_AREA)
        pa = cv2.resize(np.frombuffer(m, np.uint8).reshape(H, W), (pw, ph), interpolation=cv2.INTER_AREA)
        # a borda lateral do vídeo original corta o ombro numa linha reta quando ela cai dentro da tela: some suave
        if (pw, ph) not in BORDAS:
            r = np.ones(pw, np.float32); f = 70; r[:f] = np.linspace(0, 1, f); r[-f:] = np.linspace(1, 0, f)
            BORDAS[(pw, ph)] = r
        pa = (pa * BORDAS[(pw, ph)][None, :]).astype(np.uint8)
        x, y = round(p['x']), round(p['y'])
        x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + pw), min(H, y + ph)
        if x1 > x0 and y1 > y0:
            a = pa[y0 - y:y1 - y, x0 - x:x1 - x, None].astype(np.uint16)
            reg = bg[y0:y1, x0:x1].astype(np.uint16)
            bg[y0:y1, x0:x1] = ((pr[y0 - y:y1 - y, x0 - x:x1 - x] * a + reg * (255 - a)) // 255).astype(np.uint8)
        out = bg
    enc.stdin.write(out.tobytes()); n += 1
    if n % 300 == 0: print(f'{n}/{QUADROS} quadros', flush=True)
enc.stdin.close(); enc.wait()
print(f'pronto: {SAIDA} ({n} de {QUADROS} quadros)')
if n != QUADROS: sys.exit('ERRO: quadros a menos que o original')
