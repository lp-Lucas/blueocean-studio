"""SFX sintetizados no estilo Apple (macios, com ar e brilho) para os banners de motion.
Cada som é uma função que devolve um array estéreo (n, 2) a 48 kHz; a Mixagem cola os sons nos tempos
e passa um reverb leve no fim. Só numpy (sem banco de sons: nada de licença, e o tempo bate no quadro).

uso nos roteiros (banners/*-sfx.py):
    from sfx import *
    m = Mixagem(13.5)
    m.add(1.0, whoosh(0.8, 300, 3000), ganho=0.5)
    m.salvar('saida.wav', lufs=-18)
"""
import numpy as np
import subprocess, os, tempfile, wave

SR = 48000
_rng = np.random.default_rng(7)


def _t(d):
    return np.arange(int(d * SR)) / SR


def _st(m, pan=0.0):
    """mono → estéreo com pan (-1 esquerda, 1 direita)"""
    a = (pan + 1) * np.pi / 4
    return np.stack([m * np.cos(a), m * np.sin(a)], axis=1) * np.sqrt(2)


def _passa_banda(x, fc, q=1.2):
    """filtro de estado variável (fc pode variar no tempo: array do mesmo tamanho de x)"""
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    f = 2 * np.sin(np.pi * np.clip(fc, 20, SR / 6) / SR)
    d = 1 / q
    lp = bp = 0.0
    out = np.empty_like(x)
    for i in range(len(x)):
        hp = x[i] - lp - d * bp
        bp += f[i] * hp
        lp += f[i] * bp
        out[i] = bp
    return out


