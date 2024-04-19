import { DataResult, State, process } from "@progress/kendo-data-query";
import { getter } from "@progress/kendo-react-common";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridFooterCellProps,
} from "@progress/kendo-react-grid";
import React, { useCallback, useEffect, useState } from "react";
// ES2015 module syntax
import { Button } from "@progress/kendo-react-buttons";
import { useRecoilState } from "recoil";
import {
  ApprovalBox,
  ApprovalInner,
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  MainTopContainer,
  MainWorkStartEndContainer,
  TextContainer,
} from "../CommonStyled";
import CenterCell from "../components/Cells/CenterCell";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseParaPc,
  chkScrollHandler,
  convertDateToStr,
  useGeoLocation,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FlowChartReadOnly from "../components/Layout/FlowChartReadOnly";
import { useApi } from "../hooks/api";
import { loginResultState, sessionItemState } from "../store/atoms";
import { Iparameters } from "../store/types";

var index = 0;

const DATA_ITEM_KEY = "datnum";

const SY_B0060W: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();

  let deviceWidth = window.innerWidth;
  let deviceHeight = window.innerHeight;

  let isMobile = deviceWidth <= 1200;

  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [loginResult, setLoginResult] = useRecoilState(loginResultState);
  const [visible, setVisible] = useState(false);
  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  const userId = loginResult ? loginResult.userId : "";
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  const geoLocation = useGeoLocation();

  useEffect(() => {
    fetchSessionItem();
  }, [sessionUserId]);

  let sessionOrgdiv = sessionItem.find(
    (sessionItem) => sessionItem.code == "orgdiv"
  )!.value;
  let sessionLocation = sessionItem.find(
    (sessionItem) => sessionItem.code == "location"
  )!.value;

  if (sessionOrgdiv === "") sessionOrgdiv = "01";
  if (sessionLocation === "") sessionLocation = "01";

  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SY_B0060W", setCustomOptionData);

  const [noticeDataState, setNoticeDataState] = useState<State>({
    sort: [],
  });

  const [workOrderDataState, setWorkOrderDataState] = useState<State>({
    sort: [],
  });

  const [noticeDataResult, setNoticeDataResult] = useState<DataResult>(
    process([], noticeDataState)
  );

  const [workOrderDataResult, setWorkOrderDataResult] = useState<DataResult>(
    process([], workOrderDataState)
  );

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [approvalValueState, setApprovalValueState] = useState({
    app: 0,
    ref: 0,
    rtr: 0,
  });

  const [workTimeDataResult, setWorkTimeDataResult] = useState({
    strtime: "",
    endtime: "",
  });
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [noticePgNum, setNoticePgNum] = useState(1);
  const [workOrderPgNum, setWorkOrderPgNum] = useState(1);

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Layout",
    orgdiv: sessionOrgdiv,
    pgNum: 1,
  });
  const [filters2, setFilters2] = useState({
    orgdiv: "01",
    location: "",
    layout_key: "",
    layout_id: "",
    layout_name: "",
    attdatnum: "",
  });

  const [noticeFilter, setNoticeFilter] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Notice",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    user_id: userId,
    frdt: "",
    todt: "",
    ref_date: new Date(),
    ref_key: "N",
  });

  const [workOrderFilter, setWorkOrderFilter] = useState({
    pgSize: PAGE_SIZE,
    work_type: "WorkOrderRequest",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    user_id: userId,
    frdt: "",
    todt: "",
    ref_date: new Date(),
    ref_key: "N",
  });

  const noticeParameters: Iparameters = {
    procedureName: "sys_sel_default_home_web",
    pageNumber: noticePgNum,
    pageSize: noticeFilter.pgSize,
    parameters: {
      "@p_work_type": noticeFilter.work_type,
      "@p_orgdiv": noticeFilter.orgdiv,
      "@p_location": noticeFilter.location,
      "@p_user_id": noticeFilter.user_id,
      "@p_frdt": noticeFilter.frdt,
      "@p_todt": noticeFilter.todt,
      "@p_ref_date": convertDateToStr(noticeFilter.ref_date),
      "@p_ref_key": noticeFilter.ref_key,
    },
  };

  const workOrderParameters: Iparameters = {
    procedureName: "sys_sel_default_home_web",
    pageNumber: workOrderPgNum,
    pageSize: 50,
    parameters: {
      "@p_work_type": workOrderFilter.work_type,
      "@p_orgdiv": workOrderFilter.orgdiv,
      "@p_location": workOrderFilter.location,
      "@p_user_id": workOrderFilter.user_id,
      "@p_frdt": workOrderFilter.frdt,
      "@p_todt": workOrderFilter.todt,
      "@p_ref_date": convertDateToStr(workOrderFilter.ref_date),
      "@p_ref_key": workOrderFilter.ref_key,
    },
  };

  const approvalParameters: Iparameters = {
    procedureName: "sys_sel_default_home_web",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": "Approval",
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_user_id": userId,
      "@p_frdt": "",
      "@p_todt": "",
      "@p_ref_date": "",
      "@p_ref_key": "N",
    },
  };

  const workTimeParameters: Iparameters = {
    procedureName: "P_HM_A1000W_Q",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "time_card",
      "@p_service_id": "",
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_user_id": userId,
      "@p_frdt": "",
      "@p_todt": "",
      "@p_dutydt": convertDateToStr(new Date()),
    },
  };

  const UpContentParameters: Iparameters = {
    procedureName: "sys_sel_default_home_web",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "VISIBLE",
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_user_id": userId,
      "@p_frdt": "",
      "@p_todt": "",
      "@p_ref_date": "",
      "@p_ref_key": "N",
    },
  };

  const fetchLayout = async () => {
    let data: any;

    const parameters: Iparameters = {
      procedureName: "P_SY_B0060W_Q ",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows[0];

      DetailView(rows);
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
  };

  const DetailView = async (item: any) => {
    let response: any;
    let data: any;
    const parameters = {
      attached: "list?attachmentNumber=" + item.attdatnum,
    };
    try {
      data = await processApi<any>("file-list", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null && data.isSuccess == true) {
      const rows = data.tables[0].Rows;

      try {
        response = await processApi<any>("file-download", {
          attached: rows[0].saved_name,
        });
      } catch (error) {
        response = null;
      }

      if (response !== null) {
        const blob = new Blob([response.data]);
        const filess = JSON.parse(await blob.text());
        setMainDataResult2({
          data: filess,
          total: filess.length,
        });
        setFilters2((prev) => ({
          ...prev,
          orgdiv: item.orgdiv,
          location: item.location,
          layout_key: item.layout_key,
          layout_id: item.layout_id,
          layout_name: item.layout_name,
          attdatnum: item.attdatnum,
        }));
      }
    }
  };

  const fetchWorkTime = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", workTimeParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const row = data.tables[0].Rows[0];
      const rowCount = data.tables[0].RowCount;

      if (rowCount > 0) {
        setWorkTimeDataResult({
          strtime: row.start_time,
          endtime: row.end_time,
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };

  const fetchUpContent = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", UpContentParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const row = data.tables[0].Rows[0].use_yn == "Y" ? false : true;
      setVisible(row);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };

  const fetchWorkTimeSaved = async (workType: "start" | "end") => {
    let data: any;
    let lat = 0;
    let lng = 0;

    if (geoLocation.loaded && geoLocation?.coordinates) {
      lat = geoLocation.coordinates?.lat;
      lng = geoLocation.coordinates?.lng;
    }

    const workTimeParaSaved: Iparameters = {
      procedureName: "P_HM_A1000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": workType,
        "@p_service_id": "",
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": sessionLocation,
        "@p_user_id": userId,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_dutydt": convertDateToStr(new Date()),
        "@p_lat": lat,
        "@p_lng": lng,
        "@p_id": userId,
        "@p_pc": pc,
      },
    };

    try {
      data = await processApi<any>("procedure", workTimeParaSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      fetchWorkTime();
    } else {
      alert(data.resultMessage);
    }
  };

  const fetchApproaval = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", approvalParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      const rowCount = data.tables[0].RowCount;

      if (rowCount > 0) {
        setApprovalValueState((prev) => ({
          ...prev,
          app: rows[0].cnt01,
          ref: rows[0].cnt02,
          rtr: rows[0].cnt03,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };

  const fetchNoticeGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", noticeParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setNoticeDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
    }
  };

  const fetchWorkOrderGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", workOrderParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setWorkOrderDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
    }
  };

  useEffect(() => {
    if (sessionItem) {
      fetchWorkTime();
      fetchApproaval();
      fetchNoticeGrid();
      fetchWorkOrderGrid();
      fetchUpContent();
      fetchLayout();
    }
  }, []);

  //스크롤 핸들러
  const onNoticeScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, noticePgNum, PAGE_SIZE))
      setNoticePgNum((prev) => prev + 1);
  };
  const onWorkOrderScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, workOrderPgNum, PAGE_SIZE))
      setWorkOrderPgNum((prev) => prev + 1);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onNoticeDataStateChange = (event: GridDataStateChangeEvent) => {
    setNoticeDataState(event.dataState);
  };
  const onWorkOrderDataStateChange = (event: GridDataStateChangeEvent) => {
    setWorkOrderDataState(event.dataState);
  };

  //그리드 푸터
  const noticeTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {noticeDataResult.total}건
      </td>
    );
  };

  const workOrderTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {workOrderDataResult.total}건
      </td>
    );
  };

  const onNoticeSortChange = (e: any) => {
    setNoticeDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onWorkOrderSortChange = (e: any) => {
    setWorkOrderDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const fetchSessionItem = useCallback(async () => {
    let data;
    try {
      const para: Iparameters = {
        procedureName: "sys_biz_configuration",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_user_id": userId,
        },
      };

      data = await processApi<any>("procedure", para);

      if (data.isSuccess === true) {
        const rows = data.tables[0].Rows;
        setSessionItem(
          rows
            .filter((item: any) => item.class === "Session")
            .map((item: any) => ({
              code: item.code,
              value: item.value,
            }))
        );
      }
    } catch (e: any) {
      console.log("menus error", e);
    }
  }, []);

  return (
    <>
      {isMobile ? (
        <GridContainerWrap>
          <Swiper
            className="leading_PDA_container"
            autoHeight={true}
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
            }}
          >
            <SwiperSlide key={0} className="leading_PDA_custom">
              <MainTopContainer>
                <ButtonContainer>
                  <Button
                    icon={"home"}
                    fillMode={"flat"}
                    themeColor={"primary"}
                  >
                    HOMEPAGE
                  </Button>
                  <Button
                    icon={"email"}
                    fillMode={"flat"}
                    themeColor={"primary"}
                  >
                    E-MAIL
                  </Button>
                </ButtonContainer>
              </MainTopContainer>

              {!visible ? (
                <>
                  <MainWorkStartEndContainer>
                    <TextContainer theme={"#2289c3"}>
                      {workTimeDataResult.strtime} -{" "}
                      {workTimeDataResult.endtime}
                    </TextContainer>
                    <Button
                      themeColor={"primary"}
                      onClick={() => {
                        fetchWorkTimeSaved("start");
                      }}
                    >
                      출근
                    </Button>
                    <Button
                      themeColor={"primary"}
                      onClick={() => {
                        fetchWorkTimeSaved("end");
                      }}
                    >
                      퇴근
                    </Button>
                  </MainWorkStartEndContainer>
                  <ApprovalBox style={{ width: `${deviceWidth - 30}px` }}>
                    <ApprovalInner>
                      <div>미결</div>
                      <div>{approvalValueState.app}</div>
                    </ApprovalInner>
                    <ApprovalInner>
                      <div>참조</div>
                      <div>{approvalValueState.ref}</div>
                    </ApprovalInner>
                    <ApprovalInner>
                      <div>반려</div>
                      <div>{approvalValueState.rtr}</div>
                    </ApprovalInner>
                    <Button
                      onClick={() => {
                        if (swiper) {
                          swiper.slideTo(1);
                          swiper.update();
                        }
                      }}
                      icon="info"
                    >
                      공지
                    </Button>
                  </ApprovalBox>
                </>
              ) : (
                ""
              )}
              <GridContainer
                style={{ width: `${deviceWidth - 30}px`, marginTop: "2vh" }}
              >
                <GridTitleContainer>
                  <GridTitle>레이아웃</GridTitle>
                </GridTitleContainer>
                <FlowChartReadOnly
                  data={mainDataResult2.data}
                  filters={filters2}
                />
              </GridContainer>
            </SwiperSlide>

            <SwiperSlide
              key={1}
              className="leading_PDA"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "left",
                  width: "100%",
                }}
              >
                <Button
                  onClick={() => {
                    if (swiper) {
                      swiper.slideTo(0);
                      swiper.update();
                    }
                  }}
                  icon="arrow-left"
                >
                  이전
                </Button>
              </div>
              <GridContainer
                style={{
                  minHeight: "70vh",
                  width: `${deviceWidth - 30}px`,
                  overflow: "scroll",
                }}
              >
                {" "}
                <GridContainer>
                  <GridTitleContainer>
                    <GridTitle>공지사항</GridTitle>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: `${deviceHeight * 0.35}px` }}
                    data={process(
                      noticeDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: detailSelectedState[idGetter(row)],
                      })),
                      noticeDataState
                    )}
                    {...noticeDataState}
                    onDataStateChange={onNoticeDataStateChange}
                    //선택기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    //정렬기능
                    sortable={true}
                    onSortChange={onNoticeSortChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={noticeDataResult.total}
                    onScroll={onNoticeScrollHandler}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn
                      field="recdt_week"
                      title="작성일"
                      cell={CenterCell}
                      footerCell={noticeTotalFooterCell}
                      width="140px"
                    />
                    <GridColumn
                      field="person"
                      title="작성자"
                      cell={CenterCell}
                      width="120px"
                    />
                    <GridColumn field="title" title="제목" />
                  </Grid>
                </GridContainer>
                <GridContainer>
                  <GridTitleContainer>
                    <GridTitle>업무지시요청</GridTitle>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: `${deviceHeight * 0.4}px` }}
                    data={process(workOrderDataResult.data, workOrderDataState)}
                    {...workOrderDataState}
                    onDataStateChange={onWorkOrderDataStateChange}
                    //정렬기능
                    sortable={true}
                    onSortChange={onWorkOrderSortChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={workOrderDataResult.total}
                    onScroll={onWorkOrderScrollHandler}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn
                      field="recdt_week"
                      title="작성일"
                      cell={CenterCell}
                      footerCell={workOrderTotalFooterCell}
                      width="140px"
                    />
                    <GridColumn
                      field="user_name"
                      title="작성자"
                      cell={CenterCell}
                      width="120px"
                    />
                    <GridColumn field="title" title="제목" />
                  </Grid>
                </GridContainer>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </GridContainerWrap>
      ) : (
        <>
          <MainTopContainer>
            <ButtonContainer>
              <Button icon={"home"} fillMode={"flat"} themeColor={"primary"}>
                HOMEPAGE
              </Button>
              <Button icon={"email"} fillMode={"flat"} themeColor={"primary"}>
                E-MAIL
              </Button>
            </ButtonContainer>
            {!visible ? (
              <>
                <MainWorkStartEndContainer>
                  <TextContainer theme={"#2289c3"}>
                    {workTimeDataResult.strtime} - {workTimeDataResult.endtime}
                  </TextContainer>
                  <Button
                    themeColor={"primary"}
                    onClick={() => {
                      fetchWorkTimeSaved("start");
                    }}
                  >
                    출근
                  </Button>
                  <Button
                    themeColor={"primary"}
                    onClick={() => {
                      fetchWorkTimeSaved("end");
                    }}
                  >
                    퇴근
                  </Button>
                </MainWorkStartEndContainer>
                <ApprovalBox>
                  <ApprovalInner>
                    <div>미결</div>
                    <div>{approvalValueState.app}</div>
                  </ApprovalInner>
                  <ApprovalInner>
                    <div>참조</div>
                    <div>{approvalValueState.ref}</div>
                  </ApprovalInner>
                  <ApprovalInner>
                    <div>반려</div>
                    <div>{approvalValueState.rtr}</div>
                  </ApprovalInner>
                </ApprovalBox>
              </>
            ) : (
              ""
            )}
          </MainTopContainer>
          <GridContainerWrap>
            <GridContainer width="65%">
              <GridTitleContainer>
                <GridTitle>레이아웃</GridTitle>
              </GridTitleContainer>
              <FlowChartReadOnly
                data={mainDataResult2.data}
                filters={filters2}
              />
            </GridContainer>
            <GridContainer width={`calc(35% - ${GAP}px)`}>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>공지사항</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "380px" }}
                  data={process(
                    noticeDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: detailSelectedState[idGetter(row)],
                    })),
                    noticeDataState
                  )}
                  {...noticeDataState}
                  onDataStateChange={onNoticeDataStateChange}
                  //선택기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  //정렬기능
                  sortable={true}
                  onSortChange={onNoticeSortChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={noticeDataResult.total}
                  onScroll={onNoticeScrollHandler}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="recdt_week"
                    title="작성일"
                    cell={CenterCell}
                    footerCell={noticeTotalFooterCell}
                    width="140px"
                  />
                  <GridColumn
                    field="person"
                    title="작성자"
                    cell={CenterCell}
                    width="120px"
                  />
                  <GridColumn field="title" title="제목" />
                </Grid>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>업무지시요청</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "380px" }}
                  data={process(workOrderDataResult.data, workOrderDataState)}
                  {...workOrderDataState}
                  onDataStateChange={onWorkOrderDataStateChange}
                  //정렬기능
                  sortable={true}
                  onSortChange={onWorkOrderSortChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={workOrderDataResult.total}
                  onScroll={onWorkOrderScrollHandler}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="recdt_week"
                    title="작성일"
                    cell={CenterCell}
                    footerCell={workOrderTotalFooterCell}
                    width="140px"
                  />
                  <GridColumn
                    field="user_name"
                    title="작성자"
                    cell={CenterCell}
                    width="120px"
                  />
                  <GridColumn field="title" title="제목" />
                </Grid>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
    </>
  );
};

export default SY_B0060W;
