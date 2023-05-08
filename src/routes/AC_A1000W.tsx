import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
} from "@progress/kendo-react-grid";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import DetailWindow from "../components/Windows/AC_A1000W_Window";
import AC_A1000W_Receive_Window from "../components/Windows/AC_A1000W_Receive_Window";
import AC_A1000W_Payment_Window from "../components/Windows/AC_A1000W_Payment_Window";
import FilterContainer from "../components/Containers/FilterContainer";
import {
  chkScrollHandler,
  convertDateToStr,
  setDefaultDate,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  findMessage,
  convertDateToStrWithTime2,
  UseBizComponent,
  getQueryFromBizComponent,
  getGridItemChangedData,
  useSysMessage,
  UseGetValueFromSessionItem,
  UseParaPc,
} from "../components/CommonFunction";
import AccountWindow from "../components/Windows/CommonWindows/AccountWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import TopButtons from "../components/Buttons/TopButtons";
import { useSetRecoilState,useRecoilState } from "recoil";
import { isLoading, deletedAttadatnumsState } from "../store/atoms";
import { gridList } from "../store/columns/AC_A1000W_C";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import { bytesToBase64 } from "byte-base64";
import AC_A1000W_Print_Window from "../components/Windows/AC_A1000W_Print_Window";
const DATA_ITEM_KEY = "num";
const dateField = ["acntdt"];
const numberField = ["sumslipamt_1", "sumslipamt_2", "sumslipamt"];

type TdataArr = {
  rowstatus_s: string[];
  acseq2_s: string[];
  acntses_s: string[];
  drcrdiv_s: string[];
  acntcd_s: string[];
  acntchr_s: string[];
  alcchr_s: string[];
  acntbaldiv_s: string[];
  budgyn_s: string[];
  partacnt_s: string[];
  slipamt_s: string[];
  usedptcd_s: string[];
  mngdrcustyn_s: string[];
  mngcrcustyn_s: string[];
  mngsumcustyn_s: string[];
  mngdramtyn_s: string[];
  mngcramtyn_s: string[];
  mngdrrateyn_s: string[];
  mngcrrateyn_s: string[];
  custcd_s: string[];
  custnm_s: string[];
  mngamt_s: string[];
  rate_s: string[];
  mngitemcd1_s: string[];
  mngitemcd2_s: string[];
  mngitemcd3_s: string[];
  mngitemcd4_s: string[];
  mngitemcd5_s: string[];
  mngitemcd6_s: string[];
  mngdata1_s: string[];
  mngdata2_s: string[];
  mngdata3_s: string[];
  mngdata4_s: string[];
  mngdata5_s: string[];
  mngdata6_s: string[];
  mngdatanm1_s: string[];
  mngdatanm2_s: string[];
  mngdatanm3_s: string[];
  mngdatanm4_s: string[];
  mngdatanm5_s: string[];
  mngdatanm6_s: string[];
  budgcd_s: string[];
  stdrmkcd_s: string[];
  remark3_s: string[];
  evidentialkind_s: string[];
  autorecnum_s: string[];
  taxtype_s: string[];
  propertykind_s: string[];
  creditcd_s: string[];
  reason_intax_deduction_s: string[];
};

const AC_A1000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const [deletedAttadatnums, setDeletedAttadatnums] = useRecoilState(
    deletedAttadatnumsState
  );
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        slipdiv: defaultOption.find((item: any) => item.id === "slipdiv")
          .valueCode,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        position: defaultOption.find((item: any) => item.id === "position")
          .valueCode,
        inoutdiv: defaultOption.find((item: any) => item.id === "inoutdiv")
          .valueCode,
        person: defaultOption.find((item: any) => item.id === "person")
          .valueCode,
        inputpath: defaultOption.find((item: any) => item.id === "inputpath")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_AC006,L_sysUserMaster_001,  L_AC002",
    //경로, 사용자, 전표구분
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [usersListData, setUsersListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [InputListData, setInputListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [slipdivListData, setslipdivListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const inputQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC006")
      );
      const usersQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const slipdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC002")
      );
      fetchQuery(usersQueryStr, setUsersListData);
      fetchQuery(inputQueryStr, setInputListData);
      fetchQuery(slipdivQueryStr, setslipdivListData);
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

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.num]: true });

      setWorkType("A");
      setDetailWindowVisible(true);
    };

    return (
      <td className="k-command-cell">
        <Button
          className="k-grid-edit-command"
          themeColor={"primary"}
          fillMode="outline"
          onClick={onEditClick}
          icon="edit"
        ></Button>
      </td>
    );
  };

  const [reload, setreload] = useState<boolean>(false);

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [printWindow, setPrintWindowVisible] = useState<boolean>(false);
  const [receiveWindow, setReceiveWindowVisible] = useState<boolean>(false);
  const [paymentWindow, setPaymentWindowVisible] = useState<boolean>(false);
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);

  const [workType, setWorkType] = useState<"N" | "A" | "C">("N");

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
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

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    actdt: "",
    acseq1: 0,
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "",
    frdt: new Date(),
    todt: new Date(),
    acntcd: "",
    acntnm: "",
    custcd: "",
    custnm: "",
    slipdiv: "",
    framt: -999999999,
    toamt: 999999999,
    acnum: "",
    remark3: "",
    chkyn: false,
    position: "",
    inoutdiv: "",
    person: "",
    inputpath: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_AC_A1000W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_actdt": "",
      "@p_acseq1": 0,
      "@p_acnum": filters.acnum,
      "@p_acseq2": 0,
      "@p_acntcd": filters.acntcd,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_location": filters.location,
      "@p_person": filters.person,
      "@p_inputpath": filters.inputpath,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_slipdiv": filters.slipdiv,
      "@p_remark3": filters.remark3,
      "@p_maxacseq2": 0,
      "@p_framt": filters.framt,
      "@p_toamt": filters.toamt,
      "@p_position": filters.position,
      "@p_inoutdiv": filters.inoutdiv,
      "@p_drcrdiv": "",
      "@p_actdt_s": "",
      "@p_acseq1_s": "",
      "@p_printcnt_s": "",
      "@p_rowstatus_s": "",
      "@p_chk_s": "",
      "@p_ackey_s": "",
      "@p_acntnm": filters.acntnm,
      "@p_find_row_value": filters.find_row_value,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_AC_A1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": "01",
      "@p_location": "",
      "@p_actdt": paraDataDeleted.actdt,
      "@p_acseq1": paraDataDeleted.acseq1,
      "@p_acntdt": "",
      "@p_dptcd": "",
      "@p_slipdiv": "",
      "@p_consultdt": "",
      "@p_consultnum": 0,
      "@p_inputpath": "",
      "@p_closeyn": "",
      "@p_approvaldt": "",
      "@p_apperson": "",
      "@p_remark3": "",
      "@p_printcnt": 0,
      "@p_position": "",
      "@p_inoutdiv": "",
      "@p_rowstatus_s": "",
      "@p_acseq2_s": "",
      "@p_acntses_s": "",
      "@p_drcrdiv_s": "",
      "@p_acntcd_s": "",
      "@p_acntchr_s": "",
      "@p_alcchr_s": "",
      "@p_acntbaldiv_s": "",
      "@p_budgyn_s": "",
      "@p_partacnt_s": "",
      "@p_slipamt_s": "",
      "@p_usedptcd_s": "",
      "@p_mngdrcustyn_s": "",
      "@p_mngcrcustyn_s": "",
      "@p_mngsumcustyn_s": "",
      "@p_mngdramtyn_s": "",
      "@p_mngcramtyn_s": "",
      "@p_mngdrrateyn_s": "",
      "@p_mngcrrateyn_s": "",
      "@p_custcd_s": "",
      "@p_custnm_s": "",
      "@p_mngamt_s": "",
      "@p_rate_s": "",
      "@p_mngitemcd1_s": "",
      "@p_mngitemcd2_s": "",
      "@p_mngitemcd3_s": "",
      "@p_mngitemcd4_s": "",
      "@p_mngitemcd5_s": "",
      "@p_mngitemcd6_s": "",
      "@p_mngdata1_s": "",
      "@p_mngdata2_s": "",
      "@p_mngdata3_s": "",
      "@p_mngdata4_s": "",
      "@p_mngdata5_s": "",
      "@p_mngdata6_s": "",
      "@p_mngdatanm1_s": "",
      "@p_mngdatanm2_s": "",
      "@p_mngdatanm3_s": "",
      "@p_mngdatanm4_s": "",
      "@p_mngdatanm5_s": "",
      "@p_mngdatanm6_s": "",
      "@p_budgcd_s": "",
      "@p_stdrmkcd_s": "",
      "@p_remark3_s": "",
      "@p_evidentialkind_s": "",
      "@p_autorecnum_s": "",
      "@p_taxtype_s": "",
      "@p_propertykind_s": "",
      "@p_creditcd_s": "",
      "@p_reason_intax_deduction_s": "",
      "@p_attdatnum": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A1000W",
    },
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.actdt = "";
    paraDataDeleted.acseq1 = 0;
  };

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (customOptionData != null && filters.isSearch && permissions !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  let gridRef: any = useRef(null);
  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
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
  interface IAccountData {
    acntcd: string;
    acntnm: string;
  }

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const setAccountData = (data: IAccountData) => {
    setFilters((prev) => ({
      ...prev,
      acntcd: data.acntcd,
      acntnm: data.acntnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B1300W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B1300W_001");
      } else {
        resetAllGrid();
      }
    } catch (e) {
      alert(e);
    }
  };

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
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

  const enterEdit3 = (dataItem: any, field: string) => {
    if (field == "chk") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              chk: typeof item.chk == "boolean" ? item.chk : false,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit3 = () => {
    const newData = mainDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const onItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    const selectRows = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      actdt: selectRows.actdt,
      acseq1: selectRows.acseq1,
    }));
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "W",
    orgdiv: "01",
    location: "01",
    actdt: new Date(),
    acseq1: 0,
    acntdt: new Date(),
    dptcd: "",
    slipdiv: "",
    consultdt: "",
    consultnum: 0,
    inputpath: "",
    closeyn: "",
    approvaldt: "",
    apperson: "",
    remark3: "",
    printcnt: 0,
    position: "",
    inoutdiv: "",
    rowstatus_s: "",
    acseq2_s: "",
    acntses_s: "",
    drcrdiv_s: "",
    acntcd_s: "",
    acntchr_s: "",
    alcchr_s: "",
    acntbaldiv_s: "",
    budgyn_s: "",
    partacnt_s: "",
    slipamt_s: "",
    usedptcd_s: "",
    mngdrcustyn_s: "",
    mngcrcustyn_s: "",
    mngsumcustyn_s: "",
    mngdramtyn_s: "",
    mngcramtyn_s: "",
    mngdrrateyn_s: "",
    mngcrrateyn_s: "",
    custcd_s: "",
    custnm_s: "",
    mngamt_s: "",
    rate_s: "",
    mngitemcd1_s: "",
    mngitemcd2_s: "",
    mngitemcd3_s: "",
    mngitemcd4_s: "",
    mngitemcd5_s: "",
    mngitemcd6_s: "",
    mngdata1_s: "",
    mngdata2_s: "",
    mngdata3_s: "",
    mngdata4_s: "",
    mngdata5_s: "",
    mngdata6_s: "",
    mngdatanm1_s: "",
    mngdatanm2_s: "",
    mngdatanm3_s: "",
    mngdatanm4_s: "",
    mngdatanm5_s: "",
    mngdatanm6_s: "",
    budgcd_s: "",
    stdrmkcd_s: "",
    remark3_s: "",
    evidentialkind_s: "",
    autorecnum_s: "",
    taxtype_s: "",
    propertykind_s: "",
    creditcd_s: "",
    reason_intax_deduction_s: "",
    attdatnum: "",
  });

  const setCopyData = (
    data: any,
    filter: any,
    deletedMainRows: any,
    worktype: string
  ) => {
    let valid = true;
    const dataItem = data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    setParaData((prev) => ({
      ...prev,
      workType: worktype,
      location: filter.location,
      actdt: filter.actdt,
      acseq1: filter.acseq1,
      acntdt: filter.acntdt,
      dptcd: filter.dptcd,
      slipdiv: filter.slipdiv == undefined ? "" : filters.slipdiv,
      consultdt: filter.consultdt,
      consultnum: filter.consultnum,
      inputpath: filter.inputpath,
      closeyn: filter.closeyn,
      approvaldt: filter.approvaldt,
      apperson: filter.apperson,
      remark3: filter.remark3,
      printcnt: filter.printcnt == undefined ? 0 : filter.printcnt,
      position: filter.position,
      inoutdiv: filter.inoutdiv,
      attdatnum: filter.attdatnum,
    }));
    if (dataItem.length === 0 && deletedMainRows.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      acseq2_s: [],
      acntses_s: [],
      drcrdiv_s: [],
      acntcd_s: [],
      acntchr_s: [],
      alcchr_s: [],
      acntbaldiv_s: [],
      budgyn_s: [],
      partacnt_s: [],
      slipamt_s: [],
      usedptcd_s: [],
      mngdrcustyn_s: [],
      mngcrcustyn_s: [],
      mngsumcustyn_s: [],
      mngdramtyn_s: [],
      mngcramtyn_s: [],
      mngdrrateyn_s: [],
      mngcrrateyn_s: [],
      custcd_s: [],
      custnm_s: [],
      mngamt_s: [],
      rate_s: [],
      mngitemcd1_s: [],
      mngitemcd2_s: [],
      mngitemcd3_s: [],
      mngitemcd4_s: [],
      mngitemcd5_s: [],
      mngitemcd6_s: [],
      mngdata1_s: [],
      mngdata2_s: [],
      mngdata3_s: [],
      mngdata4_s: [],
      mngdata5_s: [],
      mngdata6_s: [],
      mngdatanm1_s: [],
      mngdatanm2_s: [],
      mngdatanm3_s: [],
      mngdatanm4_s: [],
      mngdatanm5_s: [],
      mngdatanm6_s: [],
      budgcd_s: [],
      stdrmkcd_s: [],
      remark3_s: [],
      evidentialkind_s: [],
      autorecnum_s: [],
      taxtype_s: [],
      propertykind_s: [],
      creditcd_s: [],
      reason_intax_deduction_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        acseq2 = "",
        acntses = "",
        drcrdiv = "",
        acntcd = "",
        acntchr = "",
        alcchr = "",
        acntbaldiv = "",
        budgyn = "",
        partacnt = "",
        slipamt_1 = "",
        slipamt_2 = "",
        usedptcd = "",
        mngdrcustyn = "",
        mngcrcustyn = "",
        mngsumcustyn = "",
        mngdramtyn = "",
        mngcramtyn = "",
        mngdrrateyn = "",
        mngcrrateyn = "",
        custcd = "",
        custnm = "",
        mngamt = "",
        rate = "",
        mngitemcd1 = "",
        mngitemcd2 = "",
        mngitemcd3 = "",
        mngitemcd4 = "",
        mngitemcd5 = "",
        mngitemcd6 = "",
        mngdata1 = "",
        mngdata2 = "",
        mngdata3 = "",
        mngdata4 = "",
        mngdata5 = "",
        mngdata6 = "",
        mngdatanm1 = "",
        mngdatanm2 = "",
        mngdatanm3 = "",
        mngdatanm4 = "",
        mngdatanm5 = "",
        mngdatanm6 = "",
        budgcd = "",
        stdrmkcd = "",
        remark3 = "",
        evidentialkind = "",
        autorecnum = "",
        taxtype = "",
        propertykind = "",
        creditcd = "",
        reason_intax_deduction = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.acseq2_s.push(acseq2 == undefined || acseq2 == "" ? 0 : acseq2);
      dataArr.acntses_s.push(acntses == undefined ? "" : acntses);
      dataArr.drcrdiv_s.push(drcrdiv == undefined ? "" : drcrdiv);
      dataArr.acntcd_s.push(acntcd == undefined ? "" : acntcd);
      dataArr.acntchr_s.push(acntchr == undefined ? "" : acntchr);
      dataArr.alcchr_s.push(alcchr == undefined ? "" : alcchr);
      dataArr.acntbaldiv_s.push(acntbaldiv == undefined ? "" : acntbaldiv);
      dataArr.budgyn_s.push(budgyn == undefined ? "" : budgyn);
      dataArr.partacnt_s.push(partacnt == undefined ? "" : partacnt);
      if (slipamt_1 != 0) {
        dataArr.slipamt_s.push(slipamt_1);
      } else if (slipamt_2 != 0) {
        dataArr.slipamt_s.push(slipamt_2);
      }
      dataArr.usedptcd_s.push(usedptcd == undefined ? "" : usedptcd);
      dataArr.mngdrcustyn_s.push(mngdrcustyn == undefined ? "" : mngdrcustyn);
      dataArr.mngcrcustyn_s.push(mngcrcustyn == undefined ? "" : mngcrcustyn);
      dataArr.mngsumcustyn_s.push(
        mngsumcustyn == undefined ? "" : mngsumcustyn
      );
      dataArr.mngdramtyn_s.push(mngdramtyn == undefined ? "" : mngdramtyn);
      dataArr.mngcramtyn_s.push(mngcramtyn == undefined ? "" : mngcramtyn);
      dataArr.mngdrrateyn_s.push(mngdrrateyn == undefined ? "" : mngdrrateyn);
      dataArr.mngcrrateyn_s.push(mngcrrateyn == undefined ? "" : mngcrrateyn);
      dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
      dataArr.custnm_s.push(custnm == undefined ? "" : custnm);
      dataArr.mngamt_s.push(mngamt == undefined ? 0 : mngamt);
      dataArr.rate_s.push(rate == undefined ? 0 : rate);
      dataArr.mngitemcd1_s.push(mngitemcd1 == undefined ? "" : mngitemcd1);
      dataArr.mngitemcd2_s.push(mngitemcd2 == undefined ? "" : mngitemcd2);
      dataArr.mngitemcd3_s.push(mngitemcd3 == undefined ? "" : mngitemcd3);
      dataArr.mngitemcd4_s.push(mngitemcd4 == undefined ? "" : mngitemcd4);
      dataArr.mngitemcd5_s.push(mngitemcd5 == undefined ? "" : mngitemcd5);
      dataArr.mngitemcd6_s.push(mngitemcd6 == undefined ? "" : mngitemcd6);
      dataArr.mngdata1_s.push(mngdata1 == undefined ? "" : mngdata1);
      dataArr.mngdata2_s.push(mngdata2 == undefined ? "" : mngdata2);
      dataArr.mngdata3_s.push(mngdata3 == undefined ? "" : mngdata3);
      dataArr.mngdata4_s.push(mngdata4 == undefined ? "" : mngdata4);
      dataArr.mngdata5_s.push(mngdata5 == undefined ? "" : mngdata5);
      dataArr.mngdata6_s.push(mngdata6 == undefined ? "" : mngdata6);
      dataArr.mngdatanm1_s.push(mngdatanm1 == undefined ? "" : mngdatanm1);
      dataArr.mngdatanm2_s.push(mngdatanm2 == undefined ? "" : mngdatanm2);
      dataArr.mngdatanm3_s.push(mngdatanm3 == undefined ? "" : mngdatanm3);
      dataArr.mngdatanm4_s.push(mngdatanm4 == undefined ? "" : mngdatanm4);
      dataArr.mngdatanm5_s.push(mngdatanm5 == undefined ? "" : mngdatanm5);
      dataArr.mngdatanm6_s.push(mngdatanm6 == undefined ? "" : mngdatanm6);
      dataArr.budgcd_s.push(budgcd == undefined ? "" : budgcd);
      dataArr.stdrmkcd_s.push(stdrmkcd == undefined ? "" : stdrmkcd);
      dataArr.remark3_s.push(remark3 == undefined ? "" : remark3);
      dataArr.evidentialkind_s.push(
        evidentialkind == undefined ? "" : evidentialkind
      );
      dataArr.autorecnum_s.push(autorecnum == undefined ? "" : autorecnum);
      dataArr.taxtype_s.push(taxtype == undefined ? "" : taxtype);
      dataArr.propertykind_s.push(
        propertykind == undefined ? "" : propertykind
      );
      dataArr.creditcd_s.push(creditcd == undefined ? "" : creditcd);
      dataArr.reason_intax_deduction_s.push(
        reason_intax_deduction == undefined ? "" : reason_intax_deduction
      );
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        acseq2 = "",
        acntses = "",
        drcrdiv = "",
        acntcd = "",
        acntchr = "",
        alcchr = "",
        attdatnum = "",
        acntbaldiv = "",
        budgyn = "",
        partacnt = "",
        slipamt_1 = "",
        slipamt_2 = "",
        usedptcd = "",
        mngdrcustyn = "",
        mngcrcustyn = "",
        mngsumcustyn = "",
        mngdramtyn = "",
        mngcramtyn = "",
        mngdrrateyn = "",
        mngcrrateyn = "",
        custcd = "",
        custnm = "",
        mngamt = "",
        rate = "",
        mngitemcd1 = "",
        mngitemcd2 = "",
        mngitemcd3 = "",
        mngitemcd4 = "",
        mngitemcd5 = "",
        mngitemcd6 = "",
        mngdata1 = "",
        mngdata2 = "",
        mngdata3 = "",
        mngdata4 = "",
        mngdata5 = "",
        mngdata6 = "",
        mngdatanm1 = "",
        mngdatanm2 = "",
        mngdatanm3 = "",
        mngdatanm4 = "",
        mngdatanm5 = "",
        mngdatanm6 = "",
        budgcd = "",
        stdrmkcd = "",
        remark3 = "",
        evidentialkind = "",
        autorecnum = "",
        taxtype = "",
        propertykind = "",
        creditcd = "",
        reason_intax_deduction = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.acseq2_s.push(acseq2 == undefined || acseq2 == "" ? 0 : acseq2);
      dataArr.acntses_s.push(acntses == undefined ? "" : acntses);
      dataArr.drcrdiv_s.push(drcrdiv == undefined ? "" : drcrdiv);
      dataArr.acntcd_s.push(acntcd == undefined ? "" : acntcd);
      dataArr.acntchr_s.push(acntchr == undefined ? "" : acntchr);
      dataArr.alcchr_s.push(alcchr == undefined ? "" : alcchr);
      dataArr.acntbaldiv_s.push(acntbaldiv == undefined ? "" : acntbaldiv);
      dataArr.budgyn_s.push(budgyn == undefined ? "" : budgyn);
      dataArr.partacnt_s.push(partacnt == undefined ? "" : partacnt);
      if (slipamt_1 != 0) {
        dataArr.slipamt_s.push(slipamt_1);
      } else if (slipamt_2 != 0) {
        dataArr.slipamt_s.push(slipamt_2);
      }
      dataArr.usedptcd_s.push(usedptcd == undefined ? "" : usedptcd);
      dataArr.mngdrcustyn_s.push(
        mngdrcustyn == undefined || mngdrcustyn == "" ? "N" : mngdrcustyn
      );
      dataArr.mngcrcustyn_s.push(
        mngcrcustyn == undefined || mngcrcustyn == "" ? "N" : mngcrcustyn
      );
      dataArr.mngsumcustyn_s.push(
        mngsumcustyn == undefined || mngsumcustyn == "" ? "N" : mngsumcustyn
      );
      dataArr.mngdramtyn_s.push(
        mngdramtyn == undefined || mngdramtyn == "" ? "N" : mngdramtyn
      );
      dataArr.mngcramtyn_s.push(
        mngcramtyn == undefined || mngcramtyn == "" ? "N" : mngcramtyn
      );
      dataArr.mngdrrateyn_s.push(
        mngdrrateyn == undefined || mngdrrateyn == "" ? "N" : mngdrrateyn
      );
      dataArr.mngcrrateyn_s.push(
        mngcrrateyn == undefined || mngcrrateyn == "" ? "N" : mngcrrateyn
      );
      dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
      dataArr.custnm_s.push(custnm == undefined ? "" : custnm);
      dataArr.mngamt_s.push(mngamt == undefined ? 0 : mngamt);
      dataArr.rate_s.push(rate == undefined ? 0 : rate);
      dataArr.mngitemcd1_s.push(mngitemcd1 == undefined ? "" : mngitemcd1);
      dataArr.mngitemcd2_s.push(mngitemcd2 == undefined ? "" : mngitemcd2);
      dataArr.mngitemcd3_s.push(mngitemcd3 == undefined ? "" : mngitemcd3);
      dataArr.mngitemcd4_s.push(mngitemcd4 == undefined ? "" : mngitemcd4);
      dataArr.mngitemcd5_s.push(mngitemcd5 == undefined ? "" : mngitemcd5);
      dataArr.mngitemcd6_s.push(mngitemcd6 == undefined ? "" : mngitemcd6);
      dataArr.mngdata1_s.push(mngdata1 == undefined ? "" : mngdata1);
      dataArr.mngdata2_s.push(mngdata2 == undefined ? "" : mngdata2);
      dataArr.mngdata3_s.push(mngdata3 == undefined ? "" : mngdata3);
      dataArr.mngdata4_s.push(mngdata4 == undefined ? "" : mngdata4);
      dataArr.mngdata5_s.push(mngdata5 == undefined ? "" : mngdata5);
      dataArr.mngdata6_s.push(mngdata6 == undefined ? "" : mngdata6);
      dataArr.mngdatanm1_s.push(mngdatanm1 == undefined ? "" : mngdatanm1);
      dataArr.mngdatanm2_s.push(mngdatanm2 == undefined ? "" : mngdatanm2);
      dataArr.mngdatanm3_s.push(mngdatanm3 == undefined ? "" : mngdatanm3);
      dataArr.mngdatanm4_s.push(mngdatanm4 == undefined ? "" : mngdatanm4);
      dataArr.mngdatanm5_s.push(mngdatanm5 == undefined ? "" : mngdatanm5);
      dataArr.mngdatanm6_s.push(mngdatanm6 == undefined ? "" : mngdatanm6);
      dataArr.budgcd_s.push(budgcd == undefined ? "" : budgcd);
      dataArr.stdrmkcd_s.push(stdrmkcd == undefined ? "" : stdrmkcd);
      dataArr.remark3_s.push(remark3 == undefined ? "" : remark3);
      dataArr.evidentialkind_s.push(
        evidentialkind == undefined ? "" : evidentialkind
      );
      dataArr.autorecnum_s.push(autorecnum == undefined ? "" : autorecnum);
      dataArr.taxtype_s.push(taxtype == undefined ? "" : taxtype);
      dataArr.propertykind_s.push(
        propertykind == undefined ? "" : propertykind
      );
      dataArr.creditcd_s.push(creditcd == undefined ? "" : creditcd);
      dataArr.reason_intax_deduction_s.push(
        reason_intax_deduction == undefined ? "" : reason_intax_deduction
      );
      if(attdatnum != ""){
        setDeletedAttadatnums([attdatnum]);
      }
    });
    setParaData((prev) => ({
      ...prev,
      workType: worktype,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      acseq2_s: dataArr.acseq2_s.join("|"),
      acntses_s: dataArr.acntses_s.join("|"),
      drcrdiv_s: dataArr.drcrdiv_s.join("|"),
      acntcd_s: dataArr.acntcd_s.join("|"),
      acntchr_s: dataArr.acntchr_s.join("|"),
      alcchr_s: dataArr.alcchr_s.join("|"),
      acntbaldiv_s: dataArr.acntbaldiv_s.join("|"),
      budgyn_s: dataArr.budgyn_s.join("|"),
      partacnt_s: dataArr.partacnt_s.join("|"),
      slipamt_s: dataArr.slipamt_s.join("|"),
      usedptcd_s: dataArr.usedptcd_s.join("|"),
      mngdrcustyn_s: dataArr.mngdrcustyn_s.join("|"),
      mngcrcustyn_s: dataArr.mngcrcustyn_s.join("|"),
      mngsumcustyn_s: dataArr.mngsumcustyn_s.join("|"),
      mngdramtyn_s: dataArr.mngdramtyn_s.join("|"),
      mngcramtyn_s: dataArr.mngcramtyn_s.join("|"),
      mngdrrateyn_s: dataArr.mngdrrateyn_s.join("|"),
      mngcrrateyn_s: dataArr.mngcrrateyn_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      custnm_s: dataArr.custnm_s.join("|"),
      mngamt_s: dataArr.mngamt_s.join("|"),
      rate_s: dataArr.rate_s.join("|"),
      mngitemcd1_s: dataArr.mngitemcd1_s.join("|"),
      mngitemcd2_s: dataArr.mngitemcd2_s.join("|"),
      mngitemcd3_s: dataArr.mngitemcd3_s.join("|"),
      mngitemcd4_s: dataArr.mngitemcd4_s.join("|"),
      mngitemcd5_s: dataArr.mngitemcd5_s.join("|"),
      mngitemcd6_s: dataArr.mngitemcd6_s.join("|"),
      mngdata1_s: dataArr.mngdata1_s.join("|"),
      mngdata2_s: dataArr.mngdata2_s.join("|"),
      mngdata3_s: dataArr.mngdata3_s.join("|"),
      mngdata4_s: dataArr.mngdata4_s.join("|"),
      mngdata5_s: dataArr.mngdata5_s.join("|"),
      mngdata6_s: dataArr.mngdata6_s.join("|"),
      mngdatanm1_s: dataArr.mngdatanm1_s.join("|"),
      mngdatanm2_s: dataArr.mngdatanm2_s.join("|"),
      mngdatanm3_s: dataArr.mngdatanm3_s.join("|"),
      mngdatanm4_s: dataArr.mngdatanm4_s.join("|"),
      mngdatanm5_s: dataArr.mngdatanm5_s.join("|"),
      mngdatanm6_s: dataArr.mngdatanm6_s.join("|"),
      budgcd_s: dataArr.budgcd_s.join("|"),
      stdrmkcd_s: dataArr.stdrmkcd_s.join("|"),
      remark3_s: dataArr.remark3_s.join("|"),
      evidentialkind_s: dataArr.evidentialkind_s.join("|"),
      autorecnum_s: dataArr.autorecnum_s.join("|"),
      taxtype_s: dataArr.taxtype_s.join("|"),
      propertykind_s: dataArr.propertykind_s.join("|"),
      creditcd_s: dataArr.creditcd_s.join("|"),
      reason_intax_deduction_s: dataArr.reason_intax_deduction_s.join("|"),
    }));
  };

  const para: Iparameters = {
    procedureName: "P_AC_A1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_actdt": convertDateToStr(ParaData.actdt),
      "@p_acseq1": ParaData.acseq1,
      "@p_acntdt": convertDateToStr(ParaData.acntdt),
      "@p_dptcd": ParaData.dptcd,
      "@p_slipdiv": ParaData.slipdiv,
      "@p_consultdt": ParaData.consultdt,
      "@p_consultnum": ParaData.consultnum,
      "@p_inputpath": ParaData.inputpath,
      "@p_closeyn": ParaData.closeyn,
      "@p_approvaldt": ParaData.approvaldt,
      "@p_apperson": ParaData.apperson,
      "@p_remark3": ParaData.remark3,
      "@p_printcnt": ParaData.printcnt,
      "@p_position": ParaData.position,
      "@p_inoutdiv": ParaData.inoutdiv,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_acseq2_s": ParaData.acseq2_s,
      "@p_acntses_s": ParaData.acntses_s,
      "@p_drcrdiv_s": ParaData.drcrdiv_s,
      "@p_acntcd_s": ParaData.acntcd_s,
      "@p_acntchr_s": ParaData.acntchr_s,
      "@p_alcchr_s": ParaData.alcchr_s,
      "@p_acntbaldiv_s": ParaData.acntbaldiv_s,
      "@p_budgyn_s": ParaData.budgyn_s,
      "@p_partacnt_s": ParaData.partacnt_s,
      "@p_slipamt_s": ParaData.slipamt_s,
      "@p_usedptcd_s": ParaData.usedptcd_s,
      "@p_mngdrcustyn_s": ParaData.mngdrcustyn_s,
      "@p_mngcrcustyn_s": ParaData.mngcrcustyn_s,
      "@p_mngsumcustyn_s": ParaData.mngsumcustyn_s,
      "@p_mngdramtyn_s": ParaData.mngdramtyn_s,
      "@p_mngcramtyn_s": ParaData.mngcramtyn_s,
      "@p_mngdrrateyn_s": ParaData.mngdrrateyn_s,
      "@p_mngcrrateyn_s": ParaData.mngcrrateyn_s,
      "@p_custcd_s": ParaData.custcd_s,
      "@p_custnm_s": ParaData.custnm_s,
      "@p_mngamt_s": ParaData.mngamt_s,
      "@p_rate_s": ParaData.rate_s,
      "@p_mngitemcd1_s": ParaData.mngitemcd1_s,
      "@p_mngitemcd2_s": ParaData.mngitemcd2_s,
      "@p_mngitemcd3_s": ParaData.mngitemcd3_s,
      "@p_mngitemcd4_s": ParaData.mngitemcd4_s,
      "@p_mngitemcd5_s": ParaData.mngitemcd5_s,
      "@p_mngitemcd6_s": ParaData.mngitemcd6_s,
      "@p_mngdata1_s": ParaData.mngdata1_s,
      "@p_mngdata2_s": ParaData.mngdata2_s,
      "@p_mngdata3_s": ParaData.mngdata3_s,
      "@p_mngdata4_s": ParaData.mngdata4_s,
      "@p_mngdata5_s": ParaData.mngdata5_s,
      "@p_mngdata6_s": ParaData.mngdata6_s,
      "@p_mngdatanm1_s": ParaData.mngdatanm1_s,
      "@p_mngdatanm2_s": ParaData.mngdatanm2_s,
      "@p_mngdatanm3_s": ParaData.mngdatanm3_s,
      "@p_mngdatanm4_s": ParaData.mngdatanm4_s,
      "@p_mngdatanm5_s": ParaData.mngdatanm5_s,
      "@p_mngdatanm6_s": ParaData.mngdatanm6_s,
      "@p_budgcd_s": ParaData.budgcd_s,
      "@p_stdrmkcd_s": ParaData.stdrmkcd_s,
      "@p_remark3_s": ParaData.remark3_s,
      "@p_evidentialkind_s": ParaData.evidentialkind_s,
      "@p_autorecnum_s": ParaData.autorecnum_s,
      "@p_taxtype_s": ParaData.taxtype_s,
      "@p_propertykind_s": ParaData.propertykind_s,
      "@p_creditcd_s": ParaData.creditcd_s,
      "@p_reason_intax_deduction_s": ParaData.reason_intax_deduction_s,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A1000W",
    },
  };

  useEffect(() => {
    if (ParaData.workType != "W") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setreload(!reload);
      resetAllGrid();
      setDeletedAttadatnums([]);
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "W",
        orgdiv: "01",
        location: "01",
        actdt: new Date(),
        acseq1: 0,
        acntdt: new Date(),
        dptcd: "",
        slipdiv: "",
        consultdt: "",
        consultnum: 0,
        inputpath: "",
        closeyn: "",
        approvaldt: "",
        apperson: "",
        remark3: "",
        printcnt: 0,
        position: "",
        inoutdiv: "",
        rowstatus_s: "",
        acseq2_s: "",
        acntses_s: "",
        drcrdiv_s: "",
        acntcd_s: "",
        acntchr_s: "",
        alcchr_s: "",
        acntbaldiv_s: "",
        budgyn_s: "",
        partacnt_s: "",
        slipamt_s: "",
        usedptcd_s: "",
        mngdrcustyn_s: "",
        mngcrcustyn_s: "",
        mngsumcustyn_s: "",
        mngdramtyn_s: "",
        mngcramtyn_s: "",
        mngdrrateyn_s: "",
        mngcrrateyn_s: "",
        custcd_s: "",
        custnm_s: "",
        mngamt_s: "",
        rate_s: "",
        mngitemcd1_s: "",
        mngitemcd2_s: "",
        mngitemcd3_s: "",
        mngitemcd4_s: "",
        mngitemcd5_s: "",
        mngitemcd6_s: "",
        mngdata1_s: "",
        mngdata2_s: "",
        mngdata3_s: "",
        mngdata4_s: "",
        mngdata5_s: "",
        mngdata6_s: "",
        mngdatanm1_s: "",
        mngdatanm2_s: "",
        mngdatanm3_s: "",
        mngdatanm4_s: "",
        mngdatanm5_s: "",
        mngdatanm6_s: "",
        budgcd_s: "",
        stdrmkcd_s: "",
        remark3_s: "",
        evidentialkind_s: "",
        autorecnum_s: "",
        taxtype_s: "",
        propertykind_s: "",
        creditcd_s: "",
        reason_intax_deduction_s: "",
        attdatnum: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const onAddClick = () => {
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const onCopyClick = () => {
    setWorkType("C");
    setDetailWindowVisible(true);
  };

  const onPrint = () => {
    const datas = mainDataResult.data.filter((item: any) => item.chk == true);

    try {
      if (datas.length == 0) {
        throw findMessage(messagesData, "AC_A1000W_001");
      } else {
        setPrintWindowVisible(true);
      }
    } catch (e) {
      alert(e);
    }
  };

  const onReceive = () => {
    setReceiveWindowVisible(true);
  };
  const onPayment = () => {
    setPaymentWindowVisible(true);
  };
  const setOK = (Ok: boolean) => {
    if (Ok == true) {
      resetAllGrid();
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>대체전표</Title>

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
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>전표일자</th>
              <td colSpan={3}>
                <div className="filter-item-wrap">
                  <DatePicker
                    name="frdt"
                    value={filters.frdt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    placeholder=""
                    className="required"
                  />
                  ~
                  <DatePicker
                    name="todt"
                    value={filters.todt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    placeholder=""
                    className="required"
                  />
                </div>
              </td>
              <th>전표구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="slipdiv"
                    value={filters.slipdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>전표번호</th>
              <td colSpan={2}>
                <Input
                  name="acnum"
                  type="text"
                  value={filters.acnum}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>적요</th>
              <td>
                <Input
                  name="remark"
                  type="text"
                  value={filters.remark3}
                  onChange={filterInputChange}
                />
              </td>
              <th>경로</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="inputpath"
                    value={filters.inputpath}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>업체코드</th>
              <td>
                <Input
                  name="custcd"
                  type="text"
                  value={filters.custcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onCustWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
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
                <Checkbox
                  name="chkyn"
                  label={" "}
                  value={filters.chkyn}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>전표금액</th>
              <td colSpan={3}>
                <div className="filter-item-wrap">
                  <Input
                    name="framt"
                    type="number"
                    value={filters.framt}
                    onChange={filterInputChange}
                  />
                  ~
                  <Input
                    name="toamt"
                    type="number"
                    value={filters.toamt}
                    onChange={filterInputChange}
                  />
                </div>
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>사업부</th>
              <td colSpan={2}>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="position"
                    value={filters.position}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="inoutdiv"
                    value={filters.inoutdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>등록자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="person"
                    value={filters.person}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
                  />
                )}
              </td>
              <th>계정코드</th>
              <td>
                <Input
                  name="acntcd"
                  type="text"
                  value={filters.acntcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onAccountWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>계정코드 명</th>
              <td colSpan={2}>
                <Input
                  name="acntnm"
                  type="text"
                  value={filters.acntnm}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
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
                onClick={onReceive}
                themeColor={"primary"}
                icon="track-changes-accept"
              >
                받을어음
              </Button>
              <Button
                onClick={onPayment}
                themeColor={"primary"}
                icon="track-changes-accept"
              >
                지급어음
              </Button>
              <Button
                themeColor={"primary"}
                fillMode="outline"
                onClick={onPrint}
                icon="print"
                style={{ marginRight: "8px" }}
              >
                출력
              </Button>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="file-add"
              >
                대체전표생성
              </Button>
              <Button onClick={onCopyClick} themeColor={"primary"} icon="copy">
                대체전표복사
              </Button>
              <Button
                onClick={onDeleteClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="delete"
              >
                대체전표삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "70vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                insert_time: convertDateToStrWithTime2(
                  new Date(row.insert_time)
                ),
                update_time: convertDateToStrWithTime2(
                  new Date(row.update_time)
                ),
                inputpath: InputListData.find(
                  (item: any) => item.sub_code === row.inputpath
                )?.code_name,
                insert_userid: usersListData.find(
                  (item: any) => item.user_id === row.insert_userid
                )?.user_name,
                slipdiv: slipdivListData.find(
                  (item: any) => item.sub_code === row.slipdiv
                )?.code_name,
                chk: row.chk == "" ? false : row.chk,
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
            onItemChange={onItemChange}
            cellRender={customCellRender3}
            rowRender={customRowRender3}
            editField={EDIT_FIELD}
          >
            <GridColumn cell={CommandCell} width="60px" />
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell}
              cell={CheckBoxCell}
            />
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
                      cell={
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : dateField.includes(item.fieldName)
                          ? DateCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder === 0
                          ? mainTotalFooterCell
                          : numberField.includes(item.fieldName)
                          ? gridSumQtyFooterCell
                          : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType == "A" ? "U" : "N"}
          setData={setCustData}
        />
      )}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAccountData}
        />
      )}
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : A
          setData={setCopyData}
          data={
            mainDataResult.data.filter(
              (item: any) =>
                item.num == Object.getOwnPropertyNames(selectedState)[0]
            )[0] == undefined
              ? ""
              : mainDataResult.data.filter(
                  (item: any) =>
                    item.num == Object.getOwnPropertyNames(selectedState)[0]
                )[0]
          }
          reload={reload}
          chkyn={filters.chkyn}
        />
      )}
      {printWindow && (
        <AC_A1000W_Print_Window
          setVisible={setPrintWindowVisible}
          data={
            mainDataResult.data.filter((item: any) => item.chk == true) ==
            undefined
              ? []
              : mainDataResult.data.filter((item: any) => item.chk == true)
          }
        />
      )}
      {receiveWindow && (
        <AC_A1000W_Receive_Window
          setVisible={setReceiveWindowVisible}
          data={
            mainDataResult.data.filter(
              (item: any) =>
                item.num == Object.getOwnPropertyNames(selectedState)[0]
            )[0] == undefined
              ? ""
              : mainDataResult.data.filter(
                  (item: any) =>
                    item.num == Object.getOwnPropertyNames(selectedState)[0]
                )[0]
          }
          setData={setOK}
        />
      )}
      {paymentWindow && (
        <AC_A1000W_Payment_Window
          setVisible={setPaymentWindowVisible}
          data={
            mainDataResult.data.filter(
              (item: any) =>
                item.num == Object.getOwnPropertyNames(selectedState)[0]
            )[0] == undefined
              ? ""
              : mainDataResult.data.filter(
                  (item: any) =>
                    item.num == Object.getOwnPropertyNames(selectedState)[0]
                )[0]
          }
          setData={setOK}
        />
      )}
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
    </>
  );
};

export default AC_A1000W;
