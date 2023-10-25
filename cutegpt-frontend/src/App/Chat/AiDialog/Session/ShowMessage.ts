import {Role} from "@/App/Chat/AiDialog/Session/Role";
import Message from "@/App/Chat/AiDialog/Session/Message";
import Session from "@/App/Chat/AiDialog/Session/Session";

export default class ShowMessage {
  sid: number = -1
  role: Role = Role.SYSTEM
  content: string = ''
  list: number[] = []
  favorite?: boolean
}
