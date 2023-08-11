import SE from "../../SE";
import {AbstractMesh, Mesh} from "@babylonjs/core";
import Selection from "../selection/Selection";

export default class Debugger {
  static USE_DEBUG = this.isDevelopmentEnv() && false
  static DEBUG_TOOL_INDEX = -1
  
  static startDebug() {
    if (!this.USE_DEBUG) return
    this.setDebugLayerVisible(true)
    // SE.loadModel('/inner/', 'box')
  }
  
  static selectMesh(mesh: AbstractMesh) {
    SE.scene.debugLayer.select(mesh)
    if (!this.USE_DEBUG) return
    Selection.add(mesh as Mesh, true)
    SE.setToolIndex(this.DEBUG_TOOL_INDEX)
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
      return SE.scene.debugLayer.isVisible()
    } catch (e) {
      return false
    }
  }
  
  static setDebugLayerVisible = (visible: boolean) => {}
  
}