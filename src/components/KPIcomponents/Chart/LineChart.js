import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";

export default function LineChart(props) {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    if (props.props != null) {
      const propsData = props.props;

      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue("--text-color");
      const textColorSecondary = documentStyle.getPropertyValue(
        "--text-color-secondary"
      );
      const surfaceBorder = documentStyle.getPropertyValue("--surface-border");

      const data = {
        labels: propsData
          .filter((item) => item.series == "양품수")
          .map((items) => {
            return items.argument;
          }),
        datasets: [
          {
            label: "양품수",
            data: propsData
              .filter((item) => item.series == "양품수")
              .map((items) => {
                return items.value;
              }),
            fill: true,
            tension: 0.4,
            borderColor: "#d7ecfb",
            backgroundColor: "#1976d2",
          },
          {
            label: "불량수",
            data: propsData
              .filter((item) => item.series == "불량수")
              .map((items) => {
                return items.value;
              }),
            fill: true,
            tension: 0.4,
            borderColor: "#fbded7",
            backgroundColor: "#FF0000",
          },
        ],
      };
      const options = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
          y: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
        },
      };

      setChartData(data);
      setChartOptions(options);
    }
  }, [props.props]);

  return (
    <div className="card">
      <Chart type="line" data={chartData} options={chartOptions} />
    </div>
  );
}
