import SE from "../../SE"
import {GridMaterial} from '@babylonjs/materials'
import {
  AbstractMesh,
  ArcRotateCamera,
  Color3,
  Color4, Constants,
  CreateGround,
  CubeTexture, DirectionalLight,
  HemisphericLight, ImageProcessingConfiguration, Light, Mesh, PBRMaterial, PointerEventTypes,
  Scene, ShadowGenerator, SpotLight, StandardMaterial, Texture,
  Vector3, VertexData
} from "@babylonjs/core"
import TransformGround from "../environment/TransformGround";
import GeometryUtils from "../../utils/GeometryUtils";

export default class Environment {
  
  static camera: ArcRotateCamera
  static lights: Light[] = []
  static shadow: ShadowGenerator
  static environmentTexture: CubeTexture
  
  static StandardMode = false
  
  static init() {
    // 设置环境背景色
    this.setBackgroundColor(new Color3(1, 1, 1))
    
    // 设置背景方块
    const scene = SE.scene
    // this.environmentTexture = CubeTexture.CreateFromImages([
    //   '/3d/textures/white.jpg',
    //   '/3d/textures/white.jpg',
    //   '/3d/textures/white.jpg',
    //   '/3d/textures/white.jpg',
    //   '/3d/textures/white.jpg',
    //   '/3d/textures/white.jpg',
    // ], scene)
    this.environmentTexture = CubeTexture.CreateFromPrefilteredData('/3d/textures/temp.env', scene)
    SE.scene.environmentTexture = this.environmentTexture
    // const hdrSkybox = Mesh.CreateBox("HDR Sky Box", 500, scene, false, Constants.MATERIAL_CounterClockWiseSideOrientation);
    // const hdrSkyboxMaterial = new PBRMaterial("pbr-sky-box-material", SE.scene);
    // hdrSkyboxMaterial.backFaceCulling = false;
    // hdrSkyboxMaterial.reflectionTexture = SE.scene.environmentTexture!.clone();
    // if (hdrSkyboxMaterial.reflectionTexture) {
    //   hdrSkyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    // }
    // hdrSkyboxMaterial.microSurface = 0.7;
    // hdrSkyboxMaterial.disableLighting = true;
    // hdrSkyboxMaterial.twoSidedLighting = true;
    // hdrSkybox.infiniteDistance = true;
    // hdrSkybox.material = hdrSkyboxMaterial;
    // hdrSkybox.applyFog = false
    
    // 创建相机
    this.initCamera()
    // 创建全方位光源
    this.initLight()
    // 创建地面网格
    TransformGround.createGround()
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
    const light1 = new HemisphericLight(
      "Hemispheric Light",
      new Vector3(-40, -80, -4),
      SE.scene
    )
    light1.intensity = 0.55
    light1.groundColor = new Color3(1, 1, 1)
  
    const light2 = new DirectionalLight(
      "Directional Light Main",
      new Vector3(30, -40, -30),
      SE.scene
    )
    light2.intensity = 0.3
    light2.shadowMinZ = 1
    light2.shadowMaxZ = 200
  
    const light3 = new DirectionalLight(
      "Directional Light Sub",
      new Vector3(-30, -45, 30),
      SE.scene
    )
    light3.intensity = 0.2
  
    const shadow = new ShadowGenerator(1024, light2)
    shadow.setDarkness(0.1)
    shadow.useBlurExponentialShadowMap = true;
    // shadow.usePercentageCloserFiltering = true;
    shadow.blurBoxOffset = 3;
    // shadow.usePoissonSampling = true;
    shadow.enableSoftTransparentShadow = false;
    shadow.transparencyShadow = true;
    
    this.lights.push(light1, light2, light3)
    this.shadow = shadow
  }
  
  static defaultEnvironment() {
    // 内置快捷环境创建
    let environment = SE.scene.createDefaultEnvironment({
      createGround: false,
      skyboxSize: 6400,
    })
    if (!environment) return
    environment.setMainColor(new Color3(4, 4, 4))
  }
  
  static initCamera() {
    const camera = new ArcRotateCamera(
      "Main Camera",
      Math.PI / 4,
      Math.PI / 2.5,
      7,
      new Vector3(0, 0.6, 0),
      SE.scene
    )
    camera.attachControl(SE.canvas, true);
    if (this.StandardMode) {
      camera.lowerRadiusLimit = 0.05
      camera.upperRadiusLimit = 30
      camera.lowerBetaLimit = 0.2
      camera.upperBetaLimit = 3.13
    } else {
      camera.lowerRadiusLimit = 0.005
      camera.upperRadiusLimit = 200
      camera.lowerBetaLimit = 0.2
      camera.upperBetaLimit = 3.13
    }
    // camera.wheelDeltaPercentage = 0.5
    camera.pinchDeltaPercentage = 0.02
    camera.useBouncingBehavior = true
    camera.useNaturalPinchZoom = true
    this.camera = camera
  }
  
  static initGroundEasy() {
    // 创建网状线地面材质
    const material = new GridMaterial("groundMaterial", SE.scene)
    material.majorUnitFrequency = 10
    material.minorUnitVisibility = 0.3
    material.gridRatio = 1
    material.opacity = 0.3
    material.useMaxLine = true
    material.lineColor = Color3.Gray()
  
    const ground = CreateGround("ground", {width: 3200, height: 3200})
    ground.material = material
  }
  
  static setCameraDistance(distance: number) {
    if (!this.StandardMode) return
    this.camera.minZ = 0.1
    this.camera.maxZ = distance
    SE.scene.fogMode = Scene.FOGMODE_LINEAR
    SE.scene.fogStart = distance * 0.8
    SE.scene.fogEnd = distance
    SE.scene.fogDensity = 0.1
  }
  
  static setBackgroundColor(color: Color3) {
    SE.scene.clearColor = Color4.FromColor3(color, 1.0)
    SE.scene.fogColor = color
  }
  
  static setCube(name: string) {
    if (name !== '') {
      console.log('Use cube: ', name)
      const hdrTexture = CubeTexture.CreateFromPrefilteredData("./3d/textures/" + name, SE.scene)
      const currentSkybox = SE.scene.createDefaultSkybox(hdrTexture, true);
    }
  }
  
  static makeTransformGround() {
    // 创建白色透明材质
    const materialWhite = new StandardMaterial("groundMaterialWhite", SE.scene)
    materialWhite.diffuseColor = new Color3(1, 1, 1)
    
    // 创建灰色透明材质
    const materialGray = new StandardMaterial("groundMaterialGray", SE.scene)
    materialGray.diffuseColor = new Color3(0.7, 0.7, 0.7)
    
    // 创建地面
    const size = 200
    const thickness = 0.03
    const ground = CreateGround("ground", {width: size, height: size}, SE.scene)
    ground.material = materialWhite;
    ground.position.y = -0.01
    
    for (let i = -size/2; i < size/2; i+=1) {
      const ground = CreateGround("ground", {width: thickness, height: size}, SE.scene)
      ground.material = materialGray;
      ground.position.x = i
    }
    for (let i = -size/2; i < size/2; i+=1) {
      const ground = CreateGround("ground", {width: size, height: thickness}, SE.scene)
      ground.material = materialGray;
      ground.position.z = i
    }
    
  }
}