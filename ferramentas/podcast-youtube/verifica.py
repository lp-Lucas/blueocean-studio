import numpy as np
SR = 8000
a = np.fromfile('trab/a8k.raw', dtype=np.int16).astype(np.float32)
INS = [(445.95, 450.70, 2028.863), (546.70, 551.95, 2010.21), (909.50, 915.12, 1816.656), (1385.80, 1391.10, 1642.687),
       (1531.75, 1537.05, 1642.69), (1825.90, 1829.90, 1584.46), (2097.30, 2103.35, 1363.46)]
def melhor(m0, off, L=2.0, busca=0.6):
    seg = a[int((m0 + off) * SR):int((m0 + off + L) * SR)]; seg = seg - seg.mean()
    best = (-1, 0)
    for d in range(int(-busca * SR), int(busca * SR) + 1, 4):
        ref = a[int(m0 * SR) + d:int(m0 * SR) + d + len(seg)]; ref = ref - ref.mean()
        r = float(np.dot(seg, ref) / (np.linalg.norm(seg) * np.linalg.norm(ref) + 1e-9))
        if r > best[0]: best = (r, d / SR)
    return best
for m0, m1, off in INS:
    r0, d0 = melhor(m0, off); r1, d1 = melhor(m1 - 2.0, off)
    print(f'{m0:.2f}-{m1:.2f}: inicio r={r0:.2f} desvio={d0*1000:+.1f}ms | fim r={r1:.2f} desvio={d1*1000:+.1f}ms')