def _passa_baixa(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    out = np.empty_like(x); y = 0.0
    for i in range(len(x)):
        y = (1 - a) * x[i] + a * y; out[i] = y
    return out


def _env(n, ataque, queda, forma=2.0):
    """envelope que sobe em `ataque` (fração) e cai até o fim"""
    x = np.linspace(0, 1, n)
    a = max(ataque, 1e-4)
    up = np.clip(x / a, 0, 1) ** forma
    down = np.clip((1 - x) / max(1 - a, 1e-4), 0, 1) ** queda
    return up * down


# ── sons ──────────────────────────────────────────────────────────────────────

def whoosh(dur, f0, f1, pico=0.6, q=1.4, pan=(0.0, 0.0), corpo=0.0):
    """ar passando: ruído filtrado com a frequência indo de f0 a f1 (sobe = movimento para cima/para dentro)"""
    n = int(dur * SR)
    x = _rng.standard_normal(n)
    k = np.linspace(0, 1, n)
    fc = f0 * (f1 / f0) ** k
    y = _passa_banda(x, fc, q) * _env(n, pico, 1.6, 2.2)
    if corpo:
        y += corpo * np.sin(2 * np.pi * np.cumsum(fc * 0.08) / SR) * _env(n, pico, 2.0)
    y /= np.max(np.abs(y)) + 1e-9
    p = np.linspace(pan[0], pan[1], n)
    a = (p + 1) * np.pi / 4
    return np.stack([y * np.cos(a), y * np.sin(a)], axis=1) * np.sqrt(2)


def ar(dur, fc=2500, pico=0.5):
    """sopro curto e macio (entrada de palavra/linha)"""
    return whoosh(dur, fc * 0.6, fc * 1.4, pico=pico, q=0.9)


def tick(freq=2400, dur=0.035, pan=0.0):
    """toque tátil (taptic): senoide curtíssima com estalo"""
    t = _t(dur)
    y = np.sin(2 * np.pi * freq * t) * np.exp(-t * 140)
    y[: int(0.0015 * SR)] += _rng.standard_normal(int(0.0015 * SR)) * 0.3
    return _st(y / np.max(np.abs(y)), pan)


def tecla(var=0.0, pan=0.0):
    """tecla do teclado da Apple (o "toc" do iPhone/Mac): estalo curto + ressonância de plástico + corpo leve.
    var (-1..1) muda um pouco o tom, como teclas diferentes."""
    t = _t(0.09)
    k = 1 + 0.045 * var
    clique = _passa_banda(_rng.standard_normal(len(t)), 3800 * k, 1.6) * np.exp(-t * 900)
    resso = np.sin(2 * np.pi * 1850 * k * t + 0.3) * np.exp(-t * 170) * 0.55
    resso += np.sin(2 * np.pi * 2950 * k * t) * np.exp(-t * 260) * 0.25
    corpo = np.sin(2 * np.pi * np.cumsum(330 * k * (1 + 0.5 * np.exp(-t * 200))) / SR) * np.exp(-t * 110) * 0.6
    y = clique / (np.max(np.abs(clique)) + 1e-9) * 0.8 + resso + corpo
    y *= 1 - np.exp(-t * 6000)
    return _st(y / np.max(np.abs(y)), pan)


def digitar(m, t0, n, atraso, ganho=0.22, adianta=0.06, semente=0):
    """uma tecla por palavra que sobe (M.entrar: palavra i começa em t0 + i*atraso)"""
    r = np.random.default_rng(semente)
    for i in range(n):
        m.add(t0 + i * atraso + adianta + r.uniform(-0.004, 0.004),
              tecla(r.uniform(-1, 1), pan=r.uniform(-0.25, 0.25)),
              ganho * 10 ** (r.uniform(-1.5, 1.0) / 20), reverb=False, nome=f'tecla {i + 1}')


def vidro(freq=1320, dur=1.2, brilho=1.0, pan=0.0):
    """toque de vidro / sino leve (parciais inarmônicas)"""
    t = _t(dur)
    parc = [(1.0, 1.0, 5.0), (2.756, 0.45 * brilho, 9.0), (5.404, 0.22 * brilho, 15.0), (8.93, 0.08 * brilho, 22.0)]
    y = sum(a * np.sin(2 * np.pi * freq * r * t + r) * np.exp(-t * dec) for r, a, dec in parc)
    y *= 1 - np.exp(-t * 900)
    y /= np.max(np.abs(y))
    # leve desafinação entre os canais = largura
    t2 = t * 1.0015
    y2 = sum(a * np.sin(2 * np.pi * freq * r * t2 + r) * np.exp(-t * dec) for r, a, dec in parc) * (1 - np.exp(-t * 900))
    y2 /= np.max(np.abs(y2))
    a = (pan + 1) * np.pi / 4
    return np.stack([y * np.cos(a) * 1.2, y2 * np.sin(a) * 1.2], axis=1)


def pop(freq=520, dur=0.35, grave=0.8, pan=0.0):
    """bolha/pop macio (elemento que surge com mola): pitch cai rápido + grave de corpo"""
    t = _t(dur)
    f = freq * (1 + 1.4 * np.exp(-t * 60))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 16)
    y += grave * np.sin(2 * np.pi * np.cumsum(90 * (1 + 0.8 * np.exp(-t * 30))) / SR) * np.exp(-t * 11)
    y *= 1 - np.exp(-t * 2500)
    return _st(y / np.max(np.abs(y)), pan)


def baque(dur=0.5, freq=60):
    """grave suave de chegada (sub)"""
    t = _t(dur)
    y = np.sin(2 * np.pi * np.cumsum(freq * (1 + 1.2 * np.exp(-t * 25))) / SR) * np.exp(-t * 7) * (1 - np.exp(-t * 600))
    return _st(y / np.max(np.abs(y)))


def brilho(dur=0.9, pan=(-0.6, 0.6)):
    """reflexo passando no botão: ruído agudo varrendo + um fio de senoide"""
    w = whoosh(dur, 4500, 9500, pico=0.45, q=3.0, pan=pan)
    t = _t(dur)
    s = np.sin(2 * np.pi * (5200 + 2600 * t / dur) * t) * _env(len(t), 0.45, 2) * 0.25
    return w + _st(s)


def zip_linha(dur, f0=420, f1=1400, curva=None):
    """linha se desenhando: tom macio + ar, a altura acompanha o progresso (curva: array 0..1)"""
    n = int(dur * SR)
    k = np.linspace(0, 1, n) if curva is None else np.interp(np.linspace(0, 1, n), np.linspace(0, 1, len(curva)), curva)
    f = f0 * (f1 / f0) ** k
    vel = np.gradient(k); vel = vel / (vel.max() + 1e-9)
    ton = (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(2 * np.pi * np.cumsum(f * 2.01) / SR))
    ton = _passa_baixa(ton, 3000)
    ruido = _passa_banda(_rng.standard_normal(n), f * 3, 1.5)
    ruido /= np.max(np.abs(ruido)) + 1e-9
    y = (0.55 * ton + 0.45 * ruido) * (0.15 + 0.85 * vel) * _env(n, 0.08, 0.6, 1.0)
    return _st(y / np.max(np.abs(y)))


