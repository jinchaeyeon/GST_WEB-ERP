import {
  CardContent as CardContentMui,
  Card as CardMui,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { Knob } from "primereact/knob";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import Card from "../components/BIOComponents/CardBox";
import {
  GetPropertyValueByName,
  ThreeNumberceil,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getDeviceHeight,
  numberWithCommas3,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import DoubleChart from "../components/KPIcomponents/Chart/DoubleChart";
import MultiChart from "../components/KPIcomponents/Chart/MultiChart";
import MultiDoughnutChart from "../components/KPIcomponents/Chart/MultiDoughnutChart";
import PaginatorTable from "../components/KPIcomponents/Table/PaginatorTable";
import GridTitle from "../components/KPIcomponents/Title/Title";
import { useApi } from "../hooks/api";
import { colors, colorsName, isLoading } from "../store/atoms";
import { TPermissions } from "../store/types";

interface TList {
  badcnt?: number;
  custcd?: string;
  custnm?: string;
  okcnt?: number;
  percent?: number;
  rate?: number;
  totcnt?: number;
}

const SA_B2226W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    const handleWindowResize = () => {
      let deviceWidth = document.documentElement.clientWidth;
      setIsMobile(deviceWidth <= 1200);
      setMobileHeight(getDeviceHeight(false));
      setWebHeight(getDeviceHeight(false));
    };
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [webheight]);

  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);

  const [color, setColor] = useRecoilState(colors);
  const [colorName, setColorName] = useRecoilState(colorsName);
  const [selected, setSelected] = useState<any>();
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

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("SA_B2226W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SA_B2226W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        isSearch: true,
      }));
    }
  }, [customOptionData]);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    isSearch: false,
  });

  //조회조건 파라미터
  const parameters = {
    procedureName: "P_SA_B2226W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
    },
  };

  const parameters2 = {
    procedureName: "P_SA_B2226W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q2",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
    },
  };

  const parameters3 = {
    procedureName: "P_SA_B2226W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q3",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
    },
  };

  const parameters4 = {
    procedureName: "P_SA_B2226W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q4",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
    },
  };

  const fetchMainGrid = async () => {
    if (!permissions.view) return;
    setLoading(true);
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;

      setAllPanel(rows[0]);
    }

    let data2: any;
    try {
      data2 = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data2 = null;
    }

    if (data2.isSuccess == true) {
      const rows2 = data2.tables[0].Rows.map((item: any) => ({
        ...item,
        value: Math.round(item.value),
      }));

      setChartList(rows2);
      let array = rows2
        .filter(
          (arr: { series: any }, index: any, callback: any[]) =>
            index == callback.findIndex((t) => t.series == arr.series)
        )
        .map((item: { series: any }) => {
          return item.series;
        });
      let array2 = rows2
        .filter(
          (item: { series: any }) =>
            item.series ==
            rows2.filter(
              (arr: { series: any }, index: any, callback: any[]) =>
                index == callback.findIndex((t) => t.series == arr.series)
            )[0].series
        )
        .map((items: { argument: any }) => {
          return items.argument;
        });
      setStackChartLabel(array);
      setStackChartAllLabel(array2);
    }

    let data3: any;
    try {
      data3 = await processApi<any>("procedure", parameters3);
    } catch (error) {
      data3 = null;
    }

    if (data3.isSuccess == true) {
      const rows3 = data3.tables[0].Rows.map((item: any) => ({
        ...item,
        past_year: Math.round(item.past_year),
        current_year: Math.round(item.current_year),
        cnt: Math.round(item.cnt),
      }));

      setItemList(rows3);
      let array3 = rows3.map(
        (item: { testpart: string; teststs: string }) =>
          item.testpart + "_" + item.teststs
      );
      setStackItemLabel(array3);
      setSelected(rows3[0]);
    }

    let data4: any;
    try {
      data4 = await processApi<any>("procedure", parameters4);
    } catch (error) {
      data4 = null;
    }

    if (data4.isSuccess == true) {
      const rows3 = data4.tables[0].Rows;

      const target = ThreeNumberceil(Math.round(rows3[0].target));
      const performance = ThreeNumberceil(Math.round(rows3[0].performance));
      const percent = parseFloat(
        (Math.round((performance / target) * 100 * 1000) / 1000).toFixed(0)
      );

      setDoughnut({
        target: target,
        performance: performance,
        percent: performance == 0 || target == 0 ? 0 : percent,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      if (filters.frdt != null) {
        setFilters((prev) => ({
          ...prev,
          isSearch: false,
        }));
      } else {
        alert(findMessage(messagesData, "SA_B2226W_001"));
      }
      fetchMainGrid();
    }
  }, [filters, permissions, customOptionData]);

  const [ItemList, setItemList] = useState<any>([]);

  const [ChartList, setChartList] = useState<any>([]);

  const [AllPanel, setAllPanel] = useState({
    month_count: 0,
    month_amt: 0,
    year_count: 0,
    year_amt: 0,
    change_count: 0,
    change_amt_past: 0,
    change_amt: 0,
    total_amt: 0,
  });
  const [stackItemLabel, setStackItemLabel] = useState<any[]>([]);
  const [stackChartLabel, setStackChartLabel] = useState<any[]>([]);
  const [stackChartAllLabel, setStackChartAllLabel] = useState<any[]>([]);
  const [doughnut, setDoughnut] = useState({
    target: 0,
    performance: 0,
    percent: 0,
  });

  const startContent = (
    <React.Fragment>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={12} xl={12}>
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
      </Grid>
    </React.Fragment>
  );

  const cardOption = [
    {
      title: convertDateToStr(new Date()).substring(4, 6) + "월 계약금액",
      data: AllPanel.month_amt != null ? Math.round(AllPanel.month_amt) : 0,
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 계약금액",
      data: AllPanel.year_amt != null ? Math.round(AllPanel.year_amt) : 0,
    },
    {
      title:
        (
          parseInt(convertDateToStr(filters.frdt).substring(0, 4)) - 1
        ).toString() + "년 변경계약금액",
      data:
        AllPanel.change_amt_past != null
          ? Math.round(AllPanel.change_amt_past)
          : 0,
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 변경계약금액",
      data: AllPanel.change_amt != null ? Math.round(AllPanel.change_amt) : 0,
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 최종계약금액",
      data: AllPanel.total_amt != null ? Math.round(AllPanel.total_amt) : 0,
    },
  ];

  const cardOption2 = [
    {
      title: convertDateToStr(new Date()).substring(4, 6) + "월 계약 수",
      data: AllPanel.month_count != null ? AllPanel.month_count : 0,
      backgroundColor: theme.palette.primary.dark,
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 계약 수",
      data: AllPanel.year_count != null ? AllPanel.year_count : 0,
      backgroundColor: theme.palette.primary.light,
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 변경계약 수",
      data: AllPanel.change_count != null ? AllPanel.change_count : 0,
      backgroundColor: theme.palette.primary.dark,
    },
  ];

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
            disabled={permissions.view ? false : true}
          />
        </ButtonContainer>
      )}
    </React.Fragment>
  );

  return (
    <>
      <div
        style={{
          fontFamily: "TheJamsil5Bold",
          height: isMobile ? mobileheight : webheight,
        }}
        className="MUI"
      >
        <ThemeProvider theme={theme}>
          <TitleContainer style={{ paddingTop: "25px", paddingBottom: "25px" }}>
            <Title>종합실적 DASHBOARD</Title>
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
                  disabled={permissions.view ? false : true}
                  className="mr-2"
                />
              </ButtonContainer>
            ) : (
              ""
            )}
          </TitleContainer>
          <Toolbar start={startContent} end={endContent} />
          <Divider />
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={12} lg={9} xl={9}>
                <CardMui>
                  <CardContentMui>
                    <GridTitle
                      title={
                        convertDateToStr(filters.frdt).substring(0, 4) +
                        "년도 실적 현황"
                      }
                    />
                    <Grid container spacing={2}>
                      {cardOption.map((item) => (
                        <Grid item xs={12} sm={6} md={4} lg={4} xl={2.4}>
                          <Card
                            title={item.title}
                            data={numberWithCommas3(item.data) + "천원"}
                            backgroundColor={theme.palette.primary.dark}
                            fontsize={"2.3rem"}
                            titlefontsize={"1rem"}
                            form={"SA_B2226W"}
                            height={"140px"}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <Grid container spacing={2}>
                      {cardOption2.map((item) => (
                        <Grid item xs={12} sm={6} md={4} lg={4} xl={2.4}>
                          <Card
                            title={item.title}
                            data={item.data + "건"}
                            backgroundColor={"#D3D3D3"}
                            fontsize={"2rem"}
                            titlefontsize={"1rem"}
                            color={"black"}
                            height={"120px"}
                            form={"SA_B2226W"}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContentMui>
                </CardMui>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={3} xl={3}>
                <CardMui>
                  <CardContentMui>
                    <GridTitle
                      title={
                        convertDateToStr(filters.frdt).substring(0, 4) +
                        "년도 목표 현황"
                      }
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={6} lg={12} xl={6}>
                        <Card
                          title={"목표 금액"}
                          titlefontsize={"1rem"}
                          data={Math.round(doughnut.target) + "천원"}
                          backgroundColor={theme.palette.primary.main}
                          fontsize={"1.5rem"}
                          form={"SA_B2226W"}
                          height={"100px"}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} lg={12} xl={6}>
                        <Card
                          title={"실적 금액"}
                          titlefontsize={"1rem"}
                          data={Math.round(doughnut.performance) + "천원"}
                          backgroundColor={theme.palette.primary.main}
                          fontsize={"1.5rem"}
                          form={"SA_B2226W"}
                          height={"100px"}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        xl={12}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          padding: "5px",
                        }}
                      >
                        <Knob
                          value={
                            doughnut.percent > 100 ? 100 : doughnut.percent
                          }
                          size={deviceWidth < 1200 ? 250 : 160}
                          valueTemplate={`${Math.round(doughnut.percent)}%`}
                          valueColor={theme.palette.primary.dark}
                          rangeColor={theme.palette.secondary.main}
                          readOnly
                          strokeWidth={10}
                        />
                      </Grid>
                    </Grid>
                  </CardContentMui>
                </CardMui>
              </Grid>
            </Grid>
          </Box>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
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
                color={["#1d7cef", "#f8a73a", "#00b050"]}
                alllabel={stackChartAllLabel}
                label={stackChartLabel}
                random={false}
              />
              <Typography variant="body2" style={{ textAlign: "right" }}>
                (단위 : 천원)
              </Typography>
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
              <DoubleChart
                data={ItemList}
                value={["past_year", "current_year"]}
                label={["직전년도 계약금액", "당해년도 계약금액"]}
                alllabel={stackItemLabel}
                color={[
                  theme.palette.primary.light,
                  theme.palette.primary.dark,
                ]}
                name="past_year"
                colorName={colorName}
                borderColor={theme.palette.primary.dark}
              />
              <Typography variant="body2" style={{ textAlign: "right" }}>
                (단위 : 천원)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={8.5} xl={8.5}>
              <PaginatorTable
                value={ItemList}
                column={{
                  testpart: "시험파트",
                  teststs: "시험계",
                  cnt: "시험건수",
                  past_year: "직전년도 계약금액",
                  current_year: "당해년도 계약금액",
                }}
                title={"목록"}
                width={[120, 120, 100, 100, 100]}
                key="num"
                numberCell={["cnt", "past_year", "current_year"]}
                selection={selected}
                onSelectionChange={(e: any) => {
                  setSelected(e.value);
                }}
                height={"350px"}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={3.5} xl={3.5}>
              <MultiDoughnutChart
                data={ItemList}
                option={"current_year"}
                label={stackItemLabel}
                random={true}
                colorName={colorName}
              />
            </Grid>
          </Grid>
        </ThemeProvider>
      </div>
    </>
  );
};

export default SA_B2226W;
