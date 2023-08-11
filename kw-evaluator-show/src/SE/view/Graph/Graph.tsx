import React, { useEffect, useRef } from 'react'
import Style from './Graph.module.scss'

import { Button } from '@mui/material'
import UrlUtils from '../../utils/UrlUtils'
import {DUPLICATE_EFFECT_TIME} from "../../../App/App";
import SE from "../../SE";
import AnimationManager from "../../render/animation/AnimationManager";
import LoadingPage from "../Loading/LoadingPage";

let lastInitTime = 0

function Graph (): JSX.Element {
  const canvas = useRef<HTMLCanvasElement | null>(null)

  const cube = UrlUtils.getParam('cube')
  let model = UrlUtils.getParam('model')

  useEffect(() => {
    if (Date.now() - lastInitTime < DUPLICATE_EFFECT_TIME) {
      console.warn('Ignore duplicate init')
      return
    }
    lastInitTime = Date.now()
    if (canvas.current) {
      SE.render(canvas.current, model, cube)
    }
  }, [])
  
  SE.takePhoto = (callback: (img: string) => void) => {
  }

  return (
    <div className={Style.Graph}>
      <div className={Style.canvasHolder}>
        <canvas ref={canvas}/>
      </div>
      {/*临时显示动作切换按钮*/}
      <div className={Style.hover} style={{ display: model === 'dummy3' ? 'block' : 'none' }}>
        <div className={Style.content}>
          <Button color='primary' variant='contained' onClick={e => { AnimationManager.play('Idle') }}>Play Idle</Button>
          <Button color='primary' variant='contained' onClick={e => { AnimationManager.play('Walk') }}>Play Walk</Button>
          <Button color='primary' variant='contained' onClick={e => { AnimationManager.play('Run') }}>Play Run</Button>
          <Button color='primary' variant='contained' onClick={e => { AnimationManager.play('LeftStrafeWalk') }}>Play Left Walk</Button>
          <Button color='primary' variant='contained' onClick={e => { AnimationManager.play('RightStrafeWalk') }}>Play Right Walk</Button>
        </div>
      </div>
    </div>
  )
}

export default Graph
