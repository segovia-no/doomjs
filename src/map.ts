import { Linedef, Vertex, AutomapLines, Thing, Node, SubSector, Seg } from './interfaces/map.interface'
import Player from './player'
import { dumpMapLumpDataToFile, logMapLumpData } from './utils/log'

import { scaleBetween } from './utils/math'
import ViewRenderer from './viewRenderer'

const SUBSECTORIDENTIFIER = 0x8000

export default class Map {

  #m_Name = ''
  #m_Vertexes: Vertex[] = []
  #m_Linedefs: Linedef[] = []
  #m_Things: Thing[] = []
  #m_Nodes: Node[] = []
  #m_SSectors: SubSector[] = []
  #m_Segs: Seg[] = []

  //engine
  #context: any
  #viewRenderer: ViewRenderer

  //things
  player1: Player = new Player(0,0,0)

  //indexes of directory
  idx_THINGS = 1
  idx_LINEDEFS = 0
  idx_SIDEDEFS = 0
  idx_VERTEXES = 0
  idx_SEGS = 0
  idx_SSECTORS = 0
  idx_NODES = 0
  idx_SECTORS = 0
  idx_REJECT = 0
  idx_BLOCKMAP = 0

  //automap
  #enableAutomap = false
  automap_scaleFactor = 0.9
  #automapStartX = 0
  #automapStartY = 0
  #automapEndX = 0
  #automapEndY = 0

  automap_lines: AutomapLines[] = []
  vertexes_Xmin = 32767
  vertexes_Xmax = -32768
  vertexes_Ymin = 32767
  vertexes_Ymax = -32768

  //bsp tree
  renderCurrentBSPNode = false
  #debugBSPTraverse = false
  #debugBSPPath: number[] = []
  #debugBSPZoomDepth = 0

  //Sectors
  #debugSSectorAnimation = 0
  #ssectorAnimationTick = 0
  #ssectorAnimationIdx = 0
  #ssectorAnimationStepIdx: any[] = []
  
  constructor(mapName: string, viewRenderer: ViewRenderer) {
    this.#m_Name = mapName
    this.#viewRenderer = viewRenderer
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

    if(this.#enableAutomap){
      this.renderAutoMapWalls()
      this.renderAutoMapPlayer()
      this.renderBSPTree()
      this.animateRenderSSegs()
    }

    this.renderSegsInFOV()

  }

