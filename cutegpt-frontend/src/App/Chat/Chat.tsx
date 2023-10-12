import React from 'react'
import Style from './Chat.module.scss'
import AiDialog from "./AiDialog/AiDialog";

function Chat() {
  return (
    <div className={Style.Chat}>
      <AiDialog/>
    </div>
  )
}

export default Chat


