import { Container } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { Knob } from "primereact/knob";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import { convertDateToStr } from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import Card from "../components/KPIcomponents/Card/CardBox";
import MultiChart from "../components/KPIcomponents/Chart/MultiChart";
import MultiDoughnutChart from "../components/KPIcomponents/Chart/MultiDoughnutChart";
import SpecialDial from "../components/KPIcomponents/SpecialDial/SpecialDial";
import GridTitle from "../components/KPIcomponents/Title/Title";
import { useApi } from "../hooks/api";
import { colors, colorsName, isLoading } from "../store/atoms";
import ComboChart from "../components/KPIcomponents/Chart/ComboChart";
import PaginatorTable from "../components/KPIcomponents/Table/PaginatorTable";

interface TList {
  badcnt?: number;
  custcd?: string;
  custnm?: string;
  okcnt?: number;
  percent?: number;
  rate?: number;
  totcnt?: number;
}

interface Tsize {
  width: number;
  height: number;
}

const SA_B2226W: React.FC = () => {
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const pathname: string = window.location.pathname.replace("/", "");
  const [color, setColor] = useRecoilState(colors);
  const [colorName, setColorName] = useRecoilState(colorsName);
  const [selected, setSelected] = useState<any>({
    itemcd: "일반독성",
    value: 61,
    current_year: 100,
    past_year: 80,
    cnt: 5,
    amt: 100,
    num: 1,
  });
  useEffect(() => {}, [color]);

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
  const size: Tsize = useWindowSize();

  function useWindowSize() {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
    const [windowSize, setWindowSize] = useState({
      width: 0,
      height: 0,
    });

    useEffect(() => {
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      // Add event listener
      window.addEventListener("resize", handleResize);
      // Call handler right away so state gets updated with initial window size
      handleResize();
      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
    return windowSize;
  }

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "01",
    frdt: new Date(),
    todt: new Date(),
    dtdiv: "W",
    dtgb: "B",
    isSearch: true,
  });

  const [ItemList, setItemList] = useState<any[]>([
    {
      itemcd: "일반독성",
      value: 61,
      current_year: 100,
      past_year: 80,
      cnt: 5,
      amt: 100,
      num: 1,
    },
    {
      itemcd: "생식독성",
      value: 1,
      current_year: 20,
      past_year: 20,
      cnt: 3,
      amt: 20,
      num: 2,
    },
    {
      itemcd: "국소/면역",
      value: 5,
      current_year: 70,
      past_year: 0,
      cnt: 1,
      amt: 70,
      num: 3,
    },
    {
      itemcd: "안전성약리",
      value: 9,
      current_year: 200,
      past_year: 200,
      cnt: 50,
      amt: 150,
      num: 4,
    },
    {
      itemcd: "유전독성",
      value: 6,
      current_year: 50,
      past_year: 0,
      cnt: 1,
      amt: 50,
      num: 5,
    },
    {
      itemcd: "대체독성",
      value: 6,
      current_year: 0,
      past_year: 0,
      cnt: 0,
      amt: 0,
      num: 6,
    },
    {
      itemcd: "분석",
      value: 12,
      current_year: 1,
      past_year: 1,
      cnt: 1,
      amt: 1,
      num: 7,
    },
  ]);

  const [ChartList, setChartList] = useState([
    {
      series: "계약금액",
      argument: "01월",
      value: 100,
    },
    {
      series: "계약금액",
      argument: "02월",
      value: 0,
    },
    {
      series: "계약금액",
      argument: "03월",
      value: 200,
    },
    {
      series: "계약금액",
      argument: "04월",
      value: 200,
    },
    {
      series: "계약금액",
      argument: "05월",
      value: 0,
    },
    {
      series: "계약금액",
      argument: "06월",
      value: 0,
    },
    {
      series: "계약금액",
      argument: "07월",
      value: 50,
    },
    {
      series: "계약금액",
      argument: "08월",
      value: 100,
    },
    {
      series: "계약금액",
      argument: "09월",
      value: 200,
    },
    {
      series: "계약금액",
      argument: "10월",
      value: 0,
    },
    {
      series: "계약금액",
      argument: "11월",
      value: 100,
    },
    {
      series: "계약금액",
      argument: "12월",
      value: 0,
    },
    {
      series: "변경계약금액",
      argument: "01월",
      value: 50,
    },
    {
      series: "변경계약금액",
      argument: "02월",
      value: 0,
    },
    {
      series: "변경계약금액",
      argument: "03월",
      value: 200,
    },
    {
      series: "변경계약금액",
      argument: "04월",
      value: 100,
    },
    {
      series: "변경계약금액",
      argument: "05월",
      value: 0,
    },
    {
      series: "변경계약금액",
      argument: "06월",
      value: 0,
    },
    {
      series: "변경계약금액",
      argument: "07월",
      value: 0,
    },
    {
      series: "변경계약금액",
      argument: "08월",
      value: 0,
    },
    {
      series: "변경계약금액",
      argument: "09월",
      value: 150,
    },
    {
      series: "변경계약금액",
      argument: "10월",
      value: 0,
    },
    {
      series: "변경계약금액",
      argument: "11월",
      value: 80,
    },
    {
      series: "변경계약금액",
      argument: "12월",
      value: 0,
    },
    {
      series: "최종계약금액",
      argument: "01월",
      value: 50,
    },
    {
      series: "최종계약금액",
      argument: "02월",
      value: 0,
    },
    {
      series: "최종계약금액",
      argument: "03월",
      value: 0,
    },
    {
      series: "최종계약금액",
      argument: "04월",
      value: 100,
    },
    {
      series: "최종계약금액",
      argument: "05월",
      value: 0,
    },
    {
      series: "최종계약금액",
      argument: "06월",
      value: 0,
    },
    {
      series: "최종계약금액",
      argument: "07월",
      value: 50,
    },
    {
      series: "최종계약금액",
      argument: "08월",
      value: 100,
    },
    {
      series: "최종계약금액",
      argument: "09월",
      value: 50,
    },
    {
      series: "최종계약금액",
      argument: "10월",
      value: 0,
    },
    {
      series: "최종계약금액",
      argument: "11월",
      value: 20,
    },
    {
      series: "최종계약금액",
      argument: "12월",
      value: 0,
    },
  ]);

  const [AllPanel, setAllPanel] = useState({
    month_count: 10,
    month_amt: 150,
    year_count: 300,
    year_amt: 400,
    change_count: 300,
    change_amt: -50,
    total_amt: 350,
  });

  const [stackChartLabel, setStackChartLabel] = useState<any[]>(
    ChartList.filter(
      (arr: { series: any }, index: any, callback: any[]) =>
        index === callback.findIndex((t) => t.series === arr.series)
    ).map((item: { series: any }) => {
      return item.series;
    })
  );
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
  const [doughnut, setDoughnut] = useState({
    target: 350,
    performance: 500,
    percent: 60,
  });

  const startContent = (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={12} xl={12}>
          <Calendar
            value={filters.frdt}
            onChange={(e: any) =>
              setFilters((prev) => ({
                ...prev,
                frdt: e.value,
              }))
            }
            dateFormat={"yy"}
            view={"year"}
            showIcon
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );

  const cardOption = [
    {
      title: convertDateToStr(new Date()).substring(4, 6) + "월 계약 수",
      data:
        AllPanel.month_count != null ? AllPanel.month_count + "건" : 0 + "건",
      backgroundColor: theme.palette.primary.dark,
    },
    {
      title: convertDateToStr(new Date()).substring(4, 6) + "월 계약금액",
      data: AllPanel.month_amt != null ? AllPanel.month_amt + "억" : 0 + "원",
      backgroundColor: theme.palette.primary.main,
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 계약 수",
      data: AllPanel.year_count != null ? AllPanel.year_count + "건" : 0 + "건",
      backgroundColor: theme.palette.primary.light,
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 계약금액",
      data: AllPanel.year_amt != null ? AllPanel.year_amt + "억" : 0 + "원",
      backgroundColor: theme.palette.secondary.main,
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 변경계약 수",
      data:
        AllPanel.change_count != null ? AllPanel.change_count + "건" : 0 + "건",
      backgroundColor: theme.palette.primary.dark,
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 변경계약금액",
      data: AllPanel.change_amt != null ? AllPanel.change_amt + "억" : 0 + "원",
      backgroundColor: theme.palette.primary.main,
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 최종계약금액",
      data: AllPanel.total_amt != null ? AllPanel.total_amt + "억" : 0 + "원",
      backgroundColor: theme.palette.primary.light,
    },
  ];

  return (
    <>
      <ThemeProvider theme={theme}>
        <Container maxWidth="xl" style={{ width: "100%", marginBottom: "50px" }}>
          <TitleContainer style={{ paddingTop: "25px", paddingBottom: "25px" }}>
            <Title>DASHBOARD(실적)</Title>
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
          </TitleContainer>
          <Toolbar start={startContent} />
          <Divider />
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              {cardOption.map((item) => (
                <Grid item xs={12} sm={6} md={6} lg={3} xl={3}>
                  <Card
                    title={item.title}
                    data={item.data}
                    backgroundColor={item.backgroundColor}
                    fontsize={size.width < 600 ? "2.2rem" : "3rem"}
                    form={"SA_B2221W"}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={9} xl={9}>
              <GridTitle
                title={
                  convertDateToStr(filters.frdt).substring(0, 4) +
                  "년도 실적현황"
                }
              />
              <MultiChart
                props={ChartList}
                value="value"
                name="series"
                color={[
                  "#1d7cef",
                  "#f8a73a",
                  "#00b050",
                ]}
                alllabel={stackChartAllLabel}
                label={stackChartLabel}
                random={false}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={3} xl={3}>
              <GridTitle
                title={
                  convertDateToStr(filters.frdt).substring(0, 4) +
                  "년도 목표 대비 실적"
                }
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={6} lg={12} xl={6}>
                  <Card
                    title={"목표 금액"}
                    data={doughnut.target + "억"}
                    backgroundColor={theme.palette.primary.main}
                    fontsize={size.width < 600 ? "1.8rem" : "2rem"}
                    form={"SA_B2226W"}
                    height={"120px"}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={12} xl={6}>
                  <Card
                    title={"실적 금액"}
                    data={doughnut.performance + "억"}
                    backgroundColor={theme.palette.primary.light}
                    fontsize={size.width < 600 ? "1.8rem" : "2rem"}
                    form={"SA_B2226W"}
                    height={"120px"}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  lg={12}
                  xl={12}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <Knob
                    value={doughnut.percent}
                    size={250}
                    valueTemplate={"{value}%"}
                    valueColor={theme.palette.primary.dark}
                    rangeColor={theme.palette.secondary.main}
                    readOnly
                    strokeWidth={10}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider />
          <GridTitle
            title={
              convertDateToStr(filters.frdt).substring(0, 4) +
              "년도 품목별 계약 현황"
            }
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <ComboChart
                data={ItemList}
                value={["past_year", "current_year"]}
                label={["직전년도 계약금액", "당해년도 계약금액"]}
                alllabel={ItemList.map((item) => item.itemcd)}
                random={true}
                name="past_year"
                colorName={colorName}
                borderColor={theme.palette.primary.dark}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={8} xl={8}>
              <PaginatorTable
                value={ItemList}
                column={{
                  itemcd: "품목명",
                  cnt: "시험건수",
                  amt: "계약금액",
                }}
                title={"목록"}
                width={[120, 100, 100]}
                key="num"
                selection={selected}
                onSelectionChange={(e: any) => {
                  setSelected(e.value);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={4} xl={4}>
              <MultiDoughnutChart
                data={ItemList}
                option={"value"}
                label={ItemList.map((item) => item.itemcd)}
                random={true}
                colorName={colorName}
              />
            </Grid>
          </Grid>
        </Container>
        <SpecialDial />
      </ThemeProvider>
    </>
  );
};

export default SA_B2226W;
