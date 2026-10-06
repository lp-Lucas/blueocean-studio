"""Voz clara e firme, sem eco nem ruído de sala (aprovado 06/10/2026, Neosync; segue a receita 11).
Ordem: passa-alta + redução LEVE de ruído → dereverb suave (2 passadas) → EQ (corpo + brilho) → de-esser leve →
ganho linear até −16 LUFS → limitador calmo superamostrado. SEM compressor depois do dereverb (levanta a cauda).
uso: python voz_clara.py <entrada (vídeo ou áudio)> <saida.wav> [--eq "<cadeia ffmpeg>"]"""
import sys, os, json, subprocess, tempfile
a = sys.argv[1:]; ent, sai = a[0], a[1]
EQ = a[a.index('--eq') + 1] if '--eq' in a else (
    'lowshelf=f=220:g=5,equalizer=f=500:t=q:w=1.0:g=-2,equalizer=f=1000:t=q:w=1.2:g=-1,equalizer=f=3500:t=q:w=1.0:g=-1,'
    'highshelf=f=5500:g=9,equalizer=f=7500:t=q:w=1.0:g=4,highshelf=f=11000:g=-3,deesser=i=0.15:m=0.4:f=0.6')
D = os.path.dirname(os.path.abspath(__file__)); tmp = tempfile.mkdtemp()
p = lambda n: os.path.join(tmp, n)
ff = lambda *x: subprocess.run(['ffmpeg', '-v', 'error', '-y', *x], check=True)
ff('-i', ent, '-vn', '-ac', '1', '-ar', '48000', '-af', 'highpass=f=70,afftdn=nr=10:nf=-50', p('a.wav'))
dr = ['--forca', '1.5', '--piso', '-18', '--suave', '0.8', '--larg', '11']
subprocess.run([sys.executable, os.path.join(D, 'dereverb.py'), p('a.wav'), p('b.wav'), '--alvo', '0.15', *dr], check=True, capture_output=True)
subprocess.run([sys.executable, os.path.join(D, 'dereverb.py'), p('b.wav'), p('c.wav'), '--rt60', '0.65', '--n', '4096', '--ate', '600', '--alvo', '0.18', *dr], check=True, capture_output=True)
ff('-i', p('c.wav'), '-af', EQ, p('d.wav'))
r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', p('d.wav'), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True, errors='ignore').stderr
I = float(r[r.rindex('I:'):].split()[1]); g = -16.0 - I + 0.8   # o limitador come ~0,8 dB
ff('-i', p('d.wav'), '-af', f'volume={g:.2f}dB,aresample=192000,alimiter=limit=0.79:attack=5:release=80:level=false,aresample=48000', sai)
r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', sai, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True, errors='ignore').stderr
print(os.path.basename(sai), r[r.rindex('I:'):].split()[1], 'LUFS · pico', r[r.rindex('Peak:'):].split()[1], 'dBFS')
