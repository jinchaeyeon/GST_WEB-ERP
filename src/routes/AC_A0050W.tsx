import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import {
  Checkbox,
  Input,
  NumericTextBox,
  TextArea,
} from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { MonthView, Scheduler } from "@progress/kendo-react-scheduler";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import ExcelUploadButton from "../components/Buttons/ExcelUploadButton";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  convertDateToStr,
  dateformat,
  dateformat2,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  GetPropertyValueByName,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
  toDate,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { FormWithCustomEditor2 } from "../components/Scheduler/custom-form";
import AccountWindow from "../components/Windows/CommonWindows/AccountWindow";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData, ICustData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  OSState,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/AC_A0050W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
var index = 0;
let height = 0;
let height2 = 0;
let height3 = 0;
let height4 = 0;
let height5 = 0;
let height6 = 0;
let temp2_1 = 0;
let temp3_1 = 0;
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY2_1 = "num";
const DATA_ITEM_KEY2_2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY3_1 = "num";
const DATA_ITEM_KEY3_2 = "num";
const DATA_ITEM_KEY4 = "num";
const DATA_ITEM_KEY4_1 = "num";
const DATA_ITEM_KEY5 = "num";
const DATA_ITEM_KEY5_1 = "num";
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;
let targetRowIndex5: null | number = null;
const dateField = ["cotracdt", "paydt", "acntdt", "brwdt", "enddt", "pubdt"];
const numberField = [
  "monsaveamt",
  "contracamt",
  "payamt",
  "intrat",
  "acseq1",
  "acseq2",
  "dramt",
  "cramt",
  "brwamt",
  "intamt",
  "pubamt",
];
const numberField2 = [
  "monsaveamt",
  "contracamt",
  "payamt",
  "dramt",
  "cramt",
  "brwamt",
  "intamt",
  "pubamt",
];
const checkField = ["useyn"];
let deletedMainRows2_1: object[] = [];
let deletedMainRows3_1: object[] = [];

