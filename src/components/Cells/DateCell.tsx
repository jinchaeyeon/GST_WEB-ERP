import { DatePicker } from "@progress/kendo-react-dateinputs";
import { GridCellProps } from "@progress/kendo-react-grid";
import { convertDateToStr, dateformat2 } from "../CommonFunction";

const DateCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field, render, onChange } =
    props;
  const isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const onDateChange = (e: any) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: convertDateToStr(e.target.value),
      });
    }
  };

  const defaultRendering = (
    <td
      style={{ textAlign: "center" }}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
    >
      {isInEdit ? (
        <DatePicker
          name={field}
          defaultValue={
            typeof value === "string" && value !== "" ? new Date() : value
          }
          format="yyyy-MM-dd"
          onChange={onDateChange}
          //calendar={YearCalendar}
        />
      ) : typeof value === "object" ? (
        dateformat2(convertDateToStr(value))
      ) : typeof value === "string" && value !== "" ? (
        dateformat2(value)
      ) : (
        ""
      )}
    </td>
  );

  //return defaultRendering;
  //return typeof value === "string"
  return !(value instanceof Date) || render === undefined
    ? defaultRendering
    : render?.call(undefined, defaultRendering, props);
};

export default DateCell;
