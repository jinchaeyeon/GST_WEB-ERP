import { FieldRenderProps } from "@progress/kendo-react-form";
import { Checkbox } from "@progress/kendo-react-inputs";
import React from "react";

type TDDL = {
  fieldRenderProps: FieldRenderProps;
};
const DDL: React.FC<TDDL> = ({ fieldRenderProps }: TDDL) => {
  const {
    validationMessage,
    visited,
    value,
    label,
    id,
    valid,
    className,
    ...others
  } = fieldRenderProps;

  return (
    <Checkbox
      value={value == "Y" || value == true ? true : false}
      valid={valid}
      id={id}
      {...others}
    />
  );
};

export default DDL;
