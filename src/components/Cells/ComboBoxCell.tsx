import {
  ComboBoxChangeEvent,
  MultiColumnComboBox,
} from "@progress/kendo-react-dropdowns";
import { GridCellProps } from "@progress/kendo-react-grid";
import { bytesToBase64 } from "byte-base64";
import { useState } from "react";
import { useApi } from "../../hooks/api";

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
  page?: string;
  color?: string;
  disabled?: boolean;
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
    page = "",
    color = "black",
    disabled = false,
  } = props;
  const processApi = useApi();
  const [listData, setListData]: any = useState(bizComponent.data.Rows);

  let isInEdit = field == dataItem.inEdit;
  if (className.includes("read-only")) {
    isInEdit = false;
  } else if (className.includes("editable-new-only")) {
    if (dataItem["rowstatus"] !== "N") {
      isInEdit = false;
    }
  }

  const dataValue = dataItem[field];

  const value = listData.find((item: any) => item[valueField] == dataValue);

  const columns = bizComponent ? bizComponent.bizComponentItems : [];
  let newColumns = columns.map((column: any) => ({
    field: column.fieldName,
    header: column.caption,
    width: column.columnWidth,
  }));
  newColumns = newColumns.filter((column: any) => column.width !== 0);

  const handleChange = async (e: ComboBoxChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ? e.target.value[valueField] : "",
      });

      if (page == "Approval") {
        onChange({
          dataIndex: 0,
          dataItem: dataItem,
          field: "postcd",
          syntheticEvent: e.syntheticEvent,
          value: e.value.postcd,
        });
      }

      if (page == "reviewlvl1") {
        onChange({
          dataIndex: 0,
          dataItem: dataItem,
          field: "title",
          syntheticEvent: e.syntheticEvent,
          value: "",
        });
        onChange({
          dataIndex: 0,
          dataItem: dataItem,
          field: "contents",
          syntheticEvent: e.syntheticEvent,
          value: "",
        });
      }

      if (page == "title") {
        let data: any;
        const queryStr2 = `SELECT reviewlvl1, contents FROM HU270T WHERE ORGDIV = '${
          dataItem.orgdiv
        }' AND hrreviewnum = '${
          e.target.value ? e.target.value[valueField] : ""
        }'`;
        const bytes = require("utf8-bytes");
        const convertedQueryStr = bytesToBase64(bytes(queryStr2));

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
          if (rows[0].reviewlvl1 != dataItem.reviewlvl1) {
            onChange({
              dataIndex: 0,
              dataItem: dataItem,
              field: "title",
              syntheticEvent: e.syntheticEvent,
              value: "",
            });
            onChange({
              dataIndex: 0,
              dataItem: dataItem,
              field: "contents",
              syntheticEvent: e.syntheticEvent,
              value: "",
            });
            onChange({
              dataIndex: 0,
              dataItem: dataItem,
              field: "hrreviewnum",
              syntheticEvent: e.syntheticEvent,
              value: "",
            });
          } else {
            onChange({
              dataIndex: 0,
              dataItem: dataItem,
              field: "contents",
              syntheticEvent: e.syntheticEvent,
              value: rows[0].contents,
            });
          }
        }
      }
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
              disabled={disabled}
            />
          ) : value ? (
            value[textField]
          ) : (
            ""
          )}
        </td>
      ) : (
        <td
          aria-colindex={ariaColumnIndex}
          data-grid-col-index={columnIndex}
          style={{ color: color }}
        >
          {isInEdit ? (
            <MultiColumnComboBox
              data={listData}
              value={value}
              columns={newColumns}
              textField={textField}
              onChange={handleChange}
              disabled={disabled}
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
            disabled={disabled}
          />
        ) : value ? (
          value[textField]
        ) : (
          ""
        )}
      </td>
    );

  return render == undefined
    ? null
    : render?.call(undefined, defaultRendering, props);
};

export default ComboBoxCell;
