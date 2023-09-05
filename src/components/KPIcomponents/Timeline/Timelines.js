import React from "react";
import { Timeline } from "primereact/timeline";
import { Card } from "primereact/card";
import {  dateformat2 } from "../../CommonFunction";

export default function Timelines(props) {
  const value = props.value;

  const customizedMarker = (item) => {
    return (
      <span
        className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1"
        style={{ backgroundColor: props.theme.palette.primary.main}}
      >
        <i className="pi pi-cog"></i>
      </span>
    );
  };

  const customizedContent = (item) => {
    return (
      <Card
        title={item.proccdnm}
        subTitle={item.proddt == undefined ? "" : dateformat2(item.proddt)}
        style={{fontFamily: "TheJamsil5Bold", fontWeight: "lighter", marginBottom: "10px" , backgroundColor: props.theme.palette.secondary.main}}
      >
        <p>작업자 : {item.prodemp}</p>
        <p>설비명 : {item.prodmacnm}</p>
        <p>소요일수 : {item.soyoday}일</p>
      </Card>
    );
  };

  return (
    <div className="card">
      <Timeline
        style={{ marginTop: "30px" }}
        value={value}
        align="alternate"
        className="customized-timeline"
        marker={customizedMarker}
        content={customizedContent}
      />
    </div>
  );
}
