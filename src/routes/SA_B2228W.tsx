import {
  Card,
  CardHeader,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer
} from "../CommonStyled";
import {
  convertDateToStr,
  numberWithCommas3
} from "../components/CommonFunction";
import { GAP } from "../components/CommonString";
import MultiChart from "../components/KPIcomponents/Chart/MultiChart";
import MultiDoughnutChart from "../components/KPIcomponents/Chart/MultiDoughnutChart";
import SpecialDial from "../components/KPIcomponents/SpecialDial/SpecialDial";
import Table from "../components/KPIcomponents/Table/Table";
import { colors, colorsName } from "../store/atoms";

const SA_B2228W: React.FC = () => {
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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    frdt: new Date(),
    isSearch: true,
  });

  const startContent = (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={12} xl={12}>
          <label htmlFor="calendar-12h" className="font-bold block mb-2">
            날짜
          </label>
          <Calendar
            value={filters.frdt}
            onChange={(e: any) =>
              setFilters((prev) => ({
                ...prev,
                frdt: e.value,
              }))
            }
            dateFormat={"yy-mm"}
            view={"month"}
            showIcon
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
  const endContent = (
    <React.Fragment>
      {isMobile ? (
        ""
      ) : (
        <ButtonContainer>
          <Button
            icon="pi pi-search"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                isSearch: true,
              }))
            }
            className="mr-2"
          />
        </ButtonContainer>
      )}
    </React.Fragment>
  );

  const [ItemList, setItemList] = useState<any[]>([
    {
      testpart: "일반독성",
      value: 61,
      target_amt: numberWithCommas3(4230000),
      amt: numberWithCommas3(8835000),
      goal_amt: numberWithCommas3(4605000),
      percent: 22.4,
      goal_percent: 208.9,
    },
    {
      testpart: "생식독성",
      value: 1,
      target_amt: numberWithCommas3(3000000),
      amt: numberWithCommas3(7005000),
      goal_amt: numberWithCommas3(4005000),
      percent: 17.8,
      goal_percent: 233.5,
    },
    {
      testpart: "국소/면역",
      value: 5,
      target_amt: numberWithCommas3(5008000),
      amt: numberWithCommas3(7615000),
      goal_amt: numberWithCommas3(2607000),
      percent: 19.3,
      goal_percent: 152.1,
    },
    {
      testpart: "안전성약리",
      value: 9,
      target_amt: numberWithCommas3(4960000),
      amt: numberWithCommas3(3415000),
      goal_amt: numberWithCommas3(-1545000),
      percent: 8.7,
      goal_percent: 68.9,
    },
    {
      testpart: "유전독성",
      value: 6,
      target_amt: numberWithCommas3(9600000),
      amt: numberWithCommas3(12510000),
      goal_amt: numberWithCommas3(2910000),
      percent: 31.8,
      goal_percent: 130.3,
    },
    {
      testpart: "대체독성",
      value: 6,
      target_amt: 0,
      amt: 0,
      goal_amt: 0,
      percent: 0,
      goal_percent: 0,
    },
    {
      testpart: "분석",
      value: 12,
      target_amt: 0,
      amt: 0,
      goal_amt: 0,
      percent: 0,
      goal_percent: 0,
    },
  ]);

  const [ChartList, setChartList] = useState([
    {
      series: "목표금액",
      argument: "일반독성",
      value: 4230000,
    },
    {
      series: "목표금액",
      argument: "생식독성",
      value: 3000000,
    },
    {
      series: "목표금액",
      argument: "국소/면역",
      value: 5008000,
    },
    {
      series: "목표금액",
      argument: "안전성약리",
      value: 4960000,
    },
    {
      series: "목표금액",
      argument: "유전독성",
      value: 9600000,
    },
    {
      series: "목표금액",
      argument: "대체독성",
      value: 0,
    },
    {
      series: "목표금액",
      argument: "분석",
      value: 0,
    },
    {
      series: "달성금액",
      argument: "일반독성",
      value: 8835000,
    },
    {
      series: "달성금액",
      argument: "생식독성",
      value: 7005000,
    },
    {
      series: "달성금액",
      argument: "국소/면역",
      value: 7615000,
    },
    {
      series: "달성금액",
      argument: "안전성약리",
      value: 3415000,
    },

    {
      series: "달성금액",
      argument: "유전독성",
      value: 12510000,
    },
    {
      series: "달성금액",
      argument: "대체독성",
      value: 0,
    },
    {
      series: "달성금액",
      argument: "분석",
      value: 0,
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

  const [AllPanel, setAllPanel] = useState({
    pastmonth_amt: 30,
    month_amt: 39,
    increase_amt: 9,
    year_amt: 250,
    bestamt_dptcd: "1팀",
    bestcnt_dptcd: "3팀",
  });

  const cardOption = [
    {
      title: "지난달 계약금액",
      data:
        AllPanel.pastmonth_amt != null
          ? AllPanel.pastmonth_amt + "억"
          : 0 + "원",
    },
    {
      title: "이번달 계약금액",
      data: AllPanel.month_amt != null ? AllPanel.month_amt + "억" : 0 + "원",
    },
    {
      title: "전달대비 증감액",
      data:
        AllPanel.increase_amt != null ? AllPanel.increase_amt + "억" : 0 + "원",
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 누적계약금액",
      data: AllPanel.year_amt != null ? AllPanel.year_amt + "억" : 0 + "원",
    },
    {
      title: "당월 최고 매출액 사업부",
      data: AllPanel.bestamt_dptcd != null ? AllPanel.bestamt_dptcd : "",
    },
    {
      title: "당월 최다 건수 사업부",
      data: AllPanel.bestcnt_dptcd != null ? AllPanel.bestcnt_dptcd : "",
    },
  ];

  return (
    <>
      <div
        style={{
          fontFamily: "TheJamsil5Bold",
          marginBottom: "50px",
        }}
      >
        <ThemeProvider theme={theme}>
          <TitleContainer>
            <Title>영업활동보고</Title>
            {isMobile ? (
              <ButtonContainer>
                <Button
                  icon="pi pi-search"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      isSearch: true,
                    }))
                  }
                  className="mr-2"
                />
              </ButtonContainer>
            ) : (
              ""
            )}
          </TitleContainer>
          <Toolbar start={startContent} end={endContent} />
          <Divider />
          <GridContainerWrap>
            <GridContainer width="25%">
              <GridTitleContainer>
                <GridTitle>사업부별 매출</GridTitle>
              </GridTitleContainer>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <MultiDoughnutChart
                    data={ItemList}
                    option={"value"}
                    label={ItemList.map((item) => item.testpart)}
                    random={true}
                    colorName={colorName}
                  />
                </Grid>
                {cardOption.map((item) => (
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Card
                      style={{
                        height: "50px",
                        width: "100%",
                        marginRight: "15px",
                        backgroundColor: theme.palette.primary.dark,
                        color: "white",
                        fontFamily: "TheJamsil5Bold",
                      }}
                    >
                      <CardHeader
                        style={{ paddingBottom: 0, paddingTop: 10 }}
                        title={
                          <>
                            <Typography
                              style={{
                                fontSize: "1rem",
                                color: "white",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                              {item.title} : &nbsp;
                              <Typography
                                style={{
                                  fontSize: "1.3rem",
                                  color: "white",
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontFamily: "TheJamsil5Bold",
                                }}
                              >
                                {item.data}
                              </Typography>
                            </Typography>
                          </>
                        }
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(75% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>사업부별 목표대비 실적 달성</GridTitle>
              </GridTitleContainer>
              <MultiChart
                props={ChartList}
                value="value"
                name="series"
                color={["#d3d3d3", "#70ad47"]}
                alllabel={stackChartAllLabel}
                label={stackChartLabel}
                random={false}
              />
              <Table
                value={ItemList}
                column={{
                  testpart: "시험파트",
                  target_amt: "목표금액",
                  amt: "매출실적",
                  goal_amt: "목표대비달성금액",
                  percent: "총매출대비 비중(%)",
                  goal_percent: "달성률(%)",
                }}
                numberCell={[
                  "target_amt",
                  "amt",
                  "goal_amt",
                  "percent",
                  "goal_percent",
                ]}
                width={[120, 100, 100, 100, 100, 100, 100, 100, 100, 100]}
              />
            </GridContainer>
          </GridContainerWrap>
          <SpecialDial />
        </ThemeProvider>
      </div>
    </>
  );
};

export default SA_B2228W;
