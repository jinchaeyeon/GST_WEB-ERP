import { GridCellProps } from "@progress/kendo-react-grid";
import { Checkbox, CheckboxChangeEvent } from "@progress/kendo-react-inputs";
import { TreeListCellProps } from "@progress/kendo-react-treelist";

const CheckBoxTreeListCell = (props: TreeListCellProps) => {
  const { ariaColumnIndex, dataItem, field, render, onChange } = props;
  let value = dataItem[field ?? ""];

  if (value === "Y" || value === true) {
    value = true;
  } else {
    value = false;
  }

  const handleChange = (e: CheckboxChangeEvent) => {
    if (props.onChange) {
      props.onChange({
        dataItem: props.dataItem,
        level: props.level,
        field: props.field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };

  const defaultRendering = (
    <td style={{ textAlign: "center" }} aria-colindex={ariaColumnIndex}>
      <Checkbox value={value} onChange={handleChange}></Checkbox>
    </td>
  );

  return defaultRendering;

  // return render === undefined
  //   ? null
  //   : render?.call(undefined, defaultRendering, props);
};

export default CheckBoxTreeListCell;
