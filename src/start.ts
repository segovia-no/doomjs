import WADLoader from './wadLoader'
import Map from './map'

//program init
const wadLoader = new WADLoader('./DOOM.WAD')

wadLoader.loadWAD()

//new map
let map: Map = new Map('E1M1')
wadLoader.loadMapData(map)

map.printMapInfo()
map.printHeadVertexes(5)
map.printHeadLinedefs(5)



