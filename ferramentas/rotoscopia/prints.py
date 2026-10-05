# Prints reais da internet para os fundos (notícia, site, ferramenta).
#
# python prints.py foto <url> <saida.png> [LxA]
#     print da página no Chrome sem janela (padrão 1080x3000: pega a matéria inteira; site: 1440x1100).
#     Abra o png com Read para achar a manchete e o parágrafo certo. Pop-up de cookie/anúncio: recorte fora.
# python prints.py recorte <entrada.png> x0 y0 x1 y1 <saida.png>
#     recorta e ajusta para 1080x960 (a área de cima da tela). Escolha uma caixa perto de 1,125:1 para não esticar.
# python prints.py materia <pagina.png> <saida.png> --barra y1 --manchete x0 y0 x1 y1 --trecho x0 y0 x1 y1 [--marca x0 y0 x1 y1 ...]
#     monta 1080x960 no jeito aprovado: barra do site em cima, manchete, e o parágrafo do dado ampliado
#     com marca-texto amarelo. As caixas de --marca são em pixels DENTRO do --trecho (sem ampliar), uma por linha.
import os, sys, subprocess
from PIL import Image, ImageChops, ImageDraw

CH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
UD = os.path.join(os.environ["TEMP"], "chshot")
AMARELO = (255, 226, 64)

def foto(url, saida, tam="1080x3000"):
    w, h = tam.split("x")
    subprocess.run([CH, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--user-data-dir={UD}",
                    f"--window-size={w},{h}", "--virtual-time-budget=8000", f"--screenshot={os.path.abspath(saida)}", url],
                   timeout=90, capture_output=True)
    print("print:", os.path.abspath(saida))

def recorte(ent, caixa, saida):
    Image.open(ent).convert("RGB").crop(caixa).resize((1080, 960), Image.LANCZOS).save(saida)
    print("recorte:", os.path.abspath(saida))

def colar(c, im, x, y, larg_max):
    k = min(larg_max / im.width, 1.9)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    c.paste(im, (x, y)); return im.height, k

def materia(ent, saida, barra, manchete, trecho, marcas):
    im = Image.open(ent).convert("RGB")
    c = Image.new("RGB", (1080, 960), "white")
    y = 0
    if barra: c.paste(im.crop((0, 0, 1080, barra)), (0, 0)); y = barra + 25
    if manchete:
        h, _ = colar(c, im.crop(manchete), 40, y, 1000); y += h + 40
    if trecho:
        p = im.crop(trecho)
        mk = Image.new("RGB", p.size, "white"); d = ImageDraw.Draw(mk)
        for m in marcas: d.rectangle(m, fill=AMARELO)
        colar(c, ImageChops.multiply(p, mk), 30, y, 1020)
    c.save(saida); print("matéria:", os.path.abspath(saida))

if __name__ == "__main__":
    a = sys.argv[1:]
    if a[0] == "foto": foto(a[1], a[2], *(a[3:4]))
    elif a[0] == "recorte": recorte(a[1], tuple(map(int, a[2:6])), a[6])
    elif a[0] == "materia":
        def caixa(nome):
            if nome not in a: return None
            i = a.index(nome); return tuple(map(int, a[i + 1:i + 5]))
        barra = int(a[a.index("--barra") + 1]) if "--barra" in a else 0
        marcas = [tuple(map(int, a[i + 1:i + 5])) for i, v in enumerate(a) if v == "--marca"]
        materia(a[1], a[2], barra, caixa("--manchete"), caixa("--trecho"), marcas)
