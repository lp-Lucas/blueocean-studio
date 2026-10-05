"""Mapeia o outro ângulo (2400–3500 s do arquivo): para cada janela, o atraso em relação ao episódio."""
import numpy as np, json
SR = 8000
a = np.fromfile('trab/a8k.raw', dtype=np.int16).astype(np.float32)
MAIN = a[:int(2136 * SR)]
CAND = [2075.474, 2041.301, 2028.863, 2010.212, 1846.300, 1816.656, 1804.678, 1642.687, 1584.461, 1363.462]
N = 1 << 25
FM = np.fft.rfft(MAIN, N)
cs = np.concatenate([[0], np.cumsum(MAIN.astype(np.float64) ** 2)])

def corr(seg, m0):
    i = int(m0 * SR)
    if i < 0 or i + len(seg) > len(MAIN): return -1
    ref = MAIN[i:i + len(seg)] - MAIN[i:i + len(seg)].mean()
    return float(np.dot(seg, ref) / (np.linalg.norm(seg) * np.linalg.norm(ref) + 1e-9))

def busca(seg):
    cc = np.fft.irfft(FM * np.conj(np.fft.rfft(seg, N)), N)[:len(MAIN) - len(seg)]
    en = np.sqrt(cs[len(seg):len(seg) + len(cc)] - cs[:len(cc)]); en = np.maximum(en, np.median(en))
    r = cc / en / np.linalg.norm(seg); k = int(np.argmax(r))
    return k / SR, float(r[k])

W, P = 3.0, 1.5
res = []
t = 2402.5
while t + W < 3499.5:
    seg = a[int(t * SR):int((t + W) * SR)]; seg = seg - seg.mean()
    if np.sqrt(np.mean(seg ** 2)) < 30: res.append((t, None, 0)); t += P; continue
    best = (None, -1)
    for off in CAND:
        for d in np.arange(-0.03, 0.031, 0.0025):
            r = corr(seg, t - off - d)
            if r > best[1]: best = (off + d, r)
    if best[1] < 0.15:
        m, r = busca(seg)
        if r > best[1]:
            best = (t - m, r)
            if r > 0.15: CAND.append(round(t - m, 3))
    res.append((t, best[0] if best[1] >= 0.15 else None, best[1]))
    t += P

# junta janelas seguidas com o mesmo atraso
seg, cur = [], None
for t, off, r in res:
    if off is not None and cur and abs(cur['off'] - off) < 0.02 and t - cur['b1'] < P + 0.01:
        cur['b1'] = t + W - P; cur['rs'].append(r)
    else:
        if cur: seg.append(cur)
        cur = {'b0': t, 'b1': t + W - P, 'off': off, 'rs': [r]} if off is not None else None
if cur: seg.append(cur)
out = []
for s in seg:
    if s['b1'] - s['b0'] < 3: continue
    out.append({'b0': round(s['b0'], 2), 'b1': round(s['b1'], 2), 'off': round(s['off'], 3),
                'm0': round(s['b0'] - s['off'], 2), 'm1': round(s['b1'] - s['off'], 2), 'r': round(float(np.mean(s['rs'])), 2)})
    o = out[-1]; print(f"B {o['b0']:.2f}-{o['b1']:.2f}  episódio {o['m0']:.2f}-{o['m1']:.2f}  atraso {o['off']:.3f}  r {o['r']}")
json.dump(out, open('trab/mapa_b.json', 'w'), indent=1)
