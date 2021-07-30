module.exports = class WADParser {

  readHeaderData(wadBuffer) {
    return {
      wadType: wadBuffer.toString('utf8', 0, 0x04),
      directoryEntries: wadBuffer.readUInt32LE(0x04),
      directoryOffset: wadBuffer.readUInt32LE(0x08) 
    }
  }

  readDirectoryData(wadBuffer, directoryOffset) {
    return {
      lumpOffset: wadBuffer.readUInt32LE(directoryOffset + i*16),
      lumpSize: wadBuffer.readUInt32LE(directoryOffset + i*16 + 4),
      lumpName: wadBuffer.toString('utf8', directoryOffset + i*16 + 8, directoryOffset + i*16 + 16).replace(/\x00/g, "")
    }
  }

  readMapVertexData(wadBuffer, vertexOffset) {
    return {
      xPos: wadBuffer.readUInt16LE(vertexOffset),
      yPos: wadBuffer.readUInt16LE(vertexOffset + 2) 
    }
  }

  readMapLinedefData(wadBuffer, linedefOffset) {
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


}