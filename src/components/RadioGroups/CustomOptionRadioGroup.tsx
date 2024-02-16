import {
  RadioGroup,
  RadioGroupChangeEvent,
} from "@progress/kendo-react-inputs";
import { useEffect, useState } from "react";
import { GetPropertyValueByName } from "../CommonFunction";
import { RADIO_GROUP_DEFAULT_DATA } from "../CommonString";

type TCustomOptionRadioGroup = {
  type?: "new" | "query";
  name: string;
  customOptionData: any;
  changeData(e: any): void;
  excludedCodes?: any[]; // 제외할 코드값
  disabled?: boolean;
};
const CustomOptionRadioGroup = ({
  type = "query",
  name,
  customOptionData,
  changeData,
  excludedCodes = [],
  disabled = false,
}: TCustomOptionRadioGroup) => {
  //커스텀 옵션에 저장된 값으로 디폴트 값
  const dataList =
    customOptionData !== null
      ? GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, type)
      : null;

  let defaultValue = "";
  let newRadioGroup = RADIO_GROUP_DEFAULT_DATA;

  if (dataList) {
    defaultValue = dataList.find((item: any) => item.id === name).valueCode;

    const radioGroup = dataList.find((item: any) => item.id === name).Rows;

    newRadioGroup = radioGroup
      .filter((item: any) => !excludedCodes.includes(item.code))
      // 제외 처리 (filter)
      .filter(
        (item: any) =>
          !(
            name === "radWorkType" && //결재표시형식
            (item.code === "D" ||
              item.code === "E" ||
              item.code === "G" ||
              item.code === "H" ||
              item.code === "I")
          )
      )
      .filter(
        (item: any) =>
          !(
            name === "radAppyn" && //결재유무
            (item.code === "B" || item.code === "M")
          )
      )
      .map((column: any) => ({
        value: column.code,
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
      disabled={disabled}
    />
  );
};

export default CustomOptionRadioGroup;
