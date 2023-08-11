
import Manager from "../../operate/manager/Manager";
import Model, {Instance} from "../../operate/manager/data/Model";

export default class StepsParser {
  
  static uidMapper: number[][] = []
  
  static toInfo() {

  }
  
  static toState() {

  }
  
  static getModelAndInstance(uid: number): [Model | undefined, Instance | undefined] {
    for (const model of Manager.project.models) {
      for (const instance of model.instances) {
        if (instance.uid === uid) {
          return [model, instance]
        }
      }
    }
    return [undefined, undefined]
  }
}
