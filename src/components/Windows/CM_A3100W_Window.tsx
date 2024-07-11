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
  FormDateTimePicker,
  FormReadOnly,
  FormRequiredInput,
} from "../Editors";

const Column: IComboBoxColumns[] = [
  {
    sortOrder: 0,
    fieldName: "code_name",
    caption: "자원",
    columnWidth: 120,
    dataAlignment: "center",
  },
];

export const CustomFormEditor = (props: SchedulerFormEditorProps) => {
  const [Data, setData] = useState([]);
  const [bizComponentData, setBizComponentData] = useState([]);
  //공정코드,외주구분,사용자,설비,자재불출(자재사용)구분_BOM,수량단위
  UseBizComponent("L_CR400150", setBizComponentData);
  const processApi = useApi();

  useEffect(() => {
    if (bizComponentData !== null) {
      setData(getBizCom(bizComponentData, "L_CR400150"));
    }
  }, [bizComponentData]);

  return (
    <FormElement id="schulderform" horizontal={true}>
      <Field label={"제목"} name={"title"} component={FormRequiredInput} />
      <Field label={"사용자"} name={"user_name"} component={FormReadOnly} />
      <Field label={"시작일자"} name={"start"} component={FormDateTimePicker} />
      <Field label={"종료일자"} name={"end"} component={FormDateTimePicker} />
      <Field
        label={"자원"}
        name={"resource"}
        component={FormComboBox}
        columns={Column}
        data={Data}
        valueField="sub_code"
        textField="code_name"
        className="required"
        id="resources"
      />
    </FormElement>
  );
};
