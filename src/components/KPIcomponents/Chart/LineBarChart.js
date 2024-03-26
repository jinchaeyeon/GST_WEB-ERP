import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import { numberWithCommas3 } from "../../CommonFunction";

export default function DoubleChart(props) {
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
        labels: props.alllabel,
        datasets: [
          {
            type: "line",
            label: props.label[1],
            backgroundColor: props.color[1],
            borderColor: props.color[1],
            fill: false,
            yAxisID: "y1",
            tension: 0.4,
            data: propsData
              .filter((item) => props.label[1] == item.series)
              .map((items) => items[props.value]),
            datalabels: {
              align: "end",
              anchor: "end",
            },
          },
          {
            type: "bar",
            label: props.label[0],
            backgroundColor: props.color[0],
            data: propsData
              .filter((item) => props.label[0] == item.series)
              .map((items) => items[props.value]),
            yAxisID: "y",
            datalabels: {
              align: "end",
              anchor: "end",
            },
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
            display: true,
          },
          datalabels: {
            color: "black",
            display: function (context) {
              return context.dataset.data[context.dataIndex] > 0;
            },
            font: {
              weight: "bold",
            },
            formatter: function (value, context) {
              return numberWithCommas3(value);
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
            type: "linear",
            display: true,
            position: "left",
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
            afterDataLimits: scale => {
              scale.max = scale.max * 1.2;
            },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            ticks: {
              color: textColorSecondary,
            },
            afterDataLimits: scale => {
              scale.max = scale.max * 1.2;
            },
            grid: {
              drawOnChartArea: false,
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
      <Chart
        type="bar"
        data={chartData}
        plugins={[ChartDataLabels]}
        options={chartOptions}
      />
    </div>
  );
}
