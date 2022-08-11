import React, { useCallback, useEffect, useState } from "react";
import {
  MultiColumnComboBox,
  ComboBoxChangeEvent,
} from "@progress/kendo-react-dropdowns";

import { useApi } from "../../hooks/api";

type TCommonComboBox = {
  name: string;
  customOptionData: any;
  changeData(e: object): void;
  textField?: string;
  valueField?: string;
};
const CommonComboBox = ({
  name,
  customOptionData,
  changeData,
  textField = "code_name",
  valueField = "sub_code",
}: TCommonComboBox) => {
  const processApi = useApi();
  const [listData, setListData] = useState([]);

  const [state, setState] = useState(null); //상태

  useEffect(() => {
    fetchData();
  }, []);

  //콤보박스 리스트 쿼리 조회
  const fetchData = useCallback(async () => {
    let data: any;

    const queryStr = customOptionData.menuCustomDefaultOptions.query.find(
      (item: any) => item.id === name
    ).query;

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
      //리스트 세팅
      setListData(rows);

      //커스텀 옵션에 저장된 값으로 디폴트 값 세팅
      const strDefaultValue =
        customOptionData.menuCustomDefaultOptions.query.find(
          (item: any) => item.id === name
        ).value;
      const defaultValue = rows.find(
        (row: any) => row[valueField] === strDefaultValue
      );
      setState(defaultValue);
      changeData({ name, value: defaultValue });
    }
  }, []);

  const onChangeHandle = (e: ComboBoxChangeEvent) => {
    const { value } = e.target;

    setState(value);
    changeData({ name, value });
  };

  const columns = customOptionData.menuCustomDefaultOptions.query.find(
    (item: any) => item.id === name
  ).bizComponentItems;

  let newColumns = columns.map((column: any) => ({
    field: column.fieldName,
    header: column.caption,
    width: column.columnWidth,
  }));

  newColumns = newColumns.filter((column: any) => column.width !== 0);

  return (
    <MultiColumnComboBox
      data={listData}
      value={state}
      columns={newColumns}
      textField={textField}
      onChange={onChangeHandle}
    />
  );
};

export default CommonComboBox;
