import * as React from "react";
import { Checkbox, Input, NumericTextBox } from "@progress/kendo-react-inputs";
import {
  Field,
  FieldRenderProps,
  FieldWrapper,
} from "@progress/kendo-react-form";
import { Label, Error, Hint } from "@progress/kendo-react-labels";
import { GridCellProps, GridFilterCellProps } from "@progress/kendo-react-grid";

import { FormGridEditContext } from "./SA_B2000_Window";
import FeildDropDownList from "../DropDownLists/FeildDropDownList";
import { DatePicker } from "@progress/kendo-react-dateinputs";

import { itemacntQuery, qtyunitQuery } from "../CommonString";
import { BlurEvent } from "@progress/kendo-react-dropdowns/dist/npm/common/events";
import { checkIsDDLValid, getItemQuery } from "../CommonFunction";
import moment from "moment";

const FORM_DATA_INDEX = "formDataIndex";

const requiredValidator = (value: any) => (value ? "" : "*필수입력");

export const validator = (value: string) =>
  value !== "" ? "" : "Please enter value.";

export const DDLValidator = (value: object) =>
  checkIsDDLValid(value) ? "" : "*필수선택";

const minValidator = (value: any) => (value > 0 ? "" : "*필수입력");

//Grid Cell에 표시되는 Value
const DisplayValue = (fieldRenderProps: FieldRenderProps) => {
  return <>{fieldRenderProps.value}</>;
};

//Grid Cell에 표시되는 DropDownList Name Value
const DisplayDDLValue = (fieldRenderProps: FieldRenderProps) => {
  return <>{fieldRenderProps.value.code_name} </>;
};

//Grid Cell 수정모드에서 사용되는 Text Input
const TextInputWithValidation = (fieldRenderProps: FieldRenderProps) => {
  const {
    onBlur,
    validationMessage,
    visited,
    value,
    name,
    valid,
    className,
    ...others
  } = fieldRenderProps;
  const { getItemcd } = React.useContext(FormGridEditContext);

  const onInputBlur = () => {
    if (name?.includes("itemcd")) getItemcd(value);
  };

  const required = className?.includes("required");
  return (
    <div>
      <Input
        onBlur={onInputBlur}
        value={value}
        valid={required && !value ? false : true}
        className={className ?? ""}
        {...others}
      />
      {/* {visited && validationMessage && <Error>{validationMessage}</Error>} */}
    </div>
  );
};

//Grid Cell 수정모드에서 사용되는 Numeric Text Input
const NumericTextBoxWithValidation = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, valid, value, className, ...others } =
    fieldRenderProps;
  const anchor: any = React.useRef(null);
  const required = className?.includes("required");
  return (
    <div>
      <NumericTextBox
        value={value}
        valid={required && Number(value) < 1 ? false : true}
        className={className ?? ""}
        ref={anchor}
        {...others}
      />
      {visited && validationMessage && <Error>{validationMessage}</Error>}
    </div>
  );
};

//Grid Cell 수정모드에서 사용되는 DropDownList
const DDLWithValidation = (fieldRenderProps: FieldRenderProps) => {
  const { queryStr } = fieldRenderProps;

  return (
    <div>
      <FeildDropDownList
        fieldRenderProps={fieldRenderProps}
        queryStr={queryStr}
      />
      {/* {visited && validationMessage && <Error>{validationMessage}</Error>} */}
    </div>
  );
};

//Grid Cell 수정모드에서 사용되는 CheckBox
const CheckBoxWithValidation = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, value, label, id, valid, ...others } =
    fieldRenderProps;

  return (
    <div>
      <Checkbox
        defaultChecked={value === "Y" || value === true ? true : false}
        valid={valid}
        id={id}
        {...others}
      />
      {visited && validationMessage && <Error>{validationMessage}</Error>}
    </div>
  );
};

const CheckBoxReadOnly = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, value, label, id, valid, ...others } =
    fieldRenderProps;

  return (
    <div>
      <Checkbox
        defaultChecked={value === "Y" || value === true ? true : false}
        valid={valid}
        id={id}
        {...others}
        readOnly
      />
      {visited && validationMessage && <Error>{validationMessage}</Error>}
    </div>
  );
};

//Grid Cell에서 사용되는 Number Feild
export const NumberCell = (props: GridCellProps) => {
  const { parentField } = React.useContext(FormGridEditContext);
  const { field, dataItem, className, render } = props;
  const isInEdit = field === dataItem.inEdit;

  let defaultRendering = (
    <td className={className ?? ""} style={{ textAlign: "right" }}>
      <Field
        component={isInEdit ? NumericTextBoxWithValidation : DisplayValue}
        name={`${parentField}[${dataItem[FORM_DATA_INDEX]}].${field}`}
        className={className ?? ""}
      />
    </td>
  );

  return render
    ? render.call(undefined, defaultRendering, props)
    : defaultRendering;
};
//Grid Cell에서 사용되는 Name Feild
export const NameCell = (props: GridCellProps) => {
  const { parentField } = React.useContext(FormGridEditContext);
  const { field, dataItem, className, render } = props;
  const isInEdit = field === dataItem.inEdit;

  let defaultRendering = (
    <td className={className ?? ""}>
      <Field
        component={isInEdit ? TextInputWithValidation : DisplayValue}
        name={`${parentField}[${dataItem[FORM_DATA_INDEX]}].${field}`}
        className={className ?? ""}
      />
    </td>
  );
  return render
    ? render.call(undefined, defaultRendering, props)
    : defaultRendering;
};

