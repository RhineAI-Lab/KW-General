import {AbstractMesh, Mesh} from "@babylonjs/core"
import SE from "../../../SE/SE"
import Selection from "../selection/Selection"
import GUI from "../../../SE/render/gui/GUI";

export default class Clipboard {
  
  static copied: AbstractMesh[] = []
  
  static init() {
    this.copied = []
    document.addEventListener('keydown', e => {
      if (e.ctrlKey) {
        if (e.key === 'c') {
          this.copy()
        } else if (e.key === 'v') {
          this.paste()
        }
      }
    })
  }
  
  static copy(data: AbstractMesh[] = Selection.selected) {
    this.copied = data
  }
  
  static paste() {
    if (this.copied.length === 0) return
    const meshes: Mesh[] = []
    for (const mesh of this.copied) {
      try {
        const newMesh = mesh.clone(mesh.name, null, true) as Mesh
        newMesh.position = mesh.position.clone()
        newMesh.rotation = mesh.rotation.clone()
        newMesh.scaling = mesh.scaling.clone()
        if (mesh.material) {
          newMesh.material = mesh.material.clone("clone-" + mesh.uniqueId + "-material")
        }
        newMesh.parent = mesh.parent
        meshes.push(newMesh)
      } catch (e) {
        console.warn('AbstractMesh Error', e)
      }
    }
    Selection.add(meshes, true)
    SE.freshSelected(Selection.lastSelected, Selection.selected)
  }
  
}
