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
  GridCellProps,
  GridItemChangeEvent,
  GridHeaderSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { CellRender, RowRender } from "../components/Renderers";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { DataResult, process, State } from "@progress/kendo-data-query";
import calculateSize from "calculate-size";
import { gridList } from "../store/columns/MA_A3500W_C";
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
  GridContainerWrap,
  FormBoxWrap,
  FormBox,
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
  useSysMessage,
  getGridItemChangedData,
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
  EDIT_FIELD,
} from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import RequiredHeader from "../components/RequiredHeader";

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
  "now_qty",
  "doqty",
];
const requiredField = ["doqty"];
type TdataArr = {
  rowstatus_s: string[];
  recdt_s: string[];
  seq1_s: string[];
  seq2_s: string[];
  itemcd_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  lotnum_s: string[];
  remark_s: string[];
  itemacnt_s: string[];
  person_s: string[];
  custprsncd_s: string[];
  load_place_s: string[];
  orglot_s: string[];
  heatno_s: string[];
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
  const [tabSelected, setTabSelected] = React.useState(0);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  useEffect(() => {
    if (customOptionData !== null) {
      // fetchSubGrid();
    }
  }, [tabSelected]);

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    // setSub2PgNum(1);
    // setSubData2Result(process([], subData2State));
  };

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
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_SYS012, L_BA019, L_MA036,L_SA002,L_BA005,L_BA029,L_BA002,L_sysUserMaster_001,L_dptcd_001,L_BA061,L_BA015,L_finyn, L_PR010",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [unpcalmethListData, setUnpcalmethListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [purstsListData, setPurstsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
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
  const [proccdListData, setProccdListData] = useState([
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
  const [finynListData, setFinynListData] = useState([{ code: "", name: "" }]);
  const [outpgmListData, setOutpgmListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const outpgmQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SYS012")
      );
      const purstsQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_MA036")
      );
      const unpcalmethQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA019")
      );
      const ordstsQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SA002")
      );
      const doexdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA005")
      );
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
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

      fetchQuery(outpgmQueryStr, setOutpgmListData);
      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(unpcalmethQueryStr, setUnpcalmethListData);
      fetchQuery(purstsQueryStr, setPurstsListData);
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
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [subDataState2, setSubDataState2] = useState<State>({
    sort: [],
  });
  const [isInitSearch, setIsInitSearch] = useState(false);

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataTotal, setMainDataTotal] = useState<number>(0);

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );
  const [subDataResult2, setSubDataResult2] = useState<DataResult>(
    process([], subDataState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedSubState, setSelectedSubState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedSubState2, setSelectedSubState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [mainPgNum, setMainPgNum] = useState(1);
  const [subPgNum, setSubPgNum] = useState(1);
  const [subPgNum2, setSubPgNum2] = useState(1);
  const [workType, setWorkType] = useState<"N" | "U">("N");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [isCopy, setIsCopy] = useState(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    if (value !== null)
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      setInfomation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
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
    itemcd: "",
    itemnm: "",
    insiz: "",
    lotnum: "",
    outkey: "",
    person: "",
    remark: "",
    dptcd: "",
    ordnum: "",
    ordseq: 0,
    itemacnt: "",
    reckey_s: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [infomation, setInfomation] = useState({
    pgSize: PAGE_SIZE,
    workType: "STOCK",
    itemcd: "",
    itemnm: "",
    itemacnt: "",
    lotnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_MA_A3500W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "SA210T",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_lotnum": filters.lotnum,
      "@p_outkey": filters.outkey,
      "@p_person": filters.person,
      "@p_remark": filters.remark,
      "@p_dptcd": filters.dptcd,
      "@p_ordnum": filters.ordnum,
      "@p_ordseq": filters.ordseq,
      "@p_itemacnt": filters.itemacnt,
      "@p_reckey_s": filters.reckey_s,
      "@p_find_row_value": filters.find_row_value,
      "@p_company_code": "2207A046",
    },
  };

  const stockparameters: Iparameters = {
    procedureName: "P_MA_A3500W_Q",
    pageNumber: subPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": infomation.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_itemcd": infomation.itemcd,
      "@p_itemnm": infomation.itemnm,
      "@p_insiz": filters.insiz,
      "@p_lotnum": infomation.lotnum,
      "@p_outkey": filters.outkey,
      "@p_person": filters.person,
      "@p_remark": filters.remark,
      "@p_dptcd": filters.dptcd,
      "@p_ordnum": filters.ordnum,
      "@p_ordseq": filters.ordseq,
      "@p_itemacnt": infomation.itemacnt,
      "@p_reckey_s": filters.reckey_s,
      "@p_find_row_value": filters.find_row_value,
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
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setMainDataTotal(totalRowCnt);
        setMainDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });

        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchSubGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", stockparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setSubDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null && bizComponentData !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록

      if (filters.find_row_value !== "") {
        // 그룹코드로 조회 시 리셋 후 조회
        resetAllGrid();
        fetchMainGrid();
        fetchSubGrid();
      } else {
        // 일반 조회
        fetchMainGrid();
        fetchSubGrid();
      }
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchSubGrid();
    }
  }, [subPgNum]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        setSelectedState({ [firstRowData.num]: true });

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    recdt: "",
    seq1: "",
    seq2: "",
  });

  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    let arr: any = [];
    for (const [key, value] of Object.entries(selectedState)) {
      if (value == true) {
        arr.push(parseInt(key));
      }
    }
    const selectRows = mainDataResult.data.filter(
      (item: any) => arr.includes(item.num) == true
    );

    let dataArr: TdataArr = {
      rowstatus_s: [],
      recdt_s: [],
      seq1_s: [],
      seq2_s: [],
      itemcd_s: [],
      qty_s: [],
      qtyunit_s: [],
      lotnum_s: [],
      remark_s: [],
      itemacnt_s: [],
      person_s: [],
      custprsncd_s: [],
      load_place_s: [],
      orglot_s: [],
      heatno_s: [],
    };
    console.log(selectRows);
    selectRows.forEach((item: any, idx: number) => {
      const { recdt = "", seq1 = "", seq2 = "" } = item;
      dataArr.recdt_s.push(recdt);
      dataArr.seq1_s.push(seq1);
      dataArr.seq2_s.push(seq2);
    });

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      recdt: dataArr.recdt_s.join("|"),
      seq1: dataArr.seq1_s.join("|"),
      seq2: dataArr.seq2_s.join("|"),
    }));
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataTotal(1);
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
    setSubDataResult2(process([], subDataState2));
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
  };

  const onHeaderSelectionChange2 = React.useCallback(
    (event: GridHeaderSelectionChangeEvent) => {
      const checkboxElement: any = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState: any = {};

      event.dataItems.forEach((item: any) => {
        newSelectedState[idGetter(item)] = checked;
      });
      setSelectedState(newSelectedState);
    },
    []
  );

  const onSubSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedSubState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedSubState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
  };

  const onHeaderSelectionChange = React.useCallback(
    (event: GridHeaderSelectionChangeEvent) => {
      const checkboxElement: any = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState: any = {};

      event.dataItems.forEach((item: any) => {
        newSelectedState[idGetter(item)] = checked;
      });
      setSelectedSubState(newSelectedState);
    },
    []
  );

  const onSubSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedSubState2,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedSubState2(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
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
    if (
      chkScrollHandler(event, filters.pgNum, PAGE_SIZE) &&
      !filters.isSearch
    ) {
      setFilters((prev) => ({
        ...prev,
        pgNum: prev.pgNum + 1,
        isSearch: true,
        find_row_value: "",
      }));
    }
  };

  const onSubScrollHandler = (event: GridEvent) => {
    if (
      chkScrollHandler(event, infomation.pgNum, PAGE_SIZE) &&
      !infomation.isSearch
    )
      setInfomation((prev) => ({
        ...prev,
        pgNum: prev.pgNum + 1,
        isSearch: true,
      }));
  };
  const onSubScrollHandler2 = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum2, PAGE_SIZE))
      setSubPgNum2((prev) => prev + 1);
  };
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };
  const onSubDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setSubDataState2(event.dataState);
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

  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = subDataResult2.total.toString().split(".");
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
      props.field !== undefined ? (sum += item[props.field]) : ""
    );
    var parts = sum.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    );
  };
  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    subDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum += item[props.field]) : ""
    );
    var parts = sum.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    );
  };
  const onAddClick = () => {
    let seq = 1;
    let valid = true;
    let arr: any = [];
    if (subDataResult2.total > 0) {
      subDataResult2.data.forEach((item) => {
        if (item[DATA_ITEM_KEY] > seq) {
          seq = item[DATA_ITEM_KEY];
        }
      });
      seq++;
    }

    for (const [key, value] of Object.entries(selectedSubState)) {
      if (value == true) {
        arr.push(parseInt(key));
      }
    }

    const selectRows = subDataResult.data.filter(
      (item: any) => arr.includes(item.num) == true
    );
    selectRows.map((item) => {
      if (item.doqty == 0 || item.doqty > item.now_qty) {
        valid = false;
      }
    });

    if (valid == true) {
      const newData = subDataResult.data.map((item) =>
        arr.includes(item.num) == true
          ? {
              ...item,
              now_qty: item.now_qty - item.doqty,
              doqty: 0,
            }
          : {
              ...item,
            }
      );

      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });

      selectRows.map((selectRow: any) => {
        const newDataItem = {
          [DATA_ITEM_KEY]: seq + 1,
          boxqty: selectRow.boxqty,
          doqty: selectRow.doqty,
          insiz: selectRow.insiz,
          itemacnt: selectRow.itemacnt,
          itemcd: selectRow.itemcd,
          itemnm: selectRow.itemnm,
          itemno: selectRow.itemno,
          len: selectRow.len,
          location: selectRow.location,
          lotnum: selectRow.lotnum,
          now_qty: selectRow.now_qty,
          orgdiv: selectRow.orgdiv,
          poregnum: selectRow.poregnum,
          qtyunit: selectRow.qtyunit,
          stritem: selectRow.stritem,
          wgtunit: selectRow.wgtunit,
          rowstatus: "N",
        };

        setSubDataResult2((prev) => {
          return {
            data: [...prev.data, newDataItem],
            total: prev.total + 1,
          };
        });
        seq++;
      });
      setSelectedSubState({});
    } else {
      alert("불출량을 입력해주세요.");
    }
  };

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }
    console.log(paraDeleted);
    if (data.isSuccess === true) {
      resetAllGrid();
      fetchMainGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.recdt = "";
    paraDataDeleted.seq1 = "";
    paraDataDeleted.seq2 = "";
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };
  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    const data = subDataResult2.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedSubState2)[0]
    )[0];
    const newDatas = subDataResult.data.map((item) =>
      data.lotnum == item.lotnum
        ? {
            ...item,
            now_qty: item.now_qty + data.doqty,
          }
        : {
            ...item,
          }
    );

    setSubDataResult((prev) => {
      return {
        data: newDatas,
        total: prev.total,
      };
    });

    subDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedSubState2[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      }
    });

    setSubDataResult2((prev) => ({
      data: newData,
      total: newData.length,
    }));

    setSubDataState2({});
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
  const onSubSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onSubSortChange2 = (e: any) => {
    setSubDataState2((prev) => ({ ...prev, sort: e.sort }));
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
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
        setInfomation((prev) => ({ ...prev, pgNum: 1 }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const onSearch2 = () => {
    fetchSubGrid();
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: "01",
    location: "01",
    outdt: new Date(),
    dptcd: "",
    person: "admin",
    rowstatus_s: "",
    recdt_s: "",
    seq1_s: "",
    seq2_s: "",
    itemcd_s: "",
    qty_s: "",
    qtyunit_s: "",
    lotnum_s: "",
    remark_s: "",
    itemacnt_s: "",
    person_s: "",
    custprsncd_s: "",
    load_place_s: "",
    orglot_s: "",
    heatno_s: "",
  });

  const setCopyData = () => {
    let valid = true;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      recdt_s: [],
      seq1_s: [],
      seq2_s: [],
      itemcd_s: [],
      qty_s: [],
      qtyunit_s: [],
      lotnum_s: [],
      remark_s: [],
      itemacnt_s: [],
      person_s: [],
      custprsncd_s: [],
      load_place_s: [],
      orglot_s: [],
      heatno_s: [],
    };

    subDataResult2.data.forEach((item: any, idx: number) => {
      const {
        itemacnt = "",
        itemcd = "",
        rowstatus = "",
        lotnum = "",
        doqty = "",
        seq1 = "",
        seq2 = "",
        qtyunit = "",
        person = "",
        remark = "",
        custprsncd = "",
        load_place = "",
        heatno = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.recdt_s.push("");
      dataArr.seq1_s.push(seq1 == undefined ? 0 : seq1);
      dataArr.seq2_s.push(seq2 == undefined ? 0 : seq2);
      dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
      dataArr.qty_s.push(doqty == "" ? 0 : doqty);
      dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
      dataArr.lotnum_s.push(lotnum == undefined ? "" : lotnum);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
      dataArr.itemacnt_s.push(itemacnt == undefined ? "" : itemacnt);
      dataArr.person_s.push(person == undefined ? "" : person);
      dataArr.custprsncd_s.push(custprsncd == undefined ? "" : custprsncd);
      dataArr.load_place_s.push(load_place == undefined ? "" : load_place);
      dataArr.heatno_s.push(heatno == undefined ? "" : heatno);
    });
    setParaData((prev) => ({
      ...prev,
      workType: workType,
      location: filters.location,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      recdt_s: dataArr.recdt_s.join("|"),
      seq1_s: dataArr.seq1_s.join("|"),
      seq2_s: dataArr.seq2_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      qty_s: dataArr.qty_s.join("|"),
      qtyunit_s: dataArr.qtyunit_s.join("|"),
      lotnum_s: dataArr.lotnum_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      itemacnt_s: dataArr.itemacnt_s.join("|"),
      person_s: dataArr.person_s.join("|"),
      custprsncd_s: dataArr.custprsncd_s.join("|"),
      load_place_s: dataArr.load_place_s.join("|"),
      orglot_s: dataArr.orglot_s.join("|"),
      heatno_s: dataArr.heatno_s.join("|"),
    }));
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_MA_A3500W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": "01",
      "@p_location": ParaData.location,
      "@p_outdt": convertDateToStr(ParaData.outdt),
      "@p_dptcd": ParaData.dptcd,
      "@p_person": ParaData.person,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_recdt_s": paraDataDeleted.recdt,
      "@p_seq1_s": paraDataDeleted.seq1,
      "@p_seq2_s": paraDataDeleted.seq2,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_lotnum_s": ParaData.lotnum_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_person_s": ParaData.person_s,
      "@p_custprsncd_s": ParaData.custprsncd_s,
      "@p_load_place_s": ParaData.load_place_s,
      "@p_orglot_s": ParaData.orglot_s,
      "@p_heatno_s": ParaData.heatno_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_MA_A3500W",
    },
  };

  const para: Iparameters = {
    procedureName: "P_MA_A3500W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": "01",
      "@p_location": ParaData.location,
      "@p_outdt": convertDateToStr(ParaData.outdt),
      "@p_dptcd": ParaData.dptcd,
      "@p_person": ParaData.person,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_recdt_s": ParaData.recdt_s,
      "@p_seq1_s": ParaData.seq1_s,
      "@p_seq2_s": ParaData.seq2_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_qtyunit_s": ParaData.qtyunit_s,
      "@p_lotnum_s": ParaData.lotnum_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_itemacnt_s": ParaData.itemacnt_s,
      "@p_person_s": ParaData.person_s,
      "@p_custprsncd_s": ParaData.custprsncd_s,
      "@p_load_place_s": ParaData.load_place_s,
      "@p_orglot_s": ParaData.orglot_s,
      "@p_heatno_s": ParaData.heatno_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_MA_A3500W",
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
      resetAllGrid();
      fetchSubGrid();
      fetchMainGrid();
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

  const onSubItemChange = (event: GridItemChangeEvent) => {
    setSubDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
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
    if (field == "doqty") {
      const newData = subDataResult.data.map((item) =>
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

      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = subDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setSubDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  return (
    <>
      <TitleContainer>
        <Title>자재불출</Title>

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
              <th>불출일자</th>
              <td colSpan={3}>
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
              <th>불출번호</th>
              <td>
                <Input
                  name="outkey"
                  type="text"
                  value={filters.outkey}
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
            </tr>
            <tr>
              <th>비고</th>
              <td>
                <Input
                  name="remark"
                  type="text"
                  value={filters.remark}
                  onChange={filterInputChange}
                />
              </td>
              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
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
            <Button
              onClick={onDeleteClick2}
              fillMode="outline"
              themeColor={"primary"}
              icon="delete"
            >
              삭제
            </Button>
          </GridTitleContainer>
          <Grid
            style={{ height: "25vh" }}
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
                dptcd: departmentsListData.find(
                  (item: any) => item.dptcd === row.dptcd
                )?.dptnm,
                finyn: finynListData.find(
                  (item: any) => item.code === row.finyn
                )?.name,
                pursts: purstsListData.find(
                  (item: any) => item.sub_code === row.pursts
                )?.code_name,
                itemacnt: itemacntListData.find(
                  (item: any) => item.sub_code === row.itemacnt
                )?.code_name,
                qtyunit: qtyunitListData.find(
                  (item: any) => item.sub_code === row.qtyunit
                )?.code_name,
                outpgm: outpgmListData.find(
                  (item: any) => item.sub_code === row.outpgm
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
              mode: "multiple",
            }}
            onSelectionChange={onSelectionChange}
            onHeaderSelectionChange={onHeaderSelectionChange2}
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
      <GridContainerWrap>
        <GridContainer width="55%">
          <TabStrip
            style={{ width: "100%" }}
            selected={tabSelected}
            onSelect={handleSelectTab}
          >
            <TabStripTab title="품목참조">
              <FormBoxWrap>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{minWidth: "70px"}}>품목코드</th>
                      <td>
                        <Input
                          name="itemcd"
                          type="text"
                          value={infomation.itemcd}
                          onChange={InputChange}
                        />
                      </td>
                      <th style={{minWidth: "70px"}}>품목명</th>
                      <td>
                        <Input
                          name="itemnm"
                          type="text"
                          value={infomation.itemnm}
                          onChange={InputChange}
                        />
                      </td>
                      <th style={{minWidth: "70px"}}>LOT NO</th>
                      <td>
                        <Input
                          name="lotnum"
                          type="text"
                          value={infomation.lotnum}
                          onChange={InputChange}
                        />
                      </td>
                      <th style={{minWidth: "70px"}}>품목계정</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="itemacnt"
                            value={infomation.itemacnt}
                            bizComponentId="L_BA061"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <td>
                        <Button
                          onClick={onSearch2}
                          themeColor={"primary"}
                          icon="search"
                        >
                          조회
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer>
                <GridTitleContainer>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="plus"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: "34vh" }}
                  data={process(
                    subDataResult.data.map((row) => ({
                      ...row,
                      itemacnt: itemacntListData.find(
                        (item: any) => item.sub_code === row.itemacnt
                      )?.code_name,
                      qtyunit: qtyunitListData.find(
                        (item: any) => item.sub_code === row.qtyunit
                      )?.code_name,
                      outpgm: outpgmListData.find(
                        (item: any) => item.sub_code === row.outpgm
                      )?.code_name,
                      [SELECTED_FIELD]: selectedSubState[idGetter(row)],
                    })),
                    subDataState
                  )}
                  {...subDataState}
                  onDataStateChange={onSubDataStateChange}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "multiple",
                  }}
                  onSelectionChange={onSubSelectionChange}
                  onHeaderSelectionChange={onHeaderSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={subDataResult.total}
                  onScroll={onSubScrollHandler}
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onSubItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn
                    field={SELECTED_FIELD}
                    width="45px"
                    headerSelectionValue={
                      subDataResult.data.findIndex(
                        (item: any) => !selectedSubState[idGetter(item)]
                      ) === -1
                    }
                  />
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
                                ? subTotalFooterCell
                                : numberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell2
                                : undefined
                            }
                            headerCell={
                              requiredField.includes(item.fieldName)
                                ? RequiredHeader
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
            </TabStripTab>
            <TabStripTab title="BOM참조"></TabStripTab>
          </TabStrip>
        </GridContainer>
        <GridContainer width={`calc(45% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>처리정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onDeleteClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
              ></Button>
              <Button
                onClick={setCopyData}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "48vh" }}
            data={process(
              subDataResult2.data.map((row) => ({
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
                dptcd: departmentsListData.find(
                  (item: any) => item.dptcd === row.dptcd
                )?.dptnm,
                finyn: finynListData.find(
                  (item: any) => item.code === row.finyn
                )?.name,
                pursts: purstsListData.find(
                  (item: any) => item.sub_code === row.pursts
                )?.code_name,
                itemacnt: itemacntListData.find(
                  (item: any) => item.sub_code === row.itemacnt
                )?.code_name,
                qtyunit: qtyunitListData.find(
                  (item: any) => item.sub_code === row.qtyunit
                )?.code_name,
                outpgm: outpgmListData.find(
                  (item: any) => item.sub_code === row.outpgm
                )?.code_name,
                [SELECTED_FIELD]: selectedSubState2[idGetter(row)],
              })),
              subDataState2
            )}
            {...subDataState2}
            onDataStateChange={onSubDataStateChange2}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSubSelectionChange2}
            //스크롤 조회 기능
            fixedScroll={true}
            total={subDataResult2.total}
            onScroll={onSubScrollHandler2}
            //정렬기능
            sortable={true}
            onSortChange={onSubSortChange2}
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
                        item.sortOrder === 0 ? subTotalFooterCell2 : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </GridContainer>
      </GridContainerWrap>
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

export default MA_A2400W;
