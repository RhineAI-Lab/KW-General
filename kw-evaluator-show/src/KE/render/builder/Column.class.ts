import {Vector3} from "@babylonjs/core";

export default class Column{
  x = -1
  z = -1
  value = -1

  model = ''
  label = ''


  range = new V3Range()

  center() {
    return new Vector3(
      (this.range.minX + this.range.maxX) / 2,
      (this.range.minY + this.range.maxY) / 2,
      (this.range.minZ + this.range.maxZ) / 2
    )
  }
}

export class V3Range {
  minX: number = -1
  minY: number = -1
  minZ: number = -1

  maxX: number = -1
  maxY: number = -1
  maxZ: number = -1
}
