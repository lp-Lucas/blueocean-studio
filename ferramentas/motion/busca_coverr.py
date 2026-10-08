"""Busca vídeos reais (sem IA, sem premium) no Coverr. uso: python busca_coverr.py "termo" [termo2 ...]
imprime: slug  duração  título  url mp4 1080p"""
import sys, re, json, urllib.request, urllib.parse
vistos = set()
for termo in sys.argv[1:]:
    req = urllib.request.Request('https://coverr.co/s?q=' + urllib.parse.quote(termo), headers={'User-Agent': 'Mozilla/5.0'})
    s = urllib.request.urlopen(req, timeout=60).read().decode('utf-8', 'ignore')
    for m in re.finditer(r'"urls":\{"mp4":"(https://cdn\.coverr\.co/videos/([^/]+)/1080p\.mp4)"', s):
        url, slug = m.group(1), m.group(2)
        if slug in vistos: continue
        ini = s.rfind('"title":"', 0, m.start())
        tit = s[ini + 9: s.find('"', ini + 9)] if ini >= 0 else '?'
        cauda = s[m.end(): m.end() + 600]
        if '"isAiGenerated":true' in cauda or '"isPremium":true' in cauda or slug.startswith('user-ai'): continue
        dur = re.search(r'"duration":"([\d.]+)"', s[ini: m.start()])
        vistos.add(slug)
        print(slug, dur.group(1)[:5] if dur else '?', tit[:90], url, sep='\t')
