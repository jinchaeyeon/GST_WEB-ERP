import React, { useCallback, useEffect, useState } from "react";
import {
  DropDownList,
  DropDownListChangeEvent,
} from "@progress/kendo-react-dropdowns";

import { useRecoilState } from "recoil";
import { ordstsState } from "../../store/atoms";
import { useApi } from "../../hooks/api";

const DDL: React.FC = () => {
  const processApi = useApi();
  const [listData, setListData] = useState([]);
  const [state, setState] = useRecoilState(ordstsState); //상태

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    let data: any;
    let queryStr =
      "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'SA002' AND system_yn = 'Y'";

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
    setState({ sub_code: value.sub_code, code_name: value.code_name });
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
