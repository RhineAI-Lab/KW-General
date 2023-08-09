import React, {useEffect} from 'react'
import Style from './Easy.module.scss'
import MainTable from "../tables/MainTable/MainTable";

function Easy() {

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

export default Easy


