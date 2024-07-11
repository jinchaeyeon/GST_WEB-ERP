import { Field, FormElement } from "@progress/kendo-react-form";
import { SchedulerFormEditorProps } from "@progress/kendo-react-scheduler";
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/api";
import { IComboBoxColumns } from "../../hooks/interfaces";
import {
  UseBizComponent,
  getBizCom
} from "../CommonFunction";
import {
  FormComboBox,
  FormDatePicker,
  FormInput,
  FormTextArea,
} from "../Editors";

const ColorColumn: IComboBoxColumns[] = [
  {
    sortOrder: 0,
    fieldName: "code_name",
    caption: "라벨",
    columnWidth: 100,
    dataAlignment: "center",
  },
];

export const CustomFormEditor = (props: SchedulerFormEditorProps) => {
  const [colorData, setColorData] = useState([]);
  const [bizComponentData, setBizComponentData] = useState([]);
  //공정코드,외주구분,사용자,설비,자재불출(자재사용)구분_BOM,수량단위
  UseBizComponent("L_APPOINTMENT_COLOR", setBizComponentData);
  const processApi = useApi();

  useEffect(() => {
    if (bizComponentData !== null) {
      setColorData(getBizCom(bizComponentData, "L_APPOINTMENT_COLOR"));
    }
  }, [bizComponentData]);

  return (
    <FormElement id="schulderform" horizontal={true}>
      <Field label={"제목"} name={"title"} component={FormInput} />
      <Field
        label={"라벨"}
        name={"colorID"}
        component={FormComboBox}
        columns={ColorColumn}
        data={colorData}
        valueField="sub_code"
        textField="code_name"
        id="labels"
      />
      <Field label={"시작일자"} name={"start"} component={FormDatePicker} />
      <Field label={"종료일자"} name={"end"} component={FormDatePicker} />
      <Field
        label={"내용"}
        name={"description"}
        component={FormTextArea}
        rows={3}
      />
    </FormElement>
  );
};
