import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
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
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInGridInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import YearDateCell from "../components/Cells/YearDateCell";
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
  getQueryFromBizComponent,
  handleKeyPressSearch,
  numberWithCommas,
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
import AmtWindow from "../components/Windows/HU_A4100W_Window";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_A4100W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const dateField = ["yyyy"];
const requiredField = ["yyyy", "Semiannualgb", "prsnnum"];
const numberField = ["amt"];
const CommandField = ["prsnnum"];
const CustomField = ["Semiannualgb"];

let deletedMainRows: object[] = [];

type TdataArr = {
  rowstatus_s: string[];
  yyyy_s: string[];
  Semiannualgb_s: string[];
  prsnnum_s: string[];
  amt_s: string[];
  remark_s: string[];
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
  setPrsnnum: (d: any) => void;
  setPrsnnm: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_HU290T", setBizComponentData);
  //상하반기구분

  const field = props.field ?? "";
  const bizComponentIdVal = field === "Semiannualgb" ? "L_HU290T" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      valueField="code"
      textField="codenm"
      {...props}
    />
  ) : (
    <td />
  );
};
let temp = 0;
let temp2 = 0;
let targetRowIndex: null | number = null;

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
    setPrsnnum,
    setPrsnnm,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext);
  let isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };
  const [prsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);

  const onPrsnnumWndClick = () => {
    if (dataItem["rowstatus"] == "N") {
      setPrsnnumWindowVisible(true);
    } else {
      alert("사번은 수정이 불가합니다.");
    }
  };

  const setPrsnnumData = (data: IPrsnnum) => {
    setPrsnnm(data.prsnnm);
    setPrsnnum(data.prsnnum);
  };
  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onPrsnnumWndClick}
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
      {prsnnumWindowVisible && (
        <UserWindow
          setVisible={setPrsnnumWindowVisible}
          setData={setPrsnnumData}
          modal={true}
        />
      )}
    </>
  );
};

