import {DefaultLoadingScreen} from "@babylonjs/core";

export default class Loading {
  private static _w = window as any
  private static innerMode = false
  
  static show() {
    return
    if (this.innerMode) {
      return this.getInner()
    } else {
      // this._w.showLoading()
    }
  }
  
  static hide() {
    return
    if (this.innerMode) {
      return this.hideInner()
    } else {
      // this._w.hideLoading()
    }
  }
  
  static toInner() {
    this.innerMode = true
    // this._w.hideLoading()
  }
  
  static set(progress: number, msg: string) {
    if (this.innerMode) {
      if (progress > this.getInner()) {
        this.setInner(progress, msg)
      }
    } else {
      // if (progress > this._w.getLoadingProgress()) {
      //   this._w.setLoadingProgress(progress, msg)
      // }
    }
  }
  
  static get() {
    if (this.innerMode) {
      return this.getInner()
    } else {
      // return this._w.getLoadingProgress()
    }
  }
  
  static showInner = () => {
  }
  
  static hideInner = () => {
  }
  
  static getInner = (): number => {
    return 0
  }
  
  static setInner = (progress: number, msg: string) => {
  }
}

DefaultLoadingScreen.prototype.displayLoadingUI = function () {
  Loading.show()
}

DefaultLoadingScreen.prototype.hideLoadingUI = function(){
  Loading.hide()
}

