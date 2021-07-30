const I_InitGraphics = require('./i_video').I_InitGraphics
const fs = require('fs')

const standard_iwads = [
  'doom2.wad',
  'plutonia.wad',
  'tnt.wad',
  'doom.wad',
  'freedoom2.wad',
  'freedoom1.wad',
  'freedm.wad'
]

let availableWADS = []

let nomonsters = false
let respawnparm = false
let fastparm = false

let internalWAD = null


function D_DoomMain() {
  
  /*
  FindResponseFile()  //  Looks for a response file
  IdentifyVersion()   //  Shareware or registered version check - DOOMjs assumes a registered version
  
  V_Init()            //  Video System
  M_LoadDefaults()    //  Load params from default.cfg
  Z_Init()            //  Memory Allocator ?? in javascript??
  */

  M_ListWads()
  M_LoadIWAD()

  M_Init()            //  Menu system
  R_Init()            //  Renderer
  P_Init()            //  Gameplay
  I_Init()            //  Implem. dependant
  D_CheckNetGame()
  S_Init()            //  Sound system
  HU_Init()           //  HUD
  ST_Init()           //  Status Bar
  

  D_DoomLoop()        //  just start already lmao
  

}

//  looks for the main game
function M_ListWads() {

  try {
    
    const files = fs.readdirSync('./')

    availableWADS = files.filter(file => file.split('.').pop().toLowerCase() == 'wad')

  } catch (err) {
    console.error(err)
  }

}

function M_LoadIWAD() {



}


//  The main game loop
function D_DoomLoop() {

  I_InitGraphics()

}

module.exports = {
  D_DoomMain
}