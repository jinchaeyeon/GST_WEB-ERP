import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  GridFooterCellProps,
} from "@progress/kendo-react-grid";

import { Icon, getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";

// ES2015 module syntax
import {
  Scheduler,
  AgendaView,
  TimelineView,
  DayView,
  WeekView,
  MonthView,
} from "@progress/kendo-react-scheduler";
import {
  GridContainer,
  GridTitle,
  GridContainerWrap,
  ButtonContainer,
  GridTitleContainer,
  ApprovalInner,
  ApprovalBox,
  MainTopContainer,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { useRecoilState, useRecoilValue } from "recoil";
import { useApi } from "../hooks/api";
import {
  itemacntState,
  itemlvl1State,
  itemlvl2State,
  itemlvl3State,
  locationState,
} from "../store/atoms";
import { Iparameters } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  UseCommonQuery,
} from "../components/CommonFunction";
import { TCommonCodeData } from "../hooks/interfaces";
import {
  commonCodeDefaultValue,
  itemgradeQuery,
  itemlvl1Query,
  itemlvl2Query,
  itemlvl3Query,
  pageSize,
} from "../components/CommonString";
import CenterCell from "../components/Cells/CenterCell";
import CommonDropDownList from "../components/DropDownLists/CommonDropDownList";
//import {useAuth} from "../../hooks/auth";

const Main: React.FC = () => {
  const DATA_ITEM_KEY = "datnum";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
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

  const defaultData: any[] = [
    {
      id: 0,
      title: "Default Data",
      start: new Date("2021-01-01T08:30:00.000Z"),
      end: new Date("2021-01-01T09:00:00.000Z"),
    },
  ];
  const [schedulerDataResult, setSchedulerDataResult] = useState(defaultData);

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [approvalValueState, setApprovalValueState] = useState({
    app: 0,
    ref: 0,
    rtr: 0,
  });

  const [noticePgNum, setNoticePgNum] = useState(1);
  const [workOrderPgNum, setWorkOrderPgNum] = useState(1);

  const itemacntVal = useRecoilValue(itemacntState);
  const itemlvl1Val = useRecoilValue(itemlvl1State);
  const itemlvl2Val = useRecoilValue(itemlvl2State);
  const itemlvl3Val = useRecoilValue(itemlvl3State);
  const [locationVal, setLocationVal] = useRecoilState(locationState);

  const [noticeFilter, setNoticeFilter] = useState({
    pgSize: pageSize,
    work_type: "Notice",
    orgdiv: "01",
    location: "01",
    user_id: "admin",
    frdt: "",
    todt: "",
    ref_date: new Date(),
    ref_key: "N",
  });

  const [workOrderFilter, setWorkOrderFilter] = useState({
    pgSize: pageSize,
    work_type: "WorkOrderRequest",
    orgdiv: "01",
    location: "01",
    user_id: "admin",
    frdt: "",
    todt: "",
    ref_date: new Date(),
    ref_key: "N",
  });

  const [schedulerFilter, setSchedulerFilter] = useState({
    work_type: "MyScheduler",
  });
  const noticeParameters: Iparameters = {
    procedureName: "sys_sel_web_default_home",
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
    procedureName: "sys_sel_web_default_home",
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
    procedureName: "sys_sel_web_default_home",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": "Approval",
      "@p_orgdiv": "01",
      "@p_location": "01",
      "@p_user_id": "admin",
      "@p_frdt": "",
      "@p_todt": "",
      "@p_ref_date": "",
      "@p_ref_key": "N",
    },
  };

  const schedulerParameters: Iparameters = {
    procedureName: "sys_sel_web_default_home",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": schedulerFilter.work_type,
      "@p_orgdiv": "01",
      "@p_location": "01",
      "@p_user_id": "admin",
      "@p_frdt": "",
      "@p_todt": "",
      "@p_ref_date": "",
      "@p_ref_key": "N",
    },
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

      setApprovalValueState((prev) => ({
        ...prev,
        app: rows[0].cnt01,
        ref: rows[0].cnt02,
        rtr: rows[0].cnt03,
      }));
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

      setNoticeDataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowCnt,
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

      setWorkOrderDataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowCnt,
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

    if (data.isSuccess === true) {
      let rows = data.tables[0].Rows.map((row: any) => ({
        //...row,
        id: row.datnum,
        title: row.title,
        start: new Date(row.strtime),
        end: new Date(row.endtime),
      }));

      console.log("rows");
      console.log(rows);

      setSchedulerDataResult(rows);
    }
  };

  useEffect(() => {
    fetchApproaval();
    fetchNoticeGrid();
    fetchWorkOrderGrid();
  }, []);

  useEffect(() => {
    console.log(schedulerFilter);
    fetchScheduler();
  }, [schedulerFilter]);

  //그리드 리셋
  const resetAllGrid = () => {
    setNoticePgNum(1);
    setWorkOrderPgNum(1);
    setNoticeDataResult(process([], noticeDataState));
    setWorkOrderDataResult(process([], workOrderDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    // const newSelectedState = getSelectedState({
    //   event,
    //   selectedState: selectedState,
    //   dataItemKey: DATA_ITEM_KEY,
    // });
    // setSelectedState(newSelectedState);
    // const selectedIdx = event.startRowIndex;
    // const selectedRowData = event.dataItems[selectedIdx];
    // setNoticeFilter((prev) => ({
    //   ...prev,
    //   itemacnt: selectedRowData.itemacnt,
    //   itemcd: selectedRowData.itemcd,
    //   work_type: "DETAIL1",
    // }));
  };

  //디테일1 그리드 선택 이벤트 => 디테일2 그리드 조회
  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    // const newSelectedState = getSelectedState({
    //   event,
    //   selectedState: detailSelectedState,
    //   dataItemKey: DETAIL_DATA_ITEM_KEY,
    // });
    // setDetailSelectedState(newSelectedState);
    // const selectedIdx = event.startRowIndex;
    // const selectedRowData = event.dataItems[selectedIdx];
    // setWorkOrderFilter({
    //   ...workOrderFilter,
    //   lotnum: selectedRowData.lotnum,
    //   work_type: "DETAIL2",
    // });
  };

  //스크롤 핸들러
  const onNoticeScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, noticePgNum, pageSize))
      setNoticePgNum((prev) => prev + 1);
  };
  const onWorkOrderScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, workOrderPgNum, pageSize))
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

  //품목마스터 팝업
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const onNoticeSortChange = (e: any) => {
    setNoticeDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onWorkOrderSortChange = (e: any) => {
    setWorkOrderDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //공통코드 리스트 조회 (대분류, 중분류, 소분류, 품목등급)
  const [itemlvl1ListData, setItemlvl1ListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemlvl1Query, setItemlvl1ListData);

  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemlvl2Query, setItemlvl2ListData);

  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemlvl3Query, setItemlvl3ListData);

  const [itemgradeListData, setItemgradeListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemgradeQuery, setItemgradeListData);

  //공통코드 리스트 조회 후 그리드 데이터 세팅
  // useEffect(() => {
  //   setMainDataResult((prev) => {
  //     const rows = prev.data.map((row: any) => ({
  //       ...row,
  //       itemlvl1: itemlvl1ListData.find(
  //         (item: any) => item.sub_code === row.itemlvl1
  //       )?.code_name,
  //     }));

  //     console.log(rows);

  //     return {
  //       data: [...prev.data, ...rows],
  //       total: prev.total,
  //     };
  //   });
  // }, [itemlvl1ListData]);
  const displayDate: Date = new Date();

  //스케줄러조회조건 DropDownList Change 함수 => 사용자가 선택한 드롭다운리스트 값을 조회 파라미터로 세팅
  const filterDropDownListChange = (name: string, data: TCommonCodeData) => {
    setSchedulerFilter((prev) => ({
      ...prev,
      [name]: data.sub_code,
    }));
  };

  return (
    <>
      <MainTopContainer>
        <ButtonContainer>
          <Button
            icon={"home"}
            //fillMode="outline"
            themeColor={"primary"}
          >
            HOMEPAGE
          </Button>
          <Button
            icon={"email"}
            //fillMode="outline"
            themeColor={"primary"}
          >
            E-MAIL
          </Button>
        </ButtonContainer>
        <>
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
      </MainTopContainer>

      <GridContainerWrap>
        <GridContainer>
          <GridTitleContainer>
            <GridTitle>Work Calendar</GridTitle>
            <div>
              <CommonDropDownList
                name="work_type"
                queryStr={
                  "SELECT sub_code, code_name FROM comCodeMaster WHERE group_code='TO001'"
                }
                changeData={filterDropDownListChange}
                defaultValue={{ sub_code: "MyScheduler", code_name: "개인" }}
              />
            </div>
            {/* <ButtonContainer>
              <Button fillMode="outline">개인일정</Button>
              <Button fillMode="outline">생산계획</Button>
            </ButtonContainer> */}
          </GridTitleContainer>
          <Scheduler
            height={"718px"}
            data={schedulerDataResult}
            defaultDate={displayDate}
          >
            <MonthView />
            <DayView />
            <WeekView />
          </Scheduler>
        </GridContainer>
        <GridContainerWrap flexDirection="column" maxWidth="650px">
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>공지사항</GridTitle>
            </GridTitleContainer>
            <Grid
              style={{ height: "339px" }}
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
              onSelectionChange={onDetailSelectionChange}
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
              style={{ height: "339px" }}
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
        </GridContainerWrap>
      </GridContainerWrap>
    </>
  );
};

export default Main;
