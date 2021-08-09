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

export interface AutomapLines {
  vStart_xPos: number;
  vStart_yPos: number;
  vEnd_xPos: number;
  vEnd_yPos: number;
}