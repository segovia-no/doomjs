const M_CheckParm = require('./m_argv').M_CheckParm
const { app, BrowserWindow } = require('electron')

let BASEWINDOWWIDTH = 320
let BASEWINDOWHEIGHT = 200

function createWindow() {

  let multiplyRes = 1

  if (M_CheckParm('-2')) multiplyRes = 2
  if (M_CheckParm('-3')) multiplyRes = 3
  if (M_CheckParm('-4')) multiplyRes = 4

  let windowWidth = BASEWINDOWWIDTH * multiplyRes
  let windowHeight = BASEWINDOWHEIGHT * multiplyRes

  const win = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('base.html')

}

function I_InitGraphics() {

  console.log('I_InitGraphics: Setting up electron window')

  app.whenReady().then(createWindow)

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

}

module.exports = {
  I_InitGraphics
}