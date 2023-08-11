import {AbstractMesh, Color3, PBRMaterial, PBRMetallicRoughnessMaterial, StandardMaterial} from "@babylonjs/core";
import {MaterialInfoClass} from "./MaterialInfo.class";
import MaterialManager, {Material} from "./MaterialManager";
import SE from "../../SE";


export default class MaterialFactory {
  
  static LIST: MaterialInfoClass[] = [
    new MaterialInfoClass(0, '默认材质', 'm0.jpg', this.standard),
    new MaterialInfoClass(1, '玻璃', 'm1.jpg', this.glass, 0.5),
    new MaterialInfoClass(2, '金属', 'm2.jpg', this.metal, 1),
    new MaterialInfoClass(3, '涂料', 'm4.jpg', this.coating, 1),
  ]
  
  static setMaterialWithColor(mesh: AbstractMesh, id: number = 0) {
    const info = this.getMaterialInfo(id)
    if (!info) return
    if (id != -1) {
      mesh.material = this.makeMaterial(id, mesh)
    }
    if (info.color || info.opacity) {
      this.setColorAlpha(mesh, mesh.material as PBRMaterial, info.color, info.opacity)
    }
  }
  
  static makeMaterial(id: number = 0, mesh: AbstractMesh): Material {
    const name = this.makeName(mesh, id)
    const info = this.getMaterialInfo(id)
    if (info) return info.make(name, mesh)
    return this.standard(name)
  }
  
  static getMeshMaterialInfo(mesh: AbstractMesh): MaterialInfoClass {
    const material = MaterialManager.getMaterial(mesh)
    const name = material.name
    const ns = name.split('-')
    if (ns.length != 3) return this.LIST[0]
    const id = parseInt(ns[1])
    if (isNaN(id)) return this.LIST[0]
    return this.getMaterialInfo(id)
  }
  
  static getMaterialInfo(id: number): MaterialInfoClass {
    for (const info of this.LIST) {
      if (info.id == id) return info
    }
    return this.LIST[0]
  }
  
  static makeName(mesh?: AbstractMesh, id: number = 0): string {
    let meshId = mesh ? mesh.uniqueId : 'unknown'
    const name = meshId + '-' + id + '-material'
    SE.scene.getMaterialByName(name)?.dispose()
    return name
  }
  
  static setColorAlpha(mesh: AbstractMesh, material: Material, color: string | null, alpha: number | null) {
    if (color && color.length == 0) color = null
    if (!color && alpha === null) return
  }
  
  static standard(name: string = '', mesh?: AbstractMesh): StandardMaterial {
    if (!name.length) name = this.makeName(mesh, 0)
    const material = new StandardMaterial(name, SE.scene)
    material.roughness = 1
    return material
  }
  
  static glass(name: string, mesh: AbstractMesh): PBRMaterial {
    if (!name.length) name = this.makeName(mesh, 1)
    const material = new PBRMaterial(name, SE.scene)
    material.metallic = 0.0
    material.roughness = 0.1
    return material
  }
  
  static metal(name: string, mesh: AbstractMesh): PBRMaterial {
    if (!name.length) name = this.makeName(mesh, 2)
    const material = new PBRMaterial(name, SE.scene)
    material.metallic = 1.0
    material.roughness = 0.4
    material.anisotropy.isEnabled = true
    material.anisotropy.intensity = Math.cos(3.1) * 0.5 + 0.5
    return material
  }
  
  static coating(name: string, mesh: AbstractMesh): PBRMaterial {
    if (!name.length) name = this.makeName(mesh, 2)
    const material = new PBRMaterial(name, SE.scene)
    material.metallic = 1.0
    material.roughness = 1.0
    material.clearCoat.isEnabled = true
    return material
  }
}
