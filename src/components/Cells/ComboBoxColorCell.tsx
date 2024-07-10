import {
  ComboBoxChangeEvent,
  MultiColumnComboBox,
} from "@progress/kendo-react-dropdowns";
import { GridCellProps } from "@progress/kendo-react-grid";
import { useState } from "react";
import { useApi } from "../../hooks/api";

interface CustomCellProps extends GridCellProps {
  bizComponent: any;
  styles: any;
  textField?: string;
  valueField?: string;
}

const ComboBoxColorCell = (props: CustomCellProps) => {
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
    styles,
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

  const defaultRendering = (
    <td
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={styles}
    >
      {isInEdit ? (
        <>
          <MultiColumnComboBox
            data={listData}
            value={value}
            columns={newColumns}
            textField={textField}
            onChange={handleChange}
          />
          <style>
            {`
  .k-dropdowngrid-popup {
    overflow-y: scroll;
    max-height: 250px;
  }
  `}
          </style>
        </>
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

export default ComboBoxColorCell;
