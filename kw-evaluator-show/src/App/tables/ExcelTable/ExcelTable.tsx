import { Chart } from '@antv/g2'
import React, {DetailedHTMLProps, HTMLAttributes, useEffect, useRef} from 'react'
import Style from './ExcelTable.module.scss'
import {Column} from "@ant-design/plots";
import {ColumnConfig, Radar} from "@ant-design/charts";
import { each, groupBy } from '@antv/util';

export default function ExcelTable(props: MainTableProps) {

  const wholeData: any = []
  let radarData: any[] = []

  }

  const radarConfig: any = {
    data: {},
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
      <Radar className={Style.table} {...radarConfig} />
      <Column className={Style.table} {...config}/>
    </div>
  )
}

export interface MainTableProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  data?: any
}

