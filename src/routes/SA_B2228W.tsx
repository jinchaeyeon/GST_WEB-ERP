import { Card, CardHeader, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import {
  convertDateToStr,
  numberWithCommas3,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE } from "../components/CommonString";
import MultiChart from "../components/KPIcomponents/Chart/MultiChart";
import MultiDoughnutChart from "../components/KPIcomponents/Chart/MultiDoughnutChart";
import SpecialDial from "../components/KPIcomponents/SpecialDial/SpecialDial";
import Table from "../components/KPIcomponents/Table/Table";
import { colors, colorsName, isLoading } from "../store/atoms";
import { useApi } from "../hooks/api";

const SA_B2228W: React.FC = () => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [color, setColor] = useRecoilState(colors);
  const [colorName, setColorName] = useRecoilState(colorsName);
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);

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
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    frdt: new Date(),
    isSearch: true,
  });

  //조회조건 파라미터
  const parameters = {
    procedureName: "P_SA_B2228W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyymm": convertDateToStr(filters.frdt).substring(0, 6),
    },
  };

  const parameters2 = {
    procedureName: "P_SA_B2228W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q2",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyymm": convertDateToStr(filters.frdt).substring(0, 6),
    },
  };

  const parameters3 = {
    procedureName: "P_SA_B2228W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q3",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyymm": convertDateToStr(filters.frdt).substring(0, 6),
    },
  };

  const fetchMainGrid = async () => {
    setLoading(true);
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;

      setItemList(rows);
    }

    let data2: any;
    try {
      data2 = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data2 = null;
    }

    if (data2.isSuccess === true) {
      const rows2 = data2.tables[0].Rows;

      setAllPanel(rows2[0]);
    }

    let data3: any;
    try {
      data3 = await processApi<any>("procedure", parameters3);
    } catch (error) {
      data3 = null;
    }

    if (data3.isSuccess === true) {
      const rows3 = data3.tables[0].Rows;

      setChartList(rows3);
      let array = rows3
        .filter(
          (arr: { series: any }, index: any, callback: any[]) =>
            index === callback.findIndex((t) => t.series === arr.series)
        )
        .map((item: { series: any }) => {
          return item.series;
        });

      let array2 = rows3
        .filter(
          (item: { series: any }) =>
            item.series ==
            rows3.filter(
              (arr: { series: any }, index: any, callback: any[]) =>
                index === callback.findIndex((t) => t.series === arr.series)
            )[0].series
        )
        .map((items: { argument: any }) => {
          return items.argument;
        });

      setStackChartLabel(array);
      setStackChartAllLabel(array2);
    }

    setLoading(false);
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

  const [ItemList, setItemList] = useState<any[]>([]);

  const [ChartList, setChartList] = useState([]);

  const [stackChartAllLabel, setStackChartAllLabel] = useState<any[]>([]);

  const [stackChartLabel, setStackChartLabel] = useState<any[]>([]);

  const [AllPanel, setAllPanel] = useState({
    pastmonth_amt: 0,
    month_amt: 0,
    increase_amt: 0,
    year_amt: 0,
    bestamt_dptcd: "",
    bestcnt_dptcd: "",
  });

  const cardOption = [
    {
      title: "지난달 계약금액",
      data:
        AllPanel.pastmonth_amt != null
          ? AllPanel.pastmonth_amt + "원"
          : 0 + "원",
    },
    {
      title: "이번달 계약금액",
      data: AllPanel.month_amt != null ? AllPanel.month_amt + "원" : 0 + "원",
    },
    {
      title: "전달대비 증감액",
      data:
        AllPanel.increase_amt != null ? AllPanel.increase_amt + "원" : 0 + "원",
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 누적계약금액",
      data: AllPanel.year_amt != null ? AllPanel.year_amt + "원" : 0 + "원",
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
                  _percent: "총매출대비 비중(%)",
                  goal_percent: "달성률(%)",
                }}
                numberCell={[
                  "target_amt",
                  "amt",
                  "goal_amt",
                  "_percent",
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
