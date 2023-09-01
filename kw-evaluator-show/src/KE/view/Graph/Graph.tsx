import React, { useEffect, useRef } from 'react'
import "@babylonjs/inspector"
import Style from './Graph.module.scss'
import {DUPLICATE_EFFECT_TIME} from "@/App/App";
import KE from "@/KE/KE";

let lastInitTime = 0

function Graph (): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return;
    if (Date.now() - lastInitTime < DUPLICATE_EFFECT_TIME) {
      console.warn('Ignore duplicate init')
      return
    }
    lastInitTime = Date.now()

    KE.render(canvasRef.current)
  }, [])

  return (
    <div className={Style.Graph}>
      <div className={Style.canvasHolder}>
        <canvas ref={canvasRef}/>
      </div>
    </div>
  )
}

export default Graph
