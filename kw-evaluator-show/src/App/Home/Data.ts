
export const data: any = [
  [
    {
      tab: "总体得分",
      idx: 0,
      next: true,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "基础认知", value: "0" },
        { text: "高级认知", value: "1" },
        { text: "价值认知", value: "2" },
        { text: "总体得分", value: "3" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: "--",
          1: 97.4,
          2: "--",
          3: 97.4,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: "--",
          1: 93.1,
          2: "--",
          3: 93.1,
        },
        {
          name: "text-davinci-003",
          0: "--",
          1: 68.4,
          2: "--",
          3: 68.4,
        },
        {
          name: "davinci",
          0: "--",
          1: 39.4,
          2: "--",
          3: 39.4,
        },
        {
          name: "text-curie-001",
          0: "--",
          1: 31.1,
          2: "--",
          3: 31.1,
        },
        {
          name: "text-davinci-002",
          0: "--",
          1: 28.4,
          2: "--",
          3: 28.4,
        },
        {
          name: "curie",
          0: "--",
          1: 21.4,
          2: "--",
          3: 21.4,
        },
        {
          name: "ada",
          0: "--",
          1: 20.0,
          2: "--",
          3: 20.0,
        },
        {
          name: "text-babbage-001",
          0: "--",
          1: 19.7,
          2: "--",
          3: 19.7,
        },
        {
          name: "babbage",
          0: "--",
          1: 0.3,
          2: "--",
          3: 0.3,
        },
      ],
    },
  ],
  [
    {
      tab: "基础认知",
      idx: 0,
      next: true,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "Effectiveness", value: "0" },
        { text: "Robustness", value: "1" },
        { text: "Efficiency", value: "2" },
        { text: "总体得分", value: "3" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: 84.0,
          1: 100.0,
          2: 96.0,
          3: 100.0,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: 72.0,
          1: 98.5,
          2: 92.6,
          3: 76.3,
        },
      ],
    },
    {
      tab: "高级认知",
      idx: 1,
      next: true,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "注意", value: "0" },
        { text: "感觉", value: "1" },
        { text: "知觉", value: "2" },
        { text: "总体得分", value: "3" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: 84.0,
          1: 100.0,
          2: 96.0,
          3: 97.4,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: 72.0,
          1: 98.5,
          2: 92.6,
          3: 93.1,
        },
      ],
    },
    {
      tab: "价值认知",
      idx: 2,
      next: true,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "歧视", value: "0" },
        { text: "隐私泄露", value: "1" },
        { text: "社会观念", value: "2" },
        { text: "总体得分", value: "3" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: 84.0,
          1: 100.0,
          2: 96.0,
          3: 97.4,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: 72.0,
          1: 98.5,
          2: 92.6,
          3: 93.1,
        },
      ],
    },
  ],
  [
    {
      tab: "Effectiveness",
      idx: 0,
      next: true,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "问答", value: "0" },
        { text: "摘要", value: "1" },
        { text: "抽取", value: "2" },
        { text: "总体得分", value: "3" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: 84.0,
          1: 100.0,
          2: 96.0,
          3: 100.0,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: 72.0,
          1: 98.5,
          2: 92.6,
          3: 76.3,
        },
      ],
    },
    {
      tab: "Robustness",
      idx: 1,
      next: true,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "扰动样本", value: "0" },
        { text: "总体得分", value: "1" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: 84.0,
          1: 90.0,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: 72.0,
          1: 98.5,
        },
      ],
    },
    {
      tab: "Efficiency",
      idx: 2,
      next: true,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "平均预测时间", value: "0" },
        { text: "最长预测时间", value: "1" },
        { text: "训练耗时", value: "2" },
        { text: "总体得分", value: "3" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: 84.0,
          1: 90.0,
          2: 96.0,
          3: 90.0,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: 72.0,
          1: 98.5,
          2: 92.6,
          3: 76.3,
        },
      ],
    },
  ],
  [
    {
      tab: "问答",
      idx: 0,
      next: true,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "上下文问答", value: "0" },
        { text: "无上下文问答", value: "1" },
        { text: "总体得分", value: "2" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: 84.0,
          1: 100.0,
          2: 96.0,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: 72.0,
          1: 98.5,
          2: 92.6,
        },
      ],
    },
    {
      tab: "摘要",
      idx: 1,
      next: true,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "抽取式摘要", value: "0" },
        { text: "生成式摘要", value: "1" },
        { text: "总体得分", value: "2" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: 84.0,
          1: 100.0,
          2: 96.0,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: 72.0,
          1: 98.5,
          2: 92.6,
        },
      ],
    },
    {
      tab: "抽取",
      idx: 2,
      next: true,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "实体抽取", value: "0" },
        { text: "关系抽取", value: "1" },
        { text: "总体得分", value: "2" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: 84.0,
          1: 100.0,
          2: 96.0,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: 72.0,
          1: 98.5,
          2: 92.6,
        },
      ],
    },
  ],
  [
    {
      tab: "上下文问答",
      idx: 0,
      next: true,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "抽取式问答", value: "0" },
        { text: "生成式问答", value: "1" },
        { text: "总体得分", value: "2" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: 84.0,
          1: 84.0,
          2: 84.0,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: 84.0,
          1: 84.0,
          2: 84.0,
        },
      ],
    },
    {
      tab: "无上下文问答",
      idx: 1,
      next: false,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "总体得分", value: "0" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: 84.0,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: 72.0,
        },
      ],
    },
  ],
  [
    {
      tab: "抽取式问答",
      idx: 0,
      next: false,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "总体得分", value: "0" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: 84.0,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: 72.0,
        },
      ],
    },
    {
      tab: "生成式问答",
      idx: 1,
      next: false,
      header_list: [
        {
          text: "模型名称",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "总体得分", value: "0" },
      ],
      score_list: [
        {
          name: "gpt-3.5-turbo",
          0: 84.0,
        },
        {
          name: "gpt-3.5-turbo-0301",
          0: 72.0,
        },
      ],
    },
  ],
]
