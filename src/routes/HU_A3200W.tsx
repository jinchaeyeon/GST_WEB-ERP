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
import { Input } from "@progress/kendo-react-inputs";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import MonthDateCell from "../components/Cells/MonthDateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  dateformat,
  findMessage,
  getGridItemChangedData,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_A3200W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
let temp = 0;
let deletedMainRows: object[] = [];
const comboField = ["dptcd"];
const numberField = ["anuamt", "hiramt", "medamt", "safetyamt"];
const dateField = ["payyrmm"];
const requiredField = ["payyrmm", "prsnnum"];
const commendField = ["prsnnum"];

type TdataArr = {
  rowstatus_s: string[];
  payyrmm_s: string[];
  prsnnum_s: string[];
  dptcd_s: string[];
  location_s: string[];
  postcd_s: string[];
  anuamt_s: string[];
  hiramt_s: string[];
  medamt_s: string[];
  safetyamt_s: string[];
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_dptcd_001", setBizComponentData);
  //보고서구분, 그룹구분, 그룹특성, 품목계정, 내수구분

  const field = props.field ?? "";
  const bizComponentIdVal = field === "dptcd" ? "L_dptcd_001" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );
  const textField = field == "dptcd" ? "dptnm" : "code_name";
  const valueField = field == "dptcd" ? "dptcd" : "sub_code";

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

interface IPrsnnum {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}

