import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
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
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInGridInput,
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
import NumberCell from "../components/Cells/NumberCell";
import {
  UseBizComponent,
  UseCustomOption,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  getGridItemChangedData,
  getMonPayQuery,
  getQueryFromBizComponent,
  numberWithCommas,
  useSysMessage,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/HU_A3040W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

type TdataArr = {
  rowstatus_s: string[];
  insutype_s: string[];
  prsnnum_s: string[];
  insurat_s: string[];
  insuamt_s: string[];
  stdamt_s: string[];
  careamt_s: string[];
  insudt_s: string[];
};

interface IPrsnnum {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}

export const FormContext2 = createContext<{
  prsnnum2: string;
  prsnnm2: string;
  dptcd2: string;
  setPrsnnum2: (d: any) => void;
  setPrsnnm2: (d: any) => void;
  setDptcd2: (d: any) => void;
  mainDataState2: State;
  setMainDataState2: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext4 = createContext<{
  prsnnum4: string;
  prsnnm4: string;
  dptcd4: string;
  setPrsnnum4: (d: any) => void;
  setPrsnnm4: (d: any) => void;
  setDptcd4: (d: any) => void;
  mainDataState4: State;
  setMainDataState4: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext6 = createContext<{
  prsnnum6: string;
  prsnnm6: string;
  dptcd6: string;
  setPrsnnum6: (d: any) => void;
  setPrsnnm6: (d: any) => void;
  setDptcd6: (d: any) => void;
  mainDataState6: State;
  setMainDataState6: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

const ColumnCommandCell2 = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const {
    prsnnum2,
    prsnnm2,
    dptcd2,
    setPrsnnum2,
    setPrsnnm2,
    setDptcd2,
    mainDataState2,
    setMainDataState2,
  } = useContext(FormContext2);
  let isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    if (dataItem["rowstatus"] == "N") {
      setuserWindowVisible(true);
    } else {
      alert("사번은 수정이 불가합니다.");
    }
  };

  const setUserData = (data: IPrsnnum) => {
    setPrsnnm2(data.prsnnm);
    setPrsnnum2(data.prsnnum);
    setDptcd2(data.dptcd);
  };
  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {value}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onUserWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
    </>
  );
};

const ColumnCommandCell4 = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const {
    prsnnum4,
    prsnnm4,
    dptcd4,
    setPrsnnum4,
    setPrsnnm4,
    setDptcd4,
    mainDataState4,
    setMainDataState4,
  } = useContext(FormContext4);
  let isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    if (dataItem["rowstatus"] == "N") {
      setuserWindowVisible(true);
    } else {
      alert("사번은 수정이 불가합니다.");
    }
  };

  const setUserData = (data: IPrsnnum) => {
    setPrsnnm4(data.prsnnm);
    setPrsnnum4(data.prsnnum);
    setDptcd4(data.dptcd);
  };
  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {value}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onUserWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
    </>
  );
};

const ColumnCommandCell6 = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const {
    prsnnum6,
    prsnnm6,
    dptcd6,
    setPrsnnum6,
    setPrsnnm6,
    setDptcd6,
    mainDataState6,
    setMainDataState6,
  } = useContext(FormContext6);
  let isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    if (dataItem["rowstatus"] == "N") {
      setuserWindowVisible(true);
    } else {
      alert("사번은 수정이 불가합니다.");
    }
  };

  const setUserData = (data: IPrsnnum) => {
    setPrsnnm6(data.prsnnm);
    setPrsnnum6(data.prsnnum);
    setDptcd6(data.dptcd);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {value}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onUserWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
    </>
  );
};

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
const DATA_ITEM_KEY5 = "num";
const DATA_ITEM_KEY6 = "num";
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;
let targetRowIndex5: null | number = null;
let targetRowIndex6: null | number = null;

const commendField = ["prsnnum"];

const numberField = [
  "stdamt",
  "insurat",
  "insuamt",
  "prsamt",
  "careamt",
  "prscareamt",
  "prstot",
  "empinsurancerat",
  "prsratamt",
  "prstothiramt",
  "prstotamt",
];

const numberField2 = [
  "stdamt",
  "insuamt",
  "prsamt",
  "careamt",
  "prscareamt",
  "prstot",
  "prsratamt",
  "prstothiramt",
  "prstotamt",
];

let deletedMainRows2: object[] = [];
let deletedMainRows4: object[] = [];
let deletedMainRows6: object[] = [];
let temp2 = 0;
let temp4 = 0;
let temp6 = 0;

