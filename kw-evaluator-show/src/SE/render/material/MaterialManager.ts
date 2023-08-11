import {AbstractMesh, Color3, PBRMaterial, StandardMaterial} from "@babylonjs/core";
import MaterialFactory from "./MaterialFactory";

export default class MaterialManager {
  
  static defaultMaterial: Material
  static defaultBlueColor: string = '#0099ff'
  static defaultColor: string = '#ffffff'
  
  static init() {
    this.defaultMaterial = MaterialFactory.standard('default')
  }
  
  static getMaterial(mesh: AbstractMesh): Material {
    if (mesh.material == null) {
      this.makeDefaultMaterial(mesh)
    }
    return mesh.material as Material
  }
  
  static getColor(mesh: AbstractMesh): string {
    const material = this.getMaterial(mesh)
    if (material instanceof StandardMaterial) {
      return material.diffuseColor.toHexString()
    } else {
      return material.albedoColor.toHexString()
    }
  }
  
  static setColor(mesh: AbstractMesh, color: string) {
    if (color.length <= 0) return
    const material = this.getMaterial(mesh)
    if (material instanceof StandardMaterial) {
      material.diffuseColor = Color3.FromHexString(color)
    } else {
      material.albedoColor = Color3.FromHexString(color)
      material.emissiveColor = Color3.FromHexString(color)
      material.subSurface.tintColor = Color3.FromHexString(color)
    }
  }
  
  static getOpacity(mesh: AbstractMesh) {
    const material = this.getMaterial(mesh)
    return material.alpha
  }
  
  static setOpacity(mesh: AbstractMesh, opacity: number) {
    if (opacity == -1) return
    const material = this.getMaterial(mesh)
    material.alpha = opacity
  }
  
  static makeDefaultMaterial(mesh: AbstractMesh) {
    mesh.material = MaterialFactory.makeMaterial(0, mesh)
    this.setColor(mesh, this.defaultColor)
  }
}

export type Material = PBRMaterial | StandardMaterial
