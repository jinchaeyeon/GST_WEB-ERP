import React, { useEffect, useState, useCallback } from "react";
import {
  RadioGroup,
  RadioGroupChangeEvent,
} from "@progress/kendo-react-inputs";
import { radioGroupDefaultData } from "../CommonString";
import { getQueryFromBizComponent } from "../CommonFunction";
import { useApi } from "../../hooks/api";

type TBizComponentRadioGroup = {
  name: string;
  value: string | number;
  bizComponentId: string;
  bizComponentData: any;
  changeData(e: any): void;
};

const BizComponentRadioGroup = ({
  name,
  value,
  bizComponentId,
  bizComponentData,
  changeData,
}: TBizComponentRadioGroup) => {
  bizComponentData = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentId
  );

  const defaultValue = value;

  //커스텀 옵션에 저장된 값으로 디폴트 값
  const dataList =
    bizComponentData !== null ? bizComponentData.bizComponentItems : null;

  let newRadioGroup = radioGroupDefaultData;

  if (dataList) {
    newRadioGroup = dataList
      // 제외 처리 (filter)
      .filter(
        (item: any) =>
          !(
            name === "radWorkType" && //결재표시형식
            (item.fieldName === "D" ||
              item.fieldName === "E" ||
              item.fieldName === "G" ||
              item.fieldName === "H" ||
              item.fieldName === "I")
          )
      )
      .filter(
        (item: any) =>
          !(
            name === "radAppyn" && //결재유무
            (item.fieldName === "B" || item.fieldName === "M")
          )
      )
      .map((column: any) => ({
        value: column.fieldName,
        label: column.caption,
      }));
  }

  const [state, setState] = useState(defaultValue); //상태

  useEffect(() => {
    changeData({ name, value: defaultValue });
  }, []);

  const onChangeHandle = (e: RadioGroupChangeEvent) => {
    const { value } = e;
    const { name } = e.syntheticEvent.currentTarget;

    setState(value);
    changeData({ name, value });
  };

  //changeData(newRadioGroup);

  return (
    <RadioGroup
      name={name}
      data={newRadioGroup}
      layout={"horizontal"}
      defaultValue={state}
      onChange={onChangeHandle}
    />
  );
};

export default BizComponentRadioGroup;
