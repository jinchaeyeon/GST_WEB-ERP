
import {
  SchedulerForm,
  SchedulerFormProps,
} from "@progress/kendo-react-scheduler";

import { CustomFormEditor } from "../Windows/CM_A1600W_Window";
import { CustomDialog } from "./custom-dialog";
import { CustomFormEditor2 } from "../Windows/AC_A0050W_Scheduler_Window";

export const FormWithCustomEditor = (props: SchedulerFormProps) => {
  return (
    <SchedulerForm {...props} editor={CustomFormEditor} dialog={CustomDialog} />
  );
};

export const FormWithCustomEditor2 = (props: SchedulerFormProps) => {
  return (
    <SchedulerForm {...props} editor={CustomFormEditor2} dialog={CustomDialog} />
  );
};