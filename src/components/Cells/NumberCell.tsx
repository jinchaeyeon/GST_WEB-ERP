import { GridCellProps } from "@progress/kendo-react-grid";
import {
  NumericTextBox,
  NumericTextBoxChangeEvent,
} from "@progress/kendo-react-inputs";
import { numberWithCommas3 } from "../CommonFunction";

interface CustomCellProps extends GridCellProps {
  myProp?: item[];
  color?: string;
}

interface item {
  color: string;
}

const NumberCell = (props: CustomCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    render,
    onChange,
    field = "",
    className = "",
    myProp,
    color = "black",
  } = props;
  let isInEdit = field == dataItem.inEdit;
  const value = dataItem[field];
  if (className.includes("read-only")) {
    isInEdit = false;
  }
  const handleChange = (e: NumericTextBoxChangeEvent) => {
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
    myProp == undefined ? (
      <td
        style={{ textAlign: "right", color: color }}
        aria-colindex={ariaColumnIndex}
        data-grid-col-index={columnIndex}
      >
        {isInEdit ? (
          <NumericTextBox value={value} format={"0"} onChange={handleChange} />
        ) : (
          numberWithCommas3(value)
        )}
      </td>
    ) : (
      <td
        aria-colindex={ariaColumnIndex}
        data-grid-col-index={columnIndex}
        style={{
          textAlign: "right",
          color:
            field == "unp"
              ? dataItem.overlap == "Y"
                ? myProp[0].color
                : myProp[1].color
              : myProp[1].color,
        }}
      >
        {isInEdit ? (
          <NumericTextBox value={value} format={"0"} onChange={handleChange} />
        ) : (
          numberWithCommas3(value)
        )}
      </td>
    );

  return render == undefined
    ? defaultRendering
    : render?.call(undefined, defaultRendering, props);
};

export default NumberCell;
