"""Energia (dB) a cada 0,1 s nos trechos pedidos: python energia.py <wav16k> a-b ..."""
import sys, wave, numpy as np
w = wave.open(sys.argv[1]); x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
for r in sys.argv[2:]:
    a, b = map(float, r.split('-')); out = []
    for k in range(round(a * 10), round(b * 10)):
        s = x[k * 1600:(k + 1) * 1600]; out.append(f'{k/10:.1f}:{20*np.log10(np.sqrt((s**2).mean())+1e-9):.0f}')
    print(r, ' '.join(out))
