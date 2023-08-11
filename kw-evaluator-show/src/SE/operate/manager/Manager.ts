import {Project} from "./data/Project";
import {tip} from "../../../App/App";
import {closeSnackbar} from "notistack";
import SE from "../../SE";
import StepsParser from "../../operate/manager/StepsParser";

export default class Manager {
  
  static defaultProject: Project = new Project()
  static project: Project = this.defaultProject
  static projectLoaded = false
  
  static loadedNum: number = 0
  static failedNum: number = 0
  
  static init() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey) {
        if (e.key === 's') {
          e.preventDefault()
          this.save()
        }
      }
    })
  }
  
  static save() {
    tip('正在保存...')
    StepsParser.toInfo()
    console.log('Save models:', this.project.models)
    console.log('Save steps:', this.project.steps)
    let dt = JSON.stringify(this.project)
  }
  
  static load(result: any) {
    let dt = result.data
    if (dt && dt.trim().length > 0) {
      // tip('项目加载中...')
      this.project = JSON.parse(dt)
      console.log('Load project:', this.project)
    } else {
      SE.setDrawerState(1)
    }
    
    let dbp = result.project
    let tp = this.project
    tp.title = dbp.title
    tp.permission.read = dbp.readPermission
    tp.permission.write = dbp.writePermission
    tp.updateTime = Date.now()
    tp.pid = dbp.pid
  
    StepsParser.uidMapper = []
    Manager.loadedNum = 0
    Manager.failedNum = 0
    let models = Manager.project.models
    for (const model of models) {
      if (model.domain === 'inner') {
        for (const instance of model.instances) {
          SE.loadModel('/inner/', instance.name, undefined, model)
        }
      }
    }
    
    Manager.projectLoaded = true
  }
  
  static checkLoadFinish() {
    let models = Manager.project.models
    if (models.length === Manager.loadedNum) {
      for (const model of models) {
        for (const instance of model.instances) {
          for (const mapper of StepsParser.uidMapper) {
            if (mapper[0] === instance.uid) {
              instance.uid = mapper[1]
              break
            }
          }
        }
      }
      for (const step of Manager.project.steps) {
        for (const node of step.nodes) {
          for (const mapper of StepsParser.uidMapper) {
            if (mapper[0] === node.uid) {
              node.uid = mapper[1]
              break
            }
          }
        }
      }
      StepsParser.toState()
      closeSnackbar()
      tip('项目打开完成', 'success')
    } else if (models.length === Manager.failedNum + Manager.loadedNum) {
      closeSnackbar()
      tip('项目模型导入失败', 'error')
    }
  }
  
}
