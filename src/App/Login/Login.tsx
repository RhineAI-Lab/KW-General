import React from 'react'
import Style from './Login.module.scss'
import './Login.scss'

import {Button, InputAdornment, TextField} from "@mui/material";
import {LocalPhoneRounded, VpnKeyRounded} from "@mui/icons-material";
function Login() {
  return (
    <div className={Style.Login}>
      <div className={Style.decorateCorner}></div>
      <div className={Style.decorateCorner}></div>
      <div className={Style.decorateCorner}></div>
      <div className={Style.decorateCorner}></div>
      <div className={Style.box}>
        <div className={Style.decorates}>
          <p></p>
          <p></p>
          <p></p>
          <p></p>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <span className={Style.title}>
          <h2>KW FRONTEND</h2>
          <h4>From Fudan University</h4>
        </span>
        <div className={Style.inputs}>
          <div className={Style.input}>
            <TextField label="Phone" type="text" variant="filled" InputProps={{
              startAdornment: <InputAdornment position="start">
                <LocalPhoneRounded/>
              </InputAdornment>,
            }} sx={{width: "100%"}}/>
          </div>
          <div className={Style.input}>
            <TextField label="Password" type="password" variant="filled" InputProps={{
              startAdornment: <InputAdornment position="start">
                <VpnKeyRounded/>
              </InputAdornment>,
            }} sx={{width: "100%"}}/>
          </div>
          <div className={Style.line}>
            <span>注册</span>
            <div></div>
            <span>忘记密码?</span>
          </div>
        </div>
        <div className={Style.space}></div>
        <div className={Style.btn}>
          <Button size="large" variant="contained" color="black" sx={{width: "100%"}}>LOGIN</Button>
        </div>
      </div>
    </div>
  )
}

export default Login


