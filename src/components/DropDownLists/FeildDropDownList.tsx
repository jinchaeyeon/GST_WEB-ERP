import React, { useCallback, useEffect, useState } from "react";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { useApi } from "../../hooks/api";
import { FieldRenderProps } from "@progress/kendo-react-form";
import { checkIsDDLValid } from "../CommonFunction";
import { commonCodeDefaultValue } from "../CommonString";

type TDDL = {
  fieldRenderProps: FieldRenderProps;
  queryStr: string;
};
const DDL: React.FC<TDDL> = ({ fieldRenderProps, queryStr }: TDDL) => {
  const processApi = useApi();
  const [listData, setListData] = useState([]);
  const {
    validationMessage,
    visited,
    value,
    label,
    id,
    valid,
    className,
    ...others
  } = fieldRenderProps;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    let data: any;

    let query = {
      query: "query?query=" + encodeURIComponent(queryStr),
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

  const required = className?.includes("required");
  let DDLvalid = valid;
  if (required) DDLvalid = checkIsDDLValid(value);

  return (
    <DropDownList
      data={listData}
      dataItemKey="sub_code"
      textField="code_name"
      value={value}
      className={className}
      defaultItem={commonCodeDefaultValue}
      valid={DDLvalid}
      id={id}
      {...others}
    />
  );
};

export default DDL;
