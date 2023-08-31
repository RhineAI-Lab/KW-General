import KE from "../../KE"
import {
  AbstractMesh, ArcRotateCamera, Color3, Color4, HemisphericLight,
  CreateGround, CubeTexture, Light, Mesh, VertexData,
  PointerEventTypes, Scene, ShadowGenerator, Vector3
} from "@babylonjs/core"
import GeometryUtils from "../../utils/GeometryUtils";

export default class Environment {

  static camera: ArcRotateCamera
  static lights: Light[] = []
  static shadow: ShadowGenerator
  static environmentTexture: CubeTexture

  static init() {
    // 设置环境背景色
    let gray = 0.9
    this.setBackgroundColor(new Color3(gray, gray, gray))

    // 设置背景方块
    const scene = KE.scene

    // 创建相机
    this.initCamera()
    // 创建全方位光源
    this.initLight()
  }

  static adjustCamera(models: AbstractMesh[] | AbstractMesh) {
    if (Array.isArray(models) && models.length === 0) return
    if (!Array.isArray(models)) models = [models]
    const min = models[0].getBoundingInfo().boundingBox.minimumWorld
    const max = models[0].getBoundingInfo().boundingBox.maximumWorld
    for (const model of models) {
      const min1 = model.getBoundingInfo().boundingBox.minimumWorld
      const max1 = model.getBoundingInfo().boundingBox.maximumWorld
      if (min1.x < min.x) min.x = min1.x
      if (min1.y < min.y) min.y = min1.y
      if (min1.z < min.z) min.z = min1.z
      if (max1.x > max.x) max.x = max1.x
      if (max1.y > max.y) max.y = max1.y
      if (max1.z > max.z) max.z = max1.z
    }
    this.camera.target = new Vector3((max.x + min.x) / 2, (max.y + min.y) / 2, (max.z + min.z) / 2)
    this.camera.alpha = Math.PI / 4
    this.camera.beta = Math.PI / 2.5
    this.camera.radius = GeometryUtils.getPointDistance(min, max) / 2 * 3
  }

  static addShadows(meshes: AbstractMesh[] | AbstractMesh) {
    if (Array.isArray(meshes)) {
      for (const mesh of meshes) {
        this.shadow.addShadowCaster(mesh)
      }
    } else {
      this.shadow.addShadowCaster(meshes)
    }
  }

  static initLight() {
    // const light1 = new HemisphericLight(
    //   "Hemispheric Light",
    //   new Vector3(-40, -80, -4),
    //   KE.scene
    // )
    // light1.intensity = 0.55
    // light1.groundColor = new Color3(1, 1, 1)
    //
    // const light2 = new DirectionalLight(
    //   "Directional Light Main",
    //   new Vector3(24, 32, 12),
    //   KE.scene
    // )
    // light2.intensity = 0.3
    // light2.shadowMinZ = 1
    // light2.shadowMaxZ = 200
    //
    // const light3 = new DirectionalLight(
    //   "Directional Light Sub",
    //   new Vector3(-30, -45, 30),
    //   KE.scene
    // )
    // light3.intensity = 0.2

    const light = new HemisphericLight("light1", new Vector3(12, 16, 6), KE.scene)
    light.intensity = 1.0
    light.groundColor = new Color3(0.8, 0.8, 0.8)
    light.diffuse = new Color3(0.97, 0.97, 0.97)

    // const shadow = new ShadowGenerator(1024, light)
    // shadow.setDarkness(0.1)
    // shadow.useBlurExponentialShadowMap = true;
    // // shadow.usePercentageCloserFiltering = true;
    // shadow.blurBoxOffset = 3;
    // // shadow.usePoissonSampling = true;
    // shadow.enableSoftTransparentShadow = false;
    // shadow.transparencyShadow = true;

    // this.lights.push(light1, light2, light3)
    this.lights.push(light)
    // this.shadow = shadow
  }

  static initCamera() {
    const camera = new ArcRotateCamera(
      "Main Camera",
      -0.8,
      1.05,
      40,
      new Vector3(6.7, 2.5, 14.3),
      KE.scene
    )
    camera.attachControl(KE.canvas, true);
    camera.lowerRadiusLimit = 0.005
    camera.upperRadiusLimit = 200
    camera.lowerBetaLimit = 0.2
    camera.upperBetaLimit = 3.13
    // camera.wheelDeltaPercentage = 0.5
    camera.pinchDeltaPercentage = 0.02
    camera.useBouncingBehavior = true
    camera.useNaturalPinchZoom = true
    this.camera = camera
  }

  static setBackgroundColor(color: Color3) {
    KE.scene.clearColor = Color4.FromColor3(color, 1.0)
    // KE.scene.fogColor = color
  }
}