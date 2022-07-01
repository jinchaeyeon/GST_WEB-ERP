import { GridCellProps } from "@progress/kendo-react-grid";
import { numberWithCommas } from "../CommonFunction";

const NumberCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field } = props;
  return (
    <td
      style={{ textAlign: "right" }}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
    >
      {field ? numberWithCommas(dataItem[field]) : ""}
    </td>
  );
};

export default NumberCell;
