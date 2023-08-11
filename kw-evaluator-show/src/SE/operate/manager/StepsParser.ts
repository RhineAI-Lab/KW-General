import StepManager from "@/App/Editor/StepsBar/StepManager";
import Manager from "@/SE/operate/manager/Manager";
import {NodeState, State, Step} from "@/SE/operate/manager/data/Project";
import Model, {Instance} from "@/SE/operate/manager/data/Model";
import MeshState from "@/App/Editor/StepsBar/MeshState.class";
import StepClass from "@/App/Editor/StepsBar/Step.class";
import MaterialManager from "@/SE/render/material/MaterialManager";

export default class StepsParser {
  
  static uidMapper: number[][] = []
  
  static toInfo() {
    let steps = StepManager.data
    
    let uidList: number[] = []
    let mss = []
    for (const si in steps) {
      let step = steps[si]
      let nodes: State[] = []
      
      for (const state of step.states) {
        let uid = state.uid
        if (uidList.indexOf(uid) === -1) {
          uidList.push(uid)
        }
  
        let [model, instance] = this.getModelAndInstance(uid)
        if (!model || !instance) continue
        
        let node: State = {
          uid: state.uid,
          
          position: [state.px, state.py, state.pz],
          rotation: [state.rx, state.ry, state.rz],
          scaling: [state.sx, state.sy, state.sz],
          
          spin: [state.spinX, state.spinY, state.spinZ],
          tripDis: [state.tripDisX, state.tripDisY, state.tripDisZ],
          tripSpeed: [state.tripSpeedX, state.tripSpeedY, state.tripSpeedZ],
          
          color: state.color,
          opacity: state.opacity,
          material: state.material,
          label: state.label,
          
          children: [],
        }
        nodes.push(node)
      }
  
      let ms: Step = {
        title: 'STEP ' + (parseInt(si) + 1),
        description: step.message,
        nodes: nodes,
      }
      mss.push(ms)
    }
    Manager.project.steps = mss
    
  }
  
  static toState() {
    let mss = Manager.project.steps
    console.log('Info Steps:', mss)
    console.log('Info Models:', Manager.project.models)
    let steps: StepClass[] = []
    for (const msi in mss) {
      let ms = mss[msi]
      let id = parseInt(msi) + 1
      let step = new StepClass(id, id == 1)
      step.message = ms.description || ''
      for (const node of ms.nodes) {
        let [model, instance] = this.getModelAndInstance(node.uid)
        if (!model || !instance) continue
        
        let state = new MeshState()
        state.uid = node.uid
        state.px = node.position[0]
        state.py = node.position[1]
        state.pz = node.position[2]
        state.rx = node.rotation[0]
        state.ry = node.rotation[1]
        state.rz = node.rotation[2]
        state.sx = node.scaling[0]
        state.sy = node.scaling[1]
        state.sz = node.scaling[2]
        
        try {
          let ns: any = node
          if (ns.spin == undefined) ns.spin = [0, 0, 0]
          if (ns.tripDis == undefined) ns.tripDis = [0, 0, 0]
          if (ns.tripSpeed == undefined) ns.tripSpeed = [100, 100, 100]
          if (ns.color == undefined) ns.color = MaterialManager.defaultBlueColor
          if (ns.opacity == undefined) ns.opacity = 1
          if (ns.material == undefined) ns.material = 0
          if (ns.label == undefined) ns.label = ''
          
          state.spinX = ns.spin[0]
          state.spinY = ns.spin[1]
          state.spinZ = ns.spin[2]
          state.tripDisX = ns.tripDis[0]
          state.tripDisY = ns.tripDis[1]
          state.tripDisZ = ns.tripDis[2]
          state.tripSpeedX = ns.tripSpeed[0]
          state.tripSpeedY = ns.tripSpeed[1]
          state.tripSpeedZ = ns.tripSpeed[2]
          state.color = ns.color
          state.opacity = ns.opacity
          state.material = ns.material
          state.label = ns.label
        } catch (e) {
        }
        step.states.push(state)
      }
      steps.push(step)
    }
    console.log(steps)
    StepManager.data = steps
    StepManager.fresh()
    StepManager.select(1)
  }
  
  static getModelAndInstance(uid: number): [Model | undefined, Instance | undefined] {
    for (const model of Manager.project.models) {
      for (const instance of model.instances) {
        if (instance.uid === uid) {
          return [model, instance]
        }
      }
    }
    return [undefined, undefined]
  }
}
