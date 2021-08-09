export interface Vertex {
  xPosition: number;
  yPosition: number;
}

export interface Linedef {
  startVertex: number;
  endVertex: number;
  flags: number;
  lineType: number;
  sectorTag: number;
  frontSidedef: number;
  backSidedef: number;
}