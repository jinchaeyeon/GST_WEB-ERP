import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import { numberWithCommas3 } from "../../CommonFunction";

export default function DoughnutChart(props) {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const theme = props.theme;
  useEffect(() => {
    if (props.data != null) {
      const propsData = props.data;
      const data = {
        labels: props.label,
        datasets: [
          {
            data: props.option.map((item) => {
              return propsData[item];
            }),
            backgroundColor: [
              theme.palette.primary.main,
              theme.palette.primary.light,
            ],
            hoverBackgroundColor: [
              theme.palette.primary.dark,
              theme.palette.secondary.main,
            ],
          },
        ],
      };

      if (props.form == "QC_B0100W") {
        const options = {
          cutout: "70%",
          plugins: {
            datalabels: {
              align: "top",
              color: "black",
              display: true,
              font: {
                weight: "bold",
              },
              formatter: function (value, context) {
                return numberWithCommas3(value);
              },
            },
          },
        };
        setChartOptions(options);
      } else {
        const options = {
          cutout: "70%",
        };
        setChartOptions(options);
      }

      setChartData(data);
    }
  }, [props]);

  return (
    <div
      className="card flex justify-content-center"
      style={{ position: "relative" }}
    >
      <Chart
        type="doughnut"
        data={chartData}
        options={chartOptions}
        plugins={[ChartDataLabels]}
        className="w-full md:w-30rem"
      />
      {props.form == "QC_B0100W" ? (
        <div
          style={{
            position: "absolute",
            width: "100%",
            top: "50%",
            left: "30%",
          }}
        >
          <h5>총 생산량 : {props.data == undefined ? 0 : props.data.qty}</h5>
          <h5>총 양품수 : {props.data == undefined ? 0 : props.data.badqty}</h5>
          <h5>총 불량수 : {props.data == undefined ? 0 : props.data.totqty}</h5>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
