import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
  GRID_COL_INDEX_ATTRIBUTE,
  GridItemChangeEvent,
  GridHeaderCellProps,
} from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { gridList } from "../store/columns/MA_A3000W_C";
import FilterContainer from "../components/Containers/FilterContainer";
import BarcodeWindow from "../components/Windows/MA_A3000W_Barcode_Window";
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
import {
  Checkbox,
  Input,
} from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  UseParaPc,
  UseGetValueFromSessionItem,
  useSysMessage,
  getGridItemChangedData,
  toDate,
  getCustDataQuery,
} from "../components/CommonFunction";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import TopButtons from "../components/Buttons/TopButtons";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading, deletedAttadatnumsState } from "../store/atoms";
import MA_A3000W_Window from "../components/Windows/MA_A3000W_Window";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import { useTableKeyboardNavigation } from "@progress/kendo-react-data-tools";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";

let deletedMainRows: object[] = [];
const DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY = "num";
const dateField = ["outdt1", "outdt2", "outdt3", "purdt"];
const numberField = ["asfin"];
const lockField = ["fxmngnum", "itemcd", "itemnm", "insiz", "serialno"];
let temp = 0;
let temp2 = 0;
type TdataArr = {
  rowstatus_s: string[];
  fxmngnum_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  fxdiv_s: string[];
  model_s: string[];
  serialno_s: string[];
  purdt_s: string[];
  remark_s: string[];
  attdatnum_s: string[];
  devmngnum_s: string[];
  load_place_s: string[];
};

type TdataArr2 = {
  rowstatus_s: string[];
  remark_s: string[];
  amt_s: string[];
  unp_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
  recdt_s: string[];
  indt_s: string[];
  person_s: string[];
  custcd_s: string[];
  extra_field5_s: string[];
  strdt_s: string[];
  enddt_s: string[];
  seq1_s: string[];
  seq2_s: string[];
  outrecdt_s: string[];
  outseq1_s: string[];
  outseq2_s: string[];
  outcustcd_s: string[];
  outdt_s: string[];
  load_place_s: string[];
};
const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_CUST, L_sysUserMaster_001", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "custcd"
      ? "L_CUST"
      : field === "outcustcd"
      ? "L_CUST"
      : field === "person"
      ? "L_sysUserMaster_001"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  if (bizComponentIdVal == "L_CUST") {
    return bizComponent ? (
      <ComboBoxCell
        bizComponent={bizComponent}
        valueField="custcd"
        textField="custnm"
        {...props}
      />
    ) : (
      <td />
    );
  } else if (bizComponentIdVal == "L_sysUserMaster_001") {
    return bizComponent ? (
      <ComboBoxCell
        bizComponent={bizComponent}
        valueField="user_id"
        textField="user_name"
        {...props}
      />
    ) : (
      <td />
    );
  } else {
    return bizComponent ? (
      <ComboBoxCell bizComponent={bizComponent} {...props} />
    ) : (
      <td />
    );
  }
};

