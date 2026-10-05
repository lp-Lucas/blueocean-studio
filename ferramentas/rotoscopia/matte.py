# Rotoscopia: Robust Video Matting (ONNX, CPU) + limpeza → vídeo da máscara (cinza) com os mesmos quadros do original.
# uso: python matte.py <video> <saida.mp4> [--de s --ate s]
# Limpeza (só a pessoa): corta semitransparente fraco, fica com a maior forma (a pessoa),
# tira pontas finas presas ao contorno (abertura) e suaviza de leve entre quadros.
import sys, subprocess, time, os, numpy as np, onnxruntime as ort, cv2

src, out = sys.argv[1], sys.argv[2]
de = float(sys.argv[sys.argv.index('--de') + 1]) if '--de' in sys.argv else None
ate = float(sys.argv[sys.argv.index('--ate') + 1]) if '--ate' in sys.argv else None
W, H = 1080, 1920
AQUI = os.path.dirname(os.path.abspath(__file__))
s = ort.InferenceSession(os.path.join(AQUI, 'rvm.onnx'), providers=['CPUExecutionProvider'])

ABRE = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))   # some o que for mais fino que ~30 px
VIZ = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))    # folga em volta do corpo (óculos, cabelo)

def descendo_da_cabeca(m):
    """Só o que se liga à cabeça vindo de cima: começa na cabeça (topo, no meio da tela) e desce
    linha a linha ficando com os trechos que encostam no que já foi aceito na linha de cima.
    Gente ou objeto ao lado (que só encosta no ombro por baixo) fica de fora."""
    h, w = m.shape
    meio = m[:, int(w * 0.3):int(w * 0.7)].any(1)
    if not meio.any(): return m
    y0 = int(np.argmax(meio))
    out = np.zeros_like(m)
    ant = np.zeros(w, bool); ant[int(w * 0.3):int(w * 0.7)] = True
    for y in range(y0, h):
        lin = m[y].astype(bool)
        if not lin.any(): continue
        d = np.diff(np.concatenate([[0], lin.astype(np.int8), [0]]))
        ini, fim = np.where(d == 1)[0], np.where(d == -1)[0]
        viz = np.convolve(ant, np.ones(5), 'same') > 0        # 2 px de folga
        nova = np.zeros(w, bool)
        for a, b in zip(ini, fim):
            if viz[a:b].any(): nova[a:b] = True
        out[y] = nova; ant = nova if nova.any() else ant
    return out

def limpar(a, ant):
    a = np.clip((a - 0.10) / 0.80, 0, 1)
    duro = (a > 0.5).astype(np.uint8)
    duro = cv2.morphologyEx(duro, cv2.MORPH_OPEN, ABRE)
    p = cv2.resize(duro, (W // 4, H // 4), interpolation=cv2.INTER_NEAREST)   # conta em 1/4 (rápido)
    p = descendo_da_cabeca(p).astype(np.uint8)
    duro = cv2.resize(p, (W, H), interpolation=cv2.INTER_NEAREST) & duro
    porta = cv2.GaussianBlur(cv2.dilate(duro, VIZ).astype(np.float32), (0, 0), 4)
    a = a * porta
    if ant is not None: a = 0.75 * a + 0.25 * ant
    return a

corte = (['-ss', str(de)] if de is not None else []) + (['-t', str(ate - (de or 0))] if ate is not None else [])
dec = subprocess.Popen(['ffmpeg', '-v', 'error', *corte, '-i', src, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                       stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                        '-c:v', 'libx264', '-crf', '10', '-bf', '0', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
rec = [np.zeros([1, 1, 1, 1], np.float32)] * 4
dr = np.array([0.25], np.float32)
n, t0, ant = 0, time.time(), None
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    x = np.frombuffer(buf, np.uint8).reshape(H, W, 3).transpose(2, 0, 1)[None].astype(np.float32) / 255
    fgr, pha, *rec = s.run(None, {'src': x, 'r1i': rec[0], 'r2i': rec[1], 'r3i': rec[2], 'r4i': rec[3], 'downsample_ratio': dr})
    ant = limpar(pha[0, 0], ant)
    enc.stdin.write((ant * 255).clip(0, 255).astype(np.uint8).tobytes())
    n += 1
    if n % 150 == 0: print(f'{n} quadros · {n / (time.time() - t0):.1f} q/s', flush=True)
enc.stdin.close(); enc.wait()
print('pronto', n, 'quadros em', round(time.time() - t0), 's')
