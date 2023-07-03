import React from "react";
import Grid from "@mui/material/Grid";
import { Dropdown } from "primereact/dropdown";

const ComboBox = (props) => {
  const dataList = props.option.menuCustomDefaultOptions["query"];
  const dataItem = dataList.find((item) => item.id === props.id);
  const listData = dataItem.Rows;
  const textField = props.textField == undefined ? "code_name" : props.textField;
  const valueField = props.valueField == undefined ? "sub_code" : props.valueField;

  return (
    <>
      <Grid item xs={props.xs} sm={props.sm} md={props.md} xl={props.xl}>
        <Dropdown
          value={props.value}
          onChange={props.onChange}
          options={listData}
          optionLabel={textField}
          placeholder={
            props.value == "" || props.value == undefined
              ? props.placeholder
              : listData.filter((item) => item[valueField] == props.value)[0][textField]
          }
          className="w-full"
        />
      </Grid>
    </>
  );
};

export default ComboBox;
