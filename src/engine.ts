import Map from "./map"
import WADLoader from "./wadLoader"

const SDL = require('@kmamal/sdl')
import { createCanvas } from 'canvas'

export default class Engine {

  // props
  #windowWidth: number = 640
  #windowHeight: number = 480
  #windowTitle: string = 'DOOM.js'

  isOver: boolean = false

  #wadLoader: WADLoader
  #map: Map

  #sdlWindow: any
  #canvas: any
  #context: any

  constructor(wadFilepath: string = './DOOM.WAD', mapName: string = 'E1M1') {
    this.#wadLoader = new WADLoader(wadFilepath)
    this.#map = new Map(mapName)
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

      //load data
      if(!this.#wadLoader.loadWAD()) throw 'Error: could not load the WAD file'
      if(!this.#wadLoader.loadMapData(this.#map)) throw 'Error: could not load the map data'
      if(!this.#map.initAutomap(this.#windowWidth, this.#windowHeight)) throw `Error: Failed to initialize automap of map ${this.#map.getName()}`

      return true

    } catch (e) {
      console.error(e)
      return false
    }
  }


  render(): void {
    this.#sdlWindow.render(this.#windowWidth, this.#windowHeight, this.#windowWidth*4, 'bgra32', this.#map.renderAutoMap(this.#context))
  }

  initInputsListeners(): void {
    this.#sdlWindow.on('keyDown', (ev: any) => {
      console.log(ev)
    })

  }

  quit(): void {
    this.isOver = false
  }

  update(): void {

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