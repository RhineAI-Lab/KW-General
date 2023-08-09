import React, {DetailedHTMLProps, HTMLAttributes, useEffect} from 'react'
import Style from './MainTable.module.scss'
import {Column} from "@ant-design/plots";
import {ColumnConfig} from "@ant-design/charts";
import {data} from "./Data";
import { each, groupBy } from '@antv/util';

export default function MainTable(props: MainTableProps) {

  const wholeData: any = []
  let radarData: any[] = []
  const types = ['价值认知', '高级认知', '基础认知']
  for (const ti in types) {
    let type = types[ti]
    let datum = data[1][types.length - parseInt(ti) - 1]
    let headers = []
    for (const header of datum['header_list']) {
      const v = parseInt(header['value'])
      if (v >= 0 && v <= 2) {
        headers.push(type + ' - ' + header['text'])
        // headers.push(header['text'])
      }
    }
    for (const line of datum['score_list']) {
      wholeData.push({
        type: type,
        model: line['name'],
        score: line[3]
      })
      for (const hi in headers) {
        radarData.push({
          type: headers[hi],
          model: line['name'],
          score: line[hi],
        })
      }
    }
  }
  radarData = radarData.slice(16).concat(radarData.slice(0, 16))
  console.log(radarData)

  const annotations: any[] = [];
  each(groupBy(data, 'year'), (values, k) => {
    const value = values.reduce((a: any, b: any) => a + b.value, 0);
    annotations.push({
      type: 'model',
      position: [k, value],
      content: `${value}`,
      style: {
        textAlign: 'center',
        fontSize: 14,
        fill: 'rgba(0,0,0,0.85)',
      },
      offsetY: -10,
    });
  });
  const config: ColumnConfig = {
    data: wholeData,

    xField: 'model',
    yField: 'score',
    seriesField: 'type',
    autoFit: true,
    appendPadding: 0,
    isStack: true,
    maxColumnWidth: 120,

    label: {
      position: 'middle',
      layout: [
        {
          type: 'interval-adjust-position',
        },
        {
          type: 'interval-hide-overlap',
        },
        {
          type: 'adjust-color',
        },
      ],
    },
    legend: {
      position: 'right-top',
      padding: [30, 0, 0, -80],
    },
    annotations: annotations,
  }

  const radarConfig: any = {
    data: radarData,
    xField: 'type',
    yField: 'score',
    seriesField: 'model',
    meta: {
      score: {
        alias: '分数',
        min: 0,
        max: 100,
      },
    },
    xAxis: {
      line: null,
      tickLine: null,
      grid: {
        line: {
          style: {
            lineDash: null,
          },
        },
      },
    },
    area: {},
    point: {
      size: 4,
    },
    legend: {
      position: 'top',
      padding: [0, 0, 40, 0],
    }
  };

  useEffect(() => {
  }, [])

  return (
    <div className={Style.MainTable}>
      {/*<Radar className={Style.table} {...radarConfig} />*/}
      <Column className={Style.table} {...config}/>
    </div>
  )
}

export interface MainTableProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  data?: any
}

