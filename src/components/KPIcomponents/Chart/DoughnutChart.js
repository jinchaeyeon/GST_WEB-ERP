import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";

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
      const options = {
        cutout: "60%",
      };

      setChartData(data);
      setChartOptions(options);
    }
  }, [props]);

  return (
    <div className="card flex justify-content-center">
      <Chart
        type="doughnut"
        data={chartData}
        options={chartOptions}
        className="w-full md:w-30rem"
      />
    </div>
  );
}
