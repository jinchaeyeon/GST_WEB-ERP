import { Card, CardContent, TextField, Typography } from "@mui/material";
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
import { Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { Column, ColumnEditorOptions } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
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
import DateCell from "../components/Cells/DateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  convertDateToStrWithTime2,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getHeight,
  getMenuName,
  setDefaultDate,
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import QC_A2500W_603_Window from "../components/Windows/QC_A2500W_603_Window";
import { useApi } from "../hooks/api";
import { isFilterHideState, isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/QC_A2500W_603_C";
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

const DateField = ["baddt", "qcdt"];

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const QC_A2500W_603: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [tabSelected, setTabSelected] = React.useState(0);

  const [workType, setWorkType] = useState("");
  let gridRef: any = useRef(null);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();

  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const pc = UseGetValueFromSessionItem("pc");
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
  UseCustomOption(setCustomOptionData);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [mobileheight5, setMobileHeight5] = useState(0);
  const [mobileheight6, setMobileHeight6] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".k-tabstrip-items-wrapper");
      height3 = getHeight(".ButtonContainer");
      height4 = getHeight(".ButtonContainer2");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight2(getDeviceHeight(false) - height - height2 - height4);
        setMobileHeight3(getDeviceHeight(false) - height - height2 - height4);
        setMobileHeight4(getDeviceHeight(false) - height - height2 - height4);
        setMobileHeight5(getDeviceHeight(false) - height - height2 - height4);
        setMobileHeight6(getDeviceHeight(false) - height - height2 - height4);
        setWebHeight(getDeviceHeight(true) - height - height2 - height3);
        setWebHeight2((getDeviceHeight(true) - height - height2) / 3);
        setWebHeight3((getDeviceHeight(true) - height - height2) / 3);
        setWebHeight4((getDeviceHeight(true) - height - height2) / 3);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [
    customOptionData,
    webheight,
    webheight2,
    webheight3,
    webheight4,
    tabSelected,
  ]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        status: defaultOption.find((item: any) => item.id == "status")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
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
    if (bizComponentData !== null) {
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setStatusListData(getBizCom(bizComponentData, "L_QC001_603"));
      setNcrdivListData(getBizCom(bizComponentData, "L_QC040"));
      setCombytyleListData(getBizCom(bizComponentData, "L_QC111"));
      setUserListData2(getBizCom(bizComponentData, "L_HU250T"));
    }
  }, [bizComponentData]);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
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
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
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
    } else if (name == "chkpersonnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        chkperson: value == "" ? "" : prev.chkperson,
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

  const setCustData2 = (data: ICustData) => {
    setInformation((prev: any) => {
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
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    ref_key: "",
    frdt: new Date(),
    todt: new Date(),
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
    chkperson: "",
    chkpersonnm: "",
    datnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
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
  const [Information, setInformation] = useState<{ [name: string]: any }>({
    orgdiv: sessionOrgdiv,
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
    custprsnnm: "",
    qcdt: new Date(),
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_A2500W_603_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_ref_key": filters.ref_key,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_testnum": filters.testnum,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_smperson": filters.smpersonnm == "" ? "" : filters.smperson,
        "@p_smpersonnm": filters.smpersonnm,
        "@p_cpmperson": filters.cpmpersonnm == "" ? "" : filters.cpmperson,
        "@p_cpmpersonnm": filters.cpmpersonnm,
        "@p_chkperson": filters.chkpersonnm == "" ? "" : filters.chkperson,
        "@p_chkpersonnm": filters.chkpersonnm,
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
    if (data.isSuccess == true) {
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
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_A2500W_603_Q",
      pageNumber: commentFilter.pgNum,
      pageSize: commentFilter.pgSize,
      parameters: {
        "@p_work_type": commentFilter.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_ref_key": filters.ref_key,
        "@p_testnum": filters.testnum,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_smperson": filters.smpersonnm == "" ? "" : filters.smperson,
        "@p_smpersonnm": filters.smpersonnm,
        "@p_cpmperson": filters.cpmpersonnm == "" ? "" : filters.cpmperson,
        "@p_cpmpersonnm": filters.cpmpersonnm,
        "@p_chkperson": filters.chkpersonnm == "" ? "" : filters.chkperson,
        "@p_chkpersonnm": filters.chkpersonnm,
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

    if (data.isSuccess == true) {
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
        baddt: rows[0].baddt == "" ? null : toDate(rows[0].baddt),
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
        custprsnnm: rows[0].custprsnnm,
        qcdt: rows[0].qcdt == "" ? null : toDate(rows[0].qcdt),
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
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData, bizComponentData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      commentfilters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(commentfilters);
      setCommentFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchCommentGrid(deepCopiedFilters);
    }
  }, [commentfilters, permissions, customOptionData, bizComponentData]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      }
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
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A2500W_603_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A2500W_603_001");
      } else {
        setTabSelected(0);
        setWorkType("");
        resetAllGrid();
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
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
      if (isMobile) {
        setIsFilterHideStates(true);
      }
    }
    setTabSelected(e.selected);
    if (e.selected == 0) {
      setWorkType("");
    }
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
        총
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
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );

    setInformation({
      orgdiv: data.orgdiv == undefined ? sessionOrgdiv : data.orgdiv,
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
      ncrdiv: defaultOption.find((item: any) => item.id == "ncrdiv")?.valueCode,
      combytype: defaultOption.find((item: any) => item.id == "combytype")
        ?.valueCode,
      status: defaultOption.find((item: any) => item.id == "status")?.valueCode,
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
      custcd: data.custcd == undefined ? "" : data.custcd,
      custnm: data.custnm == undefined ? "" : data.custnm,
      datnum: "",
      ordnum: data.ordnum == undefined ? "" : data.ordnum,
      ordseq: data.ordseq == undefined ? 0 : data.ordseq,
      devperson:
        data.devperson == undefined
          ? defaultOption.find((item: any) => item.id == "devperson")?.valueCode
          : data.devperson,
      apperson:
        data.apperson == undefined
          ? defaultOption.find((item: any) => item.id == "apperson")?.valueCode
          : data.apperson,
      chkperson2:
        data.chkperson2 == undefined
          ? defaultOption.find((item: any) => item.id == "chkperson2")
              ?.valueCode
          : data.chkperson2,
      custprsnnm: data.custprsnnm == undefined ? "" : data.custprsnnm,
      qcdt: null,
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
      orgdiv: sessionOrgdiv,
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
      orgdiv: sessionOrgdiv,
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
      orgdiv: sessionOrgdiv,
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
          const newData2 = item;
          newData2.rowstatus = "D";
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
          const newData2 = item;
          newData2.rowstatus = "D";
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
          const newData2 = item;
          newData2.rowstatus = "D";
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
    if (!permissions.save) return;
    if (
      Information.ncrdiv == "" ||
      Information.combytype == "" ||
      Information.status == ""
    ) {
      alert("필수값을 채워주세요");
    } else {
      const dataItem = commentDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      const dataItem2 = commentDataResult2.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      const dataItem3 = commentDataResult3.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
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
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        datnum: Information.datnum,
        quokey: workType == "N" ? Information.ref_key : "",
        status: Information.status,
        ncrdiv: Information.ncrdiv,
        combytype: Information.combytype,
        baddt:
          Information.baddt == null ? "" : convertDateToStr(Information.baddt),
        requiretext: Information.requiretext,
        protext: Information.protext,
        errtext: Information.errtext,
        devperson: Information.devperson,
        chkperson: Information.chkperson2,
        apperson: Information.apperson,
        custcd: Information.custcd,
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
        qcdt:
          Information.qcdt == null ? "" : convertDateToStr(Information.qcdt),
        userid: userId,
        pc: pc,
        form_id: "QC_A2500W_603",
      });
    }
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
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
    custcd: "",
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
    qcdt: "",
    userid: userId,
    pc: pc,
    form_id: "QC_A2500W_603",
  });

  const para: Iparameters = {
    procedureName: "P_QC_A2500W_603_S",
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
      "@p_custcd": paraData.custcd,
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
      "@p_qcdt": paraData.qcdt,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "QC_A2500W_603",
    },
  };

  useEffect(() => {
    if (
      paraData.workType != "" &&
      permissions.save &&
      paraData.workType != "D"
    ) {
      fetchTodoGridSaved();
    }
    if (paraData.workType == "D" && permissions.delete) {
      fetchTodoGridSaved();
    }
  }, [paraData, permissions]);

  const fetchTodoGridSaved = async () => {
    if (paraData.workType != "D" && !permissions.save) return;
    if (paraData.workType == "D" && !permissions.delete) return;
    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      if (workType == "N" || paraData.workType == "D") {
        setTabSelected(0);
        setWorkType("");
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
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
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
        custcd: "",
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
        qcdt: "",
        userid: userId,
        pc: pc,
        form_id: "QC_A2500W_603",
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
  const [PrsnnumWindowVisible3, setPrsnnumWindowVisible3] =
    useState<boolean>(false);
  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };
  const onPrsnnumWndClick2 = () => {
    setPrsnnumWindowVisible2(true);
  };
  const onPrsnnumWndClick3 = () => {
    setPrsnnumWindowVisible3(true);
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

  const setPrsnnumData3 = (data: IPrsnnum) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        chkperson: data.user_id,
        chkpersonnm: data.user_name,
      };
    });
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.total > 0) {
      const selectRows = mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setParaData({
        workType: "D",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
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
        custcd: "",
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
        qcdt: "",
        userid: userId,
        pc: pc,
        form_id: "QC_A2500W_603",
      });
    } else {
      alert("등록된 데이터가 없습니다.");
      return;
    }
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>

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
        scrollable={isMobile}
      >
        <TabStripTab
          title="요약정보"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox>
              <tbody>
                <tr>
                  <th>PJT NO.</th>
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
                  <th>등록일자</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: filters.frdt,
                        end: filters.todt,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) =>
                        setFilters((prev) => ({
                          ...prev,
                          frdt: e.value.start,
                          todt: e.value.end,
                        }))
                      }
                      className="required"
                    />
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
                  <th>예약번호</th>
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
                  <th>업체명</th>
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
                  <th>영업담당자</th>
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
                  <th>PM담당자</th>
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
                  <th>시험책임자</th>
                  <td>
                    <Input
                      name="chkpersonnm"
                      type="text"
                      value={filters.chkpersonnm}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type="button"
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onPrsnnumWndClick3}
                      />
                    </ButtonInInput>
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              {!isMobile && <GridTitle>요약정보</GridTitle>}
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  icon="file-add"
                  disabled={permissions.save ? false : true}
                >
                  신규 등록
                </Button>
                <Button
                  onClick={onDeleteClick}
                  themeColor={"primary"}
                  fillMode={"outline"}
                  icon="delete"
                  disabled={permissions.delete ? false : true}
                >
                  삭제
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName={getMenuName()}
            >
              <Grid
                style={{
                  height: isMobile ? mobileheight : webheight,
                }}
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
                  customOptionData.menuCustomColumnOptions["grdList"]
                    ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                    ?.map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              DateField.includes(item.fieldName)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
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
            permissions.view
              ? mainDataResult.data.length == 0 && workType == ""
                ? true
                : false
              : true
          }
        >
          {isMobile ? (
            <>
              <GridTitleContainer>
                <ButtonContainer className="ButtonContainer2">
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    disabled={permissions.save ? false : true}
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <SwiperSlide key={0}>
                  <GridContainer style={{ width: "100%" }}>
                    <FormBoxWrap
                      border={true}
                      style={{
                        height: mobileheight2,
                      }}
                    >
                      <GridTitleContainer>
                        <GridTitle>
                          <ButtonContainer
                            style={{ justifyContent: "space-between" }}
                          >
                            {"컴플레인 기본사항"}
                            <Button
                              onClick={() => {
                                if (swiper && isMobile) {
                                  swiper.slideTo(1);
                                }
                              }}
                              icon="chevron-right"
                              themeColor={"primary"}
                              fillMode={"flat"}
                            ></Button>
                          </ButtonContainer>
                        </GridTitle>
                      </GridTitleContainer>
                      <FormBox>
                        <tbody>
                          <tr>
                            <th style={{ width: isMobile ? "" : "15%" }}>
                              등록일자
                            </th>
                            <td>
                              <DatePicker
                                name="baddt"
                                value={Information.baddt}
                                format="yyyy-MM-dd"
                                onChange={InputChange}
                                placeholder=""
                                className="required"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>PJT NO.</th>
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
                            <th>예약번호</th>
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
                            <th>업체명</th>
                            <td>
                              {Information.ref_key == "" ? (
                                <>
                                  <Input
                                    name="custnm"
                                    type="text"
                                    value={Information.custnm}
                                  />
                                  <ButtonInInput>
                                    <Button
                                      type={"button"}
                                      onClick={onCustWndClick2}
                                      icon="more-horizontal"
                                      fillMode="flat"
                                    />
                                  </ButtonInInput>
                                </>
                              ) : (
                                <Input
                                  name="custnm"
                                  type="text"
                                  value={Information.custnm}
                                  className="readonly"
                                />
                              )}
                            </td>
                          </tr>
                          <tr>
                            <th>의뢰자</th>
                            <td>
                              <Input
                                name="smperson"
                                type="text"
                                value={Information.custprsnnm}
                                className="readonly"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>영업담당자</th>
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
                            <th>PM담당자</th>
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
                          <tr>
                            <th>완료일자</th>
                            <td>
                              <DatePicker
                                name="qcdt"
                                value={Information.qcdt}
                                format="yyyy-MM-dd"
                                onChange={InputChange}
                                placeholder=""
                              />
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </FormBoxWrap>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide key={1}>
                  <GridContainer style={{ width: "100%" }}>
                    <FormBoxWrap
                      border={true}
                      style={{
                        height: mobileheight3,
                      }}
                    >
                      <GridTitleContainer>
                        <GridTitle>
                          <ButtonContainer
                            style={{ justifyContent: "space-between" }}
                          >
                            <ButtonContainer>
                              <Button
                                onClick={() => {
                                  if (swiper && isMobile) {
                                    swiper.slideTo(0);
                                  }
                                }}
                                icon="chevron-left"
                                themeColor={"primary"}
                                fillMode={"flat"}
                              ></Button>
                              시험정보
                            </ButtonContainer>
                            <Button
                              onClick={() => {
                                if (swiper && isMobile) {
                                  swiper.slideTo(2);
                                }
                              }}
                              icon="chevron-right"
                              themeColor={"primary"}
                              fillMode={"flat"}
                            ></Button>
                          </ButtonContainer>
                        </GridTitle>
                      </GridTitleContainer>
                      <FormBox>
                        <tbody>
                          <tr>
                            <th style={{ width: isMobile ? "" : "15%" }}>
                              품목코드
                            </th>
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
                </SwiperSlide>
                <SwiperSlide key={2}>
                  <GridContainer style={{ width: "100%" }}>
                    <FormBoxWrap
                      border={true}
                      style={{
                        height: mobileheight4,
                      }}
                    >
                      <GridTitleContainer>
                        <GridTitle>
                          <ButtonContainer
                            style={{ justifyContent: "space-between" }}
                          >
                            <ButtonContainer>
                              <Button
                                onClick={() => {
                                  if (swiper && isMobile) {
                                    swiper.slideTo(1);
                                  }
                                }}
                                icon="chevron-left"
                                themeColor={"primary"}
                                fillMode={"flat"}
                              ></Button>
                              컴플레인 사유
                            </ButtonContainer>
                            <Button
                              onClick={() => {
                                if (swiper && isMobile) {
                                  swiper.slideTo(3);
                                }
                              }}
                              icon="chevron-right"
                              themeColor={"primary"}
                              fillMode={"flat"}
                            ></Button>
                          </ButtonContainer>
                        </GridTitle>
                      </GridTitleContainer>
                      <Typography
                        style={{
                          color: "black",
                          fontWeight: 500,
                          marginBottom: "10px",
                          display: "flex",
                        }}
                      >
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
                      <TextField
                        value={Information.requiretext}
                        name="requiretext"
                        multiline
                        rows={10}
                        fullWidth
                        onChange={InputChange}
                        style={{ backgroundColor: "rgba(34, 137, 195, 0.25)" }}
                      />
                      <GridTitleContainer>
                        <GridTitle>COMMENT</GridTitle>
                        <ButtonContainer>
                          <Button
                            onClick={onCommentAddClick}
                            themeColor={"primary"}
                            icon="plus"
                            title="행 추가"
                            disabled={permissions.save ? false : true}
                          ></Button>
                          <Button
                            onClick={onCommentRemoveClick}
                            fillMode="outline"
                            themeColor={"primary"}
                            icon="minus"
                            title="행 삭제"
                            disabled={permissions.save ? false : true}
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
                        scrollHeight={`calc(${mobileheight2}px)`}
                        editMode="cell"
                        showGridlines
                      >
                        <Column
                          field="rowstatus"
                          header=" "
                          style={{ width: "50px" }}
                        />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList2"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
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
                    </FormBoxWrap>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide key={3}>
                  <GridContainer style={{ width: "100%" }}>
                    <FormBoxWrap
                      border={true}
                      style={{
                        height: mobileheight5,
                      }}
                    >
                      <GridTitleContainer>
                        <GridTitle>
                          <ButtonContainer
                            style={{ justifyContent: "space-between" }}
                          >
                            <ButtonContainer>
                              <Button
                                onClick={() => {
                                  if (swiper && isMobile) {
                                    swiper.slideTo(2);
                                  }
                                }}
                                icon="chevron-left"
                                themeColor={"primary"}
                                fillMode={"flat"}
                              ></Button>
                              후속조치(계획)
                            </ButtonContainer>
                            <Button
                              onClick={() => {
                                if (swiper && isMobile) {
                                  swiper.slideTo(4);
                                }
                              }}
                              icon="chevron-right"
                              themeColor={"primary"}
                              fillMode={"flat"}
                            ></Button>
                          </ButtonContainer>
                        </GridTitle>
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
                      <TextField
                        value={Information.protext}
                        name="protext"
                        multiline
                        rows={10}
                        fullWidth
                        onChange={InputChange}
                        style={{
                          backgroundColor: "rgba(34, 137, 195, 0.25)",
                        }}
                      />
                      <GridTitleContainer>
                        <GridTitle>COMMENT</GridTitle>
                        <ButtonContainer>
                          <Button
                            onClick={onCommentAddClick2}
                            themeColor={"primary"}
                            icon="plus"
                            title="행 추가"
                            disabled={permissions.save ? false : true}
                          ></Button>
                          <Button
                            onClick={onCommentRemoveClick2}
                            fillMode="outline"
                            themeColor={"primary"}
                            icon="minus"
                            title="행 삭제"
                            disabled={permissions.save ? false : true}
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
                        scrollHeight={`calc(${mobileheight3}px)`}
                        editMode="cell"
                        showGridlines
                      >
                        <Column
                          field="rowstatus"
                          header=" "
                          style={{ width: "50px" }}
                        />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList3"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
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
                    </FormBoxWrap>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide key={4}>
                  <GridContainer style={{ width: "100%" }}>
                    <FormBoxWrap
                      border={true}
                      style={{
                        height: mobileheight6,
                      }}
                    >
                      <GridTitleContainer>
                        <GridTitle>
                          <ButtonContainer style={{ justifyContent: "left" }}>
                            <Button
                              onClick={() => {
                                if (swiper && isMobile) {
                                  swiper.slideTo(3);
                                }
                              }}
                              icon="chevron-left"
                              themeColor={"primary"}
                              fillMode={"flat"}
                            ></Button>
                            결과 및 Feedback
                          </ButtonContainer>
                        </GridTitle>
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
                      <TextField
                        value={Information.errtext}
                        name="errtext"
                        multiline
                        rows={10}
                        fullWidth
                        onChange={InputChange}
                        style={{
                          backgroundColor: "rgba(34, 137, 195, 0.25)",
                        }}
                      />
                      <GridTitleContainer>
                        <GridTitle>COMMENT</GridTitle>
                        <ButtonContainer>
                          <Button
                            onClick={onCommentAddClick3}
                            themeColor={"primary"}
                            icon="plus"
                            title="행 추가"
                            disabled={permissions.save ? false : true}
                          ></Button>
                          <Button
                            onClick={onCommentRemoveClick3}
                            fillMode="outline"
                            themeColor={"primary"}
                            icon="minus"
                            title="행 삭제"
                            disabled={permissions.save ? false : true}
                          ></Button>
                        </ButtonContainer>
                      </GridTitleContainer>
                      <DataTable
                        value={commentDataResult3.data}
                        tableStyle={{
                          minWidth: "100%",
                          marginTop: "5px",
                        }}
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
                        scrollHeight={`calc(${mobileheight4}px)`}
                        editMode="cell"
                        showGridlines
                      >
                        <Column
                          field="rowstatus"
                          header=" "
                          style={{ width: "50px" }}
                        />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList4"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
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
                    </FormBoxWrap>
                  </GridContainer>
                </SwiperSlide>
              </Swiper>
            </>
          ) : (
            <>
              <GridTitleContainer>
                <GridTitle> </GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    disabled={permissions.save ? false : true}
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
                          <th style={{ width: isMobile ? "" : "15%" }}>
                            등록일자
                          </th>
                          <td>
                            <DatePicker
                              name="baddt"
                              value={Information.baddt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                              className="required"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>PJT NO.</th>
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
                          <th>예약번호</th>
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
                          <th>업체명</th>
                          <td>
                            {Information.ref_key == "" ? (
                              <>
                                <Input
                                  name="custnm"
                                  type="text"
                                  value={Information.custnm}
                                />
                                <ButtonInInput>
                                  <Button
                                    type={"button"}
                                    onClick={onCustWndClick2}
                                    icon="more-horizontal"
                                    fillMode="flat"
                                  />
                                </ButtonInInput>
                              </>
                            ) : (
                              <Input
                                name="custnm"
                                type="text"
                                value={Information.custnm}
                                className="readonly"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>의뢰자</th>
                          <td>
                            <Input
                              name="custprsnnm"
                              type="text"
                              value={Information.custprsnnm}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>영업담당자</th>
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
                          <th>PM담당자</th>
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
                        <tr>
                          <th>완료일자</th>
                          <td>
                            <DatePicker
                              name="qcdt"
                              value={Information.qcdt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
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
                          <th style={{ width: isMobile ? "" : "15%" }}>
                            품목코드
                          </th>
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
                    <Typography
                      style={{
                        color: "black",
                        fontWeight: 500,
                        marginBottom: "10px",
                        display: "flex",
                      }}
                    >
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
                    <TextField
                      value={Information.requiretext}
                      name="requiretext"
                      multiline
                      rows={10}
                      fullWidth
                      onChange={InputChange}
                      style={{ backgroundColor: "rgba(34, 137, 195, 0.25)" }}
                    />
                    <Card
                      style={{
                        width: "100%",
                        borderRadius: "10px",
                        backgroundColor: "white",
                      }}
                    >
                      <CardContent>
                        <GridTitleContainer>
                          <GridTitle>COMMENT</GridTitle>
                          <ButtonContainer>
                            <Button
                              onClick={onCommentAddClick}
                              themeColor={"primary"}
                              icon="plus"
                              title="행 추가"
                              disabled={permissions.save ? false : true}
                            ></Button>
                            <Button
                              onClick={onCommentRemoveClick}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="minus"
                              title="행 삭제"
                              disabled={permissions.save ? false : true}
                            ></Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <DataTable
                          value={commentDataResult.data}
                          tableStyle={{
                            marginTop: "5px",
                            fontSize: "14px",
                          }}
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
                          scrollHeight={`calc(${webheight2}px)`}
                          editMode="cell"
                          showGridlines
                        >
                          <Column
                            field="rowstatus"
                            header=" "
                            style={{ width: "50px" }}
                          />
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions["grdList2"]
                              ?.sort(
                                (a: any, b: any) => a.sortOrder - b.sortOrder
                              )
                              ?.map(
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
                      <TextField
                        value={Information.protext}
                        name="protext"
                        multiline
                        rows={10}
                        fullWidth
                        onChange={InputChange}
                        style={{ backgroundColor: "rgba(34, 137, 195, 0.25)" }}
                      />
                      <Card
                        style={{
                          width: "100%",
                          borderRadius: "10px",
                          backgroundColor: "white",
                          marginTop: "10px",
                        }}
                      >
                        <CardContent>
                          <GridTitleContainer>
                            <GridTitle>COMMENT</GridTitle>
                            <ButtonContainer>
                              <Button
                                onClick={onCommentAddClick2}
                                themeColor={"primary"}
                                icon="plus"
                                title="행 추가"
                                disabled={permissions.save ? false : true}
                              ></Button>
                              <Button
                                onClick={onCommentRemoveClick2}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="minus"
                                title="행 삭제"
                                disabled={permissions.save ? false : true}
                              ></Button>
                            </ButtonContainer>
                          </GridTitleContainer>
                          <DataTable
                            value={commentDataResult2.data}
                            tableStyle={{
                              marginTop: "5px",
                            }}
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
                            scrollHeight={`calc(${webheight3}px)`}
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
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
                                ?.map(
                                  (item: any, idx: number) =>
                                    item.sortOrder !== -1 && (
                                      <Column
                                        field={item.fieldName}
                                        header={item.caption}
                                        editor={(options) =>
                                          cellEditor2(options)
                                        }
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
                    <GridContainer>
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
                      <TextField
                        value={Information.errtext}
                        name="errtext"
                        multiline
                        rows={10}
                        fullWidth
                        onChange={InputChange}
                        style={{ backgroundColor: "rgba(34, 137, 195, 0.25)" }}
                      />
                      <Card
                        style={{
                          width: "100%",
                          borderRadius: "10px",
                          backgroundColor: "white",
                          marginTop: "10px",
                        }}
                      >
                        <CardContent>
                          <GridTitleContainer>
                            <GridTitle>COMMENT</GridTitle>
                            <ButtonContainer>
                              <Button
                                onClick={onCommentAddClick3}
                                themeColor={"primary"}
                                icon="plus"
                                title="행 추가"
                                disabled={permissions.save ? false : true}
                              ></Button>
                              <Button
                                onClick={onCommentRemoveClick3}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="minus"
                                title="행 삭제"
                                disabled={permissions.save ? false : true}
                              ></Button>
                            </ButtonContainer>
                          </GridTitleContainer>
                          <DataTable
                            value={commentDataResult3.data}
                            tableStyle={{
                              minWidth: "100%",
                              marginTop: "5px",
                            }}
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
                            scrollHeight={`calc(${webheight4}px)`}
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
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
                                ?.map(
                                  (item: any, idx: number) =>
                                    item.sortOrder !== -1 && (
                                      <Column
                                        field={item.fieldName}
                                        header={item.caption}
                                        editor={(options) =>
                                          cellEditor3(options)
                                        }
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
            </>
          )}
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
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={"N"}
          setData={setCustData2}
          modal={true}
        />
      )}
      {detailWindowVisible && (
        <QC_A2500W_603_Window
          setVisible={setDetailWindowVisible}
          setData={setData}
          modal={true}
        />
      )}
      {projectWindowVisible && (
        <QC_A2500W_603_Window
          setVisible={setProjectWindowVisible}
          setData={setProjectData}
          modal={true}
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
      {PrsnnumWindowVisible3 && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible3}
          workType="N"
          setData={setPrsnnumData3}
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

export default QC_A2500W_603;
