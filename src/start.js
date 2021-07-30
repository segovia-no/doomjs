const WADLoader = require('./wadLoader')


//program init
const wadLoader = new WADLoader('./DOOM.WAD')

wadLoader.openAndLoad()
wadLoader.readDirectories()

console.log(wadLoader.wadHeader)

