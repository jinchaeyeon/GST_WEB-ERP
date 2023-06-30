import React from "react";
import Grid from "@mui/material/Grid";
import { Calendar } from "primereact/calendar";

const DatePicker = (props) => {
  return (
    <>
      <Grid item xs={props.xs} sm={props.sm} md={props.md} xl={props.xl}>
        <Grid container spacing={1}>
          <Grid item xs={5.3}>
            <Calendar
              value={props.frdt}
              onChange={props.onFrdtChange}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </Grid>
          &nbsp;&nbsp;<p style={{paddingTop: "25px"}}>&nbsp;~</p>&nbsp;&nbsp;
          <Grid item xs={5.3}>
            <Calendar
              value={props.todt}
              onChange={props.onTodtChange}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default DatePicker;
