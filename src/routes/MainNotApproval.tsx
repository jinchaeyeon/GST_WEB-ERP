import { DataResult, State, process } from "@progress/kendo-data-query";
import { getter } from "@progress/kendo-react-common";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridFooterCellProps,
} from "@progress/kendo-react-grid";
import React, { CSSProperties, useCallback, useEffect, useState } from "react";
// ES2015 module syntax
import { Button } from "@progress/kendo-react-buttons";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  DayView,
  MonthView,
  Scheduler,
  SchedulerItem,
  SchedulerItemProps,
  WeekView,
} from "@progress/kendo-react-scheduler";
import { bytesToBase64 } from "byte-base64";
import { useRecoilState } from "recoil";
import {
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  MainTopContainer,
} from "../CommonStyled";
import CenterCell from "../components/Cells/CenterCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseParaPc,
  chkScrollHandler,
  convertDateToStr,
  getQueryFromBizComponent,
  useGeoLocation,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { LayoutSquareRead } from "../components/DnD/LayoutSquareRead";
import { PieceRead } from "../components/DnD/PieceRead";
import { useApi } from "../hooks/api";
import { OSState, loginResultState, sessionItemState } from "../store/atoms";
import { Iparameters } from "../store/types";

const DATA_ITEM_KEY = "datnum";

const boardStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexWrap: "wrap",
};
const containerStyle: CSSProperties = {
  width: "100%",
  height: "73vh",
};

