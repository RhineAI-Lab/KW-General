import "@babylonjs/inspector"
import KE from "@/KE/KE";
import {AbstractMesh, Mesh} from "@babylonjs/core";

export default class Debugger {
  static USE_DEBUG = this.isDevelopmentEnv() && false
  static DEBUG_TOOL_INDEX = -1
  
  static startDebug() {
    if (!this.USE_DEBUG) return
    this.setDebugLayerVisible(true)
  }
  
  static selectMesh(mesh: AbstractMesh) {
    if (!this.USE_DEBUG) return
    KE.scene.debugLayer.select(mesh)
  }
  
  static isDevelopmentEnv() {
    return process.env.NODE_ENV === 'development'
  }
  
  static switchDebugLayer(): boolean {
    if (this.isDebugLayerVisible()) {
      this.setDebugLayerVisible(false)
      return false
    } else {
      this.setDebugLayerVisible(true)
      return true
    }
  }
  
  static isDebugLayerVisible() {
    try {
      return KE.scene.debugLayer.isVisible()
    } catch (e) {
      return false
    }
  }
  
  static setDebugLayerVisible = (visible: boolean) => {
    if (visible) {
      KE.scene.debugLayer.show()
    } else {
      KE.scene.debugLayer.hide()
    }
  }
  
}