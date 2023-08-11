import {MouseEventHandler} from "react";

export default class GeneralUtils {
  static getUniqueID(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  
  static getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }
  
  static getDistanceBetweenEvents(e1: MouseEvent | TouchEvent, e2: MouseEvent | TouchEvent): number {
    let [x1, y1] = GeneralUtils.getEventPosition(e1)
    let [x2, y2] = GeneralUtils.getEventPosition(e2)
    return GeneralUtils.getDistance(x1, y1, x2, y2);
  }
  
  static getEventPosition(e: MouseEvent | TouchEvent | any): [x: number, y: number] {
    if (e.type && e.type.indexOf('touch') !== -1) {
      if (e.touches.length){
        let x = e.touches[0].clientX;
        let y = e.touches[0].clientY;
        return [x, y]
      } else {
        let x = e.changedTouches[0].clientX;
        let y = e.changedTouches[0].clientY;
        return [x, y]
      }
    } else {
      return [e.clientX, e.clientY]
    }
  }
  
  static setInterval(callback: Function, delay: number, times: number = -1) {
    let counter = 0
    let interval = setInterval(() => {
      callback()
      counter++
      if (times > 0 && counter >= times) {
        clearInterval(interval)
      }
    }, delay)
    return interval
  }
}