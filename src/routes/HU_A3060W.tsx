import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { NumericTextBox } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
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
import ExcelUploadButton from "../components/Buttons/ExcelUploadButton";
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_A3060W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY3_1 = "num";
const DATA_ITEM_KEY4 = "num";
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;
let temp = 0;
let temp4 = 0;
let deletedMainRows: object[] = [];
let deletedMainRows4: object[] = [];

const numberField = [
  "taxstdmin",
  "taxstdmax",
  "taxrate",
  "gradualdeduct",
  "stdamt",
  "cal2n",
  "cal3n",
  "cal4n",
];
const comboField = ["paycd", "payitemcd", "dutycd", "dutymngdiv"];
const checkField = ["cal2s"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_HU028, L_HU130T, L_HU033, L_HU040", setBizComponentData);
  //보고서구분, 그룹구분, 그룹특성, 품목계정, 내수구분

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "paycd"
      ? "L_HU028"
      : field === "payitemcd"
      ? "L_HU130T"
      : field === "dutycd"
      ? "L_HU033"
      : field === "dutymngdiv"
      ? "L_HU040"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );
  const textField = field == "payitemcd" ? "payitemnm" : "code_name";
  const valueField = field == "payitemcd" ? "payitemcd" : "sub_code";

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      {...props}
    />
  ) : (
    <td />
  );
};

type TdataArr = {
  rowstatus_s: string[];
  seq_s: string[];
  taxstdmin_s: string[];
  taxstdmax_s: string[];
  taxrate_s: string[];
  gradualdeduct_s: string[];
};

type TdataArr3 = {
  rowstatus_s: string[];
  sectiondiv_s: string[];
  startmonamt_s: string[];
  endmonamt_s: string[];
  incomtax1_s: string[];
  incomtax2_s: string[];
  incomtax3_s: string[];
  incomtax4_s: string[];
  incomtax5_s: string[];
  incomtax6_s: string[];
  incomtax7_s: string[];
  incomtax8_s: string[];
  incomtax9_s: string[];
  incomtax10_s: string[];
  incomtax11_s: string[];
};

type TdataArr4 = {
  rowstatus_s: string[];
  payitemtype_s: string[];
  paycd_s: string[];
  payitemcd_s: string[];
  dutycd_s: string[];
  dutymngdiv_s: string[];
  stdamt_s: string[];
  cal2n_s: string[];
  cal2s_s: string[];
  cal3n_s: string[];
  cal4n_s: string[];
};

