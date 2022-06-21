import * as React from "react";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import {
  Field,
  FieldRenderProps,
  FieldWrapper,
} from "@progress/kendo-react-form";
import { Label, Error, Hint } from "@progress/kendo-react-labels";
import { GridCellProps, GridFilterCellProps } from "@progress/kendo-react-grid";

import { FormGridEditContext } from "./SA_B2000_Window";
import LocationDDL from "../DropDownLists/LocationDDL";
import OrdstsDDL from "../DropDownLists/OrdstsDDL";
import DepartmentsDDL from "../DropDownLists/DepartmentsDDL";
import UsersDDL from "../DropDownLists/UsersDDL";
import OrdtypeDDL from "../DropDownLists/OrdtypeDDL";
import DoexdivDDL from "../DropDownLists/DoexdivDDL";
import CommonDDL from "../DropDownLists/CommonDDL";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  DropDownList,
  DropDownListChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { UseCommonCodeQuery } from "../CommonFunction";
import { useState } from "react";
import { useApi } from "../../hooks/api";

const FORM_DATA_INDEX = "formDataIndex";

const requiredValidator = (value: any) => (value ? "" : "*필수입력");

const DisplayValue = (fieldRenderProps: FieldRenderProps) => {
  return <>{fieldRenderProps.value}</>;
};

const TextInputWithValidation = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, ...others } = fieldRenderProps;
  return (
    <div>
      <Input {...others} />
      {visited && validationMessage && <Error>{validationMessage}</Error>}
    </div>
  );
};

const DDLWithValidation = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, queryStr } = fieldRenderProps;

  const setData = (setData: string) => {};
  // const queryStr =
  //   "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA061' AND system_yn = 'Y'";
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

export const CellDropDownList = (props: GridCellProps) => {
  // const { queryStr } = props;

  // console.log("queryStr");
  // console.log(queryStr);
  const { parentField, editIndex } = React.useContext(FormGridEditContext);
  const isInEdit = props.dataItem[FORM_DATA_INDEX] === editIndex;

  const required = props.className?.includes("required");
  return (
    <td>
      <Field
        component={
          isInEdit
            ? TextInputWithValidation /*DDLWithValidation*/
            : DisplayValue
        }
        name={`${parentField}[${props.dataItem[FORM_DATA_INDEX]}].${props.field}`}
        validator={required ? requiredValidator : undefined}
        queryStr={""}
      />
    </td>
  );
};
export const FormInput = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, label, id, valid, ...others } =
    fieldRenderProps;

  const showValidationMessage: string | false | null =
    visited && validationMessage;
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

// export const FormDoexdivDDL = (fieldRenderProps: FieldRenderProps) => {
//   const { label, id, valid } = fieldRenderProps;
//   const setData = (setData: string) => {};
//   const queryStr =
//     "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA005' AND system_yn = 'Y'";

//   return (
//     <FieldWrapper>
//       <Label editorId={id} editorValid={valid}>
//         {label}
//       </Label>
//       <div className={"k-form-field-wrap"}>
//         <CommonDDL
//           fieldRenderProps={fieldRenderProps}
//           queryStr={queryStr}
//           setData={setData}
//         />
//       </div>
//     </FieldWrapper>
//   );
// };
// export const FormOrdstsDDL = (fieldRenderProps: FieldRenderProps) => {
//   const { label, id, valid } = fieldRenderProps;
//   const setData = (setData: string) => {};
//   const queryStr =
//     "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'SA002' AND system_yn = 'Y'";

//   return (
//     <FieldWrapper>
//       <Label editorId={id} editorValid={valid}>
//         {label}
//       </Label>
//       <div className={"k-form-field-wrap"}>
//         <CommonDDL
//           fieldRenderProps={fieldRenderProps}
//           queryStr={queryStr}
//           setData={setData}
//         />
//       </div>
//     </FieldWrapper>
//   );
// };
// export const FormOrdtypeDDL = (fieldRenderProps: FieldRenderProps) => {
//   const { label, id, valid } = fieldRenderProps;
//   const setData = (setData: string) => {};
//   const queryStr =
//     "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA007' AND system_yn = 'Y'";

//   return (
//     <FieldWrapper>
//       <Label editorId={id} editorValid={valid}>
//         {label}
//       </Label>
//       <div className={"k-form-field-wrap"}>
//         <CommonDDL
//           fieldRenderProps={fieldRenderProps}
//           queryStr={queryStr}
//           setData={setData}
//         />
//       </div>
//     </FieldWrapper>
//   );
// };

// export const FormDepartmentsDDL = (fieldRenderProps: FieldRenderProps) => {
//   const { label, id, valid } = fieldRenderProps;
//   const setData = (setData: string) => {};
//   const queryStr =
//     "SELECT dptcd sub_code, dptnm code_name FROM BA040T WHERE useyn = 'Y'";

//   return (
//     <FieldWrapper>
//       <Label editorId={id} editorValid={valid}>
//         {label}
//       </Label>
//       <div className={"k-form-field-wrap"}>
//         <CommonDDL
//           fieldRenderProps={fieldRenderProps}
//           queryStr={queryStr}
//           setData={setData}
//         />
//       </div>
//     </FieldWrapper>
//   );
// };
// export const FormUsersDDL = (fieldRenderProps: FieldRenderProps) => {
//   const { label, id, valid } = fieldRenderProps;
//   const setData = (setData: string) => {};
//   const groupCode =
//     "SELECT user_id sub_code, user_name code_name FROM sysUserMaster WHERE rtrchk <> 'Y' AND hold_check_yn <> 'Y'";

//   return (
//     <FieldWrapper>
//       <Label editorId={id} editorValid={valid}>
//         {label}
//       </Label>
//       <div className={"k-form-field-wrap"}>
//         <CommonDDL
//           fieldRenderProps={fieldRenderProps}
//           queryStr={groupCode}
//           setData={setData}
//         />
//       </div>
//     </FieldWrapper>
//   );
// };

// export const FormTaxdivDDL = (fieldRenderProps: FieldRenderProps) => {
//   const { label, id, valid } = fieldRenderProps;
//   const setData = (setData: string) => {};
//   const queryStr =
//     "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code = 'BA029' AND system_yn = 'Y'";

//   return (
//     <FieldWrapper>
//       <Label editorId={id} editorValid={valid}>
//         {label}
//       </Label>
//       <div className={"k-form-field-wrap"}>
//         <CommonDDL
//           fieldRenderProps={fieldRenderProps}
//           queryStr={queryStr}
//           setData={setData}
//         />
//       </div>
//     </FieldWrapper>
//   );
// };
export const FormDatePicker = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, label, id, valid, ...others } =
    fieldRenderProps;

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid}>
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <DatePicker valid={valid} id={id} {...others} />
      </div>
    </FieldWrapper>
  );
};

export const validator = (value: string) =>
  value !== "" ? "" : "Please enter value.";
