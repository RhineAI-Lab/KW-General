import AnimationManager from "./render/animation/AnimationManager";
import Environment from "./render/environment/Environment";
import Importer from "./render/importer/Importer";
import "@babylonjs/inspector";
import {
  AbstractMesh,
  CreateBox, CreateSphere,
  Engine, IParticleSystem,
  Mesh,
  Scene, SceneLoader, Skeleton,
  Vector3
} from "@babylonjs/core";
import Loading from "./view/Loading/Loading";
import {tip} from "../App/App";
import {closeSnackbar} from "notistack";
import Selection from "./operate/selection/Selection";
import Clipboard from "./operate/clipboard/Clipboard";
import MaterialManager from "./render/material/MaterialManager";
import GUI from "./render/gui/GUI";
import MaterialFactory from "./render/material/MaterialFactory";
import Debugger from "./operate/debugger/Debugger";
import {AnimationGroup} from "@babylonjs/core/Animations/animationGroup";
import {TransformNode} from "@babylonjs/core/Meshes/transformNode";
import {Geometry} from "@babylonjs/core/Meshes/geometry";
import {Light} from "@babylonjs/core/Lights/light";
import Model from "./operate/manager/data/Model";
import Manager from "./operate/manager/Manager";
import StepsParser from "./operate/manager/StepsParser";
import Builder from "./render/builder/Builder";
import Writer from "./render/builder/Writer";

export default class SE {
  static rendering = false
  static _engine: Engine
  static _scene: Scene
  static canvas: HTMLCanvasElement
  
