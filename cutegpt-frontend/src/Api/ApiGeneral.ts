import Debugger from "@/Api/Debugger";

export default class ApiGeneral {

  static USE_ORIGIN = true

  // static ORIGIN_URL = 'https://rhineai.com' // 北京
  static ORIGIN_SERVER_URL = 'https://kw.rhineai.com' // 杭州
  static LOCAL_SERVER_URL = 'http://localhost:8026' // 本地

  static BASE_URL = Debugger.isDevelopmentEnv() ? (this.USE_ORIGIN ? this.ORIGIN_SERVER_URL : this.LOCAL_SERVER_URL) : ''
  static API_URL = this.BASE_URL + '/api'


  static NETWORK_ERROR_RESPONSE = {
    code: 404,
    message: '服务器连接失败',
    apiVersion: '1.0.0',
  }

  static AUTHORIZATION_ERROR_RESPONSE = {
    code: 300,
    message: '账号未登录',
    apiVersion: '1.0.0',
  }

}