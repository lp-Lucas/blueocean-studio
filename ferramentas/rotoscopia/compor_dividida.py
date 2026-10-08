# Rotoscopia "tela dividida" (estilo dos reels do Rony / "Por Trás das Marcas"): material real em cima, a pessoa embaixo
# com o fundo dela, a cabeça recortada passando por cima da imagem de cima e a emenda das duas metades desfocada.
# Três jeitos de cena:
#   "dividida": fundo (vídeo/print) em 0..corte, pessoa ampliada embaixo, emenda desfocada, cabeça recortada por cima
#   "cheia":    fundo em tela cheia (sem a pessoa)
#   "original": a pessoa em tela cheia, ampliada (pose "cheio")
# Frames fora de qualquer cena saem como no original (não aparecem na linha do tempo).
#
# uso: python compor_dividida.py "<pasta do projeto>" [roteiro.json]      (padrão: <projeto>/roto-dividida.json)
# roto-dividida.json:
#  {"original": "...mov", "saida": "midia/x-dividida.mp4",
#   "mascaras": "cache/roto/mascaras.json",          (lista [[início no original, "arquivo da máscara"], ...] — matte.py --de)
#   "corte": 1000,                                    (altura da parte de cima)
#   "pessoa": {"s": 1.3, "x": -162, "y": 130},        (escala e canto de cima-esquerda do quadro original na tela dividida)
#   "cheio":  {"s": 1.25, "x": -135, "y": -300},      (pessoa em tela cheia)
#   "cenas": [{"de": 3.88, "ate": 4.35, "jeito": "dividida", "fundo": "videos/volvo-epicsplit", "inicio": 30},
#             {"de": 4.35, "ate": 4.75, "jeito": "dividida", "fundo": "celular/legiao", "y": 540, "marca": [[x0,y0,x1,y1]]},
#             {"de": 11.6, "ate": 13.9, "jeito": "original"}]}
#  tempos no ORIGINAL. fundo = caminho em midia/broll sem extensão (.mp4 ou .png).
#  vídeo: "inicio" (s no arquivo), "foco"/"focoy" 0–1 (que parte aparece), "inteiro": true = encaixa pela largura com o
#         próprio vídeo desfocado atrás (para não cortar texto da tela).
#  print (celular/*): "y" = linha do print no topo da área; "rolagem": [[s desde o início da cena, y], ...] (suave);
#         "zoom" (padrão 1); "marca" = marca-texto amarelo [x0,y0,x1,y1] em pixels do print.
import os, sys, json, math, subprocess, numpy as np, cv2
from PIL import Image, ImageDraw, ImageChops

PROJ = os.path.abspath(sys.argv[1])
ROTEIRO = sys.argv[2] if len(sys.argv) > 2 else 'roto-dividida.json'
CFG = json.load(open(os.path.join(PROJ, ROTEIRO), encoding='utf-8'))
abs_ = lambda p: p if os.path.isabs(p) else os.path.join(PROJ, p)
BROLL = os.path.join(PROJ, 'midia', 'broll')
ORIG, SAIDA = abs_(CFG['original']), abs_(CFG['saida'])
# escreve num arquivo temporário e só troca no fim: se a composição for interrompida, o vídeo em uso não quebra
PARCIAL = os.path.splitext(SAIDA)[0] + '.parcial.mp4'
TMP = os.path.join(PROJ, 'cache', 'roto', 'div-' + os.path.splitext(ROTEIRO)[0]); os.makedirs(TMP, exist_ok=True)
W, H = 1080, 1920
CORTE = CFG.get('corte', 1000)
PESSOA = CFG.get('pessoa', {'s': 1.3, 'x': -162, 'y': 130})
CHEIO = CFG.get('cheio', {'s': 1.25, 'x': -135, 'y': -300})
BANDA = CFG.get('banda', 170)            # altura do degradê da emenda (px acima do corte)
info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries',
                  'stream=nb_read_frames,r_frame_rate', '-of', 'json', ORIG], capture_output=True, text=True).stdout)['streams'][0]
QUADROS = int(info['nb_read_frames']); n_, d_ = info['r_frame_rate'].split('/'); FPS = int(n_) / int(d_)
X264 = ['-c:v', 'libx264', '-crf', '17', '-preset', 'fast', '-bf', '0', '-g', '15', '-pix_fmt', 'yuv420p', '-r', f'{FPS:g}',
        '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709']

