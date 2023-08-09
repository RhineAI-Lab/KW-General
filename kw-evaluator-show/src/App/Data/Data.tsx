import React, {useEffect} from 'react'
import Style from './Data.module.scss'
import ExcelTable from "../tables/ExcelTable/ExcelTable";

function Data() {

  useEffect(() => {

  }, [])

  return (
    <div className={Style.Data}>
      <ExcelTable/>
    </div>
  )
}

export default Data


