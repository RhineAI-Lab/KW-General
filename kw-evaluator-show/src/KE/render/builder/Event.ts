import KE from "@/KE/KE";
import Builder from "@/KE/render/builder/Builder";
import Column from "@/KE/render/builder/Column.class";
import AxisHighLight from "@/KE/render/builder/AxisHighLight";

export default class Event {

  static lastHover: Column | null = null

  static init() {

    // 鼠标移动事件
    KE.canvas.addEventListener("mousemove", e => {
      const pick = KE.scene.pick(e.offsetX, e.offsetY)

      if (pick.pickedPoint && pick.pickedMesh) {
        const mesh = pick.pickedMesh
        const position = pick.pickedPoint
        // console.log(position.x, position.y, position.z, mesh)

        if (mesh.name == Builder.SCORES_MESH_NAME) {
          KE.canvas.style.cursor = 'pointer'

          let x = Math.floor(position.x / Builder.GRID_SIZE)
          let z = Math.floor(position.z / Builder.GRID_SIZE)
          let column = Builder.getColumn(x, z)
          if (column && column != this.lastHover) {
            this.lastHover = column

            this.hoverColumnListeners.forEach(l => l(column, e))
          }
        } else {
          KE.canvas.style.cursor = 'default'
        }

      } else {
        KE.canvas.style.cursor = 'default'
      }
    })

    // 鼠标按下事件
    KE.scene.onPointerDown = (evt, result) => {
      // console.log(evt, result)
    }

    // 鼠标抬起事件
    KE.scene.onPointerUp = (evt, result) => {
      // console.log(evt, result)
    }
  }


  static buildEvent() {

    this.addHoverColumnListener('DEFAULT', (c, e) => {
      console.log('onHoverColumn', c.x, c.z, e)
      AxisHighLight.set(c.x, c.z)
    })
  }


  static clickColumnListeners = new Map<string, ColumnEventListener>()

  static addClickColumnListener(key: string, listener: ColumnEventListener) {
    this.clickColumnListeners.set(key, listener)
  }

  static removeClickColumnListener(key: string) {
    this.clickColumnListeners.delete(key)
  }

  static removeAllClickColumnListeners(key: string) {
    this.clickColumnListeners.clear()
  }


  static hoverColumnListeners = new Map<string, ColumnEventListener>()

  static addHoverColumnListener(key: string, listener: ColumnEventListener) {
    this.hoverColumnListeners.set(key, listener)
  }

  static removeHoverColumnListener(key: string) {
    this.hoverColumnListeners.delete(key)
  }

  static removeAllHoverColumnListeners(key: string) {
    this.hoverColumnListeners.clear()
  }

}

type ColumnEventListener = (column: Column, e: any) => void

