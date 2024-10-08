import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartCategoryAxisTitle,
  ChartSeries,
  ChartSeriesItem,
  ChartValueAxis,
  ChartValueAxisItem,
} from "@progress/kendo-react-charts";
import { getSelectedState } from "@progress/kendo-react-data-tools";
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
import YearCalendar from "../components/Calendars/YearCalendar";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  convertDateToStr,
  findMessage,
  getBizCom,
  getCustDataQuery,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  GetPropertyValueByName,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { ICustData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/CM_A9000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
let temp2 = 0;
const DATA_ITEM_KEY = "dptcd";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
let targetRowIndex: null | number = null;
const NumberField = [
  "totdircost",
  "dircost01",
  "dircost02",
  "dircost03",
  "dircost04",
  "dircost05",
  "dircost06",
  "dircost07",
  "dircost08",
  "dircost09",
  "dircost10",
  "dircost11",
  "dircost12",
  "totamt",
  "amt01",
  "amt02",
  "amt03",
  "amt04",
  "amt05",
  "amt06",
  "amt07",
  "amt08",
  "amt09",
  "amt10",
  "amt11",
  "amt12",
  "dircost",
  "indircost",
  "royalty",
  "totcost",
  "indircost01",
  "indircost02",
  "indircost03",
  "indircost04",
  "indircost05",
  "indircost06",
  "indircost07",
  "indircost08",
  "indircost09",
  "indircost10",
  "indircost11",
  "indircost12",
  "royalty01",
  "royalty02",
  "royalty03",
  "royalty04",
  "royalty05",
  "royalty06",
  "royalty07",
  "royalty08",
  "royalty09",
  "royalty10",
  "royalty11",
  "royalty12",
  "totcost01",
  "totcost02",
  "totcost03",
  "totcost04",
  "totcost05",
  "totcost06",
  "totcost07",
  "totcost08",
  "totcost09",
  "totcost10",
  "totcost11",
  "totcost12",
];
const CustomComboField = ["user_id", "pgmdiv", "devdiv"];
const commandField = ["custcd"];
let deletedMainRows2: object[] = [];

const FormContext = createContext<{
  custcd: string;
  setCustcd: (d: any) => void;
  custnm: string;
  setCustnm: (d: any) => void;
  mainDataState2: State;
  setMainDataState2: (d: any) => void;
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
    custcd,
    custnm,
    setCustcd,
    setCustnm,
    mainDataState2,
    setMainDataState2,
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
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setCustcd(data.custcd);
    setCustnm(data.custnm);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInInput>
        <Button
          onClick={onCustWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
    </>
  );
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001, L_CO030, L_PGMDIV",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "user_id"
      ? "L_sysUserMaster_001"
      : field == "devdiv"
      ? "L_CO030"
      : field == "pgmdiv"
      ? "L_PGMDIV"
      : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  const textField =
    field == "user_id" ? "user_name" : field == "pgmdiv" ? "name" : "code_name";
  const valueField =
    field == "user_id" ? "user_id" : field == "pgmdiv" ? "code" : "sub_code";

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      {...props}
    />
  ) : (
    <td />
  );
};
const CM_A9000W: React.FC = () => {
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [custcd, setCustcd] = useState<string>("");
  const [custnm, setCustnm] = useState<string>("");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [tabSelected, setTabSelected] = useState(0);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
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
        yyyy: setDefaultDate(customOptionData, "yyyy"),
        devdiv: defaultOption.find((item: any) => item.id == "devdiv")
          ?.valueCode,
        pgmdiv: defaultOption.find((item: any) => item.id == "pgmdiv")
          ?.valueCode,
        userid: defaultOption.find((item: any) => item.id == "userid")
          ?.valueCode,
        rtrchk: defaultOption.find((item: any) => item.id == "rtrchk")
          ?.valueCode,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "yyyy"),
        orgdiv: defaultOption.find((item: any) => item.id == "orgdiv")
          ?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "yyyy"),
        orgdiv: defaultOption.find((item: any) => item.id == "orgdiv")
          ?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        userid: defaultOption.find((item: any) => item.id == "userid")
          ?.valueCode,
        rtrchk: defaultOption.find((item: any) => item.id == "rtrchk")
          ?.valueCode,
        viewyn: defaultOption.find((item: any) => item.id == "viewyn")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

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
      height = getHeight(".k-tabstrip-items-wrapper");
      height2 = getHeight(".TitleContainer");
      height3 = getHeight(".ButtonContainer");
      height4 = getHeight(".ButtonContainer2");
      height5 = getHeight(".ButtonContainer3");
      height6 = getHeight(".ButtonContainer4");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight2(getDeviceHeight(true) - height - height2 - height4);
        setMobileHeight3(getDeviceHeight(true) - height - height2);
        setMobileHeight4(getDeviceHeight(true) - height - height2 - height5);
        setMobileHeight5(getDeviceHeight(true) - height - height2 - height6);
        setWebHeight(getDeviceHeight(true) - height - height2 - height3);
        setWebHeight2(getDeviceHeight(true) - height - height2 - height4);
        setWebHeight3((getDeviceHeight(true) - height - height2) / 2);
        setWebHeight4((getDeviceHeight(true) - height - height2) / 2 - height5);
        setWebHeight5(getDeviceHeight(true) - height - height2 - height6);
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
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  const exportExcel = () => {
    if (tabSelected == 0) {
      if (_export !== null && _export !== undefined) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[0].title = "부서리스트";
        optionsGridOne.sheets[1].title = "개인별 실적금액관리";
        _export.save(optionsGridOne);
      }
    } else if (tabSelected == 1) {
      if (_export3 !== null && _export3 !== undefined) {
        const optionsGridThree = _export3.workbookOptions();
        optionsGridThree.sheets[0].title = "상세정보";
        _export3.save(optionsGridThree);
      }
    } else if (tabSelected == 2) {
      if (_export4 !== null && _export4 !== undefined) {
        const optionsGridFour = _export4.workbookOptions();
        optionsGridFour.sheets[0].title = "요약정보";
        _export4.save(optionsGridFour);
      }
    }
  };

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001, L_dptcd_001,L_HU005",
    setBizComponentData
  );
  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "", postcd: "", dptcd: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setdptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
      setpostcdListData(getBizCom(bizComponentData, "L_HU005"));
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
    }
  }, [bizComponentData]);

  const search = () => {
    if (tabSelected == 0) {
      try {
        if (convertDateToStr(filters.yyyy).substring(0, 4) < "1997") {
          throw findMessage(messagesData, "CM_A9000W_001");
        } else {
          resetAllGrid();
          setFilters((prev) => ({
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
    } else if (tabSelected == 1) {
      try {
        if (convertDateToStr(filters3.yyyy).substring(0, 4) < "1997") {
          throw findMessage(messagesData, "CM_A9000W_001");
        } else {
          resetAllGrid();
          setFilters3((prev) => ({
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
    } else if (tabSelected == 2) {
      try {
        if (convertDateToStr(filters3.yyyy).substring(0, 4) < "1997") {
          throw findMessage(messagesData, "CM_A9000W_001");
        } else {
          resetAllGrid();
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
    }
  };

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionPostcd = UseGetValueFromSessionItem("postcd");
  const sessionDptcd = UseGetValueFromSessionItem("dptcd");
  const pc = UseGetValueFromSessionItem("pc");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    yyyy: new Date(),
    devdiv: "",
    pgmdiv: "",
    custcd: "",
    custnm: "",
    viewyn: "",
    userid: "",
    rtrchk: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    dptcd: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    yyyy: new Date(),
    dptcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    yyyy: new Date(),
    dptcd: "",
    viewyn: "",
    userid: "",
    rtrchk: "",
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

  const filterInputChange3 = (e: any) => {
    const { value, name } = e.target;

    setFilters3((prev) => ({
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

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
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

  const filterComboBoxChange4 = (e: any) => {
    const { name, value } = e;

    setFilters4((prev) => ({
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

  const filterRadioChange4 = (e: any) => {
    const { name, value } = e;

    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
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
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [tempState4, setTempState4] = useState<State>({
    sort: [],
  });
  const [allChartDataResult, setAllChartDataResult] = useState({
    companies: [""],
    series: [0],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult4, setMainDataResult4] = useState<DataResult>(
    process([], mainDataState4)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [tempResult4, setTempResult4] = useState<DataResult>(
    process([], tempState4)
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
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A9000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DPTCD",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_dptcd": "",
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_pgmdiv": filters.pgmdiv,
        "@p_rtrchk": filters.rtrchk,
        "@p_viewyn": filters.viewyn,
        "@p_devdiv": filters.devdiv,
        "@p_userid": filters.userid,
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
            (row: any) => row.dptcd == filters.find_row_value
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
            : rows.find((row: any) => row.dptcd == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            dptcd: selectedRow.dptcd,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            dptcd: rows[0].dptcd,
            isSearch: true,
            pgNum: 1,
          }));
        }
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
      procedureName: "P_CM_A9000W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "ACTION",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_dptcd": filters2.dptcd,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_pgmdiv": filters.pgmdiv,
        "@p_rtrchk": filters.rtrchk,
        "@p_viewyn": filters.viewyn,
        "@p_devdiv": filters.devdiv,
        "@p_userid": filters.userid,
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

      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
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
      procedureName: "P_CM_A9000W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": "ANAL",
        "@p_orgdiv": filters3.orgdiv,
        "@p_location": filters3.location,
        "@p_yyyy": convertDateToStr(filters3.yyyy).substring(0, 4),
        "@p_dptcd": filters3.dptcd,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_pgmdiv": filters.pgmdiv,
        "@p_rtrchk": filters.rtrchk,
        "@p_viewyn": filters.viewyn,
        "@p_devdiv": filters.devdiv,
        "@p_userid": filters.userid,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[1].TotalRowCount;
      const rows = data.tables[0].Rows;
      const rows2 = data.tables[1].Rows;
      let newRows = { companies: [""], series: [0] };
      let array = [];

      array.push({
        title: rows2[0].title1,
        amt01: rows2[0].Z01_amt,
        amt02: rows2[0].Z02_amt,
        amt03: rows2[0].Z03_amt,
        amt04: rows2[0].Z04_amt,
        amt05: rows2[0].Z05_amt,
        amt06: rows2[0].Z06_amt,
        amt07: rows2[0].Z07_amt,
        amt08: rows2[0].Z08_amt,
        amt09: rows2[0].Z09_amt,
        amt10: rows2[0].Z10_amt,
        amt11: rows2[0].Z11_amt,
        amt12: rows2[0].Z12_amt,
        totamt: rows2[0].Ztot_amt,
        num: 1,
      });
      array.push({
        title: rows2[0].title2,
        amt01: rows2[0].A01_amt,
        amt02: rows2[0].A02_amt,
        amt03: rows2[0].A03_amt,
        amt04: rows2[0].A04_amt,
        amt05: rows2[0].A05_amt,
        amt06: rows2[0].A06_amt,
        amt07: rows2[0].A07_amt,
        amt08: rows2[0].A08_amt,
        amt09: rows2[0].A09_amt,
        amt10: rows2[0].A10_amt,
        amt11: rows2[0].A11_amt,
        amt12: rows2[0].A12_amt,
        totamt: rows2[0].Atot_amt,
        num: 2,
      });
      array.push({
        title: rows2[0].title3,
        amt01: rows2[0].D01_amt,
        amt02: rows2[0].D02_amt,
        amt03: rows2[0].D03_amt,
        amt04: rows2[0].D04_amt,
        amt05: rows2[0].D05_amt,
        amt06: rows2[0].D06_amt,
        amt07: rows2[0].D07_amt,
        amt08: rows2[0].D08_amt,
        amt09: rows2[0].D09_amt,
        amt10: rows2[0].D10_amt,
        amt11: rows2[0].D11_amt,
        amt12: rows2[0].D12_amt,
        totamt: rows2[0].Dtot_amt,
        num: 3,
      });
      array.push({
        title: rows2[0].title4,
        amt01: rows2[0].E01_amt,
        amt02: rows2[0].E02_amt,
        amt03: rows2[0].E03_amt,
        amt04: rows2[0].E04_amt,
        amt05: rows2[0].E05_amt,
        amt06: rows2[0].E06_amt,
        amt07: rows2[0].E07_amt,
        amt08: rows2[0].E08_amt,
        amt09: rows2[0].E09_amt,
        amt10: rows2[0].E10_amt,
        amt11: rows2[0].E11_amt,
        amt12: rows2[0].E12_amt,
        totamt: rows2[0].Etot_amt,
        num: 4,
      });
      array.push({
        title: rows2[0].title5,
        amt01: rows2[0].per01,
        amt02: rows2[0].per02,
        amt03: rows2[0].per03,
        amt04: rows2[0].per04,
        amt05: rows2[0].per05,
        amt06: rows2[0].per06,
        amt07: rows2[0].per07,
        amt08: rows2[0].per08,
        amt09: rows2[0].per09,
        amt10: rows2[0].per10,
        amt11: rows2[0].per11,
        amt12: rows2[0].per12,
        totamt: rows2[0].totper,
        num: 5,
      });
      rows.forEach((row: any) => {
        if (!newRows.companies.includes(row.argument)) {
          newRows.companies.push(row.argument);
          newRows.series.push(row.value);
        }
      });

      setAllChartDataResult({
        companies: newRows.companies,
        series: newRows.series,
      });
      setMainDataResult3({
        data: array,
        total: 5,
      });

      setSelectedState3({ [array[0][DATA_ITEM_KEY3]]: true });
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
      procedureName: "P_CM_A9000W_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": "PLAN",
        "@p_orgdiv": filters4.orgdiv,
        "@p_location": filters4.location,
        "@p_yyyy": convertDateToStr(filters4.yyyy).substring(0, 4),
        "@p_dptcd": filters4.dptcd,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_pgmdiv": filters.pgmdiv,
        "@p_rtrchk": filters4.rtrchk,
        "@p_viewyn": filters4.viewyn,
        "@p_devdiv": filters.devdiv,
        "@p_userid": filters4.userid,
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

      setMainDataResult4({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
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

  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  useEffect(() => {
    if (filters2.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);

      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData]);

  useEffect(() => {
    if (filters3.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);

      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions, customOptionData]);

  useEffect(() => {
    if (filters4.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);

      setFilters4((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4, permissions, customOptionData]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

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
      isSearch: true,
      pgNum: 1,
      dptcd: selectedRowData.dptcd,
    }));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });

    setSelectedState4(newSelectedState);
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

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
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
      <td colSpan={props.colSpan} style={props.style} {...props}>
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
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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
  const onMainSortChange4 = (e: any) => {
    setMainDataState4((prev) => ({ ...prev, sort: e.sort }));
  };
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setPage2(initialPageState);
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));
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
    setFilters2((prev) => ({
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

  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;
    setFilters4((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));
    setPage4({
      ...event.page,
    });
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
  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
  };
  const onMainItemChange4 = (event: GridItemChangeEvent) => {
    setMainDataState4((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult4,
      setMainDataResult4,
      DATA_ITEM_KEY4
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
  const customCellRender4 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit4}
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
  const customRowRender4 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit4}
      editField={EDIT_FIELD}
    />
  );
  const enterEdit2 = (dataItem: any, field: string) => {
    if (
      field != "rowstatus" &&
      field != "dptcd" &&
      field != "postcd" &&
      field != "custnm" &&
      field != "totdircost"
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
      setTempResult2((prev) => {
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
      setTempResult2((prev) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit4 = (dataItem: any, field: string) => {
    if (
      field != "rowstatus" &&
      field != "dptcd" &&
      field != "dircost" &&
      field != "indircost" &&
      field != "royalty" &&
      field != "totcost"
    ) {
      const newData = mainDataResult4.data.map((item) =>
        item[DATA_ITEM_KEY4] == dataItem[DATA_ITEM_KEY4]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );
      setEditIndex(dataItem[DATA_ITEM_KEY4]);
      if (field) {
        setEditedField(field);
      }
      setTempResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult4((prev) => {
        return {
          data: mainDataResult4.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      if (editedField == "custcd") {
        mainDataResult2.data.map(async (item) => {
          if (editIndex == item[DATA_ITEM_KEY2]) {
            const custcd = await fetchCustInfo(item.custcd);
            if (custcd != null && custcd != undefined) {
              const newData = mainDataResult2.data.map((item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
                  ? {
                      ...item,
                      custcd: custcd.custcd,
                      custnm: custcd.custnm,
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
              setMainDataResult2((prev) => {
                return {
                  data: newData,
                  total: prev.total,
                };
              });
            } else {
              const newData = mainDataResult2.data.map((item) =>
                item[DATA_ITEM_KEY2] ==
                Object.getOwnPropertyNames(selectedState2)[0]
                  ? {
                      ...item,
                      rowstatus: item.rowstatus == "N" ? "N" : "U",
                      custnm: "",
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
              setMainDataResult2((prev) => {
                return {
                  data: newData,
                  total: prev.total,
                };
              });
            }
          }
        });
      } else if (
        editedField == "dircost01" ||
        editedField == "dircost02" ||
        editedField == "dircost03" ||
        editedField == "dircost04" ||
        editedField == "dircost05" ||
        editedField == "dircost06" ||
        editedField == "dircost07" ||
        editedField == "dircost08" ||
        editedField == "dircost09" ||
        editedField == "dircost10" ||
        editedField == "dircost11" ||
        editedField == "dircost12"
      ) {
        const newData = mainDataResult2.data.map((item) =>
          item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                totdircost:
                  item.dircost01 +
                  item.dircost02 +
                  item.dircost03 +
                  item.dircost04 +
                  item.dircost05 +
                  item.dircost06 +
                  item.dircost07 +
                  item.dircost08 +
                  item.dircost09 +
                  item.dircost10 +
                  item.dircost11 +
                  item.dircost12,
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
        setMainDataResult2((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else if (editedField == "user_id") {
        const newData = mainDataResult2.data.map((item) =>
          item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                postcd: userListData.find(
                  (items: any) => items.user_id == item.user_id
                )?.postcd,
                dptcd: userListData.find(
                  (items: any) => items.user_id == item.user_id
                )?.dptcd,
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
        setMainDataResult2((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else {
        const newData = mainDataResult2.data.map((item) =>
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

        setTempResult2((prev) => {
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
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev) => {
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

  const exitEdit4 = () => {
    if (tempResult4.data != mainDataResult4.data) {
      if (
        editedField == "dircost01" ||
        editedField == "dircost02" ||
        editedField == "dircost03" ||
        editedField == "dircost04" ||
        editedField == "dircost05" ||
        editedField == "dircost06" ||
        editedField == "dircost07" ||
        editedField == "dircost08" ||
        editedField == "dircost09" ||
        editedField == "dircost10" ||
        editedField == "dircost11" ||
        editedField == "dircost12"
      ) {
        const newData = mainDataResult4.data.map((item) =>
          item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState4)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                dircost:
                  item.dircost01 +
                  item.dircost02 +
                  item.dircost03 +
                  item.dircost04 +
                  item.dircost05 +
                  item.dircost06 +
                  item.dircost07 +
                  item.dircost08 +
                  item.dircost09 +
                  item.dircost10 +
                  item.dircost11 +
                  item.dircost12,
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setTempResult4((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
        setMainDataResult4((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else if (
        editedField == "indircost01" ||
        editedField == "indircost02" ||
        editedField == "indircost03" ||
        editedField == "indircost04" ||
        editedField == "indircost05" ||
        editedField == "indircost06" ||
        editedField == "indircost07" ||
        editedField == "indircost08" ||
        editedField == "indircost09" ||
        editedField == "indircost10" ||
        editedField == "indircost11" ||
        editedField == "indircost12"
      ) {
        const newData = mainDataResult4.data.map((item) =>
          item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState4)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                indircost:
                  item.indircost01 +
                  item.indircost02 +
                  item.indircost03 +
                  item.indircost04 +
                  item.indircost05 +
                  item.indircost06 +
                  item.indircost07 +
                  item.indircost08 +
                  item.indircost09 +
                  item.indircost10 +
                  item.indircost11 +
                  item.indircost12,
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setTempResult4((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
        setMainDataResult4((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else if (
        editedField == "royalty01" ||
        editedField == "royalty02" ||
        editedField == "royalty03" ||
        editedField == "royalty04" ||
        editedField == "royalty05" ||
        editedField == "royalty06" ||
        editedField == "royalty07" ||
        editedField == "royalty08" ||
        editedField == "royalty09" ||
        editedField == "royalty10" ||
        editedField == "royalty11" ||
        editedField == "royalty12"
      ) {
        const newData = mainDataResult4.data.map((item) =>
          item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState4)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                royalty:
                  item.royalty01 +
                  item.royalty02 +
                  item.royalty03 +
                  item.royalty04 +
                  item.royalty05 +
                  item.royalty06 +
                  item.royalty07 +
                  item.royalty08 +
                  item.royalty09 +
                  item.royalty10 +
                  item.royalty11 +
                  item.royalty12,
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setTempResult4((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
        setMainDataResult4((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else if (
        editedField == "totcost01" ||
        editedField == "totcost02" ||
        editedField == "totcost03" ||
        editedField == "totcost04" ||
        editedField == "totcost05" ||
        editedField == "totcost06" ||
        editedField == "totcost07" ||
        editedField == "totcost08" ||
        editedField == "totcost09" ||
        editedField == "totcost10" ||
        editedField == "totcost11" ||
        editedField == "totcost12"
      ) {
        const newData = mainDataResult4.data.map((item) =>
          item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState4)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                totcost:
                  item.totcost01 +
                  item.totcost02 +
                  item.totcost03 +
                  item.totcost04 +
                  item.totcost05 +
                  item.totcost06 +
                  item.totcost07 +
                  item.totcost08 +
                  item.totcost09 +
                  item.totcost10 +
                  item.totcost11 +
                  item.totcost12,
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setTempResult4((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
        setMainDataResult4((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else if (editedField == "user_id") {
        const newData = mainDataResult4.data.map((item) =>
          item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState4)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                postcd: userListData.find(
                  (items: any) => items.user_id == item.user_id
                )?.postcd,
                dptcd: userListData.find(
                  (items: any) => items.user_id == item.user_id
                )?.dptcd,
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setTempResult4((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
        setMainDataResult4((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else {
        const newData = mainDataResult4.data.map((item) =>
          item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState4)[0]
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

        setTempResult4((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
        setMainDataResult4((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      }
    } else {
      const newData = mainDataResult4.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };
  const fetchCustInfo = async (custcd: string) => {
    if (!permissions.view) return;
    if (custcd == "") return;
    let data: any;
    let custInfo: any = null;

    const queryStr = getCustDataQuery(custcd);
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
        custInfo = {
          custcd: rows[0].custcd,
          custnm: rows[0].custnm,
        };
      }
    }

    return custInfo;
  };

  useEffect(() => {
    const newData = mainDataResult2.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState2)[0])
        ? {
            ...item,
            custcd: custcd,
            custnm: custnm,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
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
  }, [custcd, custnm]);

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

  const onDeleteClick4 = (e: any) => {
    if (!permissions.save) return;
    const dataItem = mainDataResult4.data.filter(
      (item: any) =>
        item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState4)[0]
    );

    if (dataItem.length == 0) return false;

    let dataArr: any = {
      rowstatus_s: [],
      pgmdiv_s: [],
      custcd_s: [],
      devdiv_s: [],
      userid_s: [],
      remark_s: [],

      seq01_s: [],
      seq02_s: [],
      seq03_s: [],
      seq04_s: [],
      seq05_s: [],
      seq06_s: [],
      seq07_s: [],
      seq08_s: [],
      seq09_s: [],
      seq10_s: [],
      seq11_s: [],
      seq12_s: [],

      dircost01_s: [],
      dircost02_s: [],
      dircost03_s: [],
      dircost04_s: [],
      dircost05_s: [],
      dircost06_s: [],
      dircost07_s: [],
      dircost08_s: [],
      dircost09_s: [],
      dircost10_s: [],
      dircost11_s: [],
      dircost12_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        pgmdiv = "",
        custcd = "",
        devdiv = "",
        user_id = "",
        remark = "",

        seq01 = "",
        seq02 = "",
        seq03 = "",
        seq04 = "",
        seq05 = "",
        seq06 = "",
        seq07 = "",
        seq08 = "",
        seq09 = "",
        seq10 = "",
        seq11 = "",
        seq12 = "",

        dircost01 = "",
        dircost02 = "",
        dircost03 = "",
        dircost04 = "",
        dircost05 = "",
        dircost06 = "",
        dircost07 = "",
        dircost08 = "",
        dircost09 = "",
        dircost10 = "",
        dircost11 = "",
        dircost12 = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.pgmdiv_s.push("Z");
      dataArr.custcd_s.push(custcd);
      dataArr.devdiv_s.push(devdiv);
      dataArr.userid_s.push(user_id);
      dataArr.remark_s.push(remark);
      dataArr.seq01_s.push(seq01);
      dataArr.seq02_s.push(seq02);
      dataArr.seq03_s.push(seq03);
      dataArr.seq04_s.push(seq04);
      dataArr.seq05_s.push(seq05);
      dataArr.seq06_s.push(seq06);
      dataArr.seq07_s.push(seq07);
      dataArr.seq08_s.push(seq08);
      dataArr.seq09_s.push(seq09);
      dataArr.seq10_s.push(seq10);
      dataArr.seq11_s.push(seq11);
      dataArr.seq12_s.push(seq12);
      dataArr.dircost01_s.push(dircost01);
      dataArr.dircost02_s.push(dircost02);
      dataArr.dircost03_s.push(dircost03);
      dataArr.dircost04_s.push(dircost04);
      dataArr.dircost05_s.push(dircost05);
      dataArr.dircost06_s.push(dircost06);
      dataArr.dircost07_s.push(dircost07);
      dataArr.dircost08_s.push(dircost08);
      dataArr.dircost09_s.push(dircost09);
      dataArr.dircost10_s.push(dircost10);
      dataArr.dircost11_s.push(dircost11);
      dataArr.dircost12_s.push(dircost12);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "PLAN",
      orgdiv: sessionOrgdiv,
      yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
      dptcd: "",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      pgmdiv_s: dataArr.pgmdiv_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      devdiv_s: dataArr.devdiv_s.join("|"),
      userid_s: dataArr.userid_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      seq01_s: dataArr.seq01_s.join("|"),
      seq02_s: dataArr.seq02_s.join("|"),
      seq03_s: dataArr.seq03_s.join("|"),
      seq04_s: dataArr.seq04_s.join("|"),
      seq05_s: dataArr.seq05_s.join("|"),
      seq06_s: dataArr.seq06_s.join("|"),
      seq07_s: dataArr.seq07_s.join("|"),
      seq08_s: dataArr.seq08_s.join("|"),
      seq09_s: dataArr.seq09_s.join("|"),
      seq10_s: dataArr.seq10_s.join("|"),
      seq11_s: dataArr.seq11_s.join("|"),
      seq12_s: dataArr.seq12_s.join("|"),
      dircost01_s: dataArr.dircost01_s.join("|"),
      dircost02_s: dataArr.dircost02_s.join("|"),
      dircost03_s: dataArr.dircost03_s.join("|"),
      dircost04_s: dataArr.dircost04_s.join("|"),
      dircost05_s: dataArr.dircost05_s.join("|"),
      dircost06_s: dataArr.dircost06_s.join("|"),
      dircost07_s: dataArr.dircost07_s.join("|"),
      dircost08_s: dataArr.dircost08_s.join("|"),
      dircost09_s: dataArr.dircost09_s.join("|"),
      dircost10_s: dataArr.dircost10_s.join("|"),
      dircost11_s: dataArr.dircost11_s.join("|"),
      dircost12_s: dataArr.dircost12_s.join("|"),
    }));
  };

  const onAddClick2 = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY2]: ++temp2,
      custcd: "",
      custnm: "",
      devdiv: "",
      dircost01: 0,
      dircost02: 0,
      dircost03: 0,
      dircost04: 0,
      dircost05: 0,
      dircost06: 0,
      dircost07: 0,
      dircost08: 0,
      dircost09: 0,
      dircost10: 0,
      dircost11: 0,
      dircost12: 0,
      dptcd: sessionDptcd,
      orgdiv: sessionOrgdiv,
      pgmdiv: "",
      postcd: sessionPostcd,
      remark: "",
      seq01: 0,
      seq02: 0,
      seq03: 0,
      seq04: 0,
      seq05: 0,
      seq06: 0,
      seq07: 0,
      seq08: 0,
      seq09: 0,
      seq10: 0,
      seq11: 0,
      seq12: 0,
      totdircost: 0,
      user_id: userId,
      rowstatus: "N",
    };

    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    setMainDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onSaveClick2 = () => {
    if (!permissions.save) return;
    if (mainDataResult.total == 0) return;
    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    const dptcd = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    let valid = true;

    dataItem.map((item) => {
      if ((item.pgmdiv == "D" || item.pgmdiv == "E") && dptcd.dptcd != "0100") {
        valid = false;
      }
    });

    if (valid != true) {
      alert("수금실적, 매출실적은 경영지원팀만 수정 및 등록 가능합니다.");
      return false;
    }
    if (dataItem.length == 0 && deletedMainRows2.length == 0) return false;

    let dataArr: any = {
      rowstatus_s: [],
      pgmdiv_s: [],
      custcd_s: [],
      devdiv_s: [],
      userid_s: [],
      remark_s: [],

      seq01_s: [],
      seq02_s: [],
      seq03_s: [],
      seq04_s: [],
      seq05_s: [],
      seq06_s: [],
      seq07_s: [],
      seq08_s: [],
      seq09_s: [],
      seq10_s: [],
      seq11_s: [],
      seq12_s: [],

      dircost01_s: [],
      dircost02_s: [],
      dircost03_s: [],
      dircost04_s: [],
      dircost05_s: [],
      dircost06_s: [],
      dircost07_s: [],
      dircost08_s: [],
      dircost09_s: [],
      dircost10_s: [],
      dircost11_s: [],
      dircost12_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        pgmdiv = "",
        custcd = "",
        devdiv = "",
        user_id = "",
        remark = "",

        seq01 = "",
        seq02 = "",
        seq03 = "",
        seq04 = "",
        seq05 = "",
        seq06 = "",
        seq07 = "",
        seq08 = "",
        seq09 = "",
        seq10 = "",
        seq11 = "",
        seq12 = "",

        dircost01 = "",
        dircost02 = "",
        dircost03 = "",
        dircost04 = "",
        dircost05 = "",
        dircost06 = "",
        dircost07 = "",
        dircost08 = "",
        dircost09 = "",
        dircost10 = "",
        dircost11 = "",
        dircost12 = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.pgmdiv_s.push(pgmdiv);
      dataArr.custcd_s.push(custcd);
      dataArr.devdiv_s.push(devdiv);
      dataArr.userid_s.push(user_id);
      dataArr.remark_s.push(remark);
      dataArr.seq01_s.push(seq01);
      dataArr.seq02_s.push(seq02);
      dataArr.seq03_s.push(seq03);
      dataArr.seq04_s.push(seq04);
      dataArr.seq05_s.push(seq05);
      dataArr.seq06_s.push(seq06);
      dataArr.seq07_s.push(seq07);
      dataArr.seq08_s.push(seq08);
      dataArr.seq09_s.push(seq09);
      dataArr.seq10_s.push(seq10);
      dataArr.seq11_s.push(seq11);
      dataArr.seq12_s.push(seq12);
      dataArr.dircost01_s.push(dircost01);
      dataArr.dircost02_s.push(dircost02);
      dataArr.dircost03_s.push(dircost03);
      dataArr.dircost04_s.push(dircost04);
      dataArr.dircost05_s.push(dircost05);
      dataArr.dircost06_s.push(dircost06);
      dataArr.dircost07_s.push(dircost07);
      dataArr.dircost08_s.push(dircost08);
      dataArr.dircost09_s.push(dircost09);
      dataArr.dircost10_s.push(dircost10);
      dataArr.dircost11_s.push(dircost11);
      dataArr.dircost12_s.push(dircost12);
    });

    deletedMainRows2.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        pgmdiv = "",
        custcd = "",
        devdiv = "",
        user_id = "",
        remark = "",

        seq01 = "",
        seq02 = "",
        seq03 = "",
        seq04 = "",
        seq05 = "",
        seq06 = "",
        seq07 = "",
        seq08 = "",
        seq09 = "",
        seq10 = "",
        seq11 = "",
        seq12 = "",

        dircost01 = "",
        dircost02 = "",
        dircost03 = "",
        dircost04 = "",
        dircost05 = "",
        dircost06 = "",
        dircost07 = "",
        dircost08 = "",
        dircost09 = "",
        dircost10 = "",
        dircost11 = "",
        dircost12 = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.pgmdiv_s.push(pgmdiv);
      dataArr.custcd_s.push(custcd);
      dataArr.devdiv_s.push(devdiv);
      dataArr.userid_s.push(user_id);
      dataArr.remark_s.push(remark);
      dataArr.seq01_s.push(seq01);
      dataArr.seq02_s.push(seq02);
      dataArr.seq03_s.push(seq03);
      dataArr.seq04_s.push(seq04);
      dataArr.seq05_s.push(seq05);
      dataArr.seq06_s.push(seq06);
      dataArr.seq07_s.push(seq07);
      dataArr.seq08_s.push(seq08);
      dataArr.seq09_s.push(seq09);
      dataArr.seq10_s.push(seq10);
      dataArr.seq11_s.push(seq11);
      dataArr.seq12_s.push(seq12);
      dataArr.dircost01_s.push(dircost01);
      dataArr.dircost02_s.push(dircost02);
      dataArr.dircost03_s.push(dircost03);
      dataArr.dircost04_s.push(dircost04);
      dataArr.dircost05_s.push(dircost05);
      dataArr.dircost06_s.push(dircost06);
      dataArr.dircost07_s.push(dircost07);
      dataArr.dircost08_s.push(dircost08);
      dataArr.dircost09_s.push(dircost09);
      dataArr.dircost10_s.push(dircost10);
      dataArr.dircost11_s.push(dircost11);
      dataArr.dircost12_s.push(dircost12);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "ACTION",
      orgdiv: sessionOrgdiv,
      yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
      dptcd: dptcd != undefined ? dptcd.dptcd : "",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      pgmdiv_s: dataArr.pgmdiv_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      devdiv_s: dataArr.devdiv_s.join("|"),
      userid_s: dataArr.userid_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      seq01_s: dataArr.seq01_s.join("|"),
      seq02_s: dataArr.seq02_s.join("|"),
      seq03_s: dataArr.seq03_s.join("|"),
      seq04_s: dataArr.seq04_s.join("|"),
      seq05_s: dataArr.seq05_s.join("|"),
      seq06_s: dataArr.seq06_s.join("|"),
      seq07_s: dataArr.seq07_s.join("|"),
      seq08_s: dataArr.seq08_s.join("|"),
      seq09_s: dataArr.seq09_s.join("|"),
      seq10_s: dataArr.seq10_s.join("|"),
      seq11_s: dataArr.seq11_s.join("|"),
      seq12_s: dataArr.seq12_s.join("|"),
      dircost01_s: dataArr.dircost01_s.join("|"),
      dircost02_s: dataArr.dircost02_s.join("|"),
      dircost03_s: dataArr.dircost03_s.join("|"),
      dircost04_s: dataArr.dircost04_s.join("|"),
      dircost05_s: dataArr.dircost05_s.join("|"),
      dircost06_s: dataArr.dircost06_s.join("|"),
      dircost07_s: dataArr.dircost07_s.join("|"),
      dircost08_s: dataArr.dircost08_s.join("|"),
      dircost09_s: dataArr.dircost09_s.join("|"),
      dircost10_s: dataArr.dircost10_s.join("|"),
      dircost11_s: dataArr.dircost11_s.join("|"),
      dircost12_s: dataArr.dircost12_s.join("|"),
    }));
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    yyyy: "",
    dptcd: "",
    rowstatus_s: "",
    pgmdiv_s: "",
    custcd_s: "",
    devdiv_s: "",
    userid_s: "",
    remark_s: "",
    seq01_s: "",
    seq02_s: "",
    seq03_s: "",
    seq04_s: "",
    seq05_s: "",
    seq06_s: "",
    seq07_s: "",
    seq08_s: "",
    seq09_s: "",
    seq10_s: "",
    seq11_s: "",
    seq12_s: "",
    dircost01_s: "",
    dircost02_s: "",
    dircost03_s: "",
    dircost04_s: "",
    dircost05_s: "",
    dircost06_s: "",
    dircost07_s: "",
    dircost08_s: "",
    dircost09_s: "",
    dircost10_s: "",
    dircost11_s: "",
    dircost12_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_CM_A9000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_yyyy": ParaData.yyyy,
      "@p_dptcd": ParaData.dptcd,

      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_pgmdiv_s": ParaData.pgmdiv_s,
      "@p_custcd_s": ParaData.custcd_s,
      "@p_devdiv_s": ParaData.devdiv_s,
      "@p_userid_s": ParaData.userid_s,
      "@p_remark_s": ParaData.remark_s,

      "@p_seq01_s": ParaData.seq01_s,
      "@p_seq02_s": ParaData.seq02_s,
      "@p_seq03_s": ParaData.seq03_s,
      "@p_seq04_s": ParaData.seq04_s,
      "@p_seq05_s": ParaData.seq05_s,
      "@p_seq06_s": ParaData.seq06_s,
      "@p_seq07_s": ParaData.seq07_s,
      "@p_seq08_s": ParaData.seq08_s,
      "@p_seq09_s": ParaData.seq09_s,
      "@p_seq10_s": ParaData.seq10_s,
      "@p_seq11_s": ParaData.seq11_s,
      "@p_seq12_s": ParaData.seq12_s,

      "@p_dircost01_s": ParaData.dircost01_s,
      "@p_dircost02_s": ParaData.dircost02_s,
      "@p_dircost03_s": ParaData.dircost03_s,
      "@p_dircost04_s": ParaData.dircost04_s,
      "@p_dircost05_s": ParaData.dircost05_s,
      "@p_dircost06_s": ParaData.dircost06_s,
      "@p_dircost07_s": ParaData.dircost07_s,
      "@p_dircost08_s": ParaData.dircost08_s,
      "@p_dircost09_s": ParaData.dircost09_s,
      "@p_dircost10_s": ParaData.dircost10_s,
      "@p_dircost11_s": ParaData.dircost11_s,
      "@p_dircost12_s": ParaData.dircost12_s,
      "@p_form_id": "CM_A9000W",
      "@p_pc": pc,
      "@p_userid": userId,
    },
  };

  useEffect(() => {
    if (ParaData.workType != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

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
      if (tabSelected == 0) {
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: prev.pgNum,
          isSearch: true,
        }));
      } else if (tabSelected == 2) {
        setFilters4((prev: any) => ({
          ...prev,
          find_row_value: "",
          pgNum: prev.pgNum,
          isSearch: true,
        }));
      }

      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        yyyy: "",
        dptcd: "",
        rowstatus_s: "",
        pgmdiv_s: "",
        custcd_s: "",
        devdiv_s: "",
        userid_s: "",
        remark_s: "",
        seq01_s: "",
        seq02_s: "",
        seq03_s: "",
        seq04_s: "",
        seq05_s: "",
        seq06_s: "",
        seq07_s: "",
        seq08_s: "",
        seq09_s: "",
        seq10_s: "",
        seq11_s: "",
        seq12_s: "",
        dircost01_s: "",
        dircost02_s: "",
        dircost03_s: "",
        dircost04_s: "",
        dircost05_s: "",
        dircost06_s: "",
        dircost07_s: "",
        dircost08_s: "",
        dircost09_s: "",
        dircost10_s: "",
        dircost11_s: "",
        dircost12_s: "",
      });
      deletedMainRows2 = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onSaveClick4 = () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult4.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length == 0) return false;

    let dataArr: any = {
      rowstatus_s: [],
      pgmdiv_s: [],
      custcd_s: [],
      devdiv_s: [],
      userid_s: [],
      remark_s: [],

      seq01_s: [],
      seq02_s: [],
      seq03_s: [],
      seq04_s: [],
      seq05_s: [],
      seq06_s: [],
      seq07_s: [],
      seq08_s: [],
      seq09_s: [],
      seq10_s: [],
      seq11_s: [],
      seq12_s: [],

      dircost01_s: [],
      dircost02_s: [],
      dircost03_s: [],
      dircost04_s: [],
      dircost05_s: [],
      dircost06_s: [],
      dircost07_s: [],
      dircost08_s: [],
      dircost09_s: [],
      dircost10_s: [],
      dircost11_s: [],
      dircost12_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        pgmdiv = "",
        custcd = "",
        devdiv = "",
        user_id = "",
        remark = "",

        seq01 = "",
        seq02 = "",
        seq03 = "",
        seq04 = "",
        seq05 = "",
        seq06 = "",
        seq07 = "",
        seq08 = "",
        seq09 = "",
        seq10 = "",
        seq11 = "",
        seq12 = "",

        dircost01 = "",
        dircost02 = "",
        dircost03 = "",
        dircost04 = "",
        dircost05 = "",
        dircost06 = "",
        dircost07 = "",
        dircost08 = "",
        dircost09 = "",
        dircost10 = "",
        dircost11 = "",
        dircost12 = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.pgmdiv_s.push("Z");
      dataArr.custcd_s.push(custcd);
      dataArr.devdiv_s.push(devdiv);
      dataArr.userid_s.push(user_id);
      dataArr.remark_s.push(remark);
      dataArr.seq01_s.push(seq01);
      dataArr.seq02_s.push(seq02);
      dataArr.seq03_s.push(seq03);
      dataArr.seq04_s.push(seq04);
      dataArr.seq05_s.push(seq05);
      dataArr.seq06_s.push(seq06);
      dataArr.seq07_s.push(seq07);
      dataArr.seq08_s.push(seq08);
      dataArr.seq09_s.push(seq09);
      dataArr.seq10_s.push(seq10);
      dataArr.seq11_s.push(seq11);
      dataArr.seq12_s.push(seq12);
      dataArr.dircost01_s.push(dircost01);
      dataArr.dircost02_s.push(dircost02);
      dataArr.dircost03_s.push(dircost03);
      dataArr.dircost04_s.push(dircost04);
      dataArr.dircost05_s.push(dircost05);
      dataArr.dircost06_s.push(dircost06);
      dataArr.dircost07_s.push(dircost07);
      dataArr.dircost08_s.push(dircost08);
      dataArr.dircost09_s.push(dircost09);
      dataArr.dircost10_s.push(dircost10);
      dataArr.dircost11_s.push(dircost11);
      dataArr.dircost12_s.push(dircost12);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "PLAN",
      orgdiv: sessionOrgdiv,
      yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
      dptcd: "",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      pgmdiv_s: dataArr.pgmdiv_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      devdiv_s: dataArr.devdiv_s.join("|"),
      userid_s: dataArr.userid_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      seq01_s: dataArr.seq01_s.join("|"),
      seq02_s: dataArr.seq02_s.join("|"),
      seq03_s: dataArr.seq03_s.join("|"),
      seq04_s: dataArr.seq04_s.join("|"),
      seq05_s: dataArr.seq05_s.join("|"),
      seq06_s: dataArr.seq06_s.join("|"),
      seq07_s: dataArr.seq07_s.join("|"),
      seq08_s: dataArr.seq08_s.join("|"),
      seq09_s: dataArr.seq09_s.join("|"),
      seq10_s: dataArr.seq10_s.join("|"),
      seq11_s: dataArr.seq11_s.join("|"),
      seq12_s: dataArr.seq12_s.join("|"),
      dircost01_s: dataArr.dircost01_s.join("|"),
      dircost02_s: dataArr.dircost02_s.join("|"),
      dircost03_s: dataArr.dircost03_s.join("|"),
      dircost04_s: dataArr.dircost04_s.join("|"),
      dircost05_s: dataArr.dircost05_s.join("|"),
      dircost06_s: dataArr.dircost06_s.join("|"),
      dircost07_s: dataArr.dircost07_s.join("|"),
      dircost08_s: dataArr.dircost08_s.join("|"),
      dircost09_s: dataArr.dircost09_s.join("|"),
      dircost10_s: dataArr.dircost10_s.join("|"),
      dircost11_s: dataArr.dircost11_s.join("|"),
      dircost12_s: dataArr.dircost12_s.join("|"),
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
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab
          title="MBO_ACTION"
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
                  <th>실적개발구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="devdiv"
                        value={filters.devdiv}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="name"
                        valueField="code"
                      />
                    )}
                  </td>
                  <th>구분</th>
                  <td colSpan={3}>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="pgmdiv"
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
                  <th>사원명</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="userid"
                        value={filters.userid}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="user_name"
                        valueField="user_id"
                      />
                    )}
                  </td>
                  <th>재직구분</th>
                  <td>
                    {" "}
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="rtrchk"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
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
                    <GridTitleContainer className="ButtonContainer">
                      <GridTitle>부서정보</GridTitle>
                      <ButtonContainer>
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
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer2">
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
                            {"개인별 실적금액관리"}
                          </ButtonContainer>
                        </ButtonContainer>
                      </GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick2}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onDeleteClick2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={onSaveClick2}
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
                        custcd,
                        custnm,
                        setCustcd,
                        setCustnm,
                        mainDataState2,
                        setMainDataState2,
                        // fetchGrid,
                      }}
                    >
                      <ExcelExport
                        data={mainDataResult2.data}
                        ref={(exporter) => {
                          _export2 = exporter;
                        }}
                        fileName={getMenuName()}
                      >
                        <Grid
                          style={{
                            height: mobileheight2,
                          }}
                          data={process(
                            mainDataResult2.data.map((row) => ({
                              ...row,
                              dptcd: dptcdListData.find(
                                (item: any) => item.dptcd == row.dptcd
                              )?.dptnm,
                              postcd: postcdListData.find(
                                (item: any) => item.sub_code == row.postcd
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
                          onItemChange={onMainItemChange2}
                          cellRender={customCellRender2}
                          rowRender={customRowRender2}
                          editField={EDIT_FIELD}
                        >
                          <GridColumn
                            field="rowstatus"
                            title=" "
                            width="50px"
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
                                        CustomComboField.includes(
                                          item.fieldName
                                        )
                                          ? CustomComboBoxCell
                                          : commandField.includes(
                                              item.fieldName
                                            )
                                          ? ColumnCommandCell
                                          : NumberField.includes(item.fieldName)
                                          ? NumberCell
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? mainTotalFooterCell2
                                          : NumberField.includes(item.fieldName)
                                          ? gridSumQtyFooterCell2
                                          : undefined
                                      }
                                    />
                                  )
                              )}
                        </Grid>
                      </ExcelExport>
                    </FormContext.Provider>
                  </GridContainer>
                </SwiperSlide>
              </Swiper>
            </>
          ) : (
            <>
              <GridContainerWrap>
                <GridContainer width="20%">
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>부서정보</GridTitle>
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
                <GridContainer width={`calc(80% - ${GAP}px)`}>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>개인별 실적금액관리</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick2}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        onClick={onDeleteClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        onClick={onSaveClick2}
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
                      custcd,
                      custnm,
                      setCustcd,
                      setCustnm,
                      mainDataState2,
                      setMainDataState2,
                      // fetchGrid,
                    }}
                  >
                    <ExcelExport
                      data={mainDataResult2.data}
                      ref={(exporter) => {
                        _export2 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{
                          height: webheight2,
                        }}
                        data={process(
                          mainDataResult2.data.map((row) => ({
                            ...row,
                            dptcd: dptcdListData.find(
                              (item: any) => item.dptcd == row.dptcd
                            )?.dptnm,
                            postcd: postcdListData.find(
                              (item: any) => item.sub_code == row.postcd
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
                                    id={item.id}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    cell={
                                      CustomComboField.includes(item.fieldName)
                                        ? CustomComboBoxCell
                                        : commandField.includes(item.fieldName)
                                        ? ColumnCommandCell
                                        : NumberField.includes(item.fieldName)
                                        ? NumberCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell2
                                        : NumberField.includes(item.fieldName)
                                        ? gridSumQtyFooterCell2
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </FormContext.Provider>
                </GridContainer>
              </GridContainerWrap>
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="MBO_ANALYSIS"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>회사구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="orgdiv"
                        value={filters3.orgdiv}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange3}
                      />
                    )}
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
                  <th>기준년도</th>
                  <td>
                    <DatePicker
                      name="yyyy"
                      value={filters3.yyyy}
                      format="yyyy"
                      onChange={filterInputChange3}
                      placeholder=""
                      calendar={YearCalendar}
                      className="required"
                    />
                  </td>
                  <th>부서</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="dptcd"
                        value={filters3.dptcd}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange3}
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
              <Swiper
                onSwiper={(swiper) => {
                  setSwiper(swiper);
                }}
                onActiveIndexChange={(swiper) => {
                  index = swiper.activeIndex;
                }}
              >
                <SwiperSlide key={0}>
                  <Chart
                    style={{
                      width: "100%",
                      height: mobileheight3,
                    }}
                  >
                    <ChartValueAxis>
                      <ChartValueAxisItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                      />
                    </ChartValueAxis>
                    {/* <ChartTitle text="Units sold" /> */}
                    <ChartCategoryAxis>
                      <ChartCategoryAxisItem
                        categories={allChartDataResult.companies.map(
                          (name) => name
                        )}
                      >
                        <ChartCategoryAxisTitle text="사업계획금액(원)" />
                      </ChartCategoryAxisItem>
                    </ChartCategoryAxis>
                    <ChartSeries>
                      <ChartSeriesItem
                        labels={{
                          visible: true,
                          content: (e) => numberWithCommas(e.value) + "",
                        }}
                        type="line"
                        // gap={2}
                        // spacing={0.25}
                        data={allChartDataResult.series}
                      />
                    </ChartSeries>
                  </Chart>
                </SwiperSlide>
                <SwiperSlide key={1}>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer3">
                      <GridTitle>상세정보</GridTitle>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult3.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName={getMenuName()}
                    >
                      <Grid
                        style={{
                          height: mobileheight4,
                        }}
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
                                      NumberField.includes(item.fieldName)
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
              </Swiper>
            </>
          ) : (
            <>
              <Chart
                style={{
                  width: "100%",
                  height: webheight3,
                }}
              >
                <ChartValueAxis>
                  <ChartValueAxisItem
                    labels={{
                      visible: true,
                      content: (e) => numberWithCommas(e.value) + "",
                    }}
                  />
                </ChartValueAxis>
                {/* <ChartTitle text="Units sold" /> */}
                <ChartCategoryAxis>
                  <ChartCategoryAxisItem
                    categories={allChartDataResult.companies.map(
                      (name) => name
                    )}
                  >
                    <ChartCategoryAxisTitle text="사업계획금액(원)" />
                  </ChartCategoryAxisItem>
                </ChartCategoryAxis>
                <ChartSeries>
                  <ChartSeriesItem
                    labels={{
                      visible: true,
                      content: (e) => numberWithCommas(e.value) + "",
                    }}
                    type="line"
                    // gap={2}
                    // spacing={0.25}
                    data={allChartDataResult.series}
                  />
                </ChartSeries>
              </Chart>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>상세정보</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult3.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{
                      height: webheight4,
                    }}
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
                                  NumberField.includes(item.fieldName)
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
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="MBO_PLAN"
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
                      value={filters4.yyyy}
                      format="yyyy"
                      onChange={filterInputChange4}
                      placeholder=""
                      calendar={YearCalendar}
                      className="required"
                    />
                  </td>
                  <th>회사구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="orgdiv"
                        value={filters4.orgdiv}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange4}
                      />
                    )}
                  </td>
                  <th>사업장</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="location"
                        value={filters4.location}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange4}
                      />
                    )}
                  </td>
                  <th>현황조회여부</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="viewyn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange4}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>사원명</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="userid"
                        value={filters4.userid}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange4}
                        textField="user_name"
                        valueField="user_id"
                      />
                    )}
                  </td>
                  <th>재직구분</th>
                  <td>
                    {" "}
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="rtrchk"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange4}
                      />
                    )}
                  </td>
                  <th>부서</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="dptcd"
                        value={filters4.dptcd}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange4}
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
            <></>
          ) : (
            <GridContainer>
              <GridTitleContainer className="ButtonContainer4">
                <GridTitle>기준목표금액</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onDeleteClick4}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="reset"
                    title="초기화"
                    disabled={permissions.save ? false : true}
                  ></Button>
                  <Button
                    onClick={onSaveClick4}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                    disabled={permissions.save ? false : true}
                  ></Button>
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
                  style={{
                    height: webheight5,
                  }}
                  data={process(
                    mainDataResult4.data.map((row) => ({
                      ...row,
                      dptcd: dptcdListData.find(
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
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
                  onItemChange={onMainItemChange4}
                  cellRender={customCellRender4}
                  rowRender={customRowRender4}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
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
                                CustomComboField.includes(item.fieldName)
                                  ? CustomComboBoxCell
                                  : NumberField.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell4
                                  : NumberField.includes(item.fieldName)
                                  ? gridSumQtyFooterCell4
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
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

export default CM_A9000W;
