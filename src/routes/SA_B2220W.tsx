import Grid from "@mui/material/Grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import {
  UseGetValueFromSessionItem,
  convertDateToStr,
} from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import LineBarChart from "../components/KPIcomponents/Chart/LineBarChart";
import MultiChart from "../components/KPIcomponents/Chart/MultiChart";
import SpecialDial from "../components/KPIcomponents/SpecialDial/SpecialDial";
import PaginatorTable from "../components/KPIcomponents/Table/PaginatorTable";
import GridTitle from "../components/KPIcomponents/Title/Title";
import { useApi } from "../hooks/api";
import { colors, colorsName, isLoading } from "../store/atoms";

interface Tsize {
  width: number;
  height: number;
}

const SA_B2220W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);

  const [color, setColor] = useRecoilState(colors);
  const [colorName, setColorName] = useRecoilState(colorsName);
  const [selected, setSelected] = useState<any>();
  const [selected2, setSelected2] = useState<any>();
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
          width: document.documentElement.clientWidth,
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
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    mm: new Date(),
    isSearch: true,
  });

  //조회조건 파라미터
  const parameters = {
    procedureName: "P_SA_B2220W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
      "@p_mm": convertDateToStr(filters.mm).substring(4, 6),
    },
  };

  //조회조건 파라미터
  const parameters2 = {
    procedureName: "P_SA_B2220W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q2",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
      "@p_mm": convertDateToStr(filters.mm).substring(4, 6),
    },
  };

  //조회조건 파라미터
  const parameters3 = {
    procedureName: "P_SA_B2220W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q3",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
      "@p_mm": convertDateToStr(filters.mm).substring(4, 6),
    },
  };

  //조회조건 파라미터
  const parameters4 = {
    procedureName: "P_SA_B2220W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q4",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
      "@p_mm": convertDateToStr(filters.mm).substring(4, 6),
    },
  };

  // const [ProjectList, setProjectList] = useState<any[]>([]);

  // const [UserList, setUserList] = useState<any[]>([]);

  // const [BarData, setBarData] = useState([]);

  // const [ChartList, setChartList] = useState([]);

  // const [stackChartLabel, setStackChartLabel] = useState<any[]>([]);

  // const [stackChartLabel2, setStackChartLabel2] = useState<any[]>([]);

  // const [stackChartAllLabel, setStackChartAllLabel] = useState<any[]>([]);

  // const [stackChartAllLabel2, setStackChartAllLabel2] = useState<any[]>([]);

  //가데이터
  const [ProjectList, setProjectList] = useState<any[]>([
    {
      user_name: "서다영",
      value: 50,
      num: 1,
    },
    {
      user_name: "송준헌",
      value: 40,
      num: 2,
    },
    {
      user_name: "이찬우",
      value: 30,
      num: 3,
    },
    {
      user_name: "김우겸",
      value: 20,
      num: 4,
    },
    {
      user_name: "강석우",
      value: 10,
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
      _percent: "80%",
      num: 1,
    },
    {
      user_name: "송준헌",
      cnt1: 5,
      cnt2: 40,
      cnt3: 10,
      cnt4: 80,
      cnt5: 30,
      _percent: "38%",
      num: 2,
    },
    {
      user_name: "이찬우",
      cnt1: 2,
      cnt2: 30,
      cnt3: 8,
      cnt4: 70,
      cnt5: 25,
      _percent: "36%",
      num: 3,
    },
    {
      user_name: "김우겸",
      cnt1: 4,
      cnt2: 40,
      cnt3: 20,
      cnt4: 70,
      cnt5: 15,
      _percent: "21%",
      num: 4,
    },
    {
      user_name: "강석우",
      cnt1: 6,
      cnt2: 20,
      cnt3: 10,
      cnt4: 20,
      cnt5: 6,
      _percent: "30%",
      num: 5,
    },
  ]);

  const [BarData, setBarData] = useState([
    {
      series: "송준헌",
      date: "2023-11",
      value: 10,
    },
    {
      series: "송준헌",
      date: "2023-12",
      value: 2,
    },
    {
      series: "송준헌",
      date: "2024-01",
      value: 20,
    },
    {
      series: "송준헌",
      date: "2024-02",
      value: 15,
    },
    {
      series: "서다영",
      date: "2023-11",
      value: 22,
    },
    {
      series: "서다영",
      date: "2023-12",
      value: 10,
    },
    {
      series: "서다영",
      date: "2024-01",
      value: 10,
    },
    {
      series: "서다영",
      date: "2024-02",
      value: 15,
    },
    {
      series: "이찬우",
      date: "2023-11",
      value: 8,
    },
    {
      series: "이찬우",
      date: "2023-12",
      value: 4,
    },
    {
      series: "이찬우",
      date: "2024-01",
      value: 28,
    },
    {
      series: "이찬우",
      date: "2024-02",
      value: 2,
    },
    {
      series: "김우겸",
      date: "2023-11",
      value: 11,
    },
    {
      series: "김우겸",
      date: "2023-12",
      value: 6,
    },
    {
      series: "김우겸",
      date: "2024-01",
      value: 3,
    },
    {
      series: "김우겸",
      date: "2024-02",
      value: 9,
    },
    {
      series: "강석우",
      date: "2023-11",
      value: 2,
    },
    {
      series: "강석우",
      date: "2023-12",
      value: 0,
    },
    {
      series: "강석우",
      date: "2024-01",
      value: 10,
    },
    {
      series: "강석우",
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

  const [stackChartLabel, setStackChartLabel] = useState<any[]>([]);

  const [stackChartLabel2, setStackChartLabel2] = useState<any[]>([]);

  const [stackChartAllLabel, setStackChartAllLabel] = useState<any[]>([]);

  const [stackChartAllLabel2, setStackChartAllLabel2] = useState<any[]>([]);

  const fetchMainGrid = async () => {
    //가데이터 라벨 셋팅

    let array = ChartList.filter(
      (item: { series: any }) =>
        item.series ==
        ChartList.filter(
          (arr: { series: any }, index: any, callback: any[]) =>
            index == callback.findIndex((t) => t.series == arr.series)
        )[0].series
    ).map((items: { argument: any }) => {
      return items.argument;
    });

    let array2 = ChartList.filter(
      (arr: { series: any }, index: any, callback: any[]) =>
        index == callback.findIndex((t) => t.series == arr.series)
    ).map((item: { series: any }) => {
      return item.series;
    });
    setStackChartLabel(array2);
    setStackChartAllLabel(array);

    let array3 = BarData.filter(
      (item: { date: any }) =>
        item.date ==
        BarData.filter(
          (arr: { date: any }, index: any, callback: any[]) =>
            index == callback.findIndex((t) => t.date == arr.date)
        )[0].date
    ).map((items: { series: any }) => {
      return items.series;
    });

    let array4 = BarData.filter(
      (arr: { date: any }, index: any, callback: any[]) =>
        index == callback.findIndex((t) => t.date == arr.date)
    ).map((item: { date: any }) => {
      return item.date;
    });
    setStackChartLabel2(array4);
    setStackChartAllLabel2(array3);

    // setLoading(true);
    // let data: any;
    // try {
    //   data = await processApi<any>("procedure", parameters);
    // } catch (error) {
    //   data = null;
    // }

    // if (data.isSuccess == true) {
    //   const rows = data.tables[0].Rows;

    //   setChartList(rows);

    //   let array = rows
    //     .filter(
    //       (item: { series: any }) =>
    //         item.series ==
    //         rows.filter(
    //           (arr: { series: any }, index: any, callback: any[]) =>
    //             index == callback.findIndex((t) => t.series == arr.series)
    //         )[0].series
    //     )
    //     .map((items: { argument: any }) => {
    //       return items.argument;
    //     });

    //   let array2 = rows
    //     .filter(
    //       (arr: { series: any }, index: any, callback: any[]) =>
    //         index == callback.findIndex((t) => t.series == arr.series)
    //     )
    //     .map((item: { series: any }) => {
    //       return item.series;
    //     });
    //   setStackChartLabel(array2);
    //   setStackChartAllLabel(array);
    // }

    // let data2: any;
    // try {
    //   data2 = await processApi<any>("procedure", parameters2);
    // } catch (error) {
    //   data2 = null;
    // }

    // if (data2.isSuccess == true) {
    //   const rows2 = data2.tables[0].Rows;

    //   setBarData(rows2);
    //   let array = rows2
    //     .filter(
    //       (item: { date: any }) =>
    //         item.date ==
    //         rows2.filter(
    //           (arr: { date: any }, index: any, callback: any[]) =>
    //             index == callback.findIndex((t) => t.date == arr.date)
    //         )[0].date
    //     )
    //     .map((items: { series: any }) => {
    //       return items.series;
    //     });

    //   let array2 = rows2
    //     .filter(
    //       (arr: { date: any }, index: any, callback: any[]) =>
    //         index == callback.findIndex((t) => t.date == arr.date)
    //     )
    //     .map((item: { date: any }) => {
    //       return item.date;
    //     });
    //   setStackChartLabel2(array2);
    //   setStackChartAllLabel2(array);
    // }

    // let data3: any;
    // try {
    //   data3 = await processApi<any>("procedure", parameters3);
    // } catch (error) {
    //   data3 = null;
    // }

    // if (data3.isSuccess == true) {
    //   const rows3 = data3.tables[0].Rows.map((item: any) => ({
    //     ...item,
    //     _percent: item._percent + "%",
    //   }));

    //   setUserList(rows3);
    //   setSelected(rows3[0]);
    // }

    // let data4: any;
    // try {
    //   data4 = await processApi<any>("procedure", parameters4);
    // } catch (error) {
    //   data4 = null;
    // }

    // if (data4.isSuccess == true) {
    //   const rows4 = data4.tables[0].Rows;

    //   setProjectList(rows4);
    //   setSelected2(rows4[0]);
    // }

    // setLoading(false);
  };

  useEffect(() => {
    if (filters.isSearch) {
      setFilters((prev) => ({
        ...prev,
        isSearch: false,
      }));
      fetchMainGrid();
    }
  }, [filters]);

  const startContent = (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={6} xl={6}>
          <label htmlFor="calendar-12h" className="font-bold block mb-2">
            년도
          </label>
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
          <label htmlFor="calendar-12h" className="font-bold block mb-2">
            월
          </label>
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

  return (
    <>
      <div style={{ fontFamily: "TheJamsil5Bold" }}>
        <ThemeProvider theme={theme}>
          <TitleContainer style={{ paddingTop: "25px", paddingBottom: "25px" }}>
            <Title>DASHBOARD(담당자별)</Title>
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
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <GridTitle
                title={
                  convertDateToStr(filters.frdt).substring(0, 4) +
                  "년도 개인별 실적 현황"
                }
              />
              <LineBarChart
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
                color={["#1d7cef", "#f8a73a", "#00b050", "#e72969"]}
                random={false}
                alllabel={stackChartAllLabel2}
                label={stackChartLabel2}
              />
            </Grid>
          </Grid>
          <Divider />
          <Grid container spacing={2} style={{ marginBottom: "50px" }}>
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
                  _percent: "견적 대비 계약 현황",
                }}
                title={
                  convertDateToStr(filters.frdt).substring(0, 4) +
                  "년도 개인별 활동 현황"
                }
                numberCell={["cnt1", "cnt2", "cnt3", "cnt4", "cnt5"]}
                width={[120, 100, 100, 100, 100, 100, 100]}
                key="num"
                selection={selected}
                onSelectionChange={(e: any) => {
                  setSelected(e.value);
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              xl={5}
              style={{ paddingBottom: "15px" }}
            >
              <PaginatorTable
                value={ProjectList}
                column={{
                  user_name: "구분",
                  value: "담당 프로젝트 수",
                }}
                numberCell={["value"]}
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
          <SpecialDial />
        </ThemeProvider>
      </div>
    </>
  );
};

export default SA_B2220W;
