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
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
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
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
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
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
  toDate,
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
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import SA_A9001W_Error_Window from "../components/Windows/SA_A9001W_Error_Window";
import SA_A9001W_GET_Window from "../components/Windows/SA_A9001W_GET_Window";
import SA_A9001W_IN_Window from "../components/Windows/SA_A9001W_IN_Window";
import SA_A9001W_PRINTOPTION_Window from "../components/Windows/SA_A9001W_PRINTOPTION_Window";
import SA_A9001W_Transaction_Window from "../components/Windows/SA_A9001W_Transaction_Window";
import SA_A9001W_Update_Window from "../components/Windows/SA_A9001W_Update_Window";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/SA_A9001W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var index = 0;

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
let targetRowIndex: null | number = null;
const dateField = ["taxdt", "payindt", "acntdt", "indt"];
const numberField = [
  "qty",
  "splyamt",
  "wonamt",
  "taxamt",
  "totamt",
  "collectamt",
  "slipamt_1",
  "slipamt_2",
];
const checkBoxField = ["colfinyn", "rtxisuyn"];
const numberField2 = [
  "qty",
  "splyamt",
  "wonamt",
  "taxamt",
  "totamt",
  "collectamt",
  "slipamt_1",
  "slipamt_2",
  "acseq2",
];
const radioCell = ["drcrdiv"];

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_DRCR", setBizComponentData);
  //합부판정
  const field = props.field ?? "";
  const bizComponentIdVal = field == "drcrdiv" ? "R_DRCR" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell
      bizComponentData={bizComponent}
      {...props}
      disabled={true}
    />
  ) : (
    <td />
  );
};

