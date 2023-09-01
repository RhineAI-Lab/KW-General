import React, {useEffect} from 'react'
import Style from './Stereoscopic.module.scss'
import {DUPLICATE_EFFECT_TIME} from "@/App/App";
import Graph from "../../KE/view/Graph/Graph";

let renderTime = 0

function Stereoscopic() {

  useEffect(() => {
    if (new Date().getTime() - renderTime < DUPLICATE_EFFECT_TIME) return
    renderTime = new Date().getTime()
  }, [])

  return (
    <div className={Style.Stereoscopic}>
      <Graph/>
    </div>
  )
}

export default Stereoscopic

LoadingPage.setProgress(20, 'Creating Page Components...')

