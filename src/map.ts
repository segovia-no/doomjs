import { Console } from 'console'
import * as fs from 'fs'

import { Linedef, Vertex, AutomapLines, Thing, Node, SubSector, Seg } from "./interfaces/map.interface"
import Player from './player'

import { scaleBetween } from './utils/math'

const SUBSECTORIDENTIFIER: number = 0x8000

export default class Map {

  #m_Name: string = ''
  #m_Vertexes: Vertex[] = []
  #m_Linedefs: Linedef[] = []
  #m_Things: Thing[] = []
  #m_Nodes: Node[] = []
  #m_SSectors: SubSector[] = []
  #m_Segs: Seg[] = []

  //engine
  #context: any

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
  #automapStartX: number = 0
  #automapStartY: number = 0
  #automapEndX: number = 0
  #automapEndY: number = 0

  automap_lines: AutomapLines[] = []
  vertexes_Xmin: number = 32767
  vertexes_Xmax: number = -32768
  vertexes_Ymin: number = 32767
  vertexes_Ymax: number = -32768

  //bsp tree
  renderCurrentBSPNode: boolean = false
  #debugBSPTraverse: boolean = false
  #debugBSPPath: number[] = []
  #debugBSPZoomDepth: number = 0

  //Sectors
  #debugSSectorAnimation: boolean = false
  #ssectorAnimationTick: number = 0
  #ssectorAnimationIdx: number = 0
  #ssectorAnimationStepIdx: any[] = []
  
  constructor(mapName: string) {
    this.#m_Name = mapName
  }

  setContext(context: any): boolean {

    if(!context.canvas.height) return false

    this.#context = context
    return true

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

  addNode(node: Node): void {
    this.#m_Nodes.push(node)
  }

  addSubSector(subsector: SubSector): void {
    this.#m_SSectors.push(subsector)
  }

  addSeg(seg: Seg): void {
    this.#m_Segs.push(seg)
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

      this.#automapStartX = windowWidth * (1 - this.automap_scaleFactor)
      this.#automapStartY = windowHeight * (1 - this.automap_scaleFactor)
      this.#automapEndX = windowWidth - (windowWidth * (1 - this.automap_scaleFactor))
      this.#automapEndY = windowHeight - (windowHeight * (1 - this.automap_scaleFactor))
    
      this.#m_Linedefs.forEach(linedef => {

        const vStart: Vertex = this.#m_Vertexes[linedef.startVertex]
        const vEnd: Vertex = this.#m_Vertexes[linedef.endVertex]

        this.automap_lines.push({
          vStart_xPos: this.remapXToScreen(vStart.xPosition),
          vStart_yPos: this.remapYToScreen(vStart.yPosition),
          vEnd_xPos: this.remapXToScreen(vEnd.xPosition),
          vEnd_yPos: this.remapYToScreen(vEnd.yPosition)
        })

      })

