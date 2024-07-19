import {
  ComboBoxChangeEvent,
  ComboBoxFilterChangeEvent,
  MultiColumnComboBox as KendoMultiColumnComboBox,
} from "@progress/kendo-react-dropdowns";
import { useCallback, useEffect, useState } from "react";

import { filterBy, FilterDescriptor } from "@progress/kendo-data-query";
import { bytesToBase64 } from "byte-base64";
import { useApi } from "../../hooks/api";

type TComboBox = {
  name: string;
  value: string | number;
  queryStr: string;
  columns: any;
  changeData(e: any): void;
  textField?: string;
  valueField?: string;
};
const MultiColumnComboBoxWithQuery = ({
  name,
  value,
  queryStr,
  columns,
  changeData,
  textField = "code_name",
  valueField = "sub_code",
}: TComboBox) => {
  const processApi = useApi();
  const [listData, setListData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  //콤보박스 리스트 쿼리 조회
  const fetchData = useCallback(async () => {
    let data: any;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;

      setListData(rows); //리스트 세팅
    }
  }, []);
  // const columns = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query").find(
  //   (item: any) => item.id == name
  // ).bizComponentItems;

  let newColumns = [];

  if (columns) {
    newColumns = columns.map((column: any) => ({
      field: column.fieldName,
      header: column.caption,
      width: column.columnWidth,
    }));

    newColumns = newColumns.filter((column: any) => column.width !== 0);
  }
  const onChangeHandle = (e: ComboBoxChangeEvent) => {
    let value = e.target.value == null ? "" : e.target.value[valueField];
    changeData({ name, value });
    setState(false);
  };

  const [state, setState] = useState(false);

  document.getElementById(name)?.addEventListener("focusout", (event) => {
    setState(false);
  });

  const [filter, setFilter] = useState<FilterDescriptor>();

  const handleFilterChange = (event: ComboBoxFilterChangeEvent) => {
    if (event) {
      setFilter(event.filter);
    }
  };

  return (
    <>
      <KendoMultiColumnComboBox
        id={name}
        data={filter ? filterBy(listData, filter) : listData}
        value={
          value ? listData.find((item: any) => item[valueField] == value) : ""
        }
        columns={newColumns}
        textField={textField}
        onChange={onChangeHandle}
        opened={state}
        onOpen={() => setState(true)}
        onClose={() => setState(false)}
        filterable={true}
        onFilterChange={handleFilterChange}
      />
    </>
  );
};

export default MultiColumnComboBoxWithQuery;