const HU_A3040W: React.FC = () => {
  const [workType, setWorkType] = useState("");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const idGetter6 = getter(DATA_ITEM_KEY6);
  const [prsnnm2, setPrsnnm2] = useState<string>("");
  const [prsnnum2, setPrsnnum2] = useState<string>("");
  const [dptcd2, setDptcd2] = useState<string>("");
  const [prsnnm4, setPrsnnm4] = useState<string>("");
  const [prsnnum4, setPrsnnum4] = useState<string>("");
  const [dptcd4, setDptcd4] = useState<string>("");
  const [prsnnm6, setPrsnnm6] = useState<string>("");
  const [prsnnum6, setPrsnnum6] = useState<string>("");
  const [dptcd6, setDptcd6] = useState<string>("");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A3040W", setCustomOptionData);
  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const search = () => {
    resetAllGrid();
    setFilters((prev: any) => ({
      ...prev,
      find_row_value: "",
      pgNum: 1,
      isSearch: true,
    }));
    setFilters3((prev: any) => ({
      ...prev,
      find_row_value: "",
      pgNum: 1,
      isSearch: true,
    }));
    setFilters5((prev: any) => ({
      ...prev,
      find_row_value: "",
      pgNum: 1,
      isSearch: true,
    }));
  };

  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_dptcd_001", setBizComponentData);
  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );

      fetchQuery(dptcdQueryStr, setdptcdListData);
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

  const resetAllGrid = () => {
    setWorkType("");
    deletedMainRows2 = [];
    deletedMainRows4 = [];
    deletedMainRows6 = [];
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setPage5(initialPageState);
    setPage6(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    setMainDataResult5(process([], mainDataState5));
    setMainDataResult6(process([], mainDataState6));
    setInformation({
      pnsrat: 0,
      maxprice: 0,
      minprice: 0,
      medrat: 0,
      medrat2: 0,
      empinsurancerat: 0,
      pnsprvrat: 0,
      medprvrat: 0,
    });
  };

  const [Information, setInformation] = useState({
    pnsrat: 0,
    maxprice: 0,
    minprice: 0,
    medrat: 0,
    medrat2: 0,
    empinsurancerat: 0,
    pnsprvrat: 0,
    medprvrat: 0,
  });

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [tabSelected, setTabSelected] = React.useState(0);

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
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
  const [mainDataState4, setMainDataState4] = useState<State>({
    sort: [],
  });
  const [mainDataState5, setMainDataState5] = useState<State>({
    sort: [],
  });
  const [mainDataState6, setMainDataState6] = useState<State>({
    sort: [],
  });

  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });

  const [tempState4, setTempState4] = useState<State>({
    sort: [],
  });

  const [tempState6, setTempState6] = useState<State>({
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
  const [mainDataResult4, setMainDataResult4] = useState<DataResult>(
    process([], mainDataState4)
  );
  const [mainDataResult5, setMainDataResult5] = useState<DataResult>(
    process([], mainDataState5)
  );
  const [mainDataResult6, setMainDataResult6] = useState<DataResult>(
    process([], mainDataState6)
  );

  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );

  const [tempResult4, setTempResult4] = useState<DataResult>(
    process([], tempState4)
  );

  const [tempResult6, setTempResult6] = useState<DataResult>(
    process([], tempState6)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState4, setSelectedState4] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState5, setSelectedState5] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState6, setSelectedState6] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
  const onMainDataStateChange4 = (event: GridDataStateChangeEvent) => {
    setMainDataState4(event.dataState);
  };
  const onMainDataStateChange5 = (event: GridDataStateChangeEvent) => {
    setMainDataState5(event.dataState);
  };
  const onMainDataStateChange6 = (event: GridDataStateChangeEvent) => {
    setMainDataState6(event.dataState);
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
  //그리드 푸터
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
  //그리드 푸터
  const mainTotalFooterCell5 = (props: GridFooterCellProps) => {
    var parts = mainDataResult5.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult5.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell6 = (props: GridFooterCellProps) => {
    var parts = mainDataResult6.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult6.total == -1
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

  //그리드 정렬 이벤트
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange4 = (e: any) => {
    setMainDataState4((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 정렬 이벤트
  const onMainSortChange5 = (e: any) => {
    setMainDataState5((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange6 = (e: any) => {
    setMainDataState6((prev) => ({ ...prev, sort: e.sort }));
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

    setFilters2((prev) => ({
      ...prev,
      insudt: selectedRowData.insudt,
      isSearch: true,
      pgNum: 1,
    }));
    setQ((prev) => ({
      ...prev,
      insudt: selectedRowData.insudt,
      isSearch: true,
      pgNum: 1,
    }));
    setWorkType("");
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters4((prev) => ({
      ...prev,
      insudt: selectedRowData.insudt,
      isSearch: true,
      pgNum: 1,
    }));
    setQ((prev) => ({
      ...prev,
      insudt: selectedRowData.insudt,
      isSearch: true,
      pgNum: 1,
    }));
    setWorkType("");
  };

  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });

    setSelectedState4(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange5 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState5,
      dataItemKey: DATA_ITEM_KEY5,
    });

    setSelectedState5(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters6((prev) => ({
      ...prev,
      insudt: selectedRowData.insudt,
      isSearch: true,
      pgNum: 1,
    }));
    setQ((prev) => ({
      ...prev,
      insudt: selectedRowData.insudt,
      isSearch: true,
      pgNum: 1,
    }));
    setWorkType("");
  };

  const onSelectionChange6 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState6,
      dataItemKey: DATA_ITEM_KEY6,
    });

    setSelectedState6(newSelectedState);
  };

  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editIndex2, setEditIndex2] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const [editedField2, setEditedField2] = useState("");

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
  const [page6, setPage6] = useState(initialPageState);

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

  const pageChange5 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters5((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage5({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange6 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters6((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage6({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);
  let gridRef5: any = useRef(null);
  let gridRef6: any = useRef(null);

  //조회조건 초기값
  const [Q, setQ] = useState({
    pgSize: PAGE_SIZE,
    worktype: "Q",
    insudt: "",
    orgdiv: "01",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "AnuList",
    insudt: "",
    rtrchk: "%",
    orgdiv: "01",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    worktype: "ANU",
    insudt: "",
    rtrchk: "%",
    orgdiv: "01",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    worktype: "MedList",
    insudt: "",
    rtrchk: "%",
    orgdiv: "01",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    worktype: "MED",
    insudt: "",
    rtrchk: "%",
    orgdiv: "01",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters5, setFilters5] = useState({
    pgSize: PAGE_SIZE,
    worktype: "HirList",
    insudt: "",
    rtrchk: "%",
    orgdiv: "01",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters6, setFilters6] = useState({
    pgSize: PAGE_SIZE,
    worktype: "HIR",
    insudt: "",
    rtrchk: "%",
    orgdiv: "01",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchQGrid = async (Q: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3060W_RIF_Q",
      pageNumber: Q.pgNum,
      pageSize: Q.pgSize,
      parameters: {
        "@p_work_type": Q.worktype,
        "@p_orgdiv": Q.orgdiv,
        "@p_payyrmm": Q.insudt,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setInformation({
          pnsrat: rows[0].pnsrat,
          maxprice: rows[0].maxprice,
          minprice: rows[0].minprice,
          medrat: rows[0].medrat,
          medrat2: rows[0].medrat2,
          empinsurancerat: rows[0].empinsurancerat,
          pnsprvrat: rows[0].pnsprvrat,
          medprvrat: rows[0].medprvrat,
        });
      } else {
        setInformation({
          pnsrat: 0,
          maxprice: 0,
          minprice: 0,
          medrat: 0,
          medrat2: 0,
          empinsurancerat: 0,
          pnsprvrat: 0,
          medprvrat: 0,
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setQ((prev) => ({
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
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3040W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_insudt": filters.insudt,
        "@p_rtrchk": filters.rtrchk,
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
            (row: any) => row.insudt == filters.find_row_value
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
          filters.find_row_value === ""
            ? rows[0]
            : rows.find((row: any) => row.insudt == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            insudt: selectedRow.insudt,
            isSearch: true,
            pgNum: 1,
          }));
          setQ((prev) => ({
            ...prev,
            insudt: selectedRow.insudt,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            insudt: rows[0].insudt,
            isSearch: true,
            pgNum: 1,
          }));
          setQ((prev) => ({
            ...prev,
            insudt: rows[0].insudt,
            isSearch: true,
            pgNum: 1,
          }));
        }
      } else {
        setPage2(initialPageState);
        setMainDataResult2(process([], mainDataState2));
        setInformation({
          pnsrat: 0,
          maxprice: 0,
          minprice: 0,
          medrat: 0,
          medrat2: 0,
          empinsurancerat: 0,
          pnsprvrat: 0,
          medprvrat: 0,
        });
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
      procedureName: "P_HU_A3040W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.worktype,
        "@p_orgdiv": filters2.orgdiv,
        "@p_insudt": filters2.insudt,
        "@p_rtrchk": filters2.rtrchk,
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
      const rows = data.tables[0].Rows;

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
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
  const fetchMainGrid3 = async (filters3: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3040W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.worktype,
        "@p_orgdiv": filters3.orgdiv,
        "@p_insudt": filters3.insudt,
        "@p_rtrchk": filters3.rtrchk,
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
      const rows = data.tables[0].Rows;

      if (filters3.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.insudt == filters3.find_row_value
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
          filters3.find_row_value === ""
            ? rows[0]
            : rows.find((row: any) => row.insudt == filters3.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState3({ [selectedRow[DATA_ITEM_KEY3]]: true });
          setFilters4((prev) => ({
            ...prev,
            insudt: selectedRow.insudt,
            isSearch: true,
            pgNum: 1,
          }));
          setQ((prev) => ({
            ...prev,
            insudt: selectedRow.insudt,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
          setFilters4((prev) => ({
            ...prev,
            insudt: rows[0].insudt,
            isSearch: true,
            pgNum: 1,
          }));
          setQ((prev) => ({
            ...prev,
            insudt: rows[0].insudt,
            isSearch: true,
            pgNum: 1,
          }));
        }
      } else {
        setPage4(initialPageState);
        setMainDataResult4(process([], mainDataState4));
        setInformation({
          pnsrat: 0,
          maxprice: 0,
          minprice: 0,
          medrat: 0,
          medrat2: 0,
          empinsurancerat: 0,
          pnsprvrat: 0,
          medprvrat: 0,
        });
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
  const fetchMainGrid4 = async (filters4: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3040W_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": filters4.worktype,
        "@p_orgdiv": filters4.orgdiv,
        "@p_insudt": filters4.insudt,
        "@p_rtrchk": filters4.rtrchk,
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
      const rows = data.tables[0].Rows;

      setMainDataResult4((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
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

  //그리드 데이터 조회
  const fetchMainGrid5 = async (filters5: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3040W_Q",
      pageNumber: filters5.pgNum,
      pageSize: filters5.pgSize,
      parameters: {
        "@p_work_type": filters5.worktype,
        "@p_orgdiv": filters5.orgdiv,
        "@p_insudt": filters5.insudt,
        "@p_rtrchk": filters5.rtrchk,
        "@p_find_row_value": filters5.find_row_value,
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

      if (filters5.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef5.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.insudt == filters5.find_row_value
          );
          targetRowIndex5 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage5({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef5.current) {
          targetRowIndex5 = 0;
        }
      }

      setMainDataResult5((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters5.find_row_value === ""
            ? rows[0]
            : rows.find((row: any) => row.insudt == filters5.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState5({ [selectedRow[DATA_ITEM_KEY5]]: true });
          setFilters6((prev) => ({
            ...prev,
            insudt: selectedRow.insudt,
            isSearch: true,
            pgNum: 1,
          }));
          setQ((prev) => ({
            ...prev,
            insudt: selectedRow.insudt,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState5({ [rows[0][DATA_ITEM_KEY5]]: true });
          setFilters6((prev) => ({
            ...prev,
            insudt: rows[0].insudt,
            isSearch: true,
            pgNum: 1,
          }));
          setQ((prev) => ({
            ...prev,
            insudt: rows[0].insudt,
            isSearch: true,
            pgNum: 1,
          }));
        }
      } else {
        setPage6(initialPageState);
        setMainDataResult6(process([], mainDataState6));
        setInformation({
          pnsrat: 0,
          maxprice: 0,
          minprice: 0,
          medrat: 0,
          medrat2: 0,
          empinsurancerat: 0,
          pnsprvrat: 0,
          medprvrat: 0,
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters5((prev) => ({
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
  const fetchMainGrid6 = async (filters6: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3040W_Q",
      pageNumber: filters6.pgNum,
      pageSize: filters6.pgSize,
      parameters: {
        "@p_work_type": filters6.worktype,
        "@p_orgdiv": filters6.orgdiv,
        "@p_insudt": filters6.insudt,
        "@p_rtrchk": filters6.rtrchk,
        "@p_find_row_value": filters6.find_row_value,
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

      setMainDataResult6((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState6({ [rows[0][DATA_ITEM_KEY6]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters6((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

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

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex5 !== null && gridRef5.current) {
      gridRef5.current.scrollIntoView({ rowIndex: targetRowIndex5 });
      targetRowIndex5 = null;
    }
  }, [mainDataResult5]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex6 !== null && gridRef6.current) {
      gridRef6.current.scrollIntoView({ rowIndex: targetRowIndex6 });
      targetRowIndex6 = null;
    }
  }, [mainDataResult6]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (Q.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(Q);
      setQ((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록

      fetchQGrid(deepCopiedFilters);
    }
  }, [Q, permissions]);

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
    if (filters3.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록

      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters4.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록

      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters5.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters5);
      setFilters5((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록

      fetchMainGrid5(deepCopiedFilters);
    }
  }, [filters5, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters6.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters6);
      setFilters6((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록

      fetchMainGrid6(deepCopiedFilters);
    }
  }, [filters6, permissions]);

  const editNumberFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };

  const editNumberFooterCell4 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult4.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };

  const editNumberFooterCell6 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult6.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };

  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
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

  const onMainItemChange6 = (event: GridItemChangeEvent) => {
    setMainDataState6((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult6,
      setMainDataResult6,
      DATA_ITEM_KEY6
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

  const customCellRender4 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit4}
      editField={EDIT_FIELD}
    />
  );

  const customCellRender6 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit6}
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

  const customRowRender4 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit4}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender6 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit6}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit2 = (dataItem: any, field: string) => {
    if (
      field != "rowstatus" &&
      field != "prsnnm" &&
      field != "dptcd" &&
      field != "insurat" &&
      field != "prsamt"
    ) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setEditIndex(dataItem[DATA_ITEM_KEY2]);
      if (field) {
        setEditedField(field);
      }
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit4 = (dataItem: any, field: string) => {
    if (
      field != "rowstatus" &&
      field != "prsnnm" &&
      field != "dptcd" &&
      field != "insurat" &&
      field != "insuamt" &&
      field != "careamt" &&
      field != "prsamt" &&
      field != "prscareamt" &&
      field != "prstot"
    ) {
      const newData = mainDataResult4.data.map((item) =>
        item[DATA_ITEM_KEY4] == dataItem[DATA_ITEM_KEY4]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setEditIndex2(dataItem[DATA_ITEM_KEY4]);
      if (field) {
        setEditedField2(field);
      }
      setTempResult4((prev) => {
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
      setTempResult4((prev) => {
        return {
          data: mainDataResult4.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit6 = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "prsnnm" && field != "dptcd") {
      const newData = mainDataResult6.data.map((item) =>
        item[DATA_ITEM_KEY6] == dataItem[DATA_ITEM_KEY6]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult6((prev) => {
        return {
          data: mainDataResult6.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      if (editedField == "stdamt" || editedField == "insuamt") {
        const newData = mainDataResult2.data.map((item) =>
          item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                insuamt:
                  item.stdamt > Information.maxprice
                    ? (Information.maxprice * Information.pnsrat) / 100
                    : item.stdamt < Information.minprice
                    ? (Information.minprice * Information.pnsrat) / 100
                    : (item.stdamt * Information.pnsrat) / 100,
                prsamt:
                  ((item.stdamt > Information.maxprice
                    ? (Information.maxprice * Information.pnsrat) / 100
                    : item.stdamt < Information.minprice
                    ? (Information.minprice * Information.pnsrat) / 100
                    : (item.stdamt * Information.pnsrat) / 100) *
                    Information.pnsprvrat) /
                  100,
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setTempResult2((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
        setMainDataResult2((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else {
        const newData = mainDataResult2.data.map((item) =>
          item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
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

        setTempResult2((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
        setMainDataResult2((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      }
    } else {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit4 = () => {
    if (tempResult4.data != mainDataResult4.data) {
      if (editedField2 == "stdamt") {
        const newData = mainDataResult4.data.map((item) =>
          item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState4)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                insuamt:
                  Math.trunc(
                    (item.stdamt * (Information.medrat / 2 / 100)) / 10
                  ) *
                  10 *
                  2,
                prsamt:
                  Math.trunc(
                    (item.stdamt * (Information.medrat / 2 / 100)) / 10
                  ) *
                  10 *
                  2 *
                  (Information.medprvrat / 100),
                careamt:
                  Math.trunc(
                    (((Math.trunc(
                      (item.stdamt * (Information.medrat / 2 / 100)) / 10
                    ) *
                      10 *
                      2) /
                      2) *
                      Information.medrat2) /
                      100 /
                      10
                  ) *
                  10 *
                  2,
                prscareamt:
                  Math.trunc(
                    (((Math.trunc(
                      (item.stdamt * (Information.medrat / 2 / 100)) / 10
                    ) *
                      10 *
                      2) /
                      2) *
                      Information.medrat2) /
                      100 /
                      10
                  ) *
                  10 *
                  2 *
                  (Information.medprvrat / 100),
                prstot:
                  Math.trunc(
                    (item.stdamt * (Information.medrat / 2 / 100)) / 10
                  ) *
                    10 *
                    2 *
                    (Information.medprvrat / 100) +
                  Math.trunc(
                    (((Math.trunc(
                      (item.stdamt * (Information.medrat / 2 / 100)) / 10
                    ) *
                      10 *
                      2) /
                      2) *
                      Information.medrat2) /
                      100 /
                      10
                  ) *
                    10 *
                    2 *
                    (Information.medprvrat / 100),
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setTempResult4((prev) => {
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
        const newData = mainDataResult4.data.map((item) =>
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

        setTempResult4((prev) => {
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
      }
    } else {
      const newData = mainDataResult4.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult4((prev) => {
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
    }
  };

  const exitEdit6 = () => {
    if (tempResult6.data != mainDataResult6.data) {
      const newData = mainDataResult6.data.map((item) =>
        item[DATA_ITEM_KEY6] == Object.getOwnPropertyNames(selectedState6)[0]
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

      setTempResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult6.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  //FormContext로 받아온 데이터 set
  useEffect(() => {
    if (prsnnum2 != "") {
      fetchMonPayData(prsnnum2, prsnnm2, dptcd2);
      setPrsnnum2("");
      setPrsnnm2("");
      setDptcd2("");
    }
  }, [prsnnm2, prsnnum2, dptcd2]);

  //FormContext로 받아온 데이터 set
  useEffect(() => {
    if (prsnnum4 != "") {
      fetchMonPayData2(prsnnum4, prsnnm4, dptcd4);
      setPrsnnum4("");
      setPrsnnm4("");
      setDptcd4("");
    }
  }, [prsnnm4, prsnnum4, dptcd4]);

  //FormContext로 받아온 데이터 set
  useEffect(() => {
    if (prsnnum6 != "") {
      fetchMonPayData3(prsnnum6, prsnnm6, dptcd6);
      setPrsnnum6("");
      setPrsnnm6("");
      setDptcd6("");
    }
  }, [prsnnm6, prsnnum6, dptcd6]);

  const onAddClick2 = () => {
    const data = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    let date = "";

    if (data == undefined) {
      date = convertDateToStr(new Date());
    } else {
      date = data.insudt;
    }

    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY2]: ++temp2,
      careamt: 0,
      dptcd: "",
      insuamt: 0,
      insudt: date,
      insurat: Information.pnsrat,
      insutype: "1",
      orgdiv: "01",
      prsamt: 0,
      prsnnm: "",
      prsnnum: "",
      stdamt: 0,
      rowstatus: "N",
    };

    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    setPage2((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick4 = () => {
    const data = mainDataResult3.data.filter(
      (item) =>
        item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
    )[0];

    let date = "";

    if (data == undefined) {
      date = convertDateToStr(new Date());
    } else {
      date = data.insudt;
    }

    mainDataResult4.data.map((item) => {
      if (item.num > temp4) {
        temp4 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY4]: ++temp4,
      careamt: 0,
      dptcd: "",
      insuamt: 0,
      insudt: date,
      insurat: Information.medrat,
      insutype: "2",
      orgdiv: "01",
      prsamt: 0,
      prscareamt: 0,
      prsnnm: "",
      prsnnum: "",
      prstot: 0,
      stdamt: 0,
      rowstatus: "N",
    };

    setSelectedState4({ [newDataItem[DATA_ITEM_KEY4]]: true });
    setPage4((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult4((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick6 = () => {
    const data = mainDataResult5.data.filter(
      (item) =>
        item[DATA_ITEM_KEY5] == Object.getOwnPropertyNames(selectedState5)[0]
    )[0];

    let date = "";

    if (data == undefined) {
      date = convertDateToStr(new Date());
    } else {
      date = data.insudt;
    }

    mainDataResult6.data.map((item) => {
      if (item.num > temp6) {
        temp6 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY4]: ++temp6,
      dptcd: "",
      empinsurancerat: Information.empinsurancerat,
      insuamt: 0,
      insudt: date,
      insutype: "3",
      orgdiv: "01",
      prsamt: 0,
      prsnnm: "",
      prsnnum: "",
      prsratamt: 0,
      prstotamt: 0,
      prstothiramt: 0,
      stdamt: 0,
      rowstatus: "N",
    };

    setSelectedState6({ [newDataItem[DATA_ITEM_KEY6]]: true });
    setPage6((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult6((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onDeleteClick2 = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

    mainDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY2]]) {
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
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }

    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState2({
      [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

  const onDeleteClick4 = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

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
    setSelectedState4({
      [data != undefined ? data[DATA_ITEM_KEY4] : newData[0]]: true,
    });
  };

  const onDeleteClick6 = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

    mainDataResult6.data.forEach((item: any, index: number) => {
      if (!selectedState6[item[DATA_ITEM_KEY6]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows6.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult6.data[Math.min(...Object2)];
    } else {
      data = mainDataResult6.data[Math.min(...Object) - 1];
    }

    setMainDataResult6((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState6({
      [data != undefined ? data[DATA_ITEM_KEY6] : newData[0]]: true,
    });
  };

  const onSaveClick2 = () => {
    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows2.length == 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      insutype_s: [],
      prsnnum_s: [],
      insurat_s: [],
      insuamt_s: [],
      stdamt_s: [],
      careamt_s: [],
      insudt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        insutype = "",
        prsnnum = "",
        insurat = "",
        insuamt = "",
        stdamt = "",
        careamt = "",
        insudt = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.insutype_s.push(insutype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.insurat_s.push(insurat);
      dataArr.insuamt_s.push(insuamt);
      dataArr.stdamt_s.push(stdamt);
      dataArr.careamt_s.push(careamt);
      dataArr.insudt_s.push(insudt);
    });
    deletedMainRows2.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        insutype = "",
        prsnnum = "",
        insurat = "",
        insuamt = "",
        stdamt = "",
        careamt = "",
        insudt = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.insutype_s.push(insutype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.insurat_s.push(insurat);
      dataArr.insuamt_s.push(insuamt);
      dataArr.stdamt_s.push(stdamt);
      dataArr.careamt_s.push(careamt);
      dataArr.insudt_s.push(insudt);
    });
    setParaData((prev: any) => ({
      ...prev,
      workType: workType == "N" ? "ANU_N" : "ANU",
      orgdiv: filters.orgdiv,
      insudt: filters2.insudt,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      insutype_s: dataArr.insutype_s.join("|"),
      prsnnum_s: dataArr.prsnnum_s.join("|"),
      insurat_s: dataArr.insurat_s.join("|"),
      insuamt_s: dataArr.insuamt_s.join("|"),
      stdamt_s: dataArr.stdamt_s.join("|"),
      careamt_s: dataArr.careamt_s.join("|"),
      insudt_s: dataArr.insudt_s.join("|"),
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

    let dataArr: TdataArr = {
      rowstatus_s: [],
      insutype_s: [],
      prsnnum_s: [],
      insurat_s: [],
      insuamt_s: [],
      stdamt_s: [],
      careamt_s: [],
      insudt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        insutype = "",
        prsnnum = "",
        insurat = "",
        insuamt = "",
        stdamt = "",
        careamt = "",
        insudt = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.insutype_s.push(insutype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.insurat_s.push(insurat);
      dataArr.insuamt_s.push(insuamt);
      dataArr.stdamt_s.push(stdamt);
      dataArr.careamt_s.push(careamt);
      dataArr.insudt_s.push(insudt);
    });
    deletedMainRows4.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        insutype = "",
        prsnnum = "",
        insurat = "",
        insuamt = "",
        stdamt = "",
        careamt = "",
        insudt = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.insutype_s.push(insutype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.insurat_s.push(insurat);
      dataArr.insuamt_s.push(insuamt);
      dataArr.stdamt_s.push(stdamt);
      dataArr.careamt_s.push(careamt);
      dataArr.insudt_s.push(insudt);
    });
    setParaData((prev: any) => ({
      ...prev,
      workType: workType == "N" ? "MED_N" : "MED",
      orgdiv: filters.orgdiv,
      insudt: filters4.insudt,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      insutype_s: dataArr.insutype_s.join("|"),
      prsnnum_s: dataArr.prsnnum_s.join("|"),
      insurat_s: dataArr.insurat_s.join("|"),
      insuamt_s: dataArr.insuamt_s.join("|"),
      stdamt_s: dataArr.stdamt_s.join("|"),
      careamt_s: dataArr.careamt_s.join("|"),
      insudt_s: dataArr.insudt_s.join("|"),
    }));
  };

  const onSaveClick6 = () => {
    const dataItem = mainDataResult6.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0 && deletedMainRows6.length == 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      insutype_s: [],
      prsnnum_s: [],
      insurat_s: [],
      insuamt_s: [],
      stdamt_s: [],
      careamt_s: [],
      insudt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        insutype = "",
        prsnnum = "",
        empinsurancerat = "",
        insuamt = "",
        stdamt = "",
        insudt = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.insutype_s.push(insutype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.insurat_s.push(empinsurancerat);
      dataArr.insuamt_s.push(insuamt);
      dataArr.stdamt_s.push(stdamt);
      dataArr.careamt_s.push("0");
      dataArr.insudt_s.push(insudt);
    });
    deletedMainRows6.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        insutype = "",
        prsnnum = "",
        empinsurancerat = "",
        insuamt = "",
        stdamt = "",
        insudt = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.insutype_s.push(insutype);
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.insurat_s.push(empinsurancerat);
      dataArr.insuamt_s.push(insuamt);
      dataArr.stdamt_s.push(stdamt);
      dataArr.careamt_s.push("0");
      dataArr.insudt_s.push(insudt);
    });
    setParaData((prev: any) => ({
      ...prev,
      workType: workType == "N" ? "HIR_N" : "HIR",
      orgdiv: filters.orgdiv,
      insudt: filters6.insudt,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      insutype_s: dataArr.insutype_s.join("|"),
      prsnnum_s: dataArr.prsnnum_s.join("|"),
      insurat_s: dataArr.insurat_s.join("|"),
      insuamt_s: dataArr.insuamt_s.join("|"),
      stdamt_s: dataArr.stdamt_s.join("|"),
      careamt_s: dataArr.careamt_s.join("|"),
      insudt_s: dataArr.insudt_s.join("|"),
    }));
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    insudt: "",
    rowstatus_s: "",
    insutype_s: "",
    prsnnum_s: "",
    insurat_s: "",
    insuamt_s: "",
    stdamt_s: "",
    careamt_s: "",
    insudt_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A3040W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_insudt": ParaData.insudt,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_insutype_s": ParaData.insutype_s,
      "@p_prsnnum_s": ParaData.prsnnum_s,
      "@p_insurat_s": ParaData.insurat_s,
      "@p_insuamt_s": ParaData.insuamt_s,
      "@p_stdamt_s": ParaData.stdamt_s,
      "@p_careamt_s": ParaData.careamt_s,
      "@p_insudt_s": ParaData.insudt_s,
      "@p_form_id": "HU_A3040W",
      "@p_userid": userId,
      "@p_pc": pc,
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
      if (ParaData.workType == "D") {
        if (tabSelected == 0) {
          const isLastDataDeleted =
            mainDataResult.data.length === 1 && filters.pgNum > 1;
          const findRowIndex = mainDataResult.data.findIndex(
            (row: any) =>
              row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          );
          if (isLastDataDeleted) {
            setPage({
              skip: PAGE_SIZE * (filters.pgNum - 2),
              take: PAGE_SIZE,
            });
          }

          setFilters((prev) => ({
            ...prev,
            find_row_value:
              mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
              undefined
                ? ""
                : mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                    .insudt,
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
          setFilters3((prev) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
          setFilters5((prev) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
        } else if (tabSelected == 1) {
          const isLastDataDeleted =
            mainDataResult3.data.length === 1 && filters3.pgNum > 1;
          const findRowIndex = mainDataResult3.data.findIndex(
            (row: any) =>
              row[DATA_ITEM_KEY3] ==
              Object.getOwnPropertyNames(selectedState3)[0]
          );
          if (isLastDataDeleted) {
            setPage3({
              skip: PAGE_SIZE * (filters.pgNum - 2),
              take: PAGE_SIZE,
            });
          }

          setFilters3((prev) => ({
            ...prev,
            find_row_value:
              mainDataResult3.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
              undefined
                ? ""
                : mainDataResult3.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                    .insudt,
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
          setFilters((prev) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
          setFilters5((prev) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
        } else if (tabSelected == 2) {
          const isLastDataDeleted =
            mainDataResult5.data.length === 1 && filters5.pgNum > 1;
          const findRowIndex = mainDataResult5.data.findIndex(
            (row: any) =>
              row[DATA_ITEM_KEY5] ==
              Object.getOwnPropertyNames(selectedState5)[0]
          );
          if (isLastDataDeleted) {
            setPage5({
              skip: PAGE_SIZE * (filters.pgNum - 2),
              take: PAGE_SIZE,
            });
          }

          setFilters5((prev) => ({
            ...prev,
            find_row_value:
              mainDataResult5.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
              undefined
                ? ""
                : mainDataResult5.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                    .insudt,
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
          setFilters((prev) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
          setFilters3((prev) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
        }
      } else {
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: 1,
          isSearch: true,
        }));
        setFilters5((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: 1,
          isSearch: true,
        }));
      }
      setParaData({
        workType: "",
        orgdiv: "01",
        insudt: "",
        rowstatus_s: "",
        insutype_s: "",
        prsnnum_s: "",
        insurat_s: "",
        insuamt_s: "",
        stdamt_s: "",
        careamt_s: "",
        insudt_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onNewClick = () => {
    setWorkType("N");
    deletedMainRows2 = [];
    setPage2(initialPageState);
    const newDataItem = {
      [DATA_ITEM_KEY2]: 1,
      careamt: 0,
      dptcd: "",
      insuamt: 0,
      insudt: convertDateToStr(new Date()),
      insurat: Information.pnsrat,
      insutype: "1",
      orgdiv: "01",
      prsamt: 0,
      prsnnm: "",
      prsnnum: "",
      stdamt: 0,
      rowstatus: "N",
    };

    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    setMainDataResult2((prev) => {
      return {
        data: [newDataItem],
        total: 1,
      };
    });
    setFilters2((prev) => ({
      ...prev,
      insudt: convertDateToStr(new Date()),
    }));
  };

  const onNewClick2 = () => {
    setWorkType("N");
    deletedMainRows4 = [];
    setPage4(initialPageState);
    const newDataItem = {
      [DATA_ITEM_KEY4]: 1,
      careamt: 0,
      dptcd: "",
      insuamt: 0,
      insudt: convertDateToStr(new Date()),
      insurat: Information.pnsrat,
      insutype: "2",
      orgdiv: "01",
      prsamt: 0,
      prscareamt: 0,
      prsnnm: "",
      prsnnum: "",
      prstot: 0,
      stdamt: 0,
      rowstatus: "N",
    };

    setSelectedState4({ [newDataItem[DATA_ITEM_KEY4]]: true });
    setMainDataResult4((prev) => {
      return {
        data: [newDataItem],
        total: 1,
      };
    });
    setFilters4((prev) => ({
      ...prev,
      insudt: convertDateToStr(new Date()),
    }));
  };

  const onNewClick3 = () => {
    setWorkType("N");
    deletedMainRows6 = [];
    setPage6(initialPageState);
    const newDataItem = {
      [DATA_ITEM_KEY6]: 1,
      dptcd: "",
      empinsurancerat: Information.empinsurancerat,
      insuamt: 0,
      insudt: convertDateToStr(new Date()),
      insutype: "3",
      orgdiv: "01",
      prsamt: 0,
      prsnnm: "",
      prsnnum: "",
      prsratamt: 0,
      prstotamt: 0,
      prstothiramt: 0,
      stdamt: 0,
      rowstatus: "N",
    };

    setSelectedState6({ [newDataItem[DATA_ITEM_KEY6]]: true });
    setMainDataResult6((prev) => {
      return {
        data: [newDataItem],
        total: 1,
      };
    });
    setFilters6((prev) => ({
      ...prev,
      insudt: convertDateToStr(new Date()),
    }));
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onRemoveClick = () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult.data.length != 0) {
      const selectRows = mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      setParaData((prev) => ({
        ...prev,
        workType: "D",
        insudt: selectRows.insudt,
        insutype_s: "1",
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onRemoveClick2 = () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult3.data.length != 0) {
      const selectRows = mainDataResult3.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState3)[0]
      )[0];
      setParaData((prev) => ({
        ...prev,
        workType: "D",
        insudt: selectRows.insudt,
        insutype_s: "2",
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onRemoveClick3 = () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult5.data.length != 0) {
      const selectRows = mainDataResult5.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState5)[0]
      )[0];
      setParaData((prev) => ({
        ...prev,
        workType: "D",
        insudt: selectRows.insudt,
        insutype_s: "3",
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const fetchMonPayData = React.useCallback(
    async (prsnnum2: string, prsnnm2: string, dptcd2: string) => {
      let data: any;
      const queryStr = getMonPayQuery({ prsnnum: prsnnum2 });
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
        const rowCount = data.tables[0].RowCount;

        if (rowCount > 0) {
          const newData = mainDataResult2.data.map((item) =>
            item.num == parseInt(Object.getOwnPropertyNames(selectedState2)[0])
              ? {
                  ...item,
                  stdamt: rows[0].monpay,
                  insuamt:
                    rows[0].monpay > Information.maxprice
                      ? (Information.maxprice * Information.pnsrat) / 100
                      : rows[0].monpay < Information.minprice
                      ? (Information.minprice * Information.pnsrat) / 100
                      : (rows[0].monpay * Information.pnsrat) / 100,
                  prsamt:
                    ((rows[0].monpay > Information.maxprice
                      ? (Information.maxprice * Information.pnsrat) / 100
                      : rows[0].monpay < Information.minprice
                      ? (Information.minprice * Information.pnsrat) / 100
                      : (rows[0].monpay * Information.pnsrat) / 100) *
                      Information.pnsprvrat) /
                    100,
                  prsnnm: prsnnm2,
                  prsnnum: prsnnum2,
                  dptcd: dptcd2,
                  rowstatus: item.rowstatus === "N" ? "N" : "U",
                }
              : {
                  ...item,
                }
          );
          setTempResult2((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
          setMainDataResult2((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        } else {
          const newData = mainDataResult2.data.map((item) =>
            item.num == parseInt(Object.getOwnPropertyNames(selectedState2)[0])
              ? {
                  ...item,
                  stdamt: 0,
                  prsnnm: prsnnm2,
                  prsnnum: prsnnum2,
                  dptcd: dptcd2,
                  rowstatus: item.rowstatus === "N" ? "N" : "U",
                }
              : {
                  ...item,
                }
          );
          setTempResult2((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
          setMainDataResult2((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [mainDataResult2]
  );

  const fetchMonPayData2 = React.useCallback(
    async (prsnnum4: string, prsnnm4: string, dptcd4: string) => {
      let data: any;
      const queryStr = getMonPayQuery({ prsnnum: prsnnum4 });
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
        const rowCount = data.tables[0].RowCount;

        if (rowCount > 0) {
          const newData = mainDataResult4.data.map((item) =>
            item.num == parseInt(Object.getOwnPropertyNames(selectedState4)[0])
              ? {
                  ...item,
                  stdamt: rows[0].monpay,
                  insuamt:
                    Math.trunc(
                      (rows[0].monpay * (Information.medrat / 2 / 100)) / 10
                    ) *
                    10 *
                    2,
                  prsamt:
                    Math.trunc(
                      (rows[0].monpay * (Information.medrat / 2 / 100)) / 10
                    ) *
                    10 *
                    2 *
                    (Information.medprvrat / 100),
                  careamt:
                    Math.trunc(
                      (((Math.trunc(
                        (rows[0].monpay * (Information.medrat / 2 / 100)) / 10
                      ) *
                        10 *
                        2) /
                        2) *
                        Information.medrat2) /
                        100 /
                        10
                    ) *
                    10 *
                    2,
                  prscareamt:
                    Math.trunc(
                      (((Math.trunc(
                        (rows[0].monpay * (Information.medrat / 2 / 100)) / 10
                      ) *
                        10 *
                        2) /
                        2) *
                        Information.medrat2) /
                        100 /
                        10
                    ) *
                    10 *
                    2 *
                    (Information.medprvrat / 100),
                  prstot:
                    Math.trunc(
                      (rows[0].monpay * (Information.medrat / 2 / 100)) / 10
                    ) *
                      10 *
                      2 *
                      (Information.medprvrat / 100) +
                    Math.trunc(
                      (((Math.trunc(
                        (rows[0].monpay * (Information.medrat / 2 / 100)) / 10
                      ) *
                        10 *
                        2) /
                        2) *
                        Information.medrat2) /
                        100 /
                        10
                    ) *
                      10 *
                      2 *
                      (Information.medprvrat / 100),
                  prsnnm: prsnnm4,
                  prsnnum: prsnnum4,
                  dptcd: dptcd4,
                  rowstatus: item.rowstatus === "N" ? "N" : "U",
                }
              : {
                  ...item,
                }
          );
          setTempResult4((prev) => {
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
          const newData = mainDataResult4.data.map((item) =>
            item.num == parseInt(Object.getOwnPropertyNames(selectedState4)[0])
              ? {
                  ...item,
                  stdamt: 0,
                  prsnnm: prsnnm4,
                  prsnnum: prsnnum4,
                  dptcd: dptcd4,
                  rowstatus: item.rowstatus === "N" ? "N" : "U",
                }
              : {
                  ...item,
                }
          );
          setTempResult4((prev) => {
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
        }
      }
    },
    [mainDataResult4]
  );

  const fetchMonPayData3 = React.useCallback(
    async (prsnnum6: string, prsnnm6: string, dptcd6: string) => {
      let data: any;
      const queryStr = getMonPayQuery({ prsnnum: prsnnum6 });
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
        const rowCount = data.tables[0].RowCount;

        if (rowCount > 0) {
          const newData = mainDataResult6.data.map((item) =>
            item.num == parseInt(Object.getOwnPropertyNames(selectedState6)[0])
              ? {
                  ...item,
                  stdamt: rows[0].monpay,
                  prsnnm: prsnnm6,
                  prsnnum: prsnnum6,
                  dptcd: dptcd6,
                  rowstatus: item.rowstatus === "N" ? "N" : "U",
                }
              : {
                  ...item,
                }
          );
          setTempResult6((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
          setMainDataResult6((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        } else {
          const newData = mainDataResult6.data.map((item) =>
            item.num == parseInt(Object.getOwnPropertyNames(selectedState6)[0])
              ? {
                  ...item,
                  stdamt: 0,
                  prsnnm: prsnnm6,
                  prsnnum: prsnnum6,
                  dptcd: dptcd6,
                  rowstatus: item.rowstatus === "N" ? "N" : "U",
                }
              : {
                  ...item,
                }
          );
          setTempResult6((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
          setMainDataResult6((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [mainDataResult6]
  );

  const onCalculate = () => {
    if (
      !window.confirm(
        "변경된 보험률과 상한액에 의해 각 사원의 보험액이 재계산 됩니다. 처리하시겠습니까?"
      )
    ) {
      return false;
    }

    if (tabSelected == 0) {
      const datas = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      let date = "";
      if (datas == undefined) {
        date = convertDateToStr(new Date());
      } else {
        date = datas.insudt;
      }

      setParaData2({
        workType: "U",
        orgdiv: "01",
        insudt: date,
        medrat: Information.medrat,
        pnsrat: Information.pnsrat,
        medrat2: Information.medrat2,
        maxprice: Information.maxprice,
        minprice: Information.minprice,
      });
    } else {
      const datas = mainDataResult3.data.filter(
        (item) =>
          item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
      )[0];

      let date = "";
      if (datas == undefined) {
        date = convertDateToStr(new Date());
      } else {
        date = datas.insudt;
      }

      setParaData2({
        workType: "U",
        orgdiv: "01",
        insudt: date,
        medrat: Information.medrat,
        pnsrat: Information.pnsrat,
        medrat2: Information.medrat2,
        maxprice: Information.maxprice,
        minprice: Information.minprice,
      });
    }
  };

  const [ParaData2, setParaData2] = useState({
    workType: "",
    orgdiv: "01",
    insudt: "",
    medrat: 0,
    pnsrat: 0,
    medrat2: 0,
    maxprice: 0,
    minprice: 0,
  });

  const para2: Iparameters = {
    procedureName: "P_HU_A3040W_CAL_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData2.workType,
      "@p_orgdiv": ParaData2.orgdiv,
      "@p_insudt": ParaData2.insudt,
      "@p_medrat": ParaData2.medrat,
      "@p_pnsrat": ParaData2.pnsrat,
      "@p_medrat2": ParaData2.medrat2,
      "@p_maxprice": ParaData2.maxprice,
      "@p_minprice": ParaData2.minprice,
      "@p_form_id": "HU_A3040W",
      "@p_userid": userId,
      "@p_pc": pc,
    },
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
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: 1,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: 1,
        isSearch: true,
      }));
      setFilters5((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: 1,
        isSearch: true,
      }));

      setParaData2({
        workType: "",
        orgdiv: "01",
        insudt: "",
        medrat: 0,
        pnsrat: 0,
        medrat2: 0,
        maxprice: 0,
        minprice: 0,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData2.workType != "") {
      fetchTodoGridSaved2();
    }
  }, [ParaData2]);

  return (
    <>
      <TitleContainer>
        <Title>연금보험료</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A3040W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FormBoxWrap border={true}>
        <FormBox>
          <tbody>
            <tr>
              <th>연금보험률</th>
              <td>
                <NumericTextBox
                  name="pnsrat"
                  value={Information.pnsrat}
                  format="n2"
                  onChange={InputChange}
                />
              </td>
              <th>상한액</th>
              <td>
                <NumericTextBox
                  name="maxprice"
                  value={Information.maxprice}
                  format="n0"
                  onChange={InputChange}
                />
              </td>
              <th>하한액</th>
              <td>
                <NumericTextBox
                  name="minprice"
                  value={Information.minprice}
                  format="n0"
                  onChange={InputChange}
                />
              </td>
              <th></th>
            </tr>
            <tr>
              <th>건강보험률</th>
              <td>
                <NumericTextBox
                  name="medrat"
                  value={Information.medrat}
                  format="n2"
                  onChange={InputChange}
                />
              </td>
              <th>요양보험률</th>
              <td>
                <NumericTextBox
                  name="medrat2"
                  value={Information.medrat2}
                  format="n2"
                  onChange={InputChange}
                />
              </td>
              <th>고용보험률</th>
              <td>
                <NumericTextBox
                  name="empinsurancerat"
                  value={Information.empinsurancerat}
                  format="n2"
                  onChange={InputChange}
                />
              </td>
              <th>
                {tabSelected != 2 ? (
                  <Button
                    onClick={onCalculate}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="calculator"
                  >
                    계산
                  </Button>
                ) : (
                  ""
                )}
              </th>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="국민연금">
          <GridContainerWrap>
            <GridContainer width="15%">
              <GridTitleContainer>
                <GridTitle>기준일자</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onNewClick}
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onRemoveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
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
              >
                <Grid
                  style={{ height: "70vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
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
                  <GridColumn
                    field="insudt"
                    cell={DateCell}
                    title="기준일자"
                    width="120px"
                    footerCell={mainTotalFooterCell}
                  />
                </Grid>
              </ExcelExport>
            </GridContainer>
            <FormContext2.Provider
              value={{
                prsnnum2,
                prsnnm2,
                dptcd2,
                setPrsnnum2,
                setPrsnnm2,
                setDptcd2,
                mainDataState2,
                setMainDataState2,
                // fetchGrid,
              }}
            >
              <GridContainer width={`calc(85% - ${GAP}px)`}>
                <GridTitleContainer>
                  <GridTitle>국민연금</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick2}
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
                      onClick={onSaveClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: "70vh" }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      dptcd: dptcdListData.find(
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
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
                  onItemChange={onMainItemChange2}
                  cellRender={customCellRender2}
                  rowRender={customRowRender2}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList2"].map(
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
                                : commendField.includes(item.fieldName)
                                ? ColumnCommandCell2
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell2
                                : numberField2.includes(item.fieldName)
                                ? editNumberFooterCell2
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
            </FormContext2.Provider>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="건강보험">
          <GridContainerWrap>
            <GridContainer width="15%">
              <GridTitleContainer>
                <GridTitle>기준일자</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onNewClick2}
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onRemoveClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                  >
                    삭제
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "70vh" }}
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
                  field="insudt"
                  cell={DateCell}
                  title="기준일자"
                  width="120px"
                  footerCell={mainTotalFooterCell3}
                />
              </Grid>
            </GridContainer>
            <FormContext4.Provider
              value={{
                prsnnum4,
                prsnnm4,
                dptcd4,
                setPrsnnum4,
                setPrsnnm4,
                setDptcd4,
                mainDataState4,
                setMainDataState4,
                // fetchGrid,
              }}
            >
              <GridContainer width={`calc(85% - ${GAP}px)`}>
                <GridTitleContainer>
                  <GridTitle>건강보험</GridTitle>
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
                  style={{ height: "70vh" }}
                  data={process(
                    mainDataResult4.data.map((row) => ({
                      ...row,
                      dptcd: dptcdListData.find(
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
                      [SELECTED_FIELD]: selectedState4[idGetter4(row)],
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
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : commendField.includes(item.fieldName)
                                ? ColumnCommandCell4
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell4
                                : numberField2.includes(item.fieldName)
                                ? editNumberFooterCell4
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
            </FormContext4.Provider>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="고용보험">
          <GridContainerWrap>
            <GridContainer width="15%">
              <GridTitleContainer>
                <GridTitle>기준일자</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onNewClick3}
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onRemoveClick3}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                  >
                    삭제
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "70vh" }}
                data={process(
                  mainDataResult5.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState5[idGetter5(row)],
                  })),
                  mainDataState5
                )}
                {...mainDataState5}
                onDataStateChange={onMainDataStateChange5}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY5}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange5}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult5.total}
                skip={page5.skip}
                take={page5.take}
                pageable={true}
                onPageChange={pageChange5}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef5}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange5}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn
                  field="insudt"
                  cell={DateCell}
                  title="기준일자"
                  width="120px"
                  footerCell={mainTotalFooterCell5}
                />
              </Grid>
            </GridContainer>
            <FormContext6.Provider
              value={{
                prsnnum6,
                prsnnm6,
                dptcd6,
                setPrsnnum6,
                setPrsnnm6,
                setDptcd6,
                mainDataState6,
                setMainDataState6,
                // fetchGrid,
              }}
            >
              <GridContainer width={`calc(85% - ${GAP}px)`}>
                <GridTitleContainer>
                  <GridTitle>고용보험</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick6}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                    ></Button>
                    <Button
                      onClick={onDeleteClick6}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                    ></Button>
                    <Button
                      onClick={onSaveClick6}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: "70vh" }}
                  data={process(
                    mainDataResult6.data.map((row) => ({
                      ...row,
                      dptcd: dptcdListData.find(
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
                      [SELECTED_FIELD]: selectedState6[idGetter6(row)],
                    })),
                    mainDataState6
                  )}
                  {...mainDataState6}
                  onDataStateChange={onMainDataStateChange6}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY6}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange6}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult6.total}
                  skip={page6.skip}
                  take={page6.take}
                  pageable={true}
                  onPageChange={pageChange6}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef6}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange6}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange6}
                  cellRender={customCellRender6}
                  rowRender={customRowRender6}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList6"].map(
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
                                : commendField.includes(item.fieldName)
                                ? ColumnCommandCell6
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell6
                                : numberField2.includes(item.fieldName)
                                ? editNumberFooterCell6
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
            </FormContext6.Provider>
          </GridContainerWrap>
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

export default HU_A3040W;
