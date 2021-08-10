import { Canvas } from 'canvas'
import * as fs from 'fs'

import { Linedef, Vertex, AutomapLines, Thing } from "./interfaces/map.interface"
import Player from './player'

import { scaleBetween } from './utils/math'

export default class Map {

  #m_Name: string = ''
  #m_Vertexes: Vertex[] = []
  #m_Linedefs: Linedef[] = []
  #m_Things: Thing[] = []

  //things
  player1: Player = new Player(0,0,0)

  //indexes of directory
  idx_THINGS: number = 1
  idx_LINEDEFS: number = 0
  idx_SIDEDEFS: number = 0
  idx_VERTEXES: number = 0
  idx_SEGS: number = 0
  idx_SSECTORS: number = 0
  idx_NODES: number = 0
  idx_SECTORS: number = 0
  idx_REJECT: number = 0
  idx_BLOCKMAP: number = 0

  //automap
  automap_scaleFactor: number = 0.9
  automap_lines: AutomapLines[] = []
  vertexes_Xmin: number = 32767
  vertexes_Xmax: number = -32768
  vertexes_Ymin: number = 32767
  vertexes_Ymax: number = -32768
  
  constructor(mapName: string) {
    this.#m_Name = mapName
  }

  addVertex(vertex: Vertex): void {
    this.#m_Vertexes.push(vertex)

    this.vertexes_Xmin = (this.vertexes_Xmin > vertex.xPosition) ? vertex.xPosition : this.vertexes_Xmin
    this.vertexes_Xmax = (this.vertexes_Xmax < vertex.xPosition) ? vertex.xPosition : this.vertexes_Xmax
    this.vertexes_Ymin = (this.vertexes_Ymin > vertex.yPosition) ? vertex.yPosition : this.vertexes_Ymin
    this.vertexes_Ymax = (this.vertexes_Ymax < vertex.yPosition) ? vertex.yPosition : this.vertexes_Ymax

  }

  addLinedef(linedef: Linedef): void {
    this.#m_Linedefs.push(linedef)
  }

  addThing(thing: Thing): void {
    this.#m_Things.push(thing)
  }

  initThings(): boolean {

    if(this.#m_Things.length < 1) return false

    this.#m_Things.forEach(thing => {

      //player setup
      switch(thing.type) {
        case 1:
          this.player1 = new Player(thing.xPosition, thing.yPosition, thing.angle, 1)
          break
      }

    })

