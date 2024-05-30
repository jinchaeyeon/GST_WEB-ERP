import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
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
import { Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useRef, useState } from "react";
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
import MonthCalendar from "../components/Calendars/MonthCalendar";
import CenterCell from "../components/Cells/CenterCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
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
  convertDateToStrWithTime2,
  findMessage,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import PlanWindow from "../components/Windows/PR_A4000W_Plan_Window";
import DetailWindow from "../components/Windows/PR_A4000W_Window";
import { useApi } from "../hooks/api";
import { IItemData } from "../hooks/interfaces";
import { heightstate, isLoading, isMobileState } from "../store/atoms";
import { gridList } from "../store/columns/PR_A4000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const GO_DATA_ITEM_KEY = "num";
const DETAIL_ITEM_KEY = "num";
const DAILY_ITEM_KEY = "num";
const NumberField = ["qty", "badqty", "time"];
const CustomComboField = [
  "proccd",
  "prodmac",
  "prodemp",
  "qtyunit",
  "itemacnt",
];
const CeneterField = ["strtime", "endtime", "ordnum", "gb"];

let temp = 0;
let targetRowIndex: null | number = null;
let targetRowIndex1: null | number = null;
let deletedRows: object[] = [];
let custdiv = "";

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_PR010, L_fxcode, L_sysUserMaster_001, L_BA015, L_BA061",
    setBizComponentData
  );
  //공정, 설비, 작업자, 수량단위, 품목계정

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "proccd"
      ? "L_PR010"
      : field == "prodmac"
      ? "L_fxcode"
      : field == "prodemp"
      ? "L_sysUserMaster_001"
      : field == "qtyunit"
      ? "L_BA015"
      : field == "itemacnt"
      ? "L_BA061"
      : "";

  const fieldName =
    field == "prodemp"
      ? "user_name"
      : field == "prodmac"
      ? "fxfull"
      : undefined;
  const fieldValue =
    field == "prodemp" ? "user_id" : field == "prodmac" ? "fxcode" : undefined;
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