const AC_A0050W: React.FC = () => {
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);
  let gridRef5: any = useRef(null);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [osstate, setOSState] = useRecoilState(OSState);
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [swiper, setSwiper] = useState<SwiperCore>();

  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const pc = UseGetValueFromSessionItem("pc");
  const [messagesData, setMessagesData] = useState<any>(null);
  UseMessages(setMessagesData);
  const [tabSelected, setTabSelected] = useState(0);
  const [tabSelected2, setTabSelected2] = useState(0);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter2_1 = getter(DATA_ITEM_KEY2_1);
  const idGetter2_2 = getter(DATA_ITEM_KEY2_2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter3_1 = getter(DATA_ITEM_KEY3_1);
  const idGetter3_2 = getter(DATA_ITEM_KEY3_2);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter4_1 = getter(DATA_ITEM_KEY4_1);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const idGetter5_1 = getter(DATA_ITEM_KEY5_1);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001, L_cordiv, L_AC198, L_AC028, L_AC029, L_AC027, R_NOTEDIV, L_AC022, L_AC210, L_AC030, L_AC023, L_dptcd_001, L_BA020, L_AC046, R_USEYN_only",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [bankacntdivListData, setbankacntdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [notedivListData, setnotedivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [creditdivListData, setcreditdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [cordivListData, setcordivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setdptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
      setbankacntdivListData(getBizCom(bizComponentData, "L_AC023"));
      setnotedivListData(getBizCom(bizComponentData, "L_AC022"));
      setcreditdivListData(getBizCom(bizComponentData, "L_AC198"));
      setcordivListData(getBizCom(bizComponentData, "L_cordiv"));
    }
  }, [bizComponentData]);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight2_1, setMobileHeight2_1] = useState(0);
  const [mobileheight2_2, setMobileHeight2_2] = useState(0);
  const [mobileheight2_3, setMobileHeight2_3] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight3_1, setMobileHeight3_1] = useState(0);
  const [mobileheight3_2, setMobileHeight3_2] = useState(0);
  const [mobileheight3_3, setMobileHeight3_3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [mobileheight4_1, setMobileHeight4_1] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight2_1, setWebHeight2_1] = useState(0);
  const [webheight2_2, setWebHeight2_2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight3_1, setWebHeight3_1] = useState(0);
  const [webheight3_2, setWebHeight3_2] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  const [webheight4_1, setWebHeight4_1] = useState(0);
  const [webheight5, setWebHeight5] = useState(0);
  const [webheight5_1, setWebHeight5_1] = useState(0);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-tabstrip-items-wrapper");
      height2 = getHeight(".TitleContainer");
      height3 = getHeight(".ButtonContainer");
      height4 = getHeight(".ButtonContainer2");
      height5 = getHeight(".ButtonContainer2_1");
      height6 = getHeight(".ButtonContainer2_2");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(false) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight2_1(getDeviceHeight(true) - height - height2 - height4);
        setMobileHeight2_2(getDeviceHeight(true) - height - height2 - height5);
        setMobileHeight2_3(getDeviceHeight(true) - height - height2 - height6);
        setMobileHeight3(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight3_1(getDeviceHeight(true) - height - height2 - height4);
        setMobileHeight3_2(getDeviceHeight(true) - height - height2 - height5);
        setMobileHeight3_3(getDeviceHeight(true) - height - height2 - height6);
        setMobileHeight4(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight4_1(getDeviceHeight(true) - height - height2 - height4);
        setWebHeight(getDeviceHeight(false) - height - height2);
        setWebHeight(getDeviceHeight(false) - height - height2);
        setWebHeight2((getDeviceHeight(true) - height - height2) / 2 - height3);
        setWebHeight2_1(
          (getDeviceHeight(true) - height - height2) / 2 - height5
        );
        setWebHeight2_2((getDeviceHeight(true) - height - height2) / 2);
        setWebHeight3((getDeviceHeight(true) - height - height2) / 2 - height3);
        setWebHeight3_1(
          (getDeviceHeight(true) - height - height2) / 2 - height5
        );
        setWebHeight3_2((getDeviceHeight(true) - height - height2) / 2);
        setWebHeight4((getDeviceHeight(true) - height - height2) / 2 - height3);
        setWebHeight4_1(
          (getDeviceHeight(true) - height - height2) / 2 - height5
        );
        setWebHeight5((getDeviceHeight(true) - height - height2) / 2 - height3);
        setWebHeight5_1(
          (getDeviceHeight(true) - height - height2) / 2 - height5
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [
    customOptionData,
    webheight,
    webheight2,
    webheight2_1,
    webheight2_2,
    webheight3,
    webheight3_1,
    webheight3_2,
    webheight4,
    webheight4_1,
    webheight5,
    webheight5_1,
    tabSelected,
    tabSelected2,
  ]);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        bankacntdiv: defaultOption.find((item: any) => item.id == "bankacntdiv")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        useyn2: defaultOption.find((item: any) => item.id == "useyn2")
          ?.valueCode,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        dtgb: defaultOption.find((item: any) => item.id == "dtgb")?.valueCode,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        notediv: defaultOption.find((item: any) => item.id == "notediv")
          ?.valueCode,
        notekind: defaultOption.find((item: any) => item.id == "notekind")
          ?.valueCode,
        notests: defaultOption.find((item: any) => item.id == "notests")
          ?.valueCode,
        isSearch: true,
      }));
      setFilters5((prev) => ({
        ...prev,
        creditdiv: defaultOption.find((item: any) => item.id == "creditdiv")
          ?.valueCode,
        cordiv: defaultOption.find((item: any) => item.id == "cordiv")
          ?.valueCode,
        useyn3: defaultOption.find((item: any) => item.id == "useyn3")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const defaultData: any[] = [
    {
      id: 0,
      title: "Default Data",
      start: new Date("2021-01-01T08:30:00.000Z"),
      end: new Date("2021-01-01T09:00:00.000Z"),
      colorID: { sub_code: 0, code_name: "없음", color: "" },
      dptcd: { text: "", value: "" },
      person: { text: "", value: "" },
    },
  ];

  const [mainDataResult, setMainDataResult] = useState(defaultData);
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState2_1, setMainDataState2_1] = useState<State>({
    sort: [],
  });
  const [mainDataState2_2, setMainDataState2_2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataState3_1, setMainDataState3_1] = useState<State>({
    sort: [],
  });
  const [mainDataState3_2, setMainDataState3_2] = useState<State>({
    sort: [],
  });
  const [mainDataState4, setMainDataState4] = useState<State>({
    sort: [],
  });
  const [mainDataState4_1, setMainDataState4_1] = useState<State>({
    sort: [],
  });
  const [mainDataState5, setMainDataState5] = useState<State>({
    sort: [],
  });
  const [mainDataState5_1, setMainDataState5_1] = useState<State>({
    sort: [],
  });
  const [tempState2_1, setTempState2_1] = useState<State>({
    sort: [],
  });
  const [tempState3_1, setTempState3_1] = useState<State>({
    sort: [],
  });
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult2_1, setMainDataResult2_1] = useState<DataResult>(
    process([], mainDataState2_1)
  );
  const [mainDataResult2_2, setMainDataResult2_2] = useState<DataResult>(
    process([], mainDataState2_2)
  );
  const [mainDataResult3_1, setMainDataResult3_1] = useState<DataResult>(
    process([], mainDataState3_1)
  );
  const [mainDataResult3_2, setMainDataResult3_2] = useState<DataResult>(
    process([], mainDataState3_2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [mainDataResult4, setMainDataResult4] = useState<DataResult>(
    process([], mainDataState4)
  );
  const [mainDataResult4_1, setMainDataResult4_1] = useState<DataResult>(
    process([], mainDataState4_1)
  );
  const [mainDataResult5, setMainDataResult5] = useState<DataResult>(
    process([], mainDataState5)
  );
  const [mainDataResult5_1, setMainDataResult5_1] = useState<DataResult>(
    process([], mainDataState5_1)
  );
  const [tempResult2_1, setTempResult2_1] = useState<DataResult>(
    process([], tempState2_1)
  );
  const [tempResult3_1, setTempResult3_1] = useState<DataResult>(
    process([], tempState3_1)
  );
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2_1, setSelectedState2_1] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2_2, setSelectedState2_2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3_1, setSelectedState3_1] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3_2, setSelectedState3_2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState4, setSelectedState4] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState4_1, setSelectedState4_1] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState5, setSelectedState5] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState5_1, setSelectedState5_1] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "SCHEDULER",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    acntsrtnum: "",
    acntsrtnm: "",
    bankacntdiv: "",
    bankacntnum: "",
    dptcd: "",
    acntcd: "",
    remark: "",
    useyn2: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2_1, setFilters2_1] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    acntsrtnum: "",
    pgNum: 1,
    isSearch: false,
  });
  const [filters2_2, setFilters2_2] = useState({
    pgSize: PAGE_SIZE,
    workType: "SLIP",
    acntsrtnum: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    brwnum: "",
    brwnm: "",
    brwdesc: "",
    custcd: "",
    custnm: "",
    remark: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });
  const [filters3_1, setFilters3_1] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    brwnum: "",
    pgNum: 1,
    isSearch: false,
  });
  const [filters3_2, setFilters3_2] = useState({
    pgSize: PAGE_SIZE,
    workType: "SLIP",
    brwnum: "",
    pgNum: 1,
    isSearch: false,
  });
  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    workType: "List",
    dtgb: "",
    frdt: new Date(),
    todt: new Date(),
    notediv: "",
    notekind: "",
    notenum: "",
    notests: "",
    custcd: "",
    custnm: "",
    pubbank: "",
    remark1: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });
  const [filters4_1, setFilters4_1] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q2",
    notenum: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters5, setFilters5] = useState({
    pgSize: PAGE_SIZE,
    workType: "List",
    creditcd: "",
    creditdiv: "",
    custcd: "",
    custnm: "",
    creditnum: "",
    cordiv: "",
    creditnm: "",
    remark: "",
    useyn3: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters5_1, setFilters5_1] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    creditcd: "",
    pgNum: 1,
    isSearch: false,
  });
  const [infomation, setInfomation] = useState<{ [name: string]: any }>({
    workType: "N",
    acntcd: "",
    acntnm: "",
    acntsrtnm: "",
    acntsrtnum: "",
    amtunit: "",
    attdatnum: "",
    bankacntdiv: "",
    bankacntnum: "",
    bankcd: "",
    bankdiv: "",
    banknm: "",
    closedt: null,
    contracamt: 0,
    cotracdt: null,
    dptcd: "",
    enddt: null,
    files: "",
    findrow_key: "",
    intrat: 0,
    limitamt: 0,
    monsaveamt: 0,
    motgdesc: "",
    orgdiv: sessionOrgdiv,
    plandiv: "",
    remark: "",
    savecnt: 0,
    useyn: "N",
  });

  const [infomation2, setInfomation2] = useState<{ [name: string]: any }>({
    workType: "N",
    acntcd: "",
    acntnm: "",
    amtunit: "",
    attdatnum: "",
    bankacntnum: "",
    brwamt: 0,
    brwamtdlr: 0,
    brwamtown: 0,
    brwdesc: "",
    brwdt: null,
    brwnm: "",
    brwnum: "",
    brwtype: "",
    chgintrat: 0,
    chgrat: 0,
    custcd: "",
    custnm: "",
    enddt: null,
    endrdmdt: null,
    files: "",
    findrow_key: "",
    intpayamt: 0,
    intpaydt: null,
    intpayown: 0,
    intpayterm: "",
    intrat: 0,
    janamt: 0,
    motgdesc: "",
    orgdiv: sessionOrgdiv,
    rdmprd: 0,
    rdmterm: "N",
    redeem: 0,
    remark: "",
    strdmdt: null,
  });

  const [infomation3, setInfomation3] = useState<{ [name: string]: any }>({
    workType: "N",
    acntcd: "",
    acntnm: "",
    bankcd: "",
    banknm: "",
    custcd: "",
    custnm: "",
    dptcd: "",
    enddt: new Date(),
    endorser1: "",
    endorser2: "",
    findrow_key: "",
    notedec: "",
    notediv: "1",
    notekind: "",
    noteloca: "",
    notenum: "",
    notests: "",
    orgdiv: sessionOrgdiv,
    pgmdiv: "",
    pubamt: 0,
    pubbank: "",
    pubdt: new Date(),
    pubperson: "",
    remark1: "",
    replace_bankcd: "",
    replace_banknm: "",
    replace_custcd: "",
    replace_custnm: "",
    replacedt: null,
    returndt: null,
  });

  const [infomation5, setInfomation5] = useState<{ [name: string]: any }>({
    workType: "N",
    attdatnum: "",
    bankacntnum: "",
    cordiv: "",
    creditcd: "",
    creditdiv: "",
    creditnm: "",
    creditnum: "",
    custcd: "",
    custnm: "",
    exprdt: null,
    files: "",
    findrow_key: "",
    orgdiv: sessionOrgdiv,
    paydt: null,
    person: "",
    rcvcustcd: "",
    rcvcustnm: "",
    remark: "",
    repreregno: "",
    useyn: "Y",
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterInputChange2 = (e: any) => {
    const { value, name } = e.target;

    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange2 = (e: any) => {
    const { value, name } = e.target;

    if (name == "rdmterm") {
      setInfomation2((prev) => ({
        ...prev,
        [name]: value == true ? "Y" : "N",
      }));
    } else {
      setInfomation2((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange2 = (e: any) => {
    const { name, value } = e;

    setInfomation2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const RadioChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterInputChange4 = (e: any) => {
    const { value, name } = e.target;

    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange4 = (e: any) => {
    const { name, value } = e;

    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange4 = (e: any) => {
    const { value, name } = e.target;

    setInfomation3((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const RadioChange4 = (e: any) => {
    const { name, value } = e;

    setInfomation3((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange4 = (e: any) => {
    const { name, value } = e;

    setInfomation3((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterInputChange5 = (e: any) => {
    const { value, name } = e.target;

    setFilters5((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange5 = (e: any) => {
    const { name, value } = e;

    setFilters5((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange5 = (e: any) => {
    const { value, name } = e.target;

    setInfomation5((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange5 = (e: any) => {
    const { name, value } = e;

    setInfomation5((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const RadioChange5 = (e: any) => {
    const { name, value } = e;

    setInfomation5((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);
  const [accountWindowVisible2, setAccountWindowVisible2] =
    useState<boolean>(false);
  const [accountWindowVisible3, setAccountWindowVisible3] =
    useState<boolean>(false);
  const [accountWindowVisible4, setAccountWindowVisible4] =
    useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [custWindowVisible3, setCustWindowVisible3] = useState<boolean>(false);
  const [custWindowVisible4, setCustWindowVisible4] = useState<boolean>(false);
  const [custWindowVisible5, setCustWindowVisible5] = useState<boolean>(false);
  const [custWindowVisible6, setCustWindowVisible6] = useState<boolean>(false);
  const [custWindowVisible7, setCustWindowVisible7] = useState<boolean>(false);
  const [custWindowVisible8, setCustWindowVisible8] = useState<boolean>(false);
  const [custWindowVisible9, setCustWindowVisible9] = useState<boolean>(false);
  const [custWindowVisible10, setCustWindowVisible10] =
    useState<boolean>(false);
  const [custWindowVisible11, setCustWindowVisible11] =
    useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const [attachmentsWindowVisible2, setAttachmentsWindowVisible2] =
    useState<boolean>(false);
  const [attachmentsWindowVisible5, setAttachmentsWindowVisible5] =
    useState<boolean>(false);
  const [excelAttachmentsWindowVisible, setExcelAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  const onAttachmentsWndClick2 = () => {
    setAttachmentsWindowVisible2(true);
  };
  const onAttachmentsWndClick5 = () => {
    setAttachmentsWindowVisible5(true);
  };
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
  };
  const onCustWndClick3 = () => {
    setCustWindowVisible3(true);
  };
  const onCustWndClick4 = () => {
    setCustWindowVisible4(true);
  };
  const onCustWndClick5 = () => {
    setCustWindowVisible5(true);
  };
  const onCustWndClick6 = () => {
    setCustWindowVisible6(true);
  };
  const onCustWndClick7 = () => {
    setCustWindowVisible7(true);
  };
  const onCustWndClick8 = () => {
    setCustWindowVisible8(true);
  };
  const onCustWndClick9 = () => {
    setCustWindowVisible9(true);
  };
  const onCustWndClick10 = () => {
    setCustWindowVisible10(true);
  };
  const onCustWndClick11 = () => {
    setCustWindowVisible11(true);
  };
  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };
  const onAccountWndClick2 = () => {
    setAccountWindowVisible2(true);
  };
  const onAccountWndClick3 = () => {
    setAccountWindowVisible3(true);
  };
  const onAccountWndClick4 = () => {
    setAccountWindowVisible4(true);
  };
  const onExcelAttachmentsWndClick = () => {
    setExcelAttachmentsWindowVisible(true);
  };
  const setAcntData = (data: any) => {
    setFilters2((prev) => ({
      ...prev,
      acntcd: data.acntcd,
    }));
  };
  const setAcntData2 = (data: any) => {
    setInfomation((prev) => ({
      ...prev,
      acntcd: data.acntcd,
      acntnm: data.acntnm,
    }));
  };
  const setAcntData3 = (data: any) => {
    setInfomation2((prev) => ({
      ...prev,
      acntcd: data.acntcd,
      acntnm: data.acntnm,
    }));
  };
  const setAcntData4 = (data: any) => {
    setInfomation3((prev) => ({
      ...prev,
      acntcd: data.acntcd,
      acntnm: data.acntnm,
    }));
  };
  const setCustData = (data: ICustData) => {
    setInfomation((prev: any) => {
      return {
        ...prev,
        bankcd: data.custcd,
        banknm: data.custnm,
      };
    });
  };
  const setCustData2 = (data: ICustData) => {
    setFilters3((prev: any) => {
      return {
        ...prev,
        bankcd: data.custcd,
        banknm: data.custnm,
      };
    });
  };
  const setCustData3 = (data: ICustData) => {
    setInfomation2((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };
  const setCustData4 = (data: ICustData) => {
    setFilters4((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };
  const setCustData5 = (data: ICustData) => {
    setInfomation3((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };
  const setCustData6 = (data: ICustData) => {
    setInfomation3((prev: any) => {
      return {
        ...prev,
        bankcd: data.custcd,
        banknm: data.custnm,
      };
    });
  };
  const setCustData7 = (data: ICustData) => {
    setInfomation3((prev: any) => {
      return {
        ...prev,
        replace_custcd: data.custcd,
        replace_custnm: data.custnm,
      };
    });
  };
  const setCustData8 = (data: ICustData) => {
    setInfomation3((prev: any) => {
      return {
        ...prev,
        replace_bankcd: data.custcd,
        replace_banknm: data.custnm,
      };
    });
  };
  const setCustData9 = (data: ICustData) => {
    setFilters5((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };
  const setCustData10 = (data: ICustData) => {
    setInfomation5((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };
  const setCustData11 = (data: ICustData) => {
    setInfomation5((prev: any) => {
      return {
        ...prev,
        rcvcustcd: data.custcd,
        rcvcustnm: data.custnm,
      };
    });
  };
  const getAttachmentsData = (data: IAttachmentData) => {
    setInfomation((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };
  const getAttachmentsData2 = (data: IAttachmentData) => {
    setInfomation2((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };
  const getAttachmentsData5 = (data: IAttachmentData) => {
    setInfomation5((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page2, setPage2] = useState(initialPageState);
  const [page2_1, setPage2_1] = useState(initialPageState);
  const [page2_2, setPage2_2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page3_1, setPage3_1] = useState(initialPageState);
  const [page3_2, setPage3_2] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page4_1, setPage4_1] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
  const [page5_1, setPage5_1] = useState(initialPageState);
  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage2_1(initialPageState);
    setPage2_2(initialPageState);
    setFilters2_1((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
    }));
    setFilters2_2((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
    }));
    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pageChange2_1 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2_1((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2_1({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pageChange2_2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2_2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2_2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage3_1(initialPageState);
    setPage3_2(initialPageState);
    setFilters3_1((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
    }));
    setFilters3_2((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
    }));
    setFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
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
      find_row_value: "",
      isSearch: true,
    }));

    setPage3_1({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pageChange3_2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3_2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage3_2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setPage4_1(initialPageState);
    setFilters4_1((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
    }));

    setFilters4((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange4_1 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters4_1((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage4_1({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange5 = (event: GridPageChangeEvent) => {
    const { page } = event;
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage5_1(initialPageState);
    setFilters5_1((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
    }));

    setFilters5((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage5({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange5_1 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters5_1((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage5_1({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0050W_tab1_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_userid": userId,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => ({
        ...row,
        start: new Date(dateformat2(row.Strdt) + " 00:00"),
        end: new Date(
          dateformat2(row.Enddt) + (row.AllDay == 1 ? " 24:00" : " 23:00")
        ),
        description: row.contents,
        title: row.title,
        id: row.num,
        isAllday: row.AllDay == 1 ? true : false,
      }));

      setMainDataResult(rows);
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

  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0050W_tab2_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_acntsrtnum": filters2.acntsrtnum,
        "@p_acntsrtnm": filters2.acntsrtnm,
        "@p_bankacntnum": filters2.bankacntnum,
        "@p_dptcd": filters2.dptcd,
        "@p_remark": filters2.remark,
        "@p_acntcd": filters2.acntcd,
        "@p_bankacntdiv": filters2.bankacntdiv,
        "@p_useyn": filters2.useyn2,

        "@p_find_row_value": filters2.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.acntsrtnum == filters2.find_row_value
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
            : rows.find(
                (row: any) => row.acntsrtnum == filters2.find_row_value
              );
        if (selectedRow != undefined) {
          setSelectedState2({ [selectedRow[DATA_ITEM_KEY2]]: true });
          setInfomation({
            workType: "U",
            acntcd: selectedRow.acntcd,
            acntnm: selectedRow.acntnm,
            acntsrtnm: selectedRow.acntsrtnm,
            acntsrtnum: selectedRow.acntsrtnum,
            amtunit: selectedRow.amtunit,
            attdatnum: selectedRow.attdatnum,
            bankacntdiv: selectedRow.bankacntdiv,
            bankacntnum: selectedRow.bankacntnum,
            bankcd: selectedRow.bankcd,
            bankdiv: selectedRow.bankdiv,
            banknm: selectedRow.banknm,
            closedt:
              selectedRow.closedt == "" ? null : toDate(selectedRow.closedt),
            contracamt: selectedRow.contracamt,
            cotracdt:
              selectedRow.cotracdt == "" ? null : toDate(selectedRow.cotracdt),
            dptcd: selectedRow.dptcd,
            enddt: selectedRow.enddt == "" ? null : toDate(selectedRow.enddt),
            files: selectedRow.files,
            findrow_key: selectedRow.findrow_key,
            intrat: selectedRow.intrat,
            limitamt: selectedRow.limitamt,
            monsaveamt: selectedRow.monsaveamt,
            motgdesc: selectedRow.motgdesc,
            orgdiv: selectedRow.orgdiv,
            plandiv: selectedRow.plandiv,
            remark: selectedRow.remark,
            savecnt: selectedRow.savecnt,
            useyn: selectedRow.useyn,
          });
          setFilters2_1((prev) => ({
            ...prev,
            isSearch: true,
            acntsrtnum: selectedRow.acntsrtnum,
            pgNum: 1,
          }));
          setFilters2_2((prev) => ({
            ...prev,
            isSearch: true,
            acntsrtnum: selectedRow.acntsrtnum,
            pgNum: 1,
          }));
          setPage2_1(initialPageState);
          setPage2_2(initialPageState);
        } else {
          setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
          setInfomation({
            workType: "U",
            acntcd: rows[0].acntcd,
            acntnm: rows[0].acntnm,
            acntsrtnm: rows[0].acntsrtnm,
            acntsrtnum: rows[0].acntsrtnum,
            amtunit: rows[0].amtunit,
            attdatnum: rows[0].attdatnum,
            bankacntdiv: rows[0].bankacntdiv,
            bankacntnum: rows[0].bankacntnum,
            bankcd: rows[0].bankcd,
            bankdiv: rows[0].bankdiv,
            banknm: rows[0].banknm,
            closedt: rows[0].closedt == "" ? null : toDate(rows[0].closedt),
            contracamt: rows[0].contracamt,
            cotracdt: rows[0].cotracdt == "" ? null : toDate(rows[0].cotracdt),
            dptcd: rows[0].dptcd,
            enddt: rows[0].enddt == "" ? null : toDate(rows[0].enddt),
            files: rows[0].files,
            findrow_key: rows[0].findrow_key,
            intrat: rows[0].intrat,
            limitamt: rows[0].limitamt,
            monsaveamt: rows[0].monsaveamt,
            motgdesc: rows[0].motgdesc,
            orgdiv: rows[0].orgdiv,
            plandiv: rows[0].plandiv,
            remark: rows[0].remark,
            savecnt: rows[0].savecnt,
            useyn: rows[0].useyn,
          });
          setFilters2_1((prev) => ({
            ...prev,
            isSearch: true,
            acntsrtnum: selectedRow.acntsrtnum,
            pgNum: 1,
          }));
          setFilters2_2((prev) => ({
            ...prev,
            isSearch: true,
            acntsrtnum: selectedRow.acntsrtnum,
            pgNum: 1,
          }));
          setPage2_1(initialPageState);
          setPage2_2(initialPageState);
        }
      } else {
        setInfomation({
          workType: "N",
          acntcd: "",
          acntnm: "",
          acntsrtnm: "",
          acntsrtnum: "",
          amtunit: "",
          attdatnum: "",
          bankacntdiv: "",
          bankacntnum: "",
          bankcd: "",
          bankdiv: "",
          banknm: "",
          closedt: null,
          contracamt: 0,
          cotracdt: null,
          dptcd: "",
          enddt: null,
          files: "",
          findrow_key: "",
          intrat: 0,
          limitamt: 0,
          monsaveamt: 0,
          motgdesc: "",
          orgdiv: sessionOrgdiv,
          plandiv: "",
          remark: "",
          savecnt: 0,
          useyn: "N",
        });
        setPage2_1(initialPageState);
        setPage2_2(initialPageState);
        setMainDataResult2_1(process([], mainDataState2_1));
        setMainDataResult2_2(process([], mainDataState2_2));
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

  const fetchMainGrid2_1 = async (filters2_1: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0050W_tab2_Q",
      pageNumber: filters2_1.pgNum,
      pageSize: filters2_1.pgSize,
      parameters: {
        "@p_work_type": filters2_1.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_acntsrtnum": filters2_1.acntsrtnum,
        "@p_acntsrtnm": filters2.acntsrtnm,
        "@p_bankacntnum": filters2.bankacntnum,
        "@p_dptcd": filters2.dptcd,
        "@p_remark": filters2.remark,
        "@p_acntcd": filters2.acntcd,
        "@p_bankacntdiv": filters2.bankacntdiv,
        "@p_useyn": filters2.useyn2,

        "@p_find_row_value": filters2.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult2_1((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState2_1({ [rows[0][DATA_ITEM_KEY2_1]]: true });
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

  const fetchMainGrid2_2 = async (filters2_2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0050W_tab2_Q",
      pageNumber: filters2_2.pgNum,
      pageSize: filters2_2.pgSize,
      parameters: {
        "@p_work_type": filters2_2.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_acntsrtnum": filters2_2.acntsrtnum,
        "@p_acntsrtnm": filters2.acntsrtnm,
        "@p_bankacntnum": filters2.bankacntnum,
        "@p_dptcd": filters2.dptcd,
        "@p_remark": filters2.remark,
        "@p_acntcd": filters2.acntcd,
        "@p_bankacntdiv": filters2.bankacntdiv,
        "@p_useyn": filters2.useyn2,

        "@p_find_row_value": filters2.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult2_2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState2_2({ [rows[0][DATA_ITEM_KEY2_2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters2_2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchMainGrid3 = async (filters3: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0050W_tab3_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_brwnum": filters3.brwnum,
        "@p_brwnm": filters3.brwnm,
        "@p_brwdesc": filters3.brwdesc,
        "@p_custcd": filters3.custcd,
        "@p_custnm": filters3.custnm,
        "@p_remark": filters3.remark,

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
      const rows = data.tables[0].Rows;
      if (filters3.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.brwnum == filters3.find_row_value
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
            : rows.find((row: any) => row.brwnum == filters3.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState3({ [selectedRow[DATA_ITEM_KEY3]]: true });
          setInfomation2({
            workType: "U",
            acntcd: selectedRow.acntcd,
            acntnm: selectedRow.acntnm,
            amtunit: selectedRow.amtunit,
            attdatnum: selectedRow.attdatnum,
            bankacntnum: selectedRow.bankacntnum,
            brwamt: selectedRow.brwamt,
            brwamtdlr: selectedRow.brwamtdlr,
            brwamtown: selectedRow.brwamtown,
            brwdesc: selectedRow.brwdesc,
            brwdt: selectedRow.brwdt == "" ? null : toDate(selectedRow.brwdt),
            brwnm: selectedRow.brwnm,
            brwnum: selectedRow.brwnum,
            brwtype: selectedRow.brwtype,
            chgintrat: selectedRow.chgintrat,
            chgrat: selectedRow.chgrat,
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            enddt: selectedRow.enddt == "" ? null : toDate(selectedRow.enddt),
            endrdmdt:
              selectedRow.endrdmdt == "" ? null : toDate(selectedRow.endrdmdt),
            files: selectedRow.files,
            findrow_key: selectedRow.findrow_key,
            intpayamt: selectedRow.intpayamt,
            intpaydt:
              selectedRow.intpaydt == "" ? null : toDate(selectedRow.intpaydt),
            intpayown: selectedRow.intpayown,
            intpayterm: selectedRow.intpayterm,
            intrat: selectedRow.intrat,
            janamt: selectedRow.janamt,
            motgdesc: selectedRow.motgdesc,
            orgdiv: selectedRow.orgdiv,
            rdmprd: selectedRow.rdmprd,
            rdmterm: selectedRow.rdmterm,
            redeem: selectedRow.redeem,
            remark: selectedRow.remark,
            strdmdt:
              selectedRow.strdmdt == "" ? null : toDate(selectedRow.strdmdt),
          });
          setFilters3_1((prev) => ({
            ...prev,
            isSearch: true,
            brwnum: selectedRow.brwnum,
            pgNum: 1,
          }));
          setFilters3_2((prev) => ({
            ...prev,
            isSearch: true,
            brwnum: selectedRow.brwnum,
            pgNum: 1,
          }));
          setPage3_1(initialPageState);
          setPage3_2(initialPageState);
        } else {
          setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
          setInfomation2({
            workType: "U",
            acntcd: rows[0].acntcd,
            acntnm: rows[0].acntnm,
            amtunit: rows[0].amtunit,
            attdatnum: rows[0].attdatnum,
            bankacntnum: rows[0].bankacntnum,
            brwamt: rows[0].brwamt,
            brwamtdlr: rows[0].brwamtdlr,
            brwamtown: rows[0].brwamtown,
            brwdesc: rows[0].brwdesc,
            brwdt: rows[0].brwdt == "" ? null : toDate(rows[0].brwdt),
            brwnm: rows[0].brwnm,
            brwnum: rows[0].brwnum,
            brwtype: rows[0].brwtype,
            chgintrat: rows[0].chgintrat,
            chgrat: rows[0].chgrat,
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            enddt: rows[0].enddt == "" ? null : toDate(rows[0].enddt),
            endrdmdt: rows[0].endrdmdt == "" ? null : toDate(rows[0].endrdmdt),
            files: rows[0].files,
            findrow_key: rows[0].findrow_key,
            intpayamt: rows[0].intpayamt,
            intpaydt: rows[0].intpaydt == "" ? null : toDate(rows[0].intpaydt),
            intpayown: rows[0].intpayown,
            intpayterm: rows[0].intpayterm,
            intrat: rows[0].intrat,
            janamt: rows[0].janamt,
            motgdesc: rows[0].motgdesc,
            orgdiv: rows[0].orgdiv,
            rdmprd: rows[0].rdmprd,
            rdmterm: rows[0].rdmterm,
            redeem: rows[0].redeem,
            remark: rows[0].remark,
            strdmdt: rows[0].strdmdt == "" ? null : toDate(rows[0].strdmdt),
          });
          setFilters3_1((prev) => ({
            ...prev,
            isSearch: true,
            brwnum: rows[0].brwnum,
            pgNum: 1,
          }));
          setFilters3_2((prev) => ({
            ...prev,
            isSearch: true,
            brwnum: rows[0].brwnum,
            pgNum: 1,
          }));
          setPage3_1(initialPageState);
          setPage3_2(initialPageState);
        }
      } else {
        setInfomation2({
          workType: "N",
          acntcd: "",
          acntnm: "",
          amtunit: "",
          attdatnum: "",
          bankacntnum: "",
          brwamt: 0,
          brwamtdlr: 0,
          brwamtown: 0,
          brwdesc: "",
          brwdt: null,
          brwnm: "",
          brwnum: "",
          brwtype: "",
          chgintrat: 0,
          chgrat: 0,
          custcd: "",
          custnm: "",
          enddt: null,
          endrdmdt: null,
          files: "",
          findrow_key: "",
          intpayamt: 0,
          intpaydt: null,
          intpayown: 0,
          intpayterm: "",
          intrat: 0,
          janamt: 0,
          motgdesc: "",
          orgdiv: sessionOrgdiv,
          rdmprd: 0,
          rdmterm: "N",
          redeem: 0,
          remark: "",
          strdmdt: null,
        });
        setPage3_1(initialPageState);
        setPage3_2(initialPageState);
        setMainDataResult3_1(process([], mainDataState3_1));
        setMainDataResult3_2(process([], mainDataState3_2));
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

  const fetchMainGrid3_1 = async (filters3_1: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0050W_tab3_Q",
      pageNumber: filters3_1.pgNum,
      pageSize: filters3_1.pgSize,
      parameters: {
        "@p_work_type": filters3_1.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_brwnum": filters3_1.brwnum,
        "@p_brwnm": filters3.brwnm,
        "@p_brwdesc": filters3.brwdesc,
        "@p_custcd": filters3.custcd,
        "@p_custnm": filters3.custnm,
        "@p_remark": filters3.remark,

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
      const rows = data.tables[0].Rows;

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

  const fetchMainGrid3_2 = async (filters3_2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0050W_tab3_Q",
      pageNumber: filters3_2.pgNum,
      pageSize: filters3_2.pgSize,
      parameters: {
        "@p_work_type": filters3_2.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_brwnum": filters3_2.brwnum,
        "@p_brwnm": filters3.brwnm,
        "@p_brwdesc": filters3.brwdesc,
        "@p_custcd": filters3.custcd,
        "@p_custnm": filters3.custnm,
        "@p_remark": filters3.remark,

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
      const rows = data.tables[0].Rows;

      setMainDataResult3_2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState3_2({ [rows[0][DATA_ITEM_KEY3_2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters3_2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchMainGrid4 = async (filters4: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0050W_tab4_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": filters4.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_notenum": filters4.notenum,
        "@p_notediv": filters4.notediv,
        "@p_notekind": filters4.notekind,
        "@p_custcd": filters4.custcd,
        "@p_custnm": filters4.custnm,
        "@p_pubbank": filters4.pubbank,
        "@p_dtgb": filters4.dtgb,
        "@p_frdt": convertDateToStr(filters4.frdt),
        "@p_todt": convertDateToStr(filters4.todt),
        "@p_remark1": filters4.remark1,
        "@p_notests": filters4.notests,

        "@p_find_row_value": filters4.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (filters4.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef4.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.notenum == filters4.find_row_value
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
            : rows.find((row: any) => row.notenum == filters4.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState4({ [selectedRow[DATA_ITEM_KEY4]]: true });
          setInfomation3({
            workType: "U",
            acntcd: selectedRow.acntcd,
            acntnm: selectedRow.acntnm,
            bankcd: selectedRow.bankcd,
            banknm: selectedRow.banknm,
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            dptcd: selectedRow.dptcd,
            enddt: toDate(selectedRow.enddt),
            endorser1: selectedRow.endorser1,
            endorser2: selectedRow.endorser2,
            findrow_key: selectedRow.findrow_key,
            notedec: selectedRow.notedec,
            notediv: selectedRow.notediv,
            notekind: selectedRow.notekind,
            noteloca: selectedRow.noteloca,
            notenum: selectedRow.notenum,
            notests: selectedRow.notests,
            orgdiv: selectedRow.orgdiv,
            pgmdiv: selectedRow.pgmdiv,
            pubamt: selectedRow.pubamt,
            pubbank: selectedRow.pubbank,
            pubdt: toDate(selectedRow.pubdt),
            pubperson: selectedRow.pubperson,
            remark1: selectedRow.remark1,
            replace_bankcd: selectedRow.replace_bankcd,
            replace_banknm: selectedRow.replace_banknm,
            replace_custcd: selectedRow.replace_custcd,
            replace_custnm: selectedRow.replace_custnm,
            replacedt:
              selectedRow.replacedt == ""
                ? null
                : toDate(selectedRow.replacedt),
            returndt:
              selectedRow.returndt == "" ? null : toDate(selectedRow.returndt),
          });

          setFilters4_1((prev) => ({
            ...prev,
            isSearch: true,
            notenum: selectedRow.notenum,
            pgNum: 1,
          }));
          setPage4_1(initialPageState);
        } else {
          setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
          setInfomation3({
            workType: "U",
            acntcd: rows[0].acntcd,
            acntnm: rows[0].acntnm,
            bankcd: rows[0].bankcd,
            banknm: rows[0].banknm,
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            dptcd: rows[0].dptcd,
            enddt: toDate(rows[0].enddt),
            endorser1: rows[0].endorser1,
            endorser2: rows[0].endorser2,
            findrow_key: rows[0].findrow_key,
            notedec: rows[0].notedec,
            notediv: rows[0].notediv,
            notekind: rows[0].notekind,
            noteloca: rows[0].noteloca,
            notenum: rows[0].notenum,
            notests: rows[0].notests,
            orgdiv: rows[0].orgdiv,
            pgmdiv: rows[0].pgmdiv,
            pubamt: rows[0].pubamt,
            pubbank: rows[0].pubbank,
            pubdt: toDate(rows[0].pubdt),
            pubperson: rows[0].pubperson,
            remark1: rows[0].remark1,
            replace_bankcd: rows[0].replace_bankcd,
            replace_banknm: rows[0].replace_banknm,
            replace_custcd: rows[0].replace_custcd,
            replace_custnm: rows[0].replace_custnm,
            replacedt:
              rows[0].replacedt == "" ? null : toDate(rows[0].replacedt),
            returndt: rows[0].returndt == "" ? null : toDate(rows[0].returndt),
          });
          setFilters4_1((prev) => ({
            ...prev,
            isSearch: true,
            notenum: rows[0].notenum,
            pgNum: 1,
          }));
          setPage4_1(initialPageState);
        }
      } else {
        setInfomation3({
          workType: "N",
          acntcd: "",
          acntnm: "",
          bankcd: "",
          banknm: "",
          custcd: "",
          custnm: "",
          dptcd: "",
          enddt: new Date(),
          endorser1: "",
          endorser2: "",
          findrow_key: "",
          notedec: "",
          notediv: "1",
          notekind: "",
          noteloca: "",
          notenum: "",
          notests: "",
          orgdiv: sessionOrgdiv,
          pgmdiv: "",
          pubamt: 0,
          pubbank: "",
          pubdt: new Date(),
          pubperson: "",
          remark1: "",
          replace_bankcd: "",
          replace_banknm: "",
          replace_custcd: "",
          replace_custnm: "",
          replacedt: null,
          returndt: null,
        });
        setPage4_1(initialPageState);
        setMainDataResult4_1(process([], mainDataState4_1));
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

  const fetchMainGrid4_1 = async (filters4_1: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0050W_tab4_Q",
      pageNumber: filters4_1.pgNum,
      pageSize: filters4_1.pgSize,
      parameters: {
        "@p_work_type": filters4_1.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_notenum": filters4_1.notenum,
        "@p_notediv": filters4.notediv,
        "@p_notekind": filters4.notekind,
        "@p_custcd": filters4.custcd,
        "@p_custnm": filters4.custnm,
        "@p_pubbank": filters4.pubbank,
        "@p_dtgb": filters4.dtgb,
        "@p_frdt": convertDateToStr(filters4.frdt),
        "@p_todt": convertDateToStr(filters4.todt),
        "@p_remark1": filters4.remark1,
        "@p_notests": filters4.notests,

        "@p_find_row_value": filters4.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult4_1((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState4_1({ [rows[0][DATA_ITEM_KEY4_1]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters4_1((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchMainGrid5 = async (filters5: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0050W_tab5_Q",
      pageNumber: filters5.pgNum,
      pageSize: filters5.pgSize,
      parameters: {
        "@p_work_type": filters5.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_creditcd": filters5.creditcd,
        "@p_creditnum": filters5.creditnum,
        "@p_creditnm": filters5.creditnm,
        "@p_creditdiv": filters5.creditdiv,
        "@p_cordiv": filters5.cordiv,
        "@p_custcd": filters5.custcd,
        "@p_custnm": filters5.custnm,
        "@p_useyn": filters5.useyn3,
        "@p_remark": filters5.remark,
        "@p_find_row_value": filters5.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (filters5.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef5.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.creditcd == filters5.find_row_value
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
          filters5.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.creditcd == filters5.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState5({ [selectedRow[DATA_ITEM_KEY5]]: true });
          setInfomation5({
            workType: "U",
            attdatnum: selectedRow.attdatnum,
            bankacntnum: selectedRow.bankacntnum,
            cordiv: selectedRow.cordiv,
            creditcd: selectedRow.creditcd,
            creditdiv: selectedRow.creditdiv,
            creditnm: selectedRow.creditnm,
            creditnum: selectedRow.creditnum,
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            exprdt:
              selectedRow.exprdt == "" ? null : toDate(selectedRow.exprdt),
            files: selectedRow.files,
            findrow_key: selectedRow.findrow_key,
            orgdiv: selectedRow.orgdiv,
            paydt: selectedRow.paydt == "" ? null : toDate(selectedRow.paydt),
            person: selectedRow.person,
            rcvcustcd: selectedRow.rcvcustcd,
            rcvcustnm: selectedRow.rcvcustnm,
            remark: selectedRow.remark,
            repreregno: selectedRow.repreregno,
            useyn: selectedRow.useyn,
          });
          setFilters5_1((prev) => ({
            ...prev,
            isSearch: true,
            creditcd: selectedRow.creditcd,
            pgNum: 1,
          }));
          setPage5_1(initialPageState);
        } else {
          setSelectedState5({ [rows[0][DATA_ITEM_KEY5]]: true });
          setInfomation5({
            workType: "U",
            attdatnum: rows[0].attdatnum,
            bankacntnum: rows[0].bankacntnum,
            cordiv: rows[0].cordiv,
            creditcd: rows[0].creditcd,
            creditdiv: rows[0].creditdiv,
            creditnm: rows[0].creditnm,
            creditnum: rows[0].creditnum,
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            exprdt: rows[0].exprdt == "" ? null : toDate(rows[0].exprdt),
            files: rows[0].files,
            findrow_key: rows[0].findrow_key,
            orgdiv: rows[0].orgdiv,
            paydt: rows[0].paydt == "" ? null : toDate(rows[0].paydt),
            person: rows[0].person,
            rcvcustcd: rows[0].rcvcustcd,
            rcvcustnm: rows[0].rcvcustnm,
            remark: rows[0].remark,
            repreregno: rows[0].repreregno,
            useyn: rows[0].useyn,
          });
          setFilters5_1((prev) => ({
            ...prev,
            isSearch: true,
            creditcd: rows[0].creditcd,
            pgNum: 1,
          }));
          setPage5_1(initialPageState);
        }
      } else {
        setInfomation5({
          workType: "N",
          attdatnum: "",
          bankacntnum: "",
          cordiv: "",
          creditcd: "",
          creditdiv: "",
          creditnm: "",
          creditnum: "",
          custcd: "",
          custnm: "",
          exprdt: null,
          files: "",
          findrow_key: "",
          orgdiv: sessionOrgdiv,
          paydt: null,
          person: "",
          rcvcustcd: "",
          rcvcustnm: "",
          remark: "",
          repreregno: "",
          useyn: "Y",
        });
        setPage5_1(initialPageState);
        setMainDataResult5_1(process([], mainDataState5_1));
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

  const fetchMainGrid5_1 = async (filters5_1: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0050W_tab5_Q",
      pageNumber: filters5_1.pgNum,
      pageSize: filters5_1.pgSize,
      parameters: {
        "@p_work_type": filters5_1.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_creditcd": filters5_1.creditcd,
        "@p_creditnum": filters5.creditnum,
        "@p_creditnm": filters5.creditnm,
        "@p_creditdiv": filters5.creditdiv,
        "@p_cordiv": filters5.cordiv,
        "@p_custcd": filters5.custcd,
        "@p_custnm": filters5.custnm,
        "@p_useyn": filters5.useyn3,
        "@p_remark": filters5.remark,
        "@p_find_row_value": filters5.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult5_1((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState5_1({ [rows[0][DATA_ITEM_KEY5_1]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters5_1((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const resetAllGrid = () => {
    if (tabSelected == 0) {
      setMainDataResult(defaultData);
    } else if (tabSelected == 1) {
      setPage2(initialPageState);
      setPage2_1(initialPageState);
      setPage2_2(initialPageState);
      setMainDataResult2(process([], mainDataState2));
      setMainDataResult2_1(process([], mainDataState2_1));
      setMainDataResult2_2(process([], mainDataState2_2));
      setInfomation({
        workType: "N",
        acntcd: "",
        acntnm: "",
        acntsrtnm: "",
        acntsrtnum: "",
        amtunit: "",
        attdatnum: "",
        bankacntdiv: "",
        bankacntnum: "",
        bankcd: "",
        bankdiv: "",
        banknm: "",
        closedt: null,
        contracamt: 0,
        cotracdt: null,
        dptcd: "",
        enddt: null,
        files: "",
        findrow_key: "",
        intrat: 0,
        limitamt: 0,
        monsaveamt: 0,
        motgdesc: "",
        orgdiv: sessionOrgdiv,
        plandiv: "",
        remark: "",
        savecnt: 0,
        useyn: "N",
      });
    } else if (tabSelected == 2) {
      setPage3(initialPageState);
      setPage3_1(initialPageState);
      setPage3_2(initialPageState);
      setMainDataResult3(process([], mainDataState3));
      setMainDataResult3_1(process([], mainDataState3_1));
      setMainDataResult3_2(process([], mainDataState3_2));
      setInfomation2({
        workType: "N",
        acntcd: "",
        acntnm: "",
        amtunit: "",
        attdatnum: "",
        bankacntnum: "",
        brwamt: 0,
        brwamtdlr: 0,
        brwamtown: 0,
        brwdesc: "",
        brwdt: null,
        brwnm: "",
        brwnum: "",
        brwtype: "",
        chgintrat: 0,
        chgrat: 0,
        custcd: "",
        custnm: "",
        enddt: null,
        endrdmdt: null,
        files: "",
        findrow_key: "",
        intpayamt: 0,
        intpaydt: null,
        intpayown: 0,
        intpayterm: "",
        intrat: 0,
        janamt: 0,
        motgdesc: "",
        orgdiv: sessionOrgdiv,
        rdmprd: 0,
        rdmterm: "N",
        redeem: 0,
        remark: "",
        strdmdt: null,
      });
    } else if (tabSelected == 3) {
      setPage4(initialPageState);
      setPage4_1(initialPageState);
      setMainDataResult4(process([], mainDataState4));
      setMainDataResult4_1(process([], mainDataState4_1));
      setInfomation3({
        workType: "N",
        acntcd: "",
        acntnm: "",
        bankcd: "",
        banknm: "",
        custcd: "",
        custnm: "",
        dptcd: "",
        enddt: new Date(),
        endorser1: "",
        endorser2: "",
        findrow_key: "",
        notedec: "",
        notediv: "1",
        notekind: "",
        noteloca: "",
        notenum: "",
        notests: "",
        orgdiv: sessionOrgdiv,
        pgmdiv: "",
        pubamt: 0,
        pubbank: "",
        pubdt: new Date(),
        pubperson: "",
        remark1: "",
        replace_bankcd: "",
        replace_banknm: "",
        replace_custcd: "",
        replace_custnm: "",
        replacedt: null,
        returndt: null,
      });
    } else if (tabSelected == 4) {
      setPage5(initialPageState);
      setPage5_1(initialPageState);
      setMainDataResult5(process([], mainDataState5));
      setMainDataResult5_1(process([], mainDataState5_1));
      setInfomation5({
        workType: "N",
        attdatnum: "",
        bankacntnum: "",
        cordiv: "",
        creditcd: "",
        creditdiv: "",
        creditnm: "",
        creditnum: "",
        custcd: "",
        custnm: "",
        exprdt: null,
        files: "",
        findrow_key: "",
        orgdiv: sessionOrgdiv,
        paydt: null,
        person: "",
        rcvcustcd: "",
        rcvcustnm: "",
        remark: "",
        repreregno: "",
        useyn: "Y",
      });
    }
  };

  const search = () => {
    try {
      resetAllGrid();
      if (unsavedName.length > 0) {
        setDeletedName(unsavedName);
      }
      if (unsavedAttadatnums.length > 0) {
        setDeletedAttadatnums(unsavedAttadatnums);
      }
      if (tabSelected == 0) {
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      } else if (tabSelected == 1) {
        setFilters2((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        if (isMobile && swiper) {
          swiper.slideTo(0);
        }
      } else if (tabSelected == 2) {
        setFilters3((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        if (isMobile && swiper) {
          swiper.slideTo(0);
        }
      } else if (tabSelected == 3) {
        try {
          if (
            filters4.dtgb == null ||
            filters4.dtgb == "" ||
            filters4.dtgb == undefined
          ) {
            throw findMessage(messagesData, "AC_A0050W_001");
          } else if (
            convertDateToStr(filters4.frdt).substring(0, 4) < "1997" ||
            convertDateToStr(filters4.frdt).substring(6, 8) > "31" ||
            convertDateToStr(filters4.frdt).substring(6, 8) < "01" ||
            convertDateToStr(filters4.frdt).substring(6, 8).length != 2
          ) {
            throw findMessage(messagesData, "AC_A0050W_001");
          } else if (
            convertDateToStr(filters4.todt).substring(0, 4) < "1997" ||
            convertDateToStr(filters4.todt).substring(6, 8) > "31" ||
            convertDateToStr(filters4.todt).substring(6, 8) < "01" ||
            convertDateToStr(filters4.todt).substring(6, 8).length != 2
          ) {
            throw findMessage(messagesData, "AC_A0050W_001");
          } else {
            setFilters4((prev) => ({
              ...prev,
              pgNum: 1,
              find_row_value: "",
              isSearch: true,
            }));
            if (isMobile && swiper) {
              swiper.slideTo(0);
            }
          }
        } catch (e) {
          alert(e);
        }
      } else if (tabSelected == 4) {
        setFilters5((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        if (isMobile && swiper) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  useEffect(() => {
    if (
      filters2.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData, bizComponentData]);

  useEffect(() => {
    if (
      filters2_1.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2_1);
      setFilters2_1((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2_1(deepCopiedFilters);
    }
  }, [filters2_1, permissions, customOptionData, bizComponentData]);

  useEffect(() => {
    if (
      filters2_2.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2_2);
      setFilters2_2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2_2(deepCopiedFilters);
    }
  }, [filters2_2, permissions, customOptionData, bizComponentData]);

  useEffect(() => {
    if (
      filters3.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions, customOptionData, bizComponentData]);

  useEffect(() => {
    if (
      filters3_1.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3_1);
      setFilters3_1((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3_1(deepCopiedFilters);
    }
  }, [filters3_1, permissions, customOptionData, bizComponentData]);

  useEffect(() => {
    if (
      filters3_2.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3_2);
      setFilters3_2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3_2(deepCopiedFilters);
    }
  }, [filters3_2, permissions, customOptionData, bizComponentData]);

  useEffect(() => {
    if (
      filters4.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4, permissions, customOptionData, bizComponentData]);

  useEffect(() => {
    if (
      filters4_1.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4_1);
      setFilters4_1((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid4_1(deepCopiedFilters);
    }
  }, [filters4_1, permissions, customOptionData, bizComponentData]);

  useEffect(() => {
    if (
      filters5.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters5);
      setFilters5((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid5(deepCopiedFilters);
    }
  }, [filters5, permissions, customOptionData, bizComponentData]);

  useEffect(() => {
    if (
      filters5_1.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters5_1);
      setFilters5_1((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid5_1(deepCopiedFilters);
    }
  }, [filters5_1, permissions, customOptionData, bizComponentData]);

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
    if (targetRowIndex4 !== null && gridRef2.current) {
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

  let _export2: any;
  let _export2_1: any;
  let _export2_2: any;
  let _export3: any;
  let _export3_1: any;
  let _export3_2: any;
  let _export4: any;
  let _export4_1: any;
  let _export5: any;
  let _export5_1: any;
  const exportExcel = () => {
    if (tabSelected == 1) {
      if (tabSelected2 == 0) {
        if (_export2 !== null && _export2 !== undefined) {
          const optionsGridOne = _export2.workbookOptions();
          optionsGridOne.sheets[0].title = "요약정보";
          _export2.save(optionsGridOne);
        }
      } else if (tabSelected2 == 1) {
        if (_export2 !== null && _export2 !== undefined) {
          const optionsGridOne = _export2.workbookOptions();
          const optionsGridTwo = _export2_1.workbookOptions();
          optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
          optionsGridOne.sheets[0].title = "요약정보";
          optionsGridOne.sheets[1].title = "상세정보";
          _export2.save(optionsGridOne);
        }
      } else if (tabSelected2 == 2) {
        if (_export2 !== null && _export2 !== undefined) {
          const optionsGridOne = _export2.workbookOptions();
          const optionsGridTwo = _export2_2.workbookOptions();
          optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
          optionsGridOne.sheets[0].title = "요약정보";
          optionsGridOne.sheets[1].title = "전표상세정보";
          _export2.save(optionsGridOne);
        }
      }
    } else if (tabSelected == 2) {
      if (tabSelected2 == 0) {
        if (_export3 !== null && _export3 !== undefined) {
          const optionsGridOne = _export3.workbookOptions();
          optionsGridOne.sheets[0].title = "요약정보";
          _export3.save(optionsGridOne);
        }
      } else if (tabSelected2 == 1) {
        if (_export3 !== null && _export3 !== undefined) {
          const optionsGridOne = _export3.workbookOptions();
          const optionsGridTwo = _export3_1.workbookOptions();
          optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
          optionsGridOne.sheets[0].title = "요약정보";
          optionsGridOne.sheets[1].title = "상세정보";
          _export3.save(optionsGridOne);
        }
      } else if (tabSelected2 == 2) {
        if (_export3 !== null && _export3 !== undefined) {
          const optionsGridOne = _export3.workbookOptions();
          const optionsGridTwo = _export3_2.workbookOptions();
          optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
          optionsGridOne.sheets[0].title = "요약정보";
          optionsGridOne.sheets[1].title = "전표상세정보";
          _export3.save(optionsGridOne);
        }
      }
    } else if (tabSelected == 3) {
      if (tabSelected2 == 0) {
        if (_export4 !== null && _export4 !== undefined) {
          const optionsGridOne = _export4.workbookOptions();
          optionsGridOne.sheets[0].title = "요약정보";
          _export4.save(optionsGridOne);
        }
      } else if (tabSelected2 == 1) {
        if (_export4 !== null && _export4 !== undefined) {
          const optionsGridOne = _export4.workbookOptions();
          const optionsGridTwo = _export4_1.workbookOptions();
          optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
          optionsGridOne.sheets[0].title = "요약정보";
          optionsGridOne.sheets[1].title = "상세정보";
          _export4.save(optionsGridOne);
        }
      }
    } else if (tabSelected == 4) {
      if (tabSelected2 == 0) {
        if (_export5 !== null && _export5 !== undefined) {
          const optionsGridOne = _export5.workbookOptions();
          optionsGridOne.sheets[0].title = "요약정보";
          _export5.save(optionsGridOne);
        }
      } else if (tabSelected2 == 1) {
        if (_export5 !== null && _export5 !== undefined) {
          const optionsGridOne = _export5.workbookOptions();
          const optionsGridTwo = _export5_1.workbookOptions();
          optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
          optionsGridOne.sheets[0].title = "요약정보";
          optionsGridOne.sheets[1].title = "상세정보";
          _export5.save(optionsGridOne);
        }
      }
    }
  };

  const handleSelectTab = (e: any) => {
    setTabSelected2(0);
    setTabSelected(e.selected);
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }

    if (tabSelected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
    } else if (tabSelected == 1) {
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
    } else if (tabSelected == 2) {
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
    } else if (tabSelected == 3) {
      setFilters4((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
    } else if (tabSelected == 4) {
      setFilters5((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
    }
  };
  const handleSelectTab2 = (e: any) => {
    setTabSelected2(e.selected);
  };
  const displayDate: Date = new Date();

  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainDataStateChange2_1 = (event: GridDataStateChangeEvent) => {
    setMainDataState2_1(event.dataState);
  };
  const onMainDataStateChange2_2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2_2(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
  const onMainDataStateChange3_1 = (event: GridDataStateChangeEvent) => {
    setMainDataState3_1(event.dataState);
  };
  const onMainDataStateChange3_2 = (event: GridDataStateChangeEvent) => {
    setMainDataState3_2(event.dataState);
  };
  const onMainDataStateChange4 = (event: GridDataStateChangeEvent) => {
    setMainDataState4(event.dataState);
  };
  const onMainDataStateChange4_1 = (event: GridDataStateChangeEvent) => {
    setMainDataState4_1(event.dataState);
  };
  const onMainDataStateChange5 = (event: GridDataStateChangeEvent) => {
    setMainDataState5(event.dataState);
  };
  const onMainDataStateChange5_1 = (event: GridDataStateChangeEvent) => {
    setMainDataState5_1(event.dataState);
  };
  //그리드 푸터
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
  const mainTotalFooterCell2_1 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2_1.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2_1.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell2_2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2_2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2_2.total == -1
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

  //그리드 푸터
  const mainTotalFooterCell3_2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3_2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult3_2.total == -1
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

  const mainTotalFooterCell4_1 = (props: GridFooterCellProps) => {
    var parts = mainDataResult4_1.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult4_1.total == -1
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

  const mainTotalFooterCell5_1 = (props: GridFooterCellProps) => {
    var parts = mainDataResult5_1.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult5_1.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell2_2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2_2.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult3.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell3_2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult3_2.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell4 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult4.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell4_1 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult4_1.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell5_1 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult5_1.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const editNumberFooterCell2_1 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2_1.data.forEach((item) =>
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

  const editNumberFooterCell3_1 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult3_1.data.forEach((item) =>
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

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    const dptcd = dptcdListData.find(
      (item: any) => item.dptnm == selectedRowData.dptcd
    )?.dptcd;

    setInfomation({
      workType: "U",
      acntcd: selectedRowData.acntcd,
      acntnm: selectedRowData.acntnm,
      acntsrtnm: selectedRowData.acntsrtnm,
      acntsrtnum: selectedRowData.acntsrtnum,
      amtunit: selectedRowData.amtunit,
      attdatnum: selectedRowData.attdatnum,
      bankacntdiv: selectedRowData.bankacntdiv,
      bankacntnum: selectedRowData.bankacntnum,
      bankcd: selectedRowData.bankcd,
      bankdiv: selectedRowData.bankdiv,
      banknm: selectedRowData.banknm,
      closedt:
        selectedRowData.closedt == "" ? null : toDate(selectedRowData.closedt),
      contracamt: selectedRowData.contracamt,
      cotracdt:
        selectedRowData.cotracdt == ""
          ? null
          : toDate(selectedRowData.cotracdt),
      dptcd: dptcd,
      enddt: selectedRowData.enddt == "" ? null : toDate(selectedRowData.enddt),
      files: selectedRowData.files,
      findrow_key: selectedRowData.findrow_key,
      intrat: selectedRowData.intrat,
      limitamt: selectedRowData.limitamt,
      monsaveamt: selectedRowData.monsaveamt,
      motgdesc: selectedRowData.motgdesc,
      orgdiv: selectedRowData.orgdiv,
      plandiv: selectedRowData.plandiv,
      remark: selectedRowData.remark,
      savecnt: selectedRowData.savecnt,
      useyn: selectedRowData.useyn,
    });
    setFilters2_1((prev) => ({
      ...prev,
      isSearch: true,
      acntsrtnum: selectedRowData.acntsrtnum,
      pgNum: 1,
    }));
    setFilters2_2((prev) => ({
      ...prev,
      isSearch: true,
      acntsrtnum: selectedRowData.acntsrtnum,
      pgNum: 1,
    }));
    setPage2_1(initialPageState);
    setPage2_2(initialPageState);

    if (isMobile && swiper) {
      swiper.slideTo(1);
    }
  };

  const onSelectionChange2_1 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2_1,
      dataItemKey: DATA_ITEM_KEY2_1,
    });
    setSelectedState2_1(newSelectedState);
  };
  const onSelectionChange2_2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2_2,
      dataItemKey: DATA_ITEM_KEY2_2,
    });
    setSelectedState2_2(newSelectedState);
  };

  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedState3(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setInfomation2({
      workType: "U",
      acntcd: selectedRowData.acntcd,
      acntnm: selectedRowData.acntnm,
      amtunit: selectedRowData.amtunit,
      attdatnum: selectedRowData.attdatnum,
      bankacntnum: selectedRowData.bankacntnum,
      brwamt: selectedRowData.brwamt,
      brwamtdlr: selectedRowData.brwamtdlr,
      brwamtown: selectedRowData.brwamtown,
      brwdesc: selectedRowData.brwdesc,
      brwdt: selectedRowData.brwdt == "" ? null : toDate(selectedRowData.brwdt),
      brwnm: selectedRowData.brwnm,
      brwnum: selectedRowData.brwnum,
      brwtype: selectedRowData.brwtype,
      chgintrat: selectedRowData.chgintrat,
      chgrat: selectedRowData.chgrat,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      enddt: selectedRowData.enddt == "" ? null : toDate(selectedRowData.enddt),
      endrdmdt:
        selectedRowData.endrdmdt == ""
          ? null
          : toDate(selectedRowData.endrdmdt),
      files: selectedRowData.files,
      findrow_key: selectedRowData.findrow_key,
      intpayamt: selectedRowData.intpayamt,
      intpaydt:
        selectedRowData.intpaydt == ""
          ? null
          : toDate(selectedRowData.intpaydt),
      intpayown: selectedRowData.intpayown,
      intpayterm: selectedRowData.intpayterm,
      intrat: selectedRowData.intrat,
      janamt: selectedRowData.janamt,
      motgdesc: selectedRowData.motgdesc,
      orgdiv: selectedRowData.orgdiv,
      rdmprd: selectedRowData.rdmprd,
      rdmterm: selectedRowData.rdmterm,
      redeem: selectedRowData.redeem,
      remark: selectedRowData.remark,
      strdmdt:
        selectedRowData.strdmdt == "" ? null : toDate(selectedRowData.strdmdt),
    });

    setFilters3_1((prev) => ({
      ...prev,
      isSearch: true,
      brwnum: selectedRowData.brwnum,
      pgNum: 1,
    }));

    setFilters3_2((prev) => ({
      ...prev,
      isSearch: true,
      brwnum: selectedRowData.brwnum,
      pgNum: 1,
    }));
    setPage3_1(initialPageState);
    setPage3_2(initialPageState);
    if (isMobile && swiper) {
      swiper.slideTo(1);
    }
  };

  const onSelectionChange3_1 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3_1,
      dataItemKey: DATA_ITEM_KEY3_1,
    });
    setSelectedState3_1(newSelectedState);
  };
  const onSelectionChange3_2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3_2,
      dataItemKey: DATA_ITEM_KEY3_2,
    });
    setSelectedState3_2(newSelectedState);
  };

  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });
    setSelectedState4(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    const notediv = notedivListData.find(
      (item: any) => item.code_name == selectedRowData.notediv
    )?.sub_code;

    setInfomation3({
      workType: "U",
      acntcd: selectedRowData.acntcd,
      acntnm: selectedRowData.acntnm,
      bankcd: selectedRowData.bankcd,
      banknm: selectedRowData.banknm,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      dptcd: selectedRowData.dptcd,
      enddt: toDate(selectedRowData.enddt),
      endorser1: selectedRowData.endorser1,
      endorser2: selectedRowData.endorser2,
      findrow_key: selectedRowData.findrow_key,
      notedec: selectedRowData.notedec,
      notediv: notediv,
      notekind: selectedRowData.notekind,
      noteloca: selectedRowData.noteloca,
      notenum: selectedRowData.notenum,
      notests: selectedRowData.notests,
      orgdiv: selectedRowData.orgdiv,
      pgmdiv: selectedRowData.pgmdiv,
      pubamt: selectedRowData.pubamt,
      pubbank: selectedRowData.pubbank,
      pubdt: toDate(selectedRowData.pubdt),
      pubperson: selectedRowData.pubperson,
      remark1: selectedRowData.remark1,
      replace_bankcd: selectedRowData.replace_bankcd,
      replace_banknm: selectedRowData.replace_banknm,
      replace_custcd: selectedRowData.replace_custcd,
      replace_custnm: selectedRowData.replace_custnm,
      replacedt:
        selectedRowData.replacedt == ""
          ? null
          : toDate(selectedRowData.replacedt),
      returndt:
        selectedRowData.returndt == ""
          ? null
          : toDate(selectedRowData.returndt),
    });
    setFilters4_1((prev) => ({
      ...prev,
      isSearch: true,
      notenum: selectedRowData.notenum,
      pgNum: 1,
    }));
    setPage4_1(initialPageState);
    if (isMobile && swiper) {
      swiper.slideTo(1);
    }
  };

  const onSelectionChange4_1 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4_1,
      dataItemKey: DATA_ITEM_KEY4_1,
    });
    setSelectedState4_1(newSelectedState);
  };

  const onSelectionChange5 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState5,
      dataItemKey: DATA_ITEM_KEY5,
    });
    setSelectedState5(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    const creditdiv = creditdivListData.find(
      (item: any) => item.code_name == selectedRowData.creditdiv
    )?.sub_code;

    const cordiv = cordivListData.find(
      (item: any) => item.code_name == selectedRowData.cordiv
    )?.sub_code;

    setInfomation5({
      workType: "U",
      attdatnum: selectedRowData.attdatnum,
      bankacntnum: selectedRowData.bankacntnum,
      cordiv: cordiv,
      creditcd: selectedRowData.creditcd,
      creditdiv: creditdiv,
      creditnm: selectedRowData.creditnm,
      creditnum: selectedRowData.creditnum,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      exprdt:
        selectedRowData.exprdt == "" ? null : toDate(selectedRowData.exprdt),
      files: selectedRowData.files,
      findrow_key: selectedRowData.findrow_key,
      orgdiv: selectedRowData.orgdiv,
      paydt: selectedRowData.paydt == "" ? null : toDate(selectedRowData.paydt),
      person: selectedRowData.person,
      rcvcustcd: selectedRowData.rcvcustcd,
      rcvcustnm: selectedRowData.rcvcustnm,
      remark: selectedRowData.remark,
      repreregno: selectedRowData.repreregno,
      useyn: selectedRowData.useyn,
    });
    setFilters5_1((prev) => ({
      ...prev,
      isSearch: true,
      creditcd: selectedRowData.creditcd,
      pgNum: 1,
    }));
    setPage5_1(initialPageState);
    if (isMobile && swiper) {
      swiper.slideTo(1);
    }
  };

  const onSelectionChange5_1 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState5_1,
      dataItemKey: DATA_ITEM_KEY5_1,
    });
    setSelectedState5_1(newSelectedState);
  };

  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange2_1 = (e: any) => {
    setMainDataState2_1((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2_2 = (e: any) => {
    setMainDataState2_2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3_1 = (e: any) => {
    setMainDataState3_1((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3_2 = (e: any) => {
    setMainDataState3_2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange4 = (e: any) => {
    setMainDataState4((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange4_1 = (e: any) => {
    setMainDataState4_1((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange5 = (e: any) => {
    setMainDataState5((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange5_1 = (e: any) => {
    setMainDataState5_1((prev) => ({ ...prev, sort: e.sort }));
  };

  const onAddClick2 = () => {
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage2_1(initialPageState);
    setPage2_2(initialPageState);
    setMainDataResult2_1(process([], mainDataState2_1));
    setMainDataResult2_2(process([], mainDataState2_2));
    setTabSelected2(0);
    setInfomation({
      workType: "N",
      acntcd: "",
      acntnm: "",
      acntsrtnm: "",
      acntsrtnum: "",
      amtunit: defaultOption.find((item: any) => item.id == "amtunit")
        ?.valueCode,
      attdatnum: "",
      bankacntdiv: defaultOption.find((item: any) => item.id == "bankacntdiv")
        ?.valueCode,
      bankacntnum: "",
      bankcd: "",
      bankdiv: "",
      banknm: "",
      closedt: null,
      contracamt: 0,
      cotracdt: null,
      dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
      enddt: null,
      files: "",
      findrow_key: "",
      intrat: 0,
      limitamt: 0,
      monsaveamt: 0,
      motgdesc: "",
      orgdiv: sessionOrgdiv,
      plandiv: defaultOption.find((item: any) => item.id == "plandiv")
        ?.valueCode,
      remark: "",
      savecnt: 0,
      useyn: defaultOption.find((item: any) => item.id == "useyn")?.valueCode,
    });

    if (isMobile && swiper) {
      swiper.slideTo(1);
    }
  };

  const onAddClick3 = () => {
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage3_1(initialPageState);
    setPage3_2(initialPageState);
    setMainDataResult3_1(process([], mainDataState3_1));
    setMainDataResult3_2(process([], mainDataState3_2));
    setTabSelected2(0);
    setInfomation2({
      workType: "N",
      acntcd: "",
      acntnm: "",
      amtunit: defaultOption.find((item: any) => item.id == "amtunit")
        ?.valueCode,
      attdatnum: "",
      bankacntnum: "",
      brwamt: 0,
      brwamtdlr: 0,
      brwamtown: 0,
      brwdesc: "",
      brwdt: null,
      brwnm: "",
      brwnum: "",
      brwtype: defaultOption.find((item: any) => item.id == "brwtype")
        ?.valueCode,
      chgintrat: 0,
      chgrat: 0,
      custcd: "",
      custnm: "",
      enddt: null,
      endrdmdt: null,
      files: "",
      findrow_key: "",
      intpayamt: 0,
      intpaydt: null,
      intpayown: 0,
      intpayterm: defaultOption.find((item: any) => item.id == "intpayterm")
        ?.valueCode,
      intrat: 0,
      janamt: 0,
      motgdesc: "",
      orgdiv: sessionOrgdiv,
      rdmprd: 0,
      rdmterm: "N",
      redeem: 0,
      remark: "",
      strdmdt: null,
    });
  };

  const onAddClick4 = () => {
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage4_1(initialPageState);
    setMainDataResult4_1(process([], mainDataState4_1));
    setTabSelected2(0);
    setInfomation3({
      workType: "N",
      acntcd: "",
      acntnm: "",
      bankcd: "",
      banknm: "",
      custcd: "",
      custnm: "",
      dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
      enddt: new Date(),
      endorser1: "",
      endorser2: "",
      findrow_key: "",
      notedec: "",
      notediv: defaultOption.find((item: any) => item.id == "notediv")
        ?.valueCode,
      notekind: defaultOption.find((item: any) => item.id == "notekind")
        ?.valueCode,
      noteloca: defaultOption.find((item: any) => item.id == "noteloca")
        ?.valueCode,
      notenum: "",
      notests: defaultOption.find((item: any) => item.id == "notests")
        ?.valueCode,
      orgdiv: sessionOrgdiv,
      pgmdiv: "",
      pubamt: 0,
      pubbank: "",
      pubdt: new Date(),
      pubperson: "",
      remark1: "",
      replace_bankcd: "",
      replace_banknm: "",
      replace_custcd: "",
      replace_custnm: "",
      replacedt: null,
      returndt: null,
    });
  };

  const onAddClick5 = () => {
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage5_1(initialPageState);
    setMainDataResult5_1(process([], mainDataState5_1));
    setTabSelected2(0);
    setInfomation5({
      workType: "N",
      attdatnum: "",
      bankacntnum: "",
      cordiv: defaultOption.find((item: any) => item.id == "cordiv")?.valueCode,
      creditcd: "",
      creditdiv: defaultOption.find((item: any) => item.id == "creditdiv")
        ?.valueCode,
      creditnm: "",
      creditnum: "",
      custcd: "",
      custnm: "",
      exprdt: null,
      files: "",
      findrow_key: "",
      orgdiv: sessionOrgdiv,
      paydt: null,
      person: defaultOption.find((item: any) => item.id == "person")?.valueCode,
      rcvcustcd: "",
      rcvcustnm: "",
      remark: "",
      repreregno: "",
      useyn: defaultOption.find((item: any) => item.id == "useyn")?.valueCode,
    });
  };

  const onMainItemChange2_1 = (event: GridItemChangeEvent) => {
    setMainDataState2_1((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2_1,
      setMainDataResult2_1,
      DATA_ITEM_KEY2_1
    );
  };
  const customCellRender2_1 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2_1}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender2_1 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2_1}
      editField={EDIT_FIELD}
    />
  );

  const onMainItemChange3_1 = (event: GridItemChangeEvent) => {
    setMainDataState3_1((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3_1,
      setMainDataResult3_1,
      DATA_ITEM_KEY3_1
    );
  };
  const customCellRender3_1 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3_1}
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

  const enterEdit2_1 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult2_1.data.map((item) =>
        item[DATA_ITEM_KEY2_1] == dataItem[DATA_ITEM_KEY2_1]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setTempResult2_1((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2_1((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2_1((prev) => {
        return {
          data: mainDataResult2_1.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2_1 = () => {
    if (tempResult2_1.data != mainDataResult2_1.data) {
      const newData = mainDataResult2_1.data.map((item) =>
        item[DATA_ITEM_KEY2_1] ==
        Object.getOwnPropertyNames(selectedState2_1)[0]
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

      setTempResult2_1((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2_1((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult2_1.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2_1((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2_1((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit3_1 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult3_1.data.map((item) =>
        item[DATA_ITEM_KEY3_1] == dataItem[DATA_ITEM_KEY3_1]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setTempResult3_1((prev) => {
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
      setTempResult3_1((prev) => {
        return {
          data: mainDataResult3_1.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit3_1 = () => {
    if (tempResult3_1.data != mainDataResult3_1.data) {
      const newData = mainDataResult3_1.data.map((item) =>
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

      setTempResult3_1((prev) => {
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
      const newData = mainDataResult3_1.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult3_1((prev) => {
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
    }
  };

  const onDeleteClick2_1 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult2_1.data.forEach((item: any, index: number) => {
      if (!selectedState2_1[item[DATA_ITEM_KEY2_1]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows2_1.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult2_1.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2_1.data[Math.min(...Object) - 1];
    }

    setMainDataResult2_1((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState2_1({
        [data != undefined ? data[DATA_ITEM_KEY2_1] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick3_1 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult3_1.data.forEach((item: any, index: number) => {
      if (!selectedState3_1[item[DATA_ITEM_KEY3_1]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows3_1.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult3_1.data[Math.min(...Object2)];
    } else {
      data = mainDataResult3_1.data[Math.min(...Object) - 1];
    }

    setMainDataResult3_1((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState3_1({
        [data != undefined ? data[DATA_ITEM_KEY3_1] : newData[0]]: true,
      });
    }
  };

  const onSaveClick2 = () => {
    if (!permissions.save) return;

    let valid = true;

    if (
      infomation.bankacntdiv == "" ||
      infomation.bankacntdiv == undefined ||
      infomation.bankacntdiv == null ||
      infomation.acntsrtnum == "" ||
      infomation.acntsrtnum == undefined ||
      infomation.acntsrtnum == null ||
      infomation.acntsrtnm == "" ||
      infomation.acntsrtnm == undefined ||
      infomation.acntsrtnm == null ||
      infomation.bankacntnum == "" ||
      infomation.bankacntnum == undefined ||
      infomation.bankacntnum == null ||
      infomation.acntcd == "" ||
      infomation.acntcd == undefined ||
      infomation.acntcd == null
    ) {
      valid = false;
    }

    if (valid != true) {
      alert("필수값을 채워주세요.");
      return;
    }

    const dataItem = mainDataResult2_1.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    let dataArr: any = {
      rowstatus_s: [],
      acntsrtseq_s: [],
      paydt_s: [],
      payamt_s: [],
      intrat_s: [],
      remark_s: [],
    };
    if (dataItem.length == 0 && deletedMainRows2_1.length == 0) {
      setParaData((prev) => ({
        ...prev,
        workType: infomation.workType,
        orgdiv: infomation.orgdiv,
        acntsrtnum: infomation.acntsrtnum,
        acntsrtnm: infomation.acntsrtnm,
        bankacntdiv: infomation.bankacntdiv,
        acntcd: infomation.acntcd,
        bankcd: infomation.bankcd,
        bankacntnum: infomation.bankacntnum,
        cotracdt:
          infomation.cotracdt == null
            ? ""
            : convertDateToStr(infomation.cotracdt),
        amtunit: infomation.amtunit,
        contracamt: infomation.contracamt,
        monsaveamt: infomation.monsaveamt,
        savecnt: infomation.savecnt,
        limitamt: infomation.limitamt,
        intrat: infomation.intrat,
        motgdesc: infomation.motgdesc,
        enddt:
          infomation.enddt == null ? "" : convertDateToStr(infomation.enddt),
        closedt:
          infomation.closedt == null
            ? ""
            : convertDateToStr(infomation.closedt),
        bankdiv: infomation.bankdiv,
        plandiv: infomation.plandiv,
        dptcd: infomation.dptcd,
        remark: infomation.remark,
        useyn: infomation.useyn,
        attdatnum: infomation.attdatnum,
      }));
    } else {
      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          acntsrtseq = "",
          paydt = "",
          payamt = "",
          intrat = "",
          remark = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.acntsrtseq_s.push(acntsrtseq);
        dataArr.paydt_s.push(paydt == "99991231" ? "" : paydt);
        dataArr.payamt_s.push(payamt);
        dataArr.intrat_s.push(intrat);
        dataArr.remark_s.push(remark);
      });
      deletedMainRows2_1.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          acntsrtseq = "",
          paydt = "",
          payamt = "",
          intrat = "",
          remark = "",
        } = item;

        dataArr.rowstatus_s.push("D");
        dataArr.acntsrtseq_s.push(acntsrtseq);
        dataArr.paydt_s.push(paydt == "99991231" ? "" : paydt);
        dataArr.payamt_s.push(payamt);
        dataArr.intrat_s.push(intrat);
        dataArr.remark_s.push(remark);
      });

      setParaData((prev) => ({
        ...prev,
        workType: infomation.workType,
        orgdiv: infomation.orgdiv,
        acntsrtnum: infomation.acntsrtnum,
        acntsrtnm: infomation.acntsrtnm,
        bankacntdiv: infomation.bankacntdiv,
        acntcd: infomation.acntcd,
        bankcd: infomation.bankcd,
        bankacntnum: infomation.bankacntnum,
        cotracdt:
          infomation.cotracdt == null
            ? ""
            : convertDateToStr(infomation.cotracdt),
        amtunit: infomation.amtunit,
        contracamt: infomation.contracamt,
        monsaveamt: infomation.monsaveamt,
        savecnt: infomation.savecnt,
        limitamt: infomation.limitamt,
        intrat: infomation.intrat,
        motgdesc: infomation.motgdesc,
        enddt:
          infomation.enddt == null ? "" : convertDateToStr(infomation.enddt),
        closedt:
          infomation.closedt == null
            ? ""
            : convertDateToStr(infomation.closedt),
        bankdiv: infomation.bankdiv,
        plandiv: infomation.plandiv,
        dptcd: infomation.dptcd,
        remark: infomation.remark,
        useyn: infomation.useyn,
        attdatnum: infomation.attdatnum,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        acntsrtseq_s: dataArr.acntsrtseq_s.join("|"),
        paydt_s: dataArr.paydt_s.join("|"),
        payamt_s: dataArr.payamt_s.join("|"),
        intrat_s: dataArr.intrat_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
      }));
    }
  };

  const onSaveClick3 = () => {
    if (!permissions.save) return;

    let valid = true;

    if (
      infomation2.brwnum == "" ||
      infomation2.brwnum == undefined ||
      infomation2.brwnum == null ||
      infomation2.brwnm == "" ||
      infomation2.brwnm == undefined ||
      infomation2.brwnm == null
    ) {
      valid = false;
    }

    if (valid != true) {
      alert("필수값을 채워주세요.");
      return;
    }

    const dataItem = mainDataResult3_1.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    let dataArr: any = {
      rowstatus_s: [],
      brwseq_s: [],
      paydt_s: [],
      payamt_s: [],
      intamt_s: [],
      remark_s: [],
    };
    if (dataItem.length == 0 && deletedMainRows3_1.length == 0) {
      setParaData2((prev) => ({
        ...prev,
        workType: infomation2.workType,
        orgdiv: infomation2.orgdiv,
        brwnum: infomation2.brwnum,
        brwnm: infomation2.brwnm,
        brwdesc: infomation2.brwdesc,
        custcd: infomation2.custcd,
        brwdt:
          infomation2.brwdt == null ? "" : convertDateToStr(infomation2.brwdt),
        bankacntnum: infomation2.bankacntnum,
        brwtype: infomation2.brwtype,
        acntcd: infomation2.acntcd,
        enddt:
          infomation2.enddt == null ? "" : convertDateToStr(infomation2.enddt),
        brwamt: infomation2.brwamt,
        brwamtdlr: infomation2.brwamtdlr,
        brwamtown: infomation2.brwamtown,
        amtunit: infomation2.amtunit,
        chgrat: infomation2.chgrat,
        rdmprd: infomation2.rdmprd,
        rdmterm: infomation2.rdmterm,
        strdmdt:
          infomation2.strdmdt == null
            ? ""
            : convertDateToStr(infomation2.strdmdt),
        endrdmdt:
          infomation2.endrdmdt == null
            ? ""
            : convertDateToStr(infomation2.endrdmdt),
        intrat: infomation2.intrat,
        chgintrat: infomation2.chgintrat,
        intpayterm: infomation2.intpayterm,
        intpayamt: infomation2.intpayamt,
        intpayown: infomation2.intpayown,
        intpaydt:
          infomation2.intpaydt == null
            ? ""
            : convertDateToStr(infomation2.intpaydt),
        motgdesc: infomation2.motgdesc,
        remark: infomation2.remark,

        attdatnum: infomation2.attdatnum,
      }));
    } else {
      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          brwseq = "",
          paydt = "",
          payamt = "",
          intamt = "",
          remark = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.brwseq_s.push(brwseq);
        dataArr.paydt_s.push(paydt == "99991231" ? "" : paydt);
        dataArr.payamt_s.push(payamt);
        dataArr.intamt_s.push(intamt);
        dataArr.remark_s.push(remark);
      });
      deletedMainRows3_1.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          brwseq = "",
          paydt = "",
          payamt = "",
          intamt = "",
          remark = "",
        } = item;

        dataArr.rowstatus_s.push("D");
        dataArr.brwseq_s.push(brwseq);
        dataArr.paydt_s.push(paydt == "99991231" ? "" : paydt);
        dataArr.payamt_s.push(payamt);
        dataArr.intamt_s.push(intamt);
        dataArr.remark_s.push(remark);
      });
      setParaData2((prev) => ({
        ...prev,
        workType: infomation2.workType,
        orgdiv: infomation2.orgdiv,
        brwnum: infomation2.brwnum,
        brwnm: infomation2.brwnm,
        brwdesc: infomation2.brwdesc,
        custcd: infomation2.custcd,
        brwdt:
          infomation2.brwdt == null ? "" : convertDateToStr(infomation2.brwdt),
        bankacntnum: infomation2.bankacntnum,
        brwtype: infomation2.brwtype,
        acntcd: infomation2.acntcd,
        enddt:
          infomation2.enddt == null ? "" : convertDateToStr(infomation2.enddt),
        brwamt: infomation2.brwamt,
        brwamtdlr: infomation2.brwamtdlr,
        brwamtown: infomation2.brwamtown,
        amtunit: infomation2.amtunit,
        chgrat: infomation2.chgrat,
        rdmprd: infomation2.rdmprd,
        rdmterm: infomation2.rdmterm,
        strdmdt:
          infomation2.strdmdt == null
            ? ""
            : convertDateToStr(infomation2.strdmdt),
        endrdmdt:
          infomation2.endrdmdt == null
            ? ""
            : convertDateToStr(infomation2.endrdmdt),
        intrat: infomation2.intrat,
        chgintrat: infomation2.chgintrat,
        intpayterm: infomation2.intpayterm,
        intpayamt: infomation2.intpayamt,
        intpayown: infomation2.intpayown,
        intpaydt:
          infomation2.intpaydt == null
            ? ""
            : convertDateToStr(infomation2.intpaydt),
        motgdesc: infomation2.motgdesc,
        remark: infomation2.remark,

        attdatnum: infomation2.attdatnum,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        brwseq_s: dataArr.brwseq_s.join("|"),
        paydt_s: dataArr.paydt_s.join("|"),
        payamt_s: dataArr.payamt_s.join("|"),
        intamt_s: dataArr.intamt_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
      }));
    }
  };

  const onSaveClick4 = () => {
    if (!permissions.save) return;

    let valid = true;

    if (
      infomation3.notediv == "" ||
      infomation3.notediv == undefined ||
      infomation3.notediv == null ||
      infomation3.notenum == "" ||
      infomation3.notenum == undefined ||
      infomation3.notenum == null ||
      convertDateToStr(infomation3.pubdt).substring(0, 4) < "1997" ||
      convertDateToStr(infomation3.pubdt).substring(6, 8) > "31" ||
      convertDateToStr(infomation3.pubdt).substring(6, 8) < "01" ||
      convertDateToStr(infomation3.pubdt).substring(6, 8).length != 2 ||
      convertDateToStr(infomation3.enddt).substring(0, 4) < "1997" ||
      convertDateToStr(infomation3.enddt).substring(6, 8) > "31" ||
      convertDateToStr(infomation3.enddt).substring(6, 8) < "01" ||
      convertDateToStr(infomation3.enddt).substring(6, 8).length != 2
    ) {
      valid = false;
    }

    if (valid != true) {
      alert("필수값을 채워주세요.");
      return;
    }

    setParaData3((prev) => ({
      ...prev,
      workType: infomation3.workType,
      orgdiv: infomation3.orgdiv,
      notenum: infomation3.notenum,
      notedec: infomation3.notedec,
      notediv: infomation3.notediv,
      notekind: infomation3.notekind,
      notests: infomation3.notests,
      noteloca: infomation3.noteloca,
      enddt:
        infomation3.enddt == null ? "" : convertDateToStr(infomation3.enddt),
      custcd: infomation3.custcd,
      bankcd: infomation3.bankcd,
      pubdt:
        infomation3.pubdt == null ? "" : convertDateToStr(infomation3.pubdt),
      pubbank: infomation3.pubbank,
      pubperson: infomation3.pubperson,
      pubamt: infomation3.pubamt,
      acntcd: infomation3.acntcd,
      replacedt:
        infomation3.replacedt == null
          ? ""
          : convertDateToStr(infomation3.replacedt),
      replace_custcd: infomation3.replace_custcd,
      replace_bankcd: infomation3.replace_bankcd,
      endorser1: infomation3.endorser1,
      endorser2: infomation3.endorser2,
      returndt:
        infomation3.returndt == null
          ? ""
          : convertDateToStr(infomation3.returndt),
      dptcd: infomation3.dptcd,
      remark1: infomation3.remark1,
      pgmdiv: infomation3.pgmdiv,
    }));
  };

  const onSaveClick5 = () => {
    if (!permissions.save) return;

    let valid = true;

    if (
      infomation5.creditcd == "" ||
      infomation5.creditcd == undefined ||
      infomation5.creditcd == null
    ) {
      valid = false;
    }

    if (valid != true) {
      alert("필수값을 채워주세요.");
      return;
    }

    setParaData5((prev) => ({
      ...prev,
      workType: infomation5.workType,
      orgdiv: infomation5.orgdiv,
      creditcd: infomation5.creditcd,
      creditnum: infomation5.creditnum,
      creditnm: infomation5.creditnm,
      creditdiv: infomation5.creditdiv,
      cordiv: infomation5.cordiv,
      repreregno: infomation5.repreregno,
      person: infomation5.person,
      exprdt:
        infomation5.exprdt == null ? "" : convertDateToStr(infomation5.exprdt),
      custcd: infomation5.custcd,
      bankacntnum: infomation5.bankacntnum,
      paydt:
        infomation5.paydt == null ? "" : convertDateToStr(infomation5.paydt),
      useyn: infomation5.useyn,
      remark: infomation5.remark,
      rcvcustcd: infomation5.rcvcustcd,
      attdatnum: infomation5.attdatnum,
    }));
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "",
    acntsrtnum: "",
    acntsrtnm: "",
    bankacntdiv: "",
    acntcd: "",
    bankcd: "",
    bankacntnum: "",
    cotracdt: "",
    amtunit: "",
    contracamt: 0,
    monsaveamt: 0,
    savecnt: 0,
    limitamt: 0,
    intrat: 0,
    motgdesc: "",
    enddt: "",
    closedt: "",
    bankdiv: "",
    plandiv: "",
    dptcd: "",
    remark: "",
    useyn: "",
    attdatnum: "",
    rowstatus_s: "",
    acntsrtseq_s: "",
    paydt_s: "",
    payamt_s: "",
    intrat_s: "",
    remark_s: "",
    bankacntdiv_s: "",
    acntsrtnum_s: "",
    acntsrtnm_s: "",
    bankacntnum_s: "",
    acntcd_s: "",
    cotracdt_s: "",
    contracamt_s: "",
    intrat_s1: "",
  });

  const [paraData2, setParaData2] = useState({
    workType: "",
    orgdiv: "",
    brwnum: "",
    brwnm: "",
    brwdesc: "",
    custcd: "",
    brwdt: "",
    bankacntnum: "",
    brwtype: "",
    acntcd: "",
    enddt: "",
    brwamt: 0,
    brwamtdlr: 0,
    brwamtown: 0,
    amtunit: "",
    chgrat: 0,
    rdmprd: 0,
    rdmterm: "",
    strdmdt: "",
    endrdmdt: "",
    intrat: 0,
    chgintrat: 0,
    intpayterm: "",
    intpayamt: 0,
    intpayown: 0,
    intpaydt: "",
    motgdesc: "",
    remark: "",

    attdatnum: "",
    rowstatus_s: "",
    brwseq_s: "",
    paydt_s: "",
    payamt_s: "",
    intamt_s: "",
    remark_s: "",
  });

  const [paraData3, setParaData3] = useState({
    workType: "",
    orgdiv: "",
    notenum: "",
    notedec: "",
    notediv: "",
    notekind: "",
    notests: "",
    noteloca: "",
    enddt: "",
    custcd: "",
    bankcd: "",
    pubdt: "",
    pubbank: "",
    pubperson: "",
    pubamt: 0,
    acntcd: "",
    replacedt: "",
    replace_custcd: "",
    replace_bankcd: "",
    endorser1: "",
    endorser2: "",
    returndt: "",
    dptcd: "",
    remark1: "",
    pgmdiv: "",
  });

  const [paraData5, setParaData5] = useState({
    workType: "",
    orgdiv: "",
    creditcd: "",
    creditnum: "",
    creditnm: "",
    creditdiv: "",
    cordiv: "",
    repreregno: "",
    person: "",
    exprdt: "",
    custcd: "",
    bankacntnum: "",
    paydt: "",
    useyn: "",
    remark: "",
    rcvcustcd: "",
    attdatnum: "",
  });

  const para: Iparameters = {
    procedureName: "P_AC_A0050W_tab2_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,

      /* 예적금 기본 (AC040T) */
      "@p_orgdiv": paraData.orgdiv,
      "@p_acntsrtnum": paraData.acntsrtnum,
      "@p_acntsrtnm": paraData.acntsrtnm,
      "@p_bankacntdiv": paraData.bankacntdiv,
      "@p_acntcd": paraData.acntcd,
      "@p_bankcd": paraData.bankcd,
      "@p_bankacntnum": paraData.bankacntnum,
      "@p_cotracdt": paraData.cotracdt,
      "@p_amtunit": paraData.amtunit,
      "@p_contracamt": paraData.contracamt,
      "@p_monsaveamt": paraData.monsaveamt,
      "@p_savecnt": paraData.savecnt,
      "@p_limitamt": paraData.limitamt,
      "@p_intrat": paraData.intrat,
      "@p_motgdesc": paraData.motgdesc,
      "@p_enddt": paraData.enddt,
      "@p_closedt": paraData.closedt,
      "@p_bankdiv": paraData.bankdiv,
      "@p_plandiv": paraData.plandiv,
      "@p_dptcd": paraData.dptcd,
      "@p_remark": paraData.remark,
      "@p_useyn": paraData.useyn,

      /* 예적금 상세 (AC041T) */
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_acntsrtseq_s": paraData.acntsrtseq_s,
      "@p_paydt_s": paraData.paydt_s,
      "@p_payamt_s": paraData.payamt_s,
      "@p_intrat_s": paraData.intrat_s,
      "@p_remark_s": paraData.remark_s,

      "@p_exec_userid": userId,
      "@p_exec_pc": pc,

      /* 엑셀 */
      "@p_bankacntdiv_s": paraData.bankacntdiv_s,
      "@p_acntsrtnum_s": paraData.acntsrtnum_s,
      "@p_acntsrtnm_s": paraData.acntsrtnm_s,
      "@p_bankacntnum_s": paraData.bankacntnum_s,
      "@p_acntcd_s": paraData.acntcd_s,
      "@p_cotracdt_s": paraData.cotracdt_s,
      "@p_contracamt_s": paraData.contracamt_s,
      "@p_intrat_s1": paraData.intrat_s1,

      "@p_form_id": "AC_A0050W",
      "@p_attdatnum": paraData.attdatnum,
    },
  };

  const para2: Iparameters = {
    procedureName: "P_AC_A0050W_tab3_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData2.workType,

      "@p_orgdiv": paraData2.orgdiv,
      "@p_brwnum": paraData2.brwnum,
      "@p_brwnm": paraData2.brwnm,
      "@p_brwdesc": paraData2.brwdesc,
      "@p_custcd": paraData2.custcd,
      "@p_brwdt": paraData2.brwdt,
      "@p_bankacntnum": paraData2.bankacntnum,
      "@p_brwtype": paraData2.brwtype,
      "@p_acntcd": paraData2.acntcd,
      "@p_enddt": paraData2.enddt,
      "@p_brwamt": paraData2.brwamt,
      "@p_brwamtdlr": paraData2.brwamtdlr,
      "@p_brwamtown": paraData2.brwamtown,
      "@p_amtunit": paraData2.amtunit,
      "@p_chgrat": paraData2.chgrat,
      "@p_rdmprd": paraData2.rdmprd,
      "@p_rdmterm": paraData2.rdmterm,
      "@p_strdmdt": paraData2.strdmdt,
      "@p_endrdmdt": paraData2.endrdmdt,
      "@p_intrat": paraData2.intrat,
      "@p_chgintrat": paraData2.chgintrat,
      "@p_intpayterm": paraData2.intpayterm,
      "@p_intpayamt": paraData2.intpayamt,
      "@p_intpayown": paraData2.intpayown,
      "@p_intpaydt": paraData2.intpaydt,
      "@p_motgdesc": paraData2.motgdesc,
      "@p_remark": paraData2.remark,

      "@p_attdatnum": paraData2.attdatnum,

      /* 차입금 상세 (AC051T) */
      "@p_rowstatus_s": paraData2.rowstatus_s,
      "@p_brwseq_s": paraData2.brwseq_s,
      "@p_paydt_s": paraData2.paydt_s,
      "@p_payamt_s": paraData2.payamt_s,
      "@p_intamt_s": paraData2.intamt_s,
      "@p_remark_s": paraData2.remark_s,

      "@p_exec_userid": userId,
      "@p_exec_pc": pc,
      "@p_form_id": "AC_A0050W",
    },
  };

  const para4: Iparameters = {
    procedureName: "P_AC_A0050W_tab4_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData3.workType,

      "@p_orgdiv": paraData3.orgdiv,
      "@p_notenum": paraData3.notenum,
      "@p_notedec": paraData3.notedec,
      "@p_notediv": paraData3.notediv,
      "@p_notekind": paraData3.notekind,
      "@p_notests": paraData3.notests,
      "@p_noteloca": paraData3.noteloca,
      "@p_enddt": paraData3.enddt,
      "@p_custcd": paraData3.custcd,
      "@p_bankcd": paraData3.bankcd,
      "@p_pubdt": paraData3.pubdt,
      "@p_pubbank": paraData3.pubbank,
      "@p_pubperson": paraData3.pubperson,
      "@p_pubamt": paraData3.pubamt,
      "@p_acntcd": paraData3.acntcd,
      "@p_replacedt": paraData3.replacedt,
      "@p_replace_custcd": paraData3.replace_custcd,
      "@p_replace_bankcd": paraData3.replace_bankcd,
      "@p_endorser1": paraData3.endorser1,
      "@p_endorser2": paraData3.endorser2,
      "@p_returndt": paraData3.returndt,
      "@p_dptcd": paraData3.dptcd,
      "@p_remark1": paraData3.remark1,
      "@p_pgmdiv": paraData3.pgmdiv,

      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0050W",
    },
  };

  const para5: Iparameters = {
    procedureName: "P_AC_A0050W_tab5_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData5.workType,

      "@p_orgdiv": paraData5.orgdiv,
      "@p_creditcd": paraData5.creditcd,
      "@p_creditnum": paraData5.creditnum,
      "@p_creditnm": paraData5.creditnm,
      "@p_creditdiv": paraData5.creditdiv,
      "@p_cordiv": paraData5.cordiv,
      "@p_repreregno": paraData5.repreregno,
      "@p_person": paraData5.person,
      "@p_exprdt": paraData5.exprdt,
      "@p_custcd": paraData5.custcd,
      "@p_bankacntnum": paraData5.bankacntnum,
      "@p_paydt": paraData5.paydt,
      "@p_useyn": paraData5.useyn,
      "@p_remark": paraData5.remark,
      "@p_rcvcustcd": paraData5.rcvcustcd,
      "@p_attdatnum": paraData5.attdatnum,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0050W",
    },
  };

  useEffect(() => {
    if (
      paraData.workType != "" &&
      permissions.save &&
      paraData.workType != "D"
    ) {
      fetchTodoGridSaved();
    }
    if (paraData.workType == "D" && permissions.delete) {
      fetchTodoGridSaved();
    }
  }, [paraData, permissions]);

  useEffect(() => {
    if (
      paraData2.workType != "" &&
      permissions.save &&
      paraData2.workType != "D"
    ) {
      fetchTodoGridSaved2();
    }
    if (paraData2.workType == "D" && permissions.delete) {
      fetchTodoGridSaved2();
    }
  }, [paraData2, permissions]);

  useEffect(() => {
    if (
      paraData3.workType != "" &&
      permissions.save &&
      paraData3.workType != "D"
    ) {
      fetchTodoGridSaved3();
    }
    if (paraData3.workType == "D" && permissions.delete) {
      fetchTodoGridSaved3();
    }
  }, [paraData3, permissions]);

  useEffect(() => {
    if (
      paraData5.workType != "" &&
      permissions.save &&
      paraData5.workType != "D"
    ) {
      fetchTodoGridSaved5();
    }
    if (paraData5.workType == "D" && permissions.delete) {
      fetchTodoGridSaved5();
    }
  }, [paraData5, permissions]);

  const fetchTodoGridSaved = async () => {
    if (!permissions.save && paraData.workType != "D") return;
    if (!permissions.delete && paraData.workType == "D") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (paraData.workType != "D") {
        setFilters2((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          isSearch: true,
        }));
        setUnsavedAttadatnums([]);
        setUnsavedName([]);
      } else {
        const isLastDataDeleted =
          mainDataResult2.data.length == 1 && filters2.pgNum > 1;
        const findRowIndex = mainDataResult2.data.findIndex(
          (row: any) =>
            row[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
        );
        setDeletedAttadatnums([infomation.attdatnum]);
        resetAllGrid();

        if (isLastDataDeleted) {
          setPage2({
            skip: PAGE_SIZE * (filters.pgNum - 2),
            take: PAGE_SIZE,
          });
        }
        setFilters2((prev) => ({
          ...prev,
          find_row_value:
            mainDataResult2.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
            undefined
              ? ""
              : mainDataResult2.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                  .acntsrtnum,
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      }
      if (paraData.workType == "EXCEL") {
        alert("처리되었습니다.");
      }
      deletedMainRows2_1 = [];
      setParaData({
        workType: "",
        orgdiv: "",
        acntsrtnum: "",
        acntsrtnm: "",
        bankacntdiv: "",
        acntcd: "",
        bankcd: "",
        bankacntnum: "",
        cotracdt: "",
        amtunit: "",
        contracamt: 0,
        monsaveamt: 0,
        savecnt: 0,
        limitamt: 0,
        intrat: 0,
        motgdesc: "",
        enddt: "",
        closedt: "",
        bankdiv: "",
        plandiv: "",
        dptcd: "",
        remark: "",
        useyn: "",
        attdatnum: "",
        rowstatus_s: "",
        acntsrtseq_s: "",
        paydt_s: "",
        payamt_s: "",
        intrat_s: "",
        remark_s: "",
        bankacntdiv_s: "",
        acntsrtnum_s: "",
        acntsrtnm_s: "",
        bankacntnum_s: "",
        acntcd_s: "",
        cotracdt_s: "",
        contracamt_s: "",
        intrat_s1: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved2 = async () => {
    if (!permissions.save && paraData2.workType != "D") return;
    if (!permissions.delete && paraData2.workType == "D") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (paraData2.workType != "D") {
        setFilters3((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          isSearch: true,
        }));
        setUnsavedAttadatnums([]);
        setUnsavedName([]);
      } else {
        const isLastDataDeleted =
          mainDataResult3.data.length == 1 && filters3.pgNum > 1;
        const findRowIndex = mainDataResult3.data.findIndex(
          (row: any) =>
            row[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
        );
        setDeletedAttadatnums([infomation2.attdatnum]);
        resetAllGrid();

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
                  .brwnum,
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      }
      deletedMainRows3_1 = [];
      setParaData2({
        workType: "",
        orgdiv: "",
        brwnum: "",
        brwnm: "",
        brwdesc: "",
        custcd: "",
        brwdt: "",
        bankacntnum: "",
        brwtype: "",
        acntcd: "",
        enddt: "",
        brwamt: 0,
        brwamtdlr: 0,
        brwamtown: 0,
        amtunit: "",
        chgrat: 0,
        rdmprd: 0,
        rdmterm: "",
        strdmdt: "",
        endrdmdt: "",
        intrat: 0,
        chgintrat: 0,
        intpayterm: "",
        intpayamt: 0,
        intpayown: 0,
        intpaydt: "",
        motgdesc: "",
        remark: "",

        attdatnum: "",
        rowstatus_s: "",
        brwseq_s: "",
        paydt_s: "",
        payamt_s: "",
        intamt_s: "",
        remark_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved3 = async () => {
    if (!permissions.save && paraData3.workType != "D") return;
    if (!permissions.delete && paraData3.workType == "D") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para4);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (paraData3.workType != "D") {
        setFilters4((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          isSearch: true,
        }));
        setUnsavedAttadatnums([]);
        setUnsavedName([]);
      } else {
        const isLastDataDeleted =
          mainDataResult4.data.length == 1 && filters4.pgNum > 1;
        const findRowIndex = mainDataResult4.data.findIndex(
          (row: any) =>
            row[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState4)[0]
        );
        setDeletedAttadatnums([infomation3.attdatnum]);
        resetAllGrid();

        if (isLastDataDeleted) {
          setPage4({
            skip: PAGE_SIZE * (filters.pgNum - 2),
            take: PAGE_SIZE,
          });
        }
        setFilters4((prev) => ({
          ...prev,
          find_row_value:
            mainDataResult4.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
            undefined
              ? ""
              : mainDataResult4.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                  .notenum,
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      }
      setParaData3({
        workType: "",
        orgdiv: "",
        notenum: "",
        notedec: "",
        notediv: "",
        notekind: "",
        notests: "",
        noteloca: "",
        enddt: "",
        custcd: "",
        bankcd: "",
        pubdt: "",
        pubbank: "",
        pubperson: "",
        pubamt: 0,
        acntcd: "",
        replacedt: "",
        replace_custcd: "",
        replace_bankcd: "",
        endorser1: "",
        endorser2: "",
        returndt: "",
        dptcd: "",
        remark1: "",
        pgmdiv: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved5 = async () => {
    if (!permissions.save && paraData5.workType != "D") return;
    if (!permissions.delete && paraData5.workType == "D") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para5);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (paraData5.workType != "D") {
        setFilters5((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          isSearch: true,
        }));
        setUnsavedAttadatnums([]);
        setUnsavedName([]);
      } else {
        const isLastDataDeleted =
          mainDataResult5.data.length == 1 && filters5.pgNum > 1;
        const findRowIndex = mainDataResult5.data.findIndex(
          (row: any) =>
            row[DATA_ITEM_KEY5] == Object.getOwnPropertyNames(selectedState5)[0]
        );
        setDeletedAttadatnums([infomation5.attdatnum]);
        resetAllGrid();

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
                  .creditcd,
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      }
      setParaData5({
        workType: "",
        orgdiv: "",
        creditcd: "",
        creditnum: "",
        creditnm: "",
        creditdiv: "",
        cordiv: "",
        repreregno: "",
        person: "",
        exprdt: "",
        custcd: "",
        bankacntnum: "",
        paydt: "",
        useyn: "",
        remark: "",
        rcvcustcd: "",
        attdatnum: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick2 = () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult2.data.length != 0) {
      const data = mainDataResult2.data.filter(
        (item) =>
          item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
      )[0];
      setParaData((prev) => ({
        ...prev,
        workType: "D",
        orgdiv: data.orgdiv,
        acntsrtnum: data.acntsrtnum,
        attdatnum: data.attdatnum,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onDeleteClick3 = () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult3.data.length != 0) {
      const data = mainDataResult3.data.filter(
        (item) =>
          item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
      )[0];
      setParaData2((prev) => ({
        ...prev,
        workType: "D",
        orgdiv: data.orgdiv,
        brwnum: data.brwnum,
        attdatnum: data.attdatnum,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onDeleteClick4 = () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult4.data.length != 0) {
      const data = mainDataResult4.data.filter(
        (item) =>
          item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState4)[0]
      )[0];
      setParaData3((prev) => ({
        ...prev,
        workType: "D",
        orgdiv: data.orgdiv,
        notenum: data.notenum,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onDeleteClick5 = () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult5.data.length != 0) {
      const data = mainDataResult5.data.filter(
        (item) =>
          item[DATA_ITEM_KEY5] == Object.getOwnPropertyNames(selectedState5)[0]
      )[0];
      setParaData5((prev) => ({
        ...prev,
        workType: "D",
        orgdiv: data.orgdiv,
        creditcd: data.creditcd,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onAddClick2_1 = () => {
    mainDataResult2_1.data.map((item) => {
      if (item.num > temp2_1) {
        temp2_1 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY2_1]: ++temp2_1,
      acntsrtnum: infomation.acntsrtnum,
      acntsrtseq: infomation.acntsrtseq,
      intrat: 0,
      orgdiv: sessionOrgdiv,
      payamt: 0,
      paydt: convertDateToStr(new Date()),
      remark: "",
      rowstatus: "N",
    };

    setSelectedState2_1({ [newDataItem[DATA_ITEM_KEY2_1]]: true });
    setMainDataResult2_1((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage2_1((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
  };

  const onAddClick3_1 = () => {
    mainDataResult3_1.data.map((item) => {
      if (item.num > temp3_1) {
        temp3_1 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY3_1]: ++temp3_1,
      brwnum: infomation2.brwnum,
      brwseq: infomation2.brwseq,
      intamt: 0,
      orgdiv: sessionOrgdiv,
      payamt: 0,
      paydt: convertDateToStr(new Date()),
      remark: "",
      rowstatus: "N",
    };

    setSelectedState3_1({ [newDataItem[DATA_ITEM_KEY3_1]]: true });
    setMainDataResult3_1((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage3_1((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
  };

  const saveExcel = (jsonArr: any[]) => {
    if (jsonArr.length == 0) {
      alert("데이터가 없습니다.");
      return;
    }
    const columns: string[] = [
      "결제계좌번호",
      "계약금액",
      "계약일자",
      "계정과목",
      "예금코드",
      "예적금구분",
      "예적금명",
      "이율",
    ];

    let valid = true;
    let valid2 = true;
    jsonArr.map((items: any) => {
      Object.keys(items).map((item: any) => {
        if (!columns.includes(item) && valid == true) {
          valid = false;
          return;
        }
        if (
          items["예적금구분"] == null ||
          items["예적금구분"] == undefined ||
          items["예적금구분"] == ""
        ) {
          valid2 = false;
          return;
        }
        if (
          items["예금코드"] == null ||
          items["예금코드"] == undefined ||
          items["예금코드"] == ""
        ) {
          valid2 = false;
          return;
        }
        if (
          items["예적금명"] == null ||
          items["예적금명"] == undefined ||
          items["예적금명"] == ""
        ) {
          valid2 = false;
          return;
        }
        if (
          items["결제계좌번호"] == null ||
          items["결제계좌번호"] == undefined ||
          items["결제계좌번호"] == ""
        ) {
          valid2 = false;
          return;
        }
        if (
          items["계정과목"] == null ||
          items["계정과목"] == undefined ||
          items["계정과목"] == ""
        ) {
          valid2 = false;
          return;
        }
      });
    });

    if (valid != true) {
      alert("양식이 맞지 않습니다.");
      return;
    }
    if (valid2 != true) {
      alert("필수값을 채워주세요.");
      return;
    }
    setLoading(true);
    let detailArr: any = {
      bankacntdiv_s: [],
      acntsrtnum_s: [],
      acntsrtnm_s: [],
      bankacntnum_s: [],
      acntcd_s: [],
      cotracdt_s: [],
      contracamt_s: [],
      intrat_s1: [],
    };

    jsonArr.forEach(async (item: any) => {
      const {
        결제계좌번호 = "",
        계약금액 = "",
        계약일자 = "",
        계정과목 = "",
        예금코드 = "",
        예적금구분 = "",
        예적금명 = "",
        이율 = "",
      } = item;

      detailArr.bankacntdiv_s.push(
        bankacntdivListData.find((item: any) => item.code_name == 예적금구분)
          ?.sub_code == undefined
          ? 예적금구분
          : bankacntdivListData.find(
              (item: any) => item.code_name == 예적금구분
            )?.sub_code
      );
      detailArr.acntsrtnum_s.push(예금코드 == undefined ? "" : 예금코드);
      detailArr.acntsrtnm_s.push(예적금명 == undefined ? "" : 예적금명);
      detailArr.bankacntnum_s.push(
        결제계좌번호 == undefined ? "" : 결제계좌번호
      );
      detailArr.acntcd_s.push(계정과목 == undefined ? "" : 계정과목);
      detailArr.cotracdt_s.push(계약일자 == undefined ? "" : 계약일자);
      detailArr.contracamt_s.push(계약금액 == "" ? "0" : 계약금액);
      detailArr.intrat_s1.push(이율 == "" ? "0" : 이율);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "EXCEL",
      orgdiv: sessionOrgdiv,
      bankacntdiv_s: detailArr.bankacntdiv_s.join("|"),
      acntsrtnum_s: detailArr.acntsrtnum_s.join("|"),
      acntsrtnm_s: detailArr.acntsrtnm_s.join("|"),
      bankacntnum_s: detailArr.bankacntnum_s.join("|"),
      acntcd_s: detailArr.acntcd_s.join("|"),
      cotracdt_s: detailArr.cotracdt_s.join("|"),
      contracamt_s: detailArr.contracamt_s.join("|"),
      intrat_s1: detailArr.intrat_s1.join("|"),
    }));
    setLoading(false);
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
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab
          title="스케줄러"
          disabled={permissions.view ? false : true}
        >
          {osstate == true ? (
            <div
              style={{
                backgroundColor: "#ccc",
                height: isMobile ? mobileheight : webheight,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              현재 OS에서는 지원이 불가능합니다.
            </div>
          ) : (
            <Scheduler
              height={isMobile ? mobileheight : webheight}
              data={mainDataResult}
              defaultDate={displayDate}
              editable={{
                add: false,
                remove: false,
                select: true,
                resize: false,
                drag: false,
                edit: true,
              }}
              form={FormWithCustomEditor2}
            >
              <MonthView />
            </Scheduler>
          )}
        </TabStripTab>
        <TabStripTab
          title="예적금관리"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>예금코드</th>
                  <td>
                    <Input
                      name="acntsrtnum"
                      type="text"
                      value={filters2.acntsrtnum}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>예적금명</th>
                  <td>
                    <Input
                      name="acntsrtnm"
                      type="text"
                      value={filters2.acntsrtnm}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>예적금구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="bankacntdiv"
                        value={filters2.bankacntdiv}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>계좌번호</th>
                  <td>
                    <Input
                      name="bankacntnum"
                      type="text"
                      value={filters2.bankacntnum}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>관리부서</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="dptcd"
                        value={filters2.dptcd}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="dptnm"
                        valueField="dptcd"
                      />
                    )}
                  </td>
                  <th>계정과목코드</th>
                  <td>
                    <Input
                      name="acntcd"
                      type="text"
                      value={filters2.acntcd}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onAccountWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>사용유무</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="useyn2"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>비고</th>
                  <td>
                    <Input
                      name="remark"
                      type="text"
                      value={filters2.remark}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          {isMobile ? (
            <>
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <SwiperSlide key={0}>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer">
                      <GridTitle>
                        요약정보{" "}
                        <ExcelUploadButton
                          saveExcel={saveExcel}
                          permissions={{
                            view: true,
                            save: true,
                            delete: true,
                            print: true,
                          }}
                          style={{ marginLeft: "5px", marginRight: "5px" }}
                          disabled={permissions.save ? false : true}
                        />
                        <Button
                          title="Export Excel"
                          onClick={onExcelAttachmentsWndClick}
                          icon="file"
                          fillMode="outline"
                          themeColor={"primary"}
                          disabled={permissions.view ? false : true}
                        >
                          엑셀양식
                        </Button>
                      </GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick2}
                          themeColor={"primary"}
                          icon="file-add"
                          disabled={permissions.save ? false : true}
                        >
                          생성
                        </Button>
                        <Button
                          onClick={onDeleteClick2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="delete"
                          disabled={permissions.delete ? false : true}
                        >
                          삭제
                        </Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult2.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: mobileheight2 }}
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
                      >
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
                                    id={item.id}
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
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell2
                                        : numberField2.includes(item.fieldName)
                                        ? gridSumQtyFooterCell2
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
                  <GridContainer>
                    <ButtonContainer
                      className="ButtonContainer"
                      style={{ justifyContent: "space-between" }}
                    >
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                        icon="arrow-left"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        이전
                      </Button>
                      <div>
                        <Button
                          onClick={onSaveClick2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          disabled={permissions.save ? false : true}
                        >
                          저장
                        </Button>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(2);
                            }
                          }}
                          disabled={infomation.workType != "N" ? false : true}
                          icon="arrow-right"
                          themeColor={"primary"}
                          fillMode={"outline"}
                        >
                          다음
                        </Button>
                      </div>
                    </ButtonContainer>
                    <FormBoxWrap
                      border={true}
                      style={{ height: mobileheight2_1 }}
                    >
                      <FormBox>
                        <tbody>
                          <tr>
                            <th>예적금구분</th>
                            <td>
                              {infomation.workType == "N" ? (
                                customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="bankacntdiv"
                                    value={infomation.bankacntdiv}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                    type="new"
                                    className="required"
                                  />
                                )
                              ) : (
                                <Input
                                  name="bankacntdiv"
                                  type="text"
                                  value={
                                    bankacntdivListData.find(
                                      (item: any) =>
                                        item.sub_code == infomation.bankacntdiv
                                    )?.code_name
                                  }
                                  className="readonly"
                                />
                              )}
                            </td>
                            <th>예금코드</th>
                            <td>
                              {infomation.workType == "N" ? (
                                <Input
                                  name="acntsrtnum"
                                  type="text"
                                  value={infomation.acntsrtnum}
                                  onChange={InputChange}
                                  className="required"
                                />
                              ) : (
                                <Input
                                  name="acntsrtnum"
                                  type="text"
                                  value={infomation.acntsrtnum}
                                  className="readonly"
                                />
                              )}
                            </td>
                            <th>관리부서</th>
                            <td>
                              {infomation.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="dptcd"
                                      value={infomation.dptcd}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange}
                                      type="new"
                                      textField="dptnm"
                                      valueField="dptcd"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="dptcd"
                                      value={infomation.dptcd}
                                      bizComponentId="L_dptcd_001"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                      textField="dptnm"
                                      valueField="dptcd"
                                    />
                                  )}
                            </td>
                            <th>차월한도액</th>
                            <td>
                              <NumericTextBox
                                name="limitamt"
                                value={infomation.limitamt}
                                onChange={InputChange}
                                format="n2"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>예적금명</th>
                            <td colSpan={3}>
                              <Input
                                name="acntsrtnm"
                                type="text"
                                value={infomation.acntsrtnm}
                                onChange={InputChange}
                                className="required"
                              />
                            </td>
                            <th>계약일자</th>
                            <td>
                              <DatePicker
                                name="cotracdt"
                                value={infomation.cotracdt}
                                format="yyyy-MM-dd"
                                onChange={InputChange}
                                placeholder=""
                              />
                            </td>
                            <th>불입횟수</th>
                            <td>
                              <NumericTextBox
                                name="savecnt"
                                value={infomation.savecnt}
                                onChange={InputChange}
                                format="n0"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>결제계좌번호</th>
                            <td colSpan={3}>
                              <Input
                                name="bankacntnum"
                                type="text"
                                value={infomation.bankacntnum}
                                onChange={InputChange}
                                className="required"
                              />
                            </td>
                            <th>계약금액</th>
                            <td>
                              <NumericTextBox
                                name="contracamt"
                                value={infomation.contracamt}
                                onChange={InputChange}
                                format="n2"
                              />
                            </td>
                            <th>월불입액</th>
                            <td>
                              <NumericTextBox
                                name="monsaveamt"
                                value={infomation.monsaveamt}
                                onChange={InputChange}
                                format="n2"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>계정과목</th>
                            <td>
                              <Input
                                name="acntcd"
                                type="text"
                                value={infomation.acntcd}
                                onChange={InputChange}
                              />
                              <ButtonInInput>
                                <Button
                                  onClick={onAccountWndClick2}
                                  icon="more-horizontal"
                                  fillMode="flat"
                                />
                              </ButtonInInput>
                            </td>
                            <th>계정과목명</th>
                            <td>
                              <Input
                                name="acntnm"
                                type="text"
                                value={infomation.acntnm}
                                onChange={InputChange}
                              />
                            </td>
                            <th>이율</th>
                            <td>
                              <NumericTextBox
                                name="intrat"
                                value={infomation.intrat}
                                onChange={InputChange}
                                format="n4"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>은행코드</th>
                            <td>
                              <Input
                                name="bankcd"
                                type="text"
                                value={infomation.bankcd}
                                onChange={InputChange}
                              />
                              <ButtonInInput>
                                <Button
                                  onClick={onCustWndClick}
                                  icon="more-horizontal"
                                  fillMode="flat"
                                />
                              </ButtonInInput>
                            </td>
                            <th>은행코드명</th>
                            <td>
                              <Input
                                name="banknm"
                                type="text"
                                value={infomation.banknm}
                                onChange={InputChange}
                              />
                            </td>
                            <th>화폐단위</th>
                            <td>
                              {infomation.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="amtunit"
                                      value={infomation.amtunit}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange}
                                      type="new"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="amtunit"
                                      value={infomation.amtunit}
                                      bizComponentId="L_BA020"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                            </td>
                          </tr>
                          <tr>
                            <th>적금구분</th>
                            <td>
                              {infomation.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="plandiv"
                                      value={infomation.plandiv}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange}
                                      type="new"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="plandiv"
                                      value={infomation.plandiv}
                                      bizComponentId="L_AC046"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                            </td>
                            <th>만기일자</th>
                            <td>
                              <DatePicker
                                name="enddt"
                                value={infomation.enddt}
                                format="yyyy-MM-dd"
                                onChange={InputChange}
                                placeholder=""
                              />
                            </td>
                            <th>해약일자</th>
                            <td>
                              <DatePicker
                                name="closedt"
                                value={infomation.closedt}
                                format="yyyy-MM-dd"
                                onChange={InputChange}
                                placeholder=""
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>담보사항</th>
                            <td colSpan={3}>
                              <Input
                                name="motgdesc"
                                type="text"
                                value={infomation.motgdesc}
                                onChange={InputChange}
                              />
                            </td>
                            <th>사용유무</th>
                            <td>
                              {infomation.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionRadioGroup
                                      name="useyn"
                                      customOptionData={customOptionData}
                                      changeData={RadioChange}
                                      type="new"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentRadioGroup
                                      name="useyn"
                                      value={infomation.useyn}
                                      bizComponentId="R_USEYN_only"
                                      bizComponentData={bizComponentData}
                                      changeData={RadioChange}
                                    />
                                  )}
                            </td>
                          </tr>
                          <tr>
                            <th>첨부파일</th>
                            <td colSpan={7}>
                              <Input
                                name="files"
                                type="text"
                                value={infomation.files}
                                className="readonly"
                              />
                              <ButtonInInput>
                                <Button
                                  type={"button"}
                                  onClick={onAttachmentsWndClick}
                                  icon="more-horizontal"
                                  fillMode="flat"
                                />
                              </ButtonInInput>
                            </td>
                          </tr>
                          <tr>
                            <th>비고</th>
                            <td colSpan={7}>
                              <TextArea
                                value={infomation.remark}
                                name="remark"
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
                {infomation.workType != "N" ? (
                  <>
                    <SwiperSlide key={2}>
                      <GridContainer>
                        <GridTitleContainer className="ButtonContainer2_1">
                          <ButtonContainer
                            style={{ justifyContent: "space-between" }}
                          >
                            <Button
                              onClick={() => {
                                if (swiper && isMobile) {
                                  swiper.slideTo(1);
                                }
                              }}
                              icon="arrow-left"
                              themeColor={"primary"}
                              fillMode={"outline"}
                            >
                              이전
                            </Button>
                            <div>
                              <Button
                                onClick={onAddClick2_1}
                                themeColor={"primary"}
                                icon="plus"
                                title="행 생성"
                                disabled={permissions.save ? false : true}
                              />
                              <Button
                                onClick={onDeleteClick2_1}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="minus"
                                title="행 삭제"
                                disabled={permissions.delete ? false : true}
                              />
                              <Button
                                onClick={onSaveClick2}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="save"
                                disabled={permissions.save ? false : true}
                              >
                                저장
                              </Button>
                              <Button
                                onClick={() => {
                                  if (swiper && isMobile) {
                                    swiper.slideTo(3);
                                  }
                                }}
                                disabled={
                                  infomation.workType != "N" ? false : true
                                }
                                icon="arrow-right"
                                themeColor={"primary"}
                                fillMode={"outline"}
                              >
                                다음
                              </Button>
                            </div>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <ExcelExport
                          data={mainDataResult2_1.data}
                          ref={(exporter) => {
                            _export2_1 = exporter;
                          }}
                          fileName={getMenuName()}
                        >
                          <Grid
                            style={{ height: mobileheight2_2 }}
                            data={process(
                              mainDataResult2_1.data.map((row) => ({
                                ...row,
                                paydt: row.paydt
                                  ? new Date(dateformat(row.paydt))
                                  : new Date(dateformat("99991231")),
                                [SELECTED_FIELD]:
                                  selectedState2_1[idGetter2_1(row)],
                              })),
                              mainDataState2_1
                            )}
                            {...mainDataState2_1}
                            onDataStateChange={onMainDataStateChange2_1}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY2_1}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSelectionChange2_1}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={mainDataResult2_1.total}
                            skip={page2_1.skip}
                            take={page2_1.take}
                            pageable={true}
                            onPageChange={pageChange2_1}
                            //정렬기능
                            sortable={true}
                            onSortChange={onMainSortChange2_1}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                            onItemChange={onMainItemChange2_1}
                            cellRender={customCellRender2_1}
                            rowRender={customRowRender2_1}
                            editField={EDIT_FIELD}
                          >
                            <GridColumn
                              field="rowstatus"
                              title=" "
                              width="50px"
                            />
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList2_1"
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
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
                                          numberField.includes(item.fieldName)
                                            ? NumberCell
                                            : dateField.includes(item.fieldName)
                                            ? DateCell
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? mainTotalFooterCell2_1
                                            : numberField2.includes(
                                                item.fieldName
                                              )
                                            ? editNumberFooterCell2_1
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </SwiperSlide>
                    <SwiperSlide key={3}>
                      <GridContainer>
                        <ButtonContainer
                          className="ButtonContainer2_2"
                          style={{ justifyContent: "space-between" }}
                        >
                          <Button
                            onClick={() => {
                              if (swiper && isMobile) {
                                swiper.slideTo(2);
                              }
                            }}
                            icon="arrow-left"
                            themeColor={"primary"}
                            fillMode={"outline"}
                          >
                            이전
                          </Button>
                        </ButtonContainer>
                        <ExcelExport
                          data={mainDataResult2_2.data}
                          ref={(exporter) => {
                            _export2_2 = exporter;
                          }}
                          fileName={getMenuName()}
                        >
                          <Grid
                            style={{ height: mobileheight2_3 }}
                            data={process(
                              mainDataResult2_2.data.map((row) => ({
                                ...row,
                                [SELECTED_FIELD]:
                                  selectedState2_2[idGetter2_2(row)],
                              })),
                              mainDataState2_2
                            )}
                            {...mainDataState2_2}
                            onDataStateChange={onMainDataStateChange2_2}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY2_2}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSelectionChange2_2}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={mainDataResult2_2.total}
                            skip={page2_2.skip}
                            take={page2_2.take}
                            pageable={true}
                            onPageChange={pageChange2_2}
                            //정렬기능
                            sortable={true}
                            onSortChange={onMainSortChange2_2}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                          >
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList2_2"
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
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
                                          numberField.includes(item.fieldName)
                                            ? NumberCell
                                            : dateField.includes(item.fieldName)
                                            ? DateCell
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? mainTotalFooterCell2_2
                                            : numberField2.includes(
                                                item.fieldName
                                              )
                                            ? gridSumQtyFooterCell2_2
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </SwiperSlide>
                  </>
                ) : (
                  ""
                )}
              </Swiper>
            </>
          ) : (
            <>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>
                    요약정보
                    <ExcelUploadButton
                      saveExcel={saveExcel}
                      permissions={{
                        view: true,
                        save: true,
                        delete: true,
                        print: true,
                      }}
                      disabled={permissions.save ? false : true}
                      style={{ marginLeft: "5px", marginRight: "5px" }}
                    />
                    <Button
                      title="Export Excel"
                      onClick={onExcelAttachmentsWndClick}
                      icon="file"
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.view ? false : true}
                    >
                      엑셀양식
                    </Button>
                  </GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick2}
                      themeColor={"primary"}
                      icon="file-add"
                      disabled={permissions.save ? false : true}
                    >
                      생성
                    </Button>
                    <Button
                      onClick={onDeleteClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="delete"
                      disabled={permissions.delete ? false : true}
                    >
                      삭제
                    </Button>
                    <Button
                      onClick={onSaveClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      disabled={permissions.save ? false : true}
                    >
                      저장
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: webheight2 }}
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList2"]
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
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell2
                                    : numberField2.includes(item.fieldName)
                                    ? gridSumQtyFooterCell2
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <TabStrip
                style={{ width: "100%" }}
                selected={tabSelected2}
                onSelect={handleSelectTab2}
                scrollable={isMobile}
              >
                <TabStripTab
                  title="기본정보"
                  disabled={permissions.view ? false : true}
                >
                  <FormBoxWrap border={true} className="FormBoxWrap">
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>예적금구분</th>
                          <td>
                            {infomation.workType == "N" ? (
                              customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="bankacntdiv"
                                  value={infomation.bankacntdiv}
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  type="new"
                                  className="required"
                                />
                              )
                            ) : (
                              <Input
                                name="bankacntdiv"
                                type="text"
                                value={
                                  bankacntdivListData.find(
                                    (item: any) =>
                                      item.sub_code == infomation.bankacntdiv
                                  )?.code_name
                                }
                                className="readonly"
                              />
                            )}
                          </td>
                          <th>예금코드</th>
                          <td>
                            {infomation.workType == "N" ? (
                              <Input
                                name="acntsrtnum"
                                type="text"
                                value={infomation.acntsrtnum}
                                onChange={InputChange}
                                className="required"
                              />
                            ) : (
                              <Input
                                name="acntsrtnum"
                                type="text"
                                value={infomation.acntsrtnum}
                                className="readonly"
                              />
                            )}
                          </td>
                          <th>관리부서</th>
                          <td>
                            {infomation.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="dptcd"
                                    value={infomation.dptcd}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                    type="new"
                                    textField="dptnm"
                                    valueField="dptcd"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="dptcd"
                                    value={infomation.dptcd}
                                    bizComponentId="L_dptcd_001"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                    textField="dptnm"
                                    valueField="dptcd"
                                  />
                                )}
                          </td>
                          <th>차월한도액</th>
                          <td>
                            <NumericTextBox
                              name="limitamt"
                              value={infomation.limitamt}
                              onChange={InputChange}
                              format="n2"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>예적금명</th>
                          <td colSpan={3}>
                            <Input
                              name="acntsrtnm"
                              type="text"
                              value={infomation.acntsrtnm}
                              onChange={InputChange}
                              className="required"
                            />
                          </td>
                          <th>계약일자</th>
                          <td>
                            <DatePicker
                              name="cotracdt"
                              value={infomation.cotracdt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                            />
                          </td>
                          <th>불입횟수</th>
                          <td>
                            <NumericTextBox
                              name="savecnt"
                              value={infomation.savecnt}
                              onChange={InputChange}
                              format="n0"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>결제계좌번호</th>
                          <td colSpan={3}>
                            <Input
                              name="bankacntnum"
                              type="text"
                              value={infomation.bankacntnum}
                              onChange={InputChange}
                              className="required"
                            />
                          </td>
                          <th>계약금액</th>
                          <td>
                            <NumericTextBox
                              name="contracamt"
                              value={infomation.contracamt}
                              onChange={InputChange}
                              format="n2"
                            />
                          </td>
                          <th>월불입액</th>
                          <td>
                            <NumericTextBox
                              name="monsaveamt"
                              value={infomation.monsaveamt}
                              onChange={InputChange}
                              format="n2"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>계정과목</th>
                          <td>
                            <Input
                              name="acntcd"
                              type="text"
                              value={infomation.acntcd}
                              onChange={InputChange}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onAccountWndClick2}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>계정과목명</th>
                          <td>
                            <Input
                              name="acntnm"
                              type="text"
                              value={infomation.acntnm}
                              onChange={InputChange}
                            />
                          </td>
                          <th>이율</th>
                          <td>
                            <NumericTextBox
                              name="intrat"
                              value={infomation.intrat}
                              onChange={InputChange}
                              format="n4"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>은행코드</th>
                          <td>
                            <Input
                              name="bankcd"
                              type="text"
                              value={infomation.bankcd}
                              onChange={InputChange}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onCustWndClick}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>은행코드명</th>
                          <td>
                            <Input
                              name="banknm"
                              type="text"
                              value={infomation.banknm}
                              onChange={InputChange}
                            />
                          </td>
                          <th>화폐단위</th>
                          <td>
                            {infomation.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="amtunit"
                                    value={infomation.amtunit}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="amtunit"
                                    value={infomation.amtunit}
                                    bizComponentId="L_BA020"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                  />
                                )}
                          </td>
                        </tr>
                        <tr>
                          <th>적금구분</th>
                          <td>
                            {infomation.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="plandiv"
                                    value={infomation.plandiv}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="plandiv"
                                    value={infomation.plandiv}
                                    bizComponentId="L_AC046"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange}
                                  />
                                )}
                          </td>
                          <th>만기일자</th>
                          <td>
                            <DatePicker
                              name="enddt"
                              value={infomation.enddt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                            />
                          </td>
                          <th>해약일자</th>
                          <td>
                            <DatePicker
                              name="closedt"
                              value={infomation.closedt}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>담보사항</th>
                          <td colSpan={3}>
                            <Input
                              name="motgdesc"
                              type="text"
                              value={infomation.motgdesc}
                              onChange={InputChange}
                            />
                          </td>
                          <th>사용유무</th>
                          <td>
                            {infomation.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionRadioGroup
                                    name="useyn"
                                    customOptionData={customOptionData}
                                    changeData={RadioChange}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentRadioGroup
                                    name="useyn"
                                    value={infomation.useyn}
                                    bizComponentId="R_USEYN_only"
                                    bizComponentData={bizComponentData}
                                    changeData={RadioChange}
                                  />
                                )}
                          </td>
                        </tr>
                        <tr>
                          <th>첨부파일</th>
                          <td colSpan={7}>
                            <Input
                              name="files"
                              type="text"
                              value={infomation.files}
                              className="readonly"
                            />
                            <ButtonInInput>
                              <Button
                                type={"button"}
                                onClick={onAttachmentsWndClick}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                        </tr>
                        <tr>
                          <th>비고</th>
                          <td colSpan={7}>
                            <TextArea
                              value={infomation.remark}
                              name="remark"
                              rows={2}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </TabStripTab>
                <TabStripTab
                  title="상세정보"
                  disabled={
                    permissions.view
                      ? infomation.workType == "N"
                        ? true
                        : false
                      : true
                  }
                >
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer2_1">
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick2_1}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 생성"
                          disabled={permissions.save ? false : true}
                        />
                        <Button
                          onClick={onDeleteClick2_1}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.delete ? false : true}
                        />
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult2_1.data}
                      ref={(exporter) => {
                        _export2_1 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: webheight2_1 }}
                        data={process(
                          mainDataResult2_1.data.map((row) => ({
                            ...row,
                            paydt: row.paydt
                              ? new Date(dateformat(row.paydt))
                              : new Date(dateformat("99991231")),
                            [SELECTED_FIELD]:
                              selectedState2_1[idGetter2_1(row)],
                          })),
                          mainDataState2_1
                        )}
                        {...mainDataState2_1}
                        onDataStateChange={onMainDataStateChange2_1}
                        //선택 기능
                        dataItemKey={DATA_ITEM_KEY2_1}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onSelectionChange2_1}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={mainDataResult2_1.total}
                        skip={page2_1.skip}
                        take={page2_1.take}
                        pageable={true}
                        onPageChange={pageChange2_1}
                        //정렬기능
                        sortable={true}
                        onSortChange={onMainSortChange2_1}
                        //컬럼순서조정
                        reorderable={true}
                        //컬럼너비조정
                        resizable={true}
                        onItemChange={onMainItemChange2_1}
                        cellRender={customCellRender2_1}
                        rowRender={customRowRender2_1}
                        editField={EDIT_FIELD}
                      >
                        <GridColumn field="rowstatus" title=" " width="50px" />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList2_1"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
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
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : dateField.includes(item.fieldName)
                                        ? DateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell2_1
                                        : numberField2.includes(item.fieldName)
                                        ? editNumberFooterCell2_1
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </TabStripTab>
                <TabStripTab
                  title="전표상세정보"
                  disabled={
                    permissions.view
                      ? infomation.workType == "N"
                        ? true
                        : false
                      : true
                  }
                >
                  <GridContainer>
                    <ExcelExport
                      data={mainDataResult2_2.data}
                      ref={(exporter) => {
                        _export2_2 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: webheight2_2 }}
                        data={process(
                          mainDataResult2_2.data.map((row) => ({
                            ...row,
                            [SELECTED_FIELD]:
                              selectedState2_2[idGetter2_2(row)],
                          })),
                          mainDataState2_2
                        )}
                        {...mainDataState2_2}
                        onDataStateChange={onMainDataStateChange2_2}
                        //선택 기능
                        dataItemKey={DATA_ITEM_KEY2_2}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onSelectionChange2_2}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={mainDataResult2_2.total}
                        skip={page2_2.skip}
                        take={page2_2.take}
                        pageable={true}
                        onPageChange={pageChange2_2}
                        //정렬기능
                        sortable={true}
                        onSortChange={onMainSortChange2_2}
                        //컬럼순서조정
                        reorderable={true}
                        //컬럼너비조정
                        resizable={true}
                      >
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList2_2"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
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
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : dateField.includes(item.fieldName)
                                        ? DateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell2_2
                                        : numberField2.includes(item.fieldName)
                                        ? gridSumQtyFooterCell2_2
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
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="차입금관리"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>차입번호</th>
                  <td>
                    <Input
                      name="brwnum"
                      type="text"
                      value={filters3.brwnum}
                      onChange={filterInputChange2}
                    />
                  </td>
                  <th>차입명</th>
                  <td>
                    <Input
                      name="brwnm"
                      type="text"
                      value={filters3.brwnm}
                      onChange={filterInputChange2}
                    />
                  </td>
                  <th>차입금내역</th>
                  <td>
                    <Input
                      name="brwdesc"
                      type="text"
                      value={filters3.brwdesc}
                      onChange={filterInputChange2}
                    />
                  </td>
                </tr>
                <tr>
                  <th>차입처</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={filters3.custcd}
                      onChange={filterInputChange2}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick2}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>차입처명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters3.custnm}
                      onChange={filterInputChange2}
                    />
                  </td>
                  <th>비고</th>
                  <td>
                    <Input
                      name="remark"
                      type="text"
                      value={filters3.remark}
                      onChange={filterInputChange2}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          {isMobile ? (
            <>
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <SwiperSlide key={0}>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer">
                      <GridTitle>요약정보</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick3}
                          themeColor={"primary"}
                          icon="file-add"
                          disabled={permissions.save ? false : true}
                        >
                          생성
                        </Button>
                        <Button
                          onClick={onDeleteClick3}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="delete"
                          disabled={permissions.delete ? false : true}
                        >
                          삭제
                        </Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult3.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: mobileheight3 }}
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
                                    id={item.id}
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
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell3
                                        : numberField2.includes(item.fieldName)
                                        ? gridSumQtyFooterCell3
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
                  <GridContainer>
                    <ButtonContainer
                      className="ButtonContainer"
                      style={{ justifyContent: "space-between" }}
                    >
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                        icon="arrow-left"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        이전
                      </Button>
                      <div>
                        <Button
                          onClick={onSaveClick3}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          disabled={permissions.save ? false : true}
                        >
                          저장
                        </Button>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(2);
                            }
                          }}
                          disabled={infomation.workType != "N" ? false : true}
                          icon="arrow-right"
                          themeColor={"primary"}
                          fillMode={"outline"}
                        >
                          다음
                        </Button>
                      </div>
                    </ButtonContainer>
                    <FormBoxWrap
                      border={true}
                      style={{ height: mobileheight3_1 }}
                    >
                      <FormBox>
                        <tbody>
                          <tr>
                            <th>차입번호</th>
                            <td colSpan={3}>
                              {infomation2.workType == "N" ? (
                                <Input
                                  name="brwnum"
                                  type="text"
                                  value={infomation2.brwnum}
                                  onChange={InputChange2}
                                  className="required"
                                />
                              ) : (
                                <Input
                                  name="brwnum"
                                  type="text"
                                  value={infomation2.brwnum}
                                  className="readonly"
                                />
                              )}
                            </td>
                            <th>계정과목코드</th>
                            <td>
                              <Input
                                name="acntcd"
                                type="text"
                                value={infomation2.acntcd}
                                onChange={InputChange2}
                              />
                              <ButtonInInput>
                                <Button
                                  onClick={onAccountWndClick3}
                                  icon="more-horizontal"
                                  fillMode="flat"
                                />
                              </ButtonInInput>
                            </td>
                            <th>계정과목명</th>
                            <td>
                              <Input
                                name="acntnm"
                                type="text"
                                value={infomation2.acntnm}
                                onChange={InputChange2}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>차입명</th>
                            <td colSpan={3}>
                              <Input
                                name="brwnm"
                                type="text"
                                value={infomation2.brwnm}
                                onChange={InputChange2}
                                className="required"
                              />
                            </td>
                            <th>차입금내역</th>
                            <td colSpan={3}>
                              <Input
                                name="brwdesc"
                                type="text"
                                value={infomation2.brwdesc}
                                onChange={InputChange2}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>차입처</th>
                            <td>
                              <Input
                                name="custcd"
                                type="text"
                                value={infomation2.custcd}
                                onChange={InputChange2}
                              />
                              <ButtonInInput>
                                <Button
                                  onClick={onCustWndClick3}
                                  icon="more-horizontal"
                                  fillMode="flat"
                                />
                              </ButtonInInput>
                            </td>
                            <th>차입처명</th>
                            <td>
                              <Input
                                name="custnm"
                                type="text"
                                value={infomation2.custnm}
                                onChange={InputChange2}
                              />
                            </td>
                            <th>담보사항</th>
                            <td colSpan={3}>
                              <Input
                                name="motgdesc"
                                type="text"
                                value={infomation2.motgdesc}
                                onChange={InputChange2}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>차입유형</th>
                            <td>
                              {infomation2.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="brwtype"
                                      value={infomation2.brwtype}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange2}
                                      type="new"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="brwtype"
                                      value={infomation2.brwtype}
                                      bizComponentId="L_AC030"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange2}
                                    />
                                  )}
                            </td>
                            <th>차입일자</th>
                            <td>
                              <DatePicker
                                name="brwdt"
                                value={infomation2.brwdt}
                                format="yyyy-MM-dd"
                                onChange={InputChange2}
                                placeholder=""
                              />
                            </td>
                            <th>이자지급조건</th>
                            <td>
                              {infomation2.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="intpayterm"
                                      value={infomation2.intpayterm}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange2}
                                      type="new"
                                      textField="name"
                                      valueField="code"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="intpayterm"
                                      value={infomation2.intpayterm}
                                      bizComponentId="L_AC210"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange2}
                                      textField="name"
                                      valueField="code"
                                    />
                                  )}
                            </td>
                            <th>이자불입일</th>
                            <td>
                              <DatePicker
                                name="intpaydt"
                                value={infomation2.intpaydt}
                                format="yyyy-MM-dd"
                                onChange={InputChange2}
                                placeholder=""
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>계좌번호</th>
                            <td colSpan={3}>
                              <Input
                                name="bankacntnum"
                                type="text"
                                value={infomation2.bankacntnum}
                                onChange={InputChange2}
                              />
                            </td>
                            <th>이자지급금액</th>
                            <td>
                              <NumericTextBox
                                name="intpayamt"
                                value={infomation2.intpayamt}
                                onChange={InputChange2}
                                format="n2"
                              />
                            </td>
                            <th>이자지급자국금액</th>
                            <td>
                              <NumericTextBox
                                name="intpayown"
                                value={infomation2.intpayown}
                                onChange={InputChange2}
                                format="n2"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>차입금액</th>
                            <td>
                              <NumericTextBox
                                name="brwamt"
                                value={infomation2.brwamt}
                                onChange={InputChange2}
                                format="n2"
                              />
                            </td>
                            <th>화폐단위</th>
                            <td>
                              {infomation2.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="amtunit"
                                      value={infomation2.amtunit}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange2}
                                      type="new"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="amtunit"
                                      value={infomation2.amtunit}
                                      bizComponentId="L_BA020"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange2}
                                    />
                                  )}
                            </td>
                            <th>환율</th>
                            <td>
                              <NumericTextBox
                                name="chgrat"
                                value={infomation2.chgrat}
                                onChange={InputChange2}
                                format="n4"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>차입달러금액</th>
                            <td>
                              <NumericTextBox
                                name="brwamtdlr"
                                value={infomation2.brwamtdlr}
                                onChange={InputChange2}
                                format="n2"
                              />
                            </td>
                            <th>차입자국금액</th>
                            <td>
                              <NumericTextBox
                                name="brwamtown"
                                value={infomation2.brwamtown}
                                onChange={InputChange2}
                                format="n2"
                              />
                            </td>
                            <th>이율</th>
                            <td>
                              <NumericTextBox
                                name="intrat"
                                value={infomation2.intrat}
                                onChange={InputChange2}
                                format="n2"
                              />
                            </td>
                            <th>변경이율</th>
                            <td>
                              <NumericTextBox
                                name="chgintrat"
                                value={infomation2.chgintrat}
                                onChange={InputChange2}
                                format="n4"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>최조상환일</th>
                            <td>
                              <DatePicker
                                name="strdmdt"
                                value={infomation2.strdmdt}
                                format="yyyy-MM-dd"
                                onChange={InputChange2}
                                placeholder=""
                              />
                            </td>
                            <th>최종상환일</th>
                            <td>
                              <DatePicker
                                name="endrdmdt"
                                value={infomation2.endrdmdt}
                                format="yyyy-MM-dd"
                                onChange={InputChange2}
                                placeholder=""
                              />
                            </td>
                            <th>만기일자</th>
                            <td>
                              <DatePicker
                                name="enddt"
                                value={infomation2.enddt}
                                format="yyyy-MM-dd"
                                onChange={InputChange2}
                                placeholder=""
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>상환조건</th>
                            <td>
                              <Checkbox
                                name="rdmterm"
                                value={
                                  infomation2.rdmterm == "Y" ? true : false
                                }
                                onChange={InputChange2}
                                label={"(만기일시)"}
                              />
                            </td>
                            <th>상환주기</th>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <NumericTextBox
                                  name="rdmprd"
                                  value={infomation2.rdmprd}
                                  onChange={InputChange2}
                                  format="n0"
                                  width={"80%"}
                                />
                                개월
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <th>첨부파일</th>
                            <td colSpan={7}>
                              <Input
                                name="files"
                                type="text"
                                value={infomation2.files}
                                className="readonly"
                              />
                              <ButtonInInput>
                                <Button
                                  type={"button"}
                                  onClick={onAttachmentsWndClick2}
                                  icon="more-horizontal"
                                  fillMode="flat"
                                />
                              </ButtonInInput>
                            </td>
                          </tr>
                          <tr>
                            <th>비고</th>
                            <td colSpan={7}>
                              <TextArea
                                value={infomation2.remark}
                                name="remark"
                                rows={2}
                                onChange={InputChange2}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </FormBoxWrap>
                  </GridContainer>
                </SwiperSlide>
                {infomation.workType != "N" ? (
                  <>
                    <SwiperSlide key={2}>
                      <GridContainer>
                        <GridTitleContainer className="ButtonContainer2_1">
                          <ButtonContainer
                            style={{ justifyContent: "space-between" }}
                          >
                            <Button
                              onClick={() => {
                                if (swiper && isMobile) {
                                  swiper.slideTo(1);
                                }
                              }}
                              icon="arrow-left"
                              themeColor={"primary"}
                              fillMode={"outline"}
                            >
                              이전
                            </Button>
                            <div>
                              <Button
                                onClick={onAddClick3_1}
                                themeColor={"primary"}
                                icon="plus"
                                title="행 생성"
                                disabled={permissions.save ? false : true}
                              />
                              <Button
                                onClick={onDeleteClick3_1}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="minus"
                                title="행 삭제"
                                disabled={permissions.delete ? false : true}
                              />
                              <Button
                                onClick={onSaveClick3}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="save"
                                disabled={permissions.save ? false : true}
                              >
                                저장
                              </Button>
                              <Button
                                onClick={() => {
                                  if (swiper && isMobile) {
                                    swiper.slideTo(3);
                                  }
                                }}
                                disabled={
                                  infomation.workType != "N" ? false : true
                                }
                                icon="arrow-right"
                                themeColor={"primary"}
                                fillMode={"outline"}
                              >
                                다음
                              </Button>
                            </div>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <ExcelExport
                          data={mainDataResult3_1.data}
                          ref={(exporter) => {
                            _export3_1 = exporter;
                          }}
                          fileName={getMenuName()}
                        >
                          <Grid
                            style={{ height: mobileheight3_2 }}
                            data={process(
                              mainDataResult3_1.data.map((row) => ({
                                ...row,
                                paydt: row.paydt
                                  ? new Date(dateformat(row.paydt))
                                  : new Date(dateformat("99991231")),
                                [SELECTED_FIELD]:
                                  selectedState3_1[idGetter3_1(row)],
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
                            <GridColumn
                              field="rowstatus"
                              title=" "
                              width="50px"
                            />
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList3_1"
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
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
                                          numberField.includes(item.fieldName)
                                            ? NumberCell
                                            : dateField.includes(item.fieldName)
                                            ? DateCell
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? mainTotalFooterCell3_1
                                            : numberField2.includes(
                                                item.fieldName
                                              )
                                            ? editNumberFooterCell3_1
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </SwiperSlide>
                    <SwiperSlide key={3}>
                      <GridContainer>
                        <ButtonContainer
                          className="ButtonContainer2_2"
                          style={{ justifyContent: "space-between" }}
                        >
                          <Button
                            onClick={() => {
                              if (swiper && isMobile) {
                                swiper.slideTo(2);
                              }
                            }}
                            icon="arrow-left"
                            themeColor={"primary"}
                            fillMode={"outline"}
                          >
                            이전
                          </Button>
                        </ButtonContainer>
                        <ExcelExport
                          data={mainDataResult3_2.data}
                          ref={(exporter) => {
                            _export3_2 = exporter;
                          }}
                          fileName={getMenuName()}
                        >
                          <Grid
                            style={{ height: mobileheight3_3 }}
                            data={process(
                              mainDataResult3_2.data.map((row) => ({
                                ...row,
                                [SELECTED_FIELD]:
                                  selectedState3_2[idGetter3_2(row)],
                              })),
                              mainDataState3_2
                            )}
                            {...mainDataState3_2}
                            onDataStateChange={onMainDataStateChange3_2}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY3_2}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSelectionChange3_2}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={mainDataResult3_2.total}
                            skip={page3_2.skip}
                            take={page3_2.take}
                            pageable={true}
                            onPageChange={pageChange3_2}
                            //정렬기능
                            sortable={true}
                            onSortChange={onMainSortChange3_2}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                          >
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList3_2"
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
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
                                          numberField.includes(item.fieldName)
                                            ? NumberCell
                                            : dateField.includes(item.fieldName)
                                            ? DateCell
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? mainTotalFooterCell3_2
                                            : numberField2.includes(
                                                item.fieldName
                                              )
                                            ? gridSumQtyFooterCell3_2
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </SwiperSlide>
                  </>
                ) : (
                  ""
                )}
              </Swiper>
            </>
          ) : (
            <>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>요약정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick3}
                      themeColor={"primary"}
                      icon="file-add"
                      disabled={permissions.save ? false : true}
                    >
                      생성
                    </Button>
                    <Button
                      onClick={onDeleteClick3}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="delete"
                      disabled={permissions.delete ? false : true}
                    >
                      삭제
                    </Button>
                    <Button
                      onClick={onSaveClick3}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      disabled={permissions.save ? false : true}
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
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: webheight3 }}
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
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList3"]
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
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell3
                                    : numberField2.includes(item.fieldName)
                                    ? gridSumQtyFooterCell3
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <TabStrip
                style={{ width: "100%" }}
                selected={tabSelected2}
                onSelect={handleSelectTab2}
                scrollable={isMobile}
              >
                <TabStripTab
                  title="기본정보"
                  disabled={permissions.view ? false : true}
                >
                  <FormBoxWrap border={true} className="FormBoxWrap">
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>차입번호</th>
                          <td colSpan={3}>
                            {infomation2.workType == "N" ? (
                              <Input
                                name="brwnum"
                                type="text"
                                value={infomation2.brwnum}
                                onChange={InputChange2}
                                className="required"
                              />
                            ) : (
                              <Input
                                name="brwnum"
                                type="text"
                                value={infomation2.brwnum}
                                className="readonly"
                              />
                            )}
                          </td>
                          <th>계정과목코드</th>
                          <td>
                            <Input
                              name="acntcd"
                              type="text"
                              value={infomation2.acntcd}
                              onChange={InputChange2}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onAccountWndClick3}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>계정과목명</th>
                          <td>
                            <Input
                              name="acntnm"
                              type="text"
                              value={infomation2.acntnm}
                              onChange={InputChange2}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>차입명</th>
                          <td colSpan={3}>
                            <Input
                              name="brwnm"
                              type="text"
                              value={infomation2.brwnm}
                              onChange={InputChange2}
                              className="required"
                            />
                          </td>
                          <th>차입금내역</th>
                          <td colSpan={3}>
                            <Input
                              name="brwdesc"
                              type="text"
                              value={infomation2.brwdesc}
                              onChange={InputChange2}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>차입처</th>
                          <td>
                            <Input
                              name="custcd"
                              type="text"
                              value={infomation2.custcd}
                              onChange={InputChange2}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onCustWndClick3}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>차입처명</th>
                          <td>
                            <Input
                              name="custnm"
                              type="text"
                              value={infomation2.custnm}
                              onChange={InputChange2}
                            />
                          </td>
                          <th>담보사항</th>
                          <td colSpan={3}>
                            <Input
                              name="motgdesc"
                              type="text"
                              value={infomation2.motgdesc}
                              onChange={InputChange2}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>차입유형</th>
                          <td>
                            {infomation2.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="brwtype"
                                    value={infomation2.brwtype}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange2}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="brwtype"
                                    value={infomation2.brwtype}
                                    bizComponentId="L_AC030"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange2}
                                  />
                                )}
                          </td>
                          <th>차입일자</th>
                          <td>
                            <DatePicker
                              name="brwdt"
                              value={infomation2.brwdt}
                              format="yyyy-MM-dd"
                              onChange={InputChange2}
                              placeholder=""
                            />
                          </td>
                          <th>이자지급조건</th>
                          <td>
                            {infomation2.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="intpayterm"
                                    value={infomation2.intpayterm}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange2}
                                    type="new"
                                    textField="name"
                                    valueField="code"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="intpayterm"
                                    value={infomation2.intpayterm}
                                    bizComponentId="L_AC210"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange2}
                                    textField="name"
                                    valueField="code"
                                  />
                                )}
                          </td>
                          <th>이자불입일</th>
                          <td>
                            <DatePicker
                              name="intpaydt"
                              value={infomation2.intpaydt}
                              format="yyyy-MM-dd"
                              onChange={InputChange2}
                              placeholder=""
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>계좌번호</th>
                          <td colSpan={3}>
                            <Input
                              name="bankacntnum"
                              type="text"
                              value={infomation2.bankacntnum}
                              onChange={InputChange2}
                            />
                          </td>
                          <th>이자지급금액</th>
                          <td>
                            <NumericTextBox
                              name="intpayamt"
                              value={infomation2.intpayamt}
                              onChange={InputChange2}
                              format="n2"
                            />
                          </td>
                          <th>이자지급자국금액</th>
                          <td>
                            <NumericTextBox
                              name="intpayown"
                              value={infomation2.intpayown}
                              onChange={InputChange2}
                              format="n2"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>차입금액</th>
                          <td>
                            <NumericTextBox
                              name="brwamt"
                              value={infomation2.brwamt}
                              onChange={InputChange2}
                              format="n2"
                            />
                          </td>
                          <th></th>
                          <td></td>
                          <th>화폐단위</th>
                          <td>
                            {infomation2.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="amtunit"
                                    value={infomation2.amtunit}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange2}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="amtunit"
                                    value={infomation2.amtunit}
                                    bizComponentId="L_BA020"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange2}
                                  />
                                )}
                          </td>
                          <th>환율</th>
                          <td>
                            <NumericTextBox
                              name="chgrat"
                              value={infomation2.chgrat}
                              onChange={InputChange2}
                              format="n4"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>차입달러금액</th>
                          <td>
                            <NumericTextBox
                              name="brwamtdlr"
                              value={infomation2.brwamtdlr}
                              onChange={InputChange2}
                              format="n2"
                            />
                          </td>
                          <th>차입자국금액</th>
                          <td>
                            <NumericTextBox
                              name="brwamtown"
                              value={infomation2.brwamtown}
                              onChange={InputChange2}
                              format="n2"
                            />
                          </td>
                          <th>이율</th>
                          <td>
                            <NumericTextBox
                              name="intrat"
                              value={infomation2.intrat}
                              onChange={InputChange2}
                              format="n2"
                            />
                          </td>
                          <th>변경이율</th>
                          <td>
                            <NumericTextBox
                              name="chgintrat"
                              value={infomation2.chgintrat}
                              onChange={InputChange2}
                              format="n4"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>최조상환일</th>
                          <td>
                            <DatePicker
                              name="strdmdt"
                              value={infomation2.strdmdt}
                              format="yyyy-MM-dd"
                              onChange={InputChange2}
                              placeholder=""
                            />
                          </td>
                          <th>최종상환일</th>
                          <td>
                            <DatePicker
                              name="endrdmdt"
                              value={infomation2.endrdmdt}
                              format="yyyy-MM-dd"
                              onChange={InputChange2}
                              placeholder=""
                            />
                          </td>
                          <th>만기일자</th>
                          <td>
                            <DatePicker
                              name="enddt"
                              value={infomation2.enddt}
                              format="yyyy-MM-dd"
                              onChange={InputChange2}
                              placeholder=""
                            />
                          </td>
                          <th></th>
                          <td></td>
                        </tr>
                        <tr>
                          <th>상환조건</th>
                          <td>
                            <Checkbox
                              name="rdmterm"
                              value={infomation2.rdmterm == "Y" ? true : false}
                              onChange={InputChange2}
                              label={"(만기일시)"}
                            />
                          </td>
                          <th>상환주기</th>
                          <td>
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <NumericTextBox
                                name="rdmprd"
                                value={infomation2.rdmprd}
                                onChange={InputChange2}
                                format="n0"
                                width={"80%"}
                              />
                              개월
                            </div>
                          </td>
                          <th></th>
                          <td></td>
                          <th></th>
                          <td></td>
                        </tr>
                        <tr>
                          <th>첨부파일</th>
                          <td colSpan={7}>
                            <Input
                              name="files"
                              type="text"
                              value={infomation2.files}
                              className="readonly"
                            />
                            <ButtonInInput>
                              <Button
                                type={"button"}
                                onClick={onAttachmentsWndClick2}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                        </tr>
                        <tr>
                          <th>비고</th>
                          <td colSpan={7}>
                            <TextArea
                              value={infomation2.remark}
                              name="remark"
                              rows={2}
                              onChange={InputChange2}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </TabStripTab>
                <TabStripTab
                  title="상세정보"
                  disabled={
                    permissions.view
                      ? infomation2.workType == "N"
                        ? true
                        : false
                      : true
                  }
                >
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer2_1">
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick3_1}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 생성"
                          disabled={permissions.save ? false : true}
                        />
                        <Button
                          onClick={onDeleteClick3_1}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.delete ? false : true}
                        />
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult3_1.data}
                      ref={(exporter) => {
                        _export3_1 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: webheight3_1 }}
                        data={process(
                          mainDataResult3_1.data.map((row) => ({
                            ...row,
                            paydt: row.paydt
                              ? new Date(dateformat(row.paydt))
                              : new Date(dateformat("99991231")),
                            [SELECTED_FIELD]:
                              selectedState3_1[idGetter3_1(row)],
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
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList3_1"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
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
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : dateField.includes(item.fieldName)
                                        ? DateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell3_1
                                        : numberField2.includes(item.fieldName)
                                        ? editNumberFooterCell3_1
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </TabStripTab>
                <TabStripTab
                  title="전표상세정보"
                  disabled={
                    permissions.view
                      ? infomation2.workType == "N"
                        ? true
                        : false
                      : true
                  }
                >
                  <GridContainer>
                    <ExcelExport
                      data={mainDataResult3_2.data}
                      ref={(exporter) => {
                        _export3_2 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: webheight3_2 }}
                        data={process(
                          mainDataResult3_2.data.map((row) => ({
                            ...row,
                            [SELECTED_FIELD]:
                              selectedState3_2[idGetter3_2(row)],
                          })),
                          mainDataState3_2
                        )}
                        {...mainDataState3_2}
                        onDataStateChange={onMainDataStateChange3_2}
                        //선택 기능
                        dataItemKey={DATA_ITEM_KEY3_2}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onSelectionChange3_2}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={mainDataResult3_2.total}
                        skip={page3_2.skip}
                        take={page3_2.take}
                        pageable={true}
                        onPageChange={pageChange3_2}
                        //정렬기능
                        sortable={true}
                        onSortChange={onMainSortChange3_2}
                        //컬럼순서조정
                        reorderable={true}
                        //컬럼너비조정
                        resizable={true}
                      >
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList3_2"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
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
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : dateField.includes(item.fieldName)
                                        ? DateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell3_2
                                        : numberField2.includes(item.fieldName)
                                        ? gridSumQtyFooterCell3_2
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
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="어음관리"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="dtgb"
                        value={filters4.dtgb}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange4}
                        className="required"
                        textField="name"
                        valueField="code"
                      />
                    )}
                  </td>
                  <th>일자</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: filters4.frdt,
                        end: filters4.todt,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) =>
                        setFilters4((prev) => ({
                          ...prev,
                          frdt: e.value.start,
                          todt: e.value.end,
                        }))
                      }
                      className="required"
                    />
                  </td>
                  <th>어음구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="notediv"
                        value={filters4.notediv}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange4}
                      />
                    )}
                  </td>
                  <th>어음종류</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="notekind"
                        value={filters4.notekind}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange4}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>어음번호</th>
                  <td>
                    <Input
                      name="notenum"
                      type="text"
                      value={filters4.notenum}
                      onChange={filterInputChange4}
                    />
                  </td>
                  <th>어음상태</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="notests"
                        value={filters4.notests}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange4}
                      />
                    )}
                  </td>
                  <th>업체코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={filters4.custcd}
                      onChange={filterInputChange4}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick4}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>업체명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters4.custnm}
                      onChange={filterInputChange4}
                    />
                  </td>
                </tr>
                <tr>
                  <th>발행은행명</th>
                  <td>
                    <Input
                      name="pubbank"
                      type="text"
                      value={filters4.pubbank}
                      onChange={filterInputChange4}
                    />
                  </td>
                  <th>비고</th>
                  <td colSpan={5}>
                    <Input
                      name="remark1"
                      type="text"
                      value={filters4.remark1}
                      onChange={filterInputChange4}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          {isMobile ? (
            <>
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <SwiperSlide key={0}>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer">
                      <GridTitle>요약정보</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick4}
                          themeColor={"primary"}
                          icon="file-add"
                          disabled={permissions.save ? false : true}
                        >
                          생성
                        </Button>
                        <Button
                          onClick={onDeleteClick4}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="delete"
                          disabled={permissions.delete ? false : true}
                        >
                          삭제
                        </Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult4.data}
                      ref={(exporter) => {
                        _export4 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: mobileheight4 }}
                        data={process(
                          mainDataResult4.data.map((row) => ({
                            ...row,
                            notediv: notedivListData.find(
                              (item: any) => item.sub_code == row.notediv
                            )?.code_name,
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
                      >
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList4"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
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
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : dateField.includes(item.fieldName)
                                        ? DateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell4
                                        : numberField2.includes(item.fieldName)
                                        ? gridSumQtyFooterCell4
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
                  <GridContainer>
                    <ButtonContainer
                      className="ButtonContainer"
                      style={{ justifyContent: "space-between" }}
                    >
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                        icon="arrow-left"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        이전
                      </Button>
                      <div>
                        <Button
                          onClick={onSaveClick4}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          disabled={permissions.save ? false : true}
                        >
                          저장
                        </Button>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(2);
                            }
                          }}
                          disabled={infomation3.workType != "N" ? false : true}
                          icon="arrow-right"
                          themeColor={"primary"}
                          fillMode={"outline"}
                        >
                          다음
                        </Button>
                      </div>
                    </ButtonContainer>
                    <FormBoxWrap
                      border={true}
                      style={{ height: mobileheight4_1 }}
                    >
                      <FormBox>
                        <tbody>
                          <tr>
                            <th>어음구분</th>
                            <td>
                              {infomation3.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionRadioGroup
                                      name="notediv"
                                      customOptionData={customOptionData}
                                      changeData={RadioChange4}
                                      type="new"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentRadioGroup
                                      name="notediv"
                                      value={infomation3.notediv}
                                      bizComponentId="R_NOTEDIV"
                                      bizComponentData={bizComponentData}
                                      changeData={RadioChange4}
                                    />
                                  )}
                            </td>
                            <th>어음번호</th>
                            <td>
                              {infomation3.workType == "N" ? (
                                <Input
                                  name="notenum"
                                  type="text"
                                  value={infomation3.notenum}
                                  onChange={InputChange4}
                                  className="required"
                                />
                              ) : (
                                <Input
                                  name="notenum"
                                  type="text"
                                  value={infomation3.notenum}
                                  className="readonly"
                                />
                              )}
                            </td>
                            <th>계정과목</th>
                            <td>
                              <Input
                                name="acntcd"
                                type="text"
                                value={infomation3.acntcd}
                                onChange={InputChange4}
                              />
                              <ButtonInInput>
                                <Button
                                  onClick={onAccountWndClick4}
                                  icon="more-horizontal"
                                  fillMode="flat"
                                />
                              </ButtonInInput>
                            </td>
                            <th>계정과목명</th>
                            <td>
                              <Input
                                name="acntnm"
                                type="text"
                                value={infomation3.acntnm}
                                onChange={InputChange4}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>어음내역</th>
                            <td colSpan={3}>
                              <Input
                                name="notedec"
                                type="text"
                                value={infomation3.notedec}
                                onChange={InputChange4}
                              />
                            </td>
                            <th>배서인1</th>
                            <td>
                              <Input
                                name="endorser1"
                                type="text"
                                value={infomation3.endorser1}
                                onChange={InputChange4}
                              />
                            </td>
                            <th>배서인2</th>
                            <td>
                              <Input
                                name="endorser2"
                                type="text"
                                value={infomation3.endorser2}
                                onChange={InputChange4}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>업체코드</th>
                            <td>
                              <Input
                                name="custcd"
                                type="text"
                                value={infomation3.custcd}
                                onChange={InputChange4}
                              />
                              <ButtonInInput>
                                <Button
                                  onClick={onCustWndClick5}
                                  icon="more-horizontal"
                                  fillMode="flat"
                                />
                              </ButtonInInput>
                            </td>
                            <th>업체명</th>
                            <td>
                              <Input
                                name="custnm"
                                type="text"
                                value={infomation3.custnm}
                                onChange={InputChange4}
                              />
                            </td>
                            <th>어음종류</th>
                            <td>
                              {infomation3.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="notekind"
                                      value={infomation3.notekind}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange4}
                                      type="new"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="notekind"
                                      value={infomation3.notekind}
                                      bizComponentId="L_AC027"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange4}
                                    />
                                  )}
                            </td>
                            <th>어음보관장소</th>
                            <td>
                              {infomation3.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="noteloca"
                                      value={infomation3.noteloca}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange4}
                                      type="new"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="noteloca"
                                      value={infomation3.noteloca}
                                      bizComponentId="L_AC029"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange4}
                                    />
                                  )}
                            </td>
                          </tr>
                          <tr>
                            <th>지급은행</th>
                            <td>
                              <Input
                                name="bankcd"
                                type="text"
                                value={infomation3.bankcd}
                                onChange={InputChange4}
                              />
                              <ButtonInInput>
                                <Button
                                  onClick={onCustWndClick6}
                                  icon="more-horizontal"
                                  fillMode="flat"
                                />
                              </ButtonInInput>
                            </td>
                            <th>지급은행명</th>
                            <td>
                              <Input
                                name="banknm"
                                type="text"
                                value={infomation3.banknm}
                                onChange={InputChange4}
                              />
                            </td>
                            <th>부서</th>
                            <td>
                              {infomation3.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="dptcd"
                                      value={infomation3.dptcd}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange4}
                                      type="new"
                                      textField="dptnm"
                                      valueField="dptcd"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="dptcd"
                                      value={infomation3.dptcd}
                                      bizComponentId="L_dptcd_001"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange4}
                                      textField="dptnm"
                                      valueField="dptcd"
                                    />
                                  )}
                            </td>
                          </tr>
                          <tr>
                            <th>발행은행명</th>
                            <td>
                              <Input
                                name="pubbank"
                                type="text"
                                value={infomation3.pubbank}
                                onChange={InputChange4}
                              />
                            </td>
                            <th>발행인</th>
                            <td>
                              <Input
                                name="pubperson"
                                type="text"
                                value={infomation3.pubperson}
                                onChange={InputChange4}
                              />
                            </td>
                            <th>어음상태</th>
                            <td>
                              {infomation3.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="notests"
                                      value={infomation3.notests}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange4}
                                      type="new"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="notests"
                                      value={infomation3.notests}
                                      bizComponentId="L_AC028"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange4}
                                    />
                                  )}
                            </td>
                            <th>대체일자</th>
                            <td>
                              <DatePicker
                                name="replacedt"
                                value={infomation3.replacedt}
                                format="yyyy-MM-dd"
                                onChange={InputChange4}
                                placeholder=""
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>발행일자</th>
                            <td>
                              <DatePicker
                                name="pubdt"
                                value={infomation3.pubdt}
                                format="yyyy-MM-dd"
                                onChange={InputChange4}
                                placeholder=""
                                className="required"
                              />
                            </td>
                            <th>만기일자</th>
                            <td>
                              <DatePicker
                                name="enddt"
                                value={infomation3.enddt}
                                format="yyyy-MM-dd"
                                onChange={InputChange4}
                                placeholder=""
                                className="required"
                              />
                            </td>
                            <th>대체거래처</th>
                            <td>
                              <Input
                                name="replace_custcd"
                                type="text"
                                value={infomation3.replace_custcd}
                                onChange={InputChange4}
                              />
                              <ButtonInInput>
                                <Button
                                  onClick={onCustWndClick7}
                                  icon="more-horizontal"
                                  fillMode="flat"
                                />
                              </ButtonInInput>
                            </td>
                            <th>대체거래처명</th>
                            <td>
                              <Input
                                name="replace_custnm"
                                type="text"
                                value={infomation3.replace_custnm}
                                onChange={InputChange4}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>발행금액</th>
                            <td>
                              <NumericTextBox
                                name="pubamt"
                                format={"n2"}
                                value={infomation3.pubamt}
                                onChange={InputChange4}
                              />
                            </td>
                            <th>반제일자</th>
                            <td>
                              <DatePicker
                                name="returndt"
                                value={infomation3.returndt}
                                format="yyyy-MM-dd"
                                onChange={InputChange4}
                                placeholder=""
                              />
                            </td>
                            <th>대체은행</th>
                            <td>
                              <Input
                                name="replace_bankcd"
                                type="text"
                                value={infomation3.replace_bankcd}
                                onChange={InputChange4}
                              />
                              <ButtonInInput>
                                <Button
                                  onClick={onCustWndClick8}
                                  icon="more-horizontal"
                                  fillMode="flat"
                                />
                              </ButtonInInput>
                            </td>
                            <th>대체은행명</th>
                            <td>
                              <Input
                                name="replace_banknm"
                                type="text"
                                value={infomation3.replace_banknm}
                                onChange={InputChange4}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>비고</th>
                            <td colSpan={7}>
                              <TextArea
                                value={infomation3.remark1}
                                name="remark1"
                                rows={2}
                                onChange={InputChange4}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </FormBoxWrap>
                  </GridContainer>
                </SwiperSlide>
                {infomation3.workType != "N" ? (
                  <>
                    <SwiperSlide key={2}>
                      <GridContainer>
                        <GridTitleContainer className="ButtonContainer2_1">
                          <ButtonContainer
                            style={{ justifyContent: "space-between" }}
                          >
                            <Button
                              onClick={() => {
                                if (swiper && isMobile) {
                                  swiper.slideTo(1);
                                }
                              }}
                              icon="arrow-left"
                              themeColor={"primary"}
                              fillMode={"outline"}
                            >
                              이전
                            </Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <ExcelExport
                          data={mainDataResult4_1.data}
                          ref={(exporter) => {
                            _export4_1 = exporter;
                          }}
                          fileName={getMenuName()}
                        >
                          <Grid
                            style={{ height: mobileheight4_1 }}
                            data={process(
                              mainDataResult4_1.data.map((row) => ({
                                ...row,
                                [SELECTED_FIELD]:
                                  selectedState4_1[idGetter4_1(row)],
                              })),
                              mainDataState4_1
                            )}
                            {...mainDataState4_1}
                            onDataStateChange={onMainDataStateChange4_1}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY4_1}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSelectionChange4_1}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={mainDataResult4_1.total}
                            skip={page4_1.skip}
                            take={page4_1.take}
                            pageable={true}
                            onPageChange={pageChange4_1}
                            //정렬기능
                            sortable={true}
                            onSortChange={onMainSortChange4_1}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                          >
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList4_1"
                              ]
                                ?.sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
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
                                          numberField.includes(item.fieldName)
                                            ? NumberCell
                                            : dateField.includes(item.fieldName)
                                            ? DateCell
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? mainTotalFooterCell4_1
                                            : numberField2.includes(
                                                item.fieldName
                                              )
                                            ? gridSumQtyFooterCell4_1
                                            : undefined
                                        }
                                      />
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </SwiperSlide>
                  </>
                ) : (
                  ""
                )}
              </Swiper>
            </>
          ) : (
            <>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>요약정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick4}
                      themeColor={"primary"}
                      icon="file-add"
                      disabled={permissions.save ? false : true}
                    >
                      생성
                    </Button>
                    <Button
                      onClick={onDeleteClick4}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="delete"
                      disabled={permissions.delete ? false : true}
                    >
                      삭제
                    </Button>
                    <Button
                      onClick={onSaveClick4}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      disabled={permissions.save ? false : true}
                    >
                      저장
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult4.data}
                  ref={(exporter) => {
                    _export4 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: webheight4 }}
                    data={process(
                      mainDataResult4.data.map((row) => ({
                        ...row,
                        notediv: notedivListData.find(
                          (item: any) => item.sub_code == row.notediv
                        )?.code_name,
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList4"]
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
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell4
                                    : numberField2.includes(item.fieldName)
                                    ? gridSumQtyFooterCell4
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <TabStrip
                style={{ width: "100%" }}
                selected={tabSelected2}
                onSelect={handleSelectTab2}
                scrollable={isMobile}
              >
                <TabStripTab
                  title="기본정보"
                  disabled={permissions.view ? false : true}
                >
                  <FormBoxWrap border={true} className="FormBoxWrap">
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>어음구분</th>
                          <td>
                            {infomation3.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionRadioGroup
                                    name="notediv"
                                    customOptionData={customOptionData}
                                    changeData={RadioChange4}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentRadioGroup
                                    name="notediv"
                                    value={infomation3.notediv}
                                    bizComponentId="R_NOTEDIV"
                                    bizComponentData={bizComponentData}
                                    changeData={RadioChange4}
                                  />
                                )}
                          </td>
                          <th>어음번호</th>
                          <td>
                            {infomation3.workType == "N" ? (
                              <Input
                                name="notenum"
                                type="text"
                                value={infomation3.notenum}
                                onChange={InputChange4}
                                className="required"
                              />
                            ) : (
                              <Input
                                name="notenum"
                                type="text"
                                value={infomation3.notenum}
                                className="readonly"
                              />
                            )}
                          </td>
                          <th>계정과목</th>
                          <td>
                            <Input
                              name="acntcd"
                              type="text"
                              value={infomation3.acntcd}
                              onChange={InputChange4}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onAccountWndClick4}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>계정과목명</th>
                          <td>
                            <Input
                              name="acntnm"
                              type="text"
                              value={infomation3.acntnm}
                              onChange={InputChange4}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>어음내역</th>
                          <td colSpan={3}>
                            <Input
                              name="notedec"
                              type="text"
                              value={infomation3.notedec}
                              onChange={InputChange4}
                            />
                          </td>
                          <th>배서인1</th>
                          <td>
                            <Input
                              name="endorser1"
                              type="text"
                              value={infomation3.endorser1}
                              onChange={InputChange4}
                            />
                          </td>
                          <th>배서인2</th>
                          <td>
                            <Input
                              name="endorser2"
                              type="text"
                              value={infomation3.endorser2}
                              onChange={InputChange4}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>업체코드</th>
                          <td>
                            <Input
                              name="custcd"
                              type="text"
                              value={infomation3.custcd}
                              onChange={InputChange4}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onCustWndClick5}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>업체명</th>
                          <td>
                            <Input
                              name="custnm"
                              type="text"
                              value={infomation3.custnm}
                              onChange={InputChange4}
                            />
                          </td>
                          <th>어음종류</th>
                          <td>
                            {infomation3.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="notekind"
                                    value={infomation3.notekind}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange4}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="notekind"
                                    value={infomation3.notekind}
                                    bizComponentId="L_AC027"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange4}
                                  />
                                )}
                          </td>
                          <th>어음보관장소</th>
                          <td>
                            {infomation3.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="noteloca"
                                    value={infomation3.noteloca}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange4}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="noteloca"
                                    value={infomation3.noteloca}
                                    bizComponentId="L_AC029"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange4}
                                  />
                                )}
                          </td>
                        </tr>
                        <tr>
                          <th>지급은행</th>
                          <td>
                            <Input
                              name="bankcd"
                              type="text"
                              value={infomation3.bankcd}
                              onChange={InputChange4}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onCustWndClick6}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>지급은행명</th>
                          <td>
                            <Input
                              name="banknm"
                              type="text"
                              value={infomation3.banknm}
                              onChange={InputChange4}
                            />
                          </td>
                          <th>부서</th>
                          <td>
                            {infomation3.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="dptcd"
                                    value={infomation3.dptcd}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange4}
                                    type="new"
                                    textField="dptnm"
                                    valueField="dptcd"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="dptcd"
                                    value={infomation3.dptcd}
                                    bizComponentId="L_dptcd_001"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange4}
                                    textField="dptnm"
                                    valueField="dptcd"
                                  />
                                )}
                          </td>
                        </tr>
                        <tr>
                          <th>발행은행명</th>
                          <td>
                            <Input
                              name="pubbank"
                              type="text"
                              value={infomation3.pubbank}
                              onChange={InputChange4}
                            />
                          </td>
                          <th>발행인</th>
                          <td>
                            <Input
                              name="pubperson"
                              type="text"
                              value={infomation3.pubperson}
                              onChange={InputChange4}
                            />
                          </td>
                          <th>어음상태</th>
                          <td>
                            {infomation3.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="notests"
                                    value={infomation3.notests}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange4}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="notests"
                                    value={infomation3.notests}
                                    bizComponentId="L_AC028"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange4}
                                  />
                                )}
                          </td>
                          <th>대체일자</th>
                          <td>
                            <DatePicker
                              name="replacedt"
                              value={infomation3.replacedt}
                              format="yyyy-MM-dd"
                              onChange={InputChange4}
                              placeholder=""
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>발행일자</th>
                          <td>
                            <DatePicker
                              name="pubdt"
                              value={infomation3.pubdt}
                              format="yyyy-MM-dd"
                              onChange={InputChange4}
                              placeholder=""
                              className="required"
                            />
                          </td>
                          <th>만기일자</th>
                          <td>
                            <DatePicker
                              name="enddt"
                              value={infomation3.enddt}
                              format="yyyy-MM-dd"
                              onChange={InputChange4}
                              placeholder=""
                              className="required"
                            />
                          </td>
                          <th>대체거래처</th>
                          <td>
                            <Input
                              name="replace_custcd"
                              type="text"
                              value={infomation3.replace_custcd}
                              onChange={InputChange4}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onCustWndClick7}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>대체거래처명</th>
                          <td>
                            <Input
                              name="replace_custnm"
                              type="text"
                              value={infomation3.replace_custnm}
                              onChange={InputChange4}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>발행금액</th>
                          <td>
                            <NumericTextBox
                              name="pubamt"
                              format={"n2"}
                              value={infomation3.pubamt}
                              onChange={InputChange4}
                            />
                          </td>
                          <th>반제일자</th>
                          <td>
                            <DatePicker
                              name="returndt"
                              value={infomation3.returndt}
                              format="yyyy-MM-dd"
                              onChange={InputChange4}
                              placeholder=""
                            />
                          </td>
                          <th>대체은행</th>
                          <td>
                            <Input
                              name="replace_bankcd"
                              type="text"
                              value={infomation3.replace_bankcd}
                              onChange={InputChange4}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onCustWndClick8}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>대체은행명</th>
                          <td>
                            <Input
                              name="replace_banknm"
                              type="text"
                              value={infomation3.replace_banknm}
                              onChange={InputChange4}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>비고</th>
                          <td colSpan={7}>
                            <TextArea
                              value={infomation3.remark1}
                              name="remark1"
                              rows={2}
                              onChange={InputChange4}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </TabStripTab>
                <TabStripTab
                  title="상세정보"
                  disabled={
                    permissions.view
                      ? infomation3.workType == "N"
                        ? true
                        : false
                      : true
                  }
                >
                  <GridContainer>
                    <ExcelExport
                      data={mainDataResult4_1.data}
                      ref={(exporter) => {
                        _export4_1 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: webheight4_1 }}
                        data={process(
                          mainDataResult4_1.data.map((row) => ({
                            ...row,
                            [SELECTED_FIELD]:
                              selectedState4_1[idGetter4_1(row)],
                          })),
                          mainDataState4_1
                        )}
                        {...mainDataState4_1}
                        onDataStateChange={onMainDataStateChange4_1}
                        //선택 기능
                        dataItemKey={DATA_ITEM_KEY4_1}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onSelectionChange4_1}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={mainDataResult4_1.total}
                        skip={page4_1.skip}
                        take={page4_1.take}
                        pageable={true}
                        onPageChange={pageChange4_1}
                        //정렬기능
                        sortable={true}
                        onSortChange={onMainSortChange4_1}
                        //컬럼순서조정
                        reorderable={true}
                        //컬럼너비조정
                        resizable={true}
                      >
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList4_1"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
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
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : dateField.includes(item.fieldName)
                                        ? DateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell4_1
                                        : numberField2.includes(item.fieldName)
                                        ? gridSumQtyFooterCell4_1
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
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="신용카드관리"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>신용카드단축코드</th>
                  <td>
                    <Input
                      name="creditcd"
                      type="text"
                      value={filters5.creditcd}
                      onChange={filterInputChange5}
                    />
                  </td>
                  <th>결제은행</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={filters5.custcd}
                      onChange={filterInputChange5}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick9}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>결제은행명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters5.custnm}
                      onChange={filterInputChange5}
                    />
                  </td>
                </tr>
                <tr>
                  <th>신용카드번호</th>
                  <td>
                    <Input
                      name="creditnum"
                      type="text"
                      value={filters5.creditnum}
                      onChange={filterInputChange5}
                    />
                  </td>
                  <th>신용카드구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="creditdiv"
                        value={filters5.creditdiv}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange5}
                      />
                    )}
                  </td>
                  <th>법인개인구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="cordiv"
                        value={filters5.cordiv}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange5}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>신용카드명</th>
                  <td>
                    <Input
                      name="creditnm"
                      type="text"
                      value={filters5.creditnm}
                      onChange={filterInputChange5}
                    />
                  </td>
                  <th>사용유무</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="useyn3"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>비고</th>
                  <td>
                    <Input
                      name="remark"
                      type="text"
                      value={filters5.remark}
                      onChange={filterInputChange5}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          {isMobile ? (
            <></>
          ) : (
            <>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>요약정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick5}
                      themeColor={"primary"}
                      icon="file-add"
                      disabled={permissions.save ? false : true}
                    >
                      생성
                    </Button>
                    <Button
                      onClick={onDeleteClick5}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="delete"
                      disabled={permissions.delete ? false : true}
                    >
                      삭제
                    </Button>
                    <Button
                      onClick={onSaveClick5}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      disabled={permissions.save ? false : true}
                    >
                      저장
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult5.data}
                  ref={(exporter) => {
                    _export5 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: webheight5 }}
                    data={process(
                      mainDataResult5.data.map((row) => ({
                        ...row,
                        creditdiv: creditdivListData.find(
                          (item: any) => item.sub_code == row.creditdiv
                        )?.code_name,
                        cordiv: cordivListData.find(
                          (item: any) => item.sub_code == row.cordiv
                        )?.code_name,
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
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList5"]
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
                                  dateField.includes(item.fieldName)
                                    ? DateCell
                                    : checkField.includes(item.fieldName)
                                    ? CheckBoxReadOnlyCell
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
              <TabStrip
                style={{ width: "100%" }}
                selected={tabSelected2}
                onSelect={handleSelectTab2}
                scrollable={isMobile}
              >
                <TabStripTab
                  title="기본정보"
                  disabled={permissions.view ? false : true}
                >
                  <FormBoxWrap border={true} className="FormBoxWrap">
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>신용카드단축코드</th>
                          <td>
                            {infomation5.workType == "N" ? (
                              <Input
                                name="creditcd"
                                type="text"
                                value={infomation5.creditcd}
                                onChange={InputChange5}
                                className="required"
                              />
                            ) : (
                              <Input
                                name="creditcd"
                                type="text"
                                value={infomation5.creditcd}
                                className="readonly"
                              />
                            )}
                          </td>
                          <th>법인개인구분</th>
                          <td>
                            {infomation5.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="cordiv"
                                    value={infomation5.cordiv}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange5}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="cordiv"
                                    value={infomation5.cordiv}
                                    bizComponentId="L_cordiv"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange5}
                                  />
                                )}
                          </td>
                          <th>결제일자</th>
                          <td>
                            <DatePicker
                              name="paydt"
                              value={infomation5.paydt}
                              format="yyyy-MM-dd"
                              onChange={InputChange5}
                              placeholder=""
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>신용카드명</th>
                          <td>
                            <Input
                              name="creditnm"
                              type="text"
                              value={infomation5.creditnm}
                              onChange={InputChange5}
                            />
                          </td>
                          <th>만료일자</th>
                          <td>
                            <DatePicker
                              name="exprdt"
                              value={infomation5.exprdt}
                              format="yyyy-MM-dd"
                              onChange={InputChange5}
                              placeholder=""
                            />
                          </td>
                          <th>업체코드</th>
                          <td>
                            <Input
                              name="custcd"
                              type="text"
                              value={infomation5.custcd}
                              onChange={InputChange5}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onCustWndClick10}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>업체명</th>
                          <td>
                            <Input
                              name="custnm"
                              type="text"
                              value={infomation5.custnm}
                              onChange={InputChange5}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>신용카드번호</th>
                          <td>
                            <Input
                              name="creditnum"
                              type="text"
                              value={infomation5.creditnum}
                              onChange={InputChange5}
                            />
                          </td>
                          <th>담당자</th>
                          <td>
                            {infomation5.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="person"
                                    value={infomation5.person}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange5}
                                    type="new"
                                    textField="user_name"
                                    valueField="user_id"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="person"
                                    value={infomation5.person}
                                    bizComponentId="L_sysUserMaster_001"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange5}
                                    textField="user_name"
                                    valueField="user_id"
                                  />
                                )}
                          </td>
                          <th>결제계좌번호</th>
                          <td colSpan={3}>
                            <Input
                              name="bankacntnum"
                              type="text"
                              value={infomation5.bankacntnum}
                              onChange={InputChange5}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>신용카드구분</th>
                          <td>
                            {infomation5.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionComboBox
                                    name="creditdiv"
                                    value={infomation5.creditdiv}
                                    customOptionData={customOptionData}
                                    changeData={ComboBoxChange5}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentComboBox
                                    name="creditdiv"
                                    value={infomation5.creditdiv}
                                    bizComponentId="L_AC198"
                                    bizComponentData={bizComponentData}
                                    changeData={ComboBoxChange5}
                                  />
                                )}
                          </td>
                          <th>주민등록번호</th>
                          <td>
                            <Input
                              name="repreregno"
                              type="text"
                              value={infomation5.repreregno}
                              onChange={InputChange5}
                            />
                          </td>
                          <th>결제은행</th>
                          <td>
                            <Input
                              name="rcvcustcd"
                              type="text"
                              value={infomation5.rcvcustcd}
                              onChange={InputChange5}
                            />
                            <ButtonInInput>
                              <Button
                                onClick={onCustWndClick11}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>결제은행명</th>
                          <td>
                            <Input
                              name="rcvcustnm"
                              type="text"
                              value={infomation5.rcvcustnm}
                              onChange={InputChange5}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>사용유무</th>
                          <td>
                            {infomation5.workType == "N"
                              ? customOptionData !== null && (
                                  <CustomOptionRadioGroup
                                    name="useyn"
                                    customOptionData={customOptionData}
                                    changeData={RadioChange5}
                                    type="new"
                                  />
                                )
                              : bizComponentData !== null && (
                                  <BizComponentRadioGroup
                                    name="useyn"
                                    value={infomation5.useyn}
                                    bizComponentId="R_USEYN_only"
                                    bizComponentData={bizComponentData}
                                    changeData={RadioChange5}
                                  />
                                )}
                          </td>
                          <th>첨부파일</th>
                          <td>
                            <Input
                              name="files"
                              type="text"
                              value={infomation5.files}
                              className="readonly"
                            />
                            <ButtonInInput>
                              <Button
                                type={"button"}
                                onClick={onAttachmentsWndClick5}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>비고</th>
                          <td colSpan={3}>
                            <Input
                              name="remark"
                              type="text"
                              value={infomation5.remark}
                              onChange={InputChange5}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </TabStripTab>
                <TabStripTab
                  title="상세정보"
                  disabled={
                    permissions.view
                      ? infomation5.workType == "N"
                        ? true
                        : false
                      : true
                  }
                >
                  <GridContainer>
                    <ExcelExport
                      data={mainDataResult5_1.data}
                      ref={(exporter) => {
                        _export5_1 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: webheight5_1 }}
                        data={process(
                          mainDataResult5_1.data.map((row) => ({
                            ...row,
                            [SELECTED_FIELD]:
                              selectedState5_1[idGetter5_1(row)],
                          })),
                          mainDataState5_1
                        )}
                        {...mainDataState5_1}
                        onDataStateChange={onMainDataStateChange5_1}
                        //선택 기능
                        dataItemKey={DATA_ITEM_KEY5_1}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onSelectionChange5_1}
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={mainDataResult5_1.total}
                        skip={page5_1.skip}
                        take={page5_1.take}
                        pageable={true}
                        onPageChange={pageChange5_1}
                        //정렬기능
                        sortable={true}
                        onSortChange={onMainSortChange5_1}
                        //컬럼순서조정
                        reorderable={true}
                        //컬럼너비조정
                        resizable={true}
                      >
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList5_1"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
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
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : dateField.includes(item.fieldName)
                                        ? DateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell5_1
                                        : numberField2.includes(item.fieldName)
                                        ? gridSumQtyFooterCell5_1
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
            </>
          )}
        </TabStripTab>
      </TabStrip>
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
          modal={true}
        />
      )}
      {accountWindowVisible2 && (
        <AccountWindow
          setVisible={setAccountWindowVisible2}
          setData={setAcntData2}
          modal={true}
        />
      )}
      {accountWindowVisible3 && (
        <AccountWindow
          setVisible={setAccountWindowVisible3}
          setData={setAcntData3}
          modal={true}
        />
      )}
      {accountWindowVisible4 && (
        <AccountWindow
          setVisible={setAccountWindowVisible4}
          setData={setAcntData4}
          modal={true}
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={"N"}
          setData={setCustData2}
          modal={true}
        />
      )}
      {custWindowVisible3 && (
        <CustomersWindow
          setVisible={setCustWindowVisible3}
          workType={"N"}
          setData={setCustData3}
          modal={true}
        />
      )}
      {custWindowVisible4 && (
        <CustomersWindow
          setVisible={setCustWindowVisible4}
          workType={"N"}
          setData={setCustData4}
          modal={true}
        />
      )}
      {custWindowVisible5 && (
        <CustomersWindow
          setVisible={setCustWindowVisible5}
          workType={"N"}
          setData={setCustData5}
          modal={true}
        />
      )}
      {custWindowVisible6 && (
        <CustomersWindow
          setVisible={setCustWindowVisible6}
          workType={"N"}
          setData={setCustData6}
          modal={true}
        />
      )}
      {custWindowVisible7 && (
        <CustomersWindow
          setVisible={setCustWindowVisible7}
          workType={"N"}
          setData={setCustData7}
          modal={true}
        />
      )}
      {custWindowVisible8 && (
        <CustomersWindow
          setVisible={setCustWindowVisible8}
          workType={"N"}
          setData={setCustData8}
          modal={true}
        />
      )}
      {custWindowVisible9 && (
        <CustomersWindow
          setVisible={setCustWindowVisible9}
          workType={"N"}
          setData={setCustData9}
          modal={true}
        />
      )}
      {custWindowVisible10 && (
        <CustomersWindow
          setVisible={setCustWindowVisible10}
          workType={"N"}
          setData={setCustData10}
          modal={true}
        />
      )}
      {custWindowVisible11 && (
        <CustomersWindow
          setVisible={setCustWindowVisible11}
          workType={"N"}
          setData={setCustData11}
          modal={true}
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={infomation.attdatnum}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
          modal={true}
        />
      )}
      {attachmentsWindowVisible2 && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible2}
          setData={getAttachmentsData2}
          para={infomation2.attdatnum}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
          modal={true}
        />
      )}
      {attachmentsWindowVisible5 && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible5}
          setData={getAttachmentsData5}
          para={infomation5.attdatnum}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
          modal={true}
        />
      )}
      {excelAttachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setExcelAttachmentsWindowVisible}
          para={"AC_A0050W"} // 그룹코드에 따라 양식 분리
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
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

export default AC_A0050W;
