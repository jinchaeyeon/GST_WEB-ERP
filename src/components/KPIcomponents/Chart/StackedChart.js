import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";

export default function StackedChart(props) {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  function getRandomColor(){
    return '#'+Math.floor(Math.random()*16777215).toString(16);
  }

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
        labels: props.alllabel,
        datasets: props.label.map((item, idx) => {
          return {
            type: "bar",
            label: props.label[idx],
            backgroundColor: props.random == true? getRandomColor() : props.color[idx],
            data: propsData.filter(item => item[props.name] == props.label[idx]).map((items)=>{
              return items[props.value]
            }),
          }
        }),
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
            display: false
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
