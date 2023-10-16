import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  createContext,
  useContext,
} from "react";
import * as ReactDOM from "react-dom";
import { IAttachmentData } from "../hooks/interfaces";
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
} from "@progress/kendo-react-grid";
import { useRecoilState } from "recoil";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import PrsnnumMultiWindow from "../components/Windows/CommonWindows/UserMultiWindow";
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
  ButtonInGridInput,
} from "../CommonStyled";
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  UseBizComponent,
  UsePermissions,
  handleKeyPressSearch,
  UseParaPc,
  UseGetValueFromSessionItem,
  UseCustomOption,
  getGridItemChangedData,
  findMessage,
  UseMessages,
  getQueryFromBizComponent,
  GetPropertyValueByName,
} from "../components/CommonFunction";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import {
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
} from "../components/CommonString";
import TopButtons from "../components/Buttons/TopButtons";
import { useSetRecoilState } from "recoil";
import { isLoading,  deletedAttadatnumsState,
  unsavedAttadatnumsState,
  loginResultState, } from "../store/atoms";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { gridList } from "../store/columns/HU_A5020W_C";
import { Button } from "@progress/kendo-react-buttons";
import { bytesToBase64 } from "byte-base64";
import NumberCell from "../components/Cells/NumberCell";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import MonthDateCell from "../components/Cells/MonthDateCell";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const dateField = ["payyrmm"];
const requiredField = ["prsnnum", "payyrmm"];
const numberField = ["amt"];
const CommandField = ["prsnnum"];
const CommandField2 = ["files"];
let deletedMainRows: object[] = [];

type TdataArr = {
  rowstatus_s: string[];
  payyrmm_s: string[];
  prsnnum_s: string[];
  dptcd_s: string[];
  amt_s: string[];
  remark_s: string[];
  attdatnum_s: string[];
};

interface IPrsnnum {
  user_id: string;
  user_name: string;
}

interface IPrsnnumMulti {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}
let temp = 0;
let temp2 = 0;
export const FormContext = createContext<{
  prsnnum: string;
  prsnnm: string;
  setPrsnnum: (d: any) => void;
  setPrsnnm: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext2 = createContext<{
  attdatnum: string;
  files: string;
  setAttdatnum: (d: any) => void;
  setFiles: (d: any) => void;
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
    setPrsnnm(data.user_name);
    setPrsnnum(data.user_id);
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
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType={"FILTER"}
          setData={setPrsnnumData}
          modal={true}
        />
      )}
    </>
  );
};
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
  const { setAttdatnum, setFiles } = useContext(FormContext2);
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
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum(data.attdatnum);
    setFiles(
      data.original_name +
        (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : "")
    );
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
          type={"button"}
          onClick={onAttWndClick2}
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
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
        />
      )}
    </>
  );
};

