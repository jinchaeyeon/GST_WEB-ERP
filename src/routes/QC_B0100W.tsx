import React, { useCallback, useEffect, useState } from "react";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import { useApi } from "../hooks/api";
import {
  convertDateToStr,
  getQueryFromBizComponent,
  setDefaultDate,
  UseBizComponent,
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
import GroupTable from "../components/KPIcomponents/Table/GroupTable";
import LineChart from "../components/KPIcomponents/Chart/LineChart";
import { COM_CODE_DEFAULT_VALUE } from "../components/CommonString";
import { bytesToBase64 } from "byte-base64";
import { DropdownChangeEvent } from "primereact/dropdown";

interface TList {
  code_name: string;
  gubun: string;
  yrmm01: number;
  yrmm02: number;
  yrmm03: number;
  yrmm04: number;
  yrmm05: number;
  yrmm06: number;
  yrmm07: number;
  yrmm08: number;
  yrmm09: number;
  yrmm10: number;
  yrmm11: number;
  yrmm12: number;
}

interface Tsize {
  width: number;
  height: number;
}

const QC_B0100W: React.FC = () => {
  const theme = createTheme();
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const pathname: string = window.location.pathname.replace("/", "");

  const size: Tsize = useWindowSize();

  function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: 0,
      height: 0,
    });

    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }

      window.addEventListener("resize", handleResize);

      handleResize();

      return () => window.removeEventListener("resize", handleResize);
    }, []);
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
        frym: setDefaultDate(customOptionData, "frym"),
        toym: setDefaultDate(customOptionData, "toym"),
        gubun: defaultOption.find((item: any) => item.id === "gubun").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_PR010", setBizComponentData);

  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
      );

      fetchQuery(proccdQueryStr, setProccdListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
    let data: any;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const [filters, setFilters] = useState({
    pgSize: 20,
    orgdiv: "01",
    frym: new Date(),
    toym: new Date(),
    proccd: "W",
    gubun: "",
    isSearch: true,
  });
  const [mainPgNum, setMainPgNum] = useState(1);
  const [AllList, setAllList] = useState();
  const [CardData, setCardData] = useState<any>([]);
  const [ProccdData, setProccdData] = useState();
  const [All, setAll] = useState<any>();
  const [MonthData, setMonthData] = useState();
  const [selected, setSelected] = useState<TList | null>(null);
  const [stackChartLabel, setStackChartLabel] = useState();
  const [stackChartAllLabel, setStackChartAllLabel] = useState();

  const parameters = {
    procedureName: "P_QC_B0100W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_frym": convertDateToStr(filters.frym),
      "@p_toym": convertDateToStr(filters.toym),
      "@p_proccd": "",
      "@p_gubun": filters.gubun,
    },
  };

  const Cardparameters = {
    procedureName: "P_QC_B0100W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "CARDDATA",
      "@p_orgdiv": filters.orgdiv,
      "@p_frym": convertDateToStr(filters.frym),
      "@p_toym": convertDateToStr(filters.toym),
      "@p_proccd": "",
      "@p_gubun": filters.gubun,
    },
  };

  const Monthparameters = {
    procedureName: "P_QC_B0100W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "MONTHPRODCHART",
      "@p_orgdiv": filters.orgdiv,
      "@p_frym": convertDateToStr(filters.frym),
      "@p_toym": convertDateToStr(filters.toym),
      "@p_proccd":
        selected == null
          ? ""
          : proccdListData.find(
              (item: any) => item.code_name === selected.code_name
            )?.sub_code,
      "@p_gubun": filters.gubun,
    },
  };

  const ALLparameters = {
    procedureName: "P_QC_B0100W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "ALLRATE",
      "@p_orgdiv": filters.orgdiv,
      "@p_frym": convertDateToStr(filters.frym),
      "@p_toym": convertDateToStr(filters.toym),
      "@p_proccd": "",
      "@p_gubun": filters.gubun,
    },
  };

  const Proccdparameters = {
    procedureName: "P_QC_B0100W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "PRODCHART",
      "@p_orgdiv": filters.orgdiv,
      "@p_frym": convertDateToStr(filters.frym),
      "@p_toym": convertDateToStr(filters.toym),
      "@p_proccd": "",
      "@p_gubun": filters.gubun,
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
        })
      );

      setAllList(rows);
      if (rows.length > 0) {
        setSelected(rows[0]);
      } else {
        setSelected(null);
      }
    }

    let data2: any;
    try {
      data2 = await processApi<any>("procedure", Cardparameters);
    } catch (error) {
      data2 = null;
    }

    if (data2.isSuccess === true) {
      setCardData(data2.tables);
    }

    let data3: any;
    try {
      data3 = await processApi<any>("procedure", Proccdparameters);
    } catch (error) {
      data3 = null;
    }

    if (data3.isSuccess === true) {
      const rows = data3.tables[0].Rows.map(
        (item: { okcnt: number; totcnt: number }) => ({
          ...item,
        })
      );
 
      setProccdData(rows);
      let objects = rows.filter(
        (arr: { proccd: any }, index: any, callback: any[]) =>
          index === callback.findIndex((t) => t.proccd === arr.proccd)
      );
      setStackChartLabel(
        objects.map((item: { proccdnm: any }) => {
          return item.proccdnm;
        })
      );
      setStackChartAllLabel(
        rows.map((items: { proccdnm: any }) => {
          return items.proccdnm;
        })
      );
    }

    let data4: any;
    try {
      data4 = await processApi<any>("procedure", ALLparameters);
    } catch (error) {
      data4 = null;
    }

    if (data4.isSuccess === true) {
      const rows = data4.tables[0].Rows;

      setAll({
        okrate: rows[0].badrate,
        badrate: rows[1].badrate,
      });
    }
    setLoading(false);
  };

  const fetchChartGrid = async () => {
    let data: any;
    try {
      data = await processApi<any>("procedure", Monthparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

        setMonthData(rows);

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
    }
  }, [filters]);

  useEffect(() => {
    fetchChartGrid();
  }, [selected]);

  const startContent = (
    <React.Fragment>
      <Grid container spacing={2}>
        <DatePicker
          frdt={filters.frym}
          todt={filters.toym}
          onFrdtChange={(e: { value: any }) =>
            setFilters((prev) => ({
              ...prev,
              frym: e.value,
            }))
          }
          onTodtChange={(e: { value: any }) =>
            setFilters((prev) => ({
              ...prev,
              toym: e.value,
            }))
          }
          xs={12}
          sm={12}
          md={9}
          xl={9}
        />
        {customOptionData !== null && (
          <ComboBox
            value={filters.gubun}
            onChange={(e: DropdownChangeEvent) => 
                setFilters((prev) => ({
                  ...prev,
                  gubun: e.value == undefined ? "" : e.value.code,
                }))
            }
            option={customOptionData}
            placeholder={"단위"}
            id="gubun"
            textField="name"
            valueField="code"
            xs={12}
            sm={12}
            md={3}
            xl={3}
          />
        )}
      </Grid>
    </React.Fragment>
  );

  const cardOption = [
    {
      title: "불량율 TOP 공정",
      data:
        CardData.length != 0
          ? CardData[0].Rows.length == 0
            ? "-"
            : CardData[0].Rows[0].proccdnm + " : " + CardData[0].Rows[0].badrate
          : "-",
      backgroundColor: "#1976d2",
    },
    {
      title: "불량율 TOP 고객사",
      data:
        CardData.length != 0
          ? CardData[1].Rows.length == 0
            ? "-"
            : CardData[1].Rows[0].custnm + " : " + CardData[1].Rows[0].badrate
          : "-",
      backgroundColor: "#5393d3",
    },
    {
      title: "불량율 TOP 품목",
      data:
        CardData.length != 0
          ? CardData[2].Rows.length == 0
            ? "-"
            : CardData[2].Rows[0].itemnm + " : " + CardData[2].Rows[0].badrate
          : "-",
      backgroundColor: "#94b6d7",
    },
    {
      title: "불량율 TOP 설비",
      data:
        CardData.length != 0
          ? CardData[3].Rows.length == 0
            ? "-"
            : CardData[3].Rows[0].fxnm + " : " + CardData[3].Rows[0].badrate
          : "-",
      backgroundColor: "#b4c4d3",
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
            <Title>공정불량율</Title>
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
                <Grid item xs={12} sm={6} md={6} lg={6} xl={3}>
                  <Card
                    title={item.title}
                    data={item.data}
                    backgroundColor={item.backgroundColor}
                    fontsize={
                      size.width > 600 && size.width < 900 ? "1.2rem" : "1.5rem"
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={3} xl={3}>
              <GridTitle title="전체 공정율" />
              <DoughnutChart
                data={All}
                option={["okrate", "badrate"]}
                label={["양품율", "불량율"]}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={9} xl={9}>
              <GridTitle title="공정별 불량율" />
              <StackedChart
                props={ProccdData}
                value="badrate"
                alllabel={stackChartAllLabel}
                label={stackChartLabel}
                random={true}
                name="proccdnm"
              />
            </Grid>
          </Grid>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <GroupTable
                value={AllList}
                column={{
                  code_name: "공정명",
                  gubun: "구분",
                  yrmm01: "1월",
                  yrmm02: "2월",
                  yrmm03: "3월",
                  yrmm04: "4월",
                  yrmm05: "5월",
                  yrmm06: "6월",
                  yrmm07: "7월",
                  yrmm08: "8월",
                  yrmm09: "9월",
                  yrmm10: "10월",
                  yrmm11: "11월",
                  yrmm12: "12월",
                }}
                title={filters.gubun == "A" ? "전체 목록 PPM" : "전체 목록 불량율"}
                key="num"
                selection={selected}
                onSelectionChange={(e: any) => {
                  setSelected(e.value);
                }}
              />
            </Grid>
          </Grid>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <GridTitle title="월별 건수" />
              <LineChart
                props={MonthData}
                value="value"
                alllabel={stackChartAllLabel}
                label={stackChartLabel}
                color={["#1976d2", "#FF0000"]}
                borderColor={["#d7ecfb", "#fbded7"]}
                name="series"
              />
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    </>
  );
};

export default QC_B0100W;
