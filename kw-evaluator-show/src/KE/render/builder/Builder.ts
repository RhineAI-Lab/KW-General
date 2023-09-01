import {GradientMaterial} from "@babylonjs/materials";
import {Color3, CreateBox, Material, Mesh, StandardMaterial, Vector3} from "@babylonjs/core";
import KE from "../../KE";
import {result} from "@/App/tables/data/result";
import Writer from "./Writer";
import {TransformNode} from "@babylonjs/core";


// 搭建具体场景内容
export default class Builder {

  static COLUMN_SIZE = 0.3  // 柱子宽高
  static COLUMN_MARGIN = 0.1  // 柱子间隔
  static DATA_SH = 8  // 高度缩放
  static GRID_SIZE = this.COLUMN_SIZE + this.COLUMN_MARGIN

  static w = result.length * this.GRID_SIZE - Builder.COLUMN_MARGIN
  static h = Object.keys(result[0].score_level_2).length * this.GRID_SIZE - Builder.COLUMN_MARGIN

  static async build() {
    LoadingPage.setProgress(40, 'Create Cubes for Model Metric...')
    this.buildScore()
    LoadingPage.setProgress(60, 'Create Labels of Metric...')
    await this.buildLabel()
  }

  static buildScore() {
    const meshList: Mesh[] = []
    const materialList: GradientMaterial[] = []

    let hList: any[] = []
    result.map((line, i) => {
      let j = 0
      for (const k in line.score_level_2) {
        // @ts-ignore
        hList.push(line.score_level_2[k] * 1.2 - 0.1)
      }
    })
    let min = Math.min.apply(Math, hList)
    let max = Math.max.apply(Math, hList)
    let num = 60
    let step = (max - min) / num
    for (let i = 0; i < num; i++) {
      let v = min + step * i - step / 2
      let th = v * this.DATA_SH
      const material = new GradientMaterial("material_" + i, KE.scene)
      material.topColor = this.gray(1.04)
      material.bottomColor = this.gray(0.4)
      material.scale = 1 / th
      materialList.push(material)
    }

    result.map((line, i) => {
      let j = 0
      for (const k in line.score_level_2) {
        // @ts-ignore
        let v = line.score_level_2[k] * 1.2 - 0.1
        let mesh = Builder.addData('column_' + i + '_' + j, i, j, v)
        j++
        // mesh.parent = columnGroup
        let mi = Math.floor((v - min) / step)
        mesh.material = materialList[mi]
        meshList.push(mesh)
      }
    })

    let scoresMesh = Mesh.MergeMeshes(meshList, true, true, undefined, false, true)
    if (!scoresMesh) return
    scoresMesh.name = 'Scores data mesh'

    for (const gradient of materialList) {
      gradient.dispose()
    }
  }

  static async buildLabel() {
    const XAxisGroup = new TransformNode('X Axis Group')
    const YAxisGroup = new TransformNode('Y Axis Group')

    const material = new StandardMaterial("material_label", KE.scene)
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
      mesh.position = new Vector3(
        this.w + width / 2 + 0.14,
        -0.12,
        0.03 + j * this.GRID_SIZE
      )
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
      mesh.position = new Vector3(
        0.03 + i * this.GRID_SIZE + Builder.COLUMN_SIZE * 0.8,
        -0.12,
        -width / 2 - 0.14
      )
      mesh.rotation = new Vector3(Math.PI / 2, 0, Math.PI / 2)
      mesh.parent = YAxisGroup
      mesh.material = material
    })
  }

  static addData(name: string, x: number, y: number, h: number): Mesh {
    let th = h * Builder.DATA_SH
    const mesh = CreateBox(name, {
      width: Builder.COLUMN_SIZE,
      height: th,
      depth: Builder.COLUMN_SIZE,
    }, KE.scene)
    mesh.position = new Vector3(
      x * Builder.GRID_SIZE + this.COLUMN_SIZE / 2,
      th / 2,
      y * Builder.GRID_SIZE + this.COLUMN_SIZE / 2,
    )
    return mesh
  }

  static gray(num: number = 0): Color3 {
    return new Color3(num, num, num)
  }
}
