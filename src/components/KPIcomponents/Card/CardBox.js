import React from "react";
import { Card } from "primereact/card";

const CardBox = (props) => {
  return (
    <>
      <Card
        style={{
          height: props.height == undefined ? "150px" : props.height,
          width: "100%",
          marginRight: "15px",
          backgroundColor: props.backgroundColor,
          color: props.color == undefined ? "white" : props.color,
          cursor: props.form == "QC_B0100W" ? "pointer" : ""
        }}
        title={props.title}
        onClick={(e) => props.Click(e)}
      >
        <p
          style={{
            fontSize: props.fontsize,
            fontWeight: "900",
            color: "white",
            marginTop: 0,
          }}
        >
          {props.data}
        </p>
      </Card>
    </>
  );
};

export default CardBox;