export const FormContext = createContext<{
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  setPrsnnum: (d: any) => void;
  setPrsnnm: (d: any) => void;
  setDptcd: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

const ColumnCommandCell = (props: GridCellProps) => {
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
    prsnnum,
    prsnnm,
    dptcd,
    setPrsnnum,
    setPrsnnm,
    setDptcd,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext);
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
    setPrsnnm(data.prsnnm);
    setPrsnnum(data.prsnnum);
    setDptcd(data.dptcd);
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

const HU_A3200W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_A3200W", setMessagesData);
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A3200W", setCustomOptionData);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  let gridRef: any = useRef(null);
  const [prsnnm, setPrsnnm] = useState<string>("");
  const [prsnnum, setPrsnnum] = useState<string>("");
  const [dptcd, setDptcd] = useState<string>("");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");

  //FormContext로 받아온 데이터 set
  useEffect(() => {
    if (prsnnum != "") {
      const newData = mainDataResult.data.map((item) =>
        item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
          ? {
              ...item,
              prsnnm: prsnnm,
              prsnnum: prsnnum,
              dptcd: dptcd,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
            }
          : {
              ...item,
            }
      );
      setTempResult((prev) => {
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
      setPrsnnum("");
      setPrsnnm("");
      setDptcd("");
    }
  }, [prsnnm, prsnnum, dptcd]);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        payyrmm: setDefaultDate(customOptionData, "payyrmm"),
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "기본정보";
      _export.save(optionsGridOne);
    }
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
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

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.payyrmm).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "HU_A3200W_001");
      } else {
        resetAllGrid();
        deletedMainRows = [];
        setFilters((prev) => ({
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

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    orgdiv: "01",
    payyrmm: new Date(),
    prsnnum: "",
    prsnnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);
  const onUserWndClick = () => {
    setuserWindowVisible(true);
  };

  interface IPrsnnum {
    prsnnum: string;
    prsnnm: string;
    dptcd: string;
    abilcd: string;
    postcd: string;
  }

  const setUserData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A3200W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_payyrmm": convertDateToStr(filters.payyrmm).substring(0, 6),
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
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
            (row: any) => row.prsnnum == filters.find_row_value
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
            : rows.find((row: any) => row.prsnnum == filters.find_row_value);

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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && customOptionData !== null && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, customOptionData, permissions]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
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

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
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

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
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

    if (dataItem.rowstatus != "N" && field == "payyrmm") {
      valid = false;
    }

    if (
      field != "rowstatus" &&
      field != "prsnnm" &&
      field != "dptcd" &&
      valid == true
    ) {
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

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      anuamt: 0,
      dptcd: "",
      hiramt: 0,
      location: "",
      medamt: 0,
      orgdiv: "01",
      payyrmm: convertDateToStr(filters.payyrmm),
      postcd: "",
      prsnnm: "",
      prsnnum: "",
      safetyamt: 0,
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult((prev) => {
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
          const newData2 = item;
          newData2.rowstatus = "D";
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

  const onSaveClick = () => {
    let valid = true;

    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    dataItem.map((item) => {
      if (
        item.prsnnum == "" ||
        item.payyrmm == "" ||
        item.payyrmm == null ||
        item.payyrmm == undefined
      ) {
        valid = false;
      }
    });

    if (valid != true) {
      alert("필수 값을 채워주세요.");
      return false;
    }

    if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

    let dataArr: TdataArr = {
      rowstatus_s: [],
      payyrmm_s: [],
      prsnnum_s: [],
      dptcd_s: [],
      location_s: [],
      postcd_s: [],
      anuamt_s: [],
      hiramt_s: [],
      medamt_s: [],
      safetyamt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        payyrmm = "",
        prsnnum = "",
        dptcd = "",
        location = "",
        postcd = "",
        anuamt = "",
        hiramt = "",
        medamt = "",
        safetyamt = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.payyrmm_s.push(payyrmm.substring(0, 6));
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.dptcd_s.push(dptcd);
      dataArr.location_s.push(location);
      dataArr.postcd_s.push(postcd);
      dataArr.anuamt_s.push(anuamt);
      dataArr.hiramt_s.push(hiramt);
      dataArr.medamt_s.push(medamt);
      dataArr.safetyamt_s.push(safetyamt);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        payyrmm = "",
        prsnnum = "",
        dptcd = "",
        location = "",
        postcd = "",
        anuamt = "",
        hiramt = "",
        medamt = "",
        safetyamt = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.payyrmm_s.push(payyrmm.substring(0, 6));
      dataArr.prsnnum_s.push(prsnnum);
      dataArr.dptcd_s.push(dptcd);
      dataArr.location_s.push(location);
      dataArr.postcd_s.push(postcd);
      dataArr.anuamt_s.push(anuamt);
      dataArr.hiramt_s.push(hiramt);
      dataArr.medamt_s.push(medamt);
      dataArr.safetyamt_s.push(safetyamt);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "N",
      orgdiv: "01",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      payyrmm_s: dataArr.payyrmm_s.join("|"),
      prsnnum_s: dataArr.prsnnum_s.join("|"),
      dptcd_s: dataArr.dptcd_s.join("|"),
      location_s: dataArr.location_s.join("|"),
      postcd_s: dataArr.postcd_s.join("|"),
      anuamt_s: dataArr.anuamt_s.join("|"),
      hiramt_s: dataArr.hiramt_s.join("|"),
      medamt_s: dataArr.medamt_s.join("|"),
      safetyamt_s: dataArr.safetyamt_s.join("|"),
    }));
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    rowstatus_s: "",
    payyrmm_s: "",
    prsnnum_s: "",
    dptcd_s: "",
    location_s: "",
    postcd_s: "",
    anuamt_s: "",
    hiramt_s: "",
    medamt_s: "",
    safetyamt_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A3200W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,

      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_payyrmm_s": paraData.payyrmm_s,
      "@p_prsnnum_s": paraData.prsnnum_s,
      "@p_dptcd_s": paraData.dptcd_s,
      "@p_location_s": paraData.location_s,
      "@p_postcd_s": paraData.postcd_s,
      "@p_anuamt_s": paraData.anuamt_s,
      "@p_hiramt_s": paraData.hiramt_s,
      "@p_medamt_s": paraData.medamt_s,
      "@p_safetyamt_s": paraData.safetyamt_s,

      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A3080W",
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
      deletedMainRows = [];

      resetAllGrid();

      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: 1,
        isSearch: true,
      }));

      setParaData({
        workType: "",
        orgdiv: "01",
        rowstatus_s: "",
        payyrmm_s: "",
        prsnnum_s: "",
        dptcd_s: "",
        location_s: "",
        postcd_s: "",
        anuamt_s: "",
        hiramt_s: "",
        medamt_s: "",
        safetyamt_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  return (
    <>
      <TitleContainer>
        <Title>사회보험고지내역</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A3200W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>급여년월</th>
              <td>
                <DatePicker
                  name="payyrmm"
                  value={filters.payyrmm}
                  format="yyyy-MM"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={MonthCalendar}
                />
              </td>
              <th>사번</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onUserWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>성명</th>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <FormContext.Provider
        value={{
          prsnnum,
          prsnnm,
          dptcd,
          setPrsnnum,
          setPrsnnm,
          setDptcd,
          mainDataState,
          setMainDataState,
          // fetchGrid,
        }}
      >
        <GridContainer>
          <GridTitleContainer>
            <GridTitle>기본정보</GridTitle>
            <ButtonContainer>
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
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
            fileName="사회보험고지내역"
          >
            <Grid
              style={{ height: "80vh" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  payyrmm: row.payyrmm
                    ? new Date(dateformat(row.payyrmm))
                    : new Date(dateformat("99991231")),
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
                            : dateField.includes(item.fieldName)
                            ? MonthDateCell
                            : comboField.includes(item.fieldName)
                            ? CustomComboBoxCell
                            : commendField.includes(item.fieldName)
                            ? ColumnCommandCell
                            : undefined
                        }
                        headerCell={
                          requiredField.includes(item.fieldName)
                            ? RequiredHeader
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0
                            ? mainTotalFooterCell
                            : numberField.includes(item.fieldName)
                            ? editNumberFooterCell
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </ExcelExport>
        </GridContainer>
      </FormContext.Provider>
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
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

export default HU_A3200W;
