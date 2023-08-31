import React, { useEffect, useRef } from 'react'
import Style from './Graph.module.scss'

import {DUPLICATE_EFFECT_TIME} from "@/App/App";
import KE from "@/KE/KE";

let lastInitTime = 0

function Graph (): JSX.Element {
  const canvas = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (Date.now() - lastInitTime < DUPLICATE_EFFECT_TIME) {
      console.warn('Ignore duplicate init')
      return
    }
    lastInitTime = Date.now()
    if (canvas.current) {
      KE.render(canvas.current)
    }
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