const PR_A4000W: React.FC = () => {
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".k-tabstrip-items-wrapper");
  var height1 = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  var height3 = getHeight(".ButtonContainer3");
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter1 = getter(GO_DATA_ITEM_KEY);
  const idGetter2 = getter(DETAIL_ITEM_KEY);
  const idGetter3 = getter(DAILY_ITEM_KEY);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("PR_A4000W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("PR_A4000W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"), // 생산실적관리 일자
        todt: setDefaultDate(customOptionData, "todt"), // 생산실적관리 일자
        prodemp: defaultOption.find((item: any) => item.id == "prodemp")
          ?.valueCode,
        itemacnt: defaultOption.find((item: any) => item.id == "itemacnt")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        prodmac: defaultOption.find((item: any) => item.id == "prodmac")
          ?.valueCode,
        proccd: defaultOption.find((item: any) => item.id == "proccd")
          ?.valueCode,
      }));
      setGoFilters((prev) => ({
        ...prev,
        frdt1: setDefaultDate(customOptionData, "frdt1"), // 가동-비가동 일자
        todt1: setDefaultDate(customOptionData, "todt1"), // 가동-비가동 일자
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_fxcode, L_sysUserMaster_001, L_BA015, L_PR010, L_BA002",
    setBizComponentData
  );

  const [prodmacListData, setProdmacListData] = React.useState([
    { fxcode: "", fxfull: "" },
  ]);
  const [prodempListData, setProdempListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setProdmacListData(getBizCom(bizComponentData, "L_fxcode"));
      setProdempListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
    }
  }, [bizComponentData]);

  const [tabSelected, setTabSelected] = React.useState(0);

  const handleSelectTab = (e: any) => {
    resetAllGrid();
    setTabSelected(e.selected);

    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      setGoFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
      setDetailFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
    } else {
      setDailyFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
    }
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page1, setPage1] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

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

  const pageChange1 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setGoFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage1({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
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

    setDailyFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [planWindowVisible, setPlanWindowVisible] = useState<boolean>(false);
  const [prodtime, setProdTime] = useState<string>();
  const [stoptime, setStopTime] = useState<string>();
  const [prodrate, setProdRate] = useState<string>();
  const [stoprate, setStopRate] = useState<string>();

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const onPlanWndClick = () => {
    setPlanWindowVisible(true);
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    // 조회조건 세팅
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const setPlanData = (data: any) => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    try {
      data.map((item: any) => {
        const newData = {
          [DATA_ITEM_KEY]: ++temp,
          rowstatus: "N",
          proccd: item.proccd,
          itemcd: item.itemcd,
          itemnm: item.itemnm,
          insiz: item.insiz,
          qty: item.qty,
          badqty: 0,
          qtyunit: item.qtyunit,
          gokey: custdiv == "A" ? item.keyfield : "",
          plankey: custdiv == "A" ? item.plankey : item.keyfield,
          strtime: convertDateToStrWithTime2(new Date()),
          endtime: convertDateToStrWithTime2(new Date()),
        };

        setMainDataResult((prev) => {
          return {
            data: [newData, ...prev.data],
            total: prev.total + data.length,
          };
        });

        setSelectedState({ [newData[DATA_ITEM_KEY]]: true });
      });
    } catch (e) {
      alert(e);
    }
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterInputChange1 = (e: any) => {
    const { value, name } = e.target;

    setDailyFilters((prev) => ({
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

  const [rekey, setRekey] = useState("");
  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      // 행 클릭, 디테일 팝업 창 오픈
      const rowData = props.dataItem;
      setSelectedState({ [rowData[DATA_ITEM_KEY]]: true });
      setRekey(rowData.rekey);

      // 실적번호가 없을 경우 메세지처리
      // 실적번호가 존재하지 않습니다. 실적을 먼저 저장해주세요.
      try {
        if (rowData.rekey == null || rowData.rekey == "") {
          setDetailWindowVisible(false);
          throw findMessage(messagesData, "PR_A4000W_003");
        } else {
          setDetailWindowVisible(true);
        }
      } catch (e) {
        alert(e);
      }
    };

    return (
      <>
        {props.rowType == "groupHeader" ? null : (
          <td className="k-command-cell">
            <Button
              className="k-grid-edit-command"
              themeColor={"primary"}
              onClick={onEditClick}
            >
              상세정보
            </Button>
          </td>
        )}
      </>
    );
  };

  const reloadData = (saveyn: string | undefined) => {
    let valid = false;

    mainDataResult.data.map((item: any) => {
      if (item.rowstatus != null || item.rowstauts !== undefined) {
        valid = true;
      }
    });

    // rowstatus 하나라도 값이 있으면 조회 X (수정된 데이터가 조회로 인해 초기화 되지 않도록)
    if (!valid) {
      if (saveyn == "Y" && saveyn !== undefined) {
        // 저장했을 경우에만 조회
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          find_row_value: rekey,
          isSearch: true,
        }));
      }
    }
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [goDataState, setGoDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [dailyDataState, setDailyDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [goDataResult, setGoDataResult] = useState<DataResult>(
    process([], goDataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [dailyDataResult, setDailyDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [goselectedState, setGoSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [dayilySelectedState, setDailySelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: orgdiv,
    frdt: new Date(),
    frdt1: new Date(),
    todt: new Date(),
    todt1: new Date(),
    prodemp: "",
    prodmac: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    lotnum: "",
    rekey: "",
    plankey: "",
    gokey: "",
    proccd: "",
    yyyymm: new Date(),
    ordnum: "",
    dptcd: "",
    location: location,
    itemacnt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  // 조회조건 초기값
  const [gofilters, setGoFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "",
    frdt: new Date(),
    frdt1: new Date(),
    todt: new Date(),
    todt1: new Date(),
    prodemp: "",
    prodmac: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    lotnum: "",
    rekey: "",
    plankey: "",
    gokey: "",
    proccd: "",
    yyyymm: new Date(),
    ordnum: "",
    dptcd: "",
    location: "",
    itemacnt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailfilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    prodmac: "",
    prodemp: "",
    pgNum: 1,
    isSearch: true,
  });

  const [dailyfilters, setDailyFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "",
    frdt: new Date(),
    frdt1: new Date(),
    todt: new Date(),
    todt1: new Date(),
    prodemp: "",
    prodmac: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    lotnum: "",
    rekey: "",
    plankey: "",
    gokey: "",
    proccd: "",
    yyyymm: new Date(),
    ordnum: "",
    dptcd: "",
    location: "",
    itemacnt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  let gridRef: any = useRef(null);
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A4000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_prodemp": filters.prodemp,
        "@p_prodmac": filters.prodmac,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_lotnum": filters.lotnum,
        "@p_rekey": filters.rekey,
        "@p_plankey": filters.plankey,
        "@p_gokey": filters.gokey,
        "@p_proccd": filters.proccd,
        "@p_yyyymm": "",
        "@p_ordnum": filters.ordnum,
        "@p_dptcd": filters.dptcd,
        "@p_location": filters.location,
        "@p_itemacnt": filters.itemacnt,
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
            (row: any) => row.rekey == filters.find_row_value
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
        // 작업지시 사용여부 세팅
        custdiv = data.returnString;

        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.rekey == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류발생]");
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
  const fetchGoGrid = async (gofilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const parameters: Iparameters = {
      procedureName: "P_PR_A4000W_Q",
      pageNumber: gofilters.pgNum,
      pageSize: gofilters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": orgdiv,
        "@p_frdt": convertDateToStr(gofilters.frdt1),
        "@p_todt": convertDateToStr(gofilters.todt1),
        "@p_prodemp": "",
        "@p_prodmac": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_insiz": "",
        "@p_lotnum": "",
        "@p_rekey": "",
        "@p_plankey": "",
        "@p_gokey": "",
        "@p_proccd": "",
        "@p_yyyymm": "",
        "@p_ordnum": "",
        "@p_dptcd": "",
        "@p_location": location,
        "@p_itemacnt": "",
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
      const rows = data.tables[0].Rows;

      setGoDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setGoSelectedState({ [rows[0][GO_DATA_ITEM_KEY]]: true });
        setDetailFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          prodmac: rows[0].prodmac,
          prodemp: rows[0].prodemp,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    // 필터 isSearch false처리, pgNum 세팅
    setGoFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchDetailGrid = async (detailfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const detailParameters: Iparameters = {
      procedureName: "P_PR_A4000W_Q",
      pageNumber: detailfilters.pgNum,
      pageSize: detailfilters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": orgdiv,
        "@p_frdt": convertDateToStr(gofilters.frdt1),
        "@p_todt": convertDateToStr(gofilters.todt1),
        "@p_prodemp": detailfilters.prodemp,
        "@p_prodmac": detailfilters.prodmac,
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_insiz": "",
        "@p_lotnum": "",
        "@p_rekey": "",
        "@p_plankey": "",
        "@p_gokey": "",
        "@p_proccd": "",
        "@p_yyyymm": "",
        "@p_ordnum": "",
        "@p_dptcd": "",
        "@p_location": location,
        "@p_itemacnt": "",
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      const rateRowCnt = data.tables[1].TotalRowCount;
      const rate = data.tables[1].Rows;

      // FormBox 가동률 값 세팅
      if (rateRowCnt > 0) {
        rate.map((item: any) => {
          setProdTime(item.prodtime);
          setStopTime(item.stoptime);
          setProdRate(item.prodrate);
          setStopRate(item.stoprate);
        });
      }

      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setDetailSelectedState({ [rows[0][DETAIL_ITEM_KEY]]: true });
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setDetailFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchDailyGrid = async (dailyfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A4000W_Q",
      pageNumber: dailyfilters.pgNum,
      pageSize: dailyfilters.pgSize,
      parameters: {
        "@p_work_type": "TAB3LIST",
        "@p_orgdiv": orgdiv,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_prodemp": "",
        "@p_prodmac": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_insiz": "",
        "@p_lotnum": "",
        "@p_rekey": "",
        "@p_plankey": "",
        "@p_gokey": "",
        "@p_proccd": "",
        "@p_yyyymm": convertDateToStr(dailyfilters.yyyymm).substring(0, 6),
        "@p_ordnum": "",
        "@p_dptcd": "",
        "@p_location": location,
        "@p_itemacnt": "",
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
      const rows = data.tables[0].Rows;

      setDailyDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setDailySelectedState({ [rows[0][DAILY_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류발생]");
      console.log(data);
    }
    // 필터 isSearch false처리
    setDailyFilters((prev) => ({
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
    if (customOptionData != null && filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (customOptionData != null && gofilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(gofilters);
      setGoFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));
      fetchGoGrid(deepCopiedFilters);
    }
  }, [gofilters]);

  useEffect(() => {
    if (customOptionData != null && detailfilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));
      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailfilters]);

  useEffect(() => {
    if (customOptionData != null && dailyfilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(dailyfilters);
      setDailyFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));
      fetchDailyGrid(deepCopiedFilters);
    }
  }, [dailyfilters]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  // 그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setGoDataResult(process([], goDataState));
    setDetailDataResult(process([], detailDataState));
    setDailyDataResult(process([], dailyDataState));

    // 가동-비가동 FormBox 빈값 처리
    setProdTime("0");
    setStopTime("0");
    setProdRate("0");
    setStopRate("0");
  };

  // 메인 그리드 선택 이벤트
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const onGoSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: goselectedState,
      dataItemKey: GO_DATA_ITEM_KEY,
    });
    setGoSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      prodmac: selectedRowData.prodmac_code,
      prodemp: selectedRowData.prodemp_code,
      isSearch: true,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DETAIL_ITEM_KEY,
    });

    setDetailSelectedState(newSelectedState);
  };

  const onDailySelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: dayilySelectedState,
      dataItemKey: DAILY_ITEM_KEY,
    });

    setDailySelectedState(newSelectedState);
  };

  // 엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "생산실적내역";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        optionsGridTwo.sheets[1] = optionsGridThree.sheets[0];
        optionsGridTwo.sheets[0].title = "작업정보";
        optionsGridTwo.sheets[1].title = "작업내용";
        _export2.save(optionsGridTwo);
      }
    }
    if (_export4 !== null && _export4 !== undefined) {
      if (tabSelected == 2) {
        const optionsGridFour = _export4.workbookOptions();
        optionsGridFour.sheets[0].title = "작업정보";
        _export4.save(optionsGridFour);
      }
    }
  };

  // 그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onGoDataStateChange = (event: GridDataStateChangeEvent) => {
    setGoDataState(event.dataState);
  };
  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };
  const onDailyDataStateChange = (event: GridDataStateChangeEvent) => {
    setDailyDataState(event.dataState);
  };

  // 그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onGoSortChange = (e: any) => {
    setGoDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDailySortChange = (e: any) => {
    setDailyDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };
  const onGoItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      goDataResult,
      setGoDataResult,
      GO_DATA_ITEM_KEY
    );
  };
  const onDetailItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      detailDataResult,
      setDetailDataResult,
      DETAIL_ITEM_KEY
    );
  };
  const onDailyItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      dailyDataResult,
      setDailyDataResult,
      DAILY_ITEM_KEY
    );
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

  const mainTotalFooterCell1 = (props: GridFooterCellProps) => {
    var parts = goDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
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
    mainDataResult.data.forEach((item) =>
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

  const editNumberFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult.data.forEach((item) =>
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

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A4000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A4000W_001");
      } else {
        resetAllGrid();
        if (tabSelected == 0) {
          setPage(initialPageState); // 페이지 초기화
          setFilters((prev) => ({
            ...prev,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
        } else if (tabSelected == 1) {
          setPage1(initialPageState); // 페이지 초기화
          setPage2(initialPageState); // 페이지 초기화
          setGoFilters((prev) => ({
            ...prev,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
          setDetailFilters((prev) => ({
            ...prev,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
          if (swiper && isMobile) {
            swiper.slideTo(0);
          }
        } else if (tabSelected == 2) {
          setPage3(initialPageState); // 페이지 초기화
          setDailyFilters((prev) => ({
            ...prev,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const onRemoveClick = async () => {
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
          deletedRows.push(newData2);
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

  // 저장 파라미터 초기값
  const [paraSaved, setParaSaved] = useState({
    workType: "",
    rowstatus: "",
    rekey: "",
    location: location,
    prodemp: "",
    prodmac: "",
    qty: "",
    qtyunit: "",
    lotnum: "",
    strtime: "",
    endtime: "",
    remark: "",
    prodemp1: "",
    prodemp2: "",
    keyfield: "",
    div: "",
    itemcd: "",
    proccd: "",
    baddt: "",
    badcd: "",
    proddt: "",
    userid: userId,
    pc: pc,
    form_id: "PR_A4000W",
  });

  type TRowsArr = {
    rowstatus: string[];
    rekey: string[];
    location: string[];
    prodemp: string[];
    prodmac: string[];
    qty: string[];
    qtyunit: string[];
    lotnum: string[];
    strtime: string[];
    endtime: string[];
    remark: string[];
    prodemp1: string[];
    prodemp2: string[];
    keyfield: string[];
    div: string[];
    itemcd: string[];
    proccd: string[];
    baddt: string[];
    badcd: string[];
    proddt: string[];
  };

  const onSaveClick = async () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedRows.length == 0) return false;

    let valid = true;
    try {
      dataItem.forEach((item: any) => {
        if (
          new Date(item.strtime).getTime() > new Date(item.endtime).getTime()
        ) {
          // 시작시간이 종료시간 보다 큽니다. 시간을 조정해주세요.
          throw findMessage(messagesData, "PR_A4000W_002");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    let rowsArr: TRowsArr = {
      rowstatus: [],
      rekey: [],
      location: [],
      prodemp: [],
      prodmac: [],
      qty: [],
      qtyunit: [],
      lotnum: [],
      strtime: [],
      endtime: [],
      remark: [],
      prodemp1: [],
      prodemp2: [],
      keyfield: [],
      div: [],
      itemcd: [],
      proccd: [],
      baddt: [],
      badcd: [],
      proddt: [],
    };

    dataItem.forEach((item: any) => {
      const {
        rowstatus,
        rekey,
        location,
        prodemp,
        prodmac,
        qty,
        qtyunit,
        lotnum,
        strtime,
        endtime,
        remark,
        prodemp1,
        prodemp2,
        plankey,
        div,
        itemcd,
        proccd,
        baddt,
        badcd,
        proddt,
      } = item;

      rowsArr.rowstatus.push(rowstatus);
      rowsArr.rekey.push(rekey);
      rowsArr.location.push(location);
      rowsArr.prodemp.push(prodemp);
      rowsArr.prodmac.push(prodmac);
      rowsArr.qty.push(qty);
      rowsArr.qtyunit.push(qtyunit);
      rowsArr.lotnum.push(lotnum);
      rowsArr.strtime.push(strtime);
      rowsArr.endtime.push(endtime);
      rowsArr.remark.push(remark);
      rowsArr.prodemp1.push(prodemp1);
      rowsArr.prodemp2.push(prodemp2);
      rowsArr.keyfield.push(plankey);
      rowsArr.div.push(div);
      rowsArr.itemcd.push(itemcd);
      rowsArr.proccd.push(proccd);
      rowsArr.baddt.push(baddt);
      rowsArr.badcd.push(badcd);
      rowsArr.proddt.push(proddt);
    });

    deletedRows.forEach((item: any) => {
      const {
        rowstatus,
        rekey,
        location,
        prodemp,
        prodmac,
        qty,
        qtyunit,
        lotnum,
        strtime,
        endtime,
        remark,
        prodemp1,
        prodemp2,
        plankey,
        div,
        itemcd,
        proccd,
        baddt,
        badcd,
        proddt,
      } = item;

      rowsArr.rowstatus.push(rowstatus);
      rowsArr.rekey.push(rekey);
      rowsArr.location.push(location);
      rowsArr.prodemp.push(prodemp);
      rowsArr.prodmac.push(prodmac);
      rowsArr.qty.push(qty);
      rowsArr.qtyunit.push(qtyunit);
      rowsArr.lotnum.push(lotnum);
      rowsArr.strtime.push(strtime);
      rowsArr.endtime.push(endtime);
      rowsArr.remark.push(remark);
      rowsArr.prodemp1.push(prodemp1);
      rowsArr.prodemp2.push(prodemp2);
      rowsArr.keyfield.push(plankey);
      rowsArr.div.push(div);
      rowsArr.itemcd.push(itemcd);
      rowsArr.proccd.push(proccd);
      rowsArr.baddt.push(baddt);
      rowsArr.badcd.push(badcd);
      rowsArr.proddt.push(proddt);
    });

    setParaSaved((prev) => ({
      ...prev,
      workType: "PROD",
      rowstatus: rowsArr.rowstatus.join("|"),
      rekey: rowsArr.rekey.join("|"),
      location: rowsArr.location.join("|"),
      prodemp: rowsArr.prodemp.join("|"),
      prodmac: rowsArr.prodmac.join("|"),
      qty: rowsArr.qty.join("|"),
      qtyunit: rowsArr.qtyunit.join("|"),
      lotnum: rowsArr.lotnum.join("|"),
      strtime: rowsArr.strtime.join("|"),
      endtime: rowsArr.endtime.join("|"),
      remark: rowsArr.remark.join("|"),
      prodemp1: rowsArr.prodemp1.join("|"),
      prodemp2: rowsArr.prodemp2.join("|"),
      keyfield: rowsArr.keyfield.join("|"),
      div: rowsArr.div.join("|"),
      itemcd: rowsArr.itemcd.join("|"),
      proccd: rowsArr.proccd.join("|"),
      baddt: rowsArr.baddt.join("|"),
      badcd: rowsArr.badcd.join("|"),
      proddt: rowsArr.proddt.join("|"),
      userid: userId,
      pc: pc,
      form_id: "HU_B4000W",
    }));
  };

  useEffect(() => {
    if (paraSaved.rowstatus != "") {
      fetchTodoGridSaved();
    }
  }, [paraSaved]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);

    const para: Iparameters = {
      procedureName: "P_PR_A4000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": paraSaved.workType,
        "@p_orgdiv": orgdiv,
        "@p_rowstatus": paraSaved.rowstatus,
        "@p_rekey": paraSaved.rekey,
        "@p_location": paraSaved.location,
        "@p_prodemp": paraSaved.prodemp,
        "@p_prodmac": paraSaved.prodmac,
        "@p_qty": paraSaved.qty,
        "@p_qtyunit": paraSaved.qtyunit,
        "@p_lotnum": paraSaved.lotnum,
        "@p_strtime": paraSaved.strtime,
        "@p_endtime": paraSaved.endtime,
        "@p_remark": paraSaved.remark,
        "@p_prodemp1": paraSaved.prodemp1,
        "@p_prodemp2": paraSaved.prodemp2,
        "@p_keyfield": paraSaved.keyfield,
        "@p_div": paraSaved.div,
        "@p_itemcd": paraSaved.itemcd,
        "@p_proccd": paraSaved.proccd,
        "@p_baddt": paraSaved.baddt,
        "@p_badcd": paraSaved.badcd,
        "@p_proddt": paraSaved.proddt,
        "@p_custdiv": custdiv,
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A4000W",
      },
    };

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
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
      deletedRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (
      field == "prodemp" ||
      field == "prodmac" ||
      field == "strtime" ||
      field == "endtime" ||
      field == "qty"
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
      setTempResult((prev) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map((item) =>
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
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));

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

  const createDateColumn = () => {
    const array = [];
    for (var i = 1; i <= 31; i++) {
      const num = i < 10 ? "0" + i : i + "";
      array.push(
        <GridColumn
          key={i}
          field={num}
          title={num}
          width="70px"
          cell={NumberCell}
        />
      );
    }
    return array;
  };

  return (
    <>
      <TitleContainer>
        <Title>생산실적관리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="PR_A4000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
        scrollable={isMobile}
      >
        <TabStripTab title="생산실적관리">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>생산일자</th>
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
                  <th>LOT NO</th>
                  <td>
                    <Input
                      name="lotnum"
                      type="text"
                      value={filters.lotnum}
                      onChange={filterInputChange}
                    />
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
                  <th>품목계정</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="itemacnt"
                        value={filters.itemacnt}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
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
                  <th>생산계획번호</th>
                  <td>
                    <Input
                      name="plankey"
                      type="text"
                      value={filters.plankey}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>작업자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="prodemp"
                        value={filters.prodemp}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="user_name"
                        valueField="user_id"
                      />
                    )}
                  </td>
                  <th>설비</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="prodmac"
                        value={filters.prodmac}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="fxnm"
                        valueField="fxcode"
                      />
                    )}
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
                  <th>수주번호</th>
                  <td>
                    <Input
                      name="ordkey"
                      type="text"
                      value={filters.ordnum}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>작업지시번호</th>
                  <td>
                    <Input
                      name="gokey"
                      type="text"
                      value={filters.gokey}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>생산실적내역</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onPlanWndClick}
                  themeColor={"primary"}
                  icon="folder-open"
                >
                  생산계획참조
                </Button>
                <Button
                  onClick={onRemoveClick}
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
              fileName="생산실적관리"
            >
              <Grid
                style={{
                  height: isMobile ? deviceHeight - height - height1 : "64vh",
                }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                  })),
                  mainDataState
                )}
                {...mainDataState}
                onDataStateChange={onMainDataStateChange}
                // 선택기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange}
                // 스크롤 조회기능
                fixedScroll={true}
                total={mainDataResult.total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef}
                rowHeight={30}
                // 정렬기능
                sortable={true}
                onSortChange={onMainSortChange}
                // 컬럼순서조정
                reorderable={true}
                // 컬럼너비조정
                resizable={true}
                //incell 수정 기능
                onItemChange={onMainItemChange}
                cellRender={customCellRender}
                rowRender={customRowRender}
                editField={EDIT_FIELD}
              >
                <GridColumn
                  field="rowstatus"
                  title=" "
                  width="50px"
                  editable={false}
                />
                <GridColumn
                  cell={CommandCell}
                  width="95px"
                  footerCell={mainTotalFooterCell}
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
                              NumberField.includes(item.fieldName)
                                ? NumberCell
                                : CustomComboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : undefined
                            }
                            footerCell={
                              NumberField.includes(item.fieldName)
                                ? editNumberFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="가동-비가동">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>기간</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: gofilters.frdt1,
                        end: gofilters.todt1,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) =>
                        setGoFilters((prev) => ({
                          ...prev,
                          frdt1: e.value.start,
                          todt1: e.value.end,
                        }))
                      }
                      className="required"
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
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
                <GridContainer style={{ width: "100%", overflow: "auto" }}>
                  <GridTitleContainer className="ButtonContainer2">
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <GridTitle>작업정보</GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper) {
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
                    data={goDataResult.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName="생산실적관리"
                  >
                    <Grid
                      style={{ height: deviceHeight - height - height2 }}
                      data={process(
                        goDataResult.data.map((row) => ({
                          ...row,
                          prodmac: prodmacListData.find(
                            (items: any) => items.fxcode == row.prodmac
                          )?.fxfull,
                          prodemp: prodempListData.find(
                            (items: any) => items.user_id == row.prodemp
                          )?.user_name,
                          [SELECTED_FIELD]: goselectedState[idGetter1(row)], //선택된 데이터
                        })),
                        goDataState
                      )}
                      {...goDataState}
                      onDataStateChange={onGoDataStateChange}
                      // 선택 기능
                      dataItemKey={GO_DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onGoSelectionChange}
                      // 스크롤 조회 기능
                      fixedScroll={true}
                      total={goDataResult.total}
                      skip={page1.skip}
                      take={page1.take}
                      pageable={true}
                      onPageChange={pageChange1}
                      //원하는 행 위치로 스크롤 기능
                      rowHeight={30}
                      // 정렬기능
                      sortable={true}
                      onSortChange={onGoSortChange}
                      // 컬럼순서조정
                      reorderable={true}
                      // 컬럼너비조정
                      resizable={true}
                      onItemChange={onGoItemChange}
                      editField={EDIT_FIELD}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList1"]
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
                                      ? mainTotalFooterCell1
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
                    <ButtonContainer style={{ justifyContent: "left" }}>
                      <Button
                        onClick={() => {
                          if (swiper) {
                            swiper.slideTo(0);
                          }
                        }}
                        icon="chevron-left"
                        themeColor={"primary"}
                        fillMode={"flat"}
                      ></Button>
                      <GridTitle>작업내용</GridTitle>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <FormBoxWrap border={true} className="ButtonContainer3">
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>가동시간 : {prodtime}</th>
                          <th>설비가동률(%) : {prodrate}</th>
                        </tr>
                        <tr>
                          <th>비가동시간 : {stoptime}</th>
                          <th>설비비가동률(%) : {stoprate}</th>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                  <GridContainer>
                    <ExcelExport
                      data={detailDataResult.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="생산실적관리"
                    >
                      <Grid
                        style={{
                          height: deviceHeight - height - height2 - height3,
                        }}
                        data={process(
                          detailDataResult.data.map((row) => ({
                            ...row,
                            [SELECTED_FIELD]:
                              detailSelectedState[idGetter2(row)], // 선택된 데이터
                          })),
                          detailDataState
                        )}
                        {...detailDataState}
                        onDataStateChange={onDetailDataStateChange}
                        // 선택 기능
                        dataItemKey={DETAIL_ITEM_KEY}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onDetailSelectionChange}
                        // 스크롤 조회 기능
                        fixedScroll={true}
                        total={detailDataResult.total}
                        skip={page2.skip}
                        take={page2.take}
                        pageable={true}
                        onPageChange={pageChange2}
                        //원하는 행 위치로 스크롤 기능
                        // 정렬기능
                        sortable={true}
                        onSortChange={onDetailSortChange}
                        // 컬럼 순서 조정
                        reorderable={true}
                        // 컬럼 너비 조정
                        resizable={true}
                        onItemChange={onDetailItemChange}
                        editField={EDIT_FIELD}
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
                                      NumberField.includes(item.fieldName)
                                        ? NumberCell
                                        : CeneterField.includes(item.fieldName)
                                        ? CenterCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? detailTotalFooterCell
                                        : NumberField.includes(item.fieldName)
                                        ? editNumberFooterCell2
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </GridContainer>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainerWrap>
                <GridContainer width="20%">
                  <GridTitleContainer>
                    <GridTitle>작업정보</GridTitle>
                  </GridTitleContainer>
                  <ExcelExport
                    data={goDataResult.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName="생산실적관리"
                  >
                    <Grid
                      style={{ height: "72.2vh" }}
                      data={process(
                        goDataResult.data.map((row) => ({
                          ...row,
                          prodmac: prodmacListData.find(
                            (items: any) => items.fxcode == row.prodmac
                          )?.fxfull,
                          prodemp: prodempListData.find(
                            (items: any) => items.user_id == row.prodemp
                          )?.user_name,
                          [SELECTED_FIELD]: goselectedState[idGetter1(row)], //선택된 데이터
                        })),
                        goDataState
                      )}
                      {...goDataState}
                      onDataStateChange={onGoDataStateChange}
                      // 선택 기능
                      dataItemKey={GO_DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onGoSelectionChange}
                      // 스크롤 조회 기능
                      fixedScroll={true}
                      total={goDataResult.total}
                      skip={page1.skip}
                      take={page1.take}
                      pageable={true}
                      onPageChange={pageChange1}
                      //원하는 행 위치로 스크롤 기능
                      rowHeight={30}
                      // 정렬기능
                      sortable={true}
                      onSortChange={onGoSortChange}
                      // 컬럼순서조정
                      reorderable={true}
                      // 컬럼너비조정
                      resizable={true}
                      onItemChange={onGoItemChange}
                      editField={EDIT_FIELD}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList1"]
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
                                      ? mainTotalFooterCell1
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
                <GridContainer width={`calc(80% - ${GAP}px)`}>
                  <FormBoxWrap border={true}>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>가동시간 :</th>
                          <td style={{ fontWeight: "bold", fontSize: "12pt" }}>
                            {prodtime}
                          </td>
                          <th>설비가동률(%) :</th>
                          <td style={{ fontWeight: "bold", fontSize: "12pt" }}>
                            {prodrate}
                          </td>
                          <th>비가동시간 :</th>
                          <td style={{ fontWeight: "bold", fontSize: "12pt" }}>
                            {stoptime}
                          </td>
                          <th>설비비가동률(%) :</th>
                          <td style={{ fontWeight: "bold", fontSize: "12pt" }}>
                            {stoprate}
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                  <GridContainer>
                    <GridTitleContainer>
                      <GridTitle>작업내용</GridTitle>
                    </GridTitleContainer>
                    <ExcelExport
                      data={detailDataResult.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="생산실적관리"
                    >
                      <Grid
                        style={{ height: "66.5vh" }}
                        data={process(
                          detailDataResult.data.map((row) => ({
                            ...row,
                            [SELECTED_FIELD]:
                              detailSelectedState[idGetter2(row)], // 선택된 데이터
                          })),
                          detailDataState
                        )}
                        {...detailDataState}
                        onDataStateChange={onDetailDataStateChange}
                        // 선택 기능
                        dataItemKey={DETAIL_ITEM_KEY}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          mode: "single",
                        }}
                        onSelectionChange={onDetailSelectionChange}
                        // 스크롤 조회 기능
                        fixedScroll={true}
                        total={detailDataResult.total}
                        skip={page2.skip}
                        take={page2.take}
                        pageable={true}
                        onPageChange={pageChange2}
                        //원하는 행 위치로 스크롤 기능
                        // 정렬기능
                        sortable={true}
                        onSortChange={onDetailSortChange}
                        // 컬럼 순서 조정
                        reorderable={true}
                        // 컬럼 너비 조정
                        resizable={true}
                        onItemChange={onDetailItemChange}
                        editField={EDIT_FIELD}
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
                                      NumberField.includes(item.fieldName)
                                        ? NumberCell
                                        : CeneterField.includes(item.fieldName)
                                        ? CenterCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? detailTotalFooterCell
                                        : NumberField.includes(item.fieldName)
                                        ? editNumberFooterCell2
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </GridContainer>
              </GridContainerWrap>
            </>
          )}
        </TabStripTab>
        <TabStripTab title="일일생산율">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tr>
                <th>기준년월</th>
                <td>
                  <DatePicker
                    name="yyyymm"
                    value={dailyfilters.yyyymm}
                    format="yyyy-MM"
                    onChange={filterInputChange1}
                    className="required"
                    placeholder=""
                    calendar={MonthCalendar}
                  />
                </td>
                {!isMobile && (
                  <>
                    <th></th>
                    <td></td>
                  </>
                )}
              </tr>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer2">
              <GridTitle>작업정보</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              data={dailyDataResult.data}
              ref={(exporter) => {
                _export4 = exporter;
              }}
              fileName="생산실적관리"
            >
              <Grid
                style={{
                  height: isMobile ? deviceHeight - height - height2 : "72.2vh",
                }}
                data={process(
                  dailyDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: dayilySelectedState[idGetter3(row)],
                  })),
                  dailyDataState
                )}
                {...dailyDataState}
                onDataStateChange={onDailyDataStateChange}
                // 선택 기능
                dataItemKey={DAILY_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onDailySelectionChange}
                // 스크롤 조회 기능
                fixedScroll={true}
                total={dailyDataResult.total}
                skip={page3.skip}
                take={page3.take}
                pageable={true}
                onPageChange={pageChange3}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef}
                rowHeight={30}
                // 정렬기능
                sortable={true}
                onSortChange={onDailySortChange}
                // 컬럼순서조정
                reorderable={true}
                // 컬럼너비조정
                resizable={true}
                onItemChange={onDailyItemChange}
              >
                <GridColumn field="prodmac" title="설비" width="150px" />
                <GridColumn title="일자">{createDateColumn()}</GridColumn>
                <GridColumn
                  field="총가동시간"
                  title="총가동시간"
                  width="100px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="총작업시간"
                  title="총작업시간"
                  width="100px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="평균가동률"
                  title="평균가동률"
                  width="100px"
                  cell={NumberCell}
                />
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
          modal={true}
        />
      )}
      {planWindowVisible && (
        <PlanWindow
          setVisible={setPlanWindowVisible}
          setData={setPlanData}
          modal={true}
          custdiv={custdiv}
          pathname="PR_A4000W"
        />
      )}
      {detailWindowVisible && (
        <DetailWindow
          getVisible={setDetailWindowVisible}
          rekey={rekey}
          reloadData={reloadData}
          modal={true}
          pathname="PR_A4000W"
        />
      )}
      {/* 컨트롤 네임 불러오기 용 */}
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
export default PR_A4000W;
