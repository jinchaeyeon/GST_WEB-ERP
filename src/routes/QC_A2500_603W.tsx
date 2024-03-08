import { Card, CardContent, Typography } from "@mui/material";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridRowDoubleClickEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import { Column, ColumnEditorOptions } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
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
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  convertDateToStrWithTime2,
  getQueryFromBizComponent,
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
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
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [tabSelected, setTabSelected] = React.useState(0);

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
  UseCustomOption("QC_A2500_603W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
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
    "L_sysUserMaster_001, L_QC001_603, L_QC040, L_QC111, L_HU250T",
    setBizComponentData
  );

  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [UserListData2, setUserListData2] = useState([
    { prsnnum: "", prsnnm: "" },
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
      const userQueryStr2 = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU250T")
      );
      fetchQueryData(userQueryStr, setUserListData);
      fetchQueryData(statusQueryStr, setStatusListData);
      fetchQueryData(ncrdivQueryStr, setNcrdivListData);
      fetchQueryData(combytypeQueryStr, setCombytyleListData);
      fetchQueryData(userQueryStr2, setUserListData2);
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

  const [commentselectedState, setCommentSelectedState] = useState<any>();

  const [commentselectedState2, setCommentSelectedState2] = useState<any>();

  const [commentselectedState3, setCommentSelectedState3] = useState<any>();

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onDetailWndClick = () => {
    setDetailWindowVisible(true);
  };
  const onProejctWndClick = () => {
    setProjectWindowVisible(true);
  };

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "smpersonnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        smperson: value == "" ? "" : prev.smperson,
      }));
    } else if (name == "cpmpersonnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        cpmperson: value == "" ? "" : prev.cpmperson,
      }));
    } else if (name == "custnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        custcd: value == "" ? "" : prev.custcd,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
    address: string;
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

  const setProjectData = (data: any) => {
    setProjectWindowVisible(false);
    const smperson = userListData.find(
      (items: any) => items.user_id == data.person
    );
    const cpmperson = userListData.find(
      (items: any) => items.user_id == data.cpmperson
    );

    setFilters((prev: any) => {
      return {
        ...prev,
        ref_key: data.quokey == undefined ? "" : data.quokey,
        ordnum: data.ordnum == undefined ? "" : data.ordnum,
        quotestnum: data.quotestnum == undefined ? "" : data.quotestnum,
        testnum: data.testnum == undefined ? "" : data.testnum,
        smpersonnm: smperson != undefined ? smperson.user_name : data.person,
        cpmpersonnm:
          cpmperson != undefined ? cpmperson.user_name : data.cpmperson,
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
    ordnum: "",
    quotestnum: "",
    custcd: "",
    custnm: "",
    testnum: "",
    status: "",
    smperson: "",
    smpersonnm: "",
    cpmperson: "",
    cpmpersonnm: "",
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
    quotestnum: "",
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
    devperson: "",
    apperson: "",
    chkperson2: "",
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions?.view) return;
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
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_smperson": filters.smpersonnm == "" ? "" : filters.smperson,
        "@p_smpersonnm": filters.smpersonnm,
        "@p_cpmperson": filters.cpmpersonnm == "" ? "" : filters.cpmperson,
        "@p_cpmpersonnm": filters.cpmpersonnm,
        "@p_status": filters.status,
        "@p_quotestnum": filters.quotestnum,
        "@p_datnum": filters.datnum,
        "@p_ordnum": filters.ordnum,
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
    if (!permissions?.view) return;
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
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_smperson": filters.smpersonnm == "" ? "" : filters.smperson,
        "@p_smpersonnm": filters.smpersonnm,
        "@p_cpmperson": filters.cpmpersonnm == "" ? "" : filters.cpmperson,
        "@p_cpmpersonnm": filters.cpmpersonnm,
        "@p_status": filters.status,
        "@p_datnum": commentFilter.datnum,
        "@p_quotestnum": filters.quotestnum,
        "@p_ordnum": filters.ordnum,
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
      const comeentrows = data.tables[1].Rows.map(
        (row: { insert_userid: any }) => ({
          ...row,
          insert_userid: userListData.find(
            (items: any) => items.user_id == row.insert_userid
          )?.user_name,
        })
      );
      const commenttotalRowCnt2 = data.tables[2].TotalRowCount;
      const comeentrows2 = data.tables[2].Rows.map(
        (row: { insert_userid: any }) => ({
          ...row,
          insert_userid: userListData.find(
            (items: any) => items.user_id == row.insert_userid
          )?.user_name,
        })
      );
      const commenttotalRowCnt3 = data.tables[3].TotalRowCount;
      const comeentrows3 = data.tables[3].Rows.map(
        (row: { insert_userid: any }) => ({
          ...row,
          insert_userid: userListData.find(
            (items: any) => items.user_id == row.insert_userid
          )?.user_name,
        })
      );

      setInformation({
        orgdiv: rows[0].orgdiv,
        ref_key: rows[0].ref_key,
        quotestnum: rows[0].quotestnum,
        testnum: rows[0].testnum,
        smperson: rows[0].smperson,
        cpmperson: rows[0].cpmperson,
        ncrdiv: rows[0].ncrdiv,
        combytype: rows[0].combytype,
        status: rows[0].status,
        chkperson: rows[0].chkperson,
        itemcd: rows[0].itemcd,
        itemnm: rows[0].itemnm,
        baddt: toDate(rows[0].baddt),
        requiretext: rows[0].requiretext,
        protext: rows[0].protext,
        errtext: rows[0].errtext,
        custcd: rows[0].custcd,
        custnm: rows[0].custnm,
        datnum: rows[0].datnum,
        ordnum: rows[0].ordnum,
        ordseq: rows[0].ordseq,
        devperson: rows[0].devperson,
        apperson: rows[0].apperson,
        chkperson2: rows[0].chkperson2,
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
        setCommentSelectedState(comeentrows[0]);
      } else {
        setCommentDataResult(process([], commentDataState));
      }
      if (commenttotalRowCnt2 > 0) {
        setCommentSelectedState2(comeentrows2[0]);
      } else {
        setCommentDataResult2(process([], commentDataState2));
      }
      if (commenttotalRowCnt3 > 0) {
        setCommentSelectedState3(comeentrows3[0]);
      } else {
        setCommentDataResult3(process([], commentDataState3));
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

  let _export: any;;
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
    if (e.selected == 1) {
      const data = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      setCommentFilters((prev) => ({
        ...prev,
        datnum: data.datnum,
        pgNum: 1,
        isSearch: true,
      }));
    }
    setTabSelected(e.selected);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
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

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = event.dataItem;
    setSelectedState({ [selectedRowData[DATA_ITEM_KEY]]: true });
    setCommentDataResult(process([], commentDataState));
    setCommentDataResult2(process([], commentDataState2));
    setCommentDataResult3(process([], commentDataState3));
    setCommentFilters((prev) => ({
      ...prev,
      datnum: selectedRowData.datnum,
      pgNum: 1,
      isSearch: true,
    }));
    setTabSelected(1);
    setWorkType("U");
    deletedMainRows = [];
    deletedMainRows2 = [];
    deletedMainRows3 = [];
  };

  const onAddClick = () => {
    onDetailWndClick();
  };

  const setData = (data: any) => {
    setDetailWindowVisible(false);
    const smperson = userListData.find(
      (items: any) => items.user_name == data.person
    );
    const cpmperson = userListData.find(
      (items: any) => items.user_name == data.cpmperson
    );
    const chkperson = UserListData2.find(
      (items: any) => items.prsnnm == data.chkperson
    );

    setInformation({
      orgdiv: data.orgdiv == undefined ? "01" : data.orgdiv,
      ref_key: data.quokey == undefined ? "" : data.quokey,
      quotestnum: data.quotestnum == undefined ? "" : data.quotestnum,
      testnum: data.testnum == undefined ? "" : data.testnum,
      smperson:
        smperson == undefined
          ? data.person == undefined
            ? ""
            : data.person
          : smperson.user_id,
      cpmperson:
        cpmperson == undefined
          ? data.cpmperson == undefined
            ? ""
            : data.cpmperson
          : cpmperson.user_id,
      ncrdiv: "",
      combytype: "",
      status: "01",
      chkperson:
        chkperson == undefined
          ? data.chkperson == undefined
            ? ""
            : data.chkperson
          : chkperson.prsnnum,
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
      devperson: data.devperson == undefined ? "" : data.devperson,
      apperson: data.apperson == undefined ? "" : data.apperson,
      chkperson2: data.chkperson2 == undefined ? "" : data.chkperson2,
    });
    deletedMainRows = [];
    deletedMainRows2 = [];
    deletedMainRows3 = [];
    setCommentDataResult(process([], commentDataState));
    setCommentDataResult2(process([], commentDataState2));
    setCommentDataResult3(process([], commentDataState3));
    setWorkType("N");
    setTabSelected(1);
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
      insert_userid: userListData.find((items: any) => items.user_id == userId)
        ?.user_name,
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

    setCommentSelectedState(newDataItem);
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
      insert_userid: userListData.find((items: any) => items.user_id == userId)
        ?.user_name,
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

    setCommentSelectedState2(newDataItem);
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
      insert_userid: userListData.find((items: any) => items.user_id == userId)
        ?.user_name,
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

    setCommentSelectedState3(newDataItem);
  };

  const onCommentRemoveClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    commentDataResult.data.forEach((item: any, index: number) => {
      if (
        commentselectedState[COMMENT_DATA_ITEM_KEY] !=
        item[COMMENT_DATA_ITEM_KEY]
      ) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows.push(newData2);
        }
        Object.push(index);
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
    setCommentSelectedState(data != undefined ? data : newData[0]);
  };

  const onCommentRemoveClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    commentDataResult2.data.forEach((item: any, index: number) => {
      if (
        commentselectedState2[COMMENT_DATA_ITEM_KEY2] !=
        item[COMMENT_DATA_ITEM_KEY2]
      ) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows2.push(newData2);
        }
        Object.push(index);
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
    setCommentSelectedState2(data != undefined ? data : newData[0]);
  };

  const onCommentRemoveClick3 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    commentDataResult3.data.forEach((item: any, index: number) => {
      if (
        commentselectedState3[COMMENT_DATA_ITEM_KEY3] !=
        item[COMMENT_DATA_ITEM_KEY3]
      ) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows3.push(newData2);
        }
        Object.push(index);
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
    setCommentSelectedState3(data != undefined ? data : newData[0]);
  };

  const onSaveClick = () => {
    if (
      Information.ncrdiv == "" ||
      Information.combytype == "" ||
      Information.status == ""
    ) {
      alert("필수값을 채워주세요");
    } else {
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
        quokey: workType == "N" ? Information.ref_key : "",
        // ordnum: workType == "N" ? Information.ordnum : "",
        // ordseq: workType == "N" ? Information.ordseq : 0,
        status: Information.status,
        ncrdiv: Information.ncrdiv,
        combytype: Information.combytype,
        baddt: convertDateToStr(Information.baddt),
        requiretext: Information.requiretext,
        protext: Information.protext,
        errtext: Information.errtext,
        devperson: Information.devperson,
        chkperson: Information.chkperson2,
        apperson: Information.apperson,
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
    }
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    location: "01",
    datnum: "",
    quokey: "",
    // ordnum: "",
    // ordseq: 0,
    status: "",
    ncrdiv: "",
    combytype: "",
    baddt: "",
    requiretext: "",
    protext: "",
    errtext: "",
    devperson: "",
    chkperson: "",
    apperson: "",
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
      "@p_quokey": paraData.quokey,
      // "@p_ordnum": paraData.ordnum,
      // "@p_ordseq": paraData.ordseq,
      "@p_status": paraData.status,
      "@p_ncrdiv": paraData.ncrdiv,
      "@p_combytype": paraData.combytype,
      "@p_baddt": paraData.baddt,
      "@p_requiretext": paraData.requiretext,
      "@p_protext": paraData.protext,
      "@p_errtext": paraData.errtext,
      "@p_devperson": paraData.devperson,
      "@p_chkperson": paraData.chkperson,
      "@p_apperson": paraData.apperson,
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
      if (workType == "N" || paraData.workType == "D") {
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
      setParaData({
        workType: "",
        orgdiv: "01",
        location: "01",
        datnum: "",
        quokey: "",
        status: "",
        ncrdiv: "",
        combytype: "",
        baddt: "",
        requiretext: "",
        protext: "",
        errtext: "",
        devperson: "",
        chkperson: "",
        apperson: "",
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
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  const footer = `총 ${commentDataResult.total} 건`;
  const footer2 = `총 ${commentDataResult2.total} 건`;
  const footer3 = `총 ${commentDataResult3.total} 건`;

  const cellEditor = (options: ColumnEditorOptions) => {
    if (options.field == "comment") {
      return (
        <InputText
          className="incell-input"
          type="text"
          value={options.value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (options.editorCallback != undefined) {
              const newData = commentDataResult.data.map(
                (item: { [x: string]: string; rowstatus: string }) =>
                  item[COMMENT_DATA_ITEM_KEY] ==
                  commentselectedState[COMMENT_DATA_ITEM_KEY]
                    ? {
                        ...item,
                        rowstatus: item.rowstatus == "N" ? "N" : "U",
                        [options.field]: e.target.value,
                      }
                    : {
                        ...item,
                      }
              );
              setCommentDataResult((prev: { total: any }) => {
                return {
                  data: newData,
                  total: prev.total,
                };
              });
              return options.editorCallback(e.target.value);
            }
          }}
        />
      );
    } else {
      return <div>{options.value}</div>;
    }
  };

  const cellEditor2 = (options: ColumnEditorOptions) => {
    if (options.field == "comment") {
      return (
        <InputText
          className="incell-input"
          type="text"
          value={options.value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (options.editorCallback != undefined) {
              const newData = commentDataResult2.data.map(
                (item: { [x: string]: string; rowstatus: string }) =>
                  item[COMMENT_DATA_ITEM_KEY2] ==
                  commentselectedState2[COMMENT_DATA_ITEM_KEY2]
                    ? {
                        ...item,
                        rowstatus: item.rowstatus == "N" ? "N" : "U",
                        [options.field]: e.target.value,
                      }
                    : {
                        ...item,
                      }
              );
              setCommentDataResult2((prev: { total: any }) => {
                return {
                  data: newData,
                  total: prev.total,
                };
              });
              return options.editorCallback(e.target.value);
            }
          }}
        />
      );
    } else {
      return <div>{options.value}</div>;
    }
  };

  const cellEditor3 = (options: ColumnEditorOptions) => {
    if (options.field == "comment") {
      return (
        <InputText
          className="incell-input"
          type="text"
          value={options.value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (options.editorCallback != undefined) {
              const newData = commentDataResult3.data.map(
                (item: { [x: string]: string; rowstatus: string }) =>
                  item[COMMENT_DATA_ITEM_KEY3] ==
                  commentselectedState3[COMMENT_DATA_ITEM_KEY3]
                    ? {
                        ...item,
                        rowstatus: item.rowstatus == "N" ? "N" : "U",
                        [options.field]: e.target.value,
                      }
                    : {
                        ...item,
                      }
              );
              setCommentDataResult3((prev: { total: any }) => {
                return {
                  data: newData,
                  total: prev.total,
                };
              });
              return options.editorCallback(e.target.value);
            }
          }}
        />
      );
    } else {
      return <div>{options.value}</div>;
    }
  };

  const [PrsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);
  const [PrsnnumWindowVisible2, setPrsnnumWindowVisible2] =
    useState<boolean>(false);

  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };
  const onPrsnnumWndClick2 = () => {
    setPrsnnumWindowVisible2(true);
  };

  interface IPrsnnum {
    user_id: string;
    user_name: string;
  }

  const setPrsnnumData = (data: IPrsnnum) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        smperson: data.user_id,
        smpersonnm: data.user_name,
      };
    });
  };

  const setPrsnnumData2 = (data: IPrsnnum) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        cpmperson: data.user_id,
        cpmpersonnm: data.user_name,
      };
    });
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.total > 0) {
      const selectRows = mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setParaData({
        workType: "D",
        orgdiv: "01",
        location: "01",
        datnum: selectRows.datnum,
        quokey: "",
        status: "",
        ncrdiv: "",
        combytype: "",
        baddt: "",
        requiretext: "",
        protext: "",
        errtext: "",
        devperson: "",
        chkperson: "",
        apperson: "",
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
    } else {
      alert("등록된 데이터가 없습니다.");
      return;
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>컴플레인관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="QC_A2500_603W"
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
                  <th>프로젝트번호</th>
                  <td>
                    <Input
                      name="ref_key"
                      type="text"
                      value={filters.ref_key}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onProejctWndClick}
                      />
                    </ButtonInInput>
                  </td>
                  <th>수주번호</th>
                  <td>
                    <Input
                      name="ordnum"
                      type="text"
                      value={filters.ordnum}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>예약시험번호</th>
                  <td>
                    <Input
                      name="quotestnum"
                      type="text"
                      value={filters.quotestnum}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>시험번호</th>
                  <td>
                    <Input
                      name="testnum"
                      type="text"
                      value={filters.testnum}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onProejctWndClick}
                      />
                    </ButtonInInput>
                  </td>
                </tr>
                <tr>
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
                      name="smpersonnm"
                      type="text"
                      value={filters.smpersonnm}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type="button"
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onPrsnnumWndClick}
                      />
                    </ButtonInInput>
                  </td>
                  <th>CPM담당자</th>
                  <td>
                    <Input
                      name="cpmpersonnm"
                      type="text"
                      value={filters.cpmpersonnm}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type="button"
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onPrsnnumWndClick2}
                      />
                    </ButtonInInput>
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
                  <Button
                    onClick={onDeleteClick}
                    themeColor={"primary"}
                    fillMode={"outline"}
                    icon="delete"
                  >
                    삭제
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
                    chkperson: UserListData2.find(
                      (items: any) => items.prsnnum == row.chkperson
                    )?.prsnnm,
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
                          width={item.width}
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
            <GridContainer width="20%">
              <FormBoxWrap border={true}>
                <GridTitleContainer>
                  <GridTitle>컴플레인 기본사항</GridTitle>
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
                      <th>프로젝트번호</th>
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
                      <th>수주번호</th>
                      <td>
                        <Input
                          name="ordnum"
                          type="text"
                          value={Information.ordnum}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>예약시험번호</th>
                      <td>
                        <Input
                          name="quotestnum"
                          type="text"
                          value={Information.quotestnum}
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
                          value={
                            Information.smperson != ""
                              ? userListData.find(
                                  (items: any) =>
                                    items.user_id == Information.smperson
                                )?.user_name
                              : ""
                          }
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
                          value={
                            Information.cpmperson != ""
                              ? userListData.find(
                                  (items: any) =>
                                    items.user_id == Information.cpmperson
                                )?.user_name
                              : ""
                          }
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
                            className="required"
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
                            className="required"
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
                            className="required"
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
                          value={
                            Information.chkperson != ""
                              ? UserListData2.find(
                                  (items: any) =>
                                    items.prsnnum == Information.chkperson
                                )?.prsnnm
                              : ""
                          }
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
            <GridContainer width={`calc(80% - ${GAP}px)`}>
              <FormBoxWrap border={true}>
                <GridTitleContainer>
                  <GridTitle>컴플레인 사유</GridTitle>
                </GridTitleContainer>
                <GridContainerWrap>
                  <GridContainer width="30%">
                    <Typography
                      style={{
                        color: "black",

                        fontWeight: 500,
                        marginBottom: "10px",
                        display: "flex",
                      }}
                    >
                      <p style={{ minWidth: "70px" }}>작성자 :</p>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="devperson"
                          value={Information.devperson}
                          type="new"
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          textField="user_name"
                          valueField="user_id"
                        />
                      )}
                    </Typography>
                    <TextArea
                      value={Information.requiretext}
                      name="requiretext"
                      rows={14}
                      onChange={InputChange}
                      style={{ backgroundColor: "rgba(34, 137, 195, 0.25)" }}
                    />
                  </GridContainer>
                  <GridContainer width={`calc(70% - ${GAP}px)`}>
                    <Card
                      style={{
                        width: "100%",
                        marginRight: "15px",
                        borderRadius: "10px",
                        backgroundColor: "white",
                      }}
                    >
                      <CardContent>
                        <GridTitleContainer>
                          <GridTitle></GridTitle>
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
                        <DataTable
                          value={commentDataResult.data}
                          tableStyle={{ marginTop: "5px", fontSize: "14px" }}
                          selectionMode="single"
                          dataKey={COMMENT_DATA_ITEM_KEY}
                          emptyMessage="No DATA."
                          footer={footer}
                          selection={commentselectedState}
                          onSelectionChange={(e: any) => {
                            setCommentSelectedState(e.value);
                          }}
                          columnResizeMode="expand"
                          resizableColumns
                          reorderableColumns
                          scrollable
                          scrollHeight="25vh"
                          editMode="cell"
                          showGridlines
                        >
                          <Column
                            field="rowstatus"
                            header=" "
                            style={{ width: "50px" }}
                          />
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions[
                              "grdList2"
                            ].map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <Column
                                    field={item.fieldName}
                                    header={item.caption}
                                    editor={(options) => cellEditor(options)}
                                    style={{
                                      width: item.width,
                                      whiteSpace: "nowrap",
                                      textOverflow: "ellipsis",
                                      overflow: "hidden",
                                      minWidth: item.width,
                                    }}
                                  />
                                )
                            )}
                        </DataTable>
                      </CardContent>
                    </Card>
                  </GridContainer>
                </GridContainerWrap>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <GridContainer style={{ marginTop: "5px" }}>
                  <GridTitleContainer>
                    <GridTitle>후속조치(계획)</GridTitle>
                  </GridTitleContainer>
                  <Typography
                    style={{
                      color: "black",

                      fontWeight: 500,
                      marginBottom: "10px",
                      display: "flex",
                    }}
                  >
                    <p style={{ minWidth: "70px" }}>작성자 :</p>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="chkperson2"
                        value={Information.chkperson2}
                        type="new"
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        textField="user_name"
                        valueField="user_id"
                      />
                    )}
                  </Typography>
                  <TextArea
                    value={Information.protext}
                    name="protext"
                    rows={3}
                    onChange={InputChange}
                    style={{ backgroundColor: "rgba(34, 137, 195, 0.25)" }}
                  />
                  <Card
                    style={{
                      width: "100%",
                      marginRight: "15px",
                      borderRadius: "10px",
                      backgroundColor: "white",
                      marginTop: "10px",
                    }}
                  >
                    <CardContent>
                      <GridTitleContainer>
                        <GridTitle></GridTitle>
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
                      <DataTable
                        value={commentDataResult2.data}
                        tableStyle={{ marginTop: "5px" }}
                        selectionMode="single"
                        dataKey={COMMENT_DATA_ITEM_KEY2}
                        emptyMessage="No DATA."
                        footer={footer2}
                        selection={commentselectedState2}
                        onSelectionChange={(e: any) => {
                          setCommentSelectedState2(e.value);
                        }}
                        columnResizeMode="expand"
                        resizableColumns
                        reorderableColumns
                        scrollable
                        scrollHeight="25vh"
                        editMode="cell"
                        showGridlines
                      >
                        <Column
                          field="rowstatus"
                          header=" "
                          style={{ width: "50px" }}
                        />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions[
                            "grdList3"
                          ].map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <Column
                                  field={item.fieldName}
                                  header={item.caption}
                                  editor={(options) => cellEditor2(options)}
                                  style={{
                                    width: item.width,
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    minWidth: item.width,
                                  }}
                                />
                              )
                          )}
                      </DataTable>
                    </CardContent>
                  </Card>
                </GridContainer>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <GridContainer style={{ marginTop: "5px" }}>
                  <GridTitleContainer>
                    <GridTitle>결과 및 Feedback</GridTitle>
                  </GridTitleContainer>
                  <Typography
                    style={{
                      color: "black",

                      fontWeight: 500,
                      marginBottom: "10px",
                      display: "flex",
                    }}
                  >
                    <p style={{ minWidth: "70px" }}>작성자 :</p>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="apperson"
                        value={Information.apperson}
                        type="new"
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        textField="user_name"
                        valueField="user_id"
                      />
                    )}
                  </Typography>
                  <TextArea
                    value={Information.errtext}
                    name="errtext"
                    rows={3}
                    onChange={InputChange}
                    style={{ backgroundColor: "rgba(34, 137, 195, 0.25)" }}
                  />
                  <Card
                    style={{
                      width: "100%",
                      marginRight: "15px",
                      borderRadius: "10px",
                      backgroundColor: "white",
                      marginTop: "10px",
                    }}
                  >
                    <CardContent>
                      <GridTitleContainer>
                        <GridTitle></GridTitle>
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
                      <DataTable
                        value={commentDataResult3.data}
                        tableStyle={{ minWidth: "100%", marginTop: "5px" }}
                        selectionMode="single"
                        dataKey={COMMENT_DATA_ITEM_KEY3}
                        emptyMessage="No DATA."
                        footer={footer3}
                        selection={commentselectedState3}
                        onSelectionChange={(e: any) => {
                          setCommentSelectedState3(e.value);
                        }}
                        columnResizeMode="expand"
                        resizableColumns
                        reorderableColumns
                        scrollable
                        scrollHeight="25vh"
                        editMode="cell"
                        showGridlines
                      >
                        <Column
                          field="rowstatus"
                          header=" "
                          style={{ width: "50px" }}
                        />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions[
                            "grdList4"
                          ].map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <Column
                                  field={item.fieldName}
                                  header={item.caption}
                                  editor={(options) => cellEditor3(options)}
                                  style={{
                                    width: item.width,
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    minWidth: item.width,
                                  }}
                                />
                              )
                          )}
                      </DataTable>
                    </CardContent>
                  </Card>
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
          pathname="QC_A2500_603W"
        />
      )}
      {projectWindowVisible && (
        <QC_A2500_603W_Window
          setVisible={setProjectWindowVisible}
          setData={setProjectData}
          modal={true}
          pathname="QC_A2500_603W"
        />
      )}
      {PrsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType="N"
          setData={setPrsnnumData}
          modal={true}
        />
      )}
      {PrsnnumWindowVisible2 && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible2}
          workType="N"
          setData={setPrsnnumData2}
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
