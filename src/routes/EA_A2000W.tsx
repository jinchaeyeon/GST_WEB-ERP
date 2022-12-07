import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridHeaderSelectionChangeEvent,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBoxWrap,
  FilterBox,
  GridContainer,
  GridTitle,
  GridContainerWrap,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input, RadioGroup } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import YearCalendar from "../components/Calendars/YearCalendar";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseDesignInfo,
  UseMessages,
  UsePermissions,
  //UseMenuDefaults,
} from "../components/CommonFunction";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { IAttachmentData, IItemData } from "../hooks/interfaces";
import {
  COM_CODE_DEFAULT_VALUE,
  GNV_WIDTH,
  CLIENT_WIDTH,
  GRID_MARGIN,
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
  OLD_COMPANY,
} from "../components/CommonString";
import NumberCell from "../components/Cells/NumberCell";
import DateCell from "../components/Cells/DateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CommonRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { useRecoilState, useRecoilValue } from "recoil";
import { gridList } from "../store/columns/EA_A2000W_C";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import CashDisbursementVoucher from "../components/Prints/CashDisbursementVoucher";
import AbsenceRequest from "../components/Prints/AbsenceRequest";
import { CellRender, RowRender } from "../components/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import { Window } from "@progress/kendo-react-dialogs";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import { tokenState } from "../store/atoms";
import TopButtons from "../components/TopButtons";
import { bytesToBase64 } from "byte-base64";

const numberField: string[] = [];
const dateField = ["recdt", "time"];
let deletedCmtRows: object[] = [];

//그리드 별 키 필드값
const DATA_ITEM_KEY = "appnum";
const DETAIL_DATA_ITEM_KEY = "resno";
const DETAIL3_DATA_ITEM_KEY = "commseq";

