"""Aplica um corte novo da base a um áudio feito na linha antiga (SFX): junta os pedaços da linha antiga que continuam no vídeo.
uso: python warp_sfx.py <entrada.wav> <saida.wav> '<velho json>' '<novo json>'   (listas [início, entrada, saída] do V1)"""
import sys, json, subprocess
ent, sai, velho, novo = sys.argv[1], sys.argv[2], json.loads(sys.argv[3]), json.loads(sys.argv[4])
def antigo(o):
    for i, e, s in velho:
        if e - 1e-3 <= o <= s + 1e-3: return i + (o - e)
    raise SystemExit(f'{o} fora da linha antiga')
f, rot = [], []
for k, (i, e, s) in enumerate(novo):
    a, b = antigo(e), antigo(s)
    f.append(f'[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st={b - a - 0.005:.3f}:d=0.005[p{k}]'); rot.append(f'[p{k}]')
fc = ';'.join(f) + ';' + ''.join(rot) + f'concat=n={len(novo)}:v=0:a=1[o]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', ent, '-filter_complex', fc, '-map', '[o]', sai], check=True)
print(sai, 'ok')
