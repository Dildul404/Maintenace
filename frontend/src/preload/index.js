import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  sendLaporan: (data) => ipcRenderer.invoke('send-laporan', data),
  getLaporan: () => ipcRenderer.invoke('get-laporan'),
  updateLaporan: (id, data) => ipcRenderer.invoke('update-laporan', id, data),
  deleteLaporan: (id) => ipcRenderer.invoke('delete-laporan', id)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('nav', {
      goTo: (page) => ipcRenderer.send('navigate', page)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}