def expr_rolagem(kf):
    kf = sorted(kf); e = str(kf[-1][1])
    for (t0, y0), (t1, y1) in reversed(list(zip(kf, kf[1:]))):
        u = f"((t-{t0})/{max(t1 - t0, 0.01)})"
        e = f"if(lt(t,{t1}),{y0}+({y1}-{y0})*{u}*{u}*(3-2*{u}),{e})"
    return f"if(lt(t,{kf[0][0]}),{kf[0][1]},{e})"

def fundo(k, c, n):
    """renderiza o fundo da cena (W x altura) com n quadros; devolve o caminho"""
    alt = H if c['jeito'] == 'cheia' else CORTE
    arq = os.path.join(TMP, f'{k:03d}.mp4')
    f = c['fundo']
    if os.path.exists(os.path.join(BROLL, f + '.mp4')):
        ent = ['-ss', str(c.get('inicio', 0)), '-stream_loop', '-1', '-i', os.path.join(BROLL, f + '.mp4')]
        if c.get('inteiro'):
            g = (f"[0:v]fps={FPS:g},split[a][b];[a]scale={W}:-2:flags=lanczos[fg];"
                 f"[b]scale={W}:{alt}:force_original_aspect_ratio=increase,crop={W}:{alt},gblur=sigma=30,"
                 f"colorchannelmixer=rr=.55:gg=.55:bb=.55[bg];[bg][fg]overlay=0:(H-h)*{c.get('focoy', 0.5)}")
        else:
            g = (f"[0:v]fps={FPS:g},scale={W}:{alt}:force_original_aspect_ratio=increase:flags=lanczos,"
                 f"crop={W}:{alt}:'(iw-{W})*{c.get('foco', 0.5)}':'(ih-{alt})*{c.get('focoy', 0.5)}'")
    else:
        im = Image.open(os.path.join(BROLL, f + '.png')).convert('RGB')
        if c.get('marca'):
            a = np.asarray(im).astype(np.float32)
            for x0, y0, x1, y1 in c['marca']:
                r = a[y0:y1, x0:x1]; l = r.mean(2, keepdims=True) / 255
                if l.mean() < 0.5:   # página escura (texto claro): caixa amarela e o texto fica escuro
                    a[y0:y1, x0:x1] = np.array([255, 226, 64]) * (1 - l) + np.array([20, 20, 20]) * l
                else:                # página clara: marca-texto por cima do texto escuro
                    a[y0:y1, x0:x1] = r * np.array([255, 226, 64]) / 255
            im = Image.fromarray(a.clip(0, 255).astype(np.uint8))
        kf = c.get('rolagem', [[0, c.get('y', 0)]]); z = c.get('zoom', 1.0)
        cw, ch = round(W / z / 2) * 2, round(alt / z / 2) * 2
        ymax = max(y for _, y in kf)
        if im.height < ymax + ch:
            pad = Image.new('RGB', (im.width, ymax + ch), im.getpixel((5, im.height - 5))); pad.paste(im, (0, 0)); im = pad
        p = os.path.join(TMP, f'{k:03d}-print.png'); im.save(p)
        ent = ['-loop', '1', '-framerate', f'{FPS:g}', '-i', p]
        g = f"[0:v]crop={cw}:{ch}:{(W - cw) // 2}:'{expr_rolagem(kf)}',scale={W}:{alt}:flags=lanczos"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', g + ',format=rgb24', '-frames:v', str(n), '-an',
                    '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-pix_fmt', 'yuv444p', arq], check=True)
    return arq

