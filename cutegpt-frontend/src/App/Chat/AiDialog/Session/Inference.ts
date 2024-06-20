import MD5 from 'crypto-js/md5';
import Session from "@/App/Chat/AiDialog/Session/Session";
import {Role} from "@/App/Chat/AiDialog/Session/Role";
import Message from "@/App/Chat/AiDialog/Session/Message";
import ShowMessage from "@/App/Chat/AiDialog/Session/ShowMessage";

export default class Inference {

  static prompt = '你是复旦大学知识工场实验室训练出来的语言模型CuteGPT。给定任务描述，请给出对应请求的回答。'
  static firstMessage = '我是复旦大学知识工场实验室训练出的AI模型CuteGPT，请问有什么可以帮您？'

  static generating = false
  static ac: AbortController | null = null

  static setGenerating(generating: boolean, reason: string = '') {
    this.generating = generating
    this.onGeneratingChange(generating, reason)
  }

  static onGeneratingChange = (generating: boolean, reason: string) => {}

  static charIndex = 0

  static checkEndInCode(content: string) {
    let n = content.split('```').length - 1
    return n % 2 == 1
  }

  static getShowMessages() {
    this.charIndex++
    let messages = Session.getNowMessages()
    let messagesShow: ShowMessage[] = []
    messagesShow.push({role: Role.ASSISTANT, content: this.firstMessage, sid: -1, list: [-1]})
    for (let i = 0; i < messages.length; i++) {
      let message = messages[i]
      if (message.role == 'assistant' || message.role == 'user') {
        let content = message.content
        const regex = /\|? *序号 *\| *场景名称 *\|/;
        const tableStart = content.search(regex);
        if (tableStart == -1) {
          messagesShow.push(message.toShowMessage())
        } else {
          let end = -1
          for (let j = tableStart; j < content.length - 1; j++) {
            if (content[j] == '\n' && content[j + 1] == '\n') {
              end = j
              break
            }
          }
          let tableText = ''
          if (end == -1) {
            messagesShow.push(message.toShowMessage(content.slice(0, tableStart)))
            tableText = content.slice(tableStart)
            if (this.generating) {
              let char = '♫♬'[this.charIndex%2]
              if (!this.checkEndInCode(tableText)) {
                tableText += '<font style="color: #340486; font-weight: 700; font-size: large"> '+char+'</font>'
              }
            }
          } else {
            messagesShow.push(message.toShowMessage(content.slice(0, tableStart) + content.slice(end + 1))) // +2
            tableText = content.slice(tableStart, end)
          }
          if (tableText.split('\n').length > 2) {
            // this.tables.push(tableText)
          }
        }
      }
    }
    if (this.generating && messagesShow.length > 0) {
      let startTag = '<span style="color: #340486; font-weight: 700">'
      let middleText = 'Thinking'
      for (let i = messagesShow.length - 1; i >= 0; i--) {
        if (messagesShow[i].role == 'assistant') {
          // let char = '♪♫♩♬'[Math.floor(Math.random() * 4)]
          if (!messagesShow[i].content.startsWith(startTag + middleText)) {
            if (!this.checkEndInCode(messagesShow[i].content)) {
              let char = '♫♬'[this.charIndex%2]
              messagesShow[i].content += '<font style="color: #340486; font-weight: 700; font-size: large"> '+char+'</font>'
            }
          }
          break
        } else if (messagesShow[i].role == 'user') {
          break
        }
      }
    }
    // console.log(messagesShow)
    return messagesShow
  }

  static send(message: string, from: number | undefined = undefined, callback: (line: any) => void) {
    let interval: any = null
    this.setGenerating(true, '')
    // from === undefined : 从最后发送  from === -1 : 从开头发送
    if (from === undefined) {
      from = Session.getLastId()
    }
    let previous = Session.get(from)
    let dup = undefined
    let pl: number[] = []
    if (previous) {
      pl = previous.nextList
    }
    if (from === -1) {
      pl = Session.base.nextList
    }
    for (let i = 0; i < pl.length; i++) {
      let item = Session.get(pl[i])
      if (item && item.content == message) {
        dup = item
        break
      }
    }
    if (!dup) {
      dup = Session.addToNow(Role.USER, message, 'stop', from)
    } else {
      if (!previous) {
        previous = Session.base
      }
      previous.next = dup.sid
      dup.next = -1
    }
    Session.freshEasyMessages()
    console.log(Session.nowEasyMessages)
    let nm = null // new message
    this.fetchStream(Session.nowEasyMessages, (line) => {
      let startTag = '<span style="color: #340486; font-weight: 700">'
      let middleText = 'Thinking'
      let endTag = '</span>'
      const last = () => {
        return Session.last as Message
      }
      const clearThinking = () => {
        if (last().content.startsWith(startTag + middleText)) {
          last().content = ''
          clearInterval(interval)
        }
      }
      if (line.type == 'ERROR') {
        nm = Session.addToNow(Role.ASSISTANT, '<font color="#dd0011">[ ' + line.message + ' ]</font>')
        console.error(line)
        callback(line)
        return
      } else if (line.type == 'START') {
        console.log('AI START')
        if (last().role !== 'assistant') {
          nm = Session.addToNow(Role.ASSISTANT, startTag + middleText + '.' + endTag)
          callback(line)
        }
        interval = setInterval(() => {
          if (last().content.startsWith(startTag + middleText)) {
            let dotCount = last().content.split('.').length - 1
            if (dotCount >= 3) {
              last().content = startTag + middleText + endTag
            } else {
              last().content = startTag + middleText + '.'.repeat(dotCount + 1) + endTag
            }
            callback(line)
          }
        }, 300)
      } else if (line.type == 'BODY') {
        clearThinking()
        last().content += line.content
        callback(line)
      } else if (line.type == 'END') {
        clearThinking()
        if (line.content) {
          last().content = line.content
        }
        if (line.finish_reason === 'user') {
          if (this.checkEndInCode(last().content)) {
            last().content += ' ...'
          } else {
            last().content += '<font style="color: #7e0202; font-weight: 700"> ...</font>'
          }
        }
        callback(line)
      }
    })
    return true
  }

