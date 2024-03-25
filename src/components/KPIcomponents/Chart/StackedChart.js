import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import { numberWithCommas3 } from "../../CommonFunction";

export default function StackedChart(props) {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  function getRandomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
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
            backgroundColor:
              props.random == true ? getRandomColor() : props.color[idx],
            data: propsData
              .filter((item) => item[props.name] == props.label[idx])
              .map((items) => {
                return items[props.value];
              }),
            datalabels: {
              align: "end",
              anchor: "end",
            },
          };
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
            display: true,
            align: "end",
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
            afterDataLimits: scale => {
              scale.max = scale.max * 1.2;
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
      <Chart
        type="bar"
        data={chartData}
        plugins={[ChartDataLabels]}
        options={chartOptions}
      />
    </div>
  );
}
