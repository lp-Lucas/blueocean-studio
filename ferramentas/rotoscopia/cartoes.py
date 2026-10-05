# Cartões de design 1080x960 (HTML → Chrome headless), no visual Blue Ocean (Instrument Sans, azul #0137FF, fundo navy).
# Use só quando não existir coisa real (notícia, site, vídeo) para o trecho.
# uso: python cartoes.py <pasta de saída> <cartoes.json>     cartoes.json = {"nome": "<html do corpo>", ...}
#      python cartoes.py <pasta de saída> --exemplo <nome>   gera um dos EXEMPLOS abaixo (veja as classes usadas)
#      --tela   cartão 1080x1920 (tela cheia 9:16) com o conteúdo em 290–780 px (área segura do Reels; a pessoa fica embaixo)
# Classes prontas: .tag (sobretítulo), .big (número gigante), .mid (frase), .azul, .card (cartão branco), .bola, .sub, .fonte
import os, sys, json, subprocess

CH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
UD = os.path.join(os.environ["TEMP"], "chshot")

BASE = """<html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
body{width:1080px;height:960px;overflow:hidden;font-family:'Instrument Sans','Segoe UI',sans-serif;color:#fff;
 background:radial-gradient(circle at 50% 35%,#0b2a9e 0%,#04103f 55%,#020820 100%);display:flex;flex-direction:column;
 align-items:center;justify-content:center;padding:70px}
.tag{font-size:34px;letter-spacing:4px;text-transform:uppercase;color:#8fb0ff;font-weight:600}
.big{font-size:230px;font-weight:700;line-height:1;margin:10px 0}
.mid{font-size:64px;font-weight:600;text-align:center;line-height:1.1}
.fonte{position:absolute;bottom:40px;font-size:24px;color:#7d8bbd}
.azul{color:#3d7bff}
.card{background:#fff;color:#0a0f1e;border-radius:28px;padding:30px 40px;width:900px;margin:12px 0;display:flex;align-items:center;gap:26px;
 box-shadow:0 20px 50px rgba(0,0,0,.4);font-size:36px}
.bola{width:76px;height:76px;border-radius:50%;background:#0137FF;color:#fff;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:700;flex:none}
.sub{font-size:26px;color:#5a6280}
</style></head><body>%s</body></html>"""

