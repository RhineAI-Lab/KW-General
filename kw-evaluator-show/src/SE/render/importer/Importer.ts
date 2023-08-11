
import {
  AbstractMesh,
  IParticleSystem,
  ISceneLoaderProgressEvent,
  Scene,
  SceneLoader,
  Skeleton,
} from "@babylonjs/core";
import SE from "../../SE";
import Loading from "../../view/Loading/Loading";
import UrlUtils from "../../utils/UrlUtils";

export default class Importer {
  
  static firstImport = true
  
  static onSuccess = (
    meshes: AbstractMesh[],
    particleSystems: IParticleSystem[],
    skeletons: Skeleton[]
  ) => {}
  
  static onProgress = (e: ISceneLoaderProgressEvent) => {
    // console.log(e)
  }
  
  static onError = (scene: Scene, message: string, exception: any) => {
    console.error(scene, message, exception)
  }
  
  // Support all
  static import(model: string) {
    const isUrl = UrlUtils.check(model)
    let url = './3d/models/'
    let file = model
    if (isUrl) {
      file = model.split('/').pop() || ''
      url = model.substring(0, model.length - file.length)
    }
    console.log('Import: ', url, file)
  }
  
  static isScene(file: string) {
    return file.endsWith('.babylon')
  }
  
  static innerOnSuccess() {
    // for (const mesh of SE.scene.meshes) {
    //   if (mesh.rotationQuaternion != null) {
    //     mesh.rotationQuaternion = null
    //   }
    // }
    SE.rendering = true
    Loading.set(100, 'Loading Finished.')
    setTimeout(() => {
      Loading.hide()
    }, 300)
  }
  
  // Scene import
  static importModel(url: string, file: string) {
    SceneLoader.Append(url, file, SE.scene, (scene) => {
      this.onSuccess([], [], [])
      this.innerOnSuccess()
    }, (e) => {
      this.onProgress(e)
    }, (scene, message, exception) => {
      this.onError(scene, message, exception)
    })
  }
  
  // Model import
  static importScene(url: string, file: string) {
    SceneLoader.ImportMesh('', url, file, SE.scene, (
      meshes,
      particleSystems,
      skeletons
    ) => {
      this.onSuccess(meshes, particleSystems, skeletons)
      this.innerOnSuccess()
    }, (e) => {
      this.onProgress(e)
    }, (scene, message, exception) => {
      this.onError(scene, message, exception)
    })
  }
  
  static setCenter(mesh: AbstractMesh) {
    const boundingBox = mesh.getBoundingInfo().boundingBox
    const center = boundingBox.center
  }
  
}
