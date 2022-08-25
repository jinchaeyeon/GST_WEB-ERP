import React, { useCallback, useEffect, useState } from "react";
import { MultiColumnComboBox } from "@progress/kendo-react-dropdowns";
import { useApi } from "../../hooks/api";
import { FieldRenderProps } from "@progress/kendo-react-form";
import { checkIsDDLValid } from "../CommonFunction";

type TCommonComboBox = {
  fieldRenderProps: FieldRenderProps;
  queryStr: string;
  textField?: string;
};
const CommonComboBox: React.FC<TCommonComboBox> = ({
  fieldRenderProps,
  queryStr,
  textField,
}: TCommonComboBox) => {
  const processApi = useApi();
  const { validationMessage, visited, className, valid, columns, ...others } =
    fieldRenderProps;
  const [listData, setListData] = useState([]);

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

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;

      setListData(rows);
    }
  }, []);

  let newColumns = columns.map((column: any) => ({
    field: column.fieldName,
    header: column.caption,
    width: column.columnWidth,
  }));
  newColumns = newColumns.filter((column: any) => column.width !== 0);

  const required = className?.includes("required");
  let DDLvalid = valid;
  if (required) DDLvalid = checkIsDDLValid(fieldRenderProps.value);

  return (
    <MultiColumnComboBox
      data={listData}
      textField={textField}
      columns={newColumns}
      className={className}
      valid={DDLvalid}
      {...others}
    />
  );
};

export default CommonComboBox;