const SA_A9001W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [swiper, setSwiper] = useState<SwiperCore>();
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const processApi = useApi();
  const [workType, setWorkType] = useState<"N" | "U">("N");
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
      height = getHeight(".TitleContainer");
      height2 = getHeight(".k-tabstrip-items-wrapper");
      if (height3 == 0 && !isMobile) {
        height3 = getHeight(".FormBoxWrap");
      }
      height4 = getHeight(".ButtonContainer");
      height5 = getHeight(".ButtonContainer2");
      height6 = getHeight(".ButtonContainer3");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height4);
        setMobileHeight2(getDeviceHeight(true) - height - height5);
        setMobileHeight3(getDeviceHeight(true) - height - height6 - height2);
        setMobileHeight4(getDeviceHeight(true) - height - height6 - height2);
        setMobileHeight5(getDeviceHeight(true) - height - height6 - height2);
        setWebHeight(getDeviceHeight(true) * 1.5 - height3 - height - height4);
        setWebHeight2(height3 - height2);
        setWebHeight3(height3 - height2);
        setWebHeight4(height3 - height2);
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
        collectdiv: defaultOption.find((item: any) => item.id == "collectdiv")
          ?.valueCode,
        dtgb: defaultOption.find((item: any) => item.id == "dtgb")?.valueCode,
        exceptyn: defaultOption.find((item: any) => item.id == "exceptyn")
          ?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        position: defaultOption.find((item: any) => item.id == "position")
          ?.valueCode,
        etaxsts: defaultOption.find((item: any) => item.id == "etaxsts")
          ?.valueCode,
        taxtype: defaultOption.find((item: any) => item.id == "taxtype")
          ?.valueCode,
        saleprintgb: defaultOption.find((item: any) => item.id == "saleprintgb")
          ?.valueCode,
        gubun: defaultOption.find((item: any) => item.id == "gubun")?.valueCode,
        actdiv: defaultOption.find((item: any) => item.id == "actdiv")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "판매처리자료";
        _export.save(optionsGridOne);
      } else if (tabSelected == 1) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridThree.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "매출전표";
        _export.save(optionsGridOne);
      } else if (tabSelected == 2) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridFour = _export4.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridFour.sheets[0];
        optionsGridOne.sheets[0].title = "요약정보";
        optionsGridOne.sheets[1].title = "수금전표";
        _export.save(optionsGridOne);
      }
    }
  };

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061, L_AC902, L_AC906, L_BA002, L_AC014, L_AC401, R_Etax, R_INOUTDIV2, L_BA015,L_BA028",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );
  const [itemacntListData, setItemacntListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [billstat2ListData, setBillstat2ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [report_statListData, setReport_statListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxtypeListData, setTaxtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [etaxListData, setEtaxListData] = useState([COM_CODE_DEFAULT_VALUE]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setBillstat2ListData(getBizCom(bizComponentData, "L_AC902"));
      setReport_statListData(getBizCom(bizComponentData, "L_AC906"));
      setLocationListData(getBizCom(bizComponentData, "L_BA002"));
      setTaxtypeListData(getBizCom(bizComponentData, "L_AC014"));
      setEtaxListData(getBizCom(bizComponentData, "L_AC401"));
    }
  }, [bizComponentData]);

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A9001W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_A9001W_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState); // 페이지 초기화
        setPage3(initialPageState); // 페이지 초기화
        setPage4(initialPageState); // 페이지 초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
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

  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
    setSubDataResult2(process([], subDataState2));
    setSubDataResult3(process([], subDataState3));
  };

  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: "",
    taxtype: "",
    frdt: new Date(),
    todt: new Date(),
    dtgb: "",
    actdiv: "",
    custcd: "",
    custnm: "",
    position: "",
    exceptyn: "",
    collectdiv: "",
    saleprintgb: "",
    salelist: "N",
    etaxsts: "",
    gubun: "",
    Qtyyn: "",
    supplier: "",
    reciver: "Y",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });
  //조회조건 초기값
  const [subfilters, setSubFilters] = useState({
    pgSize: PAGE_SIZE,
    reqdt: new Date(),
    seq: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [subfilters2, setSubFilters2] = useState({
    pgSize: PAGE_SIZE,
    reqdt: new Date(),
    seq: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [subfilters3, setSubFilters3] = useState({
    pgSize: PAGE_SIZE,
    reqdt: new Date(),
    seq: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    if (name == "salelist") {
      setFilters((prev) => ({
        ...prev,
        [name]: value == true ? "Y" : "N",
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (name == "rtxisuyn" || name == "colfinyn") {
      setInfomation((prev) => ({
        ...prev,
        [name]: value == true ? "Y" : "N",
      }));
    } else {
      setInfomation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const RadioChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [prinOptionWindowVisible, setPrintOptionWindowVisible] =
    useState<boolean>(false);
  const [dataWindowVisible, setDataWindowVisible] = useState<boolean>(false);
  const [dataWindowVisible2, setDataWindowVisible2] = useState<boolean>(false);
  const [transactionWindowVisible, setTransactionWindowClick] =
    useState<boolean>(false);
  const [updateWindowVisible, setUpdateWindowClick] = useState<boolean>(false);
  const [errorWindowVisible, setErrorWindowClick] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
  };
  const onPrintOptionWndClick = () => {
    setPrintOptionWindowVisible(true);
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
  const setCustData2 = (data: ICustData) => {
    setInfomation((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
      custregnum: data.bizregnum,
    }));
  };
  const setPrintData = (data: any) => {
    setFilters((prev) => ({
      ...prev,
      gubun: data.gubun,
      Qtyyn: data.Qtyyn,
      supplier: data.supplier,
      reciver: data.reciver,
    }));
  };
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [subDataState2, setSubDataState2] = useState<State>({
    sort: [],
  });
  const [subDataState3, setSubDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );
  const [subDataResult2, setSubDataResult2] = useState<DataResult>(
    process([], subDataState2)
  );
  const [subDataResult3, setSubDataResult3] = useState<DataResult>(
    process([], subDataState3)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedSubState, setSelectedSubState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedSubState2, setSelectedSubState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedSubState3, setSelectedSubState3] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [infomation, setInfomation] = useState<{ [name: string]: any }>({
    acntdiv: "",
    acseq1: 0,
    acseq2: 0,
    actdt: null,
    actkey: "",
    actloca: "",
    amtunit: "",
    billseq: 0,
    billstat: "",
    billstat2: "",
    bizdiv: "",
    chgrat: 0,
    chk: "",
    cnt: "N",
    colfinyn: "",
    collactkey: "",
    collectamt: 0,
    collectdt: null,
    collectnum: "",
    custabbr: "",
    custcd: "",
    custnm: "",
    custregnum: "",
    doexdiv: "",
    dptcd: "",
    email: "",
    errorcnt: 0,
    erroryn: "N",
    etax: "1",
    etxyn: "N",
    exceptyn: "N",
    frnamt: "",
    inamt: 0,
    innum: "",
    innumseq: 0,
    innumseq2: 0,
    inoutdiv: "2",
    inputpath: "",
    inyn: "",
    items: "",
    janamt: 0,
    lcnum: "",
    location: "01",
    mintax: "",
    nonledyn: "",
    orgdiv: "01",
    paydt: null,
    payindt: null,
    paymeth: "",
    person: "",
    position: "",
    prtdiv: "",
    prtyn: "N",
    qty: 0,
    qtyunit: "",
    remark: "",
    remark2: "",
    report_issue_id: "",
    report_stat: "N",
    reqdt: new Date(),
    reqnum: "",
    rtelno: "",
    rtxisuyn: "",
    seq: 0,
    siz: "",
    splyamt: 0,
    taxamt: 0,
    taxdt: new Date(),
    taxtype: "",
    telno: "",
    totamt: 0,
    unp: 0,
    wgt: 0,
    ycnt: "N",
  });

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };
  const onSubDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setSubDataState2(event.dataState);
  };
  const onSubDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setSubDataState3(event.dataState);
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A9001W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_inoutdiv": "2",
        "@p_dtgb": filters.dtgb,
        "@p_fdate": convertDateToStr(filters.frdt),
        "@p_tdate": convertDateToStr(filters.todt),
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_taxtype": filters.taxtype,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_reqdt": "",
        "@p_seq": 0,
        "@p_actdiv": filters.actdiv,
        "@p_collectdiv": filters.collectdiv,
        "@p_exceptyn": filters.exceptyn,
        "@p_etaxsts": filters.etaxsts,
        "@p_Qtyyn": filters.Qtyyn,
        "@p_reqdt_s": "",
        "@p_seq_s": "",
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
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.reqdt + "-" + row.seq == filters.find_row_value
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
        setWorkType("U");
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.reqdt + "-" + row.seq == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });

          setSubFilters((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            seq: selectedRow.seq,
            reqdt:
              selectedRow.reqdt != "" ? toDate(selectedRow.reqdt) : new Date(),
          }));
          setSubFilters2((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            seq: selectedRow.seq,
            reqdt:
              selectedRow.reqdt != "" ? toDate(selectedRow.reqdt) : new Date(),
          }));
          setSubFilters3((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            seq: selectedRow.seq,
            reqdt:
              selectedRow.reqdt != "" ? toDate(selectedRow.reqdt) : new Date(),
          }));

          setInfomation((prev) => ({
            ...prev,
            acntdiv: selectedRow.acntdiv,
            acseq1: selectedRow.acseq1,
            acseq2: selectedRow.acseq2,
            actdt: selectedRow.actdt != "" ? toDate(selectedRow.actdt) : null,
            actkey: selectedRow.actkey,
            actloca: selectedRow.actloca,
            amtunit: selectedRow.amtunit,
            billseq: selectedRow.billseq,
            billstat: selectedRow.billstat,
            billstat2: selectedRow.billstat2,
            bizdiv: selectedRow.bizdiv,
            chgrat: selectedRow.chgrat,
            chk: selectedRow.chk,
            cnt: selectedRow.cnt,
            colfinyn: selectedRow.colfinyn,
            collactkey: selectedRow.collactkey,
            collectamt: selectedRow.collectamt,
            collectdt:
              selectedRow.collectdt != ""
                ? toDate(selectedRow.collectdt)
                : null,
            collectnum: selectedRow.collectnum,
            custabbr: selectedRow.custabbr,
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            custregnum: selectedRow.custregnum,
            doexdiv: selectedRow.doexdiv,
            dptcd: selectedRow.dptcd,
            email: selectedRow.email,
            errorcnt: selectedRow.errorcnt,
            erroryn: selectedRow.erroryn,
            etax: selectedRow.etax,
            etxyn: selectedRow.etxyn,
            exceptyn: selectedRow.exceptyn,
            frnamt: selectedRow.frnamt,
            inamt: selectedRow.inamt,
            innum: selectedRow.innum,
            innumseq: selectedRow.innumseq,
            innumseq2: selectedRow.innumseq2,
            inoutdiv: selectedRow.inoutdiv,
            inputpath: selectedRow.inputpath,
            inyn: selectedRow.inyn,
            items: selectedRow.items,
            janamt: selectedRow.janamt,
            lcnum: selectedRow.lcnum,
            location: selectedRow.location,
            mintax: selectedRow.mintax,
            nonledyn: selectedRow.nonledyn,
            orgdiv: selectedRow.orgdiv,
            paydt: selectedRow.paydt != "" ? toDate(selectedRow.paydt) : null,
            payindt:
              selectedRow.payindt != "" ? toDate(selectedRow.payindt) : null,
            paymeth: selectedRow.paymeth,
            person: selectedRow.person,
            position: selectedRow.position,
            prtdiv: selectedRow.prtdiv,
            prtyn: selectedRow.prtyn,
            qty: selectedRow.qty,
            qtyunit: selectedRow.qtyunit,
            remark: selectedRow.remark,
            remark2: selectedRow.remark2,
            report_issue_id: selectedRow.report_issue_id,
            report_stat: selectedRow.report_stat,
            reqdt: selectedRow.reqdt != "" ? toDate(selectedRow.reqdt) : null,
            reqnum: selectedRow.reqnum,
            rtelno: selectedRow.rtelno,
            rtxisuyn: selectedRow.rtxisuyn,
            seq: selectedRow.seq,
            siz: selectedRow.siz,
            splyamt: selectedRow.splyamt,
            taxamt: selectedRow.taxamt,
            taxdt:
              selectedRow.taxdt != "" ? toDate(selectedRow.taxdt) : new Date(),
            taxtype: selectedRow.taxtype,
            telno: selectedRow.telno,
            totamt: selectedRow.totamt,
            unp: selectedRow.unp,
            wgt: selectedRow.wgt,
            ycnt: selectedRow.ycnt,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setSubFilters((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            seq: rows[0].seq,
            reqdt: rows[0].reqdt != "" ? toDate(rows[0].reqdt) : new Date(),
          }));
          setSubFilters2((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            seq: rows[0].seq,
            reqdt: rows[0].reqdt != "" ? toDate(rows[0].reqdt) : new Date(),
          }));
          setSubFilters3((prev) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
            seq: rows[0].seq,
            reqdt: rows[0].reqdt != "" ? toDate(rows[0].reqdt) : new Date(),
          }));

          setInfomation((prev) => ({
            ...prev,
            acntdiv: rows[0].acntdiv,
            acseq1: rows[0].acseq1,
            acseq2: rows[0].acseq2,
            actdt: rows[0].actdt != "" ? toDate(rows[0].actdt) : null,
            actkey: rows[0].actkey,
            actloca: rows[0].actloca,
            amtunit: rows[0].amtunit,
            billseq: rows[0].billseq,
            billstat: rows[0].billstat,
            billstat2: rows[0].billstat2,
            bizdiv: rows[0].bizdiv,
            chgrat: rows[0].chgrat,
            chk: rows[0].chk,
            cnt: rows[0].cnt,
            colfinyn: rows[0].colfinyn,
            collactkey: rows[0].collactkey,
            collectamt: rows[0].collectamt,
            collectdt:
              rows[0].collectdt != "" ? toDate(rows[0].collectdt) : null,
            collectnum: rows[0].collectnum,
            custabbr: rows[0].custabbr,
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            custregnum: rows[0].custregnum,
            doexdiv: rows[0].doexdiv,
            dptcd: rows[0].dptcd,
            email: rows[0].email,
            errorcnt: rows[0].errorcnt,
            erroryn: rows[0].erroryn,
            etax: rows[0].etax,
            etxyn: rows[0].etxyn,
            exceptyn: rows[0].exceptyn,
            frnamt: rows[0].frnamt,
            inamt: rows[0].inamt,
            innum: rows[0].innum,
            innumseq: rows[0].innumseq,
            innumseq2: rows[0].innumseq2,
            inoutdiv: rows[0].inoutdiv,
            inputpath: rows[0].inputpath,
            inyn: rows[0].inyn,
            items: rows[0].items,
            janamt: rows[0].janamt,
            lcnum: rows[0].lcnum,
            location: rows[0].location,
            mintax: rows[0].mintax,
            nonledyn: rows[0].nonledyn,
            orgdiv: rows[0].orgdiv,
            paydt: rows[0].paydt != "" ? toDate(rows[0].paydt) : null,
            payindt: rows[0].payindt != "" ? toDate(rows[0].payindt) : null,
            paymeth: rows[0].paymeth,
            person: rows[0].person,
            position: rows[0].position,
            prtdiv: rows[0].prtdiv,
            prtyn: rows[0].prtyn,
            qty: rows[0].qty,
            qtyunit: rows[0].qtyunit,
            remark: rows[0].remark,
            remark2: rows[0].remark2,
            report_issue_id: rows[0].report_issue_id,
            report_stat: rows[0].report_stat,
            reqdt: rows[0].reqdt != "" ? toDate(rows[0].reqdt) : null,
            reqnum: rows[0].reqnum,
            rtelno: rows[0].rtelno,
            rtxisuyn: rows[0].rtxisuyn,
            seq: rows[0].seq,
            siz: rows[0].siz,
            splyamt: rows[0].splyamt,
            taxamt: rows[0].taxamt,
            taxdt: rows[0].taxdt != "" ? toDate(rows[0].taxdt) : new Date(),
            taxtype: rows[0].taxtype,
            telno: rows[0].telno,
            totamt: rows[0].totamt,
            unp: rows[0].unp,
            wgt: rows[0].wgt,
            ycnt: rows[0].ycnt,
          }));
        }
      } else {
        setSubDataResult(process([], subDataState));
        setSubDataResult2(process([], subDataState2));
        setSubDataResult3(process([], subDataState3));
        setWorkType("N");
        setInfomation({
          acntdiv: "",
          acseq1: 0,
          acseq2: 0,
          actdt: null,
          actkey: "",
          actloca: "",
          amtunit: "",
          billseq: 0,
          billstat: "",
          billstat2: "",
          bizdiv: "",
          chgrat: 0,
          chk: "",
          cnt: "N",
          colfinyn: "",
          collactkey: "",
          collectamt: 0,
          collectdt: null,
          collectnum: "",
          custabbr: "",
          custcd: "",
          custnm: "",
          custregnum: "",
          doexdiv: "",
          dptcd: "",
          email: "",
          errorcnt: 0,
          erroryn: "N",
          etax: "1",
          etxyn: "N",
          exceptyn: "N",
          frnamt: "",
          inamt: 0,
          innum: "",
          innumseq: 0,
          innumseq2: 0,
          inoutdiv: "2",
          inputpath: "",
          inyn: "",
          items: "",
          janamt: 0,
          lcnum: "",
          location: "01",
          mintax: "",
          nonledyn: "",
          orgdiv: "01",
          paydt: null,
          payindt: null,
          paymeth: "",
          person: "",
          position: "",
          prtdiv: "",
          prtyn: "N",
          qty: 0,
          qtyunit: "",
          remark: "",
          remark2: "",
          report_issue_id: "",
          report_stat: "N",
          reqdt: new Date(),
          reqnum: "",
          rtelno: "",
          rtxisuyn: "",
          seq: 0,
          siz: "",
          splyamt: 0,
          taxamt: 0,
          taxdt: new Date(),
          taxtype: "",
          telno: "",
          totamt: 0,
          unp: 0,
          wgt: 0,
          ycnt: "N",
        });
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
  const fetchSubGrid1 = async (subfilters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const subparameters: Iparameters = {
      procedureName: "P_SA_A9001W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": "Q2",
        "@p_orgdiv": filters.orgdiv,
        "@p_inoutdiv": "2",
        "@p_dtgb": filters.dtgb,
        "@p_fdate": convertDateToStr(filters.frdt),
        "@p_tdate": convertDateToStr(filters.todt),
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_taxtype": filters.taxtype,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_reqdt": convertDateToStr(subfilters.reqdt),
        "@p_seq": subfilters.seq,
        "@p_actdiv": filters.actdiv,
        "@p_collectdiv": filters.collectdiv,
        "@p_exceptyn": filters.exceptyn,
        "@p_etaxsts": filters.etaxsts,
        "@p_Qtyyn": filters.Qtyyn,
        "@p_reqdt_s": "",
        "@p_seq_s": "",
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setSubDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedSubState({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
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
  const fetchSubGrid2 = async (subfilters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const subparameters2: Iparameters = {
      procedureName: "P_SA_A9001W_Q",
      pageNumber: subfilters2.pgNum,
      pageSize: subfilters2.pgSize,
      parameters: {
        "@p_work_type": "Q3",
        "@p_orgdiv": filters.orgdiv,
        "@p_inoutdiv": "2",
        "@p_dtgb": filters.dtgb,
        "@p_fdate": convertDateToStr(filters.frdt),
        "@p_tdate": convertDateToStr(filters.todt),
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_taxtype": filters.taxtype,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_reqdt": convertDateToStr(subfilters2.reqdt),
        "@p_seq": subfilters2.seq,
        "@p_actdiv": filters.actdiv,
        "@p_collectdiv": filters.collectdiv,
        "@p_exceptyn": filters.exceptyn,
        "@p_etaxsts": filters.etaxsts,
        "@p_Qtyyn": filters.Qtyyn,
        "@p_reqdt_s": "",
        "@p_seq_s": "",
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", subparameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setSubDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedSubState2({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
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
  const fetchSubGrid3 = async (subfilters3: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const subparameters3: Iparameters = {
      procedureName: "P_SA_A9001W_Q",
      pageNumber: subfilters3.pgNum,
      pageSize: subfilters3.pgSize,
      parameters: {
        "@p_work_type": "Q4",
        "@p_orgdiv": filters.orgdiv,
        "@p_inoutdiv": "2",
        "@p_dtgb": filters.dtgb,
        "@p_fdate": convertDateToStr(filters.frdt),
        "@p_tdate": convertDateToStr(filters.todt),
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_taxtype": filters.taxtype,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_reqdt": convertDateToStr(subfilters3.reqdt),
        "@p_seq": subfilters3.seq,
        "@p_actdiv": filters.actdiv,
        "@p_collectdiv": filters.collectdiv,
        "@p_exceptyn": filters.exceptyn,
        "@p_etaxsts": filters.etaxsts,
        "@p_Qtyyn": filters.Qtyyn,
        "@p_reqdt_s": "",
        "@p_seq_s": "",
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", subparameters3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setSubDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedSubState3({ [rows[0][DATA_ITEM_KEY4]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setSubFilters3((prev) => ({
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
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      subfilters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);
      setSubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid1(deepCopiedFilters);
    }
  }, [subfilters, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      subfilters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters2);
      setSubFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid2(deepCopiedFilters);
    }
  }, [subfilters2, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      subfilters3.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters3);
      setSubFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid3(deepCopiedFilters);
    }
  }, [subfilters3, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

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

    const taxtype = taxtypeListData.find(
      (item: any) => item.code_name == selectedRowData.taxtype
    )?.sub_code;
    const etax = etaxListData.find(
      (item: any) => item.code_name == selectedRowData.etax
    )?.sub_code;
    const location = locationListData.find(
      (item: any) => item.code_name == selectedRowData.location
    )?.sub_code;
    setSubFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
      seq: selectedRowData.seq,
      reqdt:
        selectedRowData.reqdt != ""
          ? toDate(selectedRowData.reqdt)
          : new Date(),
    }));
    setSubFilters2((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
      seq: selectedRowData.seq,
      reqdt:
        selectedRowData.reqdt != ""
          ? toDate(selectedRowData.reqdt)
          : new Date(),
    }));
    setSubFilters3((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
      seq: selectedRowData.seq,
      reqdt:
        selectedRowData.reqdt != ""
          ? toDate(selectedRowData.reqdt)
          : new Date(),
    }));
    setInfomation((prev) => ({
      ...prev,
      acntdiv: selectedRowData.acntdiv,
      acseq1: selectedRowData.acseq1,
      acseq2: selectedRowData.acseq2,
      actdt: selectedRowData.actdt != "" ? toDate(selectedRowData.actdt) : null,
      actkey: selectedRowData.actkey,
      actloca: selectedRowData.actloca,
      amtunit: selectedRowData.amtunit,
      billseq: selectedRowData.billseq,
      billstat: selectedRowData.billstat,
      billstat2: selectedRowData.billstat2,
      bizdiv: selectedRowData.bizdiv,
      chgrat: selectedRowData.chgrat,
      chk: selectedRowData.chk,
      cnt: selectedRowData.cnt,
      colfinyn: selectedRowData.colfinyn == true ? "Y" : "N",
      collactkey: selectedRowData.collactkey,
      collectamt: selectedRowData.collectamt,
      collectdt:
        selectedRowData.collectdt != ""
          ? toDate(selectedRowData.collectdt)
          : null,
      collectnum: selectedRowData.collectnum,
      custabbr: selectedRowData.custabbr,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      custregnum: selectedRowData.custregnum,
      doexdiv: selectedRowData.doexdiv,
      dptcd: selectedRowData.dptcd,
      email: selectedRowData.email,
      errorcnt: selectedRowData.errorcnt,
      erroryn: selectedRowData.erroryn,
      etax: etax == undefined ? "2" : etax,
      etxyn: selectedRowData.etxyn,
      exceptyn: selectedRowData.exceptyn,
      frnamt: selectedRowData.frnamt,
      inamt: selectedRowData.inamt,
      innum: selectedRowData.innum,
      innumseq: selectedRowData.innumseq,
      innumseq2: selectedRowData.innumseq2,
      inoutdiv: selectedRowData.inoutdiv,
      inputpath: selectedRowData.inputpath,
      inyn: selectedRowData.inyn,
      items: selectedRowData.items,
      janamt: selectedRowData.janamt,
      lcnum: selectedRowData.lcnum,
      location: location == undefined ? sessionLocation : location,
      mintax: selectedRowData.mintax,
      nonledyn: selectedRowData.nonledyn,
      orgdiv: selectedRowData.orgdiv,
      paydt: selectedRowData.paydt != "" ? toDate(selectedRowData.paydt) : null,
      payindt:
        selectedRowData.payindt != "" ? toDate(selectedRowData.payindt) : null,
      paymeth: selectedRowData.paymeth,
      person: selectedRowData.person,
      position: selectedRowData.position,
      prtdiv: selectedRowData.prtdiv,
      prtyn: selectedRowData.prtyn,
      qty: selectedRowData.qty,
      qtyunit: selectedRowData.qtyunit,
      remark: selectedRowData.remark,
      remark2: selectedRowData.remark2,
      report_issue_id: selectedRowData.report_issue_id,
      report_stat: selectedRowData.report_stat,
      reqdt: selectedRowData.reqdt != "" ? toDate(selectedRowData.reqdt) : null,
      reqnum: selectedRowData.reqnum,
      rtelno: selectedRowData.rtelno,
      rtxisuyn: selectedRowData.rtxisuyn == true ? "Y" : "N",
      seq: selectedRowData.seq,
      siz: selectedRowData.siz,
      splyamt: selectedRowData.splyamt,
      taxamt: selectedRowData.taxamt,
      taxdt:
        selectedRowData.taxdt != ""
          ? toDate(selectedRowData.taxdt)
          : new Date(),
      taxtype: taxtype == undefined ? "111" : taxtype,
      telno: selectedRowData.telno,
      totamt: selectedRowData.totamt,
      unp: selectedRowData.unp,
      wgt: selectedRowData.wgt,
      ycnt: selectedRowData.ycnt,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSubSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedSubState,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedSubState(newSelectedState);
  };

  const onSubSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedSubState2,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedSubState2(newSelectedState);
  };

  const onSubSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedSubState3,
      dataItemKey: DATA_ITEM_KEY4,
    });

    setSelectedSubState3(newSelectedState);
  };

  let gridRef: any = useRef(null);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    // setSubFilters((prev) => ({
    //   ...prev,
    //   pgNum: 1,
    // }));
    // setSubFilters2((prev) => ({
    //   ...prev,
    //   pgNum: 1,
    // }));
    // setSubFilters3((prev) => ({
    //   ...prev,
    //   pgNum: 1,
    // }));

    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
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

    setSubFilters((prev) => ({
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

    setSubFilters2((prev) => ({
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

    setSubFilters3((prev) => ({
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onSubSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onSubSortChange2 = (e: any) => {
    setSubDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onSubSortChange3 = (e: any) => {
    setSubDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  const onItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender3 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit3 = (dataItem: any, field: string) => {
    if (field == "chk") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              chk:
                typeof item.chk == "boolean"
                  ? item.chk
                  : item.chk == "Y"
                  ? true
                  : false,
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

  const exitEdit3 = () => {
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

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
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

  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = subDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const subTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = subDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subDataResult3.total == -1
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
    subDataResult.data.forEach((item) =>
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
    subDataResult2.data.forEach((item) =>
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
    subDataResult3.data.forEach((item) =>
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setSubDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult2,
      setSubDataResult2,
      DATA_ITEM_KEY3
    );
  };
  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setSubDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult3,
      setSubDataResult3,
      DATA_ITEM_KEY3
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
  const enterEdit = (dataItem: any, field: string) => {};
  const exitEdit = () => {};
  const enterEdit2 = (dataItem: any, field: string) => {};
  const exitEdit2 = () => {};

  const checkSave = () => {
    let valid = true;

    if (
      infomation.location == "" ||
      infomation.location == null ||
      infomation.location == undefined
    ) {
      valid = false;
    }
    if (
      infomation.custregnum == "" ||
      infomation.custregnum == null ||
      infomation.custregnum == undefined
    ) {
      valid = false;
    }
    if (
      infomation.taxtype == "" ||
      infomation.taxtype == null ||
      infomation.taxtype == undefined
    ) {
      valid = false;
    }

    return valid;
  };

  const onPurCreateClick = (e: any) => {
    if (!permissions.save) return;

    if (workType == "N") {
      alert("저장 후 진행해주세요.");
      return;
    }

    if (!checkSave()) {
      alert("필수값을 채워주세요.");
      return;
    }

    let valid = true;
    const selectRows = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );
    let dataArr: any = {
      rowstatus_s: [],
      reqdt_s: [],
      seq_s: [],
    };
    if (selectRows.length == 0) {
      alert("데이터가 없습니다");
    } else {
      selectRows.map((item: any) => {
        dataArr.rowstatus_s.push("");
        dataArr.reqdt_s.push(item.reqdt);
        dataArr.seq_s.push(item.seq);
      });
      setParaData((prev) => ({
        ...prev,
        workType: "CREATE",
        orgdiv: selectRows[0].orgdiv,
        reqdt: selectRows[0].reqdt,
        seq: selectRows[0].seq,
        location: selectRows[0].location,
        inoutdiv: selectRows[0].inoutdiv,
        splyamt: selectRows[0].splyamt,
        taxamt: selectRows[0].taxamt,
        taxtype: selectRows[0].taxtype,
        taxdt: selectRows[0].taxdt,
        custcd: selectRows[0].custcd,
        custnm: selectRows[0].custnm,
        custregnum: selectRows[0].custregnum,
        items: selectRows[0].items,
        bizdiv: selectRows[0].bizdiv,
        actloca: selectRows[0].actloca,
        actdt: selectRows[0].actdt,
        acseq1: selectRows[0].acseq1,
        acseq2: selectRows[0].acseq2,
        dptcd: selectRows[0].dptcd,
        siz: selectRows[0].siz,
        qty: selectRows[0].qty,
        wgt: selectRows[0].wgt,
        qtyunit: selectRows[0].qtyunit,
        unp: selectRows[0].unp,
        lcnum: selectRows[0].lcnum,
        frnamt: selectRows[0].frnamt,
        chgrat: selectRows[0].chgrat,
        exceptyn: selectRows[0].exceptyn,
        prtyn: selectRows[0].prtyn,
        prtdiv: selectRows[0].prtdiv,
        remark: selectRows[0].remark,
        remark2: selectRows[0].remark2,
        paydt: selectRows[0].paydt,
        acntdiv: selectRows[0].acntdiv,
        rtxisuyn: selectRows[0].rtxisuyn,
        etax: selectRows[0].etax,
        colfinyn: selectRows[0].colfinyn,
        inputpath: selectRows[0].inputpath,
        mintax: selectRows[0].mintax,
        nonledyn: selectRows[0].nonledyn,
        paymeth: selectRows[0].paymeth,
        position: selectRows[0].position,
        payindt: selectRows[0].payindt,
        inamt: selectRows[0].inamt,
        innum: selectRows[0].innum,
        innumseq: selectRows[0].innumseq,
        innumseq2: selectRows[0].innumseq2,
        inyn: selectRows[0].inyn,

        itemacnt: "",

        array: "",
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        seq_s: dataArr.seq_s.join("|"),
        reqdt_s: dataArr.reqdt_s.join("|"),
      }));
    }
  };

  const onPurDropClick = (e: any) => {
    if (!permissions.save) return;
    if (!window.confirm("해제하시겠습니까?")) {
      return false;
    }
    if (workType == "N") {
      alert("저장 후 진행해주세요.");
      return;
    }

    if (!checkSave()) {
      alert("필수값을 채워주세요.");
      return;
    }
    const selectRows = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );
    let dataArr: any = {
      rowstatus_s: [],
      reqdt_s: [],
      seq_s: [],
    };
    if (selectRows.length == 0) {
      alert("데이터가 없습니다");
    } else {
      let valid = true;
      selectRows.map((item: any) => {
        if (item.actkey == "") {
          valid = false;
          return false;
        }
      });
      if (valid != true) {
        alert("전표번호가 존재하지 않는 계산서입니다.");
        return false;
      }
      selectRows.map((item: any) => {
        dataArr.rowstatus_s.push("");
        dataArr.reqdt_s.push(item.reqdt);
        dataArr.seq_s.push(item.seq);
      });
      setParaData((prev) => ({
        ...prev,
        workType: "DROP",
        orgdiv: selectRows[0].orgdiv,
        reqdt: selectRows[0].reqdt,
        seq: selectRows[0].seq,
        location: selectRows[0].location,
        inoutdiv: selectRows[0].inoutdiv,
        splyamt: selectRows[0].splyamt,
        taxamt: selectRows[0].taxamt,
        taxtype: selectRows[0].taxtype,
        taxdt: selectRows[0].taxdt,
        custcd: selectRows[0].custcd,
        custnm: selectRows[0].custnm,
        custregnum: selectRows[0].custregnum,
        items: selectRows[0].items,
        bizdiv: selectRows[0].bizdiv,
        actloca: selectRows[0].actloca,
        actdt: selectRows[0].actdt,
        acseq1: selectRows[0].acseq1,
        acseq2: selectRows[0].acseq2,
        dptcd: selectRows[0].dptcd,
        siz: selectRows[0].siz,
        qty: selectRows[0].qty,
        wgt: selectRows[0].wgt,
        qtyunit: selectRows[0].qtyunit,
        unp: selectRows[0].unp,
        lcnum: selectRows[0].lcnum,
        frnamt: selectRows[0].frnamt,
        chgrat: selectRows[0].chgrat,
        exceptyn: selectRows[0].exceptyn,
        prtyn: selectRows[0].prtyn,
        prtdiv: selectRows[0].prtdiv,
        remark: selectRows[0].remark,
        remark2: selectRows[0].remark2,
        paydt: selectRows[0].paydt,
        acntdiv: selectRows[0].acntdiv,
        rtxisuyn: selectRows[0].rtxisuyn,
        etax: selectRows[0].etax,
        colfinyn: selectRows[0].colfinyn,
        inputpath: selectRows[0].inputpath,
        mintax: selectRows[0].mintax,
        nonledyn: selectRows[0].nonledyn,
        paymeth: selectRows[0].paymeth,
        position: selectRows[0].position,
        payindt: selectRows[0].payindt,
        inamt: selectRows[0].inamt,
        innum: selectRows[0].innum,
        innumseq: selectRows[0].innumseq,
        innumseq2: selectRows[0].innumseq2,
        inyn: selectRows[0].inyn,

        itemacnt: "",

        array: "",
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        seq_s: dataArr.seq_s.join("|"),
        reqdt_s: dataArr.reqdt_s.join("|"),
      }));
    }
  };

  const onPayDropClick = () => {
    if (!permissions.save) return;
    if (!window.confirm("해제하시겠습니까?")) {
      return false;
    }
    if (workType == "N") {
      alert("저장 후 진행해주세요.");
      return;
    }

    if (!checkSave()) {
      alert("필수값을 채워주세요.");
      return;
    }
    const selectRows = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );
    let dataArr: any = {
      rowstatus_s: [],
      reqdt_s: [],
      seq_s: [],
    };
    if (selectRows.length == 0) {
      alert("데이터가 없습니다");
    } else {
      let valid = true;
      selectRows.map((item: any) => {
        if (item.collectnum == "") {
          valid = false;
          return false;
        }
      });
      if (valid != true) {
        alert("수금번호가 존재하지 않는 계산서입니다.");
        return false;
      }
      selectRows.map((item: any) => {
        dataArr.rowstatus_s.push("");
        dataArr.reqdt_s.push(item.reqdt);
        dataArr.seq_s.push(item.seq);
      });
      setParaData((prev) => ({
        ...prev,
        workType: "COLDROP",
        orgdiv: selectRows[0].orgdiv,
        reqdt: selectRows[0].reqdt,
        seq: selectRows[0].seq,
        location: selectRows[0].location,
        inoutdiv: selectRows[0].inoutdiv,
        splyamt: selectRows[0].splyamt,
        taxamt: selectRows[0].taxamt,
        taxtype: selectRows[0].taxtype,
        taxdt: selectRows[0].taxdt,
        custcd: selectRows[0].custcd,
        custnm: selectRows[0].custnm,
        custregnum: selectRows[0].custregnum,
        items: selectRows[0].items,
        bizdiv: selectRows[0].bizdiv,
        actloca: selectRows[0].actloca,
        actdt: selectRows[0].actdt,
        acseq1: selectRows[0].acseq1,
        acseq2: selectRows[0].acseq2,
        dptcd: selectRows[0].dptcd,
        siz: selectRows[0].siz,
        qty: selectRows[0].qty,
        wgt: selectRows[0].wgt,
        qtyunit: selectRows[0].qtyunit,
        unp: selectRows[0].unp,
        lcnum: selectRows[0].lcnum,
        frnamt: selectRows[0].frnamt,
        chgrat: selectRows[0].chgrat,
        exceptyn: selectRows[0].exceptyn,
        prtyn: selectRows[0].prtyn,
        prtdiv: selectRows[0].prtdiv,
        remark: selectRows[0].remark,
        remark2: selectRows[0].remark2,
        paydt: selectRows[0].paydt,
        acntdiv: selectRows[0].acntdiv,
        rtxisuyn: selectRows[0].rtxisuyn,
        etax: selectRows[0].etax,
        colfinyn: selectRows[0].colfinyn,
        inputpath: selectRows[0].inputpath,
        mintax: selectRows[0].mintax,
        nonledyn: selectRows[0].nonledyn,
        paymeth: selectRows[0].paymeth,
        position: selectRows[0].position,
        payindt: selectRows[0].payindt,
        inamt: selectRows[0].inamt,
        innum: selectRows[0].innum,
        innumseq: selectRows[0].innumseq,
        innumseq2: selectRows[0].innumseq2,
        inyn: selectRows[0].inyn,

        itemacnt: "",

        array: "",
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        seq_s: dataArr.seq_s.join("|"),
        reqdt_s: dataArr.reqdt_s.join("|"),
      }));
    }
  };

  const onMinusClick = () => {
    if (!permissions.save) return;
    if (!window.confirm("마이너스 계산서를 발행하시겠습니까?")) {
      return false;
    }

    if (workType == "N") {
      alert("저장 후 진행해주세요.");
      return;
    }

    if (!checkSave()) {
      alert("필수값을 채워주세요.");
      return;
    }
    if (mainDataResult.total > 0) {
      const selectRows = mainDataResult.data.filter(
        (item: any) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setParaData((prev) => ({
        ...prev,
        workType: "MN",
        orgdiv: selectRows.orgdiv,
        reqdt: selectRows.reqdt,
        seq: selectRows.seq,
        location: selectRows.location,
        inoutdiv: selectRows.inoutdiv,
        splyamt: selectRows.splyamt,
        taxamt: selectRows.taxamt,
        taxtype: selectRows.taxtype,
        taxdt: selectRows.taxdt,
        custcd: selectRows.custcd,
        custnm: selectRows.custnm,
        custregnum: selectRows.custregnum,
        items: selectRows.items,
        bizdiv: selectRows.bizdiv,
        actloca: selectRows.actloca,
        actdt: selectRows.actdt,
        acseq1: selectRows.acseq1,
        acseq2: selectRows.acseq2,
        dptcd: selectRows.dptcd,
        siz: selectRows.siz,
        qty: selectRows.qty,
        wgt: selectRows.wgt,
        qtyunit: selectRows.qtyunit,
        unp: selectRows.unp,
        lcnum: selectRows.lcnum,
        frnamt: selectRows.frnamt,
        chgrat: selectRows.chgrat,
        exceptyn: selectRows.exceptyn,
        prtyn: selectRows.prtyn,
        prtdiv: selectRows.prtdiv,
        remark: selectRows.remark,
        remark2: selectRows.remark2,
        paydt: selectRows.paydt,
        acntdiv: selectRows.acntdiv,
        rtxisuyn: selectRows.rtxisuyn,
        etax: selectRows.etax,
        colfinyn: selectRows.colfinyn,
        inputpath: selectRows.inputpath,
        mintax: selectRows.mintax,
        nonledyn: selectRows.nonledyn,
        paymeth: selectRows.paymeth,
        position: selectRows.position,
        payindt: selectRows.payindt,
        inamt: selectRows.inamt,
        innum: selectRows.innum,
        innumseq: selectRows.innumseq,
        innumseq2: selectRows.innumseq2,
        inyn: selectRows.inyn,

        itemacnt: "",

        array: "",
        rowstatus_s: "",
        seq_s: "",
        reqdt_s: "",
      }));
    } else {
      alert("데이터가 없습니다");
    }
  };

  const onDeleteClick = () => {
    if (!permissions.delete) return;
    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }

    if (mainDataResult.total > 0) {
      setParaData((prev) => ({
        ...prev,
        workType: "D",
        reqdt: convertDateToStr(infomation.reqdt),
        seq: infomation.seq,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: "",
    reqdt: "",
    seq: 0,
    location: "",
    inoutdiv: "",
    splyamt: 0,
    taxamt: 0,
    taxtype: "",
    taxdt: "",
    custcd: "",
    custnm: "",
    custregnum: "",
    items: "",
    bizdiv: "",
    actloca: "",
    actdt: "",
    acseq1: 0,
    acseq2: 0,
    dptcd: "",
    siz: "",
    qty: 0,
    wgt: 0,
    qtyunit: "",
    unp: 0,
    lcnum: "",
    frnamt: "",
    chgrat: 0,
    exceptyn: "",
    prtyn: "",
    prtdiv: "",
    remark: "",
    remark2: "",
    paydt: "",
    acntdiv: "",
    rtxisuyn: "",
    etax: "",
    colfinyn: "",
    inputpath: "",
    mintax: "",
    nonledyn: "",
    paymeth: "",
    position: "",
    payindt: "",
    inamt: 0,
    innum: "",
    innumseq: 0,
    innumseq2: 0,
    inyn: "",

    itemacnt: "",

    array: "",

    rowstatus_s: "",
    reqdt_s: "",
    seq_s: "",
    payindt_s: "",

    reason: "",
  });

  const para: Iparameters = {
    procedureName: "P_SA_A9001W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_reqdt": ParaData.reqdt,
      "@p_seq": ParaData.seq,
      "@p_location": ParaData.location,
      "@p_inoutdiv": ParaData.inoutdiv,
      "@p_splyamt": ParaData.splyamt,
      "@p_taxamt": ParaData.taxamt,
      "@p_taxtype": ParaData.taxtype,
      "@p_taxdt": ParaData.taxdt,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_custregnum": ParaData.custregnum,
      "@p_items": ParaData.items,
      "@p_bizdiv": ParaData.bizdiv,
      "@p_actloca": ParaData.actloca,
      "@p_actdt": ParaData.actdt,
      "@p_acseq1": ParaData.acseq1,
      "@p_acseq2": ParaData.acseq2,
      "@p_dptcd": ParaData.dptcd,
      "@p_siz": ParaData.siz,
      "@p_qty": ParaData.qty,
      "@p_wgt": ParaData.wgt,
      "@p_qtyunit": ParaData.qtyunit,
      "@p_unp": ParaData.unp,
      "@p_lcnum": ParaData.lcnum,
      "@p_frnamt": ParaData.frnamt,
      "@p_chgrat": ParaData.chgrat,
      "@p_exceptyn": ParaData.exceptyn,
      "@p_prtyn": ParaData.prtyn,
      "@p_prtdiv": ParaData.prtdiv,
      "@p_remark": ParaData.remark,
      "@p_remark2": ParaData.remark2,
      "@p_paydt": ParaData.paydt,
      "@p_acntdiv": ParaData.acntdiv,
      "@p_rtxisuyn": ParaData.rtxisuyn,
      "@p_etax": ParaData.etax,
      "@p_colfinyn": ParaData.colfinyn,
      "@p_inputpath": ParaData.inputpath,
      "@p_mintax": ParaData.mintax,
      "@p_nonledyn": ParaData.nonledyn,
      "@p_paymeth": ParaData.paymeth,
      "@p_position": ParaData.position,
      "@p_payindt": ParaData.payindt,
      "@p_inamt": ParaData.inamt,
      "@p_innum": ParaData.innum,
      "@p_innumseq": ParaData.innumseq,
      "@p_innumseq2": ParaData.innumseq2,
      "@p_inyn": ParaData.inyn,

      "@p_itemacnt": ParaData.itemacnt,

      "@p_array": ParaData.array,

      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_reqdt_s": ParaData.reqdt_s,
      "@p_seq_s": ParaData.seq_s,
      "@p_payindt_s": ParaData.payindt_s,

      "@p_reason": ParaData.reason,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SA_A9001W",
    },
  };

  const fetchTodoGridSaved = async () => {
    if (!permissions.save && ParaData.workType != "D") return;
    if (!permissions.delete && ParaData.workType == "D") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (ParaData.workType == "D") {
        const isLastDataDeleted =
          mainDataResult.data.length == 0 && filters.pgNum > 0;
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
      } else {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
      }
      setWorkType("U");
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        orgdiv: "",
        reqdt: "",
        seq: 0,
        location: "",
        inoutdiv: "",
        splyamt: 0,
        taxamt: 0,
        taxtype: "",
        taxdt: "",
        custcd: "",
        custnm: "",
        custregnum: "",
        items: "",
        bizdiv: "",
        actloca: "",
        actdt: "",
        acseq1: 0,
        acseq2: 0,
        dptcd: "",
        siz: "",
        qty: 0,
        wgt: 0,
        qtyunit: "",
        unp: 0,
        lcnum: "",
        frnamt: "",
        chgrat: 0,
        exceptyn: "",
        prtyn: "",
        prtdiv: "",
        remark: "",
        remark2: "",
        paydt: "",
        acntdiv: "",
        rtxisuyn: "",
        etax: "",
        colfinyn: "",
        inputpath: "",
        mintax: "",
        nonledyn: "",
        paymeth: "",
        position: "",
        payindt: "",
        inamt: 0,
        innum: "",
        innumseq: 0,
        innumseq2: 0,
        inyn: "",

        itemacnt: "",

        array: "",

        rowstatus_s: "",
        reqdt_s: "",
        seq_s: "",
        payindt_s: "",

        reason: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (
      ParaData.workType != "" &&
      permissions.save &&
      ParaData.workType != "D"
    ) {
      fetchTodoGridSaved();
    }
    if (ParaData.workType == "D" && permissions.delete) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  const [ParaData2, setParaData2] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: "",
    location: "",
    reqdt: "",
    seq: 0,
    taxdt: "",
    etax: "",
    custcd: "",
    gubun: "",
    splyamt: "",
    taxamt: "",
    remark: "",
    billstat: "",
    rtn: "",
    report_issue_id: "",
    userid: "",
    pc: "",

    Accattachyn: "",
    rreg_id: 0,
    service_id: "",
    salelist: "",
  });

  const para2: Iparameters = {
    procedureName: "P_SA_A9001W_S2",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData2.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": ParaData2.location,
      "@p_reqdt": ParaData2.reqdt,
      "@p_seq": ParaData2.seq,
      "@p_taxdt": ParaData2.taxdt,
      "@p_etax": ParaData2.etax,
      "@p_custcd": ParaData2.custcd,
      "@p_gubun": ParaData2.gubun,
      "@p_splyamt": ParaData2.splyamt,
      "@p_taxamt": ParaData2.taxamt,
      "@p_remark": ParaData2.remark,
      "@p_billstat": ParaData2.billstat,
      "@p_rtn": ParaData2.rtn,
      "@p_report_issue_id": ParaData2.report_issue_id,

      "@p_Accattachyn": ParaData2.Accattachyn,
      "@p_rreg_id": ParaData2.rreg_id,
      "@p_salelist": ParaData2.salelist,

      "@p_userid": userId,
      "@p_pc": pc,
      "@p_service_id": companyCode,
    },
  };

  const fetchTodoGridSaved2 = async () => {
    if (!permissions.save && ParaData2.workType != "D") return;
    if (!permissions.delete && ParaData2.workType == "D") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (ParaData2.workType == "D") {
        const isLastDataDeleted =
          mainDataResult.data.length == 0 && filters.pgNum > 0;
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
      } else {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
          find_row_value: data.returnString,
        }));
      }
      setParaData2({
        pgSize: PAGE_SIZE,
        workType: "",
        orgdiv: "",
        location: "",
        reqdt: "",
        seq: 0,
        taxdt: "",
        etax: "",
        custcd: "",
        gubun: "",
        splyamt: "",
        taxamt: "",
        remark: "",
        billstat: "",
        rtn: "",
        report_issue_id: "",
        userid: "",
        pc: "",

        Accattachyn: "",
        rreg_id: 0,
        service_id: "",
        salelist: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (
      ParaData2.workType != "" &&
      permissions.save &&
      ParaData2.workType != "D"
    ) {
      fetchTodoGridSaved2();
    }
    if (ParaData2.workType == "D" && permissions.delete) {
      fetchTodoGridSaved2();
    }
  }, [ParaData2, permissions]);

  const setCopyData2 = (data: any) => {
    var qty = 0;
    var amt = 0;
    var taxamt = 0;
    var seq = 0;
    data.map((item: any) => {
      qty = qty + item.qty;
      amt = amt + item.amt;
      taxamt = taxamt + item.taxamt;
    });

    setInfomation({
      acntdiv: "",
      acseq1: 0,
      acseq2: 0,
      actdt: null,
      actkey: "",
      actloca: "",
      amtunit: data[0].amtunit,
      billseq: 0,
      billstat: "",
      billstat2: "",
      bizdiv: "",
      chgrat: 0,
      chk: "",
      cnt: "N",
      colfinyn: "",
      collactkey: "",
      collectamt: 0,
      collectdt: null,
      collectnum: "",
      custabbr: "",
      custcd: data[0].custcd,
      custnm: data[0].custnm,
      custregnum: data[0].custregnum,
      doexdiv: data[0].doexdiv,
      dptcd: "",
      email: "",
      errorcnt: 0,
      erroryn: "N",
      etax: "1",
      etxyn: "N",
      exceptyn: "N",
      frnamt: "",
      inamt: 0,
      innum: "",
      innumseq: 0,
      innumseq2: 0,
      inoutdiv: "2",
      inputpath: "",
      inyn: "",
      items: data[0].itemnm,
      janamt: 0,
      lcnum: "",
      location: data[0].location,
      mintax: "",
      nonledyn: "",
      orgdiv: data[0].orgdiv,
      paydt: null,
      payindt: null,
      paymeth: data[0].paymeth1,
      person: data[0].person,
      position: data[0].position,
      prtdiv: "",
      prtyn: "N",
      qty: qty,
      qtyunit: data[0].qtyunit,
      remark: "",
      remark2: "",
      report_issue_id: "",
      report_stat: "N",
      reqdt: null,
      reqnum: data[0].reqnum,
      rtelno: "",
      rtxisuyn: "",
      seq: 0,
      siz: "",
      splyamt: amt,
      taxamt: taxamt,
      taxdt: data[0].outdt == "" ? new Date() : toDate(data[0].outdt),
      taxtype: "111",
      telno: "",
      totamt: amt + taxamt,
      unp: 0,
      wgt: 0,
      ycnt: "N",
    });
    const rows = data.map((prev: any) => ({
      ...prev,
      num: seq++,
      recnum: prev.recdt + "-" + prev.seq1.toString(),
    }));

    setSubDataResult((prev) => {
      return {
        data: rows,
        total: data.length,
      };
    });
    setSelectedSubState({ [rows[0][DATA_ITEM_KEY2]]: true });
  };

  const onAddClick = () => {
    setWorkType("N");
    setDataWindowVisible(true);
  };

  const onAddClick2 = () => {
    if (!permissions.save) return;

    setDataWindowVisible2(true);
  };

  const onSaveClick = () => {
    if (!permissions.save) return;

    if (!checkSave()) {
      alert("필수값을 채워주세요.");
      return;
    }
    let dataArr: any = {
      array: [],
    };
    subDataResult.data.forEach((item: any, idx: number) => {
      const { recnum } = item;
      dataArr.array.push(recnum);
    });

    setParaData((prev) => ({
      ...prev,
      workType: workType,
      orgdiv: infomation.orgdiv,
      reqdt: infomation.reqdt == null ? "" : convertDateToStr(infomation.reqdt),
      seq: infomation.seq,
      location: infomation.location,
      inoutdiv: infomation.inoutdiv,
      splyamt: infomation.splyamt,
      taxamt: infomation.taxamt,
      taxtype: infomation.taxtype,
      taxdt: convertDateToStr(infomation.taxdt),
      custcd: infomation.custcd,
      custnm: infomation.custnm,
      custregnum: infomation.custregnum,
      items: infomation.items,
      bizdiv: infomation.bizdiv,
      actloca: infomation.actloca,
      actdt: infomation.actdt == null ? "" : convertDateToStr(infomation.actdt),
      acseq1: infomation.acseq1,
      acseq2: infomation.acseq2,
      dptcd: infomation.dptcd,
      siz: infomation.siz,
      qty: infomation.qty,
      wgt: infomation.wgt,
      qtyunit: infomation.qtyunit,
      unp: infomation.unp,
      lcnum: infomation.lcnum,
      frnamt: infomation.frnamt,
      chgrat: infomation.chgrat,
      exceptyn: infomation.exceptyn,
      prtyn: infomation.prtyn,
      prtdiv: infomation.prtdiv,
      remark: infomation.remark,
      remark2: infomation.remark2,
      paydt: infomation.paydt == null ? "" : convertDateToStr(infomation.paydt),
      acntdiv: infomation.acntdiv,
      rtxisuyn: infomation.rtxisuyn,
      etax: infomation.etax,
      colfinyn: infomation.colfinyn,
      inputpath: infomation.inputpath,
      mintax: infomation.mintax,
      nonledyn: infomation.nonledyn,
      paymeth: infomation.paymeth,
      position: infomation.position,
      payindt:
        infomation.payindt == null ? "" : convertDateToStr(infomation.payindt),
      inamt: infomation.inamt,
      innum: infomation.innum,
      innumseq: infomation.innumseq,
      innumseq2: infomation.innumseq2,
      inyn: infomation.inyn,

      itemacnt: "",

      array: dataArr.array.join("|"),
      rowstatus_s: "",
      seq_s: "",
      reqdt_s: "",
    }));
  };

  const onPAXClick = () => {
    if (!permissions.save) return;
    setTransactionWindowClick(true);
  };

  const setPrintData2 = (data: any) => {
    if (!permissions.save) return;
    if (workType == "N") {
      alert("저장 후 진행해주세요.");
      return;
    }

    if (!checkSave()) {
      alert("필수값을 채워주세요.");
      return;
    }

    setParaData2((prev) => ({
      ...prev,
      workType: "EM",
      orgdiv: infomation.orgdiv,
      location: infomation.location,
      reqdt: infomation.reqdt == null ? "" : convertDateToStr(infomation.reqdt),
      seq: infomation.seq,
      taxdt: convertDateToStr(infomation.taxdt),
      etax: infomation.etax,
      custcd: infomation.custcd,
      gubun: filters.gubun,
      splyamt: infomation.splyamt,
      taxamt: infomation.taxamt,
      remark: infomation.remark,
      billstat: infomation.billstat,
      rtn: "",
      report_issue_id: infomation.report_issue_id,

      Accattachyn: data,
      rreg_id: 0,
      salelist: "",
    }));
  };

  const onUpdateClick = () => {
    if (!permissions.save) return;

    if (!window.confirm("선택한 데이터로 수정세금계산서를 발행하시겠습니까?")) {
      return false;
    }

    setUpdateWindowClick(true);
  };

  const setPrintData3 = (data: any) => {
    if (!permissions.save) return;
    if (workType == "N") {
      alert("저장 후 진행해주세요.");
      return;
    }

    if (!checkSave()) {
      alert("필수값을 채워주세요.");
      return;
    }

    setParaData2((prev) => ({
      ...prev,
      workType: "EDIT",
      orgdiv: infomation.orgdiv,
      location: infomation.location,
      reqdt: infomation.reqdt == null ? "" : convertDateToStr(infomation.reqdt),
      seq: infomation.seq,
      taxdt: convertDateToStr(infomation.taxdt),
      etax: infomation.etax,
      custcd: infomation.custcd,
      gubun: filters.gubun,
      splyamt: infomation.splyamt,
      taxamt: infomation.taxamt,
      remark: infomation.remark,
      billstat: infomation.billstat,
      rtn: data.rtn,
      report_issue_id: data.report_issue_id,

      Accattachyn: "",
      rreg_id: 0,
      salelist: "",
    }));
  };

  const onEmailClick = () => {
    if (!permissions.save) return;

    if (workType == "N") {
      alert("저장 후 진행해주세요.");
      return;
    }

    if (
      !window.confirm("선택한 전자세금계산서 건을 [E-MAIL 재전송]하시겠습니까?")
    ) {
      return false;
    }

    if (mainDataResult.total > 0) {
      setParaData2((prev) => ({
        ...prev,
        workType: "EJ",
        orgdiv: infomation.orgdiv,
        location: infomation.location,
        reqdt:
          infomation.reqdt == null ? "" : convertDateToStr(infomation.reqdt),
        seq: infomation.seq,
        taxdt: convertDateToStr(infomation.taxdt),
        etax: infomation.etax,
        custcd: infomation.custcd,
        gubun: filters.gubun,
        splyamt: infomation.splyamt,
        taxamt: infomation.taxamt,
        remark: infomation.remark,
        billstat: infomation.billstat,
        rtn: "",
        report_issue_id: infomation.report_issue_id,

        Accattachyn: "",
        rreg_id: 0,
        salelist: "",
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onDeleteClick2 = () => {
    if (!permissions.save) return;

    if (workType == "N") {
      alert("저장 후 진행해주세요.");
      return;
    }

    if (mainDataResult.total > 0) {
      if (
        infomation.billstat == "0" ||
        infomation.billstat == "2" ||
        infomation.billstat == "4"
      ) {
        setParaData2((prev) => ({
          ...prev,
          workType: "EDEL",
          orgdiv: infomation.orgdiv,
          location: infomation.location,
          reqdt:
            infomation.reqdt == null ? "" : convertDateToStr(infomation.reqdt),
          seq: infomation.seq,
          taxdt: convertDateToStr(infomation.taxdt),
          etax: infomation.etax,
          custcd: infomation.custcd,
          gubun: filters.gubun,
          splyamt: infomation.splyamt,
          taxamt: infomation.taxamt,
          remark: infomation.remark,
          billstat: infomation.billstat,
          rtn: "",
          report_issue_id: infomation.report_issue_id,

          Accattachyn: "",
          rreg_id: 0,
          salelist: "",
        }));
      } else {
        alert("삭제요청은 [미개봉, 반려, 승인취소]상태에서만 처리 가능합니다.");
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onErrorCheckClick = () => {
    if (!permissions.view) return;

    if (workType == "N") {
      alert("저장 후 진행해주세요.");
      return;
    }

    if (mainDataResult.total > 0) {
      if (infomation.billstat == "E") {
        setErrorWindowClick(true);
      } else {
        alert("선택된 계산서는 ERROR 가 발생 된 계산서가 아닙니다.");
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
              <th colSpan={2}>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dtgb"
                    value={filters.dtgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="name"
                    valueField="code"
                  />
                )}
              </th>
              <td colSpan={2}>
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
              <th>계산서유형</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="taxtype"
                    value={filters.taxtype}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>회계전표</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="actdiv"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
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
              <th>구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="exceptyn"
                    value={filters.exceptyn}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    valueField="code"
                    textField="name"
                  />
                )}
              </td>
              <th>수금전표</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="collectdiv"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
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
                  />
                )}
              </td>
              <th>사업부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="position"
                    value={filters.position}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>청구영수구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="saleprintgb"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <td colSpan={2}>
                <Checkbox
                  title="계산서 매출내역 전송"
                  label="계산서 매출내역 전송"
                  name="salelist"
                  value={filters.salelist == "Y" ? true : false}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>E-TAX상태</th>
              <td colSpan={5}>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="etaxsts"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <td colSpan={2}>
                <Button
                  onClick={onPrintOptionWndClick}
                  themeColor={"primary"}
                  fillMode={"outline"}
                >
                  출력옵션 설정
                </Button>
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
                <GridTitleContainer className="ButtonContainer">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      flexWrap: "wrap",
                      gap: "3px",
                      flexDirection: "column",
                    }}
                  >
                    <ButtonContainer>
                      <Button
                        onClick={onPurCreateClick}
                        themeColor={"primary"}
                        icon="plus-outline"
                        disabled={permissions.save ? false : true}
                      >
                        매출 전표 생성
                      </Button>
                      <Button
                        onClick={onPurDropClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus-outline"
                        disabled={permissions.save ? false : true}
                      >
                        매출 전표 해제
                      </Button>
                    </ButtonContainer>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick2}
                        themeColor={"primary"}
                        icon="plus-outline"
                        disabled={permissions.save ? false : true}
                      >
                        수금 전표 생성
                      </Button>
                      <Button
                        onClick={onPayDropClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus-outline"
                        disabled={permissions.save ? false : true}
                      >
                        수금 전표 해제
                      </Button>
                    </ButtonContainer>
                    <ButtonContainer>
                      <Button
                        onClick={onDeleteClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="delete"
                        disabled={permissions.save ? false : true}
                      >
                        E-TAX 삭제요청
                      </Button>
                      <Button
                        onClick={onEmailClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="email"
                        disabled={permissions.save ? false : true}
                      >
                        E-MAIL 전송
                      </Button>
                      <Button
                        onClick={onErrorCheckClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="error"
                        disabled={permissions.view ? false : true}
                      >
                        ERROR 확인
                      </Button>
                    </ButtonContainer>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick}
                        themeColor={"primary"}
                        icon="file-add"
                        style={{ marginRight: "4px" }}
                        disabled={permissions.save ? false : true}
                      >
                        매출 E-TAX(전표) 생성
                      </Button>
                      <Button
                        onClick={onDeleteClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="delete"
                        disabled={permissions.delete ? false : true}
                      >
                        매출 E-TAX(전표) 삭제
                      </Button>
                    </ButtonContainer>
                  </div>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: mobileheight }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        taxtype: taxtypeListData.find(
                          (item: any) => item.sub_code == row.taxtype
                        )?.code_name,
                        etax: etaxListData.find(
                          (item: any) => item.sub_code == row.etax
                        )?.code_name,
                        billstat2: billstat2ListData.find(
                          (item: any) => item.sub_code == row.billstat2
                        )?.code_name,
                        report_stat: report_statListData.find(
                          (item: any) => item.sub_code == row.report_stat
                        )?.code_name,
                        location: locationListData.find(
                          (item: any) => item.sub_code == row.location
                        )?.code_name,
                        rtxisuyn: row.rtxisuyn == "Y" ? true : false,
                        colfinyn: row.colfinyn == "Y" ? true : false,
                        [SELECTED_FIELD]: selectedState[idGetter(row)],
                        chk: row.chk == "" ? false : row.chk,
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
                    onItemChange={onItemChange}
                    cellRender={customCellRender3}
                    rowRender={customRowRender3}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn
                      field="chk"
                      title=" "
                      width="45px"
                      headerCell={CustomCheckBoxCell}
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
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : checkBoxField.includes(item.fieldName)
                                    ? CheckBoxReadOnlyCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : numberField2.includes(item.fieldName)
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
              <GridContainer style={{ width: "100%", overflow: "auto" }}>
                <GridTitleContainer className="ButtonContainer2">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      flexWrap: "wrap",
                      gap: "3px",
                      flexDirection: "column",
                    }}
                  >
                    <div>
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
                      <Button
                        onClick={onSaveClick}
                        themeColor={"primary"}
                        icon="save"
                        disabled={permissions.save ? false : true}
                      >
                        매출 E-TAX(전표) 저장
                      </Button>
                    </div>
                    <div>
                      <Button
                        onClick={onMinusClick}
                        themeColor={"primary"}
                        style={{ marginRight: "4px" }}
                        disabled={permissions.save ? false : true}
                      >
                        (-)계산서 생성
                      </Button>
                      <Button
                        onClick={onPAXClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.save ? false : true}
                      >
                        E-TAX전송
                      </Button>
                      <Button
                        onClick={onUpdateClick}
                        themeColor={"primary"}
                        disabled={permissions.save ? false : true}
                      >
                        수정 E-TAX
                      </Button>
                    </div>
                  </div>
                </GridTitleContainer>
                <FormBoxWrap border={true} style={{ height: mobileheight2 }}>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>계산서번호</th>
                        <td>
                          <Input
                            name="reqnum"
                            type="text"
                            value={infomation.reqnum}
                            className="readonly"
                          />
                        </td>
                        <th>TAX구분</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentRadioGroup
                              name="etax"
                              value={infomation.etax}
                              bizComponentId="R_Etax"
                              bizComponentData={bizComponentData}
                              changeData={RadioChange}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>매출구분</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentRadioGroup
                              name="inoutdiv"
                              value={infomation.inoutdiv}
                              bizComponentId="R_INOUTDIV2"
                              bizComponentData={bizComponentData}
                              className="readonly"
                            />
                          )}
                        </td>
                        <td colSpan={2}>
                          <Checkbox
                            name="rtxisuyn"
                            label={"역발행여부"}
                            value={infomation.rtxisuyn == "Y" ? true : false}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>
                          <Checkbox
                            name="colfinyn"
                            label={"수금강제완료"}
                            value={infomation.colfinyn == "Y" ? true : false}
                            onChange={InputChange}
                          />
                        </td>
                        <th>수금완료일</th>
                        <td>
                          <DatePicker
                            name="payindt"
                            value={infomation.payindt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>사업장</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="location"
                              value={infomation.location}
                              bizComponentId="L_BA002"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                              className="required"
                            />
                          )}
                        </td>
                        <th>사업부</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="position"
                              value={infomation.position}
                              bizComponentId="L_BA028"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>계산서일자</th>
                        <td>
                          <DatePicker
                            name="taxdt"
                            value={infomation.taxdt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                            className="required"
                          />
                        </td>
                        <th>수금예정일</th>
                        <td>
                          <DatePicker
                            name="paydt"
                            value={infomation.paydt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>업체코드</th>
                        <td>
                          <Input
                            name="custcd"
                            type="text"
                            value={infomation.custcd}
                            onChange={InputChange}
                          />
                          <ButtonInInput>
                            <Button
                              onClick={onCustWndClick2}
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
                            value={infomation.custnm}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>수량</th>
                        <td>
                          <Input
                            name="qty"
                            type="number"
                            value={infomation.qty}
                            onChange={InputChange}
                          />
                        </td>
                        <th>수량단위</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="qtyunit"
                              value={infomation.qtyunit}
                              bizComponentId="L_BA015"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>사업자번호</th>
                        <td>
                          <Input
                            name="custregnum"
                            type="text"
                            value={infomation.custregnum}
                            onChange={InputChange}
                            className="required"
                          />
                        </td>
                        <th>공급가액</th>
                        <td>
                          <Input
                            name="splyamt"
                            type="number"
                            value={infomation.splyamt}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>계산서유형</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="taxtype"
                              value={infomation.taxtype}
                              bizComponentId="L_AC014"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                              className="required"
                            />
                          )}
                        </td>
                        <th>부가세액</th>
                        <td>
                          <Input
                            name="taxamt"
                            type="number"
                            value={infomation.taxamt}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>거래품목</th>
                        <td>
                          <Input
                            name="items"
                            type="text"
                            value={infomation.items}
                            onChange={InputChange}
                          />
                        </td>
                        <th>합계금액</th>
                        <td>
                          <Input
                            name="totamt"
                            type="number"
                            value={infomation.totamt}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>비고</th>
                        <td colSpan={3}>
                          <TextArea
                            value={infomation.remark}
                            name="remark"
                            rows={3}
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "left",
                    width: "100%",
                    marginBottom: "5px",
                  }}
                  className="ButtonContainer3"
                >
                  <ButtonContainer>
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
                </div>
                <TabStrip
                  style={{ width: "100%" }}
                  selected={tabSelected}
                  onSelect={handleSelectTab}
                  scrollable={isMobile}
                >
                  <TabStripTab
                    title="판매처리자료"
                    disabled={permissions.view ? false : true}
                  >
                    <GridContainer width="100%">
                      <ExcelExport
                        data={subDataResult.data}
                        ref={(exporter) => {
                          _export2 = exporter;
                        }}
                        fileName={getMenuName()}
                      >
                        <Grid
                          style={{ height: mobileheight3 }}
                          data={process(
                            subDataResult.data.map((row) => ({
                              ...row,
                              itemacnt: itemacntListData.find(
                                (item: any) => item.sub_code == row.itemacnt
                              )?.code_name,
                              [SELECTED_FIELD]:
                                selectedSubState[idGetter2(row)],
                            })),
                            subDataState
                          )}
                          {...subDataState}
                          onDataStateChange={onSubDataStateChange}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY2}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onSubSelectionChange}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={subDataResult.total}
                          skip={page2.skip}
                          take={page2.take}
                          pageable={true}
                          onPageChange={pageChange2}
                          //정렬기능
                          sortable={true}
                          onSortChange={onSubSortChange}
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
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? subTotalFooterCell
                                          : numberField2.includes(
                                              item.fieldName
                                            )
                                          ? gridSumQtyFooterCell2
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
                    title="매출전표"
                    disabled={permissions.view ? false : true}
                  >
                    <GridContainer width="100%">
                      <ExcelExport
                        data={subDataResult2.data}
                        ref={(exporter) => {
                          _export3 = exporter;
                        }}
                        fileName={getMenuName()}
                      >
                        <Grid
                          style={{ height: mobileheight4 }}
                          data={process(
                            subDataResult2.data.map((row) => ({
                              ...row,
                              [SELECTED_FIELD]:
                                selectedSubState2[idGetter3(row)],
                            })),
                            subDataState2
                          )}
                          {...subDataState2}
                          onDataStateChange={onSubDataStateChange2}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY3}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onSubSelectionChange2}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={subDataResult2.total}
                          skip={page3.skip}
                          take={page3.take}
                          pageable={true}
                          onPageChange={pageChange3}
                          //정렬기능
                          sortable={true}
                          onSortChange={onSubSortChange2}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                          onItemChange={onMainItemChange}
                          cellRender={customCellRender}
                          rowRender={customRowRender}
                          editField={EDIT_FIELD}
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
                                          : radioCell.includes(item.fieldName)
                                          ? CustomRadioCell
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? subTotalFooterCell2
                                          : numberField2.includes(
                                              item.fieldName
                                            )
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
                    title="수금전표"
                    disabled={permissions.view ? false : true}
                  >
                    <GridContainer width="100%">
                      <ExcelExport
                        data={subDataResult3.data}
                        ref={(exporter) => {
                          _export4 = exporter;
                        }}
                        fileName={getMenuName()}
                      >
                        <Grid
                          style={{ height: mobileheight5 }}
                          data={process(
                            subDataResult3.data.map((row) => ({
                              ...row,
                              [SELECTED_FIELD]:
                                selectedSubState3[idGetter4(row)],
                            })),
                            subDataState3
                          )}
                          {...subDataState3}
                          onDataStateChange={onSubDataStateChange3}
                          //선택 기능
                          dataItemKey={DATA_ITEM_KEY4}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onSubSelectionChange3}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={subDataResult3.total}
                          skip={page4.skip}
                          take={page4.take}
                          pageable={true}
                          onPageChange={pageChange4}
                          //정렬기능
                          sortable={true}
                          onSortChange={onSubSortChange3}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                          onItemChange={onMainItemChange2}
                          cellRender={customCellRender2}
                          rowRender={customRowRender2}
                          editField={EDIT_FIELD}
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
                                        numberField.includes(item.fieldName)
                                          ? NumberCell
                                          : dateField.includes(item.fieldName)
                                          ? DateCell
                                          : radioCell.includes(item.fieldName)
                                          ? CustomRadioCell
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? subTotalFooterCell3
                                          : numberField2.includes(
                                              item.fieldName
                                            )
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
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <>
            <GridContainer>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>요약정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onPurCreateClick}
                    themeColor={"primary"}
                    icon="plus-outline"
                    disabled={permissions.save ? false : true}
                  >
                    매출 전표 생성
                  </Button>
                  <Button
                    onClick={onPurDropClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus-outline"
                    disabled={permissions.save ? false : true}
                  >
                    매출 전표 해제
                  </Button>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    icon="plus-outline"
                    disabled={permissions.save ? false : true}
                  >
                    수금 전표 생성
                  </Button>
                  <Button
                    onClick={onPayDropClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus-outline"
                    disabled={permissions.save ? false : true}
                  >
                    수금 전표 해제
                  </Button>
                  <Button
                    onClick={onDeleteClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                    disabled={permissions.save ? false : true}
                  >
                    E-TAX 삭제요청
                  </Button>
                  <Button
                    onClick={onEmailClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="email"
                    disabled={permissions.save ? false : true}
                  >
                    E-MAIL 전송
                  </Button>
                  <Button
                    onClick={onErrorCheckClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="error"
                    disabled={permissions.view ? false : true}
                  >
                    ERROR 확인
                  </Button>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="file-add"
                    style={{ marginRight: "4px" }}
                    disabled={permissions.save ? false : true}
                  >
                    매출 E-TAX(전표) 생성
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                    disabled={permissions.delete ? false : true}
                  >
                    매출 E-TAX(전표) 삭제
                  </Button>
                  <Button
                    onClick={onSaveClick}
                    themeColor={"primary"}
                    icon="save"
                    disabled={permissions.save ? false : true}
                  >
                    매출 E-TAX(전표) 저장
                  </Button>
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
                  style={{ height: webheight }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      taxtype: taxtypeListData.find(
                        (item: any) => item.sub_code == row.taxtype
                      )?.code_name,
                      etax: etaxListData.find(
                        (item: any) => item.sub_code == row.etax
                      )?.code_name,
                      billstat2: billstat2ListData.find(
                        (item: any) => item.sub_code == row.billstat2
                      )?.code_name,
                      report_stat: report_statListData.find(
                        (item: any) => item.sub_code == row.report_stat
                      )?.code_name,
                      location: locationListData.find(
                        (item: any) => item.sub_code == row.location
                      )?.code_name,
                      rtxisuyn: row.rtxisuyn == "Y" ? true : false,
                      colfinyn: row.colfinyn == "Y" ? true : false,
                      [SELECTED_FIELD]: selectedState[idGetter(row)],
                      chk: row.chk == "" ? false : row.chk,
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
                  onItemChange={onItemChange}
                  cellRender={customCellRender3}
                  rowRender={customRowRender3}
                  editField={EDIT_FIELD}
                >
                  <GridColumn
                    field="chk"
                    title=" "
                    width="45px"
                    headerCell={CustomCheckBoxCell}
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
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : dateField.includes(item.fieldName)
                                  ? DateCell
                                  : checkBoxField.includes(item.fieldName)
                                  ? CheckBoxReadOnlyCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell
                                  : numberField2.includes(item.fieldName)
                                  ? gridSumQtyFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainerWrap>
              <GridContainer width="45%">
                <FormBoxWrap className="FormBoxWrap">
                  <ButtonContainer>
                    <Button
                      onClick={onMinusClick}
                      themeColor={"primary"}
                      style={{ marginRight: "4px" }}
                      disabled={permissions.save ? false : true}
                    >
                      (-)계산서 생성
                    </Button>
                    <Button
                      onClick={onPAXClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.save ? false : true}
                    >
                      E-TAX전송
                    </Button>
                    <Button
                      onClick={onUpdateClick}
                      themeColor={"primary"}
                      disabled={permissions.save ? false : true}
                    >
                      수정 E-TAX
                    </Button>
                  </ButtonContainer>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>계산서번호</th>
                        <td>
                          <Input
                            name="reqnum"
                            type="text"
                            value={infomation.reqnum}
                            className="readonly"
                          />
                        </td>
                        <th>TAX구분</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentRadioGroup
                              name="etax"
                              value={infomation.etax}
                              bizComponentId="R_Etax"
                              bizComponentData={bizComponentData}
                              changeData={RadioChange}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>매출구분</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentRadioGroup
                              name="inoutdiv"
                              value={infomation.inoutdiv}
                              bizComponentId="R_INOUTDIV2"
                              bizComponentData={bizComponentData}
                              className="readonly"
                            />
                          )}
                        </td>
                        <td colSpan={2}>
                          <Checkbox
                            name="rtxisuyn"
                            label={"역발행여부"}
                            value={infomation.rtxisuyn == "Y" ? true : false}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>
                          <Checkbox
                            name="colfinyn"
                            label={"수금강제완료"}
                            value={infomation.colfinyn == "Y" ? true : false}
                            onChange={InputChange}
                          />
                        </td>
                        <th>수금완료일</th>
                        <td>
                          <DatePicker
                            name="payindt"
                            value={infomation.payindt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>사업장</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="location"
                              value={infomation.location}
                              bizComponentId="L_BA002"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                              className="required"
                            />
                          )}
                        </td>
                        <th>사업부</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="position"
                              value={infomation.position}
                              bizComponentId="L_BA028"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>계산서일자</th>
                        <td>
                          <DatePicker
                            name="taxdt"
                            value={infomation.taxdt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                            className="required"
                          />
                        </td>
                        <th>수금예정일</th>
                        <td>
                          <DatePicker
                            name="paydt"
                            value={infomation.paydt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>업체코드</th>
                        <td>
                          <Input
                            name="custcd"
                            type="text"
                            value={infomation.custcd}
                            onChange={InputChange}
                          />
                          <ButtonInInput>
                            <Button
                              onClick={onCustWndClick2}
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
                            value={infomation.custnm}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>수량</th>
                        <td>
                          <Input
                            name="qty"
                            type="number"
                            value={infomation.qty}
                            onChange={InputChange}
                          />
                        </td>
                        <th>수량단위</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="qtyunit"
                              value={infomation.qtyunit}
                              bizComponentId="L_BA015"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>사업자번호</th>
                        <td>
                          <Input
                            name="custregnum"
                            type="text"
                            value={infomation.custregnum}
                            onChange={InputChange}
                            className="required"
                          />
                        </td>
                        <th>공급가액</th>
                        <td>
                          <Input
                            name="splyamt"
                            type="number"
                            value={infomation.splyamt}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>계산서유형</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="taxtype"
                              value={infomation.taxtype}
                              bizComponentId="L_AC014"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                              className="required"
                            />
                          )}
                        </td>
                        <th>부가세액</th>
                        <td>
                          <Input
                            name="taxamt"
                            type="number"
                            value={infomation.taxamt}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>거래품목</th>
                        <td>
                          <Input
                            name="items"
                            type="text"
                            value={infomation.items}
                            onChange={InputChange}
                          />
                        </td>
                        <th>합계금액</th>
                        <td>
                          <Input
                            name="totamt"
                            type="number"
                            value={infomation.totamt}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>비고</th>
                        <td colSpan={3}>
                          <TextArea
                            value={infomation.remark}
                            name="remark"
                            rows={3}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
              <GridContainer width={`calc(55% - ${GAP}px)`}>
                <TabStrip
                  selected={tabSelected}
                  onSelect={handleSelectTab}
                  scrollable={isMobile}
                >
                  <TabStripTab
                    title="판매처리자료"
                    disabled={permissions.view ? false : true}
                  >
                    <GridContainerWrap>
                      <GridContainer width="100%">
                        <ExcelExport
                          data={subDataResult.data}
                          ref={(exporter) => {
                            _export2 = exporter;
                          }}
                          fileName={getMenuName()}
                        >
                          <Grid
                            style={{ height: webheight2 }}
                            data={process(
                              subDataResult.data.map((row) => ({
                                ...row,
                                itemacnt: itemacntListData.find(
                                  (item: any) => item.sub_code == row.itemacnt
                                )?.code_name,
                                [SELECTED_FIELD]:
                                  selectedSubState[idGetter2(row)],
                              })),
                              subDataState
                            )}
                            {...subDataState}
                            onDataStateChange={onSubDataStateChange}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY2}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSubSelectionChange}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={subDataResult.total}
                            skip={page2.skip}
                            take={page2.take}
                            pageable={true}
                            onPageChange={pageChange2}
                            //정렬기능
                            sortable={true}
                            onSortChange={onSubSortChange}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                          >
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList2"
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
                                          numberField.includes(item.fieldName)
                                            ? NumberCell
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? subTotalFooterCell
                                            : numberField2.includes(
                                                item.fieldName
                                              )
                                            ? gridSumQtyFooterCell2
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
                  <TabStripTab
                    title="매출전표"
                    disabled={permissions.view ? false : true}
                  >
                    <GridContainerWrap>
                      <GridContainer width="100%">
                        <ExcelExport
                          data={subDataResult2.data}
                          ref={(exporter) => {
                            _export3 = exporter;
                          }}
                          fileName={getMenuName()}
                        >
                          <Grid
                            style={{ height: webheight3 }}
                            data={process(
                              subDataResult2.data.map((row) => ({
                                ...row,
                                [SELECTED_FIELD]:
                                  selectedSubState2[idGetter3(row)],
                              })),
                              subDataState2
                            )}
                            {...subDataState2}
                            onDataStateChange={onSubDataStateChange2}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY3}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSubSelectionChange2}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={subDataResult2.total}
                            skip={page3.skip}
                            take={page3.take}
                            pageable={true}
                            onPageChange={pageChange3}
                            //정렬기능
                            sortable={true}
                            onSortChange={onSubSortChange2}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                            onItemChange={onMainItemChange}
                            cellRender={customCellRender}
                            rowRender={customRowRender}
                            editField={EDIT_FIELD}
                          >
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList3"
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
                                          numberField.includes(item.fieldName)
                                            ? NumberCell
                                            : dateField.includes(item.fieldName)
                                            ? DateCell
                                            : radioCell.includes(item.fieldName)
                                            ? CustomRadioCell
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? subTotalFooterCell2
                                            : numberField2.includes(
                                                item.fieldName
                                              )
                                            ? gridSumQtyFooterCell3
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
                  <TabStripTab
                    title="수금전표"
                    disabled={permissions.view ? false : true}
                  >
                    <GridContainerWrap>
                      <GridContainer width="100%">
                        <ExcelExport
                          data={subDataResult3.data}
                          ref={(exporter) => {
                            _export4 = exporter;
                          }}
                          fileName={getMenuName()}
                        >
                          <Grid
                            style={{ height: webheight4 }}
                            data={process(
                              subDataResult3.data.map((row) => ({
                                ...row,
                                [SELECTED_FIELD]:
                                  selectedSubState3[idGetter4(row)],
                              })),
                              subDataState3
                            )}
                            {...subDataState3}
                            onDataStateChange={onSubDataStateChange3}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY4}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSubSelectionChange3}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={subDataResult3.total}
                            skip={page4.skip}
                            take={page4.take}
                            pageable={true}
                            onPageChange={pageChange4}
                            //정렬기능
                            sortable={true}
                            onSortChange={onSubSortChange3}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                            onItemChange={onMainItemChange2}
                            cellRender={customCellRender2}
                            rowRender={customRowRender2}
                            editField={EDIT_FIELD}
                          >
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList4"
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
                                          numberField.includes(item.fieldName)
                                            ? NumberCell
                                            : dateField.includes(item.fieldName)
                                            ? DateCell
                                            : radioCell.includes(item.fieldName)
                                            ? CustomRadioCell
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? subTotalFooterCell3
                                            : numberField2.includes(
                                                item.fieldName
                                              )
                                            ? gridSumQtyFooterCell4
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
                </TabStrip>
              </GridContainer>
            </GridContainerWrap>
          </>
        </>
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
          modal={true}
        />
      )}
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={workType}
          setData={setCustData2}
          modal={true}
        />
      )}
      {prinOptionWindowVisible && (
        <SA_A9001W_PRINTOPTION_Window
          setVisible={setPrintOptionWindowVisible}
          setData={setPrintData}
          filters={filters}
          modal={true}
        />
      )}
      {dataWindowVisible && (
        <SA_A9001W_IN_Window
          setVisible={setDataWindowVisible}
          setData={setCopyData2}
          modal={true}
        />
      )}
      {dataWindowVisible2 && (
        <SA_A9001W_GET_Window
          data={mainDataResult.data.filter((item: any) => item.chk == true)}
          setVisible={setDataWindowVisible2}
          setData={(data) =>
            setFilters((prev) => ({
              ...prev,
              isSearch: true,
              find_row_value: data,
            }))
          }
          modal={true}
        />
      )}
      {transactionWindowVisible && (
        <SA_A9001W_Transaction_Window
          setVisible={setTransactionWindowClick}
          setData={setPrintData2}
          modal={true}
        />
      )}
      {updateWindowVisible && (
        <SA_A9001W_Update_Window
          setVisible={setUpdateWindowClick}
          setData={setPrintData3}
          modal={true}
        />
      )}
      {errorWindowVisible && (
        <SA_A9001W_Error_Window
          setVisible={setErrorWindowClick}
          infomation={infomation}
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

export default SA_A9001W;
