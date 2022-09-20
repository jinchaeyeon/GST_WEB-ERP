import React, { useCallback, useEffect, useState } from "react";
import {
  ComboBoxChangeEvent,
  MultiColumnComboBox,
  MultiColumnComboBoxChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { useApi } from "../../hooks/api";
import { GridCellProps } from "@progress/kendo-react-grid";
import { getQueryFromBizComponent } from "../CommonFunction";

interface CustomCellProps extends GridCellProps {
  bizComponent: any;
  textField?: string;
}
const ComboBoxCell = (props: CustomCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    bizComponent,
    textField = "code_name",
    ...others
  } = props;

  const processApi = useApi();
  const [listData, setListData]: any = useState([]);
  const isInEdit = field === dataItem.inEdit;
  const queryStr = bizComponent ? getQueryFromBizComponent(bizComponent) : "";

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
    } else {
      console.log("[오류발생]");
      console.log(data);
    }
  }, []);

  const handleChange = (e: ComboBoxChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };
  const columns = bizComponent ? bizComponent.bizComponentItems : [];
  let newColumns = columns.map((column: any) => ({
    field: column.fieldName,
    header: column.caption,
    width: column.columnWidth,
  }));
  newColumns = newColumns.filter((column: any) => column.width !== 0);

  const dataValue = dataItem[field] === null ? "" : dataItem[field];
  const value = listData.find((item: any) => item.sub_code === dataValue);

  const defaultRendering = (
    <td aria-colindex={ariaColumnIndex} data-grid-col-index={columnIndex}>
      {isInEdit ? (
        <MultiColumnComboBox
          data={listData}
          value={value}
          columns={newColumns}
          textField={textField}
          onChange={handleChange}
        />
      ) : value ? (
        value[textField]
      ) : (
        ""
      )}
    </td>
  );

  return render === undefined
    ? null
    : render?.call(undefined, defaultRendering, props);
};

export default ComboBoxCell;
