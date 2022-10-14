import React, { useCallback, useEffect, useState } from "react";
import {
  Checkbox,
  Input,
  NumericTextBox,
  NumericTextBoxChangeEvent,
} from "@progress/kendo-react-inputs";
import {
  Field,
  FieldRenderProps,
  FieldWrapper,
} from "@progress/kendo-react-form";
import { Label, Error, Hint } from "@progress/kendo-react-labels";
import { GridCellProps, GridFilterCellProps } from "@progress/kendo-react-grid";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { BlurEvent } from "@progress/kendo-react-dropdowns/dist/npm/common/events";
import { FormGridEditContext } from "./Windows/SA_A2000W_Window";
import FieldDropDownList from "./DropDownLists/FieldDropDownList";
import FieldComboBox from "./ComboBoxes/FieldComboBox";
import FieldCheckBox from "./FieldCheckBox";
import {
  checkIsDDLValid,
  checkIsObjValid,
  getItemQuery,
  getQueryFromBizComponent,
  requiredValidator,
} from "./CommonFunction";
import moment from "moment";
import UserEffect from "./UserEffect";
import { useApi } from "../hooks/api";
import { userState } from "../store/atoms";

const FORM_DATA_INDEX = "formDataIndex";

//Grid Cell에 표시되는 Value
const DisplayValue = (fieldRenderProps: FieldRenderProps) => {
  return <>{fieldRenderProps.value}</>;
};

//Grid Cell에 표시되는 DropDownList Name Value
const DisplayDDLValue = (fieldRenderProps: FieldRenderProps) => {
  return <>{fieldRenderProps.value ? fieldRenderProps.value.code_name : ""}</>;
};

//Grid Cell에 표시되는 ComboBox Name Value
const DisplayComboBoxValue = (fieldRenderProps: FieldRenderProps) => {
  const { valueField, textField, listData, value } = fieldRenderProps;

  return (
    <>
      {value && listData.length > 0
        ? (typeof value === "string"
            ? listData.find((item: any) => item[valueField] === value)
            : value)[textField]
        : ""}
    </>
  );
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
  const {
    onBlur,
    validationMessage,
    visited,
    valid,
    value,
    name,
    className,
    onChange,
    ...others
  } = fieldRenderProps;
  const { calculateAmt, calculateSpecialAmt } =
    React.useContext(FormGridEditContext);
  const anchor: any = React.useRef(null);

  const onInputBlur = () => {
    if (name?.includes("qty") || name?.includes("unp")) calculateAmt();
    if (name?.includes("qty") || name?.includes("specialunp"))
      calculateSpecialAmt();
  };

  const onInputChange = (e: NumericTextBoxChangeEvent) => {
    const { target, value } = e;
    onChange({ target: target, value: value === null ? 0 : value });
  };

  const required = className?.includes("required");
  return (
    <div>
      <NumericTextBox
        onBlur={onInputBlur}
        onChange={onInputChange}
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
      <FieldDropDownList
        fieldRenderProps={fieldRenderProps}
        queryStr={queryStr}
      />
      {/* {visited && validationMessage && <Error>{validationMessage}</Error>} */}
    </div>
  );
};

