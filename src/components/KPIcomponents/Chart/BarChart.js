import {
  blue,
  cyan,
  green,
  grey,
  indigo,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  yellow,
} from "@mui/material/colors";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import { numberWithCommas3 } from "../../CommonFunction";

export default function BarChart(props) {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  function shuffleScores() {
    const ranNum = () => Math.random() - 0.5;
    const array = [100, 200, 300, 400, 500, 600, 700, 800, 900];
    const shuffled = [...array].sort(ranNum);

    if (props.colorName == "Red") {
      return red[shuffled[0]];
    } else if (props.colorName == "Orange") {
      return orange[shuffled[0]];
    } else if (props.colorName == "Yellow") {
      return yellow[shuffled[0]];
    } else if (props.colorName == "Lime") {
      return lime[shuffled[0]];
    } else if (props.colorName == "LightGreen") {
      return lightGreen[shuffled[0]];
    } else if (props.colorName == "Green") {
      return green[shuffled[0]];
    } else if (props.colorName == "Cyan") {
      return cyan[shuffled[0]];
    } else if (props.colorName == "Blue") {
      return blue[shuffled[0]];
    } else if (props.colorName == "Navy") {
      return indigo[shuffled[0]];
    } else if (props.colorName == "Purple") {
      return purple[shuffled[0]];
    } else if (props.colorName == "Pink") {
      return pink[shuffled[0]];
    } else if (props.colorName == "Grey") {
      return grey[shuffled[0]];
    } else {
      return blue[shuffled[0]];
    }
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
        datasets: [
          {
            type: "bar",
            backgroundColor: props.alllabel.map((item, index) =>
              props.random == true ? shuffleScores() : props.color[index]
            ),
            data: propsData.map((items) => {
              return items[props.value];
            }),
            datalabels: {
              align: "end",
              anchor: "end",
            },
          },
        ],
      };

      const options = {
        maintainAspectRatio: false,
        responsive: true,
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
            display: false,
          },
          datalabels: {
            color: "black",
            display: true,
            font: {
              weight: "bold",
              size: 14
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
  }, [props]);

  return (
    <div className="card" style={{ height: "100%" }}>
      <Chart
        type="bar"
        data={chartData}
        plugins={[ChartDataLabels]}
        options={chartOptions}
      />
    </div>
  );
}
