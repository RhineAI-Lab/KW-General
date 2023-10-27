

export default class Debugger {
  static USE_DEBUG = this.isDevelopmentEnv() && false

  static isDevelopmentEnv() {
    return process.env.NODE_ENV === 'development'
  }

}