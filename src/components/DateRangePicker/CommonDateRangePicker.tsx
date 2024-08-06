import {
  DateInput,
  DateInputProps,
  DateRangePicker,
  DateRangePickerProps,
} from "@progress/kendo-react-dateinputs";

const CommonDateRangePicker = (props: DateRangePickerProps) => {
  return (
    <DateRangePicker
      {...props}
      startDateInput={CustomDateInput}
      endDateInput={CustomDateInput}
    />
  );
};

const CustomDateInput = (props: DateInputProps) => {
  return <DateInput {...props} label={undefined} format="yyyy-MM-dd"  placeholder=""/>;
};

export default CommonDateRangePicker;