const HU_A4100W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  const [prsnnm, setPrsnnm] = useState<string>("");
  const [prsnnum, setPrsnnum] = useState<string>("");

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
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_A4100W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A4100W", setCustomOptionData);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        prsnnum: defaultOption.find((item: any) => item.id === "prsnnum")
          .valueCode,
        Semiannualgb: defaultOption.find(
          (item: any) => item.id === "Semiannualgb"
        ).valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_sysUserMaster_001", setBizComponentData);
  //사용자

  //공통코드 리스트 조회 ()
  const [userListData, setUserListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );

      fetchQuery(userQueryStr, setUserListData);
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

  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });

  const [tempState, setTempState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [amtWindowVisible, setAmtWindowVisible] = useState<boolean>(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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
    work_type: "Q",
    orgdiv: "01",
    yyyy: new Date(),
    Semiannualgb: "",
    prsnnum: "",
    remark: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchGrid = async () => {
   //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters2: Iparameters = {
      procedureName: "P_HU_A4100W_Q",
      pageNumber: 1,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "MULTI",
        "@p_orgdiv": filters.orgdiv,
        "@p_Semiannualgb": filters.Semiannualgb,
        "@p_remark": filters.remark,
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnum_s": "",
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
      },
    };

    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
      //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A4100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_Semiannualgb": filters.Semiannualgb,
        "@p_remark": filters.remark,
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnum_s": "",
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
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
            (row: any) =>
              row.semiannualgb + "-" + row.prsnnum == filters.find_row_value
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
            : rows.find(
                (row: any) =>
                  row.semiannualgb + "-" + row.prsnnum == filters.find_row_value
              );

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

  let gridRef: any = useRef(null);
  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
      fetchGrid();
    }
  }, [filters, permissions]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
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

  const search = () => {
    try {
      if (convertDateToStr(filters.yyyy).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "HU_A4100W_001");
      } else {
        deletedMainRows = [];
        resetAllGrid();
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
    if (
      field == "amt" ||
      field == "remark" ||
      (field == "yyyy" && dataItem.rowstatus == "N") ||
      (field == "Semiannualgb" && dataItem.rowstatus == "N") ||
      (field == "prsnnum" && dataItem.rowstatus == "N")
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

  const onSaveClick = () => {
    let valid = true;
    try {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.map((item) => {
        if (item.yyyy == undefined || item.yyyy == null || item.yyyy == "") {
          valid = false;
        }
        if (
          item.Semiannualgb == undefined ||
          item.Semiannualgb == null ||
          item.Semiannualgb == ""
        ) {
          valid = false;
        }
        if (
          item.prsnnum == undefined ||
          item.prsnnum == null ||
          item.prsnnum == ""
        ) {
          valid = false;
        }
      });
      let dataArr: TdataArr = {
        rowstatus_s: [],
        yyyy_s: [],
        Semiannualgb_s: [],
        prsnnum_s: [],
        amt_s: [],
        remark_s: [],
      };

      if (valid == true) {
        if (dataItem.length === 0 && deletedMainRows.length == 0) return false;
        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            yyyy = "",
            prsnnum = "",
            Semiannualgb = "",
            amt = "",
            remark = "",
          } = item;
          dataArr.rowstatus_s.push(rowstatus);
          if (typeof yyyy == "string") {
            dataArr.yyyy_s.push(yyyy);
          } else {
            dataArr.yyyy_s.push(convertDateToStr(yyyy).substring(0, 4));
          }
          dataArr.prsnnum_s.push(prsnnum);
          dataArr.Semiannualgb_s.push(Semiannualgb);
          dataArr.amt_s.push(amt);
          dataArr.remark_s.push(remark);
        });
        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            yyyy = "",
            prsnnum = "",
            Semiannualgb = "",
            amt = "",
            remark = "",
          } = item;
          dataArr.rowstatus_s.push(rowstatus);
          if (typeof yyyy == "string") {
            dataArr.yyyy_s.push(yyyy);
          } else {
            dataArr.yyyy_s.push(convertDateToStr(yyyy).substring(0, 4));
          }
          dataArr.prsnnum_s.push(prsnnum);
          dataArr.Semiannualgb_s.push(Semiannualgb);
          dataArr.amt_s.push(amt);
          dataArr.remark_s.push(remark);
        });
        setParaData((prev) => ({
          ...prev,
          workType: "N",
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          yyyy_s: dataArr.yyyy_s.join("|"),
          prsnnum_s: dataArr.prsnnum_s.join("|"),
          Semiannualgb_s: dataArr.Semiannualgb_s.join("|"),
          amt_s: dataArr.amt_s.join("|"),
          remark_s: dataArr.remark_s.join("|"),
        }));
      } else {
        alert("필수항목을 채워주세요.");
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: "01",
    rowstatus_s: "",
    yyyy_s: "",
    prsnnum_s: "",
    Semiannualgb_s: "",
    amt_s: "",
    remark_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A4100W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_yyyy_s": ParaData.yyyy_s,
      "@p_prsnnum_s": ParaData.prsnnum_s,
      "@p_Semiannualgb_s": ParaData.Semiannualgb_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A4100W",
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
        workType: "N",
        orgdiv: "01",
        rowstatus_s: "",
        yyyy_s: "",
        prsnnum_s: "",
        Semiannualgb_s: "",
        amt_s: "",
        remark_s: "",
      });
      deletedMainRows = [];
      if (mainDataResult.data.length == 0) {
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: prev.pgNum == 0 || prev.pgNum == 1 ? 1 : prev.pgNum - 1,
          isSearch: true,
        }));
      } else {
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("전월내역이 존재하지 않거나 중복되는 사번이 존재합니다.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s != "" || ParaData.workType == "COPY") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

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
    //newData 생성
    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      Semiannualgb: "1",
      amt: 0,
      orgdiv: "01",
      prsnnm: "",
      prsnnum: "",
      remark: "",
      yyyy: new Date(),
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  const onAmtWndClick = () => {
    if (filters.Semiannualgb == "") {
      alert("상/하반기 구분을 선택해주세요.");
    } else {
      setAmtWindowVisible(true);
    }
  };

  const setAmtData = (data: number) => {
    mainDataResult2.data.map((item) => {
      mainDataResult.data.map((item) => {
        if (item.num > temp2) {
          temp2 = item.num;
        }
      });
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp2,
        Semiannualgb: filters.Semiannualgb,
        amt: data,
        orgdiv: "01",
        prsnnm: item.prsnnm,
        prsnnum: item.prsnnum,
        remark: "",
        yyyy: new Date(),
        rowstatus: "N",
      };

      setMainDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setPage((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 1,
      }));
      setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    });
  };

  //FormContext로 받아온 데이터 set
  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            prsnnm: prsnnm,
            prsnnum: prsnnum,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [prsnnm, prsnnum]);

  return (
    <>
      <TitleContainer>
        <Title>복지포인트등록</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A4100W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>기준년도</th>
              <td>
                <DatePicker
                  name="yyyy"
                  value={filters.yyyy}
                  format="yyyy"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={YearCalendar}
                />
              </td>
              <th>상/하반기</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="Semiannualgb"
                    value={filters.Semiannualgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="codenm"
                    valueField="code"
                  />
                )}
              </td>
              <th>사원명</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prsnnum"
                    value={filters.prsnnum}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="prsnnm"
                    valueField="prsnnum"
                  />
                )}
              </td>
              <th>비고</th>
              <td>
                <Input
                  name="remark"
                  type="text"
                  value={filters.remark}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      <GridContainer>
        <FormContext.Provider
          value={{
            prsnnum,
            prsnnm,
            setPrsnnum,
            setPrsnnm,
            mainDataState,
            setMainDataState,
            // fetchGrid,
          }}
        >
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
                  onClick={onAmtWndClick}
                  icon="folder-open"
                >
                  일괄등록
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
              style={{ height: "78vh" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  rowstatus:
                    row.rowstatus == "" ||
                    row.rowstatus == "N1" ||
                    row.rowstatus == "U1"
                      ? ""
                      : row.rowstatus,
                  insert_userid: userListData.find(
                    (item: any) => item.user_id === row.insert_userid
                  )?.user_name,
                  update_userid: userListData.find(
                    (item: any) => item.user_id === row.update_userid
                  )?.user_name,
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
              onSelectionChange={onMainSelectionChange}
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
                            ? YearDateCell
                            : CommandField.includes(item.fieldName)
                            ? ColumnCommandCell
                            : CustomField.includes(item.fieldName)
                            ? CustomComboBoxCell
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
        </FormContext.Provider>
      </GridContainer>
      {amtWindowVisible && (
        <AmtWindow
          setVisible={setAmtWindowVisible}
          setData={setAmtData}
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

export default HU_A4100W;
