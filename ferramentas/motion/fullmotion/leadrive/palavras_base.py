"""Transcreve a BASE já cortada (faster-whisper large-v3-turbo na GPU) e grava o palavras.js da legenda do motion.
Corrige os nomes (Lead Drive → Leadrive, CAP → CAPI…) e aponta palavra esticada (> 1 s) e buraco > 0,5 s no meio da frase.
uso: python palavras_base.py <base.mp4> <saida palavras.js>"""
import os, sys, glob, re, json, subprocess
_nv = os.path.join(os.path.dirname(sys.executable), "..", "Lib", "site-packages", "nvidia")
for b in glob.glob(os.path.join(_nv, "*", "bin")):
    b = os.path.abspath(b); os.add_dll_directory(b); os.environ["PATH"] = b + os.pathsep + os.environ["PATH"]
import numpy as np
from faster_whisper import WhisperModel
base, saida = sys.argv[1], sys.argv[2]
r = subprocess.run(['ffmpeg', '-v', 'error', '-i', base, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True)
x = np.frombuffer(r.stdout, np.float32)
m = WhisperModel('large-v3-turbo', device='cuda', compute_type='float16')
ctx = 'Leadrive, rastreamento de leads no WhatsApp, CAPI, Meta, Google, ROAS, CRM, criativo, campanha, lead qualificado.'
seg, _ = m.transcribe(x, language='pt', word_timestamps=True, vad_filter=False, condition_on_previous_text=False, initial_prompt=ctx)
W = [[round(w.start, 2), round(w.end, 2), w.word.strip()] for s in seg for w in s.words if w.word.strip()]
# nomes
out = []
for i, w in enumerate(W):
    t = w[2]
    if re.fullmatch(r'(?i)lead', t) and i + 1 < len(W) and re.match(r'(?i)drive', W[i + 1][2]):
        W[i + 1][2] = 'Leadrive' + W[i + 1][2][5:]; W[i + 1][0] = w[0]; continue
    t = re.sub(r'(?i)^(lea?drive|lidrive|ledrive|leadrive|lead-drive)', 'Leadrive', t)
    t = re.sub(r'^(CAP|Cap|cap|CAPE|Kappa|capi)(?=[,.]?$)', 'CAPI', t)
    t = re.sub(r'(?i)^receio', 'rastreio', t); t = re.sub(r'^(ruas|roas)', 'ROAS', t, flags=re.I)
    t = re.sub(r'^(K|capa|Capa)(?=[,.]?$)', 'CAPI', t); t = re.sub(r'^verbo(?=[,.]?$)', 'verba', t); t = re.sub(r'^(FI|FIIs|fiz|fique)(?=[,.]?$)', 'fit', t)
    t = re.sub(r'^look(?=[,.]?$)', 'loop', t); t = re.sub(r'^tensão', 'intenção', t); t = re.sub(r'^rosto', 'ROAS', t); t = re.sub(r'^Mesa(?=[,.]?$)', 'Meta', t)
    out.append([w[0], w[1], t])
print(' '.join(w[2] for w in out))
for i, (a, b, t) in enumerate(out):
    if b - a > 1.0: print(f'  [{a:6.2f}] palavra esticada ({b - a:.1f} s): {t}')
    if i and a - out[i - 1][1] > 0.5 and not re.search(r'[.?!]$', out[i - 1][2]): print(f'  [{a:6.2f}] buraco de {a - out[i - 1][1]:.1f} s no meio da frase')
open(saida, 'w', encoding='utf8').write('window.PAL = ' + json.dumps(out, ensure_ascii=False) + ';')
