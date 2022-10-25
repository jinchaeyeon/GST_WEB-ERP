import React, { useCallback, useEffect, useState } from "react";
import { GridCellProps } from "@progress/kendo-react-grid";
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
  } = props;

  const isInEdit = field === dataItem.inEdit;
  const value = dataItem[field];

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
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
