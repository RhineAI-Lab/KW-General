import React, {useEffect, useRef} from 'react'
import Style from './Home.module.scss'
import { Chart } from '@antv/g2'
import MainTable from "./MainTable/MainTable";

function Home() {
  const tableContainerRef = useRef(null)

  useEffect(() => {

  }, [])

  return (
    <div className={Style.Home}>
      <div className={Style.headline}></div>
      <div className={Style.headlineHover}></div>
      <div className={Style.content}>
        <div className={Style.evaluator}>
          <MainTable/>
        </div>
        <div className={Style.chat}></div>
      </div>
      <div className={Style.footer}></div>
    </div>
  )
}

export default Home


