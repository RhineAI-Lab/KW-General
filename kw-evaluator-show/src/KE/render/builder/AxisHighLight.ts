
import {Color3, CreateBox, Mesh, StandardMaterial, Vector3} from "@babylonjs/core";
import KE from "@/KE/KE";
import Builder from "@/KE/render/builder/Builder";

export default class AxisHighLight {

  static xbm: Mesh | null
  static ybm: Mesh | null

  static mb: Mesh | null

  static material: StandardMaterial
  static middleMaterial: StandardMaterial

  static init() {
    this.material = new StandardMaterial('Axis High Light Background', KE.scene)
    this.material.diffuseColor = Color3.FromHexString('#a2ff1f')
    this.middleMaterial = new StandardMaterial('Axis High Light Background', KE.scene)
    this.middleMaterial.diffuseColor = Color3.FromHexString('#222222')
    this.middleMaterial.alpha = 0.6
  }

  static remove() {
    this.xbm?.dispose()
    this.ybm?.dispose()
    this.mb?.dispose()
  }

  static set(x: number, y: number) {
    this.remove()

    let xb = Builder.xAxisMeshes[x].getBoundingInfo().boundingBox
    this.xbm = CreateBox('X Axis Background', {
      width: 0.46,
      height: 0.0001,
      depth: xb.extendSizeWorld.z * 2 + 0.2
    }, KE.scene)
    this.xbm.material = this.material
    this.xbm.position = new Vector3(xb.centerWorld.x, xb.centerWorld.y, xb.centerWorld.z - 0.05)

    let yb = Builder.yAxisMeshes[y].getBoundingInfo().boundingBox
    this.ybm = CreateBox('Y Axis Background', {
      width: yb.extendSizeWorld.x * 2 + 0.2,
      height: 0.0001,
      depth: 0.46
    }, KE.scene)
    this.ybm.material = this.material
    this.ybm.position = new Vector3(yb.centerWorld.x - 0.05, yb.centerWorld.y, yb.centerWorld.z)

    let column = Builder.getColumn(x, y)
    this.mb = CreateBox('Middle Background', {
      width: Builder.COLUMN_SIZE + 0.06,
      height: column.range.maxY - 0.001,
      depth: Builder.COLUMN_SIZE + 0.06,
    }, KE.scene)
    this.mb.position = column.center()
    this.mb.material = this.middleMaterial
  }

}
