import { Vertex } from './interfaces/map.interface'
import { normalize360 } from './utils/math'

export default class Player {

  #xPos: number
  #yPos: number
  #angle: number
  #playerId = 1

  #rotationSpeedFactor = 12
  #moveSpeedFactor = 4
  #FOV = 90

  constructor(xPos: number, yPos: number, angle:number, playerId = 1) {
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

  rotateLeft() {
    this.#angle = normalize360(this.#angle + (0.1875 * this.#rotationSpeedFactor))
  }

  rotateRight() {
    this.#angle = normalize360(this.#angle - (0.1875 * this.#rotationSpeedFactor))
  }

  vertexToAngle(vertex: Vertex) {
    const dx = vertex.xPosition - this.#xPos 
    const dy = vertex.yPosition - this.#yPos

    return normalize360(Math.atan2(dy, dx) * 180 / Math.PI)
  }

  clipVertexesInFOV(v1: Vertex, v2: Vertex) {

    let v1Angle = this.vertexToAngle(v1)
    let v2Angle = this.vertexToAngle(v2)

    //check if the seg is facing the same direction as the player
    const v1Tov2Span = normalize360(v1Angle - v2Angle)

    if(v1Tov2Span >= 180) {
      return false
    }

    //rotate all the angles to the first quadrant
    v1Angle = normalize360(v1Angle - this.#angle)
    v2Angle = normalize360(v2Angle - this.#angle)

    const halfFOV: number = this.#FOV / 2

    // virtual shifting of v1 to the first quadrant
    const v1Moved = normalize360(v1Angle + halfFOV)

    if(v1Moved > this.#FOV) {

      const v1MovedAngle: number = normalize360(v1Moved - this.#FOV)

      // are both V1 and V2 outside the fov
      if(v1MovedAngle >= v1Tov2Span) {
        return false
      }

      // clip v1
      v1Angle = halfFOV
      
    }

    //val & clip v2
    const v2Moved = normalize360(halfFOV - v2Angle)

    if(v2Moved > this.#FOV) {
      v2Angle = v2Angle - halfFOV
    }

    v1Angle = v1Angle + 90
    v2Angle = v2Angle + 90

    return true

  }

}