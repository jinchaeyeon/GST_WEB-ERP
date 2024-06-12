import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  convertDateToStr,
  dateformat2,
  getBizCom,
  getDeviceHeight,
  setDefaultDate,
} from "../components/CommonFunction";
import { COM_CODE_DEFAULT_VALUE } from "../components/CommonString";
import DatePicker from "../components/KPIcomponents/Calendar/DatePicker";
import Card from "../components/KPIcomponents/Card/CardBox";
import BarChart from "../components/KPIcomponents/Chart/BarChart";
import Input from "../components/KPIcomponents/Input/Input";
import Radio from "../components/KPIcomponents/Radio/Radio";
import SpecialDial from "../components/KPIcomponents/SpecialDial/SpecialDial";
import PaginatorTable from "../components/KPIcomponents/Table/PaginatorTable";
import Timelines from "../components/KPIcomponents/Timeline/Timelines";
import GridTitle from "../components/KPIcomponents/Title/Title";
import { useApi } from "../hooks/api";
import {
  colors,
  colorsName,
  isLoading
} from "../store/atoms";

interface TList {
  planno: string;
}

interface TimelineEvent {
  proccd?: string;
  proccdnm?: string;
  proddt?: string;
  prodemp?: string;
  prodempnm?: string;
  prodmac?: string;
  prodmacnm?: string;
  soyoday?: number;
  number?: number;
}