const HU_A3060W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter3_1 = getter(DATA_ITEM_KEY3_1);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_A3060W", setMessagesData);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A3060W", setCustomOptionData);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        stdyr: setDefaultDate(customOptionData, "stdyr"),
      }));
      setFilters4((prev) => ({
        ...prev,
        paycd: defaultOption.find((item: any) => item.id === "paycd").valueCode,
        payitemcd: defaultOption.find((item: any) => item.id === "payitemcd")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.stdyr).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "HU_A3060W_001");
      } else {
        deletedMainRows = [];
        deletedMainRows4 = [];
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters4((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const [tabSelected, setTabSelected] = React.useState(0);

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Q",
    orgdiv: "01",
    stdyr: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "RifList",
    orgdiv: "01",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2_1, setFilters2_1] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Q",
    orgdiv: "01",
    payyrmm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    orgdiv: "01",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters3_1, setFilters3_1] = useState({
    pgSize: PAGE_SIZE,
    work_type: "DETAIL",
    orgdiv: "01",
    payyrmm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Q",
    orgdiv: "01",
    paycd: "",
    payitemcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

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

    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page3_1, setPage3_1] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);

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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;
    setPage3_1(initialPageState);
    setFilters3_1((prev) => ({
      ...prev,
      pgNum: 1,
    }));

    setFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pageChange3_1 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3_1((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3_1({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters4((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataState3_1, setMainDataState3_1] = useState<State>({
    sort: [],
  });
  const [mainDataState4, setMainDataState4] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState3_1, setTempState3_1] = useState<State>({
    sort: [],
  });
  const [tempState4, setTempState4] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [mainDataResult3_1, setMainDataResult3_1] = useState<DataResult>(
    process([], mainDataState3_1)
  );
  const [mainDataResult4, setMainDataResult4] = useState<DataResult>(
    process([], mainDataState4)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult3_1, setTempResult3_1] = useState<DataResult>(
    process([], tempState3_1)
  );
  const [tempResult4, setTempResult4] = useState<DataResult>(
    process([], tempState4)
  );
  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3_1, setSelectedState3_1] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState4, setSelectedState4] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [Information, setInformation] = useState({
    medprvrat: 0,
    medcomprat: 0,
    medrat: 0,
    pnsprvrat: 0,
    pnscomprat: 0,
    pnsrat: 0,
    maxprice: 0,
    minprice: 0,
    empinsurancerat: 0,
    hircomprat: 0,
    medrat2: 0,
    chkrat: 0,
    locataxrat: 0,
    daytaxstd: 0,
    dayinctax: 0,
    daylocatax: 0,
    daytaxrate: 0,
    dayhirinsurat: 0,
    taxexmstd: 0,
    taxexmlmt: 0,
    foretax: 0,
    payyrmm: convertDateToStr(new Date()),
  });

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3060W_ITR_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_stdyr": convertDateToStr(filters.stdyr).substring(0, 4),
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
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.seq == filters.find_row_value
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
            : rows.find((row: any) => row.seq == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
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
  const fetchMainGrid2 = async (filters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3060W_RIF_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.work_type,
        "@p_orgdiv": filters2.orgdiv,
        "@p_payyrmm": "",
        "@p_find_row_value": filters2.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.payyrmm == filters2.find_row_value
          );
          targetRowIndex2 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage2({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef2.current) {
          targetRowIndex2 = 0;
        }
      }

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters2.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.payyrmm == filters2.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState2({ [selectedRow[DATA_ITEM_KEY2]]: true });
          setFilters2_1((prev) => ({
            ...prev,
            payyrmm: selectedRow.payyrmm,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
          setFilters2_1((prev) => ({
            ...prev,
            payyrmm: rows[0].payyrmm,
            isSearch: true,
            pgNum: 1,
          }));
        }
      } else {
        setInformation({
          medprvrat: 0,
          medcomprat: 0,
          medrat: 0,
          pnsprvrat: 0,
          pnscomprat: 0,
          pnsrat: 0,
          maxprice: 0,
          minprice: 0,
          empinsurancerat: 0,
          hircomprat: 0,
          medrat2: 0,
          chkrat: 0,
          locataxrat: 0,
          daytaxstd: 0,
          dayinctax: 0,
          daylocatax: 0,
          daytaxrate: 0,
          dayhirinsurat: 0,
          taxexmstd: 0,
          taxexmlmt: 0,
          foretax: 0,
          payyrmm: convertDateToStr(new Date()),
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters2((prev) => ({
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
  const fetchMainGrid2_1 = async (filters2_1: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3060W_RIF_Q",
      pageNumber: filters2_1.pgNum,
      pageSize: filters2_1.pgSize,
      parameters: {
        "@p_work_type": filters2_1.work_type,
        "@p_orgdiv": filters2_1.orgdiv,
        "@p_payyrmm": filters2_1.payyrmm,
        "@p_find_row_value": filters2_1.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      if (totalRowCnt > 0) {
        setInformation({
          medprvrat: rows[0].medprvrat,
          medcomprat: rows[0].medcomprat,
          medrat: rows[0].medrat,
          pnsprvrat: rows[0].pnsprvrat,
          pnscomprat: rows[0].pnscomprat,
          pnsrat: rows[0].pnsrat,
          maxprice: rows[0].maxprice,
          minprice: rows[0].minprice,
          empinsurancerat: rows[0].empinsurancerat,
          hircomprat: rows[0].hircomprat,
          medrat2: rows[0].medrat2,
          chkrat: rows[0].chkrat,
          locataxrat: rows[0].locataxrat,
          daytaxstd: rows[0].daytaxstd,
          dayinctax: rows[0].dayinctax,
          daylocatax: rows[0].daylocatax,
          daytaxrate: rows[0].daytaxrate,
          dayhirinsurat: rows[0].dayhirinsurat,
          taxexmstd: rows[0].taxexmstd,
          taxexmlmt: rows[0].taxexmlmt,
          foretax: rows[0].foretax,
          payyrmm: filters2_1.payyrmm,
        });
      } else {
        setInformation({
          medprvrat: 0,
          medcomprat: 0,
          medrat: 0,
          pnsprvrat: 0,
          pnscomprat: 0,
          pnsrat: 0,
          maxprice: 0,
          minprice: 0,
          empinsurancerat: 0,
          hircomprat: 0,
          medrat2: 0,
          chkrat: 0,
          locataxrat: 0,
          daytaxstd: 0,
          dayinctax: 0,
          daylocatax: 0,
          daytaxrate: 0,
          dayhirinsurat: 0,
          taxexmstd: 0,
          taxexmlmt: 0,
          foretax: 0,
          payyrmm: convertDateToStr(new Date()),
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters2_1((prev) => ({
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
  const fetchMainGrid3 = async (filters3: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3060W_ITC_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.work_type,
        "@p_orgdiv": filters3.orgdiv,
        "@p_payyrmm": "",
        "@p_find_row_value": filters3.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      if (filters3.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.payyrmm == filters3.find_row_value
          );
          targetRowIndex3 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage3({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef3.current) {
          targetRowIndex3 = 0;
        }
      }

      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters3.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.payyrmm == filters3.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState3({ [selectedRow[DATA_ITEM_KEY3]]: true });
          setFilters3_1((prev) => ({
            ...prev,
            payyrmm: selectedRow.payyrmm,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
          setFilters3_1((prev) => ({
            ...prev,
            payyrmm: rows[0].payyrmm,
            isSearch: true,
            pgNum: 1,
          }));
        }
      } else {
        setPage3_1(initialPageState);
        setMainDataResult3_1(process([], mainDataState3_1));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters3((prev) => ({
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
  const fetchMainGrid3_1 = async (filters3_1: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3060W_ITC_Q",
      pageNumber: filters3_1.pgNum,
      pageSize: filters3_1.pgSize,
      parameters: {
        "@p_work_type": filters3_1.work_type,
        "@p_orgdiv": filters3_1.orgdiv,
        "@p_payyrmm": filters3_1.payyrmm,
        "@p_find_row_value": filters3_1.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      setMainDataResult3_1((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState3_1({ [rows[0][DATA_ITEM_KEY3_1]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters3_1((prev) => ({
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
  const fetchMainGrid4 = async (filters4: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3060W_FML_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": filters4.work_type,
        "@p_orgdiv": filters4.orgdiv,
        "@p_paycd": filters4.paycd,
        "@p_payitemcd": filters4.payitemcd,
        "@p_find_row_value": filters4.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        cal2s: row.cal2s == "Y" ? true : false,
      }));

      if (filters4.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef4.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.findkey == filters4.find_row_value
          );
          targetRowIndex4 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage4({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef4.current) {
          targetRowIndex4 = 0;
        }
      }

      setMainDataResult4((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters4.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.findkey == filters4.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState4({ [selectedRow[DATA_ITEM_KEY4]]: true });
        } else {
          setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters4((prev) => ({
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
    if (filters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions]);
  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2_1.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2_1);
      setFilters2_1((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2_1(deepCopiedFilters);
    }
  }, [filters2_1, permissions]);
  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions]);
  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3_1.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3_1);
      setFilters3_1((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3_1(deepCopiedFilters);
    }
  }, [filters3_1, permissions]);
  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters4.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4, permissions]);
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [mainDataResult2]);
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [mainDataResult3]);
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex4 !== null && gridRef4.current) {
      gridRef4.current.scrollIntoView({ rowIndex: targetRowIndex4 });
      targetRowIndex4 = null;
    }
  }, [mainDataResult4]);
  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage3_1(initialPageState);
    setPage4(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult3_1(process([], mainDataState3_1));
    setMainDataResult4(process([], mainDataState4));
    setInformation({
      medprvrat: 0,
      medcomprat: 0,
      medrat: 0,
      pnsprvrat: 0,
      pnscomprat: 0,
      pnsrat: 0,
      maxprice: 0,
      minprice: 0,
      empinsurancerat: 0,
      hircomprat: 0,
      medrat2: 0,
      chkrat: 0,
      locataxrat: 0,
      daytaxstd: 0,
      dayinctax: 0,
      daylocatax: 0,
      daytaxrate: 0,
      dayhirinsurat: 0,
      taxexmstd: 0,
      taxexmlmt: 0,
      foretax: 0,
      payyrmm: convertDateToStr(new Date()),
    });
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters2_1((prev) => ({
      ...prev,
      payyrmm: selectedRowData.payyrmm,
      isSearch: true,
      pgNum: 1,
    }));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters3_1((prev) => ({
      ...prev,
      payyrmm: selectedRowData.payyrmm,
      isSearch: true,
      pgNum: 1,
    }));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onSelectionChange3_1 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3_1,
      dataItemKey: DATA_ITEM_KEY3_1,
    });

    setSelectedState3_1(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });

    setSelectedState4(newSelectedState);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
  const onMainDataStateChange3_1 = (event: GridDataStateChangeEvent) => {
    setMainDataState3_1(event.dataState);
  };
  const onMainDataStateChange4 = (event: GridDataStateChangeEvent) => {
    setMainDataState4(event.dataState);
  };
  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult3.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell3_1 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3_1.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult3_1.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell4 = (props: GridFooterCellProps) => {
    var parts = mainDataResult4.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult4.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3_1 = (e: any) => {
    setMainDataState3_1((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange4 = (e: any) => {
    setMainDataState4((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };
  const onMainItemChange3_1 = (event: GridItemChangeEvent) => {
    setMainDataState3_1((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3_1,
      setMainDataResult3_1,
      DATA_ITEM_KEY3_1
    );
  };
  const onMainItemChange4 = (event: GridItemChangeEvent) => {
    setMainDataState4((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult4,
      setMainDataResult4,
      DATA_ITEM_KEY4
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
  const customCellRender3_1 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3_1}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender4 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit4}
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
  const customRowRender3_1 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3_1}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender4 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit4}
      editField={EDIT_FIELD}
    />
  );
  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
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
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev: { total: any }) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };
  const enterEdit3_1 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult3_1.data.map((item) =>
        item[DATA_ITEM_KEY3_1] === dataItem[DATA_ITEM_KEY3_1]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult3_1((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3_1((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult3_1((prev: { total: any }) => {
        return {
          data: mainDataResult3_1.data,
          total: prev.total,
        };
      });
    }
  };
  const enterEdit4 = (dataItem: any, field: string) => {
    if (
      field != "rowstatus" &&
      field != "text1" &&
      field != "text2" &&
      field != "text3" &&
      field != "text4" &&
      field != "text5" &&
      field != "text6" &&
      field != "text7"
    ) {
      const newData = mainDataResult4.data.map((item) =>
        item[DATA_ITEM_KEY4] === dataItem[DATA_ITEM_KEY4]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult4((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult4((prev: { total: any }) => {
        return {
          data: mainDataResult4.data,
          total: prev.total,
        };
      });
    }
  };
  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
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
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };
  const exitEdit3_1 = () => {
    if (tempResult3_1.data != mainDataResult3_1.data) {
      const newData = mainDataResult3_1.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY3_1] ==
          Object.getOwnPropertyNames(selectedState3_1)[0]
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
      setTempResult3_1((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3_1((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult3_1.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult3_1((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3_1((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };
  const exitEdit4 = () => {
    if (tempResult4.data != mainDataResult4.data) {
      const newData = mainDataResult4.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState4)[0]
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
      setTempResult4((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult4((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult4.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult4((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult4((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };
  const saveExcel = (jsonArr: any[]) => {
    if (jsonArr.length == 0) {
      alert("데이터가 없습니다.");
      return;
    }

    if (Object.keys(jsonArr[0])[0] != "__EMPTY_12") {
      alert("양식이 맞지않습니다.");
      return;
    }

    let dataArr: TdataArr3 = {
      rowstatus_s: [],
      sectiondiv_s: [],
      startmonamt_s: [],
      endmonamt_s: [],
      incomtax1_s: [],
      incomtax2_s: [],
      incomtax3_s: [],
      incomtax4_s: [],
      incomtax5_s: [],
      incomtax6_s: [],
      incomtax7_s: [],
      incomtax8_s: [],
      incomtax9_s: [],
      incomtax10_s: [],
      incomtax11_s: [],
    };

    jsonArr.forEach((item: any, idx: number) => {
      if (idx >= 4 && typeof item[Object.keys(item)[0]] == "number") {
        dataArr.rowstatus_s.push("N");
        dataArr.sectiondiv_s.push((idx - 3).toString());
        dataArr.startmonamt_s.push(
          Object.keys(item)[0] == undefined ? 0 : item[Object.keys(item)[0]]
        );
        dataArr.endmonamt_s.push(
          Object.keys(item)[1] == undefined ? 0 : item[Object.keys(item)[1]]
        );
        dataArr.incomtax1_s.push(
          Object.keys(item)[2] == undefined ? 0 : item[Object.keys(item)[2]]
        );
        dataArr.incomtax2_s.push(
          Object.keys(item)[3] == undefined ? 0 : item[Object.keys(item)[3]]
        );
        dataArr.incomtax3_s.push(
          Object.keys(item)[4] == undefined ? 0 : item[Object.keys(item)[4]]
        );
        dataArr.incomtax4_s.push(
          Object.keys(item)[5] == undefined ? 0 : item[Object.keys(item)[5]]
        );
        dataArr.incomtax5_s.push(
          Object.keys(item)[6] == undefined ? 0 : item[Object.keys(item)[6]]
        );
        dataArr.incomtax6_s.push(
          Object.keys(item)[7] == undefined ? 0 : item[Object.keys(item)[7]]
        );
        dataArr.incomtax7_s.push(
          Object.keys(item)[8] == undefined ? 0 : item[Object.keys(item)[8]]
        );
        dataArr.incomtax8_s.push(
          Object.keys(item)[9] == undefined ? 0 : item[Object.keys(item)[9]]
        );
        dataArr.incomtax9_s.push(
          Object.keys(item)[10] == undefined ? 0 : item[Object.keys(item)[10]]
        );
        dataArr.incomtax10_s.push(
          Object.keys(item)[11] == undefined ? 0 : item[Object.keys(item)[11]]
        );
        dataArr.incomtax11_s.push(
          Object.keys(item)[12] == undefined ? 0 : item[Object.keys(item)[12]]
        );
      }
      if (
        idx >= 4 &&
        typeof item[Object.keys(item)[0]] == "string" &&
        item[Object.keys(item)[0]] == "10,000천원"
      ) {
        dataArr.rowstatus_s.push("N");
        dataArr.sectiondiv_s.push((idx - 3).toString());
        dataArr.startmonamt_s.push("10000");
        dataArr.endmonamt_s.push("10000");
        dataArr.incomtax1_s.push(
          Object.keys(item)[2] == undefined ? 0 : item[Object.keys(item)[2]]
        );
        dataArr.incomtax2_s.push(
          Object.keys(item)[3] == undefined ? 0 : item[Object.keys(item)[3]]
        );
        dataArr.incomtax3_s.push(
          Object.keys(item)[4] == undefined ? 0 : item[Object.keys(item)[4]]
        );
        dataArr.incomtax4_s.push(
          Object.keys(item)[5] == undefined ? 0 : item[Object.keys(item)[5]]
        );
        dataArr.incomtax5_s.push(
          Object.keys(item)[6] == undefined ? 0 : item[Object.keys(item)[6]]
        );
        dataArr.incomtax6_s.push(
          Object.keys(item)[7] == undefined ? 0 : item[Object.keys(item)[7]]
        );
        dataArr.incomtax7_s.push(
          Object.keys(item)[8] == undefined ? 0 : item[Object.keys(item)[8]]
        );
        dataArr.incomtax8_s.push(
          Object.keys(item)[9] == undefined ? 0 : item[Object.keys(item)[9]]
        );
        dataArr.incomtax9_s.push(
          Object.keys(item)[10] == undefined ? 0 : item[Object.keys(item)[10]]
        );
        dataArr.incomtax10_s.push(
          Object.keys(item)[11] == undefined ? 0 : item[Object.keys(item)[11]]
        );
        dataArr.incomtax11_s.push(
          Object.keys(item)[12] == undefined ? 0 : item[Object.keys(item)[12]]
        );
      }
    });

    setParaData3((prev) => ({
      ...prev,
      workType: "N",
      orgdiv: "01",
      payyrmm: convertDateToStr(new Date()),
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      sectiondiv_s: dataArr.sectiondiv_s.join("|"),
      startmonamt_s: dataArr.startmonamt_s.join("|"),
      endmonamt_s: dataArr.endmonamt_s.join("|"),
      incomtax1_s: dataArr.incomtax1_s.join("|"),
      incomtax2_s: dataArr.incomtax2_s.join("|"),
      incomtax3_s: dataArr.incomtax3_s.join("|"),
      incomtax4_s: dataArr.incomtax4_s.join("|"),
      incomtax5_s: dataArr.incomtax5_s.join("|"),
      incomtax6_s: dataArr.incomtax6_s.join("|"),
      incomtax7_s: dataArr.incomtax7_s.join("|"),
      incomtax8_s: dataArr.incomtax8_s.join("|"),
      incomtax9_s: dataArr.incomtax9_s.join("|"),
      incomtax10_s: dataArr.incomtax10_s.join("|"),
      incomtax11_s: dataArr.incomtax11_s.join("|"),
    }));
  };

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"startmonamt"}
        title={"시작월급여액"}
        cell={NumberCell}
        width="100px"
        footerCell={mainTotalFooterCell3_1}
      />
    );
    array.push(
      <GridColumn
        field={"endmonamt"}
        title={"종료월급여액"}
        cell={NumberCell}
        width="100px"
      />
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"incomtax1"}
        title={"지급금액1"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"incomtax2"}
        title={"지급금액2"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"incomtax3"}
        title={"지급금액3"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"incomtax4"}
        title={"지급금액4"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"incomtax5"}
        title={"지급금액5"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"incomtax6"}
        title={"지급금액6"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"incomtax7"}
        title={"지급금액7"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"incomtax8"}
        title={"지급금액8"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"incomtax9"}
        title={"지급금액9"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"incomtax10"}
        title={"지급금액10"}
        cell={NumberCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"incomtax11"}
        title={"지급금액11"}
        cell={NumberCell}
        width="100px"
      />
    );
    return array;
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      gradualdeduct: 0,
      orgdiv: "01",
      seq: 0,
      stdyr: convertDateToStr(filters.stdyr).substring(0, 4),
      taxrate: 0,
      taxstdmax: 0,
      taxstdmin: 0,
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick2 = () => {
    setInformation({
      medprvrat: 0,
      medcomprat: 0,
      medrat: 0,
      pnsprvrat: 0,
      pnscomprat: 0,
      pnsrat: 0,
      maxprice: 0,
      minprice: 0,
      empinsurancerat: 0,
      hircomprat: 0,
      medrat2: 0,
      chkrat: 0,
      locataxrat: 0,
      daytaxstd: 0,
      dayinctax: 0,
      daylocatax: 0,
      daytaxrate: 0,
      dayhirinsurat: 0,
      taxexmstd: 0,
      taxexmlmt: 0,
      foretax: 0,
      payyrmm: convertDateToStr(new Date()),
    });
  };

  const onAddClick4 = () => {
    mainDataResult4.data.map((item) => {
      if (item.num > temp4) {
        temp4 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY4]: ++temp4,
      cal1n: 0,
      cal1s: "",
      cal2n: 0,
      cal2s: true,
      cal3n: 0,
      cal3s: "",
      cal4n: 0,
      cal4s: "",
      dutycd: "",
      dutymngdiv: "",
      findkey: "",
      orgdiv: "01",
      paycd: "",
      payitemcd: "",
      payitemtype: "",
      stdamt: 0,
      text1: "*",
      text2: "*",
      text3: "급여기준",
      text4: "*",
      text5: "+",
      text6: "/",
      text7: "*",
      rowstatus: "N",
    };

    setSelectedState4({ [newDataItem[DATA_ITEM_KEY4]]: true });
    setMainDataResult4((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
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
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick3 = () => {
    if (mainDataResult3.total == 0) {
      alert("데이터가 없습니다.");
    } else {
      const datas = mainDataResult3.data.filter(
        (item) =>
          item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
      )[0];

      setParaData3((prev) => ({
        ...prev,
        workType: "D",
        orgdiv: "01",
        payyrmm: datas.payyrmm,
      }));
    }
  };

  const onDeleteClick4 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult4.data.forEach((item: any, index: number) => {
      if (!selectedState4[item[DATA_ITEM_KEY4]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows4.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult4.data[Math.min(...Object2)];
    } else {
      data = mainDataResult4.data[Math.min(...Object) - 1];
    }

    setMainDataResult4((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState4({
        [data != undefined ? data[DATA_ITEM_KEY4] : newData[0]]: true,
      });
    }
  };

  const onSaveClick = () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      seq_s: [],
      taxstdmin_s: [],
      taxstdmax_s: [],
      taxrate_s: [],
      gradualdeduct_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = "",
        taxstdmin = "",
        taxstdmax = "",
        taxrate = "",
        gradualdeduct = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.taxstdmin_s.push(taxstdmin);
      dataArr.taxstdmax_s.push(taxstdmax);
      dataArr.taxrate_s.push(taxrate);
      dataArr.gradualdeduct_s.push(gradualdeduct);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = "",
        taxstdmin = "",
        taxstdmax = "",
        taxrate = "",
        gradualdeduct = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.seq_s.push(seq);
      dataArr.taxstdmin_s.push(taxstdmin);
      dataArr.taxstdmax_s.push(taxstdmax);
      dataArr.taxrate_s.push(taxrate);
      dataArr.gradualdeduct_s.push(gradualdeduct);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "N",
      orgdiv: "01",
      year: convertDateToStr(filters.stdyr).substring(0, 4),
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      taxstdmin_s: dataArr.taxstdmin_s.join("|"),
      taxstdmax_s: dataArr.taxstdmax_s.join("|"),
      taxrate_s: dataArr.taxrate_s.join("|"),
      gradualdeduct_s: dataArr.gradualdeduct_s.join("|"),
    }));
  };

  const onSaveClick2 = () => {
    setParaData2({
      workType: "N",
      orgdiv: "01",
      payyrmm: Information.payyrmm,
      medprvrat: Information.medprvrat,
      medcomprat: Information.medcomprat,
      medrat: Information.medrat,
      pnsprvrat: Information.pnsprvrat,
      pnscomprat: Information.pnscomprat,
      pnsrat: Information.pnsrat,
      empinsurancerat: Information.empinsurancerat,
      hircomprat: Information.hircomprat,
      medrat2: Information.medrat2,
      chkrat: Information.chkrat,
      maxprice: Information.maxprice,
      minprice: Information.minprice,
      daytaxstd: Information.daytaxstd,
      dayinctax: Information.dayinctax,
      daylocatax: Information.daylocatax,
      daytaxrate: Information.daytaxrate,
      dayhirinsurat: Information.dayhirinsurat,
      locataxrat: Information.locataxrat,
      taxexmstd: Information.taxexmstd,
      taxexmlmt: Information.taxexmlmt,
      foretax: Information.foretax,
    });
  };

  const onSaveClick3 = () => {
    const dataItem = mainDataResult3_1.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0) return false;

    const datas = mainDataResult3.data.filter(
      (item) =>
        item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
    )[0];

    let dataArr: TdataArr3 = {
      rowstatus_s: [],
      sectiondiv_s: [],
      startmonamt_s: [],
      endmonamt_s: [],
      incomtax1_s: [],
      incomtax2_s: [],
      incomtax3_s: [],
      incomtax4_s: [],
      incomtax5_s: [],
      incomtax6_s: [],
      incomtax7_s: [],
      incomtax8_s: [],
      incomtax9_s: [],
      incomtax10_s: [],
      incomtax11_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        sectiondiv = "",
        startmonamt = "",
        endmonamt = "",
        incomtax1 = "",
        incomtax2 = "",
        incomtax3 = "",
        incomtax4 = "",
        incomtax5 = "",
        incomtax6 = "",
        incomtax7 = "",
        incomtax8 = "",
        incomtax9 = "",
        incomtax10 = "",
        incomtax11 = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.sectiondiv_s.push(sectiondiv);
      dataArr.startmonamt_s.push(startmonamt);
      dataArr.endmonamt_s.push(endmonamt);
      dataArr.incomtax1_s.push(incomtax1);
      dataArr.incomtax2_s.push(incomtax2);
      dataArr.incomtax3_s.push(incomtax3);
      dataArr.incomtax4_s.push(incomtax4);
      dataArr.incomtax5_s.push(incomtax5);
      dataArr.incomtax6_s.push(incomtax6);
      dataArr.incomtax7_s.push(incomtax7);
      dataArr.incomtax8_s.push(incomtax8);
      dataArr.incomtax9_s.push(incomtax9);
      dataArr.incomtax10_s.push(incomtax10);
      dataArr.incomtax11_s.push(incomtax11);
    });

    setParaData3((prev) => ({
      ...prev,
      workType: "N",
      orgdiv: "01",
      payyrmm: datas.payyrmm,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      sectiondiv_s: dataArr.sectiondiv_s.join("|"),
      startmonamt_s: dataArr.startmonamt_s.join("|"),
      endmonamt_s: dataArr.endmonamt_s.join("|"),
      incomtax1_s: dataArr.incomtax1_s.join("|"),
      incomtax2_s: dataArr.incomtax2_s.join("|"),
      incomtax3_s: dataArr.incomtax3_s.join("|"),
      incomtax4_s: dataArr.incomtax4_s.join("|"),
      incomtax5_s: dataArr.incomtax5_s.join("|"),
      incomtax6_s: dataArr.incomtax6_s.join("|"),
      incomtax7_s: dataArr.incomtax7_s.join("|"),
      incomtax8_s: dataArr.incomtax8_s.join("|"),
      incomtax9_s: dataArr.incomtax9_s.join("|"),
      incomtax10_s: dataArr.incomtax10_s.join("|"),
      incomtax11_s: dataArr.incomtax11_s.join("|"),
    }));
  };

  const onSaveClick4 = () => {
    const dataItem = mainDataResult4.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows4.length == 0) return false;

    let dataArr: TdataArr4 = {
      rowstatus_s: [],
      payitemtype_s: [],
      paycd_s: [],
      payitemcd_s: [],
      dutycd_s: [],
      dutymngdiv_s: [],
      stdamt_s: [],
      cal2n_s: [],
      cal2s_s: [],
      cal3n_s: [],
      cal4n_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        payitemtype = "",
        paycd = "",
        payitemcd = "",
        dutycd = "",
        dutymngdiv = "",
        stdamt = "",
        cal2n = "",
        cal2s = "",
        cal3n = "",
        cal4n = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.payitemtype_s.push(payitemtype);
      dataArr.paycd_s.push(paycd);
      dataArr.payitemcd_s.push(payitemcd);
      dataArr.dutycd_s.push(dutycd);
      dataArr.dutymngdiv_s.push(dutymngdiv);
      dataArr.stdamt_s.push(stdamt);
      dataArr.cal2n_s.push(cal2n);
      dataArr.cal2s_s.push(cal2s == true ? "Y" : "N");
      dataArr.cal3n_s.push(cal3n);
      dataArr.cal4n_s.push(cal4n);
    });
    deletedMainRows4.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        payitemtype = "",
        paycd = "",
        payitemcd = "",
        dutycd = "",
        dutymngdiv = "",
        stdamt = "",
        cal2n = "",
        cal2s = "",
        cal3n = "",
        cal4n = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.payitemtype_s.push(payitemtype);
      dataArr.paycd_s.push(paycd);
      dataArr.payitemcd_s.push(payitemcd);
      dataArr.dutycd_s.push(dutycd);
      dataArr.dutymngdiv_s.push(dutymngdiv);
      dataArr.stdamt_s.push(stdamt);
      dataArr.cal2n_s.push(cal2n);
      dataArr.cal2s_s.push(cal2s == true ? "Y" : "N");
      dataArr.cal3n_s.push(cal3n);
      dataArr.cal4n_s.push(cal4n);
    });
    setParaData4((prev) => ({
      ...prev,
      workType: "N",
      orgdiv: "01",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      payitemtype_s: dataArr.payitemtype_s.join("|"),
      paycd_s: dataArr.paycd_s.join("|"),
      payitemcd_s: dataArr.payitemcd_s.join("|"),
      dutycd_s: dataArr.dutycd_s.join("|"),
      dutymngdiv_s: dataArr.dutymngdiv_s.join("|"),
      stdamt_s: dataArr.stdamt_s.join("|"),
      cal2n_s: dataArr.cal2n_s.join("|"),
      cal2s_s: dataArr.cal2s_s.join("|"),
      cal3n_s: dataArr.cal3n_s.join("|"),
      cal4n_s: dataArr.cal4n_s.join("|"),
    }));
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    year: "",
    rowstatus_s: "",
    seq_s: "",
    taxstdmin_s: "",
    taxstdmax_s: "",
    taxrate_s: "",
    gradualdeduct_s: "",
  });

  const [paraData2, setParaData2] = useState({
    workType: "",
    orgdiv: "01",
    payyrmm: "",
    medprvrat: 0,
    medcomprat: 0,
    medrat: 0,
    pnsprvrat: 0,
    pnscomprat: 0,
    pnsrat: 0,
    empinsurancerat: 0,
    hircomprat: 0,
    medrat2: 0,
    chkrat: 0,
    maxprice: 0,
    minprice: 0,
    daytaxstd: 0,
    dayinctax: 0,
    daylocatax: 0,
    daytaxrate: 0,
    dayhirinsurat: 0,
    locataxrat: 0,
    taxexmstd: 0,
    taxexmlmt: 0,
    foretax: 0,
  });

  const [paraData3, setParaData3] = useState({
    workType: "",
    orgdiv: "01",
    payyrmm: "",
    rowstatus_s: "",
    sectiondiv_s: "",
    startmonamt_s: "",
    endmonamt_s: "",
    incomtax1_s: "",
    incomtax2_s: "",
    incomtax3_s: "",
    incomtax4_s: "",
    incomtax5_s: "",
    incomtax6_s: "",
    incomtax7_s: "",
    incomtax8_s: "",
    incomtax9_s: "",
    incomtax10_s: "",
    incomtax11_s: "",
  });

  const [paraData4, setParaData4] = useState({
    workType: "",
    orgdiv: "01",
    rowstatus_s: "",
    payitemtype_s: "",
    paycd_s: "",
    payitemcd_s: "",
    dutycd_s: "",
    dutymngdiv_s: "",
    stdamt_s: "",
    cal2n_s: "",
    cal2s_s: "",
    cal3n_s: "",
    cal4n_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A3060W_ITR_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_year": paraData.year,

      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_seq_s": paraData.seq_s,
      "@p_taxstdmin_s": paraData.taxstdmin_s,
      "@p_taxstdmax_s": paraData.taxstdmax_s,
      "@p_taxrate_s": paraData.taxrate_s,
      "@p_gradualdeduct_s": paraData.gradualdeduct_s,

      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A3060W",
    },
  };

  const para2: Iparameters = {
    procedureName: "P_HU_A3060W_RIF_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData2.workType,
      "@p_orgdiv": paraData2.orgdiv,
      "@p_payyrmm": paraData2.payyrmm,
      "@p_medprvrat": paraData2.medprvrat,
      "@p_medcomprat": paraData2.medcomprat,
      "@p_medrat": paraData2.medrat,
      "@p_pnsprvrat": paraData2.pnsprvrat,
      "@p_pnscomprat": paraData2.pnscomprat,
      "@p_pnsrat": paraData2.pnsrat,
      "@p_empinsurancerat": paraData2.empinsurancerat,
      "@p_hircomprat": paraData2.hircomprat,
      "@p_medrat2": paraData2.medrat2,
      "@p_chkrat": paraData2.chkrat,
      "@p_maxprice": paraData2.maxprice,
      "@p_minprice": paraData2.minprice,
      "@p_daytaxstd": paraData2.daytaxstd,
      "@p_dayinctax": paraData2.dayinctax,
      "@p_daylocatax": paraData2.daylocatax,
      "@p_daytaxrate": paraData2.daytaxrate,
      "@p_dayhirinsurat": paraData2.dayhirinsurat,
      "@p_locataxrat": paraData2.locataxrat,
      "@p_taxexmstd": paraData2.taxexmstd,
      "@p_taxexmlmt": paraData2.taxexmlmt,
      "@p_foretax": paraData2.foretax,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A3060W",
    },
  };

  const para3: Iparameters = {
    procedureName: "P_HU_A3060W_ITC_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData3.workType,
      "@p_orgdiv": paraData3.orgdiv,
      "@p_payyrmm": paraData3.payyrmm,
      "@p_rowstatus_s": paraData3.rowstatus_s,
      "@p_sectiondiv_s": paraData3.sectiondiv_s,
      "@p_startmonamt_s": paraData3.startmonamt_s,
      "@p_endmonamt_s": paraData3.endmonamt_s,
      "@p_incomtax1_s": paraData3.incomtax1_s,
      "@p_incomtax2_s": paraData3.incomtax2_s,
      "@p_incomtax3_s": paraData3.incomtax3_s,
      "@p_incomtax4_s": paraData3.incomtax4_s,
      "@p_incomtax5_s": paraData3.incomtax5_s,
      "@p_incomtax6_s": paraData3.incomtax6_s,
      "@p_incomtax7_s": paraData3.incomtax7_s,
      "@p_incomtax8_s": paraData3.incomtax8_s,
      "@p_incomtax9_s": paraData3.incomtax9_s,
      "@p_incomtax10_s": paraData3.incomtax10_s,
      "@p_incomtax11_s": paraData3.incomtax11_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A3060W",
    },
  };

  const para4: Iparameters = {
    procedureName: "P_HU_A3060W_FML_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData4.workType,
      "@p_orgdiv": paraData4.orgdiv,

      "@p_rowstatus_s": paraData4.rowstatus_s,
      "@p_payitemtype_s": paraData4.payitemtype_s,
      "@p_paycd_s": paraData4.paycd_s,
      "@p_payitemcd_s": paraData4.payitemcd_s,
      "@p_dutycd_s": paraData4.dutycd_s,
      "@p_dutymngdiv_s": paraData4.dutymngdiv_s,
      "@p_stdamt_s": paraData4.stdamt_s,
      "@p_cal2n_s": paraData4.cal2n_s,
      "@p_cal2s_s": paraData4.cal2s_s,
      "@p_cal3n_s": paraData4.cal3n_s,
      "@p_cal4n_s": paraData4.cal4n_s,

      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A3060W",
    },
  };

  useEffect(() => {
    if (paraData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  useEffect(() => {
    if (paraData2.workType != "") {
      fetchTodoGridSaved2();
    }
  }, [paraData2]);

  useEffect(() => {
    if (paraData3.workType != "") {
      fetchTodoGridSaved3();
    }
  }, [paraData3]);

  useEffect(() => {
    if (paraData4.workType != "") {
      fetchTodoGridSaved4();
    }
  }, [paraData4]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      deletedMainRows = [];
      deletedMainRows4 = [];
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: 1,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));

      setParaData({
        workType: "",
        orgdiv: "01",
        year: "",
        rowstatus_s: "",
        seq_s: "",
        taxstdmin_s: "",
        taxstdmax_s: "",
        taxrate_s: "",
        gradualdeduct_s: "",
      });
      setParaData2({
        workType: "",
        orgdiv: "01",
        payyrmm: "",
        medprvrat: 0,
        medcomprat: 0,
        medrat: 0,
        pnsprvrat: 0,
        pnscomprat: 0,
        pnsrat: 0,
        empinsurancerat: 0,
        hircomprat: 0,
        medrat2: 0,
        chkrat: 0,
        maxprice: 0,
        minprice: 0,
        daytaxstd: 0,
        dayinctax: 0,
        daylocatax: 0,
        daytaxrate: 0,
        dayhirinsurat: 0,
        locataxrat: 0,
        taxexmstd: 0,
        taxexmlmt: 0,
        foretax: 0,
      });
      setParaData3({
        workType: "",
        orgdiv: "01",
        payyrmm: "",
        rowstatus_s: "",
        sectiondiv_s: "",
        startmonamt_s: "",
        endmonamt_s: "",
        incomtax1_s: "",
        incomtax2_s: "",
        incomtax3_s: "",
        incomtax4_s: "",
        incomtax5_s: "",
        incomtax6_s: "",
        incomtax7_s: "",
        incomtax8_s: "",
        incomtax9_s: "",
        incomtax10_s: "",
        incomtax11_s: "",
      });
      setParaData4({
        workType: "",
        orgdiv: "01",
        rowstatus_s: "",
        payitemtype_s: "",
        paycd_s: "",
        payitemcd_s: "",
        dutycd_s: "",
        dutymngdiv_s: "",
        stdamt_s: "",
        cal2n_s: "",
        cal2s_s: "",
        cal3n_s: "",
        cal4n_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved2 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      deletedMainRows = [];
      deletedMainRows4 = [];
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: 1,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));

      setParaData({
        workType: "",
        orgdiv: "01",
        year: "",
        rowstatus_s: "",
        seq_s: "",
        taxstdmin_s: "",
        taxstdmax_s: "",
        taxrate_s: "",
        gradualdeduct_s: "",
      });
      setParaData2({
        workType: "",
        orgdiv: "01",
        payyrmm: "",
        medprvrat: 0,
        medcomprat: 0,
        medrat: 0,
        pnsprvrat: 0,
        pnscomprat: 0,
        pnsrat: 0,
        empinsurancerat: 0,
        hircomprat: 0,
        medrat2: 0,
        chkrat: 0,
        maxprice: 0,
        minprice: 0,
        daytaxstd: 0,
        dayinctax: 0,
        daylocatax: 0,
        daytaxrate: 0,
        dayhirinsurat: 0,
        locataxrat: 0,
        taxexmstd: 0,
        taxexmlmt: 0,
        foretax: 0,
      });
      setParaData3({
        workType: "",
        orgdiv: "01",
        payyrmm: "",
        rowstatus_s: "",
        sectiondiv_s: "",
        startmonamt_s: "",
        endmonamt_s: "",
        incomtax1_s: "",
        incomtax2_s: "",
        incomtax3_s: "",
        incomtax4_s: "",
        incomtax5_s: "",
        incomtax6_s: "",
        incomtax7_s: "",
        incomtax8_s: "",
        incomtax9_s: "",
        incomtax10_s: "",
        incomtax11_s: "",
      });
      setParaData4({
        workType: "",
        orgdiv: "01",
        rowstatus_s: "",
        payitemtype_s: "",
        paycd_s: "",
        payitemcd_s: "",
        dutycd_s: "",
        dutymngdiv_s: "",
        stdamt_s: "",
        cal2n_s: "",
        cal2s_s: "",
        cal3n_s: "",
        cal4n_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved3 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      deletedMainRows = [];
      deletedMainRows4 = [];
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: 1,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));

      setParaData({
        workType: "",
        orgdiv: "01",
        year: "",
        rowstatus_s: "",
        seq_s: "",
        taxstdmin_s: "",
        taxstdmax_s: "",
        taxrate_s: "",
        gradualdeduct_s: "",
      });
      setParaData2({
        workType: "",
        orgdiv: "01",
        payyrmm: "",
        medprvrat: 0,
        medcomprat: 0,
        medrat: 0,
        pnsprvrat: 0,
        pnscomprat: 0,
        pnsrat: 0,
        empinsurancerat: 0,
        hircomprat: 0,
        medrat2: 0,
        chkrat: 0,
        maxprice: 0,
        minprice: 0,
        daytaxstd: 0,
        dayinctax: 0,
        daylocatax: 0,
        daytaxrate: 0,
        dayhirinsurat: 0,
        locataxrat: 0,
        taxexmstd: 0,
        taxexmlmt: 0,
        foretax: 0,
      });
      setParaData3({
        workType: "",
        orgdiv: "01",
        payyrmm: "",
        rowstatus_s: "",
        sectiondiv_s: "",
        startmonamt_s: "",
        endmonamt_s: "",
        incomtax1_s: "",
        incomtax2_s: "",
        incomtax3_s: "",
        incomtax4_s: "",
        incomtax5_s: "",
        incomtax6_s: "",
        incomtax7_s: "",
        incomtax8_s: "",
        incomtax9_s: "",
        incomtax10_s: "",
        incomtax11_s: "",
      });
      setParaData4({
        workType: "",
        orgdiv: "01",
        rowstatus_s: "",
        payitemtype_s: "",
        paycd_s: "",
        payitemcd_s: "",
        dutycd_s: "",
        dutymngdiv_s: "",
        stdamt_s: "",
        cal2n_s: "",
        cal2s_s: "",
        cal3n_s: "",
        cal4n_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved4 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para4);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      deletedMainRows = [];
      deletedMainRows4 = [];
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: 1,
        isSearch: true,
      }));

      setParaData({
        workType: "",
        orgdiv: "01",
        year: "",
        rowstatus_s: "",
        seq_s: "",
        taxstdmin_s: "",
        taxstdmax_s: "",
        taxrate_s: "",
        gradualdeduct_s: "",
      });
      setParaData2({
        workType: "",
        orgdiv: "01",
        payyrmm: "",
        medprvrat: 0,
        medcomprat: 0,
        medrat: 0,
        pnsprvrat: 0,
        pnscomprat: 0,
        pnsrat: 0,
        empinsurancerat: 0,
        hircomprat: 0,
        medrat2: 0,
        chkrat: 0,
        maxprice: 0,
        minprice: 0,
        daytaxstd: 0,
        dayinctax: 0,
        daylocatax: 0,
        daytaxrate: 0,
        dayhirinsurat: 0,
        locataxrat: 0,
        taxexmstd: 0,
        taxexmlmt: 0,
        foretax: 0,
      });
      setParaData3({
        workType: "",
        orgdiv: "01",
        payyrmm: "",
        rowstatus_s: "",
        sectiondiv_s: "",
        startmonamt_s: "",
        endmonamt_s: "",
        incomtax1_s: "",
        incomtax2_s: "",
        incomtax3_s: "",
        incomtax4_s: "",
        incomtax5_s: "",
        incomtax6_s: "",
        incomtax7_s: "",
        incomtax8_s: "",
        incomtax9_s: "",
        incomtax10_s: "",
        incomtax11_s: "",
      });
      setParaData4({
        workType: "",
        orgdiv: "01",
        rowstatus_s: "",
        payitemtype_s: "",
        paycd_s: "",
        payitemcd_s: "",
        dutycd_s: "",
        dutymngdiv_s: "",
        stdamt_s: "",
        cal2n_s: "",
        cal2s_s: "",
        cal3n_s: "",
        cal4n_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onCopyClick = async () => {
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3060W_ITR_Q",
      pageNumber: 1,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": "COPY",
        "@p_orgdiv": filters.orgdiv,
        "@p_stdyr": convertDateToStr(filters.stdyr).substring(0, 4),
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      if (totalRowCnt > 0) {
        mainDataResult.data.map((item) => {
          if (item.num > temp) {
            temp = item.num;
          }
        });

        rows.map((item: any, idx: number) => {
          const newDataItem = {
            [DATA_ITEM_KEY]: ++temp,
            gradualdeduct: item.gradualdeduct,
            orgdiv: item.orgdiv,
            seq: item.seq,
            stdyr: item.stdyr,
            taxrate: item.taxrate,
            taxstdmax: item.taxstdmax,
            taxstdmin: item.taxstdmin,
            rowstatus: "N",
          };

          setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
          setMainDataResult((prev) => {
            return {
              data: [newDataItem, ...prev.data],
              total: prev.total + 1,
            };
          });
        });
      } else {
        alert("데이터가 없습니다.");
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  return (
    <>
      <TitleContainer>
        <Title>정산기준</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A3060W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="소득세율">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기준년도</th>
                  <td>
                    <DatePicker
                      name="stdyr"
                      value={filters.stdyr}
                      format="yyyy"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={YearCalendar}
                    />
                  </td>
                  <th></th>
                  <td></td>
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
                <GridTitle>기본정보</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    onClick={onCopyClick}
                    icon="copy"
                  >
                    전년도 소득세율 복사
                  </Button>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "75vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
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
                onSelectionChange={onSelectionChange}
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
                onItemChange={onMainItemChange}
                cellRender={customCellRender}
                rowRender={customRowRender}
                editField={EDIT_FIELD}
              >
                <GridColumn field="rowstatus" title=" " width="50px" />
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
                              : undefined
                          }
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
        <TabStripTab title="급여기준정보">
          <GridContainerWrap>
            <GridContainer width="15%">
              <GridTitleContainer>
                <GridTitle>기준일자</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "80vh" }}
                data={process(
                  mainDataResult2.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState2[idGetter2(row)],
                  })),
                  mainDataState2
                )}
                {...mainDataState2}
                onDataStateChange={onMainDataStateChange2}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY2}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange2}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult2.total}
                skip={page2.skip}
                take={page2.take}
                pageable={true}
                onPageChange={pageChange2}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef2}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange2}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn
                  field="payyrmm"
                  cell={DateCell}
                  title="기준일자"
                  width="120px"
                  footerCell={mainTotalFooterCell2}
                />
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(85% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle></GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onSaveClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap>
                <FormBox>
                  <tbody>
                    <tr>
                      <th></th>
                      <th style={{ textAlign: "center" }}>개인공제율</th>
                      <th style={{ textAlign: "center" }}>회사부담율</th>
                      <th style={{ textAlign: "center" }}>보험률</th>
                      <th style={{ textAlign: "center" }}>상한액</th>
                      <th style={{ textAlign: "center" }}>하한액</th>
                    </tr>
                    <tr>
                      <td>건강보험</td>
                      <td>
                        <NumericTextBox
                          name="medprvrat"
                          value={Information.medprvrat}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <NumericTextBox
                          name="medcomprat"
                          value={Information.medcomprat}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <NumericTextBox
                          name="medrat"
                          value={Information.medrat}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>국민연금</td>
                      <td>
                        <NumericTextBox
                          name="pnsprvrat"
                          value={Information.pnsprvrat}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <NumericTextBox
                          name="pnscomprat"
                          value={Information.pnscomprat}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <NumericTextBox
                          name="pnsrat"
                          value={Information.pnsrat}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <NumericTextBox
                          name="maxprice"
                          value={Information.maxprice}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <NumericTextBox
                          name="minprice"
                          value={Information.minprice}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>고용보험율</td>
                      <td>
                        <NumericTextBox
                          name="empinsurancerat"
                          value={Information.empinsurancerat}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td>
                        <NumericTextBox
                          name="hircomprat"
                          value={Information.hircomprat}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>요양보험보험률</td>
                      <td></td>
                      <td></td>
                      <td>
                        <NumericTextBox
                          name="medrat2"
                          value={Information.medrat2}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>보험대상자보험률</td>
                      <td></td>
                      <td></td>
                      <td>
                        <NumericTextBox
                          name="chkrat"
                          value={Information.chkrat}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>주민세율</td>
                      <td>
                        <NumericTextBox
                          name="locataxrat"
                          value={Information.locataxrat}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>직과세표준금액</td>
                      <td>
                        <NumericTextBox
                          name="daytaxstd"
                          value={Information.daytaxstd}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>일용직소득세율</td>
                      <td>
                        <NumericTextBox
                          name="dayinctax"
                          value={Information.dayinctax}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>일용직주민세율</td>
                      <td>
                        <NumericTextBox
                          name="daylocatax"
                          value={Information.daylocatax}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>근로세액공제율</td>
                      <td>
                        <NumericTextBox
                          name="daytaxrate"
                          value={Information.daytaxrate}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>일용직고용보험율</td>
                      <td>
                        <NumericTextBox
                          name="dayhirinsurat"
                          value={Information.dayhirinsurat}
                          format="n2"
                          onChange={InputChange}
                        />
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="소득세조건표">
          <GridContainerWrap>
            <GridContainer width="15%">
              <GridTitleContainer>
                <GridTitle>기준일자</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onDeleteClick3}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                  >
                    삭제
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "80vh" }}
                data={process(
                  mainDataResult3.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState3[idGetter3(row)],
                  })),
                  mainDataState3
                )}
                {...mainDataState3}
                onDataStateChange={onMainDataStateChange3}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY3}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange3}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult3.total}
                skip={page3.skip}
                take={page3.take}
                pageable={true}
                onPageChange={pageChange3}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef3}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange3}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn
                  field="payyrmm"
                  cell={DateCell}
                  title="기준일자"
                  width="120px"
                  footerCell={mainTotalFooterCell3}
                />
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(85% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>기본정보</GridTitle>
                <ButtonContainer>
                  <ExcelUploadButton
                    saveExcel={saveExcel}
                    permissions={{
                      view: true,
                      save: true,
                      delete: true,
                      print: true,
                    }}
                    style={{ marginLeft: "15px" }}
                  />
                  <Button
                    onClick={onSaveClick3}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "80vh" }}
                data={process(
                  mainDataResult3_1.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState3_1[idGetter3_1(row)], //선택된 데이터
                  })),
                  mainDataState3_1
                )}
                {...mainDataState3_1}
                onDataStateChange={onMainDataStateChange3_1}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY3_1}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange3_1}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult3_1.total}
                skip={page3_1.skip}
                take={page3_1.take}
                pageable={true}
                onPageChange={pageChange3_1}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange3_1}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                onItemChange={onMainItemChange3_1}
                cellRender={customCellRender3_1}
                rowRender={customRowRender3_1}
                editField={EDIT_FIELD}
              >
                <GridColumn field="rowstatus" title=" " width="50px" />
                <GridColumn title="월급여액(비과세소득제외)">
                  {createColumn()}
                </GridColumn>
                <GridColumn title="공제대상 가족의 수(본인, 배우자를 각각 1인으로 봄)">
                  {createColumn2()}
                </GridColumn>
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="계산공식">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>급여지급유형</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="paycd"
                        value={filters4.paycd}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>공제_지급코드</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="payitemcd"
                        value={filters4.payitemcd}
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
            <GridTitleContainer>
              <GridTitle>기본정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick4}
                  themeColor={"primary"}
                  icon="plus"
                  title="행 추가"
                ></Button>
                <Button
                  onClick={onDeleteClick4}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="minus"
                  title="행 삭제"
                ></Button>
                <Button
                  onClick={onSaveClick4}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  title="저장"
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "75vh" }}
              data={process(
                mainDataResult4.data.map((row) => ({
                  ...row,
                  [SELECTED_FIELD]: selectedState4[idGetter4(row)], //선택된 데이터
                })),
                mainDataState4
              )}
              {...mainDataState4}
              onDataStateChange={onMainDataStateChange4}
              //선택 기능
              dataItemKey={DATA_ITEM_KEY4}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "single",
              }}
              onSelectionChange={onSelectionChange4}
              //스크롤 조회 기능
              fixedScroll={true}
              total={mainDataResult4.total}
              skip={page4.skip}
              take={page4.take}
              pageable={true}
              onPageChange={pageChange4}
              //원하는 행 위치로 스크롤 기능
              ref={gridRef4}
              rowHeight={30}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange4}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
              onItemChange={onMainItemChange4}
              cellRender={customCellRender4}
              rowRender={customRowRender4}
              editField={EDIT_FIELD}
            >
              <GridColumn field="rowstatus" title=" " width="50px" />
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList4"].map(
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
                            : comboField.includes(item.fieldName)
                            ? CustomComboBoxCell
                            : checkField.includes(item.fieldName)
                            ? CheckBoxCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0
                            ? mainTotalFooterCell4
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
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

export default HU_A3060W;
