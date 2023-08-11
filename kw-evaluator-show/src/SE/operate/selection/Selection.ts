import {
  AbstractMesh,
  BoundingBoxGizmo,
  Color3,
  GizmoManager,
  HighlightLayer,
  Mesh, MultiPointerScaleBehavior, SixDofDragBehavior,
  UtilityLayerRenderer
} from "@babylonjs/core";
import SE from "@/SE/SE";
import GeneralUtils from "@/SE/utils/GeneralUtils";
import Environment from "@/SE/render/environment/Environment";
import StepManager from "@/App/Editor/StepsBar/StepManager";
import GUI from "@/SE/render/gui/GUI";
import InfoDrawerControl from "@/App/Editor/InfoDrawer/InfoDrawerControl.object";
import Manager from "@/SE/operate/manager/Manager";

export default class Selection {
  static highlightLayer: HighlightLayer | null = null
  static highlightColor = new Color3(0, 1, 1)
  
  static utilLayer: UtilityLayerRenderer | null = null
  static moveGizmo: GizmoManager | null = null
  static scaleGizmo: BoundingBoxGizmo | null = null
  
  static selected: Mesh[] = []
  static lastSelected: Mesh | null = null
  
  static delete() {
    if (this.selected.length > 0) {
      for (const mesh of this.selected) {
        GUI.removeLabel(mesh)
        for (const step of StepManager.data) {
          for (const si in step.states) {
            const state = step.states[si]
            if (state.uid === mesh.uniqueId) {
              step.states.splice(parseInt(si), 1)
              break
            }
          }
        }
        for (const model of Manager.project.models) {
          for (const ii in model.instances) {
            const instance = model.instances[ii]
            if (instance.uid == mesh.uniqueId) {
              model.instances.splice(parseInt(ii), 1)
            }
          }
        }
        mesh.dispose()
      }
      for (const mi in Manager.project.models) {
        const model = Manager.project.models[mi]
        console.log(model.instances)
        if (model.instances.length == 0) {
          Manager.project.models.splice(parseInt(mi), 1)
        }
      }
      this.clear()
      SE.freshSelected(null, [])
      if (SE.getDrawerState() == 2) {
        SE.setDrawerState(1)
      }
    }
  }
  
  
  static useMove() {
    // if (this.scaleGizmo) {
    //   this.scaleGizmo.attachedMesh = null
    // }
    if (this.moveGizmo) {
      this.moveGizmo.positionGizmoEnabled = true
      this.moveGizmo.rotationGizmoEnabled = true
      this.moveGizmo.scaleGizmoEnabled = false
      this.moveGizmo.attachToMesh(this.lastSelected)
      
      if (!this.moveGizmo.gizmos.positionGizmo!) return
      if (this.moveGizmo.gizmos.positionGizmo.xGizmo.dragBehavior.onDragObservable.observers.length > 2) return
      this.moveGizmo.gizmos.positionGizmo.xGizmo.dragBehavior.onDragObservable.add(() => {
        InfoDrawerControl.freshPosition(true, false, false)
      })
      this.moveGizmo.gizmos.positionGizmo.yGizmo.dragBehavior.onDragObservable.add(() => {
        InfoDrawerControl.freshPosition(false, true, false)
      })
      this.moveGizmo.gizmos.positionGizmo.zGizmo.dragBehavior.onDragObservable.add(() => {
        InfoDrawerControl.freshPosition(false, false, true)
      })
  
      if (!this.moveGizmo.gizmos.rotationGizmo!) return
      this.moveGizmo.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh = false
      this.moveGizmo.gizmos.rotationGizmo.xGizmo.dragBehavior.onDragObservable.add(() => {
        InfoDrawerControl.freshRotation(true, false, false)
      })
      this.moveGizmo.gizmos.rotationGizmo.yGizmo.dragBehavior.onDragObservable.add(() => {
        InfoDrawerControl.freshRotation(false, true, false)
      })
      this.moveGizmo.gizmos.rotationGizmo.zGizmo.dragBehavior.onDragObservable.add(() => {
        InfoDrawerControl.freshRotation(false, false, true)
      })
    }
  }
  
