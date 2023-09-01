import React, { useEffect, useRef } from 'react'
import Style from './Graph.module.scss'
import {DUPLICATE_EFFECT_TIME} from "@/App/App";
import KE from "@/KE/KE";
import Debugger from "@/KE/render/debugger/Debugger";

let effectTimes = 0

function Graph (): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    effectTimes += 1
    if (Debugger.isDevelopmentEnv() && effectTimes % 2 == 0) return;
    if (!canvasRef.current) return;

    console.log('useEffect', effectTimes)
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
