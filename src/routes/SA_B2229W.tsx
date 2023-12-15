import Grid from "@mui/material/Grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Knob } from "primereact/knob";
import React, { useEffect, useRef, useState } from "react";
import { Map } from "react-kakao-maps-sdk";
import { useRecoilState } from "recoil";
import {
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  SubTitle,
  Title,
  TitleContainer,
} from "../CommonStyled";
import {
  convertDateToStr,
  dateformat2,
  numberWithCommas3,
} from "../components/CommonFunction";
import { GAP } from "../components/CommonString";
import BarChart from "../components/KPIcomponents/Chart/BarChart";
import SpecialDial from "../components/KPIcomponents/SpecialDial/SpecialDial";
import Table from "../components/KPIcomponents/Table/Table";
import { colors, colorsName } from "../store/atoms";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Calendar } from "primereact/calendar";
import { Toolbar } from "primereact/toolbar";
import MultiDoughnutChart from "../components/KPIcomponents/Chart/MultiDoughnutChart";
import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Typography,
} from "@mui/material";
import MultiChart from "../components/KPIcomponents/Chart/MultiChart";

const SA_B2229W: React.FC = () => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [color, setColor] = useRecoilState(colors);
  const [colorName, setColorName] = useRecoilState(colorsName);

  const theme = createTheme({
    palette: {
      primary: {
        main: `${color[0]}`,
        dark: `${color[1]}`,
        light: `${color[2]}`,
      },
      secondary: {
        main: `${color[3]}`,
      },
    },
  });

  useEffect(() => {}, [color]);

  const [ChartList, setChartList] = useState([
    {
      series: "상",
      argument: "1월",
      value: 3,
    },
    {
      series: "상",
      argument: "2월",
      value: 3,
    },
    {
      series: "상",
      argument: "3월",
      value: 3,
    },
    {
      series: "상",
      argument: "4월",
      value: 3,
    },
    {
      series: "상",
      argument: "5월",
      value: 3,
    },
    {
      series: "상",
      argument: "6월",
      value: 3,
    },
    {
      series: "상",
      argument: "7월",
      value: 3,
    },
    {
      series: "상",
      argument: "8월",
      value: 3,
    },
    {
      series: "상",
      argument: "9월",
      value: 3,
    },
    {
      series: "상",
      argument: "10월",
      value: 3,
    },
    {
      series: "상",
      argument: "11월",
      value: 3,
    },
    {
      series: "상",
      argument: "12월",
      value: 3,
    },
    {
      series: "중",
      argument: "1월",
      value: 2,
    },
    {
      series: "중",
      argument: "2월",
      value: 2,
    },
    {
      series: "중",
      argument: "3월",
      value: 2,
    },
    {
      series: "중",
      argument: "4월",
      value: 2,
    },
    {
      series: "중",
      argument: "5월",
      value: 2,
    },
    {
      series: "중",
      argument: "6월",
      value: 2,
    },
    {
      series: "중",
      argument: "7월",
      value: 2,
    },
    {
      series: "중",
      argument: "8월",
      value: 2,
    },
    {
      series: "중",
      argument: "9월",
      value: 2,
    },
    {
      series: "중",
      argument: "10월",
      value: 2,
    },
    {
      series: "중",
      argument: "11월",
      value: 2,
    },
    {
      series: "중",
      argument: "12월",
      value: 2,
    },
    {
      series: "하",
      argument: "1월",
      value: 1,
    },
    {
      series: "하",
      argument: "2월",
      value: 1,
    },
    {
      series: "하",
      argument: "3월",
      value: 1,
    },
    {
      series: "하",
      argument: "4월",
      value: 1,
    },
    {
      series: "하",
      argument: "5월",
      value: 1,
    },
    {
      series: "하",
      argument: "6월",
      value: 1,
    },
    {
      series: "하",
      argument: "7월",
      value: 1,
    },
    {
      series: "하",
      argument: "8월",
      value: 1,
    },
    {
      series: "하",
      argument: "9월",
      value: 1,
    },
    {
      series: "하",
      argument: "10월",
      value: 1,
    },
    {
      series: "하",
      argument: "11월",
      value: 1,
    },
    {
      series: "하",
      argument: "12월",
      value: 1,
    },
  ]);

  const [stackChartAllLabel, setStackChartAllLabel] = useState<any[]>(
    ChartList.filter(
      (item: { series: any }) =>
        item.series ==
        ChartList.filter(
          (arr: { series: any }, index: any, callback: any[]) =>
            index === callback.findIndex((t) => t.series === arr.series)
        )[0].series
    ).map((items: { argument: any }) => {
      return items.argument;
    })
  );

  const [stackChartLabel, setStackChartLabel] = useState<any[]>(
    ChartList.filter(
      (arr: { series: any }, index: any, callback: any[]) =>
        index === callback.findIndex((t) => t.series === arr.series)
    ).map((item: { series: any }) => {
      return item.series;
    })
  );

  return (
    <>
      <div
        style={{
          fontFamily: "TheJamsil5Bold",
          marginBottom: "50px",
        }}
      >
        <ThemeProvider theme={theme}>
          <Container
            maxWidth="xl"
            style={{ width: "100%", marginBottom: "50px" }}
          >
            <TitleContainer>
              <Title>실적연계분석</Title>
            </TitleContainer>
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>Contract Feasibility</GridTitle>
              </GridTitleContainer>
              <MultiChart
                props={ChartList}
                value="value"
                name="series"
                color={[
                  theme.palette.primary.light,
                  theme.palette.primary.main,
                  theme.palette.primary.dark,
                ]}
                alllabel={stackChartAllLabel}
                label={stackChartLabel}
                random={false}
              />
            </GridContainer>
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>Contract Weight</GridTitle>
              </GridTitleContainer>
              <MultiChart
                props={ChartList}
                value="value"
                name="series"
                color={[
                  theme.palette.primary.light,
                  theme.palette.primary.main,
                  theme.palette.primary.dark,
                ]}
                alllabel={stackChartAllLabel}
                label={stackChartLabel}
                random={false}
              />
            </GridContainer>
          </Container>
          <SpecialDial />
        </ThemeProvider>
      </div>
    </>
  );
};

export default SA_B2229W;
