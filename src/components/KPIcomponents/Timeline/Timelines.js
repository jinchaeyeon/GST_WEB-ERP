import { Card } from "primereact/card";
import { Timeline } from "primereact/timeline";
import { dateformat2 } from "../../CommonFunction";

export default function Timelines(props) {
  const value = props.value;

  const customizedMarker = (item) => {
    return (
      <span
        className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1"
        style={{ backgroundColor: props.theme.palette.primary.main }}
      >
        <i className="pi pi-cog"></i>
      </span>
    );
  };

  const customizedContent = (item) => {
    return (
      <Card
        title={`${item.proccdnm} (${item.percent}%)`}
        subTitle={`소요일수 : ${item.soyoday}일`}
        style={{
          fontSize: "30px",
          fontFamily: "TheJamsil5Bold",
          fontWeight: "lighter",
          marginBottom: "10px",
          backgroundImage: `url(/proccd.jpg)`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          opacity: 0.9,
        }}
      >
        <h4>
          작업일 : {item.proddt == undefined ? "" : dateformat2(item.proddt)}
        </h4>
        <h4>작업자 : {item.prodemp}</h4>
        <h4>설비명 : {item.prodmacnm}</h4>
      </Card>
    );
  };

  return (
    <div className="card">
      <Timeline
        style={{ marginTop: "30px" }}
        value={value}
        className="customized-timeline"
        marker={customizedMarker}
        content={customizedContent}
      />
    </div>
  );
}
