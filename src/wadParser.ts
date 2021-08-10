import { Linedef, Vertex, Thing } from "./interfaces/map.interface"
import { WADDirectory, WADHeader } from "./interfaces/wadLoader.interface"

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
      lumpName: wadBuffer.toString('utf8', directoryOffset + dirIndex*16 + 8, directoryOffset + dirIndex*16 + 16).replace(/\x00/g, "")
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
      frontSidedef: wadBuffer.readUInt16LE(linedefOffset + 10),
      backSidedef: wadBuffer.readUInt16LE(linedefOffset + 12)
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


}