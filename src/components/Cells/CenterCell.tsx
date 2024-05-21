import { GridCellProps } from "@progress/kendo-react-grid";

const CenterCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field = "", rowType } = props;
  return rowType == "groupHeader" ? null : (
    <td
      style={{ textAlign: "center" }}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
    >
      {dataItem[field]}
    </td>
  );
};

export default CenterCell;
