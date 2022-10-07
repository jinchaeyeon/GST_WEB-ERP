import React, { useEffect, useState } from "react";
import {
  RadioGroup,
  RadioGroupChangeEvent,
} from "@progress/kendo-react-inputs";
import { radioGroupDefaultData } from "../CommonString";

type TCommonRadioGroup = {
  name: string;
  customOptionData: any;
  changeData(e: any): void;
};
const CommonRadioGroup = ({
  name,
  customOptionData,
  changeData,
}: TCommonRadioGroup) => {
  //커스텀 옵션에 저장된 값으로 디폴트 값
  const dataList =
    customOptionData !== null
      ? customOptionData.menuCustomDefaultOptions.query
      : null;

  let defaultValue = "";
  let newRadioGroup = radioGroupDefaultData;

  if (dataList) {
    defaultValue = dataList.find((item: any) => item.id === name).valueCode;

    const radioGroup = dataList.find(
      (item: any) => item.id === name
    ).bizComponentItems;

    newRadioGroup = radioGroup
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

export default CommonRadioGroup;
