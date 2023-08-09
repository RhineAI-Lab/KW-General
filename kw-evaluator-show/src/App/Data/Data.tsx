import React, {useEffect, useRef} from 'react'
import Style from './Data.module.scss'
import { Chart } from '@antv/g2'
import MainTable from "../tables/MainTable/MainTable";
import ExcelTable from "../tables/ExcelTable/ExcelTable";

function Data() {
  const tableContainerRef = useRef(null)

  useEffect(() => {

  }, [])

  return (
    <div className={Style.Data}>
      <ExcelTable/>
    </div>
  )
}

export default Data


