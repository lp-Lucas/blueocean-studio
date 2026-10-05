"""Quem fala em cada trecho do bruto: movimento da boca (região abaixo do nariz, achada pela pose) de quem está
à esquerda (Rony) e à direita (Lucas), só nos quadros com voz.
uso: python trab/quem_fala.py 719.9-729.9 774.9-805.6 ..."""
import sys, subprocess, json, numpy as np, cv2
from ultralytics import YOLO
F = json.load(open('projeto.json', encoding='utf-8'))['midias']['m1']['arquivo']
mod = YOLO('yolo11m-pose.pt')
SR = 8000
a = np.fromfile('trab/a8k.raw', dtype=np.int16).astype(np.float32)
for r in sys.argv[1:]:
    t0, t1 = map(float, r.split('-'))
    p = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t0), '-t', str(t1 - t0), '-i', F, '-vf', 'fps=10,scale=960:540', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True)
    fr = np.frombuffer(p.stdout, np.uint8).reshape(-1, 540, 960, 3)
    mov = {'esq': [], 'dir': []}; prev = {}
    for k, f in enumerate(fr):
        t = t0 + k / 10
        voz = np.sqrt(np.mean(a[int(t * SR):int((t + 0.1) * SR)] ** 2)) > 600
        res = mod.predict(f, conf=0.3, verbose=False)[0]
        for kp in res.keypoints.data.cpu().numpy():
            if kp[0, 2] < 0.4: continue
            nx, ny = kp[0, :2]; lado = 'esq' if nx < 480 else 'dir'
            olhos = kp[[1, 2], :2]; d = max(8, abs(olhos[0, 0] - olhos[1, 0]))
            x0, x1, y0, y1 = int(nx - d), int(nx + d), int(ny + 0.4 * d), int(ny + 1.6 * d)
            g = cv2.cvtColor(f[max(0, y0):y1, max(0, x0):x1], cv2.COLOR_BGR2GRAY)
            if g.size == 0: continue
            g = cv2.resize(g, (32, 24)).astype(np.float32)
            if lado in prev and voz: mov[lado].append(np.abs(g - prev[lado]).mean())
            prev[lado] = g
    e, d = np.mean(mov['esq'] or [0]), np.mean(mov['dir'] or [0])
    print(f'{r}: esq(Rony) {e:.2f}  dir(Lucas) {d:.2f}  → {"RONY" if e > d else "LUCAS"}', flush=True)