      return true
    
    } catch (e) {
      console.error(e)
      return false
    }
  }

  //map render pipeline
  render(): void {

    this.renderAutoMapWalls()
    this.renderAutoMapPlayer()
    this.renderBSPTree()
    this.animateRenderSectors()

  }

  renderAutoMapWalls(): void {

    if(this.#debugSSectorAnimation) return

    this.#context.strokeStyle = '#ffffff'

    this.automap_lines.forEach(line => {
      this.#context.beginPath()
      this.#context.moveTo(line.vStart_xPos, line.vStart_yPos)
      this.#context.lineTo(line.vEnd_xPos, line.vEnd_yPos)
      this.#context.closePath()
      this.#context.stroke()
    })

  }

  renderAutoMapPlayer(): void {

    const playerXpos = this.remapXToScreen(this.player1.getXPosition())
    const playerYpos = this.remapYToScreen(this.player1.getYPosition())

    const radius = 5 - (5 * (1 - this.automap_scaleFactor))

    this.#context.beginPath()
    this.#context.arc(playerXpos, playerYpos, radius, 0, 2*Math.PI)
    this.#context.fillStyle = '#ff0000'
    this.#context.fill()

  }

  renderAutoMapNode(nodeIdx: number): void {

    if(this.#m_Nodes.length < 1) return

    const node = this.#m_Nodes[nodeIdx]

    const rightBoxLeft = this.remapXToScreen(node.rightBoxLeft)
    const rightBoxTop = this.remapYToScreen(node.rightBoxTop)
    const rightBoxRight = this.remapXToScreen(node.rightBoxRight)
    const rightBoxBottom = this.remapYToScreen(node.rightBoxBottom)

    const leftBoxLeft = this.remapXToScreen(node.leftBoxLeft)
    const leftBoxTop = this.remapYToScreen(node.leftBoxTop)
    const leftBoxRight = this.remapXToScreen(node.leftBoxRight)
    const leftBoxBottom = this.remapYToScreen(node.leftBoxBottom)

    this.#context.strokeStyle = '#ff0000'
    this.#context.strokeRect(rightBoxLeft, rightBoxTop, rightBoxRight - rightBoxLeft, rightBoxBottom - rightBoxTop)

    this.#context.strokeStyle = '#00ff00'
    this.#context.strokeRect(leftBoxLeft, leftBoxTop, leftBoxRight - leftBoxLeft, leftBoxBottom - leftBoxTop)

    this.#context.strokeStyle = '#ffffff' //clear style

  }

  //BSP
  renderBSPTree(): void {
    this.traverseBSPNode(this.#m_Nodes.length - 1)
  }

  traverseBSPNode(nodeIdx: number, debugDepthIdx: number = 0): void {

    if(nodeIdx & SUBSECTORIDENTIFIER) {

      if(this.#debugSSectorAnimation) return

      this.renderSubSector(nodeIdx & ~SUBSECTORIDENTIFIER)
      return

    }

    if(this.#debugBSPTraverse) {

      this.#debugBSPPath[debugDepthIdx] = nodeIdx

      if(nodeIdx & SUBSECTORIDENTIFIER) { //if this is the last node, "end" the array
        this.#debugBSPPath.slice(debugDepthIdx + 1)
      }

      if(this.#debugBSPPath[this.#debugBSPZoomDepth] === nodeIdx) {
        this.renderAutoMapNode(nodeIdx)
      }

    }

    const isOnLeft = this.isPointOnLeftSide(this.player1.getXPosition(), this.player1.getYPosition(), nodeIdx)

    if(isOnLeft) {
      this.traverseBSPNode(this.#m_Nodes[nodeIdx].leftChildIdx, debugDepthIdx + 1)
    } else {
      this.traverseBSPNode(this.#m_Nodes[nodeIdx].rightChildIdx, debugDepthIdx + 1)
    }

  }

  //Sectors
  renderSubSector(subsectorId: number, color: string = 'ff0000'): void {
  
    const sector = this.#m_SSectors[subsectorId]

    for(let i = 0; i < sector.segCount; i++) {

      const seg = this.#m_Segs[sector.firstSegIdx + i]

      const vStart = this.#m_Vertexes[seg.startVertex]
      const vEnd   = this.#m_Vertexes[seg.endVertex]

      const startX = this.remapXToScreen(vStart.xPosition)
      const startY = this.remapYToScreen(vStart.yPosition)
      const endX   = this.remapXToScreen(vEnd.xPosition)
      const endY   = this.remapYToScreen(vEnd.yPosition)

      this.#context.strokeStyle = color

      this.#context.beginPath()
      this.#context.moveTo(startX, startY)
      this.#context.lineTo(endX, endY)
      this.#context.closePath()
      this.#context.stroke()

      this.#context.strokeStyle = '#ffffff'

    }

  }

  animateRenderSectors(): void {

    if(!this.#debugSSectorAnimation) return

    //render already generated ssectors
    for(let i = 0; i < this.#ssectorAnimationStepIdx.length; i++) {
      this.renderSubSector(this.#ssectorAnimationStepIdx[i][0], `#${this.#ssectorAnimationStepIdx[i][1]}`)
    }

    if(this.#m_SSectors.length == this.#ssectorAnimationIdx) return

    //generate new ssector
    if(this.#ssectorAnimationTick >= 1) {

      const randomColor = Math.floor(Math.random()*16777215).toString(16)
        
      this.#ssectorAnimationStepIdx.push([this.#ssectorAnimationIdx, randomColor])
      
      this.#ssectorAnimationTick = 0
      this.#ssectorAnimationIdx++

    } else {
      this.#ssectorAnimationTick++
    }

  }

  //Options
  zoomAutomap(zoomIn: boolean): void {
    if(zoomIn) {
      this.automap_scaleFactor += 0.01
    } else {
      this.automap_scaleFactor -= 0.01
    }
  }

  toggleDebugBSPTraverse(): void {
    this.#debugBSPTraverse = !this.#debugBSPTraverse
  }

  zoomBSPTraverseDepth(zoomIn: boolean): void {

    if(!this.#debugBSPTraverse) return

    if(zoomIn) {

      if(!this.#debugBSPPath[this.#debugBSPZoomDepth +1]) return
      this.#debugBSPZoomDepth++

    } else {

      if(this.#debugBSPZoomDepth === 0) return
      this.#debugBSPZoomDepth--
      
    }
  }

  toggleDebugSSectorAnimation(): void {

    this.#debugSSectorAnimation = !this.#debugSSectorAnimation

    if(this.#debugSSectorAnimation) {
      this.#ssectorAnimationIdx = 0
      this.#ssectorAnimationStepIdx = []
    }

  }

  //Utils
  isPointOnLeftSide(xPos: number, yPos: number, nodeIdx: number): boolean {

    const dx = xPos - this.#m_Nodes[nodeIdx].xPartition
    const dy = yPos - this.#m_Nodes[nodeIdx].yPartition

    return (((dx * this.#m_Nodes[nodeIdx].changeYPartition) - (dy * this.#m_Nodes[nodeIdx].changeXPartition)) <= 0)

  }

  remapXToScreen(xPos: number): number {
    return scaleBetween(xPos, this.#automapStartX, this.#automapEndX, this.vertexes_Xmin, this.vertexes_Xmax)
  }

  remapYToScreen(yPos: number): number {
    return this.#context.canvas.height - scaleBetween(yPos, this.#automapStartY, this.#automapEndY, this.vertexes_Ymin, this.vertexes_Ymax)
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