//Grid Cell 수정모드에서 사용되는 ComboBox
const ComboBoxWithValidation = (fieldRenderProps: FieldRenderProps) => {
  const { listData, valueField, textField } = fieldRenderProps;

  return (
    <div>
      <FieldComboBox
        fieldRenderProps={fieldRenderProps}
        listData={listData}
        valueField={valueField}
        textField={textField}
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
    <Checkbox
      value={value === "Y" || value === true ? true : false}
      valid={valid}
      id={id}
      {...others}
    />
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
  const { field, dataItem, className, render } = props;
  const isInEdit = field === dataItem.inEdit;
  const parentField = dataItem.parentField;

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
  const { field, dataItem, className, render } = props;
  const isInEdit = field === dataItem.inEdit;
  const parentField = dataItem.parentField;

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

//Grid Cell에서 사용되는 Name Feild (신규 행인 경우만 수정 가능한 셀)
export const EditableNameCellInNew = (props: GridCellProps) => {
  const { field, dataItem, className, render } = props;
  const isInEdit =
    dataItem.rowstatus === "N" ? field === dataItem.inEdit : false;
  const parentField = dataItem.parentField;

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
  //  const { parentField } = React.useContext(FormGridEditContext);
  const { field, dataItem, className } = props;
  const parentField = dataItem.parentField;

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
  const { field, dataItem, className } = props;
  const parentField = dataItem.parentField;

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
  const isInEdit = field === dataItem.inEdit;
  const parentField = dataItem.parentField;

  const queryStr = dataItem[field ?? ""];

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

interface CustomCellProps extends GridCellProps {
  bizComponent: any;
  valueField?: string;
  textField?: string;
}

export const CellComboBox = (props: CustomCellProps) => {
  const {
    field,
    dataItem,
    className,
    render,
    bizComponent,
    valueField = "sub_code",
    textField = "code_name",
  } = props;

  const processApi = useApi();
  const isInEdit = field === dataItem.inEdit;
  const parentField = dataItem.parentField;

  const queryStr = bizComponent ? getQueryFromBizComponent(bizComponent) : "";
  const bizComponentItems = bizComponent ? bizComponent.bizComponentItems : [];

  const [listData, setListData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    let data: any;

    let query = {
      query: "query?query=" + encodeURIComponent(queryStr),
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  let defaultRendering = (
    <td className={className}>
      <Field
        name={`${parentField}[${dataItem[FORM_DATA_INDEX]}].${field}`}
        component={isInEdit ? ComboBoxWithValidation : DisplayComboBoxValue}
        listData={listData}
        textField={textField}
        valueField={valueField}
        columns={bizComponentItems}
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
  const { field, dataItem, className, render } = props;
  const parentField = dataItem.parentField;

  const required = className?.includes("required");

  let defaultRendering = (
    <td className={className ?? ""} style={{ textAlign: "center" }}>
      <Field
        component={CheckBoxWithValidation}
        name={`${parentField}[${dataItem[FORM_DATA_INDEX]}].${field}`}
        validator={required ? requiredValidator : undefined}
      />
    </td>
  );

  return render
    ? render.call(undefined, defaultRendering, props)
    : defaultRendering;
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

//Form Field에서 사용되는 NumericTextBox
export const FormNumericTextBox = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, label, id, valid, ...others } =
    fieldRenderProps;

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid}>
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <NumericTextBox valid={valid} id={id} {...others} />
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
        <FieldDropDownList
          fieldRenderProps={fieldRenderProps}
          queryStr={queryStr}
        />
      </div>
    </FieldWrapper>
  );
};

//Form Field에서 사용되는 콤보박스
export const FormComboBox = (fieldRenderProps: FieldRenderProps) => {
  const {
    value,
    label,
    id,
    valid,
    queryStr,
    className,
    valueField = "sub_code",
    textField = "code_name",
  } = fieldRenderProps;
  const processApi = useApi();
  const [listData, setListData] = useState([]);

  const required = className?.includes("required");
  let isValid = valid;
  if (required) {
    const comparisonValue = { [valueField]: "", [textField]: "" };
    isValid = checkIsObjValid(value, comparisonValue);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    let data: any;
    const query = {
      query: "query?query=" + encodeURIComponent(queryStr),
    };
    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={isValid}>
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <FieldComboBox
          fieldRenderProps={fieldRenderProps}
          listData={listData}
          valueField={valueField}
          textField={textField}
        />
      </div>
    </FieldWrapper>
  );
};

//Form Field에서 사용되는 체크박스
export const FormCheckBox = (fieldRenderProps: FieldRenderProps) => {
  const { value, label, id, valid, className } = fieldRenderProps;

  const required = className?.includes("required");
  let DDLvalid = valid;
  if (required) DDLvalid = checkIsDDLValid(value);

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={DDLvalid}>
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <FieldCheckBox fieldRenderProps={fieldRenderProps} />
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
