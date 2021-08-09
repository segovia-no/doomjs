import Engine from './engine'

export default class Game {

  #DoomEngine: Engine

  constructor(wadFilepath: string = './DOOM.WAD', mapName: string = 'E1M1') {
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

  }

  delay(): void {

  }

  isOver(): boolean {
    return this.#DoomEngine.isOver
  }

}