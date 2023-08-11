import {
  ArcRotateCamera,
  Color3, CreateGround,
  Material,
  Mesh,
  PBRMaterial,
  Scene,
  StandardMaterial,
  VertexData
} from "@babylonjs/core";
import SE from "@/SE/SE";
import {maxProcesses} from "concurrently/dist/src/defaults";
import Environment from "@/SE/render/environment/Environment";

export default class TransformGround {
  
  static createGround() {
  
    const material1 = new StandardMaterial("ground-material", SE.scene)
    material1.diffuseColor = new Color3(1.2, 1.2, 1.2)
    material1.alpha = 0.2
    const ground = CreateGround("Ground", {width: 128, height: 128})
    ground.material = material1
    ground.receiveShadows = true
    
    const g1 = this.createGroundSize(128, 1)
    const g10 = this.createGroundSize(32, 0.1)
  
    setInterval(() => {
      // 获取摄像头信息
      let y = Environment.camera.position.y
      if (y <= 0) y = 10
      
      // 更新地面显示情况
      let a10 = 1 / y * 1.2 - 0.3
      let a1 = y * 0.3 - 0.2
      if (a10 < 0.05 ) a10 = 0
      if (a10 > 0.35) a10 = 0.35
      if (a1 < 0.05 ) a1 = 0
      if (a1 > 0.35) a1 = 0.35
      g10.material!.alpha = a10
      g1.material!.alpha = a1
      
      // 更新摄像头雾化范围
      let dis = 16 * y - 3
      if (dis > 70) dis = 70
      if (dis < 7) dis = 7
      Environment.setCameraDistance(dis * 1.2)
    }, 100)
  }
  
  // 创建指定密度的地面三角面结构
  // size除以unit为偶数 是线条数量
  static createGroundSize(size: number, unit: number) {
    const ni = "-" + (1 / unit)
    const ground = new Mesh("Ground" + ni, SE.scene)
    const vertexData = new VertexData()
  
    const positions = []
    const indices = []
    
    const t = 0.016 * unit
    const hs = size / 2
    const p1 = -hs - t
    const p2 = hs + t
    let n = 0
    
    for (let i = -hs; i <= hs; i += unit) {
      positions.push(
        i - t, 0, p1,
        i - t, 0, p2,
        i + t, 0, p1,
        i + t, 0, p2,
      )
      indices.push(n, 2 + n, 1 + n, 1 + n, 2 + n, 3 + n)
      n += 4
    }
    for (let i = -hs; i < hs; i += unit) {
      for (let p = -hs; p <= hs; p += unit) {
        positions.push(
          i + t, 0, p - t,
          i + unit - t, 0, p - t,
          i + t, 0, p + t,
          i + unit - t, 0, p + t,
        )
        indices.push(n, 1 + n, 2 + n, 2 + n, 1 + n, 3 + n)
        n += 4
      }
    }
    
    vertexData.normals = []
    vertexData.positions = positions
    vertexData.indices = indices
    VertexData.ComputeNormals(vertexData.positions, vertexData.indices, vertexData.normals)
    
    const material = new StandardMaterial("ground-material" + ni, SE.scene)
    material.diffuseColor = new Color3(0.85, 0.85, 0.85)
    material.roughness = 10
  
    vertexData.applyToMesh(ground)
    ground.material = material
    ground.position.y = 0
    ground.receiveShadows = true
    return ground
  }
  
}