const PR_B1104W: React.FC = () => {
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);

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

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("PR_B1104W", setCustomOptionData);

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
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        option: defaultOption.find((item: any) => item.id == "option")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA171, L_BA172, L_BA173", setBizComponentData);

  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [itemlvl3ListData, setItemlvl3ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
      setItemlvl2ListData(getBizCom(bizComponentData, "L_BA172"));
      setItemlvl3ListData(getBizCom(bizComponentData, "L_BA173"));
    }
  }, [bizComponentData]);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [filters, setFilters] = useState({
    pgSize: 20,
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    planno: "",
    option: "W",
    isSearch: true,
  });
  const [mainPgNum, setMainPgNum] = useState(1);
  const [AllList, setAllList] = useState<any>([]);
  const [CardData, setCardData] = useState<any>([]);
  const [ProccdData, setProccdData] = useState();
  const [All, setAll] = useState({
    value: 0,
    argument: "",
  });
  const [DetailList, setDetailList] = useState<TimelineEvent[]>([
    {
      proccd: "",
      proccdnm: "",
      proddt: "",
      prodemp: "",
      prodempnm: "",
      prodmac: "",
      prodmacnm: "",
      soyoday: 0,
      number: 1,
    },
  ]);
  const [selected, setSelected] = useState<TList | null>(null);
  const [stackChartAllLabel, setStackChartAllLabel] = useState([]);

  const parameters = {
    procedureName: "P_PR_B1104W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_planno": filters.planno,
      "@p_option": filters.option,
    },
  };

  const Cardparameters = {
    procedureName: "P_PR_B1104W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "CARD",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_planno": filters.planno,
      "@p_option": filters.option,
    },
  };

  const Detailparameters = {
    procedureName: "P_PR_B1104W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_planno": selected == null ? "" : selected.planno,
      "@p_option": filters.option,
    },
  };

  const Proccdparameters = {
    procedureName: "P_PR_B1104W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "CHART",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_planno": filters.planno,
      "@p_option": filters.option,
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

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        orddt: item.orddt == "" ? "" : dateformat2(item.orddt),
        dlvdt: item.dlvdt == "" ? "" : dateformat2(item.dlvdt),
      }));

      setAllList(rows);
      if (rows.length > 0) {
        const rows2: any = data.tables[0].Rows.map((items: any) => ({
          ...items,
          orddt: items.orddt == "" ? "" : dateformat2(items.orddt),
          dlvdt: items.dlvdt == "" ? "" : dateformat2(items.dlvdt),
          itemlvl1:
            itemlvl1ListData == undefined
              ? items.itemlvl1
              : itemlvl1ListData.find(
                  (item: any) => item.sub_code == items.itemlvl1
                )?.code_name == undefined
              ? items.itemlvl1
              : itemlvl1ListData.find(
                  (item: any) => item.sub_code == items.itemlvl1
                )?.code_name,
          itemlvl2:
            itemlvl2ListData == undefined
              ? items.itemlvl2
              : itemlvl2ListData.find(
                  (item: any) => item.sub_code == items.itemlvl2
                )?.code_name == undefined
              ? items.itemlvl2
              : itemlvl2ListData.find(
                  (item: any) => item.sub_code == items.itemlvl2
                )?.code_name,
          itemlvl3:
            itemlvl3ListData == undefined
              ? items.itemlvl3
              : itemlvl3ListData.find(
                  (item: any) => item.sub_code == items.itemlvl3
                )?.code_name == undefined
              ? items.itemlvl3
              : itemlvl3ListData.find(
                  (item: any) => item.sub_code == items.itemlvl3
                )?.code_name,
        }));

        setSelected(rows2[0]);
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
      setStackChartAllLabel(
        rows.map((items: { argument: any }) => {
          return items.argument;
        })
      );
    }

    setLoading(false);
  };

  const fetchChartGrid = async () => {
    let data3: any;
    try {
      data3 = await processApi<any>("procedure", Detailparameters);
    } catch (error) {
      data3 = null;
    }

    if (data3.isSuccess == true) {
      const rows = data3.tables[0].Rows;

      if (rows.length > 0) {
        setDetailList(rows);
      } else {
        setDetailList([]);
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
          md={6}
          lg={4}
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
            md={6}
            lg={5.5}
            xl={4}
          />
        )}
        <Input
          value={filters.planno}
          onChange={(e: { target: { value: any } }) =>
            setFilters((prev) => ({
              ...prev,
              planno: e.target.value,
            }))
          }
          xs={12}
          sm={12}
          md={4}
          lg={2.5}
          xl={2}
          label={"생산계획번호"}
        />
      </Grid>
    </React.Fragment>
  );

  const cardOption = [
    {
      title: "TOP 소요일수 공정",
      data:
        CardData.length != 0
          ? CardData[0].Rows.length == 0
            ? "-"
            : CardData[0].Rows[0].proccdnm + " : " + CardData[0].Rows[0].soyoday
          : "-",
      backgroundColor: theme.palette.primary.dark,
    },
    {
      title: "TOP 소요일수 품목",
      data:
        CardData.length != 0
          ? CardData[1].Rows.length == 0
            ? "-"
            : CardData[1].Rows[0].itemnm +
              " : " +
              CardData[1].Rows[0].totsoyoday
          : "-",
      backgroundColor: theme.palette.primary.main,
    },
  ];

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
            <Title>작업공수</Title>
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
                <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                  <Card
                    title={item.title}
                    data={item.data}
                    backgroundColor={item.backgroundColor}
                    fontsize={
                      deviceWidth > 600 && deviceWidth < 900
                        ? "1.2rem"
                        : "1.5rem"
                    }
                    form={"PR_B1104W"}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <GridTitle title="평균 소요일수" />
              <BarChart
                props={ProccdData}
                value="value"
                alllabel={stackChartAllLabel}
                random={true}
                name="argument"
                colorName={colorName}
              />
            </Grid>
          </Grid>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <PaginatorTable
                value={
                  AllList != undefined
                    ? AllList.map((items: any) => ({
                        ...items,
                        itemlvl1:
                          itemlvl1ListData == undefined
                            ? items.itemlvl1
                            : itemlvl1ListData.find(
                                (item: any) => item.sub_code == items.itemlvl1
                              )?.code_name == undefined
                            ? items.itemlvl1
                            : itemlvl1ListData.find(
                                (item: any) => item.sub_code == items.itemlvl1
                              )?.code_name,
                        itemlvl2:
                          itemlvl2ListData == undefined
                            ? items.itemlvl2
                            : itemlvl2ListData.find(
                                (item: any) => item.sub_code == items.itemlvl2
                              )?.code_name == undefined
                            ? items.itemlvl2
                            : itemlvl2ListData.find(
                                (item: any) => item.sub_code == items.itemlvl2
                              )?.code_name,
                        itemlvl3:
                          itemlvl3ListData == undefined
                            ? items.itemlvl3
                            : itemlvl3ListData.find(
                                (item: any) => item.sub_code == items.itemlvl3
                              )?.code_name == undefined
                            ? items.itemlvl3
                            : itemlvl3ListData.find(
                                (item: any) => item.sub_code == items.itemlvl3
                              )?.code_name,
                      }))
                    : []
                }
                column={{
                  planno: "생산계획번호",
                  itemcd: "품목코드",
                  itemnm: "품목명",
                  insiz: "규격",
                  itemlvl1: "대분류",
                  itemlvl2: "중분류",
                  itemlvl3: "소분류",
                  ordnum: "수주번호",
                  orddt: "수주일자",
                  dlvdt: "납기일자",
                }}
                width={[180, 150, 180, 150, 150, 120, 120, 120, 150, 150, 150]}
                title={"전체 목록"}
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
            <Grid item xs={12} sm={12} md={12} lg={9} xl={9}>
              <GridTitle title="작업공정정보" />
              <Timelines value={DetailList} theme={theme} />
            </Grid>
          </Grid>
          <SpecialDial />
        </ThemeProvider>
      </div>
    </>
  );
};

export default PR_B1104W;
