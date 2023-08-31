import React, {useEffect} from 'react'
import Style from './Home.module.scss'
import {useNavigate} from "react-router-dom";

function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    // 跳转至当前默认开发页面
    navigate('/3d')
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


