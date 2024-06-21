import { GridCellProps } from "@progress/kendo-react-grid";
import {
  RadioGroup,
  RadioGroupChangeEvent,
} from "@progress/kendo-react-inputs";
import { RADIO_GROUP_DEFAULT_DATA } from "../CommonString";

interface CustomCellProps extends GridCellProps {
  bizComponentData: any;
  disabled?: boolean;
  color?: string;
}

const RadioGroupCell = (props: CustomCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    disabled = false,
    bizComponentData,
    color = "black",
  } = props;

  const value = dataItem[field ?? ""];
  const dataList =
    bizComponentData !== null ? bizComponentData.data.Rows : null;

  let isInEdit = field === dataItem.inEdit;

  let newRadioGroup = RADIO_GROUP_DEFAULT_DATA;

  if (dataList) {
    newRadioGroup = dataList.map((column: any) => ({
      value: column.code,
      label: column.caption,
    }));
  }

  const onChangeHandle = (e: RadioGroupChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.value ?? "",
      });

      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: "rowstatus",
        syntheticEvent: e.syntheticEvent,
        value: dataItem["rowstatus"] == "N" ? "N" : "U",
      });
    }
  };

  const defaultRendering =
    disabled == false ? (
      <td
        aria-colindex={ariaColumnIndex}
        data-grid-col-index={columnIndex}
        style={{ color: color }}
      >
        <RadioGroup
          data={newRadioGroup}
          layout={"horizontal"}
          value={value}
          disabled={disabled}
          onChange={onChangeHandle}
        />
      </td>
    ) : (
      <td
        aria-colindex={ariaColumnIndex}
        data-grid-col-index={columnIndex}
        style={{ color: color }}
      >
        <RadioGroup data={newRadioGroup} layout={"horizontal"} value={value} />
      </td>
    );

  return render === undefined
    ? null
    : render?.call(undefined, defaultRendering, props);
};

export default RadioGroupCell;
