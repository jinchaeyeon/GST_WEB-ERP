import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Title, TitleContainer } from "../CommonStyled";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getDeviceHeight,
  getMenuName,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import LineBarChart from "../components/KPIcomponents/Chart/LineBarChart";
import MultiChart from "../components/KPIcomponents/Chart/MultiChart";
import PaginatorTable from "../components/KPIcomponents/Table/PaginatorTable";
import GridTitle from "../components/KPIcomponents/Title/Title";
import { useApi } from "../hooks/api";
import { colors, colorsName, isLoading } from "../store/atoms";
import { TPermissions } from "../store/types";

const SA_B2216W: React.FC = () => {
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

  //폼 메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
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
        mm: setDefaultDate(customOptionData, "mm"),
        isSearch: true,
      }));
    }
  }, [customOptionData]);

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

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    mm: new Date(),
    isSearch: false,
  });

  //조회조건 파라미터
  const parameters = {
    procedureName: "P_SA_B2216W_Q",
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
    procedureName: "P_SA_B2216W_Q",
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
    procedureName: "P_SA_B2216W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q3",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
      "@p_mm": convertDateToStr(filters.mm).substring(4, 6),
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
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        value: Math.round(item.value),
      }));

      setChartList(rows);

      let array = rows
        .filter(
          (item: { series: any }) =>
            item.series ==
            rows.filter(
              (arr: { series: any }, index: any, callback: any[]) =>
                index == callback.findIndex((t) => t.series == arr.series)
            )[0].series
        )
        .map((items: { argument: any }) => {
          return items.argument;
        });

      let array2 = rows
        .filter(
          (arr: { series: any }, index: any, callback: any[]) =>
            index == callback.findIndex((t) => t.series == arr.series)
        )
        .map((item: { series: any }) => {
          return item.series;
        });
      setStackChartLabel(array2);
      setStackChartAllLabel(array);
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

      setBarData(rows2);
      let array = rows2
        .filter(
          (item: { date: any }) =>
            item.date ==
            rows2.filter(
              (arr: { date: any }, index: any, callback: any[]) =>
                index == callback.findIndex((t) => t.date == arr.date)
            )[0].date
        )
        .map((items: { series: any }) => {
          return items.series;
        });

      let array2 = rows2
        .filter(
          (arr: { date: any }, index: any, callback: any[]) =>
            index == callback.findIndex((t) => t.date == arr.date)
        )
        .map((item: { date: any }) => {
          return item.date;
        });
      setStackChartLabel2(array2);
      setStackChartAllLabel2(array);
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
      }));

      setUserList(rows3);
      setSelected(rows3[0]);
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
        fetchMainGrid();
      } else {
        alert(findMessage(messagesData, "SA_B2216W_001"));
      }
      if (filters.mm != null) {
        setFilters((prev) => ({
          ...prev,
          isSearch: false,
        }));
        fetchMainGrid();
      } else {
        alert(findMessage(messagesData, "SA_B2216W_002"));
      }
    }
  }, [filters, permissions, customOptionData]);

  const [UserList, setUserList] = useState<any[]>([]);

  const [BarData, setBarData] = useState([]);

  const [ChartList, setChartList] = useState([]);

  const [stackChartLabel, setStackChartLabel] = useState<any[]>([]);

  const [stackChartLabel2, setStackChartLabel2] = useState<any[]>([]);

  const [stackChartAllLabel, setStackChartAllLabel] = useState<any[]>([]);

  const [stackChartAllLabel2, setStackChartAllLabel2] = useState<any[]>([]);

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
                isSearch: true,
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
                isSearch: true,
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
      <div
        style={{
          fontFamily: "TheJamsil5Bold",
          height: isMobile ? mobileheight : webheight,
        }}
        className="MUI"
      >
        <ThemeProvider theme={theme}>
          <TitleContainer style={{ paddingTop: "25px", paddingBottom: "25px" }}>
            <Title>{getMenuName()}</Title>
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
              <Typography variant="body2" style={{ textAlign: "right" }}>
                (단위 : 천원)
              </Typography>
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
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <PaginatorTable
                value={UserList}
                column={{
                  user_name: "구분",
                  cnt1: "담당프로젝트 수",
                  cnt2: "상담",
                  cnt3: "컨설팅",
                  cnt4: "견적",
                  cnt5: "계약",
                }}
                title={
                  convertDateToStr(filters.frdt).substring(0, 4) +
                  "년도 개인별 활동 현황"
                }
                numberCell={["cnt1", "cnt2", "cnt3", "cnt4", "cnt5"]}
                width={[120, 100, 100, 100, 100, 100]}
                key="num"
                selection={selected}
                onSelectionChange={(e: any) => {
                  setSelected(e.value);
                }}
              />
            </Grid>
          </Grid>
        </ThemeProvider>
      </div>
    </>
  );
};

export default SA_B2216W;
