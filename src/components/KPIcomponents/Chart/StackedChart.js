import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";

export default function StackedChart(props) {
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
        labels: propsData.filter(item => item.series == "준수율").map((items)=>{
          return items.argument
        }),
        datasets: [
          {
            type: "bar",
            label: "준수율",
            backgroundColor: "#1976d2",
            data: propsData.filter(item => item.series == "준수율").map((items)=>{
              return items.value
            }),
          },
          {
            type: "bar",
            label: "지연율",
            backgroundColor: "#FF0000",
            data: propsData.filter(item => item.series == "미준수율").map((items)=>{
              return items.value
            }),
          },
        ],
      };
      const options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          tooltips: {
            mode: "index",
            intersect: false,
          },
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
          y: {
            stacked: true,
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
      <Chart type="bar" data={chartData} options={chartOptions} />
    </div>
  );
}
