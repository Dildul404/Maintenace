import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import ElectronStore from 'electron-store'

// buat store
const store = new ElectronStore.default()

// Custom APIs for renderer
const api = {
  sendLaporan: (data) => ipcRenderer.invoke('send-laporan', data),
  getLaporan: () => ipcRenderer.invoke('get-laporan'),
  updateLaporan: (id, data) => ipcRenderer.invoke('update-laporan', id, data),
  deleteLaporan: (id) => ipcRenderer.invoke('delete-laporan', id),

  sendTeknisi: (data) => ipcRenderer.invoke('send-teknisi', data),
  getTeknisi: () => ipcRenderer.invoke('get-teknisi'),
  deleteTeknisi: (id) => ipcRenderer.invoke('delete-teknisi', id),

  sendUser: (data) => ipcRenderer.invoke('send-user', data),
  getUser: (email, password) => ipcRenderer.invoke('get-user', email, password),
  deleteUser: (id) => ipcRenderer.invoke('delete-user', id),

  assignTeknisi: (data) => ipcRenderer.invoke('assign-teknisi', data)
}

// expose ke renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)

    contextBridge.exposeInMainWorld('api', api)

    contextBridge.exposeInMainWorld('nav', {
      goTo: (page) => ipcRenderer.send('navigate', page)
    })

    contextBridge.exposeInMainWorld('dataSession', {
      setData: (key, value) => store.set(key, value),
      updateData: (key, value) => {
        const oldData = store.get(key) || {}
        store.set(key, {
          ...oldData,
          ...value
        })
      },
      getData: (key) => store.get(key),
      deleteData: (key) => store.delete(key),
      clearData: () => store.clear()
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
