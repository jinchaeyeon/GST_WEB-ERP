import React, { useCallback, useEffect, useState } from "react";
import {
  DropDownList,
  DropDownListChangeEvent,
} from "@progress/kendo-react-dropdowns";

import { useApi } from "../../hooks/api";
import { commonCodeDefaultValue } from "../CommonString";

type TDDL = {
  name: string;
  queryStr: string;
  changeData(name: string, data: object): void;
};
const DDL = ({ name, queryStr, changeData }: TDDL) => {
  const processApi = useApi();
  const [listData, setListData] = useState([]);
  const [state, setState] = useState(commonCodeDefaultValue); //상태

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

    if (data != null) {
      const rows = data.result.data.Rows;
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
      defaultItem={{
        sub_code: "",
        code_name: "전체",
      }}
      onChange={onChangeHandle}
    />
  );
};

export default DDL;
