import React, { useEffect, useRef, useState } from "react";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import { useApi } from "../hooks/api";
import {
  convertDateToStr,
  setDefaultDate,
  UseCustomOption,
} from "../components/CommonFunction";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import { Toolbar } from "primereact/toolbar";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { Container } from "@mui/material";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ComboBox from "../components/KPIcomponents/ComboBox/ComboBox";
import DatePicker from "../components/KPIcomponents/Calendar/DatePicker";
import Radio from "../components/KPIcomponents/Radio/Radio";
import Card from "../components/KPIcomponents/Card/CardBox";
import Table from "../components/KPIcomponents/Table/Table";
import GridTitle from "../components/KPIcomponents/Title/Title";
import StackedChart from "../components/KPIcomponents/Chart/StackedChart";
import PaginatorTable from "../components/KPIcomponents/Table/PaginatorTable";
import DoughnutChart from "../components/KPIcomponents/Chart/DoughnutChart";
import { Toast } from "primereact/toast";
import Input from "../components/KPIcomponents/Input/Input";
import { DropdownChangeEvent } from "primereact/dropdown";
import LineChart from "../components/KPIcomponents/Chart/LineChart";

interface TList {
  badcnt: number;
  custcd: string;
  custnm: string;
  okcnt: number;
  percent: number;
  rate: number;
  totcnt: number;
}

interface Tsize {
  width: number;
  height: number;
}

