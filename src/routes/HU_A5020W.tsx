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
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
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
import MonthDateCell from "../components/Cells/MonthDateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  getPrsnnumQuery,
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
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import UserMultiWindow from "../components/Windows/CommonWindows/UserMultiWindow";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/HU_A5020W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const dateField = ["payyrmm"];
const requiredField = ["prsnnum", "payyrmm"];
const numberField = ["amt"];
const CommandField = ["prsnnum"];
const CommandField2 = ["files"];
let deletedMainRows: object[] = [];
let targetRowIndex: null | number = null;
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
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
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
  let isInEdit = field == dataItem.inEdit;
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
  };
  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit && dataItem.rowstatus == "N" ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
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
      {render == undefined
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
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
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
      {value}
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
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          modal={true}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
        />
      )}
    </>
  );
};

var height = 0;
var height2 = 0;

const HU_A5020W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A5020W", setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setWebHeight(getDeviceHeight(true) - height - height2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  //FormContext받은 데이터 state
  const [prsnnm, setPrsnnm] = useState<string>("");
  const [prsnnum, setPrsnnum] = useState<string>("");
  const [attdatnum, setAttdatnum] = useState<string>("");
  const [files, setFiles] = useState<string>("");
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_A5020W", setMessagesData);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        isSearch: true,
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
      setDptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const [UserMultiWindowVisible, setUserMultiWindowVisible] =
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
    orgdiv: sessionOrgdiv,
    location: "",
    payyrmm: new Date(),
    prsnnum: "",
    prsnnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
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
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
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

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        // find_row_value 행 선택, find_row_value 없는 경우 첫번째 행 선택
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

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  let gridRef: any = useRef(null);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  //그리드 리셋
  const resetAllGrid = () => {
    deletedMainRows = [];
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
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
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
      if (convertDateToStr(filters.payyrmm).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "HU_A5020W_001");
      } else {
        deletedMainRows = [];
        resetAllGrid();
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
          find_row_value: "",
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
      field == "attdatnum" ||
      (field == "payyrmm" && dataItem.rowstatus == "N") ||
      (field == "prsnnum" && dataItem.rowstatus == "N")
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
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
      if (editedField == "prsnnum") {
        mainDataResult.data.map(
          async (item: { [x: string]: any; prsnnum: any }) => {
            if (editIndex == item[DATA_ITEM_KEY]) {
              const prsnnum = await fetchPrsnnumData(item.prsnnum);
              if (prsnnum != null && prsnnum != undefined) {
                const newData = mainDataResult.data.map((item) =>
                  item[DATA_ITEM_KEY] ==
                  Object.getOwnPropertyNames(selectedState)[0]
                    ? {
                        ...item,
                        prsnnum: prsnnum.prsnnum,
                        prsnnm: prsnnum.prsnnm,
                        postcd: prsnnum.postcd,
                        dptcd: prsnnum.dptcd,
                        rowstatus: item.rowstatus == "N" ? "N" : "U",
                        [EDIT_FIELD]: undefined,
                      }
                    : {
                        ...item,
                        [EDIT_FIELD]: undefined,
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
              } else {
                const newData = mainDataResult.data.map((item) =>
                  item[DATA_ITEM_KEY] ==
                  Object.getOwnPropertyNames(selectedState)[0]
                    ? {
                        ...item,
                        rowstatus: item.rowstatus == "N" ? "N" : "U",
                        prsnnm: "",
                        postcd: "",
                        dptcd: "",
                        [EDIT_FIELD]: undefined,
                      }
                    : {
                        ...item,
                        [EDIT_FIELD]: undefined,
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
              }
            }
          }
        );
      } else {
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
      }
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

  const fetchPrsnnumData = async (prsnnum: string) => {
    if (!permissions.view) return;
    if (prsnnum == "") return;
    let data: any;
    let prsnnumInfo: any = null;

    const queryStr = getPrsnnumQuery(prsnnum);
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

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      if (rows.length > 0) {
        prsnnumInfo = {
          prsnnum: rows[0].prsnnum,
          prsnnm: rows[0].prsnnm,
          postcd: rows[0].postcd,
          dptcd: rows[0].dptcd,
        };
      }
    }

    return prsnnumInfo;
  };

  const onSaveClick = () => {
    if (!permissions.save) return;
    let valid = true;
    try {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
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
        if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
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
          dataArr.payyrmm_s.push(
            payyrmm == "99991231" ? "" : payyrmm.substring(0, 6)
          );
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
          dataArr.payyrmm_s.push(
            payyrmm == "99991231" ? "" : payyrmm.substring(0, 6)
          );
          dataArr.prsnnum_s.push(prsnnum);
          dataArr.dptcd_s.push(dptcd);
          dataArr.amt_s.push(amt);
          dataArr.remark_s.push(remark);
          dataArr.attdatnum_s.push(attdatnum);
          setDeletedAttadatnums((prev) => [...prev, item.attdatnum]);
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
    orgdiv: sessionOrgdiv,
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
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      let array: any[] = [];

      deletedMainRows.map((item: any) => {
        array.push(item.attdatnum);
      });
      setDeletedAttadatnums(array);

      setUnsavedName([]);
      setUnsavedAttadatnums([]);

      setParaData({
        pgSize: PAGE_SIZE,
        workType: "N",
        orgdiv: sessionOrgdiv,
        location: filters.location,
        rowstatus_s: "",
        payyrmm_s: "",
        prsnnum_s: "",
        dptcd_s: "",
        amt_s: "",
        remark_s: "",
        attdatnum_s: "",
      });

      deletedMainRows = [];
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("전월내역이 존재하지 않거나 중복되는 사번이 존재합니다.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (
      (ParaData.rowstatus_s != "" || ParaData.workType == "COPY") &&
      permissions.save
    ) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

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
      amt: 0,
      attdatnum: "",
      dptcd: "",
      files: "",
      location: "",
      orgdiv: sessionOrgdiv,
      payyrmm: convertDateToStr(new Date()),
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
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  const onUserWndClick = () => {
    setuserWindowVisible(true);
  };

  const onUserMultiWndClick = () => {
    setUserMultiWindowVisible(true);
  };

  const setUserData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };

  const setUserMultiData = (data: IPrsnnumMulti[]) => {
    data.map((item) => {
      mainDataResult.data.map((item) => {
        if (item.num > temp2) {
          temp2 = item.num;
        }
      });
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp2,
        amt: 0,
        attdatnum: "",
        dptcd: item.dptcd,
        files: "",
        location: "",
        orgdiv: sessionOrgdiv,
        payyrmm: convertDateToStr(new Date()),
        prsnnm: item.prsnnm,
        prsnnum: item.prsnnum,
        remark: "",
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

  //FormContext 데이터 set
  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            prsnnm: prsnnm,
            prsnnum: prsnnum,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
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
    const datas2 = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    if (datas2 != undefined) {
      if (datas2.attdatnum == "") {
        setUnsavedAttadatnums((prev) => [...prev, attdatnum]);
      }
    }

    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            attdatnum: attdatnum,
            files: files,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
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
  }, [attdatnum, files]);

  const onCopyClick = () => {
    if (!permissions.save) return;
    if (!window.confirm("전월복사를 하시겠습니까?")) {
      return false;
    }
    setParaData((prev) => ({
      ...prev,
      workType: "COPY",
      payyrmm_s: convertDateToStr(
        new Date(filters.payyrmm.getMonth() - 1)
      ).slice(0, 6),
    }));
  };

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage({
      ...event.page,
    });
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A5020W"
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
                    onClick={onUserWndClick}
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
      {isMobile ? (
        <GridContainer style={{ width: "100%", overflow: "auto" }}>
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
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>기본정보</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    onClick={onUserMultiWndClick}
                    icon="folder-open"
                    disabled={permissions.save ? false : true}
                  >
                    일괄등록
                  </Button>
                  <Button
                    themeColor={"primary"}
                    onClick={onCopyClick}
                    icon="copy"
                    disabled={permissions.save ? false : true}
                  >
                    전월복사
                  </Button>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                    disabled={permissions.save ? false : true}
                  ></Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                    disabled={permissions.save ? false : true}
                  ></Button>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                    disabled={permissions.save ? false : true}
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="퇴직연금"
              >
                <Grid
                  style={{ height: mobileheight }}
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
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
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
                    customOptionData.menuCustomColumnOptions["grdList"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
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
                                item.sortOrder == 0
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
            </FormContext2.Provider>
          </FormContext.Provider>
        </GridContainer>
      ) : (
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
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>기본정보</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    onClick={onUserMultiWndClick}
                    icon="folder-open"
                    disabled={permissions.save ? false : true}
                  >
                    일괄등록
                  </Button>
                  <Button
                    themeColor={"primary"}
                    onClick={onCopyClick}
                    icon="copy"
                    disabled={permissions.save ? false : true}
                  >
                    전월복사
                  </Button>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                    disabled={permissions.save ? false : true}
                  ></Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                    disabled={permissions.save ? false : true}
                  ></Button>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                    disabled={permissions.save ? false : true}
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="퇴직연금"
              >
                <Grid
                  style={{ height: webheight }}
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
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
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
                    customOptionData.menuCustomColumnOptions["grdList"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
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
                                item.sortOrder == 0
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
            </FormContext2.Provider>
          </FormContext.Provider>
        </GridContainer>
      )}

      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
      {UserMultiWindowVisible && (
        <UserMultiWindow
          setVisible={setUserMultiWindowVisible}
          setData={setUserMultiData}
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

export default HU_A5020W;
