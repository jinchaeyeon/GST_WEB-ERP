import { DatePicker } from "@progress/kendo-react-dateinputs";
import { GridCellProps } from "@progress/kendo-react-grid";
import { useApi } from "../../hooks/api";
import { Iparameters } from "../../store/types";
import Calendars from "../Calendars/Calendar";
import {
  convertDateToStr,
  dateformat2,
  getFormId,
  UseGetValueFromSessionItem,
} from "../CommonFunction";
import { PAGE_SIZE } from "../CommonString";

interface CustomCellProps extends GridCellProps {
  color?: string;
}

const DateCell = (props: CustomCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field,
    render,
    onChange,
    className = "",
    color = "black",
    rowType,
  } = props;
  let isInEdit = field == dataItem.inEdit;
  const processApi = useApi();
  if (className.includes("read-only")) {
    isInEdit = false;
  } else if (className.includes("editable-new-only")) {
    if (dataItem["rowstatus"] !== "N") {
      isInEdit = false;
    }
  }

  const value = field && dataItem[field] ? dataItem[field] : "";
  const sessionCustcd = UseGetValueFromSessionItem("custcd");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  const onDateChange = async (e: any) => {
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
        value: dataItem["rowstatus"] == "N" ? "N" : "U",
      });

      if (getFormId() == "MA_B2020W_628") {
        const fetchUnpItem = async (custcd: string, itemcd: string) => {
          if (custcd == "") return;
          let data: any;

          const parameters: Iparameters = {
            procedureName: "P_MA_B2020W_628_Q",
            pageNumber: 1,
            pageSize: PAGE_SIZE,
            parameters: {
              "@p_work_type": "UNP",
              "@p_orgdiv": sessionOrgdiv,
              "@p_frdt": "",
              "@p_todt": "",
              "@p_custcd": sessionCustcd,
              "@p_ordsts": "",
              "@p_itemnm": "",
              "@p_rcvcustnm": "",
              "@p_itemcd": itemcd,
              "@p_today": convertDateToStr(e.target.value),
              "@p_find_row_value": "",
            },
          };

          try {
            data = await processApi<any>("procedure", parameters);
          } catch (error) {
            data = null;
          }
          if (data.isSuccess == true) {
            const rows = data.tables[0].Rows;
            return rows[0].salunp;
          }
        };

        var unp = await fetchUnpItem(sessionCustcd, dataItem.itemcd);
        onChange({
          dataIndex: 0,
          dataItem: dataItem,
          field: "unp",
          syntheticEvent: e.syntheticEvent,
          value: unp,
        });
      }
    }
  };

  const defaultRendering =
    rowType == "groupHeader" ? null : (
      <td
        style={{ textAlign: "center", color: color }}
        aria-colindex={ariaColumnIndex}
        data-grid-col-index={columnIndex}
      >
        {isInEdit ? (
          <DatePicker
            name={field}
            defaultValue={typeof value == "string" ? new Date() : value}
            format={"yyyy-MM-dd"}
            onChange={onDateChange}
            calendar={Calendars}
            placeholder=""
            show={true}
          />
        ) : typeof value == "object" ? (
          convertDateToStr(value) == "99991231" ? (
            ""
          ) : (
            dateformat2(convertDateToStr(value))
          )
        ) : typeof value == "string" && value !== "" ? (
          dateformat2(value)
        ) : (
          ""
        )}
      </td>
    );

  //return defaultRendering;
  //return typeof value == "string"
  return !(value instanceof Date) || render == undefined
    ? defaultRendering
    : render?.call(undefined, defaultRendering, props);
};

export default DateCell;