const Main: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [loginResult, setLoginResult] = useRecoilState(loginResultState);
  const [visible, setVisible] = useState(false);
  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  const userId = loginResult ? loginResult.userId : "";
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  const geoLocation = useGeoLocation();
  const [osstate, setOSState] = useRecoilState(OSState);

  useEffect(() => {
    fetchSessionItem();
    // if (token && sessionUserId == "") fetchSessionItem();
  }, [sessionUserId]);

  let sessionOrgdiv = sessionItem.find(
    (sessionItem) => sessionItem.code == "orgdiv"
  )!.value;
  let sessionLocation = sessionItem.find(
    (sessionItem) => sessionItem.code == "location"
  )!.value;

  if (sessionOrgdiv == "") sessionOrgdiv = "01";
  if (sessionLocation == "") sessionLocation = "01";

  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HOME", setCustomOptionData);

  const [noticeDataState, setNoticeDataState] = useState<State>({
    sort: [],
  });

  const [workOrderDataState, setWorkOrderDataState] = useState<State>({
    sort: [],
  });
  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });

  const [noticeDataResult, setNoticeDataResult] = useState<DataResult>(
    process([], noticeDataState)
  );

  const [workOrderDataResult, setWorkOrderDataResult] = useState<DataResult>(
    process([], workOrderDataState)
  );

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  type TSchedulerDataResult = {
    id: number;
    title: string;
    start: Date;
    end: Date;
  };

  const [schedulerDataResult, setSchedulerDataResult] = useState<
    TSchedulerDataResult[]
  >([]);

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [tabSelected, setTabSelected] = React.useState(0);
  const [tabSelected2, setTabSelected2] = React.useState(0);
  const [approvalValueState, setApprovalValueState] = useState({
    app: 0,
    ref: 0,
    rtr: 0,
  });

  const [workTimeDataResult, setWorkTimeDataResult] = useState({
    strtime: "",
    endtime: "",
  });

  const [noticePgNum, setNoticePgNum] = useState(1);
  const [workOrderPgNum, setWorkOrderPgNum] = useState(1);

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

  const [schedulerFilter, setSchedulerFilter] = useState({
    cboSchedulerType: "MY",
    user_id: userId,
    isSearch: false,
  });

  const [layoutFilter, setLayoutFilter] = useState({
    pgSize: PAGE_SIZE,
    worktype: "process_layout",
    isSearch: true,
  });

  const layoutParameters: Iparameters = {
    procedureName: "sys_sel_default_home_web",
    pageNumber: 1,
    pageSize: layoutFilter.pgSize,
    parameters: {
      "@p_work_type": layoutFilter.worktype,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_user_id": userId,
      "@p_frdt": "",
      "@p_todt": "",
      "@p_ref_date": "",
      "@p_ref_key": "",
    },
  };

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

  const schedulerParameters: Iparameters = {
    procedureName: "sys_sel_default_home_web",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": schedulerFilter.cboSchedulerType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_user_id": schedulerFilter.user_id,
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

  const fetchWorkTime = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", workTimeParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
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

    if (data.isSuccess == true) {
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

    if (data.isSuccess == true) {
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

    if (data.isSuccess == true) {
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

    if (data.isSuccess == true) {
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

  const fetchScheduler = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", schedulerParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true && data.tables[0]) {
      let rows = data.tables[0].Rows.map((row: any) => ({
        ...row,
        id: row.datnum,
        title: row.title,
        start: new Date(row.strtime),
        end: new Date(row.endtime),
      }));

      setSchedulerDataResult(rows);
    }
    setSchedulerFilter((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  const fetchLayout = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", layoutParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true && data.tables[0]) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;
      const totalRowCnt2 = data.tables[1].RowCount;
      const rows2 = data.tables[1].Rows;

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setDetailDataResult((prev) => {
        return {
          data: rows2,
          total: totalRowCnt2 == -1 ? 0 : totalRowCnt2,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow = rows[0];

        const width = 100 / selectedRow.col_cnt;
        const height = 100 / selectedRow.row_cnt;
        const squareStyle: CSSProperties = {
          width: width + "%",
          height: height + "%",
        };
        let arrays = [];
        const datas = rows2.filter(
          (item: any) => selectedRow.layout_key == item.layout_key
        );

        for (let i = 0; i < selectedRow.row_cnt; i++) {
          for (let j = 0; j < selectedRow.col_cnt; j++) {
            arrays.push(renderSquare(i, j, squareStyle, datas));
          }
        }
        setSquares(arrays);
      }
    }
    setLayoutFilter((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  useEffect(() => {
    if (sessionItem) {
      fetchWorkTime();
      fetchApproaval();
      fetchNoticeGrid();
      fetchWorkOrderGrid();
    }
  }, []);

  useEffect(() => {
    if (schedulerFilter.isSearch == true) {
      fetchScheduler();
    }
  }, [schedulerFilter]);

  useEffect(() => {
    if (layoutFilter.isSearch == true) {
      fetchLayout();
    }
  }, [layoutFilter]);

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
  const displayDate: Date = new Date();

  //스케줄러조회조건 Change 함수 => 사용자가 선택한 드롭다운리스트 값을 조회 파라미터로 세팅
  const schedulerFilterChange = (e: any) => {
    const { name, value } = e;

    setSchedulerFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      if (data.isSuccess == true) {
        const rows = data.tables[0].Rows;
        setSessionItem(
          rows
            .filter((item: any) => item.class == "Session")
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

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setSchedulerFilter((prev) => ({
        ...prev,
        cboSchedulerType: defaultOption.find(
          (item: any) => item.id == "cboSchedulerType"
        )?.valueCode,
        isSearch: true,
      }));
      setLayoutFilter((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [colorData, setColorData] = useState<any[]>([]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_APPOINTMENT_COLOR", setBizComponentData);

  useEffect(() => {
    if (bizComponentData !== null) {
      const colorQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_APPOINTMENT_COLOR"
        )
      );

      fetchQuery(colorQueryStr, setColorData);
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

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const CustomItem = (props: SchedulerItemProps) => {
    let colorCode = "";
    if (props.dataItem.colorID != undefined) {
      if (
        typeof props.dataItem.colorID == "number" ||
        typeof props.dataItem.colorID == "string"
      ) {
        colorCode =
          colorData.find(
            (item: any) => item.sub_code == props.dataItem.colorID
          ) == undefined
            ? ""
            : colorData.find(
                (item: any) => item.sub_code == props.dataItem.colorID
              ).color;
      } else {
        colorCode =
          colorData.find(
            (item: any) => item.sub_code == props.dataItem.colorID.sub_code
          ) == undefined
            ? ""
            : colorData.find(
                (item: any) => item.sub_code == props.dataItem.colorID.sub_code
              ).color;
      }
    }
    return (
      <SchedulerItem
        {...props}
        style={{
          ...props.style,
          backgroundColor: colorCode,
        }}
      />
    );
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

  const handleSelectTab2 = (e: any) => {
    setTabSelected2(e.selected);
    const selectedRow = mainDataResult.data[e.selected];

    const width = 100 / selectedRow.col_cnt;
    const height = 100 / selectedRow.row_cnt;
    const squareStyle: CSSProperties = {
      width: width + "%",
      height: height + "%",
    };
    let arrays = [];
    const datas = detailDataResult.data.filter(
      (item) => mainDataResult.data[e.selected].layout_key == item.layout_key
    );

    for (let i = 0; i < selectedRow.row_cnt; i++) {
      for (let j = 0; j < selectedRow.col_cnt; j++) {
        arrays.push(renderSquare(i, j, squareStyle, datas));
      }
    }
    setSquares(arrays);
  };

  const [layoutTab, setLayoutTab] = useState<any[]>([]);
  const [squares, setSquares] = useState<any[]>([]);

  useEffect(() => {
    let arrays = [];
    for (let i = 0; i < mainDataResult.data.length; i++) {
      var name: string = mainDataResult.data[i].layout_name;
      arrays.push(
        <TabStripTab title={name}>
          <div style={containerStyle}>
            <div style={boardStyle}>{squares}</div>
          </div>
        </TabStripTab>
      );
    }
    setLayoutTab(arrays);
  }, [mainDataResult, tabSelected2, tabSelected]);

  function renderSquare(
    row: number,
    col: number,
    squareStyle: CSSProperties,
    knightLists: any[]
  ) {
    const data = knightLists.filter(
      (item: any) => item.col_index == col && item.row_index == row
    );

    return (
      <div key={`${row}${col}`} style={squareStyle}>
        <LayoutSquareRead x={row} y={col}>
          <PieceRead
            isKnight={knights(data, row, col)}
            list={data}
            info={data}
          />
        </LayoutSquareRead>
      </div>
    );
  }

  function knights(data: any[], x: number, y: number) {
    let valid = false;
    data.map((item) => {
      if (item.row_index == x && item.col_index == y) {
        valid = true;
      }
    });
    return valid;
  }

  return (
    <>
      <MainTopContainer>
        <ButtonContainer>
          <Button icon={"home"} fillMode={"flat"} themeColor={"primary"}>
            HOMEPAGE
          </Button>
        </ButtonContainer>
      </MainTopContainer>
      <GridContainerWrap>
        <GridContainer width="65%">
          <TabStrip
            style={{ width: "100%" }}
            selected={tabSelected}
            onSelect={handleSelectTab}
          >
            <TabStripTab title="업무 달력">
              <GridContainer>
                {osstate == true ? (
                  <div
                    style={{
                      backgroundColor: "#ccc",
                      height: "718px",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    현재 OS에서는 지원이 불가능합니다.
                  </div>
                ) : (
                  <>
                    <GridTitleContainer>
                      <GridTitle></GridTitle>
                      {customOptionData !== null && (
                        <div>
                          <CustomOptionComboBox
                            name="cboSchedulerType"
                            value={schedulerFilter.cboSchedulerType}
                            customOptionData={customOptionData}
                            changeData={schedulerFilterChange}
                          />
                        </div>
                      )}
                    </GridTitleContainer>
                    <Scheduler
                      height={"718px"}
                      data={schedulerDataResult}
                      defaultDate={displayDate}
                      item={CustomItem}
                    >
                      <MonthView />
                      <DayView />
                      <WeekView />
                    </Scheduler>
                  </>
                )}
              </GridContainer>
            </TabStripTab>
            <TabStripTab
              title="프로세스 레이아웃"
              disabled={mainDataResult.total == 0 ? true : false}
            >
              <TabStrip
                style={{ width: "100%" }}
                selected={tabSelected2}
                onSelect={handleSelectTab2}
              >
                {layoutTab}
              </TabStrip>
            </TabStripTab>
          </TabStrip>
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
  );
};

export default Main;
