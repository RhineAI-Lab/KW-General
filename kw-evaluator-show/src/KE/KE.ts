import {
  Engine, ArcRotateCamera, Color3, Color4, CreateBox,
  HemisphericLight, Scene, Vector3
} from "@babylonjs/core";
import Environment from "@/KE/render/environment/Environment";
import {GradientMaterial} from "@babylonjs/materials";
import {result} from "@/App/tables/data/result";
import GUI from "@/KE/render/gui/GUI";
import Builder from "@/KE/render/builder/Builder";
import Debugger from "@/KE/render/debugger/Debugger";

export default class KE {
  static rendering = true
  static _engine: Engine
  static _scene: Scene
  static canvas: HTMLCanvasElement

  static initEngine(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    KE.engine = new Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true})
    KE.engine.setDepthFunction(10)
    KE.engine.enableOfflineSupport = false
    KE.scene = new Scene(KE.engine)
  }

  static render(canvas: HTMLCanvasElement): void {
    console.log('render')
    this.initEngine(canvas)

    KE.scene.clearColor = new Color4(0.9, 0.9, 0.9, 1)

    const camera = new ArcRotateCamera(
      "Main Camera",
      Math.PI / 4,
      Math.PI / 2.5,
      7,
      new Vector3(0, 0.6, 0),
      KE.scene
    )
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 0.005
    camera.upperRadiusLimit = 200
    camera.lowerBetaLimit = 0.2
    camera.upperBetaLimit = 3.13

    // camera.wheelDeltaPercentage = 0.5
    camera.pinchDeltaPercentage = 0.02
    camera.useBouncingBehavior = true
    camera.useNaturalPinchZoom = true

    const light = new HemisphericLight("light1", new Vector3(12, 16, 6), KE.scene)
    light.intensity = 1.0
    light.groundColor = new Color3(0.8, 0.8, 0.8)
    light.diffuse = new Color3(0.97, 0.97, 0.97)

    const addData = (x: number, y: number, h: number) => {
      const scale = 0.1
      const size = 0.6
      const sh = 2

      const material = new GradientMaterial("grad", KE.scene);
      material.topColor = new Color3(1.0, 1.0, 1.0); // Set the gradient top color
      material.bottomColor = new Color3(0.4, 0.4, 0.4); // Set the gradient bottom color
      material.offset = 0.6;

      const box = CreateBox('box1')
      box.material = material
      box.scaling = new Vector3(size * scale, h * sh, size * scale)
      box.position = new Vector3(x * scale, h / 2 * sh, y * scale)
    }

    result.map((line, i) => {
      let j = 0
      for (const k in line.score_level_2) {
        // @ts-ignore
        let v = line.score_level_2[k] * 1.2 - 0.1
        addData(i, j, v)
        j++
      }
    })

    // Environment.init()
    // GUI.init()

    // Builder.build()
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