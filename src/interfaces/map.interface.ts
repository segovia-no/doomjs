/**
 * Vertex Interface
 *
 * @interface Vertex
 * @property {number} xPosition The x coordinate of the Vertex on the map (signed short - 2 bytes)
 * @property {number} yPosition The y coordinate of the Vertex on the map (signed short - 2 bytes)
 */
export interface Vertex {
  xPosition: number;
  yPosition: number;
}

/**
 * Linedef Interface
 *
 * @interface Linedef
 * @property {number} startVertex The vertex that the linedef starts (unsigned short - 2 bytes)
 * @property {number} endVertex The vertex that the linedef ends (unsigned short - 2 bytes)
 * @property {number} flags Linedef flags (unsigned short - 2 bytes)
 * @property {number} lineType Type of line / action (unsigned short - 2 bytes)
 * @property {number} sectorTag Sector tag (unsigned short - 2 bytes)
 * @property {number} rightSidedef The right face of the linedef (unsigned short - 2 bytes)
 * @property {number} leftSidedef The left face of the linedef (unsigned short - 2 bytes)
 */
export interface Linedef {
  startVertex: number;
  endVertex: number;
  flags: number;
  lineType: number;
  sectorTag: number;
  rightSidedef: number;
  leftSidedef: number;
}

/**
 * AutomapLines Interface
 *
 * @interface AutomapLines
 * @property {number} vStart_xPos The starting vertex "x" coordinate the an automap line (signed short - 2 bytes)
 * @property {number} vStart_yPos The starting vertex "y" coordinate the an automap line (signed short - 2 bytes)
 * @property {number} vEnd_xPos The ending vertex "x" coordinate the an automap line (signed short - 2 bytes)
 * @property {number} vEnd_yPos The ending vertex "y" coordinate the an automap line (signed short - 2 bytes)
 */
export interface AutomapLines {
  vStart_xPos: number;
  vStart_yPos: number;
  vEnd_xPos: number;
  vEnd_yPos: number;
}

/**
 * Thing Interface
 *
 * @interface Thing
 * @property {number} xPosition The x coordinate of the Thing on the map (signed short - 2 bytes)
 * @property {number} yPosition The y coordinate of the Thing on the map (signed short - 2 bytes)
 * @property {number} angle The facing angle of the Thing when positioned on the map (unsigned short - 2 bytes)
 * @property {number} type The type ID of the Thing (unsigned short - 2 bytes)
 * @property {number} flags The bytes that represent the flags of the Thing (unsigned short - 2 bytes)
 */
export interface Thing {
  xPosition: number;
  yPosition: number;
  angle: number;
  type: number;
  flags: number;
}

/**
 * Node Interface
 *
 * @interface Node
 * @property {number} xPartition The splitter partition line x coordinate (signed short - 2 bytes)
 * @property {number} yPartition The splitter partition line y coordinate (signed short - 2 bytes)
 * @property {number} changeXPartition Change in x to end of partition line (signed short - 2 bytes)
 * @property {number} changeYPartition Change in y to end of partition line (signed short - 2 bytes)
 * @property {number} rightBoxTop First corner of right box - y coord (signed short - 2 bytes)
 * @property {number} rightBoxBottom Second corner of right box - y coord (signed short - 2 bytes)
 * @property {number} rightBoxLeft First corner of right box - x coord (signed short - 2 bytes)
 * @property {number} rightBoxRight Second corner of right box - x coord (signed short - 2 bytes)
 * @property {number} leftBoxTop First corner of left box - y coord (signed short - 2 bytes)
 * @property {number} leftBoxBottom Second corner of left box - y coord (signed short - 2 bytes)
 * @property {number} leftBoxLeft First corner of left box - x coord (signed short - 2 bytes)
 * @property {number} leftBoxRight Second corner of left box - x coord (signed short - 2 bytes)
 * @property {number} rightChildIdx Index of the right child and sub-sector indicator (signed short - 2 bytes)
 * @property {number} leftChildIdx Index of the left child and sub-sector indicator (signed short - 2 bytes)
 */
export interface Node {
  xPartition: number;
  yPartition: number;
  changeXPartition: number;
  changeYPartition: number;
  rightBoxTop: number;
  rightBoxBottom: number;
  rightBoxLeft: number;
  rightBoxRight: number;
  leftBoxTop: number;
  leftBoxBottom: number;
  leftBoxLeft: number;
  leftBoxRight: number;
  rightChildIdx: number;
  leftChildIdx: number;
}

/**
 * SubSector Interface
 *
 * @interface SubSector
 * @property {number} segCount The number of segs that compose this sub-segment (unsigned short - 2 bytes)
 * @property {number} firstSegIdx The idx of the first seg in the seg list
 */
export interface SubSector {
  segCount: number;
  firstSegIdx: number;
}

/**
 * Seg Interface
 *
 * @interface Seg
 * @property {number} startVertex The starting vertex index of the seg (unsigned short - 2 bytes)
 * @property {number} endVertex The ending vertex index of the seg (unsigned short - 2 bytes)
 * @property {number} angle Angle of the vertex
 * @property {number} linedefIdx The linedefIdx associated with the seg
 * @property {number} direction 0 = same as linedef, 1 = reversed
 * @property {number} offset The offset of the seg from the linedef
 */
export interface Seg {
  startVertex: number;
  endVertex: number;
  angle: number;
  linedefIdx: number;
  direction: number;
  offset: number;
}

export type SolidSegmentRange = [number, number]

export interface SolidSegmentData {
  seg: Seg;
  v1XScreen: number;
  v2XScreen: number;
}