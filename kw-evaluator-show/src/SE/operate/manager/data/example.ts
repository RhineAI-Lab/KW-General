import {Project} from "@/SE/operate/manager/data/Project";


export const data: any = {
  pid: -1,
  
  title: '新项目1',
  description: '新项目1的描述',
  tags: ['标签1', '标签2'],
  
  version: '1.1.0',
  createTime: 1620000000000,
  updateTime: 1620000000000,
  
  permission: {
    read: ['user1', 'user2'],
    write: 'PRIVATE'
  },
  
  show: {
    auto: true,
    loop: true,
    interval: 2
  },
  
  models: [
    {
      domain: 'server',
      path: 'user/10001/0/model.glb',
      type: 'glb',
      instances: [
        {name: '模型1-1', uid: 11},
      ],
    },
    {
      domain: 'inner',
      path: 'sphere',
      type: 'inner',
      instances: [
        {name: '模型2-1', uid: 12}
      ]
    }
  ],
  
  steps: [
    {
      title: '步骤1',
      description: '这是步骤1的描述',
      nodes: [
        {
          // uid对应babylon中的uniqueId 每次导入模型时会不一样 存储中仅用于区分模型
          uid: '11',
          
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scaling: [1, 1, 1],
          
          // 注意!!
          // 模型状态（MeshState - isMesh:true） 也可以拥有子模型（children属性），并非只有模型组（GroupState）才能拥有子模型
          children: [
            {
              uid: '22',
              
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scaling: [1, 1, 1],
              
              children: [],
  
              label: '模型1',
              spin: [0, 50, 50],
            }
          ],
        }
      ]
    }
  ]
}

