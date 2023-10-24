import {Role} from "@/App/Chat/AiDialog/Session/Role";

export default class Message {
  sid: number = -1
  role: Role = Role.SYSTEM
  content: string = ''
  stop: string = 'stop'  // 'stop':normal  '':generating  'other...'

  deep: number = 0
  time: number = new Date().getTime()

  like = false
  favorite = false

  next: number = -1  // sid
  nextList: number[] = []

  hasNext() {
    return this.next != -1
  }

  constructor(sid: number, role: Role, content: string, stop: string = 'stop', next: number = -1, nextList: number[] = []) {
    this.sid = sid
    this.role = role
    this.content = content
    this.stop = stop
    this.next = next
    if (next != -1 && nextList.length == 0) {
      nextList = [next]
    }
    this.nextList = nextList
  }
}

