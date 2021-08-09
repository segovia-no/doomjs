import * as fs from 'fs'
import { Linedef, Vertex, AutomapLines } from "./interfaces/map.interface"
import { scaleBetween } from './utils/math'

export default class Map {

  #m_Name: string = ''
  #m_Vertexes: Vertex[] = []
  #m_Linedefs: Linedef[] = []

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

  getName(): string {
    return this.#m_Name
  }

  initAutomap(windowWidth: number, windowHeight: number): boolean {
    try {

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

  renderAutoMap(canvasCtx: any) {

    canvasCtx.strokeStyle = '#ff0000'

    this.automap_lines.forEach(line => {
      canvasCtx.beginPath()
      canvasCtx.moveTo(line.vStart_xPos, line.vStart_yPos)
      canvasCtx.lineTo(line.vEnd_xPos, line.vEnd_yPos)
      canvasCtx.closePath()
      canvasCtx.stroke()
    })

    return canvasCtx.canvas.toBuffer('raw')

  }

  //Info
  printMapInfo(): void {

    console.log(`Map name: ${this.#m_Name}`)
    console.log(`-----------------`)

    console.log(`# Vertexes: ${this.#m_Vertexes.length}`)
    console.log(`# Linedefs: ${this.#m_Linedefs.length}\n`)

  }

  printHeadVertexes(amount: number): void {
    for(let i = 0; i < amount; i++) {
      console.log(`Vertex ${i} | x: ${this.#m_Vertexes[i].xPosition} | y: ${this.#m_Vertexes[i].yPosition}`)
    }
    console.log('')
  }

  printHeadLinedefs(amount: number): void {
    for(let i = 0; i < amount; i++) {
      console.log(`Linedef ${i} | startVertex: ${this.#m_Linedefs[i].startVertex} | endVertex: ${this.#m_Linedefs[i].endVertex} | flags: ${this.#m_Linedefs[i].flags} | linetype: ${this.#m_Linedefs[i].lineType} | sector tag: ${this.#m_Linedefs[i].sectorTag} | front sidedef: ${this.#m_Linedefs[i].frontSidedef} | back sidedef: ${this.#m_Linedefs[i].backSidedef}`)
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

      fs.appendFileSync(filename, `Automap lines from map ${this.#m_Name} in (startX,startY,endX,endY) format\n`)

      this.automap_lines.forEach(line => {
        fs.appendFileSync(filename, `(${line.vStart_xPos}, ${line.vStart_yPos}, ${line.vEnd_xPos}, ${line.vEnd_yPos})\n`)
      })

      console.log(`Automap lines from map ${this.#m_Name} dumped into ${filename}`)

    } catch (e) {
      console.error(e)
    }
  }

}