import {
  Engine,
  Scene,
  Database,
  SceneOptimizerOptions,
  SceneOptimizer,
  Viewport,
  ShadowsOptimization,
  MergeMeshesOptimization,
  LensFlaresOptimization,
  PostProcessesOptimization,
  TextureOptimization,
  HardwareScalingOptimization,
  ParticlesOptimization,
  RenderTargetsOptimization
} from "@babylonjs/core";
import Environment from "@/KE/render/environment/Environment";
import GUI from "@/KE/render/gui/GUI";
import Builder from "@/KE/render/builder/Builder";
import Debugger from "@/KE/render/debugger/Debugger";
import {sleep} from "@/KE/utils/GeneralUtils";

export default class KE {
  static rendering = true
  static engine: Engine
  static scene: Scene
  static canvas: HTMLCanvasElement
  static DPR = 1

  static initEngine(canvas: HTMLCanvasElement) {
    // 构造基本核心组件
    this.canvas = canvas
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    })
    const scene = new Scene(KE.engine)
    // 储存至全局
    KE.engine = engine
    KE.scene = scene

    // 适应多设备分辨率
    this.DPR = window.devicePixelRatio || 1
    console.log('Device pixel ratio:', this.DPR)
    // engine.setViewport(new Viewport(0, 0, 1, 1))

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
    // 全面优化
    this.optimizeAll()
  }

  static async render(canvas: HTMLCanvasElement) {
    LoadingPage.setProgress(25, 'Loading Babylon Engine...')

    // await this.waitBabylonLoaded()
    LoadingPage.setProgress(30, 'Initializing 3D Scene...')
    this.initEngine(canvas)

    Environment.init()
    GUI.init()

    await Builder.build()

    LoadingPage.setProgress(90, 'Verification Resources...')
    Debugger.startDebug()

    await sleep(500)
    LoadingPage.setProgress(94, 'Final Optimize...')
    // this.startOptimizer()

    await sleep(400)
    LoadingPage.setProgress(100, 'Finished.')
    await sleep(200)
    LoadingPage.hide()
  }

  static startOptimizer() {
    // 分级降低画质自动优化性能
    console.log('Start run Scene optimizer')
    SceneOptimizer.OptimizeAsync(
      KE.scene,
      new SceneOptimizerOptions(60, 2000),
      function() {
        console.log('FPS target reached successfully')
      }, function() {
        console.log('FPS target not reached')
      }
    )
  }

  static optimizeAll() {
    let optimizer = new SceneOptimizer(KE.scene)
    new ShadowsOptimization(0).apply(KE.scene, optimizer)
    new MergeMeshesOptimization(0).apply(KE.scene, optimizer)
    new LensFlaresOptimization(0).apply(KE.scene, optimizer)
    new PostProcessesOptimization(0).apply(KE.scene, optimizer)
    new TextureOptimization(0).apply(KE.scene, optimizer)
    // new HardwareScalingOptimization(0).apply(KE.scene, optimizer)
    new ParticlesOptimization(0).apply(KE.scene, optimizer)
    new RenderTargetsOptimization(0).apply(KE.scene, optimizer)
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
