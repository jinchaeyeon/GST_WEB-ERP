import React from "react";
import { InputText } from "primereact/inputtext";
import Grid from "@mui/material/Grid";

export default function Input(props) {
  return (
    <Grid item xs={props.xs} sm={props.sm} md={props.md} lg={props.lg} xl={props.xl}>
      <span className="p-float-label">
        <InputText
          id={props.label}
          value={props.value}
          onChange={props.onChange}
          style={{width: "100%"}}
        />
        <label htmlFor={props.label}>{props.label}</label>
      </span>
    </Grid>
  );
}