const EA_A2000: React.FC = () => {
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);
  const detail3IdGetter = getter(DETAIL3_DATA_ITEM_KEY);
  const pathname: string = window.location.pathname.replace("/", "");
  const [token] = useRecoilState(tokenState);
  const userId = token ? token.userId : "";
  const companyCode = token ? token.companyCode : "";

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  // 권한 조회
  const [permissions, setPermissions] = useState<TPermissions | null>(
    OLD_COMPANY.includes(companyCode)
      ? {
          view: true,
          save: true,
          delete: true,
          print: true,
        }
      : null
  );

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  if (!OLD_COMPANY.includes(companyCode)) {
    UsePermissions(setPermissions);
    UseCustomOption(pathname, setCustomOptionData);
  }

  const [wordInfoData, setWordInfoData] = React.useState<any>(null);
  UseDesignInfo(pathname, setWordInfoData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_sysUserMaster_001,L_EA002,L_HU089,L_appyn,L_USERS,L_HU005,L_EA004,R_APPGB,R_APPYN,L_EA001",
    //부서,담당자,결재문서,근태구분,결재유무,사용자,직위,결재라인,결재관리구분,결재유무,결재구분
    setBizComponentData
  );

  const [appynListData, setAppynListData] = React.useState([
    { code: "", name: "" },
  ]);
  const [pgmgbListData, setPgmgbListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [personListData, setPersonListData] = React.useState([
    { code: "", name: "" },
  ]);
  const [postcdListData, setPostcdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [applineListData, setApplineListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [appgbListData, setAppgbListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_USERS")
      );

      const appynQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_appyn")
      );

      const pgmgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_EA002")
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU005")
      );
      const applineQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_EA004")
      );
      const appgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_EA001")
      );

      fetchQuery(userQueryStr, setPersonListData);
      fetchQuery(appynQueryStr, setAppynListData);
      fetchQuery(pgmgbQueryStr, setPgmgbListData);
      fetchQuery(postcdQueryStr, setPostcdListData);
      fetchQuery(applineQueryStr, setApplineListData);
      fetchQuery(appgbQueryStr, setAppgbListData);
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

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [detail1DataState, setDetail1DataState] = useState<State>({
    sort: [],
  });

  const [detail2DataState, setDetail2DataState] = useState<State>({
    sort: [],
  });

  const [detail3DataState, setDetail3DataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detail1DataResult, setDetail1DataResult] = useState<DataResult>(
    process([], detail1DataState)
  );

  const [detail2DataResult, setDetail2DataResult] = useState<DataResult>(
    process([], detail2DataState)
  );

  const [detail3DataResult, setDetail3DataResult] = useState<DataResult>(
    process([], detail3DataState)
  );

  const [selectedRowData, setSelectedRowData] = useState(null);

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detail3SelectedState, setDetail3SelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //그리드 별 페이지 넘버
  const [mainPgNum, setMainPgNum] = useState(1);
  const [detail1PgNum, setDetail1PgNum] = useState(1);
  const [detail2PgNum, setDetail2PgNum] = useState(1);

  const [isInitSearch, setIsInitSearch] = useState(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    radWorkType: "B",
    orgdiv: "01",
    user_id: userId,
    ymdStartDt: new Date(),
    ymdEndDt: new Date(),
    txtAppnm: "",
    cboPerson: "",
    cboPgmgb: "",
    cboDptcd: "",
    radAppyn: "N",
    appnum: "",
    cboStddiv: "",
    isFilterSet: false,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LRC",
    orgdiv: "01",
    appnum: "",
    pgmgb: "",
    attdatnum: "",
  });

  const [detailFilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "DETAIL2",
    orgdiv: "01",
    itemcd: "",
    itemnm: "",
    insiz: "",
    yyyymm: "",
    itemacnt: "",
    zeroyn: "%",
    lotnum: "",
    load_place: "",
    heatno: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    useyn: "Y",
    service_id: pathname,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_EA_A2000W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type":
        filters.radWorkType === "A"
          ? "MYPAGE"
          : filters.radWorkType === "B"
          ? "UNDECIDE"
          : filters.radWorkType === "C"
          ? "ALREADY"
          : filters.radWorkType === "F"
          ? "REF"
          : "",
      "@p_orgdiv": filters.orgdiv,
      "@p_user_id": filters.user_id,
      "@p_start_dt": convertDateToStr(filters.ymdStartDt),
      "@p_end_dt": convertDateToStr(filters.ymdEndDt),
      "@p_appnm": filters.txtAppnm,
      "@p_person": filters.radWorkType === "A" ? userId : filters.cboPerson,
      "@p_pgmgb": filters.cboPgmgb,
      "@p_dptcd": filters.cboDptcd,
      "@p_appyn": filters.radAppyn,
      "@p_appnum": filters.appnum,
      "@p_stddiv": filters.cboStddiv,
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_EA_A2000W_Q",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": detailFilters.work_type,
      "@p_orgdiv": detailFilters.orgdiv,
      "@p_user_id": filters.user_id,
      "@p_start_dt": convertDateToStr(filters.ymdStartDt),
      "@p_end_dt": convertDateToStr(filters.ymdEndDt),
      "@p_appnm": filters.txtAppnm,
      "@p_person": filters.cboPerson,
      "@p_pgmgb": filters.cboPgmgb,
      "@p_dptcd": filters.cboDptcd,
      "@p_appyn": filters.radAppyn,
      "@p_appnum": detailFilters.appnum,
      "@p_stddiv": filters.cboStddiv,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions?.view) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
  };

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (mainDataResult.total > 0) {
      const firstRowData = mainDataResult.data[0];
      setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });

      setDetailFilters((prev) => ({
        ...prev,
        [DATA_ITEM_KEY]: firstRowData[DATA_ITEM_KEY],
        pgmgb: firstRowData["pgmgb"],
        attdatnum: firstRowData["attdatnum"],
      }));

      setSelectedRowData(firstRowData);
    }
  }, [mainDataResult]);

  //그리드 데이터 조회
  const fetchDetailGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setDetail1DataResult((prev) => {
          return {
            data: [...rows],
            total: totalRowCnt,
          };
        });
      } else {
        setDetail1DataResult((prev) => {
          return {
            data: [],
            total: 0,
          };
        });
      }

      const totalRowCnt2 = data.tables[1].RowCount;
      const rows2 = data.tables[1].Rows;

      if (totalRowCnt2 > 0) {
        setDetail2DataResult((prev) => {
          return {
            data: [...rows2],
            total: totalRowCnt2,
          };
        });
      } else {
        setDetail2DataResult((prev) => {
          return {
            data: [],
            total: 0,
          };
        });
      }

      const totalRowCnt3 = data.tables[2].RowCount;
      const rows3 = data.tables[2].Rows;

      if (totalRowCnt3 > 0) {
        setDetail3DataResult((prev) => {
          return {
            data: [...rows3],
            total: totalRowCnt3,
          };
        });
      } else {
        setDetail3DataResult((prev) => {
          return {
            data: [],
            total: 0,
          };
        });
      }
    }
  };

  useEffect(() => {
    if (customOptionData !== null || OLD_COMPANY.includes(companyCode)) {
      fetchMainGrid();
    }
  }, [mainPgNum]);

  useEffect(() => {
    if (customOptionData !== null || OLD_COMPANY.includes(companyCode)) {
      fetchDetailGrid();
    }
  }, [detail1PgNum]);

  useEffect(() => {
    if (customOptionData !== null || OLD_COMPANY.includes(companyCode)) {
      resetAllDetailGrid();
      fetchDetailGrid();
    }
  }, [detailFilters]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
    setDetail1DataResult(process([], detail1DataState));
    setDetail2DataResult(process([], detail2DataState));
    setDetail3DataResult(process([], detail2DataState));
  };

  const resetAllDetailGrid = () => {
    setDetail1DataResult(process([], detail1DataState));
    setDetail2DataResult(process([], detail2DataState));
    setDetail3DataResult(process([], detail2DataState));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters((prev) => ({
      ...prev,
      [DATA_ITEM_KEY]: selectedRowData[DATA_ITEM_KEY],
      pgmgb: selectedRowData["pgmgb"],
      attdatnum: selectedRowData["attdatnum"],
    }));

    setSelectedRowData(selectedRowData);
  };

  const onMainHeaderSelectionChange = useCallback(
    (event: GridHeaderSelectionChangeEvent) => {
      const checkboxElement: any = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState: {
        [id: string]: boolean | number[];
      } = {};

      event.dataItems.forEach((item) => {
        newSelectedState[idGetter(item)] = checked;
      });

      setSelectedState(newSelectedState);
    },
    []
  );

  //디테일1 그리드 선택 이벤트 => 디테일2 그리드 조회
  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters2({
      ...detailFilters2,
      lotnum: selectedRowData.lotnum,
      work_type: "DETAIL2",
    });
  };

  const onDetail3SelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detail3SelectedState,
      dataItemKey: DETAIL3_DATA_ITEM_KEY,
    });
    setDetail3SelectedState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
  };
  const onDetail1ScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detail1PgNum, PAGE_SIZE))
      setDetail1PgNum((prev) => prev + 1);
  };
  const onDetail2ScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detail2PgNum, PAGE_SIZE))
      setDetail2PgNum((prev) => prev + 1);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onDetail1DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail1DataState(event.dataState);
  };
  const onDetail2DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail2DataState(event.dataState);
  };
  const onDetail3DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail3DataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const detail1TotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detail1DataResult.total}건
      </td>
    );
  };

  const detail2TotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detail2DataResult.total}건
      </td>
    );
  };
  const detail3TotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detail3DataResult.total}건
      </td>
    );
  };

  //품목마스터 팝업
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetail1SortChange = (e: any) => {
    setDetail1DataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetail2SortChange = (e: any) => {
    setDetail2DataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetail3SortChange = (e: any) => {
    setDetail3DataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        ymdStartDt: setDefaultDate(customOptionData, "ymdStartDt"),
        ymdEndDt: setDefaultDate(customOptionData, "ymdEndDt"),
        isFilterSet: true,
        // cboItemacnt: defaultOption.find(
        //   (item: any) => item.id === "cboItemacnt"
        // ).value,
        // radzeroyn: defaultOption.find((item: any) => item.id === "radzeroyn")
        //   .value,
      }));
    }
  }, [customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (OLD_COMPANY.includes(companyCode)) return;

    if (
      customOptionData !== null &&
      isInitSearch === false &&
      permissions !== null &&
      filters.isFilterSet
    ) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  const onAddClick = () => {
    let seq = 1;

    if (detail3DataResult.total > 0) {
      detail3DataResult.data.forEach((item) => {
        if (item[DETAIL3_DATA_ITEM_KEY] > seq) {
          seq = item[DETAIL3_DATA_ITEM_KEY];
        }
      });
      seq++;
    }

    const idx: number =
      Number(Object.getOwnPropertyNames(selectedState)[0]) ??
      //Number(planDataResult.data[0].idx) ??
      null;
    if (idx === null) return false;
    const selectedRowData = detail3DataResult.data.find(
      (item) => item[DETAIL3_DATA_ITEM_KEY] === idx
    );

    const newDataItem = {
      [DETAIL3_DATA_ITEM_KEY]: seq,
      // planno: selectedRowData.planno,
      time: convertDateToStr(new Date()),
      rowstatus: "N",
      insert_user: userId,
    };
    setDetail3DataResult((prev) => {
      return {
        data: [...prev.data, newDataItem],
        total: prev.total + 1,
      };
    });
  };

  const onRemoveClick = () => {
    //삭제 안 할 데이터 newData에 push, 삭제 데이터 deletedRows에 push
    let newData: any[] = [];

    detail3DataResult.data.forEach((item: any, index: number) => {
      if (!detail3SelectedState[item[DETAIL3_DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        deletedCmtRows.push(item);
      }
    });

    //newData 생성
    setDetail3DataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    //선택 상태 초기화
    setDetail3SelectedState({});
  };

  const onSaveClick = () => {
    const dataItem: { [name: string]: any } = detail3DataResult.data.filter(
      (item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      }
    );
    if (
      mainDataResult.data.length === 0 ||
      (dataItem.length === 0 && deletedCmtRows.length === 0)
    )
      return false;

    type TData = {
      comment: string[];
      rowstatus_s: string[];
      commseq_s: string[];
      time_s: string[];
    };

    let dataArr: TData = {
      comment: [],
      rowstatus_s: [],
      commseq_s: [],
      time_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { comment, rowstatus, commseq, time } = item;

      console.log("item");
      console.log(item);

      dataArr.comment.push(comment);
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.commseq_s.push(commseq);
      dataArr.time_s.push(time);
    });

    deletedCmtRows.forEach((item: any, idx: number) => {
      const { comment, commseq, time } = item;

      dataArr.rowstatus_s.push("D");
      dataArr.comment.push(comment);
      dataArr.commseq_s.push(commseq);
      dataArr.time_s.push(time);
    });

    setDetailParaDataSaved((prev) => ({
      ...prev,
      work_type: "CMT",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      comment: dataArr.comment.join("|"),
      commseq_s: dataArr.commseq_s.join("|"),
      time_s: dataArr.time_s.join("|"),
      appnum: Object.getOwnPropertyNames(selectedState)[0],
    }));
  };

  //계획 저장 파라미터 초기값
  const [detailParaDataSaved, setDetailParaDataSaved] = useState({
    work_type: "",
    orgdiv: "01",
    appnum: "",
    attdatnum: "",
    rtcomment: "",
    userid: userId,
    pc: "",
    pagediv: "",
    comment: "",
    form_id: pathname,
    rowstatus_s: "",
    commseq_s: "",
    time_s: "",
  });

  const detailParaSaved: Iparameters = {
    procedureName: "P_EA_A2000W_S ",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": detailParaDataSaved.work_type,
      "@p_orgdiv": detailParaDataSaved.orgdiv,
      "@p_appnum": detailParaDataSaved.appnum,
      "@p_attdatnum": detailParaDataSaved.attdatnum,
      "@p_rtcomment": detailParaDataSaved.rtcomment,
      "@p_userid": detailParaDataSaved.userid,
      "@p_pc": detailParaDataSaved.pc,
      "@p_pagediv": detailParaDataSaved.pagediv,
      "@p_comment": detailParaDataSaved.comment,
      "@p_form_id": detailParaDataSaved.form_id,
      "@p_rowstatus_s": detailParaDataSaved.rowstatus_s,
      "@p_commseq_s": detailParaDataSaved.commseq_s,
      "@p_time_s": detailParaDataSaved.time_s,
    },
  };

  const fetchDetailGridSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", detailParaSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert(findMessage(messagesData, "EA_A2000W_001"));

      if (detailParaDataSaved.work_type === "CMT") {
        setDetail1DataResult(process([], detail1DataState));
        setDetail2DataResult(process([], detail2DataState));
        setDetail3DataResult(process([], detail3DataState));
        fetchDetailGrid();
      } else {
        resetAllGrid();
        fetchMainGrid();
      }

      deletedCmtRows = [];
    } else {
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    //초기화
    setDetailParaDataSaved((prev) => ({ ...prev, work_type: "" }));
  };

  useEffect(() => {
    if (detailParaDataSaved.work_type !== "") fetchDetailGridSaved();
  }, [detailParaDataSaved]);

  const onDetail3ItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      detail3DataResult,
      setDetail3DataResult,
      DETAIL3_DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    const newData = detail3DataResult.data.map((item) =>
      item[DETAIL3_DATA_ITEM_KEY] === dataItem[DETAIL3_DATA_ITEM_KEY]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            [EDIT_FIELD]: field,
          }
        : {
            ...item,
            [EDIT_FIELD]: undefined,
          }
    );

    setDetail3DataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const exitEdit = () => {
    const newData = detail3DataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setDetail3DataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const processApproval = (workType: string) => {
    const dataItem: { [name: string]: any } = mainDataResult.data.filter(
      (item: any) => {
        return selectedState[item[DATA_ITEM_KEY]];
      }
    );
    if (dataItem.length === 0) {
      alert(findMessage(messagesData, "EA_A2000W_002"));
      return false;
    }

    type TData = {
      appnum: string[];
    };

    let dataArr: TData = {
      appnum: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { appnum } = item;

      dataArr.appnum.push(appnum);
    });

    setDetailParaDataSaved((prev) => ({
      ...prev,
      work_type: workType,
      appnum: dataArr.appnum.join("|"),
    }));
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    // setInitialVal((prev) => {
    //   return {
    //     ...prev,
    //     attdatnum: data.attdatnum,
    //     files:
    //       data.original_name +
    //       (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
    //   };
    // });
  };

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData[DATA_ITEM_KEY]]: true });

      setDetailFilters((prev) => ({
        ...prev,
        [DATA_ITEM_KEY]: rowData[DATA_ITEM_KEY],
        pgmgb: rowData["pgmgb"],
        attdatnum: rowData["attdatnum"],
      }));

      setSelectedRowData(rowData);
      setAttachmentsWindowVisible(true);
    };

    return (
      <td className="k-command-cell">
        {props.dataItem["attdatnum"] ? (
          <Button
            themeColor={"primary"}
            fillMode="outline"
            onClick={onEditClick}
            icon="file"
          ></Button>
        ) : (
          ""
        )}
      </td>
    );
  };
  const [previewVisible, setPreviewVisible] = React.useState<boolean>(false);

  const PreviewCell = (props: GridCellProps) => {
    const onPreviewClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData[DATA_ITEM_KEY]]: true });

      setDetailFilters((prev) => ({
        ...prev,
        [DATA_ITEM_KEY]: rowData[DATA_ITEM_KEY],
        pgmgb: rowData["pgmgb"],
        attdatnum: rowData["attdatnum"],
      }));

      setSelectedRowData(rowData);
      window.scrollTo(0, 0);
      setPreviewVisible((prev) => !prev);
    };

    return (
      <td className="k-command-cell">
        <Button
          themeColor={"primary"}
          fillMode="outline"
          onClick={onPreviewClick}
          icon="file"
        ></Button>
      </td>
    );
  };
  let deviceHeight = window.innerHeight;
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 768;

  const search = () => {
    resetAllGrid();
    fetchMainGrid();
  };

  return (
    <>
      <TitleContainer>
        <Title>결재관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
        <FilterBox className="FilterBox">
          <tbody>
            <tr>
              <th data-control-name="lblInsertdt">
                {wordInfoData !== null
                  ? wordInfoData.find(
                      (item: any) => item.controlName === "lblInsertdt"
                    ).wordText
                  : "작성일자"}
              </th>
              <td colSpan={3} className="expanded">
                <DatePicker
                  name="ymdStartDt"
                  value={filters.ymdStartDt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                />
                ~
                <DatePicker
                  name="ymdEndDt"
                  value={filters.ymdEndDt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                />
              </td>

              <th data-control-name="lblDptcd">
                {wordInfoData !== null
                  ? wordInfoData.find(
                      (item: any) => item.controlName === "lblDptcd"
                    ).wordText
                  : "부서"}
              </th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cboDptcd"
                    value={filters.cboDptcd}
                    bizComponentId="L_dptcd_001"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>

              <th data-control-name="lblPerson">
                {wordInfoData !== null
                  ? wordInfoData.find(
                      (item: any) => item.controlName === "lblPerson"
                    ).wordText
                  : "담당자"}
              </th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cboPerson"
                    value={filters.cboPerson}
                    bizComponentId="L_sysUserMaster_001"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
                  />
                )}
              </td>

              <th data-control-name="lblPgmgb">
                {wordInfoData !== null
                  ? wordInfoData.find(
                      (item: any) => item.controlName === "lblPgmgb"
                    ).wordText
                  : "결재문서"}
              </th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cboPgmgb"
                    value={filters.cboPgmgb}
                    bizComponentId="L_EA002"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>

            <tr>
              <th data-control-name="lblWorkType">
                {wordInfoData !== null
                  ? wordInfoData.find(
                      (item: any) => item.controlName === "lblWorkType"
                    ).wordText
                  : "표시형식"}
              </th>
              <td colSpan={3} className="expanded">
                {customOptionData !== null && (
                  <CommonRadioGroup
                    name="radWorkType"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}

                {bizComponentData !== null && customOptionData === null && (
                  <BizComponentRadioGroup
                    name="radWorkType"
                    value={filters.radWorkType}
                    bizComponentId="R_APPGB"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                  // <RadioGroup name="radWorkType" data={RADIO_GROUP_DEFAULT_DATA} />
                )}
              </td>
              <th data-control-name="lblappnm">
                {wordInfoData !== null
                  ? wordInfoData.find(
                      (item: any) => item.controlName === "lblappnm"
                    ).wordText
                  : "결재제목"}
              </th>
              <td>
                <Input
                  name="txtAppnm"
                  type="text"
                  value={filters.txtAppnm}
                  onChange={filterInputChange}
                />
              </td>

              <th data-control-name="lblAppyn">
                {wordInfoData !== null
                  ? wordInfoData.find(
                      (item: any) => item.controlName === "lblAppyn"
                    ).wordText
                  : "결재유무"}
              </th>
              <td>
                {customOptionData !== null && (
                  <CommonRadioGroup
                    name="radAppyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}

                {bizComponentData !== null && customOptionData === null && (
                  <BizComponentRadioGroup
                    name="radAppyn"
                    value={filters.radAppyn}
                    bizComponentId="R_APPYN"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th data-control-name="lblStddiv">
                {wordInfoData !== null
                  ? wordInfoData.find(
                      (item: any) => item.controlName === "lblStddiv"
                    ).wordText
                  : "근태구분"}
              </th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cboStddiv"
                    value={filters.cboStddiv}
                    bizComponentId="L_HU089"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>
      <GridContainerWrap>
        <GridContainer>
          {filters.radWorkType === "A" && (
            <GridContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
              >
                <GridTitleContainer>
                  <GridTitle data-control-name="grtlMyList">
                    개인결재현황
                  </GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "280px" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      person: personListData.find(
                        (item: any) => item.code === row.person
                      )?.name,
                      appyn: appynListData.find(
                        (item: any) => item.code === row.appyn
                      )?.name,
                      pgmgb: pgmgbListData.find(
                        (item: any) => item.sub_code === row.pgmgb
                      )?.code_name,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                    mainDataState
                  )}
                  {...mainDataState}
                  onDataStateChange={onMainDataStateChange}
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
                  total={mainDataResult.total}
                  onScroll={onMainScrollHandler}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {isMobile && (
                    <GridColumn
                      title={"미리보기"}
                      cell={PreviewCell}
                      width="55px"
                    />
                  )}
                  {customOptionData !== null
                    ? customOptionData.menuCustomColumnOptions["grdMyList"].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : dateField.includes(item.fieldName)
                                  ? DateCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 1
                                  ? mainTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )
                    : gridList
                        .find((grid: TGrid) => grid.gridName === "grdMyList")
                        ?.columns.map((item: TColumn, idx: number) => (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.field}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.field)
                                ? NumberCell
                                : dateField.includes(item.field)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              idx === 0 ? mainTotalFooterCell : undefined
                            }
                          />
                        ))}
                  <GridColumn title={"File"} cell={CommandCell} width="55px" />
                </Grid>
              </ExcelExport>
            </GridContainer>
          )}

          {filters.radWorkType === "B" && (
            <GridContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
              >
                <GridTitleContainer>
                  <GridTitle data-control-name="grtlUndecideList">
                    미결함
                  </GridTitle>

                  {permissions && (
                    <ButtonContainer>
                      <Button
                        onClick={() => {
                          processApproval("APP");
                        }}
                        icon="check"
                        //fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.save ? false : true}
                      >
                        승인
                      </Button>
                      <Button
                        onClick={() => {
                          processApproval("RTR");
                        }}
                        icon="x"
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.save ? false : true}
                      >
                        반려
                      </Button>
                    </ButtonContainer>
                  )}
                </GridTitleContainer>
                <Grid
                  style={{ height: "280px" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      person: personListData.find(
                        (item: any) => item.code === row.person
                      )?.name,
                      appyn: appynListData.find(
                        (item: any) => item.code === row.appyn
                      )?.name,
                      pgmgb: pgmgbListData.find(
                        (item: any) => item.sub_code === row.pgmgb
                      )?.code_name,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                    mainDataState
                  )}
                  {...mainDataState}
                  onDataStateChange={onMainDataStateChange}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "multiple",
                  }}
                  onSelectionChange={onMainSelectionChange}
                  onHeaderSelectionChange={onMainHeaderSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult.total}
                  onScroll={onMainScrollHandler}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field={SELECTED_FIELD}
                    width="45px"
                    headerSelectionValue={
                      mainDataResult.data.findIndex(
                        (item: any) => !selectedState[idGetter(item)]
                      ) === -1
                    }
                  />
                  {isMobile && (
                    <GridColumn
                      title={"미리보기"}
                      cell={PreviewCell}
                      width="55px"
                    />
                  )}
                  {customOptionData !== null
                    ? customOptionData.menuCustomColumnOptions[
                        "grdUndecideList"
                      ].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : dateField.includes(item.fieldName)
                                  ? DateCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 1
                                  ? mainTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )
                    : gridList
                        .find(
                          (grid: TGrid) => grid.gridName === "grdUndecideList"
                        )
                        ?.columns.map((item: TColumn, idx: number) => (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.field}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.field)
                                ? NumberCell
                                : dateField.includes(item.field)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              idx === 0 ? mainTotalFooterCell : undefined
                            }
                          />
                        ))}

                  <GridColumn title={"File"} cell={CommandCell} width="55px" />
                </Grid>
              </ExcelExport>
            </GridContainer>
          )}

          {filters.radWorkType === "C" && (
            <GridContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
              >
                <GridTitleContainer>
                  <GridTitle data-control-name="grtlAlreadyList">
                    기결함
                  </GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "280px" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      person: personListData.find(
                        (item: any) => item.code === row.person
                      )?.name,
                      appyn: appynListData.find(
                        (item: any) => item.code === row.appyn
                      )?.name,
                      pgmgb: pgmgbListData.find(
                        (item: any) => item.sub_code === row.pgmgb
                      )?.code_name,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                    mainDataState
                  )}
                  {...mainDataState}
                  onDataStateChange={onMainDataStateChange}
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
                  total={mainDataResult.total}
                  onScroll={onMainScrollHandler}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {isMobile && (
                    <GridColumn
                      title={"미리보기"}
                      cell={PreviewCell}
                      width="55px"
                    />
                  )}
                  {customOptionData !== null
                    ? customOptionData.menuCustomColumnOptions[
                        "grdAlreadyList"
                      ].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : dateField.includes(item.fieldName)
                                  ? DateCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 1
                                  ? mainTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )
                    : gridList
                        .find(
                          (grid: TGrid) => grid.gridName === "grdAlreadyList"
                        )
                        ?.columns.map((item: TColumn, idx: number) => (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.field}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.field)
                                ? NumberCell
                                : dateField.includes(item.field)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              idx === 0 ? mainTotalFooterCell : undefined
                            }
                          />
                        ))}
                  <GridColumn title={"File"} cell={CommandCell} width="55px" />
                </Grid>
              </ExcelExport>
            </GridContainer>
          )}

          {filters.radWorkType === "F" && (
            <GridContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
              >
                <GridTitleContainer>
                  <GridTitle data-control-name="grtlRefChkList">
                    참조자확인
                  </GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "280px" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      person: personListData.find(
                        (item: any) => item.code === row.person
                      )?.name,
                      appyn: appynListData.find(
                        (item: any) => item.code === row.appyn
                      )?.name,
                      pgmgb: pgmgbListData.find(
                        (item: any) => item.sub_code === row.pgmgb
                      )?.code_name,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                    mainDataState
                  )}
                  {...mainDataState}
                  onDataStateChange={onMainDataStateChange}
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
                  total={mainDataResult.total}
                  onScroll={onMainScrollHandler}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {isMobile && (
                    <GridColumn
                      title={"미리보기"}
                      cell={PreviewCell}
                      width="55px"
                    />
                  )}
                  {customOptionData !== null
                    ? customOptionData.menuCustomColumnOptions[
                        "grdRefChkList"
                      ].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : dateField.includes(item.fieldName)
                                  ? DateCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder === 1
                                  ? mainTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )
                    : gridList
                        .find(
                          (grid: TGrid) => grid.gridName === "grdRefChkList"
                        )
                        ?.columns.map((item: TColumn, idx: number) => (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.field}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.field)
                                ? NumberCell
                                : dateField.includes(item.field)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              idx === 0 ? mainTotalFooterCell : undefined
                            }
                          />
                        ))}
                  <GridColumn title={"File"} cell={CommandCell} width="55px" />
                </Grid>
              </ExcelExport>
            </GridContainer>
          )}

          <GridContainerWrap>
            <GridContainer width={"550px"}>
              <GridTitleContainer>
                <GridTitle data-control-name="grtlLineList">결재자</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "200px" }}
                data={process(
                  detail1DataResult.data.map((row) => ({
                    ...row,
                    resno: personListData.find(
                      (item: any) => item.code === row.resno
                    )?.name,
                    postcd: postcdListData.find(
                      (item: any) => item.sub_code === row.postcd
                    )?.code_name,
                    appline: applineListData.find(
                      (item: any) => item.sub_code === row.appline
                    )?.code_name,
                    [SELECTED_FIELD]: detailSelectedState[detailIdGetter(row)],
                  })),
                  detail1DataState
                )}
                {...detail1DataState}
                onDataStateChange={onDetail1DataStateChange}
                //선택기능
                dataItemKey={DETAIL_DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onDetailSelectionChange}
                //정렬기능
                sortable={true}
                onSortChange={onDetail1SortChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={detail1DataResult.total}
                //onScroll={onDetail1ScrollHandler} // 전부조회 (페이징처리 미사용)
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                {customOptionData !== null
                  ? customOptionData.menuCustomColumnOptions["grdLineList"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : dateField.includes(item.fieldName)
                                ? DateCell
                                : item.fieldName === "appyn" ||
                                  item.fieldName === "arbitragb"
                                ? CheckBoxReadOnlyCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 1
                                ? detail1TotalFooterCell
                                : undefined
                            }
                          />
                        )
                    )
                  : gridList
                      .find((grid: TGrid) => grid.gridName === "grdLineList")
                      ?.columns.map((item: TColumn, idx: number) => (
                        <GridColumn
                          key={idx}
                          id={item.id}
                          field={item.field}
                          title={item.caption}
                          width={item.width}
                          cell={
                            numberField.includes(item.field)
                              ? NumberCell
                              : dateField.includes(item.field)
                              ? DateCell
                              : item.field === "appyn" ||
                                item.field === "arbitragb"
                              ? CheckBoxReadOnlyCell
                              : undefined
                          }
                          footerCell={
                            idx === 0 ? detail1TotalFooterCell : undefined
                          }
                        />
                      ))}
              </Grid>

              <GridTitleContainer>
                <GridTitle data-control-name="grtlRefList">참조자</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "150px" }}
                data={process(
                  detail2DataResult.data.map((row) => ({
                    ...row,
                    resno: personListData.find(
                      (item: any) => item.code === row.resno
                    )?.name,
                    postcd: postcdListData.find(
                      (item: any) => item.sub_code === row.postcd
                    )?.code_name,
                    appgb: appgbListData.find(
                      (item: any) => item.sub_code === row.appgb
                    )?.code_name,
                    [SELECTED_FIELD]: detailSelectedState[detailIdGetter(row)],
                  })),
                  detail2DataState
                )}
                {...detail2DataState}
                onDataStateChange={onDetail2DataStateChange}
                //정렬기능
                sortable={true}
                onSortChange={onDetail2SortChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={detail2DataResult.total}
                //onScroll={onDetail2ScrollHandler} // 전부조회 (페이징처리 미사용)
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                {customOptionData !== null
                  ? customOptionData.menuCustomColumnOptions["grdRefList"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : dateField.includes(item.fieldName)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 1
                                ? detail2TotalFooterCell
                                : undefined
                            }
                          />
                        )
                    )
                  : gridList
                      .find((grid: TGrid) => grid.gridName === "grdRefList")
                      ?.columns.map((item: TColumn, idx: number) => (
                        <GridColumn
                          key={idx}
                          id={item.id}
                          field={item.field}
                          title={item.caption}
                          width={item.width}
                          cell={
                            numberField.includes(item.field)
                              ? NumberCell
                              : dateField.includes(item.field)
                              ? DateCell
                              : undefined
                          }
                          footerCell={
                            idx === 0 ? detail2TotalFooterCell : undefined
                          }
                        />
                      ))}
              </Grid>
            </GridContainer>
            <GridContainer
              width={
                CLIENT_WIDTH - GNV_WIDTH - GRID_MARGIN - 15 - 600 - 650 + "px"
              }
            >
              <GridTitleContainer>
                <GridTitle data-control-name="grtlCmtList">코멘트</GridTitle>

                {permissions && (
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="plus"
                      disabled={permissions.save ? false : true}
                    ></Button>
                    <Button
                      onClick={onRemoveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      disabled={permissions.save ? false : true}
                    ></Button>
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      disabled={permissions.save ? false : true}
                    ></Button>
                  </ButtonContainer>
                )}
              </GridTitleContainer>
              <Grid
                style={{ height: "390px" }}
                data={process(
                  detail3DataResult.data.map((row) => ({
                    ...row,
                    insert_user: personListData.find(
                      (item: any) => item.code === row.insert_user
                    )?.name,
                    [SELECTED_FIELD]:
                      detail3SelectedState[detail3IdGetter(row)],
                  })),
                  detail3DataState
                )}
                {...detail3DataState}
                onDataStateChange={onDetail3DataStateChange}
                //선택기능
                dataItemKey={DETAIL3_DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onDetail3SelectionChange}
                //정렬기능
                sortable={true}
                onSortChange={onDetail3SortChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={detail3DataResult.total}
                //onScroll={onDetail2ScrollHandler} // 전부조회 (페이징처리 미사용)
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                //incell 수정 기능
                onItemChange={onDetail3ItemChange}
                cellRender={customCellRender}
                rowRender={customRowRender}
                editField={EDIT_FIELD}
              >
                <GridColumn
                  field="rowstatus"
                  title=" "
                  width="40px"
                  editable={false}
                />
                {customOptionData !== null
                  ? customOptionData.menuCustomColumnOptions["grdCmtList"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : dateField.includes(item.fieldName)
                                ? DateCell
                                : undefined
                            }
                            editable={
                              item.fieldName === "time" ||
                              item.fieldName === "insert_user"
                                ? false
                                : true
                            }
                            footerCell={
                              item.sortOrder === 1
                                ? detail3TotalFooterCell
                                : undefined
                            }
                          />
                        )
                    )
                  : gridList
                      .find((grid: TGrid) => grid.gridName === "grdCmtList")
                      ?.columns.map((item: TColumn, idx: number) => (
                        <GridColumn
                          key={idx}
                          id={item.id}
                          field={item.field}
                          title={item.caption}
                          width={item.width}
                          cell={
                            numberField.includes(item.field)
                              ? NumberCell
                              : dateField.includes(item.field)
                              ? DateCell
                              : undefined
                          }
                          footerCell={
                            idx === 0 ? detail3TotalFooterCell : undefined
                          }
                        />
                      ))}
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </GridContainer>
        <GridContainer className="preview-grid-container">
          <GridTitleContainer>
            <GridTitle data-control-name="grtlPreview">
              결재문서 미리보기
            </GridTitle>
          </GridTitleContainer>
          <GridContainer
            style={{
              width: "650px",
              height: "710px",
              overflow: "scroll",
              border: "solid 1px #e6e6e6",
              margin: "5px 0",
            }}
          >
            {detailFilters.pgmgb === "지출결의서" ||
            detailFilters.pgmgb === "X" ||
            detailFilters.pgmgb === "Z" ? (
              <CashDisbursementVoucher data={selectedRowData} />
            ) : detailFilters.pgmgb === "근태허가신청" ||
              detailFilters.pgmgb === "W" ? (
              <AbsenceRequest data={selectedRowData} />
            ) : (
              ""
            )}
          </GridContainer>
        </GridContainer>
      </GridContainerWrap>

      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
        />
      )}

      {attachmentsWindowVisible && (
        <AttachmentsWindow
          getVisible={setAttachmentsWindowVisible}
          getData={getAttachmentsData}
          para={detailFilters.attdatnum}
        />
      )}

      {/* 컨트롤 네임 불러오기 용 */}
      {gridList.map((grid: any) =>
        grid.columns.map((column: any) => (
          <div
            key={column.id}
            id={column.id}
            data-grid-name={grid.gridName}
            data-field={column.field}
            data-caption={column.caption}
            data-width={column.width}
            hidden
          />
        ))
      )}

      {previewVisible && (
        <Window
          title={"미리보기"}
          onClose={() => {
            setPreviewVisible((prev) => !prev);
          }}
          initialHeight={deviceHeight}
          initialWidth={deviceWidth}
          // style={{ width: deviceWidth + "px" }}
        >
          {detailFilters.pgmgb === "지출결의서" ||
          detailFilters.pgmgb === "X" ||
          detailFilters.pgmgb === "Z" ? (
            <CashDisbursementVoucher data={selectedRowData} />
          ) : detailFilters.pgmgb === "근태허가신청" ||
            detailFilters.pgmgb === "W" ? (
            <AbsenceRequest data={selectedRowData} />
          ) : (
            ""
          )}
          {/* {detailFilters && selectedRowData && (
            <Preview
              detailFilters={detailFilters}
              selectedRowData={selectedRowData}
            />
          )} */}
        </Window>
      )}
    </>
  );
};

const Preview = (detailFilters: any, selectedRowData: any) => {
  return (
    <>
      {detailFilters.pgmgb === "지출결의서" ||
      detailFilters.pgmgb === "X" ||
      detailFilters.pgmgb === "Z" ? (
        <CashDisbursementVoucher data={selectedRowData} />
      ) : detailFilters.pgmgb === "근태허가신청" ||
        detailFilters.pgmgb === "W" ? (
        <AbsenceRequest data={selectedRowData} />
      ) : (
        ""
      )}
    </>
  );
};

export default EA_A2000;
