import React, {DetailedHTMLProps, HTMLAttributes, useEffect} from 'react'
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
      "values": []
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
    ],
    "data": [],
  }

  const options = {
    "width": 1000,
    "height": 1000,
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
  for (const line of result) {
    for (const categoryKey in structure.children) {
      // @ts-ignore
      let category = structure.children[categoryKey]
      let ld = {
        "model": line.model,
        "type": category.text['zh-cn']
      }
      for (const subCategoryKey in category.children) {
        let subCategory = category.children[subCategoryKey]
        // @ts-ignore
        ld[subCategoryKey] = parseFloat((line['score_level_2'][subCategoryKey] * 100).toFixed(2))
      }
      dataExample.data.push(ld)
    }
  }

  const data = {
    "describe": "总数据表",
    "fields": {
      "rows": [
        "model",
      ],
      "columns": [
        "type",
        "sub_type"
      ],
      "valueInCols": true
    }
  }

  useEffect(() => {
  }, [])

  return (
    <div className={Style.MainTable}>
      <SheetComponent
        dataCfg={dataExample}
        options={options}
      />
    </div>
  )
}

export interface ExcelTableProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  data?: any
}

