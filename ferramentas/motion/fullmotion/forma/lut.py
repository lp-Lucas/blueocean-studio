import numpy as np, cv2, sys
ref = cv2.imread('ref.png'); raw = cv2.imread('bruto.png')
def lab(img): return cv2.cvtColor(img.astype(np.float32)/255, cv2.COLOR_BGR2Lab)
R, B = lab(ref).reshape(-1,3), lab(raw).reshape(-1,3)
for n,X in (('ref',R),('raw',B)): print(n, 'mean', X.mean(0).round(2), 'std', X.std(0).round(2), 'p2/p98 L', np.percentile(X[:,0],[2,50,98]).round(1))
# curva de L por quantis (suavizada)
q = np.linspace(0,100,41)
lr, lb = np.percentile(R[:,0], q), np.percentile(B[:,0], q)
lb = np.maximum.accumulate(lb + np.arange(41)*1e-4)
force = float(sys.argv[1]) if len(sys.argv)>1 else 1.0
def mapL(L): return L + force*(np.interp(L, lb, lr) - L)
ka = np.clip(R[:,1].std()/B[:,1].std(), 0.8, 1.6); kb = np.clip(R[:,2].std()/B[:,2].std(), 0.8, 1.6)
print('ka kb', ka, kb)
def tr(lab3):
    L,a,b = lab3[...,0],lab3[...,1],lab3[...,2]
    a2 = (a - B[:,1].mean())*ka + R[:,1].mean(); b2 = (b - B[:,2].mean())*kb + R[:,2].mean()
    a2 = a + force*(a2-a); b2 = b + force*(b2-b)
    return np.stack([mapL(L), a2, b2], -1)
N=33; g=np.linspace(0,1,N)
bb,gg,rr = np.meshgrid(g,g,g, indexing='ij')  # cube: r varia mais rápido
rgb = np.stack([rr,gg,bb],-1).reshape(-1,1,3).astype(np.float32)
labg = cv2.cvtColor(rgb, cv2.COLOR_RGB2Lab)
out = np.clip(cv2.cvtColor(tr(labg).astype(np.float32), cv2.COLOR_Lab2RGB),0,1).reshape(-1,3)
with open('cor.cube','w') as f:
    f.write('LUT_3D_SIZE %d\n'%N)
    for v in out: f.write('%.6f %.6f %.6f\n'%tuple(v))