  renderAutoMapWalls(): void {

    if(this.#debugSSectorAnimation !== 0) return

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

  traverseBSPNode(nodeIdx: number, debugDepthIdx = 0): void {

    //render player subsector
    if(nodeIdx & SUBSECTORIDENTIFIER) {

      if(this.#debugSSectorAnimation !== 0) return

      this.renderSegsFromSubSector(nodeIdx & ~SUBSECTORIDENTIFIER)
      return

    }

    //render bsp node childs
    if(this.#debugBSPTraverse) {

      this.#debugBSPPath[debugDepthIdx] = nodeIdx

      if(nodeIdx & SUBSECTORIDENTIFIER) { //if this is the last node, "end" the array
        this.#debugBSPPath.slice(debugDepthIdx + 1)
      }

      if(this.#debugBSPPath[this.#debugBSPZoomDepth] === nodeIdx) {
        this.renderAutoMapNode(nodeIdx)
      }

    }

    //recursion
    const isOnLeft = this.isPointOnLeftSide(this.player1.getXPosition(), this.player1.getYPosition(), nodeIdx)

    if(isOnLeft) {
      this.traverseBSPNode(this.#m_Nodes[nodeIdx].leftChildIdx, debugDepthIdx + 1)
    } else {
      this.traverseBSPNode(this.#m_Nodes[nodeIdx].rightChildIdx, debugDepthIdx + 1)
    }

  }

  //Sectors, Subsectors, Segs
  renderSeg(seg: Seg, color = 'ff0000'): void {

    const vStart: Vertex = this.#m_Vertexes[seg.startVertex]
    const vEnd: Vertex = this.#m_Vertexes[seg.endVertex]

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

  renderSegsFromSubSector(subsectorId: number, color = 'ff0000'): void {

    if(this.#debugSSectorAnimation !== 1) return
  
    const sector = this.#m_SSectors[subsectorId]

    for(let i = 0; i < sector.segCount; i++) {
      this.renderSeg(this.#m_Segs[sector.firstSegIdx + i], color)
    }

  }

  renderSegsInFOV() {

    for(let i = 0; i < this.#m_Segs.length; i++) {

      const vStart = this.#m_Vertexes[this.#m_Segs[i].startVertex]
      const vEnd   = this.#m_Vertexes[this.#m_Segs[i].endVertex]

      if(this.player1.clipVertexesInFOV(vStart, vEnd)) {

        const v1x = this.player1.vertexToAngle(vStart)
        const v2x = this.player1.vertexToAngle(vEnd)

        if(this.#m_Linedefs[this.#m_Segs[i].linedefIdx].leftSidedef !== 0xFFFF) {
          this.#viewRenderer.addWallinFOV(v1x, v2x)
        }
        
        if(this.#debugSSectorAnimation == 3 && this.#enableAutomap) {
          this.renderSeg(this.#m_Segs[i])
        }

      }

    }

  }

  animateRenderSSegs(): void {

    if(this.#debugSSectorAnimation !== 1) return

    //render already generated ssectors
    for(let i = 0; i < this.#ssectorAnimationStepIdx.length; i++) {
      this.renderSegsFromSubSector(this.#ssectorAnimationStepIdx[i][0], `#${this.#ssectorAnimationStepIdx[i][1]}`)
    }

    if(this.#m_SSectors.length == this.#ssectorAnimationIdx) return

    //generate new ssector
    if(this.#ssectorAnimationTick >= 1) {

      if(this.#m_SSectors.length == this.#ssectorAnimationIdx) return

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

  toggleAutomap(): void {
    this.#enableAutomap = !this.#enableAutomap
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

    switch(this.#debugSSectorAnimation) {
    case 0:
      this.#debugSSectorAnimation++
      break
    case 1:
      this.#debugSSectorAnimation++
      break
    case 2:
      this.#debugSSectorAnimation++
      this.#ssectorAnimationIdx = 0
      this.#ssectorAnimationStepIdx = []
      break
    case 3:
      this.#debugSSectorAnimation = 0
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
    console.log('-----------------')

    console.log(`# Vertexes: ${this.#m_Vertexes.length}`)
    console.log(`# Linedefs: ${this.#m_Linedefs.length}`)
    console.log(`# Things: ${this.#m_Things.length}`)
    console.log(`# SubSectors: ${this.#m_SSectors.length}`)
    console.log(`# Segs: ${this.#m_Segs.length}\n`)

  }

  logVertexes(amount: number): void {
    logMapLumpData(this.#m_Vertexes, 'Vertex', this.#m_Name, amount)
  }

  logLinedefs(amount: number): void {
    logMapLumpData(this.#m_Linedefs, 'Linedef', this.#m_Name, amount)
  }

  logThings(amount: number): void {
    logMapLumpData(this.#m_Things, 'Thing', this.#m_Name, amount)
  }

  logSubSectors(amount: number): void {
    logMapLumpData(this.#m_SSectors, 'Subsector', this.#m_Name, amount)
  }

  dumpVertexesToFile(): boolean {
    return dumpMapLumpDataToFile(this.#m_Vertexes, 'Vertexes', this.#m_Name)
  }

  dumpAutomapLinesToFile(): boolean {
    return dumpMapLumpDataToFile(this.automap_lines, 'Automaplines', this.#m_Name)
  }

  dumpThingsToFile(): boolean {
    return dumpMapLumpDataToFile(this.#m_Things, 'Things', this.#m_Name)
  }

  dumpSubSectorsToFile(): boolean {
    return dumpMapLumpDataToFile(this.#m_SSectors, 'Subsectors', this.#m_Name)
  }

  dumpSegsToFile(): boolean {
    return dumpMapLumpDataToFile(this.#m_Segs, 'Segs', this.#m_Name)
  }

}