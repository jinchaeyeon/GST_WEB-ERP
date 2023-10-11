import React from "react";
import Grid from "@mui/material/Grid";
import { RadioButton } from "primereact/radiobutton";
import { GetPropertyValueByName } from "../../../../src/components/CommonFunction";

const Radio = (props) => {
  const dataList =
    props.option !== null
      ? GetPropertyValueByName(props.option.menuCustomDefaultOptions, "query")//props.option.menuCustomDefaultOptions["query"]
      : null;
  const dataItem = dataList.find((item) => item.id === props.id);
  const listData = dataItem.Rows;

  return (
    <>
      <Grid item xs={props.xs} sm={props.sm} md={props.md} lg={props.lg} xl={props.xl}>
        <div className="flex flex-wrap gap-2">
          <h4 style={{ paddingTop: "20px" }}>{props.title} :</h4>
          {listData.map((item) => (
            <div>
              <div className="flex align-items-center">
                <RadioButton
                  inputId={item.code}
                  name={item.caption}
                  value={item.code}
                  onChange={props.onChange}
                  checked={props.value === item.code}
                  style={{ paddingTop: "10px" }}
                />
                <label
                  style={{ paddingTop: "20px" }}
                  htmlFor={item.code}
                  className="ml-1"
                >
                  {item.caption}
                </label>
              </div>
            </div>
          ))}
        </div>
      </Grid>
    </>
  );
};

export default Radio;
