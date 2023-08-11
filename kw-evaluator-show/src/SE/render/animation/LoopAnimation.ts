import {AbstractMesh, Animatable, Animation} from "@babylonjs/core";
import SE from "../../SE";

export default class LoopAnimation {
  
  static animationMap: Map<number, Animatable> = new Map()
  
  static freshAnimation(mesh: AbstractMesh) {
    const uid = mesh.uniqueId
  }
  
  static stopAnimation(mesh: AbstractMesh) {
    const uid = mesh.uniqueId
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
