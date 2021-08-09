import Game from './game'

//program init
// const wadLoader = new WADLoader('./DOOM.WAD')

// wadLoader.loadWAD()

// //new map
// let map: Map = new Map('E1M1')
// wadLoader.loadMapData(map)

// map.printMapInfo()
// map.printHeadVertexes(5)
// map.printHeadLinedefs(5)

const game: Game = new Game('./DOOM.WAD', 'E1M1')
game.init()

game.initGameLoop()


