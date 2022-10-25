import Map from './map'
import WADLoader from './wadLoader'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SDL = require('@kmamal/sdl')
import { createCanvas } from 'canvas'
import ViewRenderer from './viewRenderer'

export default class Engine {

  // props
  #windowWidth = 800
  #windowHeight = 600
  #windowTitle = 'DOOM.js'

  isOver = false

  #wadLoader: WADLoader
  map: Map

  #sdlWindow: any
  #canvas: any
  #context: any

  #viewRenderer: ViewRenderer

  ticspersecond = 35
  tickLength: number = 1000 / this.ticspersecond

  #lastTic = Date.now()

  constructor(wadFilepath = './DOOM.WAD', mapName = 'E1M1') {
    this.#wadLoader = new WADLoader(wadFilepath)
    this.#viewRenderer = new ViewRenderer(this.#windowWidth, this.#windowHeight)
    this.map = new Map(mapName, this.#viewRenderer)
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

      //pass renderer to dependencies
      if (!this.map.setContext(this.#context)) throw 'Error: could not set graphics context for map'
      if (!this.#viewRenderer.setContext(this.#context)) throw 'Error: could not set graphics context for view renderer'

      //load data
      if (!this.#wadLoader.loadWAD()) throw 'Error: could not load the WAD file'
      if (!this.#wadLoader.loadMapData(this.map)) throw 'Error: could not load the map data'

      //init rendering
      if (!this.map.initAutomap(this.#windowWidth, this.#windowHeight)) throw `Error: Failed to initialize automap of map ${this.map.getName()}`
      if (!this.#viewRenderer.initFrame()) throw 'Error: Failed to initialize frame (Solid wall clipping)'

      return true

    } catch (e) {
      console.error(e)
      return false
    }
  }

  gameLoop() {
    
    if (this.isOver) {
      this.#sdlWindow.destroy()
      return
    }

    const now = Date.now()

    if (this.#lastTic + this.tickLength <= now) {

      this.#lastTic = now

      this.update()
      this.render()
      
    }


    if (Date.now() - this.#lastTic < this.tickLength - 16) {
      setTimeout(this.gameLoop.bind(this))
    } else {
      setImmediate(this.gameLoop.bind(this))
    }

  }

  update(): void {
    //TODO
  }

  render(): void {

    this.clearScreen()

    //render pipeline
    this.map.render()

    //buffer conversion
    const buffer = this.#context.canvas.toBuffer('raw')

    //render buffer
    this.#sdlWindow.render(this.#windowWidth, this.#windowHeight, this.#windowWidth*4, 'bgra32', buffer)

  }

  initInputsListeners(): void {
    this.#sdlWindow.on('keyDown', (ev: any) => {
      switch (ev.key) {
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
      case '2':
        this.map.toggleDebugSSectorAnimation()
        break
      case 'left':
        this.map.player1.rotateLeft()
        break
      case 'right':
        this.map.player1.rotateRight()
        break
      case 'tab':
        this.map.toggleAutomap()
        break
      case 'escape':
        this.quit()
        break
      }
    })

  }

  quit(): void {
    this.isOver = true
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