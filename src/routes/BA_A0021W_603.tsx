import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
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
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import CenterCell from "../components/Cells/CenterCell";
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
  findMessage,
  getBizCom,
  getDeviceHeight,
  getHeight,
  handleKeyPressSearch,
  numberWithCommas3,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommentsGrid from "../components/Grids/CommentsGrid";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { isFilterHideState, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/BA_A0021W_603_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";

const centerField = ["num"];
const numberField = [
  "meet_cnt",
  "esti_cnt",
  "cont_cnt",
  "cont_amt",
  "misu_amt",
  "quoamt",
  "amt",
  "no_amt",
  "cnt1",
  "taxamt",
  "contraamt",
  "change_contraamt",
  "fin_contraamt",
  "finalquowonamt",
  "quorev",
  "quounp",
  "margin",
  "discount",
  "itemcnt",
  "designcnt",
  "marginamt",
  "discountamt",
];
const dateField = ["recdt", "strdt", "enddt", "cotracdt"];

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const BA_A0021W_603: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [mobileheight5, setMobileHeight5] = useState(0);
  const [mobileheight6, setMobileHeight6] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  const [webheight5, setWebHeight5] = useState(0);
  const [tabSelected, setTabSelected] = React.useState(0);
  const [tabSelected2, setTabSelected2] = React.useState(0);
  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("BA_A0021W_603", setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".FormBoxWrap");
      height3 = getHeight(".k-tabstrip-items-wrapper");
      height4 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height4);
        setMobileHeight2(getDeviceHeight(true) - height - height3 - height4);
        setMobileHeight3(getDeviceHeight(true) - height3 - height4);
        setMobileHeight4(getDeviceHeight(true) - height3 - height4);
        setMobileHeight5(getDeviceHeight(true) - height3 - height4);
        setMobileHeight6(getDeviceHeight(true) - height3 - height4);
        setWebHeight(getDeviceHeight(true) - height3 - height4);
        setWebHeight2(
          getDeviceHeight(false) - height2 - height3 - height3 - height4
        );
        setWebHeight3(getDeviceHeight(false) - height3 - height3 - height4);
        setWebHeight4(getDeviceHeight(false) - height3 - height3 - height4);
        setWebHeight5(getDeviceHeight(false) - height3 - height3 - height4);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [
    customOptionData,
    tabSelected,
    tabSelected2,
    webheight,
    webheight2,
    webheight3,
    webheight4,
  ]);

  var index = 0;
  var index2 = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [swiper2, setSwiper2] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("BA_A0021W_603", setMessagesData);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters3((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters4((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
  };
  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };
  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage3({
      ...event.page,
    });
  };
  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters4((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage4({
      ...event.page,
    });
  };

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_CM501_603, L_SA001_603, L_CM701, L_CM700, L_sysUserMaster_001, L_BA026, L_BA076, L_BA077",
    setBizComponentData
  );
  const [usegbListData, setUsegbListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [typeListData, setTypeListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [materialtypeListData, setMaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [custdivListData, setCustdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [extra_field2ListData, setExtra_field2ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setUsegbListData(getBizCom(bizComponentData, "L_CM700"));
      setTypeListData(getBizCom(bizComponentData, "L_CM701"));
      setMaterialtypeListData(getBizCom(bizComponentData, "L_SA001_603"));
      setCustdivListData(getBizCom(bizComponentData, "L_BA026"));
      setItemlvl2ListData(getBizCom(bizComponentData, "L_BA076"));
      setItemlvl3ListData(getBizCom(bizComponentData, "L_BA077"));
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setExtra_field2ListData(getBizCom(bizComponentData, "L_CM501_603"));
    }
  }, [bizComponentData]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "yyyy"),
        custdiv: defaultOption.find((item: any) => item.id == "custdiv")
          ?.valueCode,
        itemlvl3: defaultOption.find((item: any) => item.id == "itemlvl3")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const handleSelectTab = (e: any) => {
    if (isMobile) {
      setIsFilterHideStates(true);
    }
    setTabSelected(e.selected);
    setTabSelected2(0);
  };
  const handleSelectTab2 = (e: any) => {
    setTabSelected2(e.selected);
  };
  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "기본정보";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1 && tabSelected2 == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridTwo.sheets[0].title = "상담일지";
        _export2.save(optionsGridTwo);
      }
    }
    if (_export3 !== null && _export3 !== undefined) {
      if (tabSelected == 1 && tabSelected2 == 2) {
        const optionsGridThree = _export3.workbookOptions();
        optionsGridThree.sheets[0].title = "견적";
        _export3.save(optionsGridThree);
      }
    }
    if (_export4 !== null && _export4 !== undefined) {
      if (tabSelected == 1 && tabSelected2 == 3) {
        const optionsGridFour = _export4.workbookOptions();
        optionsGridFour.sheets[0].title = "계약";
        _export4.save(optionsGridFour);
      }
    }
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.yyyy).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "BA_A0021W_603_001");
      } else {
        resetAllGrid();
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
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

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    yyyy: new Date(),
    custcd: "",
    custnm: "",
    custdiv: "",
    itemlvl3: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "MEETING",
    custcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "ESTIMATE",
    custcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    workType: "CONCAT",
    custcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

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
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataState4, setMainDataState4] = useState<State>({
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
  const [mainDataResult4, setMainDataResult4] = useState<DataResult>(
    process([], mainDataState4)
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
  const [selectedState4, setSelectedState4] = useState<{
    [id: string]: boolean | number[];
  }>({});
  let gridRef: any = useRef(null);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0021W_603_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
        "@p_itemlvl3": filters.itemlvl3,
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
        amt: Math.ceil(item.amt),
        cont_amt: Math.ceil(item.cont_amt),
        misu_amt: Math.ceil(item.misu_amt),
        no_amt: Math.ceil(item.no_amt),
      }));

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        setFilters2((prev) => ({
          ...prev,
          custcd: rows[0].custcd,
          isSearch: true,
          pgNum: 1,
        }));
        setFilters3((prev) => ({
          ...prev,
          custcd: rows[0].custcd,
          isSearch: true,
          pgNum: 1,
        }));
        setFilters4((prev) => ({
          ...prev,
          custcd: rows[0].custcd,
          isSearch: true,
          pgNum: 1,
        }));
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
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0021W_603_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_custcd": filters2.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
        "@p_itemlvl3": filters.itemlvl3,
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
      }));

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

  const fetchMainGrid3 = async (filters3: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0021W_603_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_custcd": filters3.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
        "@p_itemlvl3": filters.itemlvl3,
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

  const fetchMainGrid4 = async (filters4: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0021W_603_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": filters4.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_custcd": filters4.custcd,
        "@p_custnm": filters.custnm,
        "@p_custdiv": filters.custdiv,
        "@p_itemlvl3": filters.itemlvl3,
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
        amt: Math.ceil(item.amt),
        change_contraamt: Math.ceil(item.change_contraamt),
        contraamt: Math.ceil(item.contraamt),
        fin_contraamt: Math.ceil(item.fin_contraamt),
        taxamt: Math.ceil(item.taxamt),
      }));

      setMainDataResult4({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
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

      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

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

      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions, bizComponentData, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters4.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);

      setFilters4((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4, permissions, bizComponentData, customOptionData]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters2((prev) => ({
      ...prev,
      custcd: selectedRowData.custcd,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters3((prev) => ({
      ...prev,
      custcd: selectedRowData.custcd,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters4((prev) => ({
      ...prev,
      custcd: selectedRowData.custcd,
      isSearch: true,
      pgNum: 1,
    }));
    setTabSelected(1);
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };
  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    const origin = window.location.origin;
    window.open(
      origin +
        `/CM_A7000W?go=` +
        selectedRowData.orgdiv +
        "_" +
        selectedRowData.meetingnum
    );
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

    const origin = window.location.origin;
    window.open(
      origin +
        `/SA_A1001W_603?go=` +
        selectedRowData.quonum +
        "-" +
        selectedRowData.quorev
    );
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

    const origin = window.location.origin;
    window.open(origin + `/SA_A1100W_603?go=` + selectedRowData.contractno);
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
  const onMainDataStateChange4 = (event: GridDataStateChangeEvent) => {
    setMainDataState4(event.dataState);
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
  const onMainSortChange4 = (e: any) => {
    setMainDataState4((prev) => ({ ...prev, sort: e.sort }));
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

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum = Math.ceil(item["total_" + props.field]))
        : ""
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
      props.field !== undefined
        ? (sum = Math.ceil(item["total_" + props.field]))
        : ""
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
      props.field !== undefined
        ? (sum = Math.ceil(item["total_" + props.field]))
        : ""
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

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>고객이력관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="BA_A0021W_603"
            />
          )}
        </ButtonContainer>
      </TitleContainer>

      {isMobile ? (
        <>
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
                      placeholder=""
                      calendar={YearCalendar}
                      className="required"
                    />
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
                  <th>구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="custdiv"
                        value={filters.custdiv}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>개발분야</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="itemlvl3"
                        value={filters.itemlvl3}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer style={{ width: "100%", overflow: "auto" }}>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="고객이력관리"
                >
                  <Grid
                    style={{ height: mobileheight }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        custdiv: custdivListData.find(
                          (item: any) => item.sub_code == row.custdiv
                        )?.code_name,
                        itemlvl3: itemlvl3ListData.find(
                          (item: any) => item.sub_code == row.itemlvl3
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
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : centerField.includes(item.fieldName)
                                    ? CenterCell
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
            </SwiperSlide>
            <SwiperSlide key={1}>
              <TabStrip
                selected={tabSelected2}
                onSelect={handleSelectTab2}
                style={{ width: "100%" }}
                scrollable={isMobile}
              >
                <TabStripTab
                  title="고객정보"
                  disabled={permissions.view ? false : true}
                >
                  <Swiper
                    onSwiper={(swiper2) => {
                      setSwiper2(swiper2);
                    }}
                    onActiveIndexChange={(swiper2) => {
                      index2 = swiper2.activeIndex;
                    }}
                  >
                    <SwiperSlide key={0}>
                      <GridContainer style={{ width: "100%" }}>
                        <GridTitleContainer className="ButtonContainer">
                          <ButtonContainer
                            style={{ justifyContent: "space-between" }}
                          >
                            <GridTitle>고객 기본정보</GridTitle>
                            <Button
                              onClick={() => {
                                if (swiper2) {
                                  swiper2.slideTo(1);
                                }
                              }}
                              icon="chevron-right"
                              themeColor={"primary"}
                              fillMode={"flat"}
                            ></Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <FormBoxWrap
                          border={true}
                          style={{
                            height: mobileheight2,
                            overflow: "auto",
                          }}
                        >
                          <FormBox>
                            <tbody>
                              <tr>
                                <th>업체명</th>
                                <td>
                                  <Input
                                    name="custnm"
                                    type="text"
                                    value={
                                      mainDataResult.data.filter(
                                        (item) =>
                                          item[DATA_ITEM_KEY] ==
                                          Object.getOwnPropertyNames(
                                            selectedState
                                          )[0]
                                      )[0] == undefined
                                        ? ""
                                        : mainDataResult.data.filter(
                                            (item) =>
                                              item[DATA_ITEM_KEY] ==
                                              Object.getOwnPropertyNames(
                                                selectedState
                                              )[0]
                                          )[0].custnm
                                    }
                                    className="readonly"
                                  />
                                </td>
                                <th>개발분야</th>
                                <td>
                                  <Input
                                    name="itemlvl3"
                                    type="text"
                                    value={
                                      itemlvl3ListData.find(
                                        (item: any) =>
                                          item.sub_code ==
                                          (mainDataResult.data.filter(
                                            (item) =>
                                              item[DATA_ITEM_KEY] ==
                                              Object.getOwnPropertyNames(
                                                selectedState
                                              )[0]
                                          )[0] == undefined
                                            ? ""
                                            : mainDataResult.data.filter(
                                                (item) =>
                                                  item[DATA_ITEM_KEY] ==
                                                  Object.getOwnPropertyNames(
                                                    selectedState
                                                  )[0]
                                              )[0].itemlvl3)
                                      ) == undefined
                                        ? ""
                                        : itemlvl3ListData.find(
                                            (item: any) =>
                                              item.sub_code ==
                                              (mainDataResult.data.filter(
                                                (item) =>
                                                  item[DATA_ITEM_KEY] ==
                                                  Object.getOwnPropertyNames(
                                                    selectedState
                                                  )[0]
                                              )[0] == undefined
                                                ? ""
                                                : mainDataResult.data.filter(
                                                    (item) =>
                                                      item[DATA_ITEM_KEY] ==
                                                      Object.getOwnPropertyNames(
                                                        selectedState
                                                      )[0]
                                                  )[0].itemlvl3)
                                          )?.code_name
                                    }
                                    className="readonly"
                                  />
                                </td>
                                <th>기업구분</th>
                                <td>
                                  <Input
                                    name="itemlvl2"
                                    type="text"
                                    value={
                                      itemlvl2ListData.find(
                                        (item: any) =>
                                          item.sub_code ==
                                          (mainDataResult.data.filter(
                                            (item) =>
                                              item[DATA_ITEM_KEY] ==
                                              Object.getOwnPropertyNames(
                                                selectedState
                                              )[0]
                                          )[0] == undefined
                                            ? ""
                                            : mainDataResult.data.filter(
                                                (item) =>
                                                  item[DATA_ITEM_KEY] ==
                                                  Object.getOwnPropertyNames(
                                                    selectedState
                                                  )[0]
                                              )[0].itemlvl2)
                                      ) == undefined
                                        ? ""
                                        : itemlvl2ListData.find(
                                            (item: any) =>
                                              item.sub_code ==
                                              (mainDataResult.data.filter(
                                                (item) =>
                                                  item[DATA_ITEM_KEY] ==
                                                  Object.getOwnPropertyNames(
                                                    selectedState
                                                  )[0]
                                              )[0] == undefined
                                                ? ""
                                                : mainDataResult.data.filter(
                                                    (item) =>
                                                      item[DATA_ITEM_KEY] ==
                                                      Object.getOwnPropertyNames(
                                                        selectedState
                                                      )[0]
                                                  )[0].itemlvl2)
                                          )?.code_name
                                    }
                                    className="readonly"
                                  />
                                </td>
                              </tr>
                              <tr>
                                <th>계약금액</th>
                                <td>
                                  <Input
                                    name="cont_amt"
                                    type="text"
                                    value={
                                      mainDataResult.data.filter(
                                        (item) =>
                                          item[DATA_ITEM_KEY] ==
                                          Object.getOwnPropertyNames(
                                            selectedState
                                          )[0]
                                      )[0] == undefined
                                        ? 0
                                        : numberWithCommas3(
                                            mainDataResult.data.filter(
                                              (item) =>
                                                item[DATA_ITEM_KEY] ==
                                                Object.getOwnPropertyNames(
                                                  selectedState
                                                )[0]
                                            )[0].cont_amt
                                          )
                                    }
                                    style={{ textAlign: "right" }}
                                    className="readonly"
                                  />
                                </td>
                                <th>기청구액</th>
                                <td>
                                  <Input
                                    name="amt"
                                    type="text"
                                    value={
                                      mainDataResult.data.filter(
                                        (item) =>
                                          item[DATA_ITEM_KEY] ==
                                          Object.getOwnPropertyNames(
                                            selectedState
                                          )[0]
                                      )[0] == undefined
                                        ? 0
                                        : numberWithCommas3(
                                            mainDataResult.data.filter(
                                              (item) =>
                                                item[DATA_ITEM_KEY] ==
                                                Object.getOwnPropertyNames(
                                                  selectedState
                                                )[0]
                                            )[0].amt
                                          )
                                    }
                                    style={{ textAlign: "right" }}
                                    className="readonly"
                                  />
                                </td>
                                <th>미청구액</th>
                                <td>
                                  <Input
                                    name="no_amt"
                                    type="text"
                                    value={
                                      mainDataResult.data.filter(
                                        (item) =>
                                          item[DATA_ITEM_KEY] ==
                                          Object.getOwnPropertyNames(
                                            selectedState
                                          )[0]
                                      )[0] == undefined
                                        ? 0
                                        : numberWithCommas3(
                                            mainDataResult.data.filter(
                                              (item) =>
                                                item[DATA_ITEM_KEY] ==
                                                Object.getOwnPropertyNames(
                                                  selectedState
                                                )[0]
                                            )[0].no_amt
                                          )
                                    }
                                    style={{ textAlign: "right" }}
                                    className="readonly"
                                  />
                                </td>
                                <th>미수금액</th>
                                <td>
                                  <Input
                                    name="misu_amt"
                                    type="text"
                                    value={
                                      mainDataResult.data.filter(
                                        (item) =>
                                          item[DATA_ITEM_KEY] ==
                                          Object.getOwnPropertyNames(
                                            selectedState
                                          )[0]
                                      )[0] == undefined
                                        ? 0
                                        : numberWithCommas3(
                                            mainDataResult.data.filter(
                                              (item) =>
                                                item[DATA_ITEM_KEY] ==
                                                Object.getOwnPropertyNames(
                                                  selectedState
                                                )[0]
                                            )[0].misu_amt
                                          )
                                    }
                                    style={{ textAlign: "right" }}
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
                        <CommentsGrid
                          ref_key={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].custcd
                          }
                          form_id={"BA_A0021W_603"}
                          table_id={"BA020T"}
                          style={{ height: mobileheight3 }}
                        />
                      </GridContainer>
                    </SwiperSlide>
                  </Swiper>
                </TabStripTab>
                <TabStripTab
                  title="상담일지"
                  disabled={permissions.view ? false : true}
                >
                  <GridContainer>
                    <ExcelExport
                      data={mainDataResult2.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName="고객이력관리"
                    >
                      <Grid
                        style={{ height: mobileheight4 }}
                        data={process(
                          mainDataResult2.data.map((row) => ({
                            ...row,
                            person: userListData.find(
                              (items: any) => items.user_id == row.person
                            )?.user_name,
                            materialtype: materialtypeListData.find(
                              (item: any) => item.sub_code == row.materialtype
                            )?.code_name,
                            type: typeListData.find(
                              (item: any) => item.sub_code == row.type
                            )?.code_name,
                            usegb: usegbListData.find(
                              (item: any) => item.sub_code == row.usegb
                            )?.code_name,
                            extra_field2: extra_field2ListData.find(
                              (items: any) => items.sub_code == row.extra_field2
                            )?.code_name,
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
                  title="견적"
                  disabled={permissions.view ? false : true}
                >
                  <GridContainer>
                    <ExcelExport
                      data={mainDataResult3.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="고객이력관리"
                    >
                      <Grid
                        style={{ height: mobileheight5 }}
                        data={process(
                          mainDataResult3.data.map((row) => ({
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
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : dateField.includes(item.fieldName)
                                        ? DateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell3
                                        : numberField.includes(item.fieldName)
                                        ? gridSumQtyFooterCell3
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
                  title="계약"
                  disabled={permissions.view ? false : true}
                >
                  <GridContainer>
                    <ExcelExport
                      data={mainDataResult4.data}
                      ref={(exporter) => {
                        _export4 = exporter;
                      }}
                      fileName="고객이력관리"
                    >
                      <Grid
                        style={{ height: mobileheight6 }}
                        data={process(
                          mainDataResult4.data.map((row) => ({
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
                            [SELECTED_FIELD]: selectedState4[idGetter4(row)], //선택된 데이터
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
                                        ? mainTotalFooterCell4
                                        : numberField.includes(item.fieldName)
                                        ? gridSumQtyFooterCell4
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
        </>
      ) : (
        <>
          <TabStrip
            selected={tabSelected}
            onSelect={handleSelectTab}
            style={{ width: "100%" }}
            scrollable={isMobile}
          >
            <TabStripTab
              title="조회"
              disabled={permissions.view ? false : true}
            >
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
                          placeholder=""
                          calendar={YearCalendar}
                          className="required"
                        />
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
                      <th>구분</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="custdiv"
                            value={filters.custdiv}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                          />
                        )}
                      </td>
                      <th>개발분야</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="itemlvl3"
                            value={filters.itemlvl3}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
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
                  fileName="고객이력관리"
                >
                  <Grid
                    style={{ height: webheight }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        custdiv: custdivListData.find(
                          (item: any) => item.sub_code == row.custdiv
                        )?.code_name,
                        itemlvl3: itemlvl3ListData.find(
                          (item: any) => item.sub_code == row.itemlvl3
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
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : centerField.includes(item.fieldName)
                                    ? CenterCell
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
              title="처리"
              disabled={
                permissions.view
                  ? mainDataResult.total == 0
                    ? true
                    : false
                  : true
              }
            >
              <TabStrip
                selected={tabSelected2}
                onSelect={handleSelectTab2}
                style={{ width: "100%" }}
                scrollable={isMobile}
              >
                <TabStripTab
                  title="고객정보"
                  disabled={permissions.view ? false : true}
                >
                  <FormBoxWrap border={true} className="FormBoxWrap">
                    <GridTitleContainer>
                      <GridTitle>고객 기본정보</GridTitle>
                    </GridTitleContainer>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>업체명</th>
                          <td>
                            <Input
                              name="custnm"
                              type="text"
                              value={
                                mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0] == undefined
                                  ? ""
                                  : mainDataResult.data.filter(
                                      (item) =>
                                        item[DATA_ITEM_KEY] ==
                                        Object.getOwnPropertyNames(
                                          selectedState
                                        )[0]
                                    )[0].custnm
                              }
                              className="readonly"
                            />
                          </td>
                          <th>개발분야</th>
                          <td>
                            <Input
                              name="itemlvl3"
                              type="text"
                              value={
                                itemlvl3ListData.find(
                                  (item: any) =>
                                    item.sub_code ==
                                    (mainDataResult.data.filter(
                                      (item) =>
                                        item[DATA_ITEM_KEY] ==
                                        Object.getOwnPropertyNames(
                                          selectedState
                                        )[0]
                                    )[0] == undefined
                                      ? ""
                                      : mainDataResult.data.filter(
                                          (item) =>
                                            item[DATA_ITEM_KEY] ==
                                            Object.getOwnPropertyNames(
                                              selectedState
                                            )[0]
                                        )[0].itemlvl3)
                                ) == undefined
                                  ? ""
                                  : itemlvl3ListData.find(
                                      (item: any) =>
                                        item.sub_code ==
                                        (mainDataResult.data.filter(
                                          (item) =>
                                            item[DATA_ITEM_KEY] ==
                                            Object.getOwnPropertyNames(
                                              selectedState
                                            )[0]
                                        )[0] == undefined
                                          ? ""
                                          : mainDataResult.data.filter(
                                              (item) =>
                                                item[DATA_ITEM_KEY] ==
                                                Object.getOwnPropertyNames(
                                                  selectedState
                                                )[0]
                                            )[0].itemlvl3)
                                    )?.code_name
                              }
                              className="readonly"
                            />
                          </td>
                          <th>기업구분</th>
                          <td>
                            <Input
                              name="itemlvl2"
                              type="text"
                              value={
                                itemlvl2ListData.find(
                                  (item: any) =>
                                    item.sub_code ==
                                    (mainDataResult.data.filter(
                                      (item) =>
                                        item[DATA_ITEM_KEY] ==
                                        Object.getOwnPropertyNames(
                                          selectedState
                                        )[0]
                                    )[0] == undefined
                                      ? ""
                                      : mainDataResult.data.filter(
                                          (item) =>
                                            item[DATA_ITEM_KEY] ==
                                            Object.getOwnPropertyNames(
                                              selectedState
                                            )[0]
                                        )[0].itemlvl2)
                                ) == undefined
                                  ? ""
                                  : itemlvl2ListData.find(
                                      (item: any) =>
                                        item.sub_code ==
                                        (mainDataResult.data.filter(
                                          (item) =>
                                            item[DATA_ITEM_KEY] ==
                                            Object.getOwnPropertyNames(
                                              selectedState
                                            )[0]
                                        )[0] == undefined
                                          ? ""
                                          : mainDataResult.data.filter(
                                              (item) =>
                                                item[DATA_ITEM_KEY] ==
                                                Object.getOwnPropertyNames(
                                                  selectedState
                                                )[0]
                                            )[0].itemlvl2)
                                    )?.code_name
                              }
                              className="readonly"
                            />
                          </td>
                          <th></th>
                          <td></td>
                        </tr>
                        <tr>
                          <th>계약금액</th>
                          <td>
                            <Input
                              name="cont_amt"
                              type="text"
                              value={
                                mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0] == undefined
                                  ? 0
                                  : numberWithCommas3(
                                      mainDataResult.data.filter(
                                        (item) =>
                                          item[DATA_ITEM_KEY] ==
                                          Object.getOwnPropertyNames(
                                            selectedState
                                          )[0]
                                      )[0].cont_amt
                                    )
                              }
                              style={{ textAlign: "right" }}
                              className="readonly"
                            />
                          </td>
                          <th>기청구액</th>
                          <td>
                            <Input
                              name="amt"
                              type="text"
                              value={
                                mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0] == undefined
                                  ? 0
                                  : numberWithCommas3(
                                      mainDataResult.data.filter(
                                        (item) =>
                                          item[DATA_ITEM_KEY] ==
                                          Object.getOwnPropertyNames(
                                            selectedState
                                          )[0]
                                      )[0].amt
                                    )
                              }
                              style={{ textAlign: "right" }}
                              className="readonly"
                            />
                          </td>
                          <th>미청구액</th>
                          <td>
                            <Input
                              name="no_amt"
                              type="text"
                              value={
                                mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0] == undefined
                                  ? 0
                                  : numberWithCommas3(
                                      mainDataResult.data.filter(
                                        (item) =>
                                          item[DATA_ITEM_KEY] ==
                                          Object.getOwnPropertyNames(
                                            selectedState
                                          )[0]
                                      )[0].no_amt
                                    )
                              }
                              style={{ textAlign: "right" }}
                              className="readonly"
                            />
                          </td>
                          <th>미수금액</th>
                          <td>
                            <Input
                              name="misu_amt"
                              type="text"
                              value={
                                mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0] == undefined
                                  ? 0
                                  : numberWithCommas3(
                                      mainDataResult.data.filter(
                                        (item) =>
                                          item[DATA_ITEM_KEY] ==
                                          Object.getOwnPropertyNames(
                                            selectedState
                                          )[0]
                                      )[0].misu_amt
                                    )
                              }
                              style={{ textAlign: "right" }}
                              className="readonly"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                  <GridContainer>
                    <CommentsGrid
                      ref_key={
                        mainDataResult.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY] ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? ""
                          : mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].custcd
                      }
                      form_id={"BA_A0021W_603"}
                      table_id={"BA020T"}
                      style={{ height: webheight2 }}
                    />
                  </GridContainer>
                </TabStripTab>
                <TabStripTab
                  title="상담일지"
                  disabled={permissions.view ? false : true}
                >
                  <GridContainer>
                    <ExcelExport
                      data={mainDataResult2.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName="고객이력관리"
                    >
                      <Grid
                        style={{ height: webheight3 }}
                        data={process(
                          mainDataResult2.data.map((row) => ({
                            ...row,
                            person: userListData.find(
                              (items: any) => items.user_id == row.person
                            )?.user_name,
                            materialtype: materialtypeListData.find(
                              (item: any) => item.sub_code == row.materialtype
                            )?.code_name,
                            type: typeListData.find(
                              (item: any) => item.sub_code == row.type
                            )?.code_name,
                            usegb: usegbListData.find(
                              (item: any) => item.sub_code == row.usegb
                            )?.code_name,
                            extra_field2: extra_field2ListData.find(
                              (items: any) => items.sub_code == row.extra_field2
                            )?.code_name,
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
                  title="견적"
                  disabled={permissions.view ? false : true}
                >
                  <GridContainer>
                    <ExcelExport
                      data={mainDataResult3.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="고객이력관리"
                    >
                      <Grid
                        style={{ height: webheight4 }}
                        data={process(
                          mainDataResult3.data.map((row) => ({
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
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : dateField.includes(item.fieldName)
                                        ? DateCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell3
                                        : numberField.includes(item.fieldName)
                                        ? gridSumQtyFooterCell3
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
                  title="계약"
                  disabled={permissions.view ? false : true}
                >
                  <GridContainer>
                    <ExcelExport
                      data={mainDataResult4.data}
                      ref={(exporter) => {
                        _export4 = exporter;
                      }}
                      fileName="고객이력관리"
                    >
                      <Grid
                        style={{ height: webheight5 }}
                        data={process(
                          mainDataResult4.data.map((row) => ({
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
                            [SELECTED_FIELD]: selectedState4[idGetter4(row)], //선택된 데이터
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
                                        ? mainTotalFooterCell4
                                        : numberField.includes(item.fieldName)
                                        ? gridSumQtyFooterCell4
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
            </TabStripTab>
          </TabStrip>
        </>
      )}

      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
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

export default BA_A0021W_603;
