import React, {useEffect} from 'react'
import Style from './Stereoscopic.module.scss'
import {CreateGround, CreateSphere, Engine, FreeCamera, HemisphericLight, Scene, Vector3} from "@babylonjs/core";
import {GridMaterial} from "@babylonjs/materials";

let renderTime = 0
function Stereoscopic() {

  useEffect(() => {
    if (new Date().getTime() - renderTime < 200) return
    renderTime = new Date().getTime()

    const canvas = document.getElementById("babylonCanvas") as HTMLCanvasElement
    const engine = new Engine(canvas)
    const scene = new Scene(engine)

    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene)
    camera.setTarget(Vector3.Zero())
    camera.attachControl(canvas, true)

    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene)
    light.intensity = 0.7

    const material = new GridMaterial("grid", scene)

    const sphere = CreateSphere('sphere1', { segments: 16, diameter: 2 }, scene)
    sphere.position.y = 2
    sphere.material = material

    const ground = CreateGround('ground1', { width: 6, height: 6, subdivisions: 2 }, scene)
    ground.material = material

    engine.runRenderLoop(() => {
      scene.render()
    })
  }, [])

  return (
    <div className={Style.Stereoscopic}>
      <canvas id='babylonCanvas'></canvas>
    </div>
  )
}

export default Stereoscopic


