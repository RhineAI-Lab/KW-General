import EasyMessage from "@/App/Chat/AiDialog/Session/EasyMessage";
import Message from "@/App/Chat/AiDialog/Session/Message";
import {Role} from "@/App/Chat/AiDialog/Session/Role";

export default class Session {

  // 储存历史会话
  static start: number = 0
  static messages: Message[] = []

  // 当前工作区
  static nowEasyMessages: EasyMessage[] = []
  static last: Message


  // 获取当前单流对话列表
  static getEasyMessages(): EasyMessage[] {
    let arr: EasyMessage[] = []
    let nowMessages = this.getNowMessages()

    this.nowEasyMessages = arr
    return arr
  }

  // 获取当前对话列表
  static getNowMessages(): Message[] {
    let arr: Message[] = []
    let now = this.get(this.start)
    while (now) {
      arr.push(now)
      if (now.hasNext()) {
        now = this.get(now.next)
      } else {
        now = undefined
      }
    }
    return arr
  }

  // 获取当前对话长度
  static size(fresh: boolean = false) {
    if (fresh) {
      this.freshEasyMessages()
    }
    return this.nowEasyMessages.length
  }

  // 刷新当前简单列表
  static freshEasyMessages() {
    this.getEasyMessages()
  }

  // 添加消息 添加后无需刷新
  static addToNow(role: Role, content: string, stop: string = 'stop', from = -1) {
    let sid = this.newSid()
    if (this.last) {
      this.last.nextList.push(sid)
      this.last.next = sid
    } else {
      this.start = sid
    }

    let newMessage = new Message(sid, role, content, stop)
    newMessage.time = new Date().getTime()
    if (this.last) {
      newMessage.deep = this.last.deep + 1
    }

    this.messages.push(newMessage)
    this.nowEasyMessages.push({role: role, content: content})
    this.last = newMessage
  }

  static newSid(): number {
    let sid = this.messages.length
    while (true) {
      let flag = false
      for (const message of this.messages) {
        if (message.sid == sid) {
          flag = true
          sid++
          break
        }
      }
      if (!flag) {
        return sid
      }
    }
  }

  static get(sid: number) {
    for (const message of this.messages) {
      if (message.sid === sid) {
        return message
      }
    }
  }

}


