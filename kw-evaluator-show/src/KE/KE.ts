import {
  Engine, ArcRotateCamera, Color3, Color4, CreateBox,
  HemisphericLight, Scene, Vector3, Database,
  SceneOptimizerOptions, SceneOptimizer
} from "@babylonjs/core";
import Environment from "@/KE/render/environment/Environment";
import {GradientMaterial} from "@babylonjs/materials";
import {result} from "@/App/tables/data/result";
import GUI from "@/KE/render/gui/GUI";
import Builder from "@/KE/render/builder/Builder";
import Debugger from "@/KE/render/debugger/Debugger";

export default class KE {
  static rendering = true
  static engine: Engine
  static scene: Scene
  static canvas: HTMLCanvasElement

  static initEngine(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const engine = new Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true})
    engine.setDepthFunction(10)
    const scene = new Scene(KE.engine)

    engine.runRenderLoop(function () {
      scene.render()
    })
    window.addEventListener('resize', e => engine.resize())

    engine.doNotHandleContextLost = false
    engine.enableOfflineSupport = true
    Database.IDBStorageEnabled = true

    KE.engine = engine
    KE.scene = scene
  }

  static render(canvas: HTMLCanvasElement): void {
    this.initEngine(canvas)

    Environment.init()
    GUI.init()

    Builder.build()

    Debugger.startDebug()

    setTimeout(() => {
      console.log('Start run Scene optimizer')
      SceneOptimizer.OptimizeAsync(
        KE.scene,
        new SceneOptimizerOptions(50, 2000),
        function() {
          console.log('FPS target reached successfully')
        }, function() {
          console.log('FPS target not reached')
        }
      )
    }, 2000)
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