import {Engine, Scene} from "@babylonjs/core";
import Environment from "@/KE/render/environment/Environment";
import GUI from "@/KE/render/gui/GUI";
import Builder from "@/KE/render/builder/Builder";
import Debugger from "@/KE/render/debugger/Debugger";

export default class KE {
  static rendering = false
  static _engine: Engine
  static _scene: Scene
  static canvas: HTMLCanvasElement

  static initEngine(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    KE.engine = new Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false})
    KE.engine.setDepthFunction(10)
    KE.engine.enableOfflineSupport = false
    KE.scene = new Scene(KE.engine)
  }

  static render(canvas: HTMLCanvasElement, model: string = '', cube: string = ''): void {
    this.initEngine(canvas)

    Environment.init()
    GUI.init()

    Builder.build()
    Debugger.startDebug()
  }

  static get engine () {
    return KE._engine
  }
  static set engine (engine: Engine) {
    KE._engine = engine
    window.addEventListener('resize', e => this.resize())
  }
  static get scene () {
    return KE._scene
  }
  static set scene (scene: Scene) {
    KE._scene = scene
    this.engine.runRenderLoop(function () {
      if (KE.rendering) scene.render()
    })
  }

  // 刷新引擎渲染尺寸
  // time: 持续刷新多长时间
  static resize(time: number = 0) {
    if (time === 0) {
      this.engine.resize()
    } else {
      const startTime = Date.now()
      const interval = setInterval(() => {
        this.engine.resize()
        if (Date.now() - startTime > time) {
          clearInterval(interval)
        }
      }, 10)
    }
  }
}