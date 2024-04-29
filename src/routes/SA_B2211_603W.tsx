import { Grid } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "hammerjs";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  GridTitle,
  Title,
  TitleContainer,
} from "../CommonStyled";
import { GetPropertyValueByName, UseCustomOption, UseMessages, UsePermissions, convertDateToStr, findMessage, setDefaultDate } from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import LineBarChart from "../components/KPIcomponents/Chart/LineBarChart";
import MultiDoughnutChart from "../components/KPIcomponents/Chart/MultiDoughnutChart";
import SpecialDial from "../components/KPIcomponents/SpecialDial/SpecialDial";
import ScrollTable from "../components/KPIcomponents/Table/ScrollTable";
import { useApi } from "../hooks/api";
import { colors, colorsName, isLoading } from "../store/atoms";
import { TPermissions } from "../store/types";

const SA_B2211_603W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [color, setColor] = useRecoilState(colors);
  const [colorName, setColorName] = useRecoilState(colorsName);
  useEffect(() => {}, [color]);
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const search = () => {};
  
  //폼 메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("SA_B2211_603W", setMessagesData);
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SA_B2211_603W", setCustomOptionData);
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
  
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
      }));
    }
  }, [customOptionData]);
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
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    frdt: new Date(),
    isSearch: true,
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
  const [ChartList, setChartList] = useState([]);
  const [ChartList2, setChartList2] = useState([]);
  const [ChartList3, setChartList3] = useState([]);

  const [stackChartLabel, setStackChartLabel] = useState<any[]>([]);
  const [stackChartLabel2, setStackChartLabel2] = useState<any[]>([]);
  const [stackChartLabel3, setStackChartLabel3] = useState<any[]>([]);

  const [stackChartAllLabel, setStackChartAllLabel] = useState<any[]>([]);
  const [stackChartAllLabel2, setStackChartAllLabel2] = useState<any[]>([]);
  const [stackChartAllLabel3, setStackChartAllLabel3] = useState<any[]>([]);

  const [ItemList, setItemList] = useState<any>([]);
  const [ItemList2, setItemList2] = useState<any>([]);
  const [ItemList3, setItemList3] = useState<any>([]);

  const [stackItemLabel, setStackItemLabel] = useState<any[]>([]);
  const [stackItemLabel2, setStackItemLabel2] = useState<any[]>([]);
  const [stackItemLabel3, setStackItemLabel3] = useState<any[]>([]);

  const [Column1, setColumn1] = useState([]);
  const [Column2, setColumn2] = useState([]);
  const [Column3, setColumn3] = useState([]);

  const [GridList1, setGridList1] = useState([]);
  const [GridList2, setGridList2] = useState([]);
  const [GridList3, setGridList3] = useState([]);

  useEffect(() => {
    if (filters.isSearch) {
      if (filters.frdt != null) {
        setFilters((prev) => ({
          ...prev,
          isSearch: false,
        }));
        fetchMainGrid();
      } else {
        alert(findMessage(messagesData, "SA_B2211_603W_001"));
      }
    }
  }, [filters]);

  //조회조건 파라미터
  const parameters = {
    procedureName: "P_SA_B2211_603W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "CUST_C",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
    },
  };

  //조회조건 파라미터
  const parameters2 = {
    procedureName: "P_SA_B2211_603W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "MATERIAL_C",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
    },
  };
  //조회조건 파라미터
  const parameters3 = {
    procedureName: "P_SA_B2211_603W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "COUNTRY_C",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
    },
  };
  //조회조건 파라미터
  const parameters4 = {
    procedureName: "P_SA_B2211_603W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "CUST_D",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
    },
  };
  //조회조건 파라미터
  const parameters5 = {
    procedureName: "P_SA_B2211_603W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "MATERIAL_D",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
    },
  };
  //조회조건 파라미터
  const parameters6 = {
    procedureName: "P_SA_B2211_603W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "COUNTRY_D",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.frdt).substring(0, 4),
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
    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
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
      let arrays: any = [
        {
          구분: "계약금액",
        },
        {
          구분: "계약수",
        },
      ];

      arrays.map((item: any) => {
        for (var i = 0; i < array.length; i++) {
          item[array[i]] = findvalue(rows, item["구분"], array[i]);
        }
      });

      let columnarray = rows
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
      columnarray.unshift("구분");
      setColumn1(columnarray);
      setGridList1(arrays);
    }

    let data2: any;
    try {
      data2 = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data2 = null;
    }
    if (data2.isSuccess == true) {
      const rows2 = data2.tables[0].Rows;
      setChartList2(rows2);
      let array3 = rows2
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

      let array4 = rows2
        .filter(
          (arr: { series: any }, index: any, callback: any[]) =>
            index == callback.findIndex((t) => t.series == arr.series)
        )
        .map((item: { series: any }) => {
          return item.series;
        });
      setStackChartLabel2(array4);
      setStackChartAllLabel2(array3);
      let arrays: any = [
        {
          구분: "계약금액",
        },
        {
          구분: "계약수",
        },
      ];

      arrays.map((item: any) => {
        for (var i = 0; i < array3.length; i++) {
          item[array3[i]] = findvalue(rows2, item["구분"], array3[i]);
        }
      });

      let columnarray = rows2
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
      columnarray.unshift("구분");
      setColumn2(columnarray);
      setGridList2(arrays);
    }

    let data3: any;
    try {
      data3 = await processApi<any>("procedure", parameters3);
    } catch (error) {
      data3 = null;
    }
    if (data3.isSuccess == true) {
      const rows3 = data3.tables[0].Rows;
      setChartList3(rows3);
      let array5 = rows3
        .filter(
          (item: { series: any }) =>
            item.series ==
            rows3.filter(
              (arr: { series: any }, index: any, callback: any[]) =>
                index == callback.findIndex((t) => t.series == arr.series)
            )[0].series
        )
        .map((items: { argument: any }) => {
          return items.argument;
        });

      let array6 = rows3
        .filter(
          (arr: { series: any }, index: any, callback: any[]) =>
            index == callback.findIndex((t) => t.series == arr.series)
        )
        .map((item: { series: any }) => {
          return item.series;
        });
      setStackChartLabel3(array6);
      setStackChartAllLabel3(array5);
      let arrays: any = [
        {
          구분: "계약금액",
        },
        {
          구분: "계약수",
        },
      ];

      arrays.map((item: any) => {
        for (var i = 0; i < array5.length; i++) {
          item[array5[i]] = findvalue(rows3, item["구분"], array5[i]);
        }
      });

      let columnarray = rows3
        .filter(
          (item: { series: any }) =>
            item.series ==
            rows3.filter(
              (arr: { series: any }, index: any, callback: any[]) =>
                index == callback.findIndex((t) => t.series == arr.series)
            )[0].series
        )
        .map((items: { argument: any }) => {
          return items.argument;
        });
      columnarray.unshift("구분");
      setColumn3(columnarray);
      setGridList3(arrays);
    }

    let data4: any;
    try {
      data4 = await processApi<any>("procedure", parameters4);
    } catch (error) {
      data4 = null;
    }

    if (data4.isSuccess == true) {
      const rows4 = data4.tables[0].Rows;

      setItemList(rows4);
      let array3 = rows4.map((item: any) => item.argument);
      setStackItemLabel(array3);
    }

    let data5: any;
    try {
      data5 = await processApi<any>("procedure", parameters5);
    } catch (error) {
      data5 = null;
    }

    if (data5.isSuccess == true) {
      const rows5 = data5.tables[0].Rows;

      setItemList2(rows5);
      let array3 = rows5.map((item: any) => item.argument);
      setStackItemLabel2(array3);
    }

    let data6: any;
    try {
      data6 = await processApi<any>("procedure", parameters6);
    } catch (error) {
      data6 = null;
    }

    if (data6.isSuccess == true) {
      const rows6 = data6.tables[0].Rows;

      setItemList3(rows6);
      let array3 = rows6.map((item: any) => item.argument);
      setStackItemLabel3(array3);
    }
    setLoading(false);
  };

  function getWidth(arr: any) {
    let array = [];
    if (arr.length != 0) {
      for (var i = 0; i < arr.length; i++) {
        array.push(100);
      }
    }

    return array;
  }

  function findvalue(arr: any, series: any, argument: any) {
    const datas = arr.filter(
      (item: any) => item.series == series && item.argument == argument
    );

    return datas[0] != undefined ? datas[0].value : 0;
  }

  return (
    <>
      <div style={{ fontFamily: "TheJamsil5Bold", marginBottom: "50px" }}>
        <ThemeProvider theme={theme}>
          <TitleContainer style={{ paddingTop: "25px", paddingBottom: "25px" }}>
            <Title>고객사별 실적 집계</Title>
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
            <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <GridTitle>고객분류별 실적집계</GridTitle>
                  <LineBarChart
                    props={ChartList}
                    value="value"
                    name="series"
                    color={["#ed7d31", "#809fd7"]}
                    alllabel={stackChartAllLabel}
                    label={stackChartLabel}
                    random={false}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <ScrollTable
                    value={GridList1}
                    column={Column1}
                    width={getWidth(Column1)}
                    numberCell={Column1.filter((item: any) => item != "구분")}
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
                  <div style={{ width: "70%" }}>
                    <MultiDoughnutChart
                      data={ItemList}
                      option={"value"}
                      label={stackItemLabel}
                      random={true}
                      colorName={colorName}
                    />
                  </div>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <GridTitle>물질분야별 실적집계</GridTitle>
                  <LineBarChart
                    props={ChartList2}
                    value="value"
                    name="series"
                    color={["#ed7d31", "#809fd7"]}
                    alllabel={stackChartAllLabel2}
                    label={stackChartLabel2}
                    random={false}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <ScrollTable
                    value={GridList2}
                    column={Column2.length == 0 ? [] : Column2}
                    width={getWidth(Column2)}
                    numberCell={Column2.filter((item: any) => item != "구분")}
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
                  <div style={{ width: "70%" }}>
                    <MultiDoughnutChart
                      data={ItemList2}
                      option={"value"}
                      label={stackItemLabel2}
                      random={true}
                      colorName={colorName}
                    />
                  </div>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <GridTitle>국내·외 실적집계</GridTitle>
                  <LineBarChart
                    props={ChartList3}
                    value="value"
                    name="series"
                    color={["#ed7d31", "#809fd7"]}
                    alllabel={stackChartAllLabel3}
                    label={stackChartLabel3}
                    random={false}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <ScrollTable
                    value={GridList3}
                    column={Column3.length == 0 ? [] : Column3}
                    width={getWidth(Column3)}
                    numberCell={Column3.filter((item: any) => item != "구분")}
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
                  <div style={{ width: "70%" }}>
                    <MultiDoughnutChart
                      data={ItemList3}
                      option={"value"}
                      label={stackItemLabel3}
                      random={true}
                      colorName={colorName}
                    />
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <SpecialDial />
        </ThemeProvider>
      </div>
    </>
  );
};

export default SA_B2211_603W;
