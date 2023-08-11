import {useEffect, useRef, useState} from 'react';
import Style from './LoadingPage.module.scss';
import Loading from "./Loading";

export default function LoadingPage(props: any) {
  const [show, setShow] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const [progress, setProgress] = useState(20)
  const [message, setMessage] = useState('Loading 3D Engine...')
  const [iconBackground, setIconBackground] = useState('#fdd')
  
  const innerBar = useRef<HTMLSpanElement>(null)
  
  Loading.setInner = function(progress, msg) {
    setProgress(progress)
    setMessage(msg)
  }
  Loading.showInner = () => {
    setShow(true)
  }
  Loading.hideInner = () => {
    setOpacity(0);
    setTimeout(()=>{
      setShow(false)
    }, 300)
  }
  Loading.getInner = () => {
    return progress
  }
  
  useEffect(() => {
    Loading.toInner()
  })
  
  return (
    <div className={Style.LoadingPage} style={{ display: show ? 'block' : 'none', opacity: opacity}}>
      <div className={Style.content}>
        <p className={Style.title}>
          <img
            src='/favicon.ico'
            alt=''
            style={{ background: iconBackground}}
            onLoad={()=>setIconBackground('#ffffff00')}
          ></img>
          <span>Made with STEP-3D</span>
        </p>
        <div className={Style.progressBar}>
          <span ref={innerBar} style={{ width: progress + '%'}}></span>
        </div>
        <span className={Style.message}>{progress + '%  ' + message}</span>
      </div>
    </div>
  )
}