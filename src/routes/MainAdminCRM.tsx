import { Card, CardContent, Grid } from "@mui/material";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  GridColumn,
  GridDataStateChangeEvent,
  Grid as GridKendo,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  AdminQuestionBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  ScrollableContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  dateformat2,
  getBizCom,
  getDeviceHeight,
  getHeight,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CurrentTime from "../components/DDGDcomponents/CurrentTime";
import DetailWindow2 from "../components/Windows/CM_A0000W_301_Window";
import AdjustApprovalWindow from "../components/Windows/DDGD/AdjustApprovalWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
var height8 = 0;
var height9 = 0;
var height10 = 0;
var height11 = 0;

const Main: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [loginResult, setLoginResult] = useRecoilState(loginResultState);
  const userName = loginResult ? loginResult.userName : "";
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const userId = loginResult ? loginResult.userId : "";

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [mobileheight5, setMobileHeight5] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  const [webheight5, setWebHeight5] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".TitleContainer");
    height2 = getHeight(".Cards");
    height3 = getHeight(".Cards2");
    height4 = getHeight(".Cards3");
    height5 = getHeight(".FormBoxWrap");
    height6 = getHeight(".ButtonContainer");
    height7 = getHeight(".ButtonContainer2");
    height8 = getHeight(".ButtonContainer3");
    height9 = getHeight(".ButtonContainer4");
    height10 = getHeight(".ButtonContainer5");
    height11 = getHeight(".ButtonContainer6");

    const handleWindowResize = () => {
      let deviceWidth = document.documentElement.clientWidth;
      setIsMobile(deviceWidth <= 1200);
      setMobileHeight(getDeviceHeight(false) - height);
      setMobileHeight2(getDeviceHeight(false) - height - height8);
      setMobileHeight3(getDeviceHeight(false) - height - height9);
      setMobileHeight4((getDeviceHeight(false) - height) / 2 - height10);
      setMobileHeight5((getDeviceHeight(false) - height) / 2 - height11);
      setWebHeight(
        getDeviceHeight(false) -
          height -
          height2 -
          height3 -
          height4 -
          height5 -
          height6 -
          height7
      );
      setWebHeight2(getDeviceHeight(false) - height - height8);
      setWebHeight3(getDeviceHeight(false) - height - height9);
      setWebHeight4((getDeviceHeight(false) - height) / 2 - height10);
      setWebHeight5((getDeviceHeight(false) - height) / 2 - height11);
    };
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [webheight, webheight2, webheight3, webheight4, webheight5]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA310, L_SYS007",
    //품목계정, 수량단위
    setBizComponentData
  );
  //공통코드 리스트 조회 ()
  const [classListData, setClassListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [categoryListData, setCategoryListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setClassListData(getBizCom(bizComponentData, "L_BA310"));
      setCategoryListData(getBizCom(bizComponentData, "L_SYS007"));
    }
  }, [bizComponentData]);

  const [cardOptionState, setCardOptionState] = useState<State>({
    sort: [],
  });
  const [questionDataState, setQuestionDataState] = useState<State>({
    sort: [],
  });
  const [noticeDataState, setNoticeDataState] = useState<State>({
    sort: [],
  });
  const [mainnoticeDataState, setMainNoticeDataState] = useState<State>({
    sort: [],
  });
  const [cardOptionData, setCardOptionData] = useState<DataResult>(
    process([], cardOptionState)
  );
  const [questionDataResult, setQuestionDataResult] = useState<DataResult>(
    process([], questionDataState)
  );
  const [noticeDataResult, setNoticeDataResult] = useState<DataResult>(
    process([], noticeDataState)
  );
  const [mainnoticeDataResult, setMainNoticeDataResult] = useState<DataResult>(
    process([], mainnoticeDataState)
  );
  const [adjcnt, setAdjcnt] = useState(0);
  const [addcnt, setAddcnt] = useState(0);
  const [noticeselectedState, setNoticeSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [mainnoticeselectedState, setMainnoticeSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: noticeselectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setNoticeSelectedState(newSelectedState);
  };
  const onMainNoticeSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: mainnoticeselectedState,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setMainnoticeSelectedState(newSelectedState);
  };

  const [filters, setFilters] = useState<any>({
    pgSize: 100,
    workType: "Q",
    frdt: new Date(),
    find_row_value: "",
  });

  //조회조건 초기값
  const [mainNoticefilters, setMainNoticeFilters] = useState({
    cbocategory: "",
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    cboPerson: "",
    publishdate: new Date(),
    title: "",
    contents2: "",
    chooses_s: "",
    loadok_s: "",
    readok_s: "",
    cbodtgb: "C",
    datnum: "",
    radPublish_yn: "Y",
    publish_start_date: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    location: sessionLocation,
    datnum: "",
    category: "",
    pgNum: 1,
    find_row_value: "",
    isSearch: false,
  });
  const detailParameters: Iparameters = {
    procedureName: "P_CM_A0000W_Q",
    pageNumber: 1,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": sessionOrgdiv,
      "@p_datnum": detailFilters.datnum,
      "@p_dtgb": mainNoticefilters.cbodtgb,
      "@p_frdt": convertDateToStr(mainNoticefilters.publish_start_date),
      "@p_category": detailFilters.category,
      "@p_title": "",
      "@p_yn": mainNoticefilters.radPublish_yn,
      "@p_attdatnum": "",
      "@p_userid": userId,
      "@p_newDiv": "N",
      "@p_find_row_value": mainNoticefilters.find_row_value,
    },
  };
  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      mainNoticefilters.isSearch &&
      permissions.view &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(mainNoticefilters);
      setMainNoticeFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [mainNoticefilters, permissions, bizComponentData]);

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };
  const fetchMain = async () => {
    if (!permissions.view) return;
    let data: any;
    const Parameters: Iparameters = {
      procedureName: "sys_sel_default_home_web",
      pageNumber: 1,
      pageSize: 100,
      parameters: {
        "@p_work_type": "MANAGER",
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": sessionLocation,
        "@p_user_id": userId,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_ref_date": convertDateToStr(filters.frdt),
        "@p_ref_key": "",
      },
    };
    try {
      data = await processApi<any>("procedure", Parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rowCount = data.tables[0].RowCount;
      const row = data.tables[0].Rows;
      const row2 = data.tables[1].Rows;
      const row3 = data.tables[2].Rows;
      const rowCount4 = data.tables[3].RowCount;
      const row4 = data.tables[3].Rows;
      const rowCount5 = data.tables[4].RowCount;
      const row5 = data.tables[4].Rows;

      setCardOptionData((prev) => {
        return {
          data: row,
          total: rowCount == -1 ? 0 : rowCount,
        };
      });
      setAdjcnt(row2[0].adjcnt);
      setAddcnt(row3[0].addcnt);
      setQuestionDataResult((prev) => {
        return {
          data: row4,
          total: rowCount4 == -1 ? 0 : rowCount4,
        };
      });
      setNoticeDataResult((prev) => {
        return {
          data: row5,
          total: rowCount5 == -1 ? 0 : rowCount5,
        };
      });
      if (rowCount5 > 0) {
        setNoticeSelectedState({ [row5[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };
  useEffect(() => {
    if (permissions.view && bizComponentData !== null) {
      fetchMain();
    }
  }, [filters, permissions, bizComponentData]);

  const onNoticeDataStateChange = (event: GridDataStateChangeEvent) => {
    setNoticeDataState(event.dataState);
  };
  const onMainNoticeDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainNoticeDataState(event.dataState);
  };
  const onNoticeSortChange = (e: any) => {
    setNoticeDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainNoticeSortChange = (e: any) => {
    setMainNoticeDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A0000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": sessionOrgdiv,
        "@p_datnum": filters.datnum,
        "@p_dtgb": filters.cbodtgb,
        "@p_frdt": convertDateToStr(filters.publish_start_date),
        "@p_category": filters.cbocategory,
        "@p_title": filters.title,
        "@p_yn": filters.radPublish_yn,
        "@p_attdatnum": "",
        "@p_userid": userId,
        "@p_newDiv": "N",
        "@p_find_row_value": filters.find_row_value,
      },
    };

    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainNoticeDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.datnum == filters.find_row_value);

        if (selectedRow != undefined) {
          setMainnoticeSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setDetailFilters((prev) => ({
            ...prev,
            location: selectedRow.location,
            datnum: selectedRow.datnum,
            category: selectedRow.category,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
        } else {
          setMainnoticeSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setDetailFilters((prev) => ({
            ...prev,
            location: rows[0].location,
            datnum: rows[0].datnum,
            category: rows[0].category,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
        }
      }
    }
    setMainNoticeFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };
  const [detailWindowVisible2, setDetailWindowVisible2] =
    useState<boolean>(false);
  const onRowDoubleClick = (props: any) => {
    //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
    const rowData = props.dataItem;

    setMainnoticeSelectedState({ [rowData[DATA_ITEM_KEY]]: true });

    const categories = categoryListData.find(
      (item: any) => item.code_name == rowData.category
    )?.sub_code;

    setDetailFilters((prev) => ({
      ...prev,
      location: rowData.location,
      datnum: rowData.datnum,
      category: categories == undefined ? "" : categories,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));

    setDetailWindowVisible2(true);
  };

  const [adjustWindowVisible, setAdjustWindowVisible] =
    useState<boolean>(false);

  const onAdjustWndClick = () => {
    setAdjustWindowVisible(true);
  };

  return (
    <>
      <div style={{ fontFamily: "TheJamsil5Bold" }}>
        <TitleContainer className="TitleContainer">
          <Title>{userName}님, 좋은 하루되세요</Title>
        </TitleContainer>
        {!isMobile ? (
          <>
            <GridContainerWrap>
              <GridContainer width="20%" height="100%">
                <Card
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    backgroundColor: "#f5b901",
                    height: "150px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className="Cards"
                >
                  <CardContent
                    style={{
                      fontSize: "1.3rem",
                      width: "95%",
                      height: "85%",
                      borderRadius: "10px",
                      backgroundColor: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CurrentTime />
                  </CardContent>
                </Card>
                <FormBoxWrap className="FormBoxWrap">
                  <FormBox>
                    <tbody>
                      <tr>
                        <td>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <GridTitle style={{ width: "150px" }}>
                              등원예정 :
                            </GridTitle>
                            <Button
                              type={"button"}
                              onClick={() => {
                                const today = filters.frdt;
                                const yesterday = new Date(today);
                                yesterday.setDate(today.getDate() - 1);
                                setFilters((prev: any) => ({
                                  ...prev,
                                  frdt: yesterday,
                                }));
                              }}
                              icon="arrow-60-left"
                              fillMode="flat"
                            />

                            <DatePicker
                              name="frdt"
                              value={filters.frdt}
                              format="yyyy-MM-dd"
                              onChange={filterInputChange}
                            />
                            <Button
                              type={"button"}
                              onClick={() => {
                                const today = filters.frdt;
                                const tomorrow = new Date(today);
                                tomorrow.setDate(today.getDate() + 1);
                                setFilters((prev: any) => ({
                                  ...prev,
                                  frdt: tomorrow,
                                }));
                              }}
                              icon="arrow-60-right"
                              fillMode="flat"
                            />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
                <GridContainer
                  style={{
                    height: webheight,
                    overflowY: "auto",
                    border: "3px solid #f5b901",
                    borderRadius: "10px",
                  }}
                >
                  <Grid container spacing={2}>
                    {cardOptionData.total == 0 ? (
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Card
                          style={{
                            width: "100%",
                            marginRight: "15px",
                            borderRadius: "10px",
                            backgroundColor: "#f5b901",
                          }}
                        >
                          <CardContent
                            style={{
                              fontSize: "1.2rem",
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            X
                          </CardContent>
                        </Card>
                      </Grid>
                    ) : (
                      cardOptionData.data.map((item: any) => (
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          <Card
                            style={{
                              width: "100%",
                              marginRight: "15px",
                              borderRadius: "10px",
                              backgroundColor: "#f5b901",
                            }}
                          >
                            <CardContent
                              style={{
                                fontSize: "1.2rem",
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <div style={{ float: "left" }}>
                                {
                                  classListData.find(
                                    (items: any) => items.sub_code == item.class
                                  )?.code_name
                                }
                              </div>
                              <div style={{ float: "right" }}>
                                {item.cnt}마리
                              </div>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                </GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>변경권 신청 확인</GridTitle>
                </GridTitleContainer>
                <Card
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    backgroundColor: "#f5b901",
                    height: "100px",
                    cursor: "pointer",
                  }}
                  className="Cards2"
                  onClick={(e) => onAdjustWndClick()}
                >
                  <CardContent
                    style={{
                      fontSize: "1.2rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "white",
                    }}
                  >
                    <div style={{ float: "left" }}>승인대기</div>
                    <div style={{ float: "right" }}>{adjcnt}건</div>
                  </CardContent>
                </Card>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>부가서비스 신청 확인</GridTitle>
                </GridTitleContainer>
                <Card
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    backgroundColor: "#f5b901",
                    height: "100px",
                  }}
                  className="Cards3"
                >
                  <CardContent
                    style={{
                      fontSize: "1.2rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "white",
                    }}
                  >
                    <div style={{ float: "left" }}>승인대기</div>
                    <div style={{ float: "right" }}>{addcnt}건</div>
                  </CardContent>
                </Card>
              </GridContainer>
              <GridContainer width={`calc(30% - ${GAP}px)`}>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>회원권 연장 확인</GridTitle>
                </GridTitleContainer>
                <ScrollableContainer style={{ height: webheight2 }}>
                  <div className="scroll-wrapper">
                    {questionDataResult.data.map((item, idx) => (
                      <AdminQuestionBox key={idx}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <p
                            style={{
                              color: "#939393",
                              fontSize: "0.7rem",
                              marginBottom: "5px",
                            }}
                          >
                            {
                              classListData.find(
                                (items: any) => items.sub_code == item.class
                              )?.code_name
                            }
                          </p>
                          <div
                            className={`status ${
                              item.janqty == 1
                                ? "Y"
                                : item.janqty == 0
                                ? "R"
                                : ""
                            }`}
                          >
                            {item.custnm}
                          </div>
                        </div>
                        <div>
                          <p className="title" style={{ fontSize: "0.9rem" }}>
                            유효기간 : {dateformat2(item.enddt)}
                          </p>
                          <p className="customer">잔여 등원 : {item.janqty}</p>
                        </div>
                        <div className="date">
                          <p>
                            <Button themeColor={"primary"}>카톡</Button>
                          </p>
                        </div>
                      </AdminQuestionBox>
                    ))}
                  </div>
                </ScrollableContainer>
              </GridContainer>
              <GridContainer width={`calc(25% - ${GAP}px)`}>
                <GridTitleContainer className="ButtonContainer4">
                  <GridTitle>잔여포인트</GridTitle>
                </GridTitleContainer>
                <div style={{ height: webheight3 }}></div>
              </GridContainer>
              <GridContainer width={`calc(25% - ${GAP}px)`}>
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer5">
                    <GridTitle>공지사항</GridTitle>
                  </GridTitleContainer>
                  <GridKendo
                    style={{ height: webheight4 }}
                    data={process(
                      mainnoticeDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]:
                          mainnoticeselectedState[idGetter2(row)],
                      })),
                      mainnoticeDataState
                    )}
                    {...mainnoticeDataState}
                    onDataStateChange={onMainNoticeDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY2}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onMainNoticeSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainnoticeDataResult.total}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainNoticeSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    onRowDoubleClick={onRowDoubleClick}
                  >
                    <GridColumn field="title" title="제목" />
                    <GridColumn field="contents2" title="내용" />
                  </GridKendo>
                </GridContainer>
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer6">
                    <GridTitle>시스템 업데이트 공지사항</GridTitle>
                  </GridTitleContainer>
                  <GridKendo
                    style={{ height: webheight5 }}
                    data={process(
                      noticeDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: noticeselectedState[idGetter(row)],
                      })),
                      noticeDataState
                    )}
                    {...noticeDataState}
                    onDataStateChange={onNoticeDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={noticeDataResult.total}
                    //정렬기능
                    sortable={true}
                    onSortChange={onNoticeSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn field="title" title="제목" />
                    <GridColumn field="contents" title="내용" />
                  </GridKendo>
                </GridContainer>
              </GridContainer>
            </GridContainerWrap>
          </>
        ) : (
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer style={{ height: mobileheight, overflow: "auto" }}>
                <Card
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    backgroundColor: "#f5b901",
                    height: "150px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className="Cards"
                >
                  <CardContent
                    style={{
                      fontSize: "1.3rem",
                      width: "95%",
                      height: "85%",
                      borderRadius: "10px",
                      backgroundColor: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CurrentTime />
                  </CardContent>
                </Card>
                <GridTitleContainer className="FormBoxWrap">
                  <GridTitle>등원예정</GridTitle>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      type={"button"}
                      onClick={() => {
                        const today = filters.frdt;
                        const yesterday = new Date(today);
                        yesterday.setDate(today.getDate() - 1);
                        setFilters((prev: any) => ({
                          ...prev,
                          frdt: yesterday,
                        }));
                      }}
                      icon="arrow-60-left"
                      fillMode="flat"
                    />
                    <div style={{ width: `calc(100% - 60px)` }}>
                      <DatePicker
                        name="frdt"
                        value={filters.frdt}
                        format="yyyy-MM-dd"
                        onChange={filterInputChange}
                      />
                    </div>
                    <Button
                      type={"button"}
                      onClick={() => {
                        const today = filters.frdt;
                        const tomorrow = new Date(today);
                        tomorrow.setDate(today.getDate() + 1);
                        setFilters((prev: any) => ({
                          ...prev,
                          frdt: tomorrow,
                        }));
                      }}
                      icon="arrow-60-right"
                      fillMode="flat"
                    />
                  </div>
                </GridTitleContainer>
                <GridContainer
                  style={{
                    height: "500px",
                    overflowY: "auto",
                    border: "3px solid #f5b901",
                    borderRadius: "10px",
                  }}
                >
                  <Grid container spacing={2}>
                    {cardOptionData.total == 0 ? (
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Card
                          style={{
                            width: "100%",
                            marginRight: "15px",
                            borderRadius: "10px",
                            backgroundColor: "#f5b901",
                          }}
                        >
                          <CardContent
                            style={{
                              fontSize: "1.2rem",
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            X
                          </CardContent>
                        </Card>
                      </Grid>
                    ) : (
                      cardOptionData.data.map((item: any) => (
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          <Card
                            style={{
                              width: "100%",
                              marginRight: "15px",
                              borderRadius: "10px",
                              backgroundColor: "#f5b901",
                            }}
                          >
                            <CardContent
                              style={{
                                fontSize: "1.2rem",
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <div style={{ float: "left" }}>
                                {
                                  classListData.find(
                                    (items: any) => items.sub_code == item.class
                                  )?.code_name
                                }
                              </div>
                              <div style={{ float: "right" }}>
                                {item.cnt}마리
                              </div>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                </GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>변경권 신청 확인</GridTitle>
                </GridTitleContainer>
                <Card
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    backgroundColor: "#f5b901",
                    height: "100px",
                  }}
                  className="Cards2"
                  onClick={(e) => onAdjustWndClick()}
                >
                  <CardContent
                    style={{
                      fontSize: "1.2rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "white",
                      height: "75%",
                    }}
                  >
                    <div style={{ float: "left" }}>승인대기</div>
                    <div style={{ float: "right" }}>{adjcnt}건</div>
                  </CardContent>
                </Card>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>부가서비스 신청 확인</GridTitle>
                </GridTitleContainer>
                <Card
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    backgroundColor: "#f5b901",
                    height: "100px",
                  }}
                >
                  <CardContent
                    style={{
                      fontSize: "1.2rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "white",
                      height: "75%",
                    }}
                  >
                    <div style={{ float: "left" }}>승인대기</div>
                    <div style={{ float: "right" }}>{addcnt}건</div>
                  </CardContent>
                </Card>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>회원권 연장 확인</GridTitle>
                </GridTitleContainer>
                <ScrollableContainer style={{ height: mobileheight2 }}>
                  <div className="scroll-wrapper">
                    {questionDataResult.data.map((item, idx) => (
                      <AdminQuestionBox key={idx}>
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <p
                              style={{
                                color: "#939393",
                                fontSize: "0.7rem",
                                marginBottom: "5px",
                              }}
                            >
                              {
                                classListData.find(
                                  (items: any) => items.sub_code == item.class
                                )?.code_name
                              }
                            </p>
                            <div
                              className={`status ${
                                item.janqty == 1
                                  ? "Y"
                                  : item.janqty == 0
                                  ? "R"
                                  : ""
                              }`}
                            >
                              {item.custnm}
                            </div>
                          </div>
                          <div className="title" style={{ margin: "0 2px" }}>
                            <p
                              style={{
                                marginBottom: "3px",
                                fontSize: "0.9rem",
                              }}
                            >
                              유효기간 : {dateformat2(item.enddt)}
                            </p>
                            <p>잔여 등원 : {item.janqty}</p>
                          </div>
                          <div className="date">
                            <p>
                              <Button themeColor={"primary"}>카톡</Button>
                            </p>
                          </div>
                        </div>
                      </AdminQuestionBox>
                    ))}
                  </div>
                </ScrollableContainer>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer4">
                  <GridTitle>잔여포인트</GridTitle>
                </GridTitleContainer>
                <div style={{ height: mobileheight3 }}></div>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={3}>
              <GridContainer width="100%">
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer5">
                    <GridTitle>공지사항</GridTitle>
                  </GridTitleContainer>
                  <GridKendo
                    style={{ height: mobileheight4 }}
                    data={process(
                      mainnoticeDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]:
                          mainnoticeselectedState[idGetter2(row)],
                      })),
                      mainnoticeDataState
                    )}
                    {...mainnoticeDataState}
                    onDataStateChange={onMainNoticeDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY2}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onMainNoticeSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainnoticeDataResult.total}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainNoticeSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    onRowDoubleClick={onRowDoubleClick}
                  >
                    <GridColumn field="title" title="제목" />
                    <GridColumn field="contents2" title="내용" />
                  </GridKendo>
                </GridContainer>
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer6">
                    <GridTitle>시스템 업데이트 공지사항</GridTitle>
                  </GridTitleContainer>
                  <GridKendo
                    style={{ height: mobileheight5 }}
                    data={process(
                      noticeDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: noticeselectedState[idGetter(row)],
                      })),
                      noticeDataState
                    )}
                    {...noticeDataState}
                    onDataStateChange={onNoticeDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={noticeDataResult.total}
                    //정렬기능
                    sortable={true}
                    onSortChange={onNoticeSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn field="contents" title="내용" />
                  </GridKendo>
                </GridContainer>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        )}
        {detailWindowVisible2 && (
          <DetailWindow2
            getVisible={setDetailWindowVisible2}
            workType={"U"} //신규 : N, 수정 : U
            datnum={detailFilters.datnum}
            reloadData={(returnString: string) => {
              setMainNoticeFilters((prev) => ({
                ...prev,
                find_row_value: returnString,
                isSearch: true,
              }));
            }}
            para={detailParameters}
            modal={true}
          />
        )}
        {adjustWindowVisible && (
          <AdjustApprovalWindow
            setVisible={setAdjustWindowVisible}
            modal={true}
          />
        )}
      </div>
    </>
  );
};

export default Main;
