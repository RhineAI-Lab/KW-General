
export default class Model {
  domain: 'server' | 'local' | 'inner' = 'inner'
  path: string = ''
  type: 'glb' | 'gltf' | 'obj' | 'fbx' | 'babylon' | 'inner' = 'inner'
  
  instances: Instance[] = []
  
  constructor(
    domain: 'server' | 'local' | 'inner' = 'inner',
    path: string = '',
    type: 'glb' | 'gltf' | 'obj' | 'fbx' | 'babylon' | 'inner' = 'inner',
    instances: Instance[] = [],
  ) {
    this.domain = domain
    this.path = path
    this.type = type
    this.instances = instances
  }
}

export interface Instance {
  uid: number
  name: string
  isGroup?: boolean
}
