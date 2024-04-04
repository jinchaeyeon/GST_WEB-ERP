import { Card, CardContent, Grid, Typography } from "@mui/material";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  Grid as GridKendo,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  AdminQuestionBox,
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FilterBoxWrap,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import {
  UseGetValueFromSessionItem,
  UseParaPc,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters } from "../store/types";

var barcode = "";
let timestamp = 0;
let interval: any;
const DATA_ITEM_KEY = "custcd";
const DATA_ITEM_KEY2 = "group_code";
var index = 0;

const MA_A2300_615_PDAW: React.FC = () => {
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [state, setState] = useState("1");
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const [isVisibleDetail, setIsVisableDetail] = useState(true);
  const [isVisibleDetail2, setIsVisableDetail2] = useState(true);
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [checkDataState, setCheckDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [checkDataResult, setCheckDataResult] = useState<DataResult>(
    process([], checkDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [Information, setInformation] = useState({
    heatno: "",
    str: "",
    isSearch: false,
  });
  const [filters, setFilters] = useState({
    custnm: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });
  const [filters2, setFilters2] = useState({
    group_name: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filterInputChange2 = (e: any) => {
    const { value, name } = e.target;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  //요약정보 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);

    //팝업 조회 파라미터
    const parameters = {
      para:
        "popup-data?id=" +
        "P_CUSTCD" +
        "&page=" +
        filters.pgNum +
        "&pageSize=" +
        filters.pgSize,
      custcd: "",
      custnm: filters.custnm,
      custdiv: "",
      useyn: "사용",
    };

    try {
      data = await processApi<any>("popup-data", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowCnt = data.data.TotalRowCount;
      const rows = data.data.Rows;

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow = rows[0];
        setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
      }
    } else {
      alert(data.resultMessage);
      setTimeout(function () {
        events();
      }, 1);
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //요약정보 조회
  const fetchMainGrid2 = async (filters2: any) => {
    let data: any;
    setLoading(true);

    //팝업 조회 파라미터
    const parameters = {
      para:
        "popup-data?id=" +
        "P_BA910" +
        "&page=" +
        filters2.pgNum +
        "&pageSize=" +
        filters2.pgSize,
      group_name: filters2.group_name,
    };

    try {
      data = await processApi<any>("popup-data", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowCnt = data.data.TotalRowCount;
      const rows = data.data.Rows;

      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow = rows[0];
        setSelectedState2({ [selectedRow[DATA_ITEM_KEY2]]: true });
      }
    } else {
      alert(data.resultMessage);
      setTimeout(function () {
        events();
      }, 1);
      console.log(data);
    }
    setFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };
  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };
  const onMainSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };
  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult3.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (filters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  useEffect(() => {
    if (state == "1") {
      if (Information.isSearch && Information.str != "") {
        if (Information.heatno == "") {
          setInformation((prev) => ({
            ...prev,
            heatno: prev.str,
            str: "",
            isSearch: false,
          })); // 한번만 조회되도록
        } else {
          const newItem = {
            heatno: Information.heatno,
            scanno: Information.str,
          };

          let checkData = mainDataResult.data.filter(
            (item) =>
              item.heatno == newItem.heatno && item.scanno == newItem.scanno
          )[0];

          if (checkData != undefined) {
            alert("이미 존재하는 데이터입니다.");
            setTimeout(function () {
              events();
            }, 1);
          } else {
            setMainDataResult((prev) => ({
              data: [...prev.data, newItem],
              total: prev.total + 1,
            }));
            setCheckDataResult((prev) => ({
              data: [...prev.data, newItem],
              total: prev.total + 1,
            }));
          }
          setInformation((prev) => ({ ...prev, str: "", isSearch: false })); // 한번만 조회되도록
        }
        barcode = "";
      }
    } else {
      if (Information.isSearch && Information.str != "") {
        if (Information.heatno == "") {
          setInformation((prev) => ({
            ...prev,
            heatno: prev.str,
            str: "",
            isSearch: false,
          })); // 한번만 조회되도록
        } else {
          const newItem = {
            heatno: Information.heatno,
            scanno: Information.str,
          };
          let checkData = mainDataResult.data.filter(
            (item) =>
              item.heatno == newItem.heatno && item.scanno == newItem.scanno
          )[0];

          if (checkData != undefined) {
            alert("이미 존재하는 데이터입니다.");
            setTimeout(function () {
              events();
            }, 1);
          } else {
            setMainDataResult((prev) => ({
              data: [...prev.data, newItem],
              total: prev.total + 1,
            }));
            setCheckDataResult((prev) => ({
              data: [...prev.data, newItem],
              total: prev.total + 1,
            }));
          }
          setInformation((prev) => ({
            ...prev,
            heatno: "",
            str: "",
            isSearch: false,
          })); // 한번만 조회되도록
        }
        barcode = "";
      }
    }
    events();
  }, [Information]);

  document.addEventListener("keydown", function (evt) {
    if (!isMobile) {
      if (interval) {
        clearInterval(interval);
      }
      if (evt.target != null) {
        const target = evt.target as Element;
        if (target.nodeName == "BODY") {
          if (evt.code == "Enter" || evt.code == "NumpadEnter") {
            if (barcode != "") {
              setInformation((prev) => ({
                ...prev,
                str: barcode,
                isSearch: true,
              }));
              interval = setInterval(() => (barcode = ""), 50);
            }
          }
          if (
            evt.code != "ShiftLeft" &&
            evt.code != "Shift" &&
            evt.code != "Enter" &&
            evt.code != "NumpadEnter"
          ) {
            if (timestamp != evt.timeStamp) {
              barcode += evt.key;
              timestamp = evt.timeStamp;
            }
          }
        }
      }
    }
  });

  const onCheckClick = (datas: any) => {
    const data = checkDataResult.data.filter(
      (item) => item.heatno == datas.heatno && item.scanno == datas.scanno
    )[0];

    if (data != undefined) {
      const setdatas = checkDataResult.data.filter(
        (item) => !(item.heatno == datas.heatno && item.scanno == datas.scanno)
      );
      setCheckDataResult((prev) => ({
        data: setdatas,
        total: setdatas.length,
      }));
    } else {
      setCheckDataResult((prev) => ({
        data: [...prev.data, datas],
        total: prev.total + 1,
      }));
    }
    events();
  };

  const onClick1 = () => {
    setInformation((prev) => ({
      ...prev,
      heatno: "",
      str: "",
      isSearch: false,
    })); // 한번만 조회되도록

    barcode = "";
    setState("1");

    let availableWidthPx = document.getElementById("button1");
    if (availableWidthPx) {
      availableWidthPx.blur();
    }
    events();
  };

  const onClick2 = () => {
    setInformation((prev) => ({
      ...prev,
      heatno: "",
      str: "",
      isSearch: false,
    })); // 한번만 조회되도록
    barcode = "";
    setState("2");
    let availableWidthPx = document.getElementById("button2");
    if (availableWidthPx) {
      availableWidthPx.blur();
    }
    events();
  };

  const onSaveClick = () => {
    let dataArr: any = {
      heatno_s: [],
      barcode_s: [],
    };
    if (checkDataResult.total > 0) {
      checkDataResult.data.forEach((item: any, idx: number) => {
        const { heatno = "", scanno = "" } = item;

        dataArr.heatno_s.push(heatno);
        dataArr.barcode_s.push(scanno);
      });

      const custcd = mainDataResult2.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0].custcd;
      const group_code = mainDataResult3.data.filter(
        (item) =>
          item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
      )[0].group_code;

      setParaData((prev) => ({
        ...prev,
        workType: "N",
        orgdiv: "01",
        custcd: custcd,
        group_code: group_code,
        heatno_s: dataArr.heatno_s.join("|"),
        barcode_s: dataArr.barcode_s.join("|"),
      }));
    } else {
      alert("데이터가 없습니다.");
      setTimeout(function () {
        events();
      }, 1);
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    custcd: "",
    group_code: "",
    heatno_s: "",
    barcode_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_MA_A2300_615_PDAW_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_custcd": ParaData.custcd,
      "@p_group_code": ParaData.group_code,
      "@p_heatno_s": ParaData.heatno_s,
      "@p_barcode_s": ParaData.barcode_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "MA_A2300_615_PDAW",
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert("저장되었습니다.");
      setTimeout(function () {
        events();
      }, 1);
      resetAll();
      setParaData({
        workType: "",
        orgdiv: "01",
        custcd: "",
        group_code: "",
        heatno_s: "",
        barcode_s: "",
      });

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
      setTimeout(function () {
        events();
      }, 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const resetAll = () => {
    if (swiper) {
      swiper.slideTo(0);
    }
    setPage(initialPageState);
    setPage2(initialPageState);
    setMainDataResult(process([], mainDataState));
    setCheckDataResult(process([], checkDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    barcode = "";
    setInformation({
      heatno: "",
      str: "",
      isSearch: false,
    });
  };

  const search = () => {
    setPage(initialPageState);
    setFilters((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));
    let availableWidthPx = document.getElementById("search2");
    availableWidthPx?.blur();
  };

  const search2 = () => {
    setPage2(initialPageState);
    setFilters2((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));
    let availableWidthPx = document.getElementById("search3");
    availableWidthPx?.blur();
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (
      e.nativeEvent.data != null &&
      Math.abs(Information.str.length - value.length) == 1
    ) {
      setInformation((prev) => ({
        ...prev,
        str: value,
      }));
    } else {
      setInformation((prev) => ({
        ...prev,
        str: e.value,
        isSearch: true,
      }));
    }
  };

  useEffect(() => {
    if (isMobile) {
      events();
    }
  },[mainDataResult.data]);

  const events = () => {
    if (isMobile) {
      document.getElementById("hiddeninput")?.focus();
    }
  };

  return (
    <>
      {isMobile ? (
        <Swiper
          className="leading_PDA_Swiper"
          onSwiper={(swiper) => {
            setSwiper(swiper);
          }}
          onActiveIndexChange={(swiper) => {
            if (swiper.activeIndex == 0) {
              events();
            }
            index = swiper.activeIndex;
          }}
        >
          <SwiperSlide key={0} className="leading_PDA">
            <TitleContainer style={{ marginBottom: "15px" }}>
              <Title>원료육입고</Title>
              <ButtonContainer>
                <Button
                  themeColor={"primary"}
                  fillMode={"solid"}
                  onClick={() => {
                    setMainDataResult(process([], mainDataState));
                    setCheckDataResult(process([], checkDataState));
                    setInformation({
                      heatno: "",
                      str: "",
                      isSearch: false,
                    });
                    setState("1");
                    barcode = "";
                    events();
                  }}
                  icon="reset"
                >
                  ALLReset
                </Button>
                <Button
                  onClick={() => {
                    if (
                      Object.entries(checkDataResult.data).toString() ===
                      Object.entries(mainDataResult.data).toString()
                    ) {
                      setCheckDataResult((prev) => ({
                        data: [],
                        total: 0,
                      }));
                    } else {
                      setCheckDataResult((prev) => ({
                        data: mainDataResult.data,
                        total: mainDataResult.total,
                      }));
                    }
                    events();
                  }}
                  icon="check"
                >
                  AllCheck
                </Button>
                <Button
                  onClick={() => {
                    if (swiper) {
                      if (checkDataResult.total > 0) {
                        swiper.slideTo(1);
                      } else {
                        alert("데이터를 선택해주세요");
                        setTimeout(function () {
                          events();
                        }, 1);
                      }
                    }
                  }}
                  icon="arrow-right"
                >
                  다음
                </Button>
              </ButtonContainer>
            </TitleContainer>
            <GridContainer className="leading_PDA_container">
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr style={{ display: "flex", flexDirection: "row" }}>
                      <th style={{ width: "5%", minWidth: "80px" }}>
                        스캔번호
                      </th>
                      <td>
                        <Input
                          name="str"
                          type="text"
                          id="hiddeninput"
                          value={Information.str}
                          style={{ width: "100%" }}
                          onChange={InputChange}
                        />
                        <ButtonInInput>
                          <Button
                            id="search"
                            onClick={() => {
                              setInformation((prev) => ({
                                ...prev,
                                isSearch: true,
                              }));
                              events();
                            }}
                            icon="search"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                    <tr style={{ display: "flex", flexDirection: "row" }}>
                      <th style={{ width: "5%", minWidth: "80px" }}>
                        이력번호
                      </th>
                      <td>
                        <Input
                          name="heatno"
                          type="text"
                          value={Information.heatno}
                          className="readonly"
                          style={{ width: "100%" }}
                          onClick={() => {
                            events();
                          }}
                        />
                        <ButtonInInput>
                          <Button
                            id="reset"
                            onClick={() => {
                              setInformation((prev) => ({
                                ...prev,
                                heatno: "",
                                str: "",
                                isSearch: false,
                              }));
                              events();
                            }}
                            icon="reset"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
            <GridContainer
              style={{
                height: "60vh",
                overflowY: "scroll",
                marginBottom: "10px",
                width: "100%",
              }}
            >
              <Grid container spacing={2}>
                {mainDataResult.data.map((item, idx) => (
                  <Grid key={idx} item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <AdminQuestionBox key={idx}>
                      <Card
                        style={{
                          width: "100%",
                          cursor: "pointer",
                          backgroundColor:
                            checkDataResult.data.filter(
                              (data) =>
                                data.heatno == item.heatno &&
                                data.scanno == item.scanno
                            )[0] != undefined
                              ? "#d6d8f9"
                              : "white",
                        }}
                      >
                        <CardContent
                          onClick={() => onCheckClick(item)}
                          style={{ textAlign: "left", padding: "8px" }}
                        >
                          <Typography gutterBottom variant="h6" component="div">
                            {item.heatno}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            style={{
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                            }}
                          >
                            {item.scanno}
                          </Typography>
                        </CardContent>
                      </Card>
                    </AdminQuestionBox>
                  </Grid>
                ))}
              </Grid>
            </GridContainer>
            <GridContainer className="leading_PDA_container">
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr style={{ display: "flex", flexDirection: "row" }}>
                      <th style={{ width: "5%", minWidth: "80px" }}>
                        선택건수
                      </th>
                      <td>
                        <Input
                          name="chk"
                          type="text"
                          style={{
                            textAlign: "right",
                          }}
                          className="readonly"
                          value={checkDataResult.total}
                          onClick={() => events()}
                        />
                      </td>
                      <th style={{ width: "5%", minWidth: "80px" }}>
                        스캔건수
                      </th>
                      <td>
                        <Input
                          name="total"
                          type="text"
                          style={{
                            textAlign: "right",
                          }}
                          className="readonly"
                          value={mainDataResult.total}
                          onClick={() => events()}
                        />
                      </td>
                    </tr>
                    <tr style={{ display: "flex", flexDirection: "row" }}>
                      <th colSpan={2}>
                        <Button
                          id={"button1"}
                          themeColor={"primary"}
                          fillMode={state == "1" ? "solid" : "outline"}
                          onClick={() => onClick1()}
                          style={{ width: "100%" }}
                        >
                          이력번호
                        </Button>
                      </th>
                      <td colSpan={2}>
                        <Button
                          id={"button2"}
                          themeColor={"primary"}
                          fillMode={state == "2" ? "solid" : "outline"}
                          onClick={() => onClick2()}
                          style={{ width: "100%" }}
                        >
                          제품바코드
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
          </SwiperSlide>
          {checkDataResult.total > 0 ? (
            <SwiperSlide className="leading_PDA" key={1}>
              <TitleContainer style={{ marginBottom: "15px" }}>
                <Title>원료육입고</Title>
                <ButtonContainer>
                  <Button onClick={() => onSaveClick()} icon="save">
                    저장
                  </Button>
                </ButtonContainer>
              </TitleContainer>
              <GridContainer
                style={{
                  height: "80vh",
                  overflowY: "scroll",
                  width: "100%",
                }}
              >
                <GridContainer
                  className="leading_PDA_container"
                  style={{ marginBottom: "15px" }}
                >
                  <GridTitleContainer>
                    <GridTitle>
                      <ButtonContainer style={{ justifyContent: "flex-start" }}>
                        <Button
                          themeColor={"primary"}
                          fillMode={"flat"}
                          icon={isVisibleDetail ? "chevron-up" : "chevron-down"}
                          onClick={() => setIsVisableDetail((prev) => !prev)}
                          style={{}}
                        ></Button>
                        거래처선택
                      </ButtonContainer>
                    </GridTitle>
                  </GridTitleContainer>
                  <FilterBoxWrap>
                    <FilterBox>
                      <tbody>
                        <tr style={{ flexDirection: "row" }}>
                          <th>업체명</th>
                          <td>
                            <Input
                              name="custnm"
                              type="text"
                              value={filters.custnm}
                              onChange={filterInputChange}
                            />
                          </td>
                          <td>
                            <Button
                              onClick={search}
                              icon="search"
                              themeColor={"primary"}
                            >
                              조회
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </FilterBox>
                  </FilterBoxWrap>
                  {isVisibleDetail && (
                    <GridKendo
                      style={{ height: "50vh" }}
                      data={process(
                        mainDataResult2.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                        })),
                        mainDataState2
                      )}
                      onDataStateChange={onMainDataStateChange}
                      {...mainDataState2}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onMainSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult2.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      //더블클릭
                    >
                      <GridColumn
                        field="custcd"
                        title="업체코드"
                        width="140px"
                        footerCell={mainTotalFooterCell}
                      />
                      <GridColumn field="custnm" title="업체명" width="200px" />
                    </GridKendo>
                  )}
                </GridContainer>
                <GridContainer
                  className="leading_PDA_container"
                  style={{ marginBottom: "15px" }}
                >
                  <GridTitleContainer>
                    <GridTitle>
                      <ButtonContainer style={{ justifyContent: "flex-start" }}>
                        <Button
                          themeColor={"primary"}
                          fillMode={"flat"}
                          icon={
                            isVisibleDetail2 ? "chevron-up" : "chevron-down"
                          }
                          onClick={() => setIsVisableDetail2((prev) => !prev)}
                          style={{}}
                        ></Button>
                        바코드종류
                      </ButtonContainer>
                    </GridTitle>
                  </GridTitleContainer>
                  <FilterBoxWrap>
                    <FilterBox>
                      <tbody>
                        <tr style={{ flexDirection: "row" }}>
                          <th>바코드</th>
                          <td>
                            <Input
                              name="group_name"
                              type="text"
                              value={filters2.group_name}
                              onChange={filterInputChange2}
                            />
                          </td>
                          <td>
                            <Button
                              onClick={search2}
                              icon="search"
                              themeColor={"primary"}
                            >
                              조회
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </FilterBox>
                  </FilterBoxWrap>
                  {isVisibleDetail2 && (
                    <GridKendo
                      style={{ height: "50vh" }}
                      data={process(
                        mainDataResult3.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                        })),
                        mainDataState3
                      )}
                      onDataStateChange={onMainDataStateChange2}
                      {...mainDataState3}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY2}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onMainSelectionChange2}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult3.total}
                      skip={page2.skip}
                      take={page2.take}
                      pageable={true}
                      onPageChange={pageChange2}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange2}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      //더블클릭
                    >
                      <GridColumn
                        field="group_name"
                        title="바코드"
                        width="140px"
                        footerCell={mainTotalFooterCell2}
                      />
                    </GridKendo>
                  )}
                </GridContainer>
              </GridContainer>
            </SwiperSlide>
          ) : (
            ""
          )}
        </Swiper>
      ) : (
        <>
          <TitleContainer style={{ marginBottom: "15px" }}>
            <Title>원료육입고</Title>
            <ButtonContainer>
              <Button
                id="allreset"
                themeColor={"primary"}
                fillMode={"solid"}
                onClick={() => {
                  setMainDataResult(process([], mainDataState));
                  setCheckDataResult(process([], checkDataState));
                  setInformation({
                    heatno: "",
                    str: "",
                    isSearch: false,
                  });
                  setState("1");
                  barcode = "";
                  let availableWidthPx = document.getElementById("allreset");
                  availableWidthPx?.blur();
                }}
                icon="reset"
              >
                ALLReset
              </Button>
              <Button
                id="allcheck"
                onClick={() => {
                  if (
                    Object.entries(checkDataResult.data).toString() ===
                    Object.entries(mainDataResult.data).toString()
                  ) {
                    setCheckDataResult((prev) => ({
                      data: [],
                      total: 0,
                    }));
                  } else {
                    setCheckDataResult((prev) => ({
                      data: mainDataResult.data,
                      total: mainDataResult.total,
                    }));
                  }
                  let availableWidthPx = document.getElementById("allcheck");
                  availableWidthPx?.blur();
                }}
                icon="check"
              >
                AllCheck
              </Button>
              <Button
                onClick={() => onSaveClick()}
                themeColor={"primary"}
                fillMode={"solid"}
                icon="save"
              >
                저장
              </Button>
            </ButtonContainer>
          </TitleContainer>
          <GridContainerWrap>
            <GridContainer width="50%">
              <GridTitleContainer>
                <GridTitle>바코드스캔</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>이력번호</th>
                      <td>
                        <Input
                          name="heatno"
                          type="text"
                          value={Information.heatno}
                          className="readonly"
                          disabled={true}
                        />
                        <ButtonInInput>
                          <Button
                            id="reset"
                            onClick={() => {
                              setInformation((prev) => ({
                                ...prev,
                                heatno: "",
                                str: "",
                                isSearch: false,
                              }));
                              let availableWidthPx =
                                document.getElementById("reset");
                              availableWidthPx?.blur();
                            }}
                            icon="reset"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      <th>구분</th>
                      <td style={{ display: "flex" }}>
                        <Button
                          id={"button1"}
                          themeColor={"primary"}
                          fillMode={state == "1" ? "solid" : "outline"}
                          onClick={() => onClick1()}
                          style={{ marginRight: "10px", width: "50%" }}
                        >
                          이력번호
                        </Button>
                        <Button
                          id={"button2"}
                          themeColor={"primary"}
                          fillMode={state == "2" ? "solid" : "outline"}
                          onClick={() => onClick2()}
                          style={{ width: "50%" }}
                        >
                          제품바코드
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer
                style={{
                  height: "70vh",
                  overflowY: "scroll",
                  width: "100%",
                }}
              >
                <Grid container spacing={2}>
                  {mainDataResult.data.map((item, idx) => (
                    <Grid
                      key={idx}
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                    >
                      <AdminQuestionBox key={idx}>
                        <Card
                          style={{
                            width: "100%",
                            cursor: "pointer",
                            backgroundColor:
                              checkDataResult.data.filter(
                                (data) =>
                                  data.heatno == item.heatno &&
                                  data.scanno == item.scanno
                              )[0] != undefined
                                ? "#d6d8f9"
                                : "white",
                          }}
                        >
                          <CardContent
                            onClick={() => onCheckClick(item)}
                            style={{ textAlign: "left", padding: "8px" }}
                          >
                            <Typography
                              gutterBottom
                              variant="h6"
                              component="div"
                            >
                              {item.heatno}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              style={{
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                              }}
                            >
                              {item.scanno}
                            </Typography>
                          </CardContent>
                        </Card>
                      </AdminQuestionBox>
                    </Grid>
                  ))}
                </Grid>
              </GridContainer>
              <GridContainer className="leading_PDA_container">
                <FormBoxWrap border={true}>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>선택건수</th>
                        <td>
                          <Input
                            name="chk"
                            type="text"
                            style={{
                              textAlign: "right",
                            }}
                            className="readonly"
                            value={checkDataResult.total}
                            disabled={true}
                          />
                        </td>
                        <th>스캔건수</th>
                        <td>
                          <Input
                            name="total"
                            type="text"
                            style={{
                              textAlign: "right",
                            }}
                            className="readonly"
                            value={mainDataResult.total}
                            disabled={true}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>거래처선택</GridTitle>
                </GridTitleContainer>
                <FilterBoxWrap>
                  <FilterBox>
                    <tbody>
                      <tr style={{ flexDirection: "row" }}>
                        <th>업체명</th>
                        <td>
                          <Input
                            name="custnm"
                            type="text"
                            value={filters.custnm}
                            onChange={filterInputChange}
                          />
                        </td>
                        <td>
                          <Button
                            onClick={search}
                            icon="search"
                            id="search2"
                            themeColor={"primary"}
                          >
                            조회
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </FilterBox>
                </FilterBoxWrap>
                <GridKendo
                  style={{ height: "34.4vh" }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                    mainDataState2
                  )}
                  onDataStateChange={onMainDataStateChange}
                  {...mainDataState2}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onMainSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult2.total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  //더블클릭
                >
                  <GridColumn
                    field="custcd"
                    title="업체코드"
                    width="140px"
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn field="custnm" title="업체명" width="200px" />
                </GridKendo>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>바코드종류</GridTitle>
                </GridTitleContainer>
                <FilterBoxWrap>
                  <FilterBox>
                    <tbody>
                      <tr style={{ flexDirection: "row" }}>
                        <th>바코드</th>
                        <td>
                          <Input
                            name="group_name"
                            type="text"
                            value={filters2.group_name}
                            onChange={filterInputChange2}
                          />
                        </td>
                        <td>
                          <Button
                            onClick={search2}
                            icon="search"
                            id="search3"
                            themeColor={"primary"}
                          >
                            조회
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </FilterBox>
                </FilterBoxWrap>
                <GridKendo
                  style={{ height: "34.4vh" }}
                  data={process(
                    mainDataResult3.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                    })),
                    mainDataState3
                  )}
                  onDataStateChange={onMainDataStateChange2}
                  {...mainDataState3}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onMainSelectionChange2}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult3.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange2}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  //더블클릭
                >
                  <GridColumn
                    field="group_name"
                    title="바코드"
                    width="140px"
                    footerCell={mainTotalFooterCell2}
                  />
                </GridKendo>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
    </>
  );
};

export default MA_A2300_615_PDAW;
