import {AbstractMesh, Mesh} from "@babylonjs/core"
import SE from "@/SE/SE"
import Selection from "@/SE/operate/selection/Selection"
import StepManager from "@/App/Editor/StepsBar/StepManager";
import GUI from "@/SE/render/gui/GUI";

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
        for (const step of StepManager.data) {
          const state = step.getState(mesh.uniqueId)
          if (!state) continue
          const newState = state.clone()
          newState.uid = newMesh.uniqueId
          step.states.push(newState)
        }
        const state = StepManager.now().getState(newMesh.uniqueId)
        if (state && state.label) {
          GUI.setLabelText(newMesh, state.label)
        }
      } catch (e) {
        console.warn('AbstractMesh Error', e)
      }
    }
    Selection.add(meshes, true)
    SE.freshSelected(Selection.lastSelected, Selection.selected)
  }
  
}