//Grid Cell에서 사용되는 ReadOnly Cell
export const ReadOnlyNameCell = (props: GridCellProps) => {
  const { parentField } = React.useContext(FormGridEditContext);
  const { field, dataItem, className } = props;

  return (
    <td className={className ?? ""}>
      <Field
        component={DisplayValue}
        name={`${parentField}[${dataItem[FORM_DATA_INDEX]}].${field}`}
      />
    </td>
  );
};

//Grid Cell에서 사용되는 ReadOnly NumberCell
export const ReadOnlyNumberCell = (props: GridCellProps) => {
  const { parentField } = React.useContext(FormGridEditContext);
  const { field, dataItem, className } = props;

  return (
    <td className={className ?? ""} style={{ textAlign: "right" }}>
      <Field
        component={DisplayValue}
        name={`${parentField}[${dataItem[FORM_DATA_INDEX]}].${field}`}
      />
    </td>
  );
};

//Grid Cell에서 사용되는 DropDownList Feild
export const CellDropDownList = (props: GridCellProps) => {
  const { field, dataItem, className, render } = props;
  const { parentField } = React.useContext(FormGridEditContext);
  const isInEdit = field === dataItem.inEdit;

  let queryStr = "SELECT '' sub_code, '' code_name";

  if (field === "itemacnt") queryStr = itemacntQuery;
  else if (field === "qtyunit") queryStr = qtyunitQuery;

  const required = className?.includes("required");

  let defaultRendering = (
    <td className={required ? "required" : ""}>
      <Field
        name={`${parentField}[${dataItem[FORM_DATA_INDEX]}].${field}`}
        component={isInEdit ? DDLWithValidation : DisplayDDLValue}
        queryStr={queryStr}
        className={className ?? ""}
      />
    </td>
  );

  return render
    ? render.call(undefined, defaultRendering, props)
    : defaultRendering;
};

//Grid Cell에서 사용되는 CheckBox Feild
export const CellCheckBox = (props: GridCellProps) => {
  const { parentField, editIndex } = React.useContext(FormGridEditContext);
  const { field, dataItem, className, render } = props;

  const isInEdit = dataItem[FORM_DATA_INDEX] === editIndex;

  const required = className?.includes("required");
  return (
    <td>
      <Field
        component={isInEdit ? CheckBoxWithValidation : CheckBoxReadOnly}
        name={`${parentField}[${dataItem[FORM_DATA_INDEX]}].${field}`}
        validator={required ? requiredValidator : undefined}
      />
    </td>
  );
};

//Grid Cell에서 사용되는 ReadOnly CheckBox Feild
export const CellCheckBoxReadOnly = (props: GridCellProps) => {
  const { parentField } = React.useContext(FormGridEditContext);
  const { field, dataItem, className, render } = props;

  return (
    <td>
      <Field
        component={CheckBoxReadOnly}
        name={`${parentField}[${dataItem[FORM_DATA_INDEX]}].${field}`}
      />
    </td>
  );
};

//Form Field에서 사용되는 Input
export const FormInput = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, label, id, valid, ...others } =
    fieldRenderProps;

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid}>
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <Input valid={valid} id={id} {...others} />
      </div>
    </FieldWrapper>
  );
};

//Form Field에서 사용되는 ReadOnly Input
export const FormReadOnly = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, label, id, valid, ...others } =
    fieldRenderProps;

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid}>
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <Input valid={valid} id={id} {...others} readOnly />
      </div>
    </FieldWrapper>
  );
};

//Form Field에서 사용되는 드롭다운리스트
export const FormDropDownList = (fieldRenderProps: FieldRenderProps) => {
  const { value, label, id, valid, queryStr, className } = fieldRenderProps;

  const required = className?.includes("required");
  let DDLvalid = valid;
  if (required) DDLvalid = checkIsDDLValid(value);

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={DDLvalid}>
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <FeildDropDownList
          fieldRenderProps={fieldRenderProps}
          queryStr={queryStr}
        />
      </div>
    </FieldWrapper>
  );
};

//Form Field에서 사용되는 DatePicker
export const FormDatePicker = (fieldRenderProps: FieldRenderProps) => {
  const {
    validationMessage,
    visited,
    label,
    id,
    valid,
    value,
    className,
    ...others
  } = fieldRenderProps;

  const dateValid = moment(value, "YYYY-MM-DD HH:mm:ss", true).isValid();

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid}>
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <DatePicker
          format="yyyy-MM-dd"
          valid={!!dateValid}
          value={value}
          className={className ?? ""}
          id={id}
          {...others}
        />
      </div>
    </FieldWrapper>
  );
};