  static initEngine(canvas: HTMLCanvasElement) {
    Loading.set(30, 'Initializing 3D Engine...')
    this.canvas = canvas
    SE.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true })
    SE.engine.setDepthFunction(10)
    SE.engine.enableOfflineSupport = false
    SE.scene = new Scene(SE.engine)
  }
  
  static render(canvas: HTMLCanvasElement, model: string, cube: string = ''): void {
    this.initEngine(canvas)
    
    MaterialManager.init()
    Environment.init()
    // Environment.setCube(cube)
    Selection.init()
    Clipboard.init()
    Manager.init()
    GUI.init()

    Builder.build()
  
    // Importer.importScene('/3d/models/', 'factory.babylon')
    // Importer.import('factory.glb')
    
    Importer.onSuccess = (meshes, particleSystems, skeletons) => {
      if (model === 'dummy3.babylon') {
        AnimationManager.dummy3AnimationInit(meshes, particleSystems, skeletons)
      }
    }
    Importer.innerOnSuccess()
    
    Debugger.startDebug()
  }
  
  static loadModel(path: string, file: string, args?: any, model?: Model): void {
    const onSuccess = (
      meshes: AbstractMesh[] = [],
      particleSystems: IParticleSystem[] = [],
      skeletons: Skeleton[] = [],
      animationGroups: AnimationGroup[] = [],
      transformNodes: TransformNode[] = [],
      geometries: Geometry[] = [],
      lights: Light[] = [],
    ) => {
      console.log('Import Meshes Success', meshes, particleSystems, skeletons, animationGroups, transformNodes, geometries, lights)
      if (meshes.length === 0) return
      // Add states message
      for (const mesh of meshes) {
      }
      if (meshes.length === 1 && path !== '/inner/') {
        meshes[0].position = new Vector3(0, 0, 0)
      }
      Debugger.selectMesh(meshes[0])
      
      // Add info message
      if (model) {
        if (path === '/inner/') {
          let mesh = meshes[0]
          let instance = model.instances[0]
          
          let lastId = instance.uid
          let uid = mesh.uniqueId
          mesh.name = instance.name
          
          if (lastId !== uid) {
            StepsParser.uidMapper.push([lastId, uid])
          }
        }
        Manager.loadedNum++
        Manager.checkLoadFinish()
      } else {
        model = new Model()
        if (path !== '/inner/') {
          // TODO: Other type model
          model.path = path
        }
        for (const mesh of meshes) {
          model.instances.push({
            uid: mesh.uniqueId,
            name: mesh.name,
          })
        }
        Manager.project.models.push(model)
      }
  
      setTimeout(() => {
        Environment.adjustCamera(meshes)
        Environment.addShadows(meshes)
        if (file === 'shafa.stl') {
          Environment.camera.alpha = - Math.PI / 3 * 2.5
        }
        if (!model) {
          closeSnackbar()
          tip(`${meshes.length}个模型 导入成功`,'success')
        }
      }, 17)
    }
  
    console.log('Import Meshes', path, file, args)
    if (path === '/inner/') {
      if (file.toLowerCase() === 'box') {
        onSuccess([this.createBox(args?.size)])
      } else if (file.toLowerCase() === 'sphere') {
        onSuccess([this.createSphere(args?.size)])
      } else {
        tip('UNKNOWN Inner Model', 'error')
      }
    } else {
      tip('正在导入模型...')
      SceneLoader.ImportMesh(
        '', path, file, SE.scene,
        onSuccess,
        (e) => {
          console.log('Import Meshes Progress', e)
        },
        (scene, message, exception) => {
          if (model) {
            Manager.failedNum++
            Manager.checkLoadFinish()
          }
          console.log('Import Meshes Error', scene, message, exception)
        },
      )
    }
  }
  
  static createBox(size = 1): Mesh {
    const box = CreateBox('Box', { size: size }, SE.scene)
    box.setAbsolutePosition(new Vector3(0, size / 2, 0))
    box.material = MaterialFactory.makeMaterial(0, box)
    MaterialManager.setColor(box, MaterialManager.defaultBlueColor)
    return box
  }
  
  static createSphere(size = 1): Mesh {
    const sphere = CreateSphere('Sphere', { diameter: size }, SE.scene)
    sphere.setAbsolutePosition(new Vector3(0, size / 2, 0))
    sphere.material = MaterialFactory.makeMaterial(0, sphere)
    MaterialManager.setColor(sphere, MaterialManager.defaultBlueColor)
    return sphere
  }
  
  static get engine () {
    return SE._engine
  }
  static set engine (engine: Engine) {
    SE._engine = engine
    window.addEventListener('resize', function () {
      engine.resize()
    })
  }
  static get scene () {
    return SE._scene
  }
  static set scene (scene: Scene) {
    SE._scene = scene
    this.engine.runRenderLoop(function () {
      if (SE.rendering) scene.render()
    })
  }
  
  static resize(time: number = 0) {
    if (time == 0) {
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
  
  static setLoadingProgress(progress: number, msg: string) {
    const w = window as any
    if (progress > w.getLoadingProgress()) {
      w.setLoadingProgress(progress, msg)
    }
  }
  
  static freshSelectedListeners: [string, (last: Mesh | null, all: Mesh[]) => void][] = [] as any
  
  static addFreshSelectedListener(name: string, fn: (last: Mesh | null, all: Mesh[]) => void) {
    for (let i in this.freshSelectedListeners) {
      if (this.freshSelectedListeners[i][0] === name) {
        this.freshSelectedListeners[i][1] = fn
        return
      }
    }
    this.freshSelectedListeners.push([name, fn])
  }
  
  static freshSelected(last: Mesh | null, all: Mesh[]) {
    for (const line of this.freshSelectedListeners) {
      line[1](last, all)
    }
  }
  
  static setDrawerState = (mode: number) => {}
  
  static getDrawerState = () => 0
  
  static setToolIndex = (ti: number) => {}
  
  static takePhoto = (callback: (img: string) => void) => {}
}

Loading.set(20, 'Loading Components...')

/**
 * Test url
 * https://3d.rhineai.com/?model=dummy3
 * https://3d.rhineai.com/?model=remy
 * https://3d.rhineai.com/?model=https%3A%2F%2F3d.rhineai.com%2Fmodels%2Fshafa.obj
 * https://3d.rhineai.com/?model=https%3A%2F%2Fplayground.babylonjs.com%2Fscenes%2FBoomBox%2FBoomBox.gltf
 * https://3d.rhineai.com/?model=https%3A%2F%2Fplayground.babylonjs.com%2Fscenes%2FBoomBox%2FBoomBox.gltf&cube=environment.dds
 */