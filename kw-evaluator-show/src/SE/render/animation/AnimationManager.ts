
import {AbstractMesh, Animation, AnimationPropertiesOverride, Color3} from "@babylonjs/core";
import SE from "../../SE";

export default class AnimationManager {
  
  static easeInOutQuad = this.makeEaseInOutQuad()
  
  static startAnimation(mesh: AbstractMesh, name: string, property: string, start: number, end: number) {
    if (isNaN(end)) return
    const fr = 4
    const animation = new Animation(name, property, 120, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
    const keyFrames = []
    for (let i = 0; i < this.easeInOutQuad.length; i++) {
      keyFrames.push({
        frame: i * fr,
        value: start + (end - start)  * this.easeInOutQuad[i]
      })
    }
    animation.setKeys(keyFrames)
    SE.scene.beginDirectAnimation(mesh, [animation], 0, fr * 12, false)
  }
  
  static startColorAnimation(mesh: AbstractMesh, name: string, property: string, start: Color3, end: Color3) {
    const animation = new Animation(name, property, 120, Animation.ANIMATIONTYPE_COLOR3, Animation.ANIMATIONLOOPMODE_CYCLE)
    animation.setKeys([
      {frame: 0, value: start},
      {frame: 48, value: end}
    ])
    SE.scene.beginDirectAnimation(mesh, [animation], 0, 48, false)
  }
  
  static startAnimations(mesh: AbstractMesh, animations: AnimationTask[]) {
    const as = []
    const fr = 4
    for (const animation of animations) {
      if (typeof animation.start === 'number' && typeof animation.end === 'number') {
        const a = new Animation(animation.name, animation.property, 96, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
        const keyFrames = []
        for (let i = 0; i < this.easeInOutQuad.length; i++) {
          keyFrames.push({
            frame: i * fr,
            value: animation.start + (animation.end - animation.start)  * this.easeInOutQuad[i]
          })
        }
        a.setKeys(keyFrames)
        as.push(a)
      } else {
        const a = new Animation(animation.name, animation.property, 96, Animation.ANIMATIONTYPE_COLOR3, Animation.ANIMATIONLOOPMODE_CYCLE)
        const keyFrames = []
        keyFrames.push({
          frame: 0,
          value: Color3.FromHexString(animation.start as string)
        })
        keyFrames.push({
          frame: 48,
          value: Color3.FromHexString(animation.end as string)
        })
        a.setKeys(keyFrames)
        as.push(a)
      }
    }
    SE.scene.beginDirectAnimation(mesh, as, 0, fr * 12, false)
  }
  
  static makeEaseInOutQuad () { // LENGTH 13
    const arr = [0]
    for (let i = 0; i <= 10; i++) {
      arr.push(((Math.atan(i / 2.5 - 2) + Math.PI / 2) / Math.PI - 0.13) * 50 / 37)
    }
    arr.push(1)
    return arr
  }
  
  
  
  static animationList = new Map()
  
  static add (name: string, animation: () => void) {
    this.animationList.set(name, animation)
  }
  
  static play (name: string) {
    const animation = this.animationList.get(name)
    if (animation) animation()
  }
  
  static dummy3AnimationInit(meshes: any, systems: any, skeletons: any) {
    const skeleton = skeletons[0]
  
    skeleton.animationPropertiesOverride = new AnimationPropertiesOverride()
    skeleton.animationPropertiesOverride.enableBlending = true
    skeleton.animationPropertiesOverride.blendingSpeed = 0.05
    skeleton.animationPropertiesOverride.loopMode = 1
  
    const idleRange = skeleton.getAnimationRange("YBot_Idle")
    const walkRange = skeleton.getAnimationRange("YBot_Walk")
    const runRange = skeleton.getAnimationRange("YBot_Run")
    const leftRange = skeleton.getAnimationRange("YBot_LeftStrafeWalk")
    const rightRange = skeleton.getAnimationRange("YBot_RightStrafeWalk")
  
    // IDLE
    if (idleRange) {
      SE.scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true)
    }
    AnimationManager.add('Idle', () => {
      if (idleRange) SE.scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true)
    })
    AnimationManager.add('Walk', () => {
      if (walkRange) SE.scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true)
    })
    AnimationManager.add('Run', () => {
      if (runRange) SE.scene.beginAnimation(skeleton, runRange.from, runRange.to, true)
    })
    AnimationManager.add('LeftStrafeWalk', () => {
      if (leftRange) SE.scene.beginAnimation(skeleton, leftRange.from, leftRange.to, true)
    })
    AnimationManager.add('RightStrafeWalk', () => {
      if (rightRange) SE.scene.beginAnimation(skeleton, rightRange.from, rightRange.to, true)
    })
  }
}

export interface AnimationTask {
  name: string
  property: string
  start: number | string
  end: number | string
}
