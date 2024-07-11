import { MultiColumnComboBox } from "@progress/kendo-react-dropdowns";
import { FieldRenderProps } from "@progress/kendo-react-form";
import React, { useState } from "react";
import { checkIsObjValid } from "../CommonFunction";

type TFieldComboBox = {
  id: any;
  fieldRenderProps: FieldRenderProps;
  listData: any;
  valueField: string;
  textField: string;
  className?: string;
};
const FieldComboBox: React.FC<TFieldComboBox> = ({
  fieldRenderProps,
  listData,
  valueField,
  textField,
  className = "",
  id = "",
}: TFieldComboBox) => {
  const {
    validationMessage,
    visited,
    value,
    label,
    valid,
    columns,
    onChange,
    ...others
  } = fieldRenderProps;

  let newColumns = columns.map((column: any) => ({
    field: column.fieldName,
    header: column.caption,
    width: column.columnWidth,
  }));
  newColumns = newColumns.filter((column: any) => column.width !== 0);

  const required = className?.includes("required");
  const readonly = className?.includes("readonly");
  let isValid = valid;
  if (required) {
    const comparisonValue = { [valueField]: "", [textField]: "" };
    isValid = checkIsObjValid(value, comparisonValue);
  }

  const [state, setState] = useState(false);

  document.getElementById(id)?.addEventListener("focusout", (event) => {
    setState(false);
  });

  function change(event: any) {
    onChange(event);
    setState(false);
  }

  return (
    <>
      <MultiColumnComboBox
        data={listData}
        textField={textField}
        value={
          typeof value == "string"
            ? listData.find((item: any) => item[valueField] == value)
            : value
        }
        columns={newColumns}
        className={className}
        valid={isValid}
        id={id}
        onChange={(event) => readonly ? undefined : change(event)}
        opened={state}
        onOpen={() => setState(true)}
        onClose={() => setState(false)}
        {...others}
      />
    </>
  );
};

export default FieldComboBox;
