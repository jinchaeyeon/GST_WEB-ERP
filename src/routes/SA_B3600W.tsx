import { Container } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { DropdownChangeEvent } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import {
  UseCustomOption,
  convertDateToStr,
  setDefaultDate,
} from "../components/CommonFunction";
import DatePicker from "../components/KPIcomponents/Calendar/DatePicker";
import Card from "../components/KPIcomponents/Card/CardBox";
import DoughnutChart from "../components/KPIcomponents/Chart/DoughnutChart";
import StackedChart from "../components/KPIcomponents/Chart/StackedChart";
import ComboBox from "../components/KPIcomponents/ComboBox/ComboBox";
import Radio from "../components/KPIcomponents/Radio/Radio";
import PaginatorTable from "../components/KPIcomponents/Table/PaginatorTable";
import Table from "../components/KPIcomponents/Table/Table";
import GridTitle from "../components/KPIcomponents/Title/Title";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import SpecialDial from "../components/KPIcomponents/SpecialDial/SpecialDial";

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

const SA_B3600W: React.FC = () => {
  const theme = createTheme();
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const pathname: string = window.location.pathname.replace("/", "");

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

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        dtgb: defaultOption.find((item: any) => item.id === "dtgb").valueCode,
        dtdiv: defaultOption.find((item: any) => item.id === "dtdiv").valueCode,
      }));
    }
  }, [customOptionData]);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: 20,
    orgdiv: "01",
    location: "01",
    frdt: new Date(),
    todt: new Date(),
    dtdiv: "W",
    dtgb: "A",
    isSearch: true,
  });
  const [mainPgNum, setMainPgNum] = useState(1);
  const [AllList, setAllList] = useState();
  const [ChartList, setChartList] = useState();
  const [AllPanel, setAllPanel] = useState({
    badcnt: 0,
    cancel_percent: 0,
    confirm_percent: 0,
    okcnt: 0,
    totcnt: 0,
  });
  const [stackChartLabel, setStackChartLabel] = useState();
  const [stackChartAllLabel, setStackChartAllLabel] = useState();
  const [toppercentData, setTopPercentCust] = useState();
  const [topdelayData, setTopDelayCust] = useState();
  const [selected, setSelected] = useState<TList | null>(null);

  //조회조건 파라미터
  const parameters = {
    procedureName: "P_SA_B3600W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_dtdiv": filters.dtdiv,
      "@p_dtgb": filters.dtgb,
      "@p_custcd": "",
    },
  };

  const Rankparameters = {
    procedureName: "P_SA_B3600W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "RANK1",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_dtdiv": filters.dtdiv,
      "@p_dtgb": filters.dtgb,
      "@p_custcd": "",
    },
  };

  const Rankparameters2 = {
    procedureName: "P_SA_B3600W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "RANK2",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_dtdiv": filters.dtdiv,
      "@p_dtgb": filters.dtgb,
      "@p_custcd": "",
    },
  };

  const ALLparameters = {
    procedureName: "P_SA_B3600W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "ALLCURRENT",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_dtdiv": filters.dtdiv,
      "@p_dtgb": filters.dtgb,
      "@p_custcd": "",
    },
  };

  const chartparameters = {
    procedureName: "P_SA_B3600W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "MONTHCUSTCHART",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_dtdiv": filters.dtdiv,
      "@p_dtgb": filters.dtgb,
      "@p_custcd": selected == null ? "" : selected.custcd,
    },
  };

  const fetchMainGrid = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows.map(
        (item: { okcnt: number; totcnt: number }) => ({
          ...item,
          percent: Math.round((item.okcnt / item.totcnt) * 100) + "%",
        })
      );

      setAllList(rows);
      if (rows.length > 0) {
        setSelected(rows[0]);
      } else {
        setSelected((item) => ({
          ...item,
          okcnt: 0,
          badcnt: 0,
        }));
      }
    }

    let data2: any;
    try {
      data2 = await processApi<any>("procedure", Rankparameters);
    } catch (error) {
      data2 = null;
    }

    if (data2.isSuccess === true) {
      const rows = data2.tables[0].Rows.map(
        (item: { okcnt: number; totcnt: number }) => ({
          ...item,
          percent: Math.round((item.okcnt / item.totcnt) * 100) + "%",
        })
      );

      setTopPercentCust(rows);
    }

    let data3: any;
    try {
      data3 = await processApi<any>("procedure", Rankparameters2);
    } catch (error) {
      data3 = null;
    }

    if (data3.isSuccess === true) {
      const rows = data3.tables[0].Rows.map(
        (item: { okcnt: number; totcnt: number }) => ({
          ...item,
          percent: Math.round((item.okcnt / item.totcnt) * 100),
        })
      );

      setTopDelayCust(rows);
    }

    let data4: any;
    try {
      data4 = await processApi<any>("procedure", ALLparameters);
    } catch (error) {
      data4 = null;
    }

    if (data4.isSuccess === true) {
      const rows = data4.tables[0].Rows;

      setAllPanel(rows[0]);
    }
    setLoading(false);
  };

  const fetchChartGrid = async () => {
    let data: any;
    try {
      data = await processApi<any>("procedure", chartparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

        setChartList(rows);

        let objects = rows.filter(
          (arr: { series: any }, index: any, callback: any[]) =>
            index === callback.findIndex((t) => t.series === arr.series)
        );
        setStackChartLabel(
          objects.map((item: { series: any }) => {
            return item.series;
          })
        );
        setStackChartAllLabel(
          rows
            .filter((item: { series: any }) => item.series == objects[0].series)
            .map((items: { argument: any }) => {
              return items.argument;
            })
        );
    }
  };

  useEffect(() => {
    if (filters.isSearch && customOptionData != null) {
      setFilters((prev) => ({
        ...prev,
        isSearch: false,
      }));
      fetchMainGrid();
      fetchChartGrid();
    }
  }, [filters]);

  useEffect(() => {
    fetchChartGrid();
  }, [selected]);

  const startContent = (
    <React.Fragment>
      <Grid container spacing={2}>
        {customOptionData !== null && (
          <ComboBox
            value={filters.dtgb}
            onChange={(e: DropdownChangeEvent) =>
              setFilters((prev) => ({
                ...prev,
                dtgb: e.value == undefined ? "" : e.value.code,
              }))
            }
            option={customOptionData}
            placeholder={"일자"}
            id="dtgb"
            textField="name"
            valueField="code"
            xs={12}
            sm={4}
            md={4}
            lg={2}
            xl={2}
          />
        )}
        <DatePicker
          frdt={filters.frdt}
          todt={filters.todt}
          onFrdtChange={(e: { value: any }) =>
            setFilters((prev) => ({
              ...prev,
              frdt: e.value,
            }))
          }
          onTodtChange={(e: { value: any }) =>
            setFilters((prev) => ({
              ...prev,
              todt: e.value,
            }))
          }
          xs={12}
          sm={8}
          md={6}
          lg={4}
          xl={4}
        />
        {customOptionData !== null && (
          <ComboBox
            value={filters.location}
            onChange={(e: DropdownChangeEvent) =>
              setFilters((prev) => ({
                ...prev,
                location: e.value == undefined ? "" : e.value.sub_code,
              }))
            }
            option={customOptionData}
            placeholder={"사업장"}
            id="location"
            xs={12}
            sm={4}
            md={4}
            lg={2}
            xl={2}
          />
        )}
        {customOptionData !== null && (
          <Radio
            option={customOptionData}
            title="일자구분"
            id="dtdiv"
            value={filters.dtdiv}
            onChange={(e: { value: any }) =>
              setFilters((prev) => ({
                ...prev,
                dtdiv: e.value,
              }))
            }
            xs={12}
            sm={8}
            md={6}
            lg={4}
            xl={4}
          />
        )}
      </Grid>
    </React.Fragment>
  );

  const cardOption = [
    {
      title: "납기준수율",
      data:
        AllPanel.confirm_percent != null
          ? AllPanel.confirm_percent + "%"
          : 0 + "%",
      backgroundColor: "#1976d2",
    },
    {
      title: "총 준수건수",
      data: AllPanel.okcnt != null ? AllPanel.okcnt + "건" : 0 + "건",
      backgroundColor: "#5393d3",
    },
    {
      title: "총 지연건수",
      data: AllPanel.badcnt != null ? AllPanel.badcnt + "건" : 0 + "건",
      backgroundColor: "#94b6d7",
    },
    {
      title: "총 건수",
      data: AllPanel.totcnt != null ? AllPanel.totcnt + "건" : 0 + "건",
      backgroundColor: "#b4c4d3",
    },
  ];

  return (
    <>
      <ThemeProvider theme={theme}>
        <Container
          maxWidth="xl"
          style={{ width: "100%"}}
        >
          <TitleContainer style={{ paddingTop: "25px", paddingBottom: "25px" }}>
            <Title>납기준수율</Title>
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
                <Grid item xs={6} sm={6} md={6} lg={3} xl={3}>
                  <Card
                    title={item.title}
                    data={item.data}
                    backgroundColor={item.backgroundColor}
                    fontsize={size.width < 600 ? "1.8rem" : "3.3rem"}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <Table
                value={toppercentData}
                column={{
                  custcd: "업체코드",
                  custnm: "업체명",
                  okcnt: "준수건수",
                  totcnt: "총건수",
                  percent: "준수율",
                }}
                width={[
                  150, 160, 150, 130, 130
                ]}
                title={"준수율 TOP5"}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <Table
                value={topdelayData}
                column={{
                  custcd: "업체코드",
                  custnm: "업체명",
                  badcnt: "지연건수",
                  totcnt: "총건수",
                  rate: "준수율",
                }}
                width={[
                  150, 160, 150, 130, 130
                ]}
                title={"지연건수 TOP5"}
              />
            </Grid>
          </Grid>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <GridTitle title="업체 준수율 월별 그래프" />
              <StackedChart
                props={ChartList}
                value="value"
                name="series"
                color={["#1976d2", "#FF0000"]}
                alllabel={stackChartAllLabel}
                label={stackChartLabel}
                random={false}
              />
            </Grid>
          </Grid>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={7} xl={9}>
              <PaginatorTable
                value={AllList}
                column={{
                  custcd: "업체코드",
                  custnm: "업체명",
                  okcnt: "준수건수",
                  badcnt: "지연건수",
                  totcnt: "총건수",
                  percent: "준수율",
                }}
                title={"전체 목록"}
                width={[
                  190, 210, 180, 180, 170, 170
                ]}
                key="num"
                selection={selected}
                onSelectionChange={(e: any) => {
                  setSelected(e.value);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={5} xl={3}>
              <GridTitle title="업체 건수 그래프" />
              <DoughnutChart
                data={selected}
                option={["okcnt", "badcnt"]}
                label={["준수건수", "지연건수"]}
              />
            </Grid>
          </Grid>
        </Container>
        <SpecialDial />
      </ThemeProvider>
    </>
  );
};

export default SA_B3600W;
