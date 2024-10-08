import { DatePicker } from "@progress/kendo-react-dateinputs";
import { GridCellProps } from "@progress/kendo-react-grid";
import YearCalendar from "../Calendars/YearCalendar";
import { convertDateToStr } from "../CommonFunction";
const DateCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field,
    render,
    onChange,
    className = "",
  } = props;

  let isInEdit = field === dataItem.inEdit;

  if (className.includes("read-only")) {
    isInEdit = false;
  } else if (className.includes("editable-new-only")) {
    if (dataItem["rowstatus"] !== "N") {
      isInEdit = false;
    }
  }
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

      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: "rowstatus",
        syntheticEvent: e.syntheticEvent,
        value: dataItem["rowstatus"] === "N" ? "N" : "U",
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
          format={"yyyy"}
          onChange={onDateChange}
          calendar={YearCalendar}
          placeholder=""
        />
      ) : typeof value === "object" ? (
        convertDateToStr(value) == "99991231" ? (
          ""
        ) : (
          convertDateToStr(value).substring(0, 4)
        )
      ) : typeof value === "string" && value !== "" ? (
        value.substring(0, 4)
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
