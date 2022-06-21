import React, { useCallback, useEffect, useState } from "react";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { useApi } from "../../hooks/api";
import { FieldRenderProps } from "@progress/kendo-react-form";

type TDDL = {
  fieldRenderProps: FieldRenderProps;
  queryStr: String;
  setData(id: string): void;
};
const DDL: React.FC<TDDL> = ({ fieldRenderProps, queryStr, setData }: TDDL) => {
  const processApi = useApi();
  const [listData, setListData] = useState([]);
  const { validationMessage, value, visited, label, id, valid, ...others } =
    fieldRenderProps;

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

      setData(rows);
      setListData(rows);
    }
  }, []);

  return (
    <DropDownList
      data={listData}
      dataItemKey="sub_code"
      textField="code_name"
      value={value}
      defaultItem={{
        sub_code: "",
        code_name: "",
      }}
      valid={valid}
      id={id}
      {...others}
    />
  );
};

export default DDL;
