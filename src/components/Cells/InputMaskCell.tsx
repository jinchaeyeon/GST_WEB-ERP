import { GridCellProps } from "@progress/kendo-react-grid";
import { MaskedTextBox } from "@progress/kendo-react-inputs";

interface CustomGridCellProps extends GridCellProps {
  mask: any;
}

const InputMaskCell = (props: CustomGridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
    rowType,
    mask = "",
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

  const handleChange = (e: { syntheticEvent: any; target: { value: any } }) => {
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
      <td aria-colindex={ariaColumnIndex} data-grid-col-index={columnIndex}>
        {isInEdit ? (
          <MaskedTextBox mask={mask} value={value} onChange={handleChange} />
        ) : (
          value.replaceAll("-", "")
        )}
      </td>
    );

  return render == undefined
    ? defaultRendering
    : render?.call(undefined, defaultRendering, props);
};

export default InputMaskCell;