    return true

  }

  getName(): string {
    return this.#m_Name
  }

  initAutomap(windowWidth: number, windowHeight: number): boolean {
    try {

      this.automap_lines = []

      const automapStartX = windowWidth * (1 - this.automap_scaleFactor)
      const automapStartY = windowHeight * (1 - this.automap_scaleFactor)
      const automapEndX = windowWidth - (windowWidth * (1 - this.automap_scaleFactor))
      const automapEndY = windowHeight - (windowHeight * (1 - this.automap_scaleFactor))
    
      this.#m_Linedefs.forEach(linedef => {

        const vStart: Vertex = this.#m_Vertexes[linedef.startVertex]
        const vEnd: Vertex = this.#m_Vertexes[linedef.endVertex]

        this.automap_lines.push({
          vStart_xPos: scaleBetween(vStart.xPosition, automapStartX, automapEndX, this.vertexes_Xmin, this.vertexes_Xmax),
          vStart_yPos: windowHeight - scaleBetween(vStart.yPosition, automapStartY, automapEndY, this.vertexes_Ymin, this.vertexes_Ymax),
          vEnd_xPos: scaleBetween(vEnd.xPosition , automapStartX, automapEndX, this.vertexes_Xmin, this.vertexes_Xmax),
          vEnd_yPos: windowHeight - scaleBetween(vEnd.yPosition, automapStartY, automapEndY, this.vertexes_Ymin, this.vertexes_Ymax)
        })

      })

      return true
    
    } catch (e) {
      console.error(e)
      return false
    }
  }

  renderAutoMapWalls(canvasCtx: any): void {

    canvasCtx.strokeStyle = '#ffffff'

    this.automap_lines.forEach(line => {
      canvasCtx.beginPath()
      canvasCtx.moveTo(line.vStart_xPos, line.vStart_yPos)
      canvasCtx.lineTo(line.vEnd_xPos, line.vEnd_yPos)
      canvasCtx.closePath()
      canvasCtx.stroke()
    })

  }

  renderAutoMapPlayer(canvasCtx: any): void {

    const automapStartX = canvasCtx.canvas.width * (1 - this.automap_scaleFactor)
    const automapStartY = canvasCtx.canvas.height * (1 - this.automap_scaleFactor)
    const automapEndX = canvasCtx.canvas.width - (canvasCtx.canvas.width * (1 - this.automap_scaleFactor))
    const automapEndY = canvasCtx.canvas.height - (canvasCtx.canvas.height * (1 - this.automap_scaleFactor))

    const playerXpos = scaleBetween(this.player1.getXPosition(), automapStartX, automapEndX, this.vertexes_Xmin, this.vertexes_Xmax)
    const playerYpos = canvasCtx.canvas.height - scaleBetween(this.player1.getYPosition(), automapStartY, automapEndY, this.vertexes_Ymin, this.vertexes_Ymax)

    const radius = 5 - (5 * (1 - this.automap_scaleFactor))

    canvasCtx.beginPath()
    canvasCtx.arc(playerXpos, playerYpos, radius, 0, 2*Math.PI)
    canvasCtx.fillStyle = '#ff0000'
    canvasCtx.fill()

  }

  //Info
  printMapInfo(): void {

    console.log(`Map name: ${this.#m_Name}`)
    console.log(`-----------------`)

    console.log(`# Vertexes: ${this.#m_Vertexes.length}`)
    console.log(`# Linedefs: ${this.#m_Linedefs.length}\n`)

  }

  printVertexes(amount: number): void {

    console.log(`Total of Vertexes: ${this.#m_Vertexes.length} | shown: ${amount}\n`)
    
    for(let i = 0; i < amount; i++) {
      console.log(`Vertex ${i} | x: ${this.#m_Vertexes[i].xPosition} | y: ${this.#m_Vertexes[i].yPosition}`)
    }
    console.log('')
  }

  printLinedefs(amount: number): void {

    console.log(`Total of Linedefs: ${this.#m_Linedefs.length} | shown: ${amount}\n`)

    for(let i = 0; i < amount; i++) {
      console.log(`Linedef ${i} | startVertex: ${this.#m_Linedefs[i].startVertex} | endVertex: ${this.#m_Linedefs[i].endVertex} | flags: ${this.#m_Linedefs[i].flags} | linetype: ${this.#m_Linedefs[i].lineType} | sector tag: ${this.#m_Linedefs[i].sectorTag} | front sidedef: ${this.#m_Linedefs[i].frontSidedef} | back sidedef: ${this.#m_Linedefs[i].backSidedef}`)
    }
    console.log('')
  }

  printThings(amount: number): void {

    console.log(`Total of Things: ${this.#m_Things.length} | shown: ${amount}\n`)

    for(let i = 0; i < amount; i++) {
      console.log(`Thing ${i} | xPos: ${this.#m_Things[i].xPosition} | yPos: ${this.#m_Things[i].yPosition} | angle: ${this.#m_Things[i].angle} | type: ${this.#m_Things[i].type} | flags: ${this.#m_Things[i].flags}`)
    }
    console.log('')
  }

  dumpVertexesToFile(filename: string): void {
    try {

      if(fs.existsSync(filename)) {
        fs.unlinkSync(filename)
      }

      fs.appendFileSync(filename, `Vertexes from map ${this.#m_Name} in (x,y) format\n`)

      for(let i = 0; i < this.#m_Vertexes.length; i++) {
        fs.appendFileSync(filename, `(${this.#m_Vertexes[i].xPosition}, ${this.#m_Vertexes[i].yPosition})\n`)
      }

      console.log(`Vertexes from map ${this.#m_Name} dumped into ${filename}`)

    } catch (e) {
      console.error(e)
    }
  }

  dumpAutomapLinesToFile(filename: string): void {
    try {

      if(fs.existsSync(filename)) {
        fs.unlinkSync(filename)
      }

      fs.appendFileSync(filename, `Automap lines from map ${this.#m_Name} in "startX,startY,endX,endY" format\n`)

      this.automap_lines.forEach(line => {
        fs.appendFileSync(filename, `${line.vStart_xPos}, ${line.vStart_yPos}, ${line.vEnd_xPos}, ${line.vEnd_yPos}\n`)
      })

      console.log(`Automap lines from map ${this.#m_Name} dumped into ${filename}`)

    } catch (e) {
      console.error(e)
    }
  }

  dumpThingsToFile(filename: string): void {
    try {

      if(fs.existsSync(filename)) {
        fs.unlinkSync(filename)
      }

      fs.appendFileSync(filename, `Things from map ${this.#m_Name} in "xPos,yPos,angle,type,flags" format\n`)

      this.#m_Things.forEach(thing => {
        fs.appendFileSync(filename, `${thing.xPosition}, ${thing.yPosition}, ${thing.angle}, ${thing.type}, ${thing.flags}`)
      })

      console.log(`Automap lines from map ${this.#m_Name} dumped into ${filename}`)

    } catch (e) {
      console.error(e)
    }
  }

}