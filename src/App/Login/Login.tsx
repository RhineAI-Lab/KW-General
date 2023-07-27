import React from 'react'
import Style from './Login.module.scss'

import {InputAdornment, TextField} from "@mui/material";
import {LocalPhoneRounded, VpnKeyRounded} from "@mui/icons-material";
function Login() {
  return (
    <div className={Style.Login}>
      <div className={Style.box}>
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
        </div>

      </div>
    </div>
  )
}

export default Login


