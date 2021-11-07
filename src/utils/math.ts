export function scaleBetween(unscaledNum: number, minAllowed: number, maxAllowed: number, min: number, max: number): number {
  return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed
}

export function normalize360(angle: number): number {
  
  angle = angle % 360
  if(angle < 0) {
    angle += 360
  }

  return angle
}