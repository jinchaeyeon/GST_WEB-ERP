import Grid from "@mui/material/Grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import {
  UseGetValueFromSessionItem,
  UsePermissions,
  getDeviceHeight,
  getMenuName,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE } from "../components/CommonString";
import BarChart from "../components/KPIcomponents/Chart/BarChart";
import Table from "../components/KPIcomponents/Table/Table";
import ClusterMap from "../components/Map/ClusterMap";
import { useApi } from "../hooks/api";
import { colors, colorsName, isLoading } from "../store/atoms";
import { TPermissions } from "../store/types";

const SA_B2227W: React.FC = () => {
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
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    isSearch: true,
  });

  const parameters = {
    procedureName: "P_SA_B2227W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "CHART",
      "@p_orgdiv": filters.orgdiv,
    },
  };

  const parameters2 = {
    procedureName: "P_SA_B2227W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
    },
  };

  const parameters3 = {
    procedureName: "P_SA_B2227W_Q",
    pageNumber: 1,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "MAP",
      "@p_orgdiv": filters.orgdiv,
    },
  };

  const [ChartList, setChartList] = useState([]);
  const [ChartList2, setChartList2] = useState([]);
  const [ChartList3, setChartList3] = useState([]);
  const [ChartList4, setChartList4] = useState([]);

  const [Column1, setColumn1] = useState([]);
  const [Column2, setColumn2] = useState([]);
  const [GridList1, setGridList1] = useState([]);
  const [GridList2, setGridList2] = useState([]);

  const [Map, setMap] = useState([]);

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
      const rows2 = data.tables[1].Rows;
      const rows3 = data.tables[2].Rows;
      const rows4 = data.tables[3].Rows;

      setChartList(rows);
      setChartList2(rows2);
      setChartList3(rows3);
      setChartList4(rows4);
    }
    setLoading(false);
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  function getArray(obj: any) {
    if (obj.length != 0) {
      if (obj[0].length != 0) {
        for (let key in obj[0]) {
          /* 키/값 출력 */
          if (obj[0][key] == null) {
            delete obj[0][key];
          }
        }
      }
    }

    return obj;
  }

  const fetchMainGrid2 = async () => {
    if (!permissions.view) return;
    setLoading(true);
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      const rows2 = data.tables[1].Rows;
      const rows3 = data.tables[2].Rows;
      const rows4 = data.tables[3].Rows;

      setColumn1(getArray(rows));
      setGridList1(getArray(rows2));
      setColumn2(getArray(rows3));
      setGridList2(getArray(rows4));
    }
    setLoading(false);
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  const fetchMainGrid3 = async () => {
    if (!permissions.view) return;
    setLoading(true);
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;

      setMap(rows);
    }
    setLoading(false);
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  useEffect(() => {
    if (filters.isSearch && permissions.view) {
      setFilters((prev) => ({
        ...prev,
        isSearch: false,
      }));
      fetchMainGrid();
      fetchMainGrid2();
      fetchMainGrid3();
    }
  }, [filters, permissions]);

  function getWidth(arr: any) {
    let array = [];

    if (arr.length != 0) {
      for (var i = 0; i < Object.keys(arr[0]).length; i++) {
        array.push(100);
      }
    }

    return array;
  }

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
          <TitleContainer className="TitleContainer">
            <Title>{getMenuName()}</Title>
          </TitleContainer>
          <GridContainerWrap>
            <GridContainer width="40%">
              <GridContainer>
                <ClusterMap data={Map} />
              </GridContainer>
              <GridContainer style={{ paddingTop: "15px" }}>
                <GridTitleContainer>
                  <GridTitle>지역별 고객사 집계</GridTitle>
                </GridTitleContainer>
                <Table
                  value={GridList1}
                  column={Column1.length == 0 ? [] : Column1[0]}
                  width={getWidth(Column1)}
                />
              </GridContainer>
              <GridContainer style={{ paddingTop: "15px" }}>
                <GridTitleContainer>
                  <GridTitle>국가별 고객사 집계</GridTitle>
                </GridTitleContainer>
                <Table
                  value={GridList2}
                  column={Column2.length == 0 ? [] : Column2[0]}
                  width={getWidth(Column2)}
                />
              </GridContainer>
            </GridContainer>
            <GridContainer width={`calc(60% - ${GAP}px)`}>
              <Grid container spacing={2}>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={6}
                  xl={6}
                  style={{ paddingBottom: "10px" }}
                >
                  <GridTitle>개발분야별 고객현황</GridTitle>
                  <BarChart
                    props={ChartList}
                    value="value"
                    alllabel={ChartList.map((item: any) => item.name)}
                    name="name"
                    random={true}
                    colorName={colorName}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={6}
                  xl={6}
                  style={{ paddingBottom: "10px" }}
                >
                  <GridTitle>기업구분별 고객현황</GridTitle>
                  <BarChart
                    props={ChartList2}
                    value="value"
                    alllabel={ChartList2.map((item: any) => item.name)}
                    name="name"
                    random={true}
                    colorName={colorName}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={6}
                  xl={6}
                  style={{ paddingBottom: "10px" }}
                >
                  <GridTitle>신규 고객현황</GridTitle>
                  <BarChart
                    props={ChartList3}
                    value="value"
                    alllabel={ChartList3.map((item: any) => item.name)}
                    name="name"
                    random={true}
                    colorName={colorName}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={6}
                  xl={6}
                  style={{ paddingBottom: "10px" }}
                >
                  <GridTitle>거래기준별 고객현황</GridTitle>
                  <BarChart
                    props={ChartList4}
                    value="value"
                    alllabel={ChartList4.map((item: any) => item.name)}
                    name="name"
                    random={true}
                    colorName={colorName}
                  />
                </Grid>
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </ThemeProvider>
      </div>
    </>
  );
};

export default SA_B2227W;
