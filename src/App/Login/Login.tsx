import React, {useState} from 'react'
import Style from './Login.module.scss'
import './Login.scss'

import {Button, InputAdornment, TextField} from "@mui/material";
import {LocalPhoneRounded, MailOutlined, SmsFailed, VpnKeyRounded} from "@mui/icons-material";
import {theme} from "../theme";
import {AppTools} from "../App";
import PhoneUtils from "../../utils/phone-utils";
function Login() {

  const [isLogin, setIsLogin] = useState(true)
  const [showTip, setShowTip] = useState(false)
  const [tipText, setTipText] = useState('')

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [passwordAgain, setPasswordAgain] = useState('')

  const checkPhone = (input: string | undefined = undefined) => {
    const text = input === undefined ? phone : input
    if (input !== undefined) setPhone(text)

    if (text.length === 0) {
      setTipText('请输入手机号')
    } else if (!PhoneUtils.check(text)) {
      setTipText('请输入正确的手机号')
    } else {
      setTipText('')
      return true
    }
    return false
  }
  const checkCode = (input: string | undefined = undefined) => {
    const text = input === undefined ? code : input
    if (input !== undefined) setCode(text)
    if (isLogin) return true

    if (text.length === 0) {
      setTipText('请输入验证码')
    } else {
      setTipText('')
      return true
    }
    return false
  }
  const checkPassword = (input: string | undefined = undefined) => {
    const text = input === undefined ? password : input
    if (input !== undefined) setPassword(text)

    if (text.length === 0) {
      setTipText('请输入密码')
    } else if (text.length < 8) {
      setTipText('密码需要至少8位')
    } else {
      setTipText('')
      return true
    }
    return false
  }
  const checkPasswordAgain = (input: string | undefined = undefined) => {
    const text = input === undefined ? passwordAgain : input
    if (input !== undefined) setPasswordAgain(text)
    if (isLogin) return true

    if (text.length === 0) {
      setTipText('请再次输入密码')
    } else if (text !== password) {
      setTipText('两次输入的密码不同')
    } else {
      setTipText('')
      return true
    }
    return false
  }
  const check = () => {
    return checkPhone()
      && checkCode()
      && checkPassword()
      && checkPasswordAgain()
  }

  const handleClickLogin = () => {
    setShowTip(true)
    check()
  }

  const dpStyle = {
    width:  isLogin ? '0' : '32px',
    height: isLogin ? '0' : '32px',
  }
  const ddStyle = {
    width:  isLogin ? '0' : '25px',
    height: isLogin ? '0' : '25px',
  }

  return (
    <div className={Style.Login}>
      <div className={Style.decorateCorner} style={{backgroundColor: isLogin ? '#f4f4f4' : '#000'}}></div>
      <div className={Style.decorateCorner} style={{backgroundColor: isLogin ? '#f4f4f4' : '#000'}}></div>
      <div className={Style.space2}/>
      <div className={Style.box} style={{height: isLogin ? '550px' : '650px'}}>
        <div className={Style.decorates}>
          <p style={dpStyle}></p>
          <p style={dpStyle}></p>
          <p style={dpStyle}></p>
          <p style={dpStyle}></p>
          <div style={ddStyle}></div>
          <div style={ddStyle}></div>
          <div style={ddStyle}></div>
          <div style={ddStyle}></div>
        </div>
        <div style={{width: isLogin ? '100%' : '0'}} className={Style.topLine}></div>
        <div style={{width: isLogin ? '100%' : '0'}} className={Style.bottomLine}></div>
        <div className={Style.decorateBackground} style={{
          width: isLogin ? '84px' : '0',
          height: isLogin ? '94px' : '0'
        }}></div>
        <div className={Style.decorate} style={{
          width: isLogin ? '60px' : '0',
          height: isLogin ? '70px' : '0'
        }}></div>
        <span className={Style.title}>
          <h2>KW FRONTEND</h2>
          <h4>From Fudan University</h4>
          <div onMouseDown={e => {
            AppTools.notify("我不是滚轮！")
          }} className={Style.scrollBlock}></div>
        </span>
        <div className={Style.space1}></div>
        <div className={Style.inputs}>
          <LoginTextField value={phone} onChange={(e:any) => {
            checkPhone(e.target.value)
          }} show={true} label="Phone" type="text" icon={<LocalPhoneRounded/>}/>
          <LoginTextField value={code} send={true} onChange={(e:any) => {
            checkCode(e.target.value)
          }} onSend={() => {
            AppTools.message("本次注册无需验证  填写000000即可", "success")
            checkCode('000000')
          }} show={!isLogin} label="Verification code" type="text" icon={<MailOutlined/>}/>
          <LoginTextField value={password} onChange={(e:any) => {
            checkPassword(e.target.value)
          }} show={true} label="Password" type="password" icon={<VpnKeyRounded/>}/>
          <LoginTextField value={passwordAgain} onChange={(e:any) => {
            checkPasswordAgain(e.target.value)
          }} show={!isLogin} label="Password Again" type="password" icon={<VpnKeyRounded/>}/>
          <div className={Style.line}>
            <span onClick={e => {
              setShowTip(false)
              setTipText('')
              setIsLogin(!isLogin)
            }}>{isLogin ? '没有账号？创建账号' : '已有账号？去登录'}</span>
            <div></div>
            <span
              style={{opacity: isLogin ? '1' : '0', pointerEvents: isLogin ? 'all' : 'none'}}
              onClick={e => AppTools.message('暂不支持重置密码，请联系网站管理员。', 'warning')}
            >忘记密码?</span>
          </div>
        </div>
        <div className={Style.space2}></div>
        <div className={Style.tip} style={{
          transform: showTip && tipText.length > 0 ? 'none' : 'translateY(30px)'
        }}>
          <SmsFailed color='primary'/>
          <span style={{color: theme.palette.primary.main}}>{tipText}</span>
        </div>
        <div className={Style.btn} onClick={handleClickLogin}>
          <Button size="large" variant="contained" color="black" sx={{width: "100%"}}>{isLogin ? 'LOGIN' : 'REGISTER'}</Button>
        </div>
      </div>
      <div className={Style.space3}/>
    </div>
  )
}

function LoginTextField(props: any) {
  return <div className={Style.input} style={{
    height: props.show ? '76px' : '0',
  }}>
    <TextField label={props.label} type={props.type} variant="filled" InputProps={{
      startAdornment: <InputAdornment position="start">
        {props.icon}
      </InputAdornment>,
      endAdornment: props.send ? <InputAdornment position="end">
        <span className={Style.send} onClick={props.onSend}>发送验证码</span>
      </InputAdornment> : null
    }} sx={{width: "100%"}} value={props.value} onChange={props.onChange}/>
  </div>
}

export default Login


