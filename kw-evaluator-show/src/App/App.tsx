import React, {ReactNode} from 'react'
import Style from './App.module.scss'
import {Route, Routes} from "react-router-dom";
import Home from "./Home/Home";
import Login from "./Login/Login";
import {message, notification} from "antd";
import {IconType, NotificationPlacement} from "antd/es/notification/interface";
import {NoticeType} from "antd/es/message/interface";
import Easy from "./Easy/Easy";
import Data from "./Data/Data";
import Stereoscopic from "./Stereoscopic/Stereoscopic";
import {Slide, ThemeProvider} from "@mui/material";
import {theme} from "./theme";

export class AppTools {
  static notify = (
    title: string,
    message = "",
    type: IconType = "info",
    placement: NotificationPlacement = "top"
  ) => {
    notification.open({
      message: title,
      description: message,
      onClick: () => {
      },
      type: type,
      duration: 1,
    });
  }

  static message = (
    title: string,
    type: NoticeType = "info",
    duration: number = 2,
  ) => {
    message.open({
      type: type,
      content: title,
      duration: duration,
    });
  }
}

function SnackbarProvider(props: { Components: { tip: any }, maxSnack: number, children: ReactNode }) {
  return null;
}

function App() {

  return (
    <ThemeProvider theme={theme}>
      <div className={Style.scale}>
        <div className={Style.App}>
          <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/easy" element={<Easy/>} />
            <Route path="/data" element={<Data/>} />
            <Route path="/3d" element={<Stereoscopic/>} />
            <Route path="/" element={<Home/>} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line
    interface IntrinsicElements {
      [tag: string]: any
    }
  }
}

export const DUPLICATE_EFFECT_TIME = 300

export const tip = (text: string, type = 'default') => {

}

declare module "notistack" {
  interface VariantOverrides {
    tip: true;
  }
}