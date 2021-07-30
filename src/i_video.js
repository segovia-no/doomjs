const M_CheckParm = require('./m_argv').M_CheckParm

let BASEWINDOWWIDTH = 320
let BASEWINDOWHEIGHT = 200

function createWindow() {

  let multiplyRes = 1

  if (M_CheckParm('-2')) multiplyRes = 2
  if (M_CheckParm('-3')) multiplyRes = 3
  if (M_CheckParm('-4')) multiplyRes = 4

  let windowWidth = BASEWINDOWWIDTH * multiplyRes
  let windowHeight = BASEWINDOWHEIGHT * multiplyRes

}

function I_InitGraphics() {

  console.log('I_InitGraphics: Setting up win32 window')

}

module.exports = {
  I_InitGraphics
}