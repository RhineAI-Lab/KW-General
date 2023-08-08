import React from 'react'
import Style from './App.module.scss'
import {Route, Routes} from "react-router-dom";
import Home from "./Home/Home";
import Login from "./Login/Login";
import {message, notification} from "antd";
import {IconType, NotificationPlacement} from "antd/es/notification/interface";
import {NoticeType} from "antd/es/message/interface";
import Easy from "./Easy/Easy";

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

function App() {

  return (
    <div className={Style.App}>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/easy" element={<Easy/>} />
      </Routes>
    </div>
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
