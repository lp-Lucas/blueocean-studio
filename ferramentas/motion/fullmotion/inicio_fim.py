"""Confere se o vídeo COMEÇA quando a fala começa e TERMINA depois que a fala termina (receita 15, regra da pessoa 06/10/2026).
uso: python inicio_fim.py <voz tratada ou baseN-orig.mp4> [<outro> …]
(rode na VOZ, não no vídeo mixado: música e SFX do final contam como som e enganam a medida)
Mede a energia da voz (50 ms; voz = acima de −40 dB, ignorando estalos < 0,15 s) e aponta:
  - silêncio antes da 1ª palavra > 0,25 s  → corte a entrada mais perto da fala;
  - fala já ALTA no 1º bloco (> −25 dB)    → a 1ª sílaba pode estar cortada (confira);
  - fim do vídeo antes de 0,3 s depois da última palavra → a fala está cortada/colada no fim;
  - mais de 1,2 s depois da última palavra → sobra silêncio no fim.
Saída "ok" = começo e fim no ponto."""
import sys, subprocess, numpy as np

def energia(arq):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', arq, '-vn', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True)
    x = np.frombuffer(r.stdout, np.float32); n = 800; fr = len(x) // n
    return len(x) / 16000, 20 * np.log10(np.sqrt((x[:fr * n].reshape(fr, n) ** 2).mean(1)) + 1e-9)

for arq in sys.argv[1:]:
    dur, e = energia(arq); voz = e > -40
    # descarta estalos isolados (< 3 blocos de 50 ms)
    k = 0
    while k < len(voz):
        if voz[k]:
            j = k
            while j < len(voz) and voz[j]: j += 1
            if j - k < 3: voz[k:j] = False
            k = j
        else: k += 1
    idx = np.where(voz)[0]
    if not len(idx): print(f'{arq}: sem fala detectada'); continue
    ini, fim = idx[0] * 0.05, (idx[-1] + 1) * 0.05
    av = []
    if ini > 0.25: av.append(f'silêncio de {ini:.2f} s antes da 1ª palavra — corte a entrada mais perto da fala')
    if e[0] > -25: av.append('fala já começa alta no quadro 0 — a 1ª sílaba pode estar cortada')
    if dur - fim < 0.3: av.append(f'vídeo acaba {dur - fim:.2f} s depois da última palavra — fala cortada/colada no fim (deixe 0,3–0,6 s)')
    if dur - fim > 1.2: av.append(f'sobra {dur - fim:.2f} s de silêncio no fim')
    nome = arq.replace('\\', '/').split('/')[-1]
    print(f'{nome}: fala {ini:.2f}–{fim:.2f} s de {dur:.2f} s · ' + ('ok' if not av else ' | '.join(av)))
