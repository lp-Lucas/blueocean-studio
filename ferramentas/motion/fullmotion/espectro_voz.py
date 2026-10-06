"""Espectro da voz só nos trechos de fala (quadros acima do percentil 40), relativo à banda 1–2 kHz (receita 11).
Também mede fala − pausas (ruído) e a cauda de eco (energia 60–200 ms depois do fim das palavras).
uso: python espectro_voz.py <audio> [<audio2> …]"""
import sys, subprocess, numpy as np

BANDAS = [80, 200, 500, 1000, 2000, 4000, 6000, 8000, 12000]
REF = [15, 15, 9, 0, -6, -15, -14, -15, None]   # voz aprovada (midia/qualidade-voz.wav, case Diego)

def carrega(a, sr=48000):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', a, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True)
    return np.frombuffer(r.stdout, np.float32), sr

for a in sys.argv[1:]:
    x, sr = carrega(a); n = 2048; h = n // 2
    fr = np.lib.stride_tricks.sliding_window_view(x, n)[::h] * np.hanning(n)
    S = np.abs(np.fft.rfft(fr, axis=1)) ** 2; f = np.fft.rfftfreq(n, 1 / sr)
    e = 10 * np.log10(S.sum(1) + 1e-12); fala = e > np.percentile(e, 40); pausa = e < np.percentile(e, 10)
    m = S[fala].mean(0)
    def banda(c): lo, hi = c / 2 ** 0.5, c * 2 ** 0.5; return 10 * np.log10(m[(f >= lo) & (f < hi)].mean() + 1e-15)
    ref = 10 * np.log10(m[(f >= 1000) & (f < 2000)].mean())
    v = [banda(c) - ref for c in BANDAS]
    print(a.split('/')[-1][:40])
    print('  banda  ' + ' '.join(f'{c if c < 1000 else str(c // 1000) + "k":>6}' for c in BANDAS))
    print('  voz    ' + ' '.join(f'{d:6.1f}' for d in v))
    print('  ref    ' + ' '.join(f'{r:6.0f}' if r is not None else '     -' for r in REF))
    print(f'  fala − pausas: {np.median(e[fala]) - np.median(e[pausa]):.1f} dB')
