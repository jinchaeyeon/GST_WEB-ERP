import { GridCellProps } from "@progress/kendo-react-grid";

const NameCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field } = props;
  const isInEdit = field === dataItem.inEdit;

  return isInEdit ? (
    <td
      style={{ textAlign: "left" }}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
    >
      {field ? dataItem[field] : ""}
    </td>
  ) : (
    <td
      style={{ textAlign: "left" }}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
    >
      {field ? dataItem[field] : ""}
    </td>
  );
};

export default NameCell;
