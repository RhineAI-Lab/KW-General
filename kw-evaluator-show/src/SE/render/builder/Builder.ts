import {GradientMaterial} from "@babylonjs/materials";
import {Color3, CreateBox, Mesh, StandardMaterial, Vector3} from "@babylonjs/core";
import SE from "../../SE";
import {result} from "../../../App/tables/data/result";
import Writer from "./Writer";
import {TransformNode} from "@babylonjs/core/Meshes/transformNode";


export default class Builder {

  static COLUMN_SIZE = 0.3  // 柱子宽高
  static COLUMN_MARGIN = 0.1  // 柱子间隔
  static DATA_SH = 8  // 高度缩放
  static GRID_SIZE = this.COLUMN_SIZE + this.COLUMN_MARGIN

  static w = result.length * this.GRID_SIZE - Builder.COLUMN_MARGIN
  static h = Object.keys(result[0].score_level_2).length * this.GRID_SIZE - Builder.COLUMN_MARGIN

  static build() {
    this.buildScore()
    this.buildLabel().then(r => {})
    SE.scene.debugLayer.show().then(r => {})
  }

  static buildScore() {
    const columnGroup = new TransformNode('ColumnGroup')
    result.map((line, i) => {
      let j = 0
      for(const k in line.score_level_2) {
        // @ts-ignore
        let v = line.score_level_2[k] * 1.2 - 0.1
        let mesh = Builder.addData('column_' + i + '_' + j, i, j, v)
        j++
        mesh.parent = columnGroup
      }
    })
  }

  static async buildLabel() {
    const XAxisGroup = new TransformNode('XAxisGroup')
    const YAxisGroup = new TransformNode('YAxisGroup')

    const material = new StandardMaterial("material_label", SE.scene)
    material.diffuseColor = this.gray(0.1)

    await Writer.init()
    let j = 0
    for(const k in result[0].score_level_2) {
      let mesh: Mesh = Writer.write(k, {
        size: Builder.COLUMN_SIZE * 0.8,
        resolution: 2,
        depth: 0.01,
      })!
      const bound = mesh.getBoundingInfo().boundingBox;
      const width = bound.maximumWorld.x - bound.minimumWorld.x
      mesh.position = new Vector3(this.w + width / 2 + 0.14, -0.12,  0.03 + j * this.GRID_SIZE)
      mesh.rotation = new Vector3(Math.PI / 2, 0, 0)
      mesh.material = material
      j++
      mesh.parent = XAxisGroup
    }
    result.map((line, i) => {
      let mesh: Mesh = Writer.write(line.model, {
        size: Builder.COLUMN_SIZE * 0.8,
        resolution: 2,
        depth: 0.01,
      })!
      const bound = mesh.getBoundingInfo().boundingBox;
      const width = bound.maximumWorld.x - bound.minimumWorld.x
      mesh.position = new Vector3(0.03 + i * this.GRID_SIZE + Builder.COLUMN_SIZE * 0.8, -0.12,  -width / 2 - 0.14)
      mesh.rotation = new Vector3(Math.PI / 2, 0, Math.PI / 2)
      mesh.material = material
      mesh.parent = YAxisGroup
    })
  }

  static addData (name: string, x: number, y: number, h: number): Mesh {
    const material = new GradientMaterial("material_" + name + y, SE.scene)
    material.topColor = this.gray(0.99)
    material.bottomColor = this.gray(0.35)
    material.offset = 0.6

    const box = CreateBox(name)
    box.material = material
    box.scaling = new Vector3(Builder.COLUMN_SIZE, h * Builder.DATA_SH, Builder.COLUMN_SIZE)
    box.position = new Vector3(
      x * Builder.GRID_SIZE + this.COLUMN_SIZE / 2,
      h / 2 * Builder.DATA_SH,
      y * Builder.GRID_SIZE + this.COLUMN_SIZE / 2,
    )
    return box
  }

  static gray(num: number = 0): Color3 {
    return new Color3(num, num, num)
  }
}
