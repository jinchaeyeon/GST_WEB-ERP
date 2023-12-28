import {
  ComboBoxChangeEvent,
  MultiColumnComboBox,
} from "@progress/kendo-react-dropdowns";
import { GridCellProps } from "@progress/kendo-react-grid";
import { bytesToBase64 } from "byte-base64";
import { useCallback, useEffect, useState } from "react";
import { useApi } from "../../hooks/api";
import { getQueryFromBizComponent } from "../CommonFunction";

interface item {
  color: string;
  fontweight: string;
}

interface CustomCellProps extends GridCellProps {
  bizComponent: any;
  textField?: string;
  valueField?: string;
  myProp?: item[];
  colorprops?: boolean;
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
    className = "",
    valueField = "sub_code",
    textField = "code_name",
    myProp,
    colorprops = false,
  } = props;
  const processApi = useApi();
  const [listData, setListData]: any = useState([]);

  let isInEdit = field === dataItem.inEdit;
  if (className.includes("read-only")) {
    isInEdit = false;
  } else if (className.includes("editable-new-only")) {
    if (dataItem["rowstatus"] !== "N") {
      isInEdit = false;
    }
  }

  const queryStr = bizComponent ? getQueryFromBizComponent(bizComponent) : "";
  const dataValue = dataItem[field];

  const value = listData.find((item: any) => item[valueField] === dataValue);

  useEffect(() => {
    fetchData();
  }, []);

  const columns = bizComponent ? bizComponent.bizComponentItems : [];
  let newColumns = columns.map((column: any) => ({
    field: column.fieldName,
    header: column.caption,
    width: column.columnWidth,
  }));
  newColumns = newColumns.filter((column: any) => column.width !== 0);

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
        value: e.target.value ? e.target.value[valueField] : "",
      });
    }
  };

  const defaultRendering =
    myProp == undefined ? (
      colorprops == true ? (
        <td
          aria-colindex={ariaColumnIndex}
          data-grid-col-index={columnIndex}
          style={{ backgroundColor: value == undefined ? "" : value.color }}
        >
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
      ) : (
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
      )
    ) : (
      <td
        aria-colindex={ariaColumnIndex}
        data-grid-col-index={columnIndex}
        style={{
          color:
            field == "prsnnum"
              ? dataItem.dayofweek == "1" || dataItem.dayofweek == "7"
                ? myProp[1].color
                : dataItem.workcls == "A"
                ? myProp[0].color
                : dataItem.workcls == "B"
                ? myProp[2].color
                : myProp[3].color
              : myProp[3].color,
          fontWeight:
            field == "prsnnum"
              ? dataItem.dayofweek == "1" || dataItem.dayofweek == "7"
                ? myProp[1].fontweight
                : dataItem.workcls == "A"
                ? myProp[0].fontweight
                : dataItem.workcls == "B"
                ? myProp[2].fontweight
                : myProp[3].fontweight
              : myProp[3].fontweight,
        }}
      >
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
