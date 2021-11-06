import Map from "./map"
import WADLoader from "./wadLoader"

const SDL = require('@kmamal/sdl')
import { createCanvas } from 'canvas'

export default class Engine {

  // props
  #windowWidth: number = 800
  #windowHeight: number = 600
  #windowTitle: string = 'DOOM.js'

  isOver: boolean = false

  #wadLoader: WADLoader
  map: Map

  #sdlWindow: any
  #canvas: any
  #context: any

  ticspersecond: number = 35
  tickLength: number = 1000 / this.ticspersecond

  #lastTic = Date.now()

  constructor(wadFilepath: string = './DOOM.WAD', mapName: string = 'E1M1') {
    this.#wadLoader = new WADLoader(wadFilepath)
    this.map = new Map(mapName)
  }


  // methods
  init(): boolean {
    try {

      //init sdl window
      this.#sdlWindow = SDL.video.createWindow({ 
        title: this.#windowTitle,
        width: this.#windowWidth,
        height: this.#windowHeight
      })

      //init sdl inputs
      this.initInputsListeners()

      //init canvas
      this.#canvas = createCanvas(this.#windowWidth, this.#windowHeight)
      this.#context = this.#canvas.getContext('2d')

      //pass renderer to map
      if(!this.map.setContext(this.#context)) throw 'Error: could not set graphics context for map'

      //load data
      if(!this.#wadLoader.loadWAD()) throw 'Error: could not load the WAD file'
      if(!this.#wadLoader.loadMapData(this.map)) throw 'Error: could not load the map data'
      if(!this.map.initAutomap(this.#windowWidth, this.#windowHeight)) throw `Error: Failed to initialize automap of map ${this.map.getName()}`

      return true

    } catch (e) {
      console.error(e)
      return false
    }
  }

  gameLoop() {

    const now = Date.now()

    if(this.#lastTic + this.tickLength <= now) {

      this.#lastTic = now

      this.update()
      this.render()
      
    }

    if(Date.now() - this.#lastTic < this.tickLength - 16) {
      setTimeout(this.gameLoop.bind(this))
    } else {
      setImmediate(this.gameLoop.bind(this))
    }

  }

  render(): void {

    this.clearScreen()

    //render pipeline
    this.map.renderAutoMapWalls()
    this.map.renderAutoMapPlayer()
    this.map.renderBSPTree()

    //buffer conversion
    const buffer = this.#context.canvas.toBuffer('raw')

    //render buffer
    this.#sdlWindow.render(this.#windowWidth, this.#windowHeight, this.#windowWidth*4, 'bgra32', buffer)

  }

  initInputsListeners(): void {
    this.#sdlWindow.on('keyDown', (ev: any) => {
      switch(ev.key) {
        case '+' :
          this.map.zoomAutomap(true)
          this.map.initAutomap(this.#windowWidth, this.#windowHeight)
          break
        case '-':
          this.map.zoomAutomap(false)
          this.map.initAutomap(this.#windowWidth, this.#windowHeight)
          break
        case '.':
          this.map.toggleDebugBSPTraverse()
          break
        case '1':
          this.map.zoomBSPTraverseDepth(true)
          break
        case '0':
          this.map.zoomBSPTraverseDepth(false)
          break
      }
    })

  }

  quit(): void {
    this.isOver = false
  }

  update(): void {

  }

  clearScreen() {
    this.#context.clearRect(0,0,this.#windowWidth, this.#windowHeight)
    //this.#sdlWindow.render(this.#windowWidth, this.#windowHeight, this.#windowWidth*4, 'bgra32', Buffer.alloc(this.#windowWidth*this.#windowHeight*4))
  }

  getRenderWidth(): number {
    return this.#windowWidth
  }

  getRenderHeight(): number {
    return this.#windowHeight
  }

  getName(): string {
    return 'DOOM.js'
  }

}