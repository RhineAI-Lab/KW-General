import React, { useEffect, useRef } from 'react'
import Style from './Graph.module.scss'

import { Button } from '@mui/material'
import AnimationManager from '@/SE/render/animation/AnimationManager'
import UrlUtils from "@/SE/utils/UrlUtils";
import SE from "@/SE/SE";
import LoadingPage from "@/SE/view/Loading/LoadingPage";
import Loading from "@/SE/view/Loading/Loading";
import {DialogManager} from "@/App/Editor/DialogManager/Dialog";
import TakePhoto from "@/App/Editor/StepsBar/TakePhoto";
import Importer from "@/SE/render/importer/Importer";
import {DUPLICATE_EFFECT_TIME} from "@/App/App";

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
    canvas.current ? SE.render(canvas.current, model, cube) : ''
  }, [])
  
  SE.takePhoto = (callback: (img: string) => void) => {
    const c = canvas.current
    c ? TakePhoto.takeStepPhoto(c, callback) : callback('')
  }

  return (
    <div className={Style.Graph}>
      <div className={Style.canvasHolder}>
        <canvas ref={canvas} onMouseDown={e => DialogManager.hide()}/>
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
      <LoadingPage/>
    </div>
  )
}

export default Graph
