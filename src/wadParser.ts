import { Linedef, Vertex, Thing, Node, SubSector, Seg } from './interfaces/map.interface'
import { WADDirectory, WADHeader } from './interfaces/wadLoader.interface'

export default class WADParser {

  readHeaderData(wadBuffer: Buffer): WADHeader {
    return {
      wadType: wadBuffer.toString('utf8', 0, 0x04),
      directoryEntries: wadBuffer.readUInt32LE(0x04),
      directoryOffset: wadBuffer.readUInt32LE(0x08)
    }
  }

  readDirectoryData(wadBuffer: Buffer, directoryOffset: number, dirIndex: number): WADDirectory {
    return {
      lumpOffset: wadBuffer.readUInt32LE(directoryOffset + dirIndex*16),
      lumpSize: wadBuffer.readUInt32LE(directoryOffset + dirIndex*16 + 4),
      lumpName: wadBuffer.toString('utf8', directoryOffset + dirIndex*16 + 8, directoryOffset + dirIndex*16 + 16).replace(/\x00/g, '')
    }
  }

  readMapVertexData(wadBuffer: Buffer, vertexOffset: number): Vertex {
    return {
      xPosition: wadBuffer.readInt16LE(vertexOffset),
      yPosition: wadBuffer.readInt16LE(vertexOffset + 2)
    }
  }

  readMapLinedefData(wadBuffer: Buffer, linedefOffset: number): Linedef {
    return {
      startVertex: wadBuffer.readUInt16LE(linedefOffset),
      endVertex: wadBuffer.readUInt16LE(linedefOffset + 2),
      flags: wadBuffer.readUInt16LE(linedefOffset + 4),
      lineType: wadBuffer.readUInt16LE(linedefOffset + 6),
      sectorTag: wadBuffer.readUInt16LE(linedefOffset + 8),
      rightSidedef: wadBuffer.readUInt16LE(linedefOffset + 10),
      leftSidedef: wadBuffer.readUInt16LE(linedefOffset + 12)
    }
  }

  readMapThingData(wadBuffer: Buffer, thingOffset: number): Thing {
    return {
      xPosition: wadBuffer.readInt16LE(thingOffset),
      yPosition: wadBuffer.readInt16LE(thingOffset + 2),
      angle: wadBuffer.readUInt16LE(thingOffset + 4),
      type: wadBuffer.readUInt16LE(thingOffset + 6),
      flags: wadBuffer.readUInt16LE(thingOffset + 8)
    }
  }

  readMapNodeData(wadBuffer: Buffer, nodeOffset: number): Node {
    return {
      xPartition: wadBuffer.readInt16LE(nodeOffset),
      yPartition: wadBuffer.readInt16LE(nodeOffset + 2),
      changeXPartition: wadBuffer.readInt16LE(nodeOffset + 4),
      changeYPartition: wadBuffer.readInt16LE(nodeOffset + 6),
      rightBoxTop: wadBuffer.readInt16LE(nodeOffset + 8),
      rightBoxBottom: wadBuffer.readInt16LE(nodeOffset + 10),
      rightBoxLeft: wadBuffer.readInt16LE(nodeOffset + 12),
      rightBoxRight: wadBuffer.readInt16LE(nodeOffset + 14),
      leftBoxTop: wadBuffer.readInt16LE(nodeOffset + 16),
      leftBoxBottom: wadBuffer.readInt16LE(nodeOffset + 18),
      leftBoxLeft: wadBuffer.readInt16LE(nodeOffset + 20),
      leftBoxRight: wadBuffer.readInt16LE(nodeOffset + 22),
      rightChildIdx: wadBuffer.readUInt16LE(nodeOffset + 24),
      leftChildIdx: wadBuffer.readUInt16LE(nodeOffset + 26)
    }
  }

  readMapSubSectorData(wadBuffer: Buffer, sectorOffset: number): SubSector {
    return {
      segCount: wadBuffer.readUInt16LE(sectorOffset),
      firstSegIdx: wadBuffer.readUInt16LE(sectorOffset + 2)
    }
  }

  readMapSegData(wadBuffer: Buffer, segOffset: number): Seg {
    return {
      startVertex: wadBuffer.readUInt16LE(segOffset),
      endVertex: wadBuffer.readUInt16LE(segOffset + 2),
      angle: wadBuffer.readInt16LE(segOffset + 4),
      linedefIdx: wadBuffer.readUInt16LE(segOffset + 6),
      direction: wadBuffer.readUInt16LE(segOffset + 8),
      offset: wadBuffer.readInt16LE(segOffset + 10)
    }
  }

}