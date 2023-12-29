import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import {
  red,
  orange,
  yellow,
  lime,
  lightGreen,
  green,
  cyan,
  blue,
  indigo,
  purple,
  pink,
  grey,
} from "@mui/material/colors";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { numberWithCommas3 } from "../../CommonFunction";

export default function DoubleChart(props) {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    if (props.data != null) {
      const propsData = props.data;

      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue("--text-color");
      const textColorSecondary = documentStyle.getPropertyValue(
        "--text-color-secondary"
      );
      const surfaceBorder = documentStyle.getPropertyValue("--surface-border");
      const data = {
        labels: props.alllabel,
        datasets: [
          {
            type: "bar",
            label: props.label[0],
            backgroundColor: props.color[0],
            data: propsData.map((items) => {
              return items[props.value[0]];
            }),
            datalabels: {
              align: "end",
              anchor: "end"
            }
          },
          {
            type: "bar",
            label: props.label[1],
            backgroundColor: props.color[1],
            data: propsData.map((items) => {
              return items[props.value[1]];
            }),
            datalabels: {
              align: "end",
              anchor: "end"
            }
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
            align: "end",
            display: true
          },
          datalabels: {
            color: 'black',
            display: function(context) {
              return context.dataset.data[context.dataIndex] > 0;
            },
            font: {
              weight: 'bold'
            },
            formatter: function(value, context) { return numberWithCommas3(value); },
          }
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
  }, [props]);

  return (
    <div className="card">
      <Chart type="bar" data={chartData} plugins={[ChartDataLabels]} options={chartOptions} />
    </div>
  );
}
