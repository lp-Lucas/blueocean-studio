"""Newmo: passa todas as telas para o tema escuro do site (pedido da pessoa, 06/10/2026:
"PRETO predominante, background etc., o verde e o branco em alguns pontos"). Rodar uma vez, na pasta newmo/."""
import shutil

def troca(p, R, todos=False):
    s = open(p, encoding='utf8').read()
    for a, b in R:
        n = s.count(a)
        assert n >= 1 and (todos or n == 1), (p, a[:70], n)
        s = s.replace(a, b)
    open(p, 'w', encoding='utf8').write(s)

shutil.copy('base.css', 'base-claro.css')
troca('base.css', [
 ("""/* identidade Newmo (newmo.com.br): verde #00C767 (destaque/CTA), tinta #1E2423, cinza #5C685D, verde-claro #DEFFDC/#E5F9F1;
   Poppins nos títulos, Inter no corpo (como no site); botão em pílula verde com texto escuro em negrito + seta (o "Agendar demonstração" do site);
   painel do produto claro (branco, linhas finas, barras verdes) como no print do site. Base copiada da SmartRota (receita 15). */""",
  """/* identidade Newmo (newmo.com.br) — TEMA ESCURO como o site (pedido da pessoa, 06/10/2026: "preto predominante, verde e branco em alguns pontos"):
   fundo preto #000, cartões grafite #111614 (cards do site: rgba(30,36,35,.6) sobre preto) com borda #2A3230, títulos no verde-claro #DEFFDC,
   texto branco, secundário #8C958D, destaque/CTA verde #00C767 com texto escuro; Poppins nos títulos, Inter no corpo; WhatsApp no modo escuro.
   A versão clara anterior está em base-claro.css. Base copiada da SmartRota (receita 15). */"""),
 (""":root { --tinta: #1E2423; --cinza: #5C685D; --linha: #E1E5E1; --claro: #F4F5F7; --dest: #00C767; --destE: #00A956; --destc: #E5F9F1;
        --verde: #15803D; --verdec: #E7F5EC; --verm: #C9372A; --vermc: #FCEBE9; --wa: #25D366; }""",
  """:root { --tinta: #F3F8F3; --titulo: #DEFFDC; --cinza: #8C958D; --linha: #2A3230; --claro: #1E2423; --card: #111614; --dest: #00C767; --destE: #00A956;
        --destc: rgba(0,199,103,.16); --verde: #33D285; --verdec: rgba(0,199,103,.16); --verm: #E5483A; --vermt: #FF7A6E; --vermc: rgba(229,72,58,.18); --wa: #25D366; }"""),
 (".card { background: #fff; border-radius: 22px; box-shadow: 0 1px 0 rgba(30,36,35,.04), 0 18px 44px rgba(0,0,0,.28); }",
  ".card { background: var(--card); border-radius: 22px; box-shadow: inset 0 0 0 1.5px var(--linha), 0 18px 44px rgba(0,0,0,.45); }\n.fld { background: #0A0E0D; }"),
 ("border-radius: 999px; background: #fff; font: 600 33px 'Inter';", "border-radius: 999px; background: var(--card); font: 600 33px 'Inter';"),
 (".pill.cinza { background: var(--claro); color: #47514A; }", ".pill.cinza { background: var(--claro); color: #B8C2BA; }"),
 (".pill.verm { background: var(--vermc); color: var(--verm); }", ".pill.verm { background: var(--vermc); color: var(--vermt); }"),
 (".pill.ia { background: var(--tinta); color: #DEFFDC; }", ".pill.ia { background: var(--titulo); color: #0B1210; }"),
 (".cabI { display: flex; align-items: center; gap: 14px; font: 600 31px 'Poppins';", ".cabI { display: flex; align-items: center; gap: 14px; color: var(--titulo); font: 600 31px 'Poppins';"),
 ("border-bottom: 1.5px solid var(--linha); background: #fff; position: relative; z-index: 2; }", "border-bottom: 1.5px solid var(--linha); background: var(--card); position: relative; z-index: 2; }"),
 (".app .bar .nm { font: 600 30px 'Poppins';", ".app .bar .nm { color: var(--titulo); font: 600 30px 'Poppins';"),
 ("place-items: center; font: 600 21px 'Inter'; color: #47514A; }", "place-items: center; font: 600 21px 'Inter'; color: #B8C2BA; }"),
 (".app .corpo { position: relative; padding: 30px 34px 34px; background: #fff; }", ".app .corpo { position: relative; padding: 30px 34px 34px; background: var(--card); }"),
 (".app h3 { font: 600 36px 'Poppins';", ".app h3 { color: var(--titulo); font: 600 36px 'Poppins';"),
 ("border-radius: 50%; background: #DFE5E7; color: #54656F;", "border-radius: 50%; background: var(--claro); color: var(--titulo);"),
 (".av2.ia { background: var(--tinta); }", ".av2.ia { background: #000; }"),
 (".wa .hd { height: 108px; background: #008069;", ".wa .hd { height: 108px; background: #202C33;"),
 ("bottom: 0; background: #EFEAE2; overflow: hidden; }", "bottom: 0; background: #0B141A; overflow: hidden; }"),
 ("font: 500 27px/1.32 'Inter'; color: #111B21; position: relative; box-shadow: 0 1px 1.5px rgba(11,20,26,.14);",
  "font: 500 27px/1.32 'Inter'; color: #E9EDEF; position: relative; box-shadow: 0 1px 1.5px rgba(0,0,0,.3);"),
 (".msg.dia { align-self: center; background: #fff; padding: 6px 18px; font: 600 20px 'Inter'; color: #54656F;",
  ".msg.dia { align-self: center; background: #182229; padding: 6px 18px; font: 600 20px 'Inter'; color: #8696A0;"),
 (".msg.sis { align-self: center; background: #FFF3C4; padding: 8px 20px; font: 600 22px 'Inter'; color: #54656F;",
  ".msg.sis { align-self: center; background: #182229; padding: 8px 20px; font: 600 22px 'Inter'; color: #FFD279;"),
 (".msg.in { align-self: flex-start; background: #fff;", ".msg.in { align-self: flex-start; background: #202C33;"),
 (".msg.out { align-self: flex-end; background: #D9FDD3;", ".msg.out { align-self: flex-end; background: #005C4B;"),
 (".msg .quem { display: block; font: 700 21px 'Inter'; color: #00A884;", ".msg .quem { display: block; font: 700 21px 'Inter'; color: #06CF9C;"),
 ("font: 500 18px 'Inter'; color: #667781; }", "font: 500 18px 'Inter'; color: #8696A0; }"),
 (".alerta b { margin-left: auto; font: 800 40px 'Inter'; color: var(--verm);", ".alerta b { margin-left: auto; font: 800 40px 'Inter'; color: var(--vermt);"),
 ("#cta img { height: 58px; } #cta .tit { font: 600 38px/1.2 'Poppins';", "#cta img { height: 58px; } #cta .tit { color: var(--titulo); font: 600 38px/1.2 'Poppins';"),
])
troca('base.js', [
 ("legEl.style.color = papel ? '#1E2423' : '#fff'; legEl.style.textShadow = papel ? 'none' : '';",
  "legEl.style.color = '#fff'; legEl.style.textShadow = '';   // tema escuro: legenda sempre branca"),
 ('fill="#F4F5F7"', 'fill="#000"'),
 ('<path id="telaArco" fill="none" stroke="#1E2423"', '<path id="telaArco" fill="none" stroke="#00C767"'),
 ("const acende = (el, t, t0, t1, rgb = '0,199,103', a = 0.1)", "const acende = (el, t, t0, t1, rgb = '0,199,103', a = 0.16)"),
])
for p in ('copy1.html', 'copy2.html', 'copy3.html'):
    s = open(p, encoding='utf8').read()
    for a, b in (('img/logo.svg', 'img/logo-claro.svg'), ('#3B453D', '#C5CFC6'), ('#47514A', '#C5CFC6'), ("'#15803D'", "'#33D285'"),
                 ("S('robo', '#DEFFDC', 2.2)", "S('robo', '#0B1210', 2.2)"), ('#E9ECE9', '#1E2423'), ('#C9CFCA', '#3A4442'), ('#C3CAC4', '#3A4442')):
        s = s.replace(a, b)
    open(p, 'w', encoding='utf8').write(s)
