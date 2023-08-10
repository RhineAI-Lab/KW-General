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
  let size = 0
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
    }
    size += ca.children.length
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
      <div className={Style.canvas} ref={canvasRef}>
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
        </div>
        <div className={Style.scroll}>
          <div className={Style.content} style={{
            width: size * bs
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
          </div>
        </div>
      </div>
    </div>
  )
}

export interface ExcelTableProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  data?: any
}

