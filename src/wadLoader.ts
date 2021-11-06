import * as fs from 'fs'
import WADParser from './wadParser'

import { WADDirectory } from './interfaces/wadLoader.interface'

import Map from './map'

export default class WADLoader {

  //wad attrs
  filepath: string

  wadBuffer: Buffer = Buffer.alloc(1)

  wadType: string = ''
  directoryEntries: number = 0
  directoryOffset: number = 0

  wadDirectories: WADDirectory[] = []
  
  //helpers
  wadParser = new WADParser()


  constructor(filepath: string) {
    this.filepath = filepath
  }

  //Opening methods
  loadWAD(): boolean {

    if(!this.openAndLoad()) return false

    if(!this.readDirectories()) return false

    return true

  }


  openAndLoad(): boolean {
    try {

      if(this.filepath == '') throw 'Cannot load WAD: No WAD filename specified'

      const openedWAD = fs.openSync(this.filepath, 'r')
      const wadData = fs.readFileSync(openedWAD)

      this.wadBuffer = Buffer.from(wadData)

      //set header info
      const { wadType, directoryEntries, directoryOffset } = this.wadParser.readHeaderData(this.wadBuffer)

      this.wadType = wadType
      this.directoryEntries = directoryEntries
      this.directoryOffset = directoryOffset

      return true

    } catch (e) { 
      console.error(e)
      return false
    }
  }

  readDirectories(): boolean {
    try {

      if(!this.wadBuffer) throw 'Cannot read WAD directories: theres no WAD buffer'
    
      for(let i = 0; i < this.directoryEntries; i++) {
        this.wadDirectories.push(this.wadParser.readDirectoryData(this.wadBuffer, this.directoryOffset, i))
      }

      return true

    } catch (e) {
      console.error(e)
      return false
    }
  }


  //Map related methods
  loadMapData(map: Map): boolean {
    try {

      if(!this.setMapLumpsIndexes(map)) throw `Error: Failed to set lumps indexes of map ${map.getName()}`

      if(!this.readMapVertexes(map)) throw `Error: Failed to load vertexes of map ${map.getName()}`

      if(!this.readMapLinedefs(map)) throw `Error: Failed to load linedefs of map ${map.getName()}`

      if(!this.readMapThings(map)) throw `Error: Failed to load things of map ${map.getName()}`

      if(!this.readMapNodes(map)) throw `Error: Failed to load nodes of map ${map.getName()}`

      return true

    } catch (e) {
      console.error(e)
      return false
    }
  }

  findMapIndex(map: Map): number {
    return this.wadDirectories.findIndex(lump => lump.lumpName == map.getName())
  }

  setMapLumpsIndexes(map: Map): boolean {

    const mapIndex: number = this.findMapIndex(map)
    if(mapIndex == -1) return false

    const finalLumpIdx = mapIndex + 10

    for(let i = mapIndex; i <= finalLumpIdx; i++ ) {
      switch(this.wadDirectories[i].lumpName) {
        case 'THINGS':
          map.idx_THINGS = i
          break
        case 'LINEDEFS':
          map.idx_LINEDEFS = i
          break
        case 'SIDEDEFS':
          map.idx_SIDEDEFS = i
          break
        case 'VERTEXES':
          map.idx_VERTEXES = i
          break
        case 'SEGS':
          map.idx_SEGS = i
          break
        case 'SSECTORS':
          map.idx_SSECTORS = i
          break
        case 'NODES':
          map.idx_NODES = i
          break
        case 'SECTORS':
          map.idx_SECTORS = i
          break
        case 'REJECT':
          map.idx_REJECT = i
          break
        case 'BLOCKMAP':
          map.idx_BLOCKMAP = i
          break
      }
    }

    return true

  }

  readMapVertexes(map: Map): boolean {

    if(map.idx_VERTEXES == 0) return false

    const vertexesCount = this.wadDirectories[map.idx_VERTEXES].lumpSize / 4 // each vertex is 4 bytes long

    for(let i = 0; i < vertexesCount; i++) {
      map.addVertex( this.wadParser.readMapVertexData(this.wadBuffer, this.wadDirectories[map.idx_VERTEXES].lumpOffset + i*4) )
    }

    return true

  }

  readMapLinedefs(map: Map): boolean {

    if(map.idx_LINEDEFS == 0) return false

    const linedefsCount = this.wadDirectories[map.idx_LINEDEFS].lumpSize / 14 // each linedef is 14 bytes long

    for(let i = 0; i < linedefsCount; i++) {
      map.addLinedef( this.wadParser.readMapLinedefData(this.wadBuffer, this.wadDirectories[map.idx_LINEDEFS].lumpOffset + i*14) )
    }

    return true

  }

  readMapThings(map: Map): boolean {

    if(map.idx_THINGS == 0) return false

    const thingsCount = this.wadDirectories[map.idx_THINGS].lumpSize / 10 // each thing is 10 bytes long

    for(let i = 0; i < thingsCount; i++) {
      map.addThing( this.wadParser.readMapThingData(this.wadBuffer, this.wadDirectories[map.idx_THINGS].lumpOffset + i*10))
    }

    if(!map.initThings()) return false

    return true

  }

  readMapNodes(map: Map): boolean {

    if(map.idx_NODES == 0) return false

    const nodesCount = this.wadDirectories[map.idx_NODES].lumpSize / 28 // each node is 28 bytes long

    for(let i = 0; i < nodesCount; i++) {
      map.addNode( this.wadParser.readMapNodeData(this.wadBuffer, this.wadDirectories[map.idx_NODES].lumpOffset + i*28))
    }

    return true

  }

}


