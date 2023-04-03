import React, { useCallback, useEffect, useState, useRef } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
  GridHeaderSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { gridList } from "../store/columns/SA_A5010W_C";
import {
  Title,
  FilterBoxWrap,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
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
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import DetailWindow from "../components/Windows/SA_A5010W_Window";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";

const DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY = "num";
const dateField = ["recdt"];
const numberField = [
  "qty",
  "amt",
  "wonamt",
  "taxamt",
  "totamt",
  "sort_seq",
  "dlramt",
  "unitwgt",
  "NumberCell",
  "unp",
  "totwgt",
];

type TdataArr = {
  rowstatus_s: string[];
  seq2_s: string[];
  itemcd_s: string[];
  itemacnt_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  unpcalmeth_s: string[];
  unp_s: string[];
  amt_s: string[];
  wonamt_s: string[];
  taxamt_s: string[];
  dlramt_s: string[];
  unitwgt_s: string[];
  totwgt_s: string[];
  wgtunit_s: string[];
  remark_s: string[];
};

const SA_A5010W: React.FC = () => {
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
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        person: defaultOption.find((item: any) => item.id === "person")
          .valueCode,
        doexdiv: defaultOption.find((item: any) => item.id === "doexdiv")
          .valueCode,
        dtgb: defaultOption.find((item: any) => item.id === "dtgb").valueCode,
        taxdiv: defaultOption.find((item: any) => item.id === "taxdiv")
          .valueCode,
        taxyn: defaultOption.find((item: any) => item.id === "taxyn").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA020,L_BA019, L_SA002,L_BA005,L_BA029,L_BA002,L_sysUserMaster_001,L_dptcd_001,L_BA061,L_BA015,L_finyn",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [ordstsListData, setOrdstsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [doexdivListData, setDoexdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxdivListData, setTaxdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [usersListData, setUsersListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  const [departmentsListData, setDepartmentsListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [unpcalmethListData, setUnpcalmethListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [finynListData, setFinynListData] = useState([{ code: "", name: "" }]);
  const [amtunitListData, setAmtunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const amtunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA020")
      );
      const ordstsQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SA002")
      );
      const unpcalmethQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA019")
      );
      const doexdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA005")
      );
      const taxdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA029")
      );
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      );
      const usersQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const departmentQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const finynQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_finyn")
      );
      fetchQuery(amtunitQueryStr, setAmtunitListData);
      fetchQuery(unpcalmethQueryStr, setUnpcalmethListData);
      fetchQuery(ordstsQueryStr, setOrdstsListData);
      fetchQuery(doexdivQueryStr, setDoexdivListData);
      fetchQuery(taxdivQueryStr, setTaxdivListData);
      fetchQuery(locationQueryStr, setLocationListData);
      fetchQuery(usersQueryStr, setUsersListData);
      fetchQuery(departmentQueryStr, setDepartmentsListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(finynQueryStr, setFinynListData);
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
  const [isInitSearch, setIsInitSearch] = useState(false);

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.num]: true });

      setDetailFilters((prev) => ({
        ...prev,
        seq1: rowData.seq1,
        recdt: toDate(rowData.recdt),
      }));

      setIsCopy(false);
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

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [mainPgNum, setMainPgNum] = useState(1);
  const [detailPgNum, setDetailPgNum] = useState(1);

  const [workType, setWorkType] = useState<"N" | "U">("N");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [isCopy, setIsCopy] = useState(false);

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
    location: "",
    frdt: new Date(),
    todt: new Date(),
    person: "",
    custcd: "",
    custnm: "",
    recdt: new Date(),
    seq1: 0,
    dtgb: "A",
    doexdiv: "",
    taxdiv: "",
    itemcd: "",
    itemnm: "",
    rcvcustcd: "",
    rcvcustnm: "",
    taxyn: "N",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    recdt: new Date(),
    seq1: 0,
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_SA_A5010W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_dtgb": filters.dtgb,
      "@p_person": filters.person,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_rcvcustcd": filters.rcvcustcd,
      "@p_rcvcustnm": filters.rcvcustnm,
      "@p_doexdiv": filters.doexdiv,
      "@p_taxdiv": filters.taxdiv,
      "@p_taxyn": filters.taxyn,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_recdt": convertDateToStr(filters.recdt),
      "@p_seq1": filters.seq1,
      "@p_find_row_value": filters.find_row_value,
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_SA_A5010W_Q",
    pageNumber: detailFilters.pgNum,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_dtgb": filters.dtgb,
      "@p_person": filters.person,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_rcvcustcd": filters.rcvcustcd,
      "@p_rcvcustnm": filters.rcvcustnm,
      "@p_doexdiv": filters.doexdiv,
      "@p_taxdiv": filters.taxdiv,
      "@p_taxyn": filters.taxyn,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_recdt": convertDateToStr(detailFilters.recdt),
      "@p_seq1": detailFilters.seq1,
      "@p_find_row_value": detailFilters.find_row_value,
    },
  };

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    recdt: "",
    seq1: 0,
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_SA_A5010W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": filters.orgdiv,
      "@p_recdt": paraDataDeleted.recdt,
      "@p_seq1": paraDataDeleted.seq1,
      "@p_location": "",
      "@p_outdt": "",
      "@p_shipdt": "",
      "@p_doexdiv": "",
      "@p_taxdiv": "",
      "@p_amtunit": "",
      "@p_baseamt": 0,
      "@p_wonchgrat": 0,
      "@p_uschgrat": 0,
      "@p_person": "",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_rcvcustcd": "",
      "@p_rcvcustnm": "",
      "@p_remark": "",
      "@p_rowstatus_s": "",
      "@p_seq2_s": "",
      "@p_itemcd_s": "",
      "@p_itemacnt_s": "",
      "@p_qty_s": "",
      "@p_qtyunit_s": "",
      "@p_unpcalmeth_s": "",
      "@p_unp_s": "",
      "@p_amt_s": "",
      "@p_wonamt_s": "",
      "@p_taxamt_s": "",
      "@p_dlramt_s": "",
      "@p_unitwgt_s": "",
      "@p_totwgt_s": "",
      "@p_wgtunit_s": "",
      "@p_remark_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_SA_A5010W",
      "@p_company_code": "2207A046",
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
            total: totalRowCnt,
          };
        });

        if (filters.pgNum !== data.pageNumber) {
          setFilters((prev) => ({ ...prev, pgNum: data.pageNumber }));
        }

        if (filters.find_row_value === "" && data.pageNumber === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });

          setDetailFilters((prev) => ({
            ...prev,
            seq1: firstRowData.seq1,
            recdt: toDate(firstRowData.recdt),
          }));
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
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
            data: [...prev.data, ...rows],
            total: totalRowCnt + prev.total,
          };
        });
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (customOptionData !== null && filters.isSearch && permissions !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchDetailGrid();
    }
  }, [detailPgNum]);

  useEffect(() => {
    if (
      customOptionData != null &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      resetDetailGrid();
      if (mainDataResult.total > 0) {
        fetchDetailGrid();
      }
    }
  }, [detailFilters]);

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

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

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (detailFilters.find_row_value !== "" && detailDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = detailDataResult.data.findIndex(
          (item) => idGetter(item) === detailFilters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setDetailFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (detailFilters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [detailDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setDetailPgNum(1);
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
  };

  const resetDetailGrid = () => {
    setDetailPgNum(1);
    setDetailDataResult(process([], detailDataState));
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
      seq1: selectedRowData.seq1,
      recdt: toDate(selectedRowData.recdt),
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
    var parts = sum.toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult.total}건
      </td>
    );
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    var parts = sum.toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  const onAddClick = () => {
    setIsCopy(false);
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const onCopyClick = () => {
    const ordnum = Object.getOwnPropertyNames(selectedState)[0];

    const selectedRowData = mainDataResult.data.find(
      (item) => item.ordnum === ordnum
    );

    setDetailFilters((prev) => ({
      ...prev,
      seq1: selectedRowData.seq1,
      recdt: toDate(selectedRowData.recdt),
    }));

    setIsCopy(true);
    setWorkType("N");
    setDetailWindowVisible(true);
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
      recdt: data.recdt,
      seq1: data.seq1,
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
      setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.recdt = "";
    paraDataDeleted.seq1 = 0;
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

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A5010W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A5010W_001");
      } else if (
        filters.dtgb == null ||
        filters.dtgb == "" ||
        filters.dtgb == undefined
      ) {
        throw findMessage(messagesData, "SA_A5010W_002");
      } else if (
        filters.location == null ||
        filters.location == "" ||
        filters.location == undefined
      ) {
        throw findMessage(messagesData, "SA_A5010W_003");
      } else {
        resetAllGrid();
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: "01",
    recdt: new Date(),
    seq1: 0,
    location: "01",
    outdt: new Date(),
    shipdt: new Date(),
    doexdiv: "A",
    taxdiv: "A",
    amtunit: "",
    baseamt: 0,
    wonchgrat: 0,
    uschgrat: 0,
    person: "admin",
    custcd: "",
    custnm: "",
    rcvcustcd: "",
    rcvcustnm: "",
    remark: "",
    rowstatus_s: "",
    seq2_s: "",
    itemcd_s: "",
    itemacnt_s: "",
    qty_s: "",
    qtyunit_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    wonamt_s: "",
    taxamt_s: "",
    dlramt_s: "",
    unitwgt_s: "",
    totwgt_s: "",
    wgtunit_s: "",
    remark_s: "",
    userid: userId,
    pc: pc,
    files: "",
  });

  const para: Iparameters = {
    procedureName: "P_SA_A5010W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_recdt": convertDateToStr(ParaData.recdt),
      "@p_seq1": ParaData.seq1,
      "@p_location": ParaData.location,
      "@p_outdt": convertDateToStr(ParaData.outdt),
      "@p_shipdt": convertDateToStr(ParaData.shipdt),
      "@p_doexdiv": ParaData.doexdiv,
      "@p_taxdiv": ParaData.taxdiv,
      "@p_amtunit": ParaData.amtunit,
      "@p_baseamt": ParaData.baseamt,
      "@p_wonchgrat": ParaData.wonchgrat,
      "@p_uschgrat": ParaData.uschgrat,
      "@p_person": ParaData.person,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_rcvcustcd": ParaData.rcvcustcd,
      "@p_rcvcustnm": ParaData.rcvcustnm,
      "@p_remark": ParaData.remark,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_seq2_s": ParaData.seq2_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_unpcalmeth_s": ParaData.unpcalmeth_s,
      "@p_unp_s": ParaData.unp_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_dlramt_s": ParaData.dlramt_s,
      "@p_unitwgt_s": ParaData.unitwgt_s,
      "@p_totwgt_s": ParaData.totwgt_s,
      "@p_wgtunit_s": ParaData.wgtunit_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_SA_A5010W",
      "@p_company_code": "2207A046",
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
      setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "N",
        orgdiv: "01",
        recdt: new Date(),
        seq1: 0,
        location: "01",
        outdt: new Date(),
        shipdt: new Date(),
        doexdiv: "A",
        taxdiv: "A",
        amtunit: "",
        baseamt: 0,
        wonchgrat: 0,
        uschgrat: 0,
        person: "admin",
        custcd: "",
        custnm: "",
        rcvcustcd: "",
        rcvcustnm: "",
        remark: "",
        rowstatus_s: "",
        seq2_s: "",
        itemcd_s: "",
        itemacnt_s: "",
        qty_s: "",
        qtyunit_s: "",
        unpcalmeth_s: "",
        unp_s: "",
        amt_s: "",
        wonamt_s: "",
        taxamt_s: "",
        dlramt_s: "",
        unitwgt_s: "",
        totwgt_s: "",
        wgtunit_s: "",
        remark_s: "",
        userid: userId,
        pc: pc,
        files: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.custcd != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const setCopyData = (data: any, filter: any, deletedMainRows: any) => {
    let valid = true;

    const dataItem = data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows.length == 0) {
      setParaData((prev) => ({
        ...prev,
        workType: workType,
        location: filter.location,
        outdt: filter.outdt,
        shipdt: filter.shipdt,
        doexdiv: filter.doexdiv,
        taxdiv: filter.taxdiv,
        amtunit: filter.amtunit,
        wonchgrat: filter.wonchgrat,
        uschgrat: filter.uschgrat,
        person: filter.person,
        custcd: filter.custcd,
        custnm: filter.custnm,
        recdt: filter.recdt,
        rcvcustcd: filter.rcvcustcd,
        rcvcustnm: filter.rcvcustnm,
        remark: filter.remark,
        seq1: filter.seq1,
        userid: userId,
        pc: pc,
        form_id: "SA_A2300W",
        serviceid: "2207A046",
        files: filter.files,
      }));
    } else {
      let dataArr: TdataArr = {
        rowstatus_s: [],
        seq2_s: [],
        itemcd_s: [],
        itemacnt_s: [],
        qty_s: [],
        qtyunit_s: [],
        unpcalmeth_s: [],
        unp_s: [],
        amt_s: [],
        wonamt_s: [],
        taxamt_s: [],
        dlramt_s: [],
        unitwgt_s: [],
        totwgt_s: [],
        wgtunit_s: [],
        remark_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq2 = "",
          itemcd = "",
          itemacnt = "",
          qty = "",
          qtyunit = "",
          unpcalmeth = "",
          unp = "",
          amt = "",
          wonamt = "",
          taxamt = "",
          dlramt = "",
          unitwgt = "",
          totwgt = "",
          wgtunit = "",
          remark = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
        dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
        dataArr.itemacnt_s.push(itemacnt == "" ? "" : itemacnt);
        dataArr.qty_s.push(qty == "" ? 0 : qty);
        dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
        dataArr.unpcalmeth_s.push(unpcalmeth == undefined ? "Q" : unpcalmeth);
        dataArr.unp_s.push(unp == "" ? 0 : unp);
        dataArr.amt_s.push(amt == "" ? 0 : amt);
        dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
        dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
        dataArr.dlramt_s.push(dlramt == "" ? 0 : dlramt);
        dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
        dataArr.totwgt_s.push(totwgt == "" ? 0 : totwgt);
        dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
        dataArr.remark_s.push(remark == undefined ? "" : remark);
      });
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          seq2 = "",
          itemcd = "",
          itemacnt = "",
          qty = "",
          qtyunit = "",
          unpcalmeth = "",
          unp = "",
          amt = "",
          wonamt = "",
          taxamt = "",
          dlramt = "",
          unitwgt = "",
          totwgt = "",
          wgtunit = "",
          remark = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.seq2_s.push(seq2 == "" ? 0 : seq2);
        dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
        dataArr.itemacnt_s.push(itemacnt == "" ? "" : itemacnt);
        dataArr.qty_s.push(qty == "" ? 0 : qty);
        dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
        dataArr.unpcalmeth_s.push(unpcalmeth == undefined ? "Q" : unpcalmeth);
        dataArr.unp_s.push(unp == "" ? 0 : unp);
        dataArr.amt_s.push(amt == "" ? 0 : amt);
        dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
        dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
        dataArr.dlramt_s.push(dlramt == "" ? 0 : dlramt);
        dataArr.unitwgt_s.push(unitwgt == "" ? 0 : unitwgt);
        dataArr.totwgt_s.push(totwgt == "" ? 0 : totwgt);
        dataArr.wgtunit_s.push(wgtunit == undefined ? "" : wgtunit);
        dataArr.remark_s.push(remark == undefined ? "" : remark);
      });
      setParaData((prev) => ({
        ...prev,
        workType: workType,
        location: filter.location,
        outdt: filter.outdt,
        shipdt: filter.shipdt,
        doexdiv: filter.doexdiv,
        taxdiv: filter.taxdiv,
        amtunit: filter.amtunit,
        wonchgrat: filter.wonchgrat,
        uschgrat: filter.uschgrat,
        person: filter.person,
        custcd: filter.custcd,
        custnm: filter.custnm,
        recdt: filter.recdt,
        rcvcustcd: filter.rcvcustcd,
        rcvcustnm: filter.rcvcustnm,
        remark: filter.remark,
        seq1: filter.seq1,
        userid: userId,
        pc: pc,
        form_id: "SA_A2300W",
        serviceid: "2207A046",
        files: filter.files,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        seq2_s: dataArr.seq2_s.join("|"),
        itemcd_s: dataArr.itemcd_s.join("|"),
        itemacnt_s: dataArr.itemacnt_s.join("|"),
        qty_s: dataArr.qty_s.join("|"),
        qtyunit_s: dataArr.qtyunit_s.join("|"),
        unpcalmeth_s: dataArr.unpcalmeth_s.join("|"),
        unp_s: dataArr.unp_s.join("|"),
        amt_s: dataArr.amt_s.join("|"),
        dlramt_s: dataArr.dlramt_s.join("|"),
        wonamt_s: dataArr.wonamt_s.join("|"),
        taxamt_s: dataArr.taxamt_s.join("|"),
        unitwgt_s: dataArr.unitwgt_s.join("|"),
        totwgt_s: dataArr.totwgt_s.join("|"),
        wgtunit_s: dataArr.wgtunit_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
      }));
    }
  };

  const onDetailHeaderSelectionChange = useCallback(
    (event: GridHeaderSelectionChangeEvent) => {
      const checkboxElement: any = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState: {
        [id: string]: boolean | number[];
      } = {};

      event.dataItems.forEach((item) => {
        newSelectedState[idGetter(item)] = checked;
      });

      setDetailSelectedState(newSelectedState);
    },
    []
  );

  return (
    <>
      <TitleContainer>
        <Title>직접판매처리</Title>

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
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th colSpan={2}>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dtgb"
                    value={filters.dtgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                    textField="name"
                    valueField="code"
                  />
                )}
              </th>
              <td colSpan={2}>
                <div className="filter-item-wrap">
                  <DatePicker
                    name="frdt"
                    value={filters.frdt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    className="required"
                    placeholder=""
                  />
                  ~
                  <DatePicker
                    name="todt"
                    value={filters.todt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    className="required"
                    placeholder=""
                  />
                </div>
              </td>
              <th>내수구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="doexdiv"
                    value={filters.doexdiv}
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
              <th>계산서유무</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="taxyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
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
              <th>과세구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="taxdiv"
                    value={filters.taxdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
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
              <th>인수처코드</th>
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
                      onClick={onCustWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </div>
              </td>
              <th>인수처명</th>
              <td>
                <Input
                  name="rcvcustnm"
                  type="text"
                  value={filters.rcvcustnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>품목코드</th>
              <td>
                <div className="filter-item-wrap">
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
                </div>
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
                직접판매처리생성
              </Button>
              <Button
                onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
              >
                직접판매처리삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "36vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                ordsts: ordstsListData.find(
                  (item: any) => item.sub_code === row.ordsts
                )?.code_name,
                doexdiv: doexdivListData.find(
                  (item: any) => item.sub_code === row.doexdiv
                )?.code_name,
                taxdiv: taxdivListData.find(
                  (item: any) => item.sub_code === row.taxdiv
                )?.code_name,
                location: locationListData.find(
                  (item: any) => item.sub_code === row.location
                )?.code_name,
                person: usersListData.find(
                  (item: any) => item.user_id === row.person
                )?.user_name,
                dptcd: departmentsListData.find(
                  (item: any) => item.dptcd === row.dptcd
                )?.dptnm,
                finyn: finynListData.find(
                  (item: any) => item.code === row.finyn
                )?.name,
                amtunit: amtunitListData.find(
                  (item: any) => item.sub_code === row.amtunit
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
                          // : numberField.includes(item.fieldName)
                          // ? gridSumQtyFooterCell
                          : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>

      <GridContainer>
        <GridTitleContainer>
          <GridTitle>상세정보</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{ height: "34vh" }}
          data={process(
            detailDataResult.data.map((row) => ({
              ...row,
              itemacnt: itemacntListData.find(
                (item: any) => item.sub_code === row.itemacnt
              )?.code_name,
              qtyunit: qtyunitListData.find(
                (item: any) => item.sub_code === row.qtyunit
              )?.code_name,
              unpcalmeth: unpcalmethListData.find(
                (item: any) => item.sub_code === row.unpcalmeth
              )?.code_name,
            })),
            detailDataState
          )}
          {...detailDataState}
          onDataStateChange={onDetailDataStateChange}
          onHeaderSelectionChange={onDetailHeaderSelectionChange}
          //스크롤 조회 기능
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
                        : undefined
                    }
                    footerCell={
                      item.sortOrder === 0
                        ? detailTotalFooterCell
                        // : numberField.includes(item.fieldName)
                        // ? gridSumQtyFooterCell2
                        : undefined
                    }
                  />
                )
            )}
        </Grid>
      </GridContainer>
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

export default SA_A5010W;
