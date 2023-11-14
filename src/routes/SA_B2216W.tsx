import { Container } from "@mui/material";
import Grid from "@mui/material/Grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import { convertDateToStr } from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import MultiChart from "../components/KPIcomponents/Chart/MultiChart";
import SpecialDial from "../components/KPIcomponents/SpecialDial/SpecialDial";
import PaginatorTable from "../components/KPIcomponents/Table/PaginatorTable";
import GridTitle from "../components/KPIcomponents/Title/Title";
import { useApi } from "../hooks/api";
import { colors, colorsName, isLoading } from "../store/atoms";

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

const SA_B2216W: React.FC = () => {
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const pathname: string = window.location.pathname.replace("/", "");
  const [color, setColor] = useRecoilState(colors);
  const [colorName, setColorName] = useRecoilState(colorsName);
  const [selected, setSelected] = useState<any>({
    user_name: "서다영",
    cnt1: 20,
    cnt2: 60,
    cnt3: 40,
    cnt4: 50,
    cnt5: 40,
    percent: "80%",
    num: 1,
  });
  const [selected2, setSelected2] = useState<any>({
    user_name: "서다영",
    cnt: 50,
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
    mm: new Date(),
    dtdiv: "W",
    dtgb: "B",
    isSearch: true,
  });

  const [ProjectList, setProjectList] = useState<any[]>([
    {
      user_name: "서다영",
      cnt: 50,
      num: 1,
    },
    {
      user_name: "송준헌",
      cnt: 40,
      num: 2,
    },
    {
      user_name: "이찬우",
      cnt: 30,
      num: 3,
    },
    {
      user_name: "김우겸",
      cnt: 20,
      num: 4,
    },
    {
      user_name: "강석우",
      cnt: 10,
      num: 5,
    },
  ]);

  const [UserList, setUserList] = useState<any[]>([
    {
      user_name: "서다영",
      cnt1: 20,
      cnt2: 60,
      cnt3: 40,
      cnt4: 50,
      cnt5: 40,
      percent: "80%",
      num: 1,
    },
    {
      user_name: "송준헌",
      cnt1: 5,
      cnt2: 40,
      cnt3: 10,
      cnt4: 80,
      cnt5: 30,
      percent: "38%",
      num: 2,
    },
    {
      user_name: "이찬우",
      cnt1: 2,
      cnt2: 30,
      cnt3: 8,
      cnt4: 70,
      cnt5: 25,
      percent: "36%",
      num: 3,
    },
    {
      user_name: "김우겸",
      cnt1: 4,
      cnt2: 40,
      cnt3: 20,
      cnt4: 70,
      cnt5: 15,
      percent: "21%",
      num: 4,
    },
    {
      user_name: "강석우",
      cnt1: 6,
      cnt2: 20,
      cnt3: 10,
      cnt4: 20,
      cnt5: 6,
      percent: "30%",
      num: 5,
    },
  ]);

  const [BarData, setBarData] = useState([
    {
      user_name: "송준헌",
      date: "2023-11",
      value: 10,
    },
    {
      user_name: "송준헌",
      date: "2023-12",
      value: 2,
    },
    {
      user_name: "송준헌",
      date: "2024-01",
      value: 20,
    },
    {
      user_name: "송준헌",
      date: "2024-02",
      value: 15,
    },
    {
      user_name: "서다영",
      date: "2023-11",
      value: 22,
    },
    {
      user_name: "서다영",
      date: "2023-12",
      value: 10,
    },
    {
      user_name: "서다영",
      date: "2024-01",
      value: 10,
    },
    {
      user_name: "서다영",
      date: "2024-02",
      value: 15,
    },
    {
      user_name: "이찬우",
      date: "2023-11",
      value: 8,
    },
    {
      user_name: "이찬우",
      date: "2023-12",
      value: 4,
    },
    {
      user_name: "이찬우",
      date: "2024-01",
      value: 28,
    },
    {
      user_name: "이찬우",
      date: "2024-02",
      value: 2,
    },
    {
      user_name: "김우겸",
      date: "2023-11",
      value: 11,
    },
    {
      user_name: "김우겸",
      date: "2023-12",
      value: 6,
    },
    {
      user_name: "김우겸",
      date: "2024-01",
      value: 3,
    },
    {
      user_name: "김우겸",
      date: "2024-02",
      value: 9,
    },
    {
      user_name: "강석우",
      date: "2023-11",
      value: 2,
    },
    {
      user_name: "강석우",
      date: "2023-12",
      value: 0,
    },
    {
      user_name: "강석우",
      date: "2024-01",
      value: 10,
    },
    {
      user_name: "강석우",
      date: "2024-02",
      value: 11,
    },
  ]);

  const [ChartList, setChartList] = useState([
    {
      series: "계약금액",
      argument: "송준헌",
      value: 100,
    },
    {
      series: "계약금액",
      argument: "서다영",
      value: 500,
    },
    {
      series: "계약금액",
      argument: "이찬우",
      value: 200,
    },
    {
      series: "계약금액",
      argument: "김우겸",
      value: 200,
    },
    {
      series: "계약금액",
      argument: "강석우",
      value: 50,
    },
    {
      series: "계약 수",
      argument: "송준헌",
      value: 3,
    },
    {
      series: "계약 수",
      argument: "서다영",
      value: 40,
    },
    {
      series: "계약 수",
      argument: "이찬우",
      value: 10,
    },
    {
      series: "계약 수",
      argument: "김우겸",
      value: 20,
    },
    {
      series: "계약 수",
      argument: "강석우",
      value: 1,
    },
  ]);

  const [stackChartLabel, setStackChartLabel] = useState<any[]>(
    ChartList.filter(
      (arr: { series: any }, index: any, callback: any[]) =>
        index === callback.findIndex((t) => t.series === arr.series)
    ).map((item: { series: any }) => {
      return item.series;
    })
  );

  const [stackChartLabel2, setStackChartLabel2] = useState<any[]>(
    BarData.filter(
      (arr: { date: any }, index: any, callback: any[]) =>
        index === callback.findIndex((t) => t.date === arr.date)
    ).map((item: { date: any }) => {
      return item.date;
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

  const [stackChartAllLabel2, setStackChartAllLabel2] = useState<any[]>(
    BarData.filter(
      (item: { date: any }) =>
        item.date ==
        BarData.filter(
          (arr: { date: any }, index: any, callback: any[]) =>
            index === callback.findIndex((t) => t.date === arr.date)
        )[0].date
    ).map((items: { user_name: any }) => {
      return items.user_name;
    })
  );

  const startContent = (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={6} xl={6}>
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
        <Grid item xs={12} sm={6} md={6} xl={6}>
          <Calendar
            value={filters.mm}
            onChange={(e: any) =>
              setFilters((prev) => ({
                ...prev,
                mm: e.value,
              }))
            }
            dateFormat={"mm"}
            view={"month"}
            showIcon
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );

  return (
    <>
      <ThemeProvider theme={theme}>
        <Container
          maxWidth="xl"
          style={{ width: "100%", marginBottom: "50px" }}
        >
          <TitleContainer style={{ paddingTop: "25px", paddingBottom: "25px" }}>
            <Title>DASHBOARD(담당자별)</Title>
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
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <GridTitle
                title={
                  convertDateToStr(filters.frdt).substring(0, 4) +
                  "년도 개인별 실적 현황"
                }
              />
              <MultiChart
                props={ChartList}
                value="value"
                name="series"
                color={[
                  theme.palette.primary.dark,
                  theme.palette.primary.light,
                ]}
                alllabel={stackChartAllLabel}
                label={stackChartLabel}
                random={false}
              />
            </Grid>
          </Grid>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <GridTitle
                title={
                  convertDateToStr(filters.frdt).substring(0, 4) +
                  "년도 개인별 담당프로젝트 수"
                }
              />
              <MultiChart
                props={BarData}
                value="value"
                name="date"
                color={[
                  theme.palette.primary.dark,
                  theme.palette.primary.main,
                  theme.palette.primary.light,
                  theme.palette.secondary.main,
                ]}
                alllabel={stackChartAllLabel2}
                label={stackChartLabel2}
                random={false}
              />
            </Grid>
          </Grid>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={7}>
              <PaginatorTable
                value={UserList}
                column={{
                  user_name: "구분",
                  cnt1: "방문",
                  cnt2: "상담",
                  cnt3: "컨설팅",
                  cnt4: "견적",
                  cnt5: "계약",
                  percent: "견적 대비 계약 현황",
                }}
                title={
                  convertDateToStr(filters.frdt).substring(0, 4) +
                  "년도 개인별 활동 현황"
                }
                width={[120, 100, 100, 100, 100, 100, 100]}
                key="num"
                selection={selected}
                onSelectionChange={(e: any) => {
                  setSelected(e.value);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={5}>
              <PaginatorTable
                value={ProjectList}
                column={{
                  user_name: "구분",
                  cnt: "담당 프로젝트 수",
                }}
                title={
                  convertDateToStr(filters.frdt).substring(0, 4) +
                  "년도 개인별 프로젝트 관리 수"
                }
                width={[120, 100]}
                key="num"
                selection={selected2}
                onSelectionChange={(e: any) => {
                  setSelected2(e.value);
                }}
              />
            </Grid>
          </Grid>
        </Container>
        <SpecialDial />
      </ThemeProvider>
    </>
  );
};

export default SA_B2216W;
