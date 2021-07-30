const fs = require('fs')

const WADParser = require('./wadParser')

module.exports = class WADLoader {

  //wad attrs
  filepath = null

  wadBuffer = null

  wadHeader = {
    wadType: null,
    directoryEntries: null,
    directoryOffset: null
  }

  wadDirectories = []
  
  //helpers
  wadParser = new WADParser()


  constructor(filepath) {
    this.filepath = filepath
  }

  openAndLoad() {
    try {

      const openedWAD = fs.openSync(this.filepath)
      const wadData = fs.readFileSync(openedWAD)

      this.wadBuffer = Buffer.from(wadData)

      //set header info
      this.wadHeader = this.wadParser.readHeaderData(this.wadBuffer)

    } catch (e) { console.error(e) }
  }

  readDirectories() {
    try {

      if(!this.wadBuffer) return console.log('Cannot read wad directories: No WAD loaded')
    
      for(let i = 0; i < this.directoryEntries; i++) {
        this.wadDirectories.push(this.wadParser.readDirectoryData(this.wadBuffer, this.wadHeader.directoryOffset))
      }

    } catch (e) { console.error(e) }
  }

}


