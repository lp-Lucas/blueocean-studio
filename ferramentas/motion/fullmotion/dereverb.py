"""Tira a reverberação da sala da fala (o "eco" no fim das palavras) — receita 11.
Método de Lebart: a cauda tardia da sala em cada frequência é estimada como a energia de Td segundos atrás, atenuada
pelo decaimento da sala (RT60); essa parte é subtraída do espectro (com piso para não "robotizar").
uso: python dereverb.py <entrada> <saida.wav> [--rt60 auto|0.6] [--forca 1.0] [--piso -14]
     sem --rt60 mede sozinho o decaimento depois das palavras."""
import sys, subprocess, numpy as np

a = sys.argv[1:]
ent, sai = a[0], a[1]
opt = lambda n, d: a[a.index(n) + 1] if n in a else d
SR = 48000
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', ent, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                                 capture_output=True).stdout, np.float32).astype(np.float64)


def medir_rt60(x):
    w = SR // 100
    e = np.array([10 * np.log10(np.mean(x[i:i + w] ** 2) + 1e-12) for i in range(0, len(x) - w, w)])
    tx = []
    for i in range(5, len(e) - 40):
        if e[i] > e.max() - 25 and e[i + 1] < e[i] - 1 and all(e[i] >= e[i - 5:i]):
            seg = e[i:i + 40]; j = np.argmax(seg < seg[0] - 20)
            if j > 3: tx.append(np.polyfit(np.arange(j) * 0.01, seg[:j], 1)[0])
    return -60 / np.median(tx)


rt = medir_rt60(x) if opt('--rt60', 'auto') == 'auto' else float(opt('--rt60', 0.6))
forca, piso = float(opt('--forca', 1.0)), float(opt('--piso', -24))
alvo = float(opt('--alvo', 0.25))          # RT60 desejado (s): a cauda passa a cair nesse ritmo
N = int(opt('--n', 1024)); H = N // 4
ATE = float(opt('--ate', 99999))            # só mexe abaixo dessa frequência (passada dos graves)
win = np.hanning(N)
pad = np.concatenate([np.zeros(N), x, np.zeros(N)])
nq = (len(pad) - N) // H
X = np.stack([np.fft.rfft(pad[i * H:i * H + N] * win) for i in range(nq)])
# faixas log (≈ como o ouvido): medida estável da cauda; o ganho volta para cada frequência por interpolação
fq = np.fft.rfftfreq(N, 1 / SR)
bordas = np.geomspace(60, min(20000, ATE * 1.2), 41)
idx = [np.where((fq >= bordas[b]) & (fq < bordas[b + 1]))[0] for b in range(40)]
idx = [ix if len(ix) else np.array([np.argmin(abs(fq - bordas[b]))]) for b, ix in enumerate(idx)]
cent = np.array([fq[ix].mean() for ix in idx])
Pw = np.abs(X) ** 2
L = 10 * np.log10(np.stack([Pw[:, ix].mean(1) for ix in idx], 1) + 1e-14)
qs = 60 / rt * H / SR                        # queda da sala por quadro (dB)
qa = 60 / alvo * H / SR                      # queda desejada por quadro (dB)
Ld = L.copy()
for i in range(1, nq): Ld[i] = 0.7 * Ld[i - 1] + 0.3 * L[i]
J = 4
teto = L[0].copy(); Gb = np.zeros_like(L)
for i in range(nq):
    incl = (Ld[i] - Ld[max(0, i - J)]) / J
    caindo = incl < -0.25 * qs                # cauda caindo (vogal sustentada fica de fora)
    teto = np.where(caindo, np.minimum(teto - qa, L[i]) * 0 + teto - qa, L[i])
    Gb[i] = np.clip(forca * (teto - L[i]), piso, 0)
G = np.stack([np.interp(fq, cent, g) for g in Gb])
G[:, fq > ATE] = 0
if '--debug' in a: print('quadros em queda', round(float(np.mean(Gb < -0.5)), 3), '| atenuação média nelas', round(float(Gb[Gb < -0.5].mean()), 1), 'dB | qs', round(qs, 3), 'qa', round(qa, 3))
G = 10 ** (G / 20)
k = np.ones(int(opt('--larg', 5))) / int(opt('--larg', 5))
G = np.apply_along_axis(lambda g: np.convolve(g, k, 'same'), 1, G)
SUAVE = float(opt('--suave', 0.4))          # quanto o ganho segura do quadro anterior (mais = sem "borbulhado")
for i in range(1, nq): G[i] = (1 - SUAVE) * G[i] + SUAVE * G[i - 1]
Y = X * G
y = np.zeros(len(pad)); wsum = np.zeros(len(pad))
for i in range(nq):
    y[i * H:i * H + N] += np.fft.irfft(Y[i], N) * win; wsum[i * H:i * H + N] += win ** 2
y = (y / np.maximum(wsum, 1e-8))[N:N + len(x)]
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', sai],
               input=y.astype(np.float32).tobytes(), check=True)
print(f'RT60 {rt:.2f} s · força {forca} · piso {piso} dB · alvo {alvo} s -> {sai}')
