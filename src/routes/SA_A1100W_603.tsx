import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridRowDoubleClickEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ButtonContainer,
  ButtonInInput,
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
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  GetPropertyValueByName,
  ThreeNumberceil,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat,
  dateformat2,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  isValidDate,
  numberWithCommas,
  numberWithCommas3,
  setDefaultDate,
  toDate,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { gridList } from "../store/columns/SA_A1100W_603_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

import { DatePicker } from "@progress/kendo-react-dateinputs";
import { useHistory, useLocation } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import TopButtons from "../components/Buttons/TopButtons";
import CenterCell from "../components/Cells/CenterCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ProjectsWindow from "../components/Windows/CM_A7000W_Project_Window";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isFilterHideState,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";

type TdataArr = {
  rowstatus_s: string[];
  seq_s: string[];
  wonamt_s: string[];
  taxdiv_s: string[];
  amt_s: string[];
  contractgb_s: string[];
  quonum_s: string[];
  quorev_s: string[];
  quoseq_s: string[];
};

type TdataArr2 = {
  rowstatus_s: string[];
  seq_s: string[];
  payment_s: string[];
  amt_s: string[];
  paydt_s: string[];
  remark_s: string[];
};

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY6 = "num";
let targetRowIndex: null | number = null;
const DateField = ["strdt", "enddt", "recdt", "paydt"];
const NumberField = [
  "cnt1",
  "amt",
  "contraamt",
  "change_contraamt",
  "fin_contraamt",
  "fin_contraamt_won",
  "wonamt",
  "totamt",
  "week_b",
  "week_r",
  "qty_t",
  "totqty",
  "quoamt",
];

const NumberField2 = ["wonamt", "amt", "totamt"];

const customField = ["insert_userid"];

const centerField = ["num"];
const centerField2 = ["seq"];
const requiredField = ["paydt", "amt"];
let temp = 0;
let temp2 = 0;
let temp6 = 0;

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
var height8 = 0;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_sysUserMaster_001",
    // 구분, 단위, 불량유형
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "insert_userid" ? "L_sysUserMaster_001" : "";

  const fieldName = field == "insert_userid" ? "user_name" : undefined;
  const fieldValue = field == "insert_userid" ? "user_id" : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={fieldName}
      valueField={fieldValue}
      {...props}
    />
  ) : (
    <td />
  );
};

