"""SFX da Newmo — tempos iguais aos de copy1.html / copy2.html / copy3.html (linha do tempo já cortada).
uso: python newmo-sfx.py <1|2|3> <saida.wav>"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from fmsfx import *

copia = sys.argv[1]
m = nova({'1': 28.88, '2': 25.60, '3': 27.58}[copia])   # tempo antigo da animação; o corte/respiro entra no fim (abaixo)

def fs_entra(t):
    m.add(t, whoosh(0.55, 2600, 400, pico=0.5, q=1.0), 0.26, nome='círculo fecha'); m.add(t + 0.42, baque(0.6, 50), 0.22, nome='círculo some: grave')
def marca_expande(t0):
    m.add(t0, pop(520, 0.3, 0.8), 0.22, nome='ícone da marca pula'); m.add(t0 + 0.04, tick(1800, 0.03), 0.1, nome='ícone: clique')
    m.add(t0 + 0.6, whoosh(0.55, 500, 2800, pico=0.6, q=0.9), 0.26, nome='fundo do ícone expande'); m.add(t0 + 1.05, baque(0.5, 55), 0.18, nome='tela cheia: grave')
def fs_sai(t):
    m.add(t, pop(700, 0.3, 0.7), 0.2, nome='quadrado aparece'); m.add(t + 0.04, whoosh(0.6, 500, 3000, pico=0.5, q=1.0, pan=(-0.4, 0.6)), 0.24, nome='quadrado cresce + arco')
def digitar(t, d, n=None):
    n = n or int(d / 0.07)
    for k in range(n): m.add(t + k * d / n + r.uniform(-0.01, 0.01), tick(r.uniform(2400, 3600), 0.02, pan=r.uniform(-0.2, 0.2)), 0.05, nome='tecla')
def chega(t, g=0.12): m.add(t, pop(1300, 0.18, 0.5), g, nome='mensagem chega')
def envia(t, g=0.1): m.add(t, whoosh(0.25, 1800, 3600, pico=0.3, q=1.4), g, nome='mensagem enviada')

if copia == '1':
    # oportunidades chegando → WhatsApp lotado → ???
    entra(m, 0.35, 560, 0.2); contador(m, 0.6, 1.0, quintOut, 9, ganho=0.04); sai(m, 1.8)
    marca_expande(2.05); entra(m, 3.1, 520, 0.18)
    for t0 in (3.35, 3.7, 4.05): chega(t0)
    for k in range(8): m.add(5.5 + k * 0.07, tick(1700 + 110 * k, 0.03), 0.06, nome='não qualificado')
    m.add(6.45, pop(700, 0.25, 0.7), 0.14, nome='prontas ???'); impacto(m, 7.0, A6)
    fs_sai(7.45)
    # Newmo · IA atende
    entra(m, 7.65, 620, 0.22); sai(m, 8.4)
    entra(m, 8.55, 560, 0.2); chega(8.75, 0.1); envia(9.3); sai(m, 10.0)
    # plataforma
    fs_entra(10.3); entra(m, 10.35, 520, 0.2); digitar(10.5, 1.0)
    for k, t0 in enumerate((11.98, 12.3, 12.62, 12.98)): m.add(t0, pop(900 + 150 * k, 0.15, 0.45), 0.09, nome='informação coletada')
    check(m, 13.2, E6, ganho=0.12)
    clique(m, 14.55); check(m, 14.6, G6, ganho=0.14)
    clique(m, 16.95); m.add(17.0, whoosh(0.35, 900, 2600, pico=0.5, q=1.2), 0.1, nome='troca de aba')
    m.add(17.45, pop(1000, 0.2, 0.5), 0.1, nome='vendedor entrou'); chega(19.4, 0.1)
    m.add(19.4, whoosh(0.3, 900, 2600, pico=0.5, q=1.2), 0.08, nome='resumo acende')
    m.add(20.3, pop(1000, 0.2, 0.5), 0.07, nome='tarefa'); m.add(20.45, pop(1100, 0.2, 0.5), 0.07, nome='tarefa')
    m.add(21.0, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.12, nome='risca'); m.add(21.45, whoosh(0.4, 1800, 4200, pico=0.3, q=1.6), 0.12, nome='risca')
    fs_sai(22.3)
    # resultado e CTA
    entra(m, 22.45, 560, 0.2); check(m, 23.0, E6, ganho=0.11); check(m, 24.55, G6, ganho=0.11); sai(m, 25.5)
    entra(m, 25.75, 560, 0.24); clique(m, 27.3); m.add(27.32, baque(0.5, 60), 0.12, nome='botão: grave')
    m.add(27.45, vidro(C7, 0.9, 0.6), 0.05, nome='brilho no botão')
elif copia == '2':
    # novo agente SDR
    fs_entra(1.25); entra(m, 1.3, 520, 0.18); digitar(1.4, 0.55); digitar(2.4, 0.9)
    for k in range(14): m.add(3.7 + k * 0.03, pop(r.uniform(900, 1500), 0.1, 0.4), 0.03, nome='hora acende')
    clique(m, 4.15); check(m, 4.2, G6, ganho=0.13)
    fs_sai(4.6)
    # WhatsApp
    marca_expande(5.0); entra(m, 6.05, 520, 0.18)
    chega(6.3); envia(7.2); envia(9.1); chega(9.6)
    m.add(9.95, pop(800, 0.22, 0.6), 0.1, nome='perfil'); m.add(10.15, tick(1800, 0.03), 0.07, nome='clínica'); m.add(10.4, tick(2100, 0.03), 0.07, nome='6 atendentes')
    m.add(11.3, pop(1000, 0.2, 0.5), 0.1, nome='enviada à equipe'); check(m, 12.2, G6, ganho=0.12)
    fs_sai(12.95)
    # inserções
    entra(m, 13.1, 560, 0.2)
    for k, t0 in enumerate((13.62, 13.9, 14.18)): m.add(t0, pop(900 + 150 * k, 0.15, 0.45), 0.09, nome='etapa da IA')
    m.add(15.36, pop(600, 0.22, 0.6), 0.11, nome='vendedor'); sai(m, 15.95)
    entra(m, 16.1, 560, 0.2); m.add(17.86, tick(1800, 0.03), 0.08, nome='linha acende'); m.add(18.05, tick(2100, 0.03), 0.08, nome='linha acende'); sai(m, 18.85)
    # humano assume
    fs_entra(19.05); entra(m, 19.1, 520, 0.2)
    m.add(20.1, pop(1000, 0.2, 0.5), 0.11, nome='lead pronto'); clique(m, 20.95); check(m, 21.0, G6, ganho=0.13)
    for k in range(4): m.add(21.75 + k * 0.1, tick(1800 + 160 * k, 0.03), 0.07, nome='contexto acende')
    fs_sai(22.45)
    # CTA
    entra(m, 22.6, 560, 0.24); clique(m, 24.1); m.add(24.12, baque(0.5, 60), 0.12, nome='botão: grave')
    m.add(24.25, vidro(C7, 0.9, 0.6), 0.05, nome='brilho no botão')
elif copia == '3':
    # tarefas manuais
    fs_entra(0.3); entra(m, 0.35, 520, 0.18)
    for t0 in (0.88, 1.54, 2.14): m.add(t0, tick(2000, 0.03), 0.08, nome='tarefa acende')
    m.add(4.04, pop(1000, 0.18, 0.5), 0.07, nome='equipe')
    for k in range(4): m.add(5.7 + k * 0.08, pop(700, 0.18, 0.6), 0.07, nome='manual')
    for k in range(4): m.add(6.4 + k * 0.06, pop(1300, 0.15, 0.5), 0.05, nome='whatsapp')
    m.add(7.13, whoosh(0.9, 900, 2600, pico=0.6, q=1.0), 0.1, nome='barra vermelha cresce'); contador(m, 7.13, 0.9, cubicInOut, 9, ganho=0.04)
    m.add(9.07, pop(700, 0.25, 0.7), 0.13, nome='vender ???'); impacto(m, 9.1, A6)
    fs_sai(10.55)
    # Newmo · automações
    entra(m, 10.8, 620, 0.22); sai(m, 11.45)
    entra(m, 11.6, 560, 0.2)
    for k, t0 in enumerate((11.9, 12.05, 12.2, 12.35)): m.add(t0, tick(1600 + 200 * k, 0.04), 0.1, nome='chave liga')
    sai(m, 13.3)
    # régua
    fs_entra(13.5); entra(m, 13.55, 520, 0.2)
    for k in range(4): m.add(13.65 + k * 0.12, tick(1700 + 110 * k, 0.03), 0.07, nome='passo da régua')
    for k in range(4): m.add(14.34 + k * 0.15, whoosh(0.3, 1500, 3200, pico=0.4, q=1.6), 0.05, nome='mensagem acende')
    clique(m, 15.45); m.add(15.5, tick(1500, 0.04), 0.12, nome='régua ativa')
    m.add(16.95, pop(900, 0.2, 0.5), 0.09, nome='sábado 03:12')
    for t0 in (17.35, 17.6, 17.85, 18.1): envia(t0, 0.09)
    contador(m, 18.55, 0.6, quintOut, 8, ganho=0.04, f0=3400, f1=2400); check(m, 19.0, G6, ganho=0.13)
    fs_sai(19.45)
    # WhatsApp + API oficial da Meta
    marca_expande(19.95); entra(m, 21.0, 520, 0.18)
    m.add(21.71, pop(1000, 0.2, 0.5), 0.1, nome='API oficial'); check(m, 21.99, E6, ganho=0.11); m.add(22.8, pop(800, 0.22, 0.6), 0.11, nome='selo Meta')
    fs_sai(23.3)
    # CTA
    entra(m, 23.4, 560, 0.24); clique(m, 24.9); m.add(24.92, baque(0.5, 60), 0.12, nome='botão: grave')
    m.add(25.05, vidro(C7, 0.9, 0.6), 0.05, nome='brilho no botão')

salvar(m, sys.argv[2])
# linha nova: copy 1 sem o "A" (corta 10,08–10,16 do tempo antigo); copy 2 sem o "SDR" repetido (corta 0,6–1,2)
import subprocess, shutil
filtro = {'2': "[0:a]atrim=0:0.6,asetpts=PTS-STARTPTS[a];[0:a]atrim=start=1.2,asetpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=0:a=1",
          '1': "[0:a]atrim=0:10.08,asetpts=PTS-STARTPTS[a];[0:a]atrim=start=10.16,asetpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=0:a=1"}.get(copia)
if filtro:
    tmp = sys.argv[2] + '.tmp.wav'; shutil.move(sys.argv[2], tmp)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-filter_complex', filtro, sys.argv[2]], check=True); os.remove(tmp)
