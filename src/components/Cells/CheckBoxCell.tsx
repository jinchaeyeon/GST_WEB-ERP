import { GridCellProps } from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";

const CheckBoxCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field } = props;

  return (
    <td
      style={{ textAlign: "center" }}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
    >
      <Checkbox value={dataItem[field ?? ""]}></Checkbox>
    </td>
  );
};

export default CheckBoxCell;
