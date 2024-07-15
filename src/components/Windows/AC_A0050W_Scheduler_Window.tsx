import { Field, FormElement } from "@progress/kendo-react-form";
import { SchedulerFormEditorProps } from "@progress/kendo-react-scheduler";
import { FormDatePicker, FormInput, FormTextArea } from "../Editors";

export const CustomFormEditor2 = (props: SchedulerFormEditorProps) => {
  return (
    <FormElement id="schulderform" horizontal={true}>
      <Field
        label={"제목"}
        name={"title"}
        disabled={true}
        component={FormInput}
      />
      <Field
        label={"시작일자"}
        name={"start"}
        disabled={true}
        component={FormDatePicker}
      />
      <Field
        label={"종료일자"}
        name={"end"}
        disabled={true}
        component={FormDatePicker}
      />
      <Field
        label={"내용"}
        name={"description"}
        component={FormTextArea}
        disabled={true}
        rows={3}
      />
    </FormElement>
  );
};
