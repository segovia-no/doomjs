import { Linedef, Vertex } from "./interfaces/map.interface"

export default class Map {

  #m_Name: string = ''
  #m_Vertexes: Vertex[] = []
  #m_Linedefs: Linedef[] = []

  //indexes
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

  constructor(mapName: string) {
    this.#m_Name = mapName
  }

  addVertex(vertex: Vertex): void {
    this.#m_Vertexes.push(vertex)
  }

  addLinedef(linedef: Linedef): void {
    this.#m_Linedefs.push(linedef)
  }

  getName(): string {
    return this.#m_Name
  }

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

}