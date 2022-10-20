import Engine from './engine'

export default class Game {

  #DoomEngine: Engine

  constructor(wadFilepath = './DOOM.WAD', mapName = 'E1M1') {
    this.#DoomEngine = new Engine(wadFilepath, mapName)
  }

  init(): void {
    try {

      this.#DoomEngine.init()

    } catch (e) {
      console.error(e)
    }
  }

  initGameLoop(): void {
    this.#DoomEngine.gameLoop()
  }

  update(): void {
    //TODO
  }

  delay(): void {
    //TODO
  }

  isOver(): boolean {
    return this.#DoomEngine.isOver
  }

}