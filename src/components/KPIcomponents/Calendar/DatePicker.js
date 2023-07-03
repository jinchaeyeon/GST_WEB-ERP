import React from "react";
import Grid from "@mui/material/Grid";
import { Calendar } from "primereact/calendar";

const DatePicker = (props) => {
  
  return (
    <>
      <Grid item xs={props.xs} sm={props.sm} md={props.md} xl={props.xl}>
        <Grid container spacing={2}>
          <Grid item xs={5.7} sm={5.7} md={5.7} xl={5.7}>
            <Calendar
              value={props.frdt}
              onChange={props.onFrdtChange}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </Grid>
          <Grid item xs={0.5} sm={0.5} md={0.5} xl={0.5}>
          <p style={{paddingTop: "20px", marginLeft: "-2px"}}>~</p>
          </Grid>
          <Grid item xs={5.7} sm={5.7} md={5.7} xl={5.7}>
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
