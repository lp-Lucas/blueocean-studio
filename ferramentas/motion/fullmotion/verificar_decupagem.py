"""Verifica a decupagem de um vídeo JÁ CORTADO (receita 15): retranscreve a base inteira e aponta tudo que parece erro.
uso: python verificar_decupagem.py <base.mp4> [<base2.mp4> …]
Aponta: palavra repetida/gaguejo ("a a", "fer… ferramenta"), fragmentos ("af…"), muletas/claquete ("ai", "né", "copy",
"corta", "de novo"), palavra esticada (> 1,2 s), buraco no meio da frase (> 0,6 s) e voz sem transcrição (> 0,45 s; respiração costuma dar 0,3–0,4).
Saída vazia = decupagem limpa. Cada item vem com o tempo NA BASE para conferir/ouvir."""
import sys, re, subprocess, numpy as np
from faster_whisper import WhisperModel

MULETAS = {'ai', 'ah', 'ahn', 'hã', 'ãh', 'hum', 'hm', 'eh', 'né', 'tipo', 'ops', 'opa', 'desculpa', 'perdão', 'copy',
           'corta', 'gravando', 'valendo', 'ação', 'denovo'}
modelo = WhisperModel('large-v3', device='cpu', compute_type='int8')

def audio(arq):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', arq, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True)
    return np.frombuffer(r.stdout, np.float32)

limpo = lambda w: re.sub(r'[^\wà-ú]', '', w.lower())
for arq in sys.argv[1:]:
    x = audio(arq)
    seg, _ = modelo.transcribe(x, language='pt', word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
    W = [(w.start, w.end, w.word.strip()) for s in seg for w in s.words]
    achados = []
    for i, (a, b, t) in enumerate(W):
        c = limpo(t)
        if c in MULETAS or (i + 1 < len(W) and limpo(W[i + 1][2]) == 'novo' and c == 'de'):
            achados.append((a, f'muleta/claquete: "{t}"'))
        if i and c and c == limpo(W[i - 1][2]) and c not in ('que', 'e', 'a', 'o'):
            achados.append((a, f'palavra repetida: "{W[i-1][2]} {t}"'))
        if i + 1 < len(W):
            n = limpo(W[i + 1][2])
            if len(c) >= 2 and len(n) > len(c) and n.startswith(c) and c not in ('a', 'o', 'e'):
                achados.append((a, f'gaguejo/fragmento: "{t} {W[i+1][2]}"'))
        if t.endswith('...') or t.endswith('…'):
            achados.append((a, f'palavra cortada: "{t}"'))
        if b - a > 1.2:
            achados.append((a, f'palavra esticada ({b - a:.1f} s): "{t}" — pode esconder erro, ouça'))
        if i and a - W[i - 1][1] > 0.6 and not re.search(r'[.?!]$', W[i - 1][2]):
            achados.append((W[i - 1][1], f'buraco de {a - W[i-1][1]:.1f} s no meio da frase'))
    # voz sem transcrição
    n = 320; fr = len(x) // n; e = 20 * np.log10(np.sqrt((x[:fr * n].reshape(fr, n) ** 2).mean(1)) + 1e-9)
    tem = np.zeros(fr, bool)
    for a, b, _ in W: tem[int(a * 50):int(b * 50) + 1] = True
    voz = (e > -36) & ~tem; k = 0
    while k < fr:
        if voz[k]:
            j = k
            while j < fr and voz[j]: j += 1
            if (j - k) / 50 > 0.45: achados.append((k / 50, f'voz sem transcrição por {(j - k) / 50:.1f} s — ouça (tomada repetida? ruído?)'))
            k = j
        else: k += 1
    print(f'== {arq.split("/")[-1]} — {len(W)} palavras')
    print('   ' + ' '.join(w[2] for w in W))
    for t0, msg in sorted(achados): print(f'   [{t0:6.2f} s] {msg}')
    if not achados: print('   decupagem limpa')
