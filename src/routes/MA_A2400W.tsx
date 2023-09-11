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
} from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { gridList } from "../store/columns/MA_A2400W_C";
import FilterContainer from "../components/Containers/FilterContainer";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
  GridContainerWrap,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
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
} from "../components/CommonFunction";
import DetailWindow from "../components/Windows/MA_A2400W_Window";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, deletedAttadatnumsState, loginResultState } from "../store/atoms";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";

const DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY = "num";

const dateField = ["purdt"];
const numberField = [
  "purqty",
  "amt",
  "wonamt",
  "taxamt",
  "totamt",
  "qty",
  "unitwgt",
  "wgt",
  "unp",
];
const numberField2 = ["purqty", "amt", "wonamt", "taxamt", "totamt"];
type TdataArr = {
  rowstatus_s: string[];
  purseq_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  insiz_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  unitwgt_s: string[];
  wgt_s: string[];
  wgtunit_s: string[];
  proccd_s: string[];
  planno_s: string[];
  planseq_s: string[];
  unpcalmeth_s: string[];
  unp_s: string[];
  amt_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
  remark_s: string[];
};

const MA_A2400W: React.FC = () => {
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
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

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
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        person: defaultOption.find((item: any) => item.id === "person")
          .valueCode,
        pursts: defaultOption.find((item: any) => item.id === "pursts")
          .valueCode,
        finyn: defaultOption.find((item: any) => item.id === "finyn").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA019,L_BA002,L_BA015, L_PR010",
    //단가산정방법, 사업장, 수량단위, 공정
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [unpcalmethListData, setUnpcalmethListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const unpcalmethQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA019")
      );
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
      );
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );

      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(unpcalmethQueryStr, setUnpcalmethListData);
      fetchQuery(locationQueryStr, setLocationListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
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
  const [detailDataState2, setDetailDataState2] = useState<State>({
    sort: [],
  });

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.num]: true });

      setWorkType("U");
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

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );

  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailDataState2)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailselectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [detailPgNum, setDetailPgNum] = useState(1);
  const [detailPgNum2, setDetailPgNum2] = useState(1);

  const [workType, setWorkType] = useState<"N" | "U">("N");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);

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
    itemcd: "",
    itemnm: "",
    custcd: "",
    custnm: "",
    frdt: new Date(),
    todt: new Date(),
    person: "",
    location: "",
    pursts: "",
    purnum: "",
    finyn: "N",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    purnum: "",
  });

  const [detailFilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    purnum: "",
    purseq: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_MA_A2400W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_purnum": filters.purnum,
      "@p_purseq": 0,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_person": filters.person,
      "@p_pursts": filters.pursts,
      "@p_finyn": filters.finyn,
      "@p_company_code": companyCode,
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_MA_A2400W_Q",
    pageNumber: detailPgNum,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_purnum": detailFilters.purnum,
      "@p_purseq": 0,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_person": filters.person,
      "@p_pursts": filters.pursts,
      "@p_finyn": filters.finyn,
      "@p_company_code": companyCode,
    },
  };

  const detailParameters2: Iparameters = {
    procedureName: "P_MA_A2400W_Q",
    pageNumber: detailPgNum2,
    pageSize: detailFilters2.pgSize,
    parameters: {
      "@p_work_type": "OUT",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_purnum": detailFilters2.purnum,
      "@p_purseq": detailFilters2.purseq,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_person": filters.person,
      "@p_pursts": filters.pursts,
      "@p_finyn": filters.finyn,
      "@p_company_code": companyCode,
    },
  };

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    purnum: "",
    attdatnum: "",
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_MA_A2400W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": "01",
      "@p_location": "01",
      "@p_purnum": paraDataDeleted.purnum,
      "@p_purdt": "",
      "@p_pursts": 0,
      "@p_inexpdt": "",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_custprsncd": "",
      "@p_person": "",
      "@p_doexdiv": "",
      "@p_taxdiv": "",
      "@p_amtunit": "",
      "@p_baseamt": 0,
      "@p_wonchgrat": 0,
      "@p_uschgrat": 0,
      "@p_attdatnum": "",
      "@p_remark": "",
      "@p_rowstatus_s": "",
      "@p_purseq_s": "",
      "@p_itemcd_s": "",
      "@p_itemnm_s": "",
      "@p_insiz_s": "",
      "@p_qty_s": "",
      "@p_qtyunit_s": "",
      "@p_unitwgt_s": "",
      "@p_wgt_s": "",
      "@p_wgtunit_s": "",
      "@p_proccd_s": "",
      "@p_planno_s": "",
      "@p_planseq_s": "",
      "@p_unpcalmeth_s": "",
      "@p_unp_s": "",
      "@p_amt_s": "",
      "@p_wonamt_s": "",
      "@p_taxamt_s": "",
      "@p_remark_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_MA_A2400W",
      "@p_company_code": companyCode,
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
            purnum: firstRowData.purnum,
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
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setDetailDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
    }
    setLoading(false);
  };

  const fetchDetailGrid2 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", detailParameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setDetailDataResult2((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
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
    resetDetailGrid();
    if (customOptionData !== null && mainDataResult.total > 0) {
      fetchDetailGrid();
    }
  }, [detailFilters]);

  useEffect(() => {
    resetDetailGrid2();
    if (customOptionData !== null && mainDataResult.total > 0) {
      fetchDetailGrid2();
    }
  }, [detailFilters2]);

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
    if (ifSelectFirstRow) {
      if (detailDataResult.total > 0) {
        const firstRowData = detailDataResult.data[0];
        setDetailSelectedState({ [firstRowData.num]: true });

        setDetailFilters2((prev) => ({
          ...prev,
          purnum: firstRowData.purnum,
          purseq: firstRowData.purseq,
        }));
        setIfSelectFirstRow(true);
      }
    }
  }, [detailDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setDetailPgNum(1);
    setDetailPgNum2(1);
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
    setDetailDataResult2(process([], detailDataState2));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  const resetDetailGrid = () => {
    setDetailPgNum(1);
    setDetailDataResult(process([], detailDataState));
  };

  const resetDetailGrid2 = () => {
    setDetailPgNum2(1);
    setDetailDataResult2(process([], detailDataState2));
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

    setDetailFilters((prev) => ({
      ...prev,
      purnum: selectedRowData.purnum,
    }));
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters2((prev) => ({
      ...prev,
      purnum: selectedRowData.purnum,
      purseq: selectedRowData.purseq,
    }));
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
    if (chkScrollHandler(event, detailPgNum, PAGE_SIZE))
      setDetailPgNum((prev) => prev + 1);
  };

  const onDetailScrollHandler2 = (event: GridEvent) => {
    if (chkScrollHandler(event, detailPgNum2, PAGE_SIZE))
      setDetailPgNum2((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  const onDetailDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDetailDataState2(event.dataState);
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

  const detail2TotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult2.total}건
      </td>
    );
  };

  const onAddClick = () => {
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    const data = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      purnum: data.purnum,
      attdatnum: data.attdatnum,
    }));
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
                  // 첨부파일 삭제
                  if (paraDataDeleted.attdatnum)
                  setDeletedAttadatnums([paraDataDeleted.attdatnum]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }
    //초기화
    setParaDataDeleted((prev) => ({
      work_type: "",
      purnum: "",
      attdatnum: "",
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

  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A2400W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A2400W_001");
      } else if (
        filters.location == null ||
        filters.location == "" ||
        filters.location == undefined
      ) {
        throw findMessage(messagesData, "MA_A2400W_002");
      } else {
        resetAllGrid();
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: "01",
    location: "01",
    purnum: "",
    purdt: new Date(),
    pursts: "",
    inexpdt: new Date(),
    custcd: "",
    custnm: "",
    custprsncd: "",
    person: "admin",
    doexdiv: "A",
    taxdiv: "A",
    amtunit: "",
    baseamt: 0,
    wonchgrat: 0,
    uschgrat: 0,
    attdatnum: "",
    remark: "",
    rowstatus_s: "",
    purseq_s: "",
    itemcd_s: "",
    itemnm_s: "",
    insiz_s: "",
    qty_s: "",
    qtyunit_s: "",
    unitwgt_s: "",
    wgt_s: "",
    wgtunit_s: "",
    proccd_s: "",
    planno_s: "",
    planseq_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    wonamt_s: "",
    taxamt_s: "",
    remark_s: "",
    form_id: "MA_A2400W",
    serviceid: companyCode,
  });

  const setCopyData = (data: any, filter: any, deletedMainRows: any) => {
    let valid = true;

    const dataItem = data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    setParaData((prev) => ({
      ...prev,
      workType: workType,
      amt: filter.amt,
      amtunit: filter.amtunit,
      attdatnum: filter.attdatnum,
      baseamt: filter.baseamt,
      custcd: filter.custcd,
      custnm: filter.custnm,
      custprsncd: filter.custprsncd,
      doexdiv: filter.doexdiv,
      files: filter.files,
      inexpdt: filter.inexpdt,
      location: "01",
      orgdiv: "01",
      person: filter.person,
      purdt: filter.purdt,
      pursts: filter.pursts,
      purnum: filter.purnum,
      remark: filter.remark,
      taxdiv: filter.taxdiv,
      uschgrat: filter.uschgrat,
      wonchgrat: filter.wonchgrat,
      userid: userId,
      pc: pc,
      form_id: "MA_A2400W",
      serviceid: companyCode,
    }));
    if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      purseq_s: [],
      itemcd_s: [],
      itemnm_s: [],
      insiz_s: [],
      qty_s: [],
      qtyunit_s: [],
      unitwgt_s: [],
      wgt_s: [],
      wgtunit_s: [],
      proccd_s: [],
      planno_s: [],
      planseq_s: [],
      unpcalmeth_s: [],
      unp_s: [],
      amt_s: [],
      wonamt_s: [],
      taxamt_s: [],
      remark_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        amt = "",
        itemcd = "",
        itemnm = "",
        rowstatus = "",
        taxamt = "",
        unp = "",
        qty = "",
        qtyunit = "",
        wonamt = "",
        remark = "",
        purseq = "",
        insiz = "",
        unitwgt = "",
        wgt = "",
        wgtunit = "",
        proccd = "",
        planno = "",
        planseq = "",
        unpcalmeth = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.purseq_s.push(purseq == "" ? 0 : purseq);
      dataArr.itemcd_s.push(itemcd);
      dataArr.itemnm_s.push(itemnm);
      dataArr.insiz_s.push(insiz == undefined ? "" : insiz);
      dataArr.qty_s.push(qty == "" ? 0 : qty);
      dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
      dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
      dataArr.wgt_s.push(wgt == "" ? 0 : wgt);
      dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
      dataArr.proccd_s.push(proccd == undefined ? "" : proccd);
      dataArr.planno_s.push(planno == undefined ? "" : planno);
      dataArr.planseq_s.push(planseq == "" ? 0 : planseq);
      dataArr.unpcalmeth_s.push(unpcalmeth == "" ? 0 : unpcalmeth);
      dataArr.unp_s.push(unp == "" ? 0 : unp);
      dataArr.amt_s.push(amt == "" ? 0 : amt);
      dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
      dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        amt = "",
        itemcd = "",
        itemnm = "",
        rowstatus = "",
        taxamt = "",
        unp = "",
        qty = "",
        qtyunit = "",
        wonamt = "",
        remark = "",
        purseq = "",
        insiz = "",
        unitwgt = "",
        wgt = "",
        wgtunit = "",
        proccd = "",
        planno = "",
        planseq = "",
        unpcalmeth = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.purseq_s.push(purseq == "" ? 0 : purseq);
      dataArr.itemcd_s.push(itemcd);
      dataArr.itemnm_s.push(itemnm);
      dataArr.insiz_s.push(insiz == undefined ? "" : insiz);
      dataArr.qty_s.push(qty == "" ? 0 : qty);
      dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
      dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
      dataArr.wgt_s.push(wgt == "" ? 0 : wgt);
      dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
      dataArr.proccd_s.push(proccd == undefined ? "" : proccd);
      dataArr.planno_s.push(planno == undefined ? "" : planno);
      dataArr.planseq_s.push(planseq == "" ? 0 : planseq);
      dataArr.unpcalmeth_s.push(unpcalmeth == "" ? 0 : unpcalmeth);
      dataArr.unp_s.push(unp == "" ? 0 : unp);
      dataArr.amt_s.push(amt == "" ? 0 : amt);
      dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
      dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
    });
    setParaData((prev) => ({
      ...prev,
      workType: workType,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      purseq_s: dataArr.purseq_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      itemnm_s: dataArr.itemnm_s.join("|"),
      insiz_s: dataArr.insiz_s.join("|"),
      qty_s: dataArr.qty_s.join("|"),
      qtyunit_s: dataArr.qtyunit_s.join("|"),
      unitwgt_s: dataArr.unitwgt_s.join("|"),
      wgt_s: dataArr.wgt_s.join("|"),
      wgtunit_s: dataArr.wgtunit_s.join("|"),
      proccd_s: dataArr.proccd_s.join("|"),
      planno_s: dataArr.planno_s.join("|"),
      planseq_s: dataArr.planseq_s.join("|"),
      unpcalmeth_s: dataArr.unpcalmeth_s.join("|"),
      unp_s: dataArr.unp_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      wonamt_s: dataArr.wonamt_s.join("|"),
      taxamt_s: dataArr.taxamt_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
    }));
  };

  const para: Iparameters = {
    procedureName: "P_MA_A2400W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": "01",
      "@p_location": "01",
      "@p_purnum": ParaData.purnum,
      "@p_purdt": convertDateToStr(ParaData.purdt),
      "@p_pursts": ParaData.pursts,
      "@p_inexpdt": convertDateToStr(ParaData.inexpdt),
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_custprsncd": ParaData.custprsncd,
      "@p_person": ParaData.person,
      "@p_doexdiv": ParaData.doexdiv,
      "@p_taxdiv": ParaData.taxdiv,
      "@p_amtunit": ParaData.amtunit,
      "@p_baseamt": ParaData.baseamt,
      "@p_wonchgrat": ParaData.wonchgrat,
      "@p_uschgrat": ParaData.uschgrat,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_remark": ParaData.remark,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_purseq_s": ParaData.purseq_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_insiz_s": ParaData.insiz_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_unitwgt_s": ParaData.unitwgt_s,
      "@p_wgt_s": ParaData.wgt_s,
      "@p_wgtunit_s": ParaData.wgtunit_s,
      "@p_proccd_s": ParaData.proccd_s,
      "@p_planno_s": ParaData.planno_s,
      "@p_planseq_s": ParaData.planseq_s,
      "@p_unpcalmeth_s": ParaData.unpcalmeth_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_MA_A2400W",
      "@p_company_code": companyCode,
    },
  };
  const [reload, setreload] = useState<boolean>(false);
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
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s.length != 0 || ParaData.workType == "U") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  return (
    <>
      <TitleContainer>
        <Title>외주발주</Title>

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
              <th>발주일자</th>
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
              <th>업체코드</th>
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
              <th>업체명</th>
              <td>
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>발주번호</th>
              <td>
                <Input
                  name="purnum"
                  type="text"
                  value={filters.purnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>담당자</th>
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
            </tr>
            <tr>
              <th>완료여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="finyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
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
              <th>발주상태</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="pursts"
                    value={filters.pursts}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
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
                onClick={onAddClick}
                themeColor={"primary"}
                icon="file-add"
              >
                외주발주생성
              </Button>
              <Button
                onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
              >
                외주발주삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "39vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                location: locationListData.find(
                  (item: any) => item.sub_code === row.location
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
          >
            <GridColumn cell={CommandCell} width="60px" />
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
                      footerCell={
                        item.sortOrder === 0
                          ? mainTotalFooterCell
                          : numberField2.includes(item.fieldName)
                          ? gridSumQtyFooterCell
                          : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      <GridContainerWrap>
        <GridContainer width={`73%`}>
          <GridTitleContainer>
            <GridTitle>상세정보</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "35.2vh" }}
            data={process(
              detailDataResult.data.map((row) => ({
                ...row,
                qtyunit: qtyunitListData.find(
                  (item: any) => item.sub_code === row.qtyunit
                )?.code_name,
                unpcalmeth: unpcalmethListData.find(
                  (item: any) => item.sub_code === row.unpcalmeth
                )?.code_name,
                proccd: proccdListData.find(
                  (item: any) => item.sub_code === row.proccd
                )?.code_name,
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
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList2"].map(
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
                        item.sortOrder === 0
                          ? detailTotalFooterCell
                          : numberField2.includes(item.fieldName)
                          ? gridSumQtyFooterCell2
                          : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(27% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>출고품목</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "35.2vh" }}
            data={process(
              detailDataResult2.data.map((row) => ({
                ...row,
              })),
              detailDataState2
            )}
            {...detailDataState2}
            onDataStateChange={onDetailDataStateChange2}
            //스크롤 조회 기능
            fixedScroll={true}
            total={detailDataResult2.total}
            onScroll={onDetailScrollHandler2}
            //정렬기능
            sortable={true}
            onSortChange={onDetailSortChange2}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList3"].map(
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
                          : undefined
                      }
                      footerCell={
                        item.sortOrder === 0
                          ? detail2TotalFooterCell
                          : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
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
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
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

export default MA_A2400W;
