import {Vector3} from "@babylonjs/core";

export default class GeometryUtils {
  static getBlockDiagonalLength(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2))
  }
  
  static getPointDistance(p1: Vector3, p2: Vector3) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2))
  }
}