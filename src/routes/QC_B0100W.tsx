import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { DropdownChangeEvent } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getBizCom,
  getDeviceHeight,
  getMenuName,
  setDefaultDate,
} from "../components/CommonFunction";
import { COM_CODE_DEFAULT_VALUE } from "../components/CommonString";
import DatePicker from "../components/KPIcomponents/Calendar/DatePicker";
import Card from "../components/KPIcomponents/Card/CardBox";
import BarChart from "../components/KPIcomponents/Chart/BarChart";
import DoughnutChart from "../components/KPIcomponents/Chart/DoughnutChart";
import LineChart from "../components/KPIcomponents/Chart/LineChart";
import ComboBox from "../components/KPIcomponents/ComboBox/ComboBox";
import SpecialDial from "../components/KPIcomponents/SpecialDial/SpecialDial";
import GroupTable from "../components/KPIcomponents/Table/GroupTable";
import GridTitle from "../components/KPIcomponents/Title/Title";
import { useApi } from "../hooks/api";
import { colors, colorsName, isLoading } from "../store/atoms";
import { TPermissions } from "../store/types";

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

const QC_B0100W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [color, setColor] = useRecoilState(colors);
  const [colorName, setColorName] = useRecoilState(colorsName);

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

  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("QC_B0100W", setCustomOptionData);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
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
    }
  }, [customOptionData, webheight]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        frym: setDefaultDate(customOptionData, "frym"),
        toym: setDefaultDate(customOptionData, "toym"),
        gubun: defaultOption.find((item: any) => item.id == "gubun")?.valueCode,
        isSearch: true,
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
      setProccdListData(getBizCom(bizComponentData, "L_PR010"));
    }
  }, [bizComponentData]);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [filters, setFilters] = useState({
    pgSize: 20,
    orgdiv: sessionOrgdiv,
    frym: new Date(),
    toym: new Date(),
    proccd: "W",
    proccdQuery: "",
    gubun: "",
    card_click: "P",
    isSearch: false,
  });
  const [mainPgNum, setMainPgNum] = useState(1);
  const [AllList, setAllList] = useState();
  const [CardData, setCardData] = useState<any>([]);
  const [ProccdData, setProccdData] = useState([]);
  const [All, setAll] = useState<any>();
  const [MonthData, setMonthData] = useState();
  const [selected, setSelected] = useState<TList | null>(null);
  const [stackChartLabel, setStackChartLabel] = useState([]);
  const [stackChartAllLabel, setStackChartAllLabel] = useState([]);
  const [stackChartAllLabel2, setStackChartAllLabel2] = useState([]);

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
      "@p_proccdQuery": filters.proccdQuery,
      "@p_card_click": filters.card_click,
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
      "@p_proccdQuery": filters.proccdQuery,
      "@p_card_click": filters.card_click,
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
              (item: any) => item.code_name == selected.code_name
            )?.sub_code,
      "@p_gubun": filters.gubun,
      "@p_proccdQuery": filters.proccdQuery,
      "@p_card_click": filters.card_click,
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
      "@p_proccdQuery": filters.proccdQuery,
      "@p_card_click": filters.card_click,
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
      "@p_proccdQuery": filters.proccdQuery,
      "@p_card_click": filters.card_click,
    },
  };

  const fetchMainGrid = async () => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
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

    if (data2.isSuccess == true) {
      setCardData(data2.tables);
    }

    let data3: any;
    try {
      data3 = await processApi<any>("procedure", Proccdparameters);
    } catch (error) {
      data3 = null;
    }

    if (data3.isSuccess == true) {
      const rows = data3.tables[0].Rows.map(
        (item: { okcnt: number; totcnt: number }) => ({
          ...item,
        })
      );

      setProccdData(rows);

      if (filters.card_click == "F") {
        setStackChartAllLabel2(
          rows.map((items: { fxnm: any }) => {
            return items.fxnm;
          })
        );
      } else {
        setStackChartAllLabel2(
          rows.map((items: { proccdnm: any }) => {
            return items.proccdnm;
          })
        );
      }
    }

    let data4: any;
    try {
      data4 = await processApi<any>("procedure", ALLparameters);
    } catch (error) {
      data4 = null;
    }

    if (data4.isSuccess == true) {
      const rows = data4.tables[0].Rows;
      setAll({
        okrate: rows[0].badrate,
        badrate: rows[1].badrate,
        qty: rows[0].qty,
        badqty: rows[0].badqty,
        totqty: rows[0].totqty,
      });
    }
    setLoading(false);
  };

  const fetchChartGrid = async () => {
    if (!permissions.view) return;
    let data: any;
    try {
      data = await processApi<any>("procedure", Monthparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMonthData(rows);

      let objects = rows.filter(
        (arr: { series: any }, index: any, callback: any[]) =>
          index == callback.findIndex((t) => t.series == arr.series)
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
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      setFilters((prev) => ({
        ...prev,
        isSearch: false,
      }));
      fetchMainGrid();
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      fetchChartGrid();
    }
  }, [selected, permissions, bizComponentData, customOptionData]);

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
          md={6}
          xl={6}
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
        {customOptionData !== null && (
          <ComboBox
            value={filters.proccdQuery}
            onChange={(e: DropdownChangeEvent) =>
              setFilters((prev) => ({
                ...prev,
                proccdQuery: e.value == undefined ? "" : e.value.sub_code,
              }))
            }
            option={customOptionData}
            placeholder={"공정"}
            id="proccdQuery"
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
      title: "불량률 TOP 공정",
      data:
        CardData.length != 0
          ? CardData[0].Rows.length == 0
            ? "-"
            : CardData[0].Rows[0].proccdnm + " : " + CardData[0].Rows[0].badrate
          : "-",
      backgroundColor: theme.palette.primary.dark,
    },
    {
      title: "불량률 TOP 고객사",
      data:
        CardData.length != 0
          ? CardData[1].Rows.length == 0
            ? "-"
            : CardData[1].Rows[0].custnm + " : " + CardData[1].Rows[0].badrate
          : "-",
      backgroundColor: theme.palette.primary.main,
    },
    {
      title: "불량률 TOP 품목",
      data:
        CardData.length != 0
          ? CardData[2].Rows.length == 0
            ? "-"
            : CardData[2].Rows[0].itemnm + " : " + CardData[2].Rows[0].badrate
          : "-",
      backgroundColor: theme.palette.primary.light,
    },
    {
      title: "불량률 TOP 설비",
      data:
        CardData.length != 0
          ? CardData[3].Rows.length == 0
            ? "-"
            : CardData[3].Rows[0].fxnm + " : " + CardData[3].Rows[0].badrate
          : "-",
      backgroundColor: theme.palette.secondary.main,
    },
  ];

  const selectCard = (title: string) => {
    if (
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      if (title == "불량률 TOP 공정") {
        setFilters((prev) => ({
          ...prev,
          card_click: "P",
          isSearch: true,
        }));
      } else if (title == "불량률 TOP 고객사") {
        setFilters((prev) => ({
          ...prev,
          card_click: "C",
          isSearch: true,
        }));
      } else if (title == "불량률 TOP 품목") {
        setFilters((prev) => ({
          ...prev,
          card_click: "I",
          isSearch: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          card_click: "F",
          isSearch: true,
        }));
      }
    }
  };
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
                      deviceWidth > 600 && deviceWidth < 900
                        ? "1.2rem"
                        : "1.5rem"
                    }
                    form={"QC_B0100W"}
                    Click={() => selectCard(item.title)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={3} xl={3}>
              <GridTitle title="전체 불량률" />
              <DoughnutChart
                data={All}
                option={["okrate", "badrate"]}
                label={["양품율", "불량률"]}
                theme={theme}
                form={"QC_B0100W"}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={9} xl={9}>
              {filters.card_click == "P" ? (
                <>
                  <GridTitle title="공정별 불량률" />
                  <BarChart
                    props={ProccdData}
                    value="badrate"
                    alllabel={stackChartAllLabel2}
                    random={true}
                    name="proccdnm"
                    colorName={colorName}
                  />
                </>
              ) : filters.card_click == "C" ? (
                <>
                  <GridTitle title="고객사별 불량률" />
                  <BarChart
                    props={ProccdData}
                    value="badrate"
                    alllabel={stackChartAllLabel2}
                    random={true}
                    name="proccdnm"
                    colorName={colorName}
                  />
                </>
              ) : filters.card_click == "I" ? (
                <>
                  <GridTitle title="품목별 불량률" />
                  <BarChart
                    props={ProccdData}
                    value="badrate"
                    alllabel={stackChartAllLabel2}
                    random={true}
                    name="proccdnm"
                    colorName={colorName}
                  />
                </>
              ) : (
                <>
                  <GridTitle title="설비별 불량률" />
                  <BarChart
                    props={ProccdData}
                    value="badrate"
                    alllabel={stackChartAllLabel2}
                    random={true}
                    name="fxnm"
                    colorName={colorName}
                  />
                </>
              )}
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
                width={[
                  120, 110, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
                  100, 100,
                ]}
                title={
                  filters.gubun == "A" ? "전체 목록 PPM" : "전체 목록 불량률"
                }
                numberCell={[
                  "yrmm01",
                  "yrmm02",
                  "yrmm03",
                  "yrmm04",
                  "yrmm05",
                  "yrmm06",
                  "yrmm07",
                  "yrmm08",
                  "yrmm09",
                  "yrmm10",
                  "yrmm11",
                  "yrmm12",
                ]}
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
                color={[
                  theme.palette.primary.dark,
                  theme.palette.primary.light,
                ]}
                borderColor={[
                  theme.palette.primary.main,
                  theme.palette.secondary.main,
                ]}
                name="series"
              />
            </Grid>
          </Grid>
          <SpecialDial />
        </ThemeProvider>
      </div>
    </>
  );
};

export default QC_B0100W;
