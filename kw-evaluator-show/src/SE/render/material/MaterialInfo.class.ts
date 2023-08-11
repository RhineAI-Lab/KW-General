import {AbstractMesh} from "@babylonjs/core";
import {Material} from "@/SE/render/material/MaterialManager";


export class MaterialInfoClass {
  id: number
  name: string
  img: string
  make: (name: string, mesh: AbstractMesh) => Material
  color: string | null = null
  opacity: number | null = null
  
  constructor(
    id: number,
    name: string,
    img: string,
    make: (name: string, mesh: AbstractMesh) => Material,
    opacity: number | null = null,
    color: string | null = null,
  ) {
    this.id = id
    this.name = name
    this.img = img
    this.make = make
    this.color = color
    this.opacity = opacity
  }
}