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
} from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { gridList } from "../store/columns/QC_A0060W_C";
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
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  UseParaPc,
  UseGetValueFromSessionItem,
  useSysMessage,
} from "../components/CommonFunction";
import DetailWindow from "../components/Windows/QC_A0060W_Window";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CenterCell from "../components/Cells/CenterCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading, deletedAttadatnumsState } from "../store/atoms";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";

const DATA_ITEM_KEY = "num";

const dateField = ["recdt"];
const numberField = [
  "stdrev",
  "qc_base",
  "qc_scope1",
  "qc_scope2",
  "qc_min",
  "qc_max",
];
const requireField = ["inspeccd", "qc_gubun"];
const centerField = ["qc_sort", "inspeccd", "qc_gubun"];

type TdataArr = {
  rowstatus_d: string[];
  stdseq_d: string[];
  inspeccd_d: string[];
  qc_gubun_d: string[];
  qc_sort_d: string[];
  qc_unit_d: string[];
  qc_spec_d: string[];
  qc_base_d: string[];
  qc_min_d: string[];
  qc_max_d: string[];
  qc_scope1_d: string[];
  qc_scope2_d: string[];
  chkmed_d: string[];
  cycle_d: string[];
  qty_d: string[];
  remark_d: string[];
};

const QC_A0060W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
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
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        proccd: defaultOption.find((item: any) => item.id === "proccd")
          .valueCode,
        qcgb: defaultOption.find((item: any) => item.id === "qcgb").valueCode,
        rev: defaultOption.find((item: any) => item.id === "rev").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_QC003,L_sysUserMaster_001,L_PR010,L_QC100, L_QC120",
    //검사구분, 사용자, 공정, 검사항목, 측정구분
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [qcgbListData, setQcgbListData] = useState([COM_CODE_DEFAULT_VALUE]);

  const [usersListData, setUsersListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [proccdListData, setProccdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [inspeccdListData, setInspeccdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qc_gubunListData, setQc_gubunListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const qcgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_QC003")
      );
      const usersQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
      );
      const inspeccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_QC100")
      );
      const qc_gubunQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_QC120")
      );
      fetchQuery(qcgbQueryStr, setQcgbListData);
      fetchQuery(usersQueryStr, setUsersListData);
      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(inspeccdQueryStr, setInspeccdListData);
      fetchQuery(qc_gubunQueryStr, setQc_gubunListData);
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

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.num]: true });
      setrev(false);
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
  let gridRef: any = useRef(null);

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
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [workType, setWorkType] = useState<"N" | "U" | "R">("N");

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
    mngnum: "",
    itemcd: "",
    itemnm: "",
    proccd: "",
    stdnum: "",
    stdrev: 0,
    qcgb: "",
    rev: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    stdnum: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_QC_A0060W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "HEADER",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_mngnum": filters.mngnum,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_proccd": filters.proccd,
      "@p_stdnum": filters.stdnum,
      "@p_stdrev": 0,
      "@p_qcgb": filters.qcgb,
      "@p_rev": filters.rev,
      "@p_find_row_value": filters.find_row_value,
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_QC_A0060W_Q",
    pageNumber: detailFilters.pgNum,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_mngnum": filters.mngnum,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_proccd": filters.proccd,
      "@p_stdnum": detailFilters.stdnum,
      "@p_stdrev": 0,
      "@p_qcgb": filters.qcgb,
      "@p_rev": filters.rev,
      "@p_find_row_value": filters.find_row_value,
    },
  };

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    stdnum: "",
    stdrev: 0,
    attdatnum: "",
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_QC_A0060W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": "01",
      "@p_location": "01",
      "@p_dptcd": "",
      "@p_stdnum": paraDataDeleted.stdnum,
      "@p_stdrev": paraDataDeleted.stdrev,
      "@p_qcgb": "",
      "@p_itemcd": "",
      "@p_proccd": "",
      "@p_recdt": "",
      "@p_attdatnum": "",
      "@p_remark1": "",
      "@p_mngnum": "",
      "@p_rev_reason": "",
      "@p_rowstatus_d": "",
      "@p_stdseq_d": "",
      "@p_inspeccd_d": "",
      "@p_qc_gubun_d": "",
      "@p_qc_sort_d": "",
      "@p_qc_unit_d": "",
      "@p_qc_spec_d": "",
      "@p_qc_base_d": "",
      "@p_qc_min_d": "",
      "@p_qc_max_d": "",
      "@p_qc_scope1_d": "",
      "@p_qc_scope2_d": "",
      "@p_chkmed_d": "",
      "@p_cycle_d": "",
      "@p_qty_d": "",
      "@p_remark_d": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_QC_A0060W",
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

      if (totalRowCnt > 0)
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });

      if (filters.find_row_value === "") {
        setFilters((prev) => ({ ...prev, pgNum: data.pageNumber }));
      }

      if (filters.find_row_value === "" && data.pageNumber === 1) {
        // 첫번째 행 선택하기
        const firstRowData = rows[0];
        setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });

        setDetailFilters((prev) => ({
          ...prev,
          stdnum: firstRowData.stdnum,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    //초기화
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

      if (totalRowCnt > 0)
        setDetailDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });

      if (detailFilters.find_row_value === "") {
        setDetailFilters((prev) => ({ ...prev, pgNum: data.pageNumber }));
      }

      if (detailFilters.find_row_value === "" && data.pageNumber === 1) {
        // 첫번째 행 선택하기
        const firstRowData = rows[0];
        setDetailSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    //초기화
    setDetailFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null && bizComponentData !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
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

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
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
  }, [mainDataResult]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
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
        isSearch: true,
      }));
    }
    // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
    // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
    else if (detailFilters.scrollDirrection === "up") {
      gridRef.vs.container.scroll(0, 20);
    }
  }, [detailDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  const resetDetailGrid = () => {
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
      stdnum: selectedRowData.stdnum,
      isSearch: true,
    }));
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DATA_ITEM_KEY,
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

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult.total}건
      </td>
    );
  };

  const onAddClick = () => {
    setWorkType("N");
    setrev(false);
    setDetailWindowVisible(true);
  };
  const onAddClick2 = () => {
    setWorkType("R");
    setrev(true);
    setDetailWindowVisible(true);
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
      stdnum: data.stdnum,
      stdrev: data.stdrev,
      attdatnum: data.attdatnum,
    }));
  };

  const [reload, setreload] = useState<boolean>(false);
  const [rev, setrev] = useState<boolean>(false);

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      setDetailFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      // 첨부파일 삭제
      if (paraDataDeleted.attdatnum)
        setDeletedAttadatnums([paraDataDeleted.attdatnum]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    setParaDataDeleted((prev) => ({
      work_type: "",
      stdnum: "",
      stdrev: 0,
      attdatnum: "",
    }));
  };

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
    resetAllGrid();
    setDetailFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: "01",
    location: "01",
    dptcd: "",
    stdnum: "",
    stdrev: 0,
    qcgb: "",
    itemcd: "",
    proccd: "",
    recdt: new Date(),
    attdatnum: "",
    remark1: "",
    mngnum: "",
    rev_reason: "",
    rowstatus_d: "",
    stdseq_d: "",
    inspeccd_d: "",
    qc_gubun_d: "",
    qc_sort_d: "",
    qc_unit_d: "",
    qc_spec_d: "",
    qc_base_d: "",
    qc_min_d: "",
    qc_max_d: "",
    qc_scope1_d: "",
    qc_scope2_d: "",
    chkmed_d: "",
    cycle_d: "",
    qty_d: "",
    remark_d: "",
  });

  const setCopyData = (data: any, filter: any, deletedMainRows: any) => {
    let valid = true;
    setrev(false);
    const dataItem = data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    setParaData((prev) => ({
      ...prev,
      workType: workType == "R" ? "REV" : workType,
      dptcd: "",
      stdnum: filter.stdnum,
      stdrev: filter.stdrev,
      qcgb: filter.qcgb,
      itemcd: filter.itemcd,
      proccd: filter.proccd,
      recdt: filter.recdt,
      attdatnum: filter.attdatnum,
      remark1: filter.remark,
      mngnum: filter.mngnum,
      rev_reason: filter.rev_reason,
      userid: userId,
      pc: pc,
      form_id: "MA_A2400W",
      serviceid: "2207A046",
    }));
    let dataArr: TdataArr = {
      rowstatus_d: [],
      stdseq_d: [],
      inspeccd_d: [],
      qc_gubun_d: [],
      qc_sort_d: [],
      qc_unit_d: [],
      qc_spec_d: [],
      qc_base_d: [],
      qc_min_d: [],
      qc_max_d: [],
      qc_scope1_d: [],
      qc_scope2_d: [],
      chkmed_d: [],
      cycle_d: [],
      qty_d: [],
      remark_d: [],
    };

    if (dataItem.length !== 0) {
      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          stdseq = "",
          inspeccd = "",
          qc_gubun = "",
          qc_sort = "",
          qc_unit = "",
          qc_spec = "",
          qc_base = "",
          qc_min = "",
          qc_max = "",
          qc_scope1 = "",
          qc_scope2 = "",
          chkmed = "",
          cycle = "",
          qty = "",
          remark = "",
        } = item;

        dataArr.rowstatus_d.push(workType == "R" ? "N" : rowstatus);
        dataArr.stdseq_d.push(stdseq);
        dataArr.inspeccd_d.push(inspeccd);
        dataArr.qc_gubun_d.push(qc_gubun);
        dataArr.qc_sort_d.push(qc_sort);
        dataArr.qc_unit_d.push(qc_unit);
        dataArr.qc_spec_d.push(qc_spec);
        dataArr.qc_base_d.push(qc_base);
        dataArr.qc_min_d.push(qc_min);
        dataArr.qc_max_d.push(qc_max);
        dataArr.qc_scope1_d.push(qc_scope1);
        dataArr.qc_scope2_d.push(qc_scope2);
        dataArr.chkmed_d.push(chkmed);
        dataArr.cycle_d.push(cycle);
        dataArr.qty_d.push(qty);
        dataArr.remark_d.push(remark);
      });
    }
    if (deletedMainRows.length !== 0) {
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          stdseq = "",
          inspeccd = "",
          qc_gubun = "",
          qc_sort = "",
          qc_unit = "",
          qc_spec = "",
          qc_base = "",
          qc_min = "",
          qc_max = "",
          qc_scope1 = "",
          qc_scope2 = "",
          chkmed = "",
          cycle = "",
          qty = "",
          remark = "",
        } = item;

        dataArr.rowstatus_d.push(workType == "R" ? "N" : rowstatus);
        dataArr.stdseq_d.push(stdseq);
        dataArr.inspeccd_d.push(inspeccd);
        dataArr.qc_gubun_d.push(qc_gubun);
        dataArr.qc_sort_d.push(qc_sort);
        dataArr.qc_unit_d.push(qc_unit);
        dataArr.qc_spec_d.push(qc_spec);
        dataArr.qc_base_d.push(qc_base);
        dataArr.qc_min_d.push(qc_min);
        dataArr.qc_max_d.push(qc_max);
        dataArr.qc_scope1_d.push(qc_scope1);
        dataArr.qc_scope2_d.push(qc_scope2);
        dataArr.chkmed_d.push(chkmed);
        dataArr.cycle_d.push(cycle);
        dataArr.qty_d.push(qty);
        dataArr.remark_d.push(remark);
      });
    }

    setParaData((prev) => ({
      ...prev,
      rowstatus_d: dataArr.rowstatus_d.join("|"),
      stdseq_d: dataArr.stdseq_d.join("|"),
      inspeccd_d: dataArr.inspeccd_d.join("|"),
      qc_gubun_d: dataArr.qc_gubun_d.join("|"),
      qc_sort_d: dataArr.qc_sort_d.join("|"),
      qc_unit_d: dataArr.qc_unit_d.join("|"),
      qc_spec_d: dataArr.qc_spec_d.join("|"),
      qc_base_d: dataArr.qc_base_d.join("|"),
      qc_min_d: dataArr.qc_min_d.join("|"),
      qc_max_d: dataArr.qc_max_d.join("|"),
      qc_scope1_d: dataArr.qc_scope1_d.join("|"),
      qc_scope2_d: dataArr.qc_scope2_d.join("|"),
      chkmed_d: dataArr.chkmed_d.join("|"),
      cycle_d: dataArr.cycle_d.join("|"),
      qty_d: dataArr.qty_d.join("|"),
      remark_d: dataArr.remark_d.join("|"),
    }));
  };

  const para: Iparameters = {
    procedureName: "P_QC_A0060W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_dptcd": ParaData.dptcd,
      "@p_stdnum": ParaData.stdnum,
      "@p_stdrev": ParaData.stdrev,
      "@p_qcgb": ParaData.qcgb,
      "@p_itemcd": ParaData.itemcd,
      "@p_proccd": ParaData.proccd,
      "@p_recdt": convertDateToStr(ParaData.recdt),
      "@p_attdatnum": ParaData.attdatnum,
      "@p_remark1": ParaData.remark1,
      "@p_mngnum": ParaData.mngnum,
      "@p_rev_reason": ParaData.rev_reason,
      "@p_rowstatus_d": ParaData.rowstatus_d,
      "@p_stdseq_d": ParaData.stdseq_d,
      "@p_inspeccd_d": ParaData.inspeccd_d,
      "@p_qc_gubun_d": ParaData.qc_gubun_d,
      "@p_qc_sort_d": ParaData.qc_sort_d,
      "@p_qc_unit_d": ParaData.qc_unit_d,
      "@p_qc_spec_d": ParaData.qc_spec_d,
      "@p_qc_base_d": ParaData.qc_base_d,
      "@p_qc_min_d": ParaData.qc_min_d,
      "@p_qc_max_d": ParaData.qc_max_d,
      "@p_qc_scope1_d": ParaData.qc_scope1_d,
      "@p_qc_scope2_d": ParaData.qc_scope2_d,
      "@p_chkmed_d": ParaData.chkmed_d,
      "@p_cycle_d": ParaData.cycle_d,
      "@p_qty_d": ParaData.qty_d,
      "@p_remark_d": ParaData.remark_d,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_QC_A0060W",
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
      setreload(!reload);
      resetAllGrid();
      setDetailFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_d != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  return (
    <>
      <TitleContainer>
        <Title>검사표준서</Title>

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
              <th>검사구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="qcgb"
                    value={filters.qcgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>관리번호</th>
              <td>
                <Input
                  name="mngnum"
                  type="text"
                  value={filters.mngnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>공정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="proccd"
                    value={filters.proccd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>리비전</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="rev"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
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
            <GridTitle>검사표준요약</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="file-add"
              >
                검사표준서생성
              </Button>
              <Button
                onClick={onAddClick2}
                themeColor={"primary"}
                fillMode="outline"
                icon="track-changes"
              >
                리비전
              </Button>
              <Button
                onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
              >
                검사표준서삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "36vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                qcgb: qcgbListData.find(
                  (item: any) => item.sub_code === row.qcgb
                )?.code_name,
                insert_userid: usersListData.find(
                  (item: any) => item.user_id === row.insert_userid
                )?.user_name,
                update_userid: usersListData.find(
                  (item: any) => item.user_id === row.update_userid
                )?.user_name,
                proccd: proccdListData.find(
                  (items: any) => items.sub_code === row.proccd
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
          <GridTitle>검사표준상세</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{ height: "34vh" }}
          data={process(
            detailDataResult.data.map((row) => ({
              ...row,
              inspeccd: inspeccdListData.find(
                (items: any) => items.sub_code === row.inspeccd
              )?.code_name,
              qc_gubun: qc_gubunListData.find(
                (items: any) => items.sub_code === row.qc_gubun
              )?.code_name,
              [SELECTED_FIELD]: detailSelectedState[idGetter(row)],
            })),
            detailDataState
          )}
          {...detailDataState}
          onDataStateChange={onDetailDataStateChange}
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onDetailSelectionChange}
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
                    headerCell={
                      requireField.includes(item.fieldName)
                        ? RequiredHeader
                        : undefined
                    }
                    cell={
                      numberField.includes(item.fieldName)
                        ? NumberCell
                        : centerField.includes(item.fieldName)
                        ? CenterCell
                        : undefined
                    }
                    footerCell={
                      item.sortOrder === 0 ? detailTotalFooterCell : undefined
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
          rev={rev}
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

export default QC_A0060W;
