import { Card, CardContent, Grid, Input, Typography } from "@mui/material";
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
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  AdminQuestionBox,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import {
  UseGetValueFromSessionItem,
  UseParaPc,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters } from "../store/types";

var barcode = "";
const DATA_ITEM_KEY = "custcd";
const DATA_ITEM_KEY2 = "group_name";

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
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });
  const [filters2, setFilters2] = useState({
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });
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
      custnm: "",
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
      group_name: "",
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
          setInformation((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
        }
        barcode = "";
      }
    } else {
      if (Information.isSearch && Information.str != "") {
        if (Information.heatno == "") {
          setInformation((prev) => ({
            ...prev,
            heatno: prev.str,
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
          setInformation((prev) => ({ ...prev, heatno: "", isSearch: false })); // 한번만 조회되도록
        }
        barcode = "";
      }
    }
  }, [Information]);

  useEffect(() => {
    document.addEventListener("keydown", function (evt) {
      if (evt.code == "Enter") {
        if (barcode != "") {
          setInformation((prev) => ({
            ...prev,
            str: barcode,
            isSearch: true,
          }));
        }
      } else if (
        evt.code != "ShiftLeft" &&
        evt.code != "Shift" &&
        evt.code != "Enter"
      ) {
        barcode += evt.key;
      }
    });
  }, []);

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
  };

  const onSaveClick = () => {
    let dataArr: any = {
      heatno_s: [],
      barcode_s: [],
    };
    mainDataResult.data.forEach((item: any, idx: number) => {
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
      resetAll();
      setParaData({
        workType: "",
        orgdiv: "01",
        custcd: "",
        group_code: "",
        heatno_s: "",
        barcode_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
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

  return (
    <>
      <Swiper
        className="leading_PDA_Swiper"
        onSwiper={(swiper) => {
          setSwiper(swiper);
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
                }}
                icon="reset"
              >
                Reset
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
                    <th style={{ width: "5%", minWidth: "80px" }}>이력번호</th>
                    <td>
                      <Input
                        name="heatno"
                        type="text"
                        value={Information.heatno}
                        style={{ width: "100%" }}
                        disabled={true}
                      />
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
            {mainDataResult.data.map((item, idx) => (
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
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
                      <Typography variant="body2" color="text.secondary">
                        {item.scanno}
                      </Typography>
                    </CardContent>
                  </Card>
                </AdminQuestionBox>
              </Grid>
            ))}
          </GridContainer>
          <GridContainer className="leading_PDA_container">
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr style={{ display: "flex", flexDirection: "row" }}>
                    <th style={{ width: "5%", minWidth: "80px" }}>선택건수</th>
                    <td>
                      <Input
                        name="chk"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={checkDataResult.total}
                      />
                    </td>
                    <th style={{ width: "5%", minWidth: "80px" }}>스캔건수</th>
                    <td>
                      <Input
                        name="total"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={mainDataResult.total}
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
              className="leading_PDA_container"
              style={{ marginBottom: "15px" }}
            >
              <GridTitleContainer>
                <GridTitle>거래처선택</GridTitle>
              </GridTitleContainer>
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
            </GridContainer>
            <GridContainer
              className="leading_PDA_container"
              style={{ marginBottom: "15px" }}
            >
              <GridTitleContainer>
                <GridTitle>바코드종류</GridTitle>
              </GridTitleContainer>
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
            </GridContainer>
          </SwiperSlide>
        ) : (
          ""
        )}
      </Swiper>
    </>
  );
};

export default MA_A2300_615_PDAW;
