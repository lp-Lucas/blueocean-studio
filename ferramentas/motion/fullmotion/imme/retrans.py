import sys
from faster_whisper import WhisperModel
import numpy as np, wave
w=wave.open(sys.argv[1]); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
m=WhisperModel('large-v3',device='cpu',compute_type='int8')
for r in sys.argv[2:]:
    a,b=map(float,r.split('-'))
    seg,_=m.transcribe(x[int(a*16000):int(b*16000)],language='pt',word_timestamps=True,vad_filter=False)
    print(f'== {a}-{b}')
    for s in seg: print(' '.join(f'{wd.word.strip()}[{a+wd.start:.2f}-{a+wd.end:.2f}]' for wd in s.words))
