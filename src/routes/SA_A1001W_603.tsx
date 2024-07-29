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
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
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
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import DateCell from "../components/Cells/DateCell";
import NotMinusNumberCell from "../components/Cells/NotMinusNumberCell";
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
  dateformat2,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  numberWithCommas,
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
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ProjectsWindow from "../components/Windows/CM_A7000W_Project_Window";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import EmailWindow from "../components/Windows/CommonWindows/EmailWindow";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import SA_A1000W_603_Design2_Window from "../components/Windows/SA_A1000W_603_Design2_Window";
import SA_A1000W_603_Design3_Window from "../components/Windows/SA_A1000W_603_Design3_Window";
import SA_A1000W_603_Design4_Window from "../components/Windows/SA_A1000W_603_Design4_Window";
import SA_A1000W_603_Design_Window from "../components/Windows/SA_A1000W_603_Design_Window";
import SA_A1001W_603_Window from "../components/Windows/SA_A1001W_603_Window";
import { useApi } from "../hooks/api";
import { isFilterHideState, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/SA_A1001W_603_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";

const dateField = ["pubdt"];

const numberField = [
  "finalquowonamt",
  "quorev",
  "quounp",
  "itemcnt",
  "designcnt",
  "marginamt",
  "discountamt",
];

const notminusnumberField = ["margin", "discount"];
const iconField = ["confinyn"];

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

type TdataArr = {
  quoseq_s: string[];
  itemcd_s: string[];
  quowonamt_s: string[];
  margin_s: string[];
  marginamt_s: string[];
  discount_s: string[];
  discountamt_s: string[];
  amt_s: string[];
};

const iconCell = (props: GridCellProps) => {
  const data = props.dataItem;

  return data ? (
    data.confinyn == "Y" ? (
      <td style={{ textAlign: "center" }}>
        <span
          className="k-icon k-i-checkmark-circle k-icon-md"
          style={{ color: "green" }}
        ></span>
      </td>
    ) : (
      <td />
    )
  ) : (
    <td />
  );
};

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;

const SA_A1001W_603: React.FC = () => {
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);

  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [tabSelected, setTabSelected] = React.useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-tabstrip-items-wrapper");
      height2 = getHeight(".TitleContainer");
      height3 = getHeight(".ButtonContainer");
      height4 = getHeight(".ButtonContainer2");
      height5 = getHeight(".ButtonContainer3");
      height6 = getHeight(".ButtonContainer4");
      height7 = getHeight(".FormBoxWrap");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight2(
          getDeviceHeight(false) - height - height2 - height4 - height5
        );
        setMobileHeight3(
          getDeviceHeight(false) - height - height2 - height4 - height6
        );
        setWebHeight(getDeviceHeight(true) - height - height2 - height3);
        setWebHeight2(
          getDeviceHeight(false) -
            height -
            height2 -
            height4 -
            height7 -
            height5
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, tabSelected]);

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
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
      find_row_value: "",
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const history = useHistory();
  const location = useLocation();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
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
          materialtype: defaultOption.find(
            (item: any) => item.id == "materialtype"
          )?.valueCode,
          rev: defaultOption.find((item: any) => item.id == "rev")?.valueCode,
          quocalyn: defaultOption.find((item: any) => item.id == "quocalyn")
            ?.valueCode,
          confinyn: defaultOption.find((item: any) => item.id == "confinyn")
            ?.valueCode,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
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
          materialtype: defaultOption.find(
            (item: any) => item.id == "materialtype"
          )?.valueCode,
          quocalyn: defaultOption.find((item: any) => item.id == "quocalyn")
            ?.valueCode,
          confinyn: defaultOption.find((item: any) => item.id == "confinyn")
            ?.valueCode,
          rev: defaultOption.find((item: any) => item.id == "rev")?.valueCode,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
          extra_field2: defaultOption.find(
            (item: any) => item.id == "extra_field2"
          )?.valueCode,
          isSearch: true,
        }));
      }
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_CM501_603, L_sysUserMaster_001, L_SA001_603, L_Requestgb",
    setBizComponentData
  );
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [materialtypeListData, setMaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [requestgbListData, setRequestgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [extra_field2ListData, setExtra_field2ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setMaterialtypeListData(getBizCom(bizComponentData, "L_SA001_603"));
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setRequestgbListData(getBizCom(bizComponentData, "L_Requestgb"));
      setExtra_field2ListData(getBizCom(bizComponentData, "L_CM501_603"));
    }
  }, [bizComponentData]);

  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  const handleSelectTab = (e: any) => {
    setValues2(false);
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: true,
        pgNum: 1,
      }));
    } else if (e.selected == 1) {
      const data = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setFilters2((prev) => ({
        ...prev,
        quonum: data.quonum,
        quorev: data.quorev,
        isSearch: true,
        pgNum: 1,
      }));

      setInformation((prev) => ({
        ...prev,
        quonum: data.quonum,
        custnm: data.custnm,
        custprsnnm: data.custprsnnm,
        materialtype: data.materialtype,
        requestgb: data.requestgb,
        itemcnt: data.itemcnt,
        confinyn: data.confinyn,
        quorev: data.quorev,
        pubdt: data.pubdt,
        finalquowonamt: data.finalquowonamt,
        quocalyn: data.quocalyn,
      }));
      if (isMobile) {
        setIsFilterHideStates(true);
      }
    }

    setTabSelected(e.selected);
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "personnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        person: value == "" ? "" : prev.person,
      }));
    } else if (name == "chkpersonnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        chkperson: value == "" ? "" : prev.chkperson,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

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
    frdt: new Date(),
    todt: new Date(),
    custcd: "",
    custnm: "",
    custprsnnm: "",
    materialtype: "",
    extra_field2: "",
    quocalyn: "",
    confinyn: "",
    person: "",
    personnm: "",
    chkperson: "",
    chkpersonnm: "",
    rev: "",
    quonum: "",
    quorev: 0,
    quoseq: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
    query: false,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "DETAIL",
    quonum: "",
    quorev: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [designWindowVisible, setDesignWindowVisible] =
    useState<boolean>(false);
  const [designWindowVisible2, setDesignWindowVisible2] =
    useState<boolean>(false);
  const [designWindowVisible3, setDesignWindowVisible3] =
    useState<boolean>(false);
  const [designWindowVisible4, setDesignWindowVisible4] =
    useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onDesignWndClick = () => {
    const data = mainDataResult2.data.filter(
      (item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
    )[0];

    if (data != undefined) {
      if (data.type == "Basic") {
        setDesignWindowVisible(true);
      } else if (data.type == "Cheomdan") {
        setDesignWindowVisible2(true);
      } else if (data.type == "Invitro") {
        setDesignWindowVisible3(true);
      } else if (data.type == "Analyze") {
        setDesignWindowVisible4(true);
      } else {
        alert("해당되는 디자인 타입이 없습니다.");
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };
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

  const [information, setInformation] = useState<{ [name: string]: any }>({
    quonum: "",
    custnm: "",
    custprsnnm: "",
    materialtype: "",
    requestgb: "",
    itemcnt: 0,
    confinyn: "",
    quorev: 0,
    pubdt: "",
    finalquowonamt: 0,
    quocalyn: "",
  });

  const setCustData = (data: ICustData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
      };
    });
  };
  const setProjectData = (data: any) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        quonum: data.quonum,
      };
    });
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1001W_603_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": sessionOrgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_quonum": filters.quonum,
        "@p_quorev": filters.quorev,
        "@p_quoseq": filters.quoseq,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_materialtype": filters.materialtype,
        "@p_extra_field2": filters.extra_field2,
        "@p_quocalyn": filters.quocalyn,
        "@p_person": filters.personnm == "" ? "" : filters.person,
        "@p_personnm": filters.personnm,
        "@p_rev": filters.rev,
        "@p_chkperson": filters.chkpersonnm == "" ? "" : filters.chkperson,
        "@p_chkpersonnm": filters.chkpersonnm,
        "@p_confinyn": filters.confinyn,
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
        discount: Math.ceil(item.discount),
        discountamt: Math.ceil(item.discountamt),
        finalquowonamt: Math.ceil(item.finalquowonamt),
        margin: Math.ceil(item.margin),
        marginamt: Math.ceil(item.marginamt),
        quounp: Math.ceil(item.quounp),
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.quokey == filters.find_row_value
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
            : rows.find((row: any) => row.quokey == filters.find_row_value);
        if (selectedRow != undefined) {
          setInformation((prev) => ({
            ...prev,
            quonum: selectedRow.quonum,
            custnm: selectedRow.custnm,
            custprsnnm: selectedRow.custprsnnm,
            materialtype: selectedRow.materialtype,
            requestgb: selectedRow.requestgb,
            itemcnt: selectedRow.itemcnt,
            confinyn: selectedRow.confinyn,
            quorev: selectedRow.quorev,
            pubdt: selectedRow.pubdt,
            finalquowonamt: Math.ceil(selectedRow.finalquowonamt),
            quocalyn: selectedRow.quocalyn,
          }));

          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          if (filters.query == true) {
            setFilters2((prev) => ({
              ...prev,
              quonum: selectedRow.quonum,
              quorev: selectedRow.quorev,
              isSearch: true,
              pgNum: 1,
            }));
            setTabSelected(1);
            setFilters((prev) => ({
              ...prev,
              query: false,
            }));
          }
        } else {
          if (filters.query == true) {
            alert("해당 데이터가 없습니다.");
            setFilters((prev) => ({
              ...prev,
              query: false,
            }));
          }
          setInformation((prev) => ({
            ...prev,
            quonum: rows[0].quonum,
            custnm: rows[0].custnm,
            custprsnnm: rows[0].custprsnnm,
            materialtype: rows[0].materialtype,
            requestgb: rows[0].requestgb,
            itemcnt: rows[0].itemcnt,
            confinyn: rows[0].confinyn,
            quorev: rows[0].quorev,
            pubdt: rows[0].pubdt,
            finalquowonamt: Math.ceil(rows[0].finalquowonamt),
            quocalyn: rows[0].quocalyn,
          }));

          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1001W_603_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": sessionOrgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_quonum": filters2.quonum,
        "@p_quorev": filters2.quorev,
        "@p_quoseq": 0,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custprsnnm": filters.custprsnnm,
        "@p_materialtype": filters.materialtype,
        "@p_extra_field2": filters.extra_field2,
        "@p_quocalyn": filters.quocalyn,
        "@p_person": filters.personnm == "" ? "" : filters.person,
        "@p_personnm": filters.personnm,
        "@p_rev": filters.rev,
        "@p_chkperson": filters.chkpersonnm == "" ? "" : filters.chkperson,
        "@p_chkpersonnm": filters.chkpersonnm,
        "@p_confinyn": filters.confinyn,
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
        discount: Math.ceil(item.discount),
        discountamt: Math.ceil(item.discountamt),
        finalquowonamt: Math.ceil(item.finalquowonamt),
        margin: Math.ceil(item.margin),
        marginamt: Math.ceil(item.marginamt),
        quounp: Math.ceil(item.quounp),
        totqty: Math.ceil(item.totqty),
        unp: Math.ceil(item.unp),
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
      filters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData, bizComponentData]);

  let _export: any;
  let _export2: any;
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
        optionsGridTwo.sheets[0].title = "견적리스트";
        _export2.save(optionsGridTwo);
      }
    }
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

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

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

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
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

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A1001W_603_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A1001W_603_001");
      } else {
        setValues2(false);
        setPage(initialPageState); // 페이지 초기화
        setTabSelected(0);
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const onRowDoubleClick = (props: any) => {
    const datas = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    setFilters2((prev) => ({
      ...prev,
      quonum: datas.quonum,
      quorev: datas.quorev,
      isSearch: true,
      pgNum: 1,
    }));

    setInformation((prev) => ({
      ...prev,
      quonum: datas.quonum,
      custnm: datas.custnm,
      custprsnnm: datas.custprsnnm,
      materialtype: datas.materialtype,
      requestgb: datas.requestgb,
      itemcnt: datas.itemcnt,
      confinyn: datas.confinyn,
      quorev: datas.quorev,
      pubdt: datas.pubdt,
      finalquowonamt: datas.finalquowonamt,
      quocalyn: datas.quocalyn,
    }));
    setTabSelected(1);
  };

  const [emailWindowVisible, setEmailWindowVisible] = useState<boolean>(false);
  const [printWindowVisible, setPrintWindowVisible] = useState<boolean>(false);
  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);

  const onProjectWndClick = () => {
    setProjectWindowVisible(true);
  };

  const onSendEmail = () => {
    setEmailWindowVisible(true);
  };

  const onPrint = () => {
    if (!permissions.print) return;
    if (!window.confirm("견적 상태로 업데이트 하시겠습니까?")) {
      return false;
    }

    setParaData((prev) => ({
      ...prev,
      workType: "PRINT",
      quonum: information.quonum,
      quorev: information.quorev,
    }));
    setPrintWindowVisible(true);
  };

  const [PrsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);
  const [PrsnnumWindowVisible2, setPrsnnumWindowVisible2] =
    useState<boolean>(false);
  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };
  const onPrsnnumWndClick2 = () => {
    setPrsnnumWindowVisible2(true);
  };
  interface IPrsnnum {
    user_id: string;
    user_name: string;
  }

  const setPrsnnumData = (data: IPrsnnum) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        personnm: data.user_name,
        person: data.user_id,
      };
    });
  };

  const setPrsnnumData2 = (data: IPrsnnum) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        chkpersonnm: data.user_name,
        chkperson: data.user_id,
      };
    });
  };

  const onCal = () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult2.data.filter((item) => item.chk == true);

    if (dataItem.length == 0) {
      alert("선택된 데이터가 없습니다.");
      return false;
    }

    let valid = true;

    dataItem.map((item) => {
      if (item.confinyn == "Y") {
        valid = false;
      }
    });

    if (valid != true) {
      if (
        !window.confirm(
          `견적 재산출을 진행하시겠습니까? \n (계약건에는 반영이 되지 않습니다.)`
        )
      ) {
        return false;
      }
    }

    let dataArr: TdataArr = {
      quoseq_s: [],
      itemcd_s: [],
      quowonamt_s: [],
      margin_s: [],
      marginamt_s: [],
      discount_s: [],
      discountamt_s: [],
      amt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        quoseq = "",
        itemcd = "",
        quounp = "",
        margin = "",
        marginamt = "",
        discount = "",
        discountamt = "",
        finalquowonamt = "",
      } = item;

      dataArr.quoseq_s.push(quoseq);
      dataArr.itemcd_s.push(itemcd);
      dataArr.quowonamt_s.push(quounp);
      dataArr.margin_s.push(margin);
      dataArr.marginamt_s.push(marginamt);
      dataArr.discount_s.push(discount);
      dataArr.discountamt_s.push(discountamt);
      dataArr.amt_s.push(finalquowonamt);
    });

    setParaData({
      workType: "CAL",
      orgdiv: sessionOrgdiv,
      quonum: information.quonum,
      quorev: information.quorev,
      quoseq_s: dataArr.quoseq_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      quowonamt_s: dataArr.quowonamt_s.join("|"),
      margin_s: dataArr.margin_s.join("|"),
      marginamt_s: dataArr.marginamt_s.join("|"),
      discount_s: dataArr.discount_s.join("|"),
      discountamt_s: dataArr.discountamt_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
    });
  };

  const onSALTRN = () => {
    if (!permissions.save) return;

    if (!window.confirm("계약 확정하시겠습니까?")) {
      return false;
    }

    const dataItem = mainDataResult2.data.filter((item) => item.chk == true);

    if (dataItem.length == 0) {
      alert("선택된 데이터가 없습니다.");
      return false;
    }

    let valid = false;
    let valid2 = false;
    let valid3 = false;

    dataItem.map((item) => {
      if (item.quounp == 0) {
        valid = true;
      }
      if (item.confinyn == "Y") {
        valid2 = true;
      }
      if (item.finyn != "Y") {
        valid3 = true;
      }
    });

    if (valid2 != false) {
      alert("이미 처리된 계약입니다.");
      return false;
    }

    if (valid3 != false) {
      alert("견적 산출을 진행해주세요.");
      return false;
    }

    if (valid != false) {
      alert("견적원가가 0인 항목은 산출이 불가능합니다.");
      return false;
    }

    let dataArr: TdataArr = {
      quoseq_s: [],
      itemcd_s: [],
      quowonamt_s: [],
      margin_s: [],
      marginamt_s: [],
      discount_s: [],
      discountamt_s: [],
      amt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        quoseq = "",
        itemcd = "",
        quounp = "",
        margin = "",
        marginamt = "",
        discount = "",
        discountamt = "",
        finalquowonamt = "",
      } = item;

      dataArr.quoseq_s.push(quoseq);
      dataArr.itemcd_s.push(itemcd);
      dataArr.quowonamt_s.push(quounp);
      dataArr.margin_s.push(margin);
      dataArr.marginamt_s.push(marginamt);
      dataArr.discount_s.push(discount);
      dataArr.discountamt_s.push(discountamt);
      dataArr.amt_s.push(finalquowonamt);
    });

    setParaData({
      workType: "SALTRN",
      orgdiv: sessionOrgdiv,
      quonum: information.quonum,
      quorev: information.quorev,
      quoseq_s: dataArr.quoseq_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      quowonamt_s: dataArr.quowonamt_s.join("|"),
      margin_s: dataArr.margin_s.join("|"),
      marginamt_s: dataArr.marginamt_s.join("|"),
      discount_s: dataArr.discount_s.join("|"),
      discountamt_s: dataArr.discountamt_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
    });
  };

  const onSave = () => {
    if (!permissions.save) return;

    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0) return false;

    let valid = true;

    dataItem.map((item) => {
      if (item.confinyn == "Y") {
        valid = false;
      }
    });

    if (valid != true) {
      if (
        !window.confirm(
          `저장하시겠습니까? \n (계약건에는 반영이 되지 않습니다.)`
        )
      ) {
        return false;
      }
    }

    let dataArr: TdataArr = {
      quoseq_s: [],
      itemcd_s: [],
      quowonamt_s: [],
      margin_s: [],
      marginamt_s: [],
      discount_s: [],
      discountamt_s: [],
      amt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        quoseq = "",
        itemcd = "",
        quounp = "",
        margin = "",
        marginamt = "",
        discount = "",
        discountamt = "",
        finalquowonamt = "",
      } = item;

      dataArr.quoseq_s.push(quoseq);
      dataArr.itemcd_s.push(itemcd);
      dataArr.quowonamt_s.push(quounp);
      dataArr.margin_s.push(margin);
      dataArr.marginamt_s.push(marginamt);
      dataArr.discount_s.push(discount);
      dataArr.discountamt_s.push(discountamt);
      dataArr.amt_s.push(finalquowonamt);
    });

    setParaData({
      workType: "U",
      orgdiv: sessionOrgdiv,
      quonum: information.quonum,
      quorev: information.quorev,
      quoseq_s: dataArr.quoseq_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      quowonamt_s: dataArr.quowonamt_s.join("|"),
      margin_s: dataArr.margin_s.join("|"),
      marginamt_s: dataArr.marginamt_s.join("|"),
      discount_s: dataArr.discount_s.join("|"),
      discountamt_s: dataArr.discountamt_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
    });
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    quonum: "",
    quorev: "",
    quoseq_s: "",
    itemcd_s: "",
    quowonamt_s: "",
    margin_s: "",
    marginamt_s: "",
    discount_s: "",
    discountamt_s: "",
    amt_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_SA_A1001W_603_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_quonum": ParaData.quonum,
      "@p_quorev": ParaData.quorev,
      "@p_quoseq_s": ParaData.quoseq_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_quowonamt_s": ParaData.quowonamt_s,
      "@p_margin_s": ParaData.margin_s,
      "@p_marginamt_s": ParaData.marginamt_s,
      "@p_discount_s": ParaData.discount_s,
      "@p_discountamt_s": ParaData.discountamt_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SA_A1001W_603",
    },
  };

  useEffect(() => {
    if (
      ParaData.workType != "" &&
      permissions.save &&
      ParaData.workType != "PRINT"
    ) {
      fetchTodoGridSaved();
    }

    if (ParaData.workType == "PRINT" && permissions.print) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  const fetchTodoGridSaved = async () => {
    if (ParaData.workType != "PRINT" && !permissions.save) return;
    if (ParaData.workType == "PRINT" && !permissions.print) return;

    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setPage(initialPageState);
      setPage2(initialPageState);
      setValues2(false);
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
        pgNum: 1,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        quonum: "",
        quorev: "",
        quoseq_s: "",
        itemcd_s: "",
        quowonamt_s: "",
        margin_s: "",
        marginamt_s: "",
        discount_s: "",
        discountamt_s: "",
        amt_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult2((prev) => {
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
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
      field == "margin" ||
      field == "marginamt" ||
      field == "discount" ||
      field == "discountamt" ||
      field == "chk"
    ) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );
      setEditIndex(dataItem[DATA_ITEM_KEY2]);
      if (field) {
        setEditedField(field);
      }
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
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              marginamt:
                editedField == "margin"
                  ? Math.ceil(item.quounp * (item.margin / 100))
                  : item.marginamt == 0
                  ? 0
                  : item.marginamt,
              discountamt:
                editedField == "discount"
                  ? Math.ceil(item.quounp * (item.discount / 100))
                  : item.discountamt == 0
                  ? 0
                  : item.discountamt,
              finalquowonamt:
                Math.ceil(
                  item.quounp +
                    (editedField == "margin"
                      ? Math.ceil(item.quounp * (item.margin / 100))
                      : item.marginamt == 0
                      ? 0
                      : item.marginamt)
                ) -
                (editedField == "discount"
                  ? Math.ceil(item.quounp * (item.discount / 100))
                  : item.discountamt == 0
                  ? 0
                  : item.discountamt),
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
          title="견적(조회)"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox
              onKeyPress={(e) => handleKeyPressSearch(e, search)}
              style={{ height: "10%" }}
              className="ButtonContainer3"
            >
              <tbody>
                <tr>
                  <th>의뢰일자</th>
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
                      name="quonum"
                      type="text"
                      value={filters.quonum}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onProjectWndClick}
                      />
                    </ButtonInInput>
                  </td>
                  <th>업체코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={filters.custcd}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick}
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
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>의뢰자</th>
                  <td>
                    <Input
                      name="custprsnnm"
                      type="text"
                      value={filters.custprsnnm}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>물질분야</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="materialtype"
                        value={filters.materialtype}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
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
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>등록자</th>
                  <td>
                    <Input
                      name="personnm"
                      type="text"
                      value={filters.personnm}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type="button"
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onPrsnnumWndClick}
                      />
                    </ButtonInInput>
                  </td>
                </tr>
                <tr>
                  <th>REV</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="rev"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>견적산출여부</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="quocalyn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>계약전환여부</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="confinyn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>영업담당자</th>
                  <td>
                    <Input
                      name="chkpersonnm"
                      type="text"
                      value={filters.chkpersonnm}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type="button"
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onPrsnnumWndClick2}
                      />
                    </ButtonInInput>
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>요약정보</GridTitle>
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
                  height: isMobile ? mobileheight : webheight,
                }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    person: userListData.find(
                      (items: any) => items.user_id == row.person
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
                              dateField.includes(item.fieldName)
                                ? DateCell
                                : numberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell
                                : numberField.includes(item.fieldName)
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
          title="견적(처리)"
          disabled={
            permissions.view ? (mainDataResult.total == 0 ? true : false) : true
          }
        >
          {isMobile ? (
            <>
              <ButtonContainer className="ButtonContainer2">
                <Button
                  themeColor={"primary"}
                  onClick={onPrint}
                  icon="print"
                  disabled={permissions.print ? false : true}
                >
                  견적서 출력
                </Button>
                <Button
                  themeColor={"primary"}
                  onClick={onSendEmail}
                  icon="email"
                  disabled={permissions.save ? false : true}
                >
                  이메일 전송
                </Button>
                <Button
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="palette"
                  onClick={onDesignWndClick}
                  disabled={permissions.view ? false : true}
                >
                  디자인상세
                </Button>
                <Button
                  themeColor={"primary"}
                  fillMode="outline"
                  onClick={onCal}
                  icon="calculator"
                  disabled={permissions.save ? false : true}
                >
                  견적 산출
                </Button>
                <Button
                  onClick={onSave}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  disabled={permissions.save ? false : true}
                >
                  저장
                </Button>
                <Button
                  themeColor={"primary"}
                  onClick={onSALTRN}
                  fillMode="outline"
                  icon="dictionary-add"
                  disabled={permissions.save ? false : true}
                >
                  계약 전환
                </Button>
              </ButtonContainer>
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
                    <GridTitleContainer className="ButtonContainer3">
                      <GridTitle>
                        <ButtonContainer
                          style={{ justifyContent: "space-between" }}
                        >
                          상세정보
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
                        </ButtonContainer>
                      </GridTitle>
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
                            <th>PJT NO.</th>
                            <td>
                              <Input
                                name="quonum"
                                type="text"
                                value={information.quonum}
                                className="readonly"
                              />
                            </td>
                            <th>업체명</th>
                            <td>
                              <Input
                                name="custnm"
                                type="text"
                                value={information.custnm}
                                className="readonly"
                              />
                            </td>
                            <th>의뢰자</th>
                            <td>
                              <Input
                                name="custprsnnm"
                                type="text"
                                value={information.custprsnnm}
                                className="readonly"
                              />
                            </td>
                            <th>의뢰목적</th>
                            <td>
                              <Input
                                name="requestgb"
                                type="text"
                                value={
                                  requestgbListData.find(
                                    (items: any) =>
                                      items.sub_code == information.requestgb
                                  )?.code_name
                                }
                                className="readonly"
                              />
                            </td>
                            <th>물질분야</th>
                            <td>
                              <Input
                                name="materialtype"
                                type="text"
                                value={
                                  materialtypeListData.find(
                                    (items: any) =>
                                      items.sub_code == information.materialtype
                                  )?.code_name
                                }
                                className="readonly"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>REV</th>
                            <td>
                              <Input
                                name="quorev"
                                type="text"
                                value={information.quorev}
                                className="readonly"
                              />
                            </td>
                            <th>의뢰품목수</th>
                            <td>
                              <Input
                                name="itemcnt"
                                type="text"
                                value={numberWithCommas(
                                  parseFloat(information.itemcnt)
                                )}
                                className="readonly"
                                style={{ textAlign: "end" }}
                              />
                            </td>
                            <th>견적 발행일</th>
                            <td>
                              <Input
                                name="pubdt"
                                type="text"
                                value={dateformat2(information.pubdt)}
                                className="readonly"
                              />
                            </td>
                            <th>최종견적금액</th>
                            <td>
                              <Input
                                name="finalquowonamt"
                                type="text"
                                value={numberWithCommas(
                                  parseFloat(information.finalquowonamt)
                                )}
                                className="readonly"
                                style={{ textAlign: "end" }}
                              />
                            </td>
                            <th>계약전환여부</th>
                            <td>
                              <Input
                                name="confinyn"
                                type="text"
                                value={information.confinyn}
                                className="readonly"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </FormBoxWrap>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide key={1}>
                  <GridContainer style={{ width: "100%" }}>
                    <GridTitleContainer className="ButtonContainer4">
                      <GridTitle>
                        <ButtonContainer
                          style={{ justifyContent: "space-between" }}
                        >
                          <ButtonContainer>
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
                            {"견적리스트"}
                          </ButtonContainer>
                        </ButtonContainer>
                      </GridTitle>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult2.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{
                          height: mobileheight3,
                        }}
                        data={process(
                          mainDataResult2.data.map((row) => ({
                            ...row,
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
                                        : iconField.includes(item.fieldName)
                                        ? iconCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell2
                                        : numberField.includes(item.fieldName)
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
              </Swiper>
            </>
          ) : (
            <>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>상세정보</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    onClick={onPrint}
                    icon="print"
                    disabled={permissions.print ? false : true}
                  >
                    견적서 출력
                  </Button>
                  <Button
                    themeColor={"primary"}
                    onClick={onSendEmail}
                    icon="email"
                    disabled={permissions.save ? false : true}
                  >
                    이메일 전송
                  </Button>
                  <Button
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="palette"
                    onClick={onDesignWndClick}
                    disabled={permissions.view ? false : true}
                  >
                    디자인상세
                  </Button>
                  <Button
                    themeColor={"primary"}
                    fillMode="outline"
                    onClick={onCal}
                    icon="calculator"
                    disabled={permissions.save ? false : true}
                  >
                    견적 산출
                  </Button>
                  <Button
                    onClick={onSave}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    disabled={permissions.save ? false : true}
                  >
                    저장
                  </Button>
                  <Button
                    themeColor={"primary"}
                    onClick={onSALTRN}
                    fillMode="outline"
                    icon="dictionary-add"
                    disabled={permissions.save ? false : true}
                  >
                    계약 전환
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap border={true} className="FormBoxWrap">
                <FormBox>
                  <tbody>
                    <tr>
                      <th>PJT NO.</th>
                      <td>
                        <Input
                          name="quonum"
                          type="text"
                          value={information.quonum}
                          className="readonly"
                        />
                      </td>
                      <th>업체명</th>
                      <td>
                        <Input
                          name="custnm"
                          type="text"
                          value={information.custnm}
                          className="readonly"
                        />
                      </td>
                      <th>의뢰자</th>
                      <td>
                        <Input
                          name="custprsnnm"
                          type="text"
                          value={information.custprsnnm}
                          className="readonly"
                        />
                      </td>
                      <th>의뢰목적</th>
                      <td>
                        <Input
                          name="requestgb"
                          type="text"
                          value={
                            requestgbListData.find(
                              (items: any) =>
                                items.sub_code == information.requestgb
                            )?.code_name
                          }
                          className="readonly"
                        />
                      </td>
                      <th>물질분야</th>
                      <td>
                        <Input
                          name="materialtype"
                          type="text"
                          value={
                            materialtypeListData.find(
                              (items: any) =>
                                items.sub_code == information.materialtype
                            )?.code_name
                          }
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>REV</th>
                      <td>
                        <Input
                          name="quorev"
                          type="text"
                          value={information.quorev}
                          className="readonly"
                        />
                      </td>
                      <th>의뢰품목수</th>
                      <td>
                        <Input
                          name="itemcnt"
                          type="text"
                          value={numberWithCommas(
                            parseFloat(information.itemcnt)
                          )}
                          className="readonly"
                          style={{ textAlign: "end" }}
                        />
                      </td>
                      <th>견적 발행일</th>
                      <td>
                        <Input
                          name="pubdt"
                          type="text"
                          value={dateformat2(information.pubdt)}
                          className="readonly"
                        />
                      </td>
                      <th>최종견적금액</th>
                      <td>
                        <Input
                          name="finalquowonamt"
                          type="text"
                          value={numberWithCommas(
                            parseFloat(information.finalquowonamt)
                          )}
                          className="readonly"
                          style={{ textAlign: "end" }}
                        />
                      </td>
                      <th>계약전환여부</th>
                      <td>
                        <Input
                          name="confinyn"
                          type="text"
                          value={information.confinyn}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>견적리스트</GridTitle>
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
                                    : notminusnumberField.includes(
                                        item.fieldName
                                      )
                                    ? NotMinusNumberCell
                                    : iconField.includes(item.fieldName)
                                    ? iconCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell2
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell2
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
      {projectWindowVisible && (
        <ProjectsWindow
          setVisible={setProjectWindowVisible}
          setData={setProjectData}
          modal={true}
        />
      )}
      {emailWindowVisible && (
        <EmailWindow
          setVisible={setEmailWindowVisible}
          quonum={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0] != undefined
              ? mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0].quonum
              : ""
          }
          quorev={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0] != undefined
              ? mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0].quorev
              : 0
          }
          modal={true}
        />
      )}
      {printWindowVisible && (
        <SA_A1001W_603_Window
          setVisible={setPrintWindowVisible}
          quonum={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0] != undefined
              ? mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0].quonum
              : ""
          }
          quorev={
            mainDataResult.data.filter(
              (item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
            )[0] != undefined
              ? mainDataResult.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY] ==
                    Object.getOwnPropertyNames(selectedState)[0]
                )[0].quorev
              : 0
          }
          modal={true}
        />
      )}
      {PrsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType="N"
          setData={setPrsnnumData}
          modal={true}
        />
      )}
      {PrsnnumWindowVisible2 && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible2}
          workType="N"
          setData={setPrsnnumData2}
          modal={true}
        />
      )}
      {designWindowVisible && (
        <SA_A1000W_603_Design_Window
          setVisible={setDesignWindowVisible}
          filters={filters}
          item={
            mainDataResult2.data.filter(
              (item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
            )[0] != undefined
              ? mainDataResult2.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY2] ==
                    Object.getOwnPropertyNames(selectedState2)[0]
                )[0]
              : ""
          }
          modal={true}
        />
      )}
      {designWindowVisible2 && (
        <SA_A1000W_603_Design2_Window
          setVisible={setDesignWindowVisible2}
          filters={filters}
          item={
            mainDataResult2.data.filter(
              (item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
            )[0] != undefined
              ? mainDataResult2.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY2] ==
                    Object.getOwnPropertyNames(selectedState2)[0]
                )[0]
              : ""
          }
          modal={true}
        />
      )}
      {designWindowVisible3 && (
        <SA_A1000W_603_Design3_Window
          setVisible={setDesignWindowVisible3}
          filters={filters}
          item={
            mainDataResult2.data.filter(
              (item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
            )[0] != undefined
              ? mainDataResult2.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY2] ==
                    Object.getOwnPropertyNames(selectedState2)[0]
                )[0]
              : ""
          }
          modal={true}
        />
      )}
      {designWindowVisible4 && (
        <SA_A1000W_603_Design4_Window
          setVisible={setDesignWindowVisible4}
          filters={filters}
          item={
            mainDataResult2.data.filter(
              (item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
            )[0] != undefined
              ? mainDataResult2.data.filter(
                  (item) =>
                    item[DATA_ITEM_KEY2] ==
                    Object.getOwnPropertyNames(selectedState2)[0]
                )[0]
              : ""
          }
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

export default SA_A1001W_603;
