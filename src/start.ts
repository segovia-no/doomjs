import WADLoader from './wadLoader'

//program init
const wadLoader = new WADLoader('./DOOM.WAD')

wadLoader.openAndLoad()
wadLoader.readDirectories()

