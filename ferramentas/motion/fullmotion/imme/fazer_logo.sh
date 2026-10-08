# gera img/logo.png (tinta escura) e img/logo-branco.png a partir de logo.html (fundo branco x preto → alfa)
cd "$(dirname "$0")/../.."
for v in "escuro:#0B0B10" "claro:#FFFFFF"; do n=${v%%:*}; cor=${v#*:}; for bg in "#fff" "#000"; do node render.mjs fullmotion/imme/logo.html x.mp4 --quadro 0 --png "cache-$n-${bg:1:1}.png" --params "{\"cor\":\"$cor\",\"bg\":\"$bg\"}" >/dev/null; done; done
python -I - <<'PY'
from PIL import Image
import numpy as np
for n,arq in [('escuro','logo.png'),('claro','logo-branco.png')]:
    w=np.asarray(Image.open(f'cache-{n}-f.png').convert('RGB')).astype(float); b=np.asarray(Image.open(f'cache-{n}-0.png').convert('RGB')).astype(float)
    a=np.clip(1-(w-b).mean(2)/255,0,1); c=np.clip(np.where(a[...,None]>0.003,b/np.maximum(a[...,None],1e-3),0),0,255)
    im=Image.fromarray(np.dstack([c,a*255]).astype(np.uint8),'RGBA'); im.crop(im.getbbox()).save('fullmotion/imme/img/'+arq)
im=Image.open('fullmotion/imme/img/logo.png'); bg=Image.new('RGBA',im.size,(244,240,250,255)); bg.alpha_composite(im); bg.save('fullmotion/imme/img/prev.png')
PY
rm -f cache-*.png x.mp4