EXEMPLOS = {   # cartões aprovados no vídeo "Copy 12 – Totvs/Linx" (01/10/2026)
 "linx-90": """<div class="tag">Linx · receita</div><div class="big">+90%</div>
   <div class="mid">da receita é <span class="azul">recorrente</span></div><div class="fonte">Fonte: NeoFeed / Baguete, 2025</div>""",
 "linx-1bi": """<div class="tag">Linx · 2024</div><div class="big" style="font-size:200px">R$1 bi+</div>
   <div class="mid">de receita recorrente<br>que se repete todo mês</div><div class="fonte">R$ 1,048 bi recorrentes de R$ 1,145 bi · Fonte: Baguete, 2025</div>""",
 "mrr": """<div class="tag">MRR · receita previsível</div>
   <svg width="900" height="560" viewBox="0 0 900 560" style="margin-top:30px">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d7bff" stop-opacity=".55"/><stop offset="1" stop-color="#3d7bff" stop-opacity="0"/></linearGradient></defs>
    <g stroke="#ffffff22" stroke-width="2"><line x1="0" y1="110" x2="900" y2="110"/><line x1="0" y1="240" x2="900" y2="240"/><line x1="0" y1="370" x2="900" y2="370"/><line x1="0" y1="500" x2="900" y2="500"/></g>
    <path d="M0 470 L100 450 L200 425 L300 395 L400 360 L500 320 L600 270 L700 215 L800 150 L900 80 L900 500 L0 500Z" fill="url(#g)"/>
    <path d="M0 470 L100 450 L200 425 L300 395 L400 360 L500 320 L600 270 L700 215 L800 150 L900 80" fill="none" stroke="#3d7bff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="900" cy="80" r="16" fill="#fff"/>
    <g fill="#8fb0ff" font-size="26" font-family="Instrument Sans"><text x="0" y="545">jan</text><text x="290" y="545">abr</text><text x="590" y="545">jul</text><text x="840" y="545">out</text></g>
   </svg>""",
 "leads": """<div class="tag" style="margin-bottom:20px">Novos leads · este mês</div>
   <div class="card"><div class="bola">M</div><div><b>Novo lead qualificado</b><div class="sub">Marina · CEO · SaaS de gestão · agora</div></div></div>
   <div class="card"><div class="bola">R</div><div><b>Novo lead qualificado</b><div class="sub">Rafael · Head de Vendas · 2 min</div></div></div>
   <div class="card"><div class="bola">C</div><div><b>Novo lead qualificado</b><div class="sub">Carla · Founder · ERP · 5 min</div></div></div>""",
 "contrato": """<div class="card" style="flex-direction:column;align-items:flex-start;gap:14px;padding:50px 60px;width:860px">
    <div class="sub" style="font-size:28px">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</div>
    <div style="height:14px;width:90%;background:#e3e7f2;border-radius:7px"></div>
    <div style="height:14px;width:80%;background:#e3e7f2;border-radius:7px"></div>
    <div style="height:14px;width:85%;background:#e3e7f2;border-radius:7px"></div>
    <div style="height:14px;width:60%;background:#e3e7f2;border-radius:7px;margin-bottom:30px"></div>
    <div style="font-family:'Segoe Script',cursive;font-size:64px;color:#0137FF;border-bottom:3px solid #0a0f1e;width:100%">Assinado</div>
    <div style="display:flex;align-items:center;gap:18px;margin-top:20px;font-size:44px;font-weight:700;color:#0a9b4a">
     <div class="bola" style="background:#0a9b4a">✓</div>Contrato assinado</div></div>""",
 "funil": """<div class="tag" style="margin-bottom:20px">Do anúncio até o contrato</div>
   <div style="display:flex;flex-direction:column;align-items:center;gap:12px;font-size:44px;font-weight:700">
    <div style="background:#0137FF;width:900px;padding:22px;text-align:center;border-radius:20px">Anúncio</div>
    <div style="background:#1f55ff;width:760px;padding:22px;text-align:center;border-radius:20px">Lead qualificado</div>
    <div style="background:#3d7bff;width:620px;padding:22px;text-align:center;border-radius:20px">Reunião</div>
    <div style="background:#fff;color:#0137FF;width:480px;padding:22px;text-align:center;border-radius:20px">Contrato ✓</div></div>""",
 "case-tim": """<div class="tag">Case · Time is Money</div>
   <div style="display:flex;align-items:center;gap:24px;margin:40px 0">
    <div style="text-align:center"><div class="sub" style="color:#8fb0ff;font-size:32px">investiu</div><div style="font-size:92px;font-weight:700;white-space:nowrap">R$19 mil</div></div>
    <div style="font-size:90px;color:#3d7bff">→</div>
    <div style="text-align:center"><div class="sub" style="color:#8fb0ff;font-size:32px">retornou</div><div style="font-size:92px;font-weight:700;white-space:nowrap;color:#3d7bff">R$228 mil</div></div></div>
   <div class="mid">de ARR em um único mês</div>""",
 "saiba-mais": """<div class="mid" style="margin-bottom:60px">Fale com o time da Blue Ocean</div>
   <div style="background:#fff;color:#0137FF;font-size:70px;font-weight:700;padding:40px 110px;border-radius:999px;box-shadow:0 0 80px #3d7bff">Saiba mais ›</div>
   <div style="font-size:120px;margin-top:20px;margin-left:260px">👆</div>""",
 "quem-avalia": """<div class="tag" style="margin-bottom:40px">Quem olha uma empresa de software</div>
   <div style="display:flex;gap:28px">
    <div class="card" style="width:290px;flex-direction:column;gap:14px;padding:40px 20px;font-size:44px;font-weight:700"><div style="font-size:80px">🤝</div>Compra</div>
    <div class="card" style="width:290px;flex-direction:column;gap:14px;padding:40px 20px;font-size:44px;font-weight:700"><div style="font-size:80px">💰</div>Investe</div>
    <div class="card" style="width:290px;flex-direction:column;gap:14px;padding:40px 20px;font-size:44px;font-weight:700"><div style="font-size:80px">📊</div>Avalia</div></div>
   <div class="mid" style="margin-top:50px">olha a <span class="azul">receita</span>, não o código</div>""",
 "nao-produto": """<div class="tag">Receita previsível</div>
   <div class="mid" style="font-size:84px;margin:40px 0">não nasce<br>do <span style="text-decoration:line-through;text-decoration-color:#ff3b4e;text-decoration-thickness:10px">produto</span></div>""",
 "formula": """<div class="tag" style="margin-bottom:40px">O que gera receita previsível</div>
   <div class="card" style="justify-content:center;font-size:52px;font-weight:700">Lead qualificado todo mês</div>
   <div style="font-size:80px;font-weight:700;color:#3d7bff">+</div>
   <div class="card" style="justify-content:center;font-size:52px;font-weight:700">Comercial que fecha contrato</div>
   <div style="font-size:80px;font-weight:700;color:#3d7bff">=</div>
   <div class="card" style="justify-content:center;font-size:52px;font-weight:700;background:#0137FF;color:#fff">MRR previsível</div>""",
}

def chrome(html, png, w=1080, h=960):
    subprocess.run([CH, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--user-data-dir={UD}",
                    f"--window-size={w},{h}", "--virtual-time-budget=2000", f"--screenshot={png}", html],
                   timeout=60, capture_output=True)


if __name__ == "__main__":
    tela = "--tela" in sys.argv
    if tela: sys.argv.remove("--tela")
    saida = os.path.abspath(sys.argv[1]); os.makedirs(saida, exist_ok=True)
    base, alto = BASE, 960
    if tela:
        alto = 1920
        base = BASE.replace("height:960px", "height:1920px").replace("justify-content:center;padding:70px",
                            "justify-content:flex-start;padding:290px 70px 0")                    .replace("</style>", ".zona{height:490px;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%}</style>")
    if sys.argv[2] == "--exemplo":
        pedidos = {n: EXEMPLOS[n] for n in sys.argv[3:]}
    else:
        pedidos = json.load(open(sys.argv[2], encoding="utf-8"))
    for nome, html in pedidos.items():
        h = os.path.join(saida, f"_{nome}.html")
        open(h, "w", encoding="utf-8").write(base.replace("%s", f'<div class="zona">{html}</div>' if tela else html))
        chrome("file:///" + h.replace("\\", "/"), os.path.join(saida, f"{nome}.png"), 1080, alto)
        os.remove(h)
        print("cartão:", os.path.join(saida, nome + ".png"))
