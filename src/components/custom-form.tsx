import * as React from 'react';

import { SchedulerForm, SchedulerFormProps } from '@progress/kendo-react-scheduler';

import { CustomFormEditor } from './Windows/CM_A1600W_Window';
import { CustomDialog } from './custom-dialog';

export const FormWithCustomEditor = (props: SchedulerFormProps) => {
    return (
      <SchedulerForm
        {...props}
        editor={CustomFormEditor}
        dialog={CustomDialog}
        />
    );
};
