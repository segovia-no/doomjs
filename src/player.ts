export default class Player {

  #xPos: number
  #yPos: number
  #angle: number
  #playerId: number = 1

  constructor(xPos: number, yPos: number, angle:number, playerId: number = 1) {
    this.#xPos = xPos
    this.#yPos = yPos
    this.#angle = angle
    this.#playerId = playerId
  }

  setXPosition(xPos: number): void {
    this.#xPos = xPos
  }

  setYPosition(yPos: number): void {
    this.#yPos = yPos
  }

  setAngle(angle: number): void {
    this.#angle = angle
  }

  getXPosition(): number {
    return this.#xPos
  }

  getYPosition(): number {
    return this.#yPos
  }

  getAngle(): number {
    return this.#angle
  }

  getPlayerId(): number {
    return this.#playerId
  }


}