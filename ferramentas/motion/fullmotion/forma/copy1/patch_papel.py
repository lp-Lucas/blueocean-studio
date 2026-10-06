"""Troca a abertura plana da Copy 1 (reprovada: "cara de IA") pela mesa de papel aprovada na Copy 3, retemporizada."""
import os, re
f = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'monta.py'); s = open(f, encoding='utf8').read()
def cut(a, b, novo=''):
    global s
    i = s.index(a); j = s.index(b, i); s = s[:i] + novo + s[j:]
def rep(a, b):
    global s
    assert a in s, a[:70]; s = s.replace(a, b, 1)

# HTML: sem a abertura plana (#k1); o resto das peças entra depois da mesa
cut('HTML = """<div id="k1">', '<div class="p k1chip" id="k1sem"', 'HTML = """')
# SETUP: tira calendário, bolinhas e selo da abertura plana
cut("$('#k1pub').innerHTML", "$('#k1semX')", '')
cut("{ const g = $('#k1g');", "const K1MATS", '')
# JS: tira a animação da abertura plana
cut('  /* ── Copy 1 · abertura', '  /* ── Copy 1 · inserções (topo) ── */', '')

MESA = '''  /* ── Copy 1 · abertura (0 → 12,9): mesa de estudo — edital, post-it "para tudo", 10 de janeiro, planner vazio ── */
  {
    const sobe = pr(T, 0.98, 0.62, E.cubicOut), desce = pr(T, 12.4, 0.5, E.cubicIn);
    const yA = L(1990, 0, sobe);
    $('#folhaA').style.transform = `translateY(${yA}px) rotate(${L(3.2, 0, sobe)}deg)`;
    $('#mesa').style.transform = `translateY(${desce * 2080}px) rotate(${desce * 2.5}deg)`;
    $('#mesa').style.display = T < 0.9 || T > 13.0 ? 'none' : 'block';
    $('#vinheta').style.opacity = T < 0.9 || T > 13.0 ? 0 : Math.min(sobe, 1 - desce);
    window.PAPEL_TOPO = Math.max(-20 + yA, desce * 2080 - 20);
    // câmera: quadros-chave [t, escala, foco y] — título → parágrafo do "torna pública" → item do 10 de janeiro → abre
    const KF = [[1.5, 1, 420], [2.8, 1.12, 420], [5.9, 1.12, 420], [6.6, 1.1, 660], [7.9, 1.1, 660], [8.4, 1.1, 1160], [9.2, 1.1, 1160], [9.8, 1, 900]];
    let cs = KF[0][1], cy = KF[0][2];
    for (let i = 1; i < KF.length; i++) { const p = pr(T, KF[i - 1][0], KF[i][0] - KF[i - 1][0], E.cubicInOut); if (T >= KF[i - 1][0]) { cs = L(KF[i - 1][1], KF[i][1], p); cy = L(KF[i - 1][2], KF[i][2], p); } }
    $('#cam').style.transformOrigin = `540px ${cy}px`; $('#cam').style.transform = `scale(${cs})`;
    const mt = (id, t0, d) => { $('#' + id).style.backgroundSize = `${pr(T, t0, d, E.cubicInOut) * 100}% 78%`; };
    mt('hl1a', 1.72, 0.55); mt('hl1b', 2.3, 0.35); mt('hl2', 7.2, 0.6); mt('hl3', 8.62, 0.4);
    // post-it "para tudo!" bate no "para tudo"; sai descolando antes do "edital"
    const pp = pr(T, 3.5, 0.3, E.cubicOut), slap = T > 3.8 ? Math.exp(-14 * (T - 3.8)) * Math.sin((T - 3.8) * 30) : 0, sai = pr(T, 5.95, 0.4, E.cubicIn);
    $('#postit').style.opacity = T < 3.5 ? 0 : C(pp * 2) * (1 - sai);
    $('#postit').style.transform = `translate(${sai * 260}px, ${(1 - pp) * -70 - sai * 220}px) rotate(${L(9, 3.5, pp) + slap * 1.2 + sai * 14}deg) scale(${L(1.14, 1, pp)})`;
    const escreve = (id, t0, d) => { $('#' + id).style.clipPath = `inset(-20px ${(1 - pr(T, t0, d, E.linear)) * 100}% -20px -10px)`; };
    escreve('pt1', 3.8, 0.4); escreve('pt2', 4.6, 0.55);
    const tinta = (id, t0, d) => { const p = $('#' + id), Lp = p._L || (p._L = p.getTotalLength()); p.style.strokeDasharray = Lp; p.style.strokeDashoffset = Lp * (1 - pr(T, t0, d, E.cubicInOut)); };
    tinta('rs1', 99, 0.1); tinta('rs2', 99, 0.1);
    // planner vazio desliza por cima no "nesse momento"; a caneta desenha o "?" no "mesmo erro"
    const pb = pr(T, 9.3, 0.6, E.cubicOut);
    $('#folhaB').style.transform = `translateX(${L(1200, 0, pb)}px) rotate(${L(5, -1.4, pb)}deg)`;
    $('#folhaB').style.visibility = T < 9.25 ? 'hidden' : 'visible';
    tinta('interroga', 11.6, 0.5); tinta('sublinha', 12.05, 0.22);
  }
'''
rep("corta('  /* FS1 · mesa de estudo', '  /* FS2 · Espaço do Aluno', CSS)", "troca('  /* FS2 · Espaço do Aluno', CSS + '  /* FS2 · Espaço do Aluno')")
rep("corta('<div id=\"mesa\">', '<div id=\"vinheta\"></div>\\n', HTML, incl_b=True)", "troca('<div id=\"vinheta\"></div>\\n', '<div id=\"vinheta\"></div>\\n' + HTML)")
rep("corta('  /* ── FS1 · 0 → 7,52: mesa de estudo ── */', '  /* ── inserções · 7,52', '')", "corta('  /* ── FS1 · 0 → 7,52: mesa de estudo ── */', '  /* ── inserções · 7,52', MESA)")
rep("corta('\\n// grade da semana do planner (vazia)', 'Y0 + RH * j }); }', SETUP, incl_b=True)", "troca('Y0 + RH * j }); }', 'Y0 + RH * j }); }' + SETUP)")
rep("troca('const OCULTA = [[0.86, 1.32], [35.45, 38.62]];', 'const OCULTA = [[0.84, 1.3]];')", "troca('const OCULTA = [[0.86, 1.32], [35.45, 38.62]];', 'const OCULTA = [[1.0, 1.5]];')")
rep("troca('<script src=\"palavras.js\"></script>'",
    "troca('<p>1.2. A prova objetiva conterá', '<p>1.3. A prova objetiva será aplicada no dia <span class=\"hl\" id=\"hl3\">10 de janeiro</span>, em todo o território nacional.</p>\\n      <p>1.2. A prova objetiva conterá')\n"
    "troca('<div class=\"ln\" id=\"pt1\" style=\"top:70px\">começo amanhã</div>', '<div class=\"ln\" id=\"pt1\" style=\"top:110px;font-size:96px\">para tudo!</div>')\n"
    "troca('<div class=\"ln\" id=\"pt2\" style=\"top:190px\">segunda</div>', '<div class=\"ln\" id=\"pt2\" style=\"top:260px;color:#C9372A\">presta atenção</div>')\n"
    "troca('<div class=\"ln\" id=\"pt3\" style=\"top:310px;color:#C9372A\">depois...</div>', '')\n"
    "troca('<script src=\"palavras.js\"></script>'")
s = s.replace("ANC = [", "MESA = '''" + MESA.replace("'''", '"""') + "'''\nANC = [", 1)
open(f, 'w', encoding='utf8').write(s)
print('ok')
