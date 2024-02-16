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

export default function MultiDoughnutChart(props) {
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
      const data = {
        labels: props.label,
        datasets: [
          {
            data: propsData.map((item) => {
              return item[props.option];
            }),
            backgroundColor: propsData.map((item, idx) => {
              return props.random == true ? shuffleScores() : props.color[idx];
            }),
          },
        ],
      };

      const options = {
        cutout: "50%",
        plugins: {
          datalabels: {
            color: "black",
            display: true,
            font: {
              weight: "bold",
            },
            formatter: function (value, context) {
              return numberWithCommas3(value) + "%";
            },
          },
        },
      };
      setChartOptions(options);
      setChartData(data);
    }
  }, [props]);

  return (
    <div
      className="card flex justify-content-center"
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Chart
        type="doughnut"
        data={chartData}
        options={chartOptions}
        plugins={[ChartDataLabels]}
        className="w-full md:w-30rem"
      />
    </div>
  );
}