ler = lambda args, w, h, cinza=False: subprocess.Popen(
    ['ffmpeg', '-v', 'error', *args, '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'gray' if cinza else 'rgb24', '-'],
    stdout=subprocess.PIPE)

# 1) cenas em quadros do original e fundos prontos
cenas = sorted(CFG['cenas'], key=lambda c: c['de'])
for k, c in enumerate(cenas):
    c['q0'], c['q1'] = math.ceil(c['de'] * FPS - 1e-6), math.ceil(c['ate'] * FPS - 1e-6)
    if c['jeito'] != 'original' and c['q1'] > c['q0']:
        c['arq'] = fundo(k, c, c['q1'] - c['q0']); print(f"cena {k}: {c['jeito']} {c.get('fundo', '')} {c['de']:.2f}–{c['ate']:.2f}", flush=True)
masc = [[math.ceil(a * FPS - 1e-6), abs_(f)] for a, f in json.load(open(abs_(CFG['mascaras'])))]

# 2) quadro a quadro
def pose_img(og, p):
    """o quadro original escalado e posicionado na tela (W x H)"""
    s = p['s']; pw, ph = round(W * s), round(H * s)
    M = np.float32([[s, 0, p['x']], [0, s, p['y']]])
    return M, cv2.warpAffine(og, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

# degradê e desfoque da emenda
y = np.arange(H, dtype=np.float32)
A_TOPO = np.clip((CORTE - y) / BANDA, 0, 1); A_TOPO = A_TOPO * A_TOPO * (3 - 2 * A_TOPO)       # 1 em cima → 0 no corte
B0, B1 = CORTE - BANDA - 40, CORTE + 40
W_BLUR = np.clip(1 - np.abs(y[B0:B1] - (CORTE - BANDA / 2)) / (BANDA / 2 + 40), 0, 1)[:, None, None]

fo = ler(['-i', ORIG], W, H)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', f'{FPS:g}', '-i', '-',
                        '-i', ORIG, '-map', '0:v', '-map', '1:a?', *X264, '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', PARCIAL],
                       stdin=subprocess.PIPE)
ci, fb, fm, mi, mq = 0, None, None, -1, 0
for i in range(QUADROS):
    o = fo.stdout.read(W * H * 3)
    if len(o) < W * H * 3: break
    og = np.frombuffer(o, np.uint8).reshape(H, W, 3)
    while ci < len(cenas) and cenas[ci]['q1'] <= i:
        ci += 1
    c = cenas[ci] if ci < len(cenas) and cenas[ci]['q0'] <= i else None
    if c is not None and i == c['q0'] and 'arq' in c:
        if fb: fb.kill()
        fb = ler(['-i', c['arq']], W, H if c['jeito'] == 'cheia' else CORTE)
    if c is None:
        out = og
    elif c['jeito'] == 'cheia':
        out = np.frombuffer(fb.stdout.read(W * H * 3), np.uint8).reshape(H, W, 3)
    elif c['jeito'] == 'original':
        out = pose_img(og, CHEIO)[1]
    else:
        # máscara do trecho que contém este quadro
        j = max((k for k, (q, _) in enumerate(masc) if q <= i), default=-1)
        if j != mi:
            if fm: fm.kill()
            fm, mi, mq = ler(['-i', masc[j][1]], W, H, True), j, masc[j][0]
        while mq < i: fm.stdout.read(W * H); mq += 1
        mb = fm.stdout.read(W * H); mq += 1
        m = np.frombuffer(mb, np.uint8).reshape(H, W) if len(mb) == W * H else np.zeros((H, W), np.uint8)
        top = np.frombuffer(fb.stdout.read(W * CORTE * 3), np.uint8).reshape(CORTE, W, 3)
        M, base = pose_img(og, PESSOA)
        ma = cv2.warpAffine(m, M, (W, H), flags=cv2.INTER_LINEAR)
        out = base.astype(np.float32)
        a = A_TOPO[:CORTE, None, None]
        out[:CORTE] = top * a + out[:CORTE] * (1 - a)
        faixa = out[B0:B1]
        borrada = cv2.GaussianBlur(faixa, (0, 0), 14)
        out[B0:B1] = borrada * W_BLUR + faixa * (1 - W_BLUR)
        # a pessoa recortada por cima (só onde ela passa da emenda para cima)
        lim = B1
        al = ma[:lim, :, None].astype(np.float32) / 255
        out[:lim] = base[:lim] * al + out[:lim] * (1 - al)
        out = out.clip(0, 255).astype(np.uint8)
    enc.stdin.write(np.ascontiguousarray(out).tobytes())
    if (i + 1) % 480 == 0: print(f'{i + 1}/{QUADROS} quadros', flush=True)
enc.stdin.close(); enc.wait()
n = i + 1
if n != QUADROS or enc.returncode: sys.exit(f'ERRO: saíram {n} de {QUADROS} quadros (o vídeo em uso não foi trocado)')
os.replace(PARCIAL, SAIDA)
print(f'pronto: {SAIDA} ({n} de {QUADROS} quadros)')
