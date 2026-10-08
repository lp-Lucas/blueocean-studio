import sys, wave, numpy as np
w = wave.open(sys.argv[1]); x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
for r in sys.argv[2:]:
    a, b = map(float, r.split('-'))
    print(r, ' '.join(f'{k/20:.2f}:{20*np.log10(np.sqrt((x[k*800:(k+1)*800]**2).mean())+1e-9):.0f}' for k in range(round(a*20), round(b*20))))
