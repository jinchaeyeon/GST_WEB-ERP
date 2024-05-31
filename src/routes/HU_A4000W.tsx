import { Button as ButtonMui, Popover, Typography } from "@mui/material";
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
import {
  Input,
  InputChangeEvent,
  NumericTextBox,
  TextArea,
} from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInGridInput,
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
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import MonthDateCell from "../components/Cells/MonthDateCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
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
  getGridItemChangedData,
  getHeight,
  setDefaultDate,
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  heightstate,
  isLoading,
  isMobileState,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/HU_A4000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
var index = 0;

let targetRowIndex: null | number = null;
let targetRowIndex3: null | number = null;
let temp = 0;
let temp2 = 0;
let temp5 = 0;
let temp6 = 0;
let temp7 = 0;
let temp8 = 0;
let temp9 = 0;
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY5 = "num";
const DATA_ITEM_KEY6 = "num";
const DATA_ITEM_KEY7 = "num";
const DATA_ITEM_KEY8 = "num";
const DATA_ITEM_KEY9 = "num";
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];
let deletedMainRows5: object[] = [];
let deletedMainRows6: object[] = [];
let deletedMainRows7: object[] = [];
let deletedMainRows8: object[] = [];

const comboField = [
  "reviewlvl1",
  "dptcd",
  "badcd",
  "person",
  "rnpdiv",
  "title",
];
const requiredField = ["reviewlvl1", "title"];
const checkField = ["commyn"];
const dateField = ["interviewdt", "baddt", "recdt", "reqdt"];
const monthField = ["yyyymm"];
const numberField = ["difficulty"];
const attdatnumField = ["files"];
const lockField = ["reviewlvl1", "title", "contents"];
const today = new Date();
const monthAgo = new Date(today);
monthAgo.setMonth(today.getMonth() - 1);

export const FormContext6 = createContext<{
  attdatnum6: string;
  files6: string;
  setAttdatnum6: (d: any) => void;
  setFiles6: (d: any) => void;
  mainDataState6: State;
  setMainDataState6: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

export const FormContext7 = createContext<{
  attdatnum7: string;
  files7: string;
  setAttdatnum7: (d: any) => void;
  setFiles7: (d: any) => void;
  mainDataState7: State;
  setMainDataState7: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);

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
    attdatnum6,
    files6,
    setAttdatnum6,
    setFiles6,
    mainDataState6,
    setMainDataState6,
  } = useContext(FormContext6);
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
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum6(data.attdatnum);
    setFiles6(
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
          modal={true}
          permission={{ upload: false, download: true, delete: false }}
        />
      )}
    </>
  );
};

const ColumnCommandCell7 = (props: GridCellProps) => {
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
    attdatnum7,
    files7,
    setAttdatnum7,
    setFiles7,
    mainDataState7,
    setMainDataState7,
  } = useContext(FormContext7);
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
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum7(data.attdatnum);
    setFiles7(
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
          modal={true}
        />
      )}
    </>
  );
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_sysUserMaster_001, L_HU115, L_HU110, L_dptcd_001, L_QC002, L_HU017",
    setBizComponentData
  );
  //보고서구분, 그룹구분, 그룹특성, 품목계정, 내수구분

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "reviewlvl1"
      ? "L_HU110"
      : field == "dptcd"
      ? "L_dptcd_001"
      : field == "badcd"
      ? "L_QC002"
      : field == "person"
      ? "L_sysUserMaster_001"
      : field == "rnpdiv"
      ? "L_HU017"
      : field == "title"
      ? "L_HU115"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );
  const textField =
    field == "dptcd"
      ? "dptnm"
      : field == "title"
      ? "title"
      : field == "person"
      ? "user_name"
      : "code_name";
  const valueField =
    field == "dptcd"
      ? "dptcd"
      : field == "title"
      ? "hrreviewnum"
      : field == "person"
      ? "user_id"
      : "sub_code";

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      page={
        field == "reviewlvl1"
          ? "reviewlvl1"
          : field == "title"
          ? "title"
          : undefined
      }
      {...props}
    />
  ) : (
    <td />
  );
};

type TdataArr = {
  rowstatus_s: string[];
  hrreviewnum_s: string[];
  reviewlvl1_s: string[];
  title_s: string[];
  contents_s: string[];
  commyn_s: string[];

  hrreview_stnum_s: string[];
  dptcd_s: string[];
  remark1_s: string[];

  monthlyhrreview_s: string[];
  monthlyhrreviewseq_s: string[];
  quantitative_evalution_s: string[];
  qualitative_evalution_s: string[];

  badnum_s: string[];
  badseq_s: string[];
  baddt_s: string[];
  badcd_s: string[];
  remark_s: string[];

  seq_s: string[];
  rnpdiv_s: string[];
  reqdt_s: string[];
  attdatnum_s: string[];
  reloffice_s: string[];
};

