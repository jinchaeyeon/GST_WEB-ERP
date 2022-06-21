import React, { useCallback, useEffect, useState } from "react";
import {
  DropDownList,
  DropDownListChangeEvent,
  DropDownListFilterChangeEvent,
} from "@progress/kendo-react-dropdowns";

import { useRecoilState } from "recoil";
import { usersState } from "../../store/atoms";
import { useApi } from "../../hooks/api";
import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  filterBy,
} from "@progress/kendo-data-query";

const DDL: React.FC = () => {
  const processApi = useApi();
  const [listData, setListData] = useState([]); //원본 데이터
  const [filteredData, setFilterdData] = useState([]); //필터링된 데이터
  const [state, setState] = useRecoilState(usersState); //상태

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    let data: any;
    let queryStr =
      "SELECT user_id sub_code, user_name code_name FROM sysUserMaster WHERE rtrchk <> 'Y' AND hold_check_yn <> 'Y'";
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
      setFilterdData(rows.slice());
    }
  }, []);

  const onChangeHandle = (e: DropDownListChangeEvent) => {
    const { value } = e.target;
    setState({ sub_code: value.sub_code, code_name: value.code_name });
  };

  const filterData = (filter: FilterDescriptor | CompositeFilterDescriptor) => {
    const data = listData;
    return filterBy(data, filter);
  };

  const filterChange = (event: DropDownListFilterChangeEvent) => {
    setFilterdData(filterData(event.filter));
  };

  return (
    <DropDownList
      data={filteredData}
      dataItemKey="sub_code"
      textField="code_name"
      value={state}
      defaultItem={{
        sub_code: "",
        code_name: "전체",
      }}
      onChange={onChangeHandle}
      filterable={true}
      onFilterChange={filterChange}
    />
  );
};

export default DDL;
