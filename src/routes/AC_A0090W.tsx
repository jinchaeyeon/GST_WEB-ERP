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
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
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
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_A0090W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const numberField = ["payrate", "jypay", "jwpay", "sypay", "swpay"];
const dateField = ["taxdt1", "taxdt2", "inputdt", "indate", "shipdt"];
const numberField2 = ["jypay", "jwpay", "sypay", "swpay"];
const CustomComboField = ["chasu", "docunm", "inname", "paycd"];
const CustomRadioField = ["gisu"];
const RequiredField = [
  "gisu",
  "chasu",
  "taxdt1",
  "taxdt2",
  "docunm",
  "inputdt",
  "indate",
  "shipdt",
];

let targetRowIndex: null | number = null;
let temp = 0;
let temp2 = 0;
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 사용자
  UseBizComponent("L_QC006", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "chasu" ? "L_QC006" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField="name"
      valueField="code"
      {...props}
    />
  ) : (
    <td></td>
  );
};

const CustomComboBoxCell2 = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 사용자
  UseBizComponent("L_AC070, L_AC071, L_BA020", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "docunm"
      ? "L_AC070"
      : field == "inname"
      ? "L_AC071"
      : field == "paycd"
      ? "L_BA020"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_GISU2", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "gisu" ? "R_GISU2" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell
      bizComponentData={bizComponent}
      {...props}
      disabled={props.dataItem.rowstatus != "N" ? true : false}
    />
  ) : (
    <td />
  );
};

type TdataArr = {
  row_status_s: string[];
  gisu_s: string[];
  chasu_s: string[];
  taxdt1_s: string[];
  taxdt2_s: string[];
  inputdt_s: string[];
  remark_s: string[];
  chr1_s: string[];
  rowstatus2_s: string[];
  seq_s: string[];
  docunm_s: string[];
  inname_s: string[];
  indate_s: string[];
  shipdt_s: string[];
  paycd_s: string[];
  payrate_s: string[];
  jypay_s: string[];
  jwpay_s: string[];
  sypay_s: string[];
  swpay_s: string[];
  docuno_s: string[];
};

var height = 0;
var height2 = 0;
var height3 = 0;