const HU_A4000W: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();

  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  var height3 = getHeight(".k-tabstrip-items-wrapper");
  var height4 = getHeight(".ButtonContainer4");

    const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const idGetter6 = getter(DATA_ITEM_KEY6);
  const idGetter7 = getter(DATA_ITEM_KEY7);
  const idGetter8 = getter(DATA_ITEM_KEY8);
  const idGetter9 = getter(DATA_ITEM_KEY9);
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_A4000W", setCustomOptionData);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("HU_A4000W", setMessagesData);
  const [workType, setWorkType] = useState("N");
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  const [attdatnum6, setAttdatnum6] = useState<string>("");
  const [files6, setFiles6] = useState<string>("");
  const [attdatnum7, setAttdatnum7] = useState<string>("");
  const [files7, setFiles7] = useState<string>("");

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

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
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        Interviewee: defaultOption.find((item: any) => item.id == "Interviewee")
          ?.valueCode,
        Interviewer: userId,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        Interviewee: defaultOption.find((item: any) => item.id == "Interviewee")
          ?.valueCode,
        Interviewer: userId,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const location = UseGetValueFromSessionItem("location");
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_HU110, L_dptcd_001, L_HU250T", setBizComponentData);
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [UserListData, setUserListData] = useState([
    { prsnnum: "", prsnnm: "" },
  ]);
  const [reviewlvl1ListData, setReviewlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setReviewlvl1ListData(getBizCom(bizComponentData, "L_HU110"));
      setUserListData(getBizCom(bizComponentData, "L_HU250T"));
      setdptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
    }
  }, [bizComponentData]);

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  let _export6: any;
  let _export7: any;
  let _export8: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[0].title = "인사고과기준";
        optionsGridOne.sheets[1].title = "인사고과셋팅기준";
        _export.save(optionsGridOne);
      }
    }
    if (_export3 !== null && _export3 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridThree = _export3.workbookOptions();
        optionsGridThree.sheets[0].title = "월말인사평가요약";
        if (tabSelected2 == 0) {
          const optionsGridFour = _export4.workbookOptions();
          optionsGridThree.sheets[1] = optionsGridFour.sheets[0];
          optionsGridThree.sheets[1].title = "불량내역";
        } else if (tabSelected2 == 1) {
          const optionsGridFive = _export5.workbookOptions();
          optionsGridThree.sheets[1] = optionsGridFive.sheets[0];
          optionsGridThree.sheets[1].title = "교육내역";
        } else if (tabSelected2 == 2) {
          const optionsGridSix = _export6.workbookOptions();
          optionsGridThree.sheets[1] = optionsGridSix.sheets[0];
          optionsGridThree.sheets[1].title = "상벌사항";
        }

        if (tabSelected3 == 0) {
          const optionsGridSeven = _export7.workbookOptions();
          optionsGridThree.sheets[2] = optionsGridSeven.sheets[0];
          optionsGridThree.sheets[2].title = "분류1";
        } else if (tabSelected3 == 1) {
          const optionsGridEight = _export8.workbookOptions();
          optionsGridThree.sheets[2] = optionsGridEight.sheets[0];
          optionsGridThree.sheets[2].title = "분류2";
        }
        _export3.save(optionsGridThree);
      }
    }
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.frdt).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "HU_A4000W_001");
      }
      if (convertDateToStr(filters.todt).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "HU_A4000W_001");
      } else {
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
        resetAllGrid();
        deletedMainRows = [];
        deletedMainRows2 = [];
        setFilters((prev) => ({
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
        if (swiper && isMobile) {
          swiper.slideTo(0);
          swiper.update();
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage5(initialPageState);
    setPage6(initialPageState);
    setPage7(initialPageState);
    setPage8(initialPageState);
    setPage9(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult5(process([], mainDataState5));
    setMainDataResult6(process([], mainDataState6));
    setMainDataResult7(process([], mainDataState7));
    setMainDataResult8(process([], mainDataState8));
    setMainDataResult9(process([], mainDataState9));
    setWorkType("N");
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);
    setInformation({
      orgdiv: sessionOrgdiv,
      monthlyhrreview: "",
      interviewdt: new Date(),
      interviewer: userId,
      interviewee: "",
      dptcd: "",
      difficulty: "0.0",
      remark1: "",
      yyyymm: monthAgo,
    });
    setInformation2({
      orgdiv: "",
      prsnnum: "",
      rate: "0 건",
      stay: "0시간 0분",
      workOrderMM: "",
      workOrdercnt: "",
      OrderPercent: 0,
      newworkcnt: "",
      ModWorkCnt: "",
      workTime: "",
      bad: "0 건",
      edu: "0 건",
      annsum: "",
      annMonth: "",
    });
  };

  const [tabSelected, setTabSelected] = React.useState(0);
  const [tabSelected2, setTabSelected2] = React.useState(0);
  const [tabSelected3, setTabSelected3] = React.useState(0);

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };
  const handleSelectTab2 = (e: any) => {
    setTabSelected2(e.selected);
    deletedMainRows5 = [];
    deletedMainRows6 = [];
    deletedMainRows7 = [];
    setPage5(initialPageState);
    setPage6(initialPageState);
    setPage7(initialPageState);
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    if (mainDataResult3.total > 0 && workType != "N") {
      if (e.selected == 0) {
        setFilters5((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: "",
        }));
      } else if (e.selected == 1) {
        setFilters6((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: "",
        }));
      } else if (e.selected == 2) {
        setFilters7((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: "",
        }));
      }
    } else {
      setMainDataResult5(process([], mainDataState5));
      setMainDataResult6(process([], mainDataState6));
      setMainDataResult7(process([], mainDataState7));
    }
  };
  const handleSelectTab3 = (e: any) => {
    setTabSelected3(e.selected);
  };
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST1",
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    Interviewer: "",
    Interviewee: "",
    dptcd: "",
    hrreviewnum: "",
    Monthly_hrreview: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "DETAIL1",
    orgdiv: sessionOrgdiv,
    hrreviewnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST2",
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    Interviewer: "",
    Interviewee: "",
    dptcd: "",
    hrreviewnum: "",
    Monthly_hrreview: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    work_type: "WORK",
    orgdiv: sessionOrgdiv,
    userid: "",
    yyyymm: "",
    ref_key: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters5, setFilters5] = useState({
    pgSize: PAGE_SIZE,
    work_type: "BAD",
    orgdiv: sessionOrgdiv,
    userid: "",
    yyyymm: "",
    ref_key: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters6, setFilters6] = useState({
    pgSize: PAGE_SIZE,
    work_type: "EDU",
    orgdiv: sessionOrgdiv,
    userid: "",
    yyyymm: "",
    ref_key: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters7, setFilters7] = useState({
    pgSize: PAGE_SIZE,
    work_type: "BNS",
    orgdiv: sessionOrgdiv,
    userid: "",
    yyyymm: "",
    ref_key: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters8, setFilters8] = useState({
    pgSize: PAGE_SIZE,
    work_type: "DETAIL2",
    orgdiv: sessionOrgdiv,
    userid: "",
    yyyymm: "",
    ref_key: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters9, setFilters9] = useState({
    pgSize: PAGE_SIZE,
    work_type: "DETAIL3",
    orgdiv: sessionOrgdiv,
    userid: "",
    yyyymm: "",
    ref_key: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [information, setInformation] = useState<any>({
    orgdiv: sessionOrgdiv,
    monthlyhrreview: "",
    interviewdt: new Date(),
    interviewer: userId,
    interviewee: "",
    dptcd: "",
    difficulty: "0.0",
    remark1: "",
    yyyymm: monthAgo,
  });

  const [information2, setInformation2] = useState<any>({
    orgdiv: "",
    prsnnum: "",
    rate: "0 건",
    stay: "0시간 0분",
    workOrderMM: "",
    workOrdercnt: "",
    OrderPercent: 0,
    newworkcnt: "",
    ModWorkCnt: "",
    workTime: "",
    bad: "0 건",
    edu: "0 건",
    annsum: "",
    annMonth: "",
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters3((prev) => ({
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
    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value, values } = e;

    if (name == "interviewee") {
      setInformation((prev: any) => ({
        ...prev,
        [name]: values.prsnnum,
        dptcd: values.dptcd,
      }));
    } else {
      setInformation((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  let gridRef: any = useRef(null);
  let gridRef3: any = useRef(null);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
  const [page6, setPage6] = useState(initialPageState);
  const [page7, setPage7] = useState(initialPageState);
  const [page8, setPage8] = useState(initialPageState);
  const [page9, setPage9] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setPage2(initialPageState);
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));

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

    setPage5(initialPageState);
    setPage6(initialPageState);
    setPage7(initialPageState);
    setPage8(initialPageState);
    setPage9(initialPageState);

    setFilters5((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters6((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters7((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters8((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters9((prev) => ({
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

  const pageChange7 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters7((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage7({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange8 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters8((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage8({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange9 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters9((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage9({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A4000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters.todt).substring(0, 6),
        "@p_Interviewer": userId,
        "@p_Interviewee": filters.Interviewee,
        "@p_dptcd": filters.dptcd,
        "@p_hrreviewnum": filters.hrreviewnum,
        "@p_Monthly_hrreview": filters.Monthly_hrreview,
        "@p_userid": "",
        "@p_yyyymm": "",
        "@p_ref_key": "",
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
        commyn: row.commyn == "Y" ? true : false,
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.hrreviewnum == filters.find_row_value
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
                (row: any) => row.hrreviewnum == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            hrreviewnum: selectedRow.hrreviewnum,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            hrreviewnum: rows[0].hrreviewnum,
            isSearch: true,
            pgNum: 1,
          }));
        }
      } else {
        setPage2(initialPageState);
        setMainDataResult2(process([], mainDataState2));
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
      procedureName: "P_HU_A4000W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters.todt).substring(0, 6),
        "@p_Interviewer": userId,
        "@p_Interviewee": filters.Interviewee,
        "@p_dptcd": filters.dptcd,
        "@p_hrreviewnum": filters2.hrreviewnum,
        "@p_Monthly_hrreview": filters.Monthly_hrreview,
        "@p_userid": "",
        "@p_yyyymm": "",
        "@p_ref_key": "",
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
      procedureName: "P_HU_A4000W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.work_type,
        "@p_orgdiv": filters3.orgdiv,
        "@p_frdt": convertDateToStr(filters3.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters3.todt).substring(0, 6),
        "@p_Interviewer": filters3.Interviewer,
        "@p_Interviewee": filters3.Interviewee,
        "@p_dptcd": filters3.dptcd,
        "@p_hrreviewnum": filters3.hrreviewnum,
        "@p_Monthly_hrreview": filters3.Monthly_hrreview,
        "@p_userid": "",
        "@p_yyyymm": "",
        "@p_ref_key": "",
        "@p_find_row_value": filters3.find_row_value,
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

      if (filters3.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.monthlyhrreview == filters3.find_row_value
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
            : rows.find(
                (row: any) => row.monthlyhrreview == filters3.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState3({ [selectedRow[DATA_ITEM_KEY3]]: true });
          setWorkType("U");
          setInformation({
            orgdiv: selectedRow.orgdiv,
            monthlyhrreview: selectedRow.monthlyhrreview,
            interviewdt:
              selectedRow.interviewdt == ""
                ? new Date()
                : toDate(selectedRow.interviewdt),
            interviewer: selectedRow.interviewer,
            interviewee: selectedRow.interviewee,
            dptcd: selectedRow.dptcd,
            difficulty: selectedRow.difficulty,
            remark1: selectedRow.remark1,
            yyyymm:
              selectedRow.yyyymm == ""
                ? monthAgo
                : toDate(selectedRow.yyyymm + "01"),
          });
          setFilters4((prev) => ({
            ...prev,
            userid: selectedRow.interviewee,
            yyyymm: selectedRow.yyyymm,
            ref_key: selectedRow.monthlyhrreview,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters5((prev) => ({
            ...prev,
            userid: selectedRow.interviewee,
            yyyymm: selectedRow.yyyymm,
            ref_key: selectedRow.monthlyhrreview,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters6((prev) => ({
            ...prev,
            userid: selectedRow.interviewee,
            yyyymm: selectedRow.yyyymm,
            ref_key: selectedRow.monthlyhrreview,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters7((prev) => ({
            ...prev,
            userid: selectedRow.interviewee,
            yyyymm: selectedRow.yyyymm,
            ref_key: selectedRow.monthlyhrreview,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters8((prev) => ({
            ...prev,
            userid: selectedRow.interviewee,
            yyyymm: selectedRow.yyyymm,
            ref_key: selectedRow.monthlyhrreview,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters9((prev) => ({
            ...prev,
            userid: selectedRow.interviewee,
            yyyymm: selectedRow.yyyymm,
            ref_key: selectedRow.monthlyhrreview,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
          setWorkType("U");
          setInformation({
            orgdiv: rows[0].orgdiv,
            monthlyhrreview: rows[0].monthlyhrreview,
            interviewdt:
              rows[0].interviewdt == ""
                ? new Date()
                : toDate(rows[0].interviewdt),
            interviewer: rows[0].interviewer,
            interviewee:
              rows[0].interviewee == undefined ? "" : rows[0].interviewee,
            dptcd: rows[0].dptcd,
            difficulty: rows[0].difficulty,
            remark1: rows[0].remark1,
            yyyymm:
              rows[0].yyyymm == "" ? monthAgo : toDate(rows[0].yyyymm + "01"),
          });
          setFilters4((prev) => ({
            ...prev,
            userid: rows[0].interviewee == undefined ? "" : rows[0].interviewee,
            yyyymm: rows[0].yyyymm,
            ref_key: rows[0].monthlyhrreview,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters5((prev) => ({
            ...prev,
            userid: rows[0].interviewee == undefined ? "" : rows[0].interviewee,
            yyyymm: rows[0].yyyymm,
            ref_key: rows[0].monthlyhrreview,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters6((prev) => ({
            ...prev,
            userid: rows[0].interviewee == undefined ? "" : rows[0].interviewee,
            yyyymm: rows[0].yyyymm,
            ref_key: rows[0].monthlyhrreview,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters7((prev) => ({
            ...prev,
            userid: rows[0].interviewee == undefined ? "" : rows[0].interviewee,
            yyyymm: rows[0].yyyymm,
            ref_key: rows[0].monthlyhrreview,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters8((prev) => ({
            ...prev,
            userid: rows[0].interviewee == undefined ? "" : rows[0].interviewee,
            yyyymm: rows[0].yyyymm,
            ref_key: rows[0].monthlyhrreview,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters9((prev) => ({
            ...prev,
            userid: rows[0].interviewee == undefined ? "" : rows[0].interviewee,
            yyyymm: rows[0].yyyymm,
            ref_key: rows[0].monthlyhrreview,
            isSearch: true,
            pgNum: 1,
          }));
        }
      } else {
        setInformation({
          orgdiv: sessionOrgdiv,
          monthlyhrreview: "",
          interviewdt: new Date(),
          interviewer: userId,
          interviewee: "",
          dptcd: "",
          difficulty: "0.0",
          remark1: "",
          yyyymm: monthAgo,
        });
        setInformation2({
          orgdiv: "",
          prsnnum: "",
          rate: "0 건",
          stay: "0시간 0분",
          workOrderMM: "",
          workOrdercnt: "",
          OrderPercent: 0,
          newworkcnt: "",
          ModWorkCnt: "",
          workTime: "",
          bad: "0 건",
          edu: "0 건",
          annsum: "",
          annMonth: "",
        });
        setPage5(initialPageState);
        setPage6(initialPageState);
        setPage7(initialPageState);
        setPage8(initialPageState);
        setPage9(initialPageState);
        setMainDataResult5(process([], mainDataState5));
        setMainDataResult6(process([], mainDataState6));
        setMainDataResult7(process([], mainDataState7));
        setMainDataResult8(process([], mainDataState8));
        setMainDataResult9(process([], mainDataState9));
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
      procedureName: "P_HU_A4000W_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": filters4.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters3.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters3.todt).substring(0, 6),
        "@p_Interviewer": filters3.Interviewer,
        "@p_Interviewee": filters3.Interviewee,
        "@p_dptcd": filters3.dptcd,
        "@p_hrreviewnum": filters2.hrreviewnum,
        "@p_Monthly_hrreview": filters3.Monthly_hrreview,
        "@p_userid": filters4.userid,
        "@p_yyyymm": filters4.yyyymm,
        "@p_ref_key": filters4.ref_key,
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

      if (totalRowCnt > 0) {
        setInformation2({
          orgdiv: rows[0].orgdiv,
          prsnnum: rows[0].prsnnum,
          rate: rows[0].rate,
          stay: rows[0].stay,
          workOrderMM: rows[0].workOrderMM,
          workOrdercnt: rows[0].workOrdercnt,
          OrderPercent: rows[0].OrderPercent,
          newworkcnt: rows[0].newworkcnt,
          ModWorkCnt: rows[0].ModWorkCnt,
          workTime: rows[0].workTime,
          bad: rows[0].bad,
          edu: rows[0].edu,
          annsum: rows[0].annsum,
          annMonth: rows[0].annMonth,
        });
      } else {
        setInformation2({
          orgdiv: "",
          prsnnum: "",
          rate: "0 건",
          stay: "0시간 0분",
          workOrderMM: "",
          workOrdercnt: "",
          OrderPercent: 0,
          newworkcnt: "",
          ModWorkCnt: "",
          workTime: "",
          bad: "0 건",
          edu: "0 건",
          annsum: "",
          annMonth: "",
        });
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
      procedureName: "P_HU_A4000W_Q",
      pageNumber: filters5.pgNum,
      pageSize: filters5.pgSize,
      parameters: {
        "@p_work_type": filters5.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters3.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters3.todt).substring(0, 6),
        "@p_Interviewer": filters3.Interviewer,
        "@p_Interviewee": filters3.Interviewee,
        "@p_dptcd": filters3.dptcd,
        "@p_hrreviewnum": filters2.hrreviewnum,
        "@p_Monthly_hrreview": filters3.Monthly_hrreview,
        "@p_userid": filters5.userid,
        "@p_yyyymm": filters5.yyyymm,
        "@p_ref_key": filters5.ref_key,
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

      setMainDataResult5((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState5({ [rows[0][DATA_ITEM_KEY5]]: true });
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
      procedureName: "P_HU_A4000W_Q",
      pageNumber: filters6.pgNum,
      pageSize: filters6.pgSize,
      parameters: {
        "@p_work_type": filters6.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters3.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters3.todt).substring(0, 6),
        "@p_Interviewer": filters3.Interviewer,
        "@p_Interviewee": filters3.Interviewee,
        "@p_dptcd": filters3.dptcd,
        "@p_hrreviewnum": filters2.hrreviewnum,
        "@p_Monthly_hrreview": filters3.Monthly_hrreview,
        "@p_userid": filters6.userid,
        "@p_yyyymm": filters6.yyyymm,
        "@p_ref_key": filters6.ref_key,
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

  //그리드 데이터 조회
  const fetchMainGrid7 = async (filters7: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A4000W_Q",
      pageNumber: filters7.pgNum,
      pageSize: filters7.pgSize,
      parameters: {
        "@p_work_type": filters7.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters3.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters3.todt).substring(0, 6),
        "@p_Interviewer": filters3.Interviewer,
        "@p_Interviewee": filters3.Interviewee,
        "@p_dptcd": filters3.dptcd,
        "@p_hrreviewnum": filters2.hrreviewnum,
        "@p_Monthly_hrreview": filters3.Monthly_hrreview,
        "@p_userid": filters7.userid,
        "@p_yyyymm": filters7.yyyymm,
        "@p_ref_key": filters7.ref_key,
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

      setMainDataResult7((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState7({ [rows[0][DATA_ITEM_KEY7]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters7((prev) => ({
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
  const fetchMainGrid8 = async (filters8: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A4000W_Q",
      pageNumber: filters8.pgNum,
      pageSize: filters8.pgSize,
      parameters: {
        "@p_work_type": filters8.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters3.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters3.todt).substring(0, 6),
        "@p_Interviewer": filters3.Interviewer,
        "@p_Interviewee": filters3.Interviewee,
        "@p_dptcd": filters3.dptcd,
        "@p_hrreviewnum": filters2.hrreviewnum,
        "@p_Monthly_hrreview": filters8.ref_key,
        "@p_userid": filters8.userid,
        "@p_yyyymm": filters8.yyyymm,
        "@p_ref_key": filters8.ref_key,
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

      setMainDataResult8((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState8({ [rows[0][DATA_ITEM_KEY8]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters8((prev) => ({
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
  const fetchMainGrid9 = async (filters9: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A4000W_Q",
      pageNumber: filters9.pgNum,
      pageSize: filters9.pgSize,
      parameters: {
        "@p_work_type": filters9.work_type,
        "@p_orgdiv": filters9.orgdiv,
        "@p_frdt": convertDateToStr(filters3.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters3.todt).substring(0, 6),
        "@p_Interviewer": filters3.Interviewer,
        "@p_Interviewee": filters3.Interviewee,
        "@p_dptcd": filters3.dptcd,
        "@p_hrreviewnum": filters2.hrreviewnum,
        "@p_Monthly_hrreview": filters9.ref_key,
        "@p_userid": filters9.userid,
        "@p_yyyymm": filters9.yyyymm,
        "@p_ref_key": filters9.ref_key,
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

      setMainDataResult9((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState9({ [rows[0][DATA_ITEM_KEY9]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters9((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
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
  const [mainDataState5, setMainDataState5] = useState<State>({
    sort: [],
  });
  const [mainDataState6, setMainDataState6] = useState<State>({
    sort: [],
  });
  const [mainDataState7, setMainDataState7] = useState<State>({
    sort: [],
  });
  const [mainDataState8, setMainDataState8] = useState<State>({
    sort: [],
  });
  const [mainDataState9, setMainDataState9] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [tempState5, setTempState5] = useState<State>({
    sort: [],
  });
  const [tempState6, setTempState6] = useState<State>({
    sort: [],
  });
  const [tempState7, setTempState7] = useState<State>({
    sort: [],
  });
  const [tempState8, setTempState8] = useState<State>({
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
  const [mainDataResult5, setMainDataResult5] = useState<DataResult>(
    process([], mainDataState5)
  );
  const [mainDataResult6, setMainDataResult6] = useState<DataResult>(
    process([], mainDataState6)
  );
  const [mainDataResult7, setMainDataResult7] = useState<DataResult>(
    process([], mainDataState7)
  );
  const [mainDataResult8, setMainDataResult8] = useState<DataResult>(
    process([], mainDataState8)
  );
  const [mainDataResult9, setMainDataResult9] = useState<DataResult>(
    process([], mainDataState9)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [tempResult5, setTempResult5] = useState<DataResult>(
    process([], tempState5)
  );
  const [tempResult6, setTempResult6] = useState<DataResult>(
    process([], tempState6)
  );
  const [tempResult7, setTempResult7] = useState<DataResult>(
    process([], tempState7)
  );
  const [tempResult8, setTempResult8] = useState<DataResult>(
    process([], tempState8)
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
  const [selectedState5, setSelectedState5] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState6, setSelectedState6] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState7, setSelectedState7] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState8, setSelectedState8] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState9, setSelectedState9] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && customOptionData !== null && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, customOptionData, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters2.isSearch &&
      customOptionData !== null &&
      permissions !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, customOptionData, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters3.isSearch &&
      customOptionData !== null &&
      permissions !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, customOptionData, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters4.isSearch &&
      customOptionData !== null &&
      permissions !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4, customOptionData, permissions]);

  useEffect(() => {
    if (
      filters5.isSearch &&
      customOptionData !== null &&
      permissions !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters5);
      setFilters5((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid5(deepCopiedFilters);
    }
  }, [filters5, customOptionData, permissions]);

  useEffect(() => {
    if (
      filters6.isSearch &&
      customOptionData !== null &&
      permissions !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters6);
      setFilters6((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid6(deepCopiedFilters);
    }
  }, [filters6, customOptionData, permissions]);

  useEffect(() => {
    if (
      filters7.isSearch &&
      customOptionData !== null &&
      permissions !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters7);
      setFilters7((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid7(deepCopiedFilters);
    }
  }, [filters7, customOptionData, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters8.isSearch &&
      customOptionData !== null &&
      permissions !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters8);
      setFilters8((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid8(deepCopiedFilters);
    }
  }, [filters8, customOptionData, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters9.isSearch &&
      customOptionData !== null &&
      permissions !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters9);
      setFilters9((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid9(deepCopiedFilters);
    }
  }, [filters9, customOptionData, permissions]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [mainDataResult3]);

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    deletedMainRows2 = [];
    setFilters2((prev) => ({
      ...prev,
      hrreviewnum: selectedRowData.hrreviewnum,
      isSearch: true,
      pgNum: 1,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
      swiper.update();
    }
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
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
    const interviewee: any =
      UserListData.find(
        (item: any) => item.prsnnm == selectedRowData.interviewee
      ) == undefined
        ? ""
        : UserListData.find(
            (item: any) => item.prsnnm == selectedRowData.interviewee
          );
    const dptcd: any =
      dptcdListData.find((item: any) => item.dptnm == selectedRowData.dptcd) ==
      undefined
        ? ""
        : dptcdListData.find(
            (item: any) => item.dptnm == selectedRowData.dptcd
          );
    setWorkType("U");
    setInformation({
      orgdiv: selectedRowData.orgdiv,
      monthlyhrreview: selectedRowData.monthlyhrreview,
      interviewdt:
        selectedRowData.interviewdt == ""
          ? new Date()
          : toDate(selectedRowData.interviewdt),
      interviewer: selectedRowData.interviewer,
      interviewee: interviewee.prsnnum == undefined ? "" : interviewee.prsnnum,
      dptcd: dptcd.dptcd == undefined ? "" : dptcd.dptcd,
      difficulty: selectedRowData.difficulty,
      remark1: selectedRowData.remark1,
      yyyymm:
        selectedRowData.yyyymm == ""
          ? monthAgo
          : toDate(selectedRowData.yyyymm + "01"),
    });
    setFilters4((prev) => ({
      ...prev,
      userid: interviewee.prsnnum == undefined ? "" : interviewee.prsnnum,
      yyyymm: selectedRowData.yyyymm,
      ref_key: selectedRowData.monthlyhrreview,
      isSearch: true,
      pgNum: 1,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setFilters5((prev) => ({
      ...prev,
      userid: interviewee.prsnnum == undefined ? "" : interviewee.prsnnum,
      yyyymm: selectedRowData.yyyymm,
      ref_key: selectedRowData.monthlyhrreview,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters6((prev) => ({
      ...prev,
      userid: interviewee.prsnnum == undefined ? "" : interviewee.prsnnum,
      yyyymm: selectedRowData.yyyymm,
      ref_key: selectedRowData.monthlyhrreview,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters7((prev) => ({
      ...prev,
      userid: interviewee.prsnnum == undefined ? "" : interviewee.prsnnum,
      yyyymm: selectedRowData.yyyymm,
      ref_key: selectedRowData.monthlyhrreview,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters8((prev) => ({
      ...prev,
      userid: interviewee.prsnnum == undefined ? "" : interviewee.prsnnum,
      yyyymm: selectedRowData.yyyymm,
      ref_key: selectedRowData.monthlyhrreview,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters9((prev) => ({
      ...prev,
      userid: interviewee.prsnnum == undefined ? "" : interviewee.prsnnum,
      yyyymm: selectedRowData.yyyymm,
      ref_key: selectedRowData.monthlyhrreview,
      isSearch: true,
      pgNum: 1,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(3);
      swiper.update();
    }
  };

  const onSelectionChange5 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState5,
      dataItemKey: DATA_ITEM_KEY5,
    });

    setSelectedState5(newSelectedState);
  };

  const onSelectionChange6 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState6,
      dataItemKey: DATA_ITEM_KEY6,
    });

    setSelectedState6(newSelectedState);
  };

  const onSelectionChange7 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState7,
      dataItemKey: DATA_ITEM_KEY7,
    });

    setSelectedState7(newSelectedState);
  };

  const onSelectionChange8 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState8,
      dataItemKey: DATA_ITEM_KEY8,
    });

    setSelectedState8(newSelectedState);
  };

  const onSelectionChange9 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState9,
      dataItemKey: DATA_ITEM_KEY9,
    });

    setSelectedState9(newSelectedState);
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
  const onMainDataStateChange5 = (event: GridDataStateChangeEvent) => {
    setMainDataState5(event.dataState);
  };
  const onMainDataStateChange6 = (event: GridDataStateChangeEvent) => {
    setMainDataState6(event.dataState);
  };
  const onMainDataStateChange7 = (event: GridDataStateChangeEvent) => {
    setMainDataState7(event.dataState);
  };
  const onMainDataStateChange8 = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange9 = (event: GridDataStateChangeEvent) => {
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

  const mainTotalFooterCell7 = (props: GridFooterCellProps) => {
    var parts = mainDataResult7.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult7.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell8 = (props: GridFooterCellProps) => {
    var parts = mainDataResult8.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult8.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell9 = (props: GridFooterCellProps) => {
    var parts = mainDataResult9.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult9.total == -1
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
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange5 = (e: any) => {
    setMainDataState5((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange6 = (e: any) => {
    setMainDataState6((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange7 = (e: any) => {
    setMainDataState7((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange8 = (e: any) => {
    setMainDataState8((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange9 = (e: any) => {
    setMainDataState9((prev) => ({ ...prev, sort: e.sort }));
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
  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
  };
  const onMainItemChange5 = (event: GridItemChangeEvent) => {
    setMainDataState5((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult5,
      setMainDataResult5,
      DATA_ITEM_KEY5
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
  const onMainItemChange7 = (event: GridItemChangeEvent) => {
    setMainDataState7((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult7,
      setMainDataResult7,
      DATA_ITEM_KEY7
    );
  };
  const onMainItemChange8 = (event: GridItemChangeEvent) => {
    setMainDataState8((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult8,
      setMainDataResult8,
      DATA_ITEM_KEY8
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
  const customCellRender5 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit5}
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
  const customCellRender7 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit7}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender8 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit8}
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
  const customRowRender5 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit5}
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
  const customRowRender7 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit7}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender8 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit8}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
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

  const enterEdit2 = (dataItem: any, field: string) => {
    const data = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    if (field != "rowstatus" && data.commyn == false) {
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
      setTempResult2((prev: { total: any }) => {
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
      setTempResult2((prev: { total: any }) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit5 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult5.data.map((item) =>
        item[DATA_ITEM_KEY5] == dataItem[DATA_ITEM_KEY5]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult5((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult5((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult5((prev: { total: any }) => {
        return {
          data: mainDataResult5.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit6 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
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
      setTempResult6((prev: { total: any }) => {
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
      setTempResult6((prev: { total: any }) => {
        return {
          data: mainDataResult6.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit7 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult7.data.map((item) =>
        item[DATA_ITEM_KEY7] == dataItem[DATA_ITEM_KEY7]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult7((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult7((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult7((prev: { total: any }) => {
        return {
          data: mainDataResult7.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit8 = (dataItem: any, field: string) => {
    if (
      field != "rowstatus" &&
      field != "contents" &&
      field != "bf_quantitative_evalution" &&
      field != "bf_qualitative_evalution"
    ) {
      const newData = mainDataResult8.data.map((item) =>
        item[DATA_ITEM_KEY8] == dataItem[DATA_ITEM_KEY8]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult8((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult8((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult8((prev: { total: any }) => {
        return {
          data: mainDataResult8.data,
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

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
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
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult2.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit5 = () => {
    if (tempResult5.data != mainDataResult5.data) {
      const newData = mainDataResult5.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY5] == Object.getOwnPropertyNames(selectedState5)[0]
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
      setTempResult5((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult5((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult5.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult5((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult5((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit6 = () => {
    if (tempResult6.data != mainDataResult6.data) {
      const newData = mainDataResult6.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
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
      setTempResult6((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult6((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult6.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult6((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult6((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit7 = () => {
    if (tempResult7.data != mainDataResult7.data) {
      const newData = mainDataResult7.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY7] == Object.getOwnPropertyNames(selectedState7)[0]
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
      setTempResult7((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult7((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult7.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult7((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult7((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit8 = () => {
    if (tempResult8.data != mainDataResult8.data) {
      const newData = mainDataResult8.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY8] == Object.getOwnPropertyNames(selectedState8)[0]
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
      setTempResult8((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult8((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult8.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult8((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult8((prev: { total: any }) => {
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
      commyn: false,
      contents: "",
      hrreviewnum: "",
      orgdiv: sessionOrgdiv,
      reviewlvl1: "",
      title: "",
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
    setFilters2((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      hrreviewnum: newDataItem.hrreviewnum,
    }));
  };

  const onAddClick2 = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });
    const datas = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    const newDataItem = {
      [DATA_ITEM_KEY2]: ++temp2,
      dptcd: "",
      hrreview_stnum: "",
      hrreviewnum: datas.hrreviewnum,
      orgdiv: sessionOrgdiv,
      remark1: "",
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

  const onAddClick5 = () => {
    mainDataResult5.data.map((item) => {
      if (item.num > temp5) {
        temp5 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY5]: ++temp5,
      badcd: "",
      baddt: convertDateToStr(new Date()),
      badnum: "",
      badseq: 0,
      orgdiv: sessionOrgdiv,
      remark: "",
      rowstatus: "N",
    };

    setSelectedState5({ [newDataItem[DATA_ITEM_KEY5]]: true });
    setPage5((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult5((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick6 = () => {
    mainDataResult6.data.map((item) => {
      if (item.num > temp6) {
        temp6 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY6]: ++temp6,
      attdatnum: "",
      contents: "",
      datnum: "",
      edunum: "",
      files: "",
      orgdiv: sessionOrgdiv,
      person: "",
      recdt: convertDateToStr(new Date()),
      remark: "",
      title: "",
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

  const onAddClick7 = () => {
    mainDataResult7.data.map((item) => {
      if (item.num > temp7) {
        temp7 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY7]: ++temp7,
      attdatnum: "",
      contents: "",
      files: "",
      orgdiv: sessionOrgdiv,
      prsnnum: "",
      reloffice: "",
      remark: "",
      reqdt: convertDateToStr(new Date()),
      rnpdiv: "",
      seq: 0,
      rowstatus: "N",
    };

    setSelectedState7({ [newDataItem[DATA_ITEM_KEY7]]: true });
    setPage7((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult7((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick8 = () => {
    mainDataResult8.data.map((item) => {
      if (item.num > temp8) {
        temp8 = item.num;
      }
    });

    const datas = mainDataResult3.data.filter(
      (item) =>
        item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
    )[0];

    const newDataItem = {
      [DATA_ITEM_KEY8]: ++temp8,
      bf_qualitative_evalution: "",
      bf_quantitative_evalution: 0,
      contents: "",
      hrreviewnum: "",
      monthlyhrreview: datas.monthlyhrreview,
      monthlyhrreviewseq: datas.monthlyhrreviewseq,
      orgdiv: sessionOrgdiv,
      qualitative_evalution: "",
      quantitative_evalution: 0,
      reviewlvl1: "",
      title: "",
      rowstatus: "N",
    };

    setSelectedState8({ [newDataItem[DATA_ITEM_KEY8]]: true });
    setPage8((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult8((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onreviewlvl1AddClick = async () => {
    if (information.dptcd == "") {
      alert("면접자 부서를 입력해주세요.");
    } else {
      let data: any;
      setLoading(true);

      //조회조건 파라미터
      const parameters: Iparameters = {
        procedureName: "P_HU_A4000W_Q",
        pageNumber: filters9.pgNum,
        pageSize: filters9.pgSize,
        parameters: {
          "@p_work_type": "DETAIL2_N",
          "@p_orgdiv": filters9.orgdiv,
          "@p_frdt": convertDateToStr(filters.frdt).substring(0, 6),
          "@p_todt": convertDateToStr(filters.todt).substring(0, 6),
          "@p_Interviewer": userId,
          "@p_Interviewee": filters.Interviewee,
          "@p_dptcd": information.dptcd,
          "@p_hrreviewnum": filters2.hrreviewnum,
          "@p_Monthly_hrreview": filters9.ref_key,
          "@p_userid": filters9.userid,
          "@p_yyyymm": filters9.yyyymm,
          "@p_ref_key": filters9.ref_key,
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

        rows.map((item: any) => {
          mainDataResult8.data.map((item) => {
            if (item.num > temp8) {
              temp8 = item.num;
            }
          });

          const datas = mainDataResult3.data.filter(
            (item) =>
              item[DATA_ITEM_KEY3] ==
              Object.getOwnPropertyNames(selectedState3)[0]
          )[0];

          const newDataItem = {
            [DATA_ITEM_KEY8]: ++temp8,
            bf_qualitative_evalution: item.bf_qualitative_evalution,
            bf_quantitative_evalution: item.bf_quantitative_evalution,
            contents: item.contents,
            hrreviewnum: item.hrreviewnum,
            monthlyhrreview: datas.monthlyhrreview,
            monthlyhrreviewseq: datas.monthlyhrreviewseq,
            orgdiv: sessionOrgdiv,
            qualitative_evalution: item.qualitative_evalution,
            quantitative_evalution: item.quantitative_evalution,
            reviewlvl1: item.reviewlvl1,
            title: item.title,
            rowstatus: "N",
          };

          setSelectedState8({ [newDataItem[DATA_ITEM_KEY8]]: true });
          setPage8((prev) => ({
            ...prev,
            skip: 0,
            take: prev.take + 1,
          }));
          setMainDataResult8((prev) => {
            return {
              data: [newDataItem, ...prev.data],
              total: prev.total + 1,
            };
          });
        });
      } else {
        console.log("[오류 발생]");
        console.log(data);
      }
      setLoading(false);
    }
  };

  const onreviewlvl1AddClick2 = async () => {
    if (information.dptcd == "") {
      alert("면접자 부서를 입력해주세요.");
    } else {
      let data: any;
      setLoading(true);
      //조회조건 파라미터
      const parameters: Iparameters = {
        procedureName: "P_HU_A4000W_Q",
        pageNumber: filters9.pgNum,
        pageSize: filters9.pgSize,
        parameters: {
          "@p_work_type": "DETAIL3_N",
          "@p_orgdiv": filters9.orgdiv,
          "@p_frdt": convertDateToStr(filters.frdt).substring(0, 6),
          "@p_todt": convertDateToStr(filters.todt).substring(0, 6),
          "@p_Interviewer": userId,
          "@p_Interviewee": filters.Interviewee,
          "@p_dptcd": information.dptcd,
          "@p_hrreviewnum": filters2.hrreviewnum,
          "@p_Monthly_hrreview": filters9.ref_key,
          "@p_userid": filters9.userid,
          "@p_yyyymm": filters9.yyyymm,
          "@p_ref_key": filters9.ref_key,
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
        rows.map((item: any) => {
          mainDataResult9.data.map((item) => {
            if (item.num > temp9) {
              temp9 = item.num;
            }
          });
          const datas = mainDataResult3.data.filter(
            (item) =>
              item[DATA_ITEM_KEY3] ==
              Object.getOwnPropertyNames(selectedState3)[0]
          )[0];
          const newDataItem = {
            [DATA_ITEM_KEY9]: ++temp9,
            bf_qualitative_evalution: item.bf_qualitative_evalution,
            bf_quantitative_evalution: item.bf_quantitative_evalution,
            contents: item.contents,
            hrreviewnum: item.hrreviewnum,
            monthlyhrreview: datas.monthlyhrreview,
            monthlyhrreviewseq: datas.monthlyhrreviewseq,
            orgdiv: sessionOrgdiv,
            qualitative_evalution: item.qualitative_evalution,
            quantitative_evalution: item.quantitative_evalution,
            reviewlvl1: item.reviewlvl1,
            title: item.title,
            rowstatus: "N",
          };
          setSelectedState9({ [newDataItem[DATA_ITEM_KEY9]]: true });
          setPage9((prev) => ({
            ...prev,
            skip: 0,
            take: prev.take + 1,
          }));
          setMainDataResult9((prev) => {
            return {
              data: [newDataItem, ...prev.data],
              total: prev.total + 1,
            };
          });
        });
      } else {
        console.log("[오류 발생]");
        console.log(data);
      }
      setLoading(false);
    }
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object1: any[] = [];
    let Object2: any[] = [];
    let data: any;
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
        Object1.push(index);
      }
    });

    if (Math.min(...Object1) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object1) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object1.length,
    }));
    if (Object1.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
      });
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        hrreviewnum:
          data != undefined
            ? data.hrreviewnum
            : newData[0] != undefined
            ? newData[0].hrreviewnum
            : "",
      }));
    }
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
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
    if (Object.length > 0) {
      setSelectedState2({
        [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick5 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult5.data.forEach((item: any, index: number) => {
      if (!selectedState5[item[DATA_ITEM_KEY5]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows5.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult5.data[Math.min(...Object2)];
    } else {
      data = mainDataResult5.data[Math.min(...Object) - 1];
    }

    setMainDataResult5((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState5({
        [data != undefined ? data[DATA_ITEM_KEY5] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick6 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult6.data.forEach((item: any, index: number) => {
      if (!selectedState6[item[DATA_ITEM_KEY6]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
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
    if (Object.length > 0) {
      setSelectedState6({
        [data != undefined ? data[DATA_ITEM_KEY6] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick7 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult7.data.forEach((item: any, index: number) => {
      if (!selectedState7[item[DATA_ITEM_KEY7]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows7.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult7.data[Math.min(...Object2)];
    } else {
      data = mainDataResult7.data[Math.min(...Object) - 1];
    }

    setMainDataResult7((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState7({
        [data != undefined ? data[DATA_ITEM_KEY7] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick8 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult8.data.forEach((item: any, index: number) => {
      if (!selectedState8[item[DATA_ITEM_KEY8]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows8.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult8.data[Math.min(...Object2)];
    } else {
      data = mainDataResult8.data[Math.min(...Object) - 1];
    }

    setMainDataResult8((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState8({
        [data != undefined ? data[DATA_ITEM_KEY8] : newData[0]]: true,
      });
    }
  };

  const onSaveClick = () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      hrreviewnum_s: [],
      reviewlvl1_s: [],
      title_s: [],
      contents_s: [],
      commyn_s: [],

      hrreview_stnum_s: [],
      dptcd_s: [],
      remark1_s: [],

      monthlyhrreview_s: [],
      monthlyhrreviewseq_s: [],
      quantitative_evalution_s: [],
      qualitative_evalution_s: [],

      badnum_s: [],
      badseq_s: [],
      baddt_s: [],
      badcd_s: [],
      remark_s: [],

      seq_s: [],
      rnpdiv_s: [],
      reqdt_s: [],
      attdatnum_s: [],
      reloffice_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        hrreviewnum = "",
        reviewlvl1 = "",
        title = "",
        contents = "",
        commyn = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.hrreviewnum_s.push(hrreviewnum);
      dataArr.reviewlvl1_s.push(reviewlvl1);
      dataArr.title_s.push(title);
      dataArr.contents_s.push(contents);
      dataArr.commyn_s.push(commyn == true ? "Y" : "N");
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        hrreviewnum = "",
        reviewlvl1 = "",
        title = "",
        contents = "",
        commyn = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.hrreviewnum_s.push(hrreviewnum);
      dataArr.reviewlvl1_s.push(reviewlvl1);
      dataArr.title_s.push(title);
      dataArr.contents_s.push(contents);
      dataArr.commyn_s.push(commyn == true ? "Y" : "N");
    });
    setParaData((prev) => ({
      ...prev,
      workType: "HU270T",
      orgdiv: sessionOrgdiv,
      location: location,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      hrreviewnum_s: dataArr.hrreviewnum_s.join("|"),
      reviewlvl1_s: dataArr.reviewlvl1_s.join("|"),
      title_s: dataArr.title_s.join("|"),
      contents_s: dataArr.contents_s.join("|"),
      commyn_s: dataArr.commyn_s.join("|"),
    }));
  };
  const onSaveClick2 = () => {
    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows2.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      hrreviewnum_s: [],
      reviewlvl1_s: [],
      title_s: [],
      contents_s: [],
      commyn_s: [],

      hrreview_stnum_s: [],
      dptcd_s: [],
      remark1_s: [],

      monthlyhrreview_s: [],
      monthlyhrreviewseq_s: [],
      quantitative_evalution_s: [],
      qualitative_evalution_s: [],

      badnum_s: [],
      badseq_s: [],
      baddt_s: [],
      badcd_s: [],
      remark_s: [],

      seq_s: [],
      rnpdiv_s: [],
      reqdt_s: [],
      attdatnum_s: [],
      reloffice_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        hrreviewnum = "",
        hrreview_stnum = "",
        dptcd = "",
        remark1 = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.hrreviewnum_s.push(hrreviewnum);
      dataArr.hrreview_stnum_s.push(hrreview_stnum);
      dataArr.dptcd_s.push(dptcd);
      dataArr.remark1_s.push(remark1);
    });
    deletedMainRows2.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        hrreviewnum = "",
        hrreview_stnum = "",
        dptcd = "",
        remark1 = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.hrreviewnum_s.push(hrreviewnum);
      dataArr.hrreview_stnum_s.push(hrreview_stnum);
      dataArr.dptcd_s.push(dptcd);
      dataArr.remark1_s.push(remark1);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "HU275T",
      orgdiv: sessionOrgdiv,
      location: location,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      hrreviewnum_s: dataArr.hrreviewnum_s.join("|"),
      hrreview_stnum_s: dataArr.hrreview_stnum_s.join("|"),
      dptcd_s: dataArr.dptcd_s.join("|"),
      remark1_s: dataArr.remark1_s.join("|"),
    }));
  };

  const onSaveClick3 = () => {
    if (information.interviewee == "") {
      alert("필수값을 채워주세요");
    } else {
      let dataArr: TdataArr = {
        rowstatus_s: [],
        hrreviewnum_s: [],
        reviewlvl1_s: [],
        title_s: [],
        contents_s: [],
        commyn_s: [],

        hrreview_stnum_s: [],
        dptcd_s: [],
        remark1_s: [],

        monthlyhrreview_s: [],
        monthlyhrreviewseq_s: [],
        quantitative_evalution_s: [],
        qualitative_evalution_s: [],

        badnum_s: [],
        badseq_s: [],
        baddt_s: [],
        badcd_s: [],
        remark_s: [],

        seq_s: [],
        rnpdiv_s: [],
        reqdt_s: [],
        attdatnum_s: [],
        reloffice_s: [],
      };

      let valid = true;

      const dataItem = mainDataResult8.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });
      const dataItem2 = mainDataResult9.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });

      dataItem.map((item) => {
        if (item.reviewlvl1 == "" || item.title == "") {
          valid = false;
        }
      });

      if (valid != true) {
        alert("필수값을 입력해주세요.");
        return false;
      }

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          reviewlvl1 = "",
          title = "",
          contents = "",
          monthlyhrreview = "",
          monthlyhrreviewseq = "",
          quantitative_evalution = "",
          qualitative_evalution = "",
          hrreviewnum = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.reviewlvl1_s.push(reviewlvl1);
        dataArr.title_s.push(title);
        dataArr.contents_s.push(contents);
        dataArr.monthlyhrreview_s.push(monthlyhrreview);
        dataArr.monthlyhrreviewseq_s.push(
          monthlyhrreviewseq == undefined ? 0 : monthlyhrreviewseq
        );
        dataArr.quantitative_evalution_s.push(quantitative_evalution);
        dataArr.qualitative_evalution_s.push(qualitative_evalution);
        dataArr.hrreviewnum_s.push(hrreviewnum);
      });
      dataItem2.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          reviewlvl1 = "",
          title = "",
          contents = "",
          monthlyhrreview = "",
          monthlyhrreviewseq = "",
          quantitative_evalution = "",
          qualitative_evalution = "",
          hrreviewnum = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.reviewlvl1_s.push(reviewlvl1);
        dataArr.title_s.push(title);
        dataArr.contents_s.push(contents);
        dataArr.monthlyhrreview_s.push(monthlyhrreview);
        dataArr.monthlyhrreviewseq_s.push(
          monthlyhrreviewseq == undefined ? 0 : monthlyhrreviewseq
        );
        dataArr.quantitative_evalution_s.push(quantitative_evalution);
        dataArr.qualitative_evalution_s.push(qualitative_evalution);
        dataArr.hrreviewnum_s.push(hrreviewnum);
      });
      deletedMainRows8.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          reviewlvl1 = "",
          title = "",
          contents = "",
          monthlyhrreview = "",
          monthlyhrreviewseq = "",
          quantitative_evalution = "",
          qualitative_evalution = "",
          hrreviewnum = "",
        } = item;
        dataArr.rowstatus_s.push("D");
        dataArr.reviewlvl1_s.push(reviewlvl1);
        dataArr.title_s.push(title);
        dataArr.contents_s.push(contents);
        dataArr.monthlyhrreview_s.push(monthlyhrreview);
        dataArr.monthlyhrreviewseq_s.push(monthlyhrreviewseq);
        dataArr.quantitative_evalution_s.push(quantitative_evalution);
        dataArr.qualitative_evalution_s.push(qualitative_evalution);
        dataArr.hrreviewnum_s.push(hrreviewnum);
      });
      setParaData((prev) => ({
        ...prev,
        workType: workType,
        orgdiv: sessionOrgdiv,
        location: location,

        hrreviewnum_s: dataArr.hrreviewnum_s.join("|"),
        monthlyhrreview: information.monthlyhrreview,
        interviewdt: convertDateToStr(information.interviewdt),
        yyyymm: convertDateToStr(information.yyyymm).substring(0, 6),
        interviewer: information.interviewer,
        interviewee: information.interviewee,
        difficulty: information.difficulty,
        remark: information.remark1,

        rowstatus_s: dataArr.rowstatus_s.join("|"),
        reviewlvl1_s: dataArr.reviewlvl1_s.join("|"),
        title_s: dataArr.title_s.join("|"),
        contents_s: dataArr.contents_s.join("|"),
        monthlyhrreview_s: dataArr.monthlyhrreview_s.join("|"),
        monthlyhrreviewseq_s: dataArr.monthlyhrreviewseq_s.join("|"),
        quantitative_evalution_s: dataArr.quantitative_evalution_s.join("|"),
        qualitative_evalution_s: dataArr.qualitative_evalution_s.join("|"),
      }));
    }
  };

  const onSaveClick5 = () => {
    const dataItem = mainDataResult5.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows5.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      hrreviewnum_s: [],
      reviewlvl1_s: [],
      title_s: [],
      contents_s: [],
      commyn_s: [],

      hrreview_stnum_s: [],
      dptcd_s: [],
      remark1_s: [],

      monthlyhrreview_s: [],
      monthlyhrreviewseq_s: [],
      quantitative_evalution_s: [],
      qualitative_evalution_s: [],

      badnum_s: [],
      badseq_s: [],
      baddt_s: [],
      badcd_s: [],
      remark_s: [],

      seq_s: [],
      rnpdiv_s: [],
      reqdt_s: [],
      attdatnum_s: [],
      reloffice_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        badnum = "",
        badseq = "",
        baddt = "",
        badcd = "",
        remark = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.badnum_s.push(badnum);
      dataArr.badseq_s.push(badseq);
      dataArr.baddt_s.push(baddt == "99991231" ? "" : baddt);
      dataArr.badcd_s.push(badcd);
      dataArr.remark_s.push(remark);
    });
    deletedMainRows5.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        badnum = "",
        badseq = "",
        baddt = "",
        badcd = "",
        remark = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.badnum_s.push(badnum);
      dataArr.badseq_s.push(badseq);
      dataArr.baddt_s.push(baddt == "99991231" ? "" : baddt);
      dataArr.badcd_s.push(badcd);
      dataArr.remark_s.push(remark);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "BAD",
      orgdiv: sessionOrgdiv,
      location: location,
      interviewee: information.interviewee,
      monthlyhrreview: information.monthlyhrreview,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      badnum_s: dataArr.badnum_s.join("|"),
      badseq_s: dataArr.badseq_s.join("|"),
      baddt_s: dataArr.baddt_s.join("|"),
      badcd_s: dataArr.badcd_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
    }));
  };

  const onSaveClick7 = () => {
    const dataItem = mainDataResult7.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows7.length == 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      hrreviewnum_s: [],
      reviewlvl1_s: [],
      title_s: [],
      contents_s: [],
      commyn_s: [],

      hrreview_stnum_s: [],
      dptcd_s: [],
      remark1_s: [],

      monthlyhrreview_s: [],
      monthlyhrreviewseq_s: [],
      quantitative_evalution_s: [],
      qualitative_evalution_s: [],

      badnum_s: [],
      badseq_s: [],
      baddt_s: [],
      badcd_s: [],
      remark_s: [],

      seq_s: [],
      rnpdiv_s: [],
      reqdt_s: [],
      attdatnum_s: [],
      reloffice_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        rnpdiv = "",
        reqdt = "",
        contents = "",
        remark = "",
        seq = "",
        attdatnum = "",
        reloffice = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.rnpdiv_s.push(rnpdiv);
      dataArr.reqdt_s.push(reqdt == "99991231" ? "" : reqdt);
      dataArr.contents_s.push(contents);
      dataArr.remark_s.push(remark);
      dataArr.seq_s.push(seq);
      dataArr.attdatnum_s.push(attdatnum);
      dataArr.reloffice_s.push(reloffice);
    });
    deletedMainRows7.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        rnpdiv = "",
        reqdt = "",
        contents = "",
        remark = "",
        seq = "",
        attdatnum = "",
        reloffice = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.rnpdiv_s.push(rnpdiv);
      dataArr.reqdt_s.push(reqdt == "99991231" ? "" : reqdt);
      dataArr.contents_s.push(contents);
      dataArr.remark_s.push(remark);
      dataArr.seq_s.push(seq);
      dataArr.attdatnum_s.push(attdatnum);
      dataArr.reloffice_s.push(reloffice);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "REWARD",
      orgdiv: sessionOrgdiv,
      location: location,
      interviewee: information.interviewee,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      rnpdiv_s: dataArr.rnpdiv_s.join("|"),
      reqdt_s: dataArr.reqdt_s.join("|"),
      contents_s: dataArr.contents_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      attdatnum_s: dataArr.attdatnum_s.join("|"),
      reloffice_s: dataArr.reloffice_s.join("|"),
    }));
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    location: "",
    rowstatus_s: "",
    hrreviewnum_s: "",
    reviewlvl1_s: "",
    title_s: "",
    contents_s: "",
    commyn_s: "",

    hrreview_stnum_s: "",
    dptcd_s: "",
    remark1_s: "",

    monthlyhrreview: "",
    interviewdt: "",
    yyyymm: "",
    interviewer: "",
    interviewee: "",
    difficulty: "",
    remark: "",

    monthlyhrreview_s: "",
    monthlyhrreviewseq_s: "",
    quantitative_evalution_s: "",
    qualitative_evalution_s: "",

    badnum_s: "",
    badseq_s: "",
    baddt_s: "",
    badcd_s: "",
    remark_s: "",

    seq_s: "",
    rnpdiv_s: "",
    reqdt_s: "",
    attdatnum_s: "",
    reloffice_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A4000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,

      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_hrreviewnum_s": paraData.hrreviewnum_s,
      "@p_reviewlvl1_s": paraData.reviewlvl1_s,
      "@p_title_s": paraData.title_s,
      "@p_contents_s": paraData.contents_s,
      "@p_commyn_s": paraData.commyn_s,

      "@p_hrreview_stnum_s": paraData.hrreview_stnum_s,
      "@p_dptcd_s": paraData.dptcd_s,
      "@p_remark1_s": paraData.remark1_s,

      "@p_monthlyhrreview": paraData.monthlyhrreview,
      "@p_interviewdt": paraData.interviewdt,
      "@p_yyyymm": paraData.yyyymm,
      "@p_interviewer": paraData.interviewer,
      "@p_interviewee": paraData.interviewee,
      "@p_difficulty": paraData.difficulty,
      "@p_remark": paraData.remark,

      "@p_monthlyhrreview_s": paraData.monthlyhrreview_s,
      "@p_monthlyhrreviewseq_s": paraData.monthlyhrreviewseq_s,
      "@p_quantitative_evalution_s": paraData.quantitative_evalution_s,
      "@p_qualitative_evalution_s": paraData.qualitative_evalution_s,

      "@p_badnum_s": paraData.badnum_s,
      "@p_badseq_s": paraData.badseq_s,
      "@p_baddt_s": paraData.baddt_s,
      "@p_badcd_s": paraData.badcd_s,
      "@p_remark_s": paraData.remark_s,

      "@p_seq_s": paraData.seq_s,
      "@p_rnpdiv_s": paraData.rnpdiv_s,
      "@p_reqdt_s": paraData.reqdt_s,
      "@p_attdatnum_s": paraData.attdatnum_s,
      "@p_reloffice_s": paraData.reloffice_s,

      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A4000W",
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

    if (data.isSuccess == true) {
      let array: any[] = [];

      if (paraData.workType == "REWARD") {
        deletedMainRows7.map((item: any) => {
          array.push(item.attdatnum);
        });
        setDeletedAttadatnums(array);
      } else {
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
      }
      deletedMainRows = [];
      deletedMainRows2 = [];
      deletedMainRows5 = [];
      deletedMainRows6 = [];
      deletedMainRows7 = [];
      deletedMainRows8 = [];
      setUnsavedName([]);
      setUnsavedAttadatnums([]);
      resetAllGrid();
      if (tabSelected == 0) {
        setFilters((prev) => ({
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
        setFilters5((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters6((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters7((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
      } else if (tabSelected == 1) {
        setFilters((prev) => ({
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
        setFilters5((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters6((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
        setFilters7((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
      }
      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        location: "",
        rowstatus_s: "",
        hrreviewnum_s: "",
        reviewlvl1_s: "",
        title_s: "",
        contents_s: "",
        commyn_s: "",

        hrreview_stnum_s: "",
        dptcd_s: "",
        remark1_s: "",

        monthlyhrreview: "",
        interviewdt: "",
        yyyymm: "",
        interviewer: "",
        interviewee: "",
        difficulty: "",
        remark: "",

        monthlyhrreview_s: "",
        monthlyhrreviewseq_s: "",
        quantitative_evalution_s: "",
        qualitative_evalution_s: "",

        badnum_s: "",
        badseq_s: "",
        baddt_s: "",
        badcd_s: "",
        remark_s: "",

        seq_s: "",
        rnpdiv_s: "",
        reqdt_s: "",
        attdatnum_s: "",
        reloffice_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    const newData = mainDataResult6.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState6)[0])
        ? {
            ...item,
            attdatnum: attdatnum6,
            files: files6,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );

    setMainDataResult6((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [attdatnum6, files6]);

  useEffect(() => {
    const newData = mainDataResult7.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState7)[0])
        ? {
            ...item,
            attdatnum: attdatnum7,
            files: files7,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );

    setMainDataResult7((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [attdatnum7, files7]);

  const onAddALLClick = () => {
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setWorkType("N");
    setInformation({
      orgdiv: sessionOrgdiv,
      monthlyhrreview: "",
      interviewdt: new Date(),
      interviewer: userId,
      interviewee: "",
      dptcd: "",
      difficulty: "0.0",
      remark1: "",
      yyyymm: monthAgo,
    });
    setInformation2({
      orgdiv: "",
      prsnnum: "",
      rate: "0 건",
      stay: "0시간 0분",
      workOrderMM: "",
      workOrdercnt: "",
      OrderPercent: 0,
      newworkcnt: "",
      ModWorkCnt: "",
      workTime: "",
      bad: "0 건",
      edu: "0 건",
      annsum: "",
      annMonth: "",
    });
    deletedMainRows5 = [];
    deletedMainRows6 = [];
    deletedMainRows7 = [];
    deletedMainRows8 = [];
    setPage5(initialPageState);
    setPage6(initialPageState);
    setPage7(initialPageState);
    setPage8(initialPageState);
    setPage9(initialPageState);
    setMainDataResult5(process([], mainDataState5));
    setMainDataResult6(process([], mainDataState6));
    setMainDataResult7(process([], mainDataState7));
    setMainDataResult8(process([], mainDataState8));
    setMainDataResult9(process([], mainDataState9));
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteALLClick = () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult3.data.length == 0) {
      alert("데이터가 없습니다.");
    } else {
      const selectRow = mainDataResult3.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState3)[0]
      )[0];

      setParaData((prev) => ({
        ...prev,
        workType: "D",
        monthlyhrreview: selectRow.monthlyhrreview,
      }));
    }
  };
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const updateActiveIndex = () => {
      // swiper 객체의 현재 인덱스를 상태로 설정
      if (swiper && isMobile) {
        setActiveIndex(swiper.activeIndex);
      }
    };

    if (swiper && isMobile) {
      swiper.on("slideChange", updateActiveIndex);
    }
    return () => {
      if (swiper && isMobile) {
        swiper.off("slideChange", updateActiveIndex);
      }
    };
  }, [swiper]);

  return (
    <>
      <TitleContainer>
        <Title>인사고과관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A4000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      {isMobile ? (
        <>
          <TabStrip
            style={{ width: "100%" }}
            selected={tabSelected}
            onSelect={handleSelectTab}
            scrollable={isMobile}
          >
            <TabStripTab title="인사고과기준">
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <SwiperSlide key={0}>
                  <GridContainer style={{ width: "100%" }}>
                    <GridTitleContainer className="ButtonContainer">
                      <GridTitle>인사고과기준</GridTitle>
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
                      fileName="인사고과관리"
                    >
                      <Grid
                        style={{ height: deviceHeight - height - height3 }}
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
                          customOptionData.menuCustomColumnOptions["grdList"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    cell={
                                      comboField.includes(item.fieldName)
                                        ? CustomComboBoxCell
                                        : checkField.includes(item.fieldName)
                                        ? CheckBoxCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide key={1}>
                  <GridContainer style={{ width: "100%" }}>
                    <GridTitleContainer className="ButtonContainer">
                      <GridTitle>인사고과셋팅기준</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick2}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                          disabled={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] != undefined
                              ? mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].commyn == false &&
                                mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].rowstatus != "N"
                                ? false
                                : true
                              : true
                          }
                        ></Button>
                        <Button
                          onClick={onDeleteClick2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] != undefined
                              ? mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].commyn == false &&
                                mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].rowstatus != "N"
                                ? false
                                : true
                              : true
                          }
                        ></Button>
                        <Button
                          onClick={onSaveClick2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          title="저장"
                          disabled={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] != undefined
                              ? mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].commyn == false &&
                                mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].rowstatus != "N"
                                ? false
                                : true
                              : true
                          }
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult2.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName="인사고과관리"
                    >
                      <Grid
                        style={{ height: deviceHeight - height - height3 }}
                        data={process(
                          mainDataResult2.data.map((row) => ({
                            ...row,
                            [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
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
                          customOptionData.menuCustomColumnOptions["grdList2"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    cell={
                                      comboField.includes(item.fieldName)
                                        ? CustomComboBoxCell
                                        : checkField.includes(item.fieldName)
                                        ? CheckBoxCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell2
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </SwiperSlide>
              </Swiper>
            </TabStripTab>
            <TabStripTab title="월별인사평가">
              <FilterContainer>
                <FilterBox>
                  <tbody>
                    <tr>
                      <th>연월</th>
                      <td>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="frdt"
                            value={filters3.frdt}
                            format="yyyy-MM"
                            onChange={filterInputChange}
                            placeholder=""
                            calendar={MonthCalendar}
                            className="required"
                          />
                          ~
                          <DatePicker
                            name="todt"
                            value={filters3.todt}
                            format="yyyy-MM"
                            onChange={filterInputChange}
                            placeholder=""
                            calendar={MonthCalendar}
                            className="required"
                          />
                        </div>
                      </td>
                      <th>면접관</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="Interviewer"
                            value={filters3.Interviewer}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="prsnnm"
                            valueField="prsnnum"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>면접자</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="Interviewee"
                            value={filters3.Interviewee}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="prsnnm"
                            valueField="prsnnum"
                          />
                        )}
                      </td>
                      <th>면접자 부서</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="dptcd"
                            value={filters3.dptcd}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="dptnm"
                            valueField="dptcd"
                          />
                        )}
                      </td>
                      <th>인사평가번호</th>
                      <td>
                        <Input
                          name="Monthly_hrreview"
                          type="text"
                          value={filters3.Monthly_hrreview}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FilterBox>
              </FilterContainer>
              {activeIndex > 1 && (
                <ButtonContainer
                  style={{
                    justifyContent: "space-around",
                  }}
                  className="ButtonContainer4"
                >
                  {["기본", "실적 집계", "불량&교육&상벌", "상세"].map(
                    (label, index) => (
                      <Button
                        key={label}
                        onClick={() => {
                          if (swiper) {
                            swiper.slideTo(index + 1);
                          }
                        }}
                        themeColor={
                          activeIndex === index + 1 ? "primary" : undefined
                        }
                      >
                        {label}
                      </Button>
                    )
                  )}
                </ButtonContainer>
              )}
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <SwiperSlide key={0}>
                  <GridContainer style={{ width: "100%" }}>
                    <GridTitleContainer className="ButtonContainer">
                      <GridTitle>월별인사평가요약</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddALLClick}
                          themeColor={"primary"}
                          icon="file-add"
                        >
                          신규
                        </Button>
                        <Button
                          onClick={onDeleteALLClick}
                          icon="delete"
                          fillMode="outline"
                          themeColor={"primary"}
                        >
                          삭제
                        </Button>
                        <Button
                          onClick={onSaveClick3}
                          icon="save"
                          fillMode="outline"
                          themeColor={"primary"}
                        >
                          저장
                        </Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult3.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="인사고과관리"
                    >
                      <Grid
                        style={{ height: deviceHeight - height - height3 }}
                        data={process(
                          mainDataResult3.data.map((row) => ({
                            ...row,
                            dptcd: dptcdListData.find(
                              (item: any) => item.dptcd == row.dptcd
                            )?.dptnm,
                            interviewee: UserListData.find(
                              (item: any) => item.prsnnum == row.interviewee
                            )?.prsnnm,
                            [SELECTED_FIELD]: selectedState3[idGetter3(row)], //선택된 데이터
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
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList3"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    cell={
                                      dateField.includes(item.fieldName)
                                        ? DateCell
                                        : monthField.includes(item.fieldName)
                                        ? MonthDateCell
                                        : numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell3
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide key={1}>
                  <GridContainer style={{ width: "100%" }}>
                    <ButtonContainer
                      style={{
                        justifyContent: "space-around",
                      }}
                      className="ButtonContainer4"
                    >
                      {["기본", "실적 집계", "불량&교육&상벌", "상세"].map(
                        (label, index) => (
                          <Button
                            key={label}
                            onClick={() => {
                              if (swiper) {
                                swiper.slideTo(index + 1);
                              }
                            }}
                            themeColor={
                              activeIndex === index + 1 ? "primary" : undefined
                            }
                          >
                            {label}
                          </Button>
                        )
                      )}
                    </ButtonContainer>
                    <FormBoxWrap
                      border={true}
                      style={{
                        height: deviceHeight - height3 - height4,
                        overflow: "auto",
                      }}
                    >
                      <GridTitleContainer className="ButtonContainer2">
                        <GridTitle>월별인사평가기본</GridTitle>
                      </GridTitleContainer>
                      <FormBox>
                        <tbody>
                          <tr>
                            <th>인사평가번호</th>
                            <td>
                              <Input
                                name="monthlyhrreview"
                                type="text"
                                value={information.monthlyhrreview}
                                className="readonly"
                              />
                            </td>
                            <th>인사평가일자</th>
                            <td>
                              <DatePicker
                                name="interviewdt"
                                value={information.interviewdt}
                                format="yyyy-MM-dd"
                                onChange={InputChange}
                                placeholder=""
                                className="required"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>면접관</th>
                            <td>
                              {bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="interviewer"
                                  value={information.interviewer}
                                  bizComponentId="L_HU250T"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                  valueField="prsnnum"
                                  textField="prsnnm"
                                  para="HU_A4000W"
                                />
                              )}
                            </td>
                            <th>연월</th>
                            <td>
                              <DatePicker
                                name="yyyymm"
                                value={information.yyyymm}
                                format="yyyy-MM"
                                onChange={InputChange}
                                calendar={MonthCalendar}
                                placeholder=""
                                className="required"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>면접자</th>
                            <td>
                              {information.monthlyhrreview == ""
                                ? bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="interviewee"
                                      value={information.interviewee}
                                      bizComponentId="L_HU250T"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                      valueField="prsnnum"
                                      textField="prsnnm"
                                      para="HU_A4000W"
                                      className="required"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="interviewee"
                                      value={information.interviewee}
                                      bizComponentId="L_HU250T"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                      valueField="prsnnum"
                                      textField="prsnnm"
                                      para="HU_A4000W"
                                      disabled={true}
                                      className="readonly"
                                    />
                                  )}
                            </td>
                            <th>면접자 부서</th>
                            <td>
                              {bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="dptcd"
                                  value={information.dptcd}
                                  bizComponentId="L_dptcd_001"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                  valueField="dptcd"
                                  textField="dptnm"
                                  para="HU_A4000W"
                                  disabled={true}
                                  className="readonly"
                                />
                              )}
                            </td>
                          </tr>
                          <tr>
                            <th>업무난이도</th>
                            <td>
                              <NumericTextBox
                                name="difficulty"
                                value={
                                  information.difficulty == ""
                                    ? 0.0
                                    : parseFloat(information.difficulty)
                                }
                                onChange={InputChange}
                                format="n1"
                              />
                            </td>
                            <th></th>
                            <td>
                              <ButtonMui
                                aria-describedby={id}
                                variant="outlined"
                                onClick={handleClick}
                                style={{ width: "100%" }}
                              >
                                ?
                              </ButtonMui>
                              <Popover
                                id={id}
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handleClose}
                                anchorOrigin={{
                                  vertical: "bottom",
                                  horizontal: "left",
                                }}
                              >
                                <Typography sx={{ p: 1 }}>
                                  업무 난이도 단계: 1~10 - 선행 단계가
                                  패스되어야만 함.
                                </Typography>
                                <Typography sx={{ p: 1 }}></Typography>
                                <Typography sx={{ p: 1 }}>
                                  1: 잡무, 단순업무, Browser모듈 이해 15% 미만
                                </Typography>
                                <Typography sx={{ p: 1 }}>
                                  2: 상세 지시 받은 업무 처리 가능, Browser모듈
                                  이해 30% 미만
                                </Typography>
                                <Typography sx={{ p: 1 }}>
                                  3: 컨셉만 지시 받은 정형적 업무 처리 가능,
                                  Browser모듈 이해 60% 미만
                                </Typography>
                                <Typography sx={{ p: 1 }}>
                                  4: 능동적으로 비 정형적 업무 처리 가능,
                                  Browser모듈 이해 90% 미만
                                </Typography>
                                <Typography sx={{ p: 1 }}>
                                  5: 자체 업무 설계 / 개발 / 추진 가능,
                                  Browser모듈 이해 90% 이상
                                </Typography>
                                <Typography sx={{ p: 1 }}>
                                  6: 당사 제품(S/W, H/W, IaaS-PaaS-SaaS) 이해도
                                  95% 이상 이해하며 미래지향적 업무 아이디어
                                  제시
                                </Typography>
                                <Typography sx={{ p: 1 }}>
                                  7: 관리 업무 수행 가능 (관리, 서포트 level
                                  수행)
                                </Typography>
                                <Typography sx={{ p: 1 }}>
                                  8: 타팀 및 협력사 협업 능동적으로 가능
                                </Typography>
                                <Typography sx={{ p: 1 }}>
                                  9: 추가 수익을 낼 수 있는 신 사업 계획 및 추진
                                  가능
                                </Typography>
                                <Typography sx={{ p: 1 }}>
                                  10: 의사결정정보를 적극 제공하며, 경영자적
                                  관점에서 업무 처리
                                </Typography>
                              </Popover>
                            </td>
                          </tr>
                          <tr>
                            <th>비고</th>
                            <td colSpan={3}>
                              <TextArea
                                value={information.remark1}
                                name="remark1"
                                rows={2}
                                onChange={InputChange}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </FormBoxWrap>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide key={2}>
                  <GridContainer style={{ width: "100%" }}>
                    <FormBoxWrap
                      border={true}
                      style={{
                        height: deviceHeight - height3 - height4,
                        overflow: "auto",
                      }}
                    >
                      <GridTitleContainer>
                        <GridTitle>개인별 월별 실적 집계</GridTitle>
                        <ButtonContainer>
                          <Button
                            onClick={() => {
                              setFilters4((prev) => ({
                                ...prev,
                                isSearch: true,
                              }));
                            }}
                            icon="search"
                            themeColor={"primary"}
                            title="조회"
                          ></Button>
                        </ButtonContainer>
                      </GridTitleContainer>
                      <FormBox>
                        <tbody>
                          <tr>
                            <th>지각</th>
                            <td colSpan={2}>
                              <Input
                                name="rate"
                                type="text"
                                value={information2.rate}
                                className="readonly"
                              />
                            </td>
                            <th>연차사용</th>
                            <td>
                              <Input
                                name="annsum"
                                type="text"
                                value={information2.annsum}
                                className="readonly"
                              />
                            </td>
                            <td>
                              <Input
                                name="annMonth"
                                type="text"
                                value={information2.annMonth}
                                className="readonly"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>체류시간</th>
                            <td colSpan={2}>
                              <Input
                                name="stay"
                                type="text"
                                value={information2.stay}
                                className="readonly"
                              />
                            </td>
                            <th>근무시간</th>
                            <td colSpan={2}>
                              <Input
                                name="workTime"
                                type="text"
                                value={information2.workTime}
                                className="readonly"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>업무지시</th>
                            <td>
                              <Input
                                name="workOrdercnt"
                                type="text"
                                value={information2.workOrdercnt}
                                className="readonly"
                              />
                            </td>
                            <td>
                              <Input
                                name="workOrderMM"
                                type="text"
                                value={information2.workOrderMM}
                                className="readonly"
                              />
                            </td>
                            <th>불량/교육</th>
                            <td>
                              <Input
                                name="bad"
                                type="text"
                                value={information2.bad}
                                className="readonly"
                              />
                            </td>
                            <td>
                              <Input
                                name="edu"
                                type="text"
                                value={information2.edu}
                                className="readonly"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>지시준수율</th>
                            <td colSpan={2}>
                              <Input
                                name="OrderPercent"
                                type="text"
                                value={information2.OrderPercent}
                                className="readonly"
                              />
                            </td>
                            <th></th>
                            <td colSpan={2}></td>
                          </tr>
                          <tr>
                            <th>신규개발</th>
                            <td colSpan={2}>
                              <Input
                                name="newworkcnt"
                                type="text"
                                value={information2.newworkcnt}
                                className="readonly"
                              />
                            </td>
                            <th>수정개발</th>
                            <td colSpan={2}>
                              <Input
                                name="ModWorkCnt"
                                type="text"
                                value={information2.OrderPercent}
                                className="readonly"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </FormBoxWrap>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide key={3}>
                  <TabStrip
                    style={{ width: "100%" }}
                    selected={tabSelected2}
                    onSelect={handleSelectTab2}
                    scrollable={isMobile}
                  >
                    <TabStripTab title="불량">
                      <GridContainer>
                        <GridTitleContainer className="ButtonContainer">
                          <GridTitle>불량내역</GridTitle>
                          <ButtonContainer>
                            <Button
                              onClick={onAddClick5}
                              themeColor={"primary"}
                              icon="plus"
                              title="행 추가"
                              disabled={workType == "N" ? true : false}
                            ></Button>
                            <Button
                              onClick={onDeleteClick5}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="minus"
                              title="행 삭제"
                              disabled={workType == "N" ? true : false}
                            ></Button>
                            <Button
                              onClick={onSaveClick5}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="save"
                              title="저장"
                              disabled={workType == "N" ? true : false}
                            ></Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <ExcelExport
                          data={mainDataResult5.data}
                          ref={(exporter) => {
                            _export4 = exporter;
                          }}
                          fileName="인사고과관리"
                        >
                          <Grid
                            style={{
                              height:
                                deviceHeight -
                                height -
                                height3 -
                                height3 -
                                height4,
                            }}
                            data={process(
                              mainDataResult5.data.map((row) => ({
                                ...row,
                                baddt: row.baddt
                                  ? new Date(dateformat(row.baddt))
                                  : new Date(dateformat("99991231")),
                                [SELECTED_FIELD]:
                                  selectedState5[idGetter5(row)], //선택된 데이터
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
                            //정렬기능
                            sortable={true}
                            onSortChange={onMainSortChange5}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                            onItemChange={onMainItemChange5}
                            cellRender={customCellRender5}
                            rowRender={customRowRender5}
                            editField={EDIT_FIELD}
                          >
                            <GridColumn
                              field="rowstatus"
                              title=" "
                              width="50px"
                            />
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList5"
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
                                ?.map(
                                  (item: any, idx: number) =>
                                    item.sortOrder !== -1 && (
                                      <GridColumn
                                        key={idx}
                                        field={item.fieldName}
                                        title={item.caption}
                                        width={item.width}
                                        cell={
                                          comboField.includes(item.fieldName)
                                            ? CustomComboBoxCell
                                            : dateField.includes(item.fieldName)
                                            ? DateCell
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? mainTotalFooterCell5
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </TabStripTab>
                    <TabStripTab title="교육내역">
                      <FormContext6.Provider
                        value={{
                          attdatnum6,
                          files6,
                          setAttdatnum6,
                          setFiles6,
                          mainDataState6,
                          setMainDataState6,
                          // fetchGrid,
                        }}
                      >
                        <GridContainer>
                          <GridTitleContainer className="ButtonContainer">
                            <GridTitle>교육내역</GridTitle>
                            <ButtonContainer>
                              <Button
                                onClick={onAddClick6}
                                themeColor={"primary"}
                                icon="plus"
                                title="행 추가"
                                disabled={workType == "N" ? true : false}
                              ></Button>
                              <Button
                                onClick={onDeleteClick6}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="minus"
                                title="행 삭제"
                                disabled={workType == "N" ? true : false}
                              ></Button>
                              <Button
                                //onClick={onSaveClick6}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="save"
                                title="저장"
                                disabled={workType == "N" ? true : false}
                              ></Button>
                            </ButtonContainer>
                          </GridTitleContainer>
                          <ExcelExport
                            data={mainDataResult6.data}
                            ref={(exporter) => {
                              _export5 = exporter;
                            }}
                            fileName="인사고과관리"
                          >
                            <Grid
                              style={{
                                height:
                                  deviceHeight -
                                  height -
                                  height3 -
                                  height3 -
                                  height4,
                              }}
                              data={process(
                                mainDataResult6.data.map((row) => ({
                                  ...row,
                                  recdt: row.recdt
                                    ? new Date(dateformat(row.recdt))
                                    : new Date(dateformat("99991231")),
                                  [SELECTED_FIELD]:
                                    selectedState6[idGetter6(row)], //선택된 데이터
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
                              <GridColumn
                                field="rowstatus"
                                title=" "
                                width="50px"
                              />
                              {customOptionData !== null &&
                                customOptionData.menuCustomColumnOptions[
                                  "grdList6"
                                ]
                                  ?.sort(
                                    (a: any, b: any) =>
                                      a.sortOrder - b.sortOrder
                                  )
                                  ?.map(
                                    (item: any, idx: number) =>
                                      item.sortOrder !== -1 && (
                                        <GridColumn
                                          key={idx}
                                          field={item.fieldName}
                                          title={item.caption}
                                          width={item.width}
                                          cell={
                                            comboField.includes(item.fieldName)
                                              ? CustomComboBoxCell
                                              : dateField.includes(
                                                  item.fieldName
                                                )
                                              ? DateCell
                                              : attdatnumField.includes(
                                                  item.fieldName
                                                )
                                              ? ColumnCommandCell6
                                              : undefined
                                          }
                                          footerCell={
                                            item.sortOrder == 0
                                              ? mainTotalFooterCell6
                                              : undefined
                                          }
                                        />
                                      )
                                  )}
                            </Grid>
                          </ExcelExport>
                        </GridContainer>
                      </FormContext6.Provider>
                    </TabStripTab>
                    <TabStripTab title="상벌사항">
                      <FormContext7.Provider
                        value={{
                          attdatnum7,
                          files7,
                          setAttdatnum7,
                          setFiles7,
                          mainDataState7,
                          setMainDataState7,
                          // fetchGrid,
                        }}
                      >
                        <GridContainer>
                          <GridTitleContainer className="ButtonContainer">
                            <GridTitle>상벌내역</GridTitle>
                            <ButtonContainer>
                              <Button
                                onClick={onAddClick7}
                                themeColor={"primary"}
                                icon="plus"
                                title="행 추가"
                                disabled={workType == "N" ? true : false}
                              ></Button>
                              <Button
                                onClick={onDeleteClick7}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="minus"
                                title="행 삭제"
                                disabled={workType == "N" ? true : false}
                              ></Button>
                              <Button
                                onClick={onSaveClick7}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="save"
                                title="저장"
                                disabled={workType == "N" ? true : false}
                              ></Button>
                            </ButtonContainer>
                          </GridTitleContainer>
                          <ExcelExport
                            data={mainDataResult7.data}
                            ref={(exporter) => {
                              _export6 = exporter;
                            }}
                            fileName="인사고과관리"
                          >
                            <Grid
                              style={{
                                height:
                                  deviceHeight -
                                  height -
                                  height3 -
                                  height3 -
                                  height4,
                              }}
                              data={process(
                                mainDataResult7.data.map((row) => ({
                                  ...row,
                                  reqdt: row.reqdt
                                    ? new Date(dateformat(row.reqdt))
                                    : new Date(dateformat("99991231")),
                                  [SELECTED_FIELD]:
                                    selectedState7[idGetter7(row)], //선택된 데이터
                                })),
                                mainDataState7
                              )}
                              {...mainDataState7}
                              onDataStateChange={onMainDataStateChange7}
                              //선택 기능
                              dataItemKey={DATA_ITEM_KEY7}
                              selectedField={SELECTED_FIELD}
                              selectable={{
                                enabled: true,
                                mode: "single",
                              }}
                              onSelectionChange={onSelectionChange7}
                              //스크롤 조회 기능
                              fixedScroll={true}
                              total={mainDataResult7.total}
                              skip={page7.skip}
                              take={page7.take}
                              pageable={true}
                              onPageChange={pageChange7}
                              //정렬기능
                              sortable={true}
                              onSortChange={onMainSortChange7}
                              //컬럼순서조정
                              reorderable={true}
                              //컬럼너비조정
                              resizable={true}
                              onItemChange={onMainItemChange7}
                              cellRender={customCellRender7}
                              rowRender={customRowRender7}
                              editField={EDIT_FIELD}
                            >
                              <GridColumn
                                field="rowstatus"
                                title=" "
                                width="50px"
                              />
                              {customOptionData !== null &&
                                customOptionData.menuCustomColumnOptions[
                                  "grdList7"
                                ]
                                  ?.sort(
                                    (a: any, b: any) =>
                                      a.sortOrder - b.sortOrder
                                  )
                                  ?.map(
                                    (item: any, idx: number) =>
                                      item.sortOrder !== -1 && (
                                        <GridColumn
                                          key={idx}
                                          field={item.fieldName}
                                          title={item.caption}
                                          width={item.width}
                                          cell={
                                            comboField.includes(item.fieldName)
                                              ? CustomComboBoxCell
                                              : dateField.includes(
                                                  item.fieldName
                                                )
                                              ? DateCell
                                              : attdatnumField.includes(
                                                  item.fieldName
                                                )
                                              ? ColumnCommandCell7
                                              : undefined
                                          }
                                          footerCell={
                                            item.sortOrder == 0
                                              ? mainTotalFooterCell7
                                              : undefined
                                          }
                                        />
                                      )
                                  )}
                            </Grid>
                          </ExcelExport>
                        </GridContainer>
                      </FormContext7.Provider>
                    </TabStripTab>
                  </TabStrip>
                </SwiperSlide>
                <SwiperSlide key={4}>
                  <TabStrip
                    style={{ width: "100%" }}
                    selected={tabSelected3}
                    onSelect={handleSelectTab3}
                    scrollable={isMobile}
                  >
                    <TabStripTab title="분류1">
                      <GridContainer>
                        <GridTitleContainer className="ButtonContainer">
                          <GridTitle>월별인사평가상세</GridTitle>
                          <ButtonContainer>
                            <Button
                              themeColor={"primary"}
                              onClick={onreviewlvl1AddClick}
                              icon="folder-open"
                              disabled={
                                workType == "N"
                                  ? true
                                  : mainDataResult3.total > 0
                                  ? false
                                  : true
                              }
                            >
                              고과기준셋팅
                            </Button>
                            <Button
                              onClick={onAddClick8}
                              themeColor={"primary"}
                              icon="plus"
                              title="행 추가"
                              disabled={
                                workType == "N"
                                  ? true
                                  : mainDataResult3.total > 0
                                  ? false
                                  : true
                              }
                            ></Button>
                            <Button
                              onClick={onDeleteClick8}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="minus"
                              title="행 삭제"
                              disabled={
                                workType == "N"
                                  ? true
                                  : mainDataResult3.total > 0
                                  ? false
                                  : true
                              }
                            ></Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <ExcelExport
                          data={mainDataResult8.data}
                          ref={(exporter) => {
                            _export7 = exporter;
                          }}
                          fileName="인사고과관리"
                        >
                          <Grid
                            style={{
                              height:
                                deviceHeight -
                                height -
                                height3 -
                                height3 -
                                height4,
                            }}
                            data={process(
                              mainDataResult8.data.map((row) => ({
                                ...row,
                                [SELECTED_FIELD]:
                                  selectedState8[idGetter8(row)], //선택된 데이터
                              })),
                              mainDataState8
                            )}
                            {...mainDataState8}
                            onDataStateChange={onMainDataStateChange8}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY8}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSelectionChange8}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={mainDataResult8.total}
                            skip={page8.skip}
                            take={page8.take}
                            pageable={true}
                            onPageChange={pageChange8}
                            //정렬기능
                            sortable={true}
                            onSortChange={onMainSortChange8}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                            onItemChange={onMainItemChange8}
                            cellRender={customCellRender8}
                            rowRender={customRowRender8}
                            editField={EDIT_FIELD}
                          >
                            <GridColumn
                              field="rowstatus"
                              title=" "
                              width="50px"
                            />
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList8"
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
                                ?.map(
                                  (item: any, idx: number) =>
                                    item.sortOrder !== -1 && (
                                      <GridColumn
                                        key={idx}
                                        field={item.fieldName}
                                        title={item.caption}
                                        width={item.width}
                                        cell={
                                          comboField.includes(item.fieldName)
                                            ? CustomComboBoxCell
                                            : undefined
                                        }
                                        headerCell={
                                          requiredField.includes(item.fieldName)
                                            ? RequiredHeader
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? mainTotalFooterCell8
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </TabStripTab>
                    <TabStripTab title="분류2">
                      <GridContainer>
                        <GridTitleContainer className="ButtonContainer">
                          <GridTitle>월별인사평가상세</GridTitle>
                          <ButtonContainer>
                            <Button
                              themeColor={"primary"}
                              onClick={onreviewlvl1AddClick2}
                              icon="folder-open"
                              disabled={
                                workType == "N"
                                  ? true
                                  : mainDataResult3.total > 0
                                  ? false
                                  : true
                              }
                            >
                              고과기준셋팅
                            </Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <ExcelExport
                          data={mainDataResult9.data}
                          ref={(exporter) => {
                            _export8 = exporter;
                          }}
                          fileName="인사고과관리"
                        >
                          <Grid
                            style={{
                              height:
                                deviceHeight -
                                height -
                                height3 -
                                height3 -
                                height4,
                            }}
                            data={process(
                              mainDataResult9.data.map((row) => ({
                                ...row,
                                reviewlvl1: reviewlvl1ListData.find(
                                  (item: any) => item.sub_code == row.reviewlvl1
                                )?.code_name,
                                [SELECTED_FIELD]:
                                  selectedState9[idGetter9(row)], //선택된 데이터
                              })),
                              mainDataState9
                            )}
                            {...mainDataState9}
                            onDataStateChange={onMainDataStateChange9}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY9}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSelectionChange9}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={mainDataResult9.total}
                            skip={page9.skip}
                            take={page9.take}
                            pageable={true}
                            onPageChange={pageChange9}
                            //정렬기능
                            sortable={true}
                            onSortChange={onMainSortChange9}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                          >
                            <GridColumn
                              field="rowstatus"
                              title=" "
                              width="50px"
                            />
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList9"
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
                                ?.map(
                                  (item: any, idx: number) =>
                                    item.sortOrder !== -1 && (
                                      <GridColumn
                                        key={idx}
                                        field={item.fieldName}
                                        title={item.caption}
                                        width={item.width}
                                        locked={
                                          lockField.includes(item.fieldName) &&
                                          !isMobile
                                            ? true
                                            : false
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? mainTotalFooterCell9
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </TabStripTab>
                  </TabStrip>
                </SwiperSlide>
              </Swiper>
            </TabStripTab>
          </TabStrip>
        </>
      ) : (
        <>
          <TabStrip
            style={{ width: "100%" }}
            selected={tabSelected}
            onSelect={handleSelectTab}
            scrollable={isMobile}
          >
            <TabStripTab title="인사고과기준">
              <GridContainerWrap>
                <GridContainer width="60%">
                  <GridTitleContainer>
                    <GridTitle>인사고과기준</GridTitle>
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
                    fileName="인사고과관리"
                  >
                    <Grid
                      style={{ height: "80vh" }}
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
                                    comboField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : checkField.includes(item.fieldName)
                                      ? CheckBoxCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
                <GridContainer width={`calc(40% - ${GAP}px)`}>
                  <GridTitleContainer>
                    <GridTitle>인사고과셋팅기준</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick2}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                        disabled={
                          mainDataResult.data.filter(
                            (item) =>
                              item[DATA_ITEM_KEY] ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0] != undefined
                            ? mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].commyn == false &&
                              mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].rowstatus != "N"
                              ? false
                              : true
                            : true
                        }
                      ></Button>
                      <Button
                        onClick={onDeleteClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                        disabled={
                          mainDataResult.data.filter(
                            (item) =>
                              item[DATA_ITEM_KEY] ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0] != undefined
                            ? mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].commyn == false &&
                              mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].rowstatus != "N"
                              ? false
                              : true
                            : true
                        }
                      ></Button>
                      <Button
                        onClick={onSaveClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="save"
                        title="저장"
                        disabled={
                          mainDataResult.data.filter(
                            (item) =>
                              item[DATA_ITEM_KEY] ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0] != undefined
                            ? mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].commyn == false &&
                              mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].rowstatus != "N"
                              ? false
                              : true
                            : true
                        }
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult2.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName="인사고과관리"
                  >
                    <Grid
                      style={{ height: "80vh" }}
                      data={process(
                        mainDataResult2.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
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
                        customOptionData.menuCustomColumnOptions["grdList2"]
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
                                    comboField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : checkField.includes(item.fieldName)
                                      ? CheckBoxCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell2
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </GridContainerWrap>
            </TabStripTab>
            <TabStripTab title="월별인사평가">
              <FilterContainer>
                <FilterBox>
                  <tbody>
                    <tr>
                      <th>연월</th>
                      <td>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="frdt"
                            value={filters3.frdt}
                            format="yyyy-MM"
                            onChange={filterInputChange}
                            placeholder=""
                            calendar={MonthCalendar}
                            className="required"
                          />
                          ~
                          <DatePicker
                            name="todt"
                            value={filters3.todt}
                            format="yyyy-MM"
                            onChange={filterInputChange}
                            placeholder=""
                            calendar={MonthCalendar}
                            className="required"
                          />
                        </div>
                      </td>
                      <th>면접관</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="Interviewer"
                            value={filters3.Interviewer}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="prsnnm"
                            valueField="prsnnum"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>면접자</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="Interviewee"
                            value={filters3.Interviewee}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="prsnnm"
                            valueField="prsnnum"
                          />
                        )}
                      </td>
                      <th>면접자 부서</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="dptcd"
                            value={filters3.dptcd}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="dptnm"
                            valueField="dptcd"
                          />
                        )}
                      </td>
                      <th>인사평가번호</th>
                      <td>
                        <Input
                          name="Monthly_hrreview"
                          type="text"
                          value={filters3.Monthly_hrreview}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FilterBox>
              </FilterContainer>
              <GridContainerWrap>
                <GridContainer width="25%">
                  <GridTitleContainer>
                    <GridTitle>월별인사평가요약</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddALLClick}
                        themeColor={"primary"}
                        icon="file-add"
                      >
                        신규
                      </Button>
                      <Button
                        onClick={onDeleteALLClick}
                        icon="delete"
                        fillMode="outline"
                        themeColor={"primary"}
                      >
                        삭제
                      </Button>
                      <Button
                        onClick={onSaveClick3}
                        icon="save"
                        fillMode="outline"
                        themeColor={"primary"}
                      >
                        저장
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult3.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName="인사고과관리"
                  >
                    <Grid
                      style={{ height: "89.8vh" }}
                      data={process(
                        mainDataResult3.data.map((row) => ({
                          ...row,
                          dptcd: dptcdListData.find(
                            (item: any) => item.dptcd == row.dptcd
                          )?.dptnm,
                          interviewee: UserListData.find(
                            (item: any) => item.prsnnum == row.interviewee
                          )?.prsnnm,
                          [SELECTED_FIELD]: selectedState3[idGetter3(row)], //선택된 데이터
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
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList3"]
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
                                    dateField.includes(item.fieldName)
                                      ? DateCell
                                      : monthField.includes(item.fieldName)
                                      ? MonthDateCell
                                      : numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell3
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
                <GridContainer width={`calc(35% - ${GAP}px)`}>
                  <FormBoxWrap border={true}>
                    <GridTitleContainer>
                      <GridTitle>월별인사평가기본</GridTitle>
                    </GridTitleContainer>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>인사평가번호</th>
                          <td>
                            <Input
                              name="monthlyhrreview"
                              type="text"
                              value={information.monthlyhrreview}
                              className="readonly"
                            />
                          </td>
                          <th>인사평가일자</th>
                          <td>
                            <DatePicker
                              name="interviewdt"
                              value={information.interviewdt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                              className="required"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>면접관</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="interviewer"
                                value={information.interviewer}
                                bizComponentId="L_HU250T"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                valueField="prsnnum"
                                textField="prsnnm"
                                para="HU_A4000W"
                              />
                            )}
                          </td>
                          <th>연월</th>
                          <td>
                            <DatePicker
                              name="yyyymm"
                              value={information.yyyymm}
                              format="yyyy-MM"
                              onChange={InputChange}
                              calendar={MonthCalendar}
                              placeholder=""
                              className="required"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>면접자</th>
                          <td>
                            {information.monthlyhrreview == ""
                              ? bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="interviewee"
                                    value={information.interviewee}
                                    bizComponentId="L_HU250T"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                    valueField="prsnnum"
                                    textField="prsnnm"
                                    para="HU_A4000W"
                                    className="required"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="interviewee"
                                    value={information.interviewee}
                                    bizComponentId="L_HU250T"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                    valueField="prsnnum"
                                    textField="prsnnm"
                                    para="HU_A4000W"
                                    disabled={true}
                                    className="readonly"
                                  />
                                )}
                          </td>
                          <th>면접자 부서</th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="dptcd"
                                value={information.dptcd}
                                bizComponentId="L_dptcd_001"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                valueField="dptcd"
                                textField="dptnm"
                                para="HU_A4000W"
                                disabled={true}
                                className="readonly"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>업무난이도</th>
                          <td>
                            <NumericTextBox
                              name="difficulty"
                              value={
                                information.difficulty == ""
                                  ? 0.0
                                  : parseFloat(information.difficulty)
                              }
                              onChange={InputChange}
                              format="n1"
                            />
                          </td>
                          <th></th>
                          <td>
                            <ButtonMui
                              aria-describedby={id}
                              variant="outlined"
                              onClick={handleClick}
                              style={{ width: "100%" }}
                            >
                              ?
                            </ButtonMui>
                            <Popover
                              id={id}
                              open={open}
                              anchorEl={anchorEl}
                              onClose={handleClose}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                              }}
                            >
                              <Typography sx={{ p: 1 }}>
                                업무 난이도 단계: 1~10 - 선행 단계가
                                패스되어야만 함.
                              </Typography>
                              <Typography sx={{ p: 1 }}></Typography>
                              <Typography sx={{ p: 1 }}>
                                1: 잡무, 단순업무, Browser모듈 이해 15% 미만
                              </Typography>
                              <Typography sx={{ p: 1 }}>
                                2: 상세 지시 받은 업무 처리 가능, Browser모듈
                                이해 30% 미만
                              </Typography>
                              <Typography sx={{ p: 1 }}>
                                3: 컨셉만 지시 받은 정형적 업무 처리 가능,
                                Browser모듈 이해 60% 미만
                              </Typography>
                              <Typography sx={{ p: 1 }}>
                                4: 능동적으로 비 정형적 업무 처리 가능,
                                Browser모듈 이해 90% 미만
                              </Typography>
                              <Typography sx={{ p: 1 }}>
                                5: 자체 업무 설계 / 개발 / 추진 가능,
                                Browser모듈 이해 90% 이상
                              </Typography>
                              <Typography sx={{ p: 1 }}>
                                6: 당사 제품(S/W, H/W, IaaS-PaaS-SaaS) 이해도
                                95% 이상 이해하며 미래지향적 업무 아이디어 제시
                              </Typography>
                              <Typography sx={{ p: 1 }}>
                                7: 관리 업무 수행 가능 (관리, 서포트 level 수행)
                              </Typography>
                              <Typography sx={{ p: 1 }}>
                                8: 타팀 및 협력사 협업 능동적으로 가능
                              </Typography>
                              <Typography sx={{ p: 1 }}>
                                9: 추가 수익을 낼 수 있는 신 사업 계획 및 추진
                                가능
                              </Typography>
                              <Typography sx={{ p: 1 }}>
                                10: 의사결정정보를 적극 제공하며, 경영자적
                                관점에서 업무 처리
                              </Typography>
                            </Popover>
                          </td>
                        </tr>
                        <tr>
                          <th>비고</th>
                          <td colSpan={3}>
                            <TextArea
                              value={information.remark1}
                              name="remark1"
                              rows={2}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                  <FormBoxWrap border={true}>
                    <GridTitleContainer>
                      <GridTitle>개인별 월별 실적 집계</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={() => {
                            setFilters4((prev) => ({
                              ...prev,
                              isSearch: true,
                            }));
                          }}
                          icon="search"
                          themeColor={"primary"}
                          title="조회"
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>지각</th>
                          <td colSpan={2}>
                            <Input
                              name="rate"
                              type="text"
                              value={information2.rate}
                              className="readonly"
                            />
                          </td>
                          <th>연차사용</th>
                          <td>
                            <Input
                              name="annsum"
                              type="text"
                              value={information2.annsum}
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="annMonth"
                              type="text"
                              value={information2.annMonth}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>체류시간</th>
                          <td colSpan={2}>
                            <Input
                              name="stay"
                              type="text"
                              value={information2.stay}
                              className="readonly"
                            />
                          </td>
                          <th>근무시간</th>
                          <td colSpan={2}>
                            <Input
                              name="workTime"
                              type="text"
                              value={information2.workTime}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>업무지시</th>
                          <td>
                            <Input
                              name="workOrdercnt"
                              type="text"
                              value={information2.workOrdercnt}
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="workOrderMM"
                              type="text"
                              value={information2.workOrderMM}
                              className="readonly"
                            />
                          </td>
                          <th>불량/교육</th>
                          <td>
                            <Input
                              name="bad"
                              type="text"
                              value={information2.bad}
                              className="readonly"
                            />
                          </td>
                          <td>
                            <Input
                              name="edu"
                              type="text"
                              value={information2.edu}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>지시준수율</th>
                          <td colSpan={2}>
                            <Input
                              name="OrderPercent"
                              type="text"
                              value={information2.OrderPercent}
                              className="readonly"
                            />
                          </td>
                          <th></th>
                          <td colSpan={2}></td>
                        </tr>
                        <tr>
                          <th>신규개발</th>
                          <td colSpan={2}>
                            <Input
                              name="newworkcnt"
                              type="text"
                              value={information2.newworkcnt}
                              className="readonly"
                            />
                          </td>
                          <th>수정개발</th>
                          <td colSpan={2}>
                            <Input
                              name="ModWorkCnt"
                              type="text"
                              value={information2.OrderPercent}
                              className="readonly"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                  <TabStrip
                    style={{ width: "100%" }}
                    selected={tabSelected2}
                    onSelect={handleSelectTab2}
                    scrollable={isMobile}
                  >
                    <TabStripTab title="불량">
                      <GridContainer>
                        <GridTitleContainer>
                          <GridTitle>불량내역</GridTitle>
                          <ButtonContainer>
                            <Button
                              onClick={onAddClick5}
                              themeColor={"primary"}
                              icon="plus"
                              title="행 추가"
                              disabled={workType == "N" ? true : false}
                            ></Button>
                            <Button
                              onClick={onDeleteClick5}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="minus"
                              title="행 삭제"
                              disabled={workType == "N" ? true : false}
                            ></Button>
                            <Button
                              onClick={onSaveClick5}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="save"
                              title="저장"
                              disabled={workType == "N" ? true : false}
                            ></Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <ExcelExport
                          data={mainDataResult5.data}
                          ref={(exporter) => {
                            _export4 = exporter;
                          }}
                          fileName="인사고과관리"
                        >
                          <Grid
                            style={{ height: "25vh" }}
                            data={process(
                              mainDataResult5.data.map((row) => ({
                                ...row,
                                baddt: row.baddt
                                  ? new Date(dateformat(row.baddt))
                                  : new Date(dateformat("99991231")),
                                [SELECTED_FIELD]:
                                  selectedState5[idGetter5(row)], //선택된 데이터
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
                            //정렬기능
                            sortable={true}
                            onSortChange={onMainSortChange5}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                            onItemChange={onMainItemChange5}
                            cellRender={customCellRender5}
                            rowRender={customRowRender5}
                            editField={EDIT_FIELD}
                          >
                            <GridColumn
                              field="rowstatus"
                              title=" "
                              width="50px"
                            />
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList5"
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
                                ?.map(
                                  (item: any, idx: number) =>
                                    item.sortOrder !== -1 && (
                                      <GridColumn
                                        key={idx}
                                        field={item.fieldName}
                                        title={item.caption}
                                        width={item.width}
                                        cell={
                                          comboField.includes(item.fieldName)
                                            ? CustomComboBoxCell
                                            : dateField.includes(item.fieldName)
                                            ? DateCell
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? mainTotalFooterCell5
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </TabStripTab>
                    <TabStripTab title="교육내역">
                      <FormContext6.Provider
                        value={{
                          attdatnum6,
                          files6,
                          setAttdatnum6,
                          setFiles6,
                          mainDataState6,
                          setMainDataState6,
                          // fetchGrid,
                        }}
                      >
                        <GridContainer>
                          <GridTitleContainer>
                            <GridTitle>교육내역</GridTitle>
                            <ButtonContainer>
                              <Button
                                onClick={onAddClick6}
                                themeColor={"primary"}
                                icon="plus"
                                title="행 추가"
                                disabled={workType == "N" ? true : false}
                              ></Button>
                              <Button
                                onClick={onDeleteClick6}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="minus"
                                title="행 삭제"
                                disabled={workType == "N" ? true : false}
                              ></Button>
                              <Button
                                //onClick={onSaveClick6}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="save"
                                title="저장"
                                disabled={workType == "N" ? true : false}
                              ></Button>
                            </ButtonContainer>
                          </GridTitleContainer>
                          <ExcelExport
                            data={mainDataResult6.data}
                            ref={(exporter) => {
                              _export5 = exporter;
                            }}
                            fileName="인사고과관리"
                          >
                            <Grid
                              style={{ height: "25vh" }}
                              data={process(
                                mainDataResult6.data.map((row) => ({
                                  ...row,
                                  recdt: row.recdt
                                    ? new Date(dateformat(row.recdt))
                                    : new Date(dateformat("99991231")),
                                  [SELECTED_FIELD]:
                                    selectedState6[idGetter6(row)], //선택된 데이터
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
                              <GridColumn
                                field="rowstatus"
                                title=" "
                                width="50px"
                              />
                              {customOptionData !== null &&
                                customOptionData.menuCustomColumnOptions[
                                  "grdList6"
                                ]
                                  ?.sort(
                                    (a: any, b: any) =>
                                      a.sortOrder - b.sortOrder
                                  )
                                  ?.map(
                                    (item: any, idx: number) =>
                                      item.sortOrder !== -1 && (
                                        <GridColumn
                                          key={idx}
                                          field={item.fieldName}
                                          title={item.caption}
                                          width={item.width}
                                          cell={
                                            comboField.includes(item.fieldName)
                                              ? CustomComboBoxCell
                                              : dateField.includes(
                                                  item.fieldName
                                                )
                                              ? DateCell
                                              : attdatnumField.includes(
                                                  item.fieldName
                                                )
                                              ? ColumnCommandCell6
                                              : undefined
                                          }
                                          footerCell={
                                            item.sortOrder == 0
                                              ? mainTotalFooterCell6
                                              : undefined
                                          }
                                        />
                                      )
                                  )}
                            </Grid>
                          </ExcelExport>
                        </GridContainer>
                      </FormContext6.Provider>
                    </TabStripTab>
                    <TabStripTab title="상벌사항">
                      <FormContext7.Provider
                        value={{
                          attdatnum7,
                          files7,
                          setAttdatnum7,
                          setFiles7,
                          mainDataState7,
                          setMainDataState7,
                          // fetchGrid,
                        }}
                      >
                        <GridContainer>
                          <GridTitleContainer>
                            <GridTitle>상벌내역</GridTitle>
                            <ButtonContainer>
                              <Button
                                onClick={onAddClick7}
                                themeColor={"primary"}
                                icon="plus"
                                title="행 추가"
                                disabled={workType == "N" ? true : false}
                              ></Button>
                              <Button
                                onClick={onDeleteClick7}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="minus"
                                title="행 삭제"
                                disabled={workType == "N" ? true : false}
                              ></Button>
                              <Button
                                onClick={onSaveClick7}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="save"
                                title="저장"
                                disabled={workType == "N" ? true : false}
                              ></Button>
                            </ButtonContainer>
                          </GridTitleContainer>
                          <ExcelExport
                            data={mainDataResult7.data}
                            ref={(exporter) => {
                              _export6 = exporter;
                            }}
                            fileName="인사고과관리"
                          >
                            <Grid
                              style={{ height: "25vh" }}
                              data={process(
                                mainDataResult7.data.map((row) => ({
                                  ...row,
                                  reqdt: row.reqdt
                                    ? new Date(dateformat(row.reqdt))
                                    : new Date(dateformat("99991231")),
                                  [SELECTED_FIELD]:
                                    selectedState7[idGetter7(row)], //선택된 데이터
                                })),
                                mainDataState7
                              )}
                              {...mainDataState7}
                              onDataStateChange={onMainDataStateChange7}
                              //선택 기능
                              dataItemKey={DATA_ITEM_KEY7}
                              selectedField={SELECTED_FIELD}
                              selectable={{
                                enabled: true,
                                mode: "single",
                              }}
                              onSelectionChange={onSelectionChange7}
                              //스크롤 조회 기능
                              fixedScroll={true}
                              total={mainDataResult7.total}
                              skip={page7.skip}
                              take={page7.take}
                              pageable={true}
                              onPageChange={pageChange7}
                              //정렬기능
                              sortable={true}
                              onSortChange={onMainSortChange7}
                              //컬럼순서조정
                              reorderable={true}
                              //컬럼너비조정
                              resizable={true}
                              onItemChange={onMainItemChange7}
                              cellRender={customCellRender7}
                              rowRender={customRowRender7}
                              editField={EDIT_FIELD}
                            >
                              <GridColumn
                                field="rowstatus"
                                title=" "
                                width="50px"
                              />
                              {customOptionData !== null &&
                                customOptionData.menuCustomColumnOptions[
                                  "grdList7"
                                ]
                                  ?.sort(
                                    (a: any, b: any) =>
                                      a.sortOrder - b.sortOrder
                                  )
                                  ?.map(
                                    (item: any, idx: number) =>
                                      item.sortOrder !== -1 && (
                                        <GridColumn
                                          key={idx}
                                          field={item.fieldName}
                                          title={item.caption}
                                          width={item.width}
                                          cell={
                                            comboField.includes(item.fieldName)
                                              ? CustomComboBoxCell
                                              : dateField.includes(
                                                  item.fieldName
                                                )
                                              ? DateCell
                                              : attdatnumField.includes(
                                                  item.fieldName
                                                )
                                              ? ColumnCommandCell7
                                              : undefined
                                          }
                                          footerCell={
                                            item.sortOrder == 0
                                              ? mainTotalFooterCell7
                                              : undefined
                                          }
                                        />
                                      )
                                  )}
                            </Grid>
                          </ExcelExport>
                        </GridContainer>
                      </FormContext7.Provider>
                    </TabStripTab>
                  </TabStrip>
                </GridContainer>
                <GridContainer width={`calc(40% - ${GAP}px)`}>
                  <TabStrip
                    style={{ width: "100%" }}
                    selected={tabSelected3}
                    onSelect={handleSelectTab3}
                    scrollable={isMobile}
                  >
                    <TabStripTab title="분류1">
                      <GridContainer>
                        <GridTitleContainer>
                          <GridTitle>월별인사평가상세</GridTitle>
                          <ButtonContainer>
                            <Button
                              themeColor={"primary"}
                              onClick={onreviewlvl1AddClick}
                              icon="folder-open"
                              disabled={
                                workType == "N"
                                  ? true
                                  : mainDataResult3.total > 0
                                  ? false
                                  : true
                              }
                            >
                              고과기준셋팅
                            </Button>
                            <Button
                              onClick={onAddClick8}
                              themeColor={"primary"}
                              icon="plus"
                              title="행 추가"
                              disabled={
                                workType == "N"
                                  ? true
                                  : mainDataResult3.total > 0
                                  ? false
                                  : true
                              }
                            ></Button>
                            <Button
                              onClick={onDeleteClick8}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="minus"
                              title="행 삭제"
                              disabled={
                                workType == "N"
                                  ? true
                                  : mainDataResult3.total > 0
                                  ? false
                                  : true
                              }
                            ></Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <ExcelExport
                          data={mainDataResult8.data}
                          ref={(exporter) => {
                            _export7 = exporter;
                          }}
                          fileName="인사고과관리"
                        >
                          <Grid
                            style={{ height: "82.5vh" }}
                            data={process(
                              mainDataResult8.data.map((row) => ({
                                ...row,
                                [SELECTED_FIELD]:
                                  selectedState8[idGetter8(row)], //선택된 데이터
                              })),
                              mainDataState8
                            )}
                            {...mainDataState8}
                            onDataStateChange={onMainDataStateChange8}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY8}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSelectionChange8}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={mainDataResult8.total}
                            skip={page8.skip}
                            take={page8.take}
                            pageable={true}
                            onPageChange={pageChange8}
                            //정렬기능
                            sortable={true}
                            onSortChange={onMainSortChange8}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                            onItemChange={onMainItemChange8}
                            cellRender={customCellRender8}
                            rowRender={customRowRender8}
                            editField={EDIT_FIELD}
                          >
                            <GridColumn
                              field="rowstatus"
                              title=" "
                              width="50px"
                            />
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList8"
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
                                ?.map(
                                  (item: any, idx: number) =>
                                    item.sortOrder !== -1 && (
                                      <GridColumn
                                        key={idx}
                                        field={item.fieldName}
                                        title={item.caption}
                                        width={item.width}
                                        cell={
                                          comboField.includes(item.fieldName)
                                            ? CustomComboBoxCell
                                            : undefined
                                        }
                                        headerCell={
                                          requiredField.includes(item.fieldName)
                                            ? RequiredHeader
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? mainTotalFooterCell8
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </TabStripTab>
                    <TabStripTab title="분류2">
                      <GridContainer>
                        <GridTitleContainer>
                          <GridTitle>월별인사평가상세</GridTitle>
                          <ButtonContainer>
                            <Button
                              themeColor={"primary"}
                              onClick={onreviewlvl1AddClick2}
                              icon="folder-open"
                              disabled={
                                workType == "N"
                                  ? true
                                  : mainDataResult3.total > 0
                                  ? false
                                  : true
                              }
                            >
                              고과기준셋팅
                            </Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <ExcelExport
                          data={mainDataResult9.data}
                          ref={(exporter) => {
                            _export8 = exporter;
                          }}
                          fileName="인사고과관리"
                        >
                          <Grid
                            style={{ height: "82.5vh" }}
                            data={process(
                              mainDataResult9.data.map((row) => ({
                                ...row,
                                reviewlvl1: reviewlvl1ListData.find(
                                  (item: any) => item.sub_code == row.reviewlvl1
                                )?.code_name,
                                [SELECTED_FIELD]:
                                  selectedState9[idGetter9(row)], //선택된 데이터
                              })),
                              mainDataState9
                            )}
                            {...mainDataState9}
                            onDataStateChange={onMainDataStateChange9}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY9}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSelectionChange9}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={mainDataResult9.total}
                            skip={page9.skip}
                            take={page9.take}
                            pageable={true}
                            onPageChange={pageChange9}
                            //정렬기능
                            sortable={true}
                            onSortChange={onMainSortChange9}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                          >
                            <GridColumn
                              field="rowstatus"
                              title=" "
                              width="50px"
                            />
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList9"
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
                                ?.map(
                                  (item: any, idx: number) =>
                                    item.sortOrder !== -1 && (
                                      <GridColumn
                                        key={idx}
                                        field={item.fieldName}
                                        title={item.caption}
                                        width={item.width}
                                        locked={
                                          lockField.includes(item.fieldName) &&
                                          !isMobile
                                            ? true
                                            : false
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? mainTotalFooterCell9
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </TabStripTab>
                  </TabStrip>
                </GridContainer>
              </GridContainerWrap>
            </TabStripTab>
          </TabStrip>
        </>
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

export default HU_A4000W;
