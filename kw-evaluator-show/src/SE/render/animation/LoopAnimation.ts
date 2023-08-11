import {AbstractMesh, Animatable, Animation} from "@babylonjs/core";
import StepManager from "@/App/Editor/StepsBar/StepManager";
import SE from "@/SE/SE";
import MathUtils from "@/SE/utils/MathUtils";

export default class LoopAnimation {
  
  static animationMap: Map<number, Animatable> = new Map()
  
  static freshAnimation(mesh: AbstractMesh) {
    const uid = mesh.uniqueId
    const state = StepManager.now().getState(uid)
    if (!state) return
    this.stopAnimation(mesh)
  
    const name = StepManager.now().id + '-' + uid + '-animation'
    const fr = 10
    const animations: Animation[] = []
    
    if (state.spinX != 0) {
      animations.push(this.makeSpinAnimation(state.spinX, name, 'x', fr))
    }
    if (state.spinY != 0) {
      animations.push(this.makeSpinAnimation(state.spinY, name, 'y', fr))
    }
    if (state.spinZ != 0) {
      animations.push(this.makeSpinAnimation(state.spinZ, name, 'z', fr))
    }
    if (state.tripDisX != 0 && state.tripSpeedX != 0) {
      animations.push(this.makeTripAnimation(state.tripDisX, state.tripSpeedX, name, 'x', fr))
    }
    if (state.tripDisY != 0 && state.tripSpeedY != 0) {
      animations.push(this.makeTripAnimation(state.tripDisY, state.tripSpeedY, name, 'y', fr))
    }
    if (state.tripDisZ != 0 && state.tripSpeedZ != 0) {
      animations.push(this.makeTripAnimation(state.tripDisZ, state.tripSpeedZ, name, 'z', fr))
    }
    
    if (animations.length == 0) return
    const animation = SE.scene.beginDirectAnimation(mesh, animations, 0, 4 * fr, true)
    this.animationMap.set(uid, animation)
  }
  
  static stopAnimation(mesh: AbstractMesh) {
    const uid = mesh.uniqueId
    const state = StepManager.now().getState(uid)
    if (!state) return
    if (this.animationMap.has(uid)) {
      this.animationMap.get(uid)?.stop()
      this.animationMap.delete(uid)
    }
    mesh.position.x = state.px
    mesh.position.y = state.py
    mesh.position.z = state.pz
    mesh.rotation.x = MathUtils.toRadians(state.rx)
    mesh.rotation.y = MathUtils.toRadians(state.ry)
    mesh.rotation.z = MathUtils.toRadians(state.rz)
    mesh.scaling.x = state.sx
    mesh.scaling.y = state.sy
    mesh.scaling.z = state.sz
  }
  
  static freshAllAnimation() {
    for (const mesh of SE.scene.meshes) {
      this.freshAnimation(mesh)
    }
  }
  
  static stopAllAnimation() {
    this.animationMap.forEach(animation => animation.stop())
    this.animationMap.clear()
  }
  
  static makeTripAnimation(dis: number, speed: number, name: string, axis: string, fr: number) {
    const fps = Math.round(Math.abs(speed) / 2 / dis)
    const animation = new Animation(name + '-trip-' + axis, 'position.' + axis, fps, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
    const ssz = (speed > 0 && dis > 0) || (speed < 0 && dis < 0)
    animation.setKeys([{
      frame: 0,
      value: 0
    }, {
      frame: fr,
      value: ssz ? -dis : dis
    }, {
      frame: 2 * fr,
      value: 0
    }, {
      frame: 3 * fr,
      value: ssz ? dis : -dis
    }, {
      frame: 4 * fr,
      value: 0
    }])
    return animation
  }
  
  static makeSpinAnimation(value: number, name: string, axis: string, fr: number) {
    const fps = Math.round(Math.abs(value) / 2)
    const animation = new Animation(name + '-spin-' + axis, 'rotation.' + axis, fps, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
    const ssz = value > 0
    animation.setKeys([{
      frame: 0,
      value: ssz ? 0 : (2 * Math.PI)
    }, {
      frame: fr,
      value: Math.PI * (ssz ? 0.5 : 1.5)
    }, {
      frame: 2 * fr,
      value: Math.PI
    }, {
      frame: 3 * fr,
      value: Math.PI * (ssz ? 1.5 : 0.5)
    }, {
      frame: 4 * fr,
      value: ssz ? (2 * Math.PI) : 0
    }])
    return animation
  }
  
}