const AC_A0090W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_A0090W", setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height3);
        setMobileHeight2(getDeviceHeight(true) - height2 - height3);
        setWebHeight((getDeviceHeight(true) - height3) / 2 - height);
        setWebHeight2((getDeviceHeight(true) - height3) / 2 - height2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "기본정보";
      optionsGridOne.sheets[1].title = "상세정보";
      _export.save(optionsGridOne);
    }
  };
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("AC_A0090W", setMessagesData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        taxyy: setDefaultDate(customOptionData, "taxyy"),
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
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
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    taxyy: new Date(),
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });
  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    gisu: "",
    chasu: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.taxyy).substring(0, 4) < "1997" ||
        convertDateToStr(filters.taxyy).substring(6, 8) > "31" ||
        convertDateToStr(filters.taxyy).substring(6, 8) < "01" ||
        convertDateToStr(filters.taxyy).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_A0090W_001");
      } else if (
        filters.location == null ||
        filters.location == undefined ||
        filters.location == ""
      ) {
        throw findMessage(messagesData, "AC_A0090W_002");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState); // 페이지 초기화
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

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
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

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
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
      gisu: selectedRowData.gisu,
      chasu: selectedRowData.chasu,
      isSearch: true,
      pgNum: 1,
    }));
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);
  };

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

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

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0090W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_taxyy": convertDateToStr(filters.taxyy).substring(0, 4),
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
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
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.gisu + "-" + row.chasu == filters.find_row_value
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
            : rows.find(
                (row: any) =>
                  row.gisu + "-" + row.chasu == filters.find_row_value
              );
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            gisu: selectedRow.gisu,
            chasu: selectedRow.chasu,
            pgNum: 1,
            isSearch: true,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            gisu: rows[0].gisu,
            chasu: rows[0].chasu,
            pgNum: 1,
            isSearch: true,
          }));
        }
      } else {
        setMainDataResult2(process([], mainDataState2));
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
      procedureName: "P_AC_A0090W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_taxyy": convertDateToStr(filters.taxyy).substring(0, 4),
        "@p_gisu": filters2.gisu,
        "@p_chasu": filters2.chasu,
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);

      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      chasu: "",
      chr1: "",
      gckey: "",
      gisu: "",
      inputdt: convertDateToStr(new Date()),
      location: filters.location,
      orgdiv: sessionOrgdiv,
      remark: "",
      taxdt1: convertDateToStr(new Date()),
      taxdt2: convertDateToStr(new Date()),
      taxyy: convertDateToStr(filters.taxyy).substring(0, 4),
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
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
    setPage2(initialPageState);
    setMainDataResult2(process([], mainDataState2));
  };

  const onAddClick2 = () => {
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    if (mainDataResult.total > 0) {
      const selectRow = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      const newDataItem = {
        [DATA_ITEM_KEY2]: ++temp2,
        acseq1: 0,
        actdt: "",
        bizregnum: "",
        chasu: selectRow.chasu,
        docunm: "",
        docuno: "",
        gisu: selectRow.gisu,
        indate: convertDateToStr(new Date()),
        inname: "",
        jwpay: 0,
        jypay: 0,
        location: selectRow.location,
        orgdiv: selectRow.orgdiv,
        paycd: "",
        payrate: 0,
        seq: 0,
        shipdt: convertDateToStr(new Date()),
        swpay: 0,
        sypay: 0,
        taxyy: selectRow.taxyy,
        rowstatus: "N",
      };

      setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
      setMainDataResult2((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setPage2((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 1,
      }));
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

    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });

    if (data != undefined) {
      setFilters2((prev) => ({
        ...prev,
        gisu: data.gisu,
        chasu: data.chasu,
        isSearch: true,
        pgNum: 1,
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

    setSelectedState2({
      [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
    });
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

  const onItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (
      !(
        field == "rowstatus" ||
        (dataItem.rowstatus != "N" && field == "gisu") ||
        (dataItem.rowstatus != "N" && field == "chasu")
      )
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
    if (field != "rowstatus" && field != "bizregnum") {
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

  const onSaveClick = async () => {
    if (!permissions.save) return;
    let valid = true;

    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

    dataItem.map((item) => {
      if (
        item.gisu == "" ||
        item.chasu == "" ||
        item.taxdt1 == "" ||
        item.taxdt2 == "" ||
        item.inputdt == ""
      ) {
        valid = false;
      }
    });

    if (!valid) {
      alert("필수값을 채워주세요.");
      return false;
    }

    let dataArr: TdataArr = {
      row_status_s: [],
      gisu_s: [],
      chasu_s: [],
      taxdt1_s: [],
      taxdt2_s: [],
      inputdt_s: [],
      remark_s: [],
      chr1_s: [],
      rowstatus2_s: [],
      seq_s: [],
      docunm_s: [],
      inname_s: [],
      indate_s: [],
      shipdt_s: [],
      paycd_s: [],
      payrate_s: [],
      jypay_s: [],
      jwpay_s: [],
      sypay_s: [],
      swpay_s: [],
      docuno_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        gisu = "",
        chasu = "",
        taxdt1 = "",
        taxdt2 = "",
        inputdt = "",
        remark = "",
        chr1 = "",
      } = item;
      dataArr.row_status_s.push(rowstatus);
      dataArr.gisu_s.push(gisu);
      dataArr.chasu_s.push(chasu);
      dataArr.taxdt1_s.push(taxdt1 == "99991231" ? "" : taxdt1);
      dataArr.taxdt2_s.push(taxdt2 == "99991231" ? "" : taxdt2);
      dataArr.inputdt_s.push(inputdt == "99991231" ? "" : inputdt);
      dataArr.remark_s.push(remark);
      dataArr.chr1_s.push(chr1);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        gisu = "",
        chasu = "",
        taxdt1 = "",
        taxdt2 = "",
        inputdt = "",
        remark = "",
        chr1 = "",
      } = item;
      dataArr.row_status_s.push(rowstatus);
      dataArr.gisu_s.push(gisu);
      dataArr.chasu_s.push(chasu);
      dataArr.taxdt1_s.push(taxdt1 == "99991231" ? "" : taxdt1);
      dataArr.taxdt2_s.push(taxdt2 == "99991231" ? "" : taxdt2);
      dataArr.inputdt_s.push(inputdt == "99991231" ? "" : inputdt);
      dataArr.remark_s.push(remark);
      dataArr.chr1_s.push(chr1);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "N",
      row_status_s: dataArr.row_status_s.join("|"),
      gisu_s: dataArr.gisu_s.join("|"),
      chasu_s: dataArr.chasu_s.join("|"),
      taxdt1_s: dataArr.taxdt1_s.join("|"),
      taxdt2_s: dataArr.taxdt2_s.join("|"),
      inputdt_s: dataArr.inputdt_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      chr1_s: dataArr.chr1_s.join("|"),
    }));
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: sessionOrgdiv,
    location: filters.location,
    taxyy: convertDateToStr(filters.taxyy).substring(0, 4),
    row_status_s: "",
    gisu_s: "",
    chasu_s: "",
    taxdt1_s: "",
    taxdt2_s: "",
    inputdt_s: "",
    remark_s: "",
    chr1_s: "",
    rowstatus2_s: "",
    seq_s: "",
    docunm_s: "",
    inname_s: "",
    indate_s: "",
    shipdt_s: "",
    paycd_s: "",
    payrate_s: "",
    jypay_s: "",
    jwpay_s: "",
    sypay_s: "",
    swpay_s: "",
    docuno_s: "",
    form_id: "AC_A0090W",
    pc: pc,
    userid: userId,
  });

  const para: Iparameters = {
    procedureName: "P_AC_A0090W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_taxyy": ParaData.taxyy,
      "@p_rowstatus_s": ParaData.row_status_s,
      "@p_gisu_s": ParaData.gisu_s,
      "@p_chasu_s": ParaData.chasu_s,
      "@p_taxdt1_s": ParaData.taxdt1_s,
      "@p_taxdt2_s": ParaData.taxdt2_s,
      "@p_inputdt_s": ParaData.inputdt_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_chr1_s": ParaData.chr1_s,
      "@p_rowstatus2_s": ParaData.rowstatus2_s,
      "@p_seq_s": ParaData.seq_s,
      "@p_docunm_s": ParaData.docunm_s,
      "@p_inname_s": ParaData.inname_s,
      "@p_indate_s": ParaData.indate_s,
      "@p_shipdt_s": ParaData.shipdt_s,
      "@p_paycd_s": ParaData.paycd_s,
      "@p_payrate_s": ParaData.payrate_s,
      "@p_jypay_s": ParaData.jypay_s,
      "@p_jwpay_s": ParaData.jwpay_s,
      "@p_sypay_s": ParaData.sypay_s,
      "@p_swpay_s": ParaData.swpay_s,
      "@p_docuno_s": ParaData.docuno_s,
      "@p_form_id": "AC_A0090W",
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
      if (ParaData.workType == "N") {
        resetAllGrid();
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
        setFilters2((prev: any) => ({
          ...prev,
          find_row_value: "",
          pgNum: 1,
          isSearch: true,
        }));
      }

      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        orgdiv: sessionOrgdiv,
        location: filters.location,
        taxyy: convertDateToStr(filters.taxyy).substring(0, 4),
        row_status_s: "",
        gisu_s: "",
        chasu_s: "",
        taxdt1_s: "",
        taxdt2_s: "",
        inputdt_s: "",
        remark_s: "",
        chr1_s: "",
        rowstatus2_s: "",
        seq_s: "",
        docunm_s: "",
        inname_s: "",
        indate_s: "",
        shipdt_s: "",
        paycd_s: "",
        payrate_s: "",
        jypay_s: "",
        jwpay_s: "",
        sypay_s: "",
        swpay_s: "",
        docuno_s: "",
        form_id: "AC_A0090W",
        pc: pc,
        userid: userId,
      });
      deletedMainRows = [];
      deletedMainRows2 = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onCopyClick = () => {
    if (!permissions.save) return;
    setParaData((prev) => ({
      ...prev,
      workType: "COPY",
    }));
  };

  const onSaveClick2 = async () => {
    if (!permissions.save) return;
    let valid = true;

    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows2.length == 0) return false;

    dataItem.map((item) => {
      if (item.docunm == "" || item.indate == "" || item.shipdt == "") {
        valid = false;
      }
    });

    if (!valid) {
      alert("필수값을 채워주세요.");
      return false;
    }

    let dataArr: TdataArr = {
      row_status_s: [],
      gisu_s: [],
      chasu_s: [],
      taxdt1_s: [],
      taxdt2_s: [],
      inputdt_s: [],
      remark_s: [],
      chr1_s: [],
      rowstatus2_s: [],
      seq_s: [],
      docunm_s: [],
      inname_s: [],
      indate_s: [],
      shipdt_s: [],
      paycd_s: [],
      payrate_s: [],
      jypay_s: [],
      jwpay_s: [],
      sypay_s: [],
      swpay_s: [],
      docuno_s: [],
    };
    const selectRow = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = "",
        docunm = "",
        inname = "",
        indate = "",
        shipdt = "",
        paycd = "",
        payrate = "",
        jypay = "",
        jwpay = "",
        sypay = "",
        swpay = "",
        docuno = "",
      } = item;
      dataArr.rowstatus2_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.docunm_s.push(docunm);
      dataArr.inname_s.push(inname);
      dataArr.indate_s.push(indate == "99991231" ? "" : indate);
      dataArr.shipdt_s.push(shipdt == "99991231" ? "" : shipdt);
      dataArr.paycd_s.push(paycd);
      dataArr.payrate_s.push(payrate);
      dataArr.jypay_s.push(jypay);
      dataArr.jwpay_s.push(jwpay);
      dataArr.sypay_s.push(sypay);
      dataArr.swpay_s.push(swpay);
      dataArr.docuno_s.push(docuno);
      dataArr.gisu_s.push(selectRow.gisu);
      dataArr.chasu_s.push(selectRow.chasu);
    });
    deletedMainRows2.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        seq = "",
        docunm = "",
        inname = "",
        indate = "",
        shipdt = "",
        paycd = "",
        payrate = "",
        jypay = "",
        jwpay = "",
        sypay = "",
        swpay = "",
        docuno = "",
      } = item;
      dataArr.rowstatus2_s.push(rowstatus);
      dataArr.seq_s.push(seq);
      dataArr.docunm_s.push(docunm);
      dataArr.inname_s.push(inname);
      dataArr.indate_s.push(indate == "99991231" ? "" : indate);
      dataArr.shipdt_s.push(shipdt == "99991231" ? "" : shipdt);
      dataArr.paycd_s.push(paycd);
      dataArr.payrate_s.push(payrate);
      dataArr.jypay_s.push(jypay);
      dataArr.jwpay_s.push(jwpay);
      dataArr.sypay_s.push(sypay);
      dataArr.swpay_s.push(swpay);
      dataArr.docuno_s.push(docuno);
      dataArr.gisu_s.push(selectRow.gisu);
      dataArr.chasu_s.push(selectRow.chasu);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "DETAIL",
      gisu_s: dataArr.gisu_s.join("|"),
      chasu_s: dataArr.chasu_s.join("|"),
      rowstatus2_s: dataArr.rowstatus2_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      docunm_s: dataArr.docunm_s.join("|"),
      inname_s: dataArr.inname_s.join("|"),
      indate_s: dataArr.indate_s.join("|"),
      shipdt_s: dataArr.shipdt_s.join("|"),
      paycd_s: dataArr.paycd_s.join("|"),
      payrate_s: dataArr.payrate_s.join("|"),
      jypay_s: dataArr.jypay_s.join("|"),
      jwpay_s: dataArr.jwpay_s.join("|"),
      sypay_s: dataArr.sypay_s.join("|"),
      swpay_s: dataArr.swpay_s.join("|"),
      docuno_s: dataArr.docuno_s.join("|"),
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
              pathname="AC_A0090W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>신고년도</th>
              <td>
                <DatePicker
                  name="taxyy"
                  value={filters.taxyy}
                  format="yyyy"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={YearCalendar}
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
                    className="required"
                  />
                )}
              </td>
              <th>신고기수</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="gisu"
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
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <div> 기본정보</div>
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
                  <ButtonContainer>
                    <Button
                      onClick={onCopyClick}
                      icon="copy"
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.save ? false : true}
                    >
                      이전년도 복사
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
                </GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="영세율표제"
              >
                <Grid
                  style={{ height: mobileheight }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      taxdt1: row.taxdt1
                        ? new Date(dateformat(row.taxdt1))
                        : new Date(dateformat("99991231")),
                      taxdt2: row.taxdt2
                        ? new Date(dateformat(row.taxdt2))
                        : new Date(dateformat("99991231")),
                      inputdt: row.inputdt
                        ? new Date(dateformat(row.inputdt))
                        : new Date(dateformat("99991231")),
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
                  onItemChange={onItemChange}
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
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                dateField.includes(item.fieldName)
                                  ? DateCell
                                  : CustomComboField.includes(item.fieldName)
                                  ? CustomComboBoxCell
                                  : CustomRadioField.includes(item.fieldName)
                                  ? CustomRadioCell
                                  : undefined
                              }
                              headerCell={
                                RequiredField.includes(item.fieldName)
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
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={1}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <div>
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
                      상세정보
                    </div>
                    <div>
                      <Button
                        onClick={onAddClick2}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                        disabled={
                          permissions.save
                            ? mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                              ? true
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].rowstatus == "N"
                              ? true
                              : false
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
                          permissions.save
                            ? mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                              ? true
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].rowstatus == "N"
                              ? true
                              : false
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
                          permissions.save
                            ? mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                              ? true
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].rowstatus == "N"
                              ? true
                              : false
                            : true
                        }
                      ></Button>
                    </div>
                  </ButtonContainer>
                </GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult2.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="영세율표제"
              >
                <Grid
                  style={{ height: mobileheight2 }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      indate: row.indate
                        ? new Date(dateformat(row.indate))
                        : new Date(dateformat("99991231")),
                      shipdt: row.shipdt
                        ? new Date(dateformat(row.shipdt))
                        : new Date(dateformat("99991231")),
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
                  onItemChange={onItemChange2}
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
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : dateField.includes(item.fieldName)
                                  ? DateCell
                                  : CustomComboField.includes(item.fieldName)
                                  ? CustomComboBoxCell2
                                  : undefined
                              }
                              headerCell={
                                RequiredField.includes(item.fieldName)
                                  ? RequiredHeader
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
        </Swiper>
      ) : (
        <>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>기본정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onCopyClick}
                  icon="copy"
                  fillMode="outline"
                  themeColor={"primary"}
                  disabled={permissions.save ? false : true}
                >
                  이전년도 복사
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
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="영세율표제"
            >
              <Grid
                style={{ height: webheight }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    taxdt1: row.taxdt1
                      ? new Date(dateformat(row.taxdt1))
                      : new Date(dateformat("99991231")),
                    taxdt2: row.taxdt2
                      ? new Date(dateformat(row.taxdt2))
                      : new Date(dateformat("99991231")),
                    inputdt: row.inputdt
                      ? new Date(dateformat(row.inputdt))
                      : new Date(dateformat("99991231")),
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
                onItemChange={onItemChange}
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
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              dateField.includes(item.fieldName)
                                ? DateCell
                                : CustomComboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : CustomRadioField.includes(item.fieldName)
                                ? CustomRadioCell
                                : undefined
                            }
                            headerCell={
                              RequiredField.includes(item.fieldName)
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
          </GridContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer2">
              <GridTitle>상세정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick2}
                  themeColor={"primary"}
                  icon="plus"
                  title="행 추가"
                  disabled={
                    permissions.save
                      ? mainDataResult.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY] ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                        ? true
                        : mainDataResult.data.filter(
                            (item) =>
                              item[DATA_ITEM_KEY] ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].rowstatus == "N"
                        ? true
                        : false
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
                    permissions.save
                      ? mainDataResult.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY] ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                        ? true
                        : mainDataResult.data.filter(
                            (item) =>
                              item[DATA_ITEM_KEY] ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].rowstatus == "N"
                        ? true
                        : false
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
                    permissions.save
                      ? mainDataResult.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY] ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                        ? true
                        : mainDataResult.data.filter(
                            (item) =>
                              item[DATA_ITEM_KEY] ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].rowstatus == "N"
                        ? true
                        : false
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
              fileName="영세율표제"
            >
              <Grid
                style={{ height: webheight2 }}
                data={process(
                  mainDataResult2.data.map((row) => ({
                    ...row,
                    indate: row.indate
                      ? new Date(dateformat(row.indate))
                      : new Date(dateformat("99991231")),
                    shipdt: row.shipdt
                      ? new Date(dateformat(row.shipdt))
                      : new Date(dateformat("99991231")),
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
                onItemChange={onItemChange2}
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
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : dateField.includes(item.fieldName)
                                ? DateCell
                                : CustomComboField.includes(item.fieldName)
                                ? CustomComboBoxCell2
                                : undefined
                            }
                            headerCell={
                              RequiredField.includes(item.fieldName)
                                ? RequiredHeader
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

export default AC_A0090W;
