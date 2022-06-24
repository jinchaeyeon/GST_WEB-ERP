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
import CommonDDL from "../DropDownLists/CommonDDL";
import { DatePicker } from "@progress/kendo-react-dateinputs";

import { itemacntQuery, qtyunitQuery } from "../CommonString";
import { BlurEvent } from "@progress/kendo-react-dropdowns/dist/npm/common/events";
import { getItemQuery } from "../CommonFunction";

const FORM_DATA_INDEX = "formDataIndex";

const requiredValidator = (value: any) => (value ? "" : "*필수입력");

const DisplayValue = (fieldRenderProps: FieldRenderProps) => {
  return <>{fieldRenderProps.value}</>;
};

const DisplayDDLValue = (fieldRenderProps: FieldRenderProps) => {
  return <>{fieldRenderProps.value.code_name}</>;
};

const TextInputWithValidation = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, onBlur, value, name, ...others } =
    fieldRenderProps;

  const onInputBlur = (e: any) => {
    console.log("e");
    console.log(e);
    console.log(value);
    console.log(name);
    console.log(fieldRenderProps);

    let queryStr = "";
    if (name?.includes("itemcd")) queryStr = getItemQuery({ itemcd: value });
  };
  return (
    <div>
      <Input onBlur={onInputBlur} value={value} {...others} />
      {visited && validationMessage && <Error>{validationMessage}</Error>}
    </div>
  );
};

const DDLWithValidation = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, queryStr } = fieldRenderProps;

  const setData = (setData: string) => {};

  return (
    <div>
      <CommonDDL
        fieldRenderProps={fieldRenderProps}
        queryStr={queryStr}
        setData={setData}
      />
      {visited && validationMessage && <Error>{validationMessage}</Error>}
    </div>
  );
};

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

const minValidator = (value: any) => (value > 0 ? "" : "*필수입력");

const NumericTextBoxWithValidation = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, ...others } = fieldRenderProps;
  const anchor: any = React.useRef(null);
  return (
    <div>
      <NumericTextBox {...others} ref={anchor} />
      {visited && validationMessage && <Error>{validationMessage}</Error>}
    </div>
  );
};

//Grid Cell에서 사용되는 Number Feild
export const NumberCell = (props: GridCellProps) => {
  const { parentField, editIndex } = React.useContext(FormGridEditContext);
  const isInEdit = props.dataItem[FORM_DATA_INDEX] === editIndex;

  const required = props.className?.includes("required");
  return (
    <td>
      <Field
        component={isInEdit ? NumericTextBoxWithValidation : DisplayValue}
        name={`${parentField}[${props.dataItem[FORM_DATA_INDEX]}].${props.field}`}
        validator={required ? minValidator : undefined}
      />
    </td>
  );
};
//Grid Cell에서 사용되는 Name Feild
export const NameCell = (props: GridCellProps) => {
  const { parentField, editIndex } = React.useContext(FormGridEditContext);
  const isInEdit = props.dataItem[FORM_DATA_INDEX] === editIndex;

  const required = props.className?.includes("required");
  return (
    <td>
      <Field
        component={isInEdit ? TextInputWithValidation : DisplayValue}
        name={`${parentField}[${props.dataItem[FORM_DATA_INDEX]}].${props.field}`}
        validator={required ? requiredValidator : undefined}
      />
    </td>
  );
};

//Grid Cell에서 사용되는 DropDownList Feild
export const CellDropDownList = (props: GridCellProps) => {
  const { field } = props;
  const { parentField, editIndex } = React.useContext(FormGridEditContext);
  const isInEdit = props.dataItem[FORM_DATA_INDEX] === editIndex;

  let queryStr = "SELECT '' sub_code, '' code_name";

  if (field === "itemacnt") queryStr = itemacntQuery;
  else if (field === "qtyunit") queryStr = qtyunitQuery;

  const required = props.className?.includes("required");
  return (
    <td>
      <Field
        component={isInEdit ? DDLWithValidation : DisplayDDLValue}
        name={`${parentField}[${props.dataItem[FORM_DATA_INDEX]}].${props.field}`}
        validator={required ? requiredValidator : undefined}
        queryStr={queryStr}
      />
    </td>
  );
};

//Grid Cell에서 사용되는 CheckBox Feild
export const CellCheckBox = (props: GridCellProps) => {
  const { parentField, editIndex } = React.useContext(FormGridEditContext);
  const isInEdit = props.dataItem[FORM_DATA_INDEX] === editIndex;

  const required = props.className?.includes("required");
  return (
    <td>
      <Field
        component={isInEdit ? CheckBoxWithValidation : CheckBoxReadOnly}
        name={`${parentField}[${props.dataItem[FORM_DATA_INDEX]}].${props.field}`}
        validator={required ? requiredValidator : undefined}
      />
    </td>
  );
};

//Grid Cell에서 사용되는 ReadOnly CheckBox Feild
export const CellCheckBoxReadOnly = (props: GridCellProps) => {
  const { parentField } = React.useContext(FormGridEditContext);

  return (
    <td>
      <Field
        component={CheckBoxReadOnly}
        name={`${parentField}[${props.dataItem[FORM_DATA_INDEX]}].${props.field}`}
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
  const { label, id, valid, queryStr } = fieldRenderProps;
  const setData = (setData: string) => {};

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid}>
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <CommonDDL
          fieldRenderProps={fieldRenderProps}
          queryStr={queryStr}
          setData={setData}
        />
      </div>
    </FieldWrapper>
  );
};

//Form Field에서 사용되는 DatePicker
export const FormDatePicker = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, label, id, valid, ...others } =
    fieldRenderProps;

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid}>
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <DatePicker format="yyyy-MM-dd" valid={valid} id={id} {...others} />
      </div>
    </FieldWrapper>
  );
};

export const validator = (value: string) =>
  value !== "" ? "" : "Please enter value.";
