import React, {DetailedHTMLProps, HTMLAttributes, useEffect, useLayoutEffect, useRef, useState} from "react";
import Style from "./AiDialog.module.scss";
import Icon from "@/compoments/Icon/Icon";
import AiMarkdown from "@/App/Chat/AiDialog/AiMarkdown";
import Inference from "@/App/Chat/AiDialog/Session/Inference";
import {tip} from "@/App/App";
import '@material/web/ripple/ripple.js';
import Session from "@/App/Chat/AiDialog/Session/Session";
import {Role} from "@/App/Chat/AiDialog/Session/Role";
import ShowMessage from "@/App/Chat/AiDialog/Session/ShowMessage";
import Message from "@/App/Chat/AiDialog/Session/Message";

export class ScrollState {
  static leftAtBottom = true
  static rightAtBottom = true

  static checkAtBottom(ref: any) {
    let scrollContainer = ref.current
    if (scrollContainer) {
      let height1 = scrollContainer.clientHeight
      let height2 = scrollContainer.scrollTop
      let height3 = scrollContainer.scrollHeight
      return height1 + height2 + 40 > height3;
    }
    return false
  }
}

let lastHadTable = false
let lastWindowResizeListener: any = null
let lastTableLength = 0

export default function AiDialog(props: AiDialogProps): JSX.Element {

  // device level  0-手机 1-平板 2-电脑
  const [dl, setDl] = useState(0)

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 768) {
        setDl(0)
      } else if (window.innerWidth <= 1024) {
        setDl(1)
      } else {
        setDl(2)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  let [singleMode, setSingleMode] = useState(true)
  let [question, setQuestion] = useState('')
  let [messages, setMessages] = useState<ShowMessage[]>([
    {role: Role.ASSISTANT, content: Inference.firstMessage, sid: -1, list: [-1]}
    // {role: 'user', content: '写个代码'},
    // {role: 'assistant', content: '代码展示测试\n\n```javascript\nlet a = test()\n\nfunction test() {\n  console.log("hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. hello world. ")\n}\n```'},
    // {role: 'assistant', content: '当然！以下是好奇号火星车介绍场景的表格形式：\n\n| 序号 | 场景名称 | 场景介绍 | 场景信息 |\n|----|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|\n| 1 | 探索红色星球 | 欢迎来到火星上的探险之旅！好奇号火星车是NASA火星科学实验室的杰出成果，它是一辆自动化的火星探测车，被用来研究火星表面及其大气层，以揭示更多关于火星的神秘之处。好奇号火星车是人类探索太阳系的壮举，它的各种仪器和设备使它能够进行各类科学实验，并向地球发送宝贵的数据。这个场景中，您将能够近距离观察好奇号火星车的各个细节和功能。火星车的外观呈四方形，覆盖着厚实的金属外壳，以保护车身免受火星恶劣的环境影响。火星车上有多个高精度相机，用于拍摄火星表面的照片，还有激光探测仪，用于分析地质样本。 | 摄像头聚焦在火星车的前方，以展示与火星景观的交互。火星车行驶在红色的火星土壤上，轮胎与地面紧密接触，留下明显的车辙。火星车的机械臂伸展出来，采集火星土壤和岩石样本，然后将它们放入分析仪器中进行实时分析。场景采用逼真的光照效果，再现火星上的环境。 |\n| 2 | 红色星球的奇观 | 好奇号火星车将带您游览火星上引人入胜的奇观！火星表面充满了各种有趣的地貌特征，像是陨石坑、火山口等。在这个场景中，您将能够通过摄像头近距离观察这些奇观。火星车缓慢行驶，让您能够清晰地看到火星表面的地貌变化。火星上的山脉、峡谷、沙丘等将在您的眼前展现出来，带给您一种震撼的体验。同时，火星车上的高精度相机将记录下这些美丽景观的照片，供地球上的科学家进行进一步分析和研究。 | 摄像头将聚焦在火星表面的各种地貌特征上，例如陨石坑、火山口、山脉、峡谷、沙丘等。火星车缓慢驶过这些地貌，让您能够清晰地观察和欣赏它们。场景采用逼真的光照效果，再现火星上的环境。 |\n| 3 | 科学实验之旅 | 好奇号火星车是一台移动的火星科学实验室！在这个场景中，您将亲眼目睹火星车进行各种科学实验的过程。火星车上配备有化学实验装置、气象传感器、光谱仪等多种仪器，可以对火星表面及其大气进行详尽的研究。火星车上的机械臂将采集地壳样本，并进行实时分析。您可以通过摄像头观察到仪器的工作细节，以及火星车传输数据到地球的过程，真正感受到火星探索的科学魅力。 | 摄像头将焦点放在火星车上的仪器和设备上，展示它们在进行科学实验的过程中的细节。火星车上的机械臂将采集地壳样本，并将它们置于分析仪器中进行实时分析。同时，火星车将传输数据到地球上的接收站，您可以清楚地看到数据传输的过程。场景采用逼真的光照效果，再现火星上的环境。 |\n| 4 | 火星上的日落 | 在火星上欣赏壮观的日落景色！火星的日落与地球上的日落有所不同，它呈现出橙红色的明亮光晕和美丽的云层。在这个场景中，您将通过摄像头观察到好奇号火星车停在火星表面上，背景是日落的景色。火星车的金属外壳在夕阳的映衬下闪烁着柔和的光芒，营造出一种神秘而美丽的氛围。您将有机会欣赏到火星上独特的日落景色，并感受到火星的神秘之美。 | 摄像头将焦点放在火星车的位置，使其处于日落的背景下。火星车停在火星表面上，其金属外壳在夕阳照射下呈现出柔和的光芒。场景采用逼真的光照效果，再现火星上日落时的景色。 |\n| 5 | 寻找火星生命 | 火星一直是寻找外星生命的焦点之地！在这个场景中，您将能够了解好奇号火星车在寻找火星生命迹象方面的工作。火星车上配备了微生物生存环境测试仪、化学分析仪等仪器，用于分析土壤和大气中的生物特征。通过摄像头，您将近距离观察火星车进行生命探测实验的过程，感受到寻找外星生命的科学挑战。在这个场景中，您将站在火星上，与好奇号火星车一同寻找火星生命的答案。 | 摄像头将焦点放在火星车上的生命探测仪器和实验过程上。火星车将采集土壤和大气样本，并在仪器中分析其中的生物特征。您将近距离观察火星车进行这些实验，并感受到寻找外星生命的科学探索。场景采用逼真的光照效果，再现火星上的环境。 |\n\n希望以上场景表格能够满足您的需求。如有其他修改或添加的要求，请随时告诉我。'}
  ])
  let [focusI, setFocusI] = useState(-1)
  let [editI, setEditI] = useState(-1)

  let [maxMessageWidth, setMaxMessageWidth] = useState(0)
  let [generating, setGenerating] = useState(false)

  let [tables, setTables] = useState<string[]>([])
  let [tableIndex, setTableIndex] = useState(-1)

  let clickable = question.trim().length > 0
  let rolesStyle: any = {
    assistant: Style.assistant,
    user: Style.user,
  }

  let examples = [
    'Python中怎么发送HTTP的Post请求，详细讲解用法，并写一个示例。',
    '做个电机工作原理的讲义，中英双语。我要用他讲课，要让初中生能理解。',
    '请推荐三本中国古典小说，包含其作品名以及作者名，以表格的形式给出。',
    '介绍一下你自己，你能做些什么。',
  ]

  let rootRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (rootRef.current) {
      let elements = rootRef.current!.getElementsByTagName('md-ripple')
      for (let i = 0; i < elements.length; i++) {
        const shadowRoot = elements[i].shadowRoot;
        if (shadowRoot && !shadowRoot.getElementById('ripple-opacity-transition')) {
          const styleElement = document.createElement('style');
          styleElement.id = 'ripple-opacity-transition'
          styleElement.textContent = `
            .surface::before {
              transition: all 0.2s ease-in-out !important;
            }
          `;
          shadowRoot.appendChild(styleElement);
          // console.log(shadowRoot)
        }
      }
    }
  }, [messages])

  const tipGenerating = () => {
    if (generating) {
      tip('请等待或先停止当前会话')
    }
    return generating
  }

  let leftScrollRef = useRef<HTMLDivElement>(null)
  let rightScrollRef = useRef<HTMLDivElement>(null)

  const freshLeftScroll = () => {
    const scrollContainer = leftScrollRef.current;

    if (scrollContainer) {
      if (ScrollState.leftAtBottom) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }
  const freshRightScroll = () => {
    const scrollContainer = rightScrollRef.current;

    if (scrollContainer) {
      if (ScrollState.rightAtBottom) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }
  useEffect(freshLeftScroll, [messages])
  useEffect(freshRightScroll, [tables, tableIndex])

  const lastMessageRef = useRef<HTMLDivElement | null>(null)
  const prevItemsLength = useRef(messages.length);
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useLayoutEffect(() => {
    if (messages.length > prevItemsLength.current && lastMessageRef.current) {
      lastMessageRef.current.classList.add(Style.messageEntering);
      setTimeout(() => {
        lastMessageRef.current?.classList.remove(Style.messageEntering);
      }, 500); // 动画持续时间
    }
    prevItemsLength.current = messages.length;
  }, [messages])

  // console.log(table)
  let hadTable = tables.length > 0
  if (lastHadTable != hadTable) {
    lastHadTable = hadTable
    freshLeftScroll()
    freshRightScroll()
  }

  const fresh = () => {
    setMessages(Inference.getShowMessages())
    // let nts = Inference.tables
    // let needPageTuning = nts.length !== lastTableLength
    // setTables(nts)
    // if (needPageTuning) {
    //   setTableIndex(nts.length - 1)
    //   lastTableLength = nts.length
    // }
  }
  useEffect(() => {
    Session.freshEasyMessages()
    fresh()
  }, []);

  Inference.onGeneratingChange = (generating: boolean, reason: string) => {
    setGenerating(generating)
  }

  // 简单介绍好奇号火星车，表格中大概3个场景
  const start = (text: string, from: number | undefined = undefined) => {
    Inference.send(text, from,() => {
      fresh()
      // if (chunk.type !== 'BODY' && chunk.type !== 'START') {
      //   setGenerating(false)
      // }
    })
  }
  // console.log('messages:', JSON.stringify(messages))

  const send = (message: string, from: number | undefined = undefined) => {
    if (tipGenerating()) return false
    if (message.length <= 0) {
      return false
    }
    start(message, from)
    setMessages([...messages, {role: Role.USER, content: message, sid: -2, list: [-2]}])
    return true
  }

  const sendFromInput = () => {
    if (tipGenerating()) return false
    if (question.trim().length <= 0) {
      return false
    }
    let message = question.trim()
    let from = undefined
    if (editI !== -1) {
      let previous = Session.getPreviousBySid(messages[editI].sid)
      if (previous) {
        from = previous.sid
      } else {
        from = -1
      }
      setTimeout(() => {
        setEditI(-1)
      }, 1)
    }
    if (send(message, from)) {
      setQuestion('')
    }
  }

  const regenerateOrStop = (fi: number = messages.length - 1) => {
    if (Inference.generating) {
      Inference.stop()
    } else {
      regenerate(fi)
    }
  }

  const regenerate = (fi = messages.length - 1) => {
    if (Session.size() < 1) {
      tip('当前没有待重新提交的问题')
      return
    }
    let from = -1
    let userMessage = undefined
    console.log(messages)
    for (let i = fi; i >= 0; i--) {
      if (messages[i].role == Role.USER) {
        let previous = Session.getPreviousBySid(messages[i].sid)
        if (previous) {
          from = previous.sid
        }
        userMessage = messages[i]
        break
      }
    }
    if (userMessage === undefined) {
      tip('当前会话没有待重新提交的问题')
      return
    }
    start(userMessage.content, from)
  }

  const stop = () => {

  }

  const use = () => {
    if (hadTable) {
      let table = tables[tableIndex]
      let introduces = []
      let tips = []

      let lines = table.split('\n')
      let ii = -1
      let titles = lines[0].split('|')
      for (let i = 0; i < titles.length; i++) {
        let title = titles[i].trim()
        if (title.indexOf('介绍') > -1 || title.indexOf('描述') > -1 || title.indexOf('文案') > -1) {
          ii = i
          break
        }
      }
      if (ii === -1) {
        tip('无法确定到场景描述信息列')
        return
      }
      for (let i = 2; i < lines.length; i++) {
        let line = lines[i]
        let items = line.split('|')
        console.log(items)
        if (items.length > ii) {
          let introduce = items[ii].trim()
          introduces.push(introduce.trim())
        } else {
          introduces.push('')
        }
        if (items.length > ii + 1) {
          let tip = items[ii + 1].trim()
          tips.push(tip.trim())
        } else {
          tips.push('')
        }
      }
      tip('文本应用完成', 'success')
    }
    // Inference.messages.push(
    //   {role: 'assistant', content: '当然！以下是好奇号火星车介绍场景的表格形式：\n\n| 序号 | 场景名称 | 场景介绍 | 场景信息 |\n|----|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|\n| 1 | 探索红色星球 | 欢迎来到火星上的探险之旅！好奇号火星车是NASA火星科学实验室的杰出成果，它是一辆自动化的火星探测车，被用来研究火星表面及其大气层，以揭示更多关于火星的神秘之处。好奇号火星车是人类探索太阳系的壮举，它的各种仪器和设备使它能够进行各类科学实验，并向地球发送宝贵的数据。这个场景中，您将能够近距离观察好奇号火星车的各个细节和功能。火星车的外观呈四方形，覆盖着厚实的金属外壳，以保护车身免受火星恶劣的环境影响。火星车上有多个高精度相机，用于拍摄火星表面的照片，还有激光探测仪，用于分析地质样本。 | 摄像头聚焦在火星车的前方，以展示与火星景观的交互。火星车行驶在红色的火星土壤上，轮胎与地面紧密接触，留下明显的车辙。火星车的机械臂伸展出来，采集火星土壤和岩石样本，然后将它们放入分析仪器中进行实时分析。场景采用逼真的光照效果，再现火星上的环境。 |\n| 2 | 红色星球的奇观 | 好奇号火星车将带您游览火星上引人入胜的奇观！火星表面充满了各种有趣的地貌特征，像是陨石坑、火山口等。在这个场景中，您将能够通过摄像头近距离观察这些奇观。火星车缓慢行驶，让您能够清晰地看到火星表面的地貌变化。火星上的山脉、峡谷、沙丘等将在您的眼前展现出来，带给您一种震撼的体验。同时，火星车上的高精度相机将记录下这些美丽景观的照片，供地球上的科学家进行进一步分析和研究。 | 摄像头将聚焦在火星表面的各种地貌特征上，例如陨石坑、火山口、山脉、峡谷、沙丘等。火星车缓慢驶过这些地貌，让您能够清晰地观察和欣赏它们。场景采用逼真的光照效果，再现火星上的环境。 |\n| 3 | 科学实验之旅 | 好奇号火星车是一台移动的火星科学实验室！在这个场景中，您将亲眼目睹火星车进行各种科学实验的过程。火星车上配备有化学实验装置、气象传感器、光谱仪等多种仪器，可以对火星表面及其大气进行详尽的研究。火星车上的机械臂将采集地壳样本，并进行实时分析。您可以通过摄像头观察到仪器的工作细节，以及火星车传输数据到地球的过程，真正感受到火星探索的科学魅力。 | 摄像头将焦点放在火星车上的仪器和设备上，展示它们在进行科学实验的过程中的细节。火星车上的机械臂将采集地壳样本，并将它们置于分析仪器中进行实时分析。同时，火星车将传输数据到地球上的接收站，您可以清楚地看到数据传输的过程。场景采用逼真的光照效果，再现火星上的环境。 |\n| 4 | 火星上的日落 | 在火星上欣赏壮观的日落景色！火星的日落与地球上的日落有所不同，它呈现出橙红色的明亮光晕和美丽的云层。在这个场景中，您将通过摄像头观察到好奇号火星车停在火星表面上，背景是日落的景色。火星车的金属外壳在夕阳的映衬下闪烁着柔和的光芒，营造出一种神秘而美丽的氛围。您将有机会欣赏到火星上独特的日落景色，并感受到火星的神秘之美。 | 摄像头将焦点放在火星车的位置，使其处于日落的背景下。火星车停在火星表面上，其金属外壳在夕阳照射下呈现出柔和的光芒。场景采用逼真的光照效果，再现火星上日落时的景色。 |\n| 5 | 寻找火星生命 | 火星一直是寻找外星生命的焦点之地！在这个场景中，您将能够了解好奇号火星车在寻找火星生命迹象方面的工作。火星车上配备了微生物生存环境测试仪、化学分析仪等仪器，用于分析土壤和大气中的生物特征。通过摄像头，您将近距离观察火星车进行生命探测实验的过程，感受到寻找外星生命的科学挑战。在这个场景中，您将站在火星上，与好奇号火星车一同寻找火星生命的答案。 | 摄像头将焦点放在火星车上的生命探测仪器和实验过程上。火星车将采集土壤和大气样本，并在仪器中分析其中的生物特征。您将近距离观察火星车进行这些实验，并感受到寻找外星生命的科学探索。场景采用逼真的光照效果，再现火星上的环境。 |\n\n希望以上场景表格能够满足您的需求。如有其他修改或添加的要求，请随时告诉我。'}
    // )
    // fresh()
  }

  const favorite = (v: any, i: number) => {
    v.favorite = !v.favorite
    let target = Session.get(v.sid)
    if (target) {
      target.favorite = v.favorite
    }
    setMessages([...messages])
  }

  const remove = (v: any, i: number) => {
    if (tipGenerating()) return
    let target = Session.get(v.sid)
    if (target) {
      let previous = Session.getPreviousBySid(v.sid)
      console.log(previous)
      if (!previous) {
        previous = Session.base
      }
      let pnl = previous.nextList
      let index = pnl.indexOf(v.sid)
      pnl.splice(index, 1)
      if (previous.next == v.sid) {
        if (pnl.length > 0) {
          previous.next = pnl[pnl.length - 1]
        } else {
          previous.next = -1
        }
      }
      previous.removeList.push(v.sid)
    }
    fresh()
    console.log(Session.base)
    console.log(Session.messages)
  }


  const clear = () => {
    // messages[0].content += '然！以下是好奇号火星车介绍场景的表格形式'
    // setMessages([...messages])
    // return;
    if (Inference.generating) {
      tip('请先等待当前会话生成完成')
      return
    }
    Session.messages = []
    Session.base = new Message(-1, Role.SYSTEM, 'BASE MESSAGE', 'stop', -1, [])
    fresh()
    // tip('暂不支持重置会话')
  }

  const share = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('http://chat.rhineai.com')
      tip('分享链接已复制')
    } else {
      tip('当前浏览器环境不支持写入剪贴板')
    }
  }

  let showExamples = messages.length <= 1

  // 通过幽灵元素进行过渡动画
  const ghostRef = useRef<HTMLDivElement | null>(null)
  const [widths, setWidths] = useState<number[]>([])
  const [heights, setHeights] = useState<number[]>([])
  const [bottomHeight, setBottomHeight] = useState(0)

  const freshMessagesSize = () => {
    const ghost = ghostRef.current;
    if (ghost) {
      const nodes = ghost.getElementsByClassName(Style.content)
      const widths: number[] = Array.from(nodes).map((node: any) => node.clientWidth - 35)
      const heights: number[] = Array.from(nodes).map((node: any) => node.clientHeight - 23)
      setWidths(widths)
      setHeights(heights)
    }
  }

  const isIos = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  }
  const ifIosClassName = () => {
    if(isIos()) {
      return ' ' + Style.ios
    }
    return ''
  }

  const resizeTextarea = () => {
    const textarea = inputRef.current
    if (!textarea) return
    let sourceHeight = textarea.style.height
    textarea.style.height = 'auto'
    // textarea.style.height = sourceHeight
    // textarea.style.height = textarea.scrollHeight + 'px'
    if (isIos()) {
      setBottomHeight(textarea.scrollHeight + 34)
      textarea.style.marginTop = '17px'
    } else {
      setBottomHeight(textarea.scrollHeight)
    }
    textarea.style.height = '100%'
  }

  if (lastWindowResizeListener) {
    window.removeEventListener('resize', lastWindowResizeListener)
  }
  lastWindowResizeListener = (e: any) => {
    freshMessagesSize()
    resizeTextarea()
  }
  window.addEventListener('resize', lastWindowResizeListener)

  useEffect(() => {
    freshMessagesSize()
  }, [messages])


  useEffect(() => {
    resizeTextarea()
  }, [question])

  const setInputFocus = () => {
    if (inputRef.current) {
      const value = inputRef.current.value
      inputRef.current.focus()
      inputRef.current.setSelectionRange(value.length, value.length)
    }
  }

  const edit = (v: any, i: number) => {
    setEditI(i)
    setQuestion(v.content)
    setInputFocus()
    if (focusI >= i) {
      setFocusI(-1)
    }
  }

  const select = (sid: number) => {
    let target = Session.get(sid)
    if (target) {
      let previous = Session.getPrevious(target)
      console.log(target, previous)
      if (previous) {
        previous.next = sid
      } else {
        Session.base.next = sid
      }
      fresh()
    }
  }

  const lastMessage = (v: any, i: number) => {
    if (tipGenerating()) return
    let vi = v.list.indexOf(v.sid)
    if (vi > 0) {
      select(v.list[vi - 1])
    } else {
      tip('已经是第一条记录了')
    }
  }

  const nextMessage = (v: any, i: number) => {
    if (tipGenerating()) return
    let vi = v.list.indexOf(v.sid)
    if (vi < v.list.length - 1) {
      select(v.list[vi + 1])
    } else {
      tip('已经是最后一条记录了')
    }
  }



  // is generating and is last message sid
  const isGl = (sid: number) => {
    return generating && sid == messages[messages.length - 1].sid
  }

  // get operate buttons holder width
  const getObw = (v: any, i: number) => {
    let w = widths[i] + 36
    let d = v.list.length > 1 ? 302 : 196
    return w ? Math.max(w, d) : d
  }

  // operate buttons classname
  const obsClass = (disable = false) => {
    let ct = Style.button + ' ' + Style.secondary + ' ' + Style.mini + ' ' + Style.outlined
    if (disable) ct += ' ' + Style.disable
    return ct
  }

  return <div
    ref={rootRef}
    className={
      Style.AiDialog + ' ' +
      (hadTable ? '' : Style.hadTable + ' ' + props.className) + ' ' +
      (dl == 0 ? Style.dl0 : '') + ifIosClassName()
    }
    onClick={e => setFocusI(-1)}
    {...props}
  >
    <div className={Style.leftBar}>

    </div>
    <div className={Style.main}>
      <div className={Style.shadow} style={{
        marginBottom: '-16px',
      }}>
        <div style={{boxShadow: '0 0 10px 10px #fff', top: 0}}></div>
      </div>
      <div className={Style.suggestion} style={{
        opacity: showExamples ? 1 : 0,
        pointerEvents: showExamples ? 'auto' : 'none',
      }}>
        <div className={Style.suggestionTitle}>Example & Suggestion</div>
        <div className={Style.line}>
          <div className={Style.cardHolder}>
            <div className={Style.card} onClick={e => send(examples[0])}>
              {examples[0]}
              <Icon size='32px' className={Style.send}>send</Icon>
              <md-ripple></md-ripple>
            </div>
          </div>
          <div className={Style.cardHolder}>
            <div className={Style.card} onClick={e => send(examples[1])}>
              {examples[1]}
              <Icon size='32px' className={Style.send}>send</Icon>
              <md-ripple></md-ripple>
            </div>
          </div>
        </div>
        <div className={Style.line}>
          <div className={Style.cardHolder}>
            <div className={Style.card} onClick={e => send(examples[2])}>
              {examples[2]}
              <Icon size='32px' className={Style.send}>send</Icon>
              <md-ripple></md-ripple>
            </div>
          </div>
          <div className={Style.cardHolder}>
            <div className={Style.card} onClick={e => send(examples[3])}>
              {examples[3]}
              <Icon size='32px' className={Style.send}>send</Icon>
              <md-ripple></md-ripple>
            </div>
          </div>
        </div>
        <div className={Style.line}>
          <div className={Style.cardHolder}>
            <div className={Style.card} onClick={e => send(examples[1])}>
              {examples[1]}
              <Icon size='32px' className={Style.send}>send</Icon>
              <md-ripple></md-ripple>
            </div>
          </div>
          <div className={Style.cardHolder}>
            <div className={Style.card} onClick={e => send(examples[3])}>
              {examples[3]}
              <Icon size='32px' className={Style.send}>send</Icon>
              <md-ripple></md-ripple>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={leftScrollRef}
        className={Style.messagesHolder + ' scroll ' + Style.scroll}
        onScroll={e => ScrollState.leftAtBottom = ScrollState.checkAtBottom(leftScrollRef)}
        style={{bottom: hadTable ? '84px' : bottomHeight + 86 + 'px'}}
      >
        <div className={Style.messages}>
          <div className={Style.title}>
            CuteGPT
            <Icon size='48px'>round_insights</Icon>
          </div>
          {
            messages.map((v, i) => {
              let [role, content] = [v.role, v.content]
              let icon = '/chat/' + (role === 'assistant' ? 'ai-easy' : 'user') + '-head-icon.png'
              return <div
                className={Style.message + ' ' + rolesStyle[v.role] + ' ' + (i == focusI ? Style.focusMessage : '')}
                key={i}
                ref={i === messages.length - 1 ? lastMessageRef : null}
                style={{
                  opacity: (editI > -1 && editI <= i) ? 0.5 : 1,
                  pointerEvents: (editI > -1 && editI <= i) ? 'none' : 'all',
                }}
              >
                <div className={Style.operateButtons} style={{
                  opacity: focusI == i ? 1 : 0,
                  width: getObw(v, i),
                }}>
                  <div
                    className={obsClass()}
                    onClick={e => {
                      e.stopPropagation()
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(v.content)
                        tip('已复制')
                      }
                    }}
                  >
                    <Icon size='23px'>round_content_copy</Icon>
                    <md-ripple></md-ripple>
                  </div>
                  <div
                    className={obsClass()}
                    onClick={e => {
                      e.stopPropagation()
                      if (v.role == Role.USER) {
                        edit(v, i)
                      } else {
                        if (isGl(v.sid)) {
                          regenerateOrStop(i)
                        } else if (!tipGenerating()) {
                          regenerate(i)
                        }
                      }
                    }}
                    style={{
                      marginLeft: '10px',
                      display: i > 0 ? 'inline-block' : 'none',
                    }}
                  >
                    <Icon size='26px'>{
                      v.role == Role.ASSISTANT ? (isGl(v.sid) ? 'outlined_stop' : 'round_refresh') : 'outlined_create'
                    }</Icon>
                    <md-ripple></md-ripple>
                  </div>
                  <div className={Style.space}></div>
                  <div
                    className={obsClass()}
                    onClick={e => {
                      e.stopPropagation()
                      favorite(v, i)
                    }}
                    style={{
                      marginLeft: '16px',
                      display: i > 0 ? 'inline-block' : 'none',
                    }}
                  >
                    <Icon size='29px'>{v.favorite ? 'round_star' : 'round_star_border'}</Icon>
                    <md-ripple></md-ripple>
                  </div>
                  <div
                    className={obsClass()}
                    onClick={e => {
                      e.stopPropagation()
                      remove(v, i)
                    }}
                    style={{
                      marginLeft: '10px',
                      display: i > 0 ? 'inline-block' : 'none',
                    }}
                  >
                    <Icon size='26px'>outlined_delete</Icon>
                    <md-ripple></md-ripple>
                  </div>
                  <div
                    className={obsClass(v.list.indexOf(v.sid) <= 0)}
                    onClick={e => {
                      e.stopPropagation()
                      lastMessage(v, i)
                    }}
                    style={{
                      marginLeft: '16px',
                      display: v.list.length > 1 ? 'inline-block' : 'none',
                    }}
                  >
                    <Icon size='20px'>round_arrow_back_ios</Icon>
                    <md-ripple></md-ripple>
                  </div>
                  <div
                    className={obsClass(v.list.indexOf(v.sid) >= v.list.length - 1)}
                    onClick={e => {
                      e.stopPropagation()
                      nextMessage(v, i)
                    }}
                    style={{
                      marginLeft: '10px',
                      display: v.list.length > 1 ? 'inline-block' : 'none',
                    }}
                  >
                    <Icon size='20px'>round_arrow_forward_ios</Icon>
                    <md-ripple></md-ripple>
                  </div>
                </div>
                <div className={Style.avatar}>
                  <img src={icon} alt='head-icon'/>
                </div>
                <div
                  className={Style.content + ' ' + Style.contentTruth}
                  style={{
                    width: widths[i],
                    height: heights[i]
                  }}
                  onClick={e => {
                    e.stopPropagation()
                    setFocusI(i)
                  }}
                >
                  <div
                    className={Style.truthSize}
                    style={{
                      width: widths[i],
                      height: heights[i]
                    }}
                  >
                    <AiMarkdown>
                      {v.content}
                    </AiMarkdown>
                    <md-ripple></md-ripple>
                  </div>
                  <div className={Style.pageProgress} style={{
                    display: v.list.length > 1 ? 'inline-block' : 'none',
                  }}>
                    {v.list.indexOf(v.sid) + 1 + ' / ' + v.list.length}
                  </div>
                </div>
              </div>
            })
          }
        </div>
      </div>
      <div
        className={Style.messagesHolder + ' scroll ' + Style.scroll + ' ' + Style.messagesHolderGhost}
        onScroll={e => ScrollState.leftAtBottom = ScrollState.checkAtBottom(leftScrollRef)}
      >
        <div className={Style.messages} onResize={freshMessagesSize} ref={ghostRef}>
          {
            messages.map((v, i) => {
              let [role, content] = [v.role, v.content]
              let icon = '/editor/' + (role === 'assistant' ? 'ai' : 'user') + '-head-icon.png'
              return <div
                className={Style.message + ' ' + rolesStyle[v.role] + ' '}
                key={i}
              >
                <div className={Style.avatar}>
                  <img src={icon} alt='head-icon'/>
                </div>
                <div
                  className={Style.content}
                >
                  <AiMarkdown>
                    {
                      v.content
                      + ((i == messages.length - 1 && generating && v.role == 'assistant') ? ' ABCDEFGHIJ' : '')
                      + (v.list && v.list.length > 1 ? '<span class="' + Style.pageProgressSpace + '">' + (v.list.indexOf(v.sid) + 1 + ' / ' + v.list.length) + '</span>' : '')
                    }
                  </AiMarkdown>
                </div>
              </div>
            })
          }
        </div>
      </div>
      <div className={Style.shadow} style={{
        marginTop: '-16px',
        marginBottom: '-1px'
      }}>
        <div style={{
          boxShadow: '0 0 10px 10px #fff',
          marginTop: '16px',
        }}></div>
      </div>
      <div className={Style.buttons} style={{
        bottom: hadTable ? '24px' : bottomHeight + 36 + 'px'
      }}>
        {/*<div*/}
        {/*  className={Style.button + ' ' + Style.secondary}*/}
        {/*  onClick={() => {}}*/}
        {/*>*/}
        {/*  <Icon>round_tune</Icon>*/}
        {/*  <span className={Style.text}>清空</span>*/}
        {/*  <md-ripple></md-ripple>*/}
        {/*</div>*/}
        <div
          className={Style.button + ' ' + Style.secondary}
          onClick={() => {clear()}}
        >
          <Icon>delete_outline</Icon>
          <span className={Style.text}>重置</span>
          <md-ripple></md-ripple>
        </div>
        <div
          className={Style.button + ' ' + Style.secondary + ' ' + Style.mini}
          onClick={() => {share()}}
          style={{marginLeft: '10px'}}
        >
          <Icon size='20px'>round_share</Icon>
          {/*<span className={Style.text}>分享</span>*/}
          <md-ripple></md-ripple>
        </div>
        <div className={Style.space}></div>
        <md-filled-button style={{
          height: 48,
          opacity: messages.length > 1 ? 1 : 0,
          pointerEvents: messages.length > 1 ? 'auto' : 'none',
          transition: 'opacity 0.2s ease-in-out',
        }} onClick={() => {
          if (editI > -1) {
            setEditI(-1)
            setQuestion('')
          } else {
            regenerateOrStop()
          }
        }}>
          <div className={Style.buttonInner}>
            {
              editI > -1
                ? <Icon size='28px'>close</Icon>
                : generating
                  ? <Icon size='28px'>outlined_stop</Icon>
                  : <Icon size='24px'>round_refresh</Icon>
            }
            <span className={Style.text}>{editI > -1 ? '取消编辑' : generating ? '停止生成' : '重新生成'}</span>
          </div>
        </md-filled-button>
        {/*<div className={Style.button + ' ' + Style.main} onClick={e => use()}>*/}
        {/*  <Icon size='26px'>round_done</Icon>*/}
        {/*  <span className={Style.text}>{hadTable ? '应用文本' : '结束对话'}</span>*/}
        {/*</div>*/}
        <div
          className={Style.button + ' ' + Style.secondary + ' ' + Style.mini}
          onClick={e => {
          }}
          style={{
            marginRight: '-4px',
            display: 'none',
          }}
        >
          <Icon size='24px'>round_arrow_back_ios</Icon>
        </div>
        <div
          className={Style.button + ' ' + Style.secondary + ' ' + Style.mini}
          onClick={e => {
          }}
          style={{
            display: 'none',
          }}
        >
          <Icon size='24px'>round_arrow_forward_ios</Icon>
        </div>
      </div>
      <div className={Style.inputHolder} style={{
        height: bottomHeight,
        minHeight: bottomHeight,
      }}>
      <textarea
        rows={1}
        className={Style.input}
        placeholder="让AI给你解答问题或和他聊天"
        value={question}
        onChange={e => {
          setQuestion(e.target.value)
          resizeTextarea()
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
            sendFromInput()
            e.stopPropagation()
            e.preventDefault()
          }
        }}
        ref={inputRef}
      />
        <div
          className={Style.mic}
          onClick={e => sendFromInput()}
        >
          <Icon size='28px'>round_mic_none</Icon>
        </div>
        <div
          className={Style.send + (clickable ? ' ' + Style.sendClickable : '')}
          onClick={e => sendFromInput()}
        >
          <Icon color={clickable ? '#ffffff' : '#888888'} size={clickable ? '20px' : '24px'}>round_send</Icon>
        </div>
      </div>
      <div className={Style.mode}></div>
    </div>
  </div>
}

export interface AiDialogProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
}
