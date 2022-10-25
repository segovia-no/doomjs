import { Seg, SolidSegmentData, SolidSegmentRange } from './interfaces/map.interface'
import Player from './player'

export default class ViewRenderer {

  //engine
  #windowWidth = 800
  #windowHeight = 600
  #context: any

  //things
  player1: Player = new Player(0,0,0)

  //rendering
  #m_SolidWallRanges: SolidSegmentRange[] = []

  constructor(windowWidth: number, windowHeight: number) {
    this.#windowWidth = windowWidth
    this.#windowHeight = windowHeight
  }


  setContext(context: any): boolean {

    if (!context.canvas.height) return false

    this.#context = context
    return true

  }

  angleToScreen(angle: number): number {
    try {

      if (!this.#windowWidth) throw 'Error: no canvas dimensions set'
    
      let iX = 0

      //left side
      if (angle > 90) {

        angle -= 90
        iX = (this.#windowWidth / 2) - Math.round(Math.tan(angle * (Math.PI / 180)) * (this.#windowWidth / 2))

      } else {

        angle = 90 - angle
        iX = Math.round(Math.tan(angle * (Math.PI / 180)) * (this.#windowWidth / 2))
        iX += (this.#windowWidth / 2)

      }

      return iX

    } catch (e) {
      console.error(e)
      return 0
    }
  }

  addWallinFOV(v1Angle: number, v2Angle: number): void {

    const v1Screen = this.angleToScreen(v1Angle)
    const v2Screen = this.angleToScreen(v2Angle)

    const randomColor = Math.floor(Math.random()*16777215).toString(16)

    this.#context.strokeStyle = `#${randomColor}`

    //v1 render
    this.#context.beginPath()
    this.#context.moveTo(v1Screen, 0)
    this.#context.lineTo(v1Screen, this.#windowHeight)
    this.#context.closePath()
    this.#context.stroke()

    //v2 render
    this.#context.beginPath()
    this.#context.moveTo(v2Screen, 0)
    this.#context.lineTo(v2Screen, this.#windowHeight)
    this.#context.closePath()
    this.#context.stroke()


    this.#context.strokeStyle = '#ffffff'

  }

  initFrame(): boolean {
    try {

      this.#m_SolidWallRanges = []

      const leftSideWall: SolidSegmentRange = [-Infinity, -1]
      const rightSideWall: SolidSegmentRange = [this.#windowWidth, Infinity]

      this.#m_SolidWallRanges.push(leftSideWall, rightSideWall)

      return true

    } catch (e) {
      console.error(e)
      return false
    }
  }

  clipSolidWalls(seg: Seg, v1XScreen: number, v2XScreen: number): void {

    const currentWall: SolidSegmentRange = [v1XScreen, v2XScreen]

    let foundClipWallIdx = 0

    while (foundClipWallIdx < this.#m_SolidWallRanges.length && this.#m_SolidWallRanges[foundClipWallIdx][1] < currentWall[0]) {
      foundClipWallIdx++
    }

    //Case: update and insert is to the left side of foundClipWallIdx

    if (currentWall[1] < this.#m_SolidWallRanges[foundClipWallIdx][0]) {

      //is overlapping?
      if (currentWall[0] < this.#m_SolidWallRanges[foundClipWallIdx][0] - 1) {
        //all of wall is visible -> insert
        this.storeWallRange(seg, currentWall[0], currentWall[1])
        this.#m_SolidWallRanges.splice(foundClipWallIdx, 0, currentWall)
        return
      }

      // The end is already included, just update the start
      this.storeWallRange(seg, currentWall[0], this.#m_SolidWallRanges[foundClipWallIdx][0] - 1)
      this.#m_SolidWallRanges[foundClipWallIdx][0] = currentWall[0]

    }

  }

  storeWallRange(seg: Seg, v1XScreen: number, v2XScreen: number): void {

    const Wall: SolidSegmentData = {seg, v1XScreen, v2XScreen}
    this.drawSolidWall(Wall)

  }

  drawSolidWall(wall: SolidSegmentData): void {

    this.#context.fillStyle = '#ff0000'
    this.#context.rect(wall.v1XScreen, 0, wall.v2XScreen - wall.v1XScreen + 1, this.#windowHeight)
    this.#context.fill()

  }

}