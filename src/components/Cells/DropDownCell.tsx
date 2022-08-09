import React, { useCallback, useEffect, useState } from "react";
import {
  DropDownList,
  DropDownListChangeEvent,
} from "@progress/kendo-react-dropdowns";

import { useApi } from "../../hooks/api";
import { commonCodeDefaultValue } from "../CommonString";
import { GridCellProps } from "@progress/kendo-react-grid";

import {
  itemacntQuery,
  outgbQuery,
  outprocynQuery,
  proccdQuery,
  prodmacQuery,
  qtyunitQuery,
  usersQuery,
} from "../CommonString";
const DropDownCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
  } = props;

  // console.log("props");
  // console.log(props);
  const processApi = useApi();
  const [listData, setListData] = useState([]);
  const [state, setState] = useState(commonCodeDefaultValue); //상태

  const isInEdit = field === dataItem.inEdit;

  const srcPgName = dataItem.srcPgName;
  //const parentField = UseGetParentField(srcPgName);

  let queryStr = "SELECT '' sub_code, '' code_name";

  if (field === "itemacnt") queryStr = itemacntQuery;
  else if (field === "qtyunit") queryStr = qtyunitQuery;
  else if (field === "proccd") queryStr = proccdQuery;
  else if (field === "outprocyn") queryStr = outprocynQuery;
  else if (field === "prodmac") queryStr = prodmacQuery;
  else if (field === "outgb") queryStr = outgbQuery;
  else if (field === "prodemp") queryStr = usersQuery;
  else if (field === "proccd") queryStr = proccdQuery;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    let data: any;

    let query = {
      query: "query?query=" + queryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  // const onChangeHandle = (e: DropDownListChangeEvent) => {
  //   const { value } = e.target;
  //   const selectedData = {
  //     sub_code: value.sub_code,
  //     code_name: value.code_name,
  //   };

  //   setState(selectedData);
  //   // changeData(name, selectedData);
  // };

  const onChangeHandle = (ev: DropDownListChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: ev.syntheticEvent,
        value: ev.target.value ?? ev.target.value.text,
      });
    }
  };

  const defaultRendering = (
    <td>
      {isInEdit ? (
        <DropDownList
          data={listData}
          dataItemKey="sub_code"
          textField="code_name"
          value={dataItem[field]}
          defaultItem={commonCodeDefaultValue}
          onChange={onChangeHandle}
        />
      ) : dataItem[field] ? (
        dataItem[field].code_name
      ) : (
        ""
      )}
    </td>
  );

  return render?.call(undefined, defaultRendering, props);
};

export default DropDownCell;
