import React, {useEffect} from 'react'
import Style from './Stereoscopic.module.scss'
import {
  ArcRotateCamera, Color3, Color4, CreateBox,
  Engine, HemisphericLight, Scene, Vector3
} from "@babylonjs/core";
import {GradientMaterial} from "@babylonjs/materials";
import {result} from "../tables/data/result";
import Graph from "../../SE/view/Graph/Graph";
import {AppTools, DUPLICATE_EFFECT_TIME, tip} from "../App";

let renderTime = 0
function Stereoscopic() {

  useEffect(() => {
    if (new Date().getTime() - renderTime < DUPLICATE_EFFECT_TIME) return
    renderTime = new Date().getTime()
  }, [])

  const other = () => {
    const canvas = document.getElementById("babylonCanvas") as HTMLCanvasElement
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true })
    engine.setDepthFunction(10)
    const scene = new Scene(engine)
    scene.clearColor = new Color4(0.9, 0.9, 0.9, 1)

    const camera = new ArcRotateCamera(
      "Main Camera",
      Math.PI / 4,
      Math.PI / 2.5,
      7,
      new Vector3(0, 0.6, 0),
      scene
    )
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 0.005
    camera.upperRadiusLimit = 200
    camera.lowerBetaLimit = 0.2
    camera.upperBetaLimit = 3.13

    // camera.wheelDeltaPercentage = 0.5
    camera.pinchDeltaPercentage = 0.02
    camera.useBouncingBehavior = true
    camera.useNaturalPinchZoom = true

    const light = new HemisphericLight("light1", new Vector3(12, 16, 6), scene)
    light.intensity = 1.0
    light.groundColor = new Color3(0.8, 0.8, 0.8)
    light.diffuse = new Color3(0.97, 0.97, 0.97)

    const addData = (x: number, y: number, h: number) => {
      const scale = 0.1
      const size = 0.6
      const sh = 2

      const material = new GradientMaterial("grad", scene);
      material.topColor = new Color3(1.0, 1.0, 1.0); // Set the gradient top color
      material.bottomColor = new Color3(0.4, 0.4, 0.4); // Set the gradient bottom color
      material.offset = 0.6;

      const box = CreateBox('box1')
      box.material = material
      box.scaling = new Vector3(size * scale, h * sh, size * scale)
      box.position = new Vector3(x * scale, h / 2 * sh, y * scale)
    }

    result.map((line, i) => {
      let j = 0
      for(const k in line.score_level_2) {
        // @ts-ignore
        let v = line.score_level_2[k] * 1.2 - 0.1
        addData(i, j, v)
        j++
      }
    })


    engine.runRenderLoop(() => {
      scene.render()
    })
    scene.debugLayer.show().then(r => {})
  }

  return (
    <div className={Style.Stereoscopic}>
      <Graph/>
    </div>
  )
}

export default Stereoscopic


