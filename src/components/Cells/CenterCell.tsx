import { GridCellProps } from "@progress/kendo-react-grid";
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";

const CenterCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
    rowType,
  } = props;
  let isInEdit = field == dataItem.inEdit;
  if (className.includes("read-only")) {
    isInEdit = false;
  } else if (className.includes("editable-new-only")) {
    if (dataItem["rowstatus"] !== "N") {
      isInEdit = false;
    }
  }

  const value = dataItem[field];

  const handleChange = (e: InputChangeEvent) => {
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

  const defaultRendering =
    rowType == "groupHeader" ? null : (
      <td
        style={{ textAlign: "center" }}
        aria-colindex={ariaColumnIndex}
        data-grid-col-index={columnIndex}
      >
        {isInEdit ? <Input value={value} onChange={handleChange} /> : value}
      </td>
    );

  return render == undefined
    ? defaultRendering
    : render?.call(undefined, defaultRendering, props);
};

export default CenterCell;
