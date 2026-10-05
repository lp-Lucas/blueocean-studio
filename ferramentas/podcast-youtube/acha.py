import numpy as np, sys
SR=8000
a=np.fromfile('trab/a8k.raw',dtype=np.int16).astype(np.float32)
B=a[int(2400*SR):int(3500*SR)]
N=1<<24
FB=np.fft.rfft(B,N)
cs=np.concatenate([[0],np.cumsum(B.astype(np.float64)**2)])
for r in sys.argv[1:]:
    m0,L=map(float,r.split(':'))
    seg=a[int(m0*SR):int((m0+L)*SR)]; seg=seg-seg.mean()
    cc=np.fft.irfft(FB*np.conj(np.fft.rfft(seg,N)),N)[:len(B)-len(seg)]
    en=np.sqrt(cs[len(seg):len(seg)+len(cc)]-cs[:len(cc)]); en=np.maximum(en,np.median(en))
    rr=cc/en/np.linalg.norm(seg); k=int(np.argmax(rr))
    print(f'main {m0:.2f}+{L}: B {2400+k/SR:.3f} off {2400+k/SR-m0:.3f} r {rr[k]:.2f}')
