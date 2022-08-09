import React, { useCallback, useEffect, useState } from "react";
import {
  DropDownList,
  DropDownListChangeEvent,
} from "@progress/kendo-react-dropdowns";

import { useApi } from "../../hooks/api";
import { commonCodeDefaultValue } from "../CommonString";
import { TCommonCode } from "../../store/types";

type TCommonDropDownList = {
  name: string;
  queryStr: string;
  changeData(name: string, data: object): void;
  defaultValue?: TCommonCode;
};
const CommonDropDownList = ({
  name,
  queryStr,
  changeData,
  defaultValue = commonCodeDefaultValue,
}: TCommonDropDownList) => {
  const processApi = useApi();
  const [listData, setListData] = useState([]);
  const [state, setState] = useState(defaultValue); //상태

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

  const onChangeHandle = (e: DropDownListChangeEvent) => {
    const { value } = e.target;
    const selectedData = {
      sub_code: value.sub_code,
      code_name: value.code_name,
    };

    setState(selectedData);
    changeData(name, selectedData);
  };

  return (
    <DropDownList
      data={listData}
      dataItemKey="sub_code"
      textField="code_name"
      value={state}
      defaultItem={commonCodeDefaultValue}
      onChange={onChangeHandle}
    />
  );
};

export default CommonDropDownList;
