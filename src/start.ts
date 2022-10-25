import Game from './game'

const game: Game = new Game('./DOOM.WAD', 'E1M1')
game.init()

game.initGameLoop()


