import {AdvancedDynamicTexture, Ellipse, Line, Rectangle, TextBlock} from "@babylonjs/gui";
import {AbstractMesh} from "@babylonjs/core";

export default class GUI {
  
  static ui: AdvancedDynamicTexture
  
  static init () {
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI("UI")
  }
  
  static addLabel (mesh: AbstractMesh, text: string) {
    let r = 2 / 3
    
    const rect = new Rectangle()
    rect.name = mesh.uniqueId + "-rect"
    rect.width = "260px"
    rect.height = "80px"
    rect.cornerRadius = 14
    rect.color = "#fff"
    rect.thickness = 2
    rect.background = "#000000BB"
    rect.zIndex = 3
    this.ui.addControl(rect)
    rect.linkWithMesh(mesh)
    rect.linkOffsetY = -240
    rect.linkOffsetX = -240 * r
  
    const label = new TextBlock()
    label.name = mesh.uniqueId + "-label"
    label.text = text
    rect.addControl(label)
    label.fontSize = 32
  
    const target = new Ellipse()
    target.name = mesh.uniqueId + "-target"
    target.width = "11px"
    target.height = "11px"
    target.background = "#fff"
    target.zIndex = 2
    this.ui.addControl(target)
    target.linkWithMesh(mesh)
  
    const line = new Line()
    line.name = mesh.uniqueId + "-line"
    line.lineWidth = 3
    line.color = "#fff"
    line.zIndex = 1
    line.y2 = 40 - 2
    line.x2 = 40 * r - 2
    this.ui.addControl(line)
    line.linkWithMesh(mesh)
    line.connectedControl = rect
  }
  
  static removeLabel (mesh: AbstractMesh) {
    const id = mesh.uniqueId
    const rect = this.ui.getControlByName(id + "-rect")
    if (rect) this.ui.removeControl(rect)
    const label = this.ui.getControlByName(id + "-label")
    if (label) this.ui.removeControl(label)
    const target = this.ui.getControlByName(id + "-target")
    if (target) this.ui.removeControl(target)
    const line = this.ui.getControlByName(id + "-line")
    if (line) this.ui.removeControl(line)
  }
  
  static setLabelText (mesh: AbstractMesh, text: string) {
    if (text.trim().length === 0) {
      this.removeLabel(mesh)
      return
    }
    const label = this.ui.getControlByName(mesh.uniqueId + "-label")
    if (label) {
      (label as TextBlock).text = text
    } else {
      this.addLabel(mesh, text)
    }
  }
  
  static getLabelText (mesh: AbstractMesh) {
    const label = this.ui.getControlByName(mesh.uniqueId + "-label")
    if (label) {
      return (label as TextBlock).text
    } else {
      return ""
    }
  }
}