const MA_A3000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

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
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_CUST, L_LOADPLACE",
    //화폐단위, 단가산정방법, 발주상태, 사용자, 품목계정, 수량단위, 사용여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [custListData, setCustListData] = useState([
    { custcd: "", custnm: "" },
  ]);
  const [loadplaceListData, setLoadPlaceListData] = useState([COM_CODE_DEFAULT_VALUE]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const custQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_CUST")
      );
      const loadPlaceQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_LOADPLACE"
        )
      );
      fetchQuery(custQueryStr, setCustListData);
      fetchQuery(loadPlaceQueryStr, setLoadPlaceListData);
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [barcodeDataState, setBarcodeDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [barcodeDataResult, setBarCodeDataResult] = useState<DataResult>(
    process([], barcodeDataState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailselectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [barcodeWindowVisible, setBarcodeWindowVisible] =
    useState<boolean>(false);
  const [dataWindowVisible, setDataWindowVisible] =
    useState<boolean>(false);
    
  const [workType, setWorkType] = useState<"N" | "U">("N");

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
    orgdiv: "01",
    frdt: new Date(),
    todt: new Date(),
    fxmngnum: "",
    itemcd: "",
    itemnm: "",
    custcd: "",
    custnm: "",
    srialno: "",
    iteminsiz: "",
    rcvcustcd: "",
    rcvcustnm: "",
    devmngnum: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    fxmngnum: "",
    srialno: "",
    devmngnum: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [barcodeFilters, setBarCodeFilters] = useState({
    pgSize: PAGE_SIZE,
    fxmngnum: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_MA_A3000W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_fxmngnum": filters.fxmngnum,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_srialno": filters.srialno,
      "@p_iteminsiz": filters.iteminsiz,
      "@p_rcvcustcd": filters.rcvcustcd,
      "@p_rcvcustnm": filters.rcvcustnm,
      "@p_devmngnum": filters.devmngnum,
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_MA_A3000W_Q",
    pageNumber: detailFilters.pgNum,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "AS",
      "@p_orgdiv": filters.orgdiv,
      "@p_fxmngnum": detailFilters.fxmngnum,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_srialno": detailFilters.srialno,
      "@p_iteminsiz": filters.iteminsiz,
      "@p_rcvcustcd": filters.rcvcustcd,
      "@p_rcvcustnm": filters.rcvcustnm,
      "@p_devmngnum": detailFilters.devmngnum,
    },
  };

  const barcodeParameters: Iparameters = {
    procedureName: "P_MA_A3000W_Q",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "BARCODE",
      "@p_orgdiv": filters.orgdiv,
      "@p_fxmngnum": barcodeFilters.fxmngnum,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_itemcd": "",
      "@p_itemnm": "",
      "@p_srialno": "",
      "@p_iteminsiz": "",
      "@p_rcvcustcd": "",
      "@p_rcvcustnm": "",
      "@p_devmngnum": "",
    },
  };

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    fxmngnum_s: "",
    devmngnum_s: "",
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_MA_A3000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": "01",
      "@p_rowstatus_s": "",
      "@p_fxmngnum_s": paraDataDeleted.fxmngnum_s,
      "@p_itemcd_s": "",
      "@p_itemnm_s": "",
      "@p_fxdiv_s": "",
      "@p_model_s": "",
      "@p_serialno_s": "",
      "@p_purdt_s": "",
      "@p_remark_s": "",
      "@p_attdatnum_s": "",
      "@p_devmngnum_s": paraDataDeleted.devmngnum_s,
      "@p_amt_s": "",
      "@p_unp_s": "",
      "@p_wonamt_s": "",
      "@p_taxamt_s": "",
      "@p_location": "01",
      "@p_lotnum": "",
      "@p_recdt_s": "",
      "@p_indt_s": "",
      "@p_person_s": "",
      "@p_custcd_s": "",
      "@p_extra_field5_s": "",
      "@p_strdt_s": "",
      "@p_enddt_s": "",
      "@p_seq1_s": "",
      "@p_seq2_s": "",
      "@p_outrecdt_s": "",
      "@p_outseq1_s": "",
      "@p_outseq2_s": "",
      "@p_outcustcd_s": "",
      "@p_outdt_s": "",
      "@p_load_place_s": "",
      "@p_userid": "",
      "@p_pc": pc,
      "@p_form_id": "MA_A3000W",
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions?.view) return;
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
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });

          setDetailFilters((prev) => ({
            ...prev,
            fxmngnum: firstRowData.fxmngnum,
            devmngnum: firstRowData.devmngnum,
            srialno: firstRowData.serialno,
          }));
        }
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchDetailGrid = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setDetailDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (detailFilters.find_row_value === "" && detailFilters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setDetailSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    }
    setDetailFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchBarcodeGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", barcodeParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setBarCodeDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
      }
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (
      detailFilters.isSearch &&
      customOptionData !== null &&
      mainDataResult.total > 0
    ) {
      setDetailFilters((prev) => ({ ...prev, isSearch: false }));
      fetchDetailGrid();
    }
  }, [detailFilters]);

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

  let gridRef : any = useRef(null); 

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
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (detailFilters.find_row_value !== "" && detailDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = detailDataResult.data.findIndex(
          (item) => idGetter(item) === detailFilters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setDetailFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (detailFilters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [detailDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setDetailFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  const resetDetailGrid = () => {
    setDetailDataResult(process([], detailDataState));
    setDetailFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    if(selectedRowData.rowstatus != "N") {
      resetDetailGrid();
      setDetailFilters((prev) => ({
        ...prev,
        fxmngnum: selectedRowData.fxmngnum,
        devmngnum: selectedRowData.devmngnum,
        srialno: selectedRowData.serialno,
      }));
    }
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);
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

  const onDetailScrollHandler = (event: GridEvent) => {
    if (detailFilters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      detailFilters.pgNum +
      (detailFilters.scrollDirrection === "up" ? detailFilters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setDetailFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      detailFilters.pgNum -
      (detailFilters.scrollDirrection === "down" ? detailFilters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setDetailFilters((prev) => ({
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

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td
        colSpan={props.colSpan}
        className={"k-grid-footer-sticky"}
        style={props.style}
        {...{ [GRID_COL_INDEX_ATTRIBUTE]: 2 }}
      >
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
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

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult.data.forEach((item) =>
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

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult.total}건
      </td>
    );
  };

  const onAddClick = () => {
    detailDataResult.data.map((item) => {
      if(item.num > temp){
        temp = item.num
      }
  })
    const datas = detailDataResult.data[detailDataResult.data.length - 1];

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      address: "",
      amt: 0,
      custcd: "",
      custnm: "",
      enddt: convertDateToStr(new Date()),
      extra_field5: "",
      indt: convertDateToStr(new Date()),
      load_place: "0",
      outcustcd: "",
      outcustnm: "",
      outdt: convertDateToStr(new Date()),
      outrecdt: convertDateToStr(new Date()),
      outseq1: 0,
      outseq2: 0,
      person: "admin",
      phonenum: "",
      recdt: convertDateToStr(new Date()),
      remark: "",
      seq1: 0,
      seq2: 0,
      strdt: convertDateToStr(new Date()),
      taxamt: 0,
      unp: 0,
      wonamt: 0,
      rowstatus: "N",
    };

    setDetailDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
  };
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    const data = mainDataResult.data.filter((item) => item.chk == true);

    if (data.length == 0) {
      alert("삭제할 데이터가 없습니다.");
    } else {
      if (!window.confirm(questionToDelete)) {
        return false;
      }
      let dataArr: TdataArr = {
        rowstatus_s: [],
        fxmngnum_s: [],
        itemcd_s: [],
        itemnm_s: [],
        fxdiv_s: [],
        model_s: [],
        serialno_s: [],
        purdt_s: [],
        remark_s: [],
        attdatnum_s: [],
        devmngnum_s: [],
        load_place_s: [],
      };

      data.forEach((item: any, idx: number) => {
        const { fxmngnum = "", devmngnum = "" } = item;

        dataArr.fxmngnum_s.push(fxmngnum);
        dataArr.devmngnum_s.push(devmngnum);
      });
      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        fxmngnum_s: dataArr.fxmngnum_s.join("|"),
        devmngnum_s: dataArr.devmngnum_s.join("|"),
      }));
    }
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];

    detailDataResult.data.forEach((item: any, index: number) => {
      if (!detailselectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows.push(newData2);
      }
    });

    setDetailDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setDetailDataState({});
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
    //초기화
    setParaDataDeleted((prev) => ({
      work_type: "",
      fxmngnum_s: "",
      devmngnum_s: "",
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
  interface IItemData {
    itemcd: string;
    itemno: string;
    itemnm: string;
    insiz: string;
    model: string;
    itemacnt: string;
    itemacntnm: string;
    bnatur: string;
    spec: string;
    invunit: string;
    invunitnm: string;
    unitwgt: string;
    wgtunit: string;
    wgtunitnm: string;
    maker: string;
    dwgno: string;
    remark: string;
    itemlvl1: string;
    itemlvl2: string;
    itemlvl3: string;
    extra_field1: string;
    extra_field2: string;
    extra_field7: string;
    extra_field6: string;
    extra_field8: string;
    packingsiz: string;
    unitqty: string;
    color: string;
    gubun: string;
    qcyn: string;
    outside: string;
    itemthick: string;
    itemlvl4: string;
    itemlvl5: string;
    custitemnm: string;
  }

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };
  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData2 = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      rcvcustcd: data.custcd,
      rcvcustnm: data.custnm,
    }));
  };
  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A3000W_002");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A3000W_002");
      } else {
        resetAllGrid();
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "SAVE",
    orgdiv: "01",
    rowstatus_s: "",
    fxmngnum_s: "",
    itemcd_s: "",
    itemnm_s: "",
    fxdiv_s: "",
    model_s: "",
    serialno_s: "",
    purdt_s: "",
    remark_s: "",
    attdatnum_s: "",
    devmngnum_s: "",
    amt_s: "",
    unp_s: "",
    wonamt_s: "",
    taxamt_s: "",
    location: "01",
    lotnum: "",
    recdt_s: "",
    indt_s: "",
    person_s: "",
    custcd_s: "",
    extra_field5_s: "",
    strdt_s: "",
    enddt_s: "",
    seq1_s: "",
    seq2_s: "",
    outrecdt_s: "",
    outseq1_s: "",
    outseq2_s: "",
    outcustcd_s: "",
    outdt_s: "",
    load_place_s: "",
    userid: userId,
    pc: pc,
    form_id: "MA_A3000W",
  });

  const onSave = () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
 
    if (dataItem.length === 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      fxmngnum_s: [],
      itemcd_s: [],
      itemnm_s: [],
      fxdiv_s: [],
      model_s: [],
      serialno_s: [],
      purdt_s: [],
      remark_s: [],
      attdatnum_s: [],
      devmngnum_s: [],
      load_place_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        fxmngnum = "",
        itemcd = "",
        itemnm = "",
        fxdiv = "",
        model = "",
        serialno = "",
        purdt = "",
        remark = "",
        attdatnum = "",
        devmngnum = "",
        load_place1 = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.fxmngnum_s.push(fxmngnum);
      dataArr.itemcd_s.push(itemcd);
      dataArr.itemnm_s.push(itemnm);
      dataArr.fxdiv_s.push(fxdiv);
      dataArr.model_s.push(model);
      dataArr.serialno_s.push(serialno);
      dataArr.purdt_s.push(purdt);
      dataArr.remark_s.push(remark);
      dataArr.attdatnum_s.push(attdatnum);
      dataArr.devmngnum_s.push(devmngnum);
      dataArr.load_place_s.push(load_place1);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "SAVE",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      fxmngnum_s: dataArr.fxmngnum_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      itemnm_s: dataArr.itemnm_s.join("|"),
      fxdiv_s: dataArr.fxdiv_s.join("|"),
      model_s: dataArr.model_s.join("|"),
      serialno_s: dataArr.serialno_s.join("|"),
      purdt_s: dataArr.purdt_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      attdatnum_s: dataArr.attdatnum_s.join("|"),
      devmngnum_s: dataArr.devmngnum_s.join("|"),
      load_place_s: dataArr.load_place_s.join("|"),
    }));
  };

  const onSave2 = () => {
    const dataItem = detailDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    const data = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

    let dataArr: TdataArr2 = {
      rowstatus_s: [],
      remark_s: [],
      amt_s: [],
      unp_s: [],
      wonamt_s: [],
      taxamt_s: [],
      recdt_s: [],
      indt_s: [],
      person_s: [],
      custcd_s: [],
      extra_field5_s: [],
      strdt_s: [],
      enddt_s: [],
      seq1_s: [],
      seq2_s: [],
      outrecdt_s: [],
      outseq1_s: [],
      outseq2_s: [],
      outcustcd_s: [],
      outdt_s: [],
      load_place_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        remark = "",
        amt = "",
        unp = "",
        wonamt = "",
        taxamt = "",
        recdt = "",
        indt = "",
        person = "",
        custcd = "",
        extra_field5 = "",
        strdt = "",
        enddt = "",
        seq1 = "",
        seq2 = "",
        outrecdt = "",
        outseq1 = "",
        outseq2 = "",
        outcustcd = "",
        outdt = "",
        load_place = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
      dataArr.unp_s.push(unp == undefined ? 0 : unp);
      dataArr.amt_s.push(amt == undefined ? 0 : amt);
      dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
      dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
      dataArr.recdt_s.push(
        recdt == undefined || recdt == "" ? convertDateToStr(new Date()) : recdt
      );
      dataArr.indt_s.push(
        indt == undefined || indt == "" ? convertDateToStr(new Date()) : indt
      );
      dataArr.person_s.push(person == undefined ? "" : person);
      dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
      dataArr.extra_field5_s.push(
        extra_field5 == undefined ? "" : extra_field5
      );
      dataArr.strdt_s.push(
        strdt == undefined || strdt == "" ? convertDateToStr(new Date()) : strdt
      );
      dataArr.enddt_s.push(
        enddt == undefined || enddt == "" ? convertDateToStr(new Date()) : enddt
      );
      dataArr.seq1_s.push(seq1 == "" ? 0 : seq1);
      dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
      dataArr.outrecdt_s.push(
        outrecdt == undefined || outrecdt == ""
          ? convertDateToStr(new Date())
          : outrecdt
      );
      dataArr.outseq1_s.push(outseq1 == "" ? 0 : outseq1);
      dataArr.outseq2_s.push(outseq2 == "" ? 0 : outseq2);
      dataArr.outcustcd_s.push(outcustcd == undefined ? "" : outcustcd);
      dataArr.outdt_s.push(
        outdt == undefined || outdt == "" ? convertDateToStr(new Date()) : outdt
      );
      dataArr.load_place_s.push(load_place == undefined ? "" : load_place);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        remark = "",
        amt = "",
        unp = "",
        wonamt = "",
        taxamt = "",
        recdt = "",
        indt = "",
        person = "",
        custcd = "",
        extra_field5 = "",
        strdt = "",
        enddt = "",
        seq1 = "",
        seq2 = "",
        outrecdt = "",
        outseq1 = "",
        outseq2 = "",
        outcustcd = "",
        outdt = "",
        load_place = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
      dataArr.unp_s.push(unp == undefined ? 0 : unp);
      dataArr.amt_s.push(amt == undefined ? 0 : amt);
      dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
      dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
      dataArr.recdt_s.push(
        recdt == undefined || recdt == "" ? convertDateToStr(new Date()) : recdt
      );
      dataArr.indt_s.push(
        indt == undefined || indt == "" ? convertDateToStr(new Date()) : indt
      );
      dataArr.person_s.push(person == undefined ? "" : person);
      dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
      dataArr.extra_field5_s.push(
        extra_field5 == undefined ? "" : extra_field5
      );
      dataArr.strdt_s.push(
        strdt == undefined || strdt == "" ? convertDateToStr(new Date()) : strdt
      );
      dataArr.enddt_s.push(
        enddt == undefined || enddt == "" ? convertDateToStr(new Date()) : enddt
      );
      dataArr.seq1_s.push(seq1 == "" ? 0 : seq1);
      dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
      dataArr.outrecdt_s.push(
        outrecdt == undefined || outrecdt == ""
          ? convertDateToStr(new Date())
          : outrecdt
      );
      dataArr.outseq1_s.push(outseq1 == "" ? 0 : outseq1);
      dataArr.outseq2_s.push(outseq2 == "" ? 0 : outseq2);
      dataArr.outcustcd_s.push(outcustcd == undefined ? "" : outcustcd);
      dataArr.outdt_s.push(
        outdt == undefined || outdt == "" ? convertDateToStr(new Date()) : outdt
      );
      dataArr.load_place_s.push(load_place == undefined ? "" : load_place);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "AS",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      fxmngnum_s: data.fxmngnum,
      itemcd_s: data.itemcd,
      itemnm_s: data.itemnm,
      fxdiv_s: data.fxdiv,
      serialno_s: data.serialno,
      models_s: "",
      attdatnum_s: data.attdatnum,
      devmngnum_s: data.devmngnum,
      remark_s: dataArr.remark_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      unp_s: dataArr.unp_s.join("|"),
      wonamt_s: dataArr.wonamt_s.join("|"),
      taxamt_s: dataArr.taxamt_s.join("|"),
      recdt_s: dataArr.recdt_s.join("|"),
      indt_s: dataArr.indt_s.join("|"),
      person_s: dataArr.person_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      extra_field5_s: dataArr.extra_field5_s.join("|"),
      strdt_s: dataArr.strdt_s.join("|"),
      enddt_s: dataArr.enddt_s.join("|"),
      seq1_s: dataArr.seq1_s.join("|"),
      seq2_s: dataArr.seq2_s.join("|"),
      outrecdt_s: dataArr.outrecdt_s.join("|"),
      outseq1_s: dataArr.outseq1_s.join("|"),
      outseq2_s: dataArr.outseq2_s.join("|"),
      outcustcd_s: dataArr.outcustcd_s.join("|"),
      outdt_s: dataArr.outdt_s.join("|"),
      load_place_s: dataArr.load_place_s.join("|"),
    }));
  };

  const para: Iparameters = {
    procedureName: "P_MA_A3000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": "01",
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_fxmngnum_s": ParaData.fxmngnum_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_fxdiv_s": ParaData.fxdiv_s,
      "@p_model_s": ParaData.model_s,
      "@p_serialno_s": ParaData.serialno_s,
      "@p_purdt_s": ParaData.purdt_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_attdatnum_s": ParaData.attdatnum_s,
      "@p_devmngnum_s": ParaData.devmngnum_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_location": ParaData.location,
      "@p_lotnum": ParaData.lotnum,
      "@p_recdt_s": ParaData.recdt_s,
      "@p_indt_s": ParaData.indt_s,
      "@p_person_s": ParaData.person_s,
      "@p_custcd_s": ParaData.custcd_s,
      "@p_extra_field5_s": ParaData.extra_field5_s,
      "@p_strdt_s": ParaData.strdt_s,
      "@p_enddt_s": ParaData.enddt_s,
      "@p_seq1_s": ParaData.seq1_s,
      "@p_seq2_s": ParaData.seq2_s,
      "@p_outrecdt_s": ParaData.outrecdt_s,
      "@p_outseq1_s": ParaData.outseq1_s,
      "@p_outseq2_s": ParaData.outseq2_s,
      "@p_outcustcd_s": ParaData.outcustcd_s,
      "@p_outdt_s": ParaData.outdt_s,
      "@p_load_place_s": ParaData.load_place_s,
      "@p_userid": ParaData.userid,
      "@p_pc": pc,
      "@p_form_id": "MA_A3000W",
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
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "SAVE",
        orgdiv: "01",
        rowstatus_s: "",
        fxmngnum_s: "",
        itemcd_s: "",
        itemnm_s: "",
        fxdiv_s: "",
        model_s: "",
        serialno_s: "",
        purdt_s: "",
        remark_s: "",
        attdatnum_s: "",
        devmngnum_s: "",
        amt_s: "",
        unp_s: "",
        wonamt_s: "",
        taxamt_s: "",
        location: "01",
        lotnum: "",
        recdt_s: "",
        indt_s: "",
        person_s: "",
        custcd_s: "",
        extra_field5_s: "",
        strdt_s: "",
        enddt_s: "",
        seq1_s: "",
        seq2_s: "",
        outrecdt_s: "",
        outseq1_s: "",
        outseq2_s: "",
        outcustcd_s: "",
        outdt_s: "",
        load_place_s: "",
        userid: userId,
        pc: pc,
        form_id: "MA_A3000W",
      });
      resetAllGrid();
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s.length != 0) {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
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

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    let valid = true;
    if (
      field == "fxmngnum" ||
      field == "itemcd" ||
      field == "itemnm" ||
      field == "insiz" ||
      field == "rowstatus" ||
      field == "lotnum" ||
      field == "asfin" ||
      field == "custcd" ||
      field == "outdt1" ||
      field == "custcd1" ||
      field == "outdt2" ||
      field == "custcd2" ||
      field == "load_place2" ||
      field == "outdt3" ||
      field == "custcd3" ||
      field == "load_place3"
    ) {
      valid = false;
      return false;
    }
    if (valid == true) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
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

      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
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

  const onDetailItemChange = (event: GridItemChangeEvent) => {
    setDetailDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      detailDataResult,
      setDetailDataResult,
      DATA_ITEM_KEY
    );
  };

  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
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

  const enterEdit2 = (dataItem: any, field: string) => {
    let valid = true;
    if (
      field == "num" ||
      field == "address" ||
      field == "phonenum" ||
      field == "wonamt" ||
      field == "taxamt" ||
      field == "amt" ||
      field == "rowstatus"
    ) {
      valid = false;
      return false;
    }
    if (valid == true) {
      const newData = detailDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
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
      setEditIndex(dataItem[DATA_ITEM_KEY]);
      if (field) {
        setEditedField(field);
      }
      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (editedField !== "custcd") {
      const newData = detailDataResult.data.map((item) => ({
        ...item,
        amt: item.unp,
        wonamt: item.unp,
        taxamt: item.unp / 10,
        [EDIT_FIELD]: undefined,
      }));

      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      detailDataResult.data.map(async (item) => {
        if (editIndex === item.num) {
          const custcd = await fetchCustInfo(item.custcd);
          if(custcd != null && custcd != undefined) {
            const newData = detailDataResult.data.map((item) =>
            item.num == parseInt(Object.getOwnPropertyNames(detailselectedState)[0])
              ? {
                  ...item,
                  custcd: custcd.custcd,
                  address: custcd.address,
                  phonenum: custcd.phonenum,
                  rowstatus: item.rowstatus === "N" ? "N" : "U",
                  [EDIT_FIELD]: undefined,
                }
              : {
                  ...item,
                  [EDIT_FIELD]: undefined,
                }
            );
            setDetailDataResult((prev) => {
              return {
                data: newData,
                total: prev.total,
              };
            });
          }
        }
      });
    }
  };

  const fetchCustInfo = async (custcd: string) => {
    if (custcd === "") return;
    let data: any;
    let custInfo: null | { custcd: string; address: string, phonenum: string } = null;

    const queryStr = getCustDataQuery(custcd);
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
      if (rows.length > 0) {
        custInfo = { custcd: rows[0].custcd, address: rows[0].address, phonenum: rows[0].phonenum };
      }
    }

    return custInfo;
  };

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn field={"num"} title={"NO"} width="100px" cell={NumberCell} />
    );
    array.push(
      <GridColumn
        field={"indt"}
        title={"입고일자"}
        width="120px"
        cell={DateCell}
      />
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"unp"}
        title={"단가"}
        width="100px"
        cell={NumberCell}
      />
    );
    array.push(
      <GridColumn
        field={"amt"}
        title={"금액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"wonamt"}
        title={"원화금액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    array.push(
      <GridColumn
        field={"taxamt"}
        title={"세액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell2}
      />
    );
    return array;
  };

  const createColumn3 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"outdt"}
        title={"일자"}
        width="120px"
        cell={DateCell}
      />
    );
    array.push(
      <GridColumn
        field={"outcustcd"}
        title={"업체"}
        width="120px"
        cell={CustomComboBoxCell}
      />
    );
    array.push(
      <GridColumn field={"load_place"} title={"적재장소"} width="120px" />
    );
    return array;
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus === "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const CustomCheckBoxCell = (props: GridCellProps) => {
    const navigationAttributes = useTableKeyboardNavigation(props.id);
    const field = props.field || "";

    const onChange = () => {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === props.dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
        chk: !item.chk,
              [EDIT_FIELD]: props.field,
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
    };

    return (
      <td
        style={props.style} // this applies styles that lock the column at a specific position
        className={props.className} // this adds classes needed for locked columns
        colSpan={props.colSpan}
        role={"gridcell"}
        aria-colindex={props.ariaColumnIndex}
        aria-selected={props.isSelected}
        {...navigationAttributes}
      >
        <Checkbox value={props.dataItem[field]} onClick={onChange}></Checkbox>
      </td>
    );
  };

  const onPrint = () => {
    const datas = mainDataResult.data.filter(
      (item) => item.chk == true
    );
    try {
      if (datas.length == 0) {
        throw findMessage(messagesData, "MA_A3000W_001");
      } else {
        onBarcodeWndClick();
      }
    } catch (e) {
      alert(e);
    }
  };

  const onBarcodeWndClick = () => {
    setBarcodeWindowVisible(true);
  };

  const onDataWndClick = () => {
    setDataWindowVisible(true);
  };
  
  
  const setCopyData = (data: any) => {
    try {
      data.map((item: any) => {
        mainDataResult.data.map((item) => {
          if(item.num > temp2){
            temp2 = item.num
          }
      })
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp2,
          asfin: "0",
          attdatnum: "",
          chk: "",
          custcd: "",
          custcd1: "",
          custcd2: "",
          custcd3: "",
          devmngnum: item.inkey,
          files: "",
          fxdiv: "",
          fxmngnum: "",
          insiz: item.insiz,
          itemcd: item.itemcd,
          itemnm: item.itemnm,
          load_place1: "",
          load_place2: "",
          load_place3: "",
          lotnum: item.lotnum,
          outdt1: "",
          outdt2: "",
          outdt3: "",
          purdt: item.indt,
          remark: "",
          serialno: "",
          rowstatus: "N",
        };

        setMainDataResult((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
      });
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>장비관리</Title>

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
              <th>장비관리번호</th>
              <td>
                <Input
                  name="fxmngnum"
                  type="text"
                  value={filters.fxmngnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>구입처코드</th>
              <td>
                <div className="filter-item-wrap">
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
                </div>
              </td>
              <th>구입처명</th>
              <td>
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onItemWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>시리얼No.</th>
              <td>
                <Input
                  name="srialno"
                  type="text"
                  value={filters.srialno}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>구입일자</th>
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
              <th>출하처코드</th>
              <td>
                <div className="filter-item-wrap">
                  <Input
                    name="rcvcustcd"
                    type="text"
                    value={filters.rcvcustcd}
                    onChange={filterInputChange}
                  />
                  <ButtonInInput>
                    <Button
                      onClick={onCustWndClick2}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </div>
              </td>
              <th>출하처</th>
              <td>
                <Input
                  name="rcvcustnm"
                  type="text"
                  value={filters.rcvcustnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>규격</th>
              <td>
                <Input
                  name="iteminsiz"
                  type="text"
                  value={filters.iteminsiz}
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
                themeColor={"primary"}
                fillMode="outline"
                onClick={onPrint}
                icon="print"
              >
                바코드출력
              </Button>
              <Button
                themeColor={"primary"}
                fillMode="outline"
                onClick={onDataWndClick}
                icon="folder-open"
              >
                입고참조
              </Button>
              <Button
                onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
              >
                장비관리삭제
              </Button>
              <Button onClick={onSave} icon="save" themeColor={"primary"}>
                장비관리저장
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "36vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                rowstatus:
                  row.rowstatus == null ||
                  row.rowstatus == "" ||
                  row.rowstatus == undefined
                    ? ""
                    : row.rowstatus,
                purdt: row.purdt == "" ? new Date() : toDate(row.purdt),
                custcd: custListData.find(
                  (item: any) => item.custcd === row.custcd
                )?.custnm,
                custcd1: custListData.find(
                  (item: any) => item.custcd === row.custcd1
                )?.custnm,
                custcd2: custListData.find(
                  (item: any) => item.custcd === row.custcd2
                )?.custnm,
                custcd3: custListData.find(
                  (item: any) => item.custcd === row.custcd3
                )?.custnm,
                load_place1: loadplaceListData.find(
                  (item: any) => item.sub_code === row.load_place1
                )?.code_name,
                load_place2: loadplaceListData.find(
                  (item: any) => item.sub_code === row.load_place2
                )?.code_name,
                load_place3: loadplaceListData.find(
                  (item: any) => item.sub_code === row.load_place3
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
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="rowstatus"
              title=" "
              locked={true}
              width="50px"
            />
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              locked={true}
              headerCell={CustomCheckBoxCell2}
              cell={CustomCheckBoxCell}
            />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"].map(
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
                      locked={lockField.includes(item.fieldName) ? true : false}
                      footerCell={
                        item.sortOrder === 0 ? mainTotalFooterCell : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>이력</GridTitle>
          <ButtonContainer>
            <Button
              onClick={onAddClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="plus"
              title="행 추가"
            ></Button>
            <Button
              onClick={onDeleteClick2}
              fillMode="outline"
              themeColor={"primary"}
              icon="minus"
              title="행 삭제" 
            ></Button>
            <Button
              onClick={onSave2}
              fillMode="outline"
              themeColor={"primary"}
              icon="save"
              title="저장"
            ></Button>
          </ButtonContainer>
        </GridTitleContainer>
        <Grid
          style={{ height: "34vh" }}
          data={process(
            detailDataResult.data.map((row) => ({
              ...row,
              rowstatus:
                row.rowstatus == null ||
                row.rowstatus == "" ||
                row.rowstatus == undefined
                  ? ""
                  : row.rowstatus,
              indt: row.indt == "" ? new Date() : toDate(row.indt),
              strdt: row.strdt == "" ? new Date() : toDate(row.strdt),
              enddt: row.enddt == "" ? new Date() : toDate(row.enddt),
              outdt: row.outdt == "" ? new Date() : toDate(row.outdt),
              [SELECTED_FIELD]: detailselectedState[detailIdGetter(row)],
            })),
            detailDataState
          )}
          {...detailDataState}
          onDataStateChange={onDetailDataStateChange}
          //스크롤 조회 기능
          dataItemKey={DETAIL_DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onDetailSelectionChange}
          fixedScroll={true}
          total={detailDataResult.total}
          onScroll={onDetailScrollHandler}
          //정렬기능
          sortable={true}
          onSortChange={onDetailSortChange}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
          onItemChange={onDetailItemChange}
          cellRender={customCellRender2}
          rowRender={customRowRender2}
          editField={EDIT_FIELD}
        >
          <GridColumn field="rowstatus" title=" " width="50px" />
          <GridColumn title="A/S이력">{createColumn()}</GridColumn>
          <GridColumn
            field="person"
            title="담당자"
            width="120px"
            cell={CustomComboBoxCell}
          />
          <GridColumn field="remark" title="증상" width="120px" />
          <GridColumn
            field="strdt"
            title="발송일자"
            width="120px"
            cell={DateCell}
          />
          <GridColumn
            field="custcd"
            title="발송업체"
            width="120px"
            cell={CustomComboBoxCell}
          />
          <GridColumn field="address" title="업체주소" width="200px" />
          <GridColumn field="phonenum" title="전화번호" width="120px" />
          <GridColumn field="extra_field5" title="조치내용" width="150px" />
          <GridColumn title="금액">{createColumn2()}</GridColumn>
          <GridColumn
            field="enddt"
            title="수령일자"
            width="120px"
            cell={DateCell}
          />
          <GridColumn title="재출하">{createColumn3()}</GridColumn>
        </Grid>
      </GridContainer>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={workType}
          setData={setCustData2}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
        />
      )}
      {barcodeWindowVisible && (
        <BarcodeWindow
          setVisible={setBarcodeWindowVisible}
          data={mainDataResult.data.filter((item: any) => item.chk == true)}
          filter={filters}
          total={
            mainDataResult.data.filter((item: any) => item.chk == true).length
          }
        />
      )}
      {dataWindowVisible && (
        <MA_A3000W_Window
          setVisible={setDataWindowVisible}
          setData={setCopyData}
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

export default MA_A3000W;
