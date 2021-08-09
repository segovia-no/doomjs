import * as fs from 'fs'
import WADParser from './wadParser'

import { WADDirectory } from './interfaces/wadLoader.interface'

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

  openAndLoad() {
    try {

      const openedWAD = fs.openSync(this.filepath, 'r')
      const wadData = fs.readFileSync(openedWAD)

      this.wadBuffer = Buffer.from(wadData)

      //set header info
      const { wadType, directoryEntries, directoryOffset } = this.wadParser.readHeaderData(this.wadBuffer)

      this.wadType = wadType
      this.directoryEntries = directoryEntries
      this.directoryOffset = directoryOffset

    } catch (e) { console.error(e) }
  }

  readDirectories() {
    try {

      if(!this.wadBuffer) return console.log('Cannot read wad directories: No WAD loaded')
    
      for(let i = 0; i < this.directoryEntries; i++) {
        this.wadDirectories.push(this.wadParser.readDirectoryData(this.wadBuffer, this.directoryOffset, i))
      }

      console.log(this.wadDirectories)

    } catch (e) { console.error(e) }
  }

}


