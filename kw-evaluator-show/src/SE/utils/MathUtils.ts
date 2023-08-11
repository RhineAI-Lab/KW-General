
export default class MathUtils {
  static toDegrees(angle: number) {
    return angle * (180 / Math.PI)
  }
  
  static toRadians(angle: number) {
    return angle * (Math.PI / 180)
  }
}