
export default class Inference {

  static prompt = ''

  static firstMessage = '我是STEP-FLOW的AI助手，可以帮您设计一些模型的展示场景，介绍文本，或与您交流，回答相关的问题。请问有什么可以帮您？'


  static messages: Chunk[]  = [
    {role: 'system', content: Inference.prompt},
    {role: 'assistant', content: Inference.firstMessage},
  ]
  static tables: string[] = []

  static generating = false
  static ac: AbortController | null = null
  static finishReason = ''

  static setGenerating(generating: boolean, reason: string = '') {
    this.generating = generating
    this.finishReason = reason
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
    let messagesShow = []
    this.tables = []
    for (let i = 0; i < this.messages.length; i++) {
      let message = this.messages[i]
      if (message.role == 'assistant' || message.role == 'user') {
        let content = message.content
        const regex = /\|? *序号 *\| *场景名称 *\|/;
        const tableStart = content.search(regex);
        if (tableStart == -1) {
          messagesShow.push({role: message.role, content: content})
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
            messagesShow.push({role: message.role, content: content.slice(0, tableStart)})
            tableText = content.slice(tableStart)
            if (this.generating) {
              let char = '♫♬'[this.charIndex%2]
              if (!this.checkEndInCode(tableText)) {
                tableText += '<font style="color: #340486; font-weight: 700; font-size: large"> '+char+'</font>'
              }
            }
          } else {
            messagesShow.push({role: message.role, content: content.slice(0, tableStart) + content.slice(end + 1)}) // +2
            tableText = content.slice(tableStart, end)
          }
          if (tableText.split('\n').length > 2) {
            this.tables.push(tableText)
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
    return messagesShow
  }

  static send(message: string, callback: (line: any) => void) {
    let interval: any = null
    this.setGenerating(true, '')
    this.messages.push({role: 'user', content: message})
    this.fetchStream(this.messages, (line) => {
      let startTag = '<span style="color: #340486; font-weight: 700">'
      let middleText = 'Thinking'
      let endTag = '</span>'
      const last = () => {
        return this.messages[this.messages.length - 1]
      }
      const clearThinking = () => {
        if (last().content.startsWith(startTag + middleText)) {
          last().content = ''
          clearInterval(interval)
        }
      }
      if (line.type == 'ERROR') {
        this.messages.push({role: 'assistant', content: '<font color="#dd0011">[ ' + line.message + ' ]</font>'})
        console.error(line)
        callback(line)
        return
      } else if (line.type == 'START') {
        console.log('AI START')
        if (last().role !== 'assistant') {
          this.messages.push({role: 'assistant', content: startTag + middleText + '.' + endTag})
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

  static fetchStream(messages: Chunk[], callback: (line: any) => void) {
    let model = 'gpt-3.5-turbo'

    let w = window as any
    if (w.prompt && w.prompt.length > 0) {
      console.info('Use prompt: ', w.prompt)
      messages[0] = {role: 'system', content: w.prompt}
    }
    if (w.gpt4) {
      console.info('Use model: ', w.gpt4)
      model = 'gpt-4'
    }

    console.log('AI Fetch ' + model + ' :', messages)
    let raw = JSON.stringify({
      "task": {
        "messages": messages
      },
      "model": model,
    })
    console.log(raw)

    let url = "https://rhineai.com/chat/full/stream"
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
        const reader = response.body.getReader();
        let decoder = new TextDecoder();
        let data = '';

        let line = null
        while (true) {
          const {done, value} = await reader.read();
          if (done) break;

          data += decoder.decode(value, {stream: true});

          while (data.includes("\n\n")) {
            let eventEndIndex = data.indexOf("\n\n");
            let event = data.slice(0, eventEndIndex);
            data = data.slice(eventEndIndex + 2);
            line = JSON.parse(event.slice(6))
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
            callback({code: 600, message: 'Unknown error.', type: 'ERROR'})
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


