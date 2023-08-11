import Model from './Model'

export class Project {
  pid: number = -1
  
  title: string = ''
  description: string = ''
  tags: string[] = []
  
  version: string = '1.1.0'
  createTime: number = Date.now()
  updateTime: number = Date.now()
  
  permission: {
    read: string[] | 'PRIVATE' | 'FRIEND' | 'PUBLIC'
    write: string[] | 'PRIVATE' | 'FRIEND' | 'PUBLIC'
  } = {
    read: 'PRIVATE',
    write: 'PRIVATE'
  }
  
  show: {
    auto: boolean
    loop: boolean
    interval?: number
  } = {
    auto: true,
    loop: false,
    interval: 1000
  }
  
  models: Model[] = []
  
  steps: Step[] = [{
    nodes: []
  }]
}

export interface Step {
  title?: string
  description?: string
  tip?: string
  img?: string
  audio?: string
  
  camera?: {
    position: Vector3
    target: Vector3
  },
  environment?: {
    color: string
    skybox: {
    }
  }
  
  nodes: State[]
}


export interface NodeState {
  uid: number
  
  position: Vector3
  rotation: Vector3
  scaling: Vector3
  
  children?: State[]
}

export interface MeshState extends NodeState {
  // isMesh = true
  spin?: Vector3
  tripDis?: Vector3
  tripSpeed?: Vector3
  
  color?: string
  opacity?: number
  material?: number
  label?: string
}

export interface GroupState extends NodeState {
  // isMesh = false
}

export type State = MeshState | GroupState

export type Vector3 = [number, number, number]

export type Vector4 = [number, number, number, number]