const PR_B1700_498W: React.FC = () => {
  const theme = createTheme();
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const pathname: string = window.location.pathname.replace("/", "");
  const toast = useRef<Toast>(null);

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
        option: defaultOption.find((item: any) => item.id === "option")
          .valueCode,
        itemlvl1: defaultOption.find((item: any) => item.id === "itemlvl1")
          .valueCode,
        itemlvl2: defaultOption.find((item: any) => item.id === "itemlvl2")
          .valueCode,
        itemlvl3: defaultOption.find((item: any) => item.id === "itemlvl3")
          .valueCode,
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
    option: "I",
    itemcd: "",
    itemnm: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
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

      if (rows.length > 0) {
        setAllList(rows);
        setSelected(rows[0]);
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

      if (rows.length > 0) {
        setTopPercentCust(rows);
      }
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

      if (rows.length > 0) {
        setTopDelayCust(rows);
      }
    }

    let data4: any;
    try {
      data4 = await processApi<any>("procedure", ALLparameters);
    } catch (error) {
      data4 = null;
    }

    if (data4.isSuccess === true) {
      const rows = data4.tables[0].Rows;

      if (rows.length > 0) {
        setAllPanel(rows[0]);
      }
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

      if (rows.length > 0) {
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
    }
  };

  useEffect(() => {
    if (filters.isSearch && customOptionData != null) {
      setFilters((prev) => ({
        ...prev,
        isSearch: false,
      }));
      fetchMainGrid();
    }
  }, [filters]);

  useEffect(() => {
    fetchChartGrid();
  }, [selected]);

  const startContent = (
    <React.Fragment>
      <Grid container spacing={2}>
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
          sm={12}
          md={8}
          lg={6}
          xl={4}
        />
        {customOptionData !== null && (
          <Radio
            option={customOptionData}
            title="옵션"
            id="option"
            value={filters.option}
            onChange={(e: { value: any }) =>
              setFilters((prev) => ({
                ...prev,
                option: e.value,
              }))
            }
            xs={12}
            sm={12}
            md={12}
            lg={6}
            xl={8}
          />
        )}
        <Input
          value={filters.itemcd}
          onChange={(e: { target: { value: any } }) =>
            setFilters((prev) => ({
              ...prev,
              itemcd: e.target.value,
            }))
          }
          xs={12}
          sm={6}
          md={5}
          lg={3}
          xl={2}
          label={"품목코드"}
        />
        <Input
          value={filters.itemnm}
          onChange={(e: { target: { value: any } }) =>
            setFilters((prev) => ({
              ...prev,
              itemnm: e.target.value,
            }))
          }
          xs={12}
          sm={6}
          md={5}
          lg={3}
          xl={2}
          label={"품목명"}
        />
        {customOptionData !== null && (
          <ComboBox
            value={filters.itemlvl1}
            onChange={(e: DropdownChangeEvent) =>
              setFilters((prev) => ({
                ...prev,
                itemlvl1: e.value.sub_code,
              }))
            }
            option={customOptionData}
            placeholder={"대분류"}
            id="itemlvl1"
            xs={12}
            sm={4}
            md={3}
            lg={2}
            xl={2}
          />
        )}
        {customOptionData !== null && (
          <ComboBox
            value={filters.itemlvl2}
            onChange={(e: DropdownChangeEvent) =>
              setFilters((prev) => ({
                ...prev,
                itemlvl2: e.value.sub_code,
              }))
            }
            option={customOptionData}
            placeholder={"중분류"}
            id="itemlvl2"
            xs={12}
            sm={4}
            md={3}
            lg={2}
            xl={2}
          />
        )}
        {customOptionData !== null && (
          <ComboBox
            value={filters.itemlvl3}
            onChange={(e: DropdownChangeEvent) =>
              setFilters((prev) => ({
                ...prev,
                itemlvl3: e.value.sub_code,
              }))
            }
            option={customOptionData}
            placeholder={"소분류"}
            id="itemlvl3"
            xs={12}
            sm={4}
            md={3}
            lg={2}
            xl={2}
          />
        )}
      </Grid>
    </React.Fragment>
  );

  const cardOption = [
    {
      title: "평균 시간당 생산량",
      data:
        AllPanel.confirm_percent != null
          ? AllPanel.confirm_percent + "%"
          : 0 + "%",
      backgroundColor: "#1976d2",
    },
    {
      title: "총 생산량",
      data: AllPanel.okcnt != null ? AllPanel.okcnt + "건" : 0 + "건",
      backgroundColor: "#5393d3",
    },
    {
      title: "총 작업시간",
      data: AllPanel.badcnt != null ? AllPanel.badcnt + "건" : 0 + "건",
      backgroundColor: "#94b6d7",
    },
  ];

  return (
    <>
      <ThemeProvider theme={theme}>
        <Container
          maxWidth="xl"
          style={{ width: "100%", marginBottom: "25px" }}
        >
          <TitleContainer style={{ paddingTop: "25px", paddingBottom: "25px" }}>
            <Toast ref={toast} position="top-center" />
            <Title>시간당 생산량</Title>
            <ButtonContainer>
              <Button
                icon="pi pi-search"
                onClick={() => {
                  var diffTime =
                    (filters.todt.getTime() - filters.frdt.getTime()) /
                    (1000 * 60 * 60 * 24);

                  if (diffTime > 31) {
                    toast.current?.show({
                      severity: "error",
                      summary: "Error",
                      detail: "기간을 31일 내로 설정해주세요.",
                      life: 3000,
                    });
                  } else {
                    setFilters((prev) => ({
                      ...prev,
                      isSearch: true,
                    }));
                  }
                }}
                className="mr-2"
              />
            </ButtonContainer>
          </TitleContainer>
          <Toolbar start={startContent} />
          <Divider />
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              {cardOption.map((item) => (
                <Grid item xs={12} sm={12} md={12} lg={4} xl={4}>
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
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <GridTitle title="일자별 시간당 생산량" />
              {/* <LineChart props={MonthData} /> */}
            </Grid>
          </Grid>
          {/* <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6} xl={6}>
              <Table
                value={toppercentData}
                column={{
                  custcd: "업체코드",
                  custnm: "업체명",
                  okcnt: "준수건수",
                  totcnt: "총건수",
                  percent: "준수율",
                }}
                title={"전체목록"}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} xl={6}>
              <Table
                value={topdelayData}
                column={{
                  custcd: "업체코드",
                  custnm: "업체명",
                  badcnt: "지연건수",
                  totcnt: "총건수",
                  rate: "준수율",
                }}
                title={"상세목록"}
              />
            </Grid>
          </Grid> */}
        </Container>
      </ThemeProvider>
    </>
  );
};

export default PR_B1700_498W;
