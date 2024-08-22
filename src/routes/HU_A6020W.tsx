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
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
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
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
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
  UsePermissions,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  getPrsnnum2Query,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import FileViewers from "../components/Viewer/FileViewers";
import LaborerMultiWindow from "../components/Windows/CommonWindows/LaborerMultiWindow";
import LaborerWindow from "../components/Windows/CommonWindows/LaborerWindow";
import { useApi } from "../hooks/api";
import { isFilterHideState, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_A6020W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
var index = 0;

type TdataArr = {
  rowstatus_s: string[];
  dutydt_s: string[];
  prsnnum_s: string[];
  wrkday_s: string[];
  wrktime_s: string[];
  dedtime_s: string[];
  dutytime1_s: string[];
  dutytime2_s: string[];
  dutytime3_s: string[];
  dutytime4_s: string[];
  dutytime5_s: string[];
  monpay_s: string[];
  overtimepay_s: string[];
  notaxpay1_s: string[];
  notaxpay2_s: string[];
  totpayamt_s: string[];
  hirinsu_s: string[];
  pnsamt_s: string[];
  medamt_s: string[];
  agamt_s: string[];
  taxstd_s: string[];
  inctax_s: string[];
  locatax_s: string[];
  totded_s: string[];
  rlpayamt_s: string[];
  startdate_s: string[];
  enddate_s: string[];
  shh_s: string[];
  smm_s: string[];
  ehh_s: string[];
  emm_s: string[];
  daydutydiv_s: string[];
  worklate_s: string[];
  workend_s: string[];
  workout_s: string[];
  dutycd_s: string[];
};

interface IPrsnnum {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY3 = "num";
let temp = 0;
let deletedMainRows: object[] = [];
let targetRowIndex: null | number = null;
const requiredField = ["dutydt", "prsnnum", "shh", "smm", "ehh", "emm"];

const CommandField = ["prsnnum"];
const numberField = [
  "shh",
  "smm",
  "ehh",
  "emm",
  "wrkday",
  "wrktime",
  "dutytime1",
  "worklate",
  "workend",
  "workout",
  "monpay",
  "overtimepay",
  "notaxpay1",
  "taxstd",
  "inctax",
  "locatax",
  "hirinsu",
  "pnsamt",
  "medamt",
  "agamt",
];
const dateField = ["dutydt", "startdate", "enddate"];
const comboField = ["daydutydiv"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  // 사용자
  UseBizComponent("L_HU033", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "daydutydiv" ? "L_HU033" : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};

export const FormContext = createContext<{
  PrsnInfo: TPrsnInfo;
  setPrsnInfo: (d: React.SetStateAction<TPrsnInfo>) => void;
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
  const { setPrsnInfo } = useContext(FormContext);
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

  const [laborerWindowVisible, setlaborerWindowVisible] =
    useState<boolean>(false);

  const onlaborerWndClick = () => {
    if (dataItem["rowstatus"] == "N") {
      setlaborerWindowVisible(true);
    } else {
      alert("사번은 수정이 불가합니다.");
    }
  };

  const setlaborerData = (data: TPrsnInfo) => {
    const {
      abilcd,
      abilnm,
      anlslry,
      dayhirinsurat,
      dayinctax,
      daylocatax,
      daytaxstd,
      dptcd,
      dptnm,
      hirinsuyn,
      medamt,
      meddiv,
      medrat2,
      overtimepay,
      paycd,
      payprovyn,
      pnsamt,
      pnsdiv,
      postcd,
      postnm,
      prsnnm,
      prsnnum,
      regorgdt,
      regorgdtFormat,
      rtrdt,
      rtrdtFormat,
      rtryn,
    } = data;
    setPrsnInfo({
      abilcd,
      abilnm,
      anlslry,
      dayhirinsurat,
      dayinctax,
      daylocatax,
      daytaxstd,
      dptcd,
      dptnm,
      hirinsuyn,
      medamt,
      meddiv,
      medrat2,
      overtimepay,
      paycd,
      payprovyn,
      pnsamt,
      pnsdiv,
      postcd,
      postnm,
      prsnnm,
      prsnnum,
      regorgdt,
      regorgdtFormat,
      rtrdt,
      rtrdtFormat,
      rtryn,
    });
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
          onClick={onlaborerWndClick}
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
      {laborerWindowVisible && (
        <LaborerWindow
          setVisible={setlaborerWindowVisible}
          setData={setlaborerData}
          modal={true}
        />
      )}
    </>
  );
};

type TPrsnInfo = {
  abilcd: string;
  abilnm: string;
  anlslry: number;
  dayhirinsurat: number;
  dayinctax: number;
  daylocatax: number;
  daytaxstd: number;
  dptcd: string;
  dptnm: string;
  hirinsuyn: string;
  medamt: number;
  meddiv: string;
  medrat2: number;
  overtimepay: number;
  paycd: string;
  payprovyn: string;
  pnsamt: number;
  pnsdiv: string;
  postcd: string;
  postnm: string;
  prsnnm: string;
  prsnnum: string;
  regorgdt: string;
  regorgdtFormat: string;
  rtrdt: string;
  rtrdtFormat: string;
  rtryn: string;
};

const defaultPrsnInfo = {
  abilcd: "",
  abilnm: "",
  anlslry: 0,
  dayhirinsurat: 0,
  dayinctax: 0,
  daylocatax: 0,
  daytaxstd: 0,
  dptcd: "",
  dptnm: "",
  hirinsuyn: "",
  medamt: 0,
  meddiv: "",
  medrat2: 0,
  overtimepay: 0,
  paycd: "",
  payprovyn: "",
  pnsamt: 0,
  pnsdiv: "",
  postcd: "",
  postnm: "",
  prsnnm: "",
  prsnnum: "",
  regorgdt: "",
  regorgdtFormat: "",
  rtrdt: "",
  rtrdtFormat: "",
  rtryn: "재직",
};
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const HU_A6020W: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  const [tabSelected, setTabSelected] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".k-tabstrip-items-wrapper");
      height4 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height3 - height4);
        setMobileHeight2(getDeviceHeight(true) - height3 - height4);
        setMobileHeight3(getDeviceHeight(true) - height3 - height4);
        setMobileHeight4(getDeviceHeight(true) - height2 - height3 - height4);
        setWebHeight(getDeviceHeight(true) - height - height3 - height4);
        setWebHeight2(getDeviceHeight(true) - height3 - height4);
        setWebHeight3(getDeviceHeight(true) - height3 - height4);
        setWebHeight4(getDeviceHeight(true) - height3 - height4);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, tabSelected, webheight]);

  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const handleSelectTab = (e: any) => {
    if (isMobile) {
      setIsFilterHideStates(true);
    }
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
      }));
    } else if (e.selected == 2) {
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
    //바뀔때 마다 filter셋팅
    setTabSelected(e.selected);
  };
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

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
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        gubun: defaultOption.find((item: any) => item.id == "gubun")?.valueCode,
        paydt: setDefaultDate(customOptionData, "paydt"),
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        frdt: setDefaultDate(customOptionData, "frdt"),
        isSearch: true,
      }));
    }
  }, [customOptionData]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_HU005",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setpostcdListData(getBizCom(bizComponentData, "L_HU005"));
      setdptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
    }
  }, [bizComponentData]);

  const [PrsnInfo, setPrsnInfo] = useState<TPrsnInfo>(defaultPrsnInfo);

  //FormContext로 받아온 데이터 set
  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            prsnnm: PrsnInfo.prsnnm,
            prsnnum: PrsnInfo.prsnnum,
            dptcd: PrsnInfo.dptcd,
            postcd: PrsnInfo.postcd,
            anlslry: PrsnInfo.anlslry,
            paycd: PrsnInfo.paycd,
            monpay:
              PrsnInfo.paycd == "2"
                ? PrsnInfo.anlslry * 8
                : PrsnInfo.paycd == "3"
                ? PrsnInfo.anlslry
                : 0,
            daytaxstd: PrsnInfo.daytaxstd,
            dayinctax: PrsnInfo.dayinctax,
            dayhirinsurat: PrsnInfo.dayhirinsurat,
            daylocatax: PrsnInfo.daylocatax,
            taxstd:
              (PrsnInfo.paycd == "2"
                ? PrsnInfo.anlslry * 8
                : PrsnInfo.paycd == "3"
                ? PrsnInfo.anlslry
                : 0) - PrsnInfo.daytaxstd,
            inctax:
              ((PrsnInfo.paycd == "2"
                ? PrsnInfo.anlslry * 8
                : PrsnInfo.paycd == "3"
                ? PrsnInfo.anlslry
                : 0) -
                PrsnInfo.daytaxstd) *
              (PrsnInfo.dayinctax / 100),
            locatax:
              (((PrsnInfo.paycd == "2"
                ? PrsnInfo.anlslry * 8
                : PrsnInfo.paycd == "3"
                ? PrsnInfo.anlslry
                : 0) -
                PrsnInfo.daytaxstd) *
                (PrsnInfo.dayinctax / 100)) /
              100,
            overtimepay_1: PrsnInfo.overtimepay,
            payprovyn: PrsnInfo.payprovyn,
            hirinsuyn: PrsnInfo.hirinsuyn,
            hirinsu:
              PrsnInfo.hirinsuyn == "Y"
                ? (PrsnInfo.paycd == "2"
                    ? PrsnInfo.anlslry * 8
                    : PrsnInfo.paycd == "3"
                    ? PrsnInfo.anlslry
                    : 0) *
                  (PrsnInfo.dayhirinsurat / 100)
                : 0,
            pnsamt: PrsnInfo.pnsdiv == "Y" ? PrsnInfo.pnsamt : 0,
            medamt: PrsnInfo.meddiv == "Y" ? PrsnInfo.medamt : 0,
            agamt: PrsnInfo.meddiv == "Y" ? PrsnInfo.medrat2 : 0,
            dutydt: convertDateToStr(new Date()),
            startdate: convertDateToStr(new Date()),
            enddate: convertDateToStr(new Date()),
            rowstatus: item.rowstatus == "N" ? "N" : "U",
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
  }, [PrsnInfo]);

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "일용직일근태";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    if (tabSelected == 0) {
      try {
        if (
          convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
          convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
          convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
          convertDateToStr(filters.frdt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "HU_A6020W_001");
        } else if (
          convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
          convertDateToStr(filters.todt).substring(6, 8) > "31" ||
          convertDateToStr(filters.todt).substring(6, 8) < "01" ||
          convertDateToStr(filters.todt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "HU_A6020W_001");
        } else {
          setFilters((prev) => ({
            ...prev,
            isSearch: true,
          }));
        }
      } catch (e) {
        alert(e);
      }
    } else if (tabSelected == 1) {
      try {
        if (convertDateToStr(filters2.yyyymm).substring(0, 4) < "1997") {
          throw findMessage(messagesData, "HU_A6020W_001");
        } else if (
          convertDateToStr(filters2.paydt).substring(0, 4) < "1997" ||
          convertDateToStr(filters2.paydt).substring(6, 8) > "31" ||
          convertDateToStr(filters2.paydt).substring(6, 8) < "01" ||
          convertDateToStr(filters2.paydt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "HU_A6020W_001");
        } else if (
          filters2.gubun == null ||
          filters2.gubun == "" ||
          filters2.gubun == undefined
        ) {
          throw findMessage(messagesData, "HU_A6020W_001");
        } else {
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
          }));
        }
      } catch (e) {
        alert(e);
      }
    } else if (tabSelected == 2) {
      try {
        if (convertDateToStr(filters3.frdt).substring(0, 4) < "1997") {
          throw findMessage(messagesData, "HU_A6020W_001");
        } else {
          setFilters3((prev) => ({
            ...prev,
            isSearch: true,
          }));
          if (swiper && isMobile) {
            swiper.slideTo(0);
          }
        }
      } catch (e) {
        alert(e);
      }
    }
  };

  const [url, setUrl] = useState<string>("");
  const [url2, setUrl2] = useState<string>("");
  const [laborerWindowVisible, setlaborerWindowVisible] =
    useState<boolean>(false);
  const [laborerWindowVisible2, setlaborerWindowVisible2] =
    useState<boolean>(false);
  const [laborerWindowMultiVisible, setlaborerWindowMultiVisible] =
    useState<boolean>(false);

  const onlaborerWndClick = () => {
    setlaborerWindowVisible(true);
  };
  const onlaborerWndClick2 = () => {
    setlaborerWindowVisible2(true);
  };
  const onlaborerWndMultiClick = () => {
    setlaborerWindowMultiVisible(true);
  };
  const setlaborerData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };
  const setlaborerData2 = (data: IPrsnnum) => {
    setFilters3((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    frdt: new Date(),
    todt: new Date(),
    prsnnum: "",
    prsnnm: "",
    inyrmm: new Date(),
    payyrmm: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    reyrmm: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    yyyymm: new Date(),
    paydt: new Date(),
    gubun: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    location: sessionLocation,
    prsnnum: "",
    prsnnm: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3_1, setFilters3_1] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    prsnnum: "",
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
  const filterInputChange2 = (e: any) => {
    const { value, name } = e.target;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filterInputChange3 = (e: any) => {
    const { value, name } = e.target;

    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filterComboBoxChange2 = (e: any) => {
    const { name, value } = e;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filterComboBoxChange3 = (e: any) => {
    const { name, value } = e;

    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});

  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A6020W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_prsnnm": filters.prsnnm,
        "@p_prsnnum": filters.prsnnum,
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

  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    let data2: any;

    setLoading(true);
    const parameters = {
      para: "list?emmId=HU_A6020_1",
    };
    const parameters2 = {
      para: "list?emmId=HU_A6020_2",
    };
    try {
      data = await processApi<any>(
        "excel-view-mail",
        filters2.gubun == "1"
          ? parameters
          : filters2.gubun == "2"
          ? parameters2
          : ""
      );
    } catch (error) {
      data = null;
    }

    if (data == null) {
      setUrl("");
    } else {
      if (data.RowCount > 0) {
        const rows = data.Rows;

        const parameters2 = {
          para: "document-json?id=" + rows[0].document_id,
          "@p_orgdiv": filters2.orgdiv,
          "@p_yyyymm": convertDateToStr(filters2.yyyymm).substring(0, 6),
          "@p_paydt": convertDateToStr(filters2.paydt),
        };
        try {
          data2 = await processApi<any>("excel-view", parameters2);
        } catch (error) {
          data2 = null;
        }
        if (data2 !== null) {
          const byteCharacters = atob(data2.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: "application/pdf",
          });
          setUrl(URL.createObjectURL(blob));
        } else {
          setUrl("");
        }
      } else {
        console.log("[에러발생]");
        console.log(data);
      }
    }

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
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A6020W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": "USER",
        "@p_orgdiv": filters3.orgdiv,
        "@p_location": filters3.location,
        "@p_frdt": convertDateToStr(filters3.frdt).substring(0, 6),
        "@p_todt": "",
        "@p_prsnnm": filters3.prsnnm,
        "@p_prsnnum": filters3.prsnnum,
        "@p_find_row_value": "",
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

      setMainDataResult3({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
        setFilters3_1((prev) => ({
          ...prev,
          prsnnum: rows[0].prsnnum,
          isSearch: true,
        }));
      } else {
        setUrl2("");
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
    let data2: any;

    setLoading(true);
    const parameters = {
      para: "list?emmId=HU_A6020_3",
    };

    try {
      data = await processApi<any>("excel-view-mail", parameters);
    } catch (error) {
      data = null;
    }

    if (data == null) {
      setUrl2("");
    } else {
      if (data.RowCount > 0) {
        const rows = data.Rows;

        const parameters2 = {
          para: "document-json?id=" + rows[0].document_id,
          "@p_orgdiv": filters3_1.orgdiv,
          "@p_prsnnum": filters3_1.prsnnum,
          "@p_dutydt": convertDateToStr(filters3.frdt).substring(0, 6),
        };
        try {
          data2 = await processApi<any>("excel-view", parameters2);
        } catch (error) {
          data2 = null;
        }
        if (data2 !== null) {
          const byteCharacters = atob(data2.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: "application/pdf",
          });
          setUrl2(URL.createObjectURL(blob));
        } else {
          setUrl2("");
        }
      } else {
        console.log("[에러발생]");
        console.log(data);
      }
    }

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
  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, bizComponentData, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters3.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({
        ...prev,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      filters3_1.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3_1);
      setFilters3_1((prev) => ({
        ...prev,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3_1(deepCopiedFilters);
    }
  }, [filters3_1, permissions, bizComponentData, customOptionData]);

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };
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

  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult3.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainSelectionChange3 = (event: GridSelectionChangeEvent) => {
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
      prsnnum: selectedRowData.prsnnum,
      isSearch: true,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));
    setPage({
      ...event.page,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));
    setPage3({
      ...event.page,
    });
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

    if (dataItem.rowstatus != "N" && field == "dutydt") {
      valid = false;
    }

    if (
      field != "rowstatus" &&
      field != "prsnnm" &&
      field != "postcd" &&
      field != "dptcd" &&
      valid == true &&
      field != "data1" &&
      field != "data2" &&
      field != "data3"
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
      } else if (editedField == "wrktime") {
        const newData = mainDataResult.data.map((item: any) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                monpay:
                  item.paycd == "2"
                    ? item.wrktime * item.anlslry
                    : item.paycd == "3"
                    ? item.anlslry
                    : item.monpay,
                taxstd:
                  (item.paycd == "2"
                    ? item.wrktime * item.anlslry
                    : item.paycd == "3"
                    ? item.anlslry
                    : item.monpay) +
                    item.overtimepay -
                    item.daytaxstd >
                  0
                    ? (item.paycd == "2"
                        ? item.wrktime * item.anlslry
                        : item.paycd == "3"
                        ? item.anlslry
                        : item.monpay) +
                      item.overtimepay -
                      item.daytaxstd
                    : 0,
                hirinsu:
                  item.hirinsuyn == "Y"
                    ? Math.floor(
                        (((item.paycd == "2"
                          ? item.wrktime * item.anlslry
                          : item.paycd == "3"
                          ? item.anlslry
                          : item.monpay) +
                          item.overtimepay) *
                          item.dayhirinsurat) /
                          100 /
                          10
                      ) * 10
                    : item.hirinsu,
                inctax:
                  Math.floor(
                    (((item.paycd == "2"
                      ? item.wrktime * item.anlslry
                      : item.paycd == "3"
                      ? item.anlslry
                      : item.monpay) +
                      item.overtimepay -
                      item.daytaxstd >
                    0
                      ? (item.paycd == "2"
                          ? item.wrktime * item.anlslry
                          : item.paycd == "3"
                          ? item.anlslry
                          : item.monpay) +
                        item.overtimepay -
                        item.daytaxstd
                      : 0) *
                      (item.dayinctax / 100)) /
                      10
                  ) * 10,
                locatax:
                  Math.floor(
                    (Math.floor(
                      (((item.paycd == "2"
                        ? item.wrktime * item.anlslry
                        : item.paycd == "3"
                        ? item.anlslry
                        : item.monpay) +
                        item.overtimepay -
                        item.daytaxstd >
                      0
                        ? (item.paycd == "2"
                            ? item.wrktime * item.anlslry
                            : item.paycd == "3"
                            ? item.anlslry
                            : item.monpay) +
                          item.overtimepay -
                          item.daytaxstd
                        : 0) *
                        (item.dayinctax / 100)) /
                        10
                    ) *
                      10 *
                      (item.daylocatax / 100)) /
                      100
                  ) * 10,
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
      } else if (editedField == "monpay") {
        const newData = mainDataResult.data.map((item: any) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                taxstd:
                  item.monpay + item.overtimepay - item.daytaxstd > 0
                    ? item.monpay + item.overtimepay - item.daytaxstd
                    : 0,
                hirinsu:
                  item.hirinsuyn == "Y"
                    ? Math.floor(
                        ((item.monpay + item.overtimepay) *
                          item.dayhirinsurat) /
                          100 /
                          10
                      ) * 10
                    : item.hirinsu,
                inctax:
                  Math.floor(
                    ((item.monpay + item.overtimepay - item.daytaxstd > 0
                      ? item.monpay + item.overtimepay - item.daytaxstd
                      : 0) *
                      (item.dayinctax / 100)) /
                      10
                  ) * 10,
                locatax:
                  Math.floor(
                    (Math.floor(
                      ((item.monpay + item.overtimepay - item.daytaxstd > 0
                        ? item.monpay + item.overtimepay - item.daytaxstd
                        : 0) *
                        (item.dayinctax / 100)) /
                        10
                    ) *
                      10 *
                      (item.daylocatax / 100)) /
                      100
                  ) * 10,
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
      } else if (editedField == "taxstd") {
        const newData = mainDataResult.data.map((item: any) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                inctax:
                  Math.floor((item.taxstd * (item.dayinctax / 100)) / 10) * 10,
                locatax:
                  Math.floor(
                    (Math.floor((item.taxstd * (item.dayinctax / 100)) / 10) *
                      10 *
                      (item.daylocatax / 100)) /
                      100
                  ) * 10,
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
      } else if (editedField == "inctax") {
        const newData = mainDataResult.data.map((item: any) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                locatax:
                  Math.floor((item.inctax * (item.daylocatax / 100)) / 100) *
                  10,
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
      } else if (editedField == "dutytime1") {
        const newData = mainDataResult.data.map((item: any) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                overtimepay:
                  item.payprovyn == "1"
                    ? item.dutytime1 * item.overtimepay_1
                    : item.payprovyn == "2"
                    ? item.overtimepay_1
                    : item.overtimepay,
                taxstd:
                  item.monpay +
                    (item.payprovyn == "1"
                      ? item.dutytime1 * item.overtimepay_1
                      : item.payprovyn == "2"
                      ? item.overtimepay_1
                      : item.overtimepay) -
                    item.daytaxstd >
                  0
                    ? item.monpay +
                      (item.payprovyn == "1"
                        ? item.dutytime1 * item.overtimepay_1
                        : item.payprovyn == "2"
                        ? item.overtimepay_1
                        : item.overtimepay) -
                      item.daytaxstd
                    : 0,
                inctax:
                  Math.floor(
                    ((item.monpay +
                      (item.payprovyn == "1"
                        ? item.dutytime1 * item.overtimepay_1
                        : item.payprovyn == "2"
                        ? item.overtimepay_1
                        : item.overtimepay) -
                      item.daytaxstd >
                    0
                      ? item.monpay +
                        (item.payprovyn == "1"
                          ? item.dutytime1 * item.overtimepay_1
                          : item.payprovyn == "2"
                          ? item.overtimepay_1
                          : item.overtimepay) -
                        item.daytaxstd
                      : 0) *
                      (item.dayinctax / 100)) /
                      10
                  ) * 10,
                locatax:
                  Math.floor(
                    (Math.floor(
                      ((item.monpay +
                        (item.payprovyn == "1"
                          ? item.dutytime1 * item.overtimepay_1
                          : item.payprovyn == "2"
                          ? item.overtimepay_1
                          : item.overtimepay) -
                        item.daytaxstd >
                      0
                        ? item.monpay +
                          (item.payprovyn == "1"
                            ? item.dutytime1 * item.overtimepay_1
                            : item.payprovyn == "2"
                            ? item.overtimepay_1
                            : item.overtimepay) -
                          item.daytaxstd
                        : 0) *
                        (item.dayinctax / 100)) /
                        10
                    ) *
                      10 *
                      (item.daylocatax / 100)) /
                      100
                  ) * 10,
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
      } else if (editedField == "overtimepay") {
        const newData = mainDataResult.data.map((item: any) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                taxstd:
                  item.monpay + item.overtimepay - item.daytaxstd > 0
                    ? item.monpay + item.overtimepay - item.daytaxstd
                    : 0,
                inctax:
                  Math.floor(
                    ((item.monpay + item.overtimepay - item.daytaxstd > 0
                      ? item.monpay + item.overtimepay - item.daytaxstd
                      : 0) *
                      (item.dayinctax / 100)) /
                      10
                  ) * 10,
                locatax:
                  Math.floor(
                    (Math.floor(
                      ((item.monpay + item.overtimepay - item.daytaxstd > 0
                        ? item.monpay + item.overtimepay - item.daytaxstd
                        : 0) *
                        (item.dayinctax / 100)) /
                        10
                    ) *
                      10 *
                      (item.daylocatax / 100)) /
                      100
                  ) * 10,
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

  const fetchPrsnnumData = async (prsnnum: string) => {
    if (!permissions.view) return;
    if (prsnnum == "") return;
    let data: any;
    let prsnnumInfo: any = null;

    const queryStr = getPrsnnum2Query(prsnnum);
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

  const onAddClick = async () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    setLoading(true);
    let data: any;

    let queryStr = `SELECT LEFT(work_strtime,2) as shh,
    RIGHT(work_strtime,2) as smm,
    LEFT(work_endtime,2) as ehh,
    RIGHT(work_endtime,2) as emm
FROM HU072T WHERE paycd = '4'`;
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

      if (data.tables[0].RowCount > 0) {
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          agamt: 0,
          anlslry: 0,
          data1: ":",
          data2: "~",
          data3: ":",
          daydutydiv: "",
          dayhirinsurat: 0,
          dayinctax: 0,
          daylocatax: 0,
          daytaxstd: 0,
          dedtime: 0,
          dptcd: "",
          dutycd: "",
          dutydt: convertDateToStr(new Date()),
          dutytime1: 0,
          dutytime2: 0,
          dutytime3: 0,
          dutytime4: 0,
          dutytime5: 0,
          ehh: rows[0].ehh,
          emm: rows[0].emm,
          enddate: convertDateToStr(new Date()),
          hirinsu: 0,
          hirinsuyn: "Y",
          inctax: 0,
          inyrmm: convertDateToStr(filters.inyrmm).substring(0, 6),
          locatax: 0,
          medamt: 0,
          medamt_1: 0,
          meddiv: "Y",
          medrat2_1: 0,
          monpay: 0,
          notaxpay1: 0,
          notaxpay2: 0,
          orgdiv: sessionOrgdiv,
          overtimepay: 0,
          overtimepay_1: 0,
          paycd: "",
          payprovyn: "",
          payyrmm: convertDateToStr(filters.payyrmm).substring(0, 6),
          pnsamt: 0,
          pnsamt_1: 0,
          pnsdiv: "Y",
          postcd: "",
          prsnnm: "",
          prsnnum: "",
          reyrmm: convertDateToStr(filters.reyrmm).substring(0, 6),
          rlpayamt: 0,
          shh: rows[0].shh,
          smm: rows[0].smm,
          startdate: convertDateToStr(new Date()),
          taxstd: 0,
          totded: 0,
          totpayamt: 0,
          workend: 0,
          worklate: 0,
          workout: 0,
          wrkday: 1,
          wrktime: 8,
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
      } else {
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          agamt: 0,
          anlslry: 0,
          data1: ":",
          data2: "~",
          data3: ":",
          daydutydiv: "",
          dayhirinsurat: 0,
          dayinctax: 0,
          daylocatax: 0,
          daytaxstd: 0,
          dedtime: 0,
          dptcd: "",
          dutycd: "",
          dutydt: convertDateToStr(new Date()),
          dutytime1: 0,
          dutytime2: 0,
          dutytime3: 0,
          dutytime4: 0,
          dutytime5: 0,
          ehh: "17",
          emm: "30",
          enddate: convertDateToStr(new Date()),
          hirinsu: 0,
          hirinsuyn: "Y",
          inctax: 0,
          inyrmm: convertDateToStr(filters.inyrmm).substring(0, 6),
          locatax: 0,
          medamt: 0,
          medamt_1: 0,
          meddiv: "Y",
          medrat2_1: 0,
          monpay: 0,
          notaxpay1: 0,
          notaxpay2: 0,
          orgdiv: sessionOrgdiv,
          overtimepay: 0,
          overtimepay_1: 0,
          paycd: "",
          payprovyn: "",
          payyrmm: convertDateToStr(filters.payyrmm).substring(0, 6),
          pnsamt: 0,
          pnsamt_1: 0,
          pnsdiv: "Y",
          postcd: "",
          prsnnm: "",
          prsnnum: "",
          reyrmm: convertDateToStr(filters.reyrmm).substring(0, 6),
          rlpayamt: 0,
          shh: "08",
          smm: "30",
          startdate: convertDateToStr(new Date()),
          taxstd: 0,
          totded: 0,
          totpayamt: 0,
          workend: 0,
          worklate: 0,
          workout: 0,
          wrkday: 1,
          wrktime: 8,
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
      }
    }
    setLoading(false);
  };

  const setLaborerMultiData = async (datas: any[]) => {
    setLoading(true);
    let data: any;

    let queryStr = `SELECT LEFT(work_strtime,2) as shh,
    RIGHT(work_strtime,2) as smm,
    LEFT(work_endtime,2) as ehh,
    RIGHT(work_endtime,2) as emm
FROM HU072T WHERE paycd = '4'`;
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

      if (data.tables[0].RowCount > 0) {
        datas.map((itemData: any) => {
          mainDataResult.data.map((item) => {
            if (item.num > temp) {
              temp = item.num;
            }
          });
          const newDataItem = {
            [DATA_ITEM_KEY]: ++temp,
            agamt: itemData.meddiv == "Y" ? itemData.medrat2 : 0,
            anlslry: itemData.anlslry,
            data1: ":",
            data2: "~",
            data3: ":",
            daydutydiv: "",
            dayhirinsurat: itemData.dayhirinsurat,
            dayinctax: itemData.dayinctax,
            daylocatax: itemData.daylocatax,
            daytaxstd: itemData.daytaxstd,
            dedtime: 0,
            dptcd: itemData.dptcd,
            dutycd: "",
            dutydt: convertDateToStr(new Date()),
            dutytime1: 0,
            dutytime2: 0,
            dutytime3: 0,
            dutytime4: 0,
            dutytime5: 0,
            ehh: rows[0].ehh,
            emm: rows[0].emm,
            enddate: convertDateToStr(new Date()),
            hirinsu:
              itemData.hirinsuyn == "Y"
                ? (itemData.paycd == "2"
                    ? itemData.anlslry * 8
                    : itemData.paycd == "3"
                    ? itemData.anlslry
                    : 0) *
                  (itemData.dayhirinsurat / 100)
                : 0,
            hirinsuyn: itemData.hirinsuyn,
            inctax:
              ((itemData.paycd == "2"
                ? itemData.anlslry * 8
                : itemData.paycd == "3"
                ? itemData.anlslry
                : 0) -
                itemData.daytaxstd) *
              (itemData.dayinctax / 100),
            inyrmm: convertDateToStr(filters.inyrmm).substring(0, 6),
            locatax:
              (((itemData.paycd == "2"
                ? itemData.anlslry * 8
                : itemData.paycd == "3"
                ? itemData.anlslry
                : 0) -
                itemData.daytaxstd) *
                (itemData.dayinctax / 100)) /
              100,
            medamt: itemData.meddiv == "Y" ? itemData.medamt : 0,
            medamt_1: 0,
            meddiv: itemData.meddiv,
            medrat2_1: 0,
            monpay:
              itemData.paycd == "2"
                ? itemData.anlslry * 8
                : itemData.paycd == "3"
                ? itemData.anlslry
                : 0,
            notaxpay1: 0,
            notaxpay2: 0,
            orgdiv: sessionOrgdiv,
            overtimepay: 0,
            overtimepay_1: itemData.overtimepay,
            paycd: itemData.paycd,
            payprovyn: itemData.payprovyn,
            payyrmm: convertDateToStr(filters.payyrmm).substring(0, 6),
            pnsamt: itemData.pnsdiv == "Y" ? itemData.pnsamt : 0,
            pnsamt_1: 0,
            pnsdiv: itemData.pnsdiv,
            postcd: itemData.postcd,
            prsnnm: itemData.prsnnm,
            prsnnum: itemData.prsnnum,
            reyrmm: convertDateToStr(filters.reyrmm).substring(0, 6),
            rlpayamt: 0,
            shh: rows[0].shh,
            smm: rows[0].smm,
            startdate: convertDateToStr(new Date()),
            taxstd:
              (itemData.paycd == "2"
                ? itemData.anlslry * 8
                : itemData.paycd == "3"
                ? itemData.anlslry
                : 0) - itemData.daytaxstd,
            totded: 0,
            totpayamt: 0,
            workend: 0,
            worklate: 0,
            workout: 0,
            wrkday: 1,
            wrktime: 8,
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
      } else {
        datas.map((itemData: any) => {
          mainDataResult.data.map((item) => {
            if (item.num > temp) {
              temp = item.num;
            }
          });
          const newDataItem = {
            [DATA_ITEM_KEY]: ++temp,
            agamt: itemData.meddiv == "Y" ? itemData.medrat2 : 0,
            anlslry: itemData.anlslry,
            data1: ":",
            data2: "~",
            data3: ":",
            daydutydiv: "",
            dayhirinsurat: itemData.dayhirinsurat,
            dayinctax: itemData.dayinctax,
            daylocatax: itemData.daylocatax,
            daytaxstd: itemData.daytaxstd,
            dedtime: 0,
            dptcd: itemData.dptcd,
            dutycd: "",
            dutydt: convertDateToStr(new Date()),
            dutytime1: 0,
            dutytime2: 0,
            dutytime3: 0,
            dutytime4: 0,
            dutytime5: 0,
            ehh: "17",
            emm: "30",
            enddate: convertDateToStr(new Date()),
            hirinsu:
              itemData.hirinsuyn == "Y"
                ? (itemData.paycd == "2"
                    ? itemData.anlslry * 8
                    : itemData.paycd == "3"
                    ? itemData.anlslry
                    : 0) *
                  (itemData.dayhirinsurat / 100)
                : 0,
            hirinsuyn: itemData.hirinsuyn,
            inctax:
              ((itemData.paycd == "2"
                ? itemData.anlslry * 8
                : itemData.paycd == "3"
                ? itemData.anlslry
                : 0) -
                itemData.daytaxstd) *
              (itemData.dayinctax / 100),
            inyrmm: convertDateToStr(filters.inyrmm).substring(0, 6),
            locatax:
              (((itemData.paycd == "2"
                ? itemData.anlslry * 8
                : itemData.paycd == "3"
                ? itemData.anlslry
                : 0) -
                itemData.daytaxstd) *
                (itemData.dayinctax / 100)) /
              100,
            medamt: itemData.meddiv == "Y" ? itemData.medamt : 0,
            medamt_1: 0,
            meddiv: itemData.meddiv,
            medrat2_1: 0,
            monpay:
              itemData.paycd == "2"
                ? itemData.anlslry * 8
                : itemData.paycd == "3"
                ? itemData.anlslry
                : 0,
            notaxpay1: 0,
            notaxpay2: 0,
            orgdiv: sessionOrgdiv,
            overtimepay: 0,
            overtimepay_1: itemData.overtimepay,
            paycd: itemData.paycd,
            payprovyn: itemData.payprovyn,
            payyrmm: convertDateToStr(filters.payyrmm).substring(0, 6),
            pnsamt: itemData.pnsdiv == "Y" ? itemData.pnsamt : 0,
            pnsamt_1: 0,
            pnsdiv: itemData.pnsdiv,
            postcd: itemData.postcd,
            prsnnm: itemData.prsnnm,
            prsnnum: itemData.prsnnum,
            reyrmm: convertDateToStr(filters.reyrmm).substring(0, 6),
            rlpayamt: 0,
            shh: "08",
            smm: "30",
            startdate: convertDateToStr(new Date()),
            taxstd:
              (itemData.paycd == "2"
                ? itemData.anlslry * 8
                : itemData.paycd == "3"
                ? itemData.anlslry
                : 0) - itemData.daytaxstd,
            totded: 0,
            totpayamt: 0,
            workend: 0,
            worklate: 0,
            workout: 0,
            wrkday: 1,
            wrktime: 8,
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
    }
    setLoading(false);
  };

  const onSaveClick = () => {
    if (!permissions.save) return;
    let valid = true;
    let valid2 = true;
    try {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.map((item) => {
        if (
          item.orgdiv == undefined ||
          item.orgdiv == null ||
          item.orgdiv == ""
        ) {
          valid = false;
        }
        if (
          item.dutydt == undefined ||
          item.dutydt == null ||
          item.dutydt == ""
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

      if (valid2 == true) {
        if (valid == true) {
          if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

          let dataArr: TdataArr = {
            rowstatus_s: [],
            dutydt_s: [],
            prsnnum_s: [],
            wrkday_s: [],
            wrktime_s: [],
            dedtime_s: [],
            dutytime1_s: [],
            dutytime2_s: [],
            dutytime3_s: [],
            dutytime4_s: [],
            dutytime5_s: [],
            monpay_s: [],
            overtimepay_s: [],
            notaxpay1_s: [],
            notaxpay2_s: [],
            totpayamt_s: [],
            hirinsu_s: [],
            pnsamt_s: [],
            medamt_s: [],
            agamt_s: [],
            taxstd_s: [],
            inctax_s: [],
            locatax_s: [],
            totded_s: [],
            rlpayamt_s: [],
            startdate_s: [],
            enddate_s: [],
            shh_s: [],
            smm_s: [],
            ehh_s: [],
            emm_s: [],
            daydutydiv_s: [],
            worklate_s: [],
            workend_s: [],
            workout_s: [],
            dutycd_s: [],
          };
          dataItem.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              dutydt = "",
              prsnnum = "",
              wrkday = "",
              wrktime = "",
              dedtime = "",
              dutytime1 = "",
              dutytime2 = "",
              dutytime3 = "",
              dutytime4 = "",
              dutytime5 = "",
              monpay = "",
              overtimepay = "",
              notaxpay1 = "",
              notaxpay2 = "",
              totpayamt = "",
              hirinsu = "",
              pnsamt = "",
              medamt = "",
              agamt = "",
              taxstd = "",
              inctax = "",
              locatax = "",
              totded = "",
              rlpayamt = "",
              startdate = "",
              enddate = "",
              shh = "",
              smm = "",
              ehh = "",
              emm = "",
              daydutydiv = "",
              worklate = "",
              workend = "",
              workout = "",
              dutycd = "",
            } = item;
            dataArr.rowstatus_s.push(rowstatus);
            dataArr.dutydt_s.push(dutydt == "99991231" ? "" : dutydt);
            dataArr.prsnnum_s.push(prsnnum);
            dataArr.wrkday_s.push(wrkday);
            dataArr.wrktime_s.push(wrktime);
            dataArr.dedtime_s.push(dedtime);
            dataArr.dutytime1_s.push(dutytime1);
            dataArr.dutytime2_s.push(dutytime2);
            dataArr.dutytime3_s.push(dutytime3);
            dataArr.dutytime4_s.push(dutytime4);
            dataArr.dutytime5_s.push(dutytime5);
            dataArr.monpay_s.push(monpay);
            dataArr.overtimepay_s.push(overtimepay);
            dataArr.notaxpay1_s.push(notaxpay1);
            dataArr.notaxpay2_s.push(notaxpay2);
            dataArr.totpayamt_s.push(totpayamt);
            dataArr.hirinsu_s.push(hirinsu);
            dataArr.pnsamt_s.push(pnsamt);
            dataArr.medamt_s.push(medamt);
            dataArr.agamt_s.push(agamt);
            dataArr.taxstd_s.push(taxstd);
            dataArr.inctax_s.push(inctax);
            dataArr.locatax_s.push(locatax);
            dataArr.totded_s.push(totded);
            dataArr.rlpayamt_s.push(rlpayamt);
            dataArr.startdate_s.push(startdate == "99991231" ? "" : startdate);
            dataArr.enddate_s.push(enddate == "99991231" ? "" : enddate);
            dataArr.shh_s.push(shh);
            dataArr.smm_s.push(smm);
            dataArr.ehh_s.push(ehh);
            dataArr.emm_s.push(emm);
            dataArr.daydutydiv_s.push(daydutydiv);
            dataArr.worklate_s.push(worklate);
            dataArr.workend_s.push(workend);
            dataArr.workout_s.push(workout);
            dataArr.dutycd_s.push(dutycd);
          });
          deletedMainRows.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              dutydt = "",
              prsnnum = "",
              wrkday = "",
              wrktime = "",
              dedtime = "",
              dutytime1 = "",
              dutytime2 = "",
              dutytime3 = "",
              dutytime4 = "",
              dutytime5 = "",
              monpay = "",
              overtimepay = "",
              notaxpay1 = "",
              notaxpay2 = "",
              totpayamt = "",
              hirinsu = "",
              pnsamt = "",
              medamt = "",
              agamt = "",
              taxstd = "",
              inctax = "",
              locatax = "",
              totded = "",
              rlpayamt = "",
              startdate = "",
              enddate = "",
              shh = "",
              smm = "",
              ehh = "",
              emm = "",
              daydutydiv = "",
              worklate = "",
              workend = "",
              workout = "",
              dutycd = "",
            } = item;
            dataArr.rowstatus_s.push("D");
            dataArr.dutydt_s.push(dutydt);
            dataArr.prsnnum_s.push(prsnnum);
            dataArr.wrkday_s.push(wrkday);
            dataArr.wrktime_s.push(wrktime);
            dataArr.dedtime_s.push(dedtime);
            dataArr.dutytime1_s.push(dutytime1);
            dataArr.dutytime2_s.push(dutytime2);
            dataArr.dutytime3_s.push(dutytime3);
            dataArr.dutytime4_s.push(dutytime4);
            dataArr.dutytime5_s.push(dutytime5);
            dataArr.monpay_s.push(monpay);
            dataArr.overtimepay_s.push(overtimepay);
            dataArr.notaxpay1_s.push(notaxpay1);
            dataArr.notaxpay2_s.push(notaxpay2);
            dataArr.totpayamt_s.push(totpayamt);
            dataArr.hirinsu_s.push(hirinsu);
            dataArr.pnsamt_s.push(pnsamt);
            dataArr.medamt_s.push(medamt);
            dataArr.agamt_s.push(agamt);
            dataArr.taxstd_s.push(taxstd);
            dataArr.inctax_s.push(inctax);
            dataArr.locatax_s.push(locatax);
            dataArr.totded_s.push(totded);
            dataArr.rlpayamt_s.push(rlpayamt);
            dataArr.startdate_s.push(startdate);
            dataArr.enddate_s.push(enddate);
            dataArr.shh_s.push(shh);
            dataArr.smm_s.push(smm);
            dataArr.ehh_s.push(ehh);
            dataArr.emm_s.push(emm);
            dataArr.daydutydiv_s.push(daydutydiv);
            dataArr.worklate_s.push(worklate);
            dataArr.workend_s.push(workend);
            dataArr.workout_s.push(workout);
            dataArr.dutycd_s.push(dutycd);
          });
          setParaData((prev) => ({
            ...prev,
            workType: "N",
            inyrmm: convertDateToStr(filters.inyrmm),
            payyrmm: convertDateToStr(filters.payyrmm),
            reyrmm: convertDateToStr(filters.reyrmm),
            rowstatus_s: dataArr.rowstatus_s.join("|"),
            dutydt_s: dataArr.dutydt_s.join("|"),
            prsnnum_s: dataArr.prsnnum_s.join("|"),
            wrkday_s: dataArr.wrkday_s.join("|"),
            wrktime_s: dataArr.wrktime_s.join("|"),
            dedtime_s: dataArr.dedtime_s.join("|"),
            dutytime1_s: dataArr.dutytime1_s.join("|"),
            dutytime2_s: dataArr.dutytime2_s.join("|"),
            dutytime3_s: dataArr.dutytime3_s.join("|"),
            dutytime4_s: dataArr.dutytime4_s.join("|"),
            dutytime5_s: dataArr.dutytime5_s.join("|"),
            monpay_s: dataArr.monpay_s.join("|"),
            overtimepay_s: dataArr.overtimepay_s.join("|"),
            notaxpay1_s: dataArr.notaxpay1_s.join("|"),
            notaxpay2_s: dataArr.notaxpay2_s.join("|"),
            totpayamt_s: dataArr.totpayamt_s.join("|"),
            hirinsu_s: dataArr.hirinsu_s.join("|"),
            pnsamt_s: dataArr.pnsamt_s.join("|"),
            medamt_s: dataArr.medamt_s.join("|"),
            agamt_s: dataArr.agamt_s.join("|"),
            taxstd_s: dataArr.taxstd_s.join("|"),
            inctax_s: dataArr.inctax_s.join("|"),
            locatax_s: dataArr.locatax_s.join("|"),
            totded_s: dataArr.totded_s.join("|"),
            rlpayamt_s: dataArr.rlpayamt_s.join("|"),
            startdate_s: dataArr.startdate_s.join("|"),
            enddate_s: dataArr.enddate_s.join("|"),
            shh_s: dataArr.shh_s.join("|"),
            smm_s: dataArr.smm_s.join("|"),
            ehh_s: dataArr.ehh_s.join("|"),
            emm_s: dataArr.emm_s.join("|"),
            daydutydiv_s: dataArr.daydutydiv_s.join("|"),
            worklate_s: dataArr.worklate_s.join("|"),
            workend_s: dataArr.workend_s.join("|"),
            workout_s: dataArr.workout_s.join("|"),
            dutycd_s: dataArr.dutycd_s.join("|"),
          }));
        } else {
          alert("필수항목을 채워주세요.");
        }
      } else {
        alert("시간 형식을 맞춰주세요.(ex. 09 )");
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    inyrmm: "",
    payyrmm: "",
    reyrmm: "",
    rowstatus_s: "",
    dutydt_s: "",
    prsnnum_s: "",
    wrkday_s: "",
    wrktime_s: "",
    dedtime_s: "",
    dutytime1_s: "",
    dutytime2_s: "",
    dutytime3_s: "",
    dutytime4_s: "",
    dutytime5_s: "",
    monpay_s: "",
    overtimepay_s: "",
    notaxpay1_s: "",
    notaxpay2_s: "",
    totpayamt_s: "",
    hirinsu_s: "",
    pnsamt_s: "",
    medamt_s: "",
    agamt_s: "",
    taxstd_s: "",
    inctax_s: "",
    locatax_s: "",
    totded_s: "",
    rlpayamt_s: "",
    startdate_s: "",
    enddate_s: "",
    shh_s: "",
    smm_s: "",
    ehh_s: "",
    emm_s: "",
    daydutydiv_s: "",
    worklate_s: "",
    workend_s: "",
    workout_s: "",
    dutycd_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A6020W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_inyrmm": ParaData.inyrmm,
      "@p_payyrmm": ParaData.payyrmm,
      "@p_reyrmm": ParaData.reyrmm,

      "@p_rowstatus_s": ParaData.rowstatus_s,

      "@p_dutydt_s": ParaData.dutydt_s,
      "@p_prsnnum_s": ParaData.prsnnum_s,

      "@p_wrkday_s": ParaData.wrkday_s,
      "@p_wrktime_s": ParaData.wrktime_s,
      "@p_dedtime_s": ParaData.dedtime_s,
      "@p_dutytime1_s": ParaData.dutytime1_s,
      "@p_dutytime2_s": ParaData.dutytime2_s,
      "@p_dutytime3_s": ParaData.dutytime3_s,
      "@p_dutytime4_s": ParaData.dutytime4_s,
      "@p_dutytime5_s": ParaData.dutytime5_s,
      "@p_monpay_s": ParaData.monpay_s,
      "@p_overtimepay_s": ParaData.overtimepay_s,
      "@p_notaxpay1_s": ParaData.notaxpay1_s,
      "@p_notaxpay2_s": ParaData.notaxpay2_s,
      "@p_totpayamt_s": ParaData.totpayamt_s,
      "@p_hirinsu_s": ParaData.hirinsu_s,
      "@p_pnsamt_s": ParaData.pnsamt_s,
      "@p_medamt_s": ParaData.medamt_s,
      "@p_agamt_s": ParaData.agamt_s,
      "@p_taxstd_s": ParaData.taxstd_s,
      "@p_inctax_s": ParaData.inctax_s,
      "@p_locatax_s": ParaData.locatax_s,
      "@p_totded_s": ParaData.totded_s,
      "@p_rlpayamt_s": ParaData.rlpayamt_s,
      "@p_startdate_s": ParaData.startdate_s,
      "@p_enddate_s": ParaData.enddate_s,
      "@p_shh_s": ParaData.shh_s,
      "@p_smm_s": ParaData.smm_s,
      "@p_ehh_s": ParaData.ehh_s,
      "@p_emm_s": ParaData.emm_s,
      "@p_daydutydiv_s ": ParaData.daydutydiv_s,
      "@p_worklate_s": ParaData.worklate_s,
      "@p_workend_s": ParaData.workend_s,
      "@p_workout_s": ParaData.workout_s,
      "@p_dutycd_s": ParaData.dutycd_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A6020W",
    },
  };

  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
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
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        inyrmm: "",
        payyrmm: "",
        reyrmm: "",
        rowstatus_s: "",
        dutydt_s: "",
        prsnnum_s: "",
        wrkday_s: "",
        wrktime_s: "",
        dedtime_s: "",
        dutytime1_s: "",
        dutytime2_s: "",
        dutytime3_s: "",
        dutytime4_s: "",
        dutytime5_s: "",
        monpay_s: "",
        overtimepay_s: "",
        notaxpay1_s: "",
        notaxpay2_s: "",
        totpayamt_s: "",
        hirinsu_s: "",
        pnsamt_s: "",
        medamt_s: "",
        agamt_s: "",
        taxstd_s: "",
        inctax_s: "",
        locatax_s: "",
        totded_s: "",
        rlpayamt_s: "",
        startdate_s: "",
        enddate_s: "",
        shh_s: "",
        smm_s: "",
        ehh_s: "",
        emm_s: "",
        daydutydiv_s: "",
        worklate_s: "",
        workend_s: "",
        workout_s: "",
        dutycd_s: "",
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
    if (ParaData.workType != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={tabSelected == 0 ? exportExcel : undefined}
              permissions={permissions}
              disable={tabSelected == 0 ? false : true}
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
          title="일용직일근태"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>근태일자</th>
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
                        onClick={onlaborerWndClick}
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
                  <th>귀속년월</th>
                  <td>
                    <DatePicker
                      name="inyrmm"
                      value={filters.inyrmm}
                      format="yyyy-MM-dd"
                      className="readonly"
                      placeholder=""
                    />
                  </td>
                  <th>지급년월</th>
                  <td>
                    <DatePicker
                      name="payyrmm"
                      value={filters.payyrmm}
                      format="yyyy-MM-dd"
                      className="readonly"
                      placeholder=""
                    />
                  </td>
                  <th>신고년월</th>
                  <td>
                    <DatePicker
                      name="reyrmm"
                      value={filters.reyrmm}
                      format="yyyy-MM-dd"
                      className="readonly"
                      placeholder=""
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>일용직 일근태</GridTitle>
              <ButtonContainer>
                <Button
                  themeColor={"primary"}
                  onClick={onlaborerWndMultiClick}
                  icon="folder-open"
                  disabled={permissions.save ? false : true}
                >
                  일괄등록
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
            <FormContext.Provider
              value={{
                PrsnInfo,
                setPrsnInfo,
              }}
            >
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{
                    height: isMobile ? mobileheight : webheight,
                  }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      dptcd: dptcdListData.find(
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
                      postcd: postcdListData.find(
                        (item: any) => item.sub_code == row.postcd
                      )?.code_name,
                      dutydt: row.dutydt
                        ? new Date(dateformat(row.dutydt))
                        : new Date(dateformat("99991231")),
                      startdate: row.startdate
                        ? new Date(dateformat(row.startdate))
                        : new Date(dateformat("99991231")),
                      enddate: row.enddate
                        ? new Date(dateformat(row.enddate))
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
                                  ? DateCell
                                  : CommandField.includes(item.fieldName)
                                  ? ColumnCommandCell
                                  : comboField.includes(item.fieldName)
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
                                  ? mainTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </FormContext.Provider>
          </GridContainer>
        </TabStripTab>
        <TabStripTab
          title="일용직집계표"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>년월</th>
                  <td>
                    <DatePicker
                      name="yyyymm"
                      value={filters2.yyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange2}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                  <th>지급일</th>
                  <td>
                    <DatePicker
                      name="paydt"
                      value={filters2.paydt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange2}
                      className="required"
                      placeholder=""
                    />
                  </td>
                  <th>일용직대장 양식</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="gubun"
                        value={filters2.gubun}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange2}
                        className="required"
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <div
            style={{
              height: isMobile ? mobileheight2 : webheight2,
            }}
          >
            {url != "" ? <FileViewers fileUrl={url} isMobile={isMobile} /> : ""}
          </div>
        </TabStripTab>
        <TabStripTab
          title="일용직 개인명세서"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>년월</th>
                  <td>
                    <DatePicker
                      name="frdt"
                      value={filters3.frdt}
                      format="yyyy-MM"
                      onChange={filterInputChange3}
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
                        value={filters3.location}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange3}
                      />
                    )}
                  </td>
                  <th>사번</th>
                  <td>
                    <Input
                      name="prsnnum"
                      type="text"
                      value={filters3.prsnnum}
                      onChange={filterInputChange3}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onlaborerWndClick2}
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
                      value={filters3.prsnnm}
                      onChange={filterInputChange3}
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
                  <GridContainer style={{ width: "100%" }}>
                    <Grid
                      style={{
                        height: mobileheight3,
                      }}
                      data={process(
                        mainDataResult3.data.map((row) => ({
                          ...row,
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
                      onSelectionChange={onMainSelectionChange3}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult3.total}
                      skip={page3.skip}
                      take={page3.take}
                      pageable={true}
                      onPageChange={pageChange3}
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
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell3
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide key={1}>
                  <GridContainer style={{ width: "100%" }}>
                    <GridTitleContainer className="ButtonContainer2">
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(0);
                            }
                          }}
                          icon="chevron-left"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <div
                      style={{
                        height: mobileheight4,
                      }}
                    >
                      {url2 != "" ? (
                        <FileViewers fileUrl={url2} isMobile={isMobile} />
                      ) : (
                        ""
                      )}
                    </div>
                  </GridContainer>
                </SwiperSlide>
              </Swiper>
            </>
          ) : (
            <>
              <GridContainerWrap>
                <GridContainer width="20%">
                  <Grid
                    style={{
                      height: webheight3,
                    }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
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
                    onSelectionChange={onMainSelectionChange3}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainDataResult3.total}
                    skip={page3.skip}
                    take={page3.take}
                    pageable={true}
                    onPageChange={pageChange3}
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
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell3
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </GridContainer>
                <GridContainer width={`calc(80% - ${GAP}px)`}>
                  <div
                    style={{
                      height: webheight4,
                    }}
                  >
                    {url2 != "" ? (
                      <FileViewers fileUrl={url2} isMobile={isMobile} />
                    ) : (
                      ""
                    )}
                  </div>
                </GridContainer>
              </GridContainerWrap>
            </>
          )}
        </TabStripTab>
      </TabStrip>
      {laborerWindowVisible && (
        <LaborerWindow
          setVisible={setlaborerWindowVisible}
          setData={setlaborerData}
          modal={true}
        />
      )}
      {laborerWindowVisible2 && (
        <LaborerWindow
          setVisible={setlaborerWindowVisible2}
          setData={setlaborerData2}
          modal={true}
        />
      )}
      {laborerWindowMultiVisible && (
        <LaborerMultiWindow
          setVisible={setlaborerWindowMultiVisible}
          setData={setLaborerMultiData}
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

export default HU_A6020W;
