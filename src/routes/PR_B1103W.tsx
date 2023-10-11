import React, { useCallback, useEffect, useRef, useState } from "react";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import { useApi } from "../hooks/api";
import {
  convertDateToStr,
  dateformat2,
  getQueryFromBizComponent,
  setDefaultDate,
  toDate2,
  UseBizComponent,
  UseCustomOption,
  GetPropertyValueByName,
} from "../components/CommonFunction";
import { useRecoilState, useSetRecoilState } from "recoil";
import { colors, isLoading } from "../store/atoms";
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
import GridTitle from "../components/KPIcomponents/Title/Title";
import PaginatorTable from "../components/KPIcomponents/Table/PaginatorTable";
import { Toast } from "primereact/toast";
import Input from "../components/KPIcomponents/Input/Input";
import { DropdownChangeEvent } from "primereact/dropdown";
import LineChart from "../components/KPIcomponents/Chart/LineChart";
import { bytesToBase64 } from "byte-base64";
import SpecialDial from "../components/KPIcomponents/SpecialDial/SpecialDial";

interface Tsize {
  width: number;
  height: number;
}

const PR_B1103W: React.FC = () => {
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const pathname: string = window.location.pathname.replace("/", "");
  const toast = useRef<Toast>(null);
  const [color, setColor] = useRecoilState(colors);

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
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query");

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

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001",
    //수량단위, 과세구분, 내수구분, 화폐단위, 사용자, 계산서유형, 입고유형, 전표입력경로
    setBizComponentData
  );

  const [userListData, setUserListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      fetchQuery(userQueryStr, setUserListData);
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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: 20,
    orgdiv: "01",
    frdt: new Date(),
    todt: new Date(),
    option: "I",
    itemcd: "",
    itemnm: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    proccd: "",
    recdt: "",
    isSearch: true,
  });
  const [mainPgNum, setMainPgNum] = useState(1);
  const [AllList, setAllList] = useState();
  const [DetailList, setDetailList] = useState<any[]>();
  const [MonthData, setMonthData] = useState();
  const [AllPanel, setAllPanel] = useState({
    avg_worktime: 0,
    qty: 0,
    worktime: 0,
  });
  const [stackChartLabel, setStackChartLabel] = useState();
  const [stackChartAllLabel, setStackChartAllLabel] = useState();
  const [selected, setSelected] = useState<any>(null);
  const [detailSelected, setDetailSelected] = useState(null);

  //조회조건 파라미터
  const parameters = {
    procedureName: "P_PR_B1103W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_recdt": "",
      "@p_option": filters.option,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_itemlvl1": filters.itemlvl1,
      "@p_itemlvl2": filters.itemlvl2,
      "@p_itemlvl3": filters.itemlvl3,
      "@p_proccd": filters.proccd
    },
  };

  const Detailparameters = {
    procedureName: "P_PR_B1103W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_recdt":
        selected == null ? "" : convertDateToStr(toDate2(selected.proddt)),
      "@p_option": filters.option,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_itemlvl1": filters.itemlvl1,
      "@p_itemlvl2": filters.itemlvl2,
      "@p_itemlvl3": filters.itemlvl3,
      "@p_proccd": filters.proccd
    },
  };

  const ALLparameters = {
    procedureName: "P_PR_B1103W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "CARD",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_recdt": "",
      "@p_option": filters.option,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_itemlvl1": filters.itemlvl1,
      "@p_itemlvl2": filters.itemlvl2,
      "@p_itemlvl3": filters.itemlvl3,
      "@p_proccd": filters.proccd
    },
  };

  const chartparameters = {
    procedureName: "P_PR_B1103W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "CHART",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_recdt": "",
      "@p_option": filters.option,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_itemlvl1": filters.itemlvl1,
      "@p_itemlvl2": filters.itemlvl2,
      "@p_itemlvl3": filters.itemlvl3,
      "@p_proccd": filters.proccd
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
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        proddt: item.proddt == "" ? "" : dateformat2(item.proddt),
      }));

      setAllList(rows);
      if (rows.length > 0) {
        setSelected(rows[0]);
      } else {
        setSelected(null);
        fetchDetailGrid();
      }
    }

    let data2: any;
    try {
      data2 = await processApi<any>("procedure", ALLparameters);
    } catch (error) {
      data2 = null;
    }

    if (data2.isSuccess === true) {
      const rows = data2.tables[0].Rows;

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

  const fetchDetailGrid = async () => {
    let data: any;
    try {
      data = await processApi<any>("procedure", Detailparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setDetailList(rows);
      if (rows.length > 0) {
        const rows2: any = data.tables[0].Rows.map((items: any) => ({
          ...items,
          prodemp:
            userListData == undefined
              ? items.prodemp
              : userListData.find((item: any) => item.user_id == items.prodemp)
                  ?.user_name == undefined
              ? items.prodemp
              : userListData.find((item: any) => item.user_id == items.prodemp)
                  ?.user_name,
        }));

        setDetailSelected(rows2[0]);
      } else {
        setDetailSelected(null);
      }
    }
  };

  useEffect(() => {
    fetchDetailGrid();
  }, [selected]);

  useEffect(() => {
    if (
      filters.isSearch &&
      customOptionData != null &&
      bizComponentData != null
    ) {
      setFilters((prev) => ({
        ...prev,
        isSearch: false,
      }));
      fetchMainGrid();
      fetchChartGrid();
    }
  }, [filters]);

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
                itemlvl1: e.value == undefined ? "" : e.value.sub_code,
              }))
            }
            option={customOptionData}
            placeholder={"대분류"}
            id="itemlvl1"
            xs={12}
            sm={3}
            md={2}
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
                itemlvl2: e.value == undefined ? "" : e.value.sub_code,
              }))
            }
            option={customOptionData}
            placeholder={"중분류"}
            id="itemlvl2"
            xs={12}
            sm={3}
            md={2}
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
                itemlvl3: e.value == undefined ? "" : e.value.sub_code,
              }))
            }
            option={customOptionData}
            placeholder={"소분류"}
            id="itemlvl3"
            xs={12}
            sm={3}
            md={2}
            lg={2}
            xl={2}
          />
        )}
        {customOptionData !== null && (
          <ComboBox
            value={filters.proccd}
            onChange={(e: DropdownChangeEvent) =>
              setFilters((prev) => ({
                ...prev,
                proccd: e.value == undefined ? "" : e.value.sub_code,
              }))
            }
            option={customOptionData}
            placeholder={"공정"}
            id="proccd"
            xs={12}
            sm={3}
            md={2}
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
      data: AllPanel.avg_worktime != null ? AllPanel.avg_worktime : 0,
      backgroundColor: theme.palette.primary.dark,
    },
    {
      title: "총 생산량",
      data: AllPanel.qty != null ? AllPanel.qty : 0,
      backgroundColor: theme.palette.primary.main,
    },
    {
      title: "총 작업시간",
      data: AllPanel.worktime != null ? AllPanel.worktime + "h" : 0 + "h",
      backgroundColor: theme.palette.primary.light,
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
                      detail: "기간을 31일 이내로 설정해주세요.",
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
                    form={"PR_B1103W"}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <GridTitle title="일자별 시간당 생산량" />
              <LineChart
                props={MonthData}
                value="uph_worktime"
                alllabel={stackChartAllLabel}
                label={stackChartLabel}
                color={[theme.palette.primary.dark]}
                borderColor={[theme.palette.primary.main]}
                name="series"
              />
            </Grid>
          </Grid>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
              <PaginatorTable
                value={AllList}
                column={{
                  proddt: "일자",
                  qty: "생산량",
                  worktime: "작업시간",
                  hr: "표준시간",
                  prodempcnt: "작업자수",
                  uph_worktime: "시간당 생산량",
                }}
                title={"전체 목록"}
                width={[110, 100, 120, 120, 120, 150]}
                key="num"
                selection={selected}
                onSelectionChange={(e: any) => {
                  setSelected(e.value);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
              <PaginatorTable
                value={
                  DetailList != undefined
                    ? DetailList.map((items: any) => ({
                        ...items,
                        prodemp:
                          userListData == undefined
                            ? items.prodemp
                            : userListData.find(
                                (item: any) => item.user_id == items.prodemp
                              )?.user_name == undefined
                            ? items.prodemp
                            : userListData.find(
                                (item: any) => item.user_id == items.prodemp
                              )?.user_name,
                      }))
                    : []
                }
                column={{
                  itemcd:
                    filters.option == "I"
                      ? "품목코드"
                      : filters.option == "L"
                      ? "대분류코드"
                      : filters.option == "M"
                      ? "중분류코드"
                      : "소분류코드",
                  itemnm:
                    filters.option == "I"
                      ? "품목명"
                      : filters.option == "L"
                      ? "대분류명"
                      : filters.option == "M"
                      ? "중분류명"
                      : "소분류명",
                  qty: "생산량",
                  worktime: "작업시간",
                  hr: "표준시간",
                  prodemp: "작업자",
                }}
                width={[130, 140, 110, 120, 120, 110]}
                numberField={["qty"]}
                title={"상세 목록"}
                key="num"
                selection={detailSelected}
                onSelectionChange={(e: any) => {
                  setDetailSelected(e.value);
                }}
              />
            </Grid>
          </Grid>
        </Container>
        <SpecialDial />
      </ThemeProvider>
    </>
  );
};

export default PR_B1103W;
