import React, {DetailedHTMLProps, HTMLAttributes, useEffect, useRef, useState} from 'react'
import Style from './ExcelTable.module.scss'
import {SheetComponent} from "@antv/s2-react";
import {structure} from "../data/structure";
import {result} from "../data/result";

export default function ExcelTable(props: ExcelTableProps) {

  const dataExample: any = {
    "describe": "总数据表",
    "fields": {
      "rows": [
        "model",
      ],
      "columns": [
        "type",
      ],
      "values": ["total"]
    },
    "meta": [
      {
        "field": "model",
        "name": "模型",
      },
      {
        "field": "type",
        "name": "类别"
      },
      {
        "field": "total",
        "name": "总分"
      }
    ],
    "data": [],
  }

  for (const categoryKey in structure.children) {
    // @ts-ignore
    let category = structure.children[categoryKey]
    dataExample.meta.push({
      "field": category.label,
      "name": category.text['zh-cn'],
    })
    for (const subCategoryKey in category.children) {
      let subCategory = category.children[subCategoryKey]
      dataExample.fields.values.push(subCategory.label)
      dataExample.meta.push({
        "field": subCategory.label,
        "name": subCategory.text['zh-cn'],
      })
    }
  }

  let [detailMode, setDetailMode] = useState(true)
  for (const line of result) {
    for (const categoryKey in structure.children) {
      // @ts-ignore
      let category = structure.children[categoryKey]
      let ld: any = {
        "model": line.model,
        "type": category.text['zh-cn']
      }
      if (detailMode) {
        for (const subCategoryKey in category.children) {
          let subCategory = category.children[subCategoryKey]
          // @ts-ignore
          ld[subCategoryKey] = parseFloat((line['score_level_2'][subCategoryKey] * 100).toFixed(2))
        }
      } else {
        // @ts-ignore
        ld['total'] = parseFloat((line['score_level_1'][categoryKey] * 100).toFixed(2))
      }
      dataExample.data.push(ld)
    }
  }

  const [options, setOptions] = useState({
    showSeriesNumber: true,
    width: 1000,
    height: 1000,
  })

  const canvasRef = useRef(null)

  useEffect(() => {
    setOptions({
      showSeriesNumber: true,
      width: document.body.offsetWidth - 80,
      height: document.body.offsetHeight,
    })
    window.addEventListener('resize', () => {
      setOptions({
        showSeriesNumber: true,
        width: document.body.offsetWidth - 80,
        height: document.body.offsetHeight,
      })
    })
  }, [])

  let bs = 30
  let order: string[] = []
  const st = []
  for (const categoryKey in structure.children) {
    let category = structure.children[categoryKey]
    let ca = {
      label: category.label,
      text: category.text,
      children: []
    }
    for (const subCategoryKey in category.children) {
      // @ts-ignore
      ca.children.push(category.children[subCategoryKey])
      order.push(subCategoryKey)
    }
    st.push(ca)
  }

  return (
    <div className={Style.MainTable}>
      <div className={Style.s2}>
        <SheetComponent
          dataCfg={dataExample}
          options={options}
          themeCfg={{name: 'default'}}
        />
      </div>
      <div className={Style.canvas} style={{
        height: result.length * 30 + 18 + 140
      }} ref={canvasRef}>
        <div className={Style.left}>
          <div className={Style.headline}>
            <div className={Style.firstLine}>
              <span>类别</span>
            </div>
            <div className={Style.secondLine}>
              <div className={Style.box}>
                <span>序号</span>
              </div>
              <div className={Style.box}>
                <span>模型</span>
              </div>
            </div>
          </div>
          <div className={Style.body}>
            {
              result.map((line, index) => {
                return <div className={Style.index} style={{
                  height: bs - 1,
                }}>
                  <div className={Style.box}>
                    <span>{index}</span>
                  </div>
                  <div className={Style.box}>
                    <span>{line.model}</span>
                  </div>
                </div>
              })
            }
          </div>
        </div>
        <div className={Style.scroll}>
          <div className={Style.content} style={{
            width: order.length * bs
          }}>
            <div className={Style.headline}>
              <div className={Style.firstLine}>
                {
                  st.map(category => {
                    return <div className={Style.category} style={{
                      width: bs * category.children.length - 1
                    }}>
                      <span>{category.text['zh-cn']}</span>
                    </div>
                  })
                }
              </div>
              <div className={Style.secondLine}>
                {
                  st.map(category => {
                    return category.children.map((info: any) => {
                      return <div className={Style.category} style={{
                        width: bs - 1,
                        height: 100
                      }}>
                        <span>{info.text['zh-cn']}</span>
                      </div>
                    })
                  })
                }
              </div>
            </div>
            <div className={Style.body}>
              {
                result.map((line, i) => {
                  return <div className={Style.line} style={{height: 30}}>
                    {
                      order.map((item, j) => {
                        // 13 26 52   255 255 255
                        // @ts-ignore
                        let score = line['score_level_2'][item] * 1.2 - 0.1
                        return <div className={Style.item} style={{
                          height: 30,
                          width: 30,
                          backgroundColor: `rgb(${255 - score * 242}, ${255 - score * 229}, ${255 - score * 203})`
                        }}/>
                      })
                    }
                  </div>
                })
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export interface ExcelTableProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  data?: any
}

