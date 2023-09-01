import {
  Engine, Scene, Database,
  SceneOptimizerOptions, SceneOptimizer
} from "@babylonjs/core";
import Environment from "@/KE/render/environment/Environment";
import GUI from "@/KE/render/gui/GUI";
import Builder from "@/KE/render/builder/Builder";
import Debugger from "@/KE/render/debugger/Debugger";

export default class KE {
  static rendering = true
  static engine: Engine
  static scene: Scene
  static canvas: HTMLCanvasElement

  static initEngine(canvas: HTMLCanvasElement) {
    // 构造基本核心组件
    this.canvas = canvas
    const engine = new Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true})
    const scene = new Scene(KE.engine)
    // 储存至全局
    KE.engine = engine
    KE.scene = scene

    // 循环渲染即大小变化更新
    engine.runRenderLoop(function () {
      scene.render()
    })
    window.addEventListener('resize', e => engine.resize())

    // 设置完整性能释放
    engine.setDepthFunction(10)
    engine.doNotHandleContextLost = false
    engine.enableOfflineSupport = true
    Database.IDBStorageEnabled = true
  }

  static async render(canvas: HTMLCanvasElement) {
    // await this.waitBabylonLoaded()
    this.initEngine(canvas)

    Environment.init()
    GUI.init()

    Builder.build()

    Debugger.startDebug()

    setTimeout(() => {
      this.startOptimizer()
    }, 2000)
  }

  static startOptimizer() {
    // 分级降低画质自动优化性能
    console.log('Start run Scene optimizer')
    SceneOptimizer.OptimizeAsync(
      KE.scene,
      new SceneOptimizerOptions(45, 2000),
      function() {
        console.log('FPS target reached successfully')
      }, function() {
        console.log('FPS target not reached')
      }
    )
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

  static async waitBabylonLoaded() {
    // TODO: 页面BABYLON区异步加载
    return new Promise<void>((resolve, reject) => {
      if (Debugger.isDevelopmentEnv()) {
        resolve()
      } else {
        const w = window as any
        if (w.isBabylonLoaded) {
          resolve()
        } else {
          w.onBabylonLoaded = () => {
            resolve()
          }
        }
      }
    })
  }
}