export function scaleBetween(unscaledNum: number, minAllowed: number, maxAllowed: number, min: number, max: number): number {
  return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed
}

export function normalize360(angle: number): number {
  angle = angle % 360
  angle = (angle < 0) ? angle + 360 : angle

  return angle
}