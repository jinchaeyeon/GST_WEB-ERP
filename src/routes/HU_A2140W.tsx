import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import {
  Checkbox,
  Input,
  InputChangeEvent,
} from "@progress/kendo-react-inputs";
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
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
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
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ApprovalWindow from "../components/Windows/CommonWindows/ApprovalWindow";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import HU_A2140W_Window from "../components/Windows/HU_A2140W_Window";
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
import { gridList } from "../store/columns/HU_A2140W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];
let temp = 0;
let targetRowIndex: null | number = null;
const DateField = ["recdt", "startdate", "enddate", "stddt"];
const CustomComboField = ["stddiv"];
const commandField = ["files"];
const requiredField = ["stddt", "stddiv"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_HU089", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "stddiv" ? "L_HU089" : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

export const FormContext = createContext<{
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
  const { setAttdatnum, setFiles } = useContext(FormContext);
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
          name="itemcd"
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
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
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
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
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
          para={dataItem.attdatnum}
          permission={{
            upload: false,
            download: permissions.view,
            delete: false,
          }}
          modal={true}
        />
      )}
    </>
  );
};

type TdataArr = {
  rowstatus_s: string[];
  recdt_s: string[];
  seq_s: string[];
  stddt_s: string[];
  stddiv_s: string[];
  prsnnum_s: string[];
  location_s: string[];
  dptcd_s: string[];
  postcd_s: string[];
  startdate_s: string[];
  enddate_s: string[];
  shh_s: string[];
  smm_s: string[];
  ehh_s: string[];
  emm_s: string[];
  remark_s: string[];
  attdatnum_s: string[];
};

var height = 0;
var height2 = 0;

const HU_A2140W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

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

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const [loginResult] = useRecoilState(loginResultState);
  const postcd = UseGetValueFromSessionItem("postcd");
  const dptcd = UseGetValueFromSessionItem("dptcd");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const userId = loginResult ? loginResult.userId : "";
  const userName = loginResult ? loginResult.userName : "";
  const companyCode = loginResult ? loginResult.companyCode : "";
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  let gridRef: any = useRef(null);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        dtgb: defaultOption.find((item: any) => item.id == "dtgb")?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_HU089,L_dptcd_001,L_HU005,L_APPSTS", setBizComponentData);
  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [appynListData, setAppynListData] = useState([{ code: "", name: "" }]);
  const [stddivListData, setStddivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setpostcdListData(getBizCom(bizComponentData, "L_HU005"));
      setdptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
      setAppynListData(getBizCom(bizComponentData, "L_APPSTS"));
      setStddivListData(getBizCom(bizComponentData, "L_HU089"));
    }
  }, [bizComponentData]);

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

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [detailWindowVisible2, setDetailWindowVisible2] =
    useState<boolean>(false);

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
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: "",
    dtgb: "",
    frdt: new Date(),
    todt: new Date(),
    prsnnum: "",
    prsnnm: "",
    stddiv: "",
    dptcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [workType, setWorkType] = useState("N");

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A2140W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_stddiv": filters.stddiv,
        "@p_company_code": companyCode,
        "@p_dptcd": filters.dptcd,
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
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        expenseno: item.recdt + "-" + item.seq,
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.recdt + "-" + row.seq == filters.find_row_value
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
            : rows.find(
                (row: any) =>
                  row.recdt + "-" + row.seq == filters.find_row_value
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

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "HU_A2140W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "HU_A2140W_001");
      } else if (
        filters.dtgb == "" ||
        filters.dtgb == undefined ||
        filters.dtgb == null
      ) {
        throw findMessage(messagesData, "HU_A2140W_002");
      } else {
        resetAllGrid();
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

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
  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
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
  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );
  const enterEdit = (dataItem: any, field: string) => {
    if (
      field != "rowstatus" &&
      field != "appyn" &&
      field != "prsnnum" &&
      field != "prsnnm" &&
      field != "postcd" &&
      field != "dptcd"
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
  const enterEdit2 = (dataItem: any, field: string) => {};
  const exitEdit2 = () => {};

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values2,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const [attdatnum, setAttdatnum] = useState<string>("");
  const [files, setFiles] = useState<string>("");

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
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
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

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      Simbol1: ":",
      Simbol2: "~",
      Simbol3: ":",
      appyn: "",
      appynnm: "",
      attdatnum: "",
      chk: "",
      dptcd: dptcd,
      ehh: "00",
      emm: "00",
      enddate: convertDateToStr(new Date()),
      files: "",
      orgdiv: sessionOrgdiv,
      postcd: postcd,
      prsnnm: userName,
      prsnnum: userId,
      recdt: convertDateToStr(new Date()),
      remark: "",
      resdt: "",
      restime: "",
      seq: 0,
      shh: "00",
      smm: "00",
      startdate: convertDateToStr(new Date()),
      stddiv: "",
      stddt: convertDateToStr(new Date()),
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

  const onAddClick2 = () => {
    setWorkType("N");
    setDetailWindowVisible2(true);
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
    //newData 생성
    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onCopyClick = () => {
    const data = mainDataResult.data.filter((item) => item.chk == true);

    if (data.length == 0) {
      alert("체크된 행이 없습니다.");
    } else {
      mainDataResult.data.map((item) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });

      data.map((item) => {
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          Simbol1: item.Simbol1,
          Simbol2: item.Simbol2,
          Simbol3: item.Simbol3,
          appyn: item.appyn,
          appynnm: item.appynnm,
          attdatnum: "",
          chk: "",
          dptcd: item.dptcd,
          ehh: item.ehh,
          emm: item.emm,
          enddate: item.enddate,
          files: "",
          orgdiv: item.orgdiv,
          postcd: item.postcd,
          prsnnm: item.prsnnm,
          prsnnum: item.prsnnum,
          recdt: convertDateToStr(new Date()),
          remark: item.remark,
          resdt: "99991231",
          restime: item.restime,
          seq: item.seq,
          shh: item.shh,
          smm: item.smm,
          startdate: item.startdate,
          stddiv: item.stddiv,
          stddt: convertDateToStr(new Date()),
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
    }
  };

  const onCopyClick2 = () => {
    if (mainDataResult.total > 0) {
      const data = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      if (data.prsnnum != userId) {
        alert("신청자가 달라 복사가 불가능합니다.");
      } else {
        setWorkType("C");
        setDetailWindowVisible2(true);
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "N",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    rowstatus_s: "",
    recdt_s: "",
    seq_s: "",
    stddt_s: "",
    stddiv_s: "",
    prsnnum_s: "",
    location_s: "",
    dptcd_s: "",
    postcd_s: "",
    startdate_s: "",
    enddate_s: "",
    shh_s: "",
    smm_s: "",
    ehh_s: "",
    emm_s: "",
    remark_s: "",
    attdatnum_s: "",
    recdt: "",
    seq: 0,
    userid: userId,
    pc: pc,
    form_id: "HU_A2140W",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A2140W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_recdt_s": ParaData.recdt_s,
      "@p_seq_s": ParaData.seq_s,
      "@p_stddt_s": ParaData.stddt_s,
      "@p_stddiv_s": ParaData.stddiv_s,
      "@p_prsnnum_s": ParaData.prsnnum_s,
      "@p_location_s": ParaData.location_s,
      "@p_dptcd_s": ParaData.dptcd_s,
      "@p_postcd_s": ParaData.postcd_s,
      "@p_startdate_s": ParaData.startdate_s,
      "@p_enddate_s": ParaData.enddate_s,
      "@p_shh_s": ParaData.shh_s,
      "@p_smm_s": ParaData.smm_s,
      "@p_ehh_s": ParaData.ehh_s,
      "@p_emm_s": ParaData.emm_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_attdatnum_s": ParaData.attdatnum_s,
      "@p_recdt": ParaData.recdt,
      "@p_seq": ParaData.seq,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A2140W",
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
      const isLastDataDeleted =
        mainDataResult.data.length == 0 && filters.pgNum > 0;
      let array: any[] = [];
      setValues2(false);
      deletedMainRows.map((item: any) => {
        array.push(item.attdatnum);
      });
      setDeletedAttadatnums(array);

      setUnsavedName([]);
      setUnsavedAttadatnums([]);

      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted
            ? prev.pgNum != 1
              ? prev.pgNum - 1
              : prev.pgNum
            : prev.pgNum,
          isSearch: true,
        }));
      } else {
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: prev.pgNum,
          isSearch: true,
        }));
      }
      setParaData({
        workType: "N",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        rowstatus_s: "",
        recdt_s: "",
        seq_s: "",
        stddt_s: "",
        stddiv_s: "",
        prsnnum_s: "",
        location_s: "",
        dptcd_s: "",
        postcd_s: "",
        startdate_s: "",
        enddate_s: "",
        shh_s: "",
        smm_s: "",
        ehh_s: "",
        emm_s: "",
        remark_s: "",
        attdatnum_s: "",
        recdt: "",
        seq: 0,
        userid: userId,
        pc: pc,
        form_id: "HU_A2140W",
      });
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  const onSaveClick = async () => {
    if (!permissions.save) return;
    let valid = true;
    let valid2 = true;
    let valid3 = true;
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

    dataItem.map((item) => {
      if (item.prsnnum != userId) {
        valid = false;
      }
      if (item.stddt == "") {
        valid3 = false;
      }
      if (item.stddiv == "") {
        valid3 = false;
      }
      if (!isNaN(item.shh) == false || item.shh.length != 2) {
        valid2 = false;
      } else {
        if (item.shh > 24 || item.shh < 0) {
          valid2 = false;
        }
      }
      if (!isNaN(item.smm) == false || item.smm.length != 2) {
        valid2 = false;
      } else {
        if (item.smm > 60 || item.smm < 0) {
          valid2 = false;
        }
      }
      if (!isNaN(item.ehh) == false || item.ehh.length != 2) {
        valid2 = false;
      } else {
        if (item.ehh > 24 || item.ehh < 0) {
          valid2 = false;
        }
      }
      if (!isNaN(item.emm) == false || item.emm.length != 2) {
        valid2 = false;
      } else {
        if (item.emm > 60 || item.emm < 0) {
          valid2 = false;
        }
      }
    });

    deletedMainRows.map((item: any) => {
      if (item.prsnnum != userId) {
        valid = false;
      }
    });

    if (valid != true) {
      alert("본인이 아니면 수정, 삭제가 불가능합니다.");
      return false;
    }
    if (valid3 != true) {
      alert("필수값을 채워주세요.");
      return false;
    }
    let dataArr: TdataArr = {
      rowstatus_s: [],
      recdt_s: [],
      seq_s: [],
      stddt_s: [],
      stddiv_s: [],
      prsnnum_s: [],
      location_s: [],
      dptcd_s: [],
      postcd_s: [],
      startdate_s: [],
      enddate_s: [],
      shh_s: [],
      smm_s: [],
      ehh_s: [],
      emm_s: [],
      remark_s: [],
      attdatnum_s: [],
    };
    if (valid2 == true) {
      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          recdt = "",
          seq = "",
          stddt = "",
          stddiv = "",
          prsnnum = "",
          location = "",
          dptcd = "",
          postcd = "",
          startdate = "",
          enddate = "",
          shh = "",
          smm = "",
          ehh = "",
          emm = "",
          remark = "",
          attdatnum = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.recdt_s.push(recdt == "99991231" ? "" : recdt);
        dataArr.seq_s.push(seq);
        dataArr.stddt_s.push(stddt == "99991231" ? "" : stddt);
        dataArr.stddiv_s.push(stddiv);
        dataArr.prsnnum_s.push(prsnnum);
        dataArr.location_s.push(location);
        dataArr.dptcd_s.push(dptcd);
        dataArr.postcd_s.push(postcd);
        dataArr.startdate_s.push(startdate == "99991231" ? "" : startdate);
        dataArr.enddate_s.push(enddate == "99991231" ? "" : enddate);
        dataArr.shh_s.push(shh);
        dataArr.smm_s.push(smm);
        dataArr.ehh_s.push(ehh);
        dataArr.emm_s.push(emm);
        dataArr.remark_s.push(remark);
        dataArr.attdatnum_s.push(attdatnum);
      });
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          recdt = "",
          seq = "",
          stddt = "",
          stddiv = "",
          prsnnum = "",
          location = "",
          dptcd = "",
          postcd = "",
          startdate = "",
          enddate = "",
          shh = "",
          smm = "",
          ehh = "",
          emm = "",
          remark = "",
          attdatnum = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.recdt_s.push(recdt == "99991231" ? "" : recdt);
        dataArr.seq_s.push(seq);
        dataArr.stddt_s.push(stddt == "99991231" ? "" : stddt);
        dataArr.stddiv_s.push(stddiv);
        dataArr.prsnnum_s.push(prsnnum);
        dataArr.location_s.push(location);
        dataArr.dptcd_s.push(dptcd);
        dataArr.postcd_s.push(postcd);
        dataArr.startdate_s.push(startdate == "99991231" ? "" : startdate);
        dataArr.enddate_s.push(enddate == "99991231" ? "" : enddate);
        dataArr.shh_s.push(shh);
        dataArr.smm_s.push(smm);
        dataArr.ehh_s.push(ehh);
        dataArr.emm_s.push(emm);
        dataArr.remark_s.push(remark);
        dataArr.attdatnum_s.push(attdatnum);
      });

      setParaData({
        workType: "N",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        recdt_s: dataArr.recdt_s.join("|"),
        seq_s: dataArr.seq_s.join("|"),
        stddt_s: dataArr.stddt_s.join("|"),
        stddiv_s: dataArr.stddiv_s.join("|"),
        prsnnum_s: dataArr.prsnnum_s.join("|"),
        location_s: dataArr.location_s.join("|"),
        dptcd_s: dataArr.dptcd_s.join("|"),
        postcd_s: dataArr.postcd_s.join("|"),
        startdate_s: dataArr.startdate_s.join("|"),
        enddate_s: dataArr.enddate_s.join("|"),
        shh_s: dataArr.shh_s.join("|"),
        smm_s: dataArr.smm_s.join("|"),
        ehh_s: dataArr.ehh_s.join("|"),
        emm_s: dataArr.emm_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
        attdatnum_s: dataArr.attdatnum_s.join("|"),
        recdt: "",
        seq: 0,
        userid: userId,
        pc: pc,
        form_id: "HU_A2140W",
      });
    } else {
      alert("시간 형식을 맞춰주세요.(ex. 09 )");
    }
  };

  const onCheckClick = () => {
    if (mainDataResult.total > 0) {
      const selectRow = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      if (selectRow.rowstatus == "N") {
        alert("저장 후 다시 시도해주세요.");
      } else if (selectRow.prsnnum != userId) {
        alert("본인만 결재요청 할 수 있습니다.");
      } else {
        if (selectRow.appyn == "") {
          setDetailWindowVisible(true);
        } else {
          alert("해당 자료는 이미 결재가 진행 중이거나 완료 된 건입니다.");
        }
      }
    } else {
      alert("데이터가 없습니다.");
    }
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
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>
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
            <tr>
              <th>근태구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="stddiv"
                    value={filters.stddiv}
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
                  />
                )}
              </td>
              <th>부서</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      {isMobile ? (
        <>
          <FormContext.Provider
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
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer">
                <ButtonContainer>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    icon="file-add"
                    disabled={permissions.save ? false : true}
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onCopyClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="copy"
                    disabled={permissions.save ? false : true}
                  >
                    복사
                  </Button>
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
                fileName={getMenuName()}
              >
                <Grid
                  style={{
                    height: mobileheight,
                  }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      dptcd: dptcdListData.find(
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
                      postcd: postcdListData.find(
                        (item: any) => item.sub_code == row.postcd
                      )?.code_name,
                      appyn: appynListData.find(
                        (item: any) => item.code == row.appyn
                      )?.name,
                      stddiv: stddivListData.find(
                        (item: any) => item.sub_code == row.stddiv
                      )?.code_name,
                      enddate: row.enddate
                        ? new Date(dateformat(row.enddate))
                        : new Date(dateformat("99991231")),
                      recdt: row.recdt
                        ? new Date(dateformat(row.recdt))
                        : new Date(dateformat("99991231")),
                      startdate: row.startdate
                        ? new Date(dateformat(row.startdate))
                        : new Date(dateformat("99991231")),
                      stddt: row.stddt
                        ? new Date(dateformat(row.stddt))
                        : new Date(dateformat("99991231")),
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
                  onItemChange={onMainItemChange}
                  cellRender={customCellRender2}
                  rowRender={customRowRender2}
                  editField={EDIT_FIELD}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                DateField.includes(item.fieldName)
                                  ? DateCell
                                  : commandField.includes(item.fieldName)
                                  ? ColumnCommandCell2 //추후 작업
                                  : undefined
                              }
                              headerCell={
                                requiredField.includes(item.fieldName)
                                  ? RequiredHeader
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 1
                                  ? mainTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </FormContext.Provider>
        </>
      ) : (
        <GridContainer style={{ width: "100%", overflow: "auto" }}>
          <GridTitleContainer className="ButtonContainer">
            <ButtonContainer>
              <Button
                onClick={onCheckClick}
                themeColor={"primary"}
                icon="track-changes-accept"
                disabled={permissions.save ? false : true}
              >
                결재
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
                themeColor={"primary"}
                fillMode="outline"
                onClick={onCopyClick}
                icon="copy"
                title="행 복사"
                disabled={permissions.save ? false : true}
              />
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
            fileName={getMenuName()}
          >
            <Grid
              style={{
                height: webheight,
              }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  rowstatus:
                    row.rowstatus == null ||
                    row.rowstatus == "" ||
                    row.rowstatus == undefined
                      ? ""
                      : row.rowstatus,
                  dptcd: dptcdListData.find(
                    (item: any) => item.dptcd == row.dptcd
                  )?.dptnm,
                  postcd: postcdListData.find(
                    (item: any) => item.sub_code == row.postcd
                  )?.code_name,
                  appyn: appynListData.find(
                    (item: any) => item.code == row.appyn
                  )?.name,
                  enddate: row.enddate
                    ? new Date(dateformat(row.enddate))
                    : new Date(dateformat("99991231")),
                  recdt: row.recdt
                    ? new Date(dateformat(row.recdt))
                    : new Date(dateformat("99991231")),
                  startdate: row.startdate
                    ? new Date(dateformat(row.startdate))
                    : new Date(dateformat("99991231")),
                  stddt: row.stddt
                    ? new Date(dateformat(row.stddt))
                    : new Date(dateformat("99991231")),
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
              onItemChange={onMainItemChange}
              cellRender={customCellRender}
              rowRender={customRowRender}
              editField={EDIT_FIELD}
            >
              <GridColumn field="rowstatus" title=" " width="50px" />
              <GridColumn
                field="chk"
                title=" "
                width="45px"
                headerCell={CustomCheckBoxCell2}
                cell={CheckBoxCell}
              />
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList"]
                  ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                  ?.map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          id={item.id}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            DateField.includes(item.fieldName)
                              ? DateCell
                              : CustomComboField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : commandField.includes(item.fieldName)
                              ? ColumnCommandCell //추후 작업
                              : undefined
                          }
                          headerCell={
                            requiredField.includes(item.fieldName)
                              ? RequiredHeader
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 1
                              ? mainTotalFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
            </Grid>
          </ExcelExport>
        </GridContainer>
      )}
      {detailWindowVisible && (
        <ApprovalWindow
          setVisible={setDetailWindowVisible}
          para={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0] != undefined
              ? mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0]
              : ""
          }
          pgmgb="W"
          setData={(str) => {
            resetAllGrid();
            setFilters((prev) => ({
              ...prev,
              find_row_value: str,
              isSearch: true,
            }));
          }}
          modal={true}
        />
      )}
      {detailWindowVisible2 && (
        <HU_A2140W_Window
          workType={workType}
          setVisible={setDetailWindowVisible2}
          para={
            workType == "N"
              ? null
              : mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0]
          }
          reload={(str) => {
            resetAllGrid();
            setFilters((prev) => ({
              ...prev,
              find_row_value: str,
              isSearch: true,
            }));
          }}
          modal={true}
        />
      )}
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

export default HU_A2140W;
