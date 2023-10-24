import EasyMessage from "@/App/Chat/AiDialog/Session/EasyMessage";
import Message from "@/App/Chat/AiDialog/Session/Message";
import {Role} from "@/App/Chat/AiDialog/Session/Role";

export default class Session {

  // 储存历史会话
  static start: number = 0
  static startList: number[] = [0]
  static messages: Message[] = [
    // new Message(0, Role.USER, '你好', 'stop', 1),
    // new Message(1, Role.ASSISTANT, '你好！我是复旦大学知识工场实验室训练出来的语言模型CuteGPT。很高兴为你服务。请问有什么问题需要帮助的吗？')
  ]

  // 当前工作区
  static nowEasyMessages: EasyMessage[] = []
  static last: Message | undefined


  // 获取当前单流对话列表
  static getNowEasyMessages(): EasyMessage[] {
    let arr: EasyMessage[] = []
    let nowMessages = this.getNowMessages()
    for (const message of nowMessages) {
      arr.push({role: message.role, content: message.content})
    }
    console.log(arr)
    this.nowEasyMessages = arr
    return arr
  }

  // 获取当前对话列表
  static getNowMessages(): Message[] {
    this.last = undefined
    let mr: Message[] = []
    let now = this.get(this.start)
    while (now) {
      mr.push(now)
      this.last = now
      if (now.hasNext()) {
        now = this.get(now.next)
      } else {
        now = undefined
      }
    }
    return mr
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
    this.getNowEasyMessages()
  }

  // 获取当前对话位于父对话的列表
  static getList(m: Message): number[] {
    if (m.deep == 0) {
      return Session.startList
    }
    for (const message of this.messages) {
      if (message.nextList.indexOf(m.sid) > -1) {
        return message.nextList
      }
    }
    return [m.sid]
  }

  // 获取上一条信息
  static getPrevious(m: Message) {
    if (m.deep == 0) {
      return undefined
    }
    for (const message of this.messages) {
      if (message.nextList.indexOf(m.sid) > -1) {
        return message
      }
    }
  }

  // 添加消息 添加后无需刷新
  static addToNow(role: Role, content: string, stop: string = 'stop', from : number | undefined = undefined): Message {
    if (from === undefined) {
      if (this.last) {
        from = this.last.sid
      } else {
        from = -1
      }
    }
    let fm = this.get(from)

    let sid = this.newSid()
    if (fm) {
      fm.nextList.push(sid)
      fm.next = sid
    } else {
      this.startList.push(sid)
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
    return newMessage
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