  static stop() {
    if (this.ac) {
      this.ac.abort()
      this.ac = null
    }
  }

  static md5(text: string): string {
    return MD5(text).toString().toUpperCase() // 32位大写
  }

  static fetchStream(messages: Chunk[], callback: (line: any) => void) {
    let model = 'CuteGPT'
    let timestamp = new Date().getTime()
    let query = messages[messages.length - 1].content
    let salt = 'AF9C41B0E60C6B9CD2F84D8BC5B5F2A2'
    let token = 'TEMP-USER-TOKEN'
    let nonce = this.md5(timestamp + Math.random().toString())
    // 签名 nonce-timestamp-token-query-model-salt
    let sign = this.md5(nonce + '-' + timestamp + '-' + token + '-' + query + '-' + model + '-' + salt)

    console.log('AI Fetch ' + model + ' :', messages)
    let raw = JSON.stringify({
      "task": {
        "model": model,
        "messages": messages
      },
      "authentication": {
        "version": "v1.0.0",
        "token": token,
        "nonce": nonce,
        "sign": sign
      },
      "version": "v1.0.0",
      "timestamp": timestamp
    })
    console.log(raw)

    let url = "https://chat.rhineai.com/chat/full/stream"
    // let url = "https://rhineai.com/chat/full/stream"
    // let url = "http://shuyantech.com:23496/chat/full/stream"
    // let url = "http://10.176.40.138:23496/chat/full/stream"
    let headers = new Headers()
    headers.append("Content-Type", "application/json")

    this.ac = new AbortController()

    let options: RequestInit = {
      method: 'POST',
      headers: headers,
      body: raw,
      redirect: 'follow',
      signal: this.ac.signal
    }

    try {
      fetch(url, options).then(async response => {
        if (!response.ok) {
          callback({code: 404, message: 'Network error. ' + response.statusText, type: 'ERROR'})
        }

        // @ts-ignore
        const reader = response.body.getReader()
        let decoder = new TextDecoder()
        let data = '';

        let line = null
        console.log(reader)
        while (true) {
          const {done, value} = await reader.read()
          if (done) break;

          data += decoder.decode(value, {stream: true});
          // console.log(data)

          while (data.includes("\n\n")) {
            let eventEndIndex = data.indexOf("\n\n");
            let event = data.slice(0, eventEndIndex);
            data = data.slice(eventEndIndex + 2);
            line = JSON.parse(event.slice(6))
            if (line['finish_reason']) {
              this.setGenerating(false, line['finish_reason'])
              callback({code: 0, message: 'Normal.', type: 'END'})
            }
            console.log('AI Receive:', line)
            callback(line)
          }
        }

        if (line) {
          if (line['finish_reason']) {
            this.setGenerating(false, line['finish_reason'])
            callback({code: 0, message: 'Normal.', type: 'END'})
          } else {
            this.setGenerating(false, 'unknown')
            callback({code: 600, message: 'Warning: Unknown finish reason.', type: 'ERROR'})
          }
        } else {
          this.setGenerating(false, 'network0')
          callback({code: 404, message: 'Empty fetch response error. ', type: 'ERROR'})
        }
      }).catch(e => {
        if (e.name === 'AbortError') {
          this.setGenerating(false, 'user')
          callback({code: 0, message: 'Stream fetch abort by user.', type: 'END', finish_reason: 'user'})
        } else {
          this.setGenerating(false, 'network1')
          callback({code: 404, message: 'Stream fetch error. ' + e, type: 'ERROR'})
        }
      })
    } catch (e) {
      this.setGenerating(false, 'network2')
      callback({code: 405, message: 'Stream fetch error in function. ' + e, type: 'ERROR'})
    }
  }

}

export class Chunk {
  role: 'system' | 'assistant' | 'user' = 'system'
  content: string = ''
}


