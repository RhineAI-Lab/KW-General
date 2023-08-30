import React, { useEffect, useRef } from 'react'
import Style from './Graph.module.scss'

import { Button } from '@mui/material'
import UrlUtils from '../../utils/UrlUtils'
import {DUPLICATE_EFFECT_TIME} from "@/App/App";
import SE from "../../SE";
import AnimationManager from "../../render/animation/AnimationManager";
import LoadingPage from "../Loading/LoadingPage";

let lastInitTime = 0

function Graph (): JSX.Element {
  const canvas = useRef<HTMLCanvasElement | null>(null)

  console.log('Graph')
  useEffect(() => {
    if (Date.now() - lastInitTime < DUPLICATE_EFFECT_TIME) {
      console.warn('Ignore duplicate init')
      return
    }
    lastInitTime = Date.now()
    console.log('useEffect')
    if (canvas.current) {
      console.log('render')
      SE.render(canvas.current)
    }
  }, [])
  
  SE.takePhoto = (callback: (img: string) => void) => {
  }

  return (
    <div className={Style.Graph}>
      <div className={Style.canvasHolder}>
        <canvas ref={canvas}/>
      </div>
    </div>
  )
}

export default Graph
