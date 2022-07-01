import { GridCellProps } from "@progress/kendo-react-grid";
import { dateformat2 } from "../CommonFunction";

const DateCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field } = props;
  return (
    <td
      style={{ textAlign: "center" }}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
    >
      {field ? dateformat2(dataItem[field]) : ""}
    </td>
  );
};

export default DateCell;
