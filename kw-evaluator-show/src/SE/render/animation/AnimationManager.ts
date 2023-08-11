import SE from "@/SE/SE";
import {AbstractMesh, Animation, AnimationPropertiesOverride, Color3} from "@babylonjs/core";
import StepClass from "@/App/Editor/StepsBar/Step.class";
import MathUtils from "@/SE/utils/MathUtils";
import GeneralUtils from "@/SE/utils/GeneralUtils";
import InfoDrawerControl from "@/App/Editor/InfoDrawer/InfoDrawerControl.object";

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
  
  static startAnimationsBetweenSteps (start: StepClass, end: StepClass) {
    for (const es of end.states) {
      const ss = start.getState(es.uid)
      const mesh = SE.scene.getMeshByUniqueId(es.uid)
      if (!ss || !mesh) continue
      const animations = []
      if (ss.px !== es.px) animations.push({name: 'xSlide', property: 'position.x', start: ss.px, end: es.px})
      if (ss.py !== es.py) animations.push({name: 'ySlide', property: 'position.y', start: ss.py, end: es.py})
      if (ss.pz !== es.pz) animations.push({name: 'zSlide', property: 'position.z', start: ss.pz, end: es.pz})
      if (ss.rx !== es.rx) animations.push({name: 'xRotate', property: 'rotation.x', start: MathUtils.toRadians(ss.rx), end: MathUtils.toRadians(es.rx)})
      if (ss.ry !== es.ry) animations.push({name: 'yRotate', property: 'rotation.y', start: MathUtils.toRadians(ss.ry), end: MathUtils.toRadians(es.ry)})
      if (ss.rz !== es.rz) animations.push({name: 'zRotate', property: 'rotation.z', start: MathUtils.toRadians(ss.rz), end: MathUtils.toRadians(es.rz)})
      if (ss.sx !== es.sx) animations.push({name: 'xScale', property: 'scaling.x', start: ss.sx, end: es.sx})
      if (ss.sy !== es.sy) animations.push({name: 'yScale', property: 'scaling.y', start: ss.sy, end: es.sy})
      if (ss.sz !== es.sz) animations.push({name: 'zScale', property: 'scaling.z', start: ss.sz, end: es.sz})
      if (ss.color.length > 0 && es.color.length > 0 && ss.color !== es.color) {
        animations.push({name: 'color', property: 'material.diffuseColor', start: ss.color, end: es.color})
      }
      if (ss.opacity !== es.opacity) animations.push({name: 'opacity', property: 'material.alpha', start: ss.opacity, end: es.opacity})
      if (es.uid === InfoDrawerControl.getTarget()?.uniqueId) {
        GeneralUtils.setInterval(() => {
          InfoDrawerControl.freshPosition(true, true, true)
          InfoDrawerControl.freshScaling(true, true, true)
          InfoDrawerControl.freshRotation(true, true, true)
        }, 50, 12)
      }
      this.startAnimations(mesh, animations)
    }
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
