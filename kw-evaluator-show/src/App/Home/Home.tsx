import React, {useEffect} from 'react'
import Style from './Home.module.scss'

function Home() {

  useEffect(() => {

  }, [])

  return (
    <div className={Style.Home}>
      <div className={Style.headline}></div>
      <div className={Style.headlineHover}></div>
      <div className={Style.content}>
        <div className={Style.evaluator}>
        </div>
        <div className={Style.chat}></div>
      </div>
      <div className={Style.footer}></div>
    </div>
  )
}

export default Home


