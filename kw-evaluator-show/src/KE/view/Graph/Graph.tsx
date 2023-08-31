import React, { useEffect, useRef } from 'react'
import Style from './Graph.module.scss'
import {DUPLICATE_EFFECT_TIME} from "@/App/App";
import KE from "@/KE/KE";
import '@babylonjs/inspector';
import {
  ArcRotateCamera, Color3, Color4, CreateBox,
  Engine, HemisphericLight, Scene, Vector3
} from "@babylonjs/core";
import {GradientMaterial} from "@babylonjs/materials";
import {result} from "@/App/tables/data/result";

let lastInitTime = 0

function Graph (): JSX.Element {
  const canvas = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvas.current) return;
    if (Date.now() - lastInitTime < DUPLICATE_EFFECT_TIME) {
      console.warn('Ignore duplicate init')
      return
    }
    lastInitTime = Date.now()
    KE.render(canvas.current)
  }, [])

  return (
    <div className={Style.Graph}>
      <div className={Style.canvasHolder}>
        <canvas ref={canvas}/>
      </div>
    </div>
  )
}

export default Graph
