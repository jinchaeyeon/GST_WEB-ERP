import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import { numberWithCommas3 } from "../../CommonFunction";

export default function LineChart(props) {
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
            label: props.label[idx],
            backgroundColor:
              props.random == true ? getRandomColor() : props.color[idx],
            borderColor:
              props.random == true ? getRandomColor() : props.borderColor[idx],
            fill: true,
            tension: 0.4,
            data: propsData
              .filter((item) => item[props.name] == props.label[idx])
              .map((items) => {
                return items[props.value];
              }),
          };
        }),
      };

      const options = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
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
            anchor: "end",
            clamp: true,
            clip: true,
            align: "-135",
            offset: 1,
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
      <Chart
        type="line"
        data={chartData}
        plugins={[ChartDataLabels]}
        options={chartOptions}
      />
    </div>
  );
}
