#!/bin/sh
# renderiza as peças do trab/pecas.json que ainda não existem (cada uma vira midia/pecas/<arquivo>.webm)
P="$(pwd)"; MOT="C:/Users/lpess/OneDrive/Documentos/Projetos/BLUEOCEAN STUDIO/ferramentas/motion"
PYTHONIOENCODING=utf-8 python -c "
import json
vistos=set()
for p in json.load(open('trab/pecas.json',encoding='utf-8')):
    a=p.get('arquivo',p['id'])
    if a in vistos: continue
    vistos.add(a); x,y,w,h=p['caixa']; w,h=p.get('tela',[w,h]); print(a, w, h, json.dumps(p['params'],ensure_ascii=False), sep='\t')
" | while IFS="$(printf '\t')" read a w h par; do
  out="$P/midia/pecas/$a.webm"; [ -f "$out" ] && continue
  ( cd "$MOT" && node render.mjs fullmotion/pecas-youtube.html "$out" --alfa --w $w --h $h --params "$par" | tail -c 70 ) < /dev/null
  echo
done
