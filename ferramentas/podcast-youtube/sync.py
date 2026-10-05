import numpy as np
SR = 8000
a = np.fromfile('trab/a8k.raw', dtype=np.int16).astype(np.float32)
MAIN_END = 2136.0
main = a[:int(MAIN_END * SR)]

def norm(x):
    x = x - x.mean()
    return x / (np.linalg.norm(x) + 1e-9)

cortes = [2402.27, 2439.90, 2447.91, 2467.93, 2503.97, 2711.68, 2793.16, 2794.49, 2809.34, 2815.68,
          3018.55, 3020.22, 3058.09, 3113.14, 3138.50, 3300.83, 3315.68, 3332.20, 3344.04, 3376.57, 3396.93, 3499.86]
N = 1 << 25
F = np.fft.rfft(main, N)
for i in range(len(cortes) - 1):
    c0, c1 = cortes[i], cortes[i + 1]
    if c1 - c0 < 3: continue
    res = []
    # duas janelas por clipe para conferir que o offset é constante
    for frac in (0.25, 0.7):
        L = min(8.0, (c1 - c0) * 0.4)
        s = c0 + (c1 - c0) * frac - L / 2
        seg = a[int(s * SR):int((s + L) * SR)]
        seg = seg - seg.mean()
        G = np.fft.rfft(seg[::-1], N)
        cc = np.fft.irfft(F * G, N)[len(seg) - 1:len(seg) - 1 + len(main) - len(seg)]
        # energia local para normalizar
        cs = np.concatenate([[0], np.cumsum(main.astype(np.float64) ** 2)])
        en = np.sqrt(cs[len(seg):len(seg) + len(cc)] - cs[:len(cc)]) + 1e-9
        r = cc / en / (np.linalg.norm(seg) + 1e-9)
        k = int(np.argmax(r))
        res.append((s, k / SR, r[k]))
    print(f'clipe {c0:.2f}-{c1:.2f}: ' + ' | '.join(f'B {s:.2f} -> main {m:.3f} (off {s - m:.3f}, r {q:.2f})' for s, m, q in res))
