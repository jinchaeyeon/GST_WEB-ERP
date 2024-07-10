import {
  ComboBoxChangeEvent,
  MultiColumnComboBox,
} from "@progress/kendo-react-dropdowns";
import { TreeListCellProps } from "@progress/kendo-react-treelist";
import { useState } from "react";

interface CustomCellProps extends TreeListCellProps {
  bizComponent: any;
  valueField?: string;
  textField?: string;
  readOnly?: boolean;
}
const ComboBoxCell = (props: CustomCellProps) => {
  const {
    level,
    ariaColumnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    bizComponent,
    valueField = "sub_code",
    textField = "code_name",
    readOnly = false,
    ...others
  } = props;

  const [listData, setListData]: any = useState(bizComponent.data.Rows);
  const isInEdit = readOnly ? false : field == dataItem.inEdit;

  const handleChange = (e: ComboBoxChangeEvent) => {
    if (onChange) {
      onChange({
        level: level,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
      onChange({
        dataItem: dataItem,
        level: level,
        field: "rowstatus",
        syntheticEvent: e.syntheticEvent,
        value: dataItem["rowstatus"] == "N" ? "N" : "U",
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

  const dataValue = dataItem[field] == null ? "" : dataItem[field];
  const value = listData.find((item: any) => item[valueField] == dataValue);

  const defaultRendering = (
    <td aria-colindex={ariaColumnIndex}>
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

export default ComboBoxCell;
