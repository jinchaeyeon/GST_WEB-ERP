import React, { useCallback, useEffect, useState } from "react";
import {
  MultiColumnComboBox,
  ComboBoxChangeEvent,
} from "@progress/kendo-react-dropdowns";

import { useApi } from "../../hooks/api";

type TCustomOptionComboBox = {
  name: string;
  value: string | number;
  customOptionData: any;
  changeData(e: any): void;
  textField?: string;
  valueField?: string;
};
const CustomOptionComboBox = ({
  name,
  value,
  customOptionData,
  changeData,
  textField = "code_name",
  valueField = "sub_code",
}: TCustomOptionComboBox) => {
  const processApi = useApi();
  const [listData, setListData] = useState([]);

  const dataList = customOptionData.menuCustomDefaultOptions.query;
  useEffect(() => {
    if (dataList) {
      fetchData();
    }
  }, []);

  //콤보박스 리스트 쿼리 조회
  const fetchData = useCallback(async () => {
    let data: any;

    const queryStr = dataList.find((item: any) => item.id === name).query;

    let query = {
      query: "query?query=" + encodeURIComponent(queryStr),
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;

      setListData(rows); //리스트 세팅
    }
  }, []);

  let newColumns = [];

  if (dataList) {
    const columns = dataList.find(
      (item: any) => item.id === name
    ).bizComponentItems;

    if (columns) {
      newColumns = columns.map((column: any) => ({
        field: column.fieldName,
        header: column.caption,
        width: column.columnWidth,
      }));

      newColumns = newColumns.filter((column: any) => column.width !== 0);
    }
  }
  const onChangeHandle = (e: ComboBoxChangeEvent) => {
    let value = e.target.value === null ? "" : e.target.value[valueField];
    changeData({ name, value });
  };

  return (
    <MultiColumnComboBox
      data={listData}
      textField={textField}
      value={
        value ? listData.find((item: any) => item[valueField] === value) : ""
      }
      columns={newColumns}
      onChange={onChangeHandle}
      id={name}
    />
  );
};

export default CustomOptionComboBox;
