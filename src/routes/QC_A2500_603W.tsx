import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridRowDoubleClickEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
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
import TopButtons from "../components/Buttons/TopButtons";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  convertDateToStrWithTime2,
  getGridItemChangedData,
  getQueryFromBizComponent,
  toDate2,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import QC_A2500_603W_Window from "../components/Windows/QC_A2500_603W_Window";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/QC_A2500_603W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const COMMENT_DATA_ITEM_KEY = "num";
const COMMENT_DATA_ITEM_KEY2 = "num";
const COMMENT_DATA_ITEM_KEY3 = "num";
let temp = 0;
let temp2 = 0;
let temp3 = 0;
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];
let deletedMainRows3: object[] = [];
let targetRowIndex: null | number = null;

type TdataArr = {
  row_status_cause_s: string[];
  id_cause_s: string[];
  seq_cause_s: string[];
  comment_cause_s: string[];
  row_status_plan_s: string[];
  id_plan_s: string[];
  seq_plan_s: string[];
  comment_plan_s: string[];
  row_status_feed_s: string[];
  id_feed_s: string[];
  seq_feed_s: string[];
  comment_feed_s: string[];
};

const BA_A0020_603: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const commentidGetter = getter(COMMENT_DATA_ITEM_KEY);
  const commentidGetter2 = getter(COMMENT_DATA_ITEM_KEY2);
  const commentidGetter3 = getter(COMMENT_DATA_ITEM_KEY3);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [tabSelected, setTabSelected] = React.useState(0);
  const pathname: string = window.location.pathname.replace("/", "");
  const [workType, setWorkType] = useState("");
  let gridRef: any = useRef(null);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

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

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        status: defaultOption.find((item: any) => item.id === "status")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent(
    "L_sysUserMaster_001, L_QC001_603, L_QC040, L_QC111",
    setBizComponentData
  );

  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  const [statusListData, setStatusListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [ncrdivListData, setNcrdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [combytypeListData, setCombytyleListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData.length > 0) {
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const statusQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_QC001_603"
        )
      );

      const ncrdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_QC040")
      );

      const combytypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_QC111")
      );
      fetchQueryData(userQueryStr, setUserListData);
      fetchQueryData(statusQueryStr, setStatusListData);
      fetchQueryData(ncrdivQueryStr, setNcrdivListData);
      fetchQueryData(combytypeQueryStr, setCombytyleListData);
    }
  }, [bizComponentData]);

  const fetchQueryData = useCallback(
    async (queryStr: string, setListData: any) => {
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
    },
    []
  );

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });

  const [tempState3, setTempState3] = useState<State>({
    sort: [],
  });

  const [commentDataState, setCommentDataState] = useState<State>({
    sort: [],
  });

  const [commentDataState2, setCommentDataState2] = useState<State>({
    sort: [],
  });

  const [commentDataState3, setCommentDataState3] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );

  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );

  const [tempResult3, setTempResult3] = useState<DataResult>(
    process([], tempState3)
  );

  const [commentDataResult, setCommentDataResult] = useState<DataResult>(
    process([], commentDataState)
  );

  const [commentDataResult2, setCommentDataResult2] = useState<DataResult>(
    process([], commentDataState2)
  );

  const [commentDataResult3, setCommentDataResult3] = useState<DataResult>(
    process([], commentDataState3)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [commentselectedState, setCommentSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [commentselectedState2, setCommentSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [commentselectedState3, setCommentSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onDetailWndClick = () => {
    setDetailWindowVisible(true);
  };

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  interface ICustData {
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }

  const setCustData = (data: ICustData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    location: "01",
    ref_key: "",
    custcd: "",
    custnm: "",
    testnum: "",
    status: "",
    smperson: "",
    cpmperson: "",
    datnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [commentfilters, setCommentFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    datnum: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [Information, setInformation] = useState({
    orgdiv: "01",
    ref_key: "",
    testnum: "",
    smperson: "",
    cpmperson: "",
    ncrdiv: "",
    combytype: "",
    status: "",
    chkperson: "",
    itemcd: "",
    itemnm: "",
    requiretext: "",
    protext: "",
    errtext: "",
    baddt: new Date(),
    custcd: "",
    custnm: "",
    datnum: "",
    ordnum: "",
    ordseq: 0,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_A2500_603W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_ref_key": filters.ref_key,
        "@p_testnum": filters.testnum,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_smperson": filters.smperson,
        "@p_cpmperson": filters.cpmperson,
        "@p_status": filters.status,
        "@p_datnum": filters.datnum,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.datnum == filters.find_row_value
          );
          targetRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef.current) {
          targetRowIndex = 0;
        }
      }

      setMainDataResult((prev) => {
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
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setCommentFilters((prev) => ({
            ...prev,
            datnum: selectedRow.datnum,
            pgNum: 1,
            isSearch: true,
          }));
          setWorkType("U");
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setCommentFilters((prev) => ({
            ...prev,
            datnum: rows[0].datnum,
            pgNum: 1,
            isSearch: true,
          }));
          setWorkType("U");
        }
      } else {
        setWorkType("");
        resetAllGrid();
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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

  //그리드 데이터 조회
  const fetchCommentGrid = async (commentFilter: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_A2500_603W_Q",
      pageNumber: commentFilter.pgNum,
      pageSize: commentFilter.pgSize,
      parameters: {
        "@p_work_type": commentFilter.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_ref_key": filters.ref_key,
        "@p_testnum": filters.testnum,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_smperson": filters.smperson,
        "@p_cpmperson": filters.cpmperson,
        "@p_status": filters.status,
        "@p_datnum": commentFilter.datnum,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      const commenttotalRowCnt = data.tables[1].TotalRowCount;
      const comeentrows = data.tables[1].Rows;
      const commenttotalRowCnt2 = data.tables[2].TotalRowCount;
      const comeentrows2 = data.tables[2].Rows;
      const commenttotalRowCnt3 = data.tables[3].TotalRowCount;
      const comeentrows3 = data.tables[3].Rows;

      setInformation({
        orgdiv: rows[0].orgdiv,
        ref_key: rows[0].ref_key,
        testnum: rows[0].testnum,
        smperson: rows[0].smperson,
        cpmperson: rows[0].cpmperson,
        ncrdiv: rows[0].ncrdiv,
        combytype: rows[0].combytype,
        status: rows[0].status,
        chkperson: rows[0].chkperson,
        itemcd: rows[0].itemcd,
        itemnm: rows[0].itemnm,
        baddt: toDate2(rows[0].baddt),
        requiretext: rows[0].requiretext,
        protext: rows[0].protext,
        errtext: rows[0].errtext,
        custcd: rows[0].custcd,
        custnm: rows[0].custnm,
        datnum: rows[0].datnum,
        ordnum: rows[0].ordnum,
        ordseq: rows[0].ordseq,
      });

      setCommentDataResult((prev) => {
        return {
          data: comeentrows,
          total: commenttotalRowCnt == -1 ? 0 : commenttotalRowCnt,
        };
      });
      setCommentDataResult2((prev) => {
        return {
          data: comeentrows2,
          total: commenttotalRowCnt2 == -1 ? 0 : commenttotalRowCnt2,
        };
      });
      setCommentDataResult3((prev) => {
        return {
          data: comeentrows3,
          total: commenttotalRowCnt3 == -1 ? 0 : commenttotalRowCnt3,
        };
      });
      if (commenttotalRowCnt > 0) {
        setCommentSelectedState({
          [comeentrows[0][COMMENT_DATA_ITEM_KEY]]: true,
        });
      }
      if (commenttotalRowCnt2 > 0) {
        setCommentSelectedState2({
          [comeentrows2[0][COMMENT_DATA_ITEM_KEY2]]: true,
        });
      }
      if (commenttotalRowCnt3 > 0) {
        setCommentSelectedState3({
          [comeentrows3[0][COMMENT_DATA_ITEM_KEY3]]: true,
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setCommentFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (commentfilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(commentfilters);
      setCommentFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchCommentGrid(deepCopiedFilters);
    }
  }, [commentfilters, permissions]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const resetAllGrid = () => {
    setWorkType("");
    setPage(initialPageState); // 페이지 초기화
    deletedMainRows = [];
    deletedMainRows2 = [];
    deletedMainRows3 = [];
    setMainDataResult(process([], mainDataState));
    setCommentDataResult(process([], commentDataState));
    setCommentDataResult2(process([], commentDataState2));
    setCommentDataResult3(process([], commentDataState3));
  };

  const search = () => {
    setTabSelected(0);
    resetAllGrid();
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onCommentDataStateChange = (event: GridDataStateChangeEvent) => {
    setCommentDataState(event.dataState);
  };

  const onCommentDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setCommentDataState2(event.dataState);
  };

  const onCommentDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setCommentDataState3(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onCommentSortChange = (e: any) => {
    setCommentDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onCommentSortChange2 = (e: any) => {
    setCommentDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onCommentSortChange3 = (e: any) => {
    setCommentDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const commentTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = commentDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const commentTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = commentDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const commentTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = commentDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onCommentSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: commentselectedState,
      dataItemKey: COMMENT_DATA_ITEM_KEY,
    });
    setCommentSelectedState(newSelectedState);
  };

  const onCommentSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: commentselectedState2,
      dataItemKey: COMMENT_DATA_ITEM_KEY2,
    });
    setCommentSelectedState2(newSelectedState);
  };

  const onCommentSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: commentselectedState3,
      dataItemKey: COMMENT_DATA_ITEM_KEY3,
    });
    setCommentSelectedState3(newSelectedState);
  };
  const minGridWidth = React.useRef<number>(0);
  const grid = React.useRef<any>(null);
  const [applyMinWidth, setApplyMinWidth] = React.useState(false);
  const [gridCurrent, setGridCurrent] = React.useState(0);

  React.useEffect(() => {
    if (customOptionData != null) {
      grid.current = document.getElementById("grdList");
      window.addEventListener("resize", handleResize);

      //가장작은 그리드 이름
      customOptionData.menuCustomColumnOptions["grdList"].map((item: TColumn) =>
        item.width !== undefined
          ? (minGridWidth.current += item.width)
          : minGridWidth.current
      );

      setGridCurrent(grid.current.offsetWidth);
      setApplyMinWidth(grid.current.offsetWidth < minGridWidth.current);
    }
  }, [customOptionData]);

  const handleResize = () => {
    if (grid.current.offsetWidth < minGridWidth.current && !applyMinWidth) {
      setApplyMinWidth(true);
    } else if (grid.current.offsetWidth > minGridWidth.current) {
      setGridCurrent(grid.current.offsetWidth);
      setApplyMinWidth(false);
    }
  };

  const setWidth = (Name: string, minWidth: number | undefined) => {
    if (minWidth == undefined) {
      minWidth = 0;
    }
    let width = applyMinWidth
      ? minWidth
      : minWidth +
        (gridCurrent - minGridWidth.current) /
          customOptionData.menuCustomColumnOptions[Name].length;

    return width;
  };

  const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = event.dataItem;
    setSelectedState({ [selectedRowData[DATA_ITEM_KEY]]: true });

    setTabSelected(1);

    setWorkType("U");
  };

  const onAddClick = () => {
    onDetailWndClick();
  };

  const setData = (data: any) => {
    setInformation({
      orgdiv: data.orgdiv == undefined ? "01" : data.orgdiv,
      ref_key: data.ref_key == undefined ? "" : data.ref_key,
      testnum: data.testnum == undefined ? "" : data.testnum,
      smperson: data.smperson == undefined ? "" : data.smperson,
      cpmperson: data.cpmperson == undefined ? "" : data.cpmperson,
      ncrdiv: "",
      combytype: "",
      status: "",
      chkperson: data.chkperson == undefined ? "" : data.chkperson,
      itemcd: data.itemcd == undefined ? "" : data.itemcd,
      itemnm: data.itemnm == undefined ? "" : data.itemnm,
      baddt: new Date(),
      requiretext: "",
      protext: "",
      errtext: "",
      custcd: "",
      custnm: "",
      datnum: "",
      ordnum: data.ordnum == undefined ? "" : data.ordnum,
      ordseq: data.ordseq == undefined ? 0 : data.ordseq,
    });
    setWorkType("N");
    setTabSelected(1);
  };

  const onCommentItemChange = (event: GridItemChangeEvent) => {
    setCommentDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      commentDataResult,
      setCommentDataResult,
      COMMENT_DATA_ITEM_KEY
    );
  };

  const onCommentItemChange2 = (event: GridItemChangeEvent) => {
    setCommentDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      commentDataResult2,
      setCommentDataResult2,
      COMMENT_DATA_ITEM_KEY2
    );
  };

  const onCommentItemChange3 = (event: GridItemChangeEvent) => {
    setCommentDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      commentDataResult3,
      setCommentDataResult3,
      COMMENT_DATA_ITEM_KEY3
    );
  };

  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );

  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
      editField={EDIT_FIELD}
    />
  );

  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
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

  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender3 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "comment") {
      const newData = commentDataResult.data.map((item) =>
        item[COMMENT_DATA_ITEM_KEY] === dataItem[COMMENT_DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setCommentDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev: { total: any }) => {
        return {
          data: commentDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field == "comment") {
      const newData = commentDataResult2.data.map((item) =>
        item[COMMENT_DATA_ITEM_KEY2] === dataItem[COMMENT_DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setCommentDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev: { total: any }) => {
        return {
          data: commentDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit3 = (dataItem: any, field: string) => {
    if (field == "comment") {
      const newData = commentDataResult3.data.map((item) =>
        item[COMMENT_DATA_ITEM_KEY3] === dataItem[COMMENT_DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setTempResult3((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setCommentDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult3((prev: { total: any }) => {
        return {
          data: commentDataResult3.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != commentDataResult.data) {
      const newData = commentDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[COMMENT_DATA_ITEM_KEY] ==
          Object.getOwnPropertyNames(commentselectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
      );
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setCommentDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = commentDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setCommentDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != commentDataResult2.data) {
      const newData = commentDataResult2.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[COMMENT_DATA_ITEM_KEY2] ==
          Object.getOwnPropertyNames(commentselectedState2)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
      );
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setCommentDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = commentDataResult2.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setCommentDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit3 = () => {
    if (tempResult3.data != commentDataResult3.data) {
      const newData = commentDataResult3.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[COMMENT_DATA_ITEM_KEY3] ==
          Object.getOwnPropertyNames(commentselectedState3)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
      );
      setTempResult3((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setCommentDataResult3((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = commentDataResult3.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult3((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setCommentDataResult3((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const onCommentAddClick = () => {
    commentDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [COMMENT_DATA_ITEM_KEY]: ++temp,
      orgdiv: "01",
      id: "",
      seq: 0,
      comment: "",
      insert_userid: userId,
      insert_time: convertDateToStrWithTime2(new Date()),
      update_time: "",
      rowstatus: "N",
    };

    setCommentDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });

    setCommentSelectedState({ [newDataItem[COMMENT_DATA_ITEM_KEY]]: true });
  };

  const onCommentAddClick2 = () => {
    commentDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const newDataItem = {
      [COMMENT_DATA_ITEM_KEY2]: ++temp,
      orgdiv: "01",
      id: "",
      seq: 0,
      comment: "",
      insert_userid: userId,
      insert_time: convertDateToStrWithTime2(new Date()),
      update_time: "",
      rowstatus: "N",
    };

    setCommentDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });

    setCommentSelectedState2({ [newDataItem[COMMENT_DATA_ITEM_KEY2]]: true });
  };

  const onCommentAddClick3 = () => {
    commentDataResult3.data.map((item) => {
      if (item.num > temp3) {
        temp3 = item.num;
      }
    });

    const newDataItem = {
      [COMMENT_DATA_ITEM_KEY3]: ++temp,
      orgdiv: "01",
      id: "",
      seq: 0,
      comment: "",
      insert_userid: userId,
      insert_time: convertDateToStrWithTime2(new Date()),
      update_time: "",
      rowstatus: "N",
    };

    setCommentDataResult3((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });

    setCommentSelectedState3({ [newDataItem[COMMENT_DATA_ITEM_KEY3]]: true });
  };

  const onCommentRemoveClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    commentDataResult.data.forEach((item: any, index: number) => {
      if (!commentselectedState[item[COMMENT_DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        Object.push(index);
        deletedMainRows.push(newData2);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = commentDataResult.data[Math.min(...Object2)];
    } else {
      data = commentDataResult.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setCommentDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setCommentSelectedState({
      [data != undefined ? data[COMMENT_DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onCommentRemoveClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    commentDataResult2.data.forEach((item: any, index: number) => {
      if (!commentselectedState2[item[COMMENT_DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        Object.push(index);
        deletedMainRows2.push(newData2);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = commentDataResult2.data[Math.min(...Object2)];
    } else {
      data = commentDataResult2.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setCommentDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setCommentSelectedState2({
      [data != undefined ? data[COMMENT_DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

  const onCommentRemoveClick3 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    commentDataResult3.data.forEach((item: any, index: number) => {
      if (!commentselectedState3[item[COMMENT_DATA_ITEM_KEY3]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        Object.push(index);
        deletedMainRows3.push(newData2);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = commentDataResult3.data[Math.min(...Object2)];
    } else {
      data = commentDataResult3.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setCommentDataResult3((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setCommentSelectedState3({
      [data != undefined ? data[COMMENT_DATA_ITEM_KEY3] : newData[0]]: true,
    });
  };

  const onSaveClick = () => {
    const dataItem = commentDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    const dataItem2 = commentDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    const dataItem3 = commentDataResult3.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    let dataArr: TdataArr = {
      row_status_cause_s: [],
      id_cause_s: [],
      seq_cause_s: [],
      comment_cause_s: [],
      row_status_plan_s: [],
      id_plan_s: [],
      seq_plan_s: [],
      comment_plan_s: [],
      row_status_feed_s: [],
      id_feed_s: [],
      seq_feed_s: [],
      comment_feed_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { rowstatus = "", id = "", seq = "", comment = "" } = item;

      dataArr.row_status_cause_s.push(rowstatus);
      dataArr.id_cause_s.push(id);
      dataArr.seq_cause_s.push(seq);
      dataArr.comment_cause_s.push(comment);
    });

    deletedMainRows.forEach((item: any, idx: number) => {
      const { rowstatus = "", id = "", seq = "", comment = "" } = item;

      dataArr.row_status_cause_s.push(rowstatus);
      dataArr.id_cause_s.push(id);
      dataArr.seq_cause_s.push(seq);
      dataArr.comment_cause_s.push(comment);
    });

    dataItem2.forEach((item: any, idx: number) => {
      const { rowstatus = "", id = "", seq = "", comment = "" } = item;

      dataArr.row_status_plan_s.push(rowstatus);
      dataArr.id_plan_s.push(id);
      dataArr.seq_plan_s.push(seq);
      dataArr.comment_plan_s.push(comment);
    });

    deletedMainRows2.forEach((item: any, idx: number) => {
      const { rowstatus = "", id = "", seq = "", comment = "" } = item;

      dataArr.row_status_plan_s.push(rowstatus);
      dataArr.id_plan_s.push(id);
      dataArr.seq_plan_s.push(seq);
      dataArr.comment_plan_s.push(comment);
    });

    dataItem3.forEach((item: any, idx: number) => {
      const { rowstatus = "", id = "", seq = "", comment = "" } = item;

      dataArr.row_status_feed_s.push(rowstatus);
      dataArr.id_feed_s.push(id);
      dataArr.seq_feed_s.push(seq);
      dataArr.comment_feed_s.push(comment);
    });

    deletedMainRows3.forEach((item: any, idx: number) => {
      const { rowstatus = "", id = "", seq = "", comment = "" } = item;

      dataArr.row_status_feed_s.push(rowstatus);
      dataArr.id_feed_s.push(id);
      dataArr.seq_feed_s.push(seq);
      dataArr.comment_feed_s.push(comment);
    });

    setParaData({
      workType: workType,
      orgdiv: "01",
      location: "01",
      datnum: Information.datnum,
      ordnum: Information.ordnum,
      ordseq: Information.ordseq,
      status: Information.status,
      ncrdiv: Information.ncrdiv,
      combytype: Information.combytype,
      baddt: convertDateToStr(Information.baddt),
      requiretext: Information.requiretext,
      protext: Information.protext,
      errtext: Information.errtext,
      row_status_cause_s: dataArr.row_status_cause_s.join("|"),
      id_cause_s: dataArr.id_cause_s.join("|"),
      seq_cause_s: dataArr.seq_cause_s.join("|"),
      comment_cause_s: dataArr.comment_cause_s.join("|"),
      row_status_plan_s: dataArr.row_status_plan_s.join("|"),
      id_plan_s: dataArr.id_plan_s.join("|"),
      seq_plan_s: dataArr.seq_plan_s.join("|"),
      comment_plan_s: dataArr.comment_plan_s.join("|"),
      row_status_feed_s: dataArr.row_status_feed_s.join("|"),
      id_feed_s: dataArr.id_feed_s.join("|"),
      seq_feed_s: dataArr.seq_feed_s.join("|"),
      comment_feed_s: dataArr.comment_feed_s.join("|"),
      userid: userId,
      pc: pc,
      form_id: "QC_A2500_603W",
    });
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    location: "01",
    datnum: "",
    ordnum: "",
    ordseq: 0,
    status: "",
    ncrdiv: "",
    combytype: "",
    baddt: "",
    requiretext: "",
    protext: "",
    errtext: "",
    row_status_cause_s: "",
    id_cause_s: "",
    seq_cause_s: "",
    comment_cause_s: "",
    row_status_plan_s: "",
    id_plan_s: "",
    seq_plan_s: "",
    comment_plan_s: "",
    row_status_feed_s: "",
    id_feed_s: "",
    seq_feed_s: "",
    comment_feed_s: "",
    userid: userId,
    pc: pc,
    form_id: "QC_A2500_603W",
  });

  const para: Iparameters = {
    procedureName: "P_QC_A2500_603W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_datnum": paraData.datnum,
      "@p_ordnum": paraData.ordnum,
      "@p_ordseq": paraData.ordseq,
      "@p_status": paraData.status,
      "@p_ncrdiv": paraData.ncrdiv,
      "@p_combytype": paraData.combytype,
      "@p_baddt": paraData.baddt,
      "@p_requiretext": paraData.requiretext,
      "@p_protext": paraData.protext,
      "@p_errtext": paraData.errtext,
      "@p_row_status_cause_s": paraData.row_status_cause_s,
      "@p_id_cause_s": paraData.id_cause_s,
      "@p_seq_cause_s": paraData.seq_cause_s,
      "@p_comment_cause_s": paraData.comment_cause_s,
      "@p_row_status_plan_s": paraData.row_status_plan_s,
      "@p_id_plan_s": paraData.id_plan_s,
      "@p_seq_plan_s": paraData.seq_plan_s,
      "@p_comment_plan_s": paraData.comment_plan_s,
      "@p_row_status_feed_s": paraData.row_status_feed_s,
      "@p_id_feed_s": paraData.id_feed_s,
      "@p_seq_feed_s": paraData.seq_feed_s,
      "@p_comment_feed_s": paraData.comment_feed_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "QC_A2500_603W",
    },
  };

  useEffect(() => {
    if (paraData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      if (workType == "N") {
        setTabSelected(0);
      } else {
        setTabSelected(1);
      }
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: data.returnString,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <TitleContainer>
        <Title>Claim, Complain관리</Title>

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
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%", height: "90vh" }}
      >
        <TabStripTab title="요약정보">
          <FilterBoxWrap>
            <FilterBox>
              <tbody>
                <tr>
                  <th>프로젝트 번호</th>
                  <td>
                    <Input
                      name="ref_key"
                      type="text"
                      value={filters.ref_key}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>고객사</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type={"button"}
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>시험번호</th>
                  <td>
                    <Input
                      name="testnum"
                      type="text"
                      value={filters.testnum}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>진행상태</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="status"
                        value={filters.status}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>SM담당자</th>
                  <td>
                    <Input
                      name="smperson"
                      type="text"
                      value={filters.smperson}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>CPM담당자</th>
                  <td>
                    <Input
                      name="cpmperson"
                      type="text"
                      value={filters.cpmperson}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterBoxWrap>
          <GridContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <GridTitleContainer>
                <GridTitle>요약정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    신규 등록
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "67vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    smperson: userListData.find(
                      (items: any) => items.user_id == row.smperson
                    )?.user_name,
                    chkperson: userListData.find(
                      (items: any) => items.user_id == row.chkperson
                    )?.user_name,
                    cpmperson: userListData.find(
                      (items: any) => items.user_id == row.cpmperson
                    )?.user_name,
                    status: statusListData.find(
                      (items: any) => items.sub_code == row.status
                    )?.code_name,
                    ncrdiv: ncrdivListData.find(
                      (items: any) => items.sub_code == row.ncrdiv
                    )?.code_name,
                    combytype: combytypeListData.find(
                      (items: any) => items.sub_code == row.combytype
                    )?.code_name,
                    [SELECTED_FIELD]: selectedState[idGetter(row)],
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
                onSelectionChange={onSelectionChange}
                onRowDoubleClick={onRowDoubleClick}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult.total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                id="grdList"
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          id={item.id}
                          field={item.fieldName}
                          title={item.caption}
                          width={setWidth("grdList", item.width)}
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab
          title="상세정보"
          disabled={
            mainDataResult.data.length == 0 && workType == "" ? true : false
          }
        >
          <GridTitleContainer>
            <GridTitle> </GridTitle>
            <ButtonContainer>
              <Button
                onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              >
                저장
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <GridContainerWrap>
            <GridContainer width="30%">
              <FormBoxWrap border={true}>
                <GridTitleContainer>
                  <GridTitle>Claim, Complain 기본사항</GridTitle>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ width: isMobile ? "" : "15%" }}>등록일</th>
                      <td>
                        <DatePicker
                          name="baddt"
                          value={Information.baddt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>프로젝트 번호</th>
                      <td>
                        <Input
                          name="ref_key"
                          type="text"
                          value={Information.ref_key}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>시험번호</th>
                      <td>
                        <Input
                          name="testnum"
                          type="text"
                          value={Information.testnum}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>SM담당자</th>
                      <td>
                        <Input
                          name="smperson"
                          type="text"
                          value={Information.smperson}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>CPM담당자</th>
                      <td>
                        <Input
                          name="cpmperson"
                          type="text"
                          value={Information.cpmperson}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>이슈유형</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="ncrdiv"
                            value={Information.ncrdiv}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>세부유형</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="combytype"
                            value={Information.combytype}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>진행상태</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="status"
                            value={Information.status}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>시험책임자</th>
                      <td>
                        <Input
                          name="chkperson"
                          type="text"
                          value={Information.chkperson}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <GridTitleContainer>
                  <GridTitle>시험정보</GridTitle>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ width: isMobile ? "" : "15%" }}>품목코드</th>
                      <td>
                        <Input
                          name="itemcd"
                          type="text"
                          value={Information.itemcd}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>품목명</th>
                      <td>
                        <Input
                          name="itemnm"
                          type="text"
                          value={Information.itemnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
            <GridContainer width={`calc(70% - ${GAP}px)`}>
              <FormBoxWrap border={true}>
                <GridContainer
                  style={{ borderBottom: "solid 1px rgba(0, 0, 0, 0.08)" }}
                  height={isMobile ? "" : "50vh"}
                >
                  <GridTitleContainer>
                    <GridTitle>Claim, Complain 사유</GridTitle>
                  </GridTitleContainer>
                  <Card
                    style={{
                      width: "100%",
                      marginRight: "15px",
                      borderRadius: "10px",
                      backgroundColor: "white",
                      marginBottom: "10px",
                    }}
                  >
                    <CardHeader
                      style={{ paddingBottom: "5px" }}
                      title={
                        <>
                          <Typography
                            style={{
                              color: "black",
                              fontSize: "0.8vw",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            송준형 프로
                            <Typography
                              style={{
                                marginLeft: "10px",
                                color: "#d3d3d3",
                                fontSize: "0.6vw",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              방금 전
                            </Typography>
                          </Typography>
                        </>
                      }
                    />
                    <CardContent style={{ display: "flex", paddingTop: "0px" }}>
                      <Input
                        name="requiretext"
                        type="text"
                        value={Information.requiretext}
                        onChange={InputChange}
                      />
                    </CardContent>
                  </Card>
                  <GridTitleContainer>
                    <GridTitle data-control-name="grtlCmtList">댓글</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onCommentAddClick}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                      ></Button>
                      <Button
                        onClick={onCommentRemoveClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: "30vh" }}
                    data={process(
                      commentDataResult.data.map((row) => ({
                        ...row,
                        insert_userid: userListData.find(
                          (items: any) => items.user_id == row.insert_userid
                        )?.user_name,
                        [SELECTED_FIELD]:
                          commentselectedState[commentidGetter(row)],
                      })),
                      commentDataState
                    )}
                    {...commentDataState}
                    onDataStateChange={onCommentDataStateChange}
                    //선택기능
                    dataItemKey={COMMENT_DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onCommentSelectionChange}
                    //정렬기능
                    sortable={true}
                    onSortChange={onCommentSortChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={commentDataResult.total}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    //incell 수정 기능
                    onItemChange={onCommentItemChange}
                    cellRender={customCellRender}
                    rowRender={customRowRender}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn field="rowstatus" title=" " width="40px" />
                    <GridColumn
                      field="insert_userid"
                      title="작성자"
                      width="120px"
                      footerCell={commentTotalFooterCell}
                    />
                    <GridColumn field="comment" title="내용" />
                    <GridColumn
                      field="insert_time"
                      title="등록일시"
                      width="180px"
                    />
                    <GridColumn
                      field="update_time"
                      title="등록일시"
                      width="180px"
                    />
                  </Grid>
                </GridContainer>
                <GridContainer
                  style={{
                    borderBottom: "solid 1px rgba(0, 0, 0, 0.08)",
                    marginTop: "5px",
                  }}
                  height={isMobile ? "" : "50vh"}
                >
                  <GridTitleContainer>
                    <GridTitle>후속조치(계획)</GridTitle>
                  </GridTitleContainer>
                  <Card
                    style={{
                      width: "100%",
                      marginRight: "15px",
                      borderRadius: "10px",
                      backgroundColor: "white",
                      marginBottom: "10px",
                    }}
                  >
                    <CardHeader
                      style={{ paddingBottom: "5px" }}
                      title={
                        <>
                          <Typography
                            style={{
                              color: "black",
                              fontSize: "0.8vw",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            송준형 프로
                            <Typography
                              style={{
                                marginLeft: "10px",
                                color: "#d3d3d3",
                                fontSize: "0.6vw",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              방금 전
                            </Typography>
                          </Typography>
                        </>
                      }
                    />
                    <CardContent style={{ display: "flex", paddingTop: "0px" }}>
                      <Input
                        name="protext"
                        type="text"
                        value={Information.protext}
                        onChange={InputChange}
                      />
                    </CardContent>
                  </Card>
                  <GridTitleContainer>
                    <GridTitle data-control-name="grtlCmtList">댓글</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onCommentAddClick2}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                      ></Button>
                      <Button
                        onClick={onCommentRemoveClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: "30vh" }}
                    data={process(
                      commentDataResult2.data.map((row) => ({
                        ...row,
                        insert_userid: userListData.find(
                          (items: any) => items.user_id == row.insert_userid
                        )?.user_name,
                        [SELECTED_FIELD]:
                          commentselectedState2[commentidGetter2(row)],
                      })),
                      commentDataState2
                    )}
                    {...commentDataState2}
                    onDataStateChange={onCommentDataStateChange2}
                    //선택기능
                    dataItemKey={COMMENT_DATA_ITEM_KEY2}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onCommentSelectionChange2}
                    //정렬기능
                    sortable={true}
                    onSortChange={onCommentSortChange2}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={commentDataResult2.total}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    //incell 수정 기능
                    onItemChange={onCommentItemChange2}
                    cellRender={customCellRender2}
                    rowRender={customRowRender2}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn field="rowstatus" title=" " width="40px" />
                    <GridColumn
                      field="insert_userid"
                      title="작성자"
                      width="120px"
                      footerCell={commentTotalFooterCell2}
                    />
                    <GridColumn field="comment" title="내용" />
                    <GridColumn
                      field="insert_time"
                      title="등록일시"
                      width="180px"
                    />
                    <GridColumn
                      field="update_time"
                      title="등록일시"
                      width="180px"
                    />
                  </Grid>
                </GridContainer>
                <GridContainer
                  style={{ marginTop: "5px" }}
                  height={isMobile ? "" : "50vh"}
                >
                  <GridTitleContainer>
                    <GridTitle>결과 및 Feedback</GridTitle>
                  </GridTitleContainer>
                  <Card
                    style={{
                      width: "100%",
                      marginRight: "15px",
                      borderRadius: "10px",
                      backgroundColor: "white",
                      marginBottom: "10px",
                    }}
                  >
                    <CardHeader
                      style={{ paddingBottom: "5px" }}
                      title={
                        <>
                          <Typography
                            style={{
                              color: "black",
                              fontSize: "0.8vw",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            송준형 프로
                            <Typography
                              style={{
                                marginLeft: "10px",
                                color: "#d3d3d3",
                                fontSize: "0.6vw",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              방금 전
                            </Typography>
                          </Typography>
                        </>
                      }
                    />
                    <CardContent style={{ display: "flex", paddingTop: "0px" }}>
                      <Input
                        name="errtext"
                        type="text"
                        value={Information.errtext}
                        onChange={InputChange}
                      />
                    </CardContent>
                  </Card>
                  <GridTitleContainer>
                    <GridTitle data-control-name="grtlCmtList">댓글</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onCommentAddClick3}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                      ></Button>
                      <Button
                        onClick={onCommentRemoveClick3}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: "30vh" }}
                    data={process(
                      commentDataResult3.data.map((row) => ({
                        ...row,
                        insert_userid: userListData.find(
                          (items: any) => items.user_id == row.insert_userid
                        )?.user_name,
                        [SELECTED_FIELD]:
                          commentselectedState3[commentidGetter3(row)],
                      })),
                      commentDataState3
                    )}
                    {...commentDataState3}
                    onDataStateChange={onCommentDataStateChange3}
                    //선택기능
                    dataItemKey={COMMENT_DATA_ITEM_KEY3}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onCommentSelectionChange3}
                    //정렬기능
                    sortable={true}
                    onSortChange={onCommentSortChange3}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={commentDataResult3.total}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    //incell 수정 기능
                    onItemChange={onCommentItemChange3}
                    cellRender={customCellRender3}
                    rowRender={customRowRender3}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn field="rowstatus" title=" " width="40px" />
                    <GridColumn
                      field="insert_userid"
                      title="작성자"
                      width="120px"
                      footerCell={commentTotalFooterCell3}
                    />
                    <GridColumn field="comment" title="내용" />
                    <GridColumn
                      field="insert_time"
                      title="등록일시"
                      width="180px"
                    />
                    <GridColumn
                      field="update_time"
                      title="등록일시"
                      width="180px"
                    />
                  </Grid>
                </GridContainer>
              </FormBoxWrap>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
      {detailWindowVisible && (
        <QC_A2500_603W_Window
          setVisible={setDetailWindowVisible}
          setData={setData}
          modal={true}
        />
      )}
      {gridList.map((grid: TGrid) =>
        grid.columns.map((column: TColumn) => (
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
    </>
  );
};

export default BA_A0020_603;