  static useScale() {
    // if (!this.scaleGizmo) {
    //   this.scaleGizmo = new BoundingBoxGizmo(Color3.FromHexString("#7c4acc"), this.utilLayer!)
    //   this.scaleGizmo.setEnabledRotationAxis('')
    //   this.scaleGizmo.setEnabledScaling(true, false)
    // }
    if (this.moveGizmo) {
      this.moveGizmo.positionGizmoEnabled = false
      this.moveGizmo.rotationGizmoEnabled = false
      this.moveGizmo.scaleGizmoEnabled = true
      this.moveGizmo.gizmos.scaleGizmo!.sensitivity = 3
      this.moveGizmo.attachToMesh(this.lastSelected)
  
      if (!this.moveGizmo.gizmos.scaleGizmo!) return
      if (this.moveGizmo.gizmos.scaleGizmo.xGizmo.dragBehavior.onDragObservable.observers.length > 2) return
      this.moveGizmo.gizmos.scaleGizmo.xGizmo.dragBehavior.onDragObservable.add(() => {
        InfoDrawerControl.freshScaling(true, false, false)
      })
      this.moveGizmo.gizmos.scaleGizmo.yGizmo.dragBehavior.onDragObservable.add(() => {
        InfoDrawerControl.freshScaling(false, true, false)
      })
      this.moveGizmo.gizmos.scaleGizmo.zGizmo.dragBehavior.onDragObservable.add(() => {
        InfoDrawerControl.freshScaling(false, false, true)
      })
    }
    // this.scaleGizmo.attachedMesh = this.lastSelected
    // if (this.scaleGizmo.onScaleBoxDragObservable.observers.length > 1) return
    // this.scaleGizmo.onScaleBoxDragObservable.add(() => {
    //   InfoDrawerControl.freshScaling(true, true, true)
    // });
  }
  
  static unUseAll() {
    this.moveGizmo!.positionGizmoEnabled = false
    this.moveGizmo!.rotationGizmoEnabled = false
    this.moveGizmo!.attachableMeshes = []
    this.moveGizmo!.attachToMesh(null)
    if (this.scaleGizmo) {
      this.scaleGizmo.attachedMesh = null
    }
  }
  
  static init() {
    this.highlightLayer = new HighlightLayer("hl1", SE.scene)
    this.utilLayer = new UtilityLayerRenderer(SE.scene)
    this.utilLayer.utilityLayerScene.autoClearDepthAndStencil = false
    this.moveGizmo = new GizmoManager(SE.scene)
    
    let [downX, downY] = [-1, -1]
    SE.scene.onPointerDown = (e) => {
      [downX, downY] = [e.clientX, e.clientY]
    }
    SE.scene.onPointerUp = (e, result) => {
      let picked = result?.pickedMesh
      if (picked?.name.indexOf('Ground') == 0) {
        picked = null
      } else if (picked?.name.indexOf('HDR Sky Box') == 0) {
        picked = null
      }
      if (this.selected.length == 1 && this.selected[0] == picked) {
        picked = null
      }
      if (picked) {
        Selection.add(picked as Mesh, !e.ctrlKey)
        SE.freshSelected(this.lastSelected, this.selected)
        if (SE.getDrawerState() == 1) {
          SE.setDrawerState(2)
        }
      } else if(!e.ctrlKey && GeneralUtils.getDistance(downX, downY, e.clientX, e.clientY) < 9) {
        Selection.clear()
        this.lastSelected = null
        SE.freshSelected(null, this.selected)
      }
    }
    
    SE.scene.onKeyboardObservable.add(result => {
      if (result.type === 2) {
        const e = result.event
        // console.log(e)
        if (e.key === 'Delete' || e.key === 'Backspace') {
          this.delete()
        } else if (e.key === ' ') {
          Environment.adjustCamera(this.selected)
        }
      }
    })
  }
  
  static add(meshes: Mesh | Mesh[], clear: boolean = true) {
    if (meshes instanceof Mesh) {
      meshes = [meshes]
    }
    if (clear) {
      this.clear()
    }
    for (const mesh of meshes) {
      this.selected.push(mesh)
      this.highlightLayer?.addMesh(mesh, this.highlightColor)
    }
    if (meshes.length > 0) {
      this.lastSelected = meshes[meshes.length - 1]
    }
  }
  
  static clear(remove = false) {
    for (const mesh of this.selected) {
      // mesh.behaviors.map(behavior => {
      //   mesh.removeBehavior(behavior)
      // })
      this.highlightLayer?.removeMesh(mesh)
    }
    this.selected = []
    this.unUseAll()
  }
  
  static addBehavior(mesh: AbstractMesh) {
    const sixDofDragBehavior = new SixDofDragBehavior()
    mesh.addBehavior(sixDofDragBehavior)
    const multiPointerScaleBehavior = new MultiPointerScaleBehavior()
    mesh.addBehavior(multiPointerScaleBehavior)
  }
}
