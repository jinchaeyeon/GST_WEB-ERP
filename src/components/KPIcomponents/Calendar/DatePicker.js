import Grid from "@mui/material/Grid";
import { Calendar } from "primereact/calendar";

const DatePicker = (props) => {
  return (
    <>
      <Grid
        item
        xs={props.xs}
        sm={props.sm}
        md={props.md}
        lg={props.lg}
        xl={props.xl}
      >
        <Grid container spacing={2}>
          <Grid item xs={5.6} sm={5.6} md={5.6} xl={5.7}>
            <Calendar
              value={props.frdt}
              onChange={props.onFrdtChange}
              dateFormat={
                props.dateFormat == undefined ? "yy-mm-dd" : props.dateFormat
              }
              view={props.view == undefined ? "date" : props.view}
              showIcon
            />
          </Grid>
          <Grid item xs={0.3} sm={0.3} md={0.3} xl={0.3}>
            <p style={{ paddingTop: "20px", marginLeft: "-2px" }}>~</p>
          </Grid>
          <Grid item xs={5.6} sm={5.6} md={5.6} xl={5.7}>
            <Calendar
              value={props.todt}
              onChange={props.onTodtChange}
              dateFormat={
                props.dateFormat == undefined ? "yy-mm-dd" : props.dateFormat
              }
              view={props.view == undefined ? "date" : props.view}
              showIcon
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default DatePicker;
