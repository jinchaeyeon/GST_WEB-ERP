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

export default function ComboChart(props) {
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
            type: "line",
            label: props.label[0],
            borderColor: props.borderColor,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            data: propsData.map((items) => {
                return items[props.value[0]];
              }),
          },
          {
            type: "bar",
            label: props.label[1],
            backgroundColor: props.alllabel.map((item, index) =>
              props.random == true ? shuffleScores() : props.color[index]
            ),
            data: propsData.map((items) => {
              return items[props.value[1]];
            }),
            borderColor: "white",
            borderWidth: 2,
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
            align: "end",
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
  }, []);

  return (
    <div className="card">
      <Chart type="line" data={chartData} options={chartOptions} />
    </div>
  );
}
