"""Transcrição com tempo por palavra (faster-whisper).
   python transcrever.py <audio.wav> <saida.json> [contexto]
   Imprime "@@PROG <pct>" para a barra de progresso do app."""
import json, os, sys, glob

# as DLLs da CUDA moram dentro do venv
_nv = os.path.join(os.path.dirname(sys.executable), "..", "Lib", "site-packages", "nvidia")
for b in glob.glob(os.path.join(_nv, "*", "bin")):
    b = os.path.abspath(b)
    try: os.add_dll_directory(b)
    except Exception: pass
    os.environ["PATH"] = b + os.pathsep + os.environ["PATH"]

from faster_whisper import WhisperModel

wav, saida = sys.argv[1], sys.argv[2]
ctx = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else \
    "Vídeo da Blue Ocean, agência de marketing para SaaS: recorrência, MRR, leads, funil, criativos, vendas."

try:
    m = WhisperModel("large-v3-turbo", device="cuda", compute_type="float16")
except Exception as e:
    print("sem GPU (%s), usando o processador" % str(e)[:80], flush=True)
    m = WhisperModel("small", device="cpu", compute_type="int8")

segs, info = m.transcribe(wav, language="pt", word_timestamps=True, beam_size=5,
                          vad_filter=True, vad_parameters=dict(min_silence_duration_ms=400),
                          condition_on_previous_text=False, initial_prompt=ctx)
pal = []
for s in segs:
    for w in (s.words or []):
        pal.append({"t": w.word.strip(), "i": round(w.start, 3), "f": round(w.end, 3), "p": round(w.probability, 3)})
    if info.duration:
        print("@@PROG %d" % min(100, int(s.end / info.duration * 100)), flush=True)
    print("[%6.2f] %s" % (s.start, s.text.strip()), flush=True)
json.dump([p for p in pal if p["t"]], open(saida, "w", encoding="utf8"), ensure_ascii=False)
print("palavras: %d" % len(pal), flush=True)