def acorde_sucesso(base=880, pan=0.0):
    """sucesso: duas notas de vidro subindo (quinta → oitava)"""
    a = vidro(base, 1.4, 0.8, pan)
    b = vidro(base * 1.5, 1.6, 0.8, pan)
    out = np.zeros((len(b) + int(0.09 * SR), 2))
    out[: len(a)] += a * 0.7
    out[int(0.09 * SR): int(0.09 * SR) + len(b)] += b
    return out


def base_ambiente(dur, notas=(146.83, 220.0, 277.18, 329.63), entra=1.2, sai=1.5):
    """cama de fundo (o pano de seda se mexendo): acorde aberto bem baixo + ar filtrado ondulando"""
    t = _t(dur)
    y = np.zeros_like(t)
    for i, f in enumerate(notas):
        lfo = 1 + 0.003 * np.sin(2 * np.pi * (0.13 + 0.05 * i) * t)
        y += np.sin(2 * np.pi * np.cumsum(f * lfo) / SR + i) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t + i * 1.7)) / (1 + i * 0.4)
    ar_ = _passa_banda(_rng.standard_normal(len(t)), 900 + 500 * np.sin(2 * np.pi * 0.09 * t), 0.7)
    ar_ /= np.max(np.abs(ar_))
    y = y / np.max(np.abs(y)) * 0.75 + ar_ * 0.25
    env = np.clip(t / entra, 0, 1) ** 2 * np.clip((dur - t) / sai, 0, 1) ** 1.5
    l = y * env
    r = np.roll(y, int(0.011 * SR)) * env
    return np.stack([l, r], axis=1)


# ── mixagem ───────────────────────────────────────────────────────────────────

def _reverb(x, dur=2.2, umido=0.22):
    n = int(dur * SR)
    t = np.arange(n) / SR
    ir = np.stack([_rng.standard_normal(n), _rng.standard_normal(n)], 1) * np.exp(-t * 6.9 / dur)[:, None]
    ir[:, 0] = _passa_baixa(ir[:, 0], 6000); ir[:, 1] = _passa_baixa(ir[:, 1], 6000)
    ir /= np.sqrt((ir ** 2).sum(0))
    L = len(x) + n
    N = 1 << (L - 1).bit_length()
    # só médios e agudos vão para o reverb (grave com cauda longa vira ronco no celular)
    env = np.stack([x[:, c] - _passa_baixa(_passa_baixa(x[:, c], 350), 350) for c in range(2)], 1)
    out = np.stack([np.fft.irfft(np.fft.rfft(env[:, c], N) * np.fft.rfft(ir[:, c], N), N)[: len(x)] for c in range(2)], 1)
    return x * (1 - umido) + out * umido * 2.2


class Mixagem:
    def __init__(self, dur):
        self.dur = dur
        self.seco = np.zeros((int(dur * SR) + 1, 2))   # vai para o reverb
        self.cama = np.zeros_like(self.seco)           # fundo, sem reverb extra
        self.lista = []

    def add(self, t, som, ganho=1.0, cama=False, nome='', reverb=True):
        i = int(round(t * SR))
        if i >= len(self.seco): return
        dst = self.cama if (cama or not reverb) else self.seco
        n = min(len(som), len(dst) - i)
        dst[i: i + n] += som[:n] * ganho
        self.lista.append((round(t, 2), nome))

    def salvar(self, caminho, lufs=-18):
        x = _reverb(self.seco) + self.cama
        # fade curtinho no fim para não estalar
        f = int(0.3 * SR); x[-f:] *= (np.linspace(1, 0, f) ** 1.5)[:, None]
        x /= np.max(np.abs(x)) + 1e-9
        x *= 0.89
        tmp = tempfile.mktemp(suffix='.wav')
        with wave.open(tmp, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
        # volume final por loudness (dois passos do loudnorm = valor exato, sem compressão)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'loudnorm=I={lufs}:TP=-1.5:LRA=20:linear=true',
                        '-ar', str(SR), caminho], check=True)
        os.remove(tmp)
        return self.lista