troca('copy1.html', [
 ("const CORES = ['#DCEFE3', '#E7E1F5', '#FCE8D8', '#DDEBF7', '#F6E1E6', '#E5ECD6', '#F3EBD3', '#DCEFEE'];",
  "const CORES = ['#1F3A2C', '#2E2940', '#3A2C22', '#1F2E3D', '#3A2329', '#2E3524', '#38321E', '#1D3634'];"),
 ("height: 66px; background: #008069;", "height: 66px; background: #202C33;"),
 ("#wa1 .abasW span { font: 600 23px 'Inter'; color: rgba(255,255,255,.75);", "#wa1 .abasW span { font: 600 23px 'Inter'; color: #8696A0;"),
 ("#wa1 .abasW span.on { color: #fff; }", "#wa1 .abasW span.on { color: #00A884; }"),
 ("height: 5px; background: #fff; border-radius: 3px 3px 0 0;", "height: 5px; background: #00A884; border-radius: 3px 3px 0 0;"),
 ("#wa1 .abasW em { font-style: normal; background: #fff; color: #008069;", "#wa1 .abasW em { font-style: normal; background: #00A884; color: #111B21;"),
 ("right: 0; bottom: 0; background: #fff; overflow: hidden; }", "right: 0; bottom: 0; background: #111B21; overflow: hidden; }"),
 ("border-bottom: 1.5px solid #EEF0F0; background: #fff; }", "border-bottom: 1.5px solid #222D34; background: #111B21; }"),
 (".ct .tx b { display: block; font: 600 27px 'Inter'; color: #111B21; }", ".ct .tx b { display: block; font: 600 27px 'Inter'; color: #E9EDEF; }"),
 ("font: 400 23px 'Inter'; color: #667781;", "font: 400 23px 'Inter'; color: #8696A0;"),
 ("border-radius: 17px; background: #25D366; color: #fff;", "border-radius: 17px; background: #00A884; color: #111B21;"),
 ("border-radius: 16px; background: #EFEAE2; overflow: hidden; }", "border-radius: 16px; background: #0B141A; overflow: hidden; }"),
 ('<span class="quem" style="color:#1E2423">Carlos</span>', '<span class="quem" style="color:#FFD279">Carlos</span>'),
])
troca('copy2.html', [
 ("background: #F0F2F5; font: 600 21px 'Inter'; color: #3B4A54; } .anu span { display: block; font: 500 19px 'Inter'; color: #667781; }",
  "background: #1D282F; font: 600 21px 'Inter'; color: #E9EDEF; } .anu span { display: block; font: 500 19px 'Inter'; color: #8696A0; }"),
 ("background: #FFF3C4; padding: 10px 20px; font: 500 21px/1.35 'Inter'; color: #54656F;", "background: #182229; padding: 10px 20px; font: 500 21px/1.35 'Inter'; color: #FFD279;"),
 ("height: 104px; border-radius: 18px; background: #fff;", "height: 104px; border-radius: 18px; background: #111614;"),
 ("box-shadow: 0 6px 18px rgba(11,20,26,.12);", "box-shadow: 0 6px 18px rgba(0,0,0,.4);"),
 ("border: 3px solid #3A4442; background: #fff;", "border: 3px solid #3A4442; background: #1E2423;"),
 ("b.innerHTML = S(on ? 'ok' : g, on ? '#fff' : '#8C958D', on ? 3 : 2.2);", "b.innerHTML = S(on ? 'ok' : g, on ? '#0B1210' : '#8C958D', on ? 3 : 2.2);"),
 ("b.style.background = on ? (hum ? 'var(--tinta)' : 'var(--dest)') : '#fff'; b.style.borderColor = on ? (hum ? 'var(--tinta)' : 'var(--dest)') : '#3A4442';",
  "b.style.background = on ? (hum ? 'var(--titulo)' : 'var(--dest)') : '#1E2423'; b.style.borderColor = on ? (hum ? 'var(--titulo)' : 'var(--dest)') : '#3A4442';"),
])
troca('copy3.html', [("const CORA = { AN: '#DCEFE3', BR: '#E7E1F5', CA: '#FCE8D8' };", "const CORA = { AN: '#1F3A2C', BR: '#2E2940', CA: '#3A2C22' };")])
print('ok')