const HU_A5020W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //FormContext받은 데이터 state
  const [prsnnm, setPrsnnm] = useState<string>("");
  const [prsnnum, setPrsnnum] = useState<string>("");
  const [attdatnum, setAttdatnum] = useState<string>("");
  const [files, setFiles] = useState<string>("");
  const [deletedAttadatnums, setDeletedAttadatnums] = useRecoilState(
    deletedAttadatnumsState
  );
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
    // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
    const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
      unsavedAttadatnumsState
    );
  
  const pathname: string = window.location.pathname.replace("/", "");

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query");

      setFilters((prev) => ({
        ...prev,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_dptcd_001", setBizComponentData);
  //부서

  //공통코드 리스트 조회 ()
  const [dptcdListData, setDptcdListData] = React.useState([
    { dptcd: "", dptnm: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );

      fetchQuery(dptcdQueryStr, setDptcdListData);
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

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [prsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);

  const [prsnnumMultiWindowVisible, setPrsnnumMultiWindowVisible] =
    useState<boolean>(false);

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
    work_type: "LIST",
    orgdiv: "01",
    location: "",
    payyrmm: new Date(),
    prsnnum: "",
    prsnnm: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_HU_A5020W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.work_type,
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_prsnnm": filters.prsnnm,
      "@p_prsnnum": filters.prsnnum,
      "@p_payyrmm": convertDateToStr(filters.payyrmm).substring(0, 6),
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
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));
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
        }
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

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

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
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

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (customOptionData != null && filters.isSearch && permissions !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  const search = () => {
    deletedMainRows = [];
    try {
      if (convertDateToStr(filters.payyrmm).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "HU_A5020W_001");
      } else {
        resetAllGrid();
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
      field == "attdatnum" ||
      (field == "payyrmm" && dataItem.rowstatus == "N") ||
      (field == "prsnnum" && dataItem.rowstatus == "N")
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
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
        if (
          item.payyrmm == undefined ||
          item.payyrmm == null ||
          item.payyrmm == ""
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
        payyrmm_s: [],
        prsnnum_s: [],
        dptcd_s: [],
        amt_s: [],
        remark_s: [],
        attdatnum_s: [],
      };

      if (valid == true) {
        if (dataItem.length === 0 && deletedMainRows.length == 0) return false;
        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            payyrmm = "",
            prsnnum = "",
            dptcd = "",
            amt = "",
            remark = "",
            attdatnum = "",
          } = item;
          dataArr.rowstatus_s.push(rowstatus);
          if (typeof payyrmm == "string") {
            dataArr.payyrmm_s.push(payyrmm);
          } else {
            dataArr.payyrmm_s.push(convertDateToStr(payyrmm));
          }
          dataArr.prsnnum_s.push(prsnnum);
          dataArr.dptcd_s.push(dptcd);
          dataArr.amt_s.push(amt);
          dataArr.remark_s.push(remark);
          dataArr.attdatnum_s.push(attdatnum);
        });
        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            payyrmm = "",
            prsnnum = "",
            dptcd = "",
            amt = "",
            remark = "",
            attdatnum = "",
          } = item;
          dataArr.rowstatus_s.push(rowstatus);
          if (typeof payyrmm == "string") {
            dataArr.payyrmm_s.push(payyrmm);
          } else {
            dataArr.payyrmm_s.push(convertDateToStr(payyrmm));
          }
          dataArr.prsnnum_s.push(prsnnum);
          dataArr.dptcd_s.push(dptcd);
          dataArr.amt_s.push(amt);
          dataArr.remark_s.push(remark);
          dataArr.attdatnum_s.push(attdatnum);
          setDeletedAttadatnums((prev)=> ([
            ...prev,
            item.attdatnum
          ]));
        });
        setParaData((prev) => ({
          ...prev,
          workType: "N",
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          payyrmm_s: dataArr.payyrmm_s.join("|"),
          prsnnum_s: dataArr.prsnnum_s.join("|"),
          dptcd_s: dataArr.dptcd_s.join("|"),
          amt_s: dataArr.amt_s.join("|"),
          remark_s: dataArr.remark_s.join("|"),
          attdatnum_s: dataArr.attdatnum_s.join("|"),
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
    location: filters.location,
    rowstatus_s: "",
    payyrmm_s: "",
    prsnnum_s: "",
    dptcd_s: "",
    amt_s: "",
    remark_s: "",
    attdatnum_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A5020W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_payyrmm_s": ParaData.payyrmm_s,
      "@p_prsnnum_s": ParaData.prsnnum_s,
      "@p_dptcd_s": ParaData.dptcd_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_attdatnum_s": ParaData.attdatnum_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A5020W",
      "@p_company_code": companyCode,
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
        location: filters.location,
        rowstatus_s: "",
        payyrmm_s: "",
        prsnnum_s: "",
        dptcd_s: "",
        amt_s: "",
        remark_s: "",
        attdatnum_s: "",
      });
      setUnsavedAttadatnums([]);
      setDeletedAttadatnums([]);
      deletedMainRows = [];
      resetAllGrid();
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
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };

        deletedMainRows.push(newData2);
      }
    });
    setMainDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));
    setMainDataState({});
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if(item.num > temp){
        temp = item.num
      }
  })
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      amt: 0,
      attdatnum: "",
      dptcd: "",
      files: "",
      location: "",
      orgdiv: "01",
      payyrmm: new Date(),
      prsnnm: "",
      prsnnum: "",
      remark: "",
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };

  const onPrsnnumMultiWndClick = () => {
    setPrsnnumMultiWindowVisible(true);
  };

  const setPrsnnumData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.user_id,
      prsnnm: data.user_name,
    }));
  };

  const setPrsnnumMultiData = (data: IPrsnnumMulti[]) => {
    data.map((item) => {
      mainDataResult.data.map((item) => {
        if(item.num > temp2){
          temp2 = item.num
        }
    })
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp2,
        amt: 0,
        attdatnum: "",
        dptcd: item.dptcd,
        files: "",
        location: "",
        orgdiv: "01",
        payyrmm: new Date(),
        prsnnm: item.prsnnum,
        prsnnum: item.prsnnm,
        remark: "",
        rowstatus: "N",
      };

      setMainDataResult((prev) => {
        return {
            data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
    });
  };

  //FormContext 데이터 set
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

  //FormContext 데이터 set
  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            attdatnum: attdatnum,
            files: files,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setUnsavedAttadatnums((prev)=> ([
      ...prev,
      attdatnum
    ]));
    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [attdatnum, files]);

  const onCopyClick = () => {
    if (!window.confirm("전월복사를 하시겠습니까?")) {
      return false;
    }
    setParaData((prev) => ({
      ...prev,
      workType: "COPY",
    }));
  };

  return (
    <>
      <TitleContainer>
        <Title>퇴직연금</Title>

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
                    onClick={onPrsnnumWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>사용자 이름</th>
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
          <FormContext2.Provider
            value={{
              attdatnum,
              files,
              setAttdatnum,
              setFiles,
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
                    fillMode="outline"
                    onClick={onPrsnnumMultiWndClick}
                    icon="folder-open"
                  >
                    일괄등록
                  </Button>
                  <Button
                    themeColor={"primary"}
                    fillMode="outline"
                    onClick={onCopyClick}
                    icon="copy"
                  >
                    전월복사
                  </Button>
                  <Button
                    onClick={onAddClick}
                    fillMode="outline"
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
                    dptcd: dptcdListData.find(
                      (item: any) => item.dptcd === row.dptcd
                    )?.dptnm,
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
                              : CommandField.includes(item.fieldName)
                              ? ColumnCommandCell
                              : CommandField2.includes(item.fieldName)
                              ? ColumnCommandCell2
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
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </FormContext2.Provider>
        </FormContext.Provider>
      </GridContainer>
      {prsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType={"FILTER"}
          setData={setPrsnnumData}
        />
      )}
      {prsnnumMultiWindowVisible && (
        <PrsnnumMultiWindow
          setVisible={setPrsnnumMultiWindowVisible}
          setData={setPrsnnumMultiData}
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

export default HU_A5020W;
