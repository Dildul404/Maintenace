import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios';

// Deklarasi win di scope module agar bisa diakses oleh ipcMain
let win

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Simpan referensi ke variabel win
  win = mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // IPC navigasi: load halaman lain di renderer
  ipcMain.on('navigate', (_event, page) => {
    if (win) {
      win.loadFile(join(__dirname, `../renderer/${page}.html`))
    }
  })

  // IPC laporan (Kirim data ke backend)
  ipcMain.handle('send-laporan', async (event, data) => {
    try {
      const response = await axios.post('http://localhost:3000/laporan', data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending laporan:', error.message);
      return { success: false, error: error.message };
    }
  })

  // IPC laporan (Ambil data dari backend)
  ipcMain.handle('get-laporan', async () => {
    try {
      const response = await axios.get('http://localhost:3000/laporan');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error fetching laporan:', error.message);
      return { success: false, error: error.message };
    }
  })

  // IPC laporan (Update data ke backend)
  ipcMain.handle('update-laporan', async (event, id, data) => {
    try {
      const response = await axios.put(`http://localhost:3000/laporan/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating laporan:', error.message);
      return { success: false, error: error.message };
    }
  })

  // IPC laporan (Delete data dari backend)
  ipcMain.handle('delete-laporan', async (event, id) => {
    try {
      const response = await axios.delete(`http://localhost:3000/laporan/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting laporan:', error.message);
      return { success: false, error: error.message };
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
