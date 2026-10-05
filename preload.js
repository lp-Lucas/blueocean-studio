/* ponte segura entre a tela e o processo principal */
const { contextBridge, ipcRenderer, webUtils } = require('electron');
const chamar = async (canal, ...a) => { const r = await ipcRenderer.invoke(canal, ...a); if (!r.ok) throw new Error(r.erro); return r.r; };
const ouvir = canal => fn => { const h = (e, d) => fn(d); ipcRenderer.on(canal, h); return () => ipcRenderer.removeListener(canal, h); };
contextBridge.exposeInMainWorld('bo', {
  chamar,
  caminhoDe: arquivo => webUtils.getPathForFile(arquivo),
  on: {
    tarefa: ouvir('tarefa'), tarefaSumiu: ouvir('tarefa-sumiu'), tarefaLog: ouvir('tarefa-log'),
    projetoExterno: ouvir('projeto-externo'), transcricoes: ouvir('transcricoes'), midiaPronta: ouvir('midia-pronta'),
    chatEvento: ouvir('chat-evento'), chatEstado: ouvir('chat-estado'), aviso: ouvir('aviso'), exportado: ouvir('exportado'), bo: ouvir('bo'),
    pedirAss: ouvir('pedir-ass'), atualizacao: ouvir('atualizacao'), comps: ouvir('comps'), compAbrir: ouvir('comp-abrir'), preparar: ouvir('preparar'),
  },
  responderAss: (id, pacote) => ipcRenderer.send('ass-pronto', { id, pacote }),
});
