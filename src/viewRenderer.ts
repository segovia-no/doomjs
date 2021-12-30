import Player from "./player"

export default class ViewRenderer {

  //engine
  #windowWidth: number = 800
  #windowHeight: number = 600
  #context: any

  //things
  player1: Player = new Player(0,0,0)

  constructor(windowWidth: number, windowHeight: number) {
    this.#windowWidth = windowWidth
    this.#windowHeight = windowHeight
  }


  setContext(context: any): boolean {

    if(!context.canvas.height) return false

    this.#context = context
    return true

  }

  angleToScreen(angle: number): number {
    try {

      if(!this.#windowWidth) throw 'Error: no canvas dimensions set'
    
      let iX: number = 0

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

  addWallinFOV(v1Angle: number, v2Angle: number) {

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

}