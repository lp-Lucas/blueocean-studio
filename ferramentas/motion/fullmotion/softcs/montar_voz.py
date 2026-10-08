"""Soft CS: um áudio (ElevenLabs) com as 6 copies em sequência → uma voz por copy, com respiros SÓ depois do ponto final
(receita 13: nunca cortar dentro da frase). Frases medidas no silencedetect (−45 dB / 0,1 s) do áudio original.
Gera midia/softcs-cN-voz.wav (−16 LUFS, pico −2 dBTP, voz de TTS já limpa: só passa-alta + nível) e cN/palavras.js (legenda).
uso: python -I -X utf8 montar_voz.py <projeto> [N …]"""
import sys, os, json, subprocess, re
proj = sys.argv[1]; so = sys.argv[2:]
AQUI = os.path.dirname(os.path.abspath(__file__))
WAV = os.path.join(proj, 'cache', 'm1-48k.wav')
T = [w for w in json.load(open(os.path.join(proj, 'transcricoes', 'm1.json'), encoding='utf8')) if not w.get('oculta')]
# (início da voz, fim da voz, respiro depois) — no áudio original
COPIES = {
  1: [(0.00, 1.71, 0.35), (2.00, 3.98, 0.50), (4.57, 6.91, 1.30), (7.27, 10.18, 1.20), (10.50, 11.85, 0.40), (12.13, 14.01, 0.60)],
  2: [(14.29, 16.80, 1.40), (17.18, 19.22, 0.90), (19.51, 22.24, 0.90), (22.50, 24.08, 0.60)],
  3: [(24.38, 27.19, 0.50), (27.57, 28.59, 0.45), (28.80, 29.97, 0.45), (30.24, 31.66, 0.45), (31.95, 33.58, 0.70), (33.86, 38.49, 0.60), (38.74, 40.31, 0.60)],
  4: [(40.61, 42.89, 2.60), (43.20, 46.14, 0.90), (46.40, 48.91, 0.60)],
  5: [(49.16, 51.53, 2.60), (51.74, 54.40, 1.40), (54.64, 56.62, 0.60)],
  6: [(56.88, 58.00, 0.35), (58.25, 59.91, 0.50), (60.19, 63.62, 0.90), (63.81, 67.72, 0.50), (67.96, 69.09, 0.60)],
}
PRE, POS = 0.05, 0.08   # folga antes da 1ª sílaba / depois da cauda
TODAS = [(n, k, a, b) for n, fr in COPIES.items() for k, (a, b, _) in enumerate(fr)]
dist = lambda x, a, b: 0 if a <= x <= b else min(abs(x - a), abs(x - b))
DONO = {id(w): min(TODAS, key=lambda f: dist((w['i'] + w['f']) / 2, f[2], f[3]))[:2] for w in T}
for n, frases in COPIES.items():
    if so and str(n) not in so: continue
    filt, mix, pal, lin, tf = [], [], [], 0.0, []
    for k, (a, b, gap) in enumerate(frases):
        a0, b0 = max(0, a - PRE), b + POS
        d = b0 - a0
        filt.append(f'[0:a]atrim={a0:.3f}:{b0:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={d - 0.015:.3f}:d=0.015,adelay={int(lin * 1000)}:all=1[s{k}]')
        mix.append(f'[s{k}]')
        for w in T:   # a palavra é da frase mais perto do meio dela (o Whisper marca o início antes da voz)
            if DONO[id(w)] == (n, k):
                pal.append([round(lin + max(w['i'], a) - a0, 2), round(lin + min(w['f'], b0) - a0, 2), w['t']])
        tf.append(round(lin + (a - a0), 2))
        lin += d + (gap if k < len(frases) - 1 else 0)
    dur = round(lin + gap, 2)
    # "substituí -lo" vem em dois pedaços no Whisper
    j = []
    for w in pal:
        if j and w[2].startswith('-'): j[-1] = [j[-1][0], w[1], j[-1][2] + w[2]]
        else: j.append(w)
    pal = [[a, b, t.replace('SoftCS', 'Soft CS')] for a, b, t in j]
    bruto = os.path.join(proj, 'cache', f'softcs-c{n}-bruto.wav')
    fc = ';'.join(filt) + ';' + ''.join(mix) + f'amix=inputs={len(mix)}:normalize=0,apad=whole_dur={dur}[o]'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', WAV, '-filter_complex', fc, '-map', '[o]', '-ar', '48000', '-ac', '1', bruto], check=True)
    # nível: passa-alta + loudnorm 2 passadas (−16 LUFS) + limitador calmo superamostrado (pico entre amostras)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', bruto, '-af', 'highpass=f=70,loudnorm=I=-16:TP=-2:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    m = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr).group(0))
    ln = f"loudnorm=I=-16:TP=-2:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    saida = os.path.join(proj, 'midia', f'softcs-c{n}-voz.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', bruto, '-af', f'highpass=f=70,{ln},aresample=192000,alimiter=limit=0.79:attack=5:release=80:level=false,aresample=48000',
                    '-ar', '48000', '-ac', '1', saida], check=True)
    os.makedirs(os.path.join(AQUI, f'c{n}'), exist_ok=True)
    open(os.path.join(AQUI, f'c{n}', 'palavras.js'), 'w', encoding='utf8').write('window.PAL = ' + json.dumps(pal, ensure_ascii=False) + ';')
    print(f'== copy {n}: {dur:.2f} s · frases começam em {tf}')
    print('   ' + ' '.join(f'{t}[{a:.2f}]' for a, b, t in pal))
