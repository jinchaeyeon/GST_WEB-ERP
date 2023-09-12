import React from "react";
import { Card } from "primereact/card";

const CardBox = (props) => {
  return (
    <>
      <Card
        style={{
          height: "150px",
          width: "100%",
          marginRight: "15px",
          backgroundColor: props.backgroundColor,
          color: "white",
          cursor: props.form == "QC_B0100W" ? "pointer" : "not-allowed"
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
