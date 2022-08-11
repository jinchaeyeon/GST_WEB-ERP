import React, { useEffect, useState } from "react";
import {
  RadioGroup,
  RadioGroupChangeEvent,
} from "@progress/kendo-react-inputs";

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
  const defaultValue = customOptionData.menuCustomDefaultOptions.query.find(
    (item: any) => item.id === name
  ).value;

  const radioGroup = customOptionData.menuCustomDefaultOptions.query.find(
    (item: any) => item.id === name
  ).bizComponentItems;

  let newRadioGroup = radioGroup.map((column: any) => ({
    value: column.fieldName,
    label: column.caption,
  }));

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
