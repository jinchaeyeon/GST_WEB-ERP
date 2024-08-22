import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
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
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  convertDateToStr,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getHeight,
  getMenuName,
  GetPropertyValueByName,
  handleKeyPressSearch,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { ICustData, IItemData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/QC_B0020W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
const DATA_ITEM_KEY5 = "num";
const numberField = ["qty", "procseq", "badqty", "inqty"];
const numberField2 = ["qty", "badqty", "inqty"];
const dateField = ["indt", "proddt", "outdt"];

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
const QC_B0020W: React.FC = () => {
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const idGetter5 = getter(DATA_ITEM_KEY5);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [tabSelected, setTabSelected] = useState(0);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [mobileheight5, setMobileHeight5] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  const [webheight5, setWebHeight5] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".ButtonContainer2");
      height4 = getHeight(".ButtonContainer3");
      height5 = getHeight(".ButtonContainer4");
      height6 = getHeight(".ButtonContainer5");
      height7 = getHeight(".k-tabstrip-items-wrapper");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2 - height7);
        setMobileHeight2(getDeviceHeight(true) - height - height3 - height7);
        setMobileHeight3(getDeviceHeight(true) - height - height4);
        setMobileHeight4(getDeviceHeight(true) - height - height5);
        setMobileHeight5(getDeviceHeight(true) - height - height6);
        setWebHeight((getDeviceHeight(true) - height) / 2 - height2 - height7);
        setWebHeight2((getDeviceHeight(true) - height) / 2 - height3 - height7);
        setWebHeight3((getDeviceHeight(true) - height) / 2 - height4);
        setWebHeight4((getDeviceHeight(true) - height) / 2 - height5);
        setWebHeight5((getDeviceHeight(true) - height) / 2 - height6);
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
    webheight,
    webheight2,
    webheight3,
    webheight4,
    webheight5,
  ]);

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
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        proccd: defaultOption.find((item: any) => item.id == "proccd")
          ?.valueCode,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA002, L_PR010, L_BA061, L_BA015, L_sysUserMaster_001",
    //공정, 관리항목리스트
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setProccdListData(getBizCom(bizComponentData, "L_PR010"));
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setPersonListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setLocationListData(getBizCom(bizComponentData, "L_BA002"));
    }
  }, [bizComponentData]);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: "",
    dtgb: "A",
    frdt: new Date(),
    todt: new Date(),
    custcd: "",
    custnm: "",
    rekey: "",
    insiz: "",
    lotnum: "",
    itemcd: "",
    itemnm: "",
    ordkey: "",
    proccd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    lotnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    lotnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters5, setFilters5] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    lotnum: "",
    find_row_value: "",
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

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
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
  const [mainDataState5, setMainDataState5] = useState<State>({
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
  const [mainDataResult5, setMainDataResult5] = useState<DataResult>(
    process([], mainDataState5)
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
  const [selectedState5, setSelectedState5] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_B0020W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "FinishProc",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_rekey": filters.rekey,
        "@p_insiz": filters.insiz,
        "@p_lotnum": filters.lotnum,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_ordkey": filters.ordkey,
        "@p_proccd": filters.proccd,
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

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        setFilters3((prev) => ({
          ...prev,
          isSearch: true,
          lotnum: rows[0].lotnum,
          pgNum: 1,
        }));
        setFilters4((prev) => ({
          ...prev,
          isSearch: true,
          lotnum: rows[0].lotnum,
          pgNum: 1,
        }));
        setFilters5((prev) => ({
          ...prev,
          isSearch: true,
          lotnum: rows[0].lotnum,
          pgNum: 1,
        }));
      } else {
        setPage3(initialPageState);
        setPage4(initialPageState);
        setPage5(initialPageState);
        setMainDataResult3(process([], mainDataState3));
        setMainDataResult4(process([], mainDataState4));
        setMainDataResult5(process([], mainDataState5));
      }
    }
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
      procedureName: "P_QC_B0020W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "OutProd",
        "@p_orgdiv": filters2.orgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_rekey": filters.rekey,
        "@p_insiz": filters.insiz,
        "@p_lotnum": filters.lotnum,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_ordkey": filters.ordkey,
        "@p_proccd": filters.proccd,
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

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
        setFilters3((prev) => ({
          ...prev,
          isSearch: true,
          lotnum: rows[0].lotnum,
          pgNum: 1,
        }));
        setFilters4((prev) => ({
          ...prev,
          isSearch: true,
          lotnum: rows[0].lotnum,
          pgNum: 1,
        }));
        setFilters5((prev) => ({
          ...prev,
          isSearch: true,
          lotnum: rows[0].lotnum,
          pgNum: 1,
        }));
      } else {
        setPage3(initialPageState);
        setPage4(initialPageState);
        setPage5(initialPageState);
        setMainDataResult3(process([], mainDataState3));
        setMainDataResult4(process([], mainDataState4));
        setMainDataResult5(process([], mainDataState5));
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
      procedureName: "P_QC_B0020W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_rekey": filters.rekey,
        "@p_insiz": filters.insiz,
        "@p_lotnum": filters3.lotnum,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_ordkey": filters.ordkey,
        "@p_proccd": filters.proccd,
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

      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    }
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
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_B0020W_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": "DETAIL2",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_rekey": filters.rekey,
        "@p_insiz": filters.insiz,
        "@p_lotnum": filters4.lotnum,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_ordkey": filters.ordkey,
        "@p_proccd": filters.proccd,
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

      setMainDataResult4((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
      }
    }
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
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_B0020W_Q",
      pageNumber: filters5.pgNum,
      pageSize: filters5.pgSize,
      parameters: {
        "@p_work_type": "DETAIL3",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_rekey": filters.rekey,
        "@p_insiz": filters.insiz,
        "@p_lotnum": filters5.lotnum,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_ordkey": filters.ordkey,
        "@p_proccd": filters.proccd,
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

      setMainDataResult5((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState5({ [rows[0][DATA_ITEM_KEY5]]: true });
      }
    }
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData, bizComponentData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters2.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData, bizComponentData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters3.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions, customOptionData, bizComponentData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
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

  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setPage5(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    setMainDataResult5(process([], mainDataState5));
  };

  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        const optionsGridFout = _export4.workbookOptions();
        const optionsGridFive = _export5.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridThree.sheets[0];
        optionsGridOne.sheets[2] = optionsGridFout.sheets[0];
        optionsGridOne.sheets[3] = optionsGridFive.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "생산실적 및 투입소재 정보";
        optionsGridOne.sheets[2].title = "입고내역";
        optionsGridOne.sheets[3].title = "불출내역";
        _export.save(optionsGridOne);
      } else {
        const optionsGridTwo = _export2.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        const optionsGridFout = _export4.workbookOptions();
        const optionsGridFive = _export5.workbookOptions();
        optionsGridTwo.sheets[1] = optionsGridThree.sheets[0];
        optionsGridTwo.sheets[2] = optionsGridFout.sheets[0];
        optionsGridTwo.sheets[3] = optionsGridFive.sheets[0];
        optionsGridTwo.sheets[0].title = "요약정보";
        optionsGridTwo.sheets[1].title = "생산실적 및 투입소재 정보";
        optionsGridTwo.sheets[2].title = "입고내역";
        optionsGridTwo.sheets[3].title = "불출내역";
        _export2.save(optionsGridTwo);
      }
    }
  };
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };
  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_B0020W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_B0020W_001");
      } else if (
        filters.location == "" ||
        filters.location == null ||
        filters.location == undefined
      ) {
        throw findMessage(messagesData, "QC_B0020W_001");
      } else {
        resetAllGrid();
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        setFilters2((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        if(swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
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
  const onMainDataStateChange5 = (event: GridDataStateChangeEvent) => {
    setMainDataState5(event.dataState);
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
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
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
  //그리드 푸터
  const mainTotalFooterCell4 = (props: GridFooterCellProps) => {
    var parts = mainDataResult4.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult4.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  //그리드 푸터
  const mainTotalFooterCell5 = (props: GridFooterCellProps) => {
    var parts = mainDataResult5.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult5.total == -1
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
  const gridSumQtyFooterCell5 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult5.data.forEach((item) =>
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
  const onMainSortChange5 = (e: any) => {
    setMainDataState5((prev) => ({ ...prev, sort: e.sort }));
  };
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

    setFilters3((prev) => ({
      ...prev,
      isSearch: true,
      lotnum: selectedRowData.lotnum,
      pgNum: 1,
    }));
    setFilters4((prev) => ({
      ...prev,
      isSearch: true,
      lotnum: selectedRowData.lotnum,
      pgNum: 1,
    }));
    setFilters5((prev) => ({
      ...prev,
      isSearch: true,
      lotnum: selectedRowData.lotnum,
      pgNum: 1,
    }));
    if(swiper && isMobile) {
      swiper.slideTo(1);
    }
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

    setFilters3((prev) => ({
      ...prev,
      isSearch: true,
      lotnum: selectedRowData.lotnum,
      pgNum: 1,
    }));
    setFilters4((prev) => ({
      ...prev,
      isSearch: true,
      lotnum: selectedRowData.lotnum,
      pgNum: 1,
    }));
    setFilters5((prev) => ({
      ...prev,
      isSearch: true,
      lotnum: selectedRowData.lotnum,
      pgNum: 1,
    }));
    if(swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedState3(newSelectedState);
  };
  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });
    setSelectedState4(newSelectedState);
  };
  const onSelectionChange5 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState5,
      dataItemKey: DATA_ITEM_KEY5,
    });
    setSelectedState5(newSelectedState);
  };
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setPage3(initialPageState);
    setPage4(initialPageState);
    setPage5(initialPageState);
    setFilters3((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters4((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters5((prev) => ({
      ...prev,
      pgNum: 1,
    }));
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

    setPage3(initialPageState);
    setPage4(initialPageState);
    setPage5(initialPageState);
    setFilters3((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters4((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setFilters5((prev) => ({
      ...prev,
      pgNum: 1,
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

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

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

  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

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

  const pageChange5 = (event: GridPageChangeEvent) => {
    const { page } = event;

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
              <th>생산실적번호</th>
              <td>
                <Input
                  name="rekey"
                  type="text"
                  value={filters.rekey}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onItemWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>수주번호</th>
              <td>
                <Input
                  name="ordkey"
                  type="text"
                  value={filters.ordkey}
                  onChange={filterInputChange}
                />
              </td>
              <th>공정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="proccd"
                    value={filters.proccd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
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
                <TabStrip
                  style={{ width: "100%" }}
                  selected={tabSelected}
                  onSelect={handleSelectTab}
                  scrollable={isMobile}
                >
                  <TabStripTab
                    title="완제품입고"
                    disabled={permissions.view ? false : true}
                  >
                    <GridContainer>
                      <ExcelExport
                        data={mainDataResult.data}
                        ref={(exporter) => {
                          _export = exporter;
                        }}
                        fileName={getMenuName()}
                      >
                        <GridTitleContainer className="ButtonContainer">
                          <GridTitle>기본정보</GridTitle>
                          <ButtonContainer>
                            <Button
                              onClick={() => {
                                if (swiper && isMobile) {
                                  swiper.slideTo(1);
                                }
                              }}
                              icon="arrow-right"
                              themeColor={"primary"}
                              fillMode={"outline"}
                            >
                              다음
                            </Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <Grid
                          style={{
                            height: mobileheight,
                          }}
                          data={process(
                            mainDataResult.data.map((row) => ({
                              ...row,
                              qtyunit: qtyunitListData.find(
                                (item: any) => item.sub_code == row.qtyunit
                              )?.code_name,
                              itemacnt: itemacntListData.find(
                                (item: any) => item.sub_code == row.itemacnt
                              )?.code_name,
                              proccd: proccdListData.find(
                                (item: any) => item.sub_code == row.proccd
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
                                          ? mainTotalFooterCell
                                          : numberField2.includes(
                                              item.fieldName
                                            )
                                          ? gridSumQtyFooterCell
                                          : undefined
                                      }
                                    ></GridColumn>
                                  )
                              )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </TabStripTab>
                  <TabStripTab
                    title="출하처리"
                    disabled={permissions.view ? false : true}
                  >
                    <GridContainer>
                      <ExcelExport
                        data={mainDataResult2.data}
                        ref={(exporter) => {
                          _export2 = exporter;
                        }}
                        fileName={getMenuName()}
                      >
                        <GridTitleContainer className="ButtonContainer2">
                          <GridTitle>기본정보</GridTitle>
                          <ButtonContainer>
                            <Button
                              onClick={() => {
                                if (swiper && isMobile) {
                                  swiper.slideTo(1);
                                }
                              }}
                              icon="arrow-right"
                              themeColor={"primary"}
                              fillMode={"outline"}
                            >
                              다음
                            </Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <Grid
                          style={{
                            height: mobileheight2,
                          }}
                          data={process(
                            mainDataResult2.data.map((row) => ({
                              ...row,
                              person: personListData.find(
                                (item: any) => item.user_id == row.person
                              )?.user_name,
                              qtyunit: qtyunitListData.find(
                                (item: any) => item.sub_code == row.qtyunit
                              )?.code_name,
                              itemacnt: itemacntListData.find(
                                (item: any) => item.sub_code == row.itemacnt
                              )?.code_name,
                              location: locationListData.find(
                                (item: any) => item.sub_code == row.location
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
                                          : numberField2.includes(
                                              item.fieldName
                                            )
                                          ? gridSumQtyFooterCell2
                                          : undefined
                                      }
                                    ></GridColumn>
                                  )
                              )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </TabStripTab>
                </TabStrip>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult3.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName={getMenuName()}
                >
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
                          icon="arrow-left"
                          themeColor={"primary"}
                          fillMode={"outline"}
                        >
                          이전
                        </Button>
                        생산실적 및 투입소재 정보
                      </GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(2);
                          }
                        }}
                        icon="arrow-right"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        다음
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Grid
                    style={{
                      height: mobileheight3,
                    }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
                        location: locationListData.find(
                          (item: any) => item.sub_code == row.location
                        )?.code_name,
                        prodemp: personListData.find(
                          (item: any) => item.user_id == row.prodemp
                        )?.user_name,
                        proccd: proccdListData.find(
                          (item: any) => item.sub_code == row.proccd
                        )?.code_name,
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
                              ></GridColumn>
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult4.data}
                  ref={(exporter) => {
                    _export4 = exporter;
                  }}
                  fileName={getMenuName()}
                >
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
                          icon="arrow-left"
                          themeColor={"primary"}
                          fillMode={"outline"}
                        >
                          이전
                        </Button>
                        입고내역
                      </GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(3);
                          }
                        }}
                        icon="arrow-right"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        다음
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Grid
                    style={{
                      height: mobileheight4,
                    }}
                    data={process(
                      mainDataResult4.data.map((row) => ({
                        ...row,
                        location: locationListData.find(
                          (item: any) => item.sub_code == row.location
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
                              ></GridColumn>
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={3}>
              <GridContainer>
                <ExcelExport
                  data={mainDataResult5.data}
                  ref={(exporter) => {
                    _export5 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <GridTitleContainer className="ButtonContainer5">
                    <GridTitle>
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
                      불출내역
                    </GridTitle>
                  </GridTitleContainer>
                  <Grid
                    style={{
                      height: mobileheight5,
                    }}
                    data={process(
                      mainDataResult5.data.map((row) => ({
                        ...row,
                        person: personListData.find(
                          (item: any) => item.user_id == row.person
                        )?.user_name,
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
                                    ? mainTotalFooterCell5
                                    : numberField2.includes(item.fieldName)
                                    ? gridSumQtyFooterCell5
                                    : undefined
                                }
                              ></GridColumn>
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
          <TabStrip
            style={{ width: "100%" }}
            selected={tabSelected}
            onSelect={handleSelectTab}
            scrollable={isMobile}
          >
            <TabStripTab
              title="완제품입고"
              disabled={permissions.view ? false : true}
            >
              <GridContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>기본정보</GridTitle>
                  </GridTitleContainer>
                  <Grid
                    style={{
                      height: webheight,
                    }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        qtyunit: qtyunitListData.find(
                          (item: any) => item.sub_code == row.qtyunit
                        )?.code_name,
                        itemacnt: itemacntListData.find(
                          (item: any) => item.sub_code == row.itemacnt
                        )?.code_name,
                        proccd: proccdListData.find(
                          (item: any) => item.sub_code == row.proccd
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
                                    ? mainTotalFooterCell
                                    : numberField2.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
                                    : undefined
                                }
                              ></GridColumn>
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </TabStripTab>
            <TabStripTab
              title="출하처리"
              disabled={permissions.view ? false : true}
            >
              <GridContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>기본정보</GridTitle>
                  </GridTitleContainer>
                  <Grid
                    style={{
                      height: webheight2,
                    }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        person: personListData.find(
                          (item: any) => item.user_id == row.person
                        )?.user_name,
                        qtyunit: qtyunitListData.find(
                          (item: any) => item.sub_code == row.qtyunit
                        )?.code_name,
                        itemacnt: itemacntListData.find(
                          (item: any) => item.sub_code == row.itemacnt
                        )?.code_name,
                        location: locationListData.find(
                          (item: any) => item.sub_code == row.location
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
                  >
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
                              ></GridColumn>
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </TabStripTab>
          </TabStrip>
          <GridContainer>
            <ExcelExport
              data={mainDataResult3.data}
              ref={(exporter) => {
                _export3 = exporter;
              }}
              fileName={getMenuName()}
            >
              <GridTitleContainer className="ButtonContainer3">
                <GridTitle>생산실적 및 투입소재 정보</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{
                  height: webheight3,
                }}
                data={process(
                  mainDataResult3.data.map((row) => ({
                    ...row,
                    location: locationListData.find(
                      (item: any) => item.sub_code == row.location
                    )?.code_name,
                    prodemp: personListData.find(
                      (item: any) => item.user_id == row.prodemp
                    )?.user_name,
                    proccd: proccdListData.find(
                      (item: any) => item.sub_code == row.proccd
                    )?.code_name,
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
                          ></GridColumn>
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
          <GridContainerWrap>
            <GridContainer width="60%">
              <ExcelExport
                data={mainDataResult4.data}
                ref={(exporter) => {
                  _export4 = exporter;
                }}
                fileName={getMenuName()}
              >
                <GridTitleContainer className="ButtonContainer4">
                  <GridTitle>입고내역</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{
                    height: webheight4,
                  }}
                  data={process(
                    mainDataResult4.data.map((row) => ({
                      ...row,
                      location: locationListData.find(
                        (item: any) => item.sub_code == row.location
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
                            ></GridColumn>
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(40% - ${GAP}px)`}>
              <ExcelExport
                data={mainDataResult5.data}
                ref={(exporter) => {
                  _export5 = exporter;
                }}
                fileName={getMenuName()}
              >
                <GridTitleContainer className="ButtonContainer5">
                  <GridTitle>불출내역</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{
                    height: webheight5,
                  }}
                  data={process(
                    mainDataResult5.data.map((row) => ({
                      ...row,
                      person: personListData.find(
                        (item: any) => item.user_id == row.person
                      )?.user_name,
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
                                  ? mainTotalFooterCell5
                                  : numberField2.includes(item.fieldName)
                                  ? gridSumQtyFooterCell5
                                  : undefined
                              }
                            ></GridColumn>
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </GridContainerWrap>
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
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
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

export default QC_B0020W;