let deletedMainRows: any[] = [];
let deletedMainRows2: any[] = [];
let deletedMainRows6: any[] = [];
const SA_A1100W_603: React.FC = () => {
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter6 = getter(DATA_ITEM_KEY6);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const pc = UseGetValueFromSessionItem("pc");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page6, setPage6] = useState(initialPageState);
  const [checked, setChecked] = useState(false);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  interface ICustData {
    address: string;
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }

  const setCustData = (data: ICustData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_CM501_603, L_sysUserMaster_001, L_SA001_603, L_BA037, L_BA029",
    setBizComponentData
  );
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [contractgbListData, setcontractgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [materialtypeListData, setMaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [extra_field2ListData, setExtra_field2ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxdivListData, setTaxdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setcontractgbListData(getBizCom(bizComponentData, "L_BA037"));
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setMaterialtypeListData(getBizCom(bizComponentData, "L_SA001_603"));
      setExtra_field2ListData(getBizCom(bizComponentData, "L_CM501_603"));
      setTaxdivListData(getBizCom(bizComponentData, "L_BA029"));
    }
  }, [bizComponentData]);

  // 조회조건
  const [filters, setFilters] = useState({
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    frdt: new Date(),
    todt: new Date(),
    quokey: "",
    custcd: "",
    custnm: "",
    custprsnnm: "",
    contractno: "",
    project: "",
    chkperson: "",
    materialtype: "",
    extra_field2: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
    query: false,
    pgSize: PAGE_SIZE,
  });

  const [subFilters, setSubFilters] = useState<{ [name: string]: any }>({
    workType: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    contractno: "",
    groupgb: "A",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
    pgSize: PAGE_SIZE,
  });

  const [subFilters2, setSubFilters2] = useState<{ [name: string]: any }>({
    workType: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    contractno: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
    pgSize: PAGE_SIZE,
  });

  const [subFilters6, setSubFilters6] = useState<{ [name: string]: any }>({
    workType: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    contractno: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
    pgSize: PAGE_SIZE,
  });
  const [Information, setInformation] = useState<{ [name: string]: any }>({
    amtunit: "",
    change_contraamt: 0,
    contraamt: 0,
    contractno: "",
    custcd: "",
    custnm: "",
    custprsnnm: "",
    enddt: null,
    fin_contraamt: 0,
    wonamt: 0,
    project: "",
    strdt: null,
    wonchgrat: 0,
    insert_time: "",
    materialtype: "",
    extra_field2: "",
    cotracdt: new Date(),
    attdatnum: "",
    files: "",
    quonum: "",
    quorev: 0,
    quoamt: 0,
  });
  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
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
  const [selectedState6, setSelectedState6] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [tempState6, setTempState6] = useState<State>({
    sort: [],
  });
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [tempResult6, setTempResult6] = useState<DataResult>(
    process([], tempState6)
  );
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataState6, setMainDataState6] = useState<State>({
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
  const [mainDataResult6, setMainDataResult6] = useState<DataResult>(
    process([], mainDataState6)
  );
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = event.dataItem;
    setSelectedState({ [selectedRowData[DATA_ITEM_KEY]]: true });
    setIsFilterHideStates(true);
    setChecked(true);
    setSubFilters((prev) => ({
      ...prev,
      workType: "DETAIL",
      contractno: selectedRowData.contractno,
      pgNum: 1,
      isSearch: true,
    }));
    setSubFilters2((prev) => ({
      ...prev,
      workType: "COMMENT",
      contractno: selectedRowData.contractno,
      pgNum: 1,
      isSearch: true,
    }));
    setSubFilters6((prev) => ({
      ...prev,
      workType: "PAYMENT",
      contractno: selectedRowData.contractno,
      pgNum: 1,
      isSearch: true,
    }));
    setTabSelected(1);
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "custnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        custcd: value == "" ? "" : prev.custcd,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const InfoInputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InfoInputChange2 = (e: any) => {
    const { name } = e.target;
    const value = e.value;

    if (name == "wonchgrat") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (Information.amtunit != "KRW") {
        const newData = mainDataResult2.data.map((item) => ({
          ...item,
          wonamt: ThreeNumberceil(Math.ceil(item.amt * value)),
          totamt:
            ThreeNumberceil(Math.ceil(item.amt * value)) +
            ThreeNumberceil(
              Math.ceil(ThreeNumberceil(Math.ceil(item.amt * value)) * 0.1)
            ),
          rowstatus: item.rowstatus == "N" ? "N" : "U",
        }));

        setTempResult((prev) => {
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
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const filtersComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (value != "KRW") {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        wonamt: ThreeNumberceil(Math.ceil(item.amt * Information.wonchgrat)),
        totamt:
          ThreeNumberceil(Math.ceil(item.amt * Information.wonchgrat)) +
          ThreeNumberceil(
            Math.ceil(
              ThreeNumberceil(Math.ceil(item.amt * Information.wonchgrat)) * 0.1
            )
          ),
        rowstatus: item.rowstatus == "N" ? "N" : "U",
      }));

      setTempResult((prev) => {
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
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        wonamt: ThreeNumberceil(Math.ceil(item.amt)),
        totamt:
          ThreeNumberceil(Math.ceil(item.amt)) +
          ThreeNumberceil(
            Math.ceil(ThreeNumberceil(Math.ceil(item.amt)) * 0.1)
          ),
        quoamt: ThreeNumberceil(Math.ceil(item.quoamt)),
        rowstatus: item.rowstatus == "N" ? "N" : "U",
      }));

      setTempResult((prev) => {
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

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [mobileheight5, setMobileHeight5] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  const [tabSelected, setTabSelected] = React.useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-tabstrip-items-wrapper");
      height2 = getHeight(".TitleContainer");
      height3 = getHeight(".ButtonContainer");
      height4 = getHeight(".ButtonContainer2");
      height5 = getHeight(".ButtonContainer3");
      height6 = getHeight(".ButtonContainer4");
      height7 = getHeight(".ButtonContainer5");
      height8 = getHeight(".FormBoxWrap");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(false) - height - height2 - height3);
        setMobileHeight3(getDeviceHeight(false) - height - height2 - height4);
        setMobileHeight4(getDeviceHeight(false) - height - height2 - height5);
        setMobileHeight5(getDeviceHeight(false) - height - height2 - height6);
        setWebHeight(getDeviceHeight(true) - height - height2);
        setWebHeight2(
          (getDeviceHeight(false) - height - height2 - height7 - height8) / 2 -
            height4
        );
        setWebHeight3(
          (getDeviceHeight(false) - height - height2 - height7 - height8) / 2 -
            height5
        );
        setWebHeight4(
          (getDeviceHeight(false) - height - height2 - height7 - height8) / 2 -
            height6
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
    webheight3,
    webheight4,
    tabSelected,
  ]);

  const history = useHistory();
  const location = useLocation();

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const queryParams = new URLSearchParams(location.search);
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      if (queryParams.has("go")) {
        history.replace({}, "");
        setFilters((prev) => ({
          ...prev,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
          materialtype: defaultOption.find(
            (item: any) => item.id == "materialtype"
          )?.valueCode,
          chkperson: defaultOption.find((item: any) => item.id == "chkperson")
            ?.valueCode,
          extra_field2: defaultOption.find(
            (item: any) => item.id == "extra_field2"
          )?.valueCode,
          isSearch: true,
          find_row_value: queryParams.get("go") as string,
          query: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
          materialtype: defaultOption.find(
            (item: any) => item.id == "materialtype"
          )?.valueCode,
          chkperson: defaultOption.find((item: any) => item.id == "chkperson")
            ?.valueCode,
          extra_field2: defaultOption.find(
            (item: any) => item.id == "extra_field2"
          )?.valueCode,
          isSearch: true,
        }));
      }
    }
  }, [customOptionData]);

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
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData, bizComponentData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      subFilters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters);

      setSubFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [subFilters, permissions, customOptionData, bizComponentData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      subFilters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters2);

      setSubFilters2((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchSubGrid2(deepCopiedFilters);
    }
  }, [subFilters2, permissions, customOptionData, bizComponentData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      subFilters6.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters6);

      setSubFilters6((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchSubGrid6(deepCopiedFilters);
    }
  }, [subFilters6, permissions, customOptionData, bizComponentData]);

  let gridRef: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    deletedMainRows = [];
    deletedMainRows2 = [];
    deletedMainRows6 = [];
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage6(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult6(process([], mainDataState6));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;

    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1100W_603_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_quokey": filters.quokey,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_contractno": filters.contractno,
        "@p_project": filters.project,
        "@p_chkperson": filters.chkperson,
        "@p_materialtype": filters.materialtype,
        "@p_extra_field2": filters.extra_field2,
        "@p_find_row_value": filters.find_row_value,
        "@p_groupgb": "",
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
        amt: Math.ceil(item.amt),
        contraamt: Math.ceil(item.contraamt),
        change_contraamt: Math.ceil(item.change_contraamt),
        fin_contraamt: Math.ceil(item.fin_contraamt),
        fin_contraamt_won: Math.ceil(item.fin_contraamt_won),
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.contractno == filters.find_row_value
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
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.contractno == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          if (filters.query == true) {
            setIsFilterHideStates(true);
            setChecked(true);
            setSubFilters((prev) => ({
              ...prev,
              workType: "DETAIL",
              contractno: selectedRow.contractno,
              pgNum: 1,
              isSearch: true,
            }));
            setSubFilters2((prev) => ({
              ...prev,
              workType: "COMMENT",
              contractno: selectedRow.contractno,
              pgNum: 1,
              isSearch: true,
            }));
            setSubFilters6((prev) => ({
              ...prev,
              workType: "PAYMENT",
              contractno: selectedRow.contractno,
              pgNum: 1,
              isSearch: true,
            }));
            setTabSelected(1);
            if (swiper && isMobile) {
              swiper.slideTo(1);
            }
          }
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          if (filters.query == true) {
            alert("해당 데이터가 없습니다.");
            setFilters((prev) => ({
              ...prev,
              query: false,
            }));
          }
        }
      } else {
        if (filters.query == true) {
          alert("해당 데이터가 없습니다.");
          setFilters((prev) => ({
            ...prev,
            query: false,
          }));
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
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
  const fetchSubGrid = async (subFilters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    const parameters1: Iparameters = {
      procedureName: "P_SA_A1100W_603_Q",
      pageNumber: subFilters.pgNum,
      pageSize: subFilters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_quokey": filters.quokey,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_contractno": subFilters.contractno,
        "@p_project": filters.project,
        "@p_chkperson": filters.chkperson,
        "@p_materialtype": filters.materialtype,
        "@p_extra_field2": filters.extra_field2,
        "@p_find_row_value": filters.find_row_value,
        "@p_groupgb": subFilters.groupgb,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters1);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setFilters((prev) => ({
        ...prev,
        query: false,
      }));
      const totalRowCnt = data.tables[1].TotalRowCount;
      const rows = data.tables[1].Rows.map((item: any) => ({
        ...item,
        amt: Math.ceil(item.amt),
        wonamt: Math.ceil(item.wonamt),
        totamt: Math.ceil(item.totamt),
      }));

      if (data.tables[0].RowCount > 0) {
        setInformation((prev) => ({
          ...prev,
          amtunit: data.tables[0].Rows[0].amtunit,
          change_contraamt: Math.ceil(data.tables[0].Rows[0].change_contraamt),
          contraamt: Math.ceil(data.tables[0].Rows[0].contraamt),
          contractno: data.tables[0].Rows[0].contractno,
          custcd: data.tables[0].Rows[0].custcd,
          custnm: data.tables[0].Rows[0].custnm,
          custprsnnm: data.tables[0].Rows[0].custprsnnm,
          enddt:
            data.tables[0].Rows[0].enddt == ""
              ? null
              : toDate(data.tables[0].Rows[0].enddt),
          wonamt: Math.ceil(data.tables[0].Rows[0].wonamt),
          project: data.tables[0].Rows[0].project,
          strdt:
            data.tables[0].Rows[0].strdt == ""
              ? null
              : toDate(data.tables[0].Rows[0].strdt),
          wonchgrat: Math.ceil(data.tables[0].Rows[0].wonchgrat),
          insert_time: data.tables[0].Rows[0].insert_time.substring(0, 10),
          materialtype: data.tables[0].Rows[0].materialtype,
          extra_field2: data.tables[0].Rows[0].extra_field2,
          cotracdt:
            data.tables[0].Rows[0].cotracdt == ""
              ? null
              : toDate(data.tables[0].Rows[0].cotracdt),
          attdatnum: data.tables[0].Rows[0].attdatnum,
          files: data.tables[0].Rows[0].files,
          quonum: data.tables[0].Rows[0].quonum,
          quorev: data.tables[0].Rows[0].quorev,
          taxdiv: data.tables[0].Rows[0].taxdiv,
          quomat: data.tables[0].Rows[0].quoamt,
        }));
      } else {
        setInformation((prev) => ({
          ...prev,
          amtunit: "",
          change_contraamt: 0,
          contraamt: 0,
          contractno: "",
          custcd: "",
          custnm: "",
          custprsnnm: "",
          enddt: null,
          fin_contraamt: 0,
          wonamt: 0,
          project: "",
          strdt: null,
          wonchgrat: 0,
          insert_time: "",
          materialtype: "",
          extra_field2: "",
          cotracdt: new Date(),
          attdatnum: "",
          files: "",
          quonum: "",
          quorev: 0,
          taxdiv: "",
          quoamt: 0,
        }));
      }
      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters((prev) => ({
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
  const fetchSubGrid2 = async (subFilters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    //조회프로시저  파라미터
    const parameters2: Iparameters = {
      procedureName: "P_SA_A1100W_603_Q",
      pageNumber: subFilters2.pgNum,
      pageSize: subFilters2.pgSize,
      parameters: {
        "@p_work_type": "COMMENT",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_quokey": filters.quokey,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_contractno": subFilters2.contractno,
        "@p_project": filters.project,
        "@p_chkperson": filters.chkperson,
        "@p_materialtype": filters.materialtype,
        "@p_extra_field2": filters.extra_field2,
        "@p_find_row_value": filters.find_row_value,
        "@p_groupgb": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult3({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters2((prev) => ({
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
  const fetchSubGrid6 = async (subFilters6: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회프로시저  파라미터
    //조회프로시저  파라미터
    const parameters2: Iparameters = {
      procedureName: "P_SA_A1100W_603_Q",
      pageNumber: subFilters6.pgNum,
      pageSize: subFilters6.pgSize,
      parameters: {
        "@p_work_type": "PAYMENT",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_quokey": filters.quokey,
        "@p_custcd": filters.custnm == "" ? "" : filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_contractno": subFilters6.contractno,
        "@p_project": filters.project,
        "@p_chkperson": filters.chkperson,
        "@p_materialtype": filters.materialtype,
        "@p_extra_field2": filters.extra_field2,
        "@p_find_row_value": filters.find_row_value,
        "@p_groupgb": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        amt: Math.ceil(item.amt),
      }));

      setMainDataResult6({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        setSelectedState6({ [rows[0][DATA_ITEM_KEY6]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters6((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters2((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage3({
      ...event.page,
    });
  };

  const pageChange6 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters6((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage6({
      ...event.page,
    });
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);

    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);
  };

  const onSelectionChange6 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState6,
      dataItemKey: DATA_ITEM_KEY6,
    });

    setSelectedState6(newSelectedState);
  };
  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  const handleSelectTab = (e: any) => {
    setIsFilterHideStates(true);
    if (e.selected == 0) {
      setChecked(false);
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
      }));
    }
    setTabSelected(e.selected);
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A1100W_603_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A1100W_603_001");
      } else {
        resetAllGrid();
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
        setTabSelected(0);
        setChecked(false);
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };

  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
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
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
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

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum = Math.ceil(item["total_" + props.field]))
        : ""
    );

    var parts = sum.toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export6: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        const optionsGridSix = _export6.workbookOptions();
        optionsGridTwo.sheets[1] = optionsGridThree.sheets[0];
        optionsGridTwo.sheets[2] = optionsGridSix.sheets[0];
        optionsGridTwo.sheets[0].title = "청구조건";
        optionsGridTwo.sheets[1].title = "COMMENT";
        optionsGridTwo.sheets[2].title = "계약 상세내역";
        _export2.save(optionsGridTwo);
      }
    }
  };

  const ongrdDetailItemChange = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
  };

  const ongrdDetailItemChange6 = (event: GridItemChangeEvent) => {
    setMainDataState6((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult6,
      setMainDataResult6,
      DATA_ITEM_KEY6
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
  const customCellRender6 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit6}
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
  const customRowRender6 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit6}
      editField={EDIT_FIELD}
    />
  );
  const ongrdDetailItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
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

  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (dataItem.contractgb != "계약") {
      if (field == "amt" || field == "remark") {
        const newData = mainDataResult2.data.map((item) =>
          item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
            ? {
                ...item,
                [EDIT_FIELD]: field,
              }
            : { ...item, [EDIT_FIELD]: undefined }
        );

        setTempResult((prev) => {
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
        setTempResult((prev) => {
          return {
            data: mainDataResult2.data,
            total: prev.total,
          };
        });
      }
    }
  };
  const enterEdit6 = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "num") {
      const newData = mainDataResult6.data.map((item) =>
        item[DATA_ITEM_KEY6] == dataItem[DATA_ITEM_KEY6]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
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

  const exitEdit = () => {
    if (tempResult.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              wonamt: Math.ceil(
                Information.amtunit == "KRW"
                  ? item.amt
                  : item.amt * Information.wonchgrat
              ),
              totamt:
                Math.ceil(
                  Information.amtunit == "KRW"
                    ? item.amt
                    : item.amt * Information.wonchgrat
                ) +
                Math.ceil(
                  Math.ceil(
                    Information.amtunit == "KRW"
                      ? item.amt
                      : item.amt * Information.wonchgrat
                  ) * 0.1
                ),
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
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "recdt" && field != "seq") {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev) => {
        return {
          data: mainDataResult3.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult3.data) {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
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
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult3.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
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

  const onMainSortChange6 = (e: any) => {
    setMainDataState6((prev) => ({ ...prev, sort: e.sort }));
  };

  const onAddClick = () => {
    mainDataResult3.data.map((item) => {
      if (item[DATA_ITEM_KEY3] > temp) {
        temp = item[DATA_ITEM_KEY3];
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY3]: ++temp,
      comment: "",
      id: "",
      insert_userid: userId,
      recdt: convertDateToStr(new Date()),
      seq: 0,
      rowstatus: "N",
    };
    setSelectedState3({ [newDataItem[DATA_ITEM_KEY3]]: true });
    setMainDataResult3((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick6 = () => {
    mainDataResult6.data.map((item) => {
      if (item[DATA_ITEM_KEY6] > temp6) {
        temp6 = item[DATA_ITEM_KEY6];
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY6]: ++temp6,
      orgdiv: sessionOrgdiv,
      payment: "",
      seq: 0,
      paydt: convertDateToStr(new Date()),
      amt: 0,
      remark: "",
      rowstatus: "N",
    };
    setSelectedState6({ [newDataItem[DATA_ITEM_KEY6]]: true });
    setMainDataResult6((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object3: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult3.data.forEach((item: any, index: number) => {
      if (!selectedState3[item[DATA_ITEM_KEY3]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        Object3.push(index);
      }
    });

    if (Math.min(...Object3) < Math.min(...Object2)) {
      data = mainDataResult3.data[Math.min(...Object2)];
    } else {
      data = mainDataResult3.data[Math.min(...Object3) - 1];
    }

    setMainDataResult3((prev) => ({
      data: newData,
      total: prev.total - Object3.length,
    }));
    if (Object3.length > 0) {
      setSelectedState3({
        [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
      });
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    quonum: "",
    quorev: 0,
    rowstatus_s: "",
    wonamt_s: "",
    taxdiv_s: "",
    amt_s: "",
    contractgb_s: "",
    quonum_s: "",
    quorev_s: "",
    quoseq_s: "",
    seq_s: "",
    payment_s: "",
    paydt_s: "",
    remark_s: "",
  });

  const infopara: Iparameters = {
    procedureName: "P_SA_A1100W_603_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_quonum": ParaData.quonum,
      "@p_quorev": ParaData.quorev,
      "@p_contractno": subFilters.contractno,
      "@p_location": sessionLocation,
      "@p_project": Information.project,
      "@p_cotracdt": convertDateToStr(Information.cotracdt),
      "@p_strdt": isValidDate(Information.strdt)
        ? convertDateToStr(Information.strdt)
        : "",
      "@p_enddt": isValidDate(Information.enddt)
        ? convertDateToStr(Information.enddt)
        : "",
      "@p_wonchgrat":
        Information.wonchgrat == "" ||
        Information.wonchgrat == undefined ||
        Information.wonchgrat == null
          ? 1
          : Information.wonchgrat,
      "@p_amtunit": Information.amtunit,
      "@p_attdatnum": Information.attdatnum,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_seq_s": ParaData.seq_s,
      "@p_wonamt_s": ParaData.wonamt_s,
      "@p_taxdiv_s": ParaData.taxdiv_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_contractgb_s": ParaData.contractgb_s,
      "@p_quonum_s": ParaData.quonum_s,
      "@p_quorev_s": ParaData.quorev_s,
      "@p_quoseq_s": ParaData.quoseq_s,

      "@p_payment_s": ParaData.payment_s,
      "@p_paydt_s": ParaData.paydt_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SA_A1100W_603",
    },
  };

  const onSaveClick = () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length == 0 && deletedMainRows2.length == 0) {
      setParaData((prev) => ({
        ...prev,
        workType: "N",
      }));
    } else {
      let dataArr: TdataArr = {
        rowstatus_s: [],
        seq_s: [],
        wonamt_s: [],
        taxdiv_s: [],
        amt_s: [],
        contractgb_s: [],
        quonum_s: [],
        quorev_s: [],
        quoseq_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          amt = "",
          seq = "",
          wonamt = "",
          taxdiv = "",
          contractgb = "",
          quonum = "",
          quorev = "",
          quoseq = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.seq_s.push(seq);
        dataArr.wonamt_s.push(wonamt);
        dataArr.taxdiv_s.push(taxdiv);
        dataArr.amt_s.push(amt);
        dataArr.contractgb_s.push(contractgb);
        dataArr.quonum_s.push(quonum);
        dataArr.quorev_s.push(quorev);
        dataArr.quoseq_s.push(quoseq);
      });

      deletedMainRows2.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          amt = "",
          seq = "",
          wonamt = "",
          taxdiv = "",
          contractgb = "",
          quonum = "",
          quorev = "",
          quoseq = "",
        } = item;

        dataArr.rowstatus_s.push("D");
        dataArr.seq_s.push(seq);
        dataArr.wonamt_s.push(wonamt);
        dataArr.taxdiv_s.push(taxdiv);
        dataArr.amt_s.push(amt);
        dataArr.contractgb_s.push(contractgb);
        dataArr.quonum_s.push(quonum);
        dataArr.quorev_s.push(quorev);
        dataArr.quoseq_s.push(quoseq);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "N",
        quonum: "",
        quorev: 0,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        seq_s: dataArr.seq_s.join("|"),
        wonamt_s: dataArr.wonamt_s.join("|"),
        taxdiv_s: dataArr.taxdiv_s.join("|"),
        amt_s: dataArr.amt_s.join("|"),
        contractgb_s: dataArr.contractgb_s.join("|"),
        quonum_s: dataArr.quonum_s.join("|"),
        quorev_s: dataArr.quorev_s.join("|"),
        quoseq_s: dataArr.quoseq_s.join("|"),
      }));
    }
  };

  const onSaveClick6 = () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult6.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    let valid = true;
    dataItem.map((item) => {
      if (
        item.paydt.substring(0, 4) < "1997" ||
        item.paydt.substring(6, 8) > "31" ||
        item.paydt.substring(6, 8) < "01" ||
        item.paydt.substring(6, 8).length != 2
      ) {
        valid = false;
      }
    });

    if (valid != true) {
      alert("필수값을 입력해주세요.");
      return false;
    }
    if (dataItem.length == 0 && deletedMainRows6.length == 0) return false;

    let dataArr: TdataArr2 = {
      rowstatus_s: [],
      seq_s: [],
      payment_s: [],
      amt_s: [],
      paydt_s: [],
      remark_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = "",
        payment = "",
        amt = "",
        paydt = "",
        remark = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.payment_s.push(payment);
      dataArr.amt_s.push(amt);
      dataArr.paydt_s.push(paydt == "99991231" ? "" : paydt);
      dataArr.remark_s.push(remark);
    });

    deletedMainRows6.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = "",
        payment = "",
        amt = "",
        paydt = "",
        remark = "",
      } = item;

      dataArr.rowstatus_s.push("D");
      dataArr.seq_s.push(seq);
      dataArr.payment_s.push(payment);
      dataArr.amt_s.push(amt);
      dataArr.paydt_s.push(paydt == "99991231" ? "" : paydt);
      dataArr.remark_s.push(remark);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "PAYMENT",
      quonum: "",
      quorev: 0,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      payment_s: dataArr.payment_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
      paydt_s: dataArr.paydt_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
    }));
  };

  useEffect(() => {
    if (ParaData.workType == "D" && permissions.delete) {
      fetchTodoGridSaved();
    }

    if (
      ParaData.workType != "D" &&
      ParaData.workType != "" &&
      permissions.save
    ) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  const fetchTodoGridSaved = async () => {
    if (ParaData.workType != "D" && !permissions.save) return;
    if (ParaData.workType == "D" && !permissions.delete) return;
    let data: any;

    setLoading(true);

    try {
      data = await processApi<any>("procedure", infopara);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      if (ParaData.workType == "D") {
        setDeletedAttadatnums([Information.attdatnum]);
        setTabSelected(0);
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
      } else if (ParaData.workType == "FINISH") {
        alert("완료처리되었습니다.");
        setTabSelected(0);
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
      } else {
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
        setSubFilters((prev) => ({
          ...prev,
          workType: "DETAIL",
          pgNum: 1,
          isSearch: true,
        }));
        setSubFilters2((prev) => ({
          ...prev,
          workType: "COMMENT",
          pgNum: 1,
          isSearch: true,
        }));
        setSubFilters6((prev) => ({
          ...prev,
          workType: "PAYMENT",
          pgNum: 1,
          isSearch: true,
        }));
      }
      setParaData({
        workType: "",
        quonum: "",
        quorev: 0,
        rowstatus_s: "",
        wonamt_s: "",
        taxdiv_s: "",
        amt_s: "",
        contractgb_s: "",
        quonum_s: "",
        quorev_s: "",
        quoseq_s: "",
        seq_s: "",
        payment_s: "",
        paydt_s: "",
        remark_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  const onSaveClick3 = () => {
    if (!permissions.save) return;
    const dataItem: { [name: string]: any } = mainDataResult3.data.filter(
      (item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      }
    );
    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

    type TData = {
      row_status: string[];
      id: string[];
      seq: string[];
      recdt: string[];
      comment: string[];
      user_id: string[];
    };

    let dataArr: TData = {
      row_status: [],
      id: [],
      comment: [],
      seq: [],
      recdt: [],
      user_id: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { comment, rowstatus, id = "", seq, recdt, insert_userid } = item;

      dataArr.comment.push(comment);
      dataArr.id.push(id);
      dataArr.row_status.push(rowstatus);
      dataArr.seq.push(seq);
      dataArr.recdt.push(recdt);
      dataArr.user_id.push(insert_userid);
    });

    deletedMainRows.forEach((item: any, idx: number) => {
      const { comment, id = "", seq, recdt, insert_userid } = item;

      dataArr.row_status.push("D");
      dataArr.comment.push(comment);
      dataArr.id.push(id);
      dataArr.seq.push(seq);
      dataArr.recdt.push(recdt);
      dataArr.user_id.push(insert_userid);
    });

    setParaDataSaved((prev) => ({
      ...prev,
      work_type: "save",
      row_status: dataArr.row_status.join("|"),
      comment: dataArr.comment.join("|"),
      id: dataArr.id.join("|"),
      seq: dataArr.seq.join("|"),
      recdt: dataArr.recdt.join("|"),
      user_id: dataArr.user_id.join("|"),
      ref_key: subFilters.contractno,
    }));
  };

  const [paraDataSaved, setParaDataSaved] = useState({
    work_type: "",
    row_status: "",
    id: "",
    seq: "",
    recdt: "",
    comment: "",
    user_id: "",
    ref_key: "",
  });

  const paraSaved: Iparameters = {
    procedureName: "sys_sav_comments",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataSaved.work_type,
      "@p_row_status": paraDataSaved.row_status,
      "@p_id": paraDataSaved.id,
      "@p_seq": paraDataSaved.seq,
      "@p_recdt": paraDataSaved.recdt,
      "@p_comment": paraDataSaved.comment,
      "@p_user_id": paraDataSaved.user_id,
      "@p_form_id": "SA_A1100W_603",
      "@p_table_id": "SA204T",
      "@p_orgdiv": sessionOrgdiv,
      "@p_ref_key": paraDataSaved.ref_key,
      "@p_exec_pc": pc,
    },
  };

  const fetchTodoGridSaved2 = async () => {
    if (!permissions.save) return;
    let data: any;

    setLoading(true);

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      setSubFilters((prev) => ({
        ...prev,
        workType: "DETAIL",
        pgNum: 1,
        isSearch: true,
      }));
      setSubFilters2((prev) => ({
        ...prev,
        workType: "COMMENT",
        pgNum: 1,
        isSearch: true,
      }));
      setParaDataSaved((prev) => ({ ...prev, work_type: "" }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraDataSaved.work_type !== "" && permissions.save)
      fetchTodoGridSaved2();
  }, [paraDataSaved, permissions]);

  const onCopyClick = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    if (mainDataResult2.total > 0) {
      const selectRow = mainDataResult2.data.filter(
        (item) => item.num == Object.getOwnPropertyNames(selectedState2)[0]
      )[0];

      const newDataItem = {
        [DATA_ITEM_KEY2]: ++temp2,
        amt: selectRow.amt,
        contractgb: "B",
        contractno: selectRow.contractno,
        itemcd: selectRow.itemcd,
        itemnm: selectRow.itemnm,
        ordnum: selectRow.ordnum,
        qty_t: selectRow.qty_t,
        tkyn: selectRow.tkyn,
        quonum: selectRow.quonum,
        quorev: selectRow.quorev,
        quoseq: selectRow.quoseq,
        quoamt: selectRow.quoamt,
        recdt: selectRow.recdt,
        remark: selectRow.remark,
        seq: temp2,
        taxdiv: selectRow.taxdiv,
        testnum: selectRow.testnum,
        totamt: selectRow.totamt,
        totqty: selectRow.totqty,
        week_b: selectRow.week_b,
        week_r: selectRow.week_r,
        wonamt: selectRow.wonamt,
        rowstatus: "N",
      };

      setMainDataResult2((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    } else {
      alert("복사할 데이터가 없습니다.");
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
        if (item.contractgb == "A") {
          alert("계약된 건은 행 삭제가 불가능합니다.");
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

  const onDeleteClick3 = (e: any) => {
    if (!permissions.delete) return;
    if (!window.confirm("계약 삭제 하시겠습니까?")) {
      return false;
    }

    setParaData((prev) => ({
      ...prev,
      workType: "D",
    }));
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    if (!Information.attdatnum) {
      setUnsavedAttadatnums((prev) => [...prev, data.attdatnum]);
    }

    setInformation((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);
  const onProjectWndClick = () => {
    setProjectWindowVisible(true);
  };

  const setProjectData = (data: any) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        quokey: data.quokey,
      };
    });
  };

  const onChangeStatus = () => {
    if (!permissions.save) return;
    if (!window.confirm("계약 완료처리를 하시겠습니까?")) {
      return false;
    }

    setParaData((prev) => ({
      ...prev,
      workType: "FINISH",
      quonum: Information.quonum,
      quorev: Information.quorev,
    }));
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
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab
          title="요약정보"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>계약일자</th>
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
                  <th>PJT NO.</th>
                  <td>
                    <Input
                      name="quokey"
                      type="text"
                      value={filters.quokey}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onProjectWndClick}
                      />
                    </ButtonInInput>
                  </td>
                  <th>업체명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type={"button"}
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                </tr>
                <tr>
                  <th>의뢰자</th>
                  <td>
                    <Input
                      name="custprsnnm"
                      type="text"
                      value={filters.custprsnnm}
                      onChange={InputChange}
                    />
                  </td>
                  <th>계약번호</th>
                  <td>
                    <Input
                      name="contractno"
                      type="text"
                      value={filters.contractno}
                      onChange={InputChange}
                    />
                  </td>
                  <th>계약명</th>
                  <td>
                    <Input
                      name="project"
                      type="text"
                      value={filters.project}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>영업담당자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="chkperson"
                        value={filters.chkperson}
                        customOptionData={customOptionData}
                        textField="user_name"
                        valueField="user_id"
                        changeData={filtersComboBoxChange}
                      />
                    )}
                  </td>
                  <th>물질분야</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="materialtype"
                        value={filters.materialtype}
                        customOptionData={customOptionData}
                        changeData={filtersComboBoxChange}
                      />
                    )}
                  </td>
                  <th>물질상세분야</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="extra_field2"
                        value={filters.extra_field2}
                        customOptionData={customOptionData}
                        changeData={filtersComboBoxChange}
                      />
                    )}
                  </td>
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
              fileName={getMenuName()}
            >
              <Grid
                style={{
                  height: isMobile ? mobileheight : webheight,
                }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    chkperson: userListData.find(
                      (items: any) => items.user_id == row.chkperson
                    )?.user_name,
                    materialtype: materialtypeListData.find(
                      (items: any) => items.sub_code == row.materialtype
                    )?.code_name,
                    extra_field2: extra_field2ListData.find(
                      (items: any) => items.sub_code == row.extra_field2
                    )?.code_name,
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
                onRowDoubleClick={onRowDoubleClick}
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
                                : NumberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell
                                : NumberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell
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
          title="상세정보"
          disabled={permissions.view ? (checked == true ? false : true) : true}
        >
          {isMobile ? (
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
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <GridTitle>계약내용</GridTitle>
                      <GridTitle>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(1);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </GridTitle>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <FormBoxWrap
                    border={true}
                    style={{
                      height: mobileheight2,
                    }}
                  >
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>등록일자</th>
                          <td>
                            <Input
                              name="insert_time"
                              type="text"
                              value={dateformat2(Information.insert_time)}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>업체명</th>
                          <td>
                            <Input
                              name="custnm"
                              type="text"
                              value={Information.custnm}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>의뢰자</th>
                          <td>
                            <Input
                              name="custprsnnm"
                              type="text"
                              value={Information.custprsnnm}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>물질분야</th>
                          <td>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="materialtype"
                                type="new"
                                value={Information.materialtype}
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="readonly"
                                disabled={true}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>물질상세분야</th>
                          <td>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="extra_field2"
                                type="new"
                                value={Information.extra_field2}
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="readonly"
                                disabled={true}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>계약명 </th>
                          <td>
                            <Input
                              name="project"
                              type="text"
                              value={Information.project}
                              onChange={InfoInputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>계약번호</th>
                          <td>
                            <Input
                              name="contractno"
                              type="text"
                              value={Information.contractno}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>계약일자</th>
                          <td>
                            <DatePicker
                              name="cotracdt"
                              value={Information.cotracdt}
                              format="yyyy-MM-dd"
                              placeholder=""
                              onChange={InfoInputChange}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>계약기간</th>
                          <td>
                            <CommonDateRangePicker
                              value={{
                                start: Information.strdt,
                                end: Information.enddt,
                              }}
                              onChange={(e: {
                                value: { start: any; end: any };
                              }) =>
                                setInformation((prev) => ({
                                  ...prev,
                                  strdt: e.value.start,
                                  enddt: e.value.end,
                                }))
                              }
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>과세유형</th>
                          <td>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="taxdiv"
                                type="new"
                                value={Information.taxdiv}
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>화폐단위</th>
                          <td>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="amtunit"
                                type="new"
                                value={Information.amtunit}
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>환율 </th>
                          <td>
                            <NumericTextBox
                              name="wonchgrat"
                              value={Information.wonchgrat}
                              format="n0"
                              onChange={InfoInputChange2}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>견적금액</th>
                          <td></td>
                        </tr>
                        <tr>
                          <th>계약금액</th>
                          <td>
                            <Input
                              name="contraamt"
                              type="text"
                              value={numberWithCommas3(Information.contraamt)}
                              style={{
                                textAlign: "end",
                              }}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>변경계약금액</th>
                          <td>
                            <Input
                              name="change_contraamt"
                              type="text"
                              value={numberWithCommas3(
                                Information.change_contraamt
                              )}
                              style={{
                                textAlign: "end",
                              }}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>최종계약금액</th>
                          <td>
                            <Input
                              name="fin_contraamt"
                              type="text"
                              value={numberWithCommas3(
                                Information.fin_contraamt
                              )}
                              style={{
                                textAlign: "end",
                              }}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>최종계약금액(원화)</th>
                          <td>
                            <Input
                              name="wonamt"
                              type="text"
                              value={numberWithCommas3(Information.wonamt)}
                              style={{
                                textAlign: "end",
                              }}
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>계약서 여부</th>
                          <td></td>
                        </tr>
                        <tr>
                          <th>첨부파일</th>
                          <td>
                            <Input
                              name="files"
                              type="text"
                              value={Information.files}
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
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer3">
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <GridTitle>
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
                        청구조건
                      </GridTitle>
                      <GridTitle>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(2);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </GridTitle>
                    </ButtonContainer>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick6}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        onClick={onDeleteClick6}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        onClick={onSaveClick6}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="save"
                        title="저장"
                        disabled={permissions.save ? false : true}
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult6.data}
                    ref={(exporter) => {
                      _export6 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: mobileheight4 }}
                      data={process(
                        mainDataResult6.data.map((row) => ({
                          ...row,
                          paydt: row.paydt
                            ? new Date(dateformat(row.paydt))
                            : new Date(dateformat("99991231")),
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
                      onItemChange={ongrdDetailItemChange6}
                      cellRender={customCellRender6}
                      rowRender={customRowRender6}
                      editField={EDIT_FIELD}
                    >
                      <GridColumn field="rowstatus" title=" " width="50px" />
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList6"]
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
                                      : NumberField.includes(item.fieldName)
                                      ? NumberCell
                                      : centerField.includes(item.fieldName)
                                      ? CenterCell
                                      : undefined
                                  }
                                  headerCell={
                                    requiredField.includes(item.fieldName)
                                      ? RequiredHeader
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell6
                                      : NumberField.includes(item.fieldName)
                                      ? editNumberFooterCell6
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={2}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer4">
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <GridTitle>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(1);
                            }
                          }}
                          icon="chevron-left"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                        COMMENT
                      </GridTitle>
                      <GridTitle>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(3);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </GridTitle>
                    </ButtonContainer>
                    <ButtonContainer>
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
                        onClick={onSaveClick3}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="save"
                        title="저장"
                        disabled={permissions.save ? false : true}
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult3.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: mobileheight5 }}
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
                      onItemChange={ongrdDetailItemChange2}
                      cellRender={customCellRender2}
                      rowRender={customRowRender2}
                      editField={EDIT_FIELD}
                    >
                      <GridColumn field="rowstatus" title=" " width="50px" />
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
                                    DateField.includes(item.fieldName)
                                      ? DateCell
                                      : customField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : centerField.includes(item.fieldName)
                                      ? CenterCell
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
              <SwiperSlide key={3}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer2">
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <GridTitle>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(2);
                            }
                          }}
                          icon="chevron-left"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                        계약 상세내역
                      </GridTitle>
                    </ButtonContainer>
                    <ButtonContainer
                      style={{ flexWrap: "wrap", justifyContent: "left" }}
                    >
                      <Button
                        themeColor={"primary"}
                        fillMode="outline"
                        onClick={onDeleteClick3}
                        disabled={permissions.delete ? false : true}
                      >
                        계약삭제
                      </Button>
                      <Button
                        themeColor={"primary"}
                        fillMode="outline"
                        onClick={onCopyClick}
                        disabled={permissions.save ? false : true}
                      >
                        계약변경
                      </Button>
                      <Button
                        onClick={onDeleteClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.save ? false : true}
                      >
                        변경계약 삭제
                      </Button>
                      <Button
                        onClick={onSaveClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.save ? false : true}
                      >
                        저장
                      </Button>
                      <Button
                        onClick={onChangeStatus}
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.save ? false : true}
                      >
                        계약완료
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult2.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: mobileheight3 }}
                      data={process(
                        mainDataResult2.data.map((row) => ({
                          ...row,
                          contractgb: contractgbListData.find(
                            (items: any) => items.sub_code == row.contractgb
                          )?.code_name,
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
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange2}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      onItemChange={ongrdDetailItemChange}
                      cellRender={customCellRender}
                      rowRender={customRowRender}
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
                                  id={item.id}
                                  field={item.fieldName}
                                  title={item.caption}
                                  width={item.width}
                                  cell={
                                    centerField2.includes(item.fieldName)
                                      ? CenterCell
                                      : NumberField.includes(item.fieldName)
                                      ? NumberCell
                                      : customField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell2
                                      : NumberField2.includes(item.fieldName)
                                      ? editNumberFooterCell
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
          ) : (
            <>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer5">
                  <GridTitle>계약내용</GridTitle>
                </GridTitleContainer>
                <FormBoxWrap border={true} className="FormBoxWrap">
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>등록일자</th>
                        <td>
                          <Input
                            name="insert_time"
                            type="text"
                            value={dateformat2(Information.insert_time)}
                            className="readonly"
                          />
                        </td>
                        <th>업체명</th>
                        <td colSpan={3}>
                          <Input
                            name="custnm"
                            type="text"
                            value={Information.custnm}
                            className="readonly"
                          />
                        </td>
                        <th>의뢰자</th>
                        <td colSpan={2}>
                          <Input
                            name="custprsnnm"
                            type="text"
                            value={Information.custprsnnm}
                            className="readonly"
                          />
                        </td>
                        <th>물질분야</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="materialtype"
                              type="new"
                              value={Information.materialtype}
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                              className="readonly"
                              disabled={true}
                            />
                          )}
                        </td>
                        <th>물질상세분야</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="extra_field2"
                              type="new"
                              value={Information.extra_field2}
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                              className="readonly"
                              disabled={true}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>계약명</th>
                        <td colSpan={13}>
                          <Input
                            name="project"
                            type="text"
                            value={Information.project}
                            onChange={InfoInputChange}
                            className="required"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>계약번호</th>
                        <th>계약일자</th>
                        <th></th>
                        <th colSpan={2}>계약기간</th>
                        <th>과세유형</th>
                        <th>화폐단위</th>
                        <th>환율</th>
                        <th>견적금액</th>
                        <th>계약금액</th>
                        <th>변경계약금액</th>
                        <th>최종계약금액</th>
                        <th>최종계약금액(원화)</th>
                      </tr>
                      <tr>
                        <td>
                          <Input
                            name="contractno"
                            type="text"
                            value={Information.contractno}
                            className="readonly"
                          />
                        </td>
                        <td>
                          <DatePicker
                            name="cotracdt"
                            value={Information.cotracdt}
                            format="yyyy-MM-dd"
                            placeholder=""
                            className="required"
                            onChange={InfoInputChange}
                          />
                        </td>
                        <td colSpan={3}>
                          <CommonDateRangePicker
                            className="required"
                            value={{
                              start: Information.strdt,
                              end: Information.enddt,
                            }}
                            onChange={(e: {
                              value: { start: any; end: any };
                            }) =>
                              setInformation((prev) => ({
                                ...prev,
                                strdt: e.value.start,
                                enddt: e.value.end,
                              }))
                            }
                          />
                        </td>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="taxdiv"
                              type="new"
                              value={Information.taxdiv}
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                              className="required"
                            />
                          )}
                        </td>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="amtunit"
                              type="new"
                              value={Information.amtunit}
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                              className="required"
                            />
                          )}
                        </td>
                        <td>
                          <NumericTextBox
                            name="wonchgrat"
                            value={Information.wonchgrat}
                            format="n0"
                            onChange={InfoInputChange2}
                            className="required"
                          />
                        </td>
                        <td></td>
                        <td>
                          <Input
                            name="contraamt"
                            type="text"
                            value={numberWithCommas3(Information.contraamt)}
                            style={{
                              textAlign: "end",
                            }}
                            className="readonly"
                          />
                        </td>
                        <td>
                          <Input
                            name="change_contraamt"
                            type="text"
                            value={numberWithCommas3(
                              Information.change_contraamt
                            )}
                            style={{
                              textAlign: "end",
                            }}
                            className="readonly"
                          />
                        </td>
                        <td>
                          <Input
                            name="fin_contraamt"
                            type="text"
                            value={numberWithCommas3(Information.fin_contraamt)}
                            style={{
                              textAlign: "end",
                            }}
                            className="readonly"
                          />
                        </td>
                        <td>
                          <Input
                            name="wonamt"
                            type="text"
                            value={numberWithCommas3(Information.wonamt)}
                            style={{
                              textAlign: "end",
                            }}
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>계약서 여부</th>
                        <td></td>
                        <th>첨부파일</th>
                        <td colSpan={11}>
                          <Input
                            name="files"
                            type="text"
                            value={Information.files}
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
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
                <GridContainerWrap>
                  <GridContainer width="50%">
                    <GridTitleContainer className="ButtonContainer2">
                      <GridTitle>청구조건</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick6}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onDeleteClick6}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onSaveClick6}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          title="저장"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult6.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{ height: webheight2 }}
                        data={process(
                          mainDataResult6.data.map((row) => ({
                            ...row,
                            paydt: row.paydt
                              ? new Date(dateformat(row.paydt))
                              : new Date(dateformat("99991231")),
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
                        onItemChange={ongrdDetailItemChange6}
                        cellRender={customCellRender6}
                        rowRender={customRowRender6}
                        editField={EDIT_FIELD}
                      >
                        <GridColumn field="rowstatus" title=" " width="50px" />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList6"]
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
                                      DateField.includes(item.fieldName)
                                        ? DateCell
                                        : NumberField.includes(item.fieldName)
                                        ? NumberCell
                                        : centerField.includes(item.fieldName)
                                        ? CenterCell
                                        : undefined
                                    }
                                    headerCell={
                                      requiredField.includes(item.fieldName)
                                        ? RequiredHeader
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell6
                                        : NumberField.includes(item.fieldName)
                                        ? editNumberFooterCell6
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                  <GridContainer width={`calc(50% - ${GAP}px)`}>
                    <GridTitleContainer className="ButtonContainer3">
                      <GridTitle>COMMENT</GridTitle>
                      <ButtonContainer>
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
                          onClick={onSaveClick3}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          title="저장"
                          disabled={permissions.save ? false : true}
                        ></Button>
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
                        onItemChange={ongrdDetailItemChange2}
                        cellRender={customCellRender2}
                        rowRender={customRowRender2}
                        editField={EDIT_FIELD}
                      >
                        <GridColumn field="rowstatus" title=" " width="50px" />
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
                                      DateField.includes(item.fieldName)
                                        ? DateCell
                                        : customField.includes(item.fieldName)
                                        ? CustomComboBoxCell
                                        : centerField.includes(item.fieldName)
                                        ? CenterCell
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
                </GridContainerWrap>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer4">
                  <GridTitle>계약 상세내역</GridTitle>
                  <ButtonContainer>
                    <Button
                      themeColor={"primary"}
                      fillMode="outline"
                      onClick={onDeleteClick3}
                      disabled={permissions.delete ? false : true}
                    >
                      계약삭제
                    </Button>
                    <Button
                      themeColor={"primary"}
                      fillMode="outline"
                      onClick={onCopyClick}
                      disabled={permissions.save ? false : true}
                    >
                      계약변경
                    </Button>
                    <Button
                      onClick={onDeleteClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.save ? false : true}
                    >
                      변경계약 삭제
                    </Button>
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.save ? false : true}
                    >
                      저장
                    </Button>
                    <Button
                      onClick={onChangeStatus}
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.save ? false : true}
                    >
                      계약완료
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export6 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: webheight4 }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        contractgb: contractgbListData.find(
                          (items: any) => items.sub_code == row.contractgb
                        )?.code_name,
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
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    onItemChange={ongrdDetailItemChange}
                    cellRender={customCellRender}
                    rowRender={customRowRender}
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
                                id={item.id}
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  centerField2.includes(item.fieldName)
                                    ? CenterCell
                                    : NumberField.includes(item.fieldName)
                                    ? NumberCell
                                    : customField.includes(item.fieldName)
                                    ? CustomComboBoxCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell2
                                    : NumberField2.includes(item.fieldName)
                                    ? editNumberFooterCell
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </>
          )}
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={Information.attdatnum}
          modal={true}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
        />
      )}
      {projectWindowVisible && (
        <ProjectsWindow
          setVisible={setProjectWindowVisible}
          setData={setProjectData}
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

export default SA_A1100W_603;
