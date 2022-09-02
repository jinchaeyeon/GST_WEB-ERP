import React, { useCallback, useEffect, useState } from "react";
import {
  ComboBoxChangeEvent,
  DropDownList,
  DropDownListChangeEvent,
  MultiColumnComboBox,
  MultiColumnComboBoxChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { useApi } from "../../hooks/api";
import { commonCodeDefaultValue } from "../CommonString";
import { GridCellProps } from "@progress/kendo-react-grid";
import {
  itemacntQuery,
  outgbQuery,
  outprocynQuery,
  proccdQuery,
  prodmacQuery,
  qtyunitQuery,
  usersQuery,
} from "../CommonString";
import { getQueryFromBizComponent } from "../CommonFunction";
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";

interface CustomCellProps extends GridCellProps {
  bizComponent: any;
  textField?: string;
}
const EncryptedCell = (props: CustomCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    bizComponent,
    textField = "code_name",
    ...others
  } = props;

  const isInEdit = field === dataItem.inEdit;
  const value = dataItem[field];

  const handleChange = (e: InputChangeEvent) => {
    if (props.onChange) {
      props.onChange({
        dataIndex: 0,
        dataItem: props.dataItem,
        field: props.field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };

  const defaultRendering = (
    <td aria-colindex={ariaColumnIndex} data-grid-col-index={columnIndex}>
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type={"password"}></Input>
      ) : (
        "*********"
      )}
    </td>
  );

  return render === undefined
    ? null
    : render?.call(undefined, defaultRendering, props);
};

export default EncryptedCell;
