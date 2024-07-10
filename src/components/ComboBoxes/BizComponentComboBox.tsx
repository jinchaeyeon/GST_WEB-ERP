import {
  ComboBoxChangeEvent,
  MultiColumnComboBox,
} from "@progress/kendo-react-dropdowns";
import { useState } from "react";

import { useApi } from "../../hooks/api";

type TCommonComboBox = {
  name: string;
  value: string | number;
  bizComponentId: string;
  bizComponentData: any;
  changeData(e: any): void;
  textField?: string;
  valueField?: string;
  className?: string;
  disabled?: boolean;
  para?: string;
};
const CommonComboBox = ({
  name,
  value,
  bizComponentId,
  bizComponentData,
  changeData,
  textField = "code_name",
  valueField = "sub_code",
  className = "",
  disabled = false,
  para = "",
}: TCommonComboBox) => {
  const processApi = useApi();
  bizComponentData = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentId
  );

  const [listData, setListData]: any = useState(bizComponentData.data.Rows);

  let required = false;
  if (className.includes("required")) {
    required = true;
  }

  let newColumns = [];

  if (bizComponentData) {
    const columns = bizComponentData.bizComponentItems;

    if (columns) {
      newColumns = columns.map((column: any) => ({
        field: column.fieldName,
        header: column.caption,
        width: column.columnWidth,
      }));

      newColumns = newColumns.filter((column: any) => column.width !== 0);
    }
  }

  const onChangeHandle = (e: ComboBoxChangeEvent) => {
    let value = e.target.value == null ? "" : e.target.value[valueField];
    let values = e.value;

    if (para == "AC_A1020W") {
      if (value == "") {
        const values = {
          acntcd: "",
          acntnm: "",
          stdrmkcd: "",
          stdrmknm1: "",
        };
        changeData({ name, values });
      } else {
        changeData({ name, values });
      }
    } else if (para == "SY_A0060W") {
      if (value == "") {
        const values = {
          click: "",
          font: "",
          sub_code: "",
        };
        changeData({ name, values });
      } else {
        changeData({ name, values });
      }
    } else if (para == "HU_A4000W") {
      if (value == "") {
        const values = {
          prsnnm: "",
          prsnnum: "",
          dptcd: "",
        };
        changeData({ name, values });
      } else {
        changeData({ name, values });
      }
    } else {
      changeData({ name, value, e });
    }
  };

  const [state, setState] = useState(false);

  document.getElementById(name)?.addEventListener("focusout", (event) => {
    setState(false);
  });

  return (
    <>
      <MultiColumnComboBox
        id={name}
        data={listData}
        value={
          value ? listData.find((item: any) => item[valueField] == value) : ""
        }
        columns={newColumns}
        textField={textField}
        onChange={onChangeHandle}
        required={required}
        className={className}
        disabled={disabled}
        opened={state}
        onOpen={() => setState(true)}
      />
    </>
  );
};

export default CommonComboBox